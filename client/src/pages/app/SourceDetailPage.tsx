import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { useForm } from 'react-hook-form';

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
  Typography,
} from '@mui/material';

// --- Redux Imports ---
import type { AppDispatch, RootState } from '../../store';
import {
  clearSelectedSource,
  fetchSourceById,
  deleteSource,
  updateSourceById,
} from '../../store/features/sourceSlice';

// --- Import کامپوننت‌های بازسازی شده ---
import { LoadingState } from '../../components/common/LoadingState';
import { ErrorState } from '../../components/common/ErrorState';
import { NotFoundState } from '../../components/common/NotFoundState';
import { SourceHeader } from '../../components/sources/SourceHeader';
import { SourceDetails } from '../../components/sources/SourceDetails';
import { SourceSidebar } from '../../components/sources/SourceSidebar';
import type { CreateSourceData, IAuthor } from '../../types';
import { EditSourceDialog } from '../../components/common/EditSourceDialog';

//======================================================================
// تعریف اینترفیس برای فرم ویرایش
//======================================================================
interface EditSourceForm {
  title?: string;
  authors?: string;
  year?: string;
  type?: string;
  language?: 'persian' | 'english';
  tags?: string;
  abstract?: string;
  journal?: string;
  publisher?: string;
  volume?: string;
  issue?: string;
  pages?: string;
  doi?: string;
  isbn?: string;
  url?: string;
}

