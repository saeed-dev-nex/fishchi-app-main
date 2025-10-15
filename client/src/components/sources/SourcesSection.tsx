import React from 'react';
import {
  Box,
  List,
  CircularProgress,
  Alert,
  Typography,
  Button,
  Avatar,
  alpha,
  Stack,
  Chip,
} from '@mui/material';
import { LibraryBooks, Add } from '@mui/icons-material';
import SourceListItem from './SourceListItem'; // کامپوننت آیتم لیست
import type { ISource } from '../../types';

// تعریف Props
interface SourcesSectionProps {
  sources: ISource[];
  isLoading: boolean;
  error: string | null;
  selected: string[];
  activeSourceId: string | null;
  onSelect: (id: string) => void;
  onOpenAddSourceModal: () => void;
  onOpenDeleteDialog: () => void;
  onClearSelection: () => void;
  onSelectSource: (id: string) => void;
}

export const SourcesSection: React.FC<SourcesSectionProps> = ({
  sources,
  isLoading,
  error,
  selected,
  onOpenAddSourceModal,
  onOpenDeleteDialog,
  onClearSelection,
  onSelect,
  onSelectSource,
  activeSourceId,
}) => {
  const numSelected = selected.length;
  const sourceCount = Array.isArray(sources) ? sources.length : 0;

  const renderContent = () => {
    if (isLoading)
      return (
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
          <CircularProgress />
        </Box>
      );
    if (error) return <Alert severity='error'>{error}</Alert>;
    if (sourceCount === 0) {
      return (
        <Box sx={{ textAlign: 'center', py: 8 }}>
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
          <Typography variant='h6' fontWeight='600'>
            هیچ منبعی یافت نشد
          </Typography>
          <Button
            variant='contained'
            startIcon={<Add />}
            onClick={onOpenAddSourceModal}
          >
            افزودن منبع
          </Button>
        </Box>
      );
    }

    return (
      <List>
        {Array.isArray(sources)
          ? sources.map((source) => (
              <SourceListItem
                key={source._id}
                source={source}
                isSelected={selected.includes(source._id)}
                onSelect={onSelect}
                onSelectSource={onSelectSource}
                activeSourceId={activeSourceId}
              />
            ))
          : null}
      </List>
    );
  };

  return (
    <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      {/* Selection Toolbar */}
      {numSelected > 0 && (
        <Box
          sx={{
            p: 2,
            borderBottom: (theme) =>
              `1px solid ${alpha(theme.palette.divider, 0.1)}`,
            background: (theme) =>
              `linear-gradient(90deg, ${alpha(
                theme.palette.primary.main,
                0.08
              )} 0%, transparent 100%)`,
          }}
        >
          <Stack direction='row' spacing={2} alignItems='center'>
            <Typography variant='body1' fontWeight='600' color='primary'>
              {numSelected} مورد انتخاب شده
            </Typography>
            <Chip
              label={`${numSelected} از ${sourceCount}`}
              size='small'
              color='primary'
              variant='outlined'
            />
            <Button
              variant='outlined'
              color='error'
              size='small'
              onClick={onOpenDeleteDialog}
              sx={{ borderRadius: 2, textTransform: 'none' }}
            >
              حذف
            </Button>
            <Button
              variant='outlined'
              size='small'
              onClick={onClearSelection}
              sx={{ borderRadius: 2, textTransform: 'none' }}
            >
              لغو انتخاب
            </Button>
          </Stack>
        </Box>
      )}

      {/* Content */}
      <Box sx={{ flex: 1, overflow: 'auto' }}>{renderContent()}</Box>
    </Box>
  );
};
