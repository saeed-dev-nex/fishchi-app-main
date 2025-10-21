import React from 'react';
import { TextField, Stack, Button, CircularProgress, Typography } from '@mui/material';

interface ParseCitationFormProps {
  citationText: string;
  onCitationTextChange: (text: string) => void;
  onParseCitation: () => void;
  isLoading: boolean;
}

const ParseCitationForm: React.FC<ParseCitationFormProps> = ({
  citationText,
  onCitationTextChange,
  onParseCitation,
  isLoading,
}) => {
  return (
    <Stack spacing={3}>
      <Typography variant='h6' color='primary' fontWeight='600'>
        استخراج اطلاعات از Citation
      </Typography>
      <TextField
        label='متن Citation'
        multiline
        rows={6}
        fullWidth
        value={citationText}
        onChange={(e) => onCitationTextChange(e.target.value)}
        placeholder='منبع خود را در فرمت APA, MLA, Chicago, Vancouver, Harvard وارد کنید'
        helperText='متن citation را در فرمت APA، MLA، Chicago، Vancouver، Harvard یا سایر فرمت‌های متداول وارد کنید'
        sx={{
          '& .MuiOutlinedInput-root': {
            borderRadius: 2,
          },
        }}
      />
      <Button
        variant='contained'
        onClick={onParseCitation}
        disabled={!citationText.trim() || isLoading}
        sx={{
          borderRadius: 2,
          textTransform: 'none',
          fontWeight: 500,
          py: 1.5,
        }}
      >
        {isLoading ? (
          <>
            <CircularProgress size={20} color='inherit' sx={{ mr: 1 }} />
            در حال پردازش...
          </>
        ) : (
          'استخراج اطلاعات'
        )}
      </Button>
    </Stack>
  );
};

export default ParseCitationForm;
