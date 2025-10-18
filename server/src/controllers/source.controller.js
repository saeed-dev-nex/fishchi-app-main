import asyncHandler from 'express-async-handler';
import axios from 'axios';
import * as cheerio from 'cheerio';
import Project from '../models/Project.model.js';
import Source from '../models/Source.model.js';
import ApiResponse from '../utils/apiResponse.js';
import { Cite, plugins } from '@citation-js/core';
import '@citation-js/plugin-csl';
import { mapSourceToCSL } from '../utils/cslMapper.js';
import checkProjectOwnership from '../utils/checkOwnershipProject.js';
import moment from 'moment-jalaali';
import { parseCitation } from '../utils/citationParser.js';

// --------- Get All Sources ----------
// @desc get sources with pagination, sorting and search
// @route GET /api/v1/sources
// @access Private
const getSources = asyncHandler(async (req, res) => {
  const {
    projectId,
    page = 1,
    limit = 10,
    sortBy = 'createdAt',
    sortOrder = 'desc',
    search = '',
    searchFields = 'title,authors,tags,year',
  } = req.query;

  // Parse pagination parameters
  const pageNum = parseInt(page);
  const limitNum = parseInt(limit);
  const skip = (pageNum - 1) * limitNum;

  // Parse sort parameters
  const sortField =
    sortBy === 'title'
      ? 'title'
      : sortBy === 'year'
      ? 'year'
      : sortBy === 'createdAt'
      ? 'createdAt'
      : 'createdAt';
  const sortDirection = sortOrder === 'asc' ? 1 : -1;

  // Build search query
  let searchQuery = { user: req.user._id };

  if (search && search.trim()) {
    const searchRegex = new RegExp(search.trim(), 'i');
    const searchFieldsArray = searchFields.split(',');

    const searchConditions = [];

    if (searchFieldsArray.includes('title')) {
      searchConditions.push({ title: searchRegex });
    }
    if (searchFieldsArray.includes('authors')) {
      searchConditions.push({ 'authors.firstname': searchRegex });
      searchConditions.push({ 'authors.lastname': searchRegex });
    }
    if (searchFieldsArray.includes('tags')) {
      searchConditions.push({ tags: searchRegex });
    }
    if (searchFieldsArray.includes('year')) {
      const yearNum = parseInt(search.trim());
      if (!isNaN(yearNum)) {
        searchConditions.push({ year: yearNum });
      }
    }

    if (searchConditions.length > 0) {
      searchQuery.$or = searchConditions;
    }
  }

  let sources, totalCount;

  if (projectId) {
    // Check project ownership
    await checkProjectOwnership(projectId, req.user._id);

    // Get all sources for the project without pagination
    const project = await Project.findById(projectId).populate({
      path: 'sources',
      match: searchQuery,
      options: {
        sort: { [sortField]: sortDirection },
      },
    });

    if (!project) {
      res.status(404);
      throw new Error('پروژه یافت نشد');
    }

    sources = project.sources || [];
    totalCount = sources.length;
  } else {
    sources = await Source.find(searchQuery)
      .sort({ [sortField]: sortDirection })
      .skip(skip)
      .limit(limitNum);

    totalCount = await Source.countDocuments(searchQuery);
  }

  // Calculate pagination info
  const totalPages = Math.ceil(totalCount / limitNum);
  const hasNextPage = pageNum < totalPages;
  const hasPrevPage = pageNum > 1;

  const responseData = {
    sources: sources || [],
    pagination: {
      currentPage: pageNum,
      totalPages,
      totalCount,
      hasNextPage,
      hasPrevPage,
      limit: limitNum,
    },
    search: {
      query: search,
      fields: searchFields,
    },
    sort: {
      field: sortField,
      order: sortOrder,
    },
  };

  ApiResponse.success(res, responseData, 'لیست منابع با موفقیت دریافت شد');
});

// Helper function to convert year based on language
const convertYearBasedOnLanguage = (year, language) => {
  // Check for null, undefined, empty string, or zero
  if (
    !year ||
    year === null ||
    year === undefined ||
    year === '' ||
    year === 0
  ) {
    return null;
  }

  // Convert to number if it's a string
  const numericYear = typeof year === 'string' ? parseInt(year, 10) : year;

  // Check if the conversion resulted in a valid number
  if (isNaN(numericYear) || numericYear <= 0) {
    return null;
  }

  if (language === 'persian') {
    // For Persian sources, if the year is already in Persian format (1300-1500 range), keep it as is
    // If it's in Gregorian format (1900-2100 range), convert it to Persian
    if (numericYear >= 1300 && numericYear <= 1500) {
      // Already in Persian format, keep as is
      return numericYear;
    } else if (numericYear >= 1900 && numericYear <= 2100) {
      // Gregorian format, convert to Persian
      const gregorianDate = moment(`${numericYear}-01-01`, 'YYYY-MM-DD');
      const persianYear = gregorianDate.jYear();
      return persianYear;
    } else {
      // Unknown format, keep as is
      return numericYear;
    }
  } else {
    // For English sources, keep the year as is (Gregorian)
    return numericYear;
  }
};

