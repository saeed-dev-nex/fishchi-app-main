import { Router } from 'express';
import { Protect } from '../middlewares/auth.middleware.js';
import { searchAll } from '../controllers/search.controller.js';

const router = Router();

router.post('/search', Protect, searchAll);

export default router;
