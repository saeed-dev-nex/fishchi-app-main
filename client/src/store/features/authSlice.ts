import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import axios from 'axios';
import type {
  IAuthState,
  IUser,
  LoginData,
  RegisterData,
  VerifyFormInputs,
} from '../../types';
import apiClient from '../../api/axios';

const initialState: IAuthState = {
  user: null,
  isLoading: false,
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
    } catch (error: any) {
      console.log(error.response?.message);

      return thunkAPI.rejectWithValue(error.response?.message);
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
    } catch (error: any) {
      const message =
        (error.response &&
          error.response.data &&
          error.response.data.message) ||
        error.message ||
        error.toString();

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
    } catch (error: any) {
      const message =
        (error.response &&
          error.response.data &&
          error.response.data.message) ||
        error.message ||
        error.toString();

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
    } catch (error: any) {
      console.log(error.response?.message);
      const message =
        (error.response &&
          error.response.data &&
          error.response.data.message) ||
        error.message ||
        error.toString();

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
      .addCase(checkUserStatus.rejected, (state, action) => {
        state.isLoading = false;
        state.user = null;
        state.error = action.payload as string;
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
      });
  },
});
export const { logout, clearState, updateUserProfile } = authSlice.actions;
export default authSlice.reducer;
