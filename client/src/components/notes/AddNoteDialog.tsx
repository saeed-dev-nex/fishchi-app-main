import React from 'react';
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
  Typography,
  Alert,
  alpha,
  Box,
} from '@mui/material';
import {
  Close as CloseIcon,
  AutoAwesome as AutoAwesomeIcon,
} from '@mui/icons-material';
import RichTextEditor from '../common/RichTextEditor';

interface AddNoteDialogProps {
  open: boolean;
  onClose: () => void;
  content: string;
  onContentChange: (content: string) => void;
  pageRef: string;
  onPageRefChange: (pageRef: string) => void;
  tags: string[];
  onTagsChange: (tags: string[]) => void;
  onSave: () => void;
  isLoading: boolean;
  editorKey: number;
  onSuggestTags: () => void;
  suggestTagsLoading: boolean;
  suggestTagsError: string | null;
}

const AddNoteDialog: React.FC<AddNoteDialogProps> = ({
  open,
  onClose,
  content,
  onContentChange,
  pageRef,
  onPageRefChange,
  tags,
  onTagsChange,
  onSave,
  isLoading,
  editorKey,
  onSuggestTags,
  suggestTagsLoading,
  suggestTagsError,
}) => {
  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth='md'
      fullWidth
      PaperProps={{
        sx: {
          borderRadius: 3,
          maxHeight: '90vh',
        },
      }}
    >
      <DialogTitle>
        <Stack
          direction='row'
          justifyContent='space-between'
          alignItems='center'
        >
          <Typography variant='h6' fontWeight='600'>
            فیش جدید
          </Typography>
          <IconButton onClick={onClose}>
            <CloseIcon />
          </IconButton>
        </Stack>
      </DialogTitle>

      <DialogContent>
        <Box sx={{ mb: 2 }}>
          <RichTextEditor
            key={editorKey}
            content={content}
            onChange={onContentChange}
          />
        </Box>

        <Stack spacing={2} sx={{ mb: 2 }}>
          <Stack direction='row' spacing={1} alignItems='center'>
            <Autocomplete
              multiple
              freeSolo
              options={[]}
              value={tags}
              onChange={(_event, newValue) => onTagsChange(newValue as string[])}
              renderTags={(value, getTagProps) =>
                value.map((option, index) => {
                  const { key, ...tagProps } = getTagProps({ index });
                  return (
                    <Chip key={key} label={option} size='small' {...tagProps} />
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
                  onClick={onSuggestTags}
                  disabled={suggestTagsLoading || !content.trim()}
                  sx={{
                    bgcolor: (theme) => alpha(theme.palette.primary.main, 0.1),
                    '&:hover': {
                      bgcolor: (theme) => alpha(theme.palette.primary.main, 0.2),
                    },
                  }}
                >
                  {suggestTagsLoading ? (
                    <CircularProgress size={24} />
                  ) : (
                    <AutoAwesomeIcon />
                  )}
                </IconButton>
              </span>
            </Tooltip>
          </Stack>

          {suggestTagsError && (
            <Alert severity='error' sx={{ borderRadius: 2 }}>
              {suggestTagsError}
            </Alert>
          )}
        </Stack>

        <TextField
          label='صفحه (اختیاری)'
          size='small'
          fullWidth
          value={pageRef}
          onChange={(e) => onPageRefChange(e.target.value)}
          sx={{
            '& .MuiOutlinedInput-root': {
              borderRadius: 2,
            },
          }}
        />
      </DialogContent>

      <DialogActions sx={{ p: 3 }}>
        <Button onClick={onClose} sx={{ borderRadius: 2, textTransform: 'none' }}>
          انصراف
        </Button>
        <Button
          variant='contained'
          onClick={onSave}
          disabled={isLoading || !content.trim()}
          sx={{
            borderRadius: 2,
            textTransform: 'none',
            fontWeight: 500,
            px: 3,
            minWidth: 120,
          }}
        >
          {isLoading ? (
            <CircularProgress size={20} color='inherit' />
          ) : (
            'ثبت فیش'
          )}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default AddNoteDialog;
