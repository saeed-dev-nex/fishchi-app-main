import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Box,
  Paper,
  Tooltip,
  IconButton,
} from '@mui/material';
import { ContentCopy as ContentCopyIcon } from '@mui/icons-material';
import type { AppDispatch, RootState } from '../../store';
import { generateProjectCitations } from '../../store/features/projectSlice';

interface ProjectCitationModalProps {
  open: boolean;
  onClose: () => void;
  projectId: string;
}

const ProjectCitationModal: React.FC<ProjectCitationModalProps> = ({
  open,
  onClose,
  projectId,
}) => {
  const dispatch = useDispatch<AppDispatch>();
  const { generatedCitation } = useSelector(
    (state: RootState) => state.projects
  );
  const [style, setStyle] = useState('apa');

  useEffect(() => {
    if (open && projectId) {
      dispatch(generateProjectCitations({ projectId, style }));
    }
  }, [open, projectId, style, dispatch]);

  const handleCopy = () => {
    if (generatedCitation) {
      const tempDiv = document.createElement('div');
      tempDiv.innerHTML = generatedCitation;
      navigator.clipboard.writeText(tempDiv.textContent || '');
    }
  };

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth='md'>
      <DialogTitle>تولید فهرست منابع پروژه</DialogTitle>
      <DialogContent>
        <FormControl fullWidth margin='normal'>
          <InputLabel>سبک استناد</InputLabel>
          <Select
            value={style}
            label='سبک استناد'
            onChange={(e) => setStyle(e.target.value)}
          >
            <MenuItem value='apa'>APA</MenuItem>
            <MenuItem value='vancouver'>Vancouver</MenuItem>
            <MenuItem value='chicago-fullnote-bibliography'>Chicago</MenuItem>
          </Select>
        </FormControl>
        <Paper
          variant='outlined'
          sx={{
            p: 2,
            mt: 2,
            minHeight: 200,
            position: 'relative',
            bgcolor: 'background.default',
          }}
        >
          <Tooltip
            title='کپی کردن متن'
            sx={{ position: 'absolute', top: 8, left: 8, zIndex: 1 }}
          >
            <IconButton onClick={handleCopy} size='small'>
              <ContentCopyIcon fontSize='small' />
            </IconButton>
          </Tooltip>
          <Box dangerouslySetInnerHTML={{ __html: generatedCitation || '' }} />
        </Paper>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>بستن</Button>
      </DialogActions>
    </Dialog>
  );
};

export default ProjectCitationModal;
