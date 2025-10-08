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
} from '@mui/material';

// --- Redux Imports ---
import type { AppDispatch, RootState } from '../../store';
import {
  fetchProjectById,
  clearSelectedProject,
  removeSourceFromProject,
  updateProject,
} from '../../store/features/projectSlice';
import { fetchSourcesByProject } from '../../store/features/sourceSlice';
import {
  clearNotes,
  createNote,
  deleteNote,
  fetchNotes,
} from '../../store/features/noteSlice';

// --- Import کامپوننت‌های بازسازی شده ---
import { LoadingState } from '../../components/common/LoadingState';
import { ErrorState } from '../../components/common/ErrorState';
import { NotFoundState } from '../../components/common/NotFoundState';
import { ProjectHeader } from '../../components/projects/ProjectHeader';
import { ProjectDetails } from '../../components/projects/ProjectDetails';
import { ProjectSidebar } from '../../components/projects/ProjectSidebar';
import { SourcesSection } from '../../components/sources/SourcesSection';

// --- Import کامپوننت‌های Modal و Dialog ---
import ConfirmationDialog from '../../components/common/ConfirmationDialog';
import AddSourceModal from '../../components/sources/AddSourceModal';

//======================================================================
// کامپوننت اصلی صفحه جزئیات پروژه
//======================================================================
const ProjectDetailPage: React.FC = () => {
  const { id: projectId } = useParams<{ id: string }>();
  const dispatch = useDispatch<AppDispatch>();

  //-----------------------------------------------------
  // بخش ۱: State های محلی برای مدیریت UI
  //-----------------------------------------------------
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [selectedSources, setSelectedSources] = useState<string[]>([]);
  const [isBookmarked, setIsBookmarked] = useState(false);
  const [isVisible, setIsVisible] = useState(true);

  // State برای مدیریت باز و بسته بودن Dialog ها
  const [dialogs, setDialogs] = useState({
    deleteConfirmation: false,
    addSource: false,
    editProject: false,
    shareProject: false,
  });

  // State برای مدیریت Snackbar (پیام‌های اطلاع‌رسانی)
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'success' as 'success' | 'error' | 'info' | 'warning',
  });

  // State برای فرم ویرایش پروژه
  const [editForm, setEditForm] = useState({
    title: '',
    description: '',
    tags: [] as string[],
  });

  //-----------------------------------------------------
  // بخش ۲: واکشی داده‌ها از Redux Store
  //-----------------------------------------------------
  const {
    selectedProject,
    isLoading: projectLoading,
    error: projectError,
  } = useSelector((state: RootState) => state.projects);

  const {
    sourcesByProject,
    isLoading: sourcesLoading,
    error: sourcesError,
  } = useSelector((state: RootState) => state.sources);

  //-----------------------------------------------------
  // بخش ۳: مدیریت چرخه حیات (Lifecycle) با useEffect
  //-----------------------------------------------------
  // واکشی داده‌های پروژه و منابع هنگام بارگذاری کامپوننت
  useEffect(() => {
    if (projectId) {
      dispatch(fetchProjectById(projectId));
      dispatch(fetchSourcesByProject(projectId));
    }
    // تابع پاکسازی (Cleanup): هنگام خروج از صفحه اجرا می‌شود
    return () => {
      dispatch(clearSelectedProject());
      dispatch(clearNotes()); // اگر از یادداشت‌ها استفاده می‌کنید
    };
  }, [projectId, dispatch]);

  // پر کردن فرم ویرایش و خواندن وضعیت‌ها از LocalStorage پس از بارگذاری پروژه
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

  //-----------------------------------------------------
  // بخش ۴: توابع مدیریت رویداد (Event Handlers)
  //-----------------------------------------------------

  // --- Handlers مربوط به لیست منابع ---
  const handleViewChange = (
    _event: React.MouseEvent<HTMLElement>,
    newView: 'grid' | 'list' | null
  ) => {
    if (newView !== null) setViewMode(newView);
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
      const allSourceIds = sourcesByProject.map((s) => s._id);
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
    dispatch(fetchSourcesByProject(projectId)); // رفرش لیست منابع
    setSnackbar({
      open: true,
      message: 'منابع با موفقیت از پروژه حذف شدند',
      severity: 'success',
    });
  };

  // --- Handlers مربوط به عملیات پروژه ---
  const handleDownload = () => {
    if (!selectedProject) return;
    const content = `پروژه: ${selectedProject.title}\nتوضیحات: ${
      selectedProject.description || 'ندارد'
    }\nمنابع: ${sourcesByProject.length} عدد`;
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
  // بخش ۵: منطق رندر (Render Logic)
  //-----------------------------------------------------

  // --- حالت‌های بارگذاری، خطا و یافت نشدن ---
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

  // --- رندر اصلی صفحه ---
  return (
    <Container maxWidth='xl' sx={{ py: 3 }}>
      {/* هدر صفحه */}
      <Fade in timeout={600}>
        <div>
          <ProjectHeader
            project={selectedProject}
            sourceCount={sourcesByProject.length}
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
          />
        </div>
      </Fade>

      {/* بخش اصلی محتوا (جزئیات و سایدبار) */}
      <Slide direction='up' in timeout={800}>
        <Grid container spacing={3}>
          <Grid size={{ xs: 12, lg: 8 }}>
            <ProjectDetails project={selectedProject} />
          </Grid>
          <Grid size={{ xs: 12, lg: 4 }} className='no-print'>
            <ProjectSidebar
              project={selectedProject}
              sourceCount={sourcesByProject.length}
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

      {/* بخش منابع پروژه */}
      <Slide direction='up' in timeout={1000}>
        <div>
          <SourcesSection
            sources={sourcesByProject}
            isLoading={sourcesLoading}
            error={sourcesError}
            viewMode={viewMode}
            selected={selectedSources}
            onViewChange={(newView) => handleViewChange(null, newView)}
            onSelect={handleSelectSource}
            onSelectAll={handleSelectAllSources}
            onOpenAddSourceModal={() =>
              setDialogs((prev) => ({ ...prev, addSource: true }))
            }
            onOpenDeleteDialog={() =>
              setDialogs((prev) => ({ ...prev, deleteConfirmation: true }))
            }
            onClearSelection={() => setSelectedSources([])}
          />
        </div>
      </Slide>

      {/* --------------------------------------------------- */}
      {/* بخش ۶: رندر کردن Dialog ها، Modal ها و Snackbar */}
      {/* --------------------------------------------------- */}

      {/* دیالوگ حذف منابع */}
      <ConfirmationDialog
        open={dialogs.deleteConfirmation}
        onClose={() =>
          setDialogs((prev) => ({ ...prev, deleteConfirmation: false }))
        }
        onConfirm={handleConfirmRemoveSources}
        title='حذف منابع از پروژه'
        contentText={`آیا از حذف ${selectedSources.length} منبع انتخاب شده از این پروژه اطمینان دارید؟`}
      />

      {/* مدال افزودن منبع */}
      {projectId && (
        <AddSourceModal
          open={dialogs.addSource}
          onClose={() => setDialogs((prev) => ({ ...prev, addSource: false }))}
          projectId={projectId}
        />
      )}

      {/* دیالوگ ویرایش پروژه */}
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

      {/* دیالوگ اشتراک‌گذاری */}
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

      {/* پیام‌های اطلاع‌رسانی */}
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
    </Container>
  );
};

export default ProjectDetailPage;
