import { z } from 'zod';
export interface IUser {
  _id: string;
  name: string;
  email: string;
  password?: string;
  avatar?: string;
}

export interface IAuthState {
  user: IUser | null;
  isLoading: boolean;
  isRegistered: Boolean;
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

const verifySchema = z.object({
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
  tags?: string[];
}

export interface IProjectState {
  projects: IProject[];
  selectedProject: IProject | null;
  isLoading: boolean;
  error: string | null;
}

export type CreateProjectData = { title: string; description?: string };

export const projectSchema = z.object({
  title: z.string().min(2, 'وارد کردن عنوان پروژه الزامی است'),
  description: z.string().max(400, 'طول غیر مجاز').optional(),
});

export type CreateProjectFormInputs = z.infer<typeof projectSchema>;

export interface IAuthor {
  name: string;
}

export interface ISource {
  _id: string;
  title: string;
  authors: IAuthor[];
  year?: number;
  type: string;
}

export interface SourceState {
  sources: ISource[];
  title: string;
  authors: IAuthor[];
  year?: number;
  type: string;
  isLoading: boolean;
  error: string | null;
}

export type CreateSourceData = {
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
