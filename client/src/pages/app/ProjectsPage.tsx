import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import type { AppDispatch, RootState } from '../../store';
import {
  fetchProjects,
  createProject,
} from '../../store/features/projectSlice';
import {
  Box,
  Typography,
  Button,
  CircularProgress,
  Alert,
  Card,
  CardContent,
  CardActions,
  CardHeader,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Chip,
  Avatar,
  Fade,
  Slide,
  Container,
  Stack,
  Paper,
  Grid,
} from '@mui/material';
import { Link as RouterLink } from 'react-router-dom';
import {
  Edit,
  RemoveRedEyeRounded,
  Add,
  FolderOpen,
  Schedule,
  TrendingUp,
  Star,
  MoreVert,
  Launch,
} from '@mui/icons-material';
import CreateProjectModal from '../../components/projects/CreateProjectModal';

const ProjectsPage: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const { projects, isLoading, error } = useSelector(
    (state: RootState) => state.projects
  );

  // State for new project modal
  const [isModalOpen, setIsModalOpen] = useState(false);

  // در زمان بارگذاری صفحه، پروژه‌ها را واکشی کن
  useEffect(() => {
    dispatch(fetchProjects());
  }, [dispatch]);

  // Handle modal close
  const handleCloseModal = () => {
    setIsModalOpen(false);
  };

  return (
    <Container maxWidth='xl' sx={{ py: 4 }}>
      {/* Modern Header with Glassmorphism Effect */}
      <Paper
        elevation={0}
        sx={{
          background:
            'linear-gradient(135deg, rgba(53, 53, 53, 0.33) 0%, rgba(93, 92, 92, 0.05) 100%)',
          backdropFilter: 'blur(20px)',
          border: '1px solid rgba(255,255,255,0.1)',
          borderRadius: 4,
          p: 4,
          mb: 4,
          position: 'relative',
          overflow: 'hidden',
          '&::before': {
            content: '""',
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            height: '1px',
            background:
              'linear-gradient(90deg, transparent, rgba(255,255,255,0.3), transparent)',
          },
        }}
      >
        <Stack
          direction={{ xs: 'column', sm: 'row' }}
          justifyContent='space-between'
          alignItems={{ xs: 'stretch', sm: 'center' }}
          spacing={3}
        >
          <Box sx={{ xs: { width: '100%' }, sm: { width: '50%' } }}>
            <Typography
              variant='h3'
              component='h1'
              sx={{
                fontWeight: 800,
                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                backgroundClip: 'text',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                mb: 1,
              }}
            >
              پروژه‌های من
            </Typography>
            <Typography
              variant='body1'
              color='text.secondary'
              sx={{ opacity: 0.8 }}
            >
              مدیریت و نظارت بر پروژه‌های شما
            </Typography>
          </Box>

          <Button
            variant='contained'
            size='large'
            startIcon={<Add />}
            onClick={() => setIsModalOpen(true)}
            sx={{
              borderRadius: 3,
              px: 4,
              py: 1.5,
              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
              boxShadow: '0 8px 32px rgba(102, 126, 234, 0.3)',
              transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
              '&:hover': {
                transform: 'translateY(-2px)',
                boxShadow: '0 12px 40px rgba(102, 126, 234, 0.4)',
                background: 'linear-gradient(135deg, #764ba2 0%, #667eea 100%)',
              },
            }}
          >
            پروژه جدید
          </Button>
        </Stack>
      </Paper>

      {/* Modern Loading and Error States */}
      {isLoading && (
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
          <Stack alignItems='center' spacing={3}>
            <CircularProgress
              size={60}
              thickness={4}
              sx={{
                color: 'primary.main',
                '& .MuiCircularProgress-circle': {
                  strokeLinecap: 'round',
                },
              }}
            />
            <Typography variant='h6' color='text.secondary'>
              در حال بارگذاری پروژه‌ها...
            </Typography>
          </Stack>
        </Box>
      )}

      {error && (
        <Alert
          severity='error'
          sx={{
            mb: 3,
            borderRadius: 3,
            '& .MuiAlert-icon': {
              fontSize: '1.5rem',
            },
          }}
        >
          {error}
        </Alert>
      )}

      {/* نمایش لیست پروژه‌ها */}
      <Grid container spacing={3}>
        {!isLoading &&
          !error &&
          projects.map((project) => (
            <Grid size={{ xs: 12, sm: 6, md: 4, lg: 3 }} key={project._id}>
              <Card
                sx={{
                  xs: { width: '100vw' },
                  md: { maxWidth: 345, minWidth: 300, height: 300 },
                  bgcolor: 'background.paper',
                  borderRadius: 2,
                  boxShadow: '0 4px 10px rgba(0,0,0,0.1)',
                }}
              >
                <CardHeader
                  title={project.title}
                  sx={{
                    bgcolor: 'accent.main',
                    px: 2,
                    py: 1,
                    color: 'white',
                    whiteSpace: 'nowrap',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                  }}
                />

                <CardContent>{project.description.slice(0, 30)}</CardContent>
                <CardActions sx={{ justifyContent: 'space-between' }}>
                  <IconButton size='small'>
                    <RemoveRedEyeRounded />
                  </IconButton>
                  <IconButton
                    size='small'
                    color='primary'
                    component={RouterLink}
                    to={`/projects/${project._id}`}
                    title='ویرایش پروژه'
                  >
                    <Edit />
                  </IconButton>
                </CardActions>
              </Card>
            </Grid>
          ))}
      </Grid>
      <CreateProjectModal onClose={handleCloseModal} open={isModalOpen} />

      {/* Modal for creating new project */}
      {/* <Dialog
        open={isModalOpen}
        onClose={handleCloseModal}
        maxWidth='sm'
        fullWidth
      >
        <DialogTitle>پروژه جدید</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin='dense'
            label='نام پروژه'
            fullWidth
            variant='filled'
            value={newProjectTitle}
            onChange={(e) => setNewProjectTitle(e.target.value)}
            sx={{ mb: 2 }}
          />
          <TextField
            margin='dense'
            label='توضیحات (اختیاری)'
            fullWidth
            multiline
            rows={3}
            variant='filled'
            value={newProjectDescription}
            onChange={(e) => setNewProjectDescription(e.target.value)}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseModal}>لغو</Button>
          <Button
            onClick={handleCreateProject}
            variant='contained'
            disabled={!newProjectTitle.trim()}
          >
            ایجاد پروژه
          </Button>
        </DialogActions>
      </Dialog> */}
    </Container>
  );
};

export default ProjectsPage;
