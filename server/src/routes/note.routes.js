import { Router } from 'express';
import { protect } from '../middlewares/auth.middleware.js';
import {
  createNote,
  getNotes,
  getNoteById,
  updateNote,
  deleteNote,
} from '../controllers/note.controller.js';

const router = Router();
router.use(protect);

router.route('/').post(createNote).get(getNotes);
router.route('/:id').get(getNoteById).put(updateNote).delete(deleteNote);

export default router;
