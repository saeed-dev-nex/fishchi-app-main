import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';

import {
  fetchProjectById,
  clearSelectedProject,
} from '../../store/features/projectSlice';
import {
  fetchSourcesByProject,
  deleteSource,
} from '../../store/features/sourceSlice';
import {
  Box,
  Typography,
  Button,
  CircularProgress,
  Alert,
  Grid,
  Card,
  CardContent,
  List,
  ListItem,
  ListItemText,
  Divider,
  Checkbox,
  Toolbar,
  IconButton,
  Tooltip,
  ToggleButton,
  ToggleButtonGroup,
  Paper,
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import DeleteIcon from '@mui/icons-material/Delete';
import ViewListIcon from '@mui/icons-material/ViewList';
import ViewModuleIcon from '@mui/icons-material/ViewModule';
import ConfirmationDialog from '../../components/common/ConfirmationDialog';
import type { AppDispatch, RootState } from '../../store';
import AddSourceModal from '../../components/sources/AddSourceModal';

const ProjectDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const dispatch = useDispatch<AppDispatch>();

  // State های محلی برای مدیریت UI
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [selected, setSelected] = useState<string[]>([]);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isAddSourceModalOpen, setIsAddSourceModalOpen] = useState(false);
  // واکشی داده‌ها از Redux
  const {
    selectedProject,
    isLoading: projectLoading,
    error: projectError,
  } = useSelector((state: RootState) => state.projects);
  const {
    sources,
    isLoading: sourcesLoading,
    error: sourcesError,
  } = useSelector((state: RootState) => state.sources);

  useEffect(() => {
    if (id) {
      dispatch(fetchProjectById(id));
      dispatch(fetchSourcesByProject(id));
    }
    return () => {
      dispatch(clearSelectedProject());
    };
  }, [id, dispatch]);

  // --- Handlers ---
  const handleViewChange = (
    event: React.MouseEvent<HTMLElement>,
    newView: 'grid' | 'list' | null
  ) => {
    if (newView !== null) setViewMode(newView);
  };

  const handleSelect = (sourceId: string) => {
    const selectedIndex = selected.indexOf(sourceId);
    let newSelected: string[] = [];
    if (selectedIndex === -1) {
      newSelected = newSelected.concat(selected, sourceId);
    } else {
      newSelected = selected.filter((id) => id !== sourceId);
    }
    setSelected(newSelected);
  };

  const handleSelectAll = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.checked) {
      const newSelecteds = sources.map((s) => s._id);
      setSelected(newSelecteds);
      return;
    }
    setSelected([]);
  };

  const handleConfirmDelete = async () => {
    // برای هر آیتم انتخاب شده، thunk حذف را dispatch کن
    await Promise.all(selected.map((id) => dispatch(deleteSource(id))));
    setSelected([]); // پاک کردن لیست انتخاب شده‌ها
    setIsDialogOpen(false); // بستن دیالوگ
  };

  // --- Render Logic ---
  if (projectLoading) return <CircularProgress />;
  if (projectError) return <Alert severity='error'>{projectError}</Alert>;
  if (!selectedProject) return <Typography>پروژه یافت نشد.</Typography>;

  const isSelected = (id: string) => selected.indexOf(id) !== -1;
  const numSelected = selected.length;
  const rowCount = sources.length;

  return (
    <>
      <Paper sx={{ p: 2, mb: 3 }}>
        <Typography variant='h4' gutterBottom>
          {selectedProject.title}
        </Typography>
        <Typography variant='body1' color='text.secondary' paragraph>
          {selectedProject.description}
        </Typography>
      </Paper>

      <Paper sx={{ p: 2 }}>
        {/* Toolbar شرطی: بر اساس اینکه آیتمی انتخاب شده یا نه، نمایش داده می‌شود */}
        <Toolbar
          sx={{
            pl: { sm: 2 },
            pr: { xs: 1, sm: 1 },
            ...(numSelected > 0 && {
              bgcolor: (theme) => theme.palette.action.selected,
            }),
          }}
        >
          {numSelected > 0 ? (
            <Typography
              sx={{ flex: '1 1 100%' }}
              color='inherit'
              variant='subtitle1'
              component='div'
            >
              {numSelected} مورد انتخاب شده
            </Typography>
          ) : (
            <Typography sx={{ flex: '1 1 100%' }} variant='h6' component='div'>
              منابع پروژه
            </Typography>
          )}

          {numSelected > 0 ? (
            <Tooltip title='حذف'>
              <IconButton onClick={() => setIsDialogOpen(true)}>
                <DeleteIcon />
              </IconButton>
            </Tooltip>
          ) : (
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <ToggleButtonGroup
                value={viewMode}
                exclusive
                onChange={handleViewChange}
                size='small'
              >
                <ToggleButton value='list'>
                  <ViewListIcon />
                </ToggleButton>
                <ToggleButton value='grid'>
                  <ViewModuleIcon />
                </ToggleButton>
              </ToggleButtonGroup>
              <Button
                variant='contained'
                startIcon={<AddIcon />}
                onClick={() => setIsAddSourceModalOpen(true)}
              >
                افزودن منبع
              </Button>
            </Box>
          )}
        </Toolbar>

        {/* Checkbox انتخاب همه */}
        {numSelected > 0 && (
          <Checkbox
            color='primary'
            indeterminate={numSelected > 0 && numSelected < rowCount}
            checked={rowCount > 0 && numSelected === rowCount}
            onChange={handleSelectAll}
          />
        )}

        {/* نمایش لیست یا گرید */}
        {sourcesLoading && (
          <CircularProgress sx={{ mx: 'auto', display: 'block' }} />
        )}
        {sourcesError && <Alert severity='error'>{sourcesError}</Alert>}

        {viewMode === 'grid' ? (
          <Grid container spacing={2} sx={{ mt: 2 }}>
            {sources.map((source) => {
              const selected = isSelected(source._id);
              return (
                <Grid size={{ xs: 12, md: 6, lg: 4 }} key={source._id}>
                  <Card
                    sx={{
                      position: 'relative',
                      border: selected ? '2px solid' : 'none',
                      borderColor: 'primary.main',
                    }}
                  >
                    <Checkbox
                      checked={selected}
                      onChange={() => handleSelect(source._id)}
                      sx={{ position: 'absolute', top: 8, right: 8 }}
                    />
                    <CardContent>
                      <Typography variant='h6' noWrap>
                        {source.title}
                      </Typography>
                      <Typography variant='body2' color='text.secondary'>
                        سال: {source.year || 'N/A'}
                      </Typography>
                    </CardContent>
                  </Card>
                </Grid>
              );
            })}
          </Grid>
        ) : (
          <List sx={{ mt: 2 }}>
            {sources.map((source) => {
              const selected = isSelected(source._id);
              return (
                <ListItem
                  key={source._id}
                  secondaryAction={
                    <Checkbox
                      checked={selected}
                      onChange={() => handleSelect(source._id)}
                    />
                  }
                  divider
                >
                  <ListItemText
                    primary={source.title}
                    secondary={`سال: ${source.year || 'N/A'}`}
                  />
                </ListItem>
              );
            })}
          </List>
        )}
      </Paper>

      {/* دیالوگ تایید حذف */}
      <ConfirmationDialog
        open={isDialogOpen}
        onClose={() => setIsDialogOpen(false)}
        onConfirm={handleConfirmDelete}
        title='حذف منابع انتخاب شده'
        contentText={`آیا از حذف ${numSelected} منبع انتخاب شده اطمینان دارید؟ این عمل غیرقابل بازگشت است.`}
      />
      {id && (
        <AddSourceModal
          open={isAddSourceModalOpen}
          onClose={() => setIsAddSourceModalOpen(false)}
          projectId={id}
        />
      )}
    </>
  );
};

export default ProjectDetailPage;
