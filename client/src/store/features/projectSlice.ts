import {
  createAsyncThunk,
  createSlice,
  type PayloadAction,
} from '@reduxjs/toolkit';
import axios from 'axios';
import type { CreateProjectData, IProject, IProjectState } from '../../types';

const initialState: IProjectState = {
  projects: [],
  isLoading: false,
  error: null,
};

// Async Thunk
// ---------- 1. Get Projects List ----------
export const fetchProjects = createAsyncThunk(
  'projects/fetchProjectsList',
  async (_, thunkAPI) => {
    try {
      const { data } = await axios.get('/api/v1/projects');
      console.log(data);
      return data.data as IProject[];
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

// ---------- 2. Create New Project ----------
export const createProject = createAsyncThunk(
  'projects/createProject',
  async (projectData: CreateProjectData, thunkAPI) => {
    try {
      const { data } = await axios.post('/api/v1/projects', projectData);
      return data.data as IProject;
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

const projectSlice = createSlice({
  name: 'project',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      // --- Fetch Projects ---
      .addCase(fetchProjects.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(
        fetchProjects.fulfilled,
        (state, action: PayloadAction<IProject[]>) => {
          state.isLoading = false;
          state.projects = action.payload;
        }
      )
      .addCase(fetchProjects.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })
      // --- Create Project ---
      .addCase(createProject.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(
        createProject.fulfilled,
        (state, action: PayloadAction<IProject>) => {
          state.isLoading = false;
          state.projects.unshift(action.payload); // پروژه جدید را به ابتدای لیست اضافه کن
        }
      )
      .addCase(createProject.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });
  },
});
export const {} = projectSlice.actions;
export default projectSlice.reducer;
