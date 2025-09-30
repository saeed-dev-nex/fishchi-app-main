import { Router } from 'express';
import { protect } from '../middlewares/auth.middleware.js';
import {
  createProject,
  deleteProject,
  getProjectById,
  getProjects,
  removeSourceFromProject,
  updateProject,
} from '../controllers/project.controller.js';

const router = Router();
router.use(protect);

router.post('/', createProject);
router.get('/', getProjects);
router.get('/:id', getProjectById);
router.put('/:id', updateProject);
router.delete('/:id', deleteProject);
router.delete('/:id/sources/:sourceId', removeSourceFromProject);
export default router;
