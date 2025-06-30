import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Search,
  Shield,
  AlertTriangle,
  CheckCircle,
  Info,
  ExternalLink,
  Clock,
  Wallet,
  TrendingUp,
  Users,
  Eye,
  RefreshCw,
  Copy,
  History,
  Database,
  Zap,
  Activity,
  Globe,
} from "lucide-react";
import toast from "react-hot-toast";
import PageHeader from "../../components/common/PageHeader";
import useBlockchainAnalysis from "../../hooks/useBlockchainAnalysis";
import { formatAddress, copyToClipboard } from "../../utils/formatUtils";
import AnalysisForm from "./components/AnalysisForm";
import AnalysisResults from "./components/AnalysisResults";
import AnalysisHistory from "./components/AnalysisHistory";
import SecurityTips from "./components/SecurityTips";
import StatsOverview from "./components/StatsOverview";

/**
 * Trang phân tích blockchain
 *
 * @component
 */
const BlockchainAnalysis = () => {
  const {
    walletAddress,
    setWalletAddress,
    isAnalyzing,
    analysisResult,
    setAnalysisResult,
    analysisHistory,
    activeTab,
    setActiveTab,
    isLoadingHistory,
    error,
    handleAnalyze,
    loadAnalysisHistory,
    deleteAnalysis,
    refreshData,
    resetForm,
    selectFromHistory,
    getRiskLevelColor,
    getRiskIcon,
    getRiskDescription,
  } = useBlockchainAnalysis();

  // Địa chỉ ví mẫu để thử nghiệm
  const exampleAddresses = [
    {
      label: "Ví DeFi phổ biến",
      address: "0x742d35Cc6634C0532925a3b8D8a1e6d59F061dF",
      description: "Ví có hoạt động DeFi bình thường",
    },
    {
      label: "Ví Exchange",
      address: "0xd8dA6BF26964aF9D7eEd9e03E53415D37aA96045",
      description: "Ví của sàn giao dịch Binance",
    },
    {
      label: "Ví cá nhân",
      address: "0x3f5CE5FBFe3E9af3971dD833D26bA9b5C936f0bE",
      description: "Ví cá nhân với hoạt động vừa phải",
    },
    {
      label: "Ví test nghi ngờ",
      address: "0x1234567890123456789012345678901234567890",
      description: "Ví để test chức năng cảnh báo",
    },
  ];

  /**
   * Copy địa chỉ vào clipboard
   */
  const copyAddress = async (address) => {
    const success = await copyToClipboard(address);
    if (success) {
      toast.success("Đã sao chép địa chỉ!", {
        icon: "📋",
        duration: 2000,
      });
    } else {
      toast.error("Không thể sao chép địa chỉ");
    }
  };

  /**
   * Mở trang Etherscan
   */
  const openEtherscan = (address) => {
    const url = `https://etherscan.io/address/${address}`;
    window.open(url, "_blank", "noopener,noreferrer");
    toast.success("Đang mở Etherscan...", {
      icon: "🔗",
      duration: 2000,
    });
  };

  /**
   * Xử lý làm mới dữ liệu
   */
  const handleRefresh = async () => {
    try {
      await refreshData();
      toast.success("Đã làm mới dữ liệu!");
    } catch (error) {
      toast.error("Không thể làm mới dữ liệu");
    }
  };

  /**
   * Xử lý đặt lại form
   */
  const handleReset = () => {
    resetForm();
    toast.success("Đã đặt lại form!");
  };

  /**
   * Error component
   */
  const ErrorDisplay = () =>
    error && (
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-red-500/10 border border-red-500/30 rounded-xl p-4 mb-6"
      >
        <div className="flex items-center space-x-2">
          <AlertTriangle className="w-5 h-5 text-red-400" />
          <span className="text-red-300">{error}</span>
          <button
            onClick={() => setError(null)}
            className="ml-auto text-red-400 hover:text-red-300 transition-colors"
          >
            ×
          </button>
        </div>
      </motion.div>
    );

  /**
   * Loading component inline
   */
  const InlineLoading = () => (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      className="glass rounded-2xl p-8 border border-slate-700/50 text-center"
    >
      <div className="w-16 h-16 mx-auto mb-4 relative">
        <div className="absolute inset-0 bg-gradient-to-r from-blue-500 to-violet-500 rounded-full animate-spin opacity-75"></div>
        <div className="absolute inset-2 bg-slate-900 rounded-full flex items-center justify-center">
          <Activity className="w-6 h-6 text-blue-400" />
        </div>
      </div>
      <h3 className="text-white text-lg font-semibold mb-2">
        Đang phân tích blockchain...
      </h3>
      <p className="text-slate-300 text-sm">Vui lòng đợi trong giây lát</p>
      <div className="mt-4 bg-slate-800/30 rounded-full h-2 overflow-hidden">
        <div className="bg-gradient-to-r from-blue-500 to-violet-500 h-full rounded-full animate-pulse w-3/4"></div>
      </div>
    </motion.div>
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <PageHeader
        title="Phân tích Blockchain & Phát hiện Gian lận"
        description="Sử dụng AI để phân tích độ an toàn của địa chỉ ví và phát hiện các hoạt động đáng nghi"
        icon={<Shield className="w-6 h-6" />}
        actions={
          <div className="flex space-x-3">
            <button
              onClick={() => setActiveTab("analyze")}
              className={`px-4 py-2 rounded-xl transition-all flex items-center space-x-2 ${
                activeTab === "analyze"
                  ? "bg-slate-800/70 text-white shadow-lg"
                  : "bg-slate-800/30 text-slate-300 hover:text-white hover:bg-slate-700/50"
              }`}
            >
              <Search className="w-4 h-4" />
              <span>Phân tích</span>
            </button>
            <button
              onClick={() => setActiveTab("history")}
              className={`px-4 py-2 rounded-xl transition-all flex items-center space-x-2 ${
                activeTab === "history"
                  ? "bg-slate-800/70 text-white shadow-lg"
                  : "bg-slate-800/30 text-slate-300 hover:text-white hover:bg-slate-700/50"
              }`}
            >
              <History className="w-4 h-4" />
              <span>Lịch sử</span>
              {analysisHistory.length > 0 && (
                <span className="bg-blue-500/20 text-blue-300 text-xs px-2 py-1 rounded-full">
                  {analysisHistory.length}
                </span>
              )}
            </button>
            <button
              onClick={handleRefresh}
              disabled={isLoadingHistory}
              className="px-4 py-2 rounded-xl bg-slate-800/30 text-slate-300 hover:text-white hover:bg-slate-700/50 transition-all flex items-center space-x-2"
            >
              <RefreshCw
                className={`w-4 h-4 ${isLoadingHistory ? "animate-spin" : ""}`}
              />
              <span>Làm mới</span>
            </button>
          </div>
        }
      />

      {/* Stats Overview */}
      <StatsOverview analysisHistory={analysisHistory} />

      {/* Error Display */}
      <ErrorDisplay />

      {/* Main Content */}
      <AnimatePresence mode="wait">
        {activeTab === "analyze" ? (
          <motion.div
            key="analyze"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 20 }}
            className="space-y-6"
          >
            {/* Analysis Form */}
            <AnalysisForm
              walletAddress={walletAddress}
              setWalletAddress={setWalletAddress}
              isAnalyzing={isAnalyzing}
              handleAnalyze={handleAnalyze}
              exampleAddresses={exampleAddresses}
              formatAddress={formatAddress}
            />

            {/* Quick Actions */}
            {walletAddress && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex items-center justify-between bg-slate-800/30 rounded-xl p-4 border border-slate-700/50"
              >
                <div className="flex items-center space-x-3">
                  <Wallet className="w-5 h-5 text-slate-400" />
                  <span className="text-slate-300 text-sm">
                    Địa chỉ hiện tại: {formatAddress(walletAddress)}
                  </span>
                </div>
                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => copyAddress(walletAddress)}
                    className="text-slate-400 hover:text-white transition-colors p-2 rounded-lg hover:bg-slate-700/30"
                    title="Sao chép địa chỉ"
                  >
                    <Copy className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => openEtherscan(walletAddress)}
                    className="text-slate-400 hover:text-white transition-colors p-2 rounded-lg hover:bg-slate-700/30"
                    title="Xem trên Etherscan"
                  >
                    <Globe className="w-4 h-4" />
                  </button>
                  <button
                    onClick={handleReset}
                    className="text-slate-400 hover:text-white transition-colors p-2 rounded-lg hover:bg-slate-700/30"
                    title="Đặt lại"
                  >
                    <RefreshCw className="w-4 h-4" />
                  </button>
                </div>
              </motion.div>
            )}

            {/* Analysis Results hoặc Loading */}
            {isAnalyzing ? (
              <InlineLoading />
            ) : analysisResult ? (
              <AnalysisResults
                analysisResult={analysisResult}
                getRiskLevelColor={getRiskLevelColor}
                getRiskIcon={getRiskIcon}
                formatAddress={formatAddress}
                copyAddress={copyAddress}
                openEtherscan={openEtherscan}
              />
            ) : (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-center py-12"
              >
                <div className="w-20 h-20 mx-auto mb-4 bg-slate-800/50 rounded-full flex items-center justify-center">
                  <Search className="w-8 h-8 text-slate-400" />
                </div>
                <h3 className="text-white text-lg font-semibold mb-2">
                  Sẵn sàng phân tích
                </h3>
                <p className="text-slate-400 max-w-md mx-auto">
                  Nhập địa chỉ ví Ethereum để bắt đầu phân tích blockchain và
                  phát hiện rủi ro gian lận
                </p>
              </motion.div>
            )}
          </motion.div>
        ) : (
          <AnalysisHistory
            analysisHistory={analysisHistory}
            isLoadingHistory={isLoadingHistory}
            formatAddress={formatAddress}
            setAnalysisResult={selectFromHistory}
            setActiveTab={setActiveTab}
            deleteAnalysis={deleteAnalysis}
            getRiskLevelColor={getRiskLevelColor}
            getRiskDescription={getRiskDescription}
          />
        )}
      </AnimatePresence>

      {/* Security Tips */}
      {!isAnalyzing && <SecurityTips />}
    </div>
  );
};

export default BlockchainAnalysis;
