import { configureStore } from '@reduxjs/toolkit';
import authReducer from './features/authSlice';
import projectReducer from './features/projectSlice';
import sourceReducer from './features/sourceSlice';
import noteReducer from './features/noteSlice';
import profileReducer from './features/profileSlice';
import settingsReducer from './features/settingsSlice';

export const store = configureStore({
  reducer: {
    auth: authReducer,
    projects: projectReducer,
    sources: sourceReducer,
    notes: noteReducer,
    profile: profileReducer,
    settings: settingsReducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
