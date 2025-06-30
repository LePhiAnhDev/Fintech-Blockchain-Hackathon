import React from "react";
import { motion } from "framer-motion";

/**
 * Component loading card với skeleton animation
 *
 * @component
 */
const LoadingCard = ({ className = "", variant = "default" }) => {
  const variants = {
    default: {
      height: "h-32",
      padding: "p-4",
    },
    tall: {
      height: "h-48",
      padding: "p-6",
    },
    short: {
      height: "h-20",
      padding: "p-3",
    },
  };

  const shimmerVariants = {
    initial: { x: "-100%" },
    animate: { x: "100%" },
  };

  const pulseVariants = {
    initial: { opacity: 0.6 },
    animate: { opacity: 1 },
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className={`bg-slate-800 rounded-lg border border-slate-700 ${variants[variant].height} ${variants[variant].padding} ${className}`}
    >
      <div className="animate-pulse space-y-3">
        {/* Header skeleton */}
        <div className="flex items-center space-x-3">
          <motion.div
            variants={pulseVariants}
            initial="initial"
            animate="animate"
            transition={{
              duration: 1.5,
              repeat: Infinity,
              repeatType: "reverse",
            }}
            className="w-8 h-8 bg-slate-700 rounded-full relative overflow-hidden"
          >
            <motion.div
              variants={shimmerVariants}
              initial="initial"
              animate="animate"
              transition={{
                duration: 2,
                repeat: Infinity,
                ease: "linear",
              }}
              className="absolute inset-0 bg-gradient-to-r from-transparent via-slate-600 to-transparent"
            />
          </motion.div>

          <div className="flex-1 space-y-2">
            <motion.div
              variants={pulseVariants}
              initial="initial"
              animate="animate"
              transition={{
                duration: 1.5,
                repeat: Infinity,
                repeatType: "reverse",
                delay: 0.1,
              }}
              className="h-3 bg-slate-700 rounded relative overflow-hidden"
            >
              <motion.div
                variants={shimmerVariants}
                initial="initial"
                animate="animate"
                transition={{
                  duration: 2,
                  repeat: Infinity,
                  ease: "linear",
                  delay: 0.1,
                }}
                className="absolute inset-0 bg-gradient-to-r from-transparent via-slate-600 to-transparent"
              />
            </motion.div>

            <motion.div
              variants={pulseVariants}
              initial="initial"
              animate="animate"
              transition={{
                duration: 1.5,
                repeat: Infinity,
                repeatType: "reverse",
                delay: 0.2,
              }}
              className="h-2 bg-slate-700 rounded w-3/4 relative overflow-hidden"
            >
              <motion.div
                variants={shimmerVariants}
                initial="initial"
                animate="animate"
                transition={{
                  duration: 2,
                  repeat: Infinity,
                  ease: "linear",
                  delay: 0.2,
                }}
                className="absolute inset-0 bg-gradient-to-r from-transparent via-slate-600 to-transparent"
              />
            </motion.div>
          </div>
        </div>

        {/* Content skeleton */}
        {variant === "tall" && (
          <div className="space-y-2 mt-4">
            {Array.from({ length: 3 }).map((_, i) => (
              <motion.div
                key={i}
                variants={pulseVariants}
                initial="initial"
                animate="animate"
                transition={{
                  duration: 1.5,
                  repeat: Infinity,
                  repeatType: "reverse",
                  delay: 0.3 + i * 0.1,
                }}
                className="h-2 bg-slate-700 rounded relative overflow-hidden"
                style={{ width: `${100 - i * 10}%` }}
              >
                <motion.div
                  variants={shimmerVariants}
                  initial="initial"
                  animate="animate"
                  transition={{
                    duration: 2,
                    repeat: Infinity,
                    ease: "linear",
                    delay: 0.3 + i * 0.1,
                  }}
                  className="absolute inset-0 bg-gradient-to-r from-transparent via-slate-600 to-transparent"
                />
              </motion.div>
            ))}
          </div>
        )}

        {/* Footer skeleton */}
        {variant !== "short" && (
          <div className="flex justify-between items-center mt-4">
            <motion.div
              variants={pulseVariants}
              initial="initial"
              animate="animate"
              transition={{
                duration: 1.5,
                repeat: Infinity,
                repeatType: "reverse",
                delay: 0.4,
              }}
              className="h-2 bg-slate-700 rounded w-1/4 relative overflow-hidden"
            >
              <motion.div
                variants={shimmerVariants}
                initial="initial"
                animate="animate"
                transition={{
                  duration: 2,
                  repeat: Infinity,
                  ease: "linear",
                  delay: 0.4,
                }}
                className="absolute inset-0 bg-gradient-to-r from-transparent via-slate-600 to-transparent"
              />
            </motion.div>

            <motion.div
              variants={pulseVariants}
              initial="initial"
              animate="animate"
              transition={{
                duration: 1.5,
                repeat: Infinity,
                repeatType: "reverse",
                delay: 0.5,
              }}
              className="h-6 w-16 bg-slate-700 rounded relative overflow-hidden"
            >
              <motion.div
                variants={shimmerVariants}
                initial="initial"
                animate="animate"
                transition={{
                  duration: 2,
                  repeat: Infinity,
                  ease: "linear",
                  delay: 0.5,
                }}
                className="absolute inset-0 bg-gradient-to-r from-transparent via-slate-600 to-transparent"
              />
            </motion.div>
          </div>
        )}
      </div>
    </motion.div>
  );
};

export default LoadingCard;
