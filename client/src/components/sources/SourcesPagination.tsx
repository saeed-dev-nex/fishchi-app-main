import React from 'react';
import {
  Box,
  Pagination,
  Stack,
  Typography,
  IconButton,
  Tooltip,
  alpha,
} from '@mui/material';
import {
  FirstPage,
  LastPage,
  ChevronLeft,
  ChevronRight,
} from '@mui/icons-material';
import type { PaginationInfo } from '../../types';

interface SourcesPaginationProps {
  pagination: PaginationInfo;
  onPageChange: (page: number) => void;
  onPageSizeChange?: (pageSize: number) => void;
}

const SourcesPagination: React.FC<SourcesPaginationProps> = ({
  pagination,
  onPageChange,
  onPageSizeChange,
}) => {
  const {
    currentPage,
    totalPages,
    totalCount,
    hasNextPage,
    hasPrevPage,
    limit,
  } = pagination;

  const handlePageChange = (
    _event: React.ChangeEvent<unknown>,
    page: number
  ) => {
    onPageChange(page);
  };

  const goToFirstPage = () => {
    if (hasPrevPage) {
      onPageChange(1);
    }
  };

  const goToLastPage = () => {
    if (hasNextPage) {
      onPageChange(totalPages);
    }
  };

  const goToPrevPage = () => {
    if (hasPrevPage) {
      onPageChange(currentPage - 1);
    }
  };

  const goToNextPage = () => {
    if (hasNextPage) {
      onPageChange(currentPage + 1);
    }
  };

  // Calculate range of items being displayed
  const startItem = (currentPage - 1) * limit + 1;
  const endItem = Math.min(currentPage * limit, totalCount);

  if (totalPages <= 1) {
    return null;
  }

  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: { xs: 'column', sm: 'row' },
        justifyContent: 'space-between',
        alignItems: 'center',
        gap: 2,
        p: 3,
        mt: 3,
        borderRadius: 2,
        border: (theme) => `1px solid ${alpha(theme.palette.divider, 0.1)}`,
        background: (theme) =>
          `linear-gradient(135deg, ${alpha(
            theme.palette.primary.main,
            0.02
          )} 0%, ${alpha(theme.palette.secondary.main, 0.02)} 100%)`,
      }}
    >
      {/* Results Info */}
      <Typography
        variant='body2'
        color='text.secondary'
        sx={{ fontWeight: 500 }}
      >
        نمایش {startItem} تا {endItem} از {totalCount} منبع
      </Typography>

      {/* Pagination Controls */}
      <Stack direction='row' spacing={1} alignItems='center'>
        {/* First Page Button */}
        <Tooltip title='صفحه اول'>
          <IconButton
            onClick={goToFirstPage}
            disabled={!hasPrevPage}
            size='small'
            sx={{
              borderRadius: 1.5,
              border: (theme) =>
                `1px solid ${alpha(theme.palette.divider, 0.2)}`,
              '&:hover': {
                bgcolor: alpha('#000', 0.05),
              },
              '&:disabled': {
                opacity: 0.3,
              },
            }}
          >
            <FirstPage fontSize='small' />
          </IconButton>
        </Tooltip>

        {/* Previous Page Button */}
        <Tooltip title='صفحه قبلی'>
          <IconButton
            onClick={goToPrevPage}
            disabled={!hasPrevPage}
            size='small'
            sx={{
              borderRadius: 1.5,
              border: (theme) =>
                `1px solid ${alpha(theme.palette.divider, 0.2)}`,
              '&:hover': {
                bgcolor: alpha('#000', 0.05),
              },
              '&:disabled': {
                opacity: 0.3,
              },
            }}
          >
            <ChevronLeft fontSize='small' />
          </IconButton>
        </Tooltip>

        {/* Pagination Component */}
        <Pagination
          count={totalPages}
          page={currentPage}
          onChange={handlePageChange}
          color='primary'
          size='small'
          siblingCount={1}
          boundaryCount={1}
          sx={{
            '& .MuiPaginationItem-root': {
              borderRadius: 1.5,
              fontWeight: 500,
              '&.Mui-selected': {
                bgcolor: 'primary.main',
                color: 'white',
                '&:hover': {
                  bgcolor: 'primary.dark',
                },
              },
              '&:hover': {
                bgcolor: alpha('#000', 0.05),
              },
            },
          }}
        />

        {/* Next Page Button */}
        <Tooltip title='صفحه بعدی'>
          <IconButton
            onClick={goToNextPage}
            disabled={!hasNextPage}
            size='small'
            sx={{
              borderRadius: 1.5,
              border: (theme) =>
                `1px solid ${alpha(theme.palette.divider, 0.2)}`,
              '&:hover': {
                bgcolor: alpha('#000', 0.05),
              },
              '&:disabled': {
                opacity: 0.3,
              },
            }}
          >
            <ChevronRight fontSize='small' />
          </IconButton>
        </Tooltip>

        {/* Last Page Button */}
        <Tooltip title='صفحه آخر'>
          <IconButton
            onClick={goToLastPage}
            disabled={!hasNextPage}
            size='small'
            sx={{
              borderRadius: 1.5,
              border: (theme) =>
                `1px solid ${alpha(theme.palette.divider, 0.2)}`,
              '&:hover': {
                bgcolor: alpha('#000', 0.05),
              },
              '&:disabled': {
                opacity: 0.3,
              },
            }}
          >
            <LastPage fontSize='small' />
          </IconButton>
        </Tooltip>
      </Stack>
    </Box>
  );
};

export default SourcesPagination;
