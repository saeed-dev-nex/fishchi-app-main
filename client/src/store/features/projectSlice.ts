import {
  createAsyncThunk,
  createSlice,
  type PayloadAction,
} from '@reduxjs/toolkit';
import type {
  CreateProjectData,
  IProject,
  IProjectState,
  IProjectStatistics,
} from '../../types';
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

// ------------------ Update Project Status ------------------
export const updateProjectStatus = createAsyncThunk(
  'projects/updateProjectStatus',
  async (
    { projectId, status }: { projectId: string; status: string },
    thunkAPI
  ) => {
    try {
      const { data } = await apiClient.put(`/projects/${projectId}/status`, {
        status,
      });
      return data.data as IProject;
    } catch (error: any) {
      const message =
        error.response?.data?.message || error.message || error.toString();
      return thunkAPI.rejectWithValue(message);
    }
  }
);

// ------------------ Update Project Progress ------------------
export const updateProjectProgress = createAsyncThunk(
  'projects/updateProjectProgress',
  async (
    { projectId, progress }: { projectId: string; progress: number },
    thunkAPI
  ) => {
    try {
      const { data } = await apiClient.put(`/projects/${projectId}/progress`, {
        progress,
      });
      return data.data as IProject;
    } catch (error: any) {
      const message =
        error.response?.data?.message || error.message || error.toString();
      return thunkAPI.rejectWithValue(message);
    }
  }
);

// ------------------ Calculate Project Progress ------------------
export const calculateProjectProgress = createAsyncThunk(
  'projects/calculateProjectProgress',
  async (projectId: string, thunkAPI) => {
    try {
      const { data } = await apiClient.post(
        `/projects/${projectId}/calculate-progress`
      );
      return data.data;
    } catch (error: any) {
      const message =
        error.response?.data?.message || error.message || error.toString();
      return thunkAPI.rejectWithValue(message);
    }
  }
);

// ------------------ Get Project Statistics ------------------
export const getProjectStatistics = createAsyncThunk(
  'projects/getProjectStatistics',
  async (projectId: string, thunkAPI) => {
    try {
      const { data } = await apiClient.get(`/projects/${projectId}/statistics`);
      return data.data as IProjectStatistics;
    } catch (error: any) {
      const message =
        error.response?.data?.message || error.message || error.toString();
      return thunkAPI.rejectWithValue(message);
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
      })
      // --- Update Project Status ---
      .addCase(updateProjectStatus.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(
        updateProjectStatus.fulfilled,
        (state, action: PayloadAction<IProject>) => {
          state.isLoading = false;
          const index = state.projects.findIndex(
            (project) => project._id === action.payload._id
          );
          if (index !== -1) {
            state.projects[index] = action.payload;
          }
          if (
            state.selectedProject &&
            state.selectedProject._id === action.payload._id
          ) {
            state.selectedProject = action.payload;
          }
        }
      )
      .addCase(updateProjectStatus.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })
      // --- Update Project Progress ---
      .addCase(updateProjectProgress.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(
        updateProjectProgress.fulfilled,
        (state, action: PayloadAction<IProject>) => {
          state.isLoading = false;
          const index = state.projects.findIndex(
            (project) => project._id === action.payload._id
          );
          if (index !== -1) {
            state.projects[index] = action.payload;
          }
          if (
            state.selectedProject &&
            state.selectedProject._id === action.payload._id
          ) {
            state.selectedProject = action.payload;
          }
        }
      )
      .addCase(updateProjectProgress.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })
      // --- Calculate Project Progress ---
      .addCase(calculateProjectProgress.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(calculateProjectProgress.fulfilled, (state, action) => {
        state.isLoading = false;
        const { project } = action.payload;
        const index = state.projects.findIndex((p) => p._id === project._id);
        if (index !== -1) {
          state.projects[index] = project;
        }
        if (
          state.selectedProject &&
          state.selectedProject._id === project._id
        ) {
          state.selectedProject = project;
        }
      })
      .addCase(calculateProjectProgress.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });
  },
});
export const { clearSelectedProject } = projectSlice.actions;
export default projectSlice.reducer;
