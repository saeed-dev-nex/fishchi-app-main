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
  onSelectSource: (id: string) => void;
}

export const SourceGridItem: React.FC<SourceGridItemProps> = ({
  source,
  isSelected,
  onSelect,
  onSelectSource,
}) => {
  return (
    <Grid
      size={{
        xs: 12,
        md: 6,
      }}
    >
      <Card
        sx={{
          position: 'relative',
          borderRadius: 3,
          border: isSelected ? '2px solid' : '1px solid',
          borderColor: isSelected ? 'primary.main' : 'divider',
          bgcolor: isSelected
            ? (theme) => alpha(theme.palette.primary.main, 0.08)
            : (theme) => alpha(theme.palette.background.paper, 0.6),
          backdropFilter: 'blur(10px)',
          transition: 'all 0.3s ease',
          cursor: 'pointer',
          '&:hover': {
            transform: 'translateY(-6px)',
            boxShadow: (theme) =>
              `0 12px 30px ${alpha(theme.palette.common.black, 0.15)}`,
            borderColor: 'primary.main',
            bgcolor: (theme) => alpha(theme.palette.primary.main, 0.05),
          },
        }}
      >
        <CardActionArea
          onClick={() => onSelectSource(source._id)}
          sx={{ p: 3 }}
        >
          <Stack spacing={2} alignItems='center'>
            <Avatar sx={{ bgcolor: `${getSourceTypeColor(source.type)}.main` }}>
              {getSourceTypeIcon(source.type)}
            </Avatar>
            <Typography
              component={RouterLink}
              to={`/app/library/${source._id}`}
              variant='h6'
              fontWeight='600'
              textAlign='center'
              sx={{
                minHeight: '3em',
                cursor: 'pointer',
                textDecoration: 'none',
                color: 'text.primary',
              }}
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

export default SourceGridItem;
