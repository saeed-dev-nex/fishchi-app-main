import { GoogleGenerativeAI } from '@google/generative-ai';
import { htmlToText } from 'html-to-text';

const API_KEY = process.env.GOOGLE_API_KEY;
if (!API_KEY) {
  throw new Error('GOOGLE_API_KEY is not defined');
}

const genAI = new GoogleGenerativeAI(API_KEY);

const generativeModel = genAI.getGenerativeModel({
  model: 'gemini-flash-latest',
});

const embeddingModel = genAI.getGenerativeModel({
  model: 'text-embedding-004',
});

/**
 * @desc    Clean HTML to plain text
 * @param {string} html
 * @returns {string}
 */
const cleanHtml = (html) => {
  return htmlToText(html, {
    wordwrap: 130,
    selectors: [{ selector: 'table', options: { uppercase: false } }],
  });
};

/**
 * @desc    Embedding text to digit vector
 * @param {string} text
 * @param {number} minLength - Minimum text length (default: 10 for documents, use 2 for search queries)
 * @returns {Promise<Array<number>>}
 */

export const generateEmbedding = async (text, minLength = 10) => {
  const cleanText = cleanHtml(text);
  if (!cleanText || cleanText.trim().length < minLength) {
    return null; // از تولید وکتور برای متن‌های بسیار کوتاه خودداری کن
  }
  try {
    const result = await embeddingModel.embedContent(cleanText);
    return result.embedding.values;
  } catch (error) {
    console.error('[AI Embedding Error]:', error);
    return null; // در صورت خطا، null برگردان تا برنامه متوقف نشود
  }
};

/*
 * @desc    Generate text from prompt
 * @param {string} prompt
 * @returns {Promise<string>}
 */

export const generateText = async (prompt) => {
  try {
    const result = await generativeModel.generateContent(prompt);
    const response = await result.response;
    return response.text();
  } catch (error) {
    console.error('[AI Generation Error]:', error);
    throw new Error('سرویس هوش مصنوعی در حال حاضر پاسخگو نیست.');
  }
};

/**
 * Sends text (HTML) to Gemini for proofreading and correction.
 * @param {string} htmlContent - The HTML content from the editor.
 * @returns {Promise<string>} - The corrected text (as plain text, needs conversion back to HTML if needed).
 */
export const proofreadText = async (htmlContent) => {
  const textContent = cleanHtml(htmlContent);
  if (!textContent || textContent.trim().length < 5) {
    return textContent; // Return original if too short
  }

  // A more specific prompt for correction
  const prompt = `متن فارسی زیر را از نظر املایی، نگارشی، دستوری و ساختاری بررسی و اصلاح کن. فقط متن اصلاح شده را برگردان:\n\n${textContent}`;

  try {
    const result = await generativeModel.generateContent(prompt);
    const response = await result.response;
    return response.text();
  } catch (error) {
    console.error('[AI Proofread Error]:', error);
    throw new Error('سرویس ویرایش متن در حال حاضر پاسخگو نیست.');
  }
};

/**
 * برای یک متن داده شده، تگ‌های مرتبط را پیشنهاد می‌دهد
 * @param {string} textContent - متن خام (نه HTML)
 * @returns {Promise<string[]>} - آرایه‌ای از رشته‌های تگ
 */
export const suggestTagsForText = async (textContent) => {
  if (!textContent || textContent.trim().length < 10) {
    return []; // از پیشنهاد تگ برای متن‌های بسیار کوتاه خودداری کن
  }

  const prompt = `حداقل5 و حداکثر 10 کلمه کلیدی یا عبارت کلیدی اصلی متن فارسی زیر را استخراج کن. فقط کلیدواژه‌ها را با کاما (,) جدا کرده و برگردان. هیچ متن اضافه‌ای ننویس:\n\n${textContent}`;

  try {
    const tagString = await generateText(prompt); // Use the existing generateText
    // پاک‌سازی اضافی برای حذف کاراکترهای ناخواسته احتمالی
    const tags = tagString
      .replace(/[\n*]/g, '') // حذف خطوط جدید یا ستاره‌ها
      .split(',')
      .map((tag) => tag.trim())
      .filter(Boolean); // حذف رشته‌های خالی
    return tags;
  } catch (error) {
    console.error('[AI Tag Suggestion Error]:', error);
    // در صورت خطا، آرایه خالی برمی‌گردانیم تا برنامه متوقف نشود
    return [];
  }
};
