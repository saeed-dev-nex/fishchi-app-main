// src/components/projects/ProjectSidebar.tsx
import React from 'react';
import { Paper, Typography, Stack, Button, Box, Chip } from '@mui/material';
import { Add, Edit, Share } from '@mui/icons-material';
import type { IProject } from '../../types';

interface ProjectSidebarProps {
  project: IProject;
  sourceCount: number;
  onAddSource: () => void;
  onEdit: () => void;
  onShare: () => void;
}

export const ProjectSidebar: React.FC<ProjectSidebarProps> = ({
  project,
  sourceCount,
  onAddSource,
  onEdit,
  onShare,
}) => {
  return (
    <Stack spacing={3}>
      {/* Quick Actions */}
      <Paper
        elevation={0}
        sx={{
          p: 3,
          borderRadius: 3,
          border: '1px solid',
          borderColor: 'divider',
        }}
      >
        <Typography variant='h6' fontWeight='700' gutterBottom>
          اقدامات سریع
        </Typography>
        <Stack spacing={2}>
          <Button
            variant='contained'
            startIcon={<Add />}
            onClick={onAddSource}
            fullWidth
          >
            افزودن منبع
          </Button>
          <Button
            variant='outlined'
            startIcon={<Edit />}
            onClick={onEdit}
            fullWidth
          >
            ویرایش پروژه
          </Button>
          <Button
            variant='outlined'
            startIcon={<Share />}
            onClick={onShare}
            fullWidth
          >
            اشتراک‌گذاری
          </Button>
        </Stack>
      </Paper>

      {/* Project Statistics */}
      <Paper
        elevation={0}
        sx={{
          p: 3,
          borderRadius: 3,
          border: '1px solid',
          borderColor: 'divider',
        }}
      >
        <Typography variant='h6' fontWeight='700' gutterBottom>
          آمار پروژه
        </Typography>
        <Stack spacing={2}>
          <Box
            sx={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
            }}
          >
            <Typography variant='body2' color='text.secondary'>
              تعداد منابع
            </Typography>
            <Typography variant='body2' fontWeight='500'>
              {sourceCount}
            </Typography>
          </Box>
          <Box
            sx={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
            }}
          >
            <Typography variant='body2' color='text.secondary'>
              وضعیت
            </Typography>
            <Chip
              label='فعال'
              color='success'
              size='small'
              sx={{ borderRadius: 1 }}
            />
          </Box>
          <Box
            sx={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
            }}
          >
            <Typography variant='body2' color='text.secondary'>
              تاریخ ایجاد
            </Typography>
            <Typography variant='body2' fontWeight='500'>
              {new Date(project.createdAt).toLocaleDateString('fa-IR')}
            </Typography>
          </Box>
        </Stack>
      </Paper>
    </Stack>
  );
};
