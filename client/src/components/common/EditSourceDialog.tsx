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
} from '@mui/material';
import type { IAuthor, ISource } from '../../types';

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
  const [showAdvancedFields, setShowAdvancedFields] = useState(false);

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
        tags: source.tags?.join(', ') || '',
      });
    }
  }, [source, reset]);

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

                    <Controller
                      name='tags'
                      control={control}
                      render={({ field }) => (
                        <TextField
                          {...field}
                          label='برچسب‌ها'
                          placeholder='برچسب‌ها را با ("," یا "،" یا "|" ) جدا کنید'
                          fullWidth
                          helperText='برچسب‌ها را با ("," یا "،" یا "|" ) جدا کنید'
                          sx={{
                            '& .MuiOutlinedInput-root': {
                              borderRadius: 2,
                            },
                          }}
                        />
                      )}
                    />
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
