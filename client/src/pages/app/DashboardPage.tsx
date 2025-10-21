import React, { useState, useEffect } from 'react';
import {
  Box,
  Container,
  Typography,
  Card,
  CardContent,
  Button,
  Avatar,
  Chip,
  Stack,
  LinearProgress,
  IconButton,
  List,
  ListItem,
  ListItemText,
  ListItemAvatar,
  ListItemSecondaryAction,
  Divider,
  alpha,
  useTheme,
  Alert,
} from '@mui/material';
import {
  FolderOpen,
  Source,
  TrendingUp,
  Add,
  MoreVert,
  CalendarToday,
  Edit,
} from '@mui/icons-material';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate, useSearchParams } from 'react-router-dom';
import type { RootState, AppDispatch } from '../../store';
import type { IProject } from '../../types';
import { fetchProjects } from '../../store/features/projectSlice';
import { fetchAllUserSources } from '../../store/features/sourceSlice';
import { fetchUserProfile } from '../../store/features/profileSlice';
import { checkUserStatus } from '../../store/features/authSlice';
import DashboardStats from '../../components/dashboard/DashboardStats';
import RecentActivity from '../../components/dashboard/RecentActivity';
import ProgressChart from '../../components/dashboard/ProgressChart';

const DashboardPage: React.FC = () => {
  const theme = useTheme();
  const navigate = useNavigate();
  const dispatch = useDispatch<AppDispatch>();
  const [searchParams] = useSearchParams();

  // Redux state
  const { user } = useSelector((state: RootState) => state.auth);
  const { projects, isLoading: projectsLoading } = useSelector(
    (state: RootState) => state.projects
  );
  const { sources } = useSelector((state: RootState) => state.sources);
  const { user: profileUser } = useSelector(
    (state: RootState) => state.profile
  );

  // Local state
  const [recentProjects, setRecentProjects] = useState<IProject[]>([]);
  const [oauthSuccess, setOauthSuccess] = useState(false);
  const [oauthError, setOauthError] = useState<string | null>(null);

  useEffect(() => {
    // Handle OAuth callback
    const oauthParam = searchParams.get('oauth');
    const errorParam = searchParams.get('error');

    if (oauthParam === 'success') {
      setOauthSuccess(true);
      // Refresh user status after OAuth success
      dispatch(checkUserStatus());
      // Clear URL parameters
      navigate('/app', { replace: true });
    } else if (errorParam) {
      setOauthError('خطا در ورود با حساب خارجی');
      // Clear URL parameters
      navigate('/app', { replace: true });
    }

    // Fetch user profile
    dispatch(fetchUserProfile());

    // Fetch projects and sources
    dispatch(fetchProjects());
    dispatch(
      fetchAllUserSources({
        page: 1,
        limit: 1000, // دریافت تمام منابع برای نمایش تعداد کل
        sortBy: 'createdAt',
        sortOrder: 'desc',
      })
    );
  }, [dispatch, searchParams, navigate]);

  useEffect(() => {
    if (projects) {
      setRecentProjects(projects.slice(0, 5));
    }
  }, [projects]);

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'صبح بخیر';
    if (hour < 18) return 'ظهر بخیر';
    return 'عصر بخیر';
  };

  const getProjectProgress = (project: IProject) => {
    if (!project.sources || project.sources.length === 0) return 0;
    const completedSources = (project.sources || []).filter(
      (source) => source.status === 'completed'
    ).length;
    return Math.round((completedSources / project.sources.length) * 100);
  };

  const getDegreeColor = (degree: string) => {
    switch (degree) {
      case 'دیپلم':
        return 'default';
      case 'کارشناسی':
        return 'primary';
      case 'کارشناسی ارشد':
        return 'secondary';
      case 'دکتری':
        return 'success';
      case 'فوق دکتری':
        return 'warning';
      default:
        return 'default';
    }
  };

  const StatCard = ({
    title,
    value,
    icon,
    color,
    onClick,
  }: {
    title: string;
    value: number | string;
    icon: React.ReactElement;
    color: string;
    onClick?: () => void;
  }) => {
    const getColorValue = (colorName: string) => {
      switch (colorName) {
        case 'primary':
          return theme.palette.primary.main;
        case 'secondary':
          return theme.palette.secondary.main;
        case 'success':
          return theme.palette.success.main;
        case 'warning':
          return theme.palette.warning.main;
        case 'error':
          return theme.palette.error.main;
        default:
          return theme.palette.primary.main;
      }
    };

    const colorValue = getColorValue(color);

    return (
      <Card
        sx={{
          height: '100%',
          cursor: onClick ? 'pointer' : 'default',
          transition: 'all 0.3s ease',
          '&:hover': onClick
            ? {
                transform: 'translateY(-4px)',
                boxShadow: theme.shadows[8],
              }
            : {},
          background: `linear-gradient(135deg, ${alpha(
            colorValue,
            0.1
          )} 0%, ${alpha(colorValue, 0.05)} 100%)`,
          border: `1px solid ${alpha(colorValue, 0.2)}`,
        }}
        onClick={onClick}
      >
        <CardContent>
          <Stack
            direction='row'
            alignItems='center'
            justifyContent='space-between'
          >
            <Box>
              <Typography
                variant='h4'
                fontWeight='bold'
                color={`${color}.main`}
              >
                {value}
              </Typography>
              <Typography variant='body2' color='text.secondary' sx={{ mt: 1 }}>
                {title}
              </Typography>
            </Box>
            <Box
              sx={{
                width: 60,
                height: 60,
                borderRadius: 2,
                bgcolor: `${color}.main`,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'white',
              }}
            >
              {icon}
            </Box>
          </Stack>
        </CardContent>
      </Card>
    );
  };

  const QuickActionCard = ({
    title,
    description,
    icon,
    color,
    onClick,
  }: {
    title: string;
    description: string;
    icon: React.ReactElement;
    color: string;
    onClick: () => void;
  }) => {
    const getColorValue = (colorName: string) => {
      switch (colorName) {
        case 'primary':
          return theme.palette.primary.main;
        case 'secondary':
          return theme.palette.secondary.main;
        case 'success':
          return theme.palette.success.main;
        case 'warning':
          return theme.palette.warning.main;
        case 'error':
          return theme.palette.error.main;
        default:
          return theme.palette.primary.main;
      }
    };

    const colorValue = getColorValue(color);

    return (
      <Card
        sx={{
          height: '100%',
          cursor: 'pointer',
          transition: 'all 0.3s ease',
          '&:hover': {
            transform: 'translateY(-4px)',
            boxShadow: theme.shadows[8],
          },
          background: `linear-gradient(135deg, ${alpha(
            colorValue,
            0.1
          )} 0%, ${alpha(colorValue, 0.05)} 100%)`,
          border: `1px solid ${alpha(colorValue, 0.2)}`,
        }}
        onClick={onClick}
      >
        <CardContent>
          <Stack direction='row' alignItems='center' spacing={2}>
            <Box
              sx={{
                width: 50,
                height: 50,
                borderRadius: 2,
                bgcolor: `${color}.main`,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'white',
              }}
            >
              {icon}
            </Box>
            <Box sx={{ flexGrow: 1 }}>
              <Typography variant='h6' fontWeight='600'>
                {title}
              </Typography>
              <Typography variant='body2' color='text.secondary'>
                {description}
              </Typography>
            </Box>
          </Stack>
        </CardContent>
      </Card>
    );
  };

  return (
    <Container maxWidth='xl' sx={{ py: 4 }}>
      {/* OAuth Success/Error Messages */}
      {oauthSuccess && (
        <Alert
          severity='success'
          sx={{ mb: 3 }}
          onClose={() => setOauthSuccess(false)}
        >
          ورود با موفقیت انجام شد! خوش آمدید.
        </Alert>
      )}
      {oauthError && (
        <Alert
          severity='error'
          sx={{ mb: 3 }}
          onClose={() => setOauthError(null)}
        >
          {oauthError}
        </Alert>
      )}

      {/* Welcome Section */}
      <Box sx={{ mb: 4 }}>
        <Typography variant='h4' fontWeight='600' gutterBottom>
          {getGreeting()}، {user?.name || 'کاربر عزیز'}! 👋
        </Typography>
        <Typography variant='body1' color='text.secondary'>
          خوش آمدید به داشبورد فیشچی. از اینجا می‌توانید پروژه‌ها و منابع خود را
          مدیریت کنید.
        </Typography>
      </Box>

      {/* User Profile Summary */}
      {profileUser && (
        <Card
          sx={{
            mb: 4,
            background: `linear-gradient(135deg, ${alpha(
              theme.palette.primary.main,
              0.1
            )} 0%, ${alpha(theme.palette.secondary.main, 0.1)} 100%)`,
          }}
        >
          <CardContent>
            <Stack direction='row' alignItems='center' spacing={3}>
              <Avatar
                src={
                  profileUser.avatar
                    ? `http://localhost:5000/uploads/avatars/${profileUser.avatar}`
                    : undefined
                }
                sx={{ width: 80, height: 80, fontSize: '2rem' }}
              >
                {!profileUser.avatar &&
                  profileUser.name?.charAt(0).toUpperCase()}
              </Avatar>
              <Box sx={{ flexGrow: 1 }}>
                <Typography variant='h5' fontWeight='600' gutterBottom>
                  {profileUser.name}
                </Typography>
                <Stack direction='row' spacing={1} sx={{ mb: 2 }}>
                  {profileUser.degree && (
                    <Chip
                      label={profileUser.degree}
                      color={
                        getDegreeColor(profileUser.degree) as
                          | 'default'
                          | 'primary'
                          | 'secondary'
                          | 'success'
                          | 'warning'
                      }
                      variant='outlined'
                      size='small'
                    />
                  )}
                  {profileUser.university && (
                    <Chip
                      label={profileUser.university}
                      color='primary'
                      variant='outlined'
                      size='small'
                    />
                  )}
                  {profileUser.fieldOfStudy && (
                    <Chip
                      label={profileUser.fieldOfStudy}
                      color='secondary'
                      variant='outlined'
                      size='small'
                    />
                  )}
                </Stack>
                {profileUser.bio && (
                  <Typography variant='body2' color='text.secondary'>
                    {profileUser.bio}
                  </Typography>
                )}
              </Box>
              <Button
                variant='outlined'
                startIcon={<Edit />}
                onClick={() => navigate('/app/profile')}
              >
                ویرایش پروفایل
              </Button>
            </Stack>
          </CardContent>
        </Card>
      )}

      {/* Statistics Cards */}
      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 3, mb: 4 }}>
        <Box sx={{ flex: '1 1 250px', minWidth: 250 }}>
          <StatCard
            title='کل پروژه‌ها'
            value={projects?.length || 0}
            icon={<FolderOpen />}
            color='primary'
            onClick={() => navigate('/app/projects')}
          />
        </Box>
        <Box sx={{ flex: '1 1 250px', minWidth: 250 }}>
          <StatCard
            title='کل منابع'
            value={sources?.length || 0}
            icon={<Source />}
            color='secondary'
            onClick={() => navigate('/app/library')}
          />
        </Box>
        <Box sx={{ flex: '1 1 250px', minWidth: 250 }}>
          <StatCard
            title='پروژه‌های فعال'
            value={
              projects?.filter((p) => p.status === 'در حال انجام').length || 0
            }
            icon={<TrendingUp />}
            color='success'
          />
        </Box>
        <Box sx={{ flex: '1 1 250px', minWidth: 250 }}>
          <StatCard
            title='منابع این ماه'
            value={
              (sources || [])?.filter((s) => {
                const sourceDate = new Date(s.createdAt || new Date());
                const now = new Date();
                return (
                  sourceDate.getMonth() === now.getMonth() &&
                  sourceDate.getFullYear() === now.getFullYear()
                );
              }).length || 0
            }
            icon={<CalendarToday />}
            color='warning'
          />
        </Box>
      </Box>

      {/* Quick Actions */}
      <Typography variant='h5' fontWeight='600' gutterBottom sx={{ mb: 3 }}>
        اقدامات سریع
      </Typography>
      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 3, mb: 4 }}>
        <Box sx={{ flex: '1 1 250px', minWidth: 250 }}>
          <QuickActionCard
            title='پروژه جدید'
            description='ایجاد پروژه تحقیقاتی جدید'
            icon={<Add />}
            color='primary'
            onClick={() => navigate('/app/projects')}
          />
        </Box>
        <Box sx={{ flex: '1 1 250px', minWidth: 250 }}>
          <QuickActionCard
            title='منبع جدید'
            description='اضافه کردن منبع به کتابخانه'
            icon={<Source />}
            color='secondary'
            onClick={() => navigate('/app/library')}
          />
        </Box>
        <Box sx={{ flex: '1 1 250px', minWidth: 250 }}>
          <QuickActionCard
            title='مشاهده پروژه‌ها'
            description='مدیریت پروژه‌های موجود'
            icon={<FolderOpen />}
            color='success'
            onClick={() => navigate('/app/projects')}
          />
        </Box>
        <Box sx={{ flex: '1 1 250px', minWidth: 250 }}>
          <QuickActionCard
            title='کتابخانه منابع'
            description='مرور و مدیریت منابع'
            icon={<Source />}
            color='warning'
            onClick={() => navigate('/app/library')}
          />
        </Box>
      </Box>

      {/* Recent Activity */}
      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 3 }}>
        {/* Dashboard Stats */}
        <Box sx={{ flex: '1 1 300px', minWidth: 300 }}>
          <DashboardStats projects={projects || []} sources={sources || []} />
        </Box>

        {/* Recent Activity */}
        <Box sx={{ flex: '1 1 300px', minWidth: 300 }}>
          <RecentActivity projects={projects || []} sources={sources || []} />
        </Box>

        {/* Progress Chart */}
        <Box sx={{ flex: '1 1 300px', minWidth: 300 }}>
          <ProgressChart projects={projects || []} sources={sources || []} />
        </Box>

        {/* Recent Projects */}
        <Box sx={{ flex: '1 1 300px', minWidth: 300 }}>
          <Card sx={{ height: '100%' }}>
            <CardContent>
              <Stack
                direction='row'
                alignItems='center'
                justifyContent='space-between'
                sx={{ mb: 3 }}
              >
                <Typography variant='h6' fontWeight='600'>
                  پروژه‌های اخیر
                </Typography>
                <Button size='small' onClick={() => navigate('/app/projects')}>
                  مشاهده همه
                </Button>
              </Stack>

              {projectsLoading ? (
                <LinearProgress />
              ) : recentProjects.length > 0 ? (
                <List>
                  {recentProjects.map((project, index) => (
                    <React.Fragment key={project._id}>
                      <ListItem
                        sx={{
                          px: 0,
                          py: 2,
                          cursor: 'pointer',
                          '&:hover': {
                            backgroundColor: 'action.hover',
                            borderRadius: 1,
                          },
                        }}
                        onClick={() => navigate(`/app/projects/${project._id}`)}
                      >
                        <ListItemAvatar>
                          <Avatar sx={{ bgcolor: 'primary.main' }}>
                            <FolderOpen />
                          </Avatar>
                        </ListItemAvatar>
                        <ListItemText
                          primary={
                            <Typography variant='subtitle1' fontWeight='500'>
                              {project.title}
                            </Typography>
                          }
                          secondary={
                            <Box>
                              <Typography
                                variant='body2'
                                color='text.secondary'
                                sx={{ mb: 1 }}
                              >
                                {project.description}
                              </Typography>
                              <Box
                                sx={{
                                  display: 'flex',
                                  alignItems: 'center',
                                  gap: 2,
                                }}
                              >
                                <Box sx={{ flexGrow: 1 }}>
                                  <LinearProgress
                                    variant='determinate'
                                    value={getProjectProgress(project)}
                                    sx={{ height: 6, borderRadius: 3 }}
                                  />
                                </Box>
                                <Typography
                                  variant='caption'
                                  color='text.secondary'
                                >
                                  {getProjectProgress(project)}%
                                </Typography>
                              </Box>
                            </Box>
                          }
                          secondaryTypographyProps={{ component: 'div' }}
                        />
                        <ListItemSecondaryAction>
                          <IconButton size='small'>
                            <MoreVert />
                          </IconButton>
                        </ListItemSecondaryAction>
                      </ListItem>
                      {index < recentProjects.length - 1 && <Divider />}
                    </React.Fragment>
                  ))}
                </List>
              ) : (
                <Box sx={{ textAlign: 'center', py: 4 }}>
                  <FolderOpen
                    sx={{ fontSize: 48, color: 'text.secondary', mb: 2 }}
                  />
                  <Typography variant='body1' color='text.secondary'>
                    هنوز پروژه‌ای ایجاد نکرده‌اید
                  </Typography>
                  <Button
                    variant='contained'
                    startIcon={<Add />}
                    onClick={() => navigate('/app/projects')}
                    sx={{ mt: 2 }}
                  >
                    ایجاد پروژه اول
                  </Button>
                </Box>
              )}
            </CardContent>
          </Card>
        </Box>
      </Box>
    </Container>
  );
};

export default DashboardPage;
