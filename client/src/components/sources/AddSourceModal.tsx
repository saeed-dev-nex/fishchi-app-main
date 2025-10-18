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
  alpha,
  IconButton,
} from '@mui/material';

import type { AppDispatch, RootState } from '../../store';
import type { CreateSourceData, ISource } from '../../types';
import {
  createSource,
  importSourceByDOI,
  clearError,
  fetchAllUserSources,
  fetchSourcesByProject,
} from '../../store/features/sourceSlice';
import { addExistingSourcesToProject } from '../../store/features/projectSlice';
import {
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
type ManualFormInputs = {
  title: string;
  authors: string;
  year: string;
  type: string;
  language: 'persian' | 'english';
  abstract?: string;
  journal?: string;
  publisher?: string;
  volume?: string;
  issue?: string;
  pages?: string;
  doi?: string;
  isbn?: string;
  url?: string;
  tags?: string;
};
type DoiFormInputs = { doi: string };
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
  const [showAdvancedFields, setShowAdvancedFields] = useState(false);
  const [citationText, setCitationText] = useState('');
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
    setValue,
  } = useForm<ManualFormInputs>();
  // فرم برای وارد کردن با DOI
  const {
    register: registerDoi,
    handleSubmit: handleSubmitDoi,
    reset: resetDoi,
  } = useForm<DoiFormInputs>();

  useEffect(() => {
    // با هر بار باز شدن مودال، خطاها را پاک کن و منابع را واکشی کن
    if (open) {
      dispatch(clearError());
      // واکشی تمام منابع برای تب کتابخانه
      dispatch(
        fetchAllUserSources({
          page: 1,
          limit: 1000,
          sortBy: 'createdAt',
          sortOrder: 'desc',
        })
      );
    }
  }, [open, dispatch]);

  const handleAddFromLibrary = async () => {
    if (selectedLibrary.length === 0) return;
    await dispatch(
      addExistingSourcesToProject({
        projectId: projectId!,
        sourceIds: selectedLibrary,
      })
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

  const handleParseCitation = async () => {
    if (!citationText.trim()) return;

    try {
      const response = await fetch('/api/v1/sources/parse-citation', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({ citation: citationText }),
      });

      if (!response.ok) {
        throw new Error('خطا در استخراج اطلاعات');
      }

      const result = await response.json();
      const parsedData = result.data;

      // Fill the manual form with parsed data
      setValue('title', parsedData.title || '');
      setValue(
        'authors',
        parsedData.authors
          ?.map((a: any) => `${a.firstname} ${a.lastname}`)
          .join(', ') || ''
      );
      setValue('year', parsedData.year?.toString() || '');
      setValue('type', parsedData.type || 'article');
      setValue('language', parsedData.language || 'persian');
      setValue('abstract', '');
      setValue('journal', parsedData.publicationDetails?.journal || '');
      setValue('publisher', parsedData.publicationDetails?.publisher || '');
      setValue('volume', parsedData.publicationDetails?.volume || '');
      setValue('issue', parsedData.publicationDetails?.issue || '');
      setValue('pages', parsedData.publicationDetails?.pages || '');
      setValue('doi', parsedData.identifiers?.doi || '');
      setValue('isbn', parsedData.identifiers?.isbn || '');
      setValue('url', parsedData.identifiers?.url || '');
      setValue('tags', '');

      // Switch to manual tab to show the filled form
      setActiveTab(0);
      setShowAdvancedFields(true);

      // Clear citation text
      setCitationText('');
    } catch (error) {
      console.error('Parse citation error:', error);
      // Handle error (you might want to show a toast or alert)
    }
  };

  const handleClose = () => {
    resetManual();
    resetDoi();
    setShowAdvancedFields(false);
    onClose();
  };

  // ارسال فرم دستی
  const onManualSubmit: SubmitHandler<ManualFormInputs> = async (data) => {
    const processedData = {
      projectId,
      title: data.title,
      type: data.type || 'article',
      language: data.language || 'english',
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
      year: Number(data.year) || undefined,
      abstract: data.abstract || undefined,
      publicationDetails: {
        journal: data.journal || undefined,
        publisher: data.publisher || undefined,
        volume: data.volume || undefined,
        issue: data.issue || undefined,
        pages: data.pages || undefined,
      },
      identifiers: {
        doi: data.doi || undefined,
        isbn: data.isbn || undefined,
        url: data.url || undefined,
      },
      tags: data.tags
        ? data.tags
            .split(/[,،|]/)
            .map((tag) => tag.trim())
            .filter((tag) => tag)
        : [],
    };
    console.log('add source manual data ----> ', processedData);
    const result = await dispatch(
      createSource(processedData as CreateSourceData)
    );
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
    const result = await dispatch(
      importSourceByDOI({ ...data, projectId: projectId as string })
    );
    if (importSourceByDOI.fulfilled.match(result)) {
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
            <Tab
              label={
                <Stack direction='row' spacing={1} alignItems='center'>
                  <SearchIcon fontSize='small' />
                  <span>Parse Citation</span>
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
        )}

        {/* Tab Content */}
        <Box sx={{ minHeight: 300 }}>
          {/* Manual Tab */}
          <Box hidden={activeTab !== 0}>
            <form onSubmit={handleSubmitManual(onManualSubmit)}>
              <Stack spacing={3}>
                {/* فیلدهای پایه و ضروری */}
                <Typography
                  variant='h6'
                  color='primary'
                  fontWeight='600'
                  sx={{ mb: 1 }}
                >
                  اطلاعات پایه منبع *
                </Typography>

                <TextField
                  autoFocus
                  label='عنوان منبع *'
                  placeholder='عنوان مقاله یا کتاب'
                  fullWidth
                  variant='outlined'
                  {...registerManual('title', {
                    required: 'عنوان منبع الزامی است',
                  })}
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      borderRadius: 2,
                    },
                  }}
                  error={!!error}
                />

                <TextField
                  label='نویسندگان *'
                  placeholder='نام و نام خانوادگی نویسندگان با ("," یا "،" یا "|" ) جدا کنید'
                  fullWidth
                  variant='outlined'
                  {...registerManual('authors', {
                    required: 'نام نویسندگان الزامی است',
                  })}
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      borderRadius: 2,
                    },
                  }}
                  helperText='نام و نام خانوادگی نویسندگان را با ("," یا "،" یا "|" ) جدا کنید'
                  error={!!error}
                />

                <TextField
                  label='سال انتشار *'
                  type='number'
                  placeholder='2024'
                  fullWidth
                  variant='outlined'
                  {...registerManual('year', {
                    required: 'سال انتشار الزامی است',
                  })}
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      borderRadius: 2,
                    },
                  }}
                  error={!!error}
                />

                <TextField
                  label='نوع منبع *'
                  select
                  fullWidth
                  variant='outlined'
                  defaultValue='article'
                  {...registerManual('type', {
                    required: 'نوع منبع الزامی است',
                  })}
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      borderRadius: 2,
                    },
                  }}
                  SelectProps={{
                    native: true,
                  }}
                  error={!!error}
                >
                  <option value='article'>مقاله</option>
                  <option value='book'>کتاب</option>
                  <option value='thesis'>پایان‌نامه</option>
                  <option value='website'>وب‌سایت</option>
                  <option value='other'>سایر</option>
                </TextField>

                <TextField
                  label='زبان منبع *'
                  select
                  fullWidth
                  variant='outlined'
                  defaultValue='english'
                  {...registerManual('language', {
                    required: 'زبان منبع الزامی است',
                  })}
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      borderRadius: 2,
                    },
                  }}
                  SelectProps={{
                    native: true,
                  }}
                  error={!!error}
                  helperText='زبان منبع را انتخاب کنید تا تاریخ به درستی ذخیره شود'
                >
                  <option value='english'>انگلیسی</option>
                  <option value='persian'>فارسی</option>
                </TextField>

                {/* دکمه نمایش فیلدهای تکمیلی */}
                <Box sx={{ display: 'flex', justifyContent: 'center', mt: 2 }}>
                  <Button
                    variant='outlined'
                    onClick={() => setShowAdvancedFields(!showAdvancedFields)}
                    sx={{
                      borderRadius: 2,
                      textTransform: 'none',
                      fontWeight: 500,
                      px: 3,
                      py: 1,
                      borderStyle: 'dashed',
                      borderWidth: 2,
                      '&:hover': {
                        borderStyle: 'solid',
                        borderWidth: 2,
                      },
                    }}
                  >
                    {showAdvancedFields ? 'مخفی کردن' : 'افزودن'} اطلاعات تکمیلی
                    منبع (اختیاری)
                  </Button>
                </Box>

                {/* فیلدهای تکمیلی */}
                {showAdvancedFields && (
                  <Box>
                    <Typography
                      variant='h6'
                      color='text.secondary'
                      fontWeight='600'
                      sx={{ mb: 2 }}
                    >
                      اطلاعات تکمیلی (اختیاری)
                    </Typography>

                    <Stack spacing={3}>
                      <TextField
                        label='چکیده'
                        multiline
                        rows={3}
                        placeholder='چکیده یا خلاصه منبع'
                        fullWidth
                        variant='outlined'
                        {...registerManual('abstract')}
                        sx={{
                          '& .MuiOutlinedInput-root': {
                            borderRadius: 2,
                          },
                        }}
                      />

                      <TextField
                        label='نام ژورنال/مجله'
                        placeholder='نام ژورنال یا مجله'
                        fullWidth
                        variant='outlined'
                        {...registerManual('journal')}
                        sx={{
                          '& .MuiOutlinedInput-root': {
                            borderRadius: 2,
                          },
                        }}
                      />

                      <TextField
                        label='ناشر'
                        placeholder='نام ناشر'
                        fullWidth
                        variant='outlined'
                        {...registerManual('publisher')}
                        sx={{
                          '& .MuiOutlinedInput-root': {
                            borderRadius: 2,
                          },
                        }}
                      />

                      <TextField
                        label='جلد'
                        placeholder='شماره جلد'
                        fullWidth
                        variant='outlined'
                        {...registerManual('volume')}
                        sx={{
                          '& .MuiOutlinedInput-root': {
                            borderRadius: 2,
                          },
                        }}
                      />

                      <TextField
                        label='شماره'
                        placeholder='شماره مجله'
                        fullWidth
                        variant='outlined'
                        {...registerManual('issue')}
                        sx={{
                          '& .MuiOutlinedInput-root': {
                            borderRadius: 2,
                          },
                        }}
                      />

                      <TextField
                        label='صفحات'
                        placeholder='مثال: 123-145 یا 123'
                        fullWidth
                        variant='outlined'
                        {...registerManual('pages')}
                        sx={{
                          '& .MuiOutlinedInput-root': {
                            borderRadius: 2,
                          },
                        }}
                      />

                      <TextField
                        label='DOI'
                        placeholder='10.1038/s41586-021-03511-4'
                        fullWidth
                        variant='outlined'
                        {...registerManual('doi')}
                        sx={{
                          '& .MuiOutlinedInput-root': {
                            borderRadius: 2,
                          },
                        }}
                      />

                      <TextField
                        label='ISBN'
                        placeholder='978-0-123456-78-9'
                        fullWidth
                        variant='outlined'
                        {...registerManual('isbn')}
                        sx={{
                          '& .MuiOutlinedInput-root': {
                            borderRadius: 2,
                          },
                        }}
                      />

                      <TextField
                        label='لینک'
                        placeholder='https://example.com'
                        fullWidth
                        variant='outlined'
                        {...registerManual('url')}
                        sx={{
                          '& .MuiOutlinedInput-root': {
                            borderRadius: 2,
                          },
                        }}
                      />

                      <TextField
                        label='برچسب‌ها'
                        placeholder='برچسب‌ها را با ("," یا "،" یا "|" ) جدا کنید'
                        fullWidth
                        variant='outlined'
                        {...registerManual('tags')}
                        sx={{
                          '& .MuiOutlinedInput-root': {
                            borderRadius: 2,
                          },
                        }}
                        helperText='برچسب‌ها را با ("," یا "،" یا "|" ) جدا کنید'
                      />
                    </Stack>
                  </Box>
                )}
              </Stack>
            </form>
          </Box>
          {/* DOI Tab */}
          <Box hidden={activeTab !== 1}>
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

          {/* Parse Citation Tab */}
          <Box hidden={activeTab !== 2}>
            <Stack spacing={3}>
              <Typography variant='h6' color='primary' fontWeight='600'>
                استخراج اطلاعات از Citation
              </Typography>
              <TextField
                label='متن Citation'
                multiline
                rows={6}
                fullWidth
                value={citationText}
                onChange={(e) => setCitationText(e.target.value)}
                placeholder='مثال APA: Smith, J., & Johnson, M. (2024). The impact of technology on education. Journal of Educational Technology, 15(3), 123-145. doi:10.1234/jet.2024.001

