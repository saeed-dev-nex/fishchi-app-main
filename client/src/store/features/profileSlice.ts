import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';

import type { IUser } from '../../types';
import apiClient from '../../api/axios';
import { updateUserProfile as updateAuthUser } from './authSlice';

interface ProfileState {
  user: IUser | null;
  isLoading: boolean;
  error: string | null;
  message: string | null;
}

const initialState: ProfileState = {
  user: null,
  isLoading: false,
  error: null,
  message: null,
};

// Async thunks
export const fetchUserProfile = createAsyncThunk(
  'profile/fetchUserProfile',
  async (_, { rejectWithValue }) => {
    try {
      const response = await apiClient.get('/users/profile');
      return response.data.data;
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.message || 'خطا در دریافت پروفایل'
      );
    }
  }
);

export const updateUserProfile = createAsyncThunk(
  'profile/updateUserProfile',
  async (profileData: Partial<IUser>, { rejectWithValue, dispatch }) => {
    try {
      const response = await apiClient.put('/users/profile', profileData);
      // Update auth user profile as well
      dispatch(updateAuthUser(response.data.data));
      return response.data.data;
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.message || 'خطا در بروزرسانی پروفایل'
      );
    }
  }
);

export const changePassword = createAsyncThunk(
  'profile/changePassword',
  async (
    passwordData: { currentPassword: string; newPassword: string },
    { rejectWithValue }
  ) => {
    try {
      const response = await apiClient.put('/users/password', passwordData);
      return response.data.message;
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.message || 'خطا در تغییر رمز عبور'
      );
    }
  }
);

export const uploadAvatar = createAsyncThunk(
  'profile/uploadAvatar',
  async (file: File, { rejectWithValue, dispatch }) => {
    try {
      const formData = new FormData();
      formData.append('avatar', file);

      const response = await apiClient.post('/users/avatar', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      // Update auth user avatar as well
      dispatch(updateAuthUser({ avatar: response.data.data.avatar }));
      return response.data.data;
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.message || 'خطا در آپلود عکس'
      );
    }
  }
);

export const deleteAvatar = createAsyncThunk(
  'profile/deleteAvatar',
  async (_, { rejectWithValue, dispatch }) => {
    try {
      const response = await apiClient.delete('/users/avatar');
      // Update auth user avatar as well
      dispatch(updateAuthUser({ avatar: undefined }));
      return response.data.message;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'خطا در حذف عکس');
    }
  }
);

const profileSlice = createSlice({
  name: 'profile',
  initialState,
  reducers: {
    clearProfileError: (state) => {
      state.error = null;
    },
    clearProfileMessage: (state) => {
      state.message = null;
    },
    clearProfileState: (state) => {
      state.user = null;
      state.error = null;
      state.message = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch user profile
      .addCase(fetchUserProfile.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchUserProfile.fulfilled, (state, action) => {
        state.isLoading = false;
        state.user = action.payload;
        state.error = null;
      })
      .addCase(fetchUserProfile.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })

      // Update user profile
      .addCase(updateUserProfile.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(updateUserProfile.fulfilled, (state, action) => {
        state.isLoading = false;
        state.user = action.payload;
        state.message = 'پروفایل با موفقیت بروزرسانی شد';
        state.error = null;
      })
      .addCase(updateUserProfile.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })

      // Change password
      .addCase(changePassword.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(changePassword.fulfilled, (state, action) => {
        state.isLoading = false;
        state.message = action.payload;
        state.error = null;
      })
      .addCase(changePassword.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })

      // Upload avatar
      .addCase(uploadAvatar.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(uploadAvatar.fulfilled, (state, action) => {
        state.isLoading = false;
        if (state.user) {
          state.user.avatar = action.payload.avatar;
        }
        state.message = 'عکس پروفایل با موفقیت آپلود شد';
        state.error = null;
      })
      .addCase(uploadAvatar.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })

      // Delete avatar
      .addCase(deleteAvatar.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(deleteAvatar.fulfilled, (state) => {
        state.isLoading = false;
        if (state.user) {
          state.user.avatar = undefined;
        }
        state.message = 'عکس پروفایل با موفقیت حذف شد';
        state.error = null;
      })
      .addCase(deleteAvatar.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });
  },
});

export const { clearProfileError, clearProfileMessage, clearProfileState } =
  profileSlice.actions;
export default profileSlice.reducer;
