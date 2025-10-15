import Settings from '../models/Settings.model.js';
import asyncHandler from 'express-async-handler';
import ApiResponse from '../utils/apiResponse.js';

// Get user settings
const getUserSettings = asyncHandler(async (req, res) => {
  let settings = await Settings.findOne({ user: req.user._id });

  if (!settings) {
    // Create default settings if not exists
    settings = await Settings.create({
      user: req.user._id,
    });
  }

  ApiResponse.success(res, settings, 'تنظیمات کاربر با موفقیت دریافت شد');
});

// Update user settings
const updateUserSettings = asyncHandler(async (req, res) => {
  const {
    general,
    privacy,
    application,
    export: exportSettings,
    backup,
  } = req.body;

  let settings = await Settings.findOne({ user: req.user._id });

  if (!settings) {
    settings = await Settings.create({
      user: req.user._id,
    });
  }

  // Update settings sections
  if (general) {
    settings.general = { ...settings.general, ...general };
  }

  if (privacy) {
    settings.privacy = { ...settings.privacy, ...privacy };
  }

  if (application) {
    settings.application = { ...settings.application, ...application };
  }

  if (exportSettings) {
    settings.export = { ...settings.export, ...exportSettings };
  }

  if (backup) {
    settings.backup = { ...settings.backup, ...backup };
  }

  await settings.save();

  ApiResponse.success(res, settings, 'تنظیمات کاربر با موفقیت به‌روزرسانی شد');
});

// Reset settings to default
const resetSettings = asyncHandler(async (req, res) => {
  await Settings.findOneAndDelete({ user: req.user._id });

  const defaultSettings = await Settings.create({
    user: req.user._id,
  });

  ApiResponse.success(
    res,
    defaultSettings,
    'تنظیمات کاربر به حالت پیش‌فرض بازگردانده شد'
  );
});

// Update specific setting section
const updateSettingsSection = asyncHandler(async (req, res) => {
  const { section } = req.params;
  const updateData = req.body;

  const validSections = [
    'general',
    'privacy',
    'application',
    'export',
    'backup',
  ];

  if (!validSections.includes(section)) {
    return ApiResponse.error(res, 'بخش تنظیمات نامعتبر است', 400);
  }

  let settings = await Settings.findOne({ user: req.user._id });

  if (!settings) {
    settings = await Settings.create({
      user: req.user._id,
    });
  }

  settings[section] = { ...settings[section], ...updateData };
  await settings.save();

  ApiResponse.success(
    res,
    settings,
    `بخش ${section} تنظیمات با موفقیت به‌روزرسانی شد`
  );
});

// Export user settings
const exportSettings = asyncHandler(async (req, res) => {
  const settings = await Settings.findOne({ user: req.user._id });

  if (!settings) {
    return ApiResponse.error(res, 'تنظیمات کاربر یافت نشد', 404);
  }

  const exportData = {
    exportedAt: new Date().toISOString(),
    version: '1.0',
    settings: settings.toObject(),
  };

  res.setHeader('Content-Type', 'application/json');
  res.setHeader(
    'Content-Disposition',
    'attachment; filename="fishchi-settings.json"'
  );

  ApiResponse.success(res, exportData, 'تنظیمات کاربر با موفقیت صادر شد');
});

// Import user settings
const importSettings = asyncHandler(async (req, res) => {
  const { settings } = req.body;

  if (!settings) {
    return ApiResponse.error(res, 'داده‌های تنظیمات ارسال نشده است', 400);
  }

  // Validate settings structure
  const validSections = [
    'general',
    'privacy',
    'application',
    'export',
    'backup',
  ];
  const hasValidStructure = validSections.some((section) => settings[section]);

  if (!hasValidStructure) {
    return ApiResponse.error(res, 'ساختار تنظیمات نامعتبر است', 400);
  }

  let userSettings = await Settings.findOne({ user: req.user._id });

  if (!userSettings) {
    userSettings = await Settings.create({
      user: req.user._id,
    });
  }

  // Update settings with imported data
  validSections.forEach((section) => {
    if (settings[section]) {
      userSettings[section] = {
        ...userSettings[section],
        ...settings[section],
      };
    }
  });

  await userSettings.save();

  ApiResponse.success(res, userSettings, 'تنظیمات کاربر با موفقیت وارد شد');
});

export {
  getUserSettings,
  updateUserSettings,
  resetSettings,
  updateSettingsSection,
  exportSettings,
  importSettings,
};
