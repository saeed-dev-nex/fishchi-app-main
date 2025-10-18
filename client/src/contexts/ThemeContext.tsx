import { createContext, useContext, useMemo, useState, useEffect } from 'react';
import { ThemeProvider as MuiThemeProvider, CssBaseline } from '@mui/material';
import { getTheme } from '../theme';
import { useSelector, useDispatch } from 'react-redux';
import type { RootState, AppDispatch } from '../store';
import {
  updateSettingsSection,
  updateThemeLocally,
} from '../store/features/settingsSlice';

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

  const [mode, setMode] = useState<'light' | 'dark'>(() => {
    // Try to get theme from localStorage first
    const savedTheme = localStorage.getItem('user-theme');
    if (savedTheme && (savedTheme === 'light' || savedTheme === 'dark')) {
      return savedTheme;
    }

    // Initialize with system preference if no settings loaded yet
    if (!settings) {
      const systemTheme = window.matchMedia('(prefers-color-scheme: dark)')
        .matches
        ? 'dark'
        : 'light';
      // Save system preference to localStorage
      localStorage.setItem('user-theme', systemTheme);
      return systemTheme;
    }
    return getActualMode();
  });

  // Update mode when theme setting changes
  useEffect(() => {
    const newMode = getActualMode();
    setMode(newMode);
    // Save to localStorage for faster loading next time
    localStorage.setItem('user-theme', newMode);
  }, [themeSetting, settings]);

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

        // Update theme locally first for instant feedback
        dispatch(updateThemeLocally({ theme: newMode }));

        // Try to update server settings
        dispatch(
          updateSettingsSection({
            section: 'general',
            data: { theme: newMode },
          })
        ).catch((error) => {
          console.warn('Failed to update theme on server:', error);
          // Theme is already saved locally, so user experience is not affected
        });
      },
      setTheme: (theme: 'light' | 'dark' | 'auto') => {
        // Update theme locally first for instant feedback
        dispatch(updateThemeLocally({ theme }));

        // Try to update server settings
        dispatch(
          updateSettingsSection({
            section: 'general',
            data: { theme },
          })
        ).catch((error) => {
          console.warn('Failed to update theme on server:', error);
          // Theme is already saved locally, so user experience is not affected
        });
      },
      mode,
      themeSetting,
    }),
    [mode, themeSetting, dispatch, settings]
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
