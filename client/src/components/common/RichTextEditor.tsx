import React, { useEffect } from 'react';
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import { TextStyle } from '@tiptap/extension-text-style';
import FontFamily from '@tiptap/extension-font-family';
import { Table } from '@tiptap/extension-table';
import { TableRow } from '@tiptap/extension-table-row';
import { TableCell } from '@tiptap/extension-table-cell';
import { TableHeader } from '@tiptap/extension-table-header';
import TextAlign from '@tiptap/extension-text-align';
import { Paper, alpha, useTheme } from '@mui/material';
import type { Theme } from '@mui/material';
import ToolbarPlugin from './ToolbarPlugin';

// Custom FontSize extension
const FontSize = TextStyle.extend({
  addAttributes() {
    return {
      ...this.parent?.(),
      fontSize: {
        default: null,
        parseHTML: (element) => element.style.fontSize || null,
        renderHTML: (attributes) => {
          if (!attributes.fontSize) {
            return {};
          }
          return {
            style: `font-size: ${attributes.fontSize}`,
          };
        },
      },
    };
  },
  addCommands() {
    return {
      ...this.parent?.(),
      setFontSize:
        (fontSize: string) =>
        ({ commands }) => {
          return commands.setMark('textStyle', { fontSize });
        },
      unsetFontSize:
        () =>
        ({ commands }) => {
          return commands.unsetMark('textStyle');
        },
    };
  },
});

interface RichTextEditorProps {
  content: string;
  onChange: (htmlContent: string) => void;
  key?: string | number;
}

