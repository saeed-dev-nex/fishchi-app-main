import React from 'react';
import { Editor } from '@tiptap/react';
import {
  Box,
  ToggleButton,
  ToggleButtonGroup,
  Divider,
  Select,
  MenuItem,
  FormControl,
  Tooltip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  alpha,
  useTheme,
} from '@mui/material';
import {
  FormatBold,
  FormatItalic,
  FormatUnderlined,
  FormatListBulleted,
  FormatListNumbered,
  FormatQuote,
  TableChart as TableIcon,
  HorizontalRule,
  FormatAlignLeft,
  FormatAlignCenter,
  FormatAlignRight,
} from '@mui/icons-material';

type ToolbarProps = {
  editor: Editor | null;
};

const ToolbarPlugin: React.FC<ToolbarProps> = ({ editor }) => {
  const theme = useTheme();
  const [tableDialogOpen, setTableDialogOpen] = React.useState(false);
  const [rows, setRows] = React.useState(3);
  const [cols, setCols] = React.useState(3);

  if (!editor) {
    return null;
  }

  const handleInsertTable = () => {
    editor
      .chain()
      .focus()
      .insertTable({ rows, cols, withHeaderRow: true })
      .run();

    // Apply inline styles immediately after table insertion
    setTimeout(() => {
      const tables = editor.view.dom.querySelectorAll('table');
      const latestTable = tables[tables.length - 1] as HTMLTableElement;

      if (latestTable) {
        latestTable.style.border = `2px solid ${theme.palette.divider}`;
        latestTable.style.borderCollapse = 'collapse';
        latestTable.style.width = '100%';
        latestTable.style.margin = '1rem 0';
        latestTable.style.tableLayout = 'auto';

        const cells = latestTable.querySelectorAll('th, td');
        cells.forEach((cell) => {
          const htmlCell = cell as HTMLTableCellElement;
          htmlCell.style.border = `1px solid ${theme.palette.divider}`;
          htmlCell.style.padding = '8px';
          htmlCell.style.minWidth = '50px';
          htmlCell.style.verticalAlign = 'top';
          htmlCell.style.backgroundColor = theme.palette.background.paper;
        });

        const headers = latestTable.querySelectorAll('th');
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
    }, 50);

    setTableDialogOpen(false);
  };

  return (
    <Box
      sx={{
        display: 'flex',
        flexWrap: 'wrap',
        gap: 1,
        p: 1,
        borderBottom: 1,
        borderColor: 'divider',
      }}
    >
      {/* --- Text Styles --- */}
      <ToggleButtonGroup size='small' exclusive>
        <Tooltip title='بولد'>
          <ToggleButton
            value='bold'
            selected={editor.isActive('bold')}
            onClick={() => editor.chain().focus().toggleBold().run()}
          >
            <FormatBold />
          </ToggleButton>
        </Tooltip>
        <Tooltip title='ایتالیک'>
          <ToggleButton
            value='italic'
            selected={editor.isActive('italic')}
            onClick={() => editor.chain().focus().toggleItalic().run()}
          >
            <FormatItalic />
          </ToggleButton>
        </Tooltip>
        <Tooltip title='زیرخط'>
          <ToggleButton
            value='underline'
            selected={editor.isActive('underline')}
            onClick={() => editor.chain().focus().toggleUnderline().run()}
          >
            <FormatUnderlined />
          </ToggleButton>
        </Tooltip>
      </ToggleButtonGroup>
      <Divider orientation='vertical' flexItem />

      {/* --- Headings --- */}
      <FormControl size='small' sx={{ minWidth: 110 }}>
        <Select
          value={
            editor.isActive('heading', { level: 1 })
              ? 1
              : editor.isActive('heading', { level: 2 })
              ? 2
              : editor.isActive('heading', { level: 3 })
              ? 3
              : 0
          }
          onChange={(e) => {
            const level = e.target.value as number;
            if (level === 0) {
              editor.chain().focus().setParagraph().run();
            } else {
              editor
                .chain()
                .focus()
                .toggleHeading({ level: level as 1 | 2 | 3 })
                .run();
            }
          }}
          displayEmpty
          sx={{ '.MuiSelect-select': { p: '5px 10px' } }}
        >
          <MenuItem value={0}>متن عادی</MenuItem>
          <MenuItem value={1}>تیتر ۱</MenuItem>
          <MenuItem value={2}>تیتر ۲</MenuItem>
          <MenuItem value={3}>تیتر ۳</MenuItem>
        </Select>
      </FormControl>
      <Divider orientation='vertical' flexItem />

      {/* --- Font Family --- */}
      <FormControl size='small' sx={{ minWidth: 120 }}>
        <Select
          value={editor.getAttributes('textStyle').fontFamily || 'Vazirmatn'}
          onChange={(e) =>
            editor
              .chain()
              .focus()
              .setFontFamily(e.target.value as string)
              .run()
          }
          sx={{ '.MuiSelect-select': { p: '5px 10px' } }}
        >
          <MenuItem value='Vazirmatn' sx={{ fontFamily: 'Vazirmatn' }}>
            وزیرمتن
          </MenuItem>
          <MenuItem value='Arial' sx={{ fontFamily: 'Arial' }}>
            Arial
          </MenuItem>
          <MenuItem value='Georgia' sx={{ fontFamily: 'Georgia' }}>
            Georgia
          </MenuItem>
        </Select>
      </FormControl>
      <Divider orientation='vertical' flexItem />

      {/* --- Font Size --- */}
      <FormControl size='small' sx={{ minWidth: 100 }}>
        <Select
          value={editor.getAttributes('textStyle').fontSize || '14px'}
          onChange={(e) =>
            editor
              .chain()
              .focus()
              .setFontSize(e.target.value as string)
              .run()
          }
          sx={{ '.MuiSelect-select': { p: '5px 10px' } }}
        >
          <MenuItem value='12px'>۱۲px</MenuItem>
          <MenuItem value='14px'>۱۴px</MenuItem>
          <MenuItem value='16px'>۱۶px</MenuItem>
          <MenuItem value='18px'>۱۸px</MenuItem>
          <MenuItem value='20px'>۲۰px</MenuItem>
          <MenuItem value='24px'>۲۴px</MenuItem>
          <MenuItem value='28px'>۲۸px</MenuItem>
          <MenuItem value='32px'>۳۲px</MenuItem>
        </Select>
      </FormControl>
      <Divider orientation='vertical' flexItem />

      {/* --- Text Alignment --- */}
      <ToggleButtonGroup size='small' exclusive>
        <Tooltip title='چپ چین'>
          <ToggleButton
            value='left'
            selected={editor.isActive({ textAlign: 'left' })}
            onClick={() => editor.chain().focus().setTextAlign('left').run()}
          >
            <FormatAlignLeft />
          </ToggleButton>
        </Tooltip>
        <Tooltip title='وسط چین'>
          <ToggleButton
            value='center'
            selected={editor.isActive({ textAlign: 'center' })}
            onClick={() => editor.chain().focus().setTextAlign('center').run()}
          >
            <FormatAlignCenter />
          </ToggleButton>
        </Tooltip>
        <Tooltip title='راست چین'>
          <ToggleButton
            value='right'
            selected={editor.isActive({ textAlign: 'right' })}
            onClick={() => editor.chain().focus().setTextAlign('right').run()}
          >
            <FormatAlignRight />
          </ToggleButton>
        </Tooltip>
      </ToggleButtonGroup>
      <Divider orientation='vertical' flexItem />

      {/* --- Lists & Shapes --- */}
      <ToggleButtonGroup size='small' exclusive>
        <Tooltip title='لیست نقطه‌ای'>
          <ToggleButton
            value='bulletList'
            selected={editor.isActive('bulletList')}
            onClick={() => editor.chain().focus().toggleBulletList().run()}
          >
            <FormatListBulleted />
          </ToggleButton>
        </Tooltip>
        <Tooltip title='لیست عددی'>
          <ToggleButton
            value='orderedList'
            selected={editor.isActive('orderedList')}
            onClick={() => editor.chain().focus().toggleOrderedList().run()}
          >
            <FormatListNumbered />
          </ToggleButton>
        </Tooltip>
        <Tooltip title='نقل قول (شکل)'>
          <ToggleButton
            value='blockquote'
            selected={editor.isActive('blockquote')}
            onClick={() => editor.chain().focus().toggleBlockquote().run()}
          >
            <FormatQuote />
          </ToggleButton>
        </Tooltip>
        <Tooltip title='خط افقی (شکل)'>
          <ToggleButton
            value='horizontalRule'
            onClick={() => editor.chain().focus().setHorizontalRule().run()}
          >
            <HorizontalRule />
          </ToggleButton>
        </Tooltip>
      </ToggleButtonGroup>
      <Divider orientation='vertical' flexItem />

      {/* --- Table --- */}
      <ToggleButtonGroup size='small' exclusive>
        <Tooltip title='درج جدول'>
          <ToggleButton value='table' onClick={() => setTableDialogOpen(true)}>
            <TableIcon />
          </ToggleButton>
        </Tooltip>
      </ToggleButtonGroup>

      {/* Table Dialog */}
      <Dialog open={tableDialogOpen} onClose={() => setTableDialogOpen(false)}>
        <DialogTitle>درج جدول</DialogTitle>
        <DialogContent>
          <Box sx={{ display: 'flex', gap: 2, mt: 1 }}>
            <TextField
              label='تعداد سطرها'
              type='number'
              value={rows}
              onChange={(e) => setRows(parseInt(e.target.value) || 1)}
              inputProps={{ min: 1, max: 20 }}
              fullWidth
            />
            <TextField
              label='تعداد ستون‌ها'
              type='number'
              value={cols}
              onChange={(e) => setCols(parseInt(e.target.value) || 1)}
              inputProps={{ min: 1, max: 20 }}
              fullWidth
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setTableDialogOpen(false)}>انصراف</Button>
          <Button onClick={handleInsertTable} variant='contained'>
            درج جدول
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default ToolbarPlugin;
