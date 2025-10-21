// src/components/common/EditSourceDialog.tsx
import React, { useEffect, useState } from 'react';
import { useForm, Controller } from 'react-hook-form';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Stack,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Typography,
  Box,
  Fade,
  IconButton,
  Tooltip,
  CircularProgress,
  Alert,
  alpha,
  Autocomplete,
  Chip,
} from '@mui/material';
import { AutoAwesome as AutoAwesomeIcon } from '@mui/icons-material';
import type { IAuthor, ISource } from '../../types';
import { useDispatch } from 'react-redux';
import type { AppDispatch } from '../../store';
import { suggestTags } from '../../store/features/noteSlice';

// تعریف نوع داده‌های فرم
interface EditSourceForm {
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
}

interface EditSourceDialogProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (data: EditSourceForm) => void;
  source: ISource;
}

export const EditSourceDialog: React.FC<EditSourceDialogProps> = ({
  open,
  onClose,
  onSubmit,
  source,
}) => {
  const dispatch = useDispatch<AppDispatch>();
  const [showAdvancedFields, setShowAdvancedFields] = useState(false);
  const [isSuggestingTags, setIsSuggestingTags] = useState(false);
  const [tagSuggestionError, setTagSuggestionError] = useState<string | null>(null);
  const [tags, setTags] = useState<string[]>([]);
  const [tagInputValue, setTagInputValue] = useState('');

  const {
    control,
    handleSubmit,
    reset,
    watch,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<EditSourceForm>();

  useEffect(() => {
    if (source) {
      const sourceTags = source.tags || [];
      setTags(sourceTags);
      reset({
        title: source.title || '',
        authors:
          source.authors
            ?.map((a: IAuthor) => `${a.firstname} ${a.lastname}`.trim())
            .join(', ') || '',
        year: source.year?.toString() || '',
        type: source.type || '',
        language: source.language || 'english',
        abstract: source.abstract || '',
        journal: source.publicationDetails?.journal || '',
        publisher: source.publicationDetails?.publisher || '',
        volume: source.publicationDetails?.volume || '',
        issue: source.publicationDetails?.issue || '',
        pages: source.publicationDetails?.pages || '',
        doi: source.identifiers?.doi || '',
        isbn: source.identifiers?.isbn || '',
        url: source.identifiers?.url || '',
        tags: sourceTags.join(', ') || '',
      });
    }
  }, [source, reset]);

  const handleSuggestTags = async () => {
    const title = watch('title');
    const abstract = watch('abstract');
    const textContent = `${title || ''} ${abstract || ''}`.trim();
    
    if (!textContent || textContent.length < 20) {
      setTagSuggestionError('عنوان یا چکیده کافی برای پیشنهاد تگ وجود ندارد');
      return;
    }

    setIsSuggestingTags(true);
    setTagSuggestionError(null);

    try {
      const result = await dispatch(suggestTags({ textContent }));
      
      if (suggestTags.fulfilled.match(result)) {
        const suggestedTags = result.payload as string[];
        const allTags = Array.from(new Set([...tags, ...suggestedTags]));
        setTags(allTags);
        setValue('tags', allTags.join(', '));
      } else {
        setTagSuggestionError('خطا در پیشنهاد تگ‌ها');
      }
    } catch (err) {
      setTagSuggestionError('خطا در پیشنهاد تگ‌ها');
    } finally {
      setIsSuggestingTags(false);
    }
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth='md' fullWidth>
      <DialogTitle>ویرایش منبع</DialogTitle>
      <form onSubmit={handleSubmit(onSubmit)}>
        <DialogContent>
          <Stack spacing={3} sx={{ mt: 2 }}>
            {/* فیلدهای پایه و ضروری */}
            <Typography
              variant='h6'
              color='primary'
              fontWeight='600'
              sx={{ mb: 1 }}
            >
              اطلاعات پایه منبع *
            </Typography>

            <Controller
              name='title'
              control={control}
              rules={{ required: 'عنوان الزامی است' }}
              render={({ field }) => (
                <TextField
                  {...field}
                  label='عنوان منبع *'
                  fullWidth
                  error={!!errors.title}
                  helperText={errors.title?.message}
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      borderRadius: 2,
                    },
                  }}
                />
              )}
            />

            <Controller
              name='authors'
              control={control}
              rules={{ required: 'نام نویسندگان الزامی است' }}
              render={({ field }) => (
                <TextField
                  {...field}
                  label='نویسندگان *'
                  fullWidth
                  error={!!errors.authors}
                  helperText={
                    errors.authors?.message ||
                    'نام نویسندگان را با ("," یا "،" یا "|" ) جدا کنید'
                  }
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      borderRadius: 2,
                    },
                  }}
                />
              )}
            />

            <Controller
              name='year'
              control={control}
              rules={{ required: 'سال انتشار الزامی است' }}
              render={({ field }) => (
                <TextField
                  {...field}
                  label='سال انتشار *'
                  type='number'
                  fullWidth
                  error={!!errors.year}
                  helperText={errors.year?.message}
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      borderRadius: 2,
                    },
                  }}
                />
              )}
            />

            <Controller
              name='type'
              control={control}
              rules={{ required: 'نوع منبع الزامی است' }}
              render={({ field }) => (
                <FormControl fullWidth error={!!errors.type}>
                  <InputLabel>نوع منبع *</InputLabel>
                  <Select {...field} label='نوع منبع *'>
                    <MenuItem value='article'>مقاله</MenuItem>
                    <MenuItem value='book'>کتاب</MenuItem>
                    <MenuItem value='thesis'>پایان‌نامه</MenuItem>
                    <MenuItem value='website'>وب‌سایت</MenuItem>
                    <MenuItem value='other'>سایر</MenuItem>
                  </Select>
                </FormControl>
              )}
            />

            <Controller
              name='language'
              control={control}
              rules={{ required: 'زبان منبع الزامی است' }}
              render={({ field }) => (
                <FormControl fullWidth error={!!errors.language}>
                  <InputLabel>زبان منبع *</InputLabel>
                  <Select {...field} label='زبان منبع *'>
                    <MenuItem value='english'>انگلیسی</MenuItem>
                    <MenuItem value='persian'>فارسی</MenuItem>
                  </Select>
                </FormControl>
              )}
            />

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
              <Fade in={showAdvancedFields} timeout={300}>
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
                    <Controller
                      name='abstract'
                      control={control}
                      render={({ field }) => (
                        <TextField
                          {...field}
                          label='چکیده'
                          multiline
                          rows={3}
                          fullWidth
                          sx={{
                            '& .MuiOutlinedInput-root': {
                              borderRadius: 2,
                            },
                          }}
                        />
                      )}
                    />

                    <Controller
                      name='journal'
                      control={control}
                      render={({ field }) => (
                        <TextField
                          {...field}
                          label='نام ژورنال/مجله'
                          fullWidth
                          sx={{
                            '& .MuiOutlinedInput-root': {
                              borderRadius: 2,
                            },
                          }}
                        />
                      )}
                    />

                    <Controller
                      name='publisher'
                      control={control}
                      render={({ field }) => (
                        <TextField
                          {...field}
                          label='ناشر'
                          fullWidth
                          sx={{
                            '& .MuiOutlinedInput-root': {
                              borderRadius: 2,
                            },
                          }}
                        />
                      )}
                    />

                    <Controller
                      name='volume'
                      control={control}
                      render={({ field }) => (
                        <TextField
                          {...field}
                          label='جلد'
                          fullWidth
                          sx={{
                            '& .MuiOutlinedInput-root': {
                              borderRadius: 2,
                            },
                          }}
                        />
                      )}
                    />

                    <Controller
                      name='issue'
                      control={control}
                      render={({ field }) => (
                        <TextField
                          {...field}
                          label='شماره'
                          fullWidth
                          sx={{
                            '& .MuiOutlinedInput-root': {
                              borderRadius: 2,
                            },
                          }}
                        />
                      )}
                    />

                    <Controller
                      name='pages'
                      control={control}
                      render={({ field }) => (
                        <TextField
                          {...field}
                          label='صفحات'
                          placeholder='مثال: 123-145 یا 123'
                          fullWidth
                          sx={{
                            '& .MuiOutlinedInput-root': {
                              borderRadius: 2,
                            },
                          }}
                        />
                      )}
                    />

                    <Controller
                      name='doi'
                      control={control}
                      render={({ field }) => (
                        <TextField
                          {...field}
                          label='DOI'
                          placeholder='10.1038/s41586-021-03511-4'
                          fullWidth
                          sx={{
                            '& .MuiOutlinedInput-root': {
                              borderRadius: 2,
                            },
                          }}
                        />
                      )}
                    />

                    <Controller
                      name='isbn'
                      control={control}
                      render={({ field }) => (
                        <TextField
                          {...field}
                          label='ISBN'
                          placeholder='978-0-123456-78-9'
                          fullWidth
                          sx={{
                            '& .MuiOutlinedInput-root': {
                              borderRadius: 2,
                            },
                          }}
                        />
                      )}
                    />

                    <Controller
                      name='url'
                      control={control}
                      render={({ field }) => (
                        <TextField
                          {...field}
                          label='لینک'
                          placeholder='https://example.com'
                          fullWidth
                          sx={{
                            '& .MuiOutlinedInput-root': {
                              borderRadius: 2,
                            },
                          }}
                        />
                      )}
                    />

                    <Stack direction='row' spacing={1} alignItems='flex-start'>
                      <Autocomplete
                        multiple
                        freeSolo
                        options={[]}
                        value={tags}
                        inputValue={tagInputValue}
                        onInputChange={(_, newInputValue, reason) => {
                          if (reason === 'reset') {
                            setTagInputValue('');
                            return;
                          }
                          // Handle comma-separated input
                          if (newInputValue.includes(',') || newInputValue.includes('،')) {
                            const newTags = newInputValue
                              .split(/[,،]/)
                              .map(tag => tag.trim())
                              .filter(Boolean);
                            if (newTags.length > 0) {
                              const updatedTags = Array.from(new Set([...tags, ...newTags]));
                              setTags(updatedTags);
                              setValue('tags', updatedTags.join(', '));
                              setTagInputValue('');
                            }
                          } else {
                            setTagInputValue(newInputValue);
                          }
                        }}
                        onChange={(_, newValue) => {
                          setTags(newValue);
                          setValue('tags', newValue.join(', '));
                        }}
                        renderTags={(value, getTagProps) =>
                          value.map((option, index) => {
                            const { key, ...tagProps } = getTagProps({ index });
                            return (
                              <Chip
                                key={key}
                                label={option}
                                {...tagProps}
                                sx={{ m: 0.5 }}
                              />
                            );
                          })
                        }
                        renderInput={(params) => (
                          <TextField
                            {...params}
                            label='برچسب‌ها'
                            placeholder='برچسب‌ها را با کاما جدا کرده و Enter بزنید'
                            sx={{
                              '& .MuiOutlinedInput-root': {
                                borderRadius: 2,
                              },
                            }}
                          />
                        )}
                        fullWidth
                      />
                      <Tooltip title='پیشنهاد خودکار برچسب‌ها با هوش مصنوعی'>
                        <span>
                          <IconButton
                            color='primary'
                            onClick={handleSuggestTags}
                            disabled={isSuggestingTags || !watch('title')}
                            sx={{
                              bgcolor: (theme) => alpha(theme.palette.primary.main, 0.1),
                              '&:hover': {
                                bgcolor: (theme) => alpha(theme.palette.primary.main, 0.2),
                              },
                            }}
                          >
                            {isSuggestingTags ? (
                              <CircularProgress size={24} />
                            ) : (
                              <AutoAwesomeIcon />
                            )}
                          </IconButton>
                        </span>
                      </Tooltip>
                    </Stack>
                    {tagSuggestionError && (
                      <Alert severity='error' sx={{ mt: 1, borderRadius: 2 }}>
                        {tagSuggestionError}
                      </Alert>
                    )}
                  </Stack>
                </Box>
              </Fade>
            )}
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={onClose}>انصراف</Button>
          <Button type='submit' variant='contained' disabled={isSubmitting}>
            {isSubmitting ? 'در حال ذخیره...' : 'ذخیره'}
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
};
