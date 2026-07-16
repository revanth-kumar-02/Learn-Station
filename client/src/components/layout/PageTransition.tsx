// PageTransition is now a passthrough — centralized page transitions
// are handled at Layout level via AnimatePresence + motion.div keyed on location.pathname.
// This component is kept for backward compatibility with pages that still import it.
export default function PageTransition({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
