import { Router } from 'express';
import { protect } from '../middlewares/auth.middleware.js';
import {
  createSource,
  deleteSource,
  generateCitation,
  getSourceById,
  getSourcesByProject,
  importSourceByDOI,
  importSourceByUrl,
  updateSource,
} from '../controllers/source.controller.js';

const router = Router();
router.use(protect);

router.route('/').post(createSource).get(getSourcesByProject);
router.route('/import-doi').post(importSourceByDOI);
router.route('/import-url').post(importSourceByUrl);

router.route('/:id').get(getSourceById).put(updateSource).delete(deleteSource);
router.get('/:id/citation', generateCitation);

export default router;
