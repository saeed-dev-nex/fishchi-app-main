import asyncHandler from 'express-async-handler';
import axios from 'axios';
import * as cheerio from 'cheerio';
import puppeteer from 'puppeteer-extra';
import StealthPlugin from 'puppeteer-extra-plugin-stealth';
import Project from '../models/Project.model.js';
import Source from '../models/Source.model.js';
import ApiResponse from '../utils/apiResponse.js';
import { Cite, plugins } from '@citation-js/core';
import '@citation-js/plugin-csl';
import { mapSourceToCSL } from '../utils/cslMapper.js';
import checkProjectOwnership from '../utils/checkOwnershipProject.js';

// --------- Get All Sources ----------
// @desc get sources
// @route GET /api/v1/sources
// @access Private
const getSources = asyncHandler(async (req, res) => {
  const { projectId } = req.query;

  let sources;

  if (projectId) {
    // Check project ownership
    await checkProjectOwnership(projectId, req.user._id);
    const project = await Project.findById(projectId).populate({
      path: 'sources',
      options: { sort: { createAt: -1 } },
    });
    if (!project) {
      res.status(404);
      throw new Error('پروژه یافت نشد');
    }
    sources = project.sources;
    ApiResponse.success(res, sources, 'لیست منابع با موفقیت دریافت شد');
  } else {
    sources = await Source.find({ user: req.user._id }).sort({ createAt: -1 });
    ApiResponse.success(res, sources, 'لیست منابع با موفقیت دریافت شد');
  }
});

// Create new source
// @route POST /api/v1/sources
// @access Private
const createSource = asyncHandler(async (req, res) => {
  const { projectId, title, authors, ...rest } = req.body;
  console.log('create source data ----> ', req.body);
  if (title) {
    res.status(400);
    throw new Error('فیلد   title الزامی است');
  }
  try {
    const source = new Source({
      user: req.user._id,
      title,
      authors,
      ...rest,
    });
    console.log('create source Object ----> ', source);
    await source.save();
    if (projectId) {
      await checkProjectOwnership(projectId, req.user._id);
      await Project.findByIdAndUpdate(projectId, {
        $push: { sources: source._id }, // اضافه کردن ID منبع به آرایه پروژه
      });
    }
    ApiResponse.success(res, source, 'منبع با موفقیت ایجاد شد');
  } catch (error) {
    res.status(401);
    throw new Error(error.message);
  }
});

// @desc get all references by Project
// @route GET /api/v1/sources/project/:projectId
// @access Private
const getSourcesByProject = asyncHandler(async (req, res) => {
  const { projectId } = req.query;
  if (!projectId) {
    res.status(400);
    throw new Error('شناسه پروژه (projectId) در query string الزامی است');
  }

  try {
    // Check project ownership
    await checkProjectOwnership(projectId, req.user._id);

    const project = await Project.findById(projectId).populate('sources');
    if (!project) {
      res.status(404);
      throw new Error('پروژه یافت نشد');
    }
    ApiResponse.success(res, project.sources, 'لیست منابع با موفقیت دریافت شد');
  } catch (error) {
    res.status(401);
    throw new Error(error.message);
  }
});

// Helper function for convert Result of "Crossref API" to our format
const mapCrossrefToSource = (crossrefResult) => {
  const {
    title,
    author,
    issued,
    'container-title': journal,
    publisher,
    DOI,
    ISBN,
    URL,
    type,
  } = crossrefResult;
  //   Extract Title
  const sourceTitle = title && title.length > 0 ? title[0] : 'عنوان یافت نشد';
  const authors = author
    ? author.map((a) => ({ name: `${a.given || ''} ${a.family || ''}` }))
    : [];
  const year =
    issued && issued['date-parts'] ? issued['date-parts'][0][0] : null;
  let sourceType = 'other';
  if (type === 'journal-article') sourceType = 'article';
  if (type === 'book') sourceType = 'book';
  return {
    title: sourceTitle,
    authors,
    year,
    type: sourceType,
    publicationDetails: {
      journal: journal && journal.length > 0 ? journal[0] : null,
      publisher,
    },
    identifiers: {
      doi: DOI,
      isbn: ISBN && ISBN.length > 0 ? ISBN[0] : null,
      url: URL,
    },
    rawCSL: crossrefResult,
  };
};

