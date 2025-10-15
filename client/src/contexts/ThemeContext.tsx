import { createContext, useContext, useMemo, useState, useEffect } from 'react';
import { ThemeProvider as MuiThemeProvider, CssBaseline } from '@mui/material';
import { getTheme } from '../theme';
import { useSelector, useDispatch } from 'react-redux';
import type { RootState, AppDispatch } from '../store';
import { updateSettingsSection } from '../store/features/settingsSlice';

interface IThemeContext {
  toggleTheme: () => void;
  setTheme: (theme: 'light' | 'dark' | 'auto') => void;
  mode: 'light' | 'dark';
  themeSetting: 'light' | 'dark' | 'auto';
}

const ThemeContext = createContext<IThemeContext | undefined>(undefined);

export const AppThemeProvider = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  const dispatch = useDispatch<AppDispatch>();
  const { settings } = useSelector((state: RootState) => state.settings);

  // Get theme setting from user settings or default to 'light'
  const themeSetting = settings?.general?.theme || 'light';

  // Determine actual mode based on theme setting
  const getActualMode = (): 'light' | 'dark' => {
    if (themeSetting === 'auto') {
      // Check system preference
      return window.matchMedia('(prefers-color-scheme: dark)').matches
        ? 'dark'
        : 'light';
    }
    return themeSetting as 'light' | 'dark';
  };

  const [mode, setMode] = useState<'light' | 'dark'>(getActualMode);

  // Update mode when theme setting changes
  useEffect(() => {
    const newMode = getActualMode();
    setMode(newMode);
  }, [themeSetting]);

  // Listen for system theme changes when auto mode is selected
  useEffect(() => {
    if (themeSetting === 'auto') {
      const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
      const handleChange = () => {
        setMode(getActualMode());
      };

      mediaQuery.addEventListener('change', handleChange);
      return () => mediaQuery.removeEventListener('change', handleChange);
    }
  }, [themeSetting]);

  const themeAPI = useMemo(
    () => ({
      toggleTheme: () => {
        const newMode = mode === 'light' ? 'dark' : 'light';
        dispatch(
          updateSettingsSection({
            section: 'general',
            data: { theme: newMode },
          })
        );
      },
      setTheme: (theme: 'light' | 'dark' | 'auto') => {
        dispatch(
          updateSettingsSection({
            section: 'general',
            data: { theme },
          })
        );
      },
      mode,
      themeSetting,
    }),
    [mode, themeSetting, dispatch]
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
