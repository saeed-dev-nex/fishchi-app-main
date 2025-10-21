import React from 'react';
import {
  Box,
  Typography,
  Stack,
  IconButton,
  Tooltip,
  CircularProgress,
  Alert,
  Divider,
  alpha,
} from '@mui/material';
import {
  Delete as DeleteIcon,
  Edit as EditIcon,
  AutoFixHighOutlined,
} from '@mui/icons-material';
import type { INote } from '../../types';

interface NoteTabContentProps {
  note: INote;
  summary: {
    noteId: string | null;
    content: string | null;
    isLoading: boolean;
    error: string | null;
  };
  onEdit: (note: INote) => void;
  onDelete: (noteId: string) => void;
  onSummarize: () => void;
  onClearSummary: () => void;
}

const NoteTabContent: React.FC<NoteTabContentProps> = ({
  note,
  summary,
  onEdit,
  onDelete,
  onSummarize,
  onClearSummary,
}) => {
  const isSummarizing = summary.isLoading && summary.noteId === note._id;
  const summaryData = summary.noteId === note._id ? summary : null;

  const handleSummarizeClick = () => {
    if (summaryData && (summaryData.content || summaryData.error)) {
      onClearSummary();
    } else {
      onSummarize();
    }
  };

  return (
    <Box
      sx={{
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      {/* Note Actions */}
      <Stack
        direction='row'
        justifyContent='space-between'
        alignItems='center'
        sx={{ mb: 2 }}
      >
        <Typography variant='body2' color='text.secondary'>
          {note.pageRef ? `صفحه: ${note.pageRef}` : 'بدون صفحه‌مرجع'}
        </Typography>
        <Stack direction='row' spacing={1}>
          <Tooltip
            title={
              summaryData?.content
                ? 'پنهان کردن خلاصه'
                : 'خلاصه‌سازی با هوش مصنوعی'
            }
          >
            <IconButton
              size='small'
              onClick={handleSummarizeClick}
              disabled={isSummarizing}
            >
              {isSummarizing ? (
                <CircularProgress size={20} />
              ) : (
                <AutoFixHighOutlined fontSize='small' />
              )}
            </IconButton>
          </Tooltip>
          <Tooltip title='ویرایش فیش'>
            <IconButton size='small' onClick={() => onEdit(note)}>
              <EditIcon fontSize='small' />
            </IconButton>
          </Tooltip>
          <Tooltip title='حذف فیش'>
            <IconButton
              size='small'
              color='error'
              onClick={() => onDelete(note._id)}
            >
              <DeleteIcon fontSize='small' />
            </IconButton>
          </Tooltip>
        </Stack>
      </Stack>

      <Divider sx={{ mb: 2 }} />

      {/* Summary Section */}
      {summaryData && (
        <Box
          sx={{
            mt: 2,
            p: 2,
            bgcolor: 'background.paper',
            borderRadius: 2,
          }}
        >
          <Divider sx={{ mb: 2 }} />
          {summary.isLoading ? (
            <Box
              sx={{
                display: 'flex',
                alignItems: 'center',
                gap: 1,
              }}
            >
              <CircularProgress size={20} />
              <Typography variant='body2' color='text.secondary'>
                در حال خلاصه‌سازی...
              </Typography>
            </Box>
          ) : summary.error ? (
            <Alert severity='error' sx={{ fontSize: '0.8rem' }}>
              {summary.error}
            </Alert>
          ) : summary.content ? (
            <Box>
              <Typography
                variant='body2'
                fontWeight='bold'
                color='primary.main'
                sx={{ mb: 1 }}
              >
                خلاصه هوشمند:
              </Typography>
              <Typography
                variant='body2'
                color='text.secondary'
                sx={{ whiteSpace: 'pre-wrap' }}
              >
                {summary.content}
              </Typography>
            </Box>
          ) : null}
        </Box>
      )}

      {/* Note Content */}
      <Box
        sx={{
          flex: 1,
          overflow: 'auto',
          '& .ProseMirror': {
            minHeight: '200px',
            padding: 2,
            borderRadius: 2,
            border: (theme) => `1px solid ${theme.palette.divider}`,
            backgroundColor: (theme) =>
              alpha(theme.palette.background.paper, 0.5),
          },
        }}
        className='ProseMirror'
        dangerouslySetInnerHTML={{ __html: note.content }}
      />
    </Box>
  );
};

export default NoteTabContent;
