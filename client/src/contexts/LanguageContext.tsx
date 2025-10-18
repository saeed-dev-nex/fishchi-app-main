import { createContext, useContext, useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import type { RootState, AppDispatch } from '../store';
import { updateSettingsSection } from '../store/features/settingsSlice';

interface ILanguageContext {
  language: 'fa' | 'en';
  setLanguage: (language: 'fa' | 'en') => void;
  t: (key: string) => string;
}

const LanguageContext = createContext<ILanguageContext | undefined>(undefined);

// Simple translations object
const translations = {
  fa: {
    // General
    'settings.title': 'تنظیمات',
    'settings.general': 'عمومی',
    'settings.privacy': 'حریم خصوصی',
    'settings.application': 'برنامه',
    'settings.export': 'صادرات',
    'settings.backup': 'پشتیبان‌گیری',

    // Theme
    'settings.theme': 'تم',
    'settings.theme.light': 'روشن',
    'settings.theme.dark': 'تیره',
    'settings.theme.auto': 'خودکار',

    // Language
    'settings.language': 'زبان',
    'settings.language.fa': 'فارسی',
    'settings.language.en': 'English',

    // Notifications
    'settings.notifications': 'اعلان‌ها',
    'settings.notifications.email': 'اعلان‌های ایمیل',
    'settings.notifications.push': 'اعلان‌های فوری',
    'settings.notifications.projectUpdates': 'به‌روزرسانی پروژه‌ها',
    'settings.notifications.sourceUpdates': 'به‌روزرسانی منابع',
    'settings.notifications.systemUpdates': 'به‌روزرسانی سیستم',

    // Privacy
    'settings.privacy.profileVisibility': 'نمایش پروفایل',
    'settings.privacy.public': 'عمومی',
    'settings.privacy.private': 'خصوصی',
    'settings.privacy.friends': 'دوستان',
    'settings.privacy.showEmail': 'نمایش ایمیل',
    'settings.privacy.showProjects': 'نمایش پروژه‌ها',
    'settings.privacy.allowSearch': 'اجازه جستجو',

    // Application
    'settings.application.autoSave': 'ذخیره خودکار',
    'settings.application.defaultProjectView': 'نمای پیش‌فرض پروژه‌ها',
    'settings.application.defaultSourceView': 'نمای پیش‌فرض منابع',
    'settings.application.itemsPerPage': 'تعداد آیتم در صفحه',
    'settings.application.showTutorials': 'نمایش راهنماها',

    // Export
    'settings.export.defaultFormat': 'فرمت پیش‌فرض',
    'settings.export.includeAbstract': 'شامل چکیده',
    'settings.export.includeKeywords': 'شامل کلمات کلیدی',
    'settings.export.includeDOI': 'شامل DOI',
    'settings.export.includeURL': 'شامل URL',

    // Backup
    'settings.backup.autoBackup': 'پشتیبان‌گیری خودکار',
    'settings.backup.backupFrequency': 'فرکانس پشتیبان‌گیری',
    'settings.backup.backupRetention': 'مدت نگهداری',
    'settings.backup.includeProjects': 'پروژه‌ها',
    'settings.backup.includeSources': 'منابع',
    'settings.backup.includeNotes': 'یادداشت‌ها',

    // Actions
    'settings.save': 'ذخیره تغییرات',
    'settings.reset': 'بازگردانی پیش‌فرض',
    'settings.exportSettings': 'صادر کردن تنظیمات',
    'settings.import': 'وارد کردن تنظیمات',
  },
  en: {
    // General
    'settings.title': 'Settings',
    'settings.general': 'General',
    'settings.privacy': 'Privacy',
    'settings.application': 'Application',
    'settings.export': 'Export',
    'settings.backup': 'Backup',

    // Theme
    'settings.theme': 'Theme',
    'settings.theme.light': 'Light',
    'settings.theme.dark': 'Dark',
    'settings.theme.auto': 'Auto',

    // Language
    'settings.language': 'Language',
    'settings.language.fa': 'فارسی',
    'settings.language.en': 'English',

    // Notifications
    'settings.notifications': 'Notifications',
    'settings.notifications.email': 'Email Notifications',
    'settings.notifications.push': 'Push Notifications',
    'settings.notifications.projectUpdates': 'Project Updates',
    'settings.notifications.sourceUpdates': 'Source Updates',
    'settings.notifications.systemUpdates': 'System Updates',

    // Privacy
    'settings.privacy.profileVisibility': 'Profile Visibility',
    'settings.privacy.public': 'Public',
    'settings.privacy.private': 'Private',
    'settings.privacy.friends': 'Friends',
    'settings.privacy.showEmail': 'Show Email',
    'settings.privacy.showProjects': 'Show Projects',
    'settings.privacy.allowSearch': 'Allow Search',

    // Application
    'settings.application.autoSave': 'Auto Save',
    'settings.application.defaultProjectView': 'Default Project View',
    'settings.application.defaultSourceView': 'Default Source View',
    'settings.application.itemsPerPage': 'Items Per Page',
    'settings.application.showTutorials': 'Show Tutorials',

    // Export
    'settings.export.defaultFormat': 'Default Format',
    'settings.export.includeAbstract': 'Include Abstract',
    'settings.export.includeKeywords': 'Include Keywords',
    'settings.export.includeDOI': 'Include DOI',
    'settings.export.includeURL': 'Include URL',

    // Backup
    'settings.backup.autoBackup': 'Auto Backup',
    'settings.backup.backupFrequency': 'Backup Frequency',
    'settings.backup.backupRetention': 'Backup Retention',
    'settings.backup.includeProjects': 'Projects',
    'settings.backup.includeSources': 'Sources',
    'settings.backup.includeNotes': 'Notes',

    // Actions
    'settings.save': 'Save Changes',
    'settings.reset': 'Reset to Default',
    'settings.exportSettings': 'Export Settings',
    'settings.import': 'Import Settings',
  },
};

export const LanguageProvider = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  const dispatch = useDispatch<AppDispatch>();
  const { settings } = useSelector((state: RootState) => state.settings);

  const language = settings?.general?.language || 'fa';

  const setLanguage = (newLanguage: 'fa' | 'en') => {
    dispatch(
      updateSettingsSection({
        section: 'general',
        data: { language: newLanguage },
      })
    );
  };

  const t = (key: string): string => {
    return translations[language][key as keyof typeof translations.fa] || key;
  };

  // Set document direction based on language
  useEffect(() => {
    document.dir = language === 'fa' ? 'rtl' : 'ltr';
    document.documentElement.lang = language;
  }, [language]);

  const value = {
    language,
    setLanguage,
    t,
  };

  return (
    <LanguageContext.Provider value={value}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};