const RichTextEditor: React.FC<RichTextEditorProps> = ({
  content,
  onChange,
  key,
}) => {
  const theme = useTheme();
  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        heading: {
          levels: [1, 2, 3],
        },
      }),
      TextStyle,
      FontSize,
      FontFamily,
      TextAlign.configure({
        types: ['heading', 'paragraph'],
        alignments: ['left', 'center', 'right'],
        defaultAlignment: 'right',
      }),
      Table.configure({ resizable: true }),
      TableRow,
      TableHeader,
      TableCell,
    ],
    content: content,
    onUpdate: ({ editor }) => {
      onChange(editor.getHTML());
    },
    onSelectionUpdate: ({ editor }) => {
      // Apply inline styles to tables after selection changes
      const tables = editor.view.dom.querySelectorAll('table');
      tables.forEach((table: HTMLTableElement) => {
        if (!table.style.border) {
          table.style.border = `2px solid ${theme.palette.divider}`;
          table.style.borderCollapse = 'collapse';
          table.style.width = '100%';
          table.style.margin = '1rem 0';
          table.style.tableLayout = 'auto';

          const cells = table.querySelectorAll('th, td');
          cells.forEach((cell) => {
            const htmlCell = cell as HTMLTableCellElement;
            htmlCell.style.border = `1px solid ${theme.palette.divider}`;
            htmlCell.style.padding = '8px';
            htmlCell.style.minWidth = '50px';
            htmlCell.style.verticalAlign = 'top';
            htmlCell.style.backgroundColor = theme.palette.background.paper;
          });

          const headers = table.querySelectorAll('th');
          headers.forEach((header) => {
            const htmlHeader = header as HTMLTableCellElement;
            htmlHeader.style.fontWeight = 'bold';
            htmlHeader.style.backgroundColor = alpha(
              theme.palette.primary.main,
              0.1
            );
            htmlHeader.style.textAlign = 'right';
            htmlHeader.style.position = 'relative';
          });
        }
      });
    },
    editorProps: {
      attributes: {
        class: 'tiptap-editor',
      },
    },
  });
  useEffect(() => {
    if (editor && editor.getHTML() !== content) {
      editor.commands.setContent(content);
    }
  }, [content, editor]);

  // افزودن استایل‌های ضروری به صورت سراسری
  const createGlobalStyles = (theme: Theme) => `
    /* Editor Styles */
    .tiptap-editor .ProseMirror:focus { outline: none; }
    .tiptap-editor .ProseMirror p { margin: 0 0 0.75rem 0; }
    .tiptap-editor .ProseMirror h1, .tiptap-editor .ProseMirror h2, .tiptap-editor .ProseMirror h3 { margin: 1.5rem 0 0.5rem 0; line-height: 1.2; font-weight: bold; }
    .tiptap-editor .ProseMirror blockquote { border-right: 3px solid ${
      theme.palette.divider
    }; margin-right: 1rem; padding-right: 1rem; font-style: italic; }
    
    /* Global Table Styles - Applied to both editor and saved content */
    table { 
      width: 100%; 
      border-collapse: collapse; 
      margin: 1rem 0; 
      table-layout: auto; 
      border: 2px solid ${theme.palette.divider} !important; 
      background-color: ${theme.palette.background.paper};
    }
    th, td { 
      border: 1px solid ${theme.palette.divider} !important; 
      padding: 8px; 
      min-width: 50px; 
      vertical-align: top; 
      background-color: ${theme.palette.background.paper};
    }
    th { 
      font-weight: bold; 
      background-color: ${alpha(theme.palette.primary.main, 0.1)} !important; 
      text-align: right; 
      position: relative;
    }
    
    /* Editor-specific table styles */
    .tiptap-editor .ProseMirror table { 
      width: 100%; 
      border-collapse: collapse; 
      margin: 1rem 0; 
      table-layout: auto; 
      border: 2px solid ${theme.palette.divider} !important; 
      background-color: ${theme.palette.background.paper};
    }
    .tiptap-editor .ProseMirror th, .tiptap-editor .ProseMirror td { 
      border: 1px solid ${theme.palette.divider} !important; 
      padding: 8px; 
      min-width: 50px; 
      vertical-align: top; 
      background-color: ${theme.palette.background.paper};
    }
    .tiptap-editor .ProseMirror th { 
      font-weight: bold; 
      background-color: ${alpha(theme.palette.primary.main, 0.1)} !important; 
      text-align: right; 
      position: relative;
    }
    .tiptap-editor .ProseMirror .selectedCell:after { 
      z-index: 2; 
      position: absolute; 
      content: ""; 
      left: 0; 
      right: 0; 
      top: 0; 
      bottom: 0; 
      background: ${alpha(theme.palette.primary.main, 0.2)}; 
      pointer-events: none; 
    }
    
    /* Text Alignment */
    [style*="text-align: left"] { text-align: left; }
    [style*="text-align: center"] { text-align: center; }
    [style*="text-align: right"] { text-align: right; }
    
    /* Font Size Styles */
    [style*="font-size: 12px"] { font-size: 12px; }
    [style*="font-size: 14px"] { font-size: 14px; }
    [style*="font-size: 16px"] { font-size: 16px; }
    [style*="font-size: 18px"] { font-size: 18px; }
    [style*="font-size: 20px"] { font-size: 20px; }
    [style*="font-size: 24px"] { font-size: 24px; }
    [style*="font-size: 28px"] { font-size: 28px; }
    [style*="font-size: 32px"] { font-size: 32px; }
  `;

  // Update styles when theme changes
  useEffect(() => {
    const styleId = 'tiptap-global-styles';
    let styleSheet = document.getElementById(styleId) as HTMLStyleElement;

    if (!styleSheet) {
      styleSheet = document.createElement('style');
      styleSheet.id = styleId;
      document.head.appendChild(styleSheet);
    }

    styleSheet.innerText = createGlobalStyles(theme);
  }, [theme]);

  // Add table resizing functionality
  useEffect(() => {
    if (!editor) return;

    const addResizeHandles = () => {
      const tables = editor.view.dom.querySelectorAll('table');
      tables.forEach((table: HTMLTableElement) => {
        // Remove existing resize handles
        const existingHandles = table.querySelectorAll('.resize-handle');
        existingHandles.forEach((handle) => handle.remove());

        // Add resize handles to table headers
        const headers = table.querySelectorAll('th');
        headers.forEach((header: HTMLTableCellElement) => {
          const handle = document.createElement('div');
          handle.className = 'resize-handle';
          handle.style.cssText = `
            position: absolute;
            top: 0;
            right: -3px;
            width: 6px;
            height: 100%;
            background: ${theme.palette.primary.main};
            cursor: col-resize;
            opacity: 0;
            transition: opacity 0.2s;
            z-index: 10;
          `;

          header.style.position = 'relative';
          header.appendChild(handle);

          // Show handle on hover
          header.addEventListener('mouseenter', () => {
            handle.style.opacity = '0.7';
          });
          header.addEventListener('mouseleave', () => {
            handle.style.opacity = '0';
          });

          // Add resize functionality
          let isResizing = false;
          let startX = 0;
          let startWidth = 0;

          const startResize = (e: MouseEvent) => {
            isResizing = true;
            startX = e.clientX;
            startWidth = header.offsetWidth;
            document.body.style.cursor = 'col-resize';
            document.body.style.userSelect = 'none';
            e.preventDefault();
          };

          const doResize = (e: MouseEvent) => {
            if (!isResizing) return;
            const deltaX = e.clientX - startX;
            const newWidth = Math.max(50, startWidth + deltaX);
            header.style.width = `${newWidth}px`;
            header.style.minWidth = `${newWidth}px`;
          };

          const stopResize = () => {
            if (!isResizing) return;
            isResizing = false;
            document.body.style.cursor = '';
            document.body.style.userSelect = '';
          };

          handle.addEventListener('mousedown', startResize);
          document.addEventListener('mousemove', doResize);
          document.addEventListener('mouseup', stopResize);
        });
      });
    };

    // Add resize handles when editor updates
    const updateHandler = () => {
      setTimeout(addResizeHandles, 100);
    };

    editor.on('update', updateHandler);
    editor.on('selectionUpdate', updateHandler);

    // Initial setup
    setTimeout(addResizeHandles, 500);

    return () => {
      editor.off('update', updateHandler);
      editor.off('selectionUpdate', updateHandler);
    };
  }, [editor, theme]);

  return (
    <Paper
      key={key}
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
      <ToolbarPlugin editor={editor} />
      <EditorContent
        editor={editor}
        style={{ minHeight: '200px', padding: '16px', direction: 'rtl' }}
      />
    </Paper>
  );
};

export default RichTextEditor;
