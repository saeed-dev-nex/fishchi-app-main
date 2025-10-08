import {
  createAsyncThunk,
  createSlice,
  type PayloadAction,
} from '@reduxjs/toolkit';
import type {
  CreateSourceData,
  ImportSourceByDoiData,
  ImportSourceByUrlData,
  ISource,
  SourceState,
} from '../../types';
import apiClient from '../../api/axios';
import {
  removeSourceFromProject,
  addExistingSourcesToProject,
} from './projectSlice';

// Create Initial State
const initialState: SourceState = {
  sources: [],
  sourcesByProject: [],
  selectedSource: null,
  isLoading: false,
  error: null,
};

// Thunk Functions
// ---------- 0. Get All User Sources ----------
export const fetchAllUserSources = createAsyncThunk(
  'source/fetchAllUserSources',
  async (_, thunkAPI) => {
    try {
      const { data } = await apiClient.get('/sources');
      return data.data as ISource[];
    } catch (error: unknown) {
      const message =
        error instanceof Error ? error.message : 'An error occurred';
      return thunkAPI.rejectWithValue(message);
    }
  }
);
// ---------- 1. Get Sources By Project --------
export const fetchSourcesByProject = createAsyncThunk(
  'source/fetchSources',
  async (projectId: string, { rejectWithValue }) => {
    try {
      const { data } = await apiClient.get(`/sources?projectId=${projectId}`);
      return data.data as ISource[];
    } catch (error: unknown) {
      const message =
        error instanceof Error ? error.message : 'An error occurred';
      return rejectWithValue(message);
    }
  }
);
// ---------- 2. Delete Source By ID --------
export const deleteSource = createAsyncThunk(
  'sources/deleteSource',
  async (sourceId: string, thunkAPI) => {
    try {
      await apiClient.delete(`/sources/${sourceId}`);
      return sourceId;
    } catch (error: unknown) {
      const message =
        error instanceof Error ? error.message : 'An error occurred';
      return thunkAPI.rejectWithValue(message);
    }
  }
);

// ---------- 3. Create Source ----------
export const createSource = createAsyncThunk(
  'sources/createSource',
  async (sourceData: CreateSourceData, thunkAPI) => {
    try {
      const { data } = await apiClient.post('/sources', sourceData);

      return data.data;
    } catch (error: unknown) {
      const message =
        error instanceof Error ? error.message : 'An error occurred';
      return thunkAPI.rejectWithValue(message);
    }
  }
);

