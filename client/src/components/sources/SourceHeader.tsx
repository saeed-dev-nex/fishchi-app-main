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
  Shortcut,
  Edit,
  Share,
  Download,
  Print,
  Bookmark,
  BookmarkBorder,
  Visibility,
  VisibilityOff,
  Delete,
  School,
  CalendarToday,
  Person,
} from '@mui/icons-material';
import { getSourceTypeIcon, getSourceTypeColor } from '../../utils/sourceUtils';
import type { ISource } from '../../types';

interface SourceHeaderProps {
  source: ISource;
  isBookmarked: boolean;
  isVisible: boolean;
  onEdit: () => void;
  onShare: () => void;
  onDownload: () => void;
  onPrint: () => void;
  onBookmark: () => void;
  onToggleVisibility: () => void;
  onDelete: () => void;
}

export const SourceHeader: React.FC<SourceHeaderProps> = ({
  source,
  isBookmarked,
  isVisible,
  onEdit,
  onShare,
  onDownload,
  onPrint,
  onBookmark,
  onToggleVisibility,
  onDelete,
}) => {
  const sourceType = source.type || 'default';
  const color = getSourceTypeColor(sourceType);

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
      }}
    >
      <Button
        variant='outlined'
        startIcon={<Shortcut />}
        component={RouterLink}
        to='/app/library'
        className='no-print'
        sx={{ mb: 3 }}
      >
        بازگشت به کتابخانه
      </Button>
      <Stack direction='row' spacing={3} alignItems='flex-start'>
        <Avatar sx={{ width: 80, height: 80, bgcolor: `${color}.main` }}>
          {getSourceTypeIcon(sourceType)}
        </Avatar>
        <Box sx={{ flex: 1 }}>
          <Typography variant='h3' component='h1' fontWeight='bold'>
            {source.title}
          </Typography>
          <Stack direction='row' spacing={2} flexWrap='wrap' sx={{ my: 2 }}>
            <Chip
              icon={<School />}
              label={source.type || 'منبع'}
              color={getSourceTypeColor(source.type || 'default')}
            />
            {source.year && (
              <Chip icon={<CalendarToday />} label={`سال: ${source.year}`} />
            )}
            {source.authors?.[0] && (
              <Chip
                icon={<Person />}
                label={`نویسنده: ${source.authors[0].name}`}
              />
            )}
          </Stack>
          <Stack
            direction='row'
            spacing={1}
            flexWrap='wrap'
            className='no-print'
          >
            <Tooltip title='ویرایش'>
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
            <Tooltip title='نشان کردن'>
              <IconButton onClick={onBookmark}>
                {isBookmarked ? <Bookmark /> : <BookmarkBorder />}
              </IconButton>
            </Tooltip>
            <Tooltip title='نمایش/مخفی'>
              <IconButton onClick={onToggleVisibility}>
                {isVisible ? <Visibility /> : <VisibilityOff />}
              </IconButton>
            </Tooltip>
            <Tooltip title='حذف'>
              <IconButton onClick={onDelete} color='error'>
                <Delete />
              </IconButton>
            </Tooltip>
          </Stack>
        </Box>
      </Stack>
    </Paper>
  );
};
