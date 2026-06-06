import { Outlet } from 'react-router-dom';
import Header from './Header';
import LearningPathOverlay from '../common/LearningPathOverlay';

export default function Layout() {
  return (
    <div className="layout">
      <Header />
      <main className="layout__main">
        <Outlet />
      </main>
      <LearningPathOverlay />
    </div>
  );
}
