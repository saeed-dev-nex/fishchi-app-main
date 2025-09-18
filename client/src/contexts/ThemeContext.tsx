import { createContext, useContext, useMemo, useState } from 'react';
import { ThemeProvider as MuiThemeProvider, CssBaseline } from '@mui/material';
// import CssBaseline from '@mui/material/CssBaseline';
import { getTheme } from '../theme';

interface IThemeContext {
  toggleTheme: () => void;
  mode: 'light' | 'dark';
}

const ThemeContext = createContext<IThemeContext | undefined>(undefined);

export const AppThemeProvider = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  const [mode, setMode] = useState<'light' | 'dark'>(
    () => (localStorage.getItem('themeMode') as 'light' | 'dark') || 'light'
  );
  const themeAPI = useMemo(
    () => ({
      toggleTheme: () => {
        setMode((prevMode) => {
          const newMode = prevMode === 'light' ? 'dark' : 'light';
          localStorage.setItem('themeMode', newMode);
          return newMode;
        });
      },
      mode,
    }),
    [mode]
  );
  const theme = useMemo(() => getTheme(mode), [mode]);
  return (
    <ThemeContext.Provider value={themeAPI}>
      <MuiThemeProvider theme={theme}>
        <CssBaseline />
        {children}
      </MuiThemeProvider>
    </ThemeContext.Provider>
  );
};

export const useAppTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error(
      'useAppTheme must be used within an AppThemeContextProvider'
    );
  }
  return context;
};
