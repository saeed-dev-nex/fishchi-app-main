import React, { useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Typography,
  Box,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  CircularProgress,
  Alert,
  Chip,
  Stack,
  alpha,
} from '@mui/material';
import { Delete, Warning, FolderOpen, Close } from '@mui/icons-material';
import { useDispatch, useSelector } from 'react-redux';
import {
  fetchSourceProjects,
  deleteSource,
} from '../../store/features/sourceSlice';
import type { AppDispatch, RootState } from '../../store';
import type { ISource, IProject } from '../../types';

interface DeleteSourceDialogProps {
  open: boolean;
  onClose: () => void;
  source: ISource | null;
  onDeleteSuccess?: () => void;
}

const DeleteSourceDialog: React.FC<DeleteSourceDialogProps> = ({
  open,
  onClose,
  source,
  onDeleteSuccess,
}) => {
  const dispatch = useDispatch<AppDispatch>();
  const { sourceProjects, isLoading, error } = useSelector(
    (state: RootState) => state.sources
  );

  const projects = source ? sourceProjects[source._id] || [] : [];

  useEffect(() => {
    if (open && source) {
      dispatch(fetchSourceProjects(source._id));
    }
  }, [open, source, dispatch]);

  const handleDelete = async () => {
    if (!source) return;

    try {
      await dispatch(deleteSource(source._id)).unwrap();
      onDeleteSuccess?.();
      onClose();
    } catch (error) {
      // Error is handled by the store
    }
  };

  const handleClose = () => {
    onClose();
  };

  if (!source) return null;

  return (
    <Dialog
      open={open}
      onClose={handleClose}
      maxWidth='sm'
      fullWidth
      PaperProps={{
        sx: {
          borderRadius: 3,
          boxShadow: (theme) =>
            `0 20px 40px ${alpha(theme.palette.common.black, 0.15)}`,
        },
      }}
    >
      <DialogTitle>
        <Stack direction='row' spacing={2} alignItems='center'>
          <Box
            sx={{
              width: 48,
              height: 48,
              borderRadius: 2,
              bgcolor: 'error.main',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'white',
            }}
          >
            <Delete />
          </Box>
          <Box>
            <Typography variant='h6' fontWeight='600'>
              حذف منبع
            </Typography>
            <Typography variant='body2' color='text.secondary'>
              آیا مطمئن هستید که می‌خواهید این منبع را حذف کنید؟
            </Typography>
          </Box>
        </Stack>
      </DialogTitle>

      <DialogContent sx={{ pt: 2 }}>
        <Stack spacing={3}>
          {/* Source Info */}
          <Box
            sx={{
              p: 2,
              borderRadius: 2,
              border: (theme) =>
                `1px solid ${alpha(theme.palette.divider, 0.1)}`,
              bgcolor: (theme) => alpha(theme.palette.background.paper, 0.5),
            }}
          >
            <Typography variant='subtitle1' fontWeight='600' gutterBottom>
              {source.title}
            </Typography>
            <Stack direction='row' spacing={1} flexWrap='wrap'>
              {source.year && (
                <Chip
                  label={source.year}
                  size='small'
                  color='primary'
                  variant='outlined'
                />
              )}
              {source.type && (
                <Chip
                  label={source.type}
                  size='small'
                  color='secondary'
                  variant='outlined'
                />
              )}
              {source.authors && source.authors.length > 0 && (
                <Chip
                  label={source.authors[0].name}
                  size='small'
                  color='success'
                  variant='outlined'
                />
              )}
            </Stack>
          </Box>

          {/* Error Display */}
          {error && (
            <Alert severity='error' sx={{ borderRadius: 2 }}>
              {error}
            </Alert>
          )}

          {/* Loading State */}
          {isLoading && (
            <Box sx={{ display: 'flex', justifyContent: 'center', py: 2 }}>
              <CircularProgress size={24} />
            </Box>
          )}

          {/* Projects Using Source */}
          {!isLoading && projects.length > 0 && (
            <Box>
              <Stack
                direction='row'
                spacing={1}
                alignItems='center'
                sx={{ mb: 2 }}
              >
                <Warning color='warning' />
                <Typography
                  variant='subtitle2'
                  fontWeight='600'
                  color='warning.main'
                >
                  این منبع در پروژه‌های زیر استفاده شده است
                </Typography>
              </Stack>

              <List
                sx={{
                  borderRadius: 2,
                  border: (theme) =>
                    `1px solid ${alpha(theme.palette.warning.main, 0.2)}`,
                  bgcolor: (theme) => alpha(theme.palette.warning.main, 0.05),
                }}
              >
                {projects.map((project: IProject) => (
                  <ListItem key={project._id} sx={{ py: 1.5 }}>
                    <ListItemIcon>
                      <FolderOpen color='warning' />
                    </ListItemIcon>
                    <ListItemText
                      primary={
                        <Typography variant='body1' fontWeight='500'>
                          {project.title}
                        </Typography>
                      }
                      secondary={
                        <Typography variant='body2' color='text.secondary'>
                          برای حذف این منبع، ابتدا باید از پروژه حذف شود
                        </Typography>
                      }
                    />
                  </ListItem>
                ))}
              </List>
            </Box>
          )}

          {/* No Projects Warning */}
          {!isLoading && projects.length === 0 && (
            <Alert severity='info' sx={{ borderRadius: 2 }}>
              این منبع در هیچ پروژه‌ای استفاده نشده است و می‌تواند حذف شود.
            </Alert>
          )}
        </Stack>
      </DialogContent>

      <DialogActions sx={{ p: 3, pt: 1 }}>
        <Stack direction='row' spacing={2} sx={{ width: '100%' }}>
          <Button
            onClick={handleClose}
            variant='outlined'
            startIcon={<Close />}
            sx={{
              borderRadius: 2,
              textTransform: 'none',
              fontWeight: 500,
            }}
          >
            لغو
          </Button>

          <Button
            onClick={handleDelete}
            variant='contained'
            color='error'
            startIcon={<Delete />}
            disabled={isLoading || projects.length > 0}
            sx={{
              borderRadius: 2,
              textTransform: 'none',
              fontWeight: 500,
              px: 3,
            }}
          >
            {isLoading ? 'در حال حذف...' : 'حذف منبع'}
          </Button>
        </Stack>
      </DialogActions>
    </Dialog>
  );
};

export default DeleteSourceDialog;
