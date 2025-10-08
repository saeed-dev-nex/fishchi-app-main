import React from 'react';
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
}

export const SourceListItem: React.FC<SourceListItemProps> = ({
  source,
  isSelected,
  onSelect,
}) => {
  console.log('source', source);
  return (
    <ListItem
      sx={{
        borderRadius: 2,
        mb: 1,
        border: isSelected ? '2px solid' : '1px solid',
        borderColor: isSelected ? 'primary.main' : 'divider',
        bgcolor: isSelected
          ? (theme) => alpha(theme.palette.primary.main, 0.05)
          : 'transparent',
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
