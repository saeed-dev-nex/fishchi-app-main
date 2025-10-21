import React from 'react';
import { TextField, Stack } from '@mui/material';
import { UseFormRegister } from 'react-hook-form';
import type { DoiFormInputs } from './types';

interface DoiSourceFormProps {
  register: UseFormRegister<DoiFormInputs>;
}

const DoiSourceForm: React.FC<DoiSourceFormProps> = ({ register }) => {
  return (
    <Stack spacing={3}>
      <TextField
        autoFocus
        label='DOI'
        placeholder='10.1038/s41586-021-03511-4'
        fullWidth
        variant='outlined'
        {...register('doi', { required: true })}
        sx={{
          '& .MuiOutlinedInput-root': {
            borderRadius: 2,
          },
        }}
        helperText='شناسه DOI مقاله را وارد کنید'
      />
    </Stack>
  );
};

export default DoiSourceForm;
