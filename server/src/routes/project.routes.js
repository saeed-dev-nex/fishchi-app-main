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
  updateProjectStatus,
  updateProjectProgress,
  calculateProjectProgress,
  getProjectStatistics,
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

// New routes for project status and progress management
router.put('/:id/status', updateProjectStatus);
router.put('/:id/progress', updateProjectProgress);
router.post('/:id/calculate-progress', calculateProjectProgress);
router.get('/:id/statistics', getProjectStatistics);

export default router;
