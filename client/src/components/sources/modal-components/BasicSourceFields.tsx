import React from 'react';
import { TextField, Stack, Typography } from '@mui/material';
import { UseFormRegister } from 'react-hook-form';
import type { ManualFormInputs } from './types';

interface BasicSourceFieldsProps {
  register: UseFormRegister<ManualFormInputs>;
  error?: string;
}

const BasicSourceFields: React.FC<BasicSourceFieldsProps> = ({
  register,
  error,
}) => {
  return (
    <Stack spacing={3}>
      <Typography variant='h6' color='primary' fontWeight='600' sx={{ mb: 1 }}>
        اطلاعات پایه منبع *
      </Typography>

      <TextField
        autoFocus
        label='عنوان منبع *'
        placeholder='عنوان مقاله یا کتاب'
        fullWidth
        variant='outlined'
        {...register('title', {
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
        {...register('authors', {
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
        {...register('year', {
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
        {...register('type', {
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
        {...register('language', {
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
    </Stack>
  );
};

export default BasicSourceFields;
