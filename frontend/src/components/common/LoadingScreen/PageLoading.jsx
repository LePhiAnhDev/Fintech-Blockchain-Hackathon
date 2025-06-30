import React from "react";
import { motion } from "framer-motion";
import LoadingSpinner from "./LoadingSpinner";
import LoadingCard from "./LoadingCard";

/**
 * Component loading cho các trang cụ thể
 *
 * @component
 */
const PageLoading = ({
  type = "cards",
  count = 3,
  text = "Đang tải dữ liệu...",
  className = "",
}) => {
  if (type === "spinner") {
    return (
      <div className={`flex items-center justify-center py-12 ${className}`}>
        <LoadingSpinner size="lg" text={text} variant="primary" />
      </div>
    );
  }

  if (type === "cards") {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className={`space-y-4 ${className}`}
      >
        {Array.from({ length: count }).map((_, index) => (
          <LoadingCard key={index} variant="default" className="mb-4" />
        ))}
      </motion.div>
    );
  }

  if (type === "grid") {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className={`grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 ${className}`}
      >
        {Array.from({ length: count }).map((_, index) => (
          <LoadingCard key={index} variant="default" />
        ))}
      </motion.div>
    );
  }

  if (type === "stats") {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className={`grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 ${className}`}
      >
        {Array.from({ length: 4 }).map((_, index) => (
          <div
            key={index}
            className="glass rounded-xl p-6 border border-slate-700/50"
          >
            <div className="space-y-3">
              <div className="h-4 bg-slate-700 rounded animate-pulse"></div>
              <div className="h-8 bg-slate-700 rounded animate-pulse"></div>
              <div className="h-3 bg-slate-700 rounded w-3/4 animate-pulse"></div>
            </div>
          </div>
        ))}
      </motion.div>
    );
  }

  // Default fallback
  return (
    <div className={`flex items-center justify-center py-12 ${className}`}>
      <LoadingSpinner size="lg" text={text} variant="primary" />
    </div>
  );
};

export default PageLoading;
