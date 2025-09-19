import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import type { AppDispatch, RootState } from '../store';
import { Box, CircularProgress } from '@mui/material';
import { Navigate, Outlet } from 'react-router-dom';

const ProtectedRoute: React.FC = () => {
  const { user, isLoading } = useSelector((state: RootState) => state.auth);
  const dispatch = useDispatch<AppDispatch>();
  useEffect(() => {
    // Todo:
    // If we don't have a user and we're not loading (e.g., first time), check the status
    // isLoading is true by default, so this won't execute until the initial checkUserStatus is complete
    // But if the user state is lost, this will check it again
    // **Fix:** Checking should be done at the App level, not here.
    // **Better fix:** We set isLoading to true in authSlice. We need to dispatch it in App.tsx.
  }, []);

  if (isLoading) {
    return (
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          height: '100vh',
        }}
      >
        <CircularProgress />
      </Box>
    );
  }
  return user ? <Outlet /> : <Navigate to='/login' replace />;
};

export default ProtectedRoute;
