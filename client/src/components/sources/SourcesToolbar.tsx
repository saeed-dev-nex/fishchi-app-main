import React from 'react';
import {
  Box,
  Stack,
  Typography,
  ToggleButtonGroup,
  ToggleButton,
  Button,
  Checkbox,
  alpha,
} from '@mui/material';
import { ViewList, ViewModule, Add, Delete } from '@mui/icons-material';

interface SourcesToolbarProps {
  numSelected: number;
  sourceCount: number;
  viewMode: 'grid' | 'list';
  onViewChange: (
    event: React.MouseEvent<HTMLElement>,
    newView: 'grid' | 'list' | null
  ) => void;
  onSelectAll: (event: React.ChangeEvent<HTMLInputElement>) => void;
  onOpenAddSourceModal: () => void;
  onOpenDeleteDialog: () => void;
  onClearSelection: () => void;
}

export const SourcesToolbar: React.FC<SourcesToolbarProps> = ({
  numSelected,
  sourceCount,
  viewMode,
  onViewChange,
  onSelectAll,
  onOpenAddSourceModal,
  onOpenDeleteDialog,
  onClearSelection,
}) => {
  return (
    <>
      <Box
        sx={{
          px: 3,
          py: 2,
          background: (theme) =>
            numSelected > 0
              ? alpha(theme.palette.primary.main, 0.08)
              : 'transparent',
          borderBottom: (theme) =>
            `1px solid ${alpha(theme.palette.divider, 0.1)}`,
          transition: 'all 0.3s ease',
        }}
      >
        <Stack
          direction='row'
          justifyContent='space-between'
          alignItems='center'
        >
          {numSelected > 0 ? (
            <Typography variant='h6' color='primary.main' fontWeight='600'>
              {numSelected} مورد انتخاب شده
            </Typography>
          ) : (
            <Typography variant='h5' fontWeight='600'>
              منابع پروژه
            </Typography>
          )}

          {numSelected === 0 ? (
            <Stack direction='row' spacing={2} alignItems='center'>
              <ToggleButtonGroup
                value={viewMode}
                exclusive
                onChange={onViewChange}
                size='small'
              >
                <ToggleButton value='list'>
                  <ViewList />
                </ToggleButton>
                <ToggleButton value='grid'>
                  <ViewModule />
                </ToggleButton>
              </ToggleButtonGroup>
              <Button
                variant='contained'
                startIcon={<Add />}
                onClick={onOpenAddSourceModal}
              >
                افزودن منبع
              </Button>
            </Stack>
          ) : (
            <Stack direction='row' spacing={2}>
              <Button
                variant='outlined'
                color='error'
                startIcon={<Delete />}
                onClick={onOpenDeleteDialog}
              >
                حذف انتخاب شده‌ها
              </Button>
              <Button variant='outlined' onClick={onClearSelection}>
                لغو انتخاب
              </Button>
            </Stack>
          )}
        </Stack>
      </Box>

      {numSelected > 0 && (
        <Box sx={{ px: 3, py: 1, bgcolor: 'action.hover' }}>
          <Stack direction='row' alignItems='center' spacing={2}>
            <Checkbox
              color='primary'
              indeterminate={numSelected > 0 && numSelected < sourceCount}
              checked={sourceCount > 0 && numSelected === sourceCount}
              onChange={onSelectAll}
            />
            <Typography variant='body2'>انتخاب همه منابع</Typography>
          </Stack>
        </Box>
      )}
    </>
  );
};
