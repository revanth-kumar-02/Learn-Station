import { Outlet, useLocation } from 'react-router-dom';
import Header from './Header';
import LearningPathOverlay from '../common/LearningPathOverlay';
import { useAuth } from '../../context/AuthContext';

export default function Layout() {
  const { user } = useAuth();
  const location = useLocation();
  const isLanding = !user && location.pathname === '/';

  return (
    <div className="layout">
      <Header />
      <main className={`layout__main ${isLanding ? 'layout__main--landing' : ''}`}>
        <Outlet />
      </main>
      <LearningPathOverlay />
    </div>
  );
}
