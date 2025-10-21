import {
  Button,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Box,
  Stack,
  IconButton,
  Tooltip,
  Alert,
  alpha,
  Autocomplete,
  Chip,
} from '@mui/material';
import { AutoAwesome as AutoAwesomeIcon } from '@mui/icons-material';
import type React from 'react';
import { useDispatch, useSelector } from 'react-redux';
import type { AppDispatch, RootState } from '../../store';
import { useForm, type SubmitHandler } from 'react-hook-form';
import { projectSchema, type CreateProjectFormInputs } from '../../types';
import { zodResolver } from '@hookform/resolvers/zod';
import { createProject } from '../../store/features/projectSlice';
import { suggestTags } from '../../store/features/noteSlice';
import { useState } from 'react';

type createProjectModalProps = {
  open: boolean;
  onClose: () => void;
};

const CreateProjectModal: React.FC<createProjectModalProps> = ({
  open,
  onClose,
}) => {
  const dispatch = useDispatch<AppDispatch>();
  const { isLoading, error } = useSelector(
    (state: RootState) => state.projects
  );
  const [isSuggestingTags, setIsSuggestingTags] = useState(false);
  const [tagSuggestionError, setTagSuggestionError] = useState<string | null>(null);
  const [tags, setTags] = useState<string[]>([]);
  const [tagInputValue, setTagInputValue] = useState('');
  const {
    register,
    handleSubmit,
    reset,
    watch,
    setValue,
    formState: { errors },
  } = useForm<CreateProjectFormInputs>({
    resolver: zodResolver(projectSchema),
    defaultValues: {
      status: 'در حال انجام',
      priority: 'متوسط',
    },
  });

  const watchedStatus = watch('status');
  const watchedPriority = watch('priority');
  const watchedTitle = watch('title');
  const watchedDescription = watch('description');
  const watchedTags = watch('tags');

  const handleSuggestTags = async () => {
    const textContent = `${watchedTitle || ''} ${watchedDescription || ''}`.trim();
    
    if (!textContent || textContent.length < 20) {
      setTagSuggestionError('عنوان یا توضیحات کافی برای پیشنهاد تگ وجود ندارد');
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
  const onSubmit: SubmitHandler<CreateProjectFormInputs> = async (data) => {
    const result = await dispatch(createProject(data));
    console.log(createProject.fulfilled.match(result));
    if (createProject.fulfilled.match(result)) {
      reset();
      setTags([]);
      setTagInputValue('');
      onClose();
    }
  };
  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth='sm'>
      <DialogTitle>ایجاد پروژه جدید</DialogTitle>
      <form onSubmit={handleSubmit(onSubmit)}>
        <DialogContent>
          <DialogContentText sx={{ mb: 2 }}>
            برای ایجاد پروژه جدید، اطلاعات زیر را تکمیل کنید.
          </DialogContentText>
          {error && <p style={{ color: 'red' }}>{error}</p>}

          <Stack spacing={3}>
            <TextField
              autoFocus
              margin='dense'
              label='عنوان پروژه'
              type='text'
              fullWidth
              variant='outlined'
              {...register('title')}
              error={!!errors.title}
              helperText={errors.title?.message}
              required
            />

            <TextField
              margin='dense'
              label='توضیحات پروژه'
              type='text'
              fullWidth
              multiline
              rows={3}
              variant='outlined'
              {...register('description')}
              error={!!errors.description}
              helperText={errors.description?.message}
            />

            <Box sx={{ display: 'flex', gap: 2 }}>
              <FormControl fullWidth>
                <InputLabel>وضعیت</InputLabel>
                <Select
                  value={watchedStatus}
                  onChange={(e) => setValue('status', e.target.value as any)}
                  label='وضعیت'
                >
                  <MenuItem value='در حال انجام'>در حال انجام</MenuItem>
                  <MenuItem value='خاتمه یافته'>خاتمه یافته</MenuItem>
                  <MenuItem value='کنسل شده'>کنسل شده</MenuItem>
                </Select>
              </FormControl>

              <FormControl fullWidth>
                <InputLabel>اولویت</InputLabel>
                <Select
                  value={watchedPriority}
                  onChange={(e) => setValue('priority', e.target.value as any)}
                  label='اولویت'
                >
                  <MenuItem value='کم'>کم</MenuItem>
                  <MenuItem value='متوسط'>متوسط</MenuItem>
                  <MenuItem value='زیاد'>زیاد</MenuItem>
                  <MenuItem value='فوری'>فوری</MenuItem>
                </Select>
              </FormControl>
            </Box>

            <TextField
              margin='dense'
              label='مدت تخمینی (روز)'
              type='number'
              fullWidth
              variant='outlined'
              {...register('estimatedDuration', { valueAsNumber: true })}
              inputProps={{ min: 1, max: 365 }}
              helperText='تعداد روزهای تخمینی برای تکمیل پروژه'
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
                    margin='dense'
                    label='برچسب‌ها (اختیاری)'
                    placeholder='مثال: تحقیق، پایان‌نامه، مقاله'
                    helperText='برچسب‌ها را با کاما جدا کرده و Enter بزنید'
                  />
                )}
                fullWidth
              />
              <Tooltip title='پیشنهاد خودکار برچسب‌ها با هوش مصنوعی'>
                <span>
                  <IconButton
                    color='primary'
                    onClick={handleSuggestTags}
                    disabled={isSuggestingTags || !watchedTitle}
                    sx={{
                      mt: 1,
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
              <Alert severity='error' sx={{ mt: 1 }}>
                {tagSuggestionError}
              </Alert>
            )}
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={onClose} color='inherit'>
            انصراف
          </Button>
          <Button type='submit' variant='contained' disabled={isLoading}>
            {isLoading ? <CircularProgress size={24} /> : 'ایجاد پروژه'}
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
};

export default CreateProjectModal;
