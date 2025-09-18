import { BrowserRouter, Routes, Route } from 'react-router-dom';
import PublicLayout from './layouts/Public.Layout';
import LandingPage from './pages/public/LandingPage';
import AppLayout from './layouts/App.layout';
import DashboardPage from './pages/app/DashboardPage';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path='/' element={<PublicLayout />}>
          <Route index element={<LandingPage />} />
          <Route path='login' element={<div>صفحه ورود</div>} />
          <Route path='register' element={<div>صفحه ثبت نام</div>} />
          <Route path='verify-email' element={<div>صفحه تایید ایمیل</div>} />
        </Route>
        <Route path='/app' element={<AppLayout />}>
          <Route index element={<DashboardPage />} />
          <Route path='projects' element={<div>صفحه پروژه‌ها</div>} />
          <Route path='projects/:id' element={<div>صفحه جزئیات پروژه</div>} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;
