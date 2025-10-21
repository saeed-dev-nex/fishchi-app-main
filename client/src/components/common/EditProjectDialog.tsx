import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
  Stack,
  IconButton,
  Tooltip,
  Alert,
  CircularProgress,
  alpha,
  Autocomplete,
  Chip,
} from '@mui/material';
import { AutoAwesome as AutoAwesomeIcon } from '@mui/icons-material';
import type { IProject } from '../../types';
import { useDispatch } from 'react-redux';
import type { AppDispatch } from '../../store';
import { suggestTags } from '../../store/features/noteSlice';

interface EditProjectDialogProps {
  open: boolean;
  onClose: () => void;
  onSave: (formData: IProject) => void;
  project: IProject;
}

export const EditProjectDialog: React.FC<EditProjectDialogProps> = ({
  open,
  onClose,
  onSave,
  project,
}) => {
  const dispatch = useDispatch<AppDispatch>();
  const [form, setForm] = useState({
    title: '',
    description: '',
    tags: [] as string[],
  });
  const [isSuggestingTags, setIsSuggestingTags] = useState(false);
  const [tagSuggestionError, setTagSuggestionError] = useState<string | null>(null);
  const [tagInputValue, setTagInputValue] = useState('');

  useEffect(() => {
    if (project) {
      setForm({
        title: project.title || '',
        description: project.description || '',
        tags: project.tags || [],
      });
    }
  }, [project]);

  const handleSave = () => {
    onSave(form as IProject);
  };

  const handleSuggestTags = async () => {
    const textContent = `${form.title || ''} ${form.description || ''}`.trim();
    
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
        const existingTags = form.tags || [];
        const allTags = Array.from(new Set([...existingTags, ...suggestedTags]));
        setForm({ ...form, tags: allTags });
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
      <DialogTitle>ویرایش پروژه</DialogTitle>
      <DialogContent>
        <Stack spacing={3} sx={{ mt: 2 }}>
          <TextField
            label='عنوان پروژه'
            value={form.title}
            onChange={(e) => setForm({ ...form, title: e.target.value })}
            fullWidth
            required
          />
          <TextField
            label='توضیحات'
            value={form.description}
            onChange={(e) => setForm({ ...form, description: e.target.value })}
            multiline
            rows={4}
            fullWidth
          />
          <Stack direction='row' spacing={1} alignItems='flex-start'>
            <Autocomplete
              multiple
              freeSolo
              options={[]}
              value={form.tags}
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
                    const updatedTags = Array.from(new Set([...form.tags, ...newTags]));
                    setForm({ ...form, tags: updatedTags });
                    setTagInputValue('');
                  }
                } else {
                  setTagInputValue(newInputValue);
                }
              }}
              onChange={(_, newValue) => {
                setForm({ ...form, tags: newValue });
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
                />
              )}
              fullWidth
            />
            <Tooltip title='پیشنهاد خودکار برچسب‌ها با هوش مصنوعی'>
              <span>
                <IconButton
                  color='primary'
                  onClick={handleSuggestTags}
                  disabled={isSuggestingTags || !form.title}
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
            <Alert severity='error' sx={{ mt: 1 }}>
              {tagSuggestionError}
            </Alert>
          )}
        </Stack>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>انصراف</Button>
        <Button onClick={handleSave} variant='contained'>
          ذخیره
        </Button>
      </DialogActions>
    </Dialog>
  );
};
