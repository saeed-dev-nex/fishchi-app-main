import { Router } from 'express';
import { protect } from '../middlewares/auth.middleware.js';
import {
  createSource,
  deleteSource,
  generateCitation,
  getSourceById,
  getSourceProjects,
  getSources,
  getSourcesByProject,
  importSourceByDOI,
  updateSource,
} from '../controllers/source.controller.js';

const router = Router();
router.use(protect);

router.get('/', getSources);
router.route('/').post(createSource).get(getSourcesByProject);
router.route('/import-doi').post(importSourceByDOI);

// Specific routes must come before parameterized routes
router.get('/:id/projects', getSourceProjects);
router.get('/:id/citation', generateCitation);
router.route('/:id').get(getSourceById).put(updateSource).delete(deleteSource);

export default router;
