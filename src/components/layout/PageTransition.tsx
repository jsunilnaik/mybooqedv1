import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useLocation } from 'react-router-dom';

interface PageTransitionProps {
  children: React.ReactNode;
}

// ── Per-page wrapper — use this INSIDE each page component ──────────────────
export const PageTransition: React.FC<PageTransitionProps> = ({ children }) => {
  const location = useLocation();
  return (
    <AnimatePresence mode="wait" initial={false}>
      <motion.div
        key={location.pathname}
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -6 }}
        transition={{ duration: 0.2, ease: [0.25, 0.1, 0.25, 1] }}
        style={{ willChange: 'opacity, transform' }}
      >
        {children}
      </motion.div>
    </AnimatePresence>
  );
};

// ── Lightweight fade wrapper — no exit animation, just fade in ───────────────
export const FadeIn: React.FC<{ children: React.ReactNode; className?: string; delay?: number }> = ({
  children,
  className,
  delay = 0,
}) => (
  <motion.div
    className={className}
    initial={{ opacity: 0, y: 12 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.25, ease: [0.25, 0.1, 0.25, 1], delay }}
  >
    {children}
  </motion.div>
);

// ── Tab content transition — swap tab panels smoothly ───────────────────────
export const TabTransition: React.FC<{ tabKey: string; children: React.ReactNode }> = ({
  tabKey,
  children,
}) => (
  <AnimatePresence mode="wait" initial={false}>
    <motion.div
      key={tabKey}
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -4 }}
      transition={{ duration: 0.16, ease: [0.25, 0.1, 0.25, 1] }}
    >
      {children}
    </motion.div>
  </AnimatePresence>
);

// ── Stagger container — wraps a list for staggered entrance ─────────────────
export const StaggerContainer: React.FC<{
  children: React.ReactNode;
  className?: string;
  delay?: number;
}> = ({ children, className, delay = 0.05 }) => (
  <motion.div
    className={className}
    initial="hidden"
    animate="visible"
    variants={{
      hidden: {},
      visible: {
        transition: { staggerChildren: 0.07, delayChildren: delay },
      },
    }}
  >
    {children}
  </motion.div>
);

// ── Individual stagger item ──────────────────────────────────────────────────
export const StaggerItem: React.FC<{ children: React.ReactNode; className?: string }> = ({
  children,
  className,
}) => (
  <motion.div
    className={className}
    variants={{
      hidden: { opacity: 0, y: 16 },
      visible: {
        opacity: 1,
        y: 0,
        transition: { duration: 0.25, ease: [0.25, 0.1, 0.25, 1] },
      },
    }}
  >
    {children}
  </motion.div>
);
