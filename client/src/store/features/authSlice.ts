import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import axios from 'axios';
import type { IAuthState, IUser } from '../../types';

const initialState: IAuthState = {
  user: null,
  isLoading: false,
  error: null,
};

//  -------- Async Thunks ( Management API Requests ) --------
// 1. Checking User Login Status
export const checkUserStatus = createAsyncThunk(
  'auth/checkUserStatus',
  async (_, thunkAPI) => {
    try {
      const { data } = await axios.get('/api/v1/users/profile');
      return data.data as IUser;
    } catch (error: any) {
      console.log(error.response?.message);

      return thunkAPI.rejectWithValue(error.response?.message);
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
  },
  extraReducers: (builder) => {
    builder
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
      });
    //   !Todo: Add More Async Thunks
  },
});
export const { logout } = authSlice.actions;
export default authSlice.reducer;
