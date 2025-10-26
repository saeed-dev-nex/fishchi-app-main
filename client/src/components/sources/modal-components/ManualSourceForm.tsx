import React from 'react';
import { Box, Stack, Button } from '@mui/material';
import type {
  UseFormRegister,
  UseFormSetValue,
  UseFormWatch,
} from 'react-hook-form';
import type { ManualFormInputs } from './types';
import BasicSourceFields from './BasicSourceFields';
import AdvancedSourceFields from './AdvancedSourceFields';

interface ManualSourceFormProps {
  register: UseFormRegister<ManualFormInputs>;
  setValue: UseFormSetValue<ManualFormInputs>;
  watch: UseFormWatch<ManualFormInputs>;
  error?: string;
  showAdvancedFields: boolean;
  onToggleAdvancedFields: () => void;
  tags: string[];
  setTags: (tags: string[]) => void;
  tagInputValue: string;
  setTagInputValue: (value: string) => void;
  onSuggestTags: () => void;
  isSuggestingTags: boolean;
  tagSuggestionError: string | null;
}

const ManualSourceForm: React.FC<ManualSourceFormProps> = ({
  register,
  setValue,
  watch,
  error,
  showAdvancedFields,
  onToggleAdvancedFields,
  tags,
  setTags,
  tagInputValue,
  setTagInputValue,
  onSuggestTags,
  isSuggestingTags,
  tagSuggestionError,
}) => {
  return (
    <Stack spacing={3}>
      <BasicSourceFields register={register} error={error} />

      {/* دکمه نمایش فیلدهای تکمیلی */}
      <Box sx={{ display: 'flex', justifyContent: 'center', mt: 2 }}>
        <Button
          variant='outlined'
          onClick={onToggleAdvancedFields}
          sx={{
            borderRadius: 2,
            textTransform: 'none',
            fontWeight: 500,
            px: 3,
            py: 1,
            borderStyle: 'dashed',
            borderWidth: 2,
            '&:hover': {
              borderStyle: 'solid',
              borderWidth: 2,
            },
          }}
        >
          {showAdvancedFields ? 'مخفی کردن' : 'افزودن'} اطلاعات تکمیلی منبع
          (اختیاری)
        </Button>
      </Box>

      {/* فیلدهای تکمیلی */}
      {showAdvancedFields && (
        <AdvancedSourceFields
          register={register}
          setValue={setValue}
          watch={watch}
          tags={tags}
          setTags={setTags}
          tagInputValue={tagInputValue}
          setTagInputValue={setTagInputValue}
          onSuggestTags={onSuggestTags}
          isSuggestingTags={isSuggestingTags}
          tagSuggestionError={tagSuggestionError}
        />
      )}
    </Stack>
  );
};

export default ManualSourceForm;
