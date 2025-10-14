import React, { useState, useEffect } from 'react';
import {
  Box,
  Container,
  Typography,
  Paper,
  Avatar,
  Button,
  TextField,
  Grid,
  Card,
  CardContent,
  CardActions,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Alert,
  Snackbar,
  CircularProgress,
  IconButton,
  Chip,
  Stack,
  Divider,
  alpha,
} from '@mui/material';
import {
  Edit,
  PhotoCamera,
  Delete,
  Save,
  Cancel,
  Lock,
  School,
  Work,
  Person,
  Email,
  CalendarToday,
} from '@mui/icons-material';
import { useDispatch, useSelector } from 'react-redux';
import { useTheme } from '@mui/material/styles';
import {
  fetchUserProfile,
  updateUserProfile,
  changePassword,
  uploadAvatar,
  deleteAvatar,
  clearProfileError,
  clearProfileMessage,
} from '../../store/features/profileSlice';
import type { AppDispatch, RootState } from '../../store';
import type { IUser } from '../../types';

const ProfilePage: React.FC = () => {
  const theme = useTheme();
  const dispatch = useDispatch<AppDispatch>();
  const { user, isLoading, error, message } = useSelector(
    (state: RootState) => state.profile
  );

  // State for profile editing
  const [isEditing, setIsEditing] = useState(false);
  const [editData, setEditData] = useState<Partial<IUser>>({});

  // State for password change dialog
  const [passwordDialogOpen, setPasswordDialogOpen] = useState(false);
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });

  // State for avatar upload
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);

  useEffect(() => {
    dispatch(fetchUserProfile());
  }, [dispatch]);

  useEffect(() => {
    if (user) {
      setEditData({
        name: user.name,
        university: user.university || '',
        fieldOfStudy: user.fieldOfStudy || '',
        degree: user.degree || '',
        bio: user.bio || '',
      });
    }
  }, [user]);

  const handleEditToggle = () => {
    if (isEditing) {
      // Cancel editing
      if (user) {
        setEditData({
          name: user.name,
          university: user.university || '',
          fieldOfStudy: user.fieldOfStudy || '',
          degree: user.degree || '',
          bio: user.bio || '',
        });
      }
    }
    setIsEditing(!isEditing);
  };

  const handleSaveProfile = async () => {
    try {
      await dispatch(updateUserProfile(editData)).unwrap();
      setIsEditing(false);
    } catch (error) {
      // Error is handled by the store
    }
  };

  const handlePasswordChange = async () => {
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      return;
    }

    try {
      await dispatch(
        changePassword({
          currentPassword: passwordData.currentPassword,
          newPassword: passwordData.newPassword,
        })
      ).unwrap();

      setPasswordDialogOpen(false);
      setPasswordData({
        currentPassword: '',
        newPassword: '',
        confirmPassword: '',
      });
    } catch (error) {
      // Error is handled by the store
    }
  };

  const handleAvatarChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setAvatarFile(file);
      const reader = new FileReader();
      reader.onload = (e) => {
        setAvatarPreview(e.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleAvatarUpload = async () => {
    if (avatarFile) {
      try {
        await dispatch(uploadAvatar(avatarFile)).unwrap();
        setAvatarFile(null);
        setAvatarPreview(null);
      } catch (error) {
        // Error is handled by the store
      }
    }
  };

  const handleAvatarDelete = async () => {
    try {
      await dispatch(deleteAvatar()).unwrap();
      setAvatarFile(null);
      setAvatarPreview(null);
    } catch (error) {
      // Error is handled by the store
    }
  };

  const handleCloseSnackbar = () => {
    dispatch(clearProfileError());
    dispatch(clearProfileMessage());
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

  if (!user) {
    return (
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          minHeight: '60vh',
        }}
      >
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Container maxWidth='lg' sx={{ py: 4 }}>
      <Typography variant='h4' fontWeight='600' gutterBottom>
        پروفایل کاربری
      </Typography>

      <Grid container spacing={3}>
        {/* Avatar Section */}
        <Grid item xs={12} md={4}>
          <Paper
            sx={{
              p: 3,
              borderRadius: 3,
              textAlign: 'center',
              background: `linear-gradient(135deg, ${alpha(
                theme.palette.primary.main,
                0.1
              )} 0%, ${alpha(theme.palette.secondary.main, 0.1)} 100%)`,
            }}
          >
            <Box sx={{ position: 'relative', display: 'inline-block' }}>
              <Avatar
                src={
                  avatarPreview ||
                  (user.avatar
                    ? `http://localhost:5000/uploads/avatars/${user.avatar}`
                    : undefined)
                }
                sx={{
                  width: 120,
                  height: 120,
                  mx: 'auto',
                  mb: 2,
                  fontSize: '3rem',
                  bgcolor: theme.palette.primary.main,
                }}
              >
                {!user.avatar &&
                  !avatarPreview &&
                  user.name.charAt(0).toUpperCase()}
              </Avatar>

              <IconButton
                sx={{
                  position: 'absolute',
                  bottom: 8,
                  right: 8,
                  bgcolor: theme.palette.background.paper,
                  boxShadow: 2,
                  '&:hover': {
                    bgcolor: theme.palette.background.paper,
                  },
                }}
                component='label'
              >
                <PhotoCamera />
                <input
                  type='file'
                  hidden
                  accept='image/*'
                  onChange={handleAvatarChange}
                />
              </IconButton>
            </Box>

            <Typography variant='h6' fontWeight='600' gutterBottom>
              {user.name}
            </Typography>

            <Stack
              direction='row'
              spacing={1}
              justifyContent='center'
              sx={{ mb: 2 }}
            >
              {avatarFile && (
                <Button
                  size='small'
                  variant='contained'
                  color='primary'
                  onClick={handleAvatarUpload}
                  disabled={isLoading}
                >
                  آپلود
                </Button>
              )}
              {user.avatar && (
                <Button
                  size='small'
                  variant='outlined'
                  color='error'
                  onClick={handleAvatarDelete}
                  disabled={isLoading}
                >
                  حذف
                </Button>
              )}
            </Stack>

            <Divider sx={{ my: 2 }} />

            <Button
              fullWidth
              variant='outlined'
              startIcon={<Lock />}
              onClick={() => setPasswordDialogOpen(true)}
              sx={{ mb: 2 }}
            >
              تغییر رمز عبور
            </Button>
          </Paper>
        </Grid>

        {/* Profile Information */}
        <Grid item xs={12} md={8}>
          <Paper sx={{ p: 3, borderRadius: 3 }}>
            <Box
              sx={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                mb: 3,
              }}
            >
              <Typography variant='h6' fontWeight='600'>
                اطلاعات پروفایل
              </Typography>
              <Button
                variant={isEditing ? 'outlined' : 'contained'}
                startIcon={isEditing ? <Cancel /> : <Edit />}
                onClick={handleEditToggle}
                disabled={isLoading}
              >
                {isEditing ? 'لغو' : 'ویرایش'}
              </Button>
            </Box>

            <Grid container spacing={3}>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label='نام'
                  value={editData.name || ''}
                  onChange={(e) =>
                    setEditData({ ...editData, name: e.target.value })
                  }
                  disabled={!isEditing}
                  InputProps={{
                    startAdornment: (
                      <Person sx={{ mr: 1, color: 'text.secondary' }} />
                    ),
                  }}
                />
              </Grid>

              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label='ایمیل'
                  value={user.email}
                  disabled
                  InputProps={{
                    startAdornment: (
                      <Email sx={{ mr: 1, color: 'text.secondary' }} />
                    ),
                  }}
                />
              </Grid>

              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label='دانشگاه'
                  value={editData.university || ''}
                  onChange={(e) =>
                    setEditData({ ...editData, university: e.target.value })
                  }
                  disabled={!isEditing}
                  InputProps={{
                    startAdornment: (
                      <School sx={{ mr: 1, color: 'text.secondary' }} />
                    ),
                  }}
                />
              </Grid>

              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label='رشته تحصیلی'
                  value={editData.fieldOfStudy || ''}
                  onChange={(e) =>
                    setEditData({ ...editData, fieldOfStudy: e.target.value })
                  }
                  disabled={!isEditing}
                  InputProps={{
                    startAdornment: (
                      <Work sx={{ mr: 1, color: 'text.secondary' }} />
                    ),
                  }}
                />
              </Grid>

              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  select
                  label='مدرک تحصیلی'
                  value={editData.degree || ''}
                  onChange={(e) =>
                    setEditData({ ...editData, degree: e.target.value })
                  }
                  disabled={!isEditing}
                  SelectProps={{
                    native: true,
                  }}
                >
                  <option value=''>انتخاب کنید</option>
                  <option value='دیپلم'>دیپلم</option>
                  <option value='کارشناسی'>کارشناسی</option>
                  <option value='کارشناسی ارشد'>کارشناسی ارشد</option>
                  <option value='دکتری'>دکتری</option>
                  <option value='فوق دکتری'>فوق دکتری</option>
                </TextField>
              </Grid>

              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label='تاریخ عضویت'
                  value={
                    user.createdAt
                      ? new Date(user.createdAt).toLocaleDateString('fa-IR')
                      : ''
                  }
                  disabled
                  InputProps={{
                    startAdornment: (
                      <CalendarToday sx={{ mr: 1, color: 'text.secondary' }} />
                    ),
                  }}
                />
              </Grid>

              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label='درباره من'
                  multiline
                  rows={4}
                  value={editData.bio || ''}
                  onChange={(e) =>
                    setEditData({ ...editData, bio: e.target.value })
                  }
                  disabled={!isEditing}
                  placeholder='درباره خودتان بنویسید...'
                />
              </Grid>
            </Grid>

            {isEditing && (
              <Box
                sx={{
                  mt: 3,
                  display: 'flex',
                  justifyContent: 'flex-end',
                  gap: 2,
                }}
              >
                <Button
                  variant='outlined'
                  onClick={handleEditToggle}
                  disabled={isLoading}
                >
                  لغو
                </Button>
                <Button
                  variant='contained'
                  startIcon={<Save />}
                  onClick={handleSaveProfile}
                  disabled={isLoading}
                >
                  ذخیره تغییرات
                </Button>
              </Box>
            )}
          </Paper>

          {/* Profile Summary */}
          <Paper sx={{ p: 3, borderRadius: 3, mt: 3 }}>
            <Typography variant='h6' fontWeight='600' gutterBottom>
              خلاصه پروفایل
            </Typography>

            <Stack direction='row' spacing={1} flexWrap='wrap' sx={{ mb: 2 }}>
              {user.degree && (
                <Chip
                  label={user.degree}
                  color={getDegreeColor(user.degree) as any}
                  variant='outlined'
                />
              )}
              {user.university && (
                <Chip
                  label={user.university}
                  color='primary'
                  variant='outlined'
                />
              )}
              {user.fieldOfStudy && (
                <Chip
                  label={user.fieldOfStudy}
                  color='secondary'
                  variant='outlined'
                />
              )}
            </Stack>

            {user.bio && (
              <Typography variant='body2' color='text.secondary'>
                {user.bio}
              </Typography>
            )}
          </Paper>
        </Grid>
      </Grid>

      {/* Password Change Dialog */}
      <Dialog
        open={passwordDialogOpen}
        onClose={() => setPasswordDialogOpen(false)}
        maxWidth='sm'
        fullWidth
      >
        <DialogTitle>تغییر رمز عبور</DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid item xs={12}>
              <TextField
                fullWidth
                type='password'
                label='رمز عبور فعلی'
                value={passwordData.currentPassword}
                onChange={(e) =>
                  setPasswordData({
                    ...passwordData,
                    currentPassword: e.target.value,
                  })
                }
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                type='password'
                label='رمز عبور جدید'
                value={passwordData.newPassword}
                onChange={(e) =>
                  setPasswordData({
                    ...passwordData,
                    newPassword: e.target.value,
                  })
                }
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                type='password'
                label='تأیید رمز عبور جدید'
                value={passwordData.confirmPassword}
                onChange={(e) =>
                  setPasswordData({
                    ...passwordData,
                    confirmPassword: e.target.value,
                  })
                }
                error={
                  passwordData.newPassword !== passwordData.confirmPassword &&
                  passwordData.confirmPassword !== ''
                }
                helperText={
                  passwordData.newPassword !== passwordData.confirmPassword &&
                  passwordData.confirmPassword !== ''
                    ? 'رمز عبور مطابقت ندارد'
                    : ''
                }
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setPasswordDialogOpen(false)}>لغو</Button>
          <Button
            onClick={handlePasswordChange}
            variant='contained'
            disabled={
              isLoading ||
              passwordData.newPassword !== passwordData.confirmPassword
            }
          >
            تغییر رمز عبور
          </Button>
        </DialogActions>
      </Dialog>

      {/* Snackbar for messages */}
      <Snackbar
        open={!!error || !!message}
        autoHideDuration={6000}
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
      >
        <Alert
          onClose={handleCloseSnackbar}
          severity={error ? 'error' : 'success'}
          sx={{ width: '100%' }}
        >
          {error || message}
        </Alert>
      </Snackbar>
    </Container>
  );
};

export default ProfilePage;
