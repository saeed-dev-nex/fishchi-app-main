import React, { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  Box,
  Typography,
  CircularProgress,
  Alert,
  Paper,
  Stack,
  Button,
  TextField,
} from '@mui/material';
import type { AppDispatch, RootState } from '../../store';
import { createNote, deleteNote } from '../../store/features/noteSlice';
import RichTextEditor from '../common/RichTextEditor';
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
  const { notes, isLoading, error } = useSelector(
    (state: RootState) => state.notes
  );

  const [newNoteContent, setNewNoteContent] = useState('');
  const [pageRef, setPageRef] = useState('');

  const handleCreateNote = () => {
    if (!newNoteContent.trim() || !projectId || !sourceId) return;

    dispatch(
      createNote({
        projectId,
        sourceId,
        content: newNoteContent,
        pageRef,
      })
    ).then((result) => {
      if (createNote.fulfilled.match(result)) {
        setNewNoteContent('');
        setPageRef('');
      }
    });
  };

  if (isLoading && notes.length === 0) {
    return <CircularProgress sx={{ display: 'block', mx: 'auto', mt: 4 }} />;
  }

  return (
    <Stack spacing={3} sx={{ height: '100%' }}>
      {/* لیست فیش‌ها */}
      <Box sx={{ flexGrow: 1, overflowY: 'auto' }}>
        {error && <Alert severity='error'>{error}</Alert>}
        {notes.length > 0 ? (
          notes.map((note) => (
            <NoteItem
              key={note._id}
              note={note}
              onDelete={(id) => dispatch(deleteNote(id))}
            />
          ))
        ) : (
          <Typography color='text.secondary' textAlign='center'>
            هیچ فیشی برای این منبع ثبت نشده. اولین فیش را شما بنویسید!
          </Typography>
        )}
      </Box>

      {/* فرم افزودن فیش */}
      <Paper elevation={0} sx={{ p: 2, borderTop: 1, borderColor: 'divider' }}>
        <Typography variant='h6' sx={{ mb: 2 }}>
          فیش جدید
        </Typography>
        <RichTextEditor content={newNoteContent} onChange={setNewNoteContent} />
        <Stack
          direction='row'
          spacing={2}
          justifyContent='space-between'
          sx={{ mt: 2 }}
        >
          <TextField
            label='صفحه (اختیاری)'
            size='small'
            value={pageRef}
            onChange={(e) => setPageRef(e.target.value)}
            sx={{ width: '150px' }}
          />
          <Button
            variant='contained'
            onClick={handleCreateNote}
            disabled={isLoading}
          >
            {isLoading ? <CircularProgress size={24} /> : 'ثبت فیش'}
          </Button>
        </Stack>
      </Paper>
    </Stack>
  );
};

export default NoteWorkspace;
