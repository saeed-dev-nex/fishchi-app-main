import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import type {
  CreateNoteData,
  FetchNotesParams,
  INote,
  NoteState,
} from '../../types';
import apiClient from '../../api/axios';

const initialState: NoteState = {
  notes: [],
  isLoading: false,
  error: null,
};

// --------- Async Thunks ( Management API Requests ) ---------
// ---------- 1. Get Notes ----------
export const fetchNotes = createAsyncThunk(
  'note/fetchNotes',
  async ({ projectId, sourceId }: FetchNotesParams, thunkAPI) => {
    try {
      const params = new URLSearchParams({ projectId });
      if (sourceId) params.append('sourceId', sourceId);
      const { data } = await apiClient.get(`/notes?${params.toString()}`);
      return data.data as INote[];
    } catch (error: unknown) {
      const message =
        error instanceof Error
          ? error.response.data.message
          : 'An error occurred';
      return thunkAPI.rejectWithValue(message);
    }
  }
);
// ---------- 2. Create Note ----------
export const createNote = createAsyncThunk(
  'note/createNote',
  async (noteData: CreateNoteData, thunkAPI) => {
    try {
      const { data } = await apiClient.post('/notes', noteData);
      return data.data as INote;
    } catch (error: unknown) {
      const message =
        error instanceof Error ? error.message : 'An error occurred';
      return thunkAPI.rejectWithValue(message);
    }
  }
);

// ---------- 3. Delete Note ----------
export const deleteNote = createAsyncThunk(
  'note/deleteNote',
  async (noteId: string, thunkAPI) => {
    try {
      await apiClient.delete(`/notes/${noteId}`);
      return noteId;
    } catch (error: unknown) {
      const message =
        error instanceof Error ? error.message : 'An error occurred';
      return thunkAPI.rejectWithValue(message);
    }
  }
);

// ---- Create Slice ----
const noteSlice = createSlice({
  name: 'note',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    clearNotes: (state) => {
      state.notes = [];
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchNotes.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(fetchNotes.fulfilled, (state, action) => {
        state.isLoading = false;
        state.notes = action.payload;
      })
      .addCase(fetchNotes.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })
      .addCase(createNote.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(createNote.fulfilled, (state, action) => {
        state.isLoading = false;
        state.notes.unshift(action.payload);
      })
      .addCase(createNote.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })
      .addCase(deleteNote.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(deleteNote.fulfilled, (state, action) => {
        state.isLoading = false;
        state.notes = state.notes.filter((note) => note._id !== action.payload);
      })
      .addCase(deleteNote.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });
  },
});

export const { clearError, clearNotes } = noteSlice.actions;
export default noteSlice.reducer;
