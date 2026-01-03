import { useState, useEffect, useRef } from 'react';
import { useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';

/**
 * PageTransition Component
 * Handles page transitions with loading state and scroll restoration
 */
const PageTransition = ({ children }) => {
  const location = useLocation();
  const [isLoading, setIsLoading] = useState(false);
  const [displayChildren, setDisplayChildren] = useState(children);
  const previousPath = useRef(location.pathname);

  useEffect(() => {
    // Only trigger loader on actual route changes
    if (previousPath.current !== location.pathname) {
      setIsLoading(true);

      // Scroll to top immediately
      window.scrollTo({ top: 0, left: 0, behavior: 'instant' });

      // Short delay to show loader, then update content
      const timer = setTimeout(() => {
        setDisplayChildren(children);
        setIsLoading(false);
      }, 300); // 300ms loader display

      previousPath.current = location.pathname;

      return () => clearTimeout(timer);
    } else {
      // Same path, just update children
      setDisplayChildren(children);
    }
  }, [location.pathname, children]);

  return (
    <>
      {/* Page Loader Overlay */}
      <AnimatePresence>
        {isLoading && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.15 }}
            className="fixed inset-0 z-[9999] flex items-center justify-center bg-white"
          >
            <div className="flex flex-col items-center gap-4">
              {/* Animated loader */}
              <div className="relative">
                {/* Outer ring */}
                <motion.div
                  className="w-14 h-14 rounded-full border-4 border-primary/20"
                  initial={{ scale: 0.8, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ duration: 0.2 }}
                />

                {/* Spinning arc */}
                <motion.div
                  className="absolute inset-0 w-14 h-14 rounded-full border-4 border-transparent border-t-primary"
                  animate={{ rotate: 360 }}
                  transition={{
                    duration: 0.8,
                    repeat: Infinity,
                    ease: 'linear',
                  }}
                />

                {/* Center heart icon */}
                <motion.div
                  className="absolute inset-0 flex items-center justify-center"
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: 0.1, duration: 0.2 }}
                >
                  <svg
                    className="w-5 h-5 text-primary"
                    fill="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
                  </svg>
                </motion.div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Page Content with fade animation */}
      <AnimatePresence mode="wait">
        <motion.div
          key={location.pathname}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
        >
          {displayChildren}
        </motion.div>
      </AnimatePresence>
    </>
  );
};

export default PageTransition;
