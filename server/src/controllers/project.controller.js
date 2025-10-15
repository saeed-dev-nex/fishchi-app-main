import asyncHandler from 'express-async-handler';
import Project from '../models/Project.model.js';
import ApiResponse from '../utils/apiResponse.js';
import checkProjectOwnership from '../utils/checkOwnershipProject.js';
import { Cite } from '@citation-js/core';
import '@citation-js/plugin-csl';
import { mapSourceToCSL } from '../utils/cslMapper.js';
import Source from '../models/Source.model.js';

// <-------------- CREATE NEW PROJECT ----------------------->

/**
 * @desc Create a new project
 * @route POST /api/v1/projects
 * @access Private
 */

const createProject = asyncHandler(async (req, res) => {
  const {
    title,
    description,
    tags,
    status = 'در حال انجام',
    estimatedDuration,
    priority = 'متوسط',
  } = req.body;

  if (!title) {
    res.status(400);
    throw new Error('پروژه باید دارای عنوان باشد');
  }

  const project = new Project({
    user: req.user._id,
    title,
    description,
    tags,
    status,
    estimatedDuration,
    priority,
  });

  const createdProject = await project.save();
  ApiResponse.success(res, createdProject, 'پروژه با موفقیت ایجاد شد', 201);
});

// <-------------- Get All Projects Handler ----------------------->
// @desc get All project of loggedIn user
// @route GET /api/v1/projects
// @access Private

const getProjects = asyncHandler(async (req, res) => {
  const projects = await Project.find({ user: req.user._id });
  ApiResponse.success(res, projects, 'لیست پروژه ها با موفقیت دریافت شد');
});

// <-------------- Add Existing Sources to Project  ----------------------->
// @desc add existing sources to project
// @route POST /api/v1/projects/:projectId/sources
// @access Private

const addExistingSourcesToProject = asyncHandler(async (req, res) => {
  const { id: projectId } = req.params;
  const { sourceIds } = req.body;
  if (!sourceIds || !Array.isArray(sourceIds)) {
    res.status(400);
    throw new Error('آرایه‌ای از sourceIds الزامی است');
  }
  await checkProjectOwnership(projectId, req.user._id);
  await Project.findByIdAndUpdate(projectId, {
    $push: { sources: { $each: sourceIds } }, // اضافه کردن منابع به آرایه پروژه
  });
  ApiResponse.success(res, null, 'منابع با موفقیت به پروژه اضافه شد');
});
// <----------------------- GET PROJECT BY ID ------------------------------->
// @desc get a project by ID
// @route GET /api/v1/projects/:id
// @access Private

const getProjectById = asyncHandler(async (req, res) => {
  const project = await Project.findById(req.params.id).populate('sources');
  if (project) {
    // check current requested project crate by current logged in user
    if (project.user.toString() !== req.user._id.toString()) {
      res.status(401);
      throw new Error('شما اجازه ندارید');
    }
    ApiResponse.success(res, project, 'پروژه با موفقیت دریافت شد');
  } else {
    res.status(404);
    throw new Error('پروژه یافت نشد');
  }
});

// <----------------------- UPDATE PROJECT ------------------------------->
//@desc Update a project
//@route PUT /api/v1/projects/:id
//@access Private

const updateProject = asyncHandler(async (req, res) => {
  const project = await Project.findById(req.params.id);
  const { title, description, tags } = req.body;
  if (!project) {
    res.status(404);
    throw new Error('پروژه یافت نشد');
  }
  if (project.user.toString() !== req.user._id.toString()) {
    res.status(401);
    throw new Error('شما مجاز به ویرایش این پروژه نیستید');
  }
  project.title = title || project.title;
  project.description = description || project.description;
  project.tags = tags || project.tags;
  const updateProject = await project.save();
  ApiResponse.success(res, updateProject, 'پروژه با موفقیت ویرایش شد');
});

// <----------------------- DELETE PROJECT ------------------------------->
// @desc delete a project
// @route DELETE /api/v1/project/:id
// @access Private

