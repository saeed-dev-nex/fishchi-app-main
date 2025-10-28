import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import PublicLayout from './layouts/Public.Layout';
import LandingPage from './pages/public/LandingPage';
import AppLayout from './layouts/App.layout';
import DashboardPage from './pages/app/DashboardPage';
import ProtectedRoute from './components/ProtectedRoute';
import LoginPage from './pages/public/LoginPage';
import RegisterPage from './pages/public/RegisterPage';
import VerificationEmail from './pages/public/VerifyEmailPage';
import ForgotPasswordPage from './pages/public/ForgotPasswordPage';
import ResetPasswordPage from './pages/public/ResetPasswordPage';
import ProjectsPage from './pages/app/ProjectsPage';
import { useDispatch } from 'react-redux';
import type { AppDispatch } from './store';
import { checkUserStatus } from './store/features/authSlice';
import { useEffect } from 'react';
import ProjectDetailPage from './pages/app/ProjectDetailPage.tsx';
import SourcesLibraryPage from './pages/app/SourcesLibraryPage';
import SourceDetailPage from './pages/app/SourceDetailPage.tsx';
import ProfilePage from './pages/app/ProfilePage';
import SettingsPage from './pages/app/SettingsPage';
import SearchPage from './pages/app/SearchPage';
import NotificationProvider from './components/common/NotificationProvider';
import { LanguageProvider } from './contexts/LanguageContext';
import { ViewProvider } from './contexts/ViewContext';
import { NotificationProvider as NotificationContextProvider } from './contexts/NotificationContext';
import { ExportProvider } from './contexts/ExportContext';
import { PrivacyProvider } from './contexts/PrivacyContext';

function App() {
  const dispatch = useDispatch<AppDispatch>();

  useEffect(() => {
    dispatch(checkUserStatus());
  }, [dispatch]);

  return (
    <>
      <LanguageProvider>
        <ViewProvider>
          <NotificationContextProvider>
            <ExportProvider>
              <PrivacyProvider>
                <NotificationProvider />
                <BrowserRouter>
                  <Routes>
                    <Route path='/' element={<PublicLayout />}>
                      <Route index element={<LandingPage />} />
                      <Route path='login' element={<LoginPage />} />
                      <Route path='register' element={<RegisterPage />} />
                      <Route
                        path="verify-email"
                        element={<VerificationEmail />}
                      />
                      <Route
                        path="forgot-password"
                        element={<ForgotPasswordPage />}
                      />
                      <Route
                        path="reset-password"
                        element={<ResetPasswordPage />}
                      />
                    </Route>
                    <Route element={<ProtectedRoute />}>
                      <Route path='/app' element={<AppLayout />}>
                        <Route index element={<DashboardPage />} />
                        <Route
                          path='dashboard'
                          element={<Navigate to='/app' replace />}
                        />
                        <Route path='projects' element={<ProjectsPage />} />
                        <Route
                          path="projects/:id"
                          element={<ProjectDetailPage />}
                        />
                        <Route
                          path="library"
                          element={<SourcesLibraryPage />}
                        />
                        <Route
                          path="library/:id"
                          element={<SourceDetailPage />}
                        />
                        <Route path='profile' element={<ProfilePage />} />
                        <Route path='settings' element={<SettingsPage />} />
                        <Route path='search' element={<SearchPage />} />
                      </Route>
                    </Route>
                    {/* Catch all route - redirect to home */}
                    <Route path='*' element={<Navigate to='/' replace />} />
                  </Routes>
                </BrowserRouter>
              </PrivacyProvider>
            </ExportProvider>
          </NotificationContextProvider>
        </ViewProvider>
      </LanguageProvider>
    </>
  );
}

export default App;
