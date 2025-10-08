import React from 'react';
import { Box, Paper, Typography, Stack, Divider, Chip } from '@mui/material';
import { Tag } from '@mui/icons-material';
import type { IProject } from '../../types';

interface ProjectDetailsProps {
  project: IProject;
}

export const ProjectDetails: React.FC<ProjectDetailsProps> = ({ project }) => {
  return (
    <Paper
      elevation={0}
      sx={{
        p: 4,
        borderRadius: 3,
        border: '1px solid',
        borderColor: 'divider',
      }}
    >
      <Typography variant='h5' fontWeight='700' gutterBottom>
        جزئیات پروژه
      </Typography>
      <Divider sx={{ mb: 3 }} />

      <Stack spacing={3}>
        {/* Title */}
        <Box>
          <Typography variant='h6' fontWeight='600' gutterBottom>
            عنوان پروژه
          </Typography>
          <Typography variant='body1' color='text.secondary'>
            {project.title}
          </Typography>
        </Box>

        {/* Description */}
        {project.description && (
          <Box>
            <Typography variant='h6' fontWeight='600' gutterBottom>
              توضیحات
            </Typography>
            <Typography variant='body1' color='text.secondary'>
              {project.description}
            </Typography>
          </Box>
        )}

        {/* Created Date */}
        <Box>
          <Typography variant='h6' fontWeight='600' gutterBottom>
            تاریخ ایجاد
          </Typography>
          <Typography variant='body1' color='text.secondary'>
            {new Date(project.createdAt).toLocaleDateString('fa-IR')}
          </Typography>
        </Box>

        {/* Tags */}
        {project.tags && project.tags.length > 0 && (
          <Box>
            <Typography variant='h6' fontWeight='600' gutterBottom>
              برچسب‌ها
            </Typography>
            <Stack direction='row' spacing={1} flexWrap='wrap'>
              {project.tags.map((tag: string, index: number) => (
                <Chip
                  key={index}
                  icon={<Tag />}
                  label={tag}
                  variant='outlined'
                  sx={{ borderRadius: 1 }}
                />
              ))}
            </Stack>
          </Box>
        )}
      </Stack>
    </Paper>
  );
};
