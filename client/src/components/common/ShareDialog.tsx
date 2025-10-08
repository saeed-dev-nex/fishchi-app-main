import React from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
  Typography,
} from '@mui/material';

interface ShareDialogProps {
  open: boolean;
  onClose: () => void;
  onShare: () => void;
  title: string;
  shareUrl: string;
  contentText: string;
}

export const ShareDialog: React.FC<ShareDialogProps> = ({
  open,
  onClose,
  onShare,
  title,
  shareUrl,
  contentText,
}) => {
  return (
    <Dialog open={open} onClose={onClose} maxWidth='sm' fullWidth>
      <DialogTitle>{title}</DialogTitle>
      <DialogContent>
        <Typography sx={{ mb: 2 }}>{contentText}</Typography>
        <TextField
          label='لینک اشتراک‌گذاری'
          value={shareUrl}
          fullWidth
          InputProps={{ readOnly: true }}
          sx={{ mb: 2, direction: 'ltr' }}
        />
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>بستن</Button>
        <Button onClick={onShare} variant='contained'>
          اشتراک‌گذاری
        </Button>
      </DialogActions>
    </Dialog>
  );
};
