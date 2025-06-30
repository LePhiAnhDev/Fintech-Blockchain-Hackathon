import React, { useCallback } from "react";
import PropTypes from "prop-types";
import { motion } from "framer-motion";
import { Shield } from "lucide-react";

/**
 * Component hiển thị lịch sử phân tích
 *
 * @component
 */
const AnalysisHistory = React.memo(
  ({ analysisHistory, formatAddress, setAnalysisResult, setActiveTab }) => {
    // Tối ưu click handler
    const handleAnalysisClick = useCallback(
      (analysis) => {
        setAnalysisResult(analysis);
        setActiveTab("analyze");
      },
      [setAnalysisResult, setActiveTab]
    );
    return (
      <motion.div
        key="history"
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        exit={{ opacity: 0, x: -20 }}
        className="glass rounded-2xl border border-slate-700/50"
      >
        <div className="p-6 border-b border-slate-700/50">
          <h3 className="text-white text-lg font-semibold">
            Lịch sử phân tích
          </h3>
          <p className="text-slate-300 text-sm mt-1">
            Các địa chỉ ví đã được phân tích trước đó
          </p>
        </div>
        <div className="p-6">
          {analysisHistory.length > 0 ? (
            <div className="space-y-4">
              {analysisHistory.map((analysis, index) => (
                <motion.div
                  key={analysis._id || index}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="bg-slate-800/30 rounded-lg p-4 hover:bg-slate-700/30 transition-colors cursor-pointer border border-slate-700/30"
                  onClick={() => handleAnalysisClick(analysis)}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div
                        className={`w-3 h-3 rounded-full ${
                          analysis.risk_level === "LOW"
                            ? "bg-green-400"
                            : analysis.risk_level === "MEDIUM"
                            ? "bg-amber-400"
                            : "bg-red-400"
                        }`}
                      ></div>
                      <div>
                        <p className="text-white font-mono text-sm">
                          {formatAddress(analysis.address)}
                        </p>
                        <p className="text-slate-400 text-xs">
                          {analysis.created_at
                            ? new Date(analysis.created_at).toLocaleString(
                                "vi-VN"
                              )
                            : ""}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p
                        className={`text-sm font-semibold ${
                          analysis.risk_level === "LOW"
                            ? "text-green-300"
                            : analysis.risk_level === "MEDIUM"
                            ? "text-amber-300"
                            : "text-red-300"
                        }`}
                      >
                        {analysis.risk_level}
                      </p>
                      <p className="text-slate-400 text-xs">
                        {analysis.fraud_probability}% rủi ro
                      </p>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <Shield className="w-12 h-12 text-slate-500 mx-auto mb-3" />
              <p className="text-slate-400">Chưa có lịch sử phân tích nào</p>
              <p className="text-slate-500 text-sm mt-1">
                Hãy thử phân tích một địa chỉ ví để bắt đầu
              </p>
            </div>
          )}
        </div>
      </motion.div>
    );
  }
);

AnalysisHistory.displayName = "AnalysisHistory";

AnalysisHistory.propTypes = {
  /** Lịch sử phân tích */
  analysisHistory: PropTypes.array.isRequired,
  /** Hàm định dạng địa chỉ */
  formatAddress: PropTypes.func.isRequired,
  /** Hàm đặt kết quả phân tích */
  setAnalysisResult: PropTypes.func.isRequired,
  /** Hàm chuyển tab */
  setActiveTab: PropTypes.func.isRequired,
};

export default AnalysisHistory;
