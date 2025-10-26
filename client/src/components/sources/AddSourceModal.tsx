import React, { useState, useEffect } from 'react';
import { useForm, type SubmitHandler } from 'react-hook-form';
import { useDispatch, useSelector } from 'react-redux';
import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Box,
  Alert,
  Stack,
  Typography,
  alpha,
  IconButton,
} from '@mui/material';
import { Close as CloseIcon } from '@mui/icons-material';

import type { AppDispatch, RootState } from '../../store';
import type { CreateSourceData, ISource } from '../../types';
import {
  createSource,
  importSourceByDOI,
  clearError,
  fetchAllUserSources,
  fetchSourcesByProject,
} from '../../store/features/sourceSlice';
import { suggestTags } from '../../store/features/noteSlice';
import { addExistingSourcesToProject } from '../../store/features/projectSlice';
import {
  parseAuthors,
  formatAuthors,
  hasPersianCharacters,
  extractAuthors,
} from '../../utils/persianNameProcessor';

import {
  ManualSourceForm,
  DoiSourceForm,
  ParseCitationForm,
  LibrarySourceForm,
  SourceModalTabs,
  type ManualFormInputs,
  type DoiFormInputs,
} from './modal-components';

import apiClient from '../../api/axios';

interface AddSourceModalProps {
  open: boolean;
  onClose: () => void;
  projectId?: string;
}

