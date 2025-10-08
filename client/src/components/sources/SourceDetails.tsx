import React from 'react';
import { Link } from 'react-router-dom';
import {
  Box,
  Paper,
  Typography,
  Stack,
  Divider,
  Chip,
  Button,
} from '@mui/material';
import { Person, Tag, LinkOutlined } from '@mui/icons-material';
import type { ISource } from '../../types';
// import { getSourceTypeIcon, getSourceTypeColor } from '../../utils/sourceUtils';

const getSourceTypeIcon = (type: string) => <div />; // Placeholder
const getSourceTypeColor = (type: string) => 'primary' as const; // Placeholder

interface SourceDetailsProps {
  source: ISource; // تایپ دقیق‌تر
}

export const SourceDetails: React.FC<SourceDetailsProps> = ({ source }) => {
  return (
    <Paper
      elevation={0}
      sx={{
        p: 4,
        borderRadius: 3,
        border: '1px solid',
        borderColor: 'divider',
      }}
    >
      <Typography variant='h5' fontWeight='700' gutterBottom>
        جزئیات منبع
      </Typography>
      <Divider sx={{ mb: 3 }} />

      <Stack spacing={3}>
        <Box>
          <Typography variant='h6' fontWeight='600' gutterBottom>
            عنوان
          </Typography>
          <Typography variant='body1' color='text.secondary'>
            {source.title}
          </Typography>
        </Box>

        {source.authors?.length > 0 && (
          <Box>
            <Typography variant='h6' fontWeight='600' gutterBottom>
              نویسندگان
            </Typography>
            <Stack direction='row' spacing={1} flexWrap='wrap'>
              {source.authors.map((author: any, index: number) => (
                <Chip
                  key={index}
                  icon={<Person />}
                  label={author.name}
                  variant='outlined'
                />
              ))}
            </Stack>
          </Box>
        )}

        {source.year && (
          <Box>
            <Typography variant='h6' fontWeight='600' gutterBottom>
              سال انتشار
            </Typography>
            <Typography variant='body1' color='text.secondary'>
              {source.year}
            </Typography>
          </Box>
        )}

        {source.tags?.length > 0 && (
          <Box>
            <Typography variant='h6' fontWeight='600' gutterBottom>
              برچسب‌ها
            </Typography>
            <Stack direction='row' spacing={1} flexWrap='wrap'>
              {source.tags.map((tag: string, index: number) => (
                <Chip
                  key={index}
                  icon={<Tag />}
                  label={tag}
                  variant='outlined'
                />
              ))}
            </Stack>
          </Box>
        )}

        <Box>
          <Typography variant='h6' fontWeight='600' gutterBottom>
            نوع منبع
          </Typography>
          <Chip
            icon={getSourceTypeIcon(source.type)}
            label={source.type || 'منبع'}
            color={getSourceTypeColor(source.type)}
            variant='outlined'
          />
        </Box>

        <Box>
          <Typography variant='h6' fontWeight='600' gutterBottom>
            چکیده
          </Typography>
          <Typography variant='body1' color='text.secondary'>
            {source.abstract || 'چکیده وجود ندارد.'}
          </Typography>
        </Box>

        {source.identifiers?.url && (
          <Box>
            <Typography variant='h6' fontWeight='600' gutterBottom>
              شناسه
            </Typography>
            <Button
              component={Link}
              to={source.identifiers.url}
              target='_blank'
              startIcon={<LinkOutlined />}
            >
              مشاهده منبع اصلی
            </Button>
          </Box>
        )}
      </Stack>
    </Paper>
  );
};
