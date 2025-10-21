import { Router } from 'express';
import { protect } from '../middlewares/auth.middleware.js';
import {
  proofreadNote,
  suggestTags,
  summarizeNote,
} from '../controllers/ai.controller.js';

const router = Router();

// تمام مسیرهای AI باید محافظت‌شده باشند
router.use(protect);

// مسیر خلاصه‌سازی
router.post('/summarize', summarizeNote);
router.post('/suggest-tags', suggestTags);
router.post('/proofread', proofreadNote);

export default router;
