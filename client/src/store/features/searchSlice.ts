import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import apiClient from '../../api/axios';
import { extractErrorMessage } from '../../utils/errorHandler';

// Types
export interface SearchResult {
  notes: any[];
  sources: any[];
}

export interface SearchState {
  results: SearchResult | null;
  isLoading: boolean;
  error: string | null;
  query: string;
}

const initialState: SearchState = {
  results: null,
  isLoading: false,
  error: null,
  query: '',
};

// Async Thunk for semantic search
export const semanticSearch = createAsyncThunk(
  'search/semanticSearch',
  async (query: string, thunkAPI) => {
    try {
      const { data } = await apiClient.get(
        `/search?q=${encodeURIComponent(query)}`
      );
      console.log(data.data);

      return { results: data.data, query };
    } catch (error: unknown) {
      const message = extractErrorMessage(error, 'خطا در جستجوی معنایی');
      return thunkAPI.rejectWithValue(message);
    }
  }
);

// Search Slice
const searchSlice = createSlice({
  name: 'search',
  initialState,
  reducers: {
    clearSearchResults: (state) => {
      state.results = null;
      state.error = null;
      state.query = '';
    },
    clearSearchError: (state) => {
      state.error = null;
    },
    setQuery: (state, action) => {
      state.query = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(semanticSearch.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(semanticSearch.fulfilled, (state, action) => {
        state.isLoading = false;
        state.results = action.payload.results;
        state.query = action.payload.query;
        state.error = null;
      })
      .addCase(semanticSearch.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
        state.results = null;
      });
  },
});

export const { clearSearchResults, clearSearchError, setQuery } =
  searchSlice.actions;
export default searchSlice.reducer;