// ---------- 4. Import Source By DOI LINK ----------
export const importSourceByDOI = createAsyncThunk(
  'sources/importDOI',
  async (importData: ImportSourceByDoiData, thunkAPI) => {
    try {
      const { data } = await apiClient.post('/sources/import-doi', importData);

      return data.data as ISource;
    } catch (error: unknown) {
      const message =
        error instanceof Error ? error.message : 'An error occurred';
      return thunkAPI.rejectWithValue(message);
    }
  }
);
// ---------- 5. Import Source By Link ----------
export const importSourceByUrl = createAsyncThunk(
  'sources/importUrl',
  async (importData: ImportSourceByUrlData, thunkAPI) => {
    try {
      const { data } = await apiClient.post('/sources/import-url', importData);
      return data.data as ISource;
    } catch (error: unknown) {
      const message =
        error instanceof Error ? error.message : 'An error occurred';
      return thunkAPI.rejectWithValue(message);
    }
  }
);
// ---------- 6. Get Source By ID ----------
export const fetchSourceById = createAsyncThunk(
  'sources/getSourceById',
  async (sourceId: string, thunkAPI) => {
    try {
      const { data } = await apiClient.get(`/sources/${sourceId}`);
      return data.data as ISource;
    } catch (error: unknown) {
      const message =
        error instanceof Error ? error.message : 'An error occurred';
      return thunkAPI.rejectWithValue(message);
    }
  }
);
// ---------- 7. Update Source By ID ----------
export const updateSourceById = createAsyncThunk(
  'sources/updateSourceById',
  async (sourceData: CreateSourceData, thunkAPI) => {
    console.log('sourceData:', sourceData);
    try {
      const { data } = await apiClient.put(
        `/sources/${sourceData._id}`,
        sourceData
      );
      return data.data as ISource;
    } catch (error: unknown) {
      const message =
        error instanceof Error ? error.message : 'An error occurred';
      return thunkAPI.rejectWithValue(message);
    }
  }
);
// create Slice
const sourceSlice = createSlice({
  name: 'source',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    clearSelectedSource: (state) => {
      state.selectedSource = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchSourcesByProject.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(fetchSourcesByProject.fulfilled, (state, action) => {
        state.isLoading = false;
        state.sourcesByProject = action.payload;
      })
      .addCase(fetchSourcesByProject.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })
      // --- Delete Source ---
      .addCase(deleteSource.pending, (state) => {
        state.isLoading = true; // می‌توانیم یک لودینگ مجزا برای حذف تعریف کنیم
      })
      .addCase(
        deleteSource.fulfilled,
        (state, action: PayloadAction<string>) => {
          state.isLoading = false;
          // منبع حذف شده را از لیست state فیلتر کن
          state.sources = state.sources.filter(
            (source) => source._id !== action.payload
          );
        }
      )
      .addCase(deleteSource.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })
      // --- Create Source ---
      .addCase(createSource.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(
        createSource.fulfilled,
        (state, action: PayloadAction<ISource>) => {
          state.isLoading = false;
          state.sources.unshift(action.payload);
          // Add to sourcesByProject if it's for a specific project
          if (action.payload.projectId) {
            state.sourcesByProject.unshift(action.payload);
          }
        }
      )
      .addCase(createSource.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })
      .addCase(importSourceByDOI.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(
        importSourceByDOI.fulfilled,
        (state, action: PayloadAction<ISource>) => {
          state.isLoading = false;
          state.sources.unshift(action.payload);
          // Add to sourcesByProject if it's for a specific project
          if (action.payload.projectId) {
            state.sourcesByProject.unshift(action.payload);
          }
        }
      )
      .addCase(importSourceByDOI.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })
      .addCase(importSourceByUrl.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(
        importSourceByUrl.fulfilled,
        (state, action: PayloadAction<ISource>) => {
          state.isLoading = false;
          state.sources.unshift(action.payload);
          // Add to sourcesByProject if it's for a specific project
          if (action.payload.projectId) {
            state.sourcesByProject.unshift(action.payload);
          }
        }
      )
      .addCase(importSourceByUrl.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })
      // Remove Source from Project
      .addCase(removeSourceFromProject.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(
        removeSourceFromProject.fulfilled,
        (state, action: PayloadAction<string>) => {
          state.isLoading = false;
          // Remove from sourcesByProject (this is what we need for the UI)
          state.sourcesByProject = state.sourcesByProject.filter(
            (source) => source._id !== action.payload
          );
          // Also remove from general sources list
          state.sources = state.sources.filter(
            (source) => source._id !== action.payload
          );
        }
      )
      .addCase(removeSourceFromProject.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })
      // --- Fetch All User Sources ---
      .addCase(fetchAllUserSources.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(fetchAllUserSources.fulfilled, (state, action) => {
        state.isLoading = false;
        state.sources = action.payload;
      })
      .addCase(fetchAllUserSources.rejected, (state, action) => {
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
          // Add the sources to sourcesByProject
          const addedSources = state.sources.filter((source) =>
            action.payload.includes(source._id)
          );
          // Add sources that are not already in sourcesByProject
          addedSources.forEach((source) => {
            const exists = state.sourcesByProject.some(
              (s) => s._id === source._id
            );
            if (!exists) {
              state.sourcesByProject.unshift(source);
            }
          });
        }
      )
      .addCase(addExistingSourcesToProject.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })
      // ----- Fetch Source By Id -----
      .addCase(fetchSourceById.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchSourceById.fulfilled, (state, action) => {
        state.isLoading = false;
        state.selectedSource = action.payload;
      })
      .addCase(fetchSourceById.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })
      // ----- Update Source By Id -----
      .addCase(updateSourceById.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(updateSourceById.fulfilled, (state, action) => {
        state.isLoading = false;
        state.selectedSource = action.payload;
      })
      .addCase(updateSourceById.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });
  },
});
export const { clearError, clearSelectedSource } = sourceSlice.actions;

export default sourceSlice.reducer;
