import React, { useMemo } from "react";
import { motion } from "framer-motion";
import { Database, Shield, AlertTriangle } from "lucide-react";

/**
 * Component hiển thị tổng quan thống kê
 *
 * @component
 */
const StatsOverview = React.memo(({ analysisHistory }) => {
  // Sử dụng useMemo để tránh tính toán lại stats khi component re-render
  const stats = useMemo(() => {
    const totalAnalyses = analysisHistory.length;
    const safeWallets = analysisHistory.filter(
      (a) => a.risk_level === "LOW"
    ).length;
    const riskyWallets = analysisHistory.filter(
      (a) => a.risk_level === "HIGH" || a.risk_level === "MEDIUM"
    ).length;

    return {
      totalAnalyses,
      safeWallets,
      riskyWallets,
    };
  }, [analysisHistory]);

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="glass rounded-xl p-4 border border-slate-700/50"
      >
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-blue-500/20 rounded-lg flex items-center justify-center">
            <Database className="w-5 h-5 text-blue-400" />
          </div>
          <div>
            <p className="text-slate-400 text-sm">Tổng phân tích</p>
            <p className="text-white font-semibold">
              {stats.totalAnalyses.toLocaleString()}
            </p>
          </div>
        </div>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="glass rounded-xl p-4 border border-slate-700/50"
      >
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-green-500/20 rounded-lg flex items-center justify-center">
            <Shield className="w-5 h-5 text-green-400" />
          </div>
          <div>
            <p className="text-slate-400 text-sm">Ví an toàn</p>
            <p className="text-white font-semibold">{stats.safeWallets}</p>
          </div>
        </div>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="glass rounded-xl p-4 border border-slate-700/50"
      >
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-red-500/20 rounded-lg flex items-center justify-center">
            <AlertTriangle className="w-5 h-5 text-red-400" />
          </div>
          <div>
            <p className="text-slate-400 text-sm">Ví rủi ro</p>
            <p className="text-white font-semibold">{stats.riskyWallets}</p>
          </div>
        </div>
      </motion.div>
    </div>
  );
});

StatsOverview.displayName = "StatsOverview";

export default StatsOverview;
