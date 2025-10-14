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

interface DashboardStatsProps {
  projects: IProject[];
  sources: ISource[];
}

const DashboardStats: React.FC<DashboardStatsProps> = ({
  projects,
  sources,
}) => {
  const theme = useTheme();

  // Calculate statistics
  const totalProjects = projects.length;
  const activeProjects = projects.filter((p) => p.status === 'active').length;
  const completedProjects = projects.filter(
    (p) => p.status === 'completed'
  ).length;

  const totalSources = sources.length;
  const sourcesThisMonth = sources.filter((s) => {
    const sourceDate = new Date(s.createdAt);
    const now = new Date();
    return (
      sourceDate.getMonth() === now.getMonth() &&
      sourceDate.getFullYear() === now.getFullYear()
    );
  }).length;

  const sourcesLastMonth = sources.filter((s) => {
    const sourceDate = new Date(s.createdAt);
    const now = new Date();
    const lastMonth = new Date(now.getFullYear(), now.getMonth() - 1);
    return (
      sourceDate.getMonth() === lastMonth.getMonth() &&
      sourceDate.getFullYear() === lastMonth.getFullYear()
    );
  }).length;

  const sourceGrowthRate =
    sourcesLastMonth > 0
      ? Math.round(
          ((sourcesThisMonth - sourcesLastMonth) / sourcesLastMonth) * 100
        )
      : sourcesThisMonth > 0
      ? 100
      : 0;

  const getProjectProgress = (project: IProject) => {
    if (!project.sources || project.sources.length === 0) return 0;
    const completedSources = project.sources.filter(
      (source) => source.status === 'completed'
    ).length;
    return Math.round((completedSources / project.sources.length) * 100);
  };

  const averageProjectProgress =
    totalProjects > 0
      ? Math.round(
          projects.reduce(
            (sum, project) => sum + getProjectProgress(project),
            0
          ) / totalProjects
        )
      : 0;

  const StatItem = ({
    title,
    value,
    subtitle,
    trend,
    color,
  }: {
    title: string;
    value: string | number;
    subtitle?: string;
    trend?: 'up' | 'down' | 'neutral';
    color: string;
  }) => (
    <Box sx={{ mb: 3 }}>
      <Stack
        direction='row'
        alignItems='center'
        justifyContent='space-between'
        sx={{ mb: 1 }}
      >
        <Typography variant='body2' color='text.secondary'>
          {title}
        </Typography>
        {trend && (
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
            {trend === 'up' && (
              <TrendingUp sx={{ fontSize: 16, color: 'success.main' }} />
            )}
            {trend === 'down' && (
              <TrendingDown sx={{ fontSize: 16, color: 'error.main' }} />
            )}
            {trend === 'neutral' && (
              <Equalizer sx={{ fontSize: 16, color: 'text.secondary' }} />
            )}
          </Box>
        )}
      </Stack>
      <Typography variant='h4' fontWeight='bold' color={`${color}.main`}>
        {value}
      </Typography>
      {subtitle && (
        <Typography variant='caption' color='text.secondary'>
          {subtitle}
        </Typography>
      )}
    </Box>
  );

  return (
    <Card sx={{ height: '100%' }}>
      <CardContent>
        <Typography variant='h6' fontWeight='600' gutterBottom>
          آمار کلی
        </Typography>

        <StatItem
          title='پروژه‌های فعال'
          value={activeProjects}
          subtitle={`از ${totalProjects} پروژه کل`}
          trend={activeProjects > completedProjects ? 'up' : 'neutral'}
          color='primary'
        />

        <StatItem
          title='میانگین پیشرفت'
          value={`${averageProjectProgress}%`}
          subtitle='پیشرفت کلی پروژه‌ها'
          trend={
            averageProjectProgress > 50
              ? 'up'
              : averageProjectProgress > 25
              ? 'neutral'
              : 'down'
          }
          color='success'
        />

        <StatItem
          title='منابع این ماه'
          value={sourcesThisMonth}
          subtitle={`رشد ${
            sourceGrowthRate > 0 ? '+' : ''
          }${sourceGrowthRate}% نسبت به ماه قبل`}
          trend={
            sourceGrowthRate > 0
              ? 'up'
              : sourceGrowthRate < 0
              ? 'down'
              : 'neutral'
          }
          color='secondary'
        />

        <Box sx={{ mt: 3 }}>
          <Typography variant='body2' color='text.secondary' gutterBottom>
            وضعیت پروژه‌ها
          </Typography>
          <Stack spacing={1}>
            <Box>
              <Stack
                direction='row'
                justifyContent='space-between'
                sx={{ mb: 0.5 }}
              >
                <Typography variant='caption'>فعال</Typography>
                <Typography variant='caption'>{activeProjects}</Typography>
              </Stack>
              <LinearProgress
                variant='determinate'
                value={
                  totalProjects > 0 ? (activeProjects / totalProjects) * 100 : 0
                }
                sx={{ height: 6, borderRadius: 3 }}
                color='primary'
              />
            </Box>
            <Box>
              <Stack
                direction='row'
                justifyContent='space-between'
                sx={{ mb: 0.5 }}
              >
                <Typography variant='caption'>تکمیل شده</Typography>
                <Typography variant='caption'>{completedProjects}</Typography>
              </Stack>
              <LinearProgress
                variant='determinate'
                value={
                  totalProjects > 0
                    ? (completedProjects / totalProjects) * 100
                    : 0
                }
                sx={{ height: 6, borderRadius: 3 }}
                color='success'
              />
            </Box>
          </Stack>
        </Box>

        <Box sx={{ mt: 3 }}>
          <Typography variant='body2' color='text.secondary' gutterBottom>
            انواع منابع
          </Typography>
          <Stack direction='row' spacing={1} flexWrap='wrap'>
            {Object.entries(
              sources.reduce((acc, source) => {
                const type = source.type || 'نامشخص';
                acc[type] = (acc[type] || 0) + 1;
                return acc;
              }, {} as Record<string, number>)
            )
              .slice(0, 3)
              .map(([type, count]) => (
                <Chip
                  key={type}
                  label={`${type}: ${count}`}
                  size='small'
                  variant='outlined'
                  color='secondary'
                />
              ))}
          </Stack>
        </Box>
      </CardContent>
    </Card>
  );
};

export default DashboardStats;
