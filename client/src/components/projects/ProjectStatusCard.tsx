import React, { useState } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Button,
  Chip,
  LinearProgress,
  Stack,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Slider,
  TextField,
  Alert,
  IconButton,
  Tooltip,
} from '@mui/material';
import {
  Edit,
  CheckCircle,
  Cancel,
  PlayArrow,
  Calculate,
  TrendingUp,
  Schedule,
  Flag,
} from '@mui/icons-material';
import { useDispatch } from 'react-redux';
import type { AppDispatch } from '../../store';
import type { IProject } from '../../types';
import {
  updateProjectStatus,
  updateProjectProgress,
  calculateProjectProgress,
} from '../../store/features/projectSlice';

interface ProjectStatusCardProps {
  project: IProject;
}

const ProjectStatusCard: React.FC<ProjectStatusCardProps> = ({ project }) => {
  const dispatch = useDispatch<AppDispatch>();
  const [statusDialogOpen, setStatusDialogOpen] = useState(false);
  const [progressDialogOpen, setProgressDialogOpen] = useState(false);
  const [selectedStatus, setSelectedStatus] = useState(
    project.status || 'در حال انجام'
  );
  const [progressValue, setProgressValue] = useState(project.progress || 0);
  const [isLoading, setIsLoading] = useState(false);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'در حال انجام':
        return 'primary';
      case 'خاتمه یافته':
        return 'success';
      case 'کنسل شده':
        return 'error';
      default:
        return 'default';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'در حال انجام':
        return <PlayArrow />;
      case 'خاتمه یافته':
        return <CheckCircle />;
      case 'کنسل شده':
        return <Cancel />;
      default:
        return <PlayArrow />;
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'فوری':
        return 'error';
      case 'زیاد':
        return 'warning';
      case 'متوسط':
        return 'info';
      case 'کم':
        return 'success';
      default:
        return 'default';
    }
  };

  const handleStatusUpdate = async () => {
    setIsLoading(true);
    try {
      await dispatch(
        updateProjectStatus({
          projectId: project._id,
          status: selectedStatus,
        })
      ).unwrap();
      setStatusDialogOpen(false);
    } catch (error) {
      console.error('Error updating project status:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleProgressUpdate = async () => {
    setIsLoading(true);
    try {
      await dispatch(
        updateProjectProgress({
          projectId: project._id,
          progress: progressValue,
        })
      ).unwrap();
      setProgressDialogOpen(false);
    } catch (error) {
      console.error('Error updating project progress:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCalculateProgress = async () => {
    setIsLoading(true);
    try {
      await dispatch(calculateProjectProgress(project._id)).unwrap();
    } catch (error) {
      console.error('Error calculating project progress:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const getProgressLabel = (progress: number) => {
    if (progress >= 90) return 'تقریباً تکمیل شده';
    if (progress >= 70) return 'در حال تکمیل';
    if (progress >= 50) return 'نیمه کاره';
    if (progress >= 25) return 'شروع شده';
    return 'شروع نشده';
  };

  const getProgressColor = (progress: number) => {
    if (progress >= 90) return 'success';
    if (progress >= 70) return 'info';
    if (progress >= 50) return 'warning';
    if (progress >= 25) return 'secondary';
    return 'error';
  };

  return (
    <Card sx={{ height: '100%' }}>
      <CardContent>
        <Stack
          direction='row'
          alignItems='center'
          justifyContent='space-between'
          sx={{ mb: 2 }}
        >
          <Typography variant='h6' fontWeight='600'>
            وضعیت پروژه
          </Typography>
          <Stack direction='row' spacing={1}>
            <Tooltip title='محاسبه پیشرفت بر اساس منابع'>
              <IconButton
                size='small'
                onClick={handleCalculateProgress}
                disabled={isLoading}
              >
                <Calculate />
              </IconButton>
            </Tooltip>
          </Stack>
        </Stack>

        {/* Project Status */}
        <Box sx={{ mb: 3 }}>
          <Stack
            direction='row'
            alignItems='center'
            justifyContent='space-between'
            sx={{ mb: 1 }}
          >
            <Typography variant='body2' color='text.secondary'>
              وضعیت فعلی
            </Typography>
            <Button
              size='small'
              startIcon={<Edit />}
              onClick={() => setStatusDialogOpen(true)}
            >
              تغییر
            </Button>
          </Stack>
          <Chip
            icon={getStatusIcon(project.status || 'در حال انجام')}
            label={project.status || 'در حال انجام'}
            color={getStatusColor(project.status || 'در حال انجام') as any}
            variant='outlined'
            sx={{ mb: 1 }}
          />
        </Box>

        {/* Project Priority */}
        {project.priority && (
          <Box sx={{ mb: 3 }}>
            <Typography variant='body2' color='text.secondary' sx={{ mb: 1 }}>
              اولویت
            </Typography>
            <Chip
              icon={<Flag />}
              label={project.priority}
              color={getPriorityColor(project.priority) as any}
              variant='outlined'
              size='small'
            />
          </Box>
        )}

        {/* Project Progress */}
        <Box sx={{ mb: 3 }}>
          <Stack
            direction='row'
            alignItems='center'
            justifyContent='space-between'
            sx={{ mb: 1 }}
          >
            <Typography variant='body2' color='text.secondary'>
              پیشرفت پروژه
            </Typography>
            <Button
              size='small'
              startIcon={<TrendingUp />}
              onClick={() => setProgressDialogOpen(true)}
            >
              تنظیم
            </Button>
          </Stack>
          <Box sx={{ mb: 1 }}>
            <LinearProgress
              variant='determinate'
              value={project.progress || 0}
              color={getProgressColor(project.progress || 0) as any}
              sx={{ height: 8, borderRadius: 4 }}
            />
          </Box>
          <Stack
            direction='row'
            alignItems='center'
            justifyContent='space-between'
          >
            <Typography
              variant='h6'
              fontWeight='bold'
              color={`${getProgressColor(project.progress || 0)}.main`}
            >
              {project.progress || 0}%
            </Typography>
            <Typography variant='caption' color='text.secondary'>
              {getProgressLabel(project.progress || 0)}
            </Typography>
          </Stack>
        </Box>

        {/* Project Duration */}
        {project.estimatedDuration && (
          <Box sx={{ mb: 2 }}>
            <Stack direction='row' alignItems='center' spacing={1}>
              <Schedule sx={{ fontSize: 16, color: 'text.secondary' }} />
              <Typography variant='body2' color='text.secondary'>
                مدت تخمینی: {project.estimatedDuration} روز
              </Typography>
            </Stack>
          </Box>
        )}

        {/* Project Dates */}
        <Box>
          <Typography variant='body2' color='text.secondary' sx={{ mb: 1 }}>
            تاریخ‌ها
          </Typography>
          <Stack spacing={0.5}>
            <Typography variant='caption'>
              شروع:{' '}
              {project.startDate
                ? new Date(project.startDate).toLocaleDateString('fa-IR')
                : 'نامشخص'}
            </Typography>
            {project.endDate && (
              <Typography variant='caption'>
                پایان: {new Date(project.endDate).toLocaleDateString('fa-IR')}
              </Typography>
            )}
          </Stack>
        </Box>
      </CardContent>

      {/* Status Update Dialog */}
      <Dialog
        open={statusDialogOpen}
        onClose={() => setStatusDialogOpen(false)}
      >
        <DialogTitle>تغییر وضعیت پروژه</DialogTitle>
        <DialogContent>
          <FormControl fullWidth sx={{ mt: 2 }}>
            <InputLabel>وضعیت</InputLabel>
            <Select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              label='وضعیت'
            >
              <MenuItem value='در حال انجام'>در حال انجام</MenuItem>
              <MenuItem value='خاتمه یافته'>خاتمه یافته</MenuItem>
              <MenuItem value='کنسل شده'>کنسل شده</MenuItem>
            </Select>
          </FormControl>
          {selectedStatus === 'خاتمه یافته' && (
            <Alert severity='info' sx={{ mt: 2 }}>
              با تغییر وضعیت به "خاتمه یافته"، پیشرفت پروژه به 100% تنظیم
              می‌شود.
            </Alert>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setStatusDialogOpen(false)}>انصراف</Button>
          <Button onClick={handleStatusUpdate} disabled={isLoading}>
            {isLoading ? 'در حال بروزرسانی...' : 'تأیید'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Progress Update Dialog */}
      <Dialog
        open={progressDialogOpen}
        onClose={() => setProgressDialogOpen(false)}
      >
        <DialogTitle>تنظیم پیشرفت پروژه</DialogTitle>
        <DialogContent>
          <Box sx={{ mt: 2, mb: 2 }}>
            <Typography variant='body2' color='text.secondary' sx={{ mb: 2 }}>
              پیشرفت فعلی: {progressValue}%
            </Typography>
            <Slider
              value={progressValue}
              onChange={(_, value) => setProgressValue(value as number)}
              min={0}
              max={100}
              step={5}
              marks={[
                { value: 0, label: '0%' },
                { value: 25, label: '25%' },
                { value: 50, label: '50%' },
                { value: 75, label: '75%' },
                { value: 100, label: '100%' },
              ]}
              valueLabelDisplay='auto'
            />
          </Box>
          <TextField
            fullWidth
            label='پیشرفت (درصد)'
            type='number'
            value={progressValue}
            onChange={(e) => setProgressValue(parseInt(e.target.value) || 0)}
            inputProps={{ min: 0, max: 100 }}
            sx={{ mt: 2 }}
          />
          <Alert severity='info' sx={{ mt: 2 }}>
            {getProgressLabel(progressValue)}
          </Alert>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setProgressDialogOpen(false)}>انصراف</Button>
          <Button onClick={handleProgressUpdate} disabled={isLoading}>
            {isLoading ? 'در حال بروزرسانی...' : 'تأیید'}
          </Button>
        </DialogActions>
      </Dialog>
    </Card>
  );
};

export default ProjectStatusCard;
