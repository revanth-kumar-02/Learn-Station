import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import Layout from './components/layout/Layout';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import HomePage from './pages/HomePage';
import TrackDetailPage from './pages/TrackDetailPage';
import LessonPage from './pages/LessonPage';
import ProfilePage from './pages/ProfilePage';
import LandingPage from './pages/LandingPage';
import GenerateTrackPage from './pages/GenerateTrackPage';
import AiWorkspacePage from './pages/AiWorkspacePage';
import Loader from './components/common/Loader';
import { AnimatePresence } from 'framer-motion';


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

function AnimatedRoutes() {
  const location = useLocation();

  return (
    <AnimatePresence mode="wait">
      <Routes location={location} key={location.pathname}>
        <Route element={<Layout />}>
          <Route path="/" element={<RootRoute />} />
          <Route
            path="/tracks"
            element={
              <ProtectedRoute>
                <HomePage />
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
          <Route path="*" element={<Navigate to="/" replace />} />
        </Route>
      </Routes>
    </AnimatePresence>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <AnimatedRoutes />
      </BrowserRouter>
    </AuthProvider>
  );
}
