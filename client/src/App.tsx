import { BrowserRouter, Routes, Route } from 'react-router-dom';
import PublicLayout from './layouts/Public.Layout';
import LandingPage from './pages/public/LandingPage';
import AppLayout from './layouts/App.layout';
import DashboardPage from './pages/app/DashboardPage';
import ProtectedRoute from './components/ProtectedRoute';
import LoginPage from './pages/public/LoginPage';
import RegisterPage from './pages/public/RegisterPage';
import VerificationEmail from './pages/public/VerifyEmailPage';
import ProjectsPage from './pages/app/ProjectsPage';
import { useDispatch } from 'react-redux';
import type { AppDispatch } from './store';
import { checkUserStatus } from './store/features/authSlice';
import { useEffect } from 'react';
import ProjectDetailPage from './pages/app/ProjectDetailPage';

function App() {
  const dispatch = useDispatch<AppDispatch>();
  useEffect(() => {
    dispatch(checkUserStatus());
  }, [dispatch]);
  return (
    <BrowserRouter>
      <Routes>
        <Route path='/' element={<PublicLayout />}>
          <Route index element={<LandingPage />} />
          <Route path='login' element={<LoginPage />} />
          <Route path='register' element={<RegisterPage />} />
          <Route path='verify-email' element={<VerificationEmail />} />
        </Route>
        <Route element={<ProtectedRoute />}>
          <Route path='/app' element={<AppLayout />}>
            <Route index element={<DashboardPage />} />
            <Route path='projects' element={<ProjectsPage />} />
            <Route path="projects/:id" element={<ProjectDetailPage />} />
          </Route>
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;
