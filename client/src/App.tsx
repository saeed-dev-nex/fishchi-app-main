import {
  BrowserRouter,
  Routes,
  Route,
  Navigate,
  useLocation,
} from "react-router-dom";
import PublicLayout from "./layouts/Public.Layout";
import LandingPage from "./pages/public/LandingPage";
import AppLayout from "./layouts/App.layout";
import DashboardPage from "./pages/app/DashboardPage";
import ProtectedRoute from "./components/ProtectedRoute";
import LoginPage from "./pages/public/LoginPage";
import RegisterPage from "./pages/public/RegisterPage";
import VerificationEmail from "./pages/public/VerifyEmailPage";
import ForgotPasswordPage from "./pages/public/ForgotPasswordPage";
import ResetPasswordPage from "./pages/public/ResetPasswordPage";
import ProjectsPage from "./pages/app/ProjectsPage";
import { useDispatch, useSelector } from "react-redux";
import type { AppDispatch, RootState } from "./store";
import { checkUserStatus } from "./store/features/authSlice";
import { useEffect } from "react";
import ProjectDetailPage from "./pages/app/ProjectDetailPage.tsx";
import SourcesLibraryPage from "./pages/app/SourcesLibraryPage";
import SourceDetailPage from "./pages/app/SourceDetailPage.tsx";
import ProfilePage from "./pages/app/ProfilePage";
import SettingsPage from "./pages/app/SettingsPage";
import SearchPage from "./pages/app/SearchPage";
import NotificationProvider from "./components/common/NotificationProvider";
import { LanguageProvider } from "./contexts/LanguageContext";
import { ViewProvider } from "./contexts/ViewContext";
import { NotificationProvider as NotificationContextProvider } from "./contexts/NotificationContext";
import { ExportProvider } from "./contexts/ExportContext";
import { PrivacyProvider } from "./contexts/PrivacyContext";

function App() {
  const dispatch = useDispatch<AppDispatch>();

  useEffect(() => {
    // Check user status on app load only once
    dispatch(checkUserStatus());
  }, [dispatch]);
  const OfficeAuthHandler: React.FC = () => {
    const location = useLocation();
    // دسترسی به اطلاعات کاربر و توکن از Redux store
    const { userInfo, token } = useSelector((state: RootState) => state.auth); //

    useEffect(() => {
      const params = new URLSearchParams(location.search);
      const authOrigin = params.get("auth_origin");

      // آیا کاربر لاگین کرده؟ و آیا از Word آمده؟
      if (authOrigin === "word" && userInfo && token) {
        console.log(
          "Office Add-in login detected. Sending message to parent..."
        );

        // 1. مطمئن شوید Office آماده است
        Office.onReady(() => {
          // 2. مطمئن شوید که در یک دیالوگ هستیم
          if (Office.context.ui.messageParent) {
            // 3. همان پیامی که افزونه انتظار دارد را بسازید
            const responsePayload = {
              status: "success",
              data: { user: userInfo, token },
            };

            Office.context.ui.messageParent(JSON.stringify(responsePayload));
            // (دیالوگ به طور خودکار توسط افزونه بسته خواهد شد)
          } else {
            console.error("Office.context.ui.messageParent is not available.");
          }
        });
      }
    }, [location.search, userInfo, token]); // هر بار که URL یا وضعیت لاگین تغییر کرد، چک کن

    return null; // این کامپوننت چیزی رندر نمی‌کند
  };

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
                    <Route path="/" element={<PublicLayout />}>
                      <Route index element={<LandingPage />} />
                      <Route path="login" element={<LoginPage />} />
                      <Route path="register" element={<RegisterPage />} />
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
                      <Route path="/app" element={<AppLayout />}>
                        <Route index element={<DashboardPage />} />
                        <Route
                          path="dashboard"
                          element={<Navigate to="/app" replace />}
                        />
                        <Route path="projects" element={<ProjectsPage />} />
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
                        <Route path="profile" element={<ProfilePage />} />
                        <Route path="settings" element={<SettingsPage />} />
                        <Route path="search" element={<SearchPage />} />
                      </Route>
                    </Route>
                    {/* Catch all route - redirect to home */}
                    <Route path="*" element={<Navigate to="/" replace />} />
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