// @desc Import source By DOI
// @route POST /api/v1/sources/import-doi
// @access Private
const importSourceByDOI = asyncHandler(async (req, res) => {
  const { doi, projectId } = req.body;
  if (!doi) {
    res.status(400);
    throw new Error('DOI الزامی است');
  }
  try {
    const crossrefUrl = `https://api.crossref.org/works/${doi}`;
    const { data } = await axios.get(crossrefUrl);
    const sourceData = mapCrossrefToSource(data.message);
    const source = new Source({
      ...sourceData,
      project: projectId,
      user: req.user._id,
    });
    await source.save();
    if (projectId) {
      await checkProjectOwnership(projectId, req.user._id);
      await Project.findByIdAndUpdate(projectId, {
        $push: { sources: source._id }, // اضافه کردن ID منبع به آرایه پروژه
      });
    }

    ApiResponse.success(res, source, 'منبع با موفقیت ایجاد شد');
  } catch (error) {
    if (error.response && error.response.status === 404) {
      res.status(404);
      throw new Error('هیچ منبعی با این DOI در Crossref یافت نشد');
    }
    res.status(500);
    throw new Error(`خطا در ارتباط با Crossref: ${error.message}`);
  }
});

/**
 * @ desc Get a source
 * @route GET /api/v1/sources/:id
 * @access Private
 */
const getSourceById = asyncHandler(async (req, res) => {
  const source = await Source.findById(req.params.id);
  console.log(source);
  if (!source) {
    res.status(404);
    throw new Error('منبعی با این شناسه یافت نشد');
  }
  if (source.user.toString() !== req.user._id.toString()) {
    res.status(401);
    throw new Error('شما مجاز به دسترسی به این منبع نیستید');
  }
  ApiResponse.success(res, source, 'منبع با موفقیت دریافت شد');
});

/**
 * @ desc Update a source
 * @route PUT /api/v1/sources/:id
 * @access Private
 */
const updateSource = asyncHandler(async (req, res) => {
  const source = await Source.findById(req.params.id);
  if (!source) {
    res.status(404);
    throw new Error('منبعی با این شناسه یافت نشد');
  }
  if (source.user.toString() !== req.user._id.toString()) {
    res.status(401);
    throw new Error('شما مجاز به ویرایش این منبع نیستید');
  }
  const { title, authors, year, type, identifiers, abstract, tags, rawCSL } =
    req.body;
  source.title = title || source.title;
  source.authors = authors || source.authors;
  source.year = year || source.year;
  source.type = type || source.type;
  source.identifiers = identifiers || source.identifiers;
  source.abstract = abstract || source.abstract;
  source.tags = tags || source.tags;
  source.rawCSL = rawCSL || source.rawCSL;
  const updateSource = await source.save();
  ApiResponse.success(res, updateSource, 'منبع با موفقیت ویرایش شد');
});

/**
 * @ desc Delete a source
 * @route DELETE /api/v1/sources/:id
 * @access Private
 */
const deleteSource = asyncHandler(async (req, res) => {
  const source = await Source.findByIdAndDelete(req.params.id);
  if (!source) {
    res.status(404);
    throw new Error('منبع یافت نشد');
  }
  if (source.user.toString() !== req.user._id.toString()) {
    res.status(401);
    throw new Error('شما مجاز به حذف این منبع نیستید');
  }

  await source.deleteOne();
  ApiResponse.success(res, {}, 'منبع با موفقیت حذف شد');
});

/**
 * desc generate (Citation)  for a source
 * @route GET /api/v1/sources/:id/citation
 * @access Private
 */
const generateCitation = asyncHandler(async (req, res) => {
  const { style = 'apa', format = 'html' } = req.query;
  const source = await Source.findById(req.params.id);
  if (!source) {
    res.status(404);
    throw new Error('منبع یافت نشد');
  }
  if (source.user.toString() !== req.user._id.toString()) {
    res.status(401);
    throw new Error('شما مجاز به دسترسی به این منبع نیستید');
  }

  let cslData;
  if (source.rawCSL && Object.keys(source.rawCSL).length > 0) {
    cslData = source.rawCSL;
  } else {
    cslData = mapSourceToCSL(source);
  }
  try {
    const cite = new Cite(cslData);
    const output = cite.format('bibliography', {
      format: format, // 'html', 'text', 'rtf'
      template: style, // 'apa', 'vancouver', 'chicago-fullnote-bibliography' و...
      lang: 'en-US', // زبان (می‌تواند فارسی 'fa-IR' هم باشد اگر استایل پشتیبانی کند)
    });
    ApiResponse.success(res, { citation: output }, 'ارجاع با موفقیت تولید شد');
  } catch (error) {
    res.status(500);
    throw new Error(`خطا در تولید ارجاع: ${error.message}`);
  }
});

