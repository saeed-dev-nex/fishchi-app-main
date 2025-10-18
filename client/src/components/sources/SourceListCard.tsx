import {
  alpha,
  Avatar,
  Box,
  Chip,
  IconButton,
  ListItem,
  ListItemAvatar,
  ListItemText,
  Stack,
  Tooltip,
  Typography,
} from '@mui/material';
import { getSourceTypeColor, getSourceTypeIcon } from '../../utils/sourceUtils';
import {
  CalendarToday,
  Delete,
  Edit,
  Person,
  RemoveRedEyeRounded,
  School,
} from '@mui/icons-material';
import type { ISource } from '../../types';

export default function SourceListCard({
  source,
  handleDeleteSource,
}: {
  source: ISource;
  handleDeleteSource: (sourceId: ISource) => void;
}) {
  return (
    <Box sx={{ opacity: 1 }}>
      <ListItem
        sx={{
          py: 3,
          px: 3,
          transition: 'all 0.3s ease',
          '&:hover': {
            bgcolor: (theme) => alpha(theme.palette.primary.main, 0.05),
            transform: 'translateX(4px)',
          },
        }}
      >
        <ListItemAvatar>
          <Avatar
            sx={{
              width: 64,
              height: 64,
              bgcolor: (theme) => {
                const color = getSourceTypeColor(source.type || 'default');
                const colorPalette =
                  theme.palette[color as keyof typeof theme.palette];
                return typeof colorPalette === 'object' &&
                  'main' in colorPalette
                  ? (colorPalette as { main: string }).main
                  : theme.palette.primary.main;
              },
              fontSize: '1.5rem',
              boxShadow: (theme) => {
                const color = getSourceTypeColor(source.type || 'default');
                const colorPalette =
                  theme.palette[color as keyof typeof theme.palette];
                return `0 4px 12px ${alpha(
                  typeof colorPalette === 'object' && 'main' in colorPalette
                    ? colorPalette.main
                    : theme.palette.primary.main,
                  0.3
                )}`;
              },
            }}
          >
            {getSourceTypeIcon(source.type || 'default')}
          </Avatar>
        </ListItemAvatar>
        <ListItemText
          primary={
            <Typography variant='h6' fontWeight='700' sx={{ mb: 1 }}>
              {source.title}
            </Typography>
          }
          secondary={
            <Box>
              <Typography
                variant='body2'
                color='text.secondary'
                sx={{ lineHeight: 1.6, mb: 1 }}
              >
                {source.title || 'بدون توضیحات'}
              </Typography>
              <Box
                sx={{
                  display: 'flex',
                  gap: 1,
                  flexWrap: 'wrap',
                }}
              >
                <Chip
                  icon={<CalendarToday sx={{ fontSize: 14 }} />}
                  label={source.year || 'بدون سال'}
                  size='small'
                  color='primary'
                  variant='outlined'
                  sx={{
                    fontWeight: 500,
                    borderRadius: 1,
                  }}
                />
                {source.authors && source.authors.length > 0 && (
                  <Chip
                    icon={<Person sx={{ fontSize: 14 }} />}
                    label={`${source.authors[0].firstname} ${
                      source.authors[0].lastname || ''
                    }`.trim()}
                    size='small'
                    color='secondary'
                    variant='outlined'
                    sx={{
                      fontWeight: 500,
                      borderRadius: 1,
                    }}
                  />
                )}
                <Chip
                  icon={<School sx={{ fontSize: 14 }} />}
                  label={source.type || 'منبع'}
                  size='small'
                  color='success'
                  variant='outlined'
                  sx={{
                    fontWeight: 500,
                    borderRadius: 1,
                  }}
                />
              </Box>
            </Box>
          }
        />
        <Stack direction='row' spacing={1} alignItems='center' sx={{ ml: 2 }}>
          <Tooltip title='مشاهده منبع'>
            <IconButton
              size='small'
              sx={{
                borderRadius: 1.5,
                bgcolor: 'primary.main',
                color: 'white',
                '&:hover': {
                  bgcolor: 'primary.dark',
                  transform: 'scale(1.1)',
                },
              }}
            >
              <RemoveRedEyeRounded fontSize='small' />
            </IconButton>
          </Tooltip>
          <Tooltip title='ویرایش منبع'>
            <IconButton
              size='small'
              sx={{
                borderRadius: 1.5,
                border: '1px solid',
                borderColor: 'divider',
                '&:hover': {
                  borderColor: 'primary.main',
                  bgcolor: (theme) => alpha(theme.palette.primary.main, 0.05),
                  transform: 'scale(1.1)',
                },
              }}
            >
              <Edit fontSize='small' />
            </IconButton>
          </Tooltip>
          <Tooltip title='حذف منبع'>
            <IconButton
              size='small'
              onClick={() => handleDeleteSource(source)}
              sx={{
                borderRadius: 1.5,
                border: '1px solid',
                borderColor: 'divider',
                '&:hover': {
                  borderColor: 'error.main',
                  bgcolor: (theme) => alpha(theme.palette.error.main, 0.05),
                  transform: 'scale(1.1)',
                },
              }}
            >
              <Delete fontSize='small' />
            </IconButton>
          </Tooltip>
        </Stack>
      </ListItem>
    </Box>
  );
}
