import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
  Stack,
} from '@mui/material';
import type { IProject } from '../../types';

interface EditProjectDialogProps {
  open: boolean;
  onClose: () => void;
  onSave: (formData: IProject) => void;
  project: IProject;
}

export const EditProjectDialog: React.FC<EditProjectDialogProps> = ({
  open,
  onClose,
  onSave,
  project,
}) => {
  const [form, setForm] = useState({
    title: '',
    description: '',
    tags: [] as string[],
  });

  useEffect(() => {
    if (project) {
      setForm({
        title: project.title || '',
        description: project.description || '',
        tags: project.tags || [],
      });
    }
  }, [project]);

  const handleSave = () => {
    onSave(form as IProject);
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth='md' fullWidth>
      <DialogTitle>ویرایش پروژه</DialogTitle>
      <DialogContent>
        <Stack spacing={3} sx={{ mt: 2 }}>
          <TextField
            label='عنوان پروژه'
            value={form.title}
            onChange={(e) => setForm({ ...form, title: e.target.value })}
            fullWidth
            required
          />
          <TextField
            label='توضیحات'
            value={form.description}
            onChange={(e) => setForm({ ...form, description: e.target.value })}
            multiline
            rows={4}
            fullWidth
          />
          <TextField
            label='برچسب‌ها (جدا شده با کاما)'
            value={form.tags.join(', ')}
            onChange={(e) =>
              setForm({
                ...form,
                tags: e.target.value
                  .split(',')
                  .map((tag) => tag.trim())
                  .filter(Boolean),
              })
            }
            fullWidth
          />
        </Stack>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>انصراف</Button>
        <Button onClick={handleSave} variant='contained'>
          ذخیره
        </Button>
      </DialogActions>
    </Dialog>
  );
};
