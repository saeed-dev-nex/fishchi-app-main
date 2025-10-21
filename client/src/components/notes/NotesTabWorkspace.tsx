import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Box, CircularProgress, Alert, Tabs, Tab } from '@mui/material';
import type { AppDispatch, RootState } from '../../store';
import {
  createNote,
  deleteNote,
  fetchNotes,
  summarizeNote,
  clearSummary,
  suggestTags,
} from '../../store/features/noteSlice';
import type { INote } from '../../types';
import NotesHeader from './NotesHeader';
import EmptyNotesState from './EmptyNotesState';
import NoteTabContent from './NoteTabContent';
import AddNoteDialog from './AddNoteDialog';
import EditNoteModal from './EditNoteModal';

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
    summary,
    suggestTags: suggestTagsState,
  } = useSelector((state: RootState) => state.notes);

  const [activeTab, setActiveTab] = useState(0);
  const [newNoteContent, setNewNoteContent] = useState('');
  const [pageRef, setPageRef] = useState('');
  const [tags, setTags] = useState<string[]>([]);
  const [editorKey, setEditorKey] = useState(0);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [selectedNote, setSelectedNote] = useState<INote | null>(null);

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
          tags,
        })
      ).unwrap();

      // Clear content and close dialog
      setNewNoteContent('');
      setPageRef('');
      setTags([]);
      setEditorKey((prev) => prev + 1);
      setIsAddDialogOpen(false);
      setActiveTab(notes.length);
    } catch (error) {
      console.error('Error creating note:', error);
    }
  };

  const handleDeleteNote = (id: string) => {
    dispatch(deleteNote(id));
    if (activeTab >= notes.length - 1) {
      setActiveTab(Math.max(0, notes.length - 2));
    }
  };

  const handleTabChange = (_event: React.SyntheticEvent, newValue: number) => {
    setActiveTab(newValue);
  };

  const handleSuggestTags = async () => {
    if (!newNoteContent.trim()) return;

    try {
      const result = await dispatch(
        suggestTags({ htmlContent: newNoteContent })
      ).unwrap();
      if (result && result.length > 0) {
        const newTags = result.filter((tag: string) => !tags.includes(tag));
        setTags([...tags, ...newTags]);
      }
    } catch (error) {
      console.error('Error suggesting tags:', error);
    }
  };

  const handleCloseAddDialog = () => {
    setIsAddDialogOpen(false);
    setNewNoteContent('');
    setPageRef('');
    setTags([]);
    setEditorKey((prev) => prev + 1);
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
      <NotesHeader
        notesCount={notes.length}
        onAddClick={() => setIsAddDialogOpen(true)}
      />

      {error && (
        <Alert severity='error' sx={{ m: 2, borderRadius: 2 }}>
          {error}
        </Alert>
      )}

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

            <Box sx={{ flex: 1, overflow: 'hidden' }}>
              {notes.map((note, index) => (
                <TabPanel key={note._id} value={activeTab} index={index}>
                  <NoteTabContent
                    note={note}
                    summary={summary}
                    onEdit={(note) => {
                      setSelectedNote(note);
                      setIsEditModalOpen(true);
                    }}
                    onDelete={handleDeleteNote}
                    onSummarize={() => {
                      dispatch(
                        summarizeNote({
                          noteId: note._id,
                          htmlContent: note.content,
                        })
                      );
                    }}
                    onClearSummary={() => dispatch(clearSummary())}
                  />
                </TabPanel>
              ))}
            </Box>
          </>
        ) : (
          <EmptyNotesState onAddClick={() => setIsAddDialogOpen(true)} />
        )}
      </Box>

      <AddNoteDialog
        open={isAddDialogOpen}
        onClose={handleCloseAddDialog}
        content={newNoteContent}
        onContentChange={setNewNoteContent}
        pageRef={pageRef}
        onPageRefChange={setPageRef}
        tags={tags}
        onTagsChange={setTags}
        onSave={handleCreateNote}
        isLoading={isLoading}
        editorKey={editorKey}
        onSuggestTags={handleSuggestTags}
        suggestTagsLoading={suggestTagsState.isLoading}
        suggestTagsError={suggestTagsState.error}
      />

      {selectedNote && (
        <EditNoteModal
          open={isEditModalOpen}
          onClose={() => {
            setIsEditModalOpen(false);
            setSelectedNote(null);
          }}
          note={selectedNote}
        />
      )}
    </Box>
  );
};

export default NotesTabWorkspace;