//======================================================================
// کامپوننت اصلی صفحه جزئیات منبع
//======================================================================
const SourceDetailPage: React.FC = () => {
  const { id: sourceId } = useParams<{ id: string }>();
  const dispatch = useDispatch<AppDispatch>();

  //-----------------------------------------------------
  // بخش ۱: State های محلی برای مدیریت UI
  //-----------------------------------------------------
  const [isBookmarked, setIsBookmarked] = useState(false);
  const [isVisible, setIsVisible] = useState(true);

  const [dialogs, setDialogs] = useState({
    deleteConfirmation: false,
    editSource: false,
    shareSource: false,
  });

  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'success' as 'success' | 'error' | 'info' | 'warning',
  });

  //-----------------------------------------------------
  // بخش ۲: واکشی داده‌ها از Redux Store
  //-----------------------------------------------------
  const { selectedSource, isLoading, error } = useSelector(
    (state: RootState) => state.sources
  );

  //-----------------------------------------------------
  // بخش ۳: مدیریت فرم با React Hook Form
  //-----------------------------------------------------
  const { reset } = useForm<EditSourceForm>();

  //-----------------------------------------------------
  // بخش ۴: مدیریت چرخه حیات (Lifecycle) با useEffect
  //-----------------------------------------------------
  useEffect(() => {
    if (sourceId) {
      dispatch(fetchSourceById(sourceId));
    }
    return () => {
      dispatch(clearSelectedSource());
    };
  }, [sourceId, dispatch]);

  // پر کردن فرم ویرایش پس از بارگذاری داده‌های منبع
  useEffect(() => {
    if (selectedSource) {
      reset({
        title: selectedSource.title || '',
        authors:
          selectedSource.authors?.map((a: IAuthor) => a.name).join(', ') || '',
        year: selectedSource.year?.toString() || '',
        type: selectedSource.type || '',
        tags: selectedSource.tags?.join(', ') || '',
        abstract: selectedSource.abstract || '',
        url: selectedSource.identifiers?.url || '',
      });
    }
  }, [selectedSource, reset]);

  //-----------------------------------------------------
  // بخش ۵: توابع مدیریت رویداد (Event Handlers)
  //-----------------------------------------------------

  const handleDownload = () => {
    if (!selectedSource) return;
    const content = `عنوان: ${selectedSource.title}\nنویسندگان: ${
      selectedSource.authors?.map((a: IAuthor) => a.name).join(', ') || 'نامشخص'
    }\nسال: ${selectedSource.year || 'نامشخص'}`;
    const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${selectedSource.title.replace(/[^a-zA-Z0-9]/g, '_')}.txt`;
    link.click();
    URL.revokeObjectURL(url);
    setSnackbar({
      open: true,
      message: 'اطلاعات منبع دانلود شد',
      severity: 'success',
    });
  };

  const handlePrint = () => window.print();

  const handleBookmark = () => {
    setIsBookmarked(!isBookmarked);
    setSnackbar({
      open: true,
      message: !isBookmarked ? 'به نشان‌ها اضافه شد' : 'از نشان‌ها حذف شد',
      severity: 'info',
    });
  };

  const handleToggleVisibility = () => {
    setIsVisible(!isVisible);
    setSnackbar({
      open: true,
      message: !isVisible ? 'منبع نمایش داده شد' : 'منبع مخفی شد',
      severity: 'info',
    });
  };

  const handleConfirmDelete = async () => {
    if (!sourceId) return;
    try {
      await dispatch(deleteSource(sourceId)).unwrap();
      setSnackbar({
        open: true,
        message: 'منبع با موفقیت حذف شد',
        severity: 'success',
      });
      setDialogs((prev) => ({ ...prev, deleteConfirmation: false }));
      // انتقال کاربر به صفحه کتابخانه پس از حذف موفق
      window.location.href = '/app/library';
    } catch (err) {
      setSnackbar({
        open: true,
        message: (err as Error).message || 'خطا در حذف منبع',
        severity: 'error',
      });
    }
  };

  const onEditSubmit = async (data: EditSourceForm) => {
    if (!sourceId) return;
    const updateData = {
      _id: sourceId,
      title: data.title || '',
      authors: data.authors
        ? data.authors
            .split(/[,،|]/)
            .map((name) => {
              const nameParts = name.trim().split(' ');
              if (nameParts.length >= 2) {
                return {
                  firstname: nameParts[0],
                  lastname: nameParts.slice(1).join(' '),
                };
              } else {
                return {
                  firstname: nameParts[0] || '',
                  lastname: '',
                };
              }
            })
            .filter((author) => author.firstname)
        : [],
      year: data.year ? parseInt(data.year) : undefined,
      type: data.type || 'article',
      language: data.language || 'english',
      tags: data.tags
        ? data.tags
            .split(',')
            .map((tag) => tag.trim())
            .filter(Boolean)
        : [],
      abstract: data.abstract || '',
      publicationDetails: {
        journal: data.journal || '',
        publisher: data.publisher || '',
        volume: data.volume || '',
        issue: data.issue || '',
        pages: data.pages || '',
      },
      identifiers: {
        url: data.url || '',
        doi: data.doi || '',
        isbn: data.isbn || '',
      },
    };
    try {
      await dispatch(updateSourceById(updateData as any)).unwrap();
      setSnackbar({
        open: true,
        message: 'منبع با موفقیت بروزرسانی شد',
        severity: 'success',
      });
      setDialogs((prev) => ({ ...prev, editSource: false }));
      dispatch(fetchSourceById(sourceId)); // رفرش داده‌ها
    } catch (err) {
      setSnackbar({
        open: true,
        message: err.message || 'خطا در بروزرسانی منبع',
        severity: 'error',
      });
    }
  };

  const handleShareSource = () => {
    if (!selectedSource) return;
    navigator.clipboard.writeText(window.location.href).then(() => {
      setSnackbar({
        open: true,
        message: 'لینک منبع در کلیپ‌بورد کپی شد',
        severity: 'info',
      });
    });
    setDialogs((prev) => ({ ...prev, shareSource: false }));
  };

  const handleCloseSnackbar = () => setSnackbar({ ...snackbar, open: false });

  //-----------------------------------------------------
  // بخش ۶: منطق رندر (Render Logic)
  //-----------------------------------------------------

  if (isLoading) return <LoadingState message='در حال بارگذاری منبع...' />;
  if (error) return <ErrorState message={error} />;
  if (!selectedSource)
    return (
      <NotFoundState
        message='منبع یافت نشد'
        backText='بازگشت به کتابخانه'
        backLink='/app/library'
      />
    );

  return (
    <Container maxWidth='xl' sx={{ py: 3 }}>
      <Fade in timeout={600}>
        <div>
          <SourceHeader
            source={selectedSource}
            isBookmarked={isBookmarked}
            isVisible={isVisible}
            onEdit={() => setDialogs((prev) => ({ ...prev, editSource: true }))}
            onShare={() =>
              setDialogs((prev) => ({ ...prev, shareSource: true }))
            }
            onDownload={handleDownload}
            onPrint={handlePrint}
            onBookmark={handleBookmark}
            onToggleVisibility={handleToggleVisibility}
            onDelete={() =>
              setDialogs((prev) => ({ ...prev, deleteConfirmation: true }))
            }
          />
        </div>
      </Fade>

      <Slide direction='up' in timeout={800}>
        <Grid container spacing={3}>
          <Grid size={{ xs: 12, lg: 8 }}>
            <SourceDetails source={selectedSource} />
          </Grid>
          <Grid size={{ xs: 12, lg: 4 }} className='no-print'>
            <SourceSidebar
              onEdit={() =>
                setDialogs((prev) => ({ ...prev, editSource: true }))
              }
              onShare={() =>
                setDialogs((prev) => ({ ...prev, shareSource: true }))
              }
              onDownload={handleDownload}
            />
          </Grid>
        </Grid>
      </Slide>

      {/* --------------------------------------------------- */}
      {/* بخش ۷: رندر کردن Dialog ها و Snackbar */}
      {/* --------------------------------------------------- */}

      <Dialog
        open={dialogs.deleteConfirmation}
        onClose={() =>
          setDialogs((prev) => ({ ...prev, deleteConfirmation: false }))
        }
        maxWidth='sm'
        fullWidth
      >
        <DialogTitle>تأیید حذف منبع</DialogTitle>
        <DialogContent>
          <Typography>
            آیا مطمئن هستید که می‌خواهید این منبع را برای همیشه حذف کنید؟ این
            عمل قابل بازگشت نیست.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button
            onClick={() =>
              setDialogs((prev) => ({ ...prev, deleteConfirmation: false }))
            }
          >
            انصراف
          </Button>
          <Button
            onClick={handleConfirmDelete}
            color='error'
            variant='contained'
          >
            حذف
          </Button>
        </DialogActions>
      </Dialog>
      {selectedSource && (
        <EditSourceDialog
          open={dialogs.editSource}
          onClose={() => setDialogs((prev) => ({ ...prev, editSource: false }))}
          onSubmit={(data) => onEditSubmit(data as EditSourceForm)}
          source={selectedSource}
        />
      )}
      {/* <Dialog
        open={dialogs.editSource}
        onClose={() => setDialogs((prev) => ({ ...prev, editSource: false }))}
        maxWidth='md'
        fullWidth
      >
        <DialogTitle>ویرایش منبع</DialogTitle>
        <form onSubmit={handleSubmit(onEditSubmit)}>
          <DialogContent>
            <Stack spacing={3} sx={{ mt: 2 }}>
              <Controller
                name='title'
                control={control}
                rules={{ required: 'عنوان الزامی است' }}
                render={({ field }) => (
                  <TextField
                    {...field}
                    label='عنوان'
                    fullWidth
                    error={!!errors.title}
                    helperText={errors.title?.message}
                  />
                )}
              />
              <Controller
                name='authors'
                control={control}
                render={({ field }) => (
                  <TextField
                    {...field}
                    label='نویسندگان (جدا شده با کاما)'
                    fullWidth
                  />
                )}
              />
              <Controller
                name='year'
                control={control}
                render={({ field }) => (
                  <TextField
                    {...field}
                    label='سال انتشار'
                    type='number'
                    fullWidth
                  />
                )}
              />
              <Controller
                name='type'
                control={control}
                rules={{ required: 'نوع منبع الزامی است' }}
                render={({ field }) => (
                  <FormControl fullWidth error={!!errors.type}>
                    <InputLabel>نوع منبع</InputLabel>
                    <Select {...field} label='نوع منبع'>
                      <MenuItem value='book'>کتاب</MenuItem>
                      <MenuItem value='article'>مقاله</MenuItem>
                      <MenuItem value='journal'>مجله</MenuItem>
                    </Select>
                  </FormControl>
                )}
              />
              <Controller
                name='tags'
                control={control}
                render={({ field }) => (
                  <TextField
                    {...field}
                    label='برچسب‌ها (جدا شده با کاما)'
                    fullWidth
                  />
                )}
              />
              <Controller
                name='abstract'
                control={control}
                render={({ field }) => (
                  <TextField
                    {...field}
                    label='چکیده'
                    multiline
                    rows={4}
                    fullWidth
                  />
                )}
              />
              <Controller
                name='url'
                control={control}
                render={({ field }) => (
                  <TextField {...field} label='لینک منبع' fullWidth />
                )}
              />
            </Stack>
          </DialogContent>
          <DialogActions>
            <Button
              onClick={() =>
                setDialogs((prev) => ({ ...prev, editSource: false }))
              }
            >
              انصراف
            </Button>
            <Button type='submit' variant='contained' disabled={isSubmitting}>
              {isSubmitting ? 'در حال ذخیره...' : 'ذخیره'}
            </Button>
          </DialogActions>
        </form>
      </Dialog> */}

      <Dialog
        open={dialogs.shareSource}
        onClose={() => setDialogs((prev) => ({ ...prev, shareSource: false }))}
        maxWidth='sm'
        fullWidth
      >
        <DialogTitle>اشتراک‌گذاری منبع</DialogTitle>
        <DialogContent>
          <Typography sx={{ mb: 2 }}>
            می‌توانید این لینک را برای اشتراک‌گذاری کپی کنید.
          </Typography>
          <TextField
            label='لینک منبع'
            value={window.location.href}
            fullWidth
            InputProps={{ readOnly: true }}
            sx={{ direction: 'ltr' }}
          />
        </DialogContent>
        <DialogActions>
          <Button
            onClick={() =>
              setDialogs((prev) => ({ ...prev, shareSource: false }))
            }
          >
            بستن
          </Button>
          <Button onClick={handleShareSource} variant='contained'>
            کپی کردن لینک
          </Button>
        </DialogActions>
      </Dialog>

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

export default SourceDetailPage;
