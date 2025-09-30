import React, { useState, useEffect } from 'react';
import { useForm, type SubmitHandler } from 'react-hook-form';
import { useDispatch, useSelector } from 'react-redux';
import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  TextField,
  CircularProgress,
  Tabs,
  Tab,
  Box,
  Alert,
} from '@mui/material';

import type { AppDispatch, RootState } from '../../store';
import {
  createSource,
  importSourceByDOI,
  clearError,
  importSourceByUrl,
} from '../../store/features/sourceSlice';

interface AddSourceModalProps {
  open: boolean;
  onClose: () => void;
  projectId: string;
}

// انواع فرم‌ها
type ManualFormInputs = { title: string; authors: string; year: string };
type DoiFormInputs = { doi: string };
type UrlFormInputs = { url: string };
const AddSourceModal: React.FC<AddSourceModalProps> = ({
  open,
  onClose,
  projectId,
}) => {
  const dispatch = useDispatch<AppDispatch>();
  const { isLoading, error } = useSelector((state: RootState) => state.sources);
  const [activeTab, setActiveTab] = useState(0);

  // فرم برای افزودن دستی
  const {
    register: registerManual,
    handleSubmit: handleSubmitManual,
    reset: resetManual,
  } = useForm<ManualFormInputs>();
  // فرم برای وارد کردن با DOI
  const {
    register: registerDoi,
    handleSubmit: handleSubmitDoi,
    reset: resetDoi,
  } = useForm<DoiFormInputs>();
  const {
    register: registerUrl,
    handleSubmit: handleSubmitUrl,
    reset: resetUrl,
  } = useForm<UrlFormInputs>();

  useEffect(() => {
    // با هر بار باز شدن مودال، خطاها را پاک کن
    if (open) {
      dispatch(clearError());
    }
  }, [open, dispatch]);

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setActiveTab(newValue);
  };
  const handleClose = () => {
    resetManual();
    resetDoi();
    resetUrl();
    onClose();
  };

  // ارسال فرم دستی
  const onManualSubmit: SubmitHandler<ManualFormInputs> = async (data) => {
    const processedData = {
      ...data,
      projectId,
      authors: data.authors.split(',').map((name) => ({ name: name.trim() })),
      year: Number(data.year) || undefined,
    };
    const result = await dispatch(createSource(processedData));
    if (createSource.fulfilled.match(result)) {
      handleClose();
    }
  };

  // ارسال فرم DOI
  const onDoiSubmit: SubmitHandler<DoiFormInputs> = async (data) => {
    const result = await dispatch(importSourceByDOI({ ...data, projectId }));
    if (importSourceByDOI.fulfilled.match(result)) {
      handleClose();
    }
  };

  // ارسال فرم URL
  const onUrlSubmit: SubmitHandler<UrlFormInputs> = async (data) => {
    const result = await dispatch(importSourceByUrl({ ...data, projectId }));
    if (importSourceByUrl.fulfilled.match(result)) {
      handleClose();
    }
  };

  return (
    <Dialog open={open} onClose={handleClose} fullWidth maxWidth='sm'>
      <DialogTitle>افزودن منبع جدید</DialogTitle>
      <DialogContent>
        <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 2 }}>
          <Tabs value={activeTab} onChange={handleTabChange}>
            <Tab label='افزودن با لینک' />
            <Tab label='افزودن دستی' />
            <Tab label='وارد کردن با DOI' />
          </Tabs>
        </Box>

        {error && (
          <Alert severity='error' sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}

        {/* تب وارد کردن با لینک (جدید) */}
        <form
          id='url-form'
          onSubmit={handleSubmitUrl(onUrlSubmit)}
          hidden={activeTab !== 0}
        >
          <TextField
            autoFocus
            margin='dense'
            label='لینک مقاله از SID یا Noormags'
            fullWidth
            {...registerUrl('url', { required: true })}
          />
        </form>

        {/* تب افزودن دستی */}
        <form
          id='manual-form'
          onSubmit={handleSubmitManual(onManualSubmit)}
          hidden={activeTab !== 1}
        >
          <TextField
            autoFocus
            margin='dense'
            label='عنوان'
            fullWidth
            {...registerManual('title', { required: true })}
          />
          <TextField
            margin='dense'
            label='نویسندگان (با کاما جدا کنید)'
            fullWidth
            {...registerManual('authors')}
          />
          <TextField
            margin='dense'
            label='سال انتشار'
            type='number'
            fullWidth
            {...registerManual('year')}
          />
        </form>

        {/* تب وارد کردن با DOI */}
        <form
          id='doi-form'
          onSubmit={handleSubmitDoi(onDoiSubmit)}
          hidden={activeTab !== 2}
        >
          <TextField
            autoFocus
            margin='dense'
            label='DOI'
            placeholder='10.1038/s41586-021-03511-4'
            fullWidth
            {...registerDoi('doi', { required: true })}
          />
        </form>
      </DialogContent>
      <DialogActions>
        <Button onClick={handleClose} color='inherit'>
          انصراف
        </Button>
        <Button
          type='submit'
          form={activeTab === 0 ? 'url-form' : activeTab === 1 ? 'manual-form' : 'doi-form'} // فرم مربوطه را submit می‌کند
          variant='contained'
          disabled={isLoading}
        >
          {isLoading ? <CircularProgress size={24} /> : 'افزودن'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default AddSourceModal;
