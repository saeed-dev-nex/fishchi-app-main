import asyncHandler from 'express-async-handler';

import ApiResponse from '../utils/apiResponse.js';

import checkProjectOwnership from '../utils/checkOwnershipProject.js';

const checkNoteOwnership = async (noteId, userId) => {
  const note = await Note.findById(noteId);
  if (!note) {
    throw new Error('فیش یافت نشد');
  }
  if (note.user.toString() !== userId.toString()) {
    throw new Error('شما مجاز به انجام این عملیات نیستید');
  }
  return true;
};

import Note from '../models/Note.model.js';
import Source from '../models/Source.model.js';

/**
 * @desc Create a new note
 * @route POST /api/v1/notes
 * @access Private
 */

const createNote = asyncHandler(async (req, res) => {
  const { projectId, sourceId, content, pageRef, tags } = req.body;
  console.log('NOTE request body', req.body);
  const userId = req.user._id;
  if (!projectId || !content) {
    res.status(400);
    throw new Error('فیلدهای projectId و content الزامی هستند');
  }

  await checkProjectOwnership(projectId, userId);
  console.log('userId', userId);
  console.log(await checkProjectOwnership(projectId, userId));

  if (sourceId) {
    const source = await Source.findById(sourceId);
    console.log('source.user', source.user);
    if (!source) {
      res.status(404);
      throw new Error('منبعی با این شناسه یافت نشد');
    }
    if (source.user.toString() !== userId.toString()) {
      res.status(401);
      throw new Error('شما مجاز به انجام این عملیات نیستید');
    }
  }
  const note = new Note({
    user: userId,
    project: projectId,
    source: sourceId,
    content,
    pageRef,
    tags,
  });
  await note.save();
  console.log('note', note);
  ApiResponse.success(res, note, 'فیش با موفقیت ایجاد شد');
});

/**
 * @desc Get notes by project or source
 * @route GET /api/v1/notes
 * @access Private
 */
const getNotes = asyncHandler(async (req, res) => {
  const { projectId, sourceId } = req.query;
  const userId = req.user._id;
  if (!projectId) {
    throw new Error('شناسه پروژه (projectId) در query string الزامی است');
  }
  try {
    await checkProjectOwnership(projectId, userId);
    const filter = {
      user: userId,
      project: projectId,
    };
    if (sourceId) {
      filter.source = sourceId;
    }
    const notes = await Note.find(filter).sort({ createdAt: -1 });
    ApiResponse.success(res, notes, 'لیست فیش ها با موفقیت دریافت شد');
  } catch (error) {
    res.status(401);
    throw new Error(error.message);
  }
});

/**
 * @desc get a note by ID
 * @route GET /api/v1/notes/:id
 * @access Private
 */
const getNoteById = asyncHandler(async (req, res) => {
  const note = await Note.findById(req.params.id);

  await checkNoteOwnership(note._id, req.user._id);
  ApiResponse.success(res, note, 'فیش با موفقیت دریافت شد');
});

/**
 * Update a note
 * @route PUT /api/v1/notes/:id
 * @access Private
 */
const updateNote = asyncHandler(async (req, res) => {
  const { content, pageRef, tags } = req.body;
  const note = await Note.findById(req.params.id);
  await checkNoteOwnership(note._id, req.user._id);
  note.content = content || note.content;
  note.pageRef = pageRef || note.pageRef;
  note.tags = tags || note.tags;
  await note.save();
  ApiResponse.success(res, note, 'فیش با موفقیت به روز رسانی شد');
});

/**
 * @desc Delete a note
 * @route DELETE /api/v1/notes/:id
 * @access Private
 */
const deleteNote = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const note = await Note.findById(id);
  if (!note) {
    res.status(404);
    throw new Error('فیش یافت نشد');
  }
  await checkNoteOwnership(note._id, req.user._id);
  await note.deleteOne();
  ApiResponse.success(res, null, 'فیش با موفقیت حذف شد');
});

export { createNote, getNotes, getNoteById, updateNote, deleteNote };
