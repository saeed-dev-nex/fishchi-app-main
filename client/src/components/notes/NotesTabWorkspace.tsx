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
  Tabs,
  Tab,
  IconButton,
  Tooltip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Divider,
} from '@mui/material';
import {
  Description as DescriptionIcon,
  Add as AddIcon,
  Delete as DeleteIcon,
  Edit as EditIcon,
  Close as CloseIcon,
} from '@mui/icons-material';
import type { AppDispatch, RootState } from '../../store';
import {
  createNote,
  deleteNote,
  fetchNotes,
} from '../../store/features/noteSlice';
import CustomTextEditor from '../common/RichTextEditor';
import type { INote } from '../../types';

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

function TabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role='tabpanel'
      hidden={value !== index}
      id={`note-tabpanel-${index}`}
      aria-labelledby={`note-tab-${index}`}
      style={{ height: '100%' }}
      {...other}
    >
      {value === index && <Box sx={{ height: '100%', p: 3 }}>{children}</Box>}
    </div>
  );
}

interface NotesTabWorkspaceProps {
  projectId: string;
  sourceId: string;
}

const NotesTabWorkspace: React.FC<NotesTabWorkspaceProps> = ({
  projectId,
  sourceId,
}) => {
  const dispatch = useDispatch<AppDispatch>();
  const {
    notes = [],
    isLoading,
    error,
  } = useSelector((state: RootState) => state.notes);

  const [activeTab, setActiveTab] = useState(0);
  const [newNoteContent, setNewNoteContent] = useState('');
  const [pageRef, setPageRef] = useState('');
  const [editorKey, setEditorKey] = useState(0);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);

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
      setIsAddDialogOpen(false);

      // Switch to the new note tab
      setActiveTab(notes.length);
    } catch (error) {
      console.error('Error creating note:', error);
    }
  };

  const deleteNoteHandler = (id: string) => {
    dispatch(deleteNote(id));
    // If we're deleting the active tab, switch to the first tab
    if (activeTab >= notes.length - 1) {
      setActiveTab(Math.max(0, notes.length - 2));
    }
  };

  const handleTabChange = (_event: React.SyntheticEvent, newValue: number) => {
    setActiveTab(newValue);
  };

  const getTabLabel = (note: INote, index: number) => {
    const pageInfo = note.pageRef ? `صفحه ${note.pageRef}` : '';
    const date = new Date(note.createdAt).toLocaleDateString('fa-IR', {
      month: 'short',
      day: 'numeric',
    });
    return `فیش ${index + 1}${pageInfo ? ` - ${pageInfo}` : ''} (${date})`;
  };

  if (isLoading && notes.length === 0) {
    return (
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          height: '100%',
        }}
      >
        <CircularProgress />
      </Box>
    );
  }

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
          <Stack direction='row' spacing={1} alignItems='center'>
            <Chip
              label={`${notes.length} فیش`}
              size='small'
              color='secondary'
              variant='outlined'
            />
            <Button
              variant='contained'
              size='small'
              startIcon={<AddIcon />}
              onClick={() => setIsAddDialogOpen(true)}
              sx={{
                borderRadius: 2,
                textTransform: 'none',
                fontWeight: 500,
                px: 2,
              }}
            >
              فیش جدید
            </Button>
          </Stack>
        </Stack>
      </Box>

      {/* Error Display */}
      {error && (
        <Alert severity='error' sx={{ m: 2, borderRadius: 2 }}>
          {error}
        </Alert>
      )}

      {/* Notes Content */}
      <Box
        sx={{
          flex: 1,
          overflow: 'hidden',
          display: 'flex',
          flexDirection: 'column',
        }}
      >
        {notes.length > 0 ? (
          <>
            {/* Tabs */}
            <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
              <Tabs
                value={activeTab}
                onChange={handleTabChange}
                variant='scrollable'
                scrollButtons='auto'
                sx={{
                  '& .MuiTab-root': {
                    textTransform: 'none',
                    fontWeight: 500,
                    minHeight: 48,
                    fontSize: '0.875rem',
                  },
                }}
              >
                {notes.map((note, index) => (
                  <Tab
                    key={note._id}
                    label={getTabLabel(note, index)}
                    id={`note-tab-${index}`}
                    aria-controls={`note-tabpanel-${index}`}
                  />
                ))}
              </Tabs>
            </Box>

            {/* Tab Panels */}
            <Box sx={{ flex: 1, overflow: 'hidden' }}>
              {notes.map((note, index) => (
                <TabPanel key={note._id} value={activeTab} index={index}>
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
                        {note.pageRef
                          ? `صفحه: ${note.pageRef}`
                          : 'بدون صفحه‌مرجع'}
                      </Typography>
                      <Stack direction='row' spacing={1}>
                        <Tooltip title='ویرایش فیش'>
                          <IconButton size='small'>
                            <EditIcon fontSize='small' />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title='حذف فیش'>
                          <IconButton
                            size='small'
                            color='error'
                            onClick={() => deleteNoteHandler(note._id)}
                          >
                            <DeleteIcon fontSize='small' />
                          </IconButton>
                        </Tooltip>
                      </Stack>
                    </Stack>

                    <Divider sx={{ mb: 2 }} />

                    {/* Note Content */}
                    <Box
                      sx={{
                        flex: 1,
                        overflow: 'auto',
                        '& .ProseMirror': {
                          minHeight: '200px',
                          padding: 2,
                          borderRadius: 2,
                          border: (theme) =>
                            `1px solid ${theme.palette.divider}`,
                          backgroundColor: (theme) =>
                            alpha(theme.palette.background.paper, 0.5),
                        },
                      }}
                      className='ProseMirror'
                      dangerouslySetInnerHTML={{ __html: note.content }}
                    />
                  </Box>
                </TabPanel>
              ))}
            </Box>
          </>
        ) : (
          <Box
            sx={{
              flex: 1,
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              textAlign: 'center',
              p: 4,
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
            <Typography variant='body2' color='text.secondary' sx={{ mb: 3 }}>
              اولین فیش را برای این منبع بنویسید
            </Typography>
            <Button
              variant='contained'
              startIcon={<AddIcon />}
              onClick={() => setIsAddDialogOpen(true)}
              sx={{ borderRadius: 2 }}
            >
              افزودن فیش
            </Button>
          </Box>
        )}
      </Box>

      {/* Add Note Dialog */}
      <Dialog
        open={isAddDialogOpen}
        onClose={() => setIsAddDialogOpen(false)}
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
            <IconButton onClick={() => setIsAddDialogOpen(false)}>
              <CloseIcon />
            </IconButton>
          </Stack>
        </DialogTitle>
        <DialogContent>
          <Box sx={{ mb: 2 }}>
            <CustomTextEditor
              key={editorKey}
              content={newNoteContent}
              onChange={(content) => setNewNoteContent(content)}
            />
          </Box>
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
        </DialogContent>
        <DialogActions sx={{ p: 3 }}>
          <Button
            onClick={() => setIsAddDialogOpen(false)}
            sx={{ borderRadius: 2, textTransform: 'none' }}
          >
            انصراف
          </Button>
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
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default NotesTabWorkspace;
