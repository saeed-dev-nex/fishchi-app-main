import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import apiClient from '../../api/axios';
import type { ISettings, SettingsState } from '../../types';
import { extractErrorMessage } from '../../utils/errorHandler';

// Initial state
const initialState: SettingsState = {
  settings: null,
  isLoading: false,
  error: null,
  message: null,
};

// Async thunks
export const fetchUserSettings = createAsyncThunk(
  'settings/fetchUserSettings',
  async (_, { rejectWithValue }) => {
    try {
      const { data } = await apiClient.get('/settings');
      return data.data as ISettings;
    } catch (error: unknown) {
      const message = extractErrorMessage(
        error,
        'خطایی در دریافت تنظیمات رخ داد'
      );
      return rejectWithValue(message);
    }
  }
);

export const updateUserSettings = createAsyncThunk(
  'settings/updateUserSettings',
  async (settingsData: Partial<ISettings>, { rejectWithValue }) => {
    try {
      const { data } = await apiClient.put('/settings', settingsData);
      return data.data as ISettings;
    } catch (error: unknown) {
      const message = extractErrorMessage(
        error,
        'خطایی در به‌روزرسانی تنظیمات رخ داد'
      );
      return rejectWithValue(message);
    }
  }
);

export const updateSettingsSection = createAsyncThunk(
  'settings/updateSettingsSection',
  async (
    { section, data: sectionData }: { section: string; data: any },
    { rejectWithValue }
  ) => {
    try {
      const { data } = await apiClient.put(`/settings/${section}`, sectionData);
      return data.data as ISettings;
    } catch (error: unknown) {
      const message = extractErrorMessage(
        error,
        'خطایی در به‌روزرسانی بخش تنظیمات رخ داد'
      );
      return rejectWithValue(message);
    }
  }
);

export const resetSettings = createAsyncThunk(
  'settings/resetSettings',
  async (_, { rejectWithValue }) => {
    try {
      const { data } = await apiClient.post('/settings/reset');
      return data.data as ISettings;
    } catch (error: unknown) {
      const message = extractErrorMessage(
        error,
        'خطایی در بازگردانی تنظیمات رخ داد'
      );
      return rejectWithValue(message);
    }
  }
);

export const exportSettings = createAsyncThunk(
  'settings/exportSettings',
  async (_, { rejectWithValue }) => {
    try {
      const { data } = await apiClient.get('/settings/export');
      return data.data;
    } catch (error: unknown) {
      const message = extractErrorMessage(
        error,
        'خطایی در صادر کردن تنظیمات رخ داد'
      );
      return rejectWithValue(message);
    }
  }
);

export const importSettings = createAsyncThunk(
  'settings/importSettings',
  async (settingsData: any, { rejectWithValue }) => {
    try {
      const { data } = await apiClient.post('/settings/import', {
        settings: settingsData,
      });
      return data.data as ISettings;
    } catch (error: unknown) {
      const message = extractErrorMessage(
        error,
        'خطایی در وارد کردن تنظیمات رخ داد'
      );
      return rejectWithValue(message);
    }
  }
);

// Settings slice
const settingsSlice = createSlice({
  name: 'settings',
  initialState,
  reducers: {
    clearSettingsError: (state) => {
      state.error = null;
    },
    clearSettingsMessage: (state) => {
      state.message = null;
    },
    clearSettingsState: (state) => {
      state.settings = null;
      state.error = null;
      state.message = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch user settings
      .addCase(fetchUserSettings.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchUserSettings.fulfilled, (state, action) => {
        state.isLoading = false;
        state.settings = action.payload;
        state.error = null;
      })
      .addCase(fetchUserSettings.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })

      // Update user settings
      .addCase(updateUserSettings.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(updateUserSettings.fulfilled, (state, action) => {
        state.isLoading = false;
        state.settings = action.payload;
        state.message = 'تنظیمات با موفقیت به‌روزرسانی شد';
        state.error = null;
      })
      .addCase(updateUserSettings.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })

      // Update settings section
      .addCase(updateSettingsSection.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(updateSettingsSection.fulfilled, (state, action) => {
        state.isLoading = false;
        state.settings = action.payload;
        state.message = 'بخش تنظیمات با موفقیت به‌روزرسانی شد';
        state.error = null;
      })
      .addCase(updateSettingsSection.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })

      // Reset settings
      .addCase(resetSettings.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(resetSettings.fulfilled, (state, action) => {
        state.isLoading = false;
        state.settings = action.payload;
        state.message = 'تنظیمات به حالت پیش‌فرض بازگردانده شد';
        state.error = null;
      })
      .addCase(resetSettings.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })

      // Export settings
      .addCase(exportSettings.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(exportSettings.fulfilled, (state) => {
        state.isLoading = false;
        state.message = 'تنظیمات با موفقیت صادر شد';
        state.error = null;
      })
      .addCase(exportSettings.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })

      // Import settings
      .addCase(importSettings.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(importSettings.fulfilled, (state, action) => {
        state.isLoading = false;
        state.settings = action.payload;
        state.message = 'تنظیمات با موفقیت وارد شد';
        state.error = null;
      })
      .addCase(importSettings.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });
  },
});

export const { clearSettingsError, clearSettingsMessage, clearSettingsState } =
  settingsSlice.actions;
export default settingsSlice.reducer;
