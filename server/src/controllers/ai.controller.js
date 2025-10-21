import asyncHandler from 'express-async-handler';
import {
  generateText,
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

export { summarizeNote, suggestTags, proofreadNote };
