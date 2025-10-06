import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';

import { fetchAllUserSources } from '../../store/features/sourceSlice';
import {
  Box,
  Typography,
  Button,
  CircularProgress,
  Alert,
  List,
  ListItem,
  ListItemText,
  ListItemAvatar,
  Card,
  CardContent,
  CardActions,
  CardActionArea,
  IconButton,
  Chip,
  Avatar,
  Fade,
  Slide,
  Container,
  Stack,
  Paper,
  Grid,
  Tooltip,
  alpha,
  ToggleButton,
  ToggleButtonGroup,
  Divider,
} from '@mui/material';
import {
  Add,
  ViewList,
  ViewModule,
  MenuBook,
  Article,
  School,
  CalendarToday,
  Person,
  Edit,
  RemoveRedEyeRounded,
  ArrowForward,
  LibraryBooks,
  Description,
  TrendingUp,
} from '@mui/icons-material';
import type { AppDispatch, RootState } from '../../store';

import {Link as ReactLink} from 'react-router-dom';
import AddSourceModal from "../../components/sources/AddSourceModal.tsx";

const SourcesLibraryPage: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const { sources, isLoading, error } = useSelector(
    (state: RootState) => state.sources
  );

  // State for view mode (list or card)
  const [viewMode, setViewMode] = useState<'list' | 'card'>('card');
    const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    dispatch(fetchAllUserSources());
  }, [dispatch]);
    // Handle modal close
    const handleCloseModal = () => {
        setIsModalOpen(false);
    };
  // Handle view mode change
  const handleViewModeChange = (
    _event: React.MouseEvent<HTMLElement>,
    newViewMode: 'list' | 'card' | null
  ) => {
    if (newViewMode !== null) {
      setViewMode(newViewMode);
    }
  };

  // Get source type icon
  const getSourceTypeIcon = (sourceType: string) => {
    switch (sourceType?.toLowerCase()) {
      case 'book':
        return <MenuBook />;
      case 'article':
        return <Article />;
      case 'journal':
        return <Description />;
      default:
        return <LibraryBooks />;
    }
  };

  // Get source type color
  const getSourceTypeColor = (sourceType: string) => {
    switch (sourceType?.toLowerCase()) {
      case 'book':
        return 'primary';
      case 'article':
        return 'secondary';
      case 'journal':
        return 'success';
      default:
        return 'primary';
    }
  };

  return (
    <Container maxWidth='xl' sx={{ py: 3 }}>
      {/* Modern Header Section */}
      <Fade in timeout={600}>
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
            position: 'relative',
            overflow: 'hidden',
            '&::before': {
              content: '""',
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              height: '1px',
              background: (theme) =>
                `linear-gradient(90deg, transparent, ${alpha(
                  theme.palette.primary.main,
                  0.3
                )}, transparent)`,
            },
          }}
        >
          <Stack
            direction={{ xs: 'column', sm: 'row' }}
            justifyContent='space-between'
            alignItems={{ xs: 'flex-start', sm: 'center' }}
            spacing={3}
          >
            <Box>
              <Stack
                direction='row'
                spacing={2}
                alignItems='center'
                sx={{ mb: 2 }}
              >
                <Avatar
                  sx={{
                    width: 56,
                    height: 56,
                    bgcolor: 'primary.main',
                    fontSize: '1.5rem',
                  }}
                >
                  <LibraryBooks />
                </Avatar>
                <Box>
                  <Typography
                    variant='h3'
                    component='h1'
                    fontWeight='bold'
                    sx={{ mb: 0.5 }}
                  >
                    کتابخانه منابع من
                  </Typography>
                  <Typography
                    variant='body1'
                    color='text.secondary'
                    sx={{ opacity: 0.8 }}
                  >
                    مدیریت و سازماندهی منابع تحقیقاتی شما
                  </Typography>
                </Box>
              </Stack>

              {/* Stats */}
              <Stack direction='row' spacing={2} flexWrap='wrap'>
                <Chip
                  icon={<LibraryBooks />}
                  label={`${sources.length} منبع`}
                  variant='outlined'
                  color='primary'
                />
                <Chip
                  icon={<TrendingUp />}
                  label='در حال مطالعه'
                  variant='outlined'
                  color='success'
                />
              </Stack>
            </Box>

            <Stack direction='row' spacing={2} alignItems='center'>
              {/* View Toggle */}
              <ToggleButtonGroup
                value={viewMode}
                exclusive
                onChange={handleViewModeChange}
                size='small'
                sx={{
                  borderRadius: 2,
                  border: (theme) =>
                    `1px solid ${alpha(theme.palette.divider, 0.2)}`,
                  '& .MuiToggleButton-root': {
                    borderRadius: 2,
                    border: 'none',
                    px: 2,
                    py: 1,
                    '&.Mui-selected': {
                      bgcolor: 'primary.main',
                      color: 'white',
                      '&:hover': {
                        bgcolor: 'primary.dark',
                      },
                    },
                  },
                }}
              >
                <ToggleButton value='card' aria-label='card view'>
                  <ViewModule fontSize='small' sx={{ mr: 1 }} />
                  کارت
                </ToggleButton>
                <ToggleButton value='list' aria-label='list view'>
                  <ViewList fontSize='small' sx={{ mr: 1 }} />
                  لیست
                </ToggleButton>
              </ToggleButtonGroup>

              <Button
                variant='contained'
                size='large'
                onClick={() => setIsModalOpen(true)}
                startIcon={<Add />}
                sx={{
                  borderRadius: 2,
                  px: 3,
                  py: 1.5,
                  textTransform: 'none',
                  fontWeight: 500,
                  boxShadow: (theme) =>
                    `0 4px 20px ${alpha(theme.palette.primary.main, 0.3)}`,
                  transition: 'all 0.3s ease',
                  '&:hover': {
                    transform: 'translateY(-2px)',
                    boxShadow: (theme) =>
                      `0 8px 30px ${alpha(theme.palette.primary.main, 0.4)}`,
                  },
                }}
              >
                افزودن منبع
              </Button>
            </Stack>
          </Stack>
        </Paper>
      </Fade>

      {/* Loading State */}
      {isLoading && (
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
          <Stack alignItems='center' spacing={3}>
            <CircularProgress
              size={60}
              thickness={4}
              sx={{
                color: 'primary.main',
                '& .MuiCircularProgress-circle': {
                  strokeLinecap: 'round',
                },
              }}
            />
            <Typography variant='h6' color='text.secondary'>
              در حال بارگذاری منابع...
            </Typography>
          </Stack>
        </Box>
      )}

      {/* Error State */}
      {error && (
        <Alert
          severity='error'
          sx={{
            mb: 3,
            borderRadius: 2,
            '& .MuiAlert-icon': {
              fontSize: '1.5rem',
            },
          }}
        >
          {error}
        </Alert>
      )}

      {/* Sources Display */}
      {!isLoading && !error && (
        <>
          {sources.length === 0 ? (
            // Empty State
            <Slide direction='up' in timeout={800}>
              <Paper
                elevation={0}
                sx={{
                  p: 8,
                  textAlign: 'center',
                  borderRadius: 3,
                  border: (theme) =>
                    `2px dashed ${alpha(theme.palette.divider, 0.3)}`,
                  bgcolor: (theme) => alpha(theme.palette.action.hover, 0.3),
                }}
              >
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
                <Typography variant='h5' fontWeight='600' gutterBottom>
                  هنوز منبعی اضافه نکرده‌اید
                </Typography>
                <Typography
                  variant='body1'
                  color='text.secondary'
                  sx={{ mb: 3 }}
                >
                  اولین منبع خود را اضافه کنید و شروع به مطالعه کنید
                </Typography>
                <Button
                  variant='contained'
                  startIcon={<Add />}
                  sx={{
                    borderRadius: 2,
                    px: 4,
                    py: 1.5,
                    textTransform: 'none',
                    fontWeight: 500,
                  }}
                >
                  افزودن اولین منبع
                </Button>
              </Paper>
            </Slide>
          ) : (
            // Sources Display
            <Slide direction='up' in timeout={800}>
              {viewMode === 'card' ? (
                // Card View - Academic Design
                <Grid container spacing={3}>
                  {sources.map((source, index) => (
                    <Grid
                      size={{ xs: 12, md: 6, lg: 4, xl: 3 }}
                      key={source._id}
                    >
                      <Fade in timeout={600 + index * 100}>
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
                                `0 8px 25px ${alpha(
                                  theme.palette.common.black,
                                  0.12
                                )}`,
                              borderColor: 'primary.main',
                            },
                          }}
                        >
                          <CardActionArea
                            sx={{
                              height: '100%',
                              display: 'flex',
                              flexDirection: 'column',
                            }}
                          >
                            <CardContent sx={{ flex: 1, p: 3 }}>
                              <Stack spacing={2.5}>
                                {/* Academic Header */}
                                <Stack
                                  direction='row'
                                  spacing={2}
                                  alignItems='flex-start'
                                >
                                  <Avatar
                                    sx={{
                                      width: 56,
                                      height: 56,
                                      bgcolor: `${getSourceTypeColor(
                                        source.type || 'default'
                                      )}.main`,
                                      fontSize: '1.4rem',
                                      boxShadow: (theme) => {
                                        const color = getSourceTypeColor(
                                          source.type || 'default'
                                        );
                                        return `0 4px 12px ${alpha(
                                          theme.palette[
                                            color as keyof typeof theme.palette
                                          ].main,
                                          0.3
                                        )}`;
                                      },
                                    }}
                                  >
                                    {getSourceTypeIcon(
                                      source.type || 'default'
                                    )}
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
                                <Stack
                                  direction='row'
                                  spacing={1}
                                  flexWrap='wrap'
                                >
                                  <Chip
                                    icon={
                                      <CalendarToday sx={{ fontSize: 16 }} />
                                    }
                                    label={source.year || 'بدون سال'}
                                    size='small'
                                    color='primary'
                                    variant='outlined'
                                    sx={{
                                      fontWeight: 500,
                                      borderRadius: 1,
                                    }}
                                  />
                                  {source.authors &&
                                    source.authors.length > 0 && (
                                      <Chip
                                        icon={<Person sx={{ fontSize: 16 }} />}
                                        label={source.authors[0].name}
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

                            <CardActions sx={{ p: 2.5, pt: 0 }}>
                              <Stack
                                direction='row'
                                spacing={1}
                                sx={{ width: '100%' }}
                              >
                                <Tooltip title='مشاهده منبع' >
                                  <IconButton
                                    size='small'
                                    component={ReactLink}
                                    to={`/app/library/${source._id}`}
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
                                    sx={{
                                      borderRadius: 1.5,
                                      border: '1px solid',
                                      borderColor: 'divider',
                                      px: 2,
                                      py: 1,
                                      '&:hover': {
                                        borderColor: 'primary.main',
                                        bgcolor: (theme) =>
                                          alpha(
                                            theme.palette.primary.main,
                                            0.05
                                          ),
                                        transform: 'scale(1.05)',
                                      },
                                    }}
                                  >
                                    <Edit fontSize='small' />
                                  </IconButton>
                                </Tooltip>

                                <Box sx={{ flex: 1 }} />

                                <ArrowForward
                                  sx={{
                                    fontSize: 18,
                                    color: 'text.secondary',
                                    opacity: 0.7,
                                  }}
                                />
                              </Stack>
                            </CardActions>
                          </CardActionArea>
                        </Card>
                      </Fade>
                    </Grid>
                  ))}
                </Grid>
              ) : (
                // List View - Academic Design
                <Paper
                  elevation={0}
                  sx={{
                    borderRadius: 2,
                    border: '1px solid',
                    borderColor: 'divider',
                    overflow: 'hidden',
                  }}
                >
                  <List sx={{ p: 0 }}>
                    {sources.map((source, index) => (
                      <React.Fragment key={source._id}>
                        <Fade in timeout={600 + index * 100}>
                          <ListItem
                            sx={{
                              py: 3,
                              px: 3,
                              transition: 'all 0.3s ease',
                              '&:hover': {
                                bgcolor: (theme) =>
                                  alpha(theme.palette.primary.main, 0.05),
                                transform: 'translateX(4px)',
                              },
                            }}
                          >
                            <ListItemAvatar>
                              <Avatar
                                sx={{
                                  width: 64,
                                  height: 64,
                                  bgcolor: `${getSourceTypeColor(
                                    source.type || 'default'
                                  )}.main`,
                                  fontSize: '1.5rem',
                                  boxShadow: (theme) => {
                                    const color = getSourceTypeColor(
                                      source.type || 'default'
                                    );
                                    return `0 4px 12px ${alpha(
                                      theme.palette[
                                        color as keyof typeof theme.palette
                                      ].main,
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
                                <Typography
                                  variant='h6'
                                  fontWeight='700'
                                  sx={{ mb: 1 }}
                                >
                                  {source.title}
                                </Typography>
                              }
                              secondary={
                                <Stack spacing={1.5}>
                                  <Typography
                                    variant='body2'
                                    color='text.secondary'
                                    sx={{ lineHeight: 1.6 }}
                                  >
                                    {source.title || 'بدون توضیحات'}
                                  </Typography>
                                  <Stack
                                    direction='row'
                                    spacing={1}
                                    alignItems='center'
                                  >
                                    <Chip
                                      icon={
                                        <CalendarToday sx={{ fontSize: 14 }} />
                                      }
                                      label={source.year || 'بدون سال'}
                                      size='small'
                                      color='primary'
                                      variant='outlined'
                                      sx={{
                                        fontWeight: 500,
                                        borderRadius: 1,
                                      }}
                                    />
                                    {source.authors &&
                                      source.authors.length > 0 && (
                                        <Chip
                                          icon={
                                            <Person sx={{ fontSize: 14 }} />
                                          }
                                          label={source.authors[0].name}
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
                                  </Stack>
                                </Stack>
                              }
                            />
                            <Stack
                              direction='row'
                              spacing={1}
                              alignItems='center'
                              sx={{ ml: 2 }}
                            >
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
                                      bgcolor: (theme) =>
                                        alpha(theme.palette.primary.main, 0.05),
                                      transform: 'scale(1.1)',
                                    },
                                  }}
                                >
                                  <Edit fontSize='small' />
                                </IconButton>
                              </Tooltip>
                            </Stack>
                          </ListItem>
                        </Fade>
                        {index < sources.length - 1 && (
                          <Divider sx={{ mx: 3 }} />
                        )}
                      </React.Fragment>
                    ))}
                  </List>
                </Paper>
              )}
            </Slide>
          )}
        </>
      )}
        <AddSourceModal
            open={isModalOpen}

            onClose={() => setIsModalOpen(false)}

        />
    </Container>
  );
};

export default SourcesLibraryPage;
