import { Outlet, useLocation } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import Header from './Header';
import LearningPathOverlay from '../common/LearningPathOverlay';
import { useAuth } from '../../context/AuthContext';

const pageVariants = {
  initial:  { opacity: 0, y: 10 },
  animate:  { opacity: 1, y: 0  },
  exit:     { opacity: 0, y: -8 },
};

const pageTransition = {
  type: 'tween',
  ease: [0.16, 1, 0.3, 1],
  duration: 0.28,
};

export default function Layout() {
  const { user }   = useAuth();
  const location   = useLocation();
  const isLanding  = !user && location.pathname === '/';

  return (
    <div className="layout">
      <Header />
      <main className={`layout__main ${isLanding ? 'layout__main--landing' : ''}`}>
        <AnimatePresence mode="wait" initial={false}>
          <motion.div
            key={location.pathname}
            variants={pageVariants}
            initial="initial"
            animate="animate"
            exit="exit"
            transition={pageTransition as any}
            style={{ minHeight: '100%' }}
          >
            <Outlet />
          </motion.div>
        </AnimatePresence>
      </main>
      <LearningPathOverlay />
    </div>
  );
}
