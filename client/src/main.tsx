import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import createCache from '@emotion/cache';
import './index.css';
import { AppThemeProvider } from './contexts/ThemeContext.tsx';
import App from './App.tsx';
import { CacheProvider } from '@emotion/react';
import rtlPlugin from '@mui/stylis-plugin-rtl';

import '@fontsource/vazirmatn/400.css';
import '@fontsource/vazirmatn/500.css';
import '@fontsource/vazirmatn/700.css';
import '@fontsource/vazirmatn/900.css';

const rtlCache = createCache({
  key: 'muirtl',
  stylisPlugins: [rtlPlugin],
});
createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <CacheProvider value={rtlCache}>
      <AppThemeProvider>
        <App />
      </AppThemeProvider>
    </CacheProvider>
  </StrictMode>
);
