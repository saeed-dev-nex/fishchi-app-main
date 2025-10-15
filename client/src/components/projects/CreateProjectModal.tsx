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
} from '@mui/material';
import type React from 'react';
import { useDispatch, useSelector } from 'react-redux';
import type { AppDispatch, RootState } from '../../store';
import { useForm, type SubmitHandler } from 'react-hook-form';
import { projectSchema, type CreateProjectFormInputs } from '../../types';
import { zodResolver } from '@hookform/resolvers/zod';
import { createProject } from '../../store/features/projectSlice';

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
  const onSubmit: SubmitHandler<CreateProjectFormInputs> = async (data) => {
    const result = await dispatch(createProject(data));
    console.log(createProject.fulfilled.match(result));
    if (createProject.fulfilled.match(result)) {
      reset();
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

            <TextField
              margin='dense'
              label='برچسب‌ها (اختیاری)'
              type='text'
              fullWidth
              variant='outlined'
              {...register('tags')}
              placeholder='مثال: تحقیق، پایان‌نامه، مقاله'
              helperText='برچسب‌ها را با کاما جدا کنید'
            />
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
