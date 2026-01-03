import { motion, AnimatePresence } from 'framer-motion';

/**
 * PageLoader Component
 * Shows a loading animation during page transitions
 *
 * Uses GPU-friendly properties (transform, opacity) for smooth animation
 */
const PageLoader = ({ isLoading }) => {
  return (
    <AnimatePresence>
      {isLoading && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          className="fixed inset-0 z-[9999] flex items-center justify-center bg-white"
        >
          <div className="flex flex-col items-center gap-4">
            {/* Animated loader */}
            <div className="relative">
              {/* Outer ring */}
              <motion.div
                className="w-16 h-16 rounded-full border-4 border-primary/20"
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ duration: 0.3 }}
              />

              {/* Spinning arc */}
              <motion.div
                className="absolute inset-0 w-16 h-16 rounded-full border-4 border-transparent border-t-primary"
                animate={{ rotate: 360 }}
                transition={{
                  duration: 1,
                  repeat: Infinity,
                  ease: 'linear',
                }}
              />

              {/* Center dot */}
              <motion.div
                className="absolute inset-0 flex items-center justify-center"
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.2, duration: 0.3 }}
              >
                <div className="w-3 h-3 bg-primary rounded-full" />
              </motion.div>
            </div>

            {/* Loading text */}
            <motion.p
              className="text-gray-500 text-sm font-medium"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
            >
              Loading...
            </motion.p>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default PageLoader;
