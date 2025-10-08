import React from 'react';
import { Container, Alert } from '@mui/material';

interface ErrorStateProps {
  message: string;
}

export const ErrorState: React.FC<ErrorStateProps> = ({ message }) => {
  return (
    <Container maxWidth='md' sx={{ mt: 4 }}>
      <Alert
        severity='error'
        sx={{
          borderRadius: 2,
          '& .MuiAlert-icon': {
            fontSize: '1.5rem',
          },
        }}
      >
        {message}
      </Alert>
    </Container>
  );
};
