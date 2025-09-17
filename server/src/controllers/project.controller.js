import asyncHandler from 'express-async-handler';
import Project from '../models/Project.model.js';
import ApiResponse from '../utils/apiResponse.js';

// <-------------- CREATE NEW PROJECT ----------------------->

/**
 * @desc Create a new project
 * @route POST /api/v1/projects
 * @access Private
 */

const createProject = asyncHandler(async (req, res) => {
  const { title, description, tags } = req.body;
  if (!title) {
    res.status(400);
    throw new Error('پروژه باید دارای عنوان باشد');
  }
  const project = new Project({
    user: req.user._id,
    title,
    description,
    tags,
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

// <----------------------- GET PROJECT BY ID ------------------------------->
// @desc get a project by ID
// @route GET /api/v1/projects/:id
// @access Private

const getProjectById = asyncHandler(async (req, res) => {
  const project = await Project.findById(req.params.id);
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
  await project.remove();
  ApiResponse.success(res, null, 'پروژه با موفقیت حذف شد');
});

export {
  createProject,
  getProjects,
  getProjectById,
  updateProject,
  deleteProject,
};
