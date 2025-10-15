import React, { useEffect, useState } from 'react';
import {
  Box,
  Paper,
  Typography,
  Tabs,
  Tab,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Switch,
  FormControlLabel,
  Slider,
  Button,
  Alert,
  CircularProgress,
  Divider,
  Stack,
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
} from '@mui/material';
import {
  Settings as SettingsIcon,
  Language,
  Palette,
  Notifications,
  Security,
  Apps,
  FileDownload,
  FileUpload,
  Restore,
  Save,
} from '@mui/icons-material';
import { useDispatch, useSelector } from 'react-redux';
import type { AppDispatch, RootState } from '../../store';
import {
  fetchUserSettings,
  updateUserSettings,
  updateSettingsSection,
  resetSettings,
  exportSettings,
  importSettings,
  clearSettingsError,
  clearSettingsMessage,
} from '../../store/features/settingsSlice';
import { useAppTheme } from '../../contexts/ThemeContext';
import { useLanguage } from '../../contexts/LanguageContext';
import { useNotifications } from '../../contexts/NotificationContext';
import { useExport } from '../../contexts/ExportContext';
import { usePrivacy } from '../../contexts/PrivacyContext';
import type { ISettings } from '../../types';

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

function TabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role='tabpanel'
      hidden={value !== index}
      id={`settings-tabpanel-${index}`}
      aria-labelledby={`settings-tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ p: 3 }}>{children}</Box>}
    </div>
  );
}

const SettingsPage: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const { settings, isLoading, error, message } = useSelector(
    (state: RootState) => state.settings
  );
  const { setTheme } = useAppTheme();
  const { t, setLanguage } = useLanguage();
  const { notifications, setNotification } = useNotifications();
  const { exportSettings, setExportSetting } = useExport();
  const { privacySettings, setPrivacySetting, setDataSharingSetting } =
    usePrivacy();

  const [activeTab, setActiveTab] = useState(0);
  const [localSettings, setLocalSettings] = useState<ISettings | null>(null);
  const [hasChanges, setHasChanges] = useState(false);
  const [resetDialogOpen, setResetDialogOpen] = useState(false);
  const [importDialogOpen, setImportDialogOpen] = useState(false);
  const [importData, setImportData] = useState('');

  useEffect(() => {
    dispatch(fetchUserSettings());
  }, [dispatch]);

  useEffect(() => {
    if (settings) {
      setLocalSettings(settings);
    }
  }, [settings]);

  useEffect(() => {
    if (message) {
      setTimeout(() => {
        dispatch(clearSettingsMessage());
      }, 3000);
    }
  }, [message, dispatch]);

  useEffect(() => {
    if (error) {
      setTimeout(() => {
        dispatch(clearSettingsError());
      }, 5000);
    }
  }, [error, dispatch]);

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setActiveTab(newValue);
  };

  const handleSettingChange = (path: string, value: any) => {
    if (!localSettings) return;

    // Handle theme change immediately
    if (path === 'general.theme') {
      setTheme(value);
    }

    // Handle language change immediately
    if (path === 'general.language') {
      setLanguage(value);
    }

    // Create a deep copy of the settings object
    const newSettings = JSON.parse(JSON.stringify(localSettings));
    const keys = path.split('.');
    let current: any = newSettings;

    for (let i = 0; i < keys.length - 1; i++) {
      current = current[keys[i]];
    }

    current[keys[keys.length - 1]] = value;
    setLocalSettings(newSettings);
    setHasChanges(true);
  };

  const handleSaveSettings = () => {
    if (!localSettings) return;

    dispatch(updateUserSettings(localSettings));
    setHasChanges(false);
  };

  const handleResetSettings = () => {
    dispatch(resetSettings());
    setResetDialogOpen(false);
  };

  const handleExportSettings = () => {
    dispatch(exportSettings());
  };

  const handleImportSettings = () => {
    try {
      const parsedData = JSON.parse(importData);
      dispatch(importSettings(parsedData.settings));
      setImportDialogOpen(false);
      setImportData('');
    } catch (error) {
      console.error('Invalid JSON format');
    }
  };

  if (isLoading && !settings) {
    return (
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          height: '100vh',
        }}
      >
        <CircularProgress />
      </Box>
    );
  }

  if (!localSettings) {
    return (
      <Box sx={{ p: 3 }}>
        <Alert severity='error'>خطایی در بارگذاری تنظیمات رخ داد</Alert>
      </Box>
    );
  }

  return (
    <Box sx={{ p: 3 }}>
      <Paper sx={{ mb: 3 }}>
        <Box sx={{ p: 3, borderBottom: 1, borderColor: 'divider' }}>
          <Stack direction='row' alignItems='center' spacing={2}>
            <SettingsIcon color='primary' />
            <Typography variant='h4' component='h1'>
              {t('settings.title')}
            </Typography>
            {hasChanges && (
              <Chip label='تغییرات ذخیره نشده' color='warning' size='small' />
            )}
          </Stack>
        </Box>

        {message && (
          <Alert severity='success' sx={{ m: 2 }}>
            {message}
          </Alert>
        )}

        {error && (
          <Alert severity='error' sx={{ m: 2 }}>
            {error}
          </Alert>
        )}

        <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
          <Tabs value={activeTab} onChange={handleTabChange}>
            <Tab
              icon={<Language />}
              label={t('settings.general')}
              iconPosition='start'
            />
            <Tab
              icon={<Security />}
              label={t('settings.privacy')}
              iconPosition='start'
            />
            <Tab
              icon={<Apps />}
              label={t('settings.application')}
              iconPosition='start'
            />
            <Tab
              icon={<FileDownload />}
              label={t('settings.export')}
              iconPosition='start'
            />
            <Tab
              icon={<FileUpload />}
              label={t('settings.backup')}
              iconPosition='start'
            />
          </Tabs>
        </Box>

        {/* General Settings */}
        <TabPanel value={activeTab} index={0}>
          <Stack spacing={3}>
            <Typography variant='h6'>{t('settings.general')}</Typography>

            <FormControl fullWidth>
              <InputLabel>{t('settings.language')}</InputLabel>
              <Select
                value={localSettings.general.language}
                onChange={(e) =>
                  handleSettingChange('general.language', e.target.value)
                }
              >
                <MenuItem value='fa'>{t('settings.language.fa')}</MenuItem>
                <MenuItem value='en'>{t('settings.language.en')}</MenuItem>
              </Select>
            </FormControl>

            <FormControl fullWidth>
              <InputLabel>{t('settings.theme')}</InputLabel>
              <Select
                value={localSettings.general.theme}
                onChange={(e) =>
                  handleSettingChange('general.theme', e.target.value)
                }
              >
                <MenuItem value='light'>{t('settings.theme.light')}</MenuItem>
                <MenuItem value='dark'>{t('settings.theme.dark')}</MenuItem>
                <MenuItem value='auto'>{t('settings.theme.auto')}</MenuItem>
              </Select>
            </FormControl>

            <FormControl fullWidth>
              <InputLabel>منطقه زمانی</InputLabel>
              <Select
                value={localSettings.general.timezone}
                onChange={(e) =>
                  handleSettingChange('general.timezone', e.target.value)
                }
              >
                <MenuItem value='Asia/Tehran'>تهران</MenuItem>
                <MenuItem value='UTC'>UTC</MenuItem>
                <MenuItem value='America/New_York'>نیویورک</MenuItem>
                <MenuItem value='Europe/London'>لندن</MenuItem>
              </Select>
            </FormControl>

            <FormControl fullWidth>
              <InputLabel>فرمت تاریخ</InputLabel>
              <Select
                value={localSettings.general.dateFormat}
                onChange={(e) =>
                  handleSettingChange('general.dateFormat', e.target.value)
                }
              >
                <MenuItem value='jalali'>جلالی</MenuItem>
                <MenuItem value='gregorian'>میلادی</MenuItem>
              </Select>
            </FormControl>

            <Divider />

            <Typography variant='h6'>{t('settings.notifications')}</Typography>

            <FormControlLabel
              control={
                <Switch
                  checked={notifications.email}
                  onChange={(e) => setNotification('email', e.target.checked)}
                />
              }
              label={t('settings.notifications.email')}
            />

            <FormControlLabel
              control={
                <Switch
                  checked={notifications.push}
                  onChange={(e) => setNotification('push', e.target.checked)}
                />
              }
              label={t('settings.notifications.push')}
            />

            <FormControlLabel
              control={
                <Switch
                  checked={notifications.projectUpdates}
                  onChange={(e) =>
                    setNotification('projectUpdates', e.target.checked)
                  }
                />
              }
              label={t('settings.notifications.projectUpdates')}
            />

            <FormControlLabel
              control={
                <Switch
                  checked={notifications.sourceUpdates}
                  onChange={(e) =>
                    setNotification('sourceUpdates', e.target.checked)
                  }
                />
              }
              label={t('settings.notifications.sourceUpdates')}
            />

            <FormControlLabel
              control={
                <Switch
                  checked={notifications.systemUpdates}
                  onChange={(e) =>
                    setNotification('systemUpdates', e.target.checked)
                  }
                />
              }
              label={t('settings.notifications.systemUpdates')}
            />
          </Stack>
        </TabPanel>

        {/* Privacy Settings */}
        <TabPanel value={activeTab} index={1}>
          <Stack spacing={3}>
            <Typography variant='h6'>{t('settings.privacy')}</Typography>

            <FormControl fullWidth>
              <InputLabel>{t('settings.privacy.profileVisibility')}</InputLabel>
              <Select
                value={privacySettings.profileVisibility}
                onChange={(e) =>
                  setPrivacySetting('profileVisibility', e.target.value)
                }
              >
                <MenuItem value='public'>
                  {t('settings.privacy.public')}
                </MenuItem>
                <MenuItem value='private'>
                  {t('settings.privacy.private')}
                </MenuItem>
                <MenuItem value='friends'>
                  {t('settings.privacy.friends')}
                </MenuItem>
              </Select>
            </FormControl>

            <FormControlLabel
              control={
                <Switch
                  checked={privacySettings.showEmail}
                  onChange={(e) =>
                    setPrivacySetting('showEmail', e.target.checked)
                  }
                />
              }
              label={t('settings.privacy.showEmail')}
            />

            <FormControlLabel
              control={
                <Switch
                  checked={privacySettings.showProjects}
                  onChange={(e) =>
                    setPrivacySetting('showProjects', e.target.checked)
                  }
                />
              }
              label={t('settings.privacy.showProjects')}
            />

            <FormControlLabel
              control={
                <Switch
                  checked={privacySettings.allowSearch}
                  onChange={(e) =>
                    setPrivacySetting('allowSearch', e.target.checked)
                  }
                />
              }
              label={t('settings.privacy.allowSearch')}
            />

            <Divider />

            <Typography variant='h6'>اشتراک‌گذاری داده</Typography>

            <FormControlLabel
              control={
                <Switch
                  checked={privacySettings.dataSharing.analytics}
                  onChange={(e) =>
                    setDataSharingSetting('analytics', e.target.checked)
                  }
                />
              }
              label='تحلیل و آمار'
            />

            <FormControlLabel
              control={
                <Switch
                  checked={privacySettings.dataSharing.marketing}
                  onChange={(e) =>
                    setDataSharingSetting('marketing', e.target.checked)
                  }
                />
              }
              label='بازاریابی'
            />
          </Stack>
        </TabPanel>

        {/* Application Settings */}
        <TabPanel value={activeTab} index={2}>
          <Stack spacing={3}>
            <Typography variant='h6'>تنظیمات برنامه</Typography>

            <FormControlLabel
              control={
                <Switch
                  checked={localSettings.application.autoSave}
                  onChange={(e) =>
                    handleSettingChange(
                      'application.autoSave',
                      e.target.checked
                    )
                  }
                />
              }
              label='ذخیره خودکار'
            />

            {localSettings.application.autoSave && (
              <Box>
                <Typography gutterBottom>
                  فاصله ذخیره خودکار:{' '}
                  {localSettings.application.autoSaveInterval} ثانیه
                </Typography>
                <Slider
                  value={localSettings.application.autoSaveInterval}
                  onChange={(e, value) =>
                    handleSettingChange('application.autoSaveInterval', value)
                  }
                  min={5}
                  max={300}
                  step={5}
                  marks={[
                    { value: 5, label: '5s' },
                    { value: 60, label: '1m' },
                    { value: 300, label: '5m' },
                  ]}
                />
              </Box>
            )}

            <FormControl fullWidth>
              <InputLabel>نمای پیش‌فرض پروژه‌ها</InputLabel>
              <Select
                value={localSettings.application.defaultProjectView}
                onChange={(e) =>
                  handleSettingChange(
                    'application.defaultProjectView',
                    e.target.value
                  )
                }
              >
                <MenuItem value='grid'>شبکه‌ای</MenuItem>
                <MenuItem value='list'>لیستی</MenuItem>
              </Select>
            </FormControl>

            <FormControl fullWidth>
              <InputLabel>نمای پیش‌فرض منابع</InputLabel>
              <Select
                value={localSettings.application.defaultSourceView}
                onChange={(e) =>
                  handleSettingChange(
                    'application.defaultSourceView',
                    e.target.value
                  )
                }
              >
                <MenuItem value='grid'>شبکه‌ای</MenuItem>
                <MenuItem value='list'>لیستی</MenuItem>
              </Select>
            </FormControl>

            <Box>
              <Typography gutterBottom>
                تعداد آیتم در صفحه: {localSettings.application.itemsPerPage}
              </Typography>
              <Slider
                value={localSettings.application.itemsPerPage}
                onChange={(e, value) =>
                  handleSettingChange('application.itemsPerPage', value)
                }
                min={5}
                max={100}
                step={5}
                marks={[
                  { value: 5, label: '5' },
                  { value: 20, label: '20' },
                  { value: 50, label: '50' },
                  { value: 100, label: '100' },
                ]}
              />
            </Box>

            <FormControlLabel
              control={
                <Switch
                  checked={localSettings.application.showTutorials}
                  onChange={(e) =>
                    handleSettingChange(
                      'application.showTutorials',
                      e.target.checked
                    )
                  }
                />
              }
              label='نمایش راهنماها'
            />
          </Stack>
        </TabPanel>

        {/* Export Settings */}
        <TabPanel value={activeTab} index={3}>
          <Stack spacing={3}>
            <Typography variant='h6'>{t('settings.export')}</Typography>

            <FormControl fullWidth>
              <InputLabel>{t('settings.export.defaultFormat')}</InputLabel>
              <Select
                value={exportSettings.defaultFormat}
                onChange={(e) =>
                  setExportSetting('defaultFormat', e.target.value)
                }
              >
                <MenuItem value='bibtex'>BibTeX</MenuItem>
                <MenuItem value='ris'>RIS</MenuItem>
                <MenuItem value='apa'>APA</MenuItem>
                <MenuItem value='mla'>MLA</MenuItem>
                <MenuItem value='chicago'>Chicago</MenuItem>
              </Select>
            </FormControl>

            <FormControlLabel
              control={
                <Switch
                  checked={exportSettings.includeAbstract}
                  onChange={(e) =>
                    setExportSetting('includeAbstract', e.target.checked)
                  }
                />
              }
              label={t('settings.export.includeAbstract')}
            />

            <FormControlLabel
              control={
                <Switch
                  checked={exportSettings.includeKeywords}
                  onChange={(e) =>
                    setExportSetting('includeKeywords', e.target.checked)
                  }
                />
              }
              label={t('settings.export.includeKeywords')}
            />

            <FormControlLabel
              control={
                <Switch
                  checked={exportSettings.includeDOI}
                  onChange={(e) =>
                    setExportSetting('includeDOI', e.target.checked)
                  }
                />
              }
              label={t('settings.export.includeDOI')}
            />

            <FormControlLabel
              control={
                <Switch
                  checked={exportSettings.includeURL}
                  onChange={(e) =>
                    setExportSetting('includeURL', e.target.checked)
                  }
                />
              }
              label={t('settings.export.includeURL')}
            />
          </Stack>
        </TabPanel>

        {/* Backup Settings */}
        <TabPanel value={activeTab} index={4}>
          <Stack spacing={3}>
            <Typography variant='h6'>تنظیمات پشتیبان‌گیری</Typography>

            <FormControlLabel
              control={
                <Switch
                  checked={localSettings.backup.autoBackup}
                  onChange={(e) =>
                    handleSettingChange('backup.autoBackup', e.target.checked)
                  }
                />
              }
              label='پشتیبان‌گیری خودکار'
            />

            {localSettings.backup.autoBackup && (
              <>
                <FormControl fullWidth>
                  <InputLabel>فرکانس پشتیبان‌گیری</InputLabel>
                  <Select
                    value={localSettings.backup.backupFrequency}
                    onChange={(e) =>
                      handleSettingChange(
                        'backup.backupFrequency',
                        e.target.value
                      )
                    }
                  >
                    <MenuItem value='daily'>روزانه</MenuItem>
                    <MenuItem value='weekly'>هفتگی</MenuItem>
                    <MenuItem value='monthly'>ماهانه</MenuItem>
                  </Select>
                </FormControl>

                <Box>
                  <Typography gutterBottom>
                    مدت نگهداری: {localSettings.backup.backupRetention} روز
                  </Typography>
                  <Slider
                    value={localSettings.backup.backupRetention}
                    onChange={(e, value) =>
                      handleSettingChange('backup.backupRetention', value)
                    }
                    min={7}
                    max={365}
                    step={7}
                    marks={[
                      { value: 7, label: '1 هفته' },
                      { value: 30, label: '1 ماه' },
                      { value: 90, label: '3 ماه' },
                      { value: 365, label: '1 سال' },
                    ]}
                  />
                </Box>
              </>
            )}

            <Divider />

            <Typography variant='h6'>شامل کردن در پشتیبان‌گیری</Typography>

            <FormControlLabel
              control={
                <Switch
                  checked={localSettings.backup.includeProjects}
                  onChange={(e) =>
                    handleSettingChange(
                      'backup.includeProjects',
                      e.target.checked
                    )
                  }
                />
              }
              label='پروژه‌ها'
            />

            <FormControlLabel
              control={
                <Switch
                  checked={localSettings.backup.includeSources}
                  onChange={(e) =>
                    handleSettingChange(
                      'backup.includeSources',
                      e.target.checked
                    )
                  }
                />
              }
              label='منابع'
            />

            <FormControlLabel
              control={
                <Switch
                  checked={localSettings.backup.includeNotes}
                  onChange={(e) =>
                    handleSettingChange('backup.includeNotes', e.target.checked)
                  }
                />
              }
              label='یادداشت‌ها'
            />
          </Stack>
        </TabPanel>

        {/* Action Buttons */}
        <Box sx={{ p: 3, borderTop: 1, borderColor: 'divider' }}>
          <Stack direction='row' spacing={2} justifyContent='space-between'>
            <Stack direction='row' spacing={2}>
              <Button
                variant='outlined'
                startIcon={<FileDownload />}
                onClick={handleExportSettings}
                disabled={isLoading}
              >
                صادر کردن تنظیمات
              </Button>
              <Button
                variant='outlined'
                startIcon={<FileUpload />}
                onClick={() => setImportDialogOpen(true)}
                disabled={isLoading}
              >
                وارد کردن تنظیمات
              </Button>
              <Button
                variant='outlined'
                color='warning'
                startIcon={<Restore />}
                onClick={() => setResetDialogOpen(true)}
                disabled={isLoading}
              >
                بازگردانی پیش‌فرض
              </Button>
            </Stack>

            <Button
              variant='contained'
              startIcon={<Save />}
              onClick={handleSaveSettings}
              disabled={!hasChanges || isLoading}
            >
              ذخیره تغییرات
            </Button>
          </Stack>
        </Box>
      </Paper>

      {/* Reset Dialog */}
      <Dialog open={resetDialogOpen} onClose={() => setResetDialogOpen(false)}>
        <DialogTitle>بازگردانی تنظیمات</DialogTitle>
        <DialogContent>
          <Typography>
            آیا مطمئن هستید که می‌خواهید تمام تنظیمات را به حالت پیش‌فرض
            بازگردانید؟ این عمل قابل بازگشت نیست.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setResetDialogOpen(false)}>انصراف</Button>
          <Button onClick={handleResetSettings} color='warning'>
            بازگردانی
          </Button>
        </DialogActions>
      </Dialog>

      {/* Import Dialog */}
      <Dialog
        open={importDialogOpen}
        onClose={() => setImportDialogOpen(false)}
      >
        <DialogTitle>وارد کردن تنظیمات</DialogTitle>
        <DialogContent>
          <TextField
            fullWidth
            multiline
            rows={10}
            value={importData}
            onChange={(e) => setImportData(e.target.value)}
            placeholder='محتوای JSON تنظیمات را اینجا وارد کنید...'
            variant='outlined'
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setImportDialogOpen(false)}>انصراف</Button>
          <Button onClick={handleImportSettings} disabled={!importData}>
            وارد کردن
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default SettingsPage;
