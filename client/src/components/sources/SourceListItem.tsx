import React, { useEffect } from 'react';
import { Link as RouterLink } from 'react-router-dom';
import {
  ListItem,
  ListItemAvatar,
  Avatar,
  ListItemText,
  Typography,
  Stack,
  Checkbox,
  alpha,
} from '@mui/material';
import {
  Person,
  CalendarToday,
  Article,
  Book,
  School,
  Language,
} from '@mui/icons-material';
import type { ISource } from '../../types';
// import { getSourceTypeIcon, getSourceTypeColor } from '../../utils/sourceUtils';

const getSourceTypeIcon = (type: string) => {
  if (type === 'article') {
    return <Article />;
  } else if (type === 'book') {
    return <Book />;
  } else if (type === 'thesis') {
    return <School />;
  } else if (type === 'website') {
    return <Language />;
  } else {
    return <div />;
  }
};
const getSourceTypeColor = (type: string) => {
  if (type === 'article') {
    return 'primary';
  } else if (type === 'book') {
    return 'secondary';
  } else if (type === 'thesis') {
    return 'success';
  } else if (type === 'website') {
    return 'warning';
  } else {
    return 'primary';
  }
};
interface SourceListItemProps {
  source: ISource;
  isSelected: boolean;
  onSelect: (id: string) => void;
  onSelectSource: (id: string) => void;
  activeSourceId: string | null;
}

export const SourceListItem: React.FC<SourceListItemProps> = ({
  source,
  isSelected,
  onSelect,
  onSelectSource,
  activeSourceId,
}) => {
  const handleSelectSource = () => {
    if (activeSourceId === source._id) {
      onSelectSource(null);
    } else {
      onSelectSource(source._id);
    }
  };
  console.log('activeSourceId', activeSourceId);
  console.log('Source ID', source._id);
  return (
    <ListItem
      onClick={handleSelectSource}
      sx={{
        borderRadius: 3,
        mb: 2,
        border: isSelected ? '2px solid' : '1px solid',
        borderColor:
          isSelected || activeSourceId === source._id
            ? 'primary.main'
            : 'divider',
        bgcolor: isSelected
          ? (theme) => alpha(theme.palette.primary.main, 0.08)
          : (theme) => alpha(theme.palette.background.paper, 0.6),
        backdropFilter: 'blur(10px)',
        transition: 'all 0.3s ease',
        cursor: 'pointer',
        '&:hover': {
          borderColor: 'primary.main',
          bgcolor: (theme) => alpha(theme.palette.primary.main, 0.05),
          transform: 'translateY(-2px)',
          boxShadow: (theme) =>
            `0 4px 20px ${alpha(theme.palette.common.black, 0.1)}`,
        },
      }}
    >
      <ListItemAvatar>
        <Avatar
          sx={{
            bgcolor: `${getSourceTypeColor(source.type || 'default')}.main`,
          }}
        >
          {getSourceTypeIcon(source.type)}
        </Avatar>
      </ListItemAvatar>
      <ListItemText
        primary={
          <Typography
            component={RouterLink}
            to={`/app/library/${source._id}`}
            variant='h6'
            color='text.primary'
            sx={{ textDecoration: 'none' }}
          >
            {source.title}
          </Typography>
        }
        secondary={
          <Stack direction='row' spacing={2} alignItems='center' sx={{ mt: 1 }}>
            {source.authors?.[0] && (
              <Stack direction='row' alignItems='center' spacing={0.5}>
                <Person sx={{ fontSize: 14, color: 'text.secondary' }} />
                <Typography variant='body2' color='text.secondary'>
                  {source.authors[0].name}
                </Typography>
              </Stack>
            )}
            {source.year && (
              <Stack direction='row' alignItems='center' spacing={0.5}>
                <CalendarToday sx={{ fontSize: 14, color: 'text.secondary' }} />
                <Typography variant='body2' color='text.secondary'>
                  {source.year}
                </Typography>
              </Stack>
            )}
          </Stack>
        }
      />
      <Checkbox
        checked={isSelected}
        onChange={() => onSelect(source._id)}
        sx={{ ml: 2 }}
      />
    </ListItem>
  );
};
