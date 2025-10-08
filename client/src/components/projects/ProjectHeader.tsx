import React from 'react';
import { Link as RouterLink } from 'react-router-dom';
import {
  Paper,
  Typography,
  Button,
  Stack,
  Avatar,
  Chip,
  Box,
  alpha,
  IconButton,
  Tooltip,
} from '@mui/material';
import {
  FolderOpen,
  CalendarToday,
  Description,
  Tag,
  Shortcut,
  Edit,
  Share,
  Download,
  Print,
  Bookmark,
  BookmarkBorder,
  Visibility,
  VisibilityOff,
} from '@mui/icons-material';
import type { IProject } from '../../types';

// تعریف Props برای کامپوننت
interface ProjectHeaderProps {
  project: IProject;
  sourceCount: number;
  isBookmarked: boolean;
  isVisible: boolean;
  onEdit: () => void;
  onShare: () => void;
  onDownload: () => void;
  onPrint: () => void;
  onBookmark: () => void;
  onToggleVisibility: () => void;
}

export const ProjectHeader: React.FC<ProjectHeaderProps> = ({
  project,
  sourceCount,
  isBookmarked,
  isVisible,
  onEdit,
  onShare,
  onDownload,
  onPrint,
  onBookmark,
  onToggleVisibility,
}) => {
  return (
    <Paper
      elevation={0}
      sx={{
        p: 4,
        mb: 4,
        borderRadius: 3,
        background: (theme) =>
          `linear-gradient(135deg, ${alpha(
            theme.palette.primary.main,
            0.05
          )} 0%, ${alpha(theme.palette.secondary.main, 0.05)} 100%)`,
        border: (theme) => `1px solid ${alpha(theme.palette.divider, 0.1)}`,
      }}
    >
      <Button
        variant='outlined'
        startIcon={<Shortcut />}
        component={RouterLink}
        to='/app/projects'
        className='no-print'
        sx={{ mb: 3 }}
      >
        بازگشت به پروژه‌ها
      </Button>
      <Stack direction='row' spacing={3} alignItems='flex-start'>
        <Avatar
          sx={{
            width: 80,
            height: 80,
            bgcolor: 'primary.main',
            fontSize: '2rem',
          }}
        >
          <FolderOpen />
        </Avatar>
        <Box sx={{ flex: 1 }}>
          <Typography
            variant='h3'
            component='h1'
            fontWeight='bold'
            sx={{ mb: 1 }}
          >
            {project.title}
          </Typography>
          <Stack direction='row' spacing={2} flexWrap='wrap' sx={{ mb: 2 }}>
            <Chip
              icon={<CalendarToday />}
              label={`ایجاد شده: ${new Date(
                project.createdAt
              ).toLocaleDateString('fa-IR')}`}
            />
            <Chip icon={<Description />} label={`${sourceCount} منبع`} />
            {project?.tags && project.tags?.length > 0 && (
              <Chip icon={<Tag />} label={`${project.tags.length} برچسب`} />
            )}
          </Stack>
          <Stack
            direction='row'
            spacing={1}
            flexWrap='wrap'
            className='no-print'
          >
            <Tooltip title='ویرایش پروژه'>
              <IconButton onClick={onEdit}>
                <Edit />
              </IconButton>
            </Tooltip>
            <Tooltip title='اشتراک‌گذاری'>
              <IconButton onClick={onShare}>
                <Share />
              </IconButton>
            </Tooltip>
            <Tooltip title='دانلود'>
              <IconButton onClick={onDownload}>
                <Download />
              </IconButton>
            </Tooltip>
            <Tooltip title='چاپ'>
              <IconButton onClick={onPrint}>
                <Print />
              </IconButton>
            </Tooltip>
            <Tooltip
              title={isBookmarked ? 'حذف از نشان‌ها' : 'افزودن به نشان‌ها'}
            >
              <IconButton onClick={onBookmark}>
                {isBookmarked ? <Bookmark /> : <BookmarkBorder />}
              </IconButton>
            </Tooltip>
            <Tooltip title={isVisible ? 'مخفی کردن' : 'نمایش'}>
              <IconButton onClick={onToggleVisibility}>
                {isVisible ? <Visibility /> : <VisibilityOff />}
              </IconButton>
            </Tooltip>
          </Stack>
        </Box>
      </Stack>
    </Paper>
  );
};
