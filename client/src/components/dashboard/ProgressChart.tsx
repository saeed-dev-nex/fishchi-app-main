import React from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  LinearProgress,
  Stack,
  Chip,
  alpha,
  useTheme,
} from '@mui/material';
import { TrendingUp, TrendingDown, Equalizer } from '@mui/icons-material';
import type { IProject, ISource } from '../../types';

interface ProgressChartProps {
  projects: IProject[];
  sources: ISource[];
}

const ProgressChart: React.FC<ProgressChartProps> = ({ projects, sources }) => {
  const theme = useTheme();

  const getProjectProgress = (project: IProject) => {
    // Use the progress field if available, otherwise calculate from sources
    if (project.progress !== undefined) {
      return project.progress;
    }

    if (!project.sources || project.sources.length === 0) return 0;
    const completedSources = (project.sources || []).filter(
      (source) => source.status === 'completed'
    ).length;
    return Math.round((completedSources / project.sources.length) * 100);
  };

  // Calculate progress statistics
  const projectProgresses = projects.map(getProjectProgress);
  const averageProgress =
    projectProgresses.length > 0
      ? Math.round(
          projectProgresses.reduce((sum, progress) => sum + progress, 0) /
            projectProgresses.length
        )
      : 0;

  const highProgressProjects = projects.filter(
    (p) => getProjectProgress(p) >= 75
  ).length;
  const mediumProgressProjects = projects.filter((p) => {
    const progress = getProjectProgress(p);
    return progress >= 25 && progress < 75;
  }).length;
  const lowProgressProjects = projects.filter(
    (p) => getProjectProgress(p) < 25
  ).length;

  const getProgressColor = (progress: number) => {
    if (progress >= 75) return 'success';
    if (progress >= 25) return 'warning';
    return 'error';
  };

  const getProgressLabel = (progress: number) => {
    if (progress >= 75) return 'عالی';
    if (progress >= 50) return 'خوب';
    if (progress >= 25) return 'متوسط';
    return 'نیاز به بهبود';
  };

  return (
    <Card sx={{ height: '100%' }}>
      <CardContent>
        <Typography variant='h6' fontWeight='600' gutterBottom>
          نمودار پیشرفت
        </Typography>

        <Box sx={{ mb: 3 }}>
          <Stack
            direction='row'
            alignItems='center'
            justifyContent='space-between'
            sx={{ mb: 1 }}
          >
            <Typography variant='body2' color='text.secondary'>
              میانگین پیشرفت
            </Typography>
            <Typography
              variant='h5'
              fontWeight='bold'
              color={`${getProgressColor(averageProgress)}.main`}
            >
              {averageProgress}%
            </Typography>
          </Stack>
          <LinearProgress
            variant='determinate'
            value={averageProgress}
            sx={{ height: 8, borderRadius: 4 }}
            color={getProgressColor(averageProgress) as any}
          />
          <Typography
            variant='caption'
            color='text.secondary'
            sx={{ mt: 0.5, display: 'block' }}
          >
            {getProgressLabel(averageProgress)}
          </Typography>
        </Box>

        <Box sx={{ mb: 3 }}>
          <Typography variant='body2' color='text.secondary' gutterBottom>
            وضعیت پروژه‌ها
          </Typography>
          <Stack spacing={2}>
            <Box>
              <Stack
                direction='row'
                justifyContent='space-between'
                sx={{ mb: 0.5 }}
              >
                <Stack direction='row' alignItems='center' spacing={1}>
                  <Box
                    sx={{
                      width: 12,
                      height: 12,
                      borderRadius: '50%',
                      bgcolor: 'success.main',
                    }}
                  />
                  <Typography variant='caption'>پیشرفت بالا (75%+)</Typography>
                </Stack>
                <Typography variant='caption' fontWeight='500'>
                  {highProgressProjects}
                </Typography>
              </Stack>
              <LinearProgress
                variant='determinate'
                value={
                  projects.length > 0
                    ? (highProgressProjects / projects.length) * 100
                    : 0
                }
                sx={{ height: 6, borderRadius: 3 }}
                color='success'
              />
            </Box>

            <Box>
              <Stack
                direction='row'
                justifyContent='space-between'
                sx={{ mb: 0.5 }}
              >
                <Stack direction='row' alignItems='center' spacing={1}>
                  <Box
                    sx={{
                      width: 12,
                      height: 12,
                      borderRadius: '50%',
                      bgcolor: 'warning.main',
                    }}
                  />
                  <Typography variant='caption'>
                    پیشرفت متوسط (25-75%)
                  </Typography>
                </Stack>
                <Typography variant='caption' fontWeight='500'>
                  {mediumProgressProjects}
                </Typography>
              </Stack>
              <LinearProgress
                variant='determinate'
                value={
                  projects.length > 0
                    ? (mediumProgressProjects / projects.length) * 100
                    : 0
                }
                sx={{ height: 6, borderRadius: 3 }}
                color='warning'
              />
            </Box>

            <Box>
              <Stack
                direction='row'
                justifyContent='space-between'
                sx={{ mb: 0.5 }}
              >
                <Stack direction='row' alignItems='center' spacing={1}>
                  <Box
                    sx={{
                      width: 12,
                      height: 12,
                      borderRadius: '50%',
                      bgcolor: 'error.main',
                    }}
                  />
                  <Typography variant='caption'>
                    پیشرفت پایین (کمتر از 25%)
                  </Typography>
                </Stack>
                <Typography variant='caption' fontWeight='500'>
                  {lowProgressProjects}
                </Typography>
              </Stack>
              <LinearProgress
                variant='determinate'
                value={
                  projects.length > 0
                    ? (lowProgressProjects / projects.length) * 100
                    : 0
                }
                sx={{ height: 6, borderRadius: 3 }}
                color='error'
              />
            </Box>
          </Stack>
        </Box>

        <Box>
          <Typography variant='body2' color='text.secondary' gutterBottom>
            پروژه‌های برتر
          </Typography>
          <Stack spacing={1}>
            {projects
              .sort((a, b) => getProjectProgress(b) - getProjectProgress(a))
              .slice(0, 3)
              .map((project) => {
                const progress = getProjectProgress(project);
                return (
                  <Box key={project._id}>
                    <Stack
                      direction='row'
                      justifyContent='space-between'
                      sx={{ mb: 0.5 }}
                    >
                      <Typography
                        variant='caption'
                        noWrap
                        sx={{ flexGrow: 1, mr: 1 }}
                      >
                        {project.title}
                      </Typography>
                      <Typography variant='caption' fontWeight='500'>
                        {progress}%
                      </Typography>
                    </Stack>
                    <LinearProgress
                      variant='determinate'
                      value={progress}
                      sx={{ height: 4, borderRadius: 2 }}
                      color={getProgressColor(progress) as any}
                    />
                  </Box>
                );
              })}
          </Stack>
        </Box>
      </CardContent>
    </Card>
  );
};

export default ProgressChart;
