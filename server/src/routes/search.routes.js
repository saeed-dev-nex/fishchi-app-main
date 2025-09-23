import { Router } from 'express';
import { protect } from '../middlewares/auth.middleware.js';
import { searchAll } from '../controllers/search.controller.js';

const router = Router();

router.post('/search', protect, searchAll);

export default router;
