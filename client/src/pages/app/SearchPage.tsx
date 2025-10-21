import React, { useState, useEffect } from 'react';
import {
  Container,
  Box,
  Typography,
  Paper,
  Card,
  CardContent,
  Chip,
  CircularProgress,
  Alert,
  Stack,
  IconButton,
  Tooltip,
  alpha,
} from '@mui/material';
import {
  Search as SearchIcon,
  Description as DescriptionIcon,
  Note as NoteIcon,
  Visibility as VisibilityIcon,
} from '@mui/icons-material';
import { useDispatch, useSelector } from 'react-redux';
import type { AppDispatch, RootState } from '../../store';
import {
  semanticSearch,
  clearSearchResults,
  setQuery,
} from '../../store/features/searchSlice';
import { useNavigate } from 'react-router-dom';
import SearchBox from '../../components/common/SearchBox';

const SearchPage: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const navigate = useNavigate();
  const { results, isLoading, error, query } = useSelector(
    (state: RootState) => state.search
  );
  const [hasSearched, setHasSearched] = useState(false);

  useEffect(() => {
    // Clear results when component mounts
    dispatch(clearSearchResults());
  }, [dispatch]);

  const handleSearch = async (searchQuery: string) => {
    if (!searchQuery.trim()) return;

    setHasSearched(true);
    dispatch(setQuery(searchQuery));
    await dispatch(semanticSearch(searchQuery));
  };

  const handleResultClick = (result: any, type: 'note' | 'source') => {
    if (type === 'note') {
      navigate(`/app/projects/${result.project}`);
    } else if (type === 'source') {
      navigate(`/app/library/${result._id}`);
    }
  };

  const truncateText = (text: string, maxLength: number = 200) => {
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength) + '...';
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('fa-IR');
  };

  // Combine and format all results into a single list
  const getAllResults = () => {
    if (!results) return [];

    const noteResults =
      results.notes?.map((note: any) => ({
        ...note,
        type: 'note' as const,
        displayTitle: note.pageRef ? `صفحه ${note.pageRef}` : 'فیش بدون صفحه‌مرجع',
        displayContent: note.content.replace(/<[^>]*>/g, ''),
      })) || [];

    const sourceResults =
      results.sources?.map((source: any) => ({
        ...source,
        type: 'source' as const,
        displayTitle: source.title,
        displayContent: source.abstract || '',
      })) || [];

    return [...noteResults, ...sourceResults];
  };

  const allResults = getAllResults();
  const totalResults = allResults.length;

  return (
    <Container maxWidth='lg' sx={{ py: 4 }}>
      {/* Header */}
      <Box sx={{ mb: 4 }}>
        <Typography variant='h4' component='h1' gutterBottom>
          جستجوی معنایی
        </Typography>
        <Typography variant='body1' color='text.secondary' sx={{ mb: 3 }}>
          جستجوی هوشمند در فیش‌ها و منابع بر اساس معنا و مفهوم
        </Typography>

        {/* Search Box */}
        <Box sx={{ maxWidth: 600, mx: 'auto' }}>
          <SearchBox
            placeholder='جستجوی معنایی در فیش‌ها و منابع...'
            showResults={false}
            onResultClick={handleResultClick}
          />
        </Box>
      </Box>

      {/* Loading State */}
      {isLoading && (
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
          <CircularProgress />
        </Box>
      )}

      {/* Error State */}
      {error && (
        <Alert severity='error' sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      {/* Results */}
      {hasSearched && !isLoading && results && (
        <Box>
          {/* Search Summary */}
          <Box
            sx={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              mb: 3,
            }}
          >
            <Typography variant='h6'>
              نتایج جستجو برای "{query}"
            </Typography>
            <Stack direction='row' spacing={1}>
              <Chip
                icon={<NoteIcon />}
                label={`${results.notes?.length || 0} فیش`}
                size='small'
                color='primary'
                variant='outlined'
              />
              <Chip
                icon={<DescriptionIcon />}
                label={`${results.sources?.length || 0} منبع`}
                size='small'
                color='secondary'
                variant='outlined'
              />
              <Chip
                label={`مجموع: ${totalResults}`}
                size='small'
                color='default'
              />
            </Stack>
          </Box>

          {/* Unified Results List */}
          {totalResults > 0 ? (
            <Stack spacing={2}>
              {allResults.map((result: any) => (
                <Card
                  key={`${result.type}-${result._id}`}
                  sx={{
                    cursor: 'pointer',
                    transition: 'transform 0.2s, box-shadow 0.2s',
                    '&:hover': {
                      transform: 'translateY(-2px)',
                      boxShadow: (theme) =>
                        `0 4px 20px ${alpha(theme.palette.common.black, 0.12)}`,
                    },
                  }}
                  onClick={() => handleResultClick(result, result.type)}
                >
                  <CardContent>
                    <Stack direction='row' spacing={2} alignItems='flex-start'>
                      {/* Type Icon Badge */}
                      <Box
                        sx={{
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          width: 48,
                          height: 48,
                          borderRadius: 2,
                          bgcolor: (theme) =>
                            result.type === 'note'
                              ? alpha(theme.palette.primary.main, 0.1)
                              : alpha(theme.palette.secondary.main, 0.1),
                          flexShrink: 0,
                        }}
                      >
                        {result.type === 'note' ? (
                          <NoteIcon
                            color='primary'
                            sx={{ fontSize: 28 }}
                          />
                        ) : (
                          <DescriptionIcon
                            color='secondary'
                            sx={{ fontSize: 28 }}
                          />
                        )}
                      </Box>

                      {/* Content */}
                      <Box sx={{ flexGrow: 1, minWidth: 0 }}>
                        <Stack
                          direction='row'
                          spacing={1}
                          alignItems='center'
                          sx={{ mb: 1 }}
                        >
                          <Typography
                            variant='subtitle1'
                            sx={{ fontWeight: 600 }}
                          >
                            {result.displayTitle}
                          </Typography>
                          <Chip
                            label={result.type === 'note' ? 'فیش' : 'منبع'}
                            size='small'
                            color={result.type === 'note' ? 'primary' : 'secondary'}
                            sx={{ height: 20, fontSize: '0.7rem' }}
                          />
                        </Stack>

                        {/* Additional Info for Sources */}
                        {result.type === 'source' && (
                          <Box
                            sx={{
                              display: 'flex',
                              gap: 1,
                              mb: 1,
                              flexWrap: 'wrap',
                            }}
                          >
                            {result.authors && result.authors.length > 0 && (
                              <Chip
                                label={`${result.authors[0].firstname} ${result.authors[0].lastname}`}
                                size='small'
                                variant='outlined'
                              />
                            )}
                            {result.year && (
                              <Chip
                                label={result.year}
                                size='small'
                                variant='outlined'
                              />
                            )}
                            {result.language && (
                              <Chip
                                label={result.language === 'persian' ? 'فارسی' : 'انگلیسی'}
                                size='small'
                                variant='outlined'
                              />
                            )}
                          </Box>
                        )}

                        {/* Content Preview */}
                        {result.displayContent && (
                          <Typography
                            variant='body2'
                            color='text.secondary'
                            sx={{ mb: 1 }}
                          >
                            {truncateText(result.displayContent)}
                          </Typography>
                        )}

                        {/* Tags */}
                        {result.tags && result.tags.length > 0 && (
                          <Box sx={{ display: 'flex', gap: 0.5, mb: 1, flexWrap: 'wrap' }}>
                            {result.tags.slice(0, 3).map((tag: string, idx: number) => (
                              <Chip
                                key={idx}
                                label={tag}
                                size='small'
                                variant='filled'
                                sx={{
                                  height: 20,
                                  fontSize: '0.65rem',
                                  bgcolor: (theme) =>
                                    alpha(theme.palette.primary.main, 0.08),
                                }}
                              />
                            ))}
                          </Box>
                        )}

                        {/* Date */}
                        <Typography variant='caption' color='text.secondary'>
                          {formatDate(result.createdAt)}
                        </Typography>
                      </Box>

                      {/* Action Button */}
                      <Tooltip title='مشاهده جزئیات'>
                        <IconButton size='small' color='primary'>
                          <VisibilityIcon />
                        </IconButton>
                      </Tooltip>
                    </Stack>
                  </CardContent>
                </Card>
              ))}
            </Stack>
          ) : (
            <Paper sx={{ p: 4, textAlign: 'center' }}>
              <Typography variant='body1' color='text.secondary'>
                هیچ نتیجه‌ای برای "{query}" یافت نشد
              </Typography>
            </Paper>
          )}
        </Box>
      )}

      {/* No Search Performed */}
      {!hasSearched && !isLoading && (
        <Box sx={{ textAlign: 'center', py: 8 }}>
          <SearchIcon sx={{ fontSize: 64, color: 'text.secondary', mb: 2 }} />
          <Typography variant='h6' color='text.secondary' gutterBottom>
            جستجوی معنایی را شروع کنید
          </Typography>
          <Typography variant='body2' color='text.secondary'>
            عبارت مورد نظر خود را در کادر بالا وارد کنید
          </Typography>
        </Box>
      )}
    </Container>
  );
};

export default SearchPage;
