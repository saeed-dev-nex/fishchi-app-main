import { GoogleGenerativeAI } from '@google/generative-ai';
import { htmlToText } from 'html-to-text';

const API_KEY = process.env.GOOGLE_API_KEY;
if (!API_KEY) {
  throw new Error('GOOGLE_API_KEY is not defined');
}

const genAI = new GoogleGenerativeAI(API_KEY);

// مدل عمومی شما (موجود)
const generativeModel = genAI.getGenerativeModel({
  model: 'gemini-flash-latest',
});

// مدل امبدینگ شما (موجود)
const embeddingModel = genAI.getGenerativeModel({
  model: 'text-embedding-004',
});

// --- [بخش جدید: مدل اختصاصی ترجمه] ---

// 1. تعریف پرامپت سیستمی دقیق برای ترجمه ارجاعات
const citationTranslationSystemPrompt = `You are a specialized AI assistant for translating academic in-text citations from English to Persian.
Your task is to translate the given text while strictly following these rules:
1.  **DO NOT** provide any explanations, apologies, or conversational text (e.g., "Here is the translation:"). You must *only* return the translated string itself.
2.  **PRESERVE** the original structure, including parentheses, commas, semicolons, and numbers.
3.  **DO NOT** translate proper names (e.g., "Smith"). Instead, transliterate them (e.g., "اسمیت").
4.  **TRANSLATE** common academic terms (e.g., "et al." should become "و همکاران").
5.  **TRANSLITERATE** numbers (e.g., "2020" should become "۲۰۲۰" and "p. 25" should become "ص. ۲۵").

Example Input 1: (Smith, 2020)
Example Output 1: (اسمیت، ۲۰۲۰)

Example Input 2: (Johnson et al., 2018, p. 45)
Example Output 2: (جانسون و همکاران، ۲۰۱۸، ص. ۴۵)
`;

// 2. ایجاد یک مدل اختصاصی برای ترجمه با پرامپت سیستمی
const translationModel = genAI.getGenerativeModel({
  model: 'gemini-flash-latest',
  systemInstruction: {
    parts: [{ text: citationTranslationSystemPrompt }],
    role: 'model',
  },
});

// 3. ایجاد یک نمونه چت (Chat) از این مدل. ما از این نمونه برای تمام درخواست‌ها استفاده خواهیم کرد.
// این کار باعث می‌شود مدل همیشه پرامپت سیستمی را "به خاطر بسپارد".
const translationChatSession = translationModel.startChat();

// --- [پایان بخش جدید] ---

/**
 * @desc   	Clean HTML to plain text
 * (تابع موجود شما - بدون تغییر)
 */
const cleanHtml = (html) => {
  return htmlToText(html, {
    wordwrap: 130,
    selectors: [{ selector: 'table', options: { uppercase: false } }],
  });
};

/**
 * @desc   	Embedding text to digit vector
 * (تابع موجود شما - بدون تغییر)
 */
export const generateEmbedding = async (text, minLength = 10) => {
  const cleanText = cleanHtml(text);
  if (!cleanText || cleanText.trim().length < minLength) {
    return null;
  }
  try {
    const result = await embeddingModel.embedContent(cleanText);
    return result.embedding.values;
  } catch (error) {
    console.error('[AI Embedding Error]:', error);
    return null;
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
    return textContent;
  }

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
    return [];
  }

  const prompt = `حداقل5 و حداکثر 10 کلمه کلیدی یا عبارت کلیدی اصلی متن فارسی زیر را استخراج کن. فقط کلیدواژه‌ها را با کاما (,) جدا کرده و برگردان. هیچ متن اضافه‌ای ننویس:\n\n${textContent}`;

  try {
    const tagString = await generateText(prompt);
    const tags = tagString
      .replace(/[\n*]/g, '')
      .split(',')
      .map((tag) => tag.trim())
      .filter(Boolean);
    return tags;
  } catch (error) {
    console.error('[AI Tag Suggestion Error]:', error);
    return [];
  }
};

/**
 * Parses citation text using AI to extract structured information.
 * (تابع موجود شما - بدون تغییر)
 */
export const parseCitationWithAI = async (citationText) => {
  if (!citationText || citationText.trim().length < 10) {
    return null;
  }

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
    abstract: 'string (brief summary if present in the text)',
  };

  const prompt = `
  	Analyze the following citation text and extract its components accurately.
  	Return the information ONLY as a valid JSON object matching this structure:
  	${JSON.stringify(desiredStructure, null, 2)}

  	Important Rules:
    (Rules omitted for brevity...)

  	Citation Text:
  	"${citationText}"

  	JSON Output:
  `;
  let resultText = '';
  try {
    resultText = await generateText(prompt);

    const cleanedJsonText = resultText.replace(/```json\n?|\n?```/g, '').trim();

    const parsedResult = JSON.parse(cleanedJsonText);
    return parsedResult;
  } catch (error) {
    console.error('[AI Citation Parse Error]:', error);
    console.error('[AI Citation Parse Error] Raw AI response:', resultText);
    throw new Error(
      'سرویس هوش مصنوعی قادر به پردازش Citation نبود. لطفاً فرمت متن را بررسی کنید یا به صورت دستی وارد نمایید.'
    );
  }
};

// --- [تابع جدید و اصلاح‌شده برای ترجمه] ---

/**
 * [NEW-ROBUST] Translates a given text using the dedicated chat session.
 * This is specifically tuned for translating in-text academic citations.
 *
 * @param {string} text The text to translate (e.g., "(Smith, 2020)").
 * @param {string} targetLang The target language (e.g., "Persian").
 * @returns {Promise<string>} The translated text.
 */
export const translateRef = async (text, targetLang = 'Persian') => {
  // (API_KEY is checked at the top of the file)
  if (!API_KEY) {
    throw new Error('AI Service is not configured; API key is missing.');
  } // [FIX] We use the dedicated chat session created with our system prompt. // We simply send the text as a new message in that chat.

  try {
    const result = await translationChatSession.sendMessage(text);
    const response = await result.response;
    const translatedText = response.text();

    if (!translatedText || translatedText.trim() === '') {
      throw new Error('AI returned an empty response for translation.');
    } // Clean up any potential markdown or extra whitespace

    return translatedText.trim().replace(/`/g, '');
  } catch (error) {
    console.error('[AI Translation Error]:', error); // Fallback: If AI fails, return the original text to avoid breaking the workflow.
    return text;
  }
};
