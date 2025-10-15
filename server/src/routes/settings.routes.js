import express from 'express';
import {
  getUserSettings,
  updateUserSettings,
  resetSettings,
  updateSettingsSection,
  exportSettings,
  importSettings,
} from '../controllers/settings.controller.js';
import { protect } from '../middlewares/auth.middleware.js';

const router = express.Router();

// All routes are protected
router.use(protect);

// Get user settings
router.get('/', getUserSettings);

// Update user settings
router.put('/', updateUserSettings);

// Reset settings to default
router.post('/reset', resetSettings);

// Update specific settings section
router.put('/:section', updateSettingsSection);

// Export settings
router.get('/export', exportSettings);

// Import settings
router.post('/import', importSettings);

export default router;
