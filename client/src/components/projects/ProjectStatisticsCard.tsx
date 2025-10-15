import React, { useEffect, useState } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Grid,
  LinearProgress,
  Chip,
  Stack,
  Alert,
  CircularProgress,
} from '@mui/material';
import {
  TrendingUp,
  Schedule,
  CheckCircle,
  Pending,
  Review,
  Flag,
  CalendarToday,
} from '@mui/icons-material';
import { useDispatch, useSelector } from 'react-redux';
import type { AppDispatch, RootState } from '../../store';
import type { IProject, IProjectStatistics } from '../../types';
import { getProjectStatistics } from '../../store/features/projectSlice';

interface ProjectStatisticsCardProps {
  project: IProject;
}

const ProjectStatisticsCard: React.FC<ProjectStatisticsCardProps> = ({
  project,
}) => {
  const dispatch = useDispatch<AppDispatch>();
  const { isLoading } = useSelector((state: RootState) => state.projects);
  const [statistics, setStatistics] = useState<IProjectStatistics | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchStatistics = async () => {
      try {
        const result = await dispatch(
          getProjectStatistics(project._id)
        ).unwrap();
        setStatistics(result);
        setError(null);
      } catch (err: any) {
        setError(err.message || 'خطا در دریافت آمار پروژه');
      }
    };

    fetchStatistics();
  }, [dispatch, project._id]);

  if (isLoading) {
    return (
      <Card sx={{ height: '100%' }}>
        <CardContent>
          <Box
            display='flex'
            justifyContent='center'
            alignItems='center'
            minHeight={200}
          >
            <CircularProgress />
          </Box>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card sx={{ height: '100%' }}>
        <CardContent>
          <Alert severity='error'>{error}</Alert>
        </CardContent>
      </Card>
    );
  }

  if (!statistics) {
    return null;
  }

  const getProgressColor = (progress: number) => {
    if (progress >= 90) return 'success';
    if (progress >= 70) return 'info';
    if (progress >= 50) return 'warning';
    if (progress >= 25) return 'secondary';
    return 'error';
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

  return (
    <Card sx={{ height: '100%' }}>
      <CardContent>
        <Typography variant='h6' fontWeight='600' sx={{ mb: 3 }}>
          آمار پروژه
        </Typography>

        <Grid container spacing={3}>
          {/* Progress Overview */}
          <Grid item xs={12}>
            <Box sx={{ mb: 2 }}>
              <Stack
                direction='row'
                alignItems='center'
                justifyContent='space-between'
                sx={{ mb: 1 }}
              >
                <Typography variant='body2' color='text.secondary'>
                  پیشرفت کلی
                </Typography>
                <Typography
                  variant='h6'
                  fontWeight='bold'
                  color={`${getProgressColor(statistics.progress)}.main`}
                >
                  {statistics.progress}%
                </Typography>
              </Stack>
              <LinearProgress
                variant='determinate'
                value={statistics.progress}
                color={getProgressColor(statistics.progress) as any}
                sx={{ height: 8, borderRadius: 4 }}
              />
            </Box>
          </Grid>

          {/* Sources Statistics */}
          <Grid item xs={12}>
            <Typography variant='subtitle2' fontWeight='600' sx={{ mb: 2 }}>
              آمار منابع
            </Typography>
            <Grid container spacing={2}>
              <Grid item xs={6}>
                <Box
                  sx={{
                    textAlign: 'center',
                    p: 2,
                    bgcolor: 'grey.50',
                    borderRadius: 2,
                  }}
                >
                  <Typography
                    variant='h4'
                    fontWeight='bold'
                    color='primary.main'
                  >
                    {statistics.totalSources}
                  </Typography>
                  <Typography variant='caption' color='text.secondary'>
                    کل منابع
                  </Typography>
                </Box>
              </Grid>
              <Grid item xs={6}>
                <Box
                  sx={{
                    textAlign: 'center',
                    p: 2,
                    bgcolor: 'success.50',
                    borderRadius: 2,
                  }}
                >
                  <Typography
                    variant='h4'
                    fontWeight='bold'
                    color='success.main'
                  >
                    {statistics.completedSources}
                  </Typography>
                  <Typography variant='caption' color='text.secondary'>
                    تکمیل شده
                  </Typography>
                </Box>
              </Grid>
              <Grid item xs={6}>
                <Box
                  sx={{
                    textAlign: 'center',
                    p: 2,
                    bgcolor: 'warning.50',
                    borderRadius: 2,
                  }}
                >
                  <Typography
                    variant='h4'
                    fontWeight='bold'
                    color='warning.main'
                  >
                    {statistics.pendingSources}
                  </Typography>
                  <Typography variant='caption' color='text.secondary'>
                    در انتظار
                  </Typography>
                </Box>
              </Grid>
              <Grid item xs={6}>
                <Box
                  sx={{
                    textAlign: 'center',
                    p: 2,
                    bgcolor: 'info.50',
                    borderRadius: 2,
                  }}
                >
                  <Typography variant='h4' fontWeight='bold' color='info.main'>
                    {statistics.reviewedSources}
                  </Typography>
                  <Typography variant='caption' color='text.secondary'>
                    بررسی شده
                  </Typography>
                </Box>
              </Grid>
            </Grid>
          </Grid>

          {/* Project Status and Priority */}
          <Grid item xs={12}>
            <Typography variant='subtitle2' fontWeight='600' sx={{ mb: 2 }}>
              وضعیت پروژه
            </Typography>
            <Stack direction='row' spacing={2} sx={{ mb: 2 }}>
              <Chip
                icon={<TrendingUp />}
                label={statistics.status}
                color={getStatusColor(statistics.status) as any}
                variant='outlined'
              />
              <Chip
                icon={<Flag />}
                label={statistics.priority}
                color={getPriorityColor(statistics.priority) as any}
                variant='outlined'
              />
            </Stack>
          </Grid>

          {/* Time Information */}
          <Grid item xs={12}>
            <Typography variant='subtitle2' fontWeight='600' sx={{ mb: 2 }}>
              اطلاعات زمانی
            </Typography>
            <Stack spacing={1}>
              <Stack direction='row' alignItems='center' spacing={1}>
                <CalendarToday sx={{ fontSize: 16, color: 'text.secondary' }} />
                <Typography variant='body2' color='text.secondary'>
                  شروع:{' '}
                  {new Date(statistics.startDate).toLocaleDateString('fa-IR')}
                </Typography>
              </Stack>
              {statistics.endDate && (
                <Stack direction='row' alignItems='center' spacing={1}>
                  <CheckCircle sx={{ fontSize: 16, color: 'text.secondary' }} />
                  <Typography variant='body2' color='text.secondary'>
                    پایان:{' '}
                    {new Date(statistics.endDate).toLocaleDateString('fa-IR')}
                  </Typography>
                </Stack>
              )}
              <Stack direction='row' alignItems='center' spacing={1}>
                <Schedule sx={{ fontSize: 16, color: 'text.secondary' }} />
                <Typography variant='body2' color='text.secondary'>
                  روزهای سپری شده: {statistics.daysElapsed} روز
                </Typography>
              </Stack>
              {statistics.estimatedDuration && (
                <Stack direction='row' alignItems='center' spacing={1}>
                  <TrendingUp sx={{ fontSize: 16, color: 'text.secondary' }} />
                  <Typography variant='body2' color='text.secondary'>
                    مدت تخمینی: {statistics.estimatedDuration} روز
                  </Typography>
                </Stack>
              )}
              {statistics.estimatedCompletion && (
                <Stack direction='row' alignItems='center' spacing={1}>
                  <Pending sx={{ fontSize: 16, color: 'text.secondary' }} />
                  <Typography variant='body2' color='text.secondary'>
                    تکمیل تخمینی: {statistics.estimatedCompletion} روز
                  </Typography>
                </Stack>
              )}
            </Stack>
          </Grid>
        </Grid>
      </CardContent>
    </Card>
  );
};

export default ProjectStatisticsCard;
