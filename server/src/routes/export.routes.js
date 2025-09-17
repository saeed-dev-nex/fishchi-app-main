import express from 'express';
import { protect } from '../middlewares/auth.middleware.js';
import { exportToDocx } from '../controllers/export.controller.js';

const router = express.Router();

router.post('/docx', protect, exportToDocx); // POST /api/v1/export/docx

export default router;
