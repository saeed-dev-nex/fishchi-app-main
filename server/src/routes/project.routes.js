import { Router } from 'express';
import { protect } from '../middlewares/auth.middleware.js';
import {
  addExistingSourcesToProject,
  createProject,
  deleteProject,
  generateProjectCitations,
  getProjectById,
  getProjects,
  removeSourceFromProject,
  updateProject,
} from '../controllers/project.controller.js';

const router = Router();
router.use(protect);

router.post('/', createProject);
router.post('/:id/sources', addExistingSourcesToProject);
router.get('/', getProjects);
router.get('/:id', getProjectById);
router.put('/:id', updateProject);
router.delete('/:id', deleteProject);
router.delete('/:id/sources/:sourceId', removeSourceFromProject);
router.get('/:id/citations', generateProjectCitations);
export default router;
