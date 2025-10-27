import React from 'react';
import {
  Box,
  TextField,
  Stack,
  Typography,
  Autocomplete,
  Chip,
  IconButton,
  Tooltip,
  alpha,
  Alert,
  CircularProgress,
} from '@mui/material';
import { AutoAwesome as AutoAwesomeIcon } from '@mui/icons-material';
import type {
  UseFormRegister,
  UseFormSetValue,
  UseFormWatch,
} from 'react-hook-form';
import type { ManualFormInputs } from './types';

interface AdvancedSourceFieldsProps {
  register: UseFormRegister<ManualFormInputs>;
  setValue: UseFormSetValue<ManualFormInputs>;
  watch: UseFormWatch<ManualFormInputs>;
  tags: string[];
  setTags: (tags: string[]) => void;
  tagInputValue: string;
  setTagInputValue: (value: string) => void;
  onSuggestTags: () => void;
  isSuggestingTags: boolean;
  tagSuggestionError: string | null;
}

const AdvancedSourceFields: React.FC<AdvancedSourceFieldsProps> = ({
  register,
  setValue,
  watch,
  tags,
  setTags,
  tagInputValue,
  setTagInputValue,
  onSuggestTags,
  isSuggestingTags,
  tagSuggestionError,
}) => {
  return (
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
          {...register('abstract')}
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
          {...register('journal')}
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
          {...register('publisher')}
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
          {...register('volume')}
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
          {...register('issue')}
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
          {...register('pages')}
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
          {...register('doi')}
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
          {...register('isbn')}
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
          {...register('url')}
          sx={{
            '& .MuiOutlinedInput-root': {
              borderRadius: 2,
            },
          }}
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
                  .map((tag) => tag.trim())
                  .filter(Boolean);
                if (newTags.length > 0) {
                  const updatedTags = Array.from(
                    new Set([...tags, ...newTags])
                  );
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
                variant='outlined'
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
                onClick={onSuggestTags}
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
  );
};

export default AdvancedSourceFields;
