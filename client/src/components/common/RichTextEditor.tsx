import React from 'react';
import { useEditor, EditorContent, Editor } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import {
  Box,
  Paper,
  ToggleButton,
  ToggleButtonGroup,
  alpha,
} from '@mui/material';
import {
  FormatBold,
  FormatItalic,
  FormatListBulleted,
  FormatListNumbered,
  FormatQuote,
} from '@mui/icons-material';

// نوار ابزار ویرایشگر
const EditorToolbar = ({ editor }: { editor: Editor | null }) => {
  if (!editor) return null;
  return (
    <ToggleButtonGroup size='small' exclusive>
      <ToggleButton
        onClick={() => editor.chain().focus().toggleBold().run()}
        value='bold'
        selected={editor.isActive('bold')}
      >
        <FormatBold />
      </ToggleButton>
      <ToggleButton
        onClick={() => editor.chain().focus().toggleItalic().run()}
        value='italic'
        selected={editor.isActive('italic')}
      >
        <FormatItalic />
      </ToggleButton>
      <ToggleButton
        onClick={() => editor.chain().focus().toggleBulletList().run()}
        value='bulletList'
        selected={editor.isActive('bulletList')}
      >
        <FormatListBulleted />
      </ToggleButton>
      <ToggleButton
        onClick={() => editor.chain().focus().toggleOrderedList().run()}
        value='orderedList'
        selected={editor.isActive('orderedList')}
      >
        <FormatListNumbered />
      </ToggleButton>
      <ToggleButton
        onClick={() => editor.chain().focus().toggleBlockquote().run()}
        value='blockquote'
        selected={editor.isActive('blockquote')}
      >
        <FormatQuote />
      </ToggleButton>
    </ToggleButtonGroup>
  );
};

// کامپوننت اصلی ویرایشگر
interface RichTextEditorProps {
  content: string;
  onChange: (htmlContent: string) => void;
  placeholder?: string;
}

const RichTextEditor: React.FC<RichTextEditorProps> = ({
  content,
  onChange,
  placeholder,
}) => {
  const editor = useEditor({
    extensions: [StarterKit],
    content: content,
    onUpdate: ({ editor }) => {
      onChange(editor.getHTML());
    },
    editorProps: {
      attributes: {
        class: 'tiptap-editor', // برای استایل‌دهی
      },
    },
  });

  return (
    <Paper
      variant='outlined'
      sx={{
        borderRadius: 2,
        borderColor: 'divider',
        '&:focus-within': {
          borderColor: 'primary.main',
          boxShadow: (theme) =>
            `0 0 0 2px ${alpha(theme.palette.primary.main, 0.2)}`,
        },
      }}
    >
      <Box sx={{ p: 1, borderBottom: 1, borderColor: 'divider' }}>
        <EditorToolbar editor={editor} />
      </Box>
      <EditorContent
        editor={editor}
        style={{ minHeight: '150px', padding: '16px' }}
      />
    </Paper>
  );
};

export default RichTextEditor;
