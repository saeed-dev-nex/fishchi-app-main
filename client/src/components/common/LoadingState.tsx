import React from 'react';
import { Box, Stack, CircularProgress, Typography } from '@mui/material';

interface LoadingStateProps {
  message?: string;
}

export const LoadingState: React.FC<LoadingStateProps> = ({
  message = 'در حال بارگذاری...',
}) => {
  return (
    <Box
      sx={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        minHeight: '60vh',
      }}
    >
      <Stack alignItems='center' spacing={3}>
        <CircularProgress
          size={60}
          thickness={4}
          sx={{
            color: 'primary.main',
            '& .MuiCircularProgress-circle': {
              strokeLinecap: 'round',
            },
          }}
        />
        <Typography variant='h6' color='text.secondary'>
          {message}
        </Typography>
      </Stack>
    </Box>
  );
};
