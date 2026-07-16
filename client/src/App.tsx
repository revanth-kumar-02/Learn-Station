import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { PathSelectionProvider } from './context/PathSelectionContext';
import Layout from './components/layout/Layout';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import HomePage from './pages/HomePage';
import TracksPage from './pages/TracksPage';
import TrackDetailPage from './pages/TrackDetailPage';
import LessonPage from './pages/LessonPage';
import ProfilePage from './pages/ProfilePage';
import LandingPage from './pages/LandingPage';
import GenerateTrackPage from './pages/GenerateTrackPage';
import AiWorkspacePage from './pages/AiWorkspacePage';
import LeaderboardPage from './pages/LeaderboardPage';
import AnalyticsPage from './pages/AnalyticsPage';
import PublicPortfolioPage from './pages/PublicPortfolioPage';
import CertificatePage from './pages/CertificatePage';
import PracticePage from './pages/PracticePage';
import Loader from './components/common/Loader';
import NotificationsPage from './pages/NotificationsPage';
import SettingsPage from './pages/SettingsPage';
import { AnimatePresence } from 'framer-motion';
import AdminControlCenter from './pages/AdminControlCenter';
import AdminLoginPage from './pages/AdminLoginPage';
import UnauthorizedPage from './pages/UnauthorizedPage';
import RewardsPage from './pages/RewardsPage';
import AiMentorPage from './pages/AiMentorPage';
import CommunityPage from './pages/CommunityPage';


// Separate route wrapper to handle conditional landing page / home page rendering
function RootRoute() {
  const { user, loading } = useAuth();

  if (loading) {
    return <Loader fullPage />;
  }

  return user ? <HomePage /> : <LandingPage />;
}

// Protected route wrapper
function ProtectedRoute({ children }) {
  const { user, loading } = useAuth();

  if (loading) {
    return <Loader fullPage />;
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  return children;
}

// Redirect authenticated users away from auth pages
function PublicRoute({ children }) {
  const { user, loading } = useAuth();

  if (loading) {
    return <Loader fullPage />;
  }

  if (user) {
    return <Navigate to="/" replace />;
  }

  return children;
}

// Admin Protected route wrapper
function AdminProtectedRoute({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();

  if (loading) {
    return <Loader fullPage />;
  }

  if (!user) {
    return <Navigate to="/admin/login" replace />;
  }

  if (user.role !== 'owner' || user.email !== 'imposterz.rev02@gmail.com') {
    return <Navigate to="/unauthorized" replace />;
  }

  return children;
}

function AnimatedRoutes() {
  const location = useLocation();

  return (
    <AnimatePresence mode="wait">
      <Routes location={location} key={location.pathname}>
        <Route
          path="/admin/login"
          element={<AdminLoginPage />}
        />
        <Route
          path="/unauthorized"
          element={<UnauthorizedPage />}
        />
        <Route
          path="/admin/*"
          element={
            <AdminProtectedRoute>
              <AdminControlCenter />
            </AdminProtectedRoute>
          }
        />
        <Route element={<Layout />}>
          <Route path="/" element={<RootRoute />} />
          <Route
            path="/tracks"
            element={
              <ProtectedRoute>
                <TracksPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/practice"
            element={
              <ProtectedRoute>
                <PracticePage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/track/:slug"
            element={
              <ProtectedRoute>
                <TrackDetailPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/generate"
            element={
              <ProtectedRoute>
                <GenerateTrackPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/ai-workspace/:slug"
            element={
              <ProtectedRoute>
                <AiWorkspacePage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/lesson/:slug"
            element={
              <ProtectedRoute>
                <LessonPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/profile"
            element={
              <ProtectedRoute>
                <ProfilePage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/notifications"
            element={
              <ProtectedRoute>
                <NotificationsPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/settings"
            element={
              <ProtectedRoute>
                <SettingsPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/login"
            element={
              <PublicRoute>
                <LoginPage />
              </PublicRoute>
            }
          />
          <Route
            path="/register"
            element={
              <PublicRoute>
                <RegisterPage />
              </PublicRoute>
            }
          />
          <Route
            path="/leaderboard"
            element={
              <ProtectedRoute>
                <LeaderboardPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/analytics"
            element={
              <ProtectedRoute>
                <AnalyticsPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/rewards"
            element={
              <ProtectedRoute>
                <RewardsPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/ai-mentor"
            element={
              <ProtectedRoute>
                <AiMentorPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/community"
            element={
              <ProtectedRoute>
                <CommunityPage />
              </ProtectedRoute>
            }
          />
          {/* Public routes — no auth required */}
          <Route path="/u/:username" element={<PublicPortfolioPage />} />
          <Route path="/certificate/:certId" element={<CertificatePage />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Route>
      </Routes>
    </AnimatePresence>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <PathSelectionProvider>
        <BrowserRouter>
          <AnimatedRoutes />
        </BrowserRouter>
      </PathSelectionProvider>
    </AuthProvider>
  );
}