مثال MLA: Smith, John, and Mary Johnson. "The Impact of Technology on Education." Journal of Educational Technology, vol. 15, no. 3, 2024, pp. 123-145.

مثال Chicago: Smith, John, and Mary Johnson. "The Impact of Technology on Education." Journal of Educational Technology 15, no. 3 (2024): 123-145.

مثال Vancouver: 1. Smith J, Johnson M. The impact of technology on education. J Educ Technol. 2024;15(3):123-145.

مثال Harvard: Smith, J & Johnson, M 2024, "The impact of technology on education", Journal of Educational Technology, vol. 15, no. 3, pp. 123-145, retrieved from https://doi.org/10.1234/jet.2024.001'
                helperText='متن citation را در فرمت APA، MLA، Chicago، Vancouver، Harvard یا سایر فرمت‌های متداول وارد کنید'
                sx={{
                  '& .MuiOutlinedInput-root': {
                    borderRadius: 2,
                  },
                }}
              />
              <Button
                variant='contained'
                onClick={handleParseCitation}
                disabled={!citationText.trim() || isLoading}
                sx={{
                  borderRadius: 2,
                  textTransform: 'none',
                  fontWeight: 500,
                  py: 1.5,
                }}
              >
                {isLoading ? (
                  <>
                    <CircularProgress
                      size={20}
                      color='inherit'
                      sx={{ mr: 1 }}
                    />
                    در حال پردازش...
                  </>
                ) : (
                  'استخراج اطلاعات'
                )}
              </Button>
            </Stack>
          </Box>

          {/* Library Tab */}
          {projectId && (
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
                            (projectSource) => projectSource._id === option._id
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
                              {option.authors && option.authors.length > 0 && (
                                <Chip
                                  icon={<PersonIcon />}
                                  label={option.authors
                                    .map((a) =>
                                      `${a.firstname} ${a.lastname}`.trim()
                                    )
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
                          ابتدا منابعی را به صورت دستی یا از طریق DOI اضافه کنید
                        </Typography>
                      </Paper>
                    )}
                  </>
                )}
              </Stack>
            </Box>
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
              ? handleSubmitManual(onManualSubmit)
              : activeTab === 1
              ? handleSubmitDoi(onDoiSubmit)
              : activeTab === 2
              ? handleParseCitation
              : handleAddFromLibrary
          }
          variant='contained'
          disabled={
            isLoading ||
            (activeTab === 2 && !citationText.trim()) ||
            (activeTab === 3 && selectedLibrary.length === 0)
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
          ) : activeTab === 2 ? (
            'استخراج اطلاعات'
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
