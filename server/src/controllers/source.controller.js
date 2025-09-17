import asyncHandler from 'express-async-handler';
import axios from 'axios';
import Project from '../models/Project.model.js';
import Source from '../models/Source.model.js';
import ApiResponse from '../utils/apiResponse.js';
import { Cite, plugins } from '@citation-js/core';
import '@citation-js/plugin-csl';
import { mapSourceToCSL } from '../utils/cslMapper.js';
import checkProjectOwnership from '../utils/checkOwnershipProject.js';

// Create new source
// @route POST /api/v1/sources
// @access Private
const createSource = asyncHandler(async (req, res) => {
  const { projectId, title, authors, year, type, identifiers, abstract, tags } =
    req.body;
  if (!projectId || !title) {
    res.status(400);
    throw new Error('فیلدهای projectId و title الزامی هستند');
  }
  try {
    await checkProjectOwnership(projectId, req.user._id);
    const source = new Source({
      user: req.user._id,
      project: projectId,
      title,
      authors,
      year,
      type,
      identifiers,
      abstract,
      tags,
    });
    await source.save();
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
    const sources = await Source.find({ project: projectId }).sort({
      createdAt: -1,
    });
    console.log(sources);
    ApiResponse.success(res, sources, 'لیست منابع با موفقیت دریافت شد');
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
  if (!doi || !projectId) {
    res.status(400);
    throw new Error('DOI و projectId الزامی هستند');
  }
  try {
    await checkProjectOwnership(projectId, req.user._id);

    const crossrefUrl = `https://api.crossref.org/works/${doi}`;
    const { data } = await axios.get(crossrefUrl);
    const sourceData = mapCrossrefToSource(data.message);
    const source = new Source({
      ...sourceData,
      project: projectId,
      user: req.user._id,
    });
    await source.save();
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

export {
  createSource,
  importSourceByDOI,
  getSourcesByProject,
  getSourceById,
  updateSource,
  deleteSource,
  generateCitation,
};