const deleteProject = asyncHandler(async (req, res) => {
  const project = await Project.findById(req.params.id);
  if (!project) {
    res.status(404);
    throw new Error('پروژه یافت نشد');
  }
  if (project.user.toString() !== req.user._id.toString()) {
    res.status(401);
    throw new Error('شما مجاز به حذف این پروژه نیستید');
  }
  await project.deleteOne();
  ApiResponse.success(res, null, 'پروژه با موفقیت حذف شد');
});

const removeSourceFromProject = asyncHandler(async (req, res) => {
  const { id: projectId, sourceId } = req.params;

  await checkProjectOwnership(projectId, req.user._id);

  await Project.findByIdAndUpdate(projectId, {
    $pull: { sources: sourceId }, // حذف ID منبع از آرایه پروژه
  });

  ApiResponse.success(res, null, 'منبع با موفقیت از پروژه حذف شد');
});
// <----------------------- GENERATE PROJECT CITATIONS ------------------------------->
// @desc    Generate citations for all sources in a project
// @route   GET /api/v1/projects/:id/citations
// @access  Private
const generateProjectCitations = asyncHandler(async (req, res) => {
  const { id: projectId } = req.params;
  const { style = 'apa', format = 'html' } = req.query;

  // 1. Check ownership and fetch project with sources
  await checkProjectOwnership(projectId, req.user._id);
  const project = await Project.findById(projectId).populate('sources');

  if (!project) {
    res.status(404);
    throw new Error('پروژه یافت نشد');
  }

  if (project.sources.length === 0) {
    ApiResponse.success(res, { citation: '' }, 'پروژه منبعی برای استناد ندارد');
    return;
  }

  // 2. Convert all sources to CSL-JSON format
  const cslData = project.sources.map((source) => {
    return source.rawCSL && Object.keys(source.rawCSL).length > 0
      ? source.rawCSL
      : mapSourceToCSL(source);
  });

  // 3. Generate bibliography using citation-js
  try {
    const cite = new Cite(cslData);
    const output = cite.format('bibliography', {
      format: format,
      template: style,
      lang: 'en-US',
    });
    ApiResponse.success(
      res,
      { citation: output },
      'استناد پروژه با موفقیت تولید شد'
    );
  } catch (error) {
    res.status(500);
    throw new Error(`خطا در تولید استناد: ${error.message}`);
  }
});

// <-------------- Update Project Status ----------------------->
// @desc update project status
// @route PUT /api/v1/projects/:id/status
// @access Private

const updateProjectStatus = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { status } = req.body;

  if (
    !status ||
    !['در حال انجام', 'خاتمه یافته', 'کنسل شده'].includes(status)
  ) {
    res.status(400);
    throw new Error(
      'وضعیت پروژه باید یکی از موارد زیر باشد: در حال انجام، خاتمه یافته، کنسل شده'
    );
  }

  const project = await Project.findById(id);
  if (!project) {
    res.status(404);
    throw new Error('پروژه یافت نشد');
  }

  // Check ownership
  if (project.user.toString() !== req.user._id.toString()) {
    res.status(401);
    throw new Error('شما مجاز به تغییر وضعیت این پروژه نیستید');
  }

  // Update status and end date if completed or cancelled
  const updateData = { status };
  if (status === 'خاتمه یافته' || status === 'کنسل شده') {
    updateData.endDate = new Date();
    updateData.progress = 100;
  }

  const updatedProject = await Project.findByIdAndUpdate(id, updateData, {
    new: true,
  });

  ApiResponse.success(
    res,
    updatedProject,
    'وضعیت پروژه با موفقیت بروزرسانی شد'
  );
});

// <-------------- Update Project Progress ----------------------->
// @desc update project progress
// @route PUT /api/v1/projects/:id/progress
// @access Private

