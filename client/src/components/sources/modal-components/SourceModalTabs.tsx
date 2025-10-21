import React from 'react';
import { Tabs, Tab, Stack, Paper, alpha } from '@mui/material';
import {
  Add as AddIcon,
  Description as DescriptionIcon,
  Search as SearchIcon,
} from '@mui/icons-material';

interface SourceModalTabsProps {
  activeTab: number;
  onTabChange: (event: React.SyntheticEvent, newValue: number) => void;
  hasProjectId: boolean;
}

const SourceModalTabs: React.FC<SourceModalTabsProps> = ({
  activeTab,
  onTabChange,
  hasProjectId,
}) => {
  return (
    <Paper
      elevation={0}
      sx={{
        borderRadius: 2,
        border: (theme) => `1px solid ${alpha(theme.palette.divider, 0.1)}`,
        mb: 3,
        overflow: 'hidden',
      }}
    >
      <Tabs
        value={activeTab}
        onChange={onTabChange}
        variant='fullWidth'
        sx={{
          '& .MuiTab-root': {
            textTransform: 'none',
            fontWeight: 500,
            minHeight: 48,
          },
          '& .Mui-selected': {
            color: 'primary.main',
          },
          '& .MuiTabs-indicator': {
            height: 3,
            borderRadius: '3px 3px 0 0',
          },
        }}
      >
        <Tab
          label={
            <Stack direction='row' spacing={1} alignItems='center'>
              <AddIcon fontSize='small' />
              <span>دستی</span>
            </Stack>
          }
        />
        <Tab
          label={
            <Stack direction='row' spacing={1} alignItems='center'>
              <DescriptionIcon fontSize='small' />
              <span>DOI</span>
            </Stack>
          }
        />
        <Tab
          label={
            <Stack direction='row' spacing={1} alignItems='center'>
              <SearchIcon fontSize='small' />
              <span>Parse Citation</span>
            </Stack>
          }
        />
        {hasProjectId && (
          <Tab
            label={
              <Stack direction='row' spacing={1} alignItems='center'>
                <SearchIcon fontSize='small' />
                <span>کتابخانه</span>
              </Stack>
            }
          />
        )}
      </Tabs>
    </Paper>
  );
};

export default SourceModalTabs;
