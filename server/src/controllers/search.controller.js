import asyncHandler from 'express-async-handler';
import ApiResponse from '../utils/apiResponse.js';
import Source from '../models/Source.model.js';
import Note from '../models/Note.model.js';
import { generateEmbedding } from '../utils/aiService.js';
import { cosineSimilarity } from '../utils/searchUtils.js';

/**
 * @desc    انجام جستجوی معنایی (Vector Search)
 * @route   GET /api/v1/search
 * @access  Private
 */
const semanticSearch = asyncHandler(async (req, res) => {
  const { q } = req.query;
  const userId = req.user._id;

  if (!q || q.trim().length === 0) {
    res.status(400);
    throw new Error('عبارت جستجو (q) الزامی است');
  }

  if (q.trim().length < 2) {
    res.status(400);
    throw new Error('عبارت جستجو باید حداقل ۲ کاراکتر باشد');
  }

  // ۱. تبدیل عبارت جستجوی کاربر به وکتور
  const queryVector = await generateEmbedding(q, 2); // حداقل ۲ کاراکتر برای جستجو
  if (!queryVector) {
    res.status(500);
    throw new Error('خطا در تولید وکتور جستجو. لطفاً دوباره تلاش کنید');
  }

  // ۲. واکشی تمام اسناد دارای وکتور از دیتابیس
  // هشدار: این عملیات در دیتابیس‌های بزرگ کند خواهد بود.
  // این تنها راه حل رایگان بدون استفاده از MongoDB Atlas Vector Search است.
  const notes = await Note.find({ user: userId, vectorGenerated: true });
  const sources = await Source.find({ user: userId, vectorGenerated: true });

  const allResults = [];

  // ۳. محاسبه شباهت برای فیش‌ها
  notes.forEach((note) => {
    const similarity = cosineSimilarity(queryVector, note.contentVector);
    if (similarity > 0.6) {
      // آستانه شباهت (کاهش از 0.7 به 0.5 برای نتایج بیشتر)
      allResults.push({ type: 'note', data: note, similarity });
    }
  });

  // ۴. محاسبه شباهت برای منابع
  sources.forEach((source) => {
    const similarity = cosineSimilarity(queryVector, source.searchVector); // استفاده از نام صحیح فیلد searchVector
    if (similarity > 0.5) {
      // آستانه شباهت (کاهش از 0.7 به 0.5 برای نتایج بیشتر)
      allResults.push({ type: 'source', data: source, similarity });
    }
  });

  // ۵. مرتب‌سازی نتایج بر اساس بیشترین شباهت
  allResults.sort((a, b) => b.similarity - a.similarity);

  // ۶. جداسازی نتایج
  const results = {
    notes: allResults.filter((r) => r.type === 'note').map((r) => r.data),
    sources: allResults.filter((r) => r.type === 'source').map((r) => r.data),
  };

  ApiResponse.success(res, results, 'جستجوی معنایی با موفقیت انجام شد');
});

export { semanticSearch };
