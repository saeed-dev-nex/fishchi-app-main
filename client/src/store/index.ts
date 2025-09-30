import { configureStore } from '@reduxjs/toolkit';
import authReducer from './features/authSlice';
import projectReducer from './features/projectSlice';
import sourceReducer from './features/sourceSlice';

export const store = configureStore({
  reducer: {
    auth: authReducer,
    projects: projectReducer,
    sources: sourceReducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
