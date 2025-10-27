import asyncHandler from 'express-async-handler';
import {
  generateText,
  parseCitationWithAI,
  proofreadText,
  suggestTagsForText,
} from '../utils/aiService.js';
import { htmlToText } from 'html-to-text';
import ApiResponse from '../utils/apiResponse.js';

/**
 * @desc    خلاصه‌سازی متن یک فیش
 * @route   POST /api/v1/ai/summarize
 * @access  Private
 */
const summarizeNote = asyncHandler(async (req, res) => {
  const { htmlContent } = req.body;
  if (!htmlContent) {
    res.status(400);
    throw new Error('محتوای فیش الزامی است.');
  }

  const textContent = htmlToText(htmlContent);
  if (textContent.length < 50) {
    res.status(400);
    throw new Error('متن برای خلاصه‌سازی بسیار کوتاه است.');
  }

  const prompt = `متن فارسی زیر را در حداکثر سه جمله خلاصه کن: \n\n${textContent}`;

  const summary = await generateText(prompt);
  ApiResponse.success(res, { summary }, 'خلاصه‌سازی با موفقیت انجام شد');
});

/**
 * @desc    Proofread note content using AI
 * @route   POST /api/v1/ai/proofread
 * @access  Private
 */
const proofreadNote = asyncHandler(async (req, res) => {
  const { htmlContent } = req.body;
  if (!htmlContent) {
    res.status(400);
    throw new Error('محتوای فیش الزامی است.');
  }

  // Call the specific proofreading function
  const correctedText = await proofreadText(htmlContent);

  // Note: The AI returns plain text. Converting it back to basic HTML <p> tags.
  // For preserving original formatting, a more complex diff/patch approach would be needed.
  const correctedHtml = `<p>${correctedText
    .replace(/\n\n/g, '</p><p>')
    .replace(/\n/g, '<br>')}</p>`;

  ApiResponse.success(res, { correctedHtml }, 'ویرایش متن با موفقیت انجام شد');
});
const suggestTags = asyncHandler(async (req, res) => {
  const { textContent, htmlContent } = req.body; // Accept either plain text or HTML

  let inputText = textContent;
  if (htmlContent) {
    inputText = htmlToText(htmlContent); // Clean HTML if provided
  }

  if (!inputText || inputText.trim().length < 20) {
    res.status(400);
    throw new Error('متن ارائه شده برای پیشنهاد تگ بسیار کوتاه است.');
  }

  const tags = await suggestTagsForText(inputText);

  ApiResponse.success(res, { tags }, 'تگ‌ها با موفقیت پیشنهاد شدند');
});

/**
 * @desc    Parse citation text using AI
 * @route   POST /api/v1/ai/parse-citation
 * @access  Private
 */
const aiParseCitation = asyncHandler(async (req, res) => {
  const { citation } = req.body;

  if (
    !citation ||
    typeof citation !== 'string' ||
    citation.trim().length < 10
  ) {
    res.status(400);
    throw new Error('متن Citation معتبر نیست یا بسیار کوتاه است.');
  }

  try {
    const parsedData = await parseCitationWithAI(citation);

    if (!parsedData) {
      throw new Error('AI نتوانست اطلاعاتی از متن استخراج کند.');
    }

    // Basic validation and potential formatting adjustments
    // Ensure authors is an array of objects with firstname/lastname
    if (parsedData.authors && !Array.isArray(parsedData.authors)) {
      parsedData.authors = []; // Or try to parse if it's a string
    } else if (parsedData.authors) {
      parsedData.authors = parsedData.authors
        .map((author) => ({
          firstname: author.firstname || '',
          lastname: author.lastname || '',
        }))
        .filter((a) => a.firstname || a.lastname); // Filter out empty authors
    } else {
      parsedData.authors = [];
    }

    // Ensure year is a number or null
    parsedData.year = parsedData.year ? parseInt(parsedData.year, 10) : null;
    if (isNaN(parsedData.year)) {
      parsedData.year = null;
    }

    ApiResponse.success(
      res,
      parsedData,
      'Citation با موفقیت توسط AI پردازش شد'
    );
  } catch (error) {
    console.error('AI Citation Controller Error:', error);
    res.status(500); // Use 500 for AI service errors
    throw new Error(error.message || 'خطا در پردازش Citation توسط هوش مصنوعی.');
  }
});
export { summarizeNote, suggestTags, proofreadNote, aiParseCitation };
