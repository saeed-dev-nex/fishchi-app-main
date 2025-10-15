import { z } from 'zod';
export interface IUser {
  _id: string;
  name: string;
  email: string;
  password?: string;
  avatar?: string;
  university?: string;
  fieldOfStudy?: string;
  degree?: string;
  bio?: string;
  isVerified?: boolean;
  createdAt?: string;
}

export interface IAuthState {
  user: IUser | null;
  isLoading: boolean;
  isRegistered: boolean;
  error: string | null;
  message: string | null;
}

export type RegisterData = {
  name: string;
  email: string;
  password: string;
};

export type LoginData = {
  email: string;
  password: string;
};

export const verifySchema = z.object({
  email: z.string().email('ایمیل معتبر نیست'),
  code: z.string().min(8, 'کد تأیید باید حداقل 8 رقمی باشد'),
});

export type VerifyFormInputs = z.infer<typeof verifySchema>;

// Zod Validation Schema
export const registerSchema = z
  .object({
    name: z.string().min(3, 'نام باید حداقل 3 حرف باشد'),
    email: z.email('ایمیل معتبر نیست'),
    password: z.string().min(8, 'رمز عبور باید حداقل 8 حرف باشد'),
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: 'رمز عبور مطابقت ندارد',
    path: ['confirmPassword'],
  });

export type RegisterFormInputs = z.infer<typeof registerSchema>;

export const loginSchema = z.object({
  email: z.email('ایمیل معتبر نیست'),
  password: z.string().min(6, 'رمز عبور باید حداقل 6 حرف باشد'),
});

export type LoginFormInputs = z.infer<typeof loginSchema>;

export interface IProject {
  _id: string;
  title: string;
  description: string;
  createdAt: string;
  sources: ISource[];
  status?: 'در حال انجام' | 'خاتمه یافته' | 'کنسل شده';
  progress?: number;
  startDate?: string;
  endDate?: string;
  estimatedDuration?: number;
  priority?: 'کم' | 'متوسط' | 'زیاد' | 'فوری';
  tags?: string[];
}

export interface IProjectState {
  projects: IProject[];
  selectedProject: IProject | null;
  generatedCitation: string | null;
  isLoading: boolean;
  error: string | null;
}

export interface IProjectStatistics {
  totalSources: number;
  completedSources: number;
  pendingSources: number;
  reviewedSources: number;
  progress: number;
  status: string;
  startDate: string;
  endDate?: string;
  estimatedDuration?: number;
  priority: string;
  daysElapsed: number;
  estimatedCompletion?: number;
}

export type CreateProjectData = {
  title: string;
  description?: string;
  tags?: string[];
  status?: 'در حال انجام' | 'خاتمه یافته' | 'کنسل شده';
  estimatedDuration?: number;
  priority?: 'کم' | 'متوسط' | 'زیاد' | 'فوری';
  _id?: string;
};

export const projectSchema = z.object({
  title: z.string().min(2, 'وارد کردن عنوان پروژه الزامی است'),
  description: z.string().max(400, 'طول غیر مجاز').optional(),
  status: z.enum(['در حال انجام', 'خاتمه یافته', 'کنسل شده']).optional(),
  priority: z.enum(['کم', 'متوسط', 'زیاد', 'فوری']).optional(),
  estimatedDuration: z
    .number()
    .min(1, 'مدت باید حداقل 1 روز باشد')
    .max(365, 'مدت نمی‌تواند بیش از 365 روز باشد')
    .optional(),
  tags: z.string().optional(),
});

export type CreateProjectFormInputs = z.infer<typeof projectSchema>;

export interface IAuthor {
  name: string;
}

export interface ISource {
  _id: string;
  projectId?: string;
  title: string;
  authors: IAuthor[];
  year?: number;
  type: string;
  tags?: string[];
  abstract?: string;
  createdAt?: string;
  status?: 'pending' | 'completed' | 'reviewed';
  identifiers?: {
    url: string;
  };
}

export interface PaginationInfo {
  currentPage: number;
  totalPages: number;
  totalCount: number;
  hasNextPage: boolean;
  hasPrevPage: boolean;
  limit: number;
}

export interface SearchInfo {
  query: string;
  fields: string;
}

export interface SortInfo {
  field: string;
  order: string;
}

export interface SourcesResponse {
  sources: ISource[];
  pagination: PaginationInfo;
  search: SearchInfo;
  sort: SortInfo;
}

export interface SourceState {
  sources: ISource[];
  sourcesByProject: ISource[];
  selectedSource: ISource | null;
  pagination: PaginationInfo | null;
  search: SearchInfo | null;
  sort: SortInfo | null;
  sourceProjects: { [sourceId: string]: IProject[] };
  isLoading: boolean;
  error: string | null;
}

export type CreateSourceData = {
  _id?: string;
  projectId: string;
  title: string;
  authors: IAuthor[];
  year?: number;
  type: string;
};
export type ImportSourceByDoiData = {
  projectId: string;
  doi: string;
};

export type ImportSourceByUrlData = {
  projectId: string;
  url: string;
};

export interface INote {
  _id: string;
  content: string;
  pageRef?: string;
  tags?: string[];
  source?: string; // Source ID
  project: string; // Project ID
  createdAt: string;
}

export interface NoteState {
  notes: INote[];
  isLoading: boolean;
  error: string | null;
}

// Data types for API calls
export type FetchNotesParams = { projectId: string; sourceId?: string };
export type CreateNoteData = {
  projectId: string;
  content: string;
  sourceId?: string;
  pageRef?: string;
};
export type UpdateNoteData = {
  id: string;
  content?: string;
  pageRef?: string;
  tags?: string[];
};

// Settings Types
export interface ISettings {
  _id?: string;
  user?: string;
  general: {
    language: 'fa' | 'en';
    theme: 'light' | 'dark' | 'auto';
    timezone: string;
    dateFormat: 'jalali' | 'gregorian';
    notifications: {
      email: boolean;
      push: boolean;
      projectUpdates: boolean;
      sourceUpdates: boolean;
      systemUpdates: boolean;
    };
  };
  privacy: {
    profileVisibility: 'public' | 'private' | 'friends';
    showEmail: boolean;
    showProjects: boolean;
    allowSearch: boolean;
    dataSharing: {
      analytics: boolean;
      marketing: boolean;
    };
  };
  application: {
    autoSave: boolean;
    autoSaveInterval: number;
    defaultProjectView: 'grid' | 'list';
    defaultSourceView: 'grid' | 'list';
    itemsPerPage: number;
    showTutorials: boolean;
  };
  export: {
    defaultFormat: 'bibtex' | 'ris' | 'apa' | 'mla' | 'chicago';
    includeAbstract: boolean;
    includeKeywords: boolean;
    includeDOI: boolean;
    includeURL: boolean;
  };
  backup: {
    autoBackup: boolean;
    backupFrequency: 'daily' | 'weekly' | 'monthly';
    backupRetention: number;
    includeProjects: boolean;
    includeSources: boolean;
    includeNotes: boolean;
  };
  createdAt?: string;
  updatedAt?: string;
}

export interface SettingsState {
  settings: ISettings | null;
  isLoading: boolean;
  error: string | null;
  message: string | null;
}
