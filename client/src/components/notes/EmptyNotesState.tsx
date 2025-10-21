import React from 'react';
import { Box, Typography, Avatar, Button, alpha } from '@mui/material';
import {
  Description as DescriptionIcon,
  Add as AddIcon,
} from '@mui/icons-material';

interface EmptyNotesStateProps {
  onAddClick: () => void;
}

const EmptyNotesState: React.FC<EmptyNotesStateProps> = ({ onAddClick }) => {
  return (
    <Box
      sx={{
        flex: 1,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        textAlign: 'center',
        p: 4,
      }}
    >
      <Avatar
        sx={{
          width: 80,
          height: 80,
          bgcolor: (theme) => alpha(theme.palette.secondary.main, 0.1),
          mb: 3,
        }}
      >
        <DescriptionIcon sx={{ fontSize: 40, color: 'secondary.main' }} />
      </Avatar>
      <Typography variant='h6' fontWeight='600' gutterBottom>
        هیچ فیشی ثبت نشده
      </Typography>
      <Typography variant='body2' color='text.secondary' sx={{ mb: 3 }}>
        اولین فیش را برای این منبع بنویسید
      </Typography>
      <Button
        variant='contained'
        startIcon={<AddIcon />}
        onClick={onAddClick}
        sx={{ borderRadius: 2 }}
      >
        افزودن فیش
      </Button>
    </Box>
  );
};

export default EmptyNotesState;
