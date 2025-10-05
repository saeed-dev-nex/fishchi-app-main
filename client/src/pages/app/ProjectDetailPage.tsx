import React, { useEffect, useState } from 'react';
import { Link as RouterLink, useParams } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';

import {
  fetchProjectById,
  clearSelectedProject,
  removeSourceFromProject,
} from '../../store/features/projectSlice';
import { fetchSourcesByProject } from '../../store/features/sourceSlice';
import {
  Box,
  Typography,
  Button,
  CircularProgress,
  Alert,
  Grid,
  Card,
  CardContent,
  CardActionArea,
  List,
  ListItem,
  ListItemText,
  ListItemButton,
  Checkbox,
  Toolbar,
  Tooltip,
  ToggleButton,
  ToggleButtonGroup,
  Paper,
  Chip,
  Avatar,
  Fade,
  Slide,
  Container,
  Stack,
  alpha,
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import DeleteIcon from '@mui/icons-material/Delete';
import ViewListIcon from '@mui/icons-material/ViewList';
import ViewModuleIcon from '@mui/icons-material/ViewModule';
import FolderIcon from '@mui/icons-material/Folder';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';
import DescriptionIcon from '@mui/icons-material/Description';
import ConfirmationDialog from '../../components/common/ConfirmationDialog';
import type { AppDispatch, RootState } from '../../store';
import AddSourceModal from '../../components/sources/AddSourceModal';
import { ArrowBack, ArrowBackIos, Shortcut } from '@mui/icons-material';

const ProjectDetailPage: React.FC = () => {
  const { id: projectId } = useParams<{ id: string }>();
  const dispatch = useDispatch<AppDispatch>();

  // State های محلی برای مدیریت UI
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [selected, setSelected] = useState<string[]>([]);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isAddSourceModalOpen, setIsAddSourceModalOpen] = useState(false);
  // واکشی داده‌ها از Redux
  const {
    selectedProject,
    isLoading: projectLoading,
    error: projectError,
  } = useSelector((state: RootState) => state.projects);
  const {
    sources,
    isLoading: sourcesLoading,
    error: sourcesError,
  } = useSelector((state: RootState) => state.sources);

  useEffect(() => {
    if (projectId) {
      dispatch(fetchProjectById(projectId));
      dispatch(fetchSourcesByProject(projectId));
    }
    return () => {
      dispatch(clearSelectedProject());
    };
  }, [projectId, dispatch]);

  // --- Handlers ---
  const handleViewChange = (
    event: React.MouseEvent<HTMLElement>,
    newView: 'grid' | 'list' | null
  ) => {
    if (newView !== null) setViewMode(newView);
  };

  const handleSelect = (sourceId: string) => {
    const selectedIndex = selected.indexOf(sourceId);
    let newSelected: string[] = [];
    if (selectedIndex === -1) {
      newSelected = newSelected.concat(selected, sourceId);
    } else {
      newSelected = selected.filter((id) => id !== sourceId);
    }
    setSelected(newSelected);
  };

  const handleSelectAll = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.checked) {
      const newSelecteds = sources.map((s) => s._id);
      setSelected(newSelecteds);
      return;
    }
    setSelected([]);
  };

  const handleConfirmRemove = async () => {
    if (!projectId) return;
    // برای هر آیتم انتخاب شده، thunk حذف را dispatch کن
    await Promise.all(
      selected.map((sourceId) =>
        dispatch(removeSourceFromProject({ projectId, sourceId }))
      )
    );
    setSelected([]); // پاک کردن لیست انتخاب شده‌ها
    setIsDialogOpen(false); // بستن دیالوگ
  };

  // --- Render Logic ---
  if (projectLoading) {
    return (
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          minHeight: '60vh',
        }}
      >
        <CircularProgress size={60} />
      </Box>
    );
  }

  if (projectError) {
    return (
      <Container maxWidth='md' sx={{ mt: 4 }}>
        <Alert severity='error' sx={{ borderRadius: 2 }}>
          {projectError}
        </Alert>
      </Container>
    );
  }

  if (!selectedProject) {
    return (
      <Container maxWidth='md' sx={{ mt: 4 }}>
        <Paper sx={{ p: 4, textAlign: 'center', borderRadius: 2 }}>
          <Typography variant='h6' color='text.secondary'>
            پروژه یافت نشد
          </Typography>
        </Paper>
      </Container>
    );
  }

  const isSelected = (id: string) => selected.indexOf(id) !== -1;
  const numSelected = selected.length;
  const rowCount = sources.length;

  return (
    <Container maxWidth='xl' sx={{ py: 3 }}>
      {/* Project Header */}
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
          }}
        >
          <Button
            variant='outlined'
            startIcon={<Shortcut />}
            component={RouterLink}
            to='/app/projects'
            sx={{ mb: 3, borderRadius: 2, fontWeight: 500 }}
          >
            بازگشت به پروژه‌ها
          </Button>
          <Stack direction='row' spacing={3} alignItems='flex-start'>
            <Avatar
              sx={{
                width: 64,
                height: 64,
                bgcolor: 'primary.main',
                fontSize: '1.5rem',
              }}
            >
              <FolderIcon />
            </Avatar>
            <Box sx={{ flex: 1 }}>
              <Typography variant='h3' fontWeight='bold' gutterBottom>
                {selectedProject.title}
              </Typography>
              <Typography
                variant='body1'
                color='text.secondary'
                sx={{ mb: 2, lineHeight: 1.6 }}
              >
                {selectedProject.description}
              </Typography>
              <Stack direction='row' spacing={2} flexWrap='wrap'>
                <Chip
                  icon={<DescriptionIcon />}
                  label={`${sources.length} منبع`}
                  variant='outlined'
                  color='primary'
                />
                <Chip
                  icon={<CalendarTodayIcon />}
                  label='پروژه فعال'
                  variant='outlined'
                  color='success'
                />
              </Stack>
            </Box>
          </Stack>
        </Paper>
      </Fade>

      {/* Sources Section */}
      <Slide direction='up' in timeout={800}>
        <Paper
          elevation={0}
          sx={{
            borderRadius: 3,
            border: (theme) => `1px solid ${alpha(theme.palette.divider, 0.1)}`,
            overflow: 'hidden',
          }}
        >
          {/* Enhanced Toolbar */}
          <Toolbar
            sx={{
              px: 3,
              py: 2,
              background: (theme) =>
                numSelected > 0
                  ? alpha(theme.palette.primary.main, 0.08)
                  : 'transparent',
              borderBottom: (theme) =>
                `1px solid ${alpha(theme.palette.divider, 0.1)}`,
              transition: 'all 0.3s ease',
            }}
          >
            <Box sx={{ flex: 1 }}>
              {numSelected > 0 ? (
                <Stack direction='row' spacing={2} alignItems='center'>
                  <Typography
                    variant='h6'
                    color='primary.main'
                    fontWeight='600'
                  >
                    {numSelected} مورد انتخاب شده
                  </Typography>
                  <Chip
                    label={`${numSelected} از ${rowCount}`}
                    size='small'
                    color='primary'
                    variant='outlined'
                  />
                </Stack>
              ) : (
                <Typography variant='h5' fontWeight='600'>
                  منابع پروژه
                </Typography>
              )}
            </Box>

            <Stack direction='row' spacing={1} alignItems='center'>
              {numSelected > 0 ? (
                <>
                  <Tooltip title='حذف منابع انتخاب شده'>
                    <Button
                      variant='outlined'
                      color='error'
                      startIcon={<DeleteIcon />}
                      onClick={() => setIsDialogOpen(true)}
                      sx={{
                        borderRadius: 2,
                        textTransform: 'none',
                        fontWeight: 500,
                      }}
                    >
                      حذف
                    </Button>
                  </Tooltip>
                </>
              ) : (
                <>
                  <ToggleButtonGroup
                    value={viewMode}
                    exclusive
                    onChange={handleViewChange}
                    size='small'
                    sx={{
                      borderRadius: 2,
                      '& .MuiToggleButton-root': {
                        borderRadius: 2,
                        border: 'none',
                        px: 2,
                      },
                    }}
                  >
                    <ToggleButton value='list'>
                      <ViewListIcon />
                    </ToggleButton>
                    <ToggleButton value='grid'>
                      <ViewModuleIcon />
                    </ToggleButton>
                  </ToggleButtonGroup>
                  <Button
                    variant='contained'
                    startIcon={<AddIcon />}
                    onClick={() => setIsAddSourceModalOpen(true)}
                    sx={{
                      borderRadius: 2,
                      textTransform: 'none',
                      fontWeight: 500,
                      px: 3,
                      py: 1,
                    }}
                  >
                    افزودن منبع
                  </Button>
                </>
              )}
            </Stack>
          </Toolbar>

          {/* Select All Checkbox */}
          {numSelected > 0 && (
            <Box sx={{ px: 3, py: 1, bgcolor: 'action.hover' }}>
              <Stack direction='row' alignItems='center' spacing={2}>
                <Checkbox
                  color='primary'
                  indeterminate={numSelected > 0 && numSelected < rowCount}
                  checked={rowCount > 0 && numSelected === rowCount}
                  onChange={handleSelectAll}
                />
                <Typography variant='body2' color='text.secondary'>
                  انتخاب همه منابع
                </Typography>
              </Stack>
            </Box>
          )}

          {/* Content Area */}
          <Box sx={{ p: 3 }}>
            {sourcesLoading && (
              <Box
                sx={{
                  display: 'flex',
                  justifyContent: 'center',
                  py: 8,
                }}
              >
                <CircularProgress size={40} />
              </Box>
            )}

            {sourcesError && (
              <Alert severity='error' sx={{ borderRadius: 2, mb: 2 }}>
                {sourcesError}
              </Alert>
            )}

            {!sourcesLoading && !sourcesError && (
              <>
                {viewMode === 'grid' ? (
                  <Grid container spacing={3}>
                    {sources.map((source, index) => {
                      const isItemSelected = isSelected(source._id);
                      return (
                        <Grid
                          size={{
                            xs: 12,
                            sm: 6,
                            md: 4,
                            lg: 3,
                          }}
                          key={source._id}
                        >
                          <Fade in timeout={600 + index * 100}>
                            <Card
                              sx={{
                                position: 'relative',
                                borderRadius: 3,
                                border: isItemSelected
                                  ? '2px solid'
                                  : '1px solid',
                                borderColor: isItemSelected
                                  ? 'primary.main'
                                  : 'divider',
                                transition: 'all 0.3s ease',
                                '&:hover': {
                                  transform: 'translateY(-4px)',
                                  boxShadow: (theme) =>
                                    `0 8px 25px ${alpha(
                                      theme.palette.common.black,
                                      0.15
                                    )}`,
                                  borderColor: 'primary.main',
                                },
                                ...(isItemSelected && {
                                  bgcolor: (theme) =>
                                    alpha(theme.palette.primary.main, 0.05),
                                }),
                              }}
                            >
                              <CardActionArea
                                onClick={() => handleSelect(source._id)}
                                sx={{ p: 0 }}
                              >
                                <Box
                                  sx={{
                                    position: 'absolute',
                                    top: 12,
                                    right: 12,
                                    zIndex: 1,
                                  }}
                                >
                                  <Checkbox
                                    checked={isItemSelected}
                                    onChange={() => handleSelect(source._id)}
                                    sx={{
                                      bgcolor: 'background.paper',
                                      borderRadius: '50%',
                                      '&:hover': {
                                        bgcolor: 'background.paper',
                                      },
                                    }}
                                  />
                                </Box>
                                <CardContent sx={{ p: 3, pt: 4 }}>
                                  <Stack spacing={2}>
                                    <Typography
                                      variant='h6'
                                      fontWeight='600'
                                      sx={{
                                        overflow: 'hidden',
                                        textOverflow: 'ellipsis',
                                        display: '-webkit-box',
                                        WebkitLineClamp: 2,
                                        WebkitBoxOrient: 'vertical',
                                        lineHeight: 1.3,
                                      }}
                                    >
                                      {source.title}
                                    </Typography>
                                    <Stack
                                      direction='row'
                                      spacing={1}
                                      alignItems='center'
                                    >
                                      <CalendarTodayIcon
                                        sx={{
                                          fontSize: 16,
                                          color: 'text.secondary',
                                        }}
                                      />
                                      <Typography
                                        variant='body2'
                                        color='text.secondary'
                                      >
                                        {source.year || 'بدون تاریخ'}
                                      </Typography>
                                    </Stack>
                                  </Stack>
                                </CardContent>
                              </CardActionArea>
                            </Card>
                          </Fade>
                        </Grid>
                      );
                    })}
                  </Grid>
                ) : (
                  <List sx={{ p: 0 }}>
                    {sources.map((source, index) => {
                      const isItemSelected = isSelected(source._id);
                      return (
                        <Fade in timeout={600 + index * 100} key={source._id}>
                          <ListItem
                            sx={{
                              p: 0,
                              mb: 1,
                              borderRadius: 2,
                              border: isItemSelected
                                ? '2px solid'
                                : '1px solid',
                              borderColor: isItemSelected
                                ? 'primary.main'
                                : 'divider',
                              bgcolor: isItemSelected
                                ? (theme) =>
                                    alpha(theme.palette.primary.main, 0.05)
                                : 'background.paper',
                              transition: 'all 0.3s ease',
                              '&:hover': {
                                borderColor: 'primary.main',
                                bgcolor: (theme) =>
                                  alpha(theme.palette.primary.main, 0.05),
                              },
                            }}
                          >
                            <ListItemButton
                              onClick={() => handleSelect(source._id)}
                              sx={{ borderRadius: 2, py: 2 }}
                            >
                              <ListItemText
                                primary={
                                  <Typography variant='h6' fontWeight='500'>
                                    {source.title}
                                  </Typography>
                                }
                                secondary={
                                  <Stack
                                    direction='row'
                                    spacing={1}
                                    alignItems='center'
                                    sx={{ mt: 1 }}
                                  >
                                    <CalendarTodayIcon
                                      sx={{
                                        fontSize: 16,
                                        color: 'text.secondary',
                                      }}
                                    />
                                    <Typography
                                      variant='body2'
                                      color='text.secondary'
                                    >
                                      {source.year || 'بدون تاریخ'}
                                    </Typography>
                                  </Stack>
                                }
                              />
                              <Checkbox
                                checked={isItemSelected}
                                onChange={() => handleSelect(source._id)}
                                sx={{ ml: 2 }}
                              />
                            </ListItemButton>
                          </ListItem>
                        </Fade>
                      );
                    })}
                  </List>
                )}
              </>
            )}
          </Box>
        </Paper>
      </Slide>

      {/* Confirmation Dialog */}
      <ConfirmationDialog
        open={isDialogOpen}
        onClose={() => setIsDialogOpen(false)}
        onConfirm={handleConfirmRemove}
        title='حذف منابع از پروژه'
        contentText={`آیا از حذف ${numSelected} منبع انتخاب شده از این پروژه اطمینان دارید؟ (منابع از کتابخانه کلی شما حذف نخواهند شد)`}
      />

      {/* Add Source Modal */}
      {projectId && (
        <AddSourceModal
          open={isAddSourceModalOpen}
          onClose={() => setIsAddSourceModalOpen(false)}
          projectId={projectId}
        />
      )}
    </Container>
  );
};

export default ProjectDetailPage;
