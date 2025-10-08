import React from 'react';
import { Paper, Typography, Stack, Button, Box, Chip } from '@mui/material';
import { Edit, Share, Download } from '@mui/icons-material';

interface SourceSidebarProps {
  onEdit: () => void;
  onShare: () => void;
  onDownload: () => void;
}

export const SourceSidebar: React.FC<SourceSidebarProps> = ({
  onEdit,
  onShare,
  onDownload,
}) => {
  return (
    <Stack spacing={3}>
      {/* Quick Actions */}
      <Paper
        elevation={0}
        sx={{
          p: 3,
          borderRadius: 3,
          border: '1px solid',
          borderColor: 'divider',
        }}
      >
        <Typography variant='h6' fontWeight='700' gutterBottom>
          اقدامات سریع
        </Typography>
        <Stack spacing={2}>
          <Button
            variant='contained'
            startIcon={<Edit />}
            onClick={onEdit}
            fullWidth
          >
            ویرایش منبع
          </Button>
          <Button
            variant='outlined'
            startIcon={<Share />}
            onClick={onShare}
            fullWidth
          >
            اشتراک‌گذاری
          </Button>
          <Button
            variant='outlined'
            startIcon={<Download />}
            onClick={onDownload}
            fullWidth
          >
            دانلود
          </Button>
        </Stack>
      </Paper>

      {/* Source Statistics */}
      <Paper
        elevation={0}
        sx={{
          p: 3,
          borderRadius: 3,
          border: '1px solid',
          borderColor: 'divider',
        }}
      >
        <Typography variant='h6' fontWeight='700' gutterBottom>
          آمار منبع
        </Typography>
        <Stack spacing={2}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
            <Typography variant='body2' color='text.secondary'>
              وضعیت
            </Typography>
            <Chip label='فعال' color='success' size='small' />
          </Box>
          <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
            <Typography variant='body2' color='text.secondary'>
              تاریخ ایجاد
            </Typography>
            <Typography variant='body2' fontWeight='500'>
              {new Date().toLocaleDateString('fa-IR')}
            </Typography>
          </Box>
          <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
            <Typography variant='body2' color='text.secondary'>
              آخرین بروزرسانی
            </Typography>
            <Typography variant='body2' fontWeight='500'>
              {new Date().toLocaleDateString('fa-IR')}
            </Typography>
          </Box>
        </Stack>
      </Paper>
    </Stack>
  );
};
