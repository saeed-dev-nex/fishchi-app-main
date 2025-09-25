import {
  Button,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  TextField,
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
    formState: { errors },
  } = useForm<CreateProjectFormInputs>({
    resolver: zodResolver(projectSchema),
  });
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
            لطفاً عنوان و توضیحات پروژه تحقیقاتی جدید خود را وارد کنید.
          </DialogContentText>
          {error && <p style={{ color: 'red' }}>{error}</p>}
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
          />
          <TextField
            margin='dense'
            label='توضیحات (اختیاری)'
            type='text'
            fullWidth
            multiline
            rows={4}
            variant='outlined'
            {...register('description')}
          />
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
