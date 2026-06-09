/* eslint-disable react-refresh/only-export-components */
import { createContext, useContext, useState, ReactNode } from 'react';

interface PathSelectionContextType {
  isOpen: boolean;
  openOverlay: () => void;
  closeOverlay: () => void;
}

const PathSelectionContext = createContext<PathSelectionContextType | null>(null);

export function PathSelectionProvider({ children }: { children: ReactNode }) {
  const [isOpen, setIsOpen] = useState(false);

  const openOverlay = () => setIsOpen(true);
  const closeOverlay = () => setIsOpen(false);

  return (
    <PathSelectionContext.Provider value={{ isOpen, openOverlay, closeOverlay }}>
      {children}
    </PathSelectionContext.Provider>
  );
}

export function usePathSelection() {
  const ctx = useContext(PathSelectionContext);
  if (!ctx) {
    throw new Error('usePathSelection must be used within a PathSelectionProvider');
  }
  return ctx;
}
