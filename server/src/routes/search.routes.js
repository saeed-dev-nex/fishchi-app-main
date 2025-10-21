import { Router } from 'express';
import { protect } from '../middlewares/auth.middleware.js';
import { semanticSearch } from '../controllers/search.controller.js';

const router = Router();

router.get('/search', protect, semanticSearch);

export default router;