const updateProjectProgress = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { progress } = req.body;

  if (progress === undefined || progress < 0 || progress > 100) {
    res.status(400);
    throw new Error('پیشرفت پروژه باید بین 0 تا 100 باشد');
  }

  const project = await Project.findById(id);
  if (!project) {
    res.status(404);
    throw new Error('پروژه یافت نشد');
  }

  // Check ownership
  if (project.user.toString() !== req.user._id.toString()) {
    res.status(401);
    throw new Error('شما مجاز به تغییر پیشرفت این پروژه نیستید');
  }

  // Auto-update status based on progress
  let status = project.status;
  if (progress === 100 && status === 'در حال انجام') {
    status = 'خاتمه یافته';
  } else if (progress < 100 && status === 'خاتمه یافته') {
    status = 'در حال انجام';
  }

  const updateData = { progress, status };
  if (progress === 100 && status === 'خاتمه یافته') {
    updateData.endDate = new Date();
  }

  const updatedProject = await Project.findByIdAndUpdate(id, updateData, {
    new: true,
  });

  ApiResponse.success(
    res,
    updatedProject,
    'پیشرفت پروژه با موفقیت بروزرسانی شد'
  );
});

// <-------------- Calculate Project Progress ----------------------->
// @desc calculate project progress based on sources
// @route POST /api/v1/projects/:id/calculate-progress
// @access Private

const calculateProjectProgress = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const project = await Project.findById(id).populate('sources');
  if (!project) {
    res.status(404);
    throw new Error('پروژه یافت نشد');
  }

  // Check ownership
  if (project.user.toString() !== req.user._id.toString()) {
    res.status(401);
    throw new Error('شما مجاز به محاسبه پیشرفت این پروژه نیستید');
  }

  // Calculate progress based on sources
  let progress = 0;
  if (project.sources && project.sources.length > 0) {
    const completedSources = project.sources.filter(
      (source) => source.status === 'completed'
    ).length;
    progress = Math.round((completedSources / project.sources.length) * 100);
  }

  // Update project progress
  const updatedProject = await Project.findByIdAndUpdate(
    id,
    { progress },
    { new: true }
  );

  ApiResponse.success(
    res,
    {
      project: updatedProject,
      calculatedProgress: progress,
      totalSources: project.sources?.length || 0,
      completedSources:
        project.sources?.filter((source) => source.status === 'completed')
          .length || 0,
    },
    'پیشرفت پروژه با موفقیت محاسبه شد'
  );
});

// <-------------- Get Project Statistics ----------------------->
// @desc get project statistics
// @route GET /api/v1/projects/:id/statistics
// @access Private

const getProjectStatistics = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const project = await Project.findById(id).populate('sources');
  if (!project) {
    res.status(404);
    throw new Error('پروژه یافت نشد');
  }

  // Check ownership
  if (project.user.toString() !== req.user._id.toString()) {
    res.status(401);
    throw new Error('شما مجاز به مشاهده آمار این پروژه نیستید');
  }

  const stats = {
    totalSources: project.sources?.length || 0,
    completedSources:
      project.sources?.filter((source) => source.status === 'completed')
        .length || 0,
    pendingSources:
      project.sources?.filter((source) => source.status === 'pending').length ||
      0,
    reviewedSources:
      project.sources?.filter((source) => source.status === 'reviewed')
        .length || 0,
    progress: project.progress,
    status: project.status,
    startDate: project.startDate,
    endDate: project.endDate,
    estimatedDuration: project.estimatedDuration,
    priority: project.priority,
    daysElapsed: project.startDate
      ? Math.floor((new Date() - project.startDate) / (1000 * 60 * 60 * 24))
      : 0,
    estimatedCompletion:
      project.estimatedDuration && project.progress > 0
        ? Math.round((project.estimatedDuration * project.progress) / 100)
        : null,
  };

  ApiResponse.success(res, stats, 'آمار پروژه با موفقیت دریافت شد');
});

export {
  createProject,
  addExistingSourcesToProject,
  getProjects,
  getProjectById,
  updateProject,
  deleteProject,
  removeSourceFromProject,
  generateProjectCitations,
  updateProjectStatus,
  updateProjectProgress,
  calculateProjectProgress,
  getProjectStatistics,
};