/**
 * تابع کمکی برای استخراج اطلاعات از HTML سایت SID.ir
 */
const scrapeSID = (html) => {
  const $ = cheerio.load(html);
  const getMetaContent = (name) =>
    $(`meta[name="${name}"]`).attr('content')?.trim() || null;
  const title = getMetaContent('citation_title');

  // اگر عنوان پيدا نشد، اين لينک معتبر نيست و ادامه نمي‌دهيم
  if (!title) {
    return null;
  }

  const authorsRaw = getMetaContent('citation_author');
  const abstract =
    $('meta[property="og:description"]').attr('content')?.trim() || null;
  const journal = getMetaContent('citation_publisher');
  const year = getMetaContent('citation_year');
  const volume = getMetaContent('citation_volume');
  const issue = getMetaContent('citation_issue');
  const firstPage = getMetaContent('citation_firstpage');
  const lastPage = getMetaContent('citation_lastpage');
  const keywordsRaw = getMetaContent('citation_keywords');

  const authors = authorsRaw
    ? authorsRaw
        .split(',')
        .map((name) => ({ name: name.trim() }))
        .filter((a) => a.name)
    : [];
  const tags = keywordsRaw
    ? keywordsRaw
        .split('،')
        .map((tag) => tag.trim())
        .filter((t) => t)
    : [];

  return {
    title,
    authors,
    year: year ? parseInt(year, 10) : undefined,
    abstract,
    tags,
    publicationDetails: {
      journal: journal || undefined,
      volume: volume || undefined,
      issue: issue || undefined,
      pages: firstPage && lastPage ? `${firstPage}-${lastPage}` : undefined,
    },
  };
};
puppeteer.use(StealthPlugin());
// @desc    وارد کردن منبع با استفاده از URL
// @route   POST /api/v1/sources/import-url
// @access  Private
const importSourceByUrl = asyncHandler(async (req, res) => {
  const { url, projectId } = req.body;

  if (!url) {
    res.status(400);
    throw new Error(' url   الزامی است');
  }

  let browser = null; // متغیر مرورگر را بیرون از try تعریف می‌کنیم
  try {
    // ۲. یک مرورگر Headless راه‌اندازی کن
    browser = await puppeteer.launch({
      headless: true, // بدون رابط کاربری
      args: ['--no-sandbox', '--disable-setuid-sandbox'], // تنظیمات برای اجرا در محیط‌های مختلف
    });
    const page = await browser.newPage();
    await page.setExtraHTTPHeaders({
      'User-Agent':
        'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/108.0.0.0 Safari/537.36',
      'Accept-Language': 'en-US,en;q=0.9,fa;q=0.8',
    });
    // ۳. به URL مورد نظر برو
    await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 60000 }); // منتظر بمان تا صفحه کاملاً لود شود

    // ۴. محتوای HTML صفحه را استخراج کن
    const html = await page.content();

    let scrapedData = null;
    if (url.includes('sid.ir')) {
      scrapedData = scrapeSID(html);
    }

    if (!scrapedData) {
      res.status(400);
      throw new Error('اطلاعاتی از این لینک قابل استخراج نیست.');
    }

    const source = await Source.create({
      ...scrapedData,
      user: req.user._id,

      type: 'article',
      identifiers: { url },
    });
    if (projectId) {
      await checkProjectOwnership(projectId, req.user._id);
      await Project.findByIdAndUpdate(projectId, {
        $push: { sources: source._id }, // اضافه کردن ID منبع به آرایه پروژه
      });
    }

    ApiResponse.success(res, source, 'منبع با موفقیت از لینک وارد شد', 201);
  } catch (error) {
    console.error('Puppeteer scraping error:', error); // لاگ کردن خطای کامل برای دیباگ
    res.status(500);
    throw new Error(`خطا در پردازش لینک با Puppeteer: ${error.message}`);
  } finally {
    // ۵. در هر صورت (چه موفق چه ناموفق)، مرورگر را ببند تا منابع آزاد شوند
    if (browser) {
      await browser.close();
    }
  }
});

export {
  createSource,
  importSourceByDOI,
  getSources,
  getSourcesByProject,
  getSourceById,
  updateSource,
  deleteSource,
  generateCitation,
  importSourceByUrl,
};
