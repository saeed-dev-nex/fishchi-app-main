import React from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  List,
  ListItem,
  ListItemText,
  ListItemAvatar,
  Avatar,
  Chip,
  Stack,
  alpha,
  useTheme,
} from '@mui/material';
import {
  FolderOpen,
  Source,
  Add,
  Edit,
  Delete,
  Visibility,
} from '@mui/icons-material';
import type { IProject, ISource } from '../../types';

interface RecentActivityProps {
  projects: IProject[];
  sources: ISource[];
}

const RecentActivity: React.FC<RecentActivityProps> = ({
  projects,
  sources,
}) => {
  const theme = useTheme();

  // Create activity items
  const activities = [
    ...projects.slice(0, 3).map((project) => ({
      id: `project-${project._id}`,
      type: 'project' as const,
      title: project.title,
      description: `پروژه ${
        project.status === 'active' ? 'فعال' : 'تکمیل شده'
      }`,
      timestamp: project.createdAt,
      icon: <FolderOpen />,
      color: 'primary' as const,
    })),
    ...sources.slice(0, 3).map((source) => ({
      id: `source-${source._id}`,
      type: 'source' as const,
      title: source.title,
      description: `منبع ${source.type || 'نامشخص'}`,
      timestamp: source.createdAt,
      icon: <Source />,
      color: 'secondary' as const,
    })),
  ]
    .sort(
      (a, b) =>
        new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
    )
    .slice(0, 6);

  const getTimeAgo = (timestamp: string) => {
    const now = new Date();
    const time = new Date(timestamp);
    const diffInHours = Math.floor(
      (now.getTime() - time.getTime()) / (1000 * 60 * 60)
    );

    if (diffInHours < 1) return 'همین الان';
    if (diffInHours < 24) return `${diffInHours} ساعت پیش`;
    const diffInDays = Math.floor(diffInHours / 24);
    if (diffInDays < 7) return `${diffInDays} روز پیش`;
    const diffInWeeks = Math.floor(diffInDays / 7);
    return `${diffInWeeks} هفته پیش`;
  };

  return (
    <Card sx={{ height: '100%' }}>
      <CardContent>
        <Typography variant='h6' fontWeight='600' gutterBottom>
          فعالیت‌های اخیر
        </Typography>

        {activities.length > 0 ? (
          <List sx={{ p: 0 }}>
            {activities.map((activity, index) => (
              <ListItem
                key={activity.id}
                sx={{
                  px: 0,
                  py: 1.5,
                  borderLeft: `3px solid ${theme.palette[activity.color].main}`,
                  ml: 1,
                }}
              >
                <ListItemAvatar>
                  <Avatar
                    sx={{
                      width: 32,
                      height: 32,
                      bgcolor: `${activity.color}.main`,
                      fontSize: '0.875rem',
                    }}
                  >
                    {activity.icon}
                  </Avatar>
                </ListItemAvatar>
                <ListItemText
                  primary={
                    <Typography variant='body2' fontWeight='500' noWrap>
                      {activity.title}
                    </Typography>
                  }
                  secondary={
                    <Stack direction='row' alignItems='center' spacing={1}>
                      <Typography variant='caption' color='text.secondary'>
                        {activity.description}
                      </Typography>
                      <Typography variant='caption' color='text.secondary'>
                        •
                      </Typography>
                      <Typography variant='caption' color='text.secondary'>
                        {getTimeAgo(activity.timestamp)}
                      </Typography>
                    </Stack>
                  }
                />
              </ListItem>
            ))}
          </List>
        ) : (
          <Box sx={{ textAlign: 'center', py: 4 }}>
            <Box
              sx={{
                width: 60,
                height: 60,
                borderRadius: '50%',
                bgcolor: alpha(theme.palette.primary.main, 0.1),
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                mx: 'auto',
                mb: 2,
              }}
            >
              <Add sx={{ fontSize: 24, color: 'primary.main' }} />
            </Box>
            <Typography variant='body2' color='text.secondary'>
              هنوز فعالیتی ثبت نشده است
            </Typography>
          </Box>
        )}
      </CardContent>
    </Card>
  );
};

export default RecentActivity;
