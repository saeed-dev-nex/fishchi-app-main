// src/components/common/EditSourceDialog.tsx
import React, { useEffect } from 'react';
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
} from '@mui/material';
import type { IAuthor, ISource } from '../../types';

// تعریف نوع داده‌های فرم
interface EditSourceForm {
  title: string;
  authors: string;
  year: string;
  type: string;
  tags: string;
  abstract: string;
  url: string;
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
  const {
    control,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<EditSourceForm>();

  useEffect(() => {
    if (source) {
      reset({
        title: source.title || '',
        authors: source.authors?.map((a: IAuthor) => a.name).join(', ') || '',
        year: source.year?.toString() || '',
        type: source.type || '',
        tags: source.tags?.join(', ') || '',
        abstract: source.abstract || '',
        url: source.identifiers?.url || '',
      });
    }
  }, [source, reset]);

  return (
    <Dialog open={open} onClose={onClose} maxWidth='md' fullWidth>
      <DialogTitle>ویرایش منبع</DialogTitle>
      <form onSubmit={handleSubmit(onSubmit)}>
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
            {/* ... بقیه فیلدهای فرم به همین شکل ... */}
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
                <TextField {...field} label='سال' type='number' fullWidth />
              )}
            />
            <Controller
              name='type'
              control={control}
              rules={{ required: 'نوع الزامی است' }}
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
          <Button onClick={onClose}>انصراف</Button>
          <Button type='submit' variant='contained' disabled={isSubmitting}>
            {isSubmitting ? 'در حال ذخیره...' : 'ذخیره'}
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
};
