import React from 'react';
import {
  Card,
  CardContent,
  Typography,
  CardActions,
  IconButton,
  Tooltip,
  alpha,
  Box,
} from '@mui/material';
import { Delete as DeleteIcon } from '@mui/icons-material';
import type { INote } from '../../types';

interface NoteItemProps {
  note: INote;
  onDelete: (id: string) => void;
}

const NoteItem: React.FC<NoteItemProps> = ({ note, onDelete }) => {
  return (
    <Card
      elevation={0}
      sx={{
        mb: 2,
        border: (theme) => `1px solid ${theme.palette.divider}`,
        transition: 'box-shadow 0.3s ease, border-color 0.3s ease',
        '&:hover': {
          boxShadow: (theme) =>
            `0 4px 12px ${alpha(theme.palette.common.black, 0.08)}`,
          borderColor: 'primary.main',
        },
      }}
    >
      <CardContent>
        {/* محتوای HTML را به صورت امن رندر می‌کند */}
        <Box
          className='ProseMirror'
          dangerouslySetInnerHTML={{ __html: note.content }}
        />
      </CardContent>
      <CardActions
        sx={{ justifyContent: 'space-between', pt: 0, px: 2, pb: 2 }}
      >
        <Typography variant='caption' color='text.secondary'>
          {note.pageRef ? `صفحه: ${note.pageRef}` : ''}
        </Typography>
        <Tooltip title='حذف فیش'>
          <IconButton size='small' onClick={() => onDelete(note._id)}>
            <DeleteIcon fontSize='small' />
          </IconButton>
        </Tooltip>
      </CardActions>
    </Card>
  );
};

export default NoteItem;
