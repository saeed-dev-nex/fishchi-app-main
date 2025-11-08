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
 * @desc    Clean HTML to plain text
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
 * @desc    Embedding text to digit vector
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
 * @desc    Generate text from prompt
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

/**
 * Parses citation text using AI to extract structured information.
 * @param {string} citationText - The citation text to parse.
 * @returns {Promise<object|null>} - A structured object with citation details or null on failure.
 */
export const parseCitationWithAI = async (citationText) => {
  if (!citationText || citationText.trim().length < 10) {
    return null; // Avoid processing very short texts
  }

  // Define the desired JSON structure
  const desiredStructure = {
    title: 'string (main title)',
    authors: [{ firstname: 'string', lastname: 'string' }],
    year: 'number (publication year)',
    type: 'string (e.g., article, book, thesis, website, other)',
    language: 'string (e.g., persian, english)',
    publicationDetails: {
      journal: 'string (journal or conference name, if applicable)',
      publisher: 'string (publisher name, if applicable)',
      volume: 'string (volume number)',
      issue: 'string (issue number)',
      pages: "string (page range, e.g., '123-145')",
    },
    identifiers: {
      doi: 'string (DOI identifier)',
      isbn: 'string (ISBN identifier)',
      url: 'string (URL link)',
    },
    // Add abstract only if clearly present in the citation text itself, otherwise leave empty
    abstract: 'string (brief summary if present in the text)',
  };

  // Construct a detailed prompt for the AI
  const prompt = `
    Analyze the following citation text and extract its components accurately.
    Return the information ONLY as a valid JSON object matching this structure:
    ${JSON.stringify(desiredStructure, null, 2)}

    Important Rules:
    1.  Parse names carefully: For Persian names often in "Lastname، Firstname" format, extract correctly into firstname and lastname fields. Handle multi-word names correctly (e.g., "یوسفی خواه، سارا"). For English names, handle formats like "Lastname, F." or "Firstname Lastname". If multiple authors, include all in the 'authors' array.
    2.  Year: Extract only the 4-digit publication year.
    3.  Type: Determine the type (article, book, thesis, website, other) based on context (journal name, publisher, keywords like 'thesis', URL structure etc.). Default to 'article' if unsure.
    4.  Language: Detect the primary language (persian or english) and Don't change language in result.
    5.  Publication Details: Extract journal/conference, publisher, volume, issue, and page numbers/range if available.
    6.  Identifiers: Extract DOI, ISBN, and URL if present.
    7.  Abstract: Only include an abstract if it's explicitly part of the provided citation text itself. Do not summarize or invent one.
    8.  JSON Output: Ensure the output is *only* the JSON object, with no introductory text, explanations, or markdown formatting. Use double quotes for all keys and string values.

    Citation Text:
    "${citationText}"

    JSON Output:
  `;

  try {
    const resultText = await generateText(prompt); // Use the existing generateText function

    // Clean potential markdown code block formatting
    const cleanedJsonText = resultText.replace(/```json\n?|\n?```/g, '').trim();

    // Attempt to parse the JSON response
    const parsedResult = JSON.parse(cleanedJsonText);
    return parsedResult;
  } catch (error) {
    console.error('[AI Citation Parse Error]:', error);
    console.error('[AI Citation Parse Error] Raw AI response:', resultText); // Log raw response for debugging
    throw new Error(
      'سرویس هوش مصنوعی قادر به پردازش Citation نبود. لطفاً فرمت متن را بررسی کنید یا به صورت دستی وارد نمایید.'
    );
  }
};