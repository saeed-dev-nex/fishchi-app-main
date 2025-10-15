import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';

import type {
  IAuthState,
  IUser,
  LoginData,
  RegisterData,
  VerifyFormInputs,
} from '../../types';
import apiClient from '../../api/axios';
import { extractErrorMessage, ERROR_MESSAGES } from '../../utils/errorHandler';

const initialState: IAuthState = {
  user: null,
  isLoading: true, // Start with loading true to check auth status
  isRegistered: false,
  error: null,
  message: null,
};

//  -------- Async Thunks ( Management API Requests ) --------
// 1. Checking User Login Status
export const checkUserStatus = createAsyncThunk(
  'auth/checkUserStatus',
  async (_, thunkAPI) => {
    try {
      const { data } = await apiClient.get('/users/profile');
      return data.data as IUser;
    } catch {
      // Don't log error for auth check failure - it's expected for non-authenticated users
      return thunkAPI.rejectWithValue('Not authenticated');
    }
  }
);

// 2. Register new User
export const registerUser = createAsyncThunk(
  'auth/register',
  async (userData: RegisterData, thunkAPI) => {
    try {
      const { data } = await apiClient.post('/users/register', userData);
      return data.data as IUser;
    } catch (error: unknown) {
      const message = extractErrorMessage(error, ERROR_MESSAGES.REGISTER);
      return thunkAPI.rejectWithValue(message);
    }
  }
);

// 3. Activation Email
export const verifyEmail = createAsyncThunk(
  'auth/verifyEmail',
  async (verifyData: VerifyFormInputs, thunkAPI) => {
    try {
      const { data } = await apiClient.post('/users/verify-email', verifyData);
      console.log(data);

      return data.data as IUser;
    } catch (error: unknown) {
      const message = extractErrorMessage(error, ERROR_MESSAGES.VERIFY_EMAIL);
      return thunkAPI.rejectWithValue(message);
    }
  }
);
// 4. Login User
export const loginUser = createAsyncThunk(
  'auth/login',
  async (loginData: LoginData, thunkAPI) => {
    try {
      const { data } = await apiClient.post('/users/login', loginData);
      return data.data as IUser;
    } catch (error: unknown) {
      console.log(error instanceof Error ? error.message : 'Unknown error');
      const message = extractErrorMessage(error, ERROR_MESSAGES.LOGIN);
      return thunkAPI.rejectWithValue(message);
    }
  }
);
//
// 5. Logout User
export const logoutUser = createAsyncThunk(
  'auth/logout',
  async (_, thunkAPI) => {
    try {
      const { data } = await apiClient.post('/users/logout');
      return data.data;
    } catch (error: unknown) {
      const message = extractErrorMessage(error, ERROR_MESSAGES.LOGOUT);
      return thunkAPI.rejectWithValue(message);
    }
  }
);
// Create Slice
export const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    logout: (state) => {
      state.user = null;
      state.isLoading = false;
      state.error = null;
      state.message = null;
    },
    clearState: (state) => {
      state.isRegistered = false;
      state.error = null;
      state.message = null;
    },
    updateUserProfile: (state, action) => {
      if (state.user) {
        state.user = { ...state.user, ...action.payload };
      }
    },
  },
  extraReducers: (builder) => {
    builder
      // ----- Check User Status -----
      .addCase(checkUserStatus.pending, (state) => {
        state.isLoading = true;
      })

      .addCase(checkUserStatus.fulfilled, (state, action) => {
        state.isLoading = false;
        state.user = action.payload;
        state.error = null;
      })
      .addCase(checkUserStatus.rejected, (state) => {
        state.isLoading = false;
        state.user = null;
        state.error = null; // Don't set error for auth check failure
      })
      // ----- Register User -----
      .addCase(registerUser.pending, (state) => {
        state.isLoading = true;
      })

      .addCase(registerUser.fulfilled, (state, action) => {
        state.isLoading = false;
        state.user = action.payload;
        state.isRegistered = true;
        state.error = null;
      })

      .addCase(registerUser.rejected, (state, action) => {
        state.isLoading = false;
        state.user = null;
        state.error = action.payload as string;
      })
      // ----- Verify Email -----
      .addCase(verifyEmail.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(verifyEmail.fulfilled, (state, action) => {
        state.isLoading = false;
        state.user = action.payload; // کاربر لاگین شد!
        state.message = 'حساب کاربری با موفقیت فعال شد.';
      })
      .addCase(verifyEmail.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })
      // --- Login User ---
      .addCase(loginUser.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(loginUser.fulfilled, (state, action) => {
        state.isLoading = false;
        state.user = action.payload; // کاربر لاگین شد!
      })
      .addCase(loginUser.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })
      // ----- Logout User -----
      .addCase(logoutUser.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(logoutUser.fulfilled, (state) => {
        state.isLoading = false;
        state.user = null;
        state.error = null;
      })
      .addCase(logoutUser.rejected, (state, action) => {
        state.isLoading = false;
        state.user = null; // Clear user even if logout fails
        state.error = action.payload as string;
      });
  },
});
export const { clearState, updateUserProfile, logout } = authSlice.actions;
export default authSlice.reducer;
