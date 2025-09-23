import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import type { AppDispatch, RootState } from '../../store';
import { fetchProjects } from '../../store/features/projectSlice';
import {
  Box,
  Typography,
  Button,
  CircularProgress,
  Alert,
  Grid,
  Card,
  CardContent,
  CardActions,
} from '@mui/material';
import { Link as RouterLink } from 'react-router-dom';

const ProjectsPage: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const { projects, isLoading, error } = useSelector(
    (state: RootState) => state.projects
  );

  // در زمان بارگذاری صفحه، پروژه‌ها را واکشی کن
  useEffect(() => {
    dispatch(fetchProjects());
  }, [dispatch]);

  // TODO: دکمه "پروژه جدید" و مودال آن را در مرحله بعد اضافه خواهیم کرد

  return (
    <Box>
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          mb: 3,
        }}
      >
        <Typography variant='h4' component='h1'>
          پروژه‌های من
        </Typography>
        <Button variant='contained' color='primary'>
          پروژه جدید
        </Button>
      </Box>

      {/* نمایش وضعیت لودینگ یا خطا */}
      {isLoading && <CircularProgress />}
      {error && <Alert severity='error'>{error}</Alert>}

      {/* نمایش لیست پروژه‌ها */}
      <Grid container spacing={3}>
        {!isLoading &&
          !error &&
          projects.map((project) => (
            <Grid size={{ xs: 12, sm: 6, md: 4 }} key={project._id}>
              <Card>
                <CardContent>
                  <Typography variant='h5' component='div'>
                    {project.title}
                  </Typography>
                  <Typography sx={{ mb: 1.5 }} color='text.secondary'>
                    {project.description || 'بدون توضیحات'}
                  </Typography>
                </CardContent>
                <CardActions>
                  <Button
                    size='small'
                    component={RouterLink}
                    to={`/app/projects/${project._id}`}
                  >
                    مشاهده پروژه
                  </Button>
                </CardActions>
              </Card>
            </Grid>
          ))}
      </Grid>
    </Box>
  );
};

export default ProjectsPage;
