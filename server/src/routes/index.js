import { Router } from 'express';
import authRouter from './user.routes.js';
import oauthRouter from './auth.routes.js';
import projectRouter from './project.routes.js';
import sourceRouter from './source.routes.js';
import exportRouter from './export.routes.js';
import noteRouter from './note.routes.js';
import searchRouter from './search.routes.js';
import settingsRouter from './settings.routes.js';

const router = Router();

router.use('/users', authRouter);
router.use('/auth', oauthRouter);
router.use('/projects', projectRouter);
router.use('/sources', sourceRouter);
router.use('/export', exportRouter);
router.use('/notes', noteRouter);
router.use('/search', searchRouter);
router.use('/settings', settingsRouter);

export default router;
