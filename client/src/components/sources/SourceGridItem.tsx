import React from 'react';
import { Link as RouterLink } from 'react-router-dom';
import {
  Grid,
  Card,
  CardActionArea,
  Stack,
  Avatar,
  Typography,
  Checkbox,
  Box,
  alpha,
} from '@mui/material';
import { Person, CalendarToday } from '@mui/icons-material';
// فرض می‌کنیم این توابع کمکی را در یک فایل جداگانه دارید
import { getSourceTypeIcon, getSourceTypeColor } from '../../utils/sourceUtils';
import type { ISource } from '../../types';

interface SourceGridItemProps {
  source: ISource;
  isSelected: boolean;
  onSelect: (id: string) => void;
}

export const SourceGridItem: React.FC<SourceGridItemProps> = ({
  source,
  isSelected,
  onSelect,
}) => {
  return (
    <Grid
      size={{
        xs: 12,
        sm: 6,
        md: 4,
        lg: 3,
      }}
    >
      <Card
        sx={{
          position: 'relative',
          borderRadius: 3,
          border: isSelected ? '2px solid' : '1px solid',
          borderColor: isSelected ? 'primary.main' : 'divider',
          transition: 'all 0.3s ease',
          '&:hover': {
            transform: 'translateY(-4px)',
            boxShadow: (theme) =>
              `0 8px 25px ${alpha(theme.palette.common.black, 0.15)}`,
            borderColor: 'primary.main',
          },
        }}
      >
        <CardActionArea
          component={RouterLink}
          to={`/app/library/${source._id}`}
          sx={{ p: 3 }}
        >
          <Stack spacing={2} alignItems='center'>
            <Avatar sx={{ bgcolor: `${getSourceTypeColor(source.type)}.main` }}>
              {getSourceTypeIcon(source.type)}
            </Avatar>
            <Typography
              variant='h6'
              fontWeight='600'
              textAlign='center'
              sx={{ minHeight: '3em' }}
            >
              {source.title}
            </Typography>
            <Stack spacing={1}>
              {source.authors?.[0] && (
                <Stack direction='row' alignItems='center' spacing={1}>
                  <Person sx={{ fontSize: 16, color: 'text.secondary' }} />
                  <Typography variant='body2' color='text.secondary' noWrap>
                    {source.authors[0].name}
                  </Typography>
                </Stack>
              )}
              {source.year && (
                <Stack direction='row' alignItems='center' spacing={1}>
                  <CalendarToday
                    sx={{ fontSize: 16, color: 'text.secondary' }}
                  />
                  <Typography variant='body2' color='text.secondary'>
                    {source.year}
                  </Typography>
                </Stack>
              )}
            </Stack>
          </Stack>
        </CardActionArea>
        <Box sx={{ position: 'absolute', top: 12, right: 12 }}>
          <Checkbox
            checked={isSelected}
            onChange={() => onSelect(source._id)}
          />
        </Box>
      </Card>
    </Grid>
  );
};
