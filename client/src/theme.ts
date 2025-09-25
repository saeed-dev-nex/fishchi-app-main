import { alpha, createTheme, type PaletteMode } from '@mui/material/styles';
const baseTheme = {
  typography: {
    fontFamily: '"vazirmatn", Aeial,Tahoma,sans-serif',
    h2: { fontWeight: 800 },
    h3: { fontWeight: 800 },
    h4: { fontWeight: 700 },
    h5: { fontWeight: 700 },
    h6: { fontWeight: 700 },
    button: { fontWeight: 700, fontSize: '1rem' },
  },
};

export const getTheme = (mode: PaletteMode) => {
  return createTheme({
    direction: 'rtl',
    ...baseTheme,
    shape: {
      borderRadius: 4, // Keep as number for arithmetic operations
    },

    components: {
      MuiTextField: {
        styleOverrides: {
          root: {
            '& .MuiFilledInput-root': {
              borderRadius: '12px',
              backgroundColor: alpha('#292e3b', 0.7),
              transition: 'background-color 0.3s ease',
              '&:hover': {
                backgroundColor: alpha('#292e3b', 1),
              },
              '&.Mui-focused': {
                backgroundColor: alpha('#292e3b', 1),
              },
              '&::before, &::after': {
                display: 'none',
              },
            },
            '& .MuiInputLabel-filled.Mui-focused': {
              color: '#6c63ff',
            },
          },
        },
      },
      MuiCard: {
        styleOverrides: {
          root: {
            borderRadius: '16px',
            boxShadow: '0 8px 32px 0 rgba(0,0,0,0.07)',
            transition:
              'transform 0.3s ease-in-out, box-shadow 0.3s ease-in-out',
            '&:hover': {
              transform: 'translateY(-5px)',
              boxShadow: '0 12px 40px 0 rgba(0,0,0,0.1)',
            },
          },
        },
      },
      MuiButton: {
        styleOverrides: {
          root: {
            borderRadius: '12px',
            textTransform: 'none',
            padding: '10px 24px',
          },
        },
      },
    },
    palette: {
      mode,
      ...(mode === 'light'
        ? {
            // --- حالت روشن (بدون تغییر، عالی است) ---
            primary: {
              main: '#3B82F6', // blue-500
              light: '#93C5FD', // blue-300
              dark: '#1D4ED8', // blue-700
              contrastText: '#FFFFFF',
            },
            secondary: {
              main: '#10B981', // emerald-500
              light: '#34D399', // emerald-400
              dark: '#047857', // emerald-700
            },
            accent: {
              main: '#8B5CF6', // violet-500
              light: '#A78BFA', // violet-400
              dark: '#5B21B6', // violet-700
              contrastText: '#FFFFFF',
            },
            warning: {
              main: '#F59E0B', // amber-500
              light: '#FCD34D', // amber-300
              dark: '#B45309', // amber-700
            },
            error: {
              main: '#EF4444', // red-500
              light: '#FCA5A5', // red-300
              dark: '#B91C1C', // red-700
            },
            background: {
              default: '#FFFFFF',
              paper: '#ebebeb', // gray-50
            },
            text: {
              primary: '#111827', // gray-900
              secondary: '#6B7280', // gray-500
              disabled: '#D1D5DB', // gray-300
            },
          }
        : {
            // --- حالت تاریک (مدرن و جذاب) ---
            primary: {
              main: '#3B82F6', // blue-500 (روشن و پر-کنتراست)
              light: '#60A5FA', // blue-400
              dark: '#1E40AF', // blue-800
            },
            secondary: {
              main: '#10B981', // emerald-500 (روشن و پر-کنتراست)
              light: '#34D399', // emerald-400
              dark: '#065F46', // emerald-800
            },
            accent: {
              main: '#8B5CF6', // violet-500 (روشن و پر-کنتراست)
              light: '#A78BFA', // violet-400
              dark: '#6D28D9', // violet-700
            },
            warning: {
              main: '#F59E0B', // amber-500 (روشن و پر-کنتراست)
              light: '#FBBF24', // amber-400
              dark: '#B45309', // amber-700
            },
            error: {
              main: '#EF4444', // red-500 (روشن و پر-کنتراست)
              light: '#F87171', // red-400
              dark: '#B91C1C', // red-700
            },
            background: {
              default: '#111827', // gray-900
              paper: '#1F2937', // gray-800
            },
            text: {
              primary: '#F9FAFB', // gray-50
              secondary: '#D1D5DB', // gray-300
              disabled: '#6B7280', // gray-500
            },
          }),
    },
  });
};
