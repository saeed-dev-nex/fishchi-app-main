import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';

// --- Material-UI Imports ---
import {
  Container,
  Grid,
  Fade,
  Slide,
  Snackbar,
  Alert,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
  Stack,
  Typography,
  Box,
  Paper,
  Avatar,
  Chip,
  ToggleButtonGroup,
  ToggleButton,
  CircularProgress,
  alpha,
} from '@mui/material';
import {
  Add as AddIcon,
  ViewList as ViewListIcon,
  ViewModule as ViewModuleIcon,
  Description as DescriptionIcon,
  ArrowBackIos,
} from '@mui/icons-material';

// --- Redux Imports ---
import type { AppDispatch, RootState } from '../../store';
import {
  fetchProjectById,
  clearSelectedProject,
  removeSourceFromProject,
  updateProject,
} from '../../store/features/projectSlice';
import {
  clearSourcesByProject,
  fetchSourcesByProject,
} from '../../store/features/sourceSlice';
import {
  clearError,
  clearNotes,
  fetchNotes,
} from '../../store/features/noteSlice';

// --- Import reusable components ---
import { LoadingState } from '../../components/common/LoadingState';
import { ErrorState } from '../../components/common/ErrorState';
import { NotFoundState } from '../../components/common/NotFoundState';
import { ProjectHeader } from '../../components/projects/ProjectHeader';
import { ProjectDetails } from '../../components/projects/ProjectDetails';
import { ProjectSidebar } from '../../components/projects/ProjectSidebar';
import { SourcesSection } from '../../components/sources/SourcesSection';

// --- Import Modal and Dialog components ---
import ConfirmationDialog from '../../components/common/ConfirmationDialog';
import AddSourceModal from '../../components/sources/AddSourceModal';
import NoteWorkspace from '../../components/notes/NoteWorkspace';
import ProjectCitationModal from '../../components/projects/ProjectCitationModal';