const AddSourceModal: React.FC<AddSourceModalProps> = ({
  open,
  onClose,
  projectId,
}) => {
  const dispatch = useDispatch<AppDispatch>();
  const { isLoading, error } = useSelector((state: RootState) => state.sources);
  const { selectedProject } = useSelector((state: RootState) => state.projects);
  const { sources: librarySources, isLoading: libraryLoading } = useSelector(
    (state: RootState) => state.sources
  );

  const projectSources = selectedProject?.sources || [];

  // State
  const [activeTab, setActiveTab] = useState(0);
  const [showAdvancedFields, setShowAdvancedFields] = useState(false);
  const [citationText, setCitationText] = useState('');
  const [selectedLibrary, setSelectedLibrary] = useState<string[]>([]);
  const [isSuggestingTags, setIsSuggestingTags] = useState(false);
  const [tagSuggestionError, setTagSuggestionError] = useState<string | null>(
    null
  );
  const [tags, setTags] = useState<string[]>([]);
  const [tagInputValue, setTagInputValue] = useState('');
  const [isParsingCitation, setIsParsingCitation] = useState(false); // Add state for AI parsing
  const [parsingError, setParsingError] = useState<string | null>(null);

  // Filter out sources that are already in the current project
  const availableLibrarySources = librarySources.filter(
    (source) =>
      !projectSources.some((projectSource) => projectSource._id === source._id)
  );

  // Forms
  const {
    register: registerManual,
    handleSubmit: handleSubmitManual,
    reset: resetManual,
    setValue,
    watch: watchManual,
  } = useForm<ManualFormInputs>();

  const {
    register: registerDoi,
    handleSubmit: handleSubmitDoi,
    reset: resetDoi,
  } = useForm<DoiFormInputs>();

  useEffect(() => {
    if (open) {
      dispatch(clearError());
      dispatch(
        fetchAllUserSources({
          page: 1,
          limit: 1000,
          sortBy: 'createdAt',
          sortOrder: 'desc',
        })
      );
    }
  }, [open, dispatch]);

  const handleClose = () => {
    resetManual();
    resetDoi();
    setShowAdvancedFields(false);
    setTagSuggestionError(null);
    setTags([]);
    setTagInputValue('');
    setCitationText('');
    setSelectedLibrary([]);
    onClose();
  };

  const handleTabChange = (_event: React.SyntheticEvent, newValue: number) => {
    setActiveTab(newValue);
  };

  const handleAddFromLibrary = async () => {
    if (selectedLibrary.length === 0) return;
    await dispatch(
      addExistingSourcesToProject({
        projectId: projectId!,
        sourceIds: selectedLibrary,
      })
    );
    handleClose();
    if (projectId) {
      dispatch(fetchSourcesByProject(projectId));
    }
  };

  const handleLibrarySourceChange = (
    _event: React.SyntheticEvent,
    newValue: ISource[]
  ) => {
    setSelectedLibrary(newValue.map((source: ISource) => source._id));
  };

  const handleParseCitation = async () => {
    if (!citationText.trim()) return;
    setIsParsingCitation(true);
    setParsingError(null);
    dispatch(clearError());

    try {
      const response = await apiClient.post('/ai/parse-citation', {
        citation: citationText,
      });

      if (response.data.status !== 'success') {
        throw new Error(
          response.data.message || 'خطا در پردازش Citation توسط AI'
        );
      }
      const parsedData = response.data.data;
      console.log('AI Parsed Data:', parsedData); // For debugging

      // Fill the manual form with AI-parsed data
      setValue('title', parsedData.title || '');
      // Use formatAuthors for display consistency
      setValue(
        'authors',
        parsedData.authors && parsedData.authors.length > 0
          ? formatAuthors(parsedData.authors) // Use formatAuthors from persianNameProcessor
          : ''
      );
      setValue('year', parsedData.year?.toString() || '');
      setValue('type', parsedData.type || 'article');
      setValue(
        'language',
        parsedData.language ||
          (hasPersianCharacters(citationText) ? 'persian' : 'english')
      ); // Infer language if AI doesn't provide
      // Optionally set abstract if AI provided one
      setValue('abstract', parsedData.abstract || '');
      setValue('journal', parsedData.publicationDetails?.journal || '');
      setValue('publisher', parsedData.publicationDetails?.publisher || '');
      setValue('volume', parsedData.publicationDetails?.volume || '');
      setValue('issue', parsedData.publicationDetails?.issue || '');
      setValue('pages', parsedData.publicationDetails?.pages || '');
      setValue('doi', parsedData.identifiers?.doi || '');
      setValue('isbn', parsedData.identifiers?.isbn || '');
      setValue('url', parsedData.identifiers?.url || '');
      setValue('tags', ''); // Reset tags, let user add manually or use suggest

      // Switch to manual tab and show advanced fields
      setActiveTab(0);
      setShowAdvancedFields(true); // Show advanced fields as AI might fill them
      setCitationText(''); // Clear the citation text input
    } catch (error) {
      console.error('AI Parse citation error:', error);
      const message =
        error.response?.data?.message ||
        error.message ||
        'خطا در ارتباط با سرویس هوش مصنوعی.';
      setParsingError(message); // Show error specific to parsing
    } finally {
      setIsParsingCitation(false);
    }
  };

  const handleSuggestTags = async () => {
    const title = watchManual('title');
    const abstract = watchManual('abstract');
    const textContent = `${title || ''} ${abstract || ''}`.trim();

    if (!textContent || textContent.length < 20) {
      setTagSuggestionError('عنوان یا چکیده کافی برای پیشنهاد تگ وجود ندارد');
      return;
    }

    setIsSuggestingTags(true);
    setTagSuggestionError(null);

    try {
      const result = await dispatch(suggestTags({ textContent }));

      if (suggestTags.fulfilled.match(result)) {
        const suggestedTags = result.payload as string[];
        const allTags = Array.from(new Set([...tags, ...suggestedTags]));
        setTags(allTags);
        setValue('tags', allTags.join(', '));
      } else {
        setTagSuggestionError('خطا در پیشنهاد تگ‌ها');
      }
    } catch (err) {
      setTagSuggestionError('خطا در پیشنهاد تگ‌ها');
    } finally {
      setIsSuggestingTags(false);
    }
  };

  const onManualSubmit: SubmitHandler<ManualFormInputs> = async (data) => {
    
    const processedData = {
      projectId,
      title: data.title,
      type: data.type || 'article',
      language: data.language || 'english',
      authors: data.authors
        ? (() => {
            const primary = parseAuthors(data.authors);
            if (primary && primary.length > 0) return primary;
            return extractAuthors(data.authors);
          })()
        : [],
      year: Number(data.year) || undefined,
      abstract: data.abstract || undefined,
      publicationDetails: {
        journal: data.journal || undefined,
        publisher: data.publisher || undefined,
        volume: data.volume || undefined,
        issue: data.issue || undefined,
        pages: data.pages || undefined,
      },
      identifiers: {
        doi: data.doi || undefined,
        isbn: data.isbn || undefined,
        url: data.url || undefined,
      },
      tags: data.tags
        ? data.tags
            .split(/[,،|]/)
            .map((tag) => tag.trim())
            .filter((tag) => tag)
        : [],
    };

    const result = await dispatch(
      createSource(processedData as CreateSourceData)
    );

    if (createSource.fulfilled.match(result)) {
      handleClose();
      if (projectId) {
        dispatch(fetchSourcesByProject(projectId));
      }
    }
  };

  const onDoiSubmit: SubmitHandler<DoiFormInputs> = async (data) => {
    const result = await dispatch(
      importSourceByDOI({ ...data, projectId: projectId as string })
    );
    if (importSourceByDOI.fulfilled.match(result)) {
      handleClose();
      if (projectId) {
        dispatch(fetchSourcesByProject(projectId));
      }
    }
  };

  const getSubmitButtonText = () => {
    if (activeTab === 3) return 'افزودن به پروژه';
    if (activeTab === 2) return null; // Parse Citation has its own button
    return 'ثبت منبع';
  };

  const isSubmitDisabled = () => {
    if (activeTab === 3) return selectedLibrary.length === 0 || isLoading;
    return isLoading;
  };

  const handleSubmit = () => {
    if (activeTab === 0) {
      handleSubmitManual(onManualSubmit)();
    } else if (activeTab === 1) {
      handleSubmitDoi(onDoiSubmit)();
    } else if (activeTab === 3) {
      handleAddFromLibrary();
    }
  };

  return (
    <Dialog
      open={open}
      onClose={handleClose}
      fullWidth
      maxWidth='md'
      PaperProps={{
        sx: {
          borderRadius: 3,
          boxShadow: (theme) =>
            `0 20px 60px ${alpha(theme.palette.common.black, 0.15)}`,
        },
      }}
    >
      <DialogTitle sx={{ pb: 1 }}>
        <Stack
          direction='row'
          justifyContent='space-between'
          alignItems='center'
        >
          <Typography variant='h5' fontWeight='600'>
            افزودن منبع جدید
          </Typography>
          <IconButton onClick={handleClose} size='small'>
            <CloseIcon />
          </IconButton>
        </Stack>
      </DialogTitle>

      <DialogContent sx={{ px: 3, py: 2 }}>
        <SourceModalTabs
          activeTab={activeTab}
          onTabChange={handleTabChange}
          hasProjectId={!!projectId}
        />

        {error && (
          <Alert
            severity='error'
            sx={{
              mb: 3,
              borderRadius: 2,
              '& .MuiAlert-icon': {
                fontSize: '1.2rem',
              },
            }}
          >
            {error}
          </Alert>
        )}

        <Box sx={{ minHeight: 300 }}>
          {/* Manual Tab */}
          <Box hidden={activeTab !== 0}>
            <form onSubmit={handleSubmitManual(onManualSubmit)}>
              <ManualSourceForm
                register={registerManual}
                setValue={setValue}
                watch={watchManual}
                error={error ?? undefined}
                showAdvancedFields={showAdvancedFields}
                onToggleAdvancedFields={() =>
                  setShowAdvancedFields(!showAdvancedFields)
                }
                tags={tags}
                setTags={setTags}
                tagInputValue={tagInputValue}
                setTagInputValue={setTagInputValue}
                onSuggestTags={handleSuggestTags}
                isSuggestingTags={isSuggestingTags}
                tagSuggestionError={tagSuggestionError}
              />
            </form>
          </Box>

          {/* DOI Tab */}
          <Box hidden={activeTab !== 1}>
            <form onSubmit={handleSubmitDoi(onDoiSubmit)}>
              <DoiSourceForm register={registerDoi} />
            </form>
          </Box>

          {/* Parse Citation Tab */}
          <Box hidden={activeTab !== 2}>
            <ParseCitationForm
              citationText={citationText}
              onCitationTextChange={setCitationText}
              onParseCitation={handleParseCitation}
              isLoading={isParsingCitation}
            />
            {parsingError && (
              <Alert severity='error' sx={{ mb: 2 }}>
                {parsingError}
              </Alert>
            )}
          </Box>

          {/* Library Tab */}
          {projectId && (
            <Box hidden={activeTab !== 3}>
              <LibrarySourceForm
                librarySources={librarySources}
                availableLibrarySources={availableLibrarySources}
                selectedLibrary={selectedLibrary}
                onLibrarySourceChange={handleLibrarySourceChange}
                isLoading={libraryLoading}
              />
            </Box>
          )}
        </Box>
      </DialogContent>

      {activeTab !== 2 && (
        <DialogActions sx={{ px: 3, pb: 3 }}>
          <Button
            onClick={handleClose}
            sx={{
              borderRadius: 2,
              textTransform: 'none',
              fontWeight: 500,
            }}
          >
            انصراف
          </Button>
          <Button
            variant='contained'
            onClick={handleSubmit}
            disabled={isSubmitDisabled()}
            sx={{
              borderRadius: 2,
              textTransform: 'none',
              fontWeight: 500,
              px: 3,
              minWidth: 120,
            }}
          >
            {getSubmitButtonText()}
          </Button>
        </DialogActions>
      )}
    </Dialog>
  );
};

export default AddSourceModal;
