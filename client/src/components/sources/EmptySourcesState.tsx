import React from 'react';
import { Box, Typography, Button, Avatar } from '@mui/material';
import { LibraryBooks, Add } from '@mui/icons-material';

interface EmptySourcesStateProps {
  onAddSource: () => void;
}

export const EmptySourcesState: React.FC<EmptySourcesStateProps> = ({
  onAddSource,
}) => {
  return (
    <Box sx={{ textAlign: 'center', py: 8, px: 4 }}>
      <Avatar
        sx={{
          width: 80,
          height: 80,
          bgcolor: 'action.disabled',
          mx: 'auto',
          mb: 3,
        }}
      >
        <LibraryBooks sx={{ fontSize: 40 }} />
      </Avatar>
      <Typography variant='h6' fontWeight='600' gutterBottom>
        هیچ منبعی یافت نشد
      </Typography>
      <Typography variant='body2' color='text.secondary' sx={{ mb: 3 }}>
        اولین منبع خود را به این پروژه اضافه کنید
      </Typography>
      <Button variant='contained' startIcon={<Add />} onClick={onAddSource}>
        افزودن منبع
      </Button>
    </Box>
  );
};
