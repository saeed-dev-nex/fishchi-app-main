import React from 'react';
import {
  Box,
  Stack,
  TextField,
  Autocomplete,
  Chip,
  Typography,
  CircularProgress,
} from '@mui/material';
import type { ISource } from '../../../types';

interface LibrarySourceFormProps {
  librarySources: ISource[];
  availableLibrarySources: ISource[];
  selectedLibrary: string[];
  onLibrarySourceChange: (event: React.SyntheticEvent, newValue: ISource[]) => void;
  isLoading: boolean;
}

const LibrarySourceForm: React.FC<LibrarySourceFormProps> = ({
  librarySources,
  availableLibrarySources,
  selectedLibrary,
  onLibrarySourceChange,
  isLoading,
}) => {
  if (isLoading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Stack spacing={3}>
      <Autocomplete
        multiple
        options={librarySources.filter((option) =>
          availableLibrarySources.some((source) => source._id === option._id)
        )}
        getOptionLabel={(option) => option.title}
        value={availableLibrarySources.filter((source) =>
          selectedLibrary.includes(source._id)
        )}
        onChange={onLibrarySourceChange}
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
        renderTags={(value, getTagProps) =>
          value.map((option, index) => {
            const { key, ...tagProps } = getTagProps({ index });
            return (
              <Chip
                key={key}
                label={option.title}
                {...tagProps}
                sx={{ m: 0.5 }}
              />
            );
          })
        }
        renderOption={(props, option) => {
          const { key, ...optionProps } = props as any;
          return (
            <Box component='li' key={key} {...optionProps}>
              <Stack spacing={0.5} sx={{ width: '100%' }}>
                <Typography variant='body2' fontWeight={500}>
                  {option.title}
                </Typography>
                <Typography variant='caption' color='text.secondary'>
                  {option.authors?.map((a) => a.firstname + ' ' + a.lastname).join(', ')} •{' '}
                  {option.year}
                </Typography>
              </Stack>
            </Box>
          );
        }}
        sx={{
          '& .MuiOutlinedInput-root': {
            borderRadius: 2,
          },
        }}
      />
      {availableLibrarySources.length === 0 && (
        <Typography variant='body2' color='text.secondary' textAlign='center'>
          تمام منابع موجود در کتابخانه شما قبلاً به این پروژه اضافه شده‌اند
        </Typography>
      )}
    </Stack>
  );
};

export default LibrarySourceForm;
