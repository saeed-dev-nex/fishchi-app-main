import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import type { AppDispatch, RootState } from '../../store';
import {
  deleteProject,
  fetchProjects,
} from '../../store/features/projectSlice';
import {
  Box,
  Typography,
  Button,
  CircularProgress,
  Alert,
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
  List,
  ListItem,
  ListItemText,
  ListItemAvatar,
  Divider,
} from '@mui/material';
import { Link as RouterLink } from 'react-router-dom';
import {
  RemoveRedEyeRounded,
  Add,
  FolderOpen,
  TrendingUp,
  Description,
  ViewList,
  ViewModule,
  School,
  Assignment,
  AccessTime,
  Delete,
} from '@mui/icons-material';
import CreateProjectModal from '../../components/projects/CreateProjectModal';
import ConfirmationDialog from '../../components/common/ConfirmationDialog';

const ProjectsPage: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const { projects, isLoading, error } = useSelector(
    (state: RootState) => state.projects
  );
  
  // State for new project modal
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isWarningDialogOpen, setIsWarningDialogOpen] = useState(false);
  const [selectedProjectId, setSelectedProjectId] = useState<string | null>(
    null
  );

  // State for view mode (list or card)
  const [viewMode, setViewMode] = useState<'list' | 'card'>('card');

  // در زمان بارگذاری صفحه، پروژه‌ها را واکشی کن
  useEffect(() => {
    dispatch(fetchProjects());
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

  const handleOpenWarningDialog = () => {
    setIsWarningDialogOpen(true);
  };
  const handleCloseWarningDialog = () => {
    setIsWarningDialogOpen(false);
  };
  const handleDeleteProject = (projectId: string) => {
    dispatch(deleteProject(projectId));
    handleCloseWarningDialog();
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
                  <FolderOpen />
                </Avatar>
                <Box>
                  <Typography
                    variant='h3'
                    component='h1'
                    fontWeight='bold'
                    sx={{ mb: 0.5 }}
                  >
                    پروژه‌های من
                  </Typography>
                  <Typography
                    variant='body1'
                    color='text.secondary'
                    sx={{ opacity: 0.8 }}
                  >
                    مدیریت و نظارت بر پروژه‌های شما
                  </Typography>
                </Box>
              </Stack>

              {/* Stats */}
              <Stack direction='row' spacing={2} flexWrap='wrap'>
                <Chip
                  icon={<Description />}
                  label={`${projects.length} پروژه`}
                  variant='outlined'
                  color='primary'
                />
                <Chip
                  icon={<TrendingUp />}
                  label='در حال پیشرفت'
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
                startIcon={<Add />}
                onClick={() => setIsModalOpen(true)}
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
                پروژه جدید
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
              در حال بارگذاری پروژه‌ها...
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

      {/* Projects Grid */}
      {!isLoading && !error && (
        <>
          {projects.length === 0 ? (
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
                  <FolderOpen sx={{ fontSize: 40 }} />
                </Avatar>
                <Typography variant='h5' fontWeight='600' gutterBottom>
                  هنوز پروژه‌ای ایجاد نکرده‌اید
                </Typography>
                <Typography
                  variant='body1'
                  color='text.secondary'
                  sx={{ mb: 3 }}
                >
                  اولین پروژه خود را ایجاد کنید و شروع به کار کنید
                </Typography>
                <Button
                  variant='contained'
                  startIcon={<Add />}
                  onClick={() => setIsModalOpen(true)}
                  sx={{
                    borderRadius: 2,
                    px: 4,
                    py: 1.5,
                    textTransform: 'none',
                    fontWeight: 500,
                  }}
                >
                  ایجاد اولین پروژه
                </Button>
              </Paper>
            </Slide>
          ) : (
            // Projects Display
            <Slide direction='up' in timeout={800}>
              {viewMode === 'card' ? (
                // Card View - Academic Design
                <Grid container spacing={3}>
                  {projects.map((project, index) => (
                    <Grid
                      size={{ xs: 12, md: 6, lg: 4, xl: 3 }}
                      key={project._id}
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
                            // component={Link}
                            // to={`/app/projects/${project._id}`}
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
                                      bgcolor: 'primary.main',
                                      fontSize: '1.4rem',
                                      boxShadow: (theme) =>
                                        `0 4px 12px ${alpha(
                                          theme.palette.primary.main,
                                          0.3
                                        )}`,
                                    }}
                                  >
                                    <School />
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
                                      {project.title}
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
                                      {project.description || 'بدون توضیحات'}
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
                                    icon={<Assignment sx={{ fontSize: 16 }} />}
                                    label='پروژه آکادمیک'
                                    size='small'
                                    color='primary'
                                    variant='outlined'
                                    sx={{
                                      fontWeight: 500,
                                      borderRadius: 1,
                                    }}
                                  />
                                  <Chip
                                    icon={<AccessTime sx={{ fontSize: 16 }} />}
                                    label='در حال انجام'
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
                            </CardContent>

                            <CardActions
                              sx={{
                                p: 2.5,
                                pt: 0,
                              }}
                            >
                              <Stack
                                direction='row'
                                spacing={1}
                                sx={{ width: '100%' }}
                              >
                                <Tooltip title='مشاهده پروژه'>
                                  <IconButton
                                    size='small'
                                    component={RouterLink}
                                    to={`/app/projects/${project._id}`}
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

                                <Tooltip title='حذف پروژه'>
                                  <IconButton
                                    onClick={() => {
                                      handleOpenWarningDialog();
                                      setSelectedProjectId(project._id);
                                    }}
                                    size='small'
                                    sx={{
                                      borderRadius: 1.5,
                                      border: '1px solid',
                                      borderColor: 'divider',
                                      px: 2,
                                      py: 1,
                                      '&:hover': {
                                        borderColor: 'error.main',
                                        bgcolor: (theme) =>
                                          alpha(theme.palette.error.main, 0.05),
                                        transform: 'scale(1.05)',
                                      },
                                    }}
                                  >
                                    <Delete
                                      fontSize='small'
                                      sx={{
                                        '&:hover': { color: 'error.main' },
                                      }}
                                    />
                                  </IconButton>
                                </Tooltip>

                                <Box sx={{ flex: 1 }} />
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
                    {projects.map((project, index) => (
                      <React.Fragment key={project._id}>
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
                                  bgcolor: 'primary.main',
                                  fontSize: '1.5rem',
                                  boxShadow: (theme) =>
                                    `0 4px 12px ${alpha(
                                      theme.palette.primary.main,
                                      0.3
                                    )}`,
                                }}
                              >
                                <School />
                              </Avatar>
                            </ListItemAvatar>
                            <ListItemText
                              primary={
                                <Typography
                                  variant='h6'
                                  fontWeight='700'
                                  sx={{ mb: 1 }}
                                  color='text.primary'
                                >
                                  {project.title}
                                </Typography>
                              }
                              secondary={
                                <Stack spacing={1.5}>
                                  <Typography
                                    variant='body2'
                                    color='text.secondary'
                                    sx={{ lineHeight: 1.6 }}
                                  >
                                    {project.description || 'بدون توضیحات'}
                                  </Typography>
                                  <Stack
                                    direction='row'
                                    spacing={1}
                                    alignItems='center'
                                  >
                                    <Chip
                                      icon={
                                        <Assignment sx={{ fontSize: 14 }} />
                                      }
                                      label='پروژه آکادمیک'
                                      size='small'
                                      color='primary'
                                      variant='outlined'
                                      sx={{
                                        fontWeight: 500,
                                        borderRadius: 1,
                                      }}
                                    />
                                    <Chip
                                      icon={
                                        <AccessTime sx={{ fontSize: 14 }} />
                                      }
                                      label='در حال انجام'
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
                              <Tooltip title='مشاهده پروژه'>
                                <IconButton
                                  size='small'
                                  component={RouterLink}
                                  to={`/app/projects/${project._id}`}
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
                              <Tooltip title='حذف پروژه'>
                                <IconButton
                                  size='small'
                                  onClick={() => {
                                    handleOpenWarningDialog();
                                    setSelectedProjectId(project._id);
                                  }}
                                  sx={{
                                    borderRadius: 1.5,
                                    border: '1px solid',
                                    borderColor: 'divider',
                                    '&:hover': {
                                      borderColor: 'error.main',
                                      bgcolor: (theme) =>
                                        alpha(theme.palette.error.main, 0.05),
                                      transform: 'scale(1.1)',
                                    },
                                  }}
                                >
                                  <Delete fontSize='small' />
                                </IconButton>
                              </Tooltip>
                            </Stack>
                          </ListItem>
                        </Fade>
                        {index < projects.length - 1 && (
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

      {/* Create Project Modal */}
      <CreateProjectModal onClose={handleCloseModal} open={isModalOpen} />
      <ConfirmationDialog
        open={isWarningDialogOpen}
        onClose={handleCloseWarningDialog}
        onConfirm={() => handleDeleteProject(selectedProjectId as string)}
        title='حذف پروژه'
        contentText='آیا مطمئن هستید که می خواهید این پروژه را حذف کنید؟'
      />
    </Container>
  );
};

export default ProjectsPage;
