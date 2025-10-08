import React from 'react';
import { Link as RouterLink } from 'react-router-dom';
import {
  Container,
  Paper,
  Avatar,
  Typography,
  Button,
  alpha,
} from '@mui/material';
import { FolderOpen, ArrowBack } from '@mui/icons-material';

interface NotFoundStateProps {
  message: string;
  backText: string;
  backLink: string;
}

export const NotFoundState: React.FC<NotFoundStateProps> = ({
  message,
  backText,
  backLink,
}) => {
  return (
    <Container maxWidth='md' sx={{ mt: 4 }}>
      <Paper
        sx={{
          p: 4,
          textAlign: 'center',
          borderRadius: 2,
          border: (theme) => `2px dashed ${alpha(theme.palette.divider, 0.3)}`,
        }}
      >
        <Avatar
          sx={{
            width: 80,
            height: 80,
            bgcolor: 'action.disabled',
            mx: 'auto',
            mb: 3,
          }}
        >
          <FolderOpen sx={{ fontSize: 40 }} />
        </Avatar>
        <Typography variant='h5' fontWeight='600' gutterBottom>
          {message}
        </Typography>
        <Button
          variant='contained'
          startIcon={<ArrowBack />}
          component={RouterLink}
          to={backLink}
        >
          {backText}
        </Button>
      </Paper>
    </Container>
  );
};
