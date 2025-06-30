import React, { useCallback } from "react";
import PropTypes from "prop-types";
import { motion } from "framer-motion";
import {
  ExternalLink,
  Copy,
  TrendingUp,
  Clock,
  Wallet,
  Users,
  RefreshCw,
  Shield,
  CheckCircle,
  Info,
  AlertTriangle,
  ArrowUpRight,
  ArrowDownRight,
  Database,
  Zap,
} from "lucide-react";
import toast from "react-hot-toast";
import MarkdownRenderer from "../../../components/common/MarkdownRenderer";

/**
 * Component hiển thị kết quả phân tích blockchain
 *
 * @component
 */
const AnalysisResults = React.memo(
  ({
    analysisResult,
    getRiskLevelColor,
    getRiskIcon,
    formatAddress,
    copyAddress,
    openEtherscan,
  }) => {
    // Lấy icon component dựa theo risk level
    const getIconComponent = (riskLevel) => {
      const iconName = getRiskIcon(riskLevel);
      const iconMap = {
        CheckCircle: CheckCircle,
        Info: Info,
        AlertTriangle: AlertTriangle,
        Shield: Shield,
      };

      const IconComponent = iconMap[iconName] || Shield;
      return <IconComponent className="w-5 h-5" />;
    };

    // Format số với dấu phẩy
    const formatNumber = (num) => {
      if (typeof num === "number") {
        return num.toLocaleString("vi-VN");
      }
      return num || "0";
    };

    // Format phần trăm
    const formatPercentage = (percentage) => {
      const num = parseFloat(percentage) || 0;
      return `${num.toFixed(1)}%`;
    };

    // Copy địa chỉ với feedback
    const handleCopyAddress = () => {
      copyAddress(analysisResult.address);
      toast.success("Đã sao chép địa chỉ ví!", {
        icon: "📋",
        duration: 2000,
      });
    };

    // Mở Etherscan với feedback
    const handleOpenEtherscan = () => {
      openEtherscan(analysisResult.address);
      toast.success("Đang mở Etherscan...", {
        icon: "🔗",
        duration: 2000,
      });
    };

    // Lấy màu cho prediction
    const getPredictionColor = (prediction) => {
      return prediction === "NORMAL" || prediction === "FRAUDULENT"
        ? prediction === "NORMAL"
          ? "text-green-300"
          : "text-red-300"
        : "text-slate-300";
    };

    // Lấy nhãn hiển thị cho prediction
    const getPredictionLabel = (prediction) => {
      switch (prediction) {
        case "NORMAL":
          return "🟢 Bình thường";
        case "FRAUDULENT":
          return "🔴 Nghi ngờ gian lận";
        default:
          return "⚪ Không xác định";
      }
    };

    // Lấy màu cho confidence
    const getConfidenceColor = (confidence) => {
      switch (confidence) {
        case "High":
          return "text-green-300";
        case "Medium":
          return "text-amber-300";
        case "Low":
          return "text-red-300";
        default:
          return "text-slate-300";
      }
    };

    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="grid grid-cols-1 lg:grid-cols-3 gap-6"
      >
        {/* Risk Assessment */}
        <div className="lg:col-span-2 space-y-6">
          {/* Main Risk Card */}
          <div className="glass rounded-xl p-6 border border-slate-700/50">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-white text-lg font-semibold flex items-center">
                <Shield className="w-5 h-5 mr-2 text-blue-400" />
                Đánh giá rủi ro
              </h3>
              <div className="flex items-center space-x-2">
                <button
                  onClick={handleCopyAddress}
                  className="text-slate-400 hover:text-white transition-colors p-2 rounded-lg hover:bg-slate-700/30"
                  title="Sao chép địa chỉ"
                >
                  <Copy className="w-4 h-4" />
                </button>
                <button
                  onClick={handleOpenEtherscan}
                  className="text-slate-400 hover:text-white transition-colors p-2 rounded-lg hover:bg-slate-700/30"
                  title="Xem trên Etherscan"
                >
                  <ExternalLink className="w-4 h-4" />
                </button>
              </div>
            </div>

            <div className="space-y-4">
              {/* Địa chỉ ví */}
              <div className="flex items-center justify-between py-2 border-b border-slate-700/30">
                <span className="text-slate-300">Địa chỉ ví:</span>
                <span className="text-white font-mono text-sm bg-slate-800/50 px-3 py-1 rounded-lg">
                  {formatAddress(analysisResult.address)}
                </span>
              </div>

              {/* Mức độ rủi ro */}
              <div className="flex items-center justify-between py-2">
                <span className="text-slate-300">Mức độ rủi ro:</span>
                <div
                  className={`flex items-center space-x-2 px-4 py-2 rounded-lg border ${getRiskLevelColor(
                    analysisResult.risk_level
                  )}`}
                >
                  {getIconComponent(analysisResult.risk_level)}
                  <span className="font-semibold">
                    {analysisResult.risk_level}
                  </span>
                </div>
              </div>

              {/* Xác suất gian lận */}
              <div className="flex items-center justify-between py-2">
                <span className="text-slate-300">Xác suất gian lận:</span>
                <div className="flex items-center space-x-2">
                  <div className="w-32 bg-slate-700/50 rounded-full h-2">
                    <div
                      className={`h-2 rounded-full ${
                        analysisResult.fraud_probability > 70
                          ? "bg-red-500"
                          : analysisResult.fraud_probability > 30
                          ? "bg-amber-500"
                          : "bg-green-500"
                      }`}
                      style={{
                        width: `${Math.min(
                          analysisResult.fraud_probability,
                          100
                        )}%`,
                      }}
                    ></div>
                  </div>
                  <span className="text-white font-semibold min-w-[60px] text-right">
                    {formatPercentage(analysisResult.fraud_probability)}
                  </span>
                </div>
              </div>

              {/* Độ tin cậy */}
              <div className="flex items-center justify-between py-2">
                <span className="text-slate-300">Độ tin cậy:</span>
                <span
                  className={`font-semibold ${getConfidenceColor(
                    analysisResult.confidence
                  )}`}
                >
                  {analysisResult.confidence === "High"
                    ? "🟢 Cao"
                    : analysisResult.confidence === "Medium"
                    ? "🟡 Trung bình"
                    : analysisResult.confidence === "Low"
                    ? "🔴 Thấp"
                    : analysisResult.confidence}
                </span>
              </div>

              {/* Dự đoán */}
              <div className="flex items-center justify-between py-2 border-t border-slate-700/30 pt-4">
                <span className="text-slate-300">Dự đoán:</span>
                <span
                  className={`font-semibold ${getPredictionColor(
                    analysisResult.prediction
                  )}`}
                >
                  {getPredictionLabel(analysisResult.prediction)}
                </span>
              </div>
            </div>
          </div>

          {/* AI Analysis */}
          {analysisResult.summarize && (
            <div className="glass rounded-xl p-6 border border-slate-700/50">
              <h3 className="text-white text-lg font-semibold mb-4 flex items-center">
                <Zap className="w-5 h-5 mr-2 text-violet-400" />
                Phân tích chi tiết từ AI
              </h3>
              <div className="bg-slate-800/50 rounded-lg p-5 border border-slate-700/30">
                <MarkdownRenderer
                  content={analysisResult.summarize}
                  className="ai-analysis-content"
                />
              </div>
            </div>
          )}
        </div>

        {/* Statistics Sidebar */}
        <div className="space-y-4">
          {/* Blockchain Info */}
          <div className="glass rounded-xl p-6 border border-slate-700/50">
            <h3 className="text-white font-semibold mb-4 flex items-center">
              <Database className="w-5 h-5 mr-2 text-cyan-400" />
              Thông tin blockchain
            </h3>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Clock className="w-4 h-4 text-blue-400" />
                  <span className="text-slate-300 text-sm">Tuổi tài khoản</span>
                </div>
                <span className="text-white text-sm font-medium">
                  {analysisResult.account_age}
                </span>
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Wallet className="w-4 h-4 text-green-400" />
                  <span className="text-slate-300 text-sm">Số dư hiện tại</span>
                </div>
                <span className="text-white text-sm font-medium">
                  {analysisResult.current_balance}
                </span>
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <ArrowDownRight className="w-4 h-4 text-blue-400" />
                  <span className="text-slate-300 text-sm">Tổng nhận</span>
                </div>
                <span className="text-white text-sm font-medium">
                  {analysisResult.total_received}
                </span>
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Users className="w-4 h-4 text-purple-400" />
                  <span className="text-slate-300 text-sm">Người gửi</span>
                </div>
                <span className="text-white text-sm font-medium">
                  {formatNumber(analysisResult.unique_senders)}
                </span>
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <RefreshCw className="w-4 h-4 text-amber-400" />
                  <span className="text-slate-300 text-sm">Giao dịch</span>
                </div>
                <span className="text-white text-sm font-medium">
                  {formatNumber(analysisResult.total_transactions)}
                </span>
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Clock className="w-4 h-4 text-slate-400" />
                  <span className="text-slate-300 text-sm">
                    Khoảng cách gửi
                  </span>
                </div>
                <span className="text-white text-sm font-medium">
                  {analysisResult.avg_send_interval}
                </span>
              </div>
            </div>
          </div>

          {/* Data Source */}
          <div className="glass rounded-xl p-6 border border-slate-700/50">
            <h3 className="text-white font-semibold mb-4 flex items-center">
              <TrendingUp className="w-5 h-5 mr-2 text-emerald-400" />
              Nguồn dữ liệu
            </h3>
            <div className="space-y-3 text-sm">
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-blue-400 rounded-full animate-pulse"></div>
                <span className="text-slate-300">
                  {analysisResult.data_source}
                </span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-violet-400 rounded-full animate-pulse"></div>
                <span className="text-slate-300">AI Model: XGBoost + LLM</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-cyan-400 rounded-full animate-pulse"></div>
                <span className="text-slate-300">Mạng: Ethereum Mainnet</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse"></div>
                <span className="text-slate-300">Cập nhật: Thời gian thực</span>
              </div>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="glass rounded-xl p-6 border border-slate-700/50">
            <h3 className="text-white font-semibold mb-4">Hành động nhanh</h3>
            <div className="space-y-3">
              <button
                onClick={handleCopyAddress}
                className="w-full flex items-center justify-center space-x-2 bg-slate-700/50 hover:bg-slate-600/50 text-white py-2 rounded-lg transition-colors"
              >
                <Copy className="w-4 h-4" />
                <span>Sao chép địa chỉ</span>
              </button>

              <button
                onClick={handleOpenEtherscan}
                className="w-full flex items-center justify-center space-x-2 bg-blue-600/20 hover:bg-blue-600/30 text-blue-300 py-2 rounded-lg transition-colors border border-blue-600/30"
              >
                <ExternalLink className="w-4 h-4" />
                <span>Xem chi tiết</span>
              </button>
            </div>
          </div>
        </div>
      </motion.div>
    );
  }
);

AnalysisResults.displayName = "AnalysisResults";

AnalysisResults.propTypes = {
  /** Kết quả phân tích */
  analysisResult: PropTypes.object.isRequired,
  /** Hàm lấy màu cấp độ rủi ro */
  getRiskLevelColor: PropTypes.func.isRequired,
  /** Hàm lấy icon cấp độ rủi ro */
  getRiskIcon: PropTypes.func.isRequired,
  /** Hàm định dạng địa chỉ */
  formatAddress: PropTypes.func.isRequired,
  /** Hàm sao chép địa chỉ */
  copyAddress: PropTypes.func.isRequired,
  /** Hàm mở địa chỉ trên Etherscan */
  openEtherscan: PropTypes.func.isRequired,
};

export default AnalysisResults;
