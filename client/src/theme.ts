import { createTheme, type PaletteMode } from '@mui/material/styles';
const baseTheme = {
  typography: {
    fontFamily: '"vazirmatn", Aeial,Tahoma,sans-serif',
  },
};

export const getTheme = (mode: PaletteMode) => {
  return createTheme({
    direction: 'rtl',
    ...baseTheme,
    palette: {
      mode,
      ...(mode === 'light'
        ? {
            primary: {
              main: '#0052cc',
            },
            secondary: {
              main: '#ED1B24',
            },
            background: {
              default: '#f4f5f7',
              paper: '#fff',
            },
          }
        : {
            primary: {
              main: '#4791db',
            },
            secondary: {
              main: '#ff4842',
            },
            background: {
              default: '#161c24',
              paper: '#212b36',
            },
          }),
    },
  });
};
