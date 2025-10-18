import React from 'react';
import {
  Box,
  Pagination,
  FormControl,
  Select,
  MenuItem,
  Typography,
  Stack,
  alpha,
} from '@mui/material';

interface SourcesPaginationProps {
  currentPage: number;
  totalPages: number;
  itemsPerPage: number;
  totalItems: number;
  onPageChange: (page: number) => void;
  onItemsPerPageChange: (itemsPerPage: number) => void;
}

type SelectChangeEvent = React.ChangeEvent<{ value: unknown }>;

const SourcesPagination: React.FC<SourcesPaginationProps> = ({
  currentPage,
  totalPages,
  itemsPerPage,
  totalItems,
  onPageChange,
  onItemsPerPageChange,
}) => {
  const handlePageChange = (
    _event: React.ChangeEvent<unknown>,
    page: number
  ) => {
    onPageChange(page);
  };

  const handleItemsPerPageChange = (event: SelectChangeEvent<number>) => {
    onItemsPerPageChange(Number(event.target.value));
  };

  const startItem = (currentPage - 1) * itemsPerPage + 1;
  const endItem = Math.min(currentPage * itemsPerPage, totalItems);

  return (
    <Box
      sx={{
        p: 2,
        borderTop: (theme) => `1px solid ${alpha(theme.palette.divider, 0.1)}`,
        background: (theme) =>
          `linear-gradient(90deg, ${alpha(
            theme.palette.background.paper,
            0.8
          )} 0%, ${alpha(theme.palette.background.default, 0.4)} 100%)`,
        backdropFilter: 'blur(10px)',
      }}
    >
      <Stack
        direction='row'
        justifyContent='space-between'
        alignItems='center'
        spacing={2}
        sx={{ flexWrap: 'wrap', gap: 2 }}
      >
        {/* Items per page selector */}
        <Stack direction='row' alignItems='center' spacing={1}>
          <Typography variant='body2' color='text.secondary'>
            نمایش:
          </Typography>
          <FormControl size='small' sx={{ minWidth: 80 }}>
            <Select
              value={itemsPerPage}
              onChange={handleItemsPerPageChange}
              sx={{
                borderRadius: 2,
                '& .MuiOutlinedInput-notchedOutline': {
                  borderColor: 'divider',
                },
              }}
            >
              <MenuItem value={3}>3</MenuItem>
              <MenuItem value={5}>5</MenuItem>
              <MenuItem value={10}>10</MenuItem>
            </Select>
          </FormControl>
          <Typography variant='body2' color='text.secondary'>
            در هر صفحه
          </Typography>
        </Stack>

        {/* Items info */}
        <Typography variant='body2' color='text.secondary'>
          {startItem}-{endItem} از {totalItems} منبع
        </Typography>

        {/* Pagination */}
        {totalPages > 1 && (
          <Pagination
            count={totalPages}
            page={currentPage}
            onChange={handlePageChange}
            color='primary'
            size='small'
            sx={{
              '& .MuiPaginationItem-root': {
                borderRadius: 2,
                fontWeight: 500,
              },
            }}
          />
        )}
      </Stack>
    </Box>
  );
};

export default SourcesPagination;
