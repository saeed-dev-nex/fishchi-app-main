import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';

import { fetchAllUserSources } from '../../store/features/sourceSlice';
import {
  Box,
  Typography,
  Button,
  CircularProgress,
  Alert,
  List,
  Chip,
  Avatar,
  Slide,
  Container,
  Stack,
  Paper,
  Grid,
  alpha,
  ToggleButton,
  ToggleButtonGroup,
  Divider,
} from '@mui/material';
import {
  Add,
  ViewList,
  ViewModule,
  LibraryBooks,
  TrendingUp,
} from '@mui/icons-material';
import type { AppDispatch, RootState } from '../../store';
import type { ISource } from '../../types';

import AddSourceModal from '../../components/sources/AddSourceModal.tsx';
import SourcesToolbar from '../../components/sources/SourcesToolbar.tsx';
import SourcesPagination from '../../components/sources/SourcesPagination.tsx';
import DeleteSourceDialog from '../../components/sources/DeleteSourceDialog.tsx';
import SourceCard from '../../components/sources/sourceGridCard.tsx';
import SourceListCard from '../../components/sources/SourceListCard.tsx';

const SourcesLibraryPage: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const { sources, isLoading, error, pagination } = useSelector(
    (state: RootState) => state.sources
  );

  // State for view mode (list or card)
  const [viewMode, setViewMode] = useState<'list' | 'card'>('card');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [sourceToDelete, setSourceToDelete] = useState<ISource | null>(null);

  // State for search and pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize] = useState(12);
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState('createdAt');
  const [sortOrder, setSortOrder] = useState('desc');

  // Load sources with current filters
  useEffect(() => {
    dispatch(
      fetchAllUserSources({
        page: currentPage,
        limit: pageSize,
        sortBy,
        sortOrder,
        search: searchQuery,
        searchFields: 'title,authors,tags,year',
      })
    );
  }, [dispatch, currentPage, pageSize, sortBy, sortOrder, searchQuery]);

  // Reset to first page when search or sort changes
  useEffect(() => {
    if (currentPage !== 1) {
      setCurrentPage(1);
    }
  }, [searchQuery, sortBy, sortOrder]);

  // Handle view mode change
  const handleViewModeChange = (
    _event: React.MouseEvent<HTMLElement>,
    newViewMode: 'list' | 'card' | null
  ) => {
    if (newViewMode !== null) {
      setViewMode(newViewMode);
    }
  };

  // Handle search change
  const handleSearchChange = (query: string) => {
    setSearchQuery(query);
  };

  // Handle sort change
  const handleSortChange = (newSortBy: string, newSortOrder: string) => {
    setSortBy(newSortBy);
    setSortOrder(newSortOrder);
  };

  // Handle page change
  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  // Handle clear filters
  const handleClearFilters = () => {
    setSearchQuery('');
    setSortBy('createdAt');
    setSortOrder('desc');
    setCurrentPage(1);
  };

  // Handle delete source
  const handleDeleteSource = (source: ISource) => {
    setSourceToDelete(source);
    setDeleteDialogOpen(true);
  };

  // Handle close delete dialog
  const handleCloseDeleteDialog = () => {
    setDeleteDialogOpen(false);
    setSourceToDelete(null);
  };

  // Handle delete success
  const handleDeleteSuccess = () => {
    // Always refresh the sources list with current page
    // The pagination will be updated automatically by the API response
    dispatch(
      fetchAllUserSources({
        page: currentPage,
        limit: pageSize,
        sortBy,
        sortOrder,
        search: searchQuery,
        searchFields: 'title,authors,tags,year',
      })
    );
  };

  return (
    <Container maxWidth='xl' sx={{ py: 3 }}>
      {/* Modern Header Section */}
      <Paper
        elevation={0}
        sx={{
          p: 4,
          mb: 4,
          borderRadius: 3,
          background: (theme) =>
            `linear-gradient(135deg, ${alpha(
              theme.palette.primary.main,
              0.05
            )} 0%, ${alpha(theme.palette.secondary.main, 0.05)} 100%)`,
          border: (theme) => `1px solid ${alpha(theme.palette.divider, 0.1)}`,
          position: 'relative',
          overflow: 'hidden',
          '&::before': {
            content: '""',
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            height: '1px',
            background: (theme) =>
              `linear-gradient(90deg, transparent, ${alpha(
                theme.palette.primary.main,
                0.3
              )}, transparent)`,
          },
        }}
      >
        <Stack
          direction={{ xs: 'column', sm: 'row' }}
          justifyContent='space-between'
          alignItems={{ xs: 'flex-start', sm: 'center' }}
          spacing={3}
        >
          <Box>
            <Stack
              direction='row'
              spacing={2}
              alignItems='center'
              sx={{ mb: 2 }}
            >
              <Avatar
                sx={{
                  width: 56,
                  height: 56,
                  bgcolor: 'primary.main',
                  fontSize: '1.5rem',
                }}
              >
                <LibraryBooks />
              </Avatar>
              <Box>
                <Typography
                  variant='h3'
                  component='h1'
                  fontWeight='bold'
                  sx={{ mb: 0.5 }}
                >
                  کتابخانه منابع من
                </Typography>
                <Typography
                  variant='body1'
                  color='text.secondary'
                  sx={{ opacity: 0.8 }}
                >
                  مدیریت و سازماندهی منابع تحقیقاتی شما
                </Typography>
              </Box>
            </Stack>

            {/* Stats */}
            <Stack direction='row' spacing={2} flexWrap='wrap'>
              <Chip
                icon={<LibraryBooks />}
                label={`${pagination?.totalCount || sources.length} منبع`}
                variant='outlined'
                color='primary'
              />
              <Chip
                icon={<TrendingUp />}
                label='در حال مطالعه'
                variant='outlined'
                color='success'
              />
            </Stack>
          </Box>

          <Stack direction='row' spacing={2} alignItems='center'>
            {/* View Toggle */}
            <ToggleButtonGroup
              value={viewMode}
              exclusive
              onChange={handleViewModeChange}
              size='small'
              sx={{
                borderRadius: 2,
                border: (theme) =>
                  `1px solid ${alpha(theme.palette.divider, 0.2)}`,
                '& .MuiToggleButton-root': {
                  borderRadius: 2,
                  border: 'none',
                  px: 2,
                  py: 1,
                  '&.Mui-selected': {
                    bgcolor: 'primary.main',
                    color: 'white',
                    '&:hover': {
                      bgcolor: 'primary.dark',
                    },
                  },
                },
              }}
            >
              <ToggleButton value='card' aria-label='card view'>
                <ViewModule fontSize='small' sx={{ mr: 1 }} />
                کارت
              </ToggleButton>
              <ToggleButton value='list' aria-label='list view'>
                <ViewList fontSize='small' sx={{ mr: 1 }} />
                لیست
              </ToggleButton>
            </ToggleButtonGroup>

            <Button
              variant='contained'
              size='large'
              onClick={() => setIsModalOpen(true)}
              startIcon={<Add />}
              sx={{
                borderRadius: 2,
                px: 3,
                py: 1.5,
                textTransform: 'none',
                fontWeight: 500,
                boxShadow: (theme) =>
                  `0 4px 20px ${alpha(theme.palette.primary.main, 0.3)}`,
                transition: 'all 0.3s ease',
                '&:hover': {
                  transform: 'translateY(-2px)',
                  boxShadow: (theme) =>
                    `0 8px 30px ${alpha(theme.palette.primary.main, 0.4)}`,
                },
              }}
            >
              افزودن منبع
            </Button>
          </Stack>
        </Stack>
      </Paper>

      {/* Search and Sort Toolbar */}
      <SourcesToolbar
        searchQuery={searchQuery}
        sortBy={sortBy}
        sortOrder={sortOrder}
        onSearchChange={handleSearchChange}
        onSortChange={handleSortChange}
        onClearFilters={handleClearFilters}
        totalCount={pagination?.totalCount || sources.length}
      />

      {/* Loading State */}
      {isLoading && (
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
          <Stack alignItems='center' spacing={3}>
            <CircularProgress
              size={60}
              thickness={4}
              sx={{
                color: 'primary.main',
                '& .MuiCircularProgress-circle': {
                  strokeLinecap: 'round',
                },
              }}
            />
            <Typography variant='h6' color='text.secondary'>
              در حال بارگذاری منابع...
            </Typography>
          </Stack>
        </Box>
      )}

      {/* Error State */}
      {error && (
        <Alert
          severity='error'
          sx={{
            mb: 3,
            borderRadius: 2,
            '& .MuiAlert-icon': {
              fontSize: '1.5rem',
            },
          }}
        >
          {error}
        </Alert>
      )}

      {/* Sources Display */}
      {!isLoading && !error && (
        <>
          {sources.length === 0 ? (
            // Empty State
            <Slide direction='up' in timeout={800}>
              <Paper
                elevation={0}
                sx={{
                  p: 8,
                  textAlign: 'center',
                  borderRadius: 3,
                  border: (theme) =>
                    `2px dashed ${alpha(theme.palette.divider, 0.3)}`,
                  bgcolor: (theme) => alpha(theme.palette.action.hover, 0.3),
                }}
              >
                <Avatar
                  sx={{
                    width: 80,
                    height: 80,
                    bgcolor: 'action.disabled',
                    mx: 'auto',
                    mb: 3,
                  }}
                >
                  <LibraryBooks sx={{ fontSize: 40 }} />
                </Avatar>
                <Typography variant='h5' fontWeight='600' gutterBottom>
                  هنوز منبعی اضافه نکرده‌اید
                </Typography>
                <Typography
                  variant='body1'
                  color='text.secondary'
                  sx={{ mb: 3 }}
                >
                  اولین منبع خود را اضافه کنید و شروع به مطالعه کنید
                </Typography>
                <Button
                  variant='contained'
                  startIcon={<Add />}
                  sx={{
                    borderRadius: 2,
                    px: 4,
                    py: 1.5,
                    textTransform: 'none',
                    fontWeight: 500,
                  }}
                >
                  افزودن اولین منبع
                </Button>
              </Paper>
            </Slide>
          ) : (
            // Sources Display
            <Slide direction='up' in timeout={800}>
              {viewMode === 'card' ? (
                // Card View - Academic Design
                <Grid container spacing={3}>
                  {(sources || []).map((source) => (
                    <Grid
                      size={{ xs: 12, md: 6, lg: 4, xl: 3 }}
                      key={source._id}
                    >
                      <Box sx={{ opacity: 1 }} key={source._id}>
                        <SourceCard
                          source={source}
                          handleDeleteSource={handleDeleteSource}
                        />
                      </Box>
                    </Grid>
                  ))}
                </Grid>
              ) : (
                // List View - Academic Design
                <Paper
                  elevation={0}
                  sx={{
                    borderRadius: 2,
                    border: '1px solid',
                    borderColor: 'divider',
                    overflow: 'hidden',
                  }}
                >
                  <List sx={{ p: 0 }}>
                    {(sources || []).map((source, index) => (
                      <React.Fragment key={source._id}>
                        <SourceListCard
                          source={source}
                          handleDeleteSource={handleDeleteSource}
                        />
                        {index < sources.length - 1 && (
                          <Divider sx={{ mx: 3 }} />
                        )}
                      </React.Fragment>
                    ))}
                  </List>
                </Paper>
              )}
            </Slide>
          )}
        </>
      )}

      {/* Pagination */}
      {!isLoading && !error && pagination && pagination.totalPages > 1 && (
        <SourcesPagination
          currentPage={pagination.currentPage}
          totalPages={pagination.totalPages}
          itemsPerPage={pageSize}
          totalItems={pagination.totalCount}
          onPageChange={handlePageChange}
          onItemsPerPageChange={(newSize) => {
            // Handle page size change if needed
            console.log('Page size changed to:', newSize);
          }}
        />
      )}

      <AddSourceModal
        open={isModalOpen}
        onClose={() => setIsModalOpen(false)}
      />

      <DeleteSourceDialog
        open={deleteDialogOpen}
        onClose={handleCloseDeleteDialog}
        source={sourceToDelete}
        onDeleteSuccess={handleDeleteSuccess}
      />
    </Container>
  );
};

export default SourcesLibraryPage;
