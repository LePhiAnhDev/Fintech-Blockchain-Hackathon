import React from "react";
import { motion } from "framer-motion";
import { Loader2 } from "lucide-react";

/**
 * Component loading spinner nhỏ gọn
 *
 * @component
 */
const LoadingSpinner = ({
  size = "md",
  text = "Loading...",
  className = "",
  showText = true,
  variant = "primary",
}) => {
  const sizeClasses = {
    sm: "w-4 h-4",
    md: "w-6 h-6",
    lg: "w-8 h-8",
    xl: "w-10 h-10",
  };

  const textSizeClasses = {
    sm: "text-sm",
    md: "text-base",
    lg: "text-lg",
    xl: "text-xl",
  };

  const colorClasses = {
    primary: "text-primary-500",
    white: "text-white",
    gray: "text-gray-400",
    success: "text-green-500",
    warning: "text-yellow-500",
    error: "text-red-500",
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className={`flex flex-col items-center justify-center ${className}`}
    >
      <motion.div
        animate={{ rotate: 360 }}
        transition={{
          duration: 1,
          repeat: Infinity,
          ease: "linear",
        }}
        className="relative"
      >
        <Loader2 className={`${sizeClasses[size]} ${colorClasses[variant]}`} />

        {/* Outer ring animation */}
        <motion.div
          className={`absolute inset-0 border-2 border-transparent border-t-current rounded-full ${colorClasses[variant]} opacity-30`}
          animate={{ rotate: -360 }}
          transition={{
            duration: 2,
            repeat: Infinity,
            ease: "linear",
          }}
        />
      </motion.div>

      {showText && text && (
        <motion.p
          initial={{ opacity: 0, y: 5 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className={`mt-2 ${textSizeClasses[size]} ${colorClasses[variant]} text-center`}
        >
          {text}
        </motion.p>
      )}
    </motion.div>
  );
};

export default LoadingSpinner;
