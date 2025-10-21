import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import type {
  CreateNoteData,
  FetchNotesParams,
  INote,
  NoteState,
  UpdateNoteData,
} from '../../types';
import apiClient from '../../api/axios';

const initialState: NoteState = {
  notes: [],
  summary: {
    noteId: null,
    content: null,
    isLoading: false,
    error: null,
  },
  suggestTags: {
    isLoading: false,
    tags: null,
    error: null,
  },
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
        error instanceof Error ? error.message : 'An error occurred';
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

// ---------- 4. Update Note ----------
export const updateNote = createAsyncThunk(
  'note/updateNote',
  async (noteData: UpdateNoteData, thunkAPI) => {
    try {
      const { id, ...updateFields } = noteData;
      const { data } = await apiClient.put(`/notes/${id}`, updateFields);
      return data.data as INote;
    } catch (error: unknown) {
      const message =
        error instanceof Error ? error.message : 'An error occurred';
      return thunkAPI.rejectWithValue(message);
    }
  }
);

// ---------- 5. Summarize Note ----------
export const summarizeNote = createAsyncThunk(
  'notes/summarizeNote',
  async (
    { noteId, htmlContent }: { noteId: string; htmlContent: string },
    { rejectWithValue }
  ) => {
    try {
      const { data } = await apiClient.post('/ai/summarize', { htmlContent });
      return { noteId, summary: data.data.summary };
    } catch (error: unknown) {
      const message =
        error instanceof Error ? error.message : 'An error occurred';
      return rejectWithValue(message);
    }
  }
);
// -------------- 6. Suggest Tags ---------
export const suggestTags = createAsyncThunk(
  'notes/suggestTags',
  async (
    textInput: { textContent?: string; htmlContent?: string },
    { rejectWithValue }
  ) => {
    try {
      const { data } = await apiClient.post('/ai/suggest-tags', textInput);
      return data.data.tags as string[]; // برگرداندن آرایه تگ‌ها
    } catch (error: unknown) {
      const message =
        error instanceof Error ? error.message : 'An error occurred';
      return rejectWithValue(message);
    }
  }
);

// ---------- 7. Proofread Note Content ----------
export const proofreadNoteContent = createAsyncThunk(
  'notes/proofreadNote',
  async (htmlContent: string, { rejectWithValue }) => {
    try {
      const { data } = await apiClient.post('/ai/proofread', { htmlContent });
      return data.data.correctedHtml as string; // Returns corrected HTML
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'خطای ویرایش');
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
    clearSummary: (state) => {
      state.summary = {
        noteId: null,
        content: null,
        isLoading: false,
        error: null,
      };
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
      })
      // --- Update Note ---
      .addCase(updateNote.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(updateNote.fulfilled, (state, action) => {
        state.isLoading = false;
        const index = state.notes.findIndex(
          (note) => note._id === action.payload._id
        );
        if (index !== -1) {
          state.notes[index] = action.payload;
        }
      })
      .addCase(updateNote.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })
      // --- Summarize Note ---
      .addCase(summarizeNote.pending, (state, action) => {
        state.summary.isLoading = true;
        state.summary.noteId = action.meta.arg.noteId;
        state.summary.content = null;
        state.summary.error = null;
      })
      .addCase(summarizeNote.fulfilled, (state, action) => {
        state.summary.isLoading = false;
        state.summary.content = action.payload.summary;
      })
      .addCase(summarizeNote.rejected, (state, action) => {
        state.summary.isLoading = false;
        state.summary.error = action.payload as string;
      })
      // suggestTags
      .addCase(suggestTags.pending, (state) => {
        state.suggestTags.isLoading = true;
      })
      .addCase(suggestTags.fulfilled, (state, actions) => {
        state.suggestTags.isLoading = false;
        state.suggestTags.tags = actions.payload.join(', ');
        state.suggestTags.error = null;
      })
      .addCase(suggestTags.rejected, (state, action) => {
        state.suggestTags.isLoading = false;
        state.suggestTags.tags = null;
        state.suggestTags.error = action.payload as string;
      });
  },
});

export const { clearError, clearNotes, clearSummary } = noteSlice.actions;
export default noteSlice.reducer;
