import Note from '../models/Note.model.js';
import Source from '../models/Source.model.js';
import { generateEmbedding } from './aiService.js';
import connectDB from '../config/db.js';

/**
 * اسکریپت کمکی برای تولید vector برای تمام نت‌ها و منابع موجود
 * این اسکریپت را یک‌بار اجرا کنید تا برای داده‌های قدیمی که vector ندارند، vector تولید شود
 */

async function generateVectorsForExistingData() {
  try {
    console.log('🚀 شروع تولید vector برای داده‌های موجود...\n');

    // اتصال به دیتابیس
    await connectDB();

    // ۱. پیدا کردن نت‌های بدون vector
    const notesWithoutVector = await Note.find({
      $or: [{ vectorGenerated: false }, { vectorGenerated: { $exists: false } }],
    });

    console.log(
      `📝 ${notesWithoutVector.length} نت بدون vector پیدا شد.\n`
    );

    let noteSuccessCount = 0;
    let noteFailCount = 0;

    // تولید vector برای هر نت
    for (const note of notesWithoutVector) {
      try {
        console.log(`   ⏳ در حال پردازش نت ${note._id}...`);
        const vector = await generateEmbedding(note.content);

        if (vector) {
          await Note.findByIdAndUpdate(note._id, {
            contentVector: vector,
            vectorGenerated: true,
          });
          noteSuccessCount++;
          console.log(`   ✅ نت ${note._id} با موفقیت آپدیت شد`);
        } else {
          noteFailCount++;
          console.log(`   ❌ خطا در تولید vector برای نت ${note._id}`);
        }
      } catch (err) {
        noteFailCount++;
        console.error(
          `   ❌ خطا در پردازش نت ${note._id}: ${err.message}`
        );
      }
    }

    console.log(
      `\n✅ نت‌ها: ${noteSuccessCount} موفق، ${noteFailCount} ناموفق\n`
    );

    // ۲. پیدا کردن منابع بدون vector
    const sourcesWithoutVector = await Source.find({
      $or: [{ vectorGenerated: false }, { vectorGenerated: { $exists: false } }],
    });

    console.log(
      `📚 ${sourcesWithoutVector.length} منبع بدون vector پیدا شد.\n`
    );

    let sourceSuccessCount = 0;
    let sourceFailCount = 0;

    // تولید vector برای هر منبع
    for (const source of sourcesWithoutVector) {
      try {
        console.log(`   ⏳ در حال پردازش منبع ${source._id}...`);
        const textToEmbed = `${source.title || ''} ${source.abstract || ''}`;
        const vector = await generateEmbedding(textToEmbed);

        if (vector) {
          await Source.findByIdAndUpdate(source._id, {
            searchVector: vector,
            vectorGenerated: true,
          });
          sourceSuccessCount++;
          console.log(`   ✅ منبع ${source._id} با موفقیت آپدیت شد`);
        } else {
          sourceFailCount++;
          console.log(`   ❌ خطا در تولید vector برای منبع ${source._id}`);
        }
      } catch (err) {
        sourceFailCount++;
        console.error(
          `   ❌ خطا در پردازش منبع ${source._id}: ${err.message}`
        );
      }
    }

    console.log(
      `\n✅ منابع: ${sourceSuccessCount} موفق، ${sourceFailCount} ناموفق\n`
    );

    console.log('🎉 عملیات تولید vector با موفقیت به پایان رسید!');
    console.log(
      `📊 مجموع: ${noteSuccessCount + sourceSuccessCount} موفق، ${noteFailCount + sourceFailCount} ناموفق`
    );

    process.exit(0);
  } catch (error) {
    console.error('❌ خطای کلی در اسکریپت:', error);
    process.exit(1);
  }
}

// اجرای اسکریپت
generateVectorsForExistingData();
