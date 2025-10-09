import React from 'react';
import {
  Box,
  Paper,
  Grid,
  List,
  CircularProgress,
  Alert,
  Typography,
  Button,
  Avatar,
  alpha,
} from '@mui/material';
import { LibraryBooks, Add } from '@mui/icons-material';
import { SourcesToolbar } from './SourcesToolbar'; // کامپوننت تولبار
import { SourceGridItem } from './SourceGridItem'; // کامپوننت آیتم گرید
import { SourceListItem } from './SourceListItem'; // کامپوننت آیتم لیست
import type { ISource } from '../../types';

// تعریف Props
interface SourcesSectionProps {
  sources: ISource[];
  isLoading: boolean;
  error: string | null;
  viewMode: 'grid' | 'list';
  selected: string[];
  onViewChange: (newView: 'grid' | 'list') => void;
  onSelect: (id: string) => void;
  onSelectAll: (event: React.ChangeEvent<HTMLInputElement>) => void;
  onOpenAddSourceModal: () => void;
  onOpenDeleteDialog: () => void;
  onClearSelection: () => void;
  onSelectSource: (id: string) => void;
}

export const SourcesSection: React.FC<SourcesSectionProps> = ({
  sources,
  isLoading,
  error,
  viewMode,
  selected,
  onViewChange,
  onSelect,
  onSelectAll,
  onOpenAddSourceModal,
  onOpenDeleteDialog,
  onClearSelection,
  onSelectSource,
}) => {
  const numSelected = selected.length;
  const sourceCount = sources.length;

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

    if (viewMode === 'grid') {
      return (
        <Grid container spacing={3}>
          {sources.map((source, index) => (
            <SourceGridItem
              key={source._id}
              source={source}
              isSelected={selected.includes(source._id)}
              onSelect={onSelect}
              onSelectSource={onSelectSource}
            />
          ))}
        </Grid>
      );
    }

    return (
      <List>
        {sources.map((source, index) => (
          <SourceListItem
            key={source._id}
            source={source}
            isSelected={selected.includes(source._id)}
            onSelect={onSelect}
            onSelectSource={onSelectSource}
          />
        ))}
      </List>
    );
  };

  return (
    <Paper
      elevation={0}
      sx={{
        mt: 4,
        borderRadius: 3,
        border: (theme) => `1px solid ${alpha(theme.palette.divider, 0.1)}`,
      }}
    >
      <SourcesToolbar
        numSelected={numSelected}
        sourceCount={sourceCount}
        viewMode={viewMode}
        onViewChange={onViewChange}
        onSelectAll={onSelectAll}
        onOpenAddSourceModal={onOpenAddSourceModal}
        onOpenDeleteDialog={onOpenDeleteDialog}
        onClearSelection={onClearSelection}
        onSelectSource={onSelectSource}
      />
      <Box sx={{ p: 3 }}>{renderContent()}</Box>
    </Paper>
  );
};
