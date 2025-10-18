import {
  alpha,
  Avatar,
  Box,
  Card,
  CardActionArea,
  CardContent,
  Chip,
  IconButton,
  Stack,
  Tooltip,
  Typography,
} from '@mui/material';
import { Link as ReactLink } from 'react-router-dom';
import type { ISource } from '../../types';
import { getSourceTypeColor, getSourceTypeIcon } from '../../utils/sourceUtils';
import {
  ArrowForward,
  CalendarToday,
  Delete,
  Edit,
  Person,
  RemoveRedEyeRounded,
} from '@mui/icons-material';

export default function SourceGridCard({
  source,
  handleDeleteSource,
}: {
  source: ISource;
  handleDeleteSource: (source: ISource) => void;
}) {
  // const theme = useTheme();
  return (
    <Card
      sx={{
        height: '100%',
        borderRadius: 2,
        border: '1px solid',
        borderColor: 'divider',
        transition: 'all 0.3s ease',
        boxShadow: 'none',
        '&:hover': {
          transform: 'translateY(-4px)',
          boxShadow: (theme) =>
            `0 8px 25px ${alpha(theme.palette.common.black, 0.12)}`,
          borderColor: 'primary.main',
        },
      }}
    >
      <CardActionArea
        component={ReactLink}
        to={`/app/library/${source._id}`}
        sx={{
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
        }}
      >
        <CardContent sx={{ flex: 1, p: 3 }}>
          <Stack spacing={2.5}>
            {/* Academic Header */}
            <Stack direction='row' spacing={2} alignItems='flex-start'>
              <Avatar
                sx={{
                  width: 56,
                  height: 56,
                  bgcolor: (theme) => {
                    const color = getSourceTypeColor(source.type || 'default');
                    const colorPalette =
                      theme.palette[color as keyof typeof theme.palette];
                    return typeof colorPalette === 'object' &&
                      'main' in colorPalette
                      ? colorPalette.main
                      : theme.palette.primary.main;
                  },
                  fontSize: '1.4rem',
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
              <Box sx={{ flex: 1, minWidth: 0 }}>
                <Typography
                  variant='h6'
                  fontWeight='700'
                  sx={{
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    display: '-webkit-box',
                    WebkitLineClamp: 2,
                    WebkitBoxOrient: 'vertical',
                    lineHeight: 1.3,
                    mb: 1,
                    color: 'text.primary',
                  }}
                >
                  {source.title}
                </Typography>
                <Typography
                  variant='body2'
                  color='text.secondary'
                  sx={{
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    display: '-webkit-box',
                    WebkitLineClamp: 3,
                    WebkitBoxOrient: 'vertical',
                    lineHeight: 1.5,
                    fontSize: '0.875rem',
                  }}
                >
                  {source.title || 'بدون توضیحات'}
                </Typography>
              </Box>
            </Stack>

            {/* Academic Stats */}
            <Stack direction='row' spacing={1} flexWrap='wrap'>
              <Chip
                icon={<CalendarToday sx={{ fontSize: 16 }} />}
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
                  icon={<Person sx={{ fontSize: 16 }} />}
                  label={
                    source.authors[0].firstname +
                      ' ' +
                      source.authors[0].lastname || ''
                  }
                  size='small'
                  color='secondary'
                  variant='outlined'
                  sx={{
                    fontWeight: 500,
                    borderRadius: 1,
                  }}
                />
              )}
            </Stack>
          </Stack>
        </CardContent>

        <Box sx={{ p: 2.5, pt: 0 }}>
          <Stack direction='row' spacing={1} sx={{ width: '100%' }}>
            <Box sx={{ flex: 1 }} />

            <ArrowForward
              sx={{
                fontSize: 18,
                color: 'text.secondary',
                opacity: 0.7,
              }}
            />
          </Stack>
        </Box>
      </CardActionArea>

      {/* Action buttons positioned absolutely to avoid nested button issue */}
      <Box sx={{ position: 'absolute', top: 12, right: 12 }}>
        <Stack direction='row' spacing={1}>
          <Tooltip title='مشاهده منبع'>
            <IconButton
              size='small'
              component={ReactLink}
              to={`/app/library/${source._id}`}
              onClick={(e) => e.stopPropagation()}
              sx={{
                borderRadius: 1.5,
                bgcolor: 'primary.main',
                color: 'white',
                px: 2,
                py: 1,
                fontWeight: 500,
                '&:hover': {
                  bgcolor: 'primary.dark',
                  transform: 'scale(1.05)',
                },
              }}
            >
              <RemoveRedEyeRounded fontSize='small' />
            </IconButton>
          </Tooltip>

          <Tooltip title='ویرایش منبع'>
            <IconButton
              size='small'
              onClick={(e) => {
                e.stopPropagation();
                // Add edit functionality here
              }}
              sx={{
                borderRadius: 1.5,
                border: '1px solid',
                borderColor: 'divider',
                px: 2,
                py: 1,
                '&:hover': {
                  borderColor: 'primary.main',
                  bgcolor: (theme) => alpha(theme.palette.primary.main, 0.05),
                  transform: 'scale(1.05)',
                },
              }}
            >
              <Edit fontSize='small' />
            </IconButton>
          </Tooltip>

          <Tooltip title='حذف منبع'>
            <IconButton
              size='small'
              onClick={(e) => {
                e.stopPropagation();
                handleDeleteSource(source);
              }}
              sx={{
                borderRadius: 1.5,
                border: '1px solid',
                borderColor: 'divider',
                px: 2,
                py: 1,
                '&:hover': {
                  borderColor: 'error.main',
                  bgcolor: (theme) => alpha(theme.palette.error.main, 0.05),
                  transform: 'scale(1.05)',
                },
              }}
            >
              <Delete fontSize='small' />
            </IconButton>
          </Tooltip>
        </Stack>
      </Box>
    </Card>
  );
}
