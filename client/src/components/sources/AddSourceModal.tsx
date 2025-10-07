import React, { useState, useEffect } from 'react';
import { useForm, type SubmitHandler } from 'react-hook-form';
import { useDispatch, useSelector } from 'react-redux';
import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  TextField,
  CircularProgress,
  Tabs,
  Tab,
  Box,
  Alert,
  Autocomplete,
  Chip,
  Stack,
  Typography,
  Paper,
  Divider,
  Fade,
  alpha,
  IconButton,
} from '@mui/material';

import type { AppDispatch, RootState } from '../../store';
import type { ISource } from '../../types';
import {
  createSource,
  importSourceByDOI,
  clearError,
  importSourceByUrl,
  fetchAllUserSources,
  fetchSourcesByProject,
} from '../../store/features/sourceSlice';
import { addExistingSourcesToProject } from '../../store/features/projectSlice';
import {
  Link as LinkIcon,
  Person as PersonIcon,
  CalendarToday as CalendarIcon,
  Description as DescriptionIcon,
  Add as AddIcon,
  Close as CloseIcon,
  Search as SearchIcon,
} from '@mui/icons-material';

interface AddSourceModalProps {
  open: boolean;
  onClose: () => void;
  projectId?: string;
}

// انواع فرم‌ها
type ManualFormInputs = { title: string; authors: string; year: string };
type DoiFormInputs = { doi: string };
type UrlFormInputs = { url: string };
const AddSourceModal: React.FC<AddSourceModalProps> = ({
  open,
  onClose,
  projectId,
}) => {
  const dispatch = useDispatch<AppDispatch>();
  const { isLoading, error } = useSelector((state: RootState) => state.sources);
  const { selectedProject } = useSelector((state: RootState) => state.projects);
  console.log(selectedProject);

  const projectSources = selectedProject?.sources || [];

  const [activeTab, setActiveTab] = useState(0);
  const { sources: librarySources, isLoading: libraryLoading } = useSelector(
    (state: RootState) => state.sources
  );
  const [selectedLibrary, setSelectedLibrary] = useState<string[]>([]);

  // Filter out sources that are already in the current project
  const availableLibrarySources = librarySources.filter(
    (source) =>
      !projectSources.some((projectSource) => projectSource._id === source._id)
  );
  console.log('available sources: ', availableLibrarySources);
  // فرم برای افزودن دستی
  const {
    register: registerManual,
    handleSubmit: handleSubmitManual,
    reset: resetManual,
  } = useForm<ManualFormInputs>();
  // فرم برای وارد کردن با DOI
  const {
    register: registerDoi,
    handleSubmit: handleSubmitDoi,
    reset: resetDoi,
  } = useForm<DoiFormInputs>();
  const {
    register: registerUrl,
    handleSubmit: handleSubmitUrl,
    reset: resetUrl,
  } = useForm<UrlFormInputs>();

  useEffect(() => {
    // با هر بار باز شدن مودال، خطاها را پاک کن
    if (open) {
      dispatch(clearError());
    }
  }, [open, dispatch]);
  useEffect(() => {
    // اگر تب کتابخانه باز شد و منابع لود نشده بودند، آن‌ها را واکشی کن
    if (open && activeTab === 3) {
      // فرض کنیم تب چهارم است
      dispatch(fetchAllUserSources());
    }
  }, [open, activeTab, dispatch]);

  const handleAddFromLibrary = async () => {
    if (selectedLibrary.length === 0) return;
    await dispatch(
      addExistingSourcesToProject({ projectId, sourceIds: selectedLibrary })
    );
    handleClose();
    // منابع پروژه را دوباره واکشی کن تا UI به‌روزرسانی شود
    if (projectId) {
      dispatch(fetchSourcesByProject(projectId));
    }
  };

  const handleLibrarySourceChange = (
    _event: React.SyntheticEvent,
    newValue: ISource[]
  ) => {
    setSelectedLibrary(newValue.map((source: ISource) => source._id));
  };

  const handleTabChange = (_event: React.SyntheticEvent, newValue: number) => {
    setActiveTab(newValue);
  };

  const handleClose = () => {
    resetManual();
    resetDoi();
    resetUrl();
    onClose();
  };

  // ارسال فرم دستی
  const onManualSubmit: SubmitHandler<ManualFormInputs> = async (data) => {
    const processedData = {
      projectId,
      title: data.title,
      type: 'article',
      authors: data.authors
        .split(/[,،|]/)
        .map((name) => ({ name: name.trim() })),
      year: Number(data.year) || undefined,
    };
    console.log('add source manual data ----> ', processedData);
    const result = await dispatch(createSource(processedData));
    console.log('add source manual result ----> ', result);
    if (createSource.fulfilled.match(result)) {
      handleClose();
      // منابع پروژه را دوباره واکشی کن تا UI به‌روزرسانی شود
      if (projectId) {
        dispatch(fetchSourcesByProject(projectId));
      }
    }
  };

  // ارسال فرم DOI
  const onDoiSubmit: SubmitHandler<DoiFormInputs> = async (data) => {
    const result = await dispatch(importSourceByDOI({ ...data, projectId }));
    if (importSourceByDOI.fulfilled.match(result)) {
      handleClose();
      // منابع پروژه را دوباره واکشی کن تا UI به‌روزرسانی شود
      if (projectId) {
        dispatch(fetchSourcesByProject(projectId));
      }
    }
  };

  // ارسال فرم URL
  const onUrlSubmit: SubmitHandler<UrlFormInputs> = async (data) => {
    const result = await dispatch(importSourceByUrl({ ...data, projectId }));
    if (importSourceByUrl.fulfilled.match(result)) {
      handleClose();
      // منابع پروژه را دوباره واکشی کن تا UI به‌روزرسانی شود
      if (projectId) {
        dispatch(fetchSourcesByProject(projectId));
      }
    }
  };

  return (
    <Dialog
      open={open}
      onClose={handleClose}
      fullWidth
      maxWidth='md'
      PaperProps={{
        sx: {
          borderRadius: 3,
          boxShadow: (theme) =>
            `0 20px 60px ${alpha(theme.palette.common.black, 0.15)}`,
        },
      }}
    >
      {/* Modern Header */}
      <DialogTitle sx={{ pb: 1 }}>
        <Stack
          direction='row'
          justifyContent='space-between'
          alignItems='center'
        >
          <Typography variant='h5' fontWeight='600'>
            افزودن منبع جدید
          </Typography>
          <IconButton onClick={handleClose} size='small'>
            <CloseIcon />
          </IconButton>
        </Stack>
      </DialogTitle>

      <DialogContent sx={{ px: 3, py: 2 }}>
        {/* Modern Tabs */}
        <Paper
          elevation={0}
          sx={{
            borderRadius: 2,
            border: (theme) => `1px solid ${alpha(theme.palette.divider, 0.1)}`,
            mb: 3,
            overflow: 'hidden',
          }}
        >
          <Tabs
            value={activeTab}
            onChange={handleTabChange}
            variant='fullWidth'
            sx={{
              '& .MuiTab-root': {
                textTransform: 'none',
                fontWeight: 500,
                minHeight: 48,
              },
              '& .Mui-selected': {
                color: 'primary.main',
              },
              '& .MuiTabs-indicator': {
                height: 3,
                borderRadius: '3px 3px 0 0',
              },
            }}
          >
            <Tab
              label={
                <Stack direction='row' spacing={1} alignItems='center'>
                  <LinkIcon fontSize='small' />
                  <span>لینک</span>
                </Stack>
              }
            />
            <Tab
              label={
                <Stack direction='row' spacing={1} alignItems='center'>
                  <AddIcon fontSize='small' />
                  <span>دستی</span>
                </Stack>
              }
            />
            <Tab
              label={
                <Stack direction='row' spacing={1} alignItems='center'>
                  <DescriptionIcon fontSize='small' />
                  <span>DOI</span>
                </Stack>
              }
            />
            {projectId && (
              <Tab
                label={
                  <Stack direction='row' spacing={1} alignItems='center'>
                    <SearchIcon fontSize='small' />
                    <span>کتابخانه</span>
                  </Stack>
                }
              />
            )}
          </Tabs>
        </Paper>

        {/* Error Alert */}
        {error && (
          <Fade in>
            <Alert
              severity='error'
              sx={{
                mb: 3,
                borderRadius: 2,
                '& .MuiAlert-icon': {
                  fontSize: '1.2rem',
                },
              }}
            >
              {error}
            </Alert>
          </Fade>
        )}

        {/* Tab Content */}
        <Box sx={{ minHeight: 300 }}>
          {/* URL Tab */}
          <Fade in={activeTab === 0} timeout={300}>
            <Box hidden={activeTab !== 0}>
              <form onSubmit={handleSubmitUrl(onUrlSubmit)}>
                <Stack spacing={3}>
                  <TextField
                    autoFocus
                    label='لینک مقاله از SID یا Noormags'
                    placeholder='https://www.sid.ir/...'
                    fullWidth
                    variant='outlined'
                    {...registerUrl('url', { required: true })}
                    sx={{
                      '& .MuiOutlinedInput-root': {
                        borderRadius: 2,
                      },
                    }}
                    helperText='لینک مقاله را از سایت‌های SID یا Noormags وارد کنید'
                  />
                </Stack>
              </form>
            </Box>
          </Fade>

          {/* Manual Tab */}
          <Fade in={activeTab === 1} timeout={300}>
            <Box hidden={activeTab !== 1}>
              <form onSubmit={handleSubmitManual(onManualSubmit)}>
                <Stack spacing={3}>
                  <TextField
                    autoFocus
                    label='عنوان منبع'
                    placeholder='عنوان مقاله یا کتاب'
                    fullWidth
                    variant='outlined'
                    {...registerManual('title', { required: true })}
                    sx={{
                      '& .MuiOutlinedInput-root': {
                        borderRadius: 2,
                      },
                    }}
                  />
                  <TextField
                    label='نویسندگان'
                    placeholder='نام نویسندگان با ("," یا "،" یا "|" ) جدا کنید)'
                    fullWidth
                    variant='outlined'
                    {...registerManual('authors')}
                    sx={{
                      '& .MuiOutlinedInput-root': {
                        borderRadius: 2,
                      },
                    }}
                    helperText='نام نویسندگان را با ("," یا "،" یا "|" )جدا کنید'
                  />
                  <TextField
                    label='سال انتشار'
                    type='number'
                    placeholder='2024'
                    fullWidth
                    variant='outlined'
                    {...registerManual('year')}
                    sx={{
                      '& .MuiOutlinedInput-root': {
                        borderRadius: 2,
                      },
                    }}
                  />
                </Stack>
              </form>
            </Box>
          </Fade>

          {/* DOI Tab */}
          <Fade in={activeTab === 2} timeout={300}>
            <Box hidden={activeTab !== 2}>
              <form onSubmit={handleSubmitDoi(onDoiSubmit)}>
                <Stack spacing={3}>
                  <TextField
                    autoFocus
                    label='DOI'
                    placeholder='10.1038/s41586-021-03511-4'
                    fullWidth
                    variant='outlined'
                    {...registerDoi('doi', { required: true })}
                    sx={{
                      '& .MuiOutlinedInput-root': {
                        borderRadius: 2,
                      },
                    }}
                    helperText='شناسه DOI مقاله را وارد کنید'
                  />
                </Stack>
              </form>
            </Box>
          </Fade>

          {/* Library Tab */}
          {projectId && (
            <Fade in={activeTab === 3} timeout={300}>
              <Box hidden={activeTab !== 3}>
                <Stack spacing={3}>
                  {libraryLoading ? (
                    <Box
                      sx={{ display: 'flex', justifyContent: 'center', py: 4 }}
                    >
                      <CircularProgress />
                    </Box>
                  ) : (
                    <>
                      <Autocomplete
                        multiple
                        options={librarySources.filter(
                          (option) =>
                            !projectSources.some(
                              (projectSource) =>
                                projectSource._id === option._id
                            )
                        )}
                        getOptionLabel={(option) => option.title}
                        value={availableLibrarySources.filter((source) =>
                          selectedLibrary.includes(source._id)
                        )}
                        onChange={handleLibrarySourceChange}
                        renderInput={(params) => (
                          <TextField
                            {...params}
                            label='جستجو و انتخاب منابع'
                            placeholder='نام منبع را تایپ کنید...'
                            variant='outlined'
                            sx={{
                              '& .MuiOutlinedInput-root': {
                                borderRadius: 2,
                              },
                            }}
                          />
                        )}
                        renderOption={(props, option) => (
                          <Box component='li' {...props}>
                            <Stack spacing={1}>
                              <Typography variant='body1' fontWeight='500'>
                                {option.title}
                              </Typography>
                              <Stack direction='row' spacing={2}>
                                {option.authors &&
                                  option.authors.length > 0 && (
                                    <Chip
                                      icon={<PersonIcon />}
                                      label={option.authors
                                        .map((a) => a.name)
                                        .join(', ')}
                                      size='small'
                                      variant='outlined'
                                    />
                                  )}
                                {option.year && (
                                  <Chip
                                    icon={<CalendarIcon />}
                                    label={option.year}
                                    size='small'
                                    variant='outlined'
                                  />
                                )}
                              </Stack>
                            </Stack>
                          </Box>
                        )}
                        renderTags={(value, getTagProps) =>
                          value.map((option, index) => (
                            <Chip
                              {...getTagProps({ index })}
                              key={option._id}
                              label={option.title}
                              size='small'
                              color='primary'
                              variant='outlined'
                            />
                          ))
                        }
                        noOptionsText='منبعی یافت نشد'
                        loadingText='در حال بارگذاری...'
                      />

                      {availableLibrarySources.length === 0 && (
                        <Paper
                          elevation={0}
                          sx={{
                            p: 4,
                            textAlign: 'center',
                            border: (theme) =>
                              `2px dashed ${alpha(theme.palette.divider, 0.3)}`,
                            bgcolor: (theme) =>
                              alpha(theme.palette.action.hover, 0.3),
                          }}
                        >
                          <Typography
                            variant='h6'
                            color='text.secondary'
                            gutterBottom
                          >
                            هیچ منبعی در کتابخانه شما وجود ندارد
                          </Typography>
                          <Typography variant='body2' color='text.secondary'>
                            ابتدا منابعی را به صورت دستی یا از طریق DOI اضافه
                            کنید
                          </Typography>
                        </Paper>
                      )}
                    </>
                  )}
                </Stack>
              </Box>
            </Fade>
          )}
        </Box>
      </DialogContent>

      {/* Modern Actions */}
      <Divider />
      <DialogActions sx={{ p: 3, gap: 2 }}>
        <Button
          onClick={handleClose}
          variant='outlined'
          sx={{
            borderRadius: 2,
            textTransform: 'none',
            fontWeight: 500,
            px: 3,
          }}
        >
          انصراف
        </Button>
        <Button
          onClick={
            activeTab === 0
              ? handleSubmitUrl(onUrlSubmit)
              : activeTab === 1
              ? handleSubmitManual(onManualSubmit)
              : activeTab === 2
              ? handleSubmitDoi(onDoiSubmit)
              : handleAddFromLibrary
          }
          variant='contained'
          disabled={
            isLoading || (activeTab === 3 && selectedLibrary.length === 0)
          }
          sx={{
            borderRadius: 2,
            textTransform: 'none',
            fontWeight: 500,
            px: 3,
            minWidth: 120,
          }}
        >
          {isLoading ? (
            <CircularProgress size={20} color='inherit' />
          ) : (
            `افزودن ${
              activeTab === 3 && selectedLibrary.length > 0
                ? `(${selectedLibrary.length})`
                : ''
            }`
          )}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default AddSourceModal;
