import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Stack,
  Chip,
  Autocomplete,
  CircularProgress,
  IconButton,
  Tooltip,
  alpha,
  Alert,
} from '@mui/material';
import {
  Close as CloseIcon,
  AutoAwesome as AutoAwesomeIcon,
} from '@mui/icons-material';
import { useDispatch, useSelector } from 'react-redux';
import type { AppDispatch, RootState } from '../../store';
import { updateNote, suggestTags } from '../../store/features/noteSlice';
import type { INote } from '../../types';
import RichTextEditor from '../common/RichTextEditor';

interface EditNoteModalProps {
  open: boolean;
  onClose: () => void;
  note: INote;
}

const EditNoteModal: React.FC<EditNoteModalProps> = ({
  open,
  onClose,
  note,
}) => {
  const dispatch = useDispatch<AppDispatch>();
  const { isLoading, suggestTags: suggestTagsState } = useSelector(
    (state: RootState) => state.notes
  );

  const [content, setContent] = useState(note.content);
  const [pageRef, setPageRef] = useState(note.pageRef || '');
  const [tags, setTags] = useState<string[]>(note.tags || []);
  const [error, setError] = useState<string | null>(null);

  // Update state when note changes
  useEffect(() => {
    if (open) {
      setContent(note.content);
      setPageRef(note.pageRef || '');
      setTags(note.tags || []);
      setError(null);
    }
  }, [note, open]);

  const handleSuggestTags = async () => {
    if (!content.trim()) return;

    try {
      const result = await dispatch(
        suggestTags({ htmlContent: content })
      ).unwrap();
      if (result && result.length > 0) {
        const newTags = result.filter((tag: string) => !tags.includes(tag));
        setTags([...tags, ...newTags]);
      }
    } catch (error) {
      console.error('Error suggesting tags:', error);
    }
  };

  const handleSave = async () => {
    if (!content.trim()) {
      setError('محتوای فیش نمی‌تواند خالی باشد');
      return;
    }

    try {
      await dispatch(
        updateNote({
          id: note._id,
          content,
          pageRef: pageRef || undefined,
          tags: tags.length > 0 ? tags : undefined,
        })
      ).unwrap();
      onClose();
    } catch (error) {
      setError('خطا در ویرایش فیش. لطفا دوباره تلاش کنید.');
      console.error('Error updating note:', error);
    }
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth='md'
      fullWidth
      PaperProps={{
        sx: {
          borderRadius: 3,
          minHeight: '500px',
        },
      }}
    >
      <DialogTitle
        sx={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          borderBottom: (theme) => `1px solid ${theme.palette.divider}`,
          pb: 2,
        }}
      >
        ویرایش فیش
        <IconButton onClick={onClose} size='small'>
          <CloseIcon />
        </IconButton>
      </DialogTitle>

      <DialogContent sx={{ pt: 3 }}>
        <Stack spacing={3}>
          {error && (
            <Alert severity='error' onClose={() => setError(null)}>
              {error}
            </Alert>
          )}

          <RichTextEditor
            content={content}
            onChange={(newContent) => setContent(newContent)}
          />

          <Stack direction='row' spacing={1} alignItems='center'>
            <Autocomplete
              multiple
              freeSolo
              options={[]}
              value={tags}
              onChange={(_event, newValue) => setTags(newValue as string[])}
              renderTags={(value, getTagProps) =>
                value.map((option, index) => {
                  const { key, ...tagProps } = getTagProps({ index });
                  return (
                    <Chip
                      key={key}
                      label={option}
                      size='small'
                      {...tagProps}
                    />
                  );
                })
              }
              renderInput={(params) => (
                <TextField
                  {...params}
                  label='برچسب‌ها (اختیاری)'
                  placeholder='برچسب اضافه کنید...'
                  size='small'
                />
              )}
              sx={{
                flex: 1,
                '& .MuiOutlinedInput-root': {
                  borderRadius: 2,
                },
              }}
            />
            <Tooltip title='پیشنهاد خودکار برچسب‌ها با هوش مصنوعی'>
              <span>
                <IconButton
                  color='primary'
                  onClick={handleSuggestTags}
                  disabled={suggestTagsState.isLoading || !content.trim()}
                  sx={{
                    bgcolor: (theme) => alpha(theme.palette.primary.main, 0.1),
                    '&:hover': {
                      bgcolor: (theme) => alpha(theme.palette.primary.main, 0.2),
                    },
                  }}
                >
                  {suggestTagsState.isLoading ? (
                    <CircularProgress size={24} />
                  ) : (
                    <AutoAwesomeIcon />
                  )}
                </IconButton>
              </span>
            </Tooltip>
          </Stack>

          <TextField
            label='صفحه (اختیاری)'
            size='small'
            value={pageRef}
            onChange={(e) => setPageRef(e.target.value)}
            sx={{
              width: '200px',
              '& .MuiOutlinedInput-root': {
                borderRadius: 2,
              },
            }}
          />
        </Stack>
      </DialogContent>

      <DialogActions
        sx={{
          px: 3,
          pb: 2,
          borderTop: (theme) => `1px solid ${theme.palette.divider}`,
        }}
      >
        <Button
          onClick={onClose}
          variant='outlined'
          sx={{ borderRadius: 2, textTransform: 'none' }}
        >
          انصراف
        </Button>
        <Button
          onClick={handleSave}
          variant='contained'
          disabled={isLoading || !content.trim()}
          sx={{ borderRadius: 2, textTransform: 'none', minWidth: 100 }}
        >
          {isLoading ? <CircularProgress size={20} color='inherit' /> : 'ذخیره'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default EditNoteModal;