//======================================================================
// Main Project Detail Page component
//======================================================================
const ProjectDetailPage: React.FC = () => {
  const { id: projectId } = useParams<{ id: string }>();
  const dispatch = useDispatch<AppDispatch>();

  //-----------------------------------------------------
  // Section 1: Local state for managing UI
  //-----------------------------------------------------
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [selectedSources, setSelectedSources] = useState<string[]>([]);
  const [isBookmarked, setIsBookmarked] = useState(false);
  const [isVisible, setIsVisible] = useState(true);
  // for saving active source id
  const [activeSourceId, setActiveSourceId] = useState<string | null>(null);
  const [citationModalOpen, setCitationModalOpen] = useState(false);
  // State for managing the open/close state of dialogs
  const [dialogs, setDialogs] = useState({
    deleteConfirmation: false,
    addSource: false,
    editProject: false,
    shareProject: false,
  });

  // State for the snackbar (notification messages)
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'success' as 'success' | 'error' | 'info' | 'warning',
  });

  // State for the edit project form
  const [editForm, setEditForm] = useState({
    title: '',
    description: '',
    tags: [] as string[],
  });

  //-----------------------------------------------------
  // Section 2: Fetch data from Redux Store
  //-----------------------------------------------------
  const {
    selectedProject,
    isLoading: projectLoading,
    error: projectError,
  } = useSelector((state: RootState) => state.projects);

  const {
    sourcesByProject = [],
    isLoading: sourcesLoading,
    error: sourcesError,
  } = useSelector((state: RootState) => state.sources);

  //-----------------------------------------------------
  // Section 3: Lifecycle management with useEffect
  //-----------------------------------------------------
  // Fetch project and sources data when the component loads
  useEffect(() => {
    if (projectId) {
      dispatch(fetchProjectById(projectId));
      dispatch(fetchSourcesByProject(projectId));
    }
    // Cleanup function: runs when leaving the page
    return () => {
      dispatch(clearSelectedProject());
      dispatch(clearSourcesByProject());
      dispatch(clearNotes());
    };
  }, [projectId, dispatch]);

  useEffect(() => {
    if (selectedSources) {
      dispatch(clearError());
    }
  }, [selectedSources]);

  // Fill the edit form and read the statuses from LocalStorage after loading the project
  useEffect(() => {
    if (selectedProject) {
      setEditForm({
        title: selectedProject.title || '',
        description: selectedProject.description || '',
        tags: selectedProject.tags || [],
      });

      const bookmarkKey = `project_bookmark_${selectedProject._id}`;
      const visibilityKey = `project_visibility_${selectedProject._id}`;
      setIsBookmarked(localStorage.getItem(bookmarkKey) === 'true');
      setIsVisible(localStorage.getItem(visibilityKey) !== 'false');
    }
  }, [selectedProject]);

  // Fetch Notes when change active source
  useEffect(() => {
    if (projectId && activeSourceId) {
      dispatch(fetchNotes({ projectId, sourceId: activeSourceId }));
    } else {
      dispatch(clearNotes()); // اگر منبعی انتخاب نشده، لیست فیش‌ها را پاک کن
    }
  }, [activeSourceId, projectId, dispatch]);

  //-----------------------------------------------------
  // Section 4: Event management functions (Event Handlers)
  //-----------------------------------------------------

  // --- Handlers related to the sources list ---
  const handleViewChange = (newView: 'grid' | 'list') => {
    setViewMode(newView);
  };

  const handleSelectSource = (sourceId: string) => {
    const selectedIndex = selectedSources.indexOf(sourceId);
    let newSelected: string[] = [];
    if (selectedIndex === -1) {
      newSelected = newSelected.concat(selectedSources, sourceId);
    } else {
      newSelected = selectedSources.filter((id) => id !== sourceId);
    }
    setSelectedSources(newSelected);
  };

  const handleSelectAllSources = (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    if (event.target.checked) {
      const allSourceIds = sourcesByProject?.map((s) => s._id) || [];
      setSelectedSources(allSourceIds);
      return;
    }
    setSelectedSources([]);
  };

  const handleConfirmRemoveSources = async () => {
    if (!projectId) return;
    await Promise.all(
      selectedSources.map((sourceId) =>
        dispatch(removeSourceFromProject({ projectId, sourceId }))
      )
    );
    setSelectedSources([]);
    setDialogs((prev) => ({ ...prev, deleteConfirmation: false }));
    dispatch(fetchSourcesByProject(projectId)); // Refresh the sources list
    setSnackbar({
      open: true,
      message: 'منابع با موفقیت از پروژه حذف شدند',
      severity: 'success',
    });
  };

  // --- Handlers related to the project operations ---
  const handleDownload = () => {
    if (!selectedProject) return;
    const content = `پروژه: ${selectedProject.title}\nتوضیحات: ${
      selectedProject.description || 'ندارد'
    }\nمنابع: ${sourcesByProject?.length || 0} عدد`;
    const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${selectedProject.title.replace(
      /[^a-zA-Z0-9]/g,
      '_'
    )}.txt`;
    link.click();
    URL.revokeObjectURL(url);
    setSnackbar({
      open: true,
      message: 'پروژه با موفقیت دانلود شد',
      severity: 'success',
    });
  };

  const handlePrint = () => window.print();

  const handleBookmark = () => {
    if (!selectedProject) return;
    const newBookmarkState = !isBookmarked;
    setIsBookmarked(newBookmarkState);
    localStorage.setItem(
      `project_bookmark_${selectedProject._id}`,
      String(newBookmarkState)
    );
    setSnackbar({
      open: true,
      message: newBookmarkState ? 'به نشان‌ها اضافه شد' : 'از نشان‌ها حذف شد',
      severity: 'info',
    });
  };

  const handleToggleVisibility = () => {
    if (!selectedProject) return;
    const newVisibilityState = !isVisible;
    setIsVisible(newVisibilityState);
    localStorage.setItem(
      `project_visibility_${selectedProject._id}`,
      String(newVisibilityState)
    );
    setSnackbar({
      open: true,
      message: newVisibilityState ? 'پروژه نمایش داده شد' : 'پروژه مخفی شد',
      severity: 'info',
    });
  };

  const handleSaveEdit = async () => {
    if (!selectedProject) return;
    try {
      await dispatch(
        updateProject({ _id: selectedProject._id, ...editForm })
      ).unwrap();
      setSnackbar({
        open: true,
        message: 'پروژه با موفقیت بروزرسانی شد',
        severity: 'success',
      });
      setDialogs((prev) => ({ ...prev, editProject: false }));
      dispatch(fetchProjectById(selectedProject._id));
    } catch {
      setSnackbar({
        open: true,
        message: 'خطا در بروزرسانی پروژه',
        severity: 'error',
      });
    }
  };

  const handleShareProject = () => {
    if (!selectedProject) return;
    navigator.clipboard.writeText(window.location.href).then(() => {
      setSnackbar({
        open: true,
        message: 'لینک پروژه در کلیپ‌بورد کپی شد',
        severity: 'info',
      });
    });
    setDialogs((prev) => ({ ...prev, shareProject: false }));
  };

  const handleCloseSnackbar = () => setSnackbar({ ...snackbar, open: false });

  //-----------------------------------------------------
  // Section 5: Render logic
  //-----------------------------------------------------
  // Find the active source (currently not used but kept for future use)
  // const activeSource = sourcesByProject?.find((s) => s._id === activeSourceId);
  // --- Loading, error and not found states ---
  if (projectLoading)
    return <LoadingState message='در حال بارگذاری پروژه...' />;
  if (projectError) return <ErrorState message={projectError} />;
  if (!selectedProject)
    return (
      <NotFoundState
        message='پروژه یافت نشد'
        backText='بازگشت به پروژه‌ها'
        backLink='/app/projects'
      />
    );

  // --- Main page render ---
  return (
    <Container maxWidth='xl' sx={{ py: 3, height: 'calc(100vh - 112px)' }}>
      {/* Header */}
      <Fade in timeout={600}>
        <div>
          <ProjectHeader
            project={selectedProject}
            sourceCount={sourcesByProject?.length || 0}
            isBookmarked={isBookmarked}
            isVisible={isVisible}
            onEdit={() =>
              setDialogs((prev) => ({ ...prev, editProject: true }))
            }
            onShare={() =>
              setDialogs((prev) => ({ ...prev, shareProject: true }))
            }
            onDownload={handleDownload}
            onPrint={handlePrint}
            onBookmark={handleBookmark}
            onToggleVisibility={handleToggleVisibility}
            onCite={() => setCitationModalOpen(true)}
          />
        </div>
      </Fade>

      {/* Main content (details and sidebar) */}
      <Slide direction='up' in timeout={800}>
        <Grid container spacing={3}>
          <Grid size={{ xs: 12, lg: 8 }}>
            <ProjectDetails project={selectedProject} />
          </Grid>
          <Grid size={{ xs: 12, lg: 4 }} className='no-print'>
            <ProjectSidebar
              project={selectedProject}
              sourceCount={sourcesByProject?.length || 0}
              onAddSource={() =>
                setDialogs((prev) => ({ ...prev, addSource: true }))
              }
              onEdit={() =>
                setDialogs((prev) => ({ ...prev, editProject: true }))
              }
              onShare={() =>
                setDialogs((prev) => ({ ...prev, shareProject: true }))
              }
            />
          </Grid>
        </Grid>
      </Slide>

      {/* Modern Sources and Notes Section */}
      <Slide direction='up' in timeout={1000}>
        <Grid
          container
          spacing={3}
          sx={{
            marginTop: 3,
          }}
        >
          {/* Sources Panel - Modern Sidebar */}
          <Grid size={{ xs: 12, md: 4 }}>
            <Paper
              elevation={0}
              sx={{
                flex: 1,
                borderRadius: 3,
                border: (theme) =>
                  `1px solid ${alpha(theme.palette.divider, 0.1)}`,
                background: (theme) =>
                  `linear-gradient(135deg, ${alpha(
                    theme.palette.background.paper,
                    0.8
                  )} 0%, ${alpha(theme.palette.background.default, 0.4)} 100%)`,
                backdropFilter: 'blur(10px)',
                display: 'flex',
                flexDirection: 'column',
                overflow: 'hidden',
              }}
            >
              {/* Sources Header */}
              <Box
                sx={{
                  p: 3,
                  borderBottom: (theme) =>
                    `1px solid ${alpha(theme.palette.divider, 0.1)}`,
                  background: (theme) =>
                    `linear-gradient(90deg, ${alpha(
                      theme.palette.primary.main,
                      0.05
                    )} 0%, transparent 100%)`,
                }}
              >
                <Stack
                  direction='row'
                  justifyContent='space-between'
                  alignItems='center'
                  sx={{ mb: 2 }}
                >
                  <Typography variant='h6' fontWeight='600' color='primary'>
                    منابع پروژه
                  </Typography>
                  <Chip
                    label={`${sourcesByProject?.length || 0} منبع`}
                    size='small'
                    color='primary'
                    variant='outlined'
                  />
                </Stack>

                {/* Quick Actions */}
                <Stack direction='row' spacing={1}>
                  <ToggleButtonGroup
                    value={viewMode}
                    exclusive
                    onChange={(_event, newView) => {
                      if (newView) handleViewChange(newView);
                    }}
                    size='small'
                    sx={{
                      '& .MuiToggleButton-root': {
                        borderRadius: 2,
                        border: 'none',
                        px: 2,
                        py: 0.5,
                      },
                    }}
                  >
                    <ToggleButton value='list'>
                      <ViewListIcon fontSize='small' />
                    </ToggleButton>
                    <ToggleButton value='grid'>
                      <ViewModuleIcon fontSize='small' />
                    </ToggleButton>
                  </ToggleButtonGroup>

                  <Button
                    variant='contained'
                    size='small'
                    startIcon={<AddIcon />}
                    onClick={() =>
                      setDialogs((prev) => ({ ...prev, addSource: true }))
                    }
                    sx={{
                      borderRadius: 2,
                      textTransform: 'none',
                      fontWeight: 500,
                      px: 2,
                    }}
                  >
                    افزودن
                  </Button>
                </Stack>
              </Box>

              {/* Sources Content */}
              <Box
                sx={{
                  flex: 1,
                  overflow: 'hidden',
                  display: 'flex',
                  flexDirection: 'column',
                }}
              >
                {sourcesLoading ? (
                  <Box
                    sx={{
                      display: 'flex',
                      justifyContent: 'center',
                      alignItems: 'center',
                      flex: 1,
                    }}
                  >
                    <CircularProgress size={40} />
                  </Box>
                ) : sourcesError ? (
                  <Alert severity='error' sx={{ m: 2, borderRadius: 2 }}>
                    {sourcesError}
                  </Alert>
                ) : (
                  <Box sx={{ flex: 1, overflow: 'auto', p: 2 }}>
                    {sourcesByProject?.length === 0 ? (
                      <Box
                        sx={{
                          display: 'flex',
                          flexDirection: 'column',
                          alignItems: 'center',
                          justifyContent: 'center',
                          height: '100%',
                          textAlign: 'center',
                          py: 4,
                        }}
                      >
                        <Avatar
                          sx={{
                            width: 80,
                            height: 80,
                            bgcolor: (theme) =>
                              alpha(theme.palette.primary.main, 0.1),
                            mb: 3,
                          }}
                        >
                          <DescriptionIcon
                            sx={{ fontSize: 40, color: 'primary.main' }}
                          />
                        </Avatar>
                        <Typography variant='h6' fontWeight='600' gutterBottom>
                          هیچ منبعی وجود ندارد
                        </Typography>
                        <Typography
                          variant='body2'
                          color='text.secondary'
                          sx={{ mb: 3 }}
                        >
                          اولین منبع را به پروژه اضافه کنید
                        </Typography>
                        <Button
                          variant='contained'
                          startIcon={<AddIcon />}
                          onClick={() =>
                            setDialogs((prev) => ({ ...prev, addSource: true }))
                          }
                          sx={{ borderRadius: 2 }}
                        >
                          افزودن منبع
                        </Button>
                      </Box>
                    ) : (
                      <SourcesSection
                        sources={sourcesByProject || []}
                        isLoading={false}
                        error={null}
                        viewMode={viewMode}
                        selected={selectedSources}
                        onViewChange={handleViewChange}
                        onSelect={handleSelectSource}
                        onSelectAll={handleSelectAllSources}
                        onOpenAddSourceModal={() =>
                          setDialogs((prev) => ({ ...prev, addSource: true }))
                        }
                        onOpenDeleteDialog={() =>
                          setDialogs((prev) => ({
                            ...prev,
                            deleteConfirmation: true,
                          }))
                        }
                        onClearSelection={() => setSelectedSources([])}
                        onSelectSource={(id: string) => setActiveSourceId(id)}
                        activeSourceId={activeSourceId}
                      />
                    )}
                  </Box>
                )}
              </Box>
            </Paper>
          </Grid>

          {/* Notes Panel - Main Content */}
          <Grid size={{ xs: 12, md: 8 }}>
            <Paper
              elevation={0}
              sx={{
                flex: 1,
                borderRadius: 3,
                border: (theme) =>
                  `1px solid ${alpha(theme.palette.divider, 0.1)}`,
                background: (theme) =>
                  `linear-gradient(135deg, ${alpha(
                    theme.palette.background.paper,
                    0.8
                  )} 0%, ${alpha(theme.palette.background.default, 0.4)} 100%)`,
                backdropFilter: 'blur(10px)',
                display: 'flex',
                flexDirection: 'column',
                overflow: 'hidden',
              }}
            >
              {activeSourceId && projectId ? (
                <NoteWorkspace
                  projectId={projectId}
                  sourceId={activeSourceId}
                />
              ) : (
                <Box
                  sx={{
                    flex: 1,
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    textAlign: 'center',
                    p: 4,
                  }}
                >
                  <Avatar
                    sx={{
                      width: 120,
                      height: 120,
                      bgcolor: (theme) =>
                        alpha(theme.palette.secondary.main, 0.1),
                      mb: 4,
                    }}
                  >
                    <DescriptionIcon
                      sx={{ fontSize: 60, color: 'secondary.main' }}
                    />
                  </Avatar>
                  <Typography variant='h5' fontWeight='600' gutterBottom>
                    فیش‌های پژوهشی
                  </Typography>
                  <Typography
                    variant='body1'
                    color='text.secondary'
                    sx={{ mb: 4, maxWidth: 400 }}
                  >
                    برای شروع نوشتن فیش، ابتدا یک منبع را از پنل سمت راست انتخاب
                    کنید
                  </Typography>
                  <Stack direction='row' spacing={2} alignItems='center'>
                    <ArrowBackIos sx={{ color: 'text.secondary' }} />
                    <Typography variant='body2' color='text.secondary'>
                      منبع مورد نظر را انتخاب کنید
                    </Typography>
                  </Stack>
                </Box>
              )}
            </Paper>
          </Grid>
        </Grid>
      </Slide>
      {/* --------------------------------------------------- */}
      {/* Section 6: Render Dialogs, Modals and Snackbar */}
      {/* --------------------------------------------------- */}

      {/* Delete sources dialog */}
      <ConfirmationDialog
        open={dialogs.deleteConfirmation}
        onClose={() =>
          setDialogs((prev) => ({ ...prev, deleteConfirmation: false }))
        }
        onConfirm={handleConfirmRemoveSources}
        title='حذف منابع از پروژه'
        contentText={`آیا از حذف ${selectedSources.length} منبع انتخاب شده از این پروژه اطمینان دارید؟`}
      />

      {/* Add source modal */}
      {projectId && (
        <AddSourceModal
          open={dialogs.addSource}
          onClose={() => setDialogs((prev) => ({ ...prev, addSource: false }))}
          projectId={projectId}
        />
      )}

      {/* Edit project dialog */}
      <Dialog
        open={dialogs.editProject}
        onClose={() => setDialogs((prev) => ({ ...prev, editProject: false }))}
        maxWidth='md'
        fullWidth
      >
        <DialogTitle>ویرایش پروژه</DialogTitle>
        <DialogContent>
          <Stack spacing={3} sx={{ mt: 2 }}>
            <TextField
              label='عنوان پروژه'
              value={editForm.title}
              onChange={(e) =>
                setEditForm({ ...editForm, title: e.target.value })
              }
              fullWidth
              required
            />
            <TextField
              label='توضیحات'
              value={editForm.description}
              onChange={(e) =>
                setEditForm({ ...editForm, description: e.target.value })
              }
              multiline
              rows={4}
              fullWidth
            />
            <TextField
              label='برچسب‌ها (جدا شده با کاما)'
              value={editForm.tags.join(', ')}
              onChange={(e) =>
                setEditForm({
                  ...editForm,
                  tags: e.target.value
                    .split(',')
                    .map((tag) => tag.trim())
                    .filter(Boolean),
                })
              }
              fullWidth
            />
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button
            onClick={() =>
              setDialogs((prev) => ({ ...prev, editProject: false }))
            }
          >
            انصراف
          </Button>
          <Button onClick={handleSaveEdit} variant='contained'>
            ذخیره
          </Button>
        </DialogActions>
      </Dialog>

      {/* Share project dialog */}
      <Dialog
        open={dialogs.shareProject}
        onClose={() => setDialogs((prev) => ({ ...prev, shareProject: false }))}
        maxWidth='sm'
        fullWidth
      >
        <DialogTitle>اشتراک‌گذاری پروژه</DialogTitle>
        <DialogContent>
          <Typography sx={{ mb: 2 }}>
            می‌توانید این لینک را کپی کرده و با دیگران به اشتراک بگذارید.
          </Typography>
          <TextField
            label='لینک پروژه'
            value={window.location.href}
            fullWidth
            InputProps={{ readOnly: true }}
            sx={{ direction: 'ltr' }}
          />
        </DialogContent>
        <DialogActions>
          <Button
            onClick={() =>
              setDialogs((prev) => ({ ...prev, shareProject: false }))
            }
          >
            بستن
          </Button>
          <Button onClick={handleShareProject} variant='contained'>
            کپی کردن لینک
          </Button>
        </DialogActions>
      </Dialog>

      {/* Notification messages */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'left' }}
      >
        <Alert
          onClose={handleCloseSnackbar}
          severity={snackbar.severity}
          sx={{ width: '100%' }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
      {/* Render the modal */}
      {projectId && (
        <ProjectCitationModal
          open={citationModalOpen}
          onClose={() => setCitationModalOpen(false)}
          projectId={projectId}
        />
      )}
    </Container>
  );
};

export default ProjectDetailPage;
