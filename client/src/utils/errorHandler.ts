/**
 * Utility function to extract error messages from axios responses
 * @param error - The error object from axios
 * @param defaultMessage - Default message if no error message is found
 * @returns Extracted error message
 */
export const extractErrorMessage = (
  error: unknown,
  defaultMessage: string = 'خطایی رخ داد'
): string => {
  // Type guard to check if error has response property
  if (error && typeof error === 'object' && 'response' in error) {
    const axiosError = error as {
      response?: {
        data?: { message?: string; error?: string; errors?: string | string[] };
      };
    };

    // Check for different error response structures
    if (axiosError.response?.data?.message) {
      return axiosError.response.data.message;
    }

    if (axiosError.response?.data?.error) {
      return axiosError.response.data.error;
    }

    if (axiosError.response?.data?.errors) {
      // Handle validation errors array
      if (Array.isArray(axiosError.response.data.errors)) {
        return axiosError.response.data.errors.join(', ');
      }
      return axiosError.response.data.errors;
    }
  }

  // Check if error has message property
  if (error && typeof error === 'object' && 'message' in error) {
    return (error as Error).message;
  }

  return defaultMessage;
};

/**
 * Common error messages for different operations
 */
export const ERROR_MESSAGES = {
  REGISTER: 'خطایی در ثبت نام رخ داد',
  LOGIN: 'خطایی در ورود رخ داد',
  LOGOUT: 'خطایی در خروج رخ داد',
  VERIFY_EMAIL: 'خطایی در فعالسازی ایمیل رخ داد',
  FETCH_SOURCES: 'خطایی در دریافت منابع رخ داد',
  CREATE_SOURCE: 'خطایی در ایجاد منبع رخ داد',
  UPDATE_SOURCE: 'خطایی در به‌روزرسانی منبع رخ داد',
  DELETE_SOURCE: 'خطایی در حذف منبع رخ داد',
  FETCH_PROJECTS: 'خطایی در دریافت پروژه‌ها رخ داد',
  CREATE_PROJECT: 'خطایی در ایجاد پروژه رخ داد',
  UPDATE_PROJECT: 'خطایی در به‌روزرسانی پروژه رخ داد',
  DELETE_PROJECT: 'خطایی در حذف پروژه رخ داد',
  GENERIC: 'خطایی رخ داد',
} as const;

/**
 * Show notification to user
 * @param message - Message to display
 * @param type - Type of notification (success, error, warning, info)
 */
export const showNotification = (
  message: string,
  type: 'success' | 'error' | 'warning' | 'info' = 'info'
) => {
  const event = new CustomEvent(type, {
    detail: { message },
  });
  window.dispatchEvent(event);
};
