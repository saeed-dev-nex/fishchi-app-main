import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  Box,
  Typography,
  CircularProgress,
  Alert,
  Stack,
  Button,
  TextField,
  Avatar,
  Chip,
  alpha,
} from '@mui/material';
import { Description as DescriptionIcon } from '@mui/icons-material';
import type { AppDispatch, RootState } from '../../store';
import {
  createNote,
  deleteNote,
  fetchNotes,
} from '../../store/features/noteSlice';
import CustomTextEditor from '../common/RichTextEditor';
import NoteItem from './NoteItem';

interface NoteWorkspaceProps {
  projectId: string;
  sourceId: string;
}

const NoteWorkspace: React.FC<NoteWorkspaceProps> = ({
  projectId,
  sourceId,
}) => {
  const dispatch = useDispatch<AppDispatch>();
  const {
    notes = [],
    isLoading,
    error,
  } = useSelector((state: RootState) => state.notes);

  const [newNoteContent, setNewNoteContent] = useState('');
  const [pageRef, setPageRef] = useState('');
  const [editorKey, setEditorKey] = useState(0);
  useEffect(() => {
    dispatch(fetchNotes({ projectId, sourceId }));
  }, [dispatch, projectId, sourceId]);
  const handleCreateNote = async () => {
    if (!newNoteContent.trim() || !projectId || !sourceId) return;

    try {
      await dispatch(
        createNote({
          projectId,
          sourceId,
          content: newNoteContent,
          pageRef,
        })
      ).unwrap();

      // Clear content after successful creation
      setNewNoteContent('');
      setPageRef('');
      setEditorKey((prev) => prev + 1);
    } catch (error) {
      console.error('Error creating note:', error);
    }
  };

  if (isLoading && notes.length === 0) {
    return <CircularProgress sx={{ display: 'block', mx: 'auto', mt: 4 }} />;
  }

  const deleteNoteHandler = (id: string) => {
    dispatch(deleteNote(id));
  };

  return (
    <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      {/* Notes Header */}
      <Box
        sx={{
          p: 3,
          borderBottom: (theme) =>
            `1px solid ${alpha(theme.palette.divider, 0.1)}`,
          background: (theme) =>
            `linear-gradient(90deg, ${alpha(
              theme.palette.secondary.main,
              0.05
            )} 0%, transparent 100%)`,
        }}
      >
        <Stack
          direction='row'
          justifyContent='space-between'
          alignItems='center'
          sx={{ mb: 2 }}
        >
          <Typography variant='h6' fontWeight='600' color='secondary'>
            فیش‌های پژوهشی
          </Typography>
          <Chip
            label={`${notes.length} فیش`}
            size='small'
            color='secondary'
            variant='outlined'
          />
        </Stack>
      </Box>
      {/* Add Note Form */}
      <Box
        sx={{
          p: 3,
          borderTop: (theme) =>
            `1px solid ${alpha(theme.palette.divider, 0.1)}`,
          background: (theme) =>
            `linear-gradient(135deg, ${alpha(
              theme.palette.background.paper,
              0.8
            )} 0%, ${alpha(theme.palette.background.default, 0.4)} 100%)`,
        }}
      >
        <Typography variant='h6' sx={{ mb: 2, fontWeight: '600' }}>
          فیش جدید
        </Typography>

        <Box sx={{ mb: 2 }}>
          <CustomTextEditor
            key={editorKey}
            content={newNoteContent}
            onChange={(content) => setNewNoteContent(content)}
          />
        </Box>

        <Stack
          direction='row'
          spacing={2}
          justifyContent='space-between'
          alignItems='center'
        >
          <TextField
            label='صفحه (اختیاری)'
            size='small'
            value={pageRef}
            onChange={(e) => setPageRef(e.target.value)}
            sx={{
              width: '150px',
              '& .MuiOutlinedInput-root': {
                borderRadius: 2,
              },
            }}
          />
          <Button
            variant='contained'
            onClick={handleCreateNote}
            disabled={isLoading || !newNoteContent.trim()}
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
        </Stack>
      </Box>

      {/* Notes List */}
      <Box sx={{ flex: 1, overflow: 'auto', p: 3 }}>
        {error && (
          <Alert severity='error' sx={{ mb: 2, borderRadius: 2 }}>
            {error}
          </Alert>
        )}

        {notes.length > 0 ? (
          <Stack spacing={2}>
            {notes.map((note) => (
              <NoteItem
                key={note._id}
                note={note}
                onDelete={() => deleteNoteHandler(note._id)}
              />
            ))}
          </Stack>
        ) : (
          <Box
            sx={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              height: '100%',
              textAlign: 'center',
              py: 4,
            }}
          >
            <Avatar
              sx={{
                width: 80,
                height: 80,
                bgcolor: (theme) => alpha(theme.palette.secondary.main, 0.1),
                mb: 3,
              }}
            >
              <DescriptionIcon sx={{ fontSize: 40, color: 'secondary.main' }} />
            </Avatar>
            <Typography variant='h6' fontWeight='600' gutterBottom>
              هیچ فیشی ثبت نشده
            </Typography>
            <Typography variant='body2' color='text.secondary'>
              اولین فیش را برای این منبع بنویسید
            </Typography>
          </Box>
        )}
      </Box>
    </Box>
  );
};

export default NoteWorkspace;
