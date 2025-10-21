import React from 'react';
import { Box, Typography, Stack, Chip, Button, alpha } from '@mui/material';
import { Add as AddIcon } from '@mui/icons-material';

interface NotesHeaderProps {
  notesCount: number;
  onAddClick: () => void;
}

const NotesHeader: React.FC<NotesHeaderProps> = ({
  notesCount,
  onAddClick,
}) => {
  return (
    <Box
      sx={{
        p: 3,
        borderBottom: (theme) => `1px solid ${alpha(theme.palette.divider, 0.1)}`,
        background: (theme) =>
          `linear-gradient(90deg, ${alpha(
            theme.palette.secondary.main,
            0.05
          )} 0%, transparent 100%)`,
      }}
    >
      <Stack
        direction='row'
        justifyContent='space-between'
        alignItems='center'
        sx={{ mb: 2 }}
      >
        <Typography variant='h6' fontWeight='600' color='secondary'>
          فیش‌های پژوهشی
        </Typography>
        <Stack direction='row' spacing={1} alignItems='center'>
          <Chip
            label={`${notesCount} فیش`}
            size='small'
            color='secondary'
            variant='outlined'
          />
          <Button
            variant='contained'
            size='small'
            startIcon={<AddIcon />}
            onClick={onAddClick}
            sx={{
              borderRadius: 2,
              textTransform: 'none',
              fontWeight: 500,
              px: 2,
            }}
          >
            فیش جدید
          </Button>
        </Stack>
      </Stack>
    </Box>
  );
};

export default NotesHeader;
