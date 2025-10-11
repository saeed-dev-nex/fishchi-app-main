import {
  createAsyncThunk,
  createSlice,
  type PayloadAction,
} from '@reduxjs/toolkit';
import type { CreateProjectData, IProject, IProjectState } from '../../types';
import apiClient from '../../api/axios';

const initialState: IProjectState = {
  projects: [],
  selectedProject: null,
  generatedCitation: null,
  isLoading: false,
  error: null,
};

// Async Thunk
// ---------- 1. Get Projects List ----------
export const fetchProjects = createAsyncThunk(
  'projects/fetchProjectsList',
  async (_, thunkAPI) => {
    try {
      const { data } = await apiClient.get('/projects');
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
      const { data } = await apiClient.post('/projects', projectData);
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

// ------------ 3. Get Project By ID -----------
export const fetchProjectById = createAsyncThunk(
  'projects/getProjectById',
  async (projectId: string, thunkAPI) => {
    try {
      const { data } = await apiClient.get(`/projects/${projectId}`);
      return data.data as IProject;
    } catch (error: any) {
      const message =
        error.response?.data?.message || error.message || error.toString();
      return thunkAPI.rejectWithValue(message);
    }
  }
);

// --------- 4. Delete Project -------------
export const deleteProject = createAsyncThunk(
  'projects/deleteProject',
  async (projectId: string, thunkAPI) => {
    try {
      await apiClient.delete(`/projects/${projectId}`);
      return projectId;
    } catch (error: any) {
      const message =
        error.response?.data?.message || error.message || error.toString();
      return thunkAPI.rejectWithValue(message);
    }
  }
);

// ----------- 5. Remove Source From Project -----------
export const removeSourceFromProject = createAsyncThunk(
  'projects/removeSourceFromProject',
  async (
    { projectId, sourceId }: { projectId: string; sourceId: string },
    thunkAPI
  ) => {
    try {
      await apiClient.delete(`/projects/${projectId}/sources/${sourceId}`);
      return sourceId;
    } catch (error: any) {
      const message =
        error.response?.data?.message || error.message || error.toString();
      return thunkAPI.rejectWithValue(message);
    }
  }
);

// ----------- 6. Add Existing Sources To Project -----------
export const addExistingSourcesToProject = createAsyncThunk(
  'projects/addExistingSourcesToProject',
  async (
    { projectId, sourceIds }: { projectId: string; sourceIds: string[] },
    thunkAPI
  ) => {
    try {
      await apiClient.post(`/projects/${projectId}/sources`, { sourceIds });
      return sourceIds;
    } catch (error: any) {
      const message =
        error.response?.data?.message || error.message || error.toString();
      return thunkAPI.rejectWithValue(message);
    }
  }
);
// ----------------------------- 7. Update Project -----------------------------
export const updateProject = createAsyncThunk(
  'projects/updateProject',
  async (projectData: CreateProjectData, thunkAPI) => {
    try {
      const { data } = await apiClient.put(
        `/projects/${projectData._id}`,
        projectData
      );
      return data.data as IProject;
    } catch (error: any) {
      const message =
        error.response?.data?.message || error.message || error.toString();
      return thunkAPI.rejectWithValue(message);
    }
  }
);
// ------------------ Generate Project Citations ------------------
export const generateProjectCitations = createAsyncThunk(
  'projects/generateCitations',
  async (
    { projectId, style }: { projectId: string; style: string },
    { rejectWithValue }
  ) => {
    try {
      const { data } = await apiClient.get(
        `/projects/${projectId}/citations?style=${style}&format=html`
      );
      return data.data.citation as string;
    } catch (error: unknown) {
      return rejectWithValue(error.response.data.message);
    }
  }
);

const projectSlice = createSlice({
  name: 'project',
  initialState,
  reducers: {
    clearSelectedProject: (state) => {
      state.selectedProject = null;
    },
  },
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
      })
      .addCase(fetchProjectById.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(
        fetchProjectById.fulfilled,
        (state, action: PayloadAction<IProject>) => {
          state.isLoading = false;
          state.selectedProject = action.payload;
        }
      )
      .addCase(fetchProjectById.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })
      // Delete Project
      .addCase(deleteProject.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(
        deleteProject.fulfilled,
        (state, action: PayloadAction<string>) => {
          state.isLoading = false;
          state.projects = state.projects.filter(
            (project) => project._id !== action.payload
          );
        }
      )
      .addCase(deleteProject.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })
      // --- Remove Source From Project ---
      .addCase(removeSourceFromProject.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(
        removeSourceFromProject.fulfilled,
        (state, action: PayloadAction<string>) => {
          state.isLoading = false;
          // Remove source from selectedProject.sources if it exists
          if (state.selectedProject) {
            state.selectedProject.sources =
              state.selectedProject.sources.filter(
                (source) => source._id !== action.payload
              );
          }
        }
      )
      .addCase(removeSourceFromProject.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })
      // --- Add Existing Sources To Project ---
      .addCase(addExistingSourcesToProject.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(
        addExistingSourcesToProject.fulfilled,
        (state, action: PayloadAction<string[]>) => {
          state.isLoading = false;
        }
      )
      .addCase(addExistingSourcesToProject.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })
      // --- Generate Project Citations ---
      .addCase(generateProjectCitations.pending, (state) => {
        state.generatedCitation = 'در حال تولید...';
      })
      .addCase(generateProjectCitations.fulfilled, (state, action) => {
        state.generatedCitation = action.payload;
      })
      .addCase(generateProjectCitations.rejected, (state, action) => {
        state.generatedCitation = action.payload as string;
      });
  },
});
export const { clearSelectedProject } = projectSlice.actions;
export default projectSlice.reducer;
