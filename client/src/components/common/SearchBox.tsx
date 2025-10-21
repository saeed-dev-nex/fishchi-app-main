import React, { useState, useEffect, useRef } from 'react';
import {
  Box,
  TextField,
  InputAdornment,
  IconButton,
  CircularProgress,
  Paper,
  Typography,
  Divider,
  Chip,
  alpha,
  Fade,
} from '@mui/material';
import {
  Search as SearchIcon,
  Clear as ClearIcon,
  Description as DescriptionIcon,
  Note as NoteIcon,
} from '@mui/icons-material';
import { useDispatch, useSelector } from 'react-redux';
import type { AppDispatch, RootState } from '../../store';
import {
  semanticSearch,
  clearSearchResults,
  setQuery,
} from '../../store/features/searchSlice';
import { useNavigate } from 'react-router-dom';

interface SearchBoxProps {
  placeholder?: string;
  fullWidth?: boolean;
  showResults?: boolean;
  onResultClick?: (result: any, type: 'note' | 'source') => void;
}

const SearchBox: React.FC<SearchBoxProps> = ({
  placeholder = 'جستجوی معنایی در فیش‌ها و منابع...',
  fullWidth = true,
  showResults = true,
  onResultClick,
}) => {
  const dispatch = useDispatch<AppDispatch>();
  const navigate = useNavigate();
  const { results, isLoading, error, query } = useSelector(
    (state: RootState) => state.search
  );
  const [localQuery, setLocalQuery] = useState('');
  const [showDropdown, setShowDropdown] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (results && showResults) {
      setShowDropdown(true);
    }
  }, [results, showResults]);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(event.target as Node)
      ) {
        setShowDropdown(false);
      }
    };

    if (showDropdown) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showDropdown]);

  const handleSearch = async () => {
    if (!localQuery.trim()) return;

    dispatch(setQuery(localQuery));
    await dispatch(semanticSearch(localQuery));
  };

  const handleClear = () => {
    setLocalQuery('');
    dispatch(clearSearchResults());
    setShowDropdown(false);
  };

  const handleKeyPress = (event: React.KeyboardEvent) => {
    if (event.key === 'Enter') {
      handleSearch();
    }
  };

  const handleResultClick = (result: any, type: 'note' | 'source') => {
    if (onResultClick) {
      onResultClick(result, type);
    } else {
      // Default navigation
      if (type === 'note') {
        navigate(`/app/projects/${result.project}`);
      } else if (type === 'source') {
        navigate(`/app/library/${result._id}`);
      }
    }
    setShowDropdown(false);
  };

  const truncateText = (text: string, maxLength: number = 100) => {
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength) + '...';
  };

  return (
    <Box
      ref={containerRef}
      sx={{ position: 'relative', width: fullWidth ? '100%' : 'auto' }}
    >
      <TextField
        fullWidth={fullWidth}
        value={localQuery}
        onChange={(e) => setLocalQuery(e.target.value)}
        onKeyPress={handleKeyPress}
        placeholder={placeholder}
        variant='outlined'
        size='medium'
        sx={{
          '& .MuiInputBase-input': {
            direction: 'rtl',
            textAlign: 'right',
          },
        }}
        InputProps={{
          startAdornment: (
            <InputAdornment position='start'>
              <IconButton
                onClick={handleSearch}
                disabled={isLoading || !localQuery.trim()}
                size='small'
              >
                {isLoading ? <CircularProgress size={20} /> : <SearchIcon />}
              </IconButton>
            </InputAdornment>
          ),
          endAdornment: localQuery && (
            <InputAdornment position='end'>
              <IconButton onClick={handleClear} size='small'>
                <ClearIcon />
              </IconButton>
            </InputAdornment>
          ),
        }}
      />

      {/* Search Results Dropdown */}
      {showResults && showDropdown && results && (
        <Fade in={showDropdown}>
          <Paper
            sx={{
              position: 'absolute',
              top: '100%',
              left: 0,
              right: 0,
              zIndex: 1000,
              mt: 1,
              maxHeight: 400,
              overflow: 'auto',
              boxShadow: (theme) =>
                `0 8px 32px ${alpha(theme.palette.common.black, 0.12)}`,
              borderRadius: 2,
            }}
          >
            {/* Notes Results */}
            {results.notes && results.notes.length > 0 && (
              <Box sx={{ p: 2 }}>
                <Typography
                  variant='subtitle2'
                  color='primary.main'
                  sx={{ mb: 1, display: 'flex', alignItems: 'center', gap: 1 }}
                >
                  <NoteIcon fontSize='small' />
                  فیش‌ها ({results.notes.length})
                </Typography>
                {results.notes.slice(0, 3).map((note: any) => (
                  <Box
                    key={note._id}
                    onClick={() => handleResultClick(note, 'note')}
                    sx={{
                      p: 1.5,
                      borderRadius: 1,
                      cursor: 'pointer',
                      transition: 'background-color 0.2s',
                      '&:hover': {
                        backgroundColor: (theme) =>
                          alpha(theme.palette.primary.main, 0.08),
                      },
                    }}
                  >
                    <Typography
                      variant='body2'
                      sx={{
                        fontWeight: 500,
                        mb: 0.5,
                        color: 'text.primary',
                      }}
                    >
                      {note.pageRef
                        ? `صفحه ${note.pageRef}`
                        : 'فیش بدون صفحه‌مرجع'}
                    </Typography>
                    <Typography
                      variant='body2'
                      color='text.secondary'
                      sx={{ fontSize: '0.8rem' }}
                    >
                      {truncateText(note.content.replace(/<[^>]*>/g, ''))}
                    </Typography>
                  </Box>
                ))}
                {results.notes.length > 3 && (
                  <Typography
                    variant='caption'
                    color='text.secondary'
                    sx={{ mt: 1, display: 'block' }}
                  >
                    و {results.notes.length - 3} فیش دیگر...
                  </Typography>
                )}
              </Box>
            )}

            {/* Sources Results */}
            {results.sources && results.sources.length > 0 && (
              <Box sx={{ p: 2 }}>
                {results.notes && results.notes.length > 0 && (
                  <Divider sx={{ mb: 2 }} />
                )}
                <Typography
                  variant='subtitle2'
                  color='primary.main'
                  sx={{ mb: 1, display: 'flex', alignItems: 'center', gap: 1 }}
                >
                  <DescriptionIcon fontSize='small' />
                  منابع ({results.sources.length})
                </Typography>
                {results.sources.slice(0, 3).map((source: any) => (
                  <Box
                    key={source._id}
                    onClick={() => handleResultClick(source, 'source')}
                    sx={{
                      p: 1.5,
                      borderRadius: 1,
                      cursor: 'pointer',
                      transition: 'background-color 0.2s',
                      '&:hover': {
                        backgroundColor: (theme) =>
                          alpha(theme.palette.primary.main, 0.08),
                      },
                    }}
                  >
                    <Typography
                      variant='body2'
                      sx={{
                        fontWeight: 500,
                        mb: 0.5,
                        color: 'text.primary',
                      }}
                    >
                      {source.title}
                    </Typography>
                    <Box sx={{ display: 'flex', gap: 1, mb: 0.5 }}>
                      {source.authors && source.authors.length > 0 && (
                        <Chip
                          label={
                            source.authors[0].firstname +
                            ' ' +
                            source.authors[0].lastname
                          }
                          size='small'
                          variant='outlined'
                        />
                      )}
                      {source.year && (
                        <Chip
                          label={source.year}
                          size='small'
                          variant='outlined'
                        />
                      )}
                    </Box>
                    {source.abstract && (
                      <Typography
                        variant='body2'
                        color='text.secondary'
                        sx={{ fontSize: '0.8rem' }}
                      >
                        {truncateText(source.abstract)}
                      </Typography>
                    )}
                  </Box>
                ))}
                {results.sources.length > 3 && (
                  <Typography
                    variant='caption'
                    color='text.secondary'
                    sx={{ mt: 1, display: 'block' }}
                  >
                    و {results.sources.length - 3} منبع دیگر...
                  </Typography>
                )}
              </Box>
            )}

            {/* No Results */}
            {(!results.notes || results.notes.length === 0) &&
              (!results.sources || results.sources.length === 0) && (
                <Box sx={{ p: 3, textAlign: 'center' }}>
                  <Typography variant='body2' color='text.secondary'>
                    هیچ نتیجه‌ای برای "{query}" یافت نشد
                  </Typography>
                </Box>
              )}

            {/* Error Message */}
            {error && (
              <Box sx={{ p: 2 }}>
                <Typography variant='body2' color='error'>
                  {error}
                </Typography>
              </Box>
            )}
          </Paper>
        </Fade>
      )}
    </Box>
  );
};

export default SearchBox;