// Create new source
// @route POST /api/v1/sources
// @access Private
const createSource = asyncHandler(async (req, res) => {
  const {
    projectId,
    title,
    authors,
    year,
    language = 'english',
    ...rest
  } = req.body;
  if (!title) {
    res.status(400);
    throw new Error('فیلد   title الزامی است');
  }

  // Convert year based on language
  const convertedYear = convertYearBasedOnLanguage(year, language);

  const source = await Source.create({
    user: req.user._id,
    title,
    authors,
    year: convertedYear,
    language,
    ...rest,
  });

  // await source.save();
  if (projectId) {
    await checkProjectOwnership(projectId, req.user._id);
    await Project.findByIdAndUpdate(projectId, {
      $push: { sources: source._id }, // اضافه کردن ID منبع به آرایه پروژه
    });
  }
  ApiResponse.success(res, source, 'منبع با موفقیت ایجاد شد');
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
    ApiResponse.success(
      res,
      project.sources || [],
      'لیست منابع با موفقیت دریافت شد'
    );
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
    ? author.map((a) => ({
        firstname: a.given || '',
        lastname: a.family || '',
      }))
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
    language: 'english', // DOI sources are always English
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
  const {
    title,
    authors,
    year,
    type,
    identifiers,
    abstract,
    tags,
    rawCSL,
    language,
    publicationDetails,
  } = req.body;
  source.title = title || source.title;
  source.authors = authors || source.authors;
  source.type = type || source.type;
  source.identifiers = identifiers || source.identifiers;
  source.abstract = abstract || source.abstract;
  source.tags = tags || source.tags;
  source.rawCSL = rawCSL || source.rawCSL;
  source.language = language || source.language;
  source.publicationDetails = publicationDetails || source.publicationDetails;

  // Convert year based on language if year is being updated
  if (year !== undefined) {
    source.year = convertYearBasedOnLanguage(year, source.language);
  }

  const updateSource = await source.save();
  ApiResponse.success(res, updateSource, 'منبع با موفقیت ویرایش شد');
});

/**
 * @ desc Delete a source
 * @route DELETE /api/v1/sources/:id
 * @access Private
 */
const deleteSource = asyncHandler(async (req, res) => {
  const sourceId = req.params.id;

  // Find the source first
  const source = await Source.findById(sourceId);
  if (!source) {
    res.status(404);
    throw new Error('منبع یافت نشد');
  }

  // Check ownership
  if (source.user.toString() !== req.user._id.toString()) {
    res.status(401);
    throw new Error('شما مجاز به حذف این منبع نیستید');
  }

  // Check if source is used in any projects
  const projectsUsingSource = await Project.find({
    user: req.user._id,
    sources: sourceId,
  }).select('title _id');

  if (projectsUsingSource.length > 0) {
    res.status(400);
    throw new Error(
      `این منبع در ${projectsUsingSource.length} پروژه استفاده شده است. ابتدا باید از پروژه‌ها حذف شود.`
    );
  }

  // Delete the source
  await source.deleteOne();
  ApiResponse.success(res, {}, 'منبع با موفقیت حذف شد');
});

/**
 * @ desc Get projects using a source
 * @route GET /api/v1/sources/:id/projects
 * @access Private
 */
const getSourceProjects = asyncHandler(async (req, res) => {
  const sourceId = req.params.id;

  // Find the source first
  const source = await Source.findById(sourceId);
  if (!source) {
    res.status(404);
    throw new Error('منبع یافت نشد');
  }

  // Check ownership
  if (source.user.toString() !== req.user._id.toString()) {
    res.status(401);
    throw new Error('شما مجاز به دسترسی به این منبع نیستید');
  }

  // Find projects using this source
  const projectsUsingSource = await Project.find({
    user: req.user._id,
    sources: sourceId,
  }).select('title _id createdAt');

  ApiResponse.success(
    res,
    projectsUsingSource,
    'لیست پروژه‌های استفاده‌کننده از منبع دریافت شد'
  );
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
 * @desc Parse citation text and extract source information
 * @route POST /api/v1/sources/parse-citation
 * @access Private
 */
const parseCitationText = asyncHandler(async (req, res) => {
  const { citation } = req.body;

  if (!citation || typeof citation !== 'string') {
    res.status(400);
    throw new Error('Citation text is required');
  }

  const result = parseCitation(citation);

  if (result.success) {
    ApiResponse.success(res, result.data, result.message);
  } else {
    res.status(400);
    throw new Error(result.message);
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
  getSourceProjects,
  generateCitation,
  parseCitationText,
};
