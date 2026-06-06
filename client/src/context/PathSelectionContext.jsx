import { createContext, useContext, useState } from 'react';

const PathSelectionContext = createContext(null);

export function PathSelectionProvider({ children }) {
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
