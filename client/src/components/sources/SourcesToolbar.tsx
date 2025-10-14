import React, { useState, useEffect } from 'react';
import {
  Box,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  IconButton,
  Paper,
  Stack,
  Chip,
  alpha,
  InputAdornment,
  Tooltip,
} from '@mui/material';
import { Search, Sort, Clear, FilterList } from '@mui/icons-material';

interface SourcesToolbarProps {
  searchQuery: string;
  sortBy: string;
  sortOrder: string;
  onSearchChange: (query: string) => void;
  onSortChange: (sortBy: string, sortOrder: string) => void;
  onClearFilters: () => void;
  totalCount?: number;
}

const SourcesToolbar: React.FC<SourcesToolbarProps> = ({
  searchQuery,
  sortBy,
  sortOrder,
  onSearchChange,
  onSortChange,
  onClearFilters,
  totalCount = 0,
}) => {
  const [localSearchQuery, setLocalSearchQuery] = useState(searchQuery);

  // Debounce search input
  useEffect(() => {
    const timer = setTimeout(() => {
      onSearchChange(localSearchQuery);
    }, 500);

    return () => clearTimeout(timer);
  }, [localSearchQuery, onSearchChange]);

  const handleSortChange = (field: string) => {
    let newOrder = 'desc';
    if (sortBy === field && sortOrder === 'desc') {
      newOrder = 'asc';
    }
    onSortChange(field, newOrder);
  };

  const getSortLabel = (field: string) => {
    const labels = {
      title: 'عنوان',
      year: 'سال انتشار',
      createdAt: 'تاریخ ایجاد',
    };
    return labels[field as keyof typeof labels] || field;
  };

  const getSortIcon = (field: string) => {
    if (sortBy !== field) return <Sort />;
    return sortOrder === 'asc' ? (
      <Sort sx={{ transform: 'rotate(180deg)' }} />
    ) : (
      <Sort />
    );
  };

  const hasActiveFilters =
    searchQuery || sortBy !== 'createdAt' || sortOrder !== 'desc';

  return (
    <Paper
      elevation={0}
      sx={{
        p: 3,
        mb: 3,
        borderRadius: 2,
        border: (theme) => `1px solid ${alpha(theme.palette.divider, 0.1)}`,
        background: (theme) =>
          `linear-gradient(135deg, ${alpha(
            theme.palette.primary.main,
            0.02
          )} 0%, ${alpha(theme.palette.secondary.main, 0.02)} 100%)`,
      }}
    >
      <Stack spacing={3}>
        {/* Search and Sort Row */}
        <Stack
          direction={{ xs: 'column', sm: 'row' }}
          spacing={2}
          alignItems={{ xs: 'stretch', sm: 'center' }}
        >
          {/* Search Input */}
          <TextField
            fullWidth
            variant='outlined'
            placeholder='جستجو در منابع بر اساس عنوان، نویسنده، تگ یا سال...'
            value={localSearchQuery}
            onChange={(e) => setLocalSearchQuery(e.target.value)}
            InputProps={{
              startAdornment: (
                <InputAdornment position='start'>
                  <Search color='action' />
                </InputAdornment>
              ),
              endAdornment: localSearchQuery && (
                <InputAdornment position='end'>
                  <IconButton
                    size='small'
                    onClick={() => {
                      setLocalSearchQuery('');
                      onSearchChange('');
                    }}
                  >
                    <Clear />
                  </IconButton>
                </InputAdornment>
              ),
            }}
            sx={{
              '& .MuiOutlinedInput-root': {
                borderRadius: 2,
                backgroundColor: 'background.paper',
                '&:hover': {
                  backgroundColor: alpha('#000', 0.02),
                },
              },
            }}
          />

          {/* Sort Controls */}
          <Stack direction='row' spacing={1} alignItems='center'>
            <FormControl size='small' sx={{ minWidth: 140 }}>
              <InputLabel>مرتب‌سازی</InputLabel>
              <Select
                value={sortBy}
                label='مرتب‌سازی'
                onChange={(e) => handleSortChange(e.target.value)}
                sx={{ borderRadius: 2 }}
              >
                <MenuItem value='createdAt'>تاریخ ایجاد</MenuItem>
                <MenuItem value='title'>عنوان</MenuItem>
                <MenuItem value='year'>سال انتشار</MenuItem>
              </Select>
            </FormControl>

            <Tooltip
              title={`مرتب‌سازی ${getSortLabel(sortBy)} ${
                sortOrder === 'asc' ? 'صعودی' : 'نزولی'
              }`}
            >
              <IconButton
                onClick={() => handleSortChange(sortBy)}
                sx={{
                  borderRadius: 2,
                  border: (theme) =>
                    `1px solid ${alpha(theme.palette.divider, 0.2)}`,
                  bgcolor: 'background.paper',
                  '&:hover': {
                    bgcolor: alpha('#000', 0.05),
                  },
                }}
              >
                {getSortIcon(sortBy)}
              </IconButton>
            </Tooltip>
          </Stack>
        </Stack>

        {/* Active Filters and Results Count */}
        <Stack
          direction={{ xs: 'column', sm: 'row' }}
          justifyContent='space-between'
          alignItems={{ xs: 'flex-start', sm: 'center' }}
          spacing={2}
        >
          {/* Results Count */}
          <Box>
            <Chip
              icon={<FilterList />}
              label={`${totalCount} منبع یافت شد`}
              variant='outlined'
              color='primary'
              sx={{ fontWeight: 500 }}
            />
          </Box>

          {/* Active Filters */}
          {hasActiveFilters && (
            <Stack direction='row' spacing={1} alignItems='center'>
              <Chip
                label='فیلترهای فعال'
                size='small'
                color='secondary'
                variant='outlined'
              />

              {searchQuery && (
                <Chip
                  label={`جستجو: "${searchQuery}"`}
                  size='small'
                  onDelete={() => {
                    setLocalSearchQuery('');
                    onSearchChange('');
                  }}
                  sx={{ maxWidth: 200 }}
                />
              )}

              {(sortBy !== 'createdAt' || sortOrder !== 'desc') && (
                <Chip
                  label={`مرتب‌سازی: ${getSortLabel(sortBy)} ${
                    sortOrder === 'asc' ? 'صعودی' : 'نزولی'
                  }`}
                  size='small'
                  onDelete={() => onSortChange('createdAt', 'desc')}
                />
              )}

              <IconButton
                size='small'
                onClick={onClearFilters}
                sx={{
                  borderRadius: 2,
                  color: 'error.main',
                  '&:hover': {
                    bgcolor: alpha('#f44336', 0.1),
                  },
                }}
              >
                <Clear />
              </IconButton>
            </Stack>
          )}
        </Stack>
      </Stack>
    </Paper>
  );
};

export default SourcesToolbar;
