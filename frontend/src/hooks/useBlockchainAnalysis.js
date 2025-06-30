import { useState, useEffect, useCallback } from "react";
import blockchainService from "../services/api/blockchainService";
import { isValidEthereumAddress } from "../utils/validationUtils";
import { toast } from "react-toastify";

/**
 * Hook quản lý phân tích blockchain
 *
 * @returns {Object} Trạng thái và hàm xử lý phân tích blockchain
 */
const useBlockchainAnalysis = () => {
  const [walletAddress, setWalletAddress] = useState("");
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisResult, setAnalysisResult] = useState(null);
  const [analysisHistory, setAnalysisHistory] = useState([]);
  const [activeTab, setActiveTab] = useState("analyze"); // 'analyze' or 'history'
  const [isLoadingHistory, setIsLoadingHistory] = useState(false);
  const [error, setError] = useState(null);

  // Memoize setWalletAddress để tránh re-render AnalysisForm
  const memoizedSetWalletAddress = useCallback((value) => {
    setWalletAddress(value);
  }, []);

  /**
   * Tải lịch sử phân tích
   */
  const loadAnalysisHistory = useCallback(async () => {
    try {
      setIsLoadingHistory(true);
      setError(null);

      console.log("🔄 Loading analysis history...");

      const data = await blockchainService.getAnalysisHistory({
        limit: 50,
        offset: 0,
      });

      setAnalysisHistory(data.analyses || []);

      console.log(`✅ Loaded ${data.analyses?.length || 0} analysis records`);
    } catch (error) {
      console.error("❌ Error loading analysis history:", error);
      setError("Không thể tải lịch sử phân tích");
      setAnalysisHistory([]);
    } finally {
      setIsLoadingHistory(false);
    }
  }, []);

  useEffect(() => {
    loadAnalysisHistory();
  }, [loadAnalysisHistory]);

  /**
   * Phân tích địa chỉ ví
   */
  const handleAnalyze = useCallback(async () => {
    // Validation
    if (!walletAddress.trim()) {
      toast.error("Vui lòng nhập địa chỉ ví");
      return;
    }

    // Clean address
    let cleanAddress = walletAddress.trim();
    if (!cleanAddress.startsWith("0x")) {
      cleanAddress = "0x" + cleanAddress;
    }

    if (!isValidEthereumAddress(cleanAddress)) {
      toast.error("Địa chỉ ví không hợp lệ. Vui lòng kiểm tra lại.");
      return;
    }

    setIsAnalyzing(true);
    setError(null);

    try {
      console.log(`🔍 Starting analysis for: ${cleanAddress}`);

      // Show loading toast
      const loadingToastId = toast.loading("Đang phân tích blockchain...", {
        duration: Infinity, // Keep until dismissed
      });

      const result = await blockchainService.analyzeWallet(cleanAddress);

      // Dismiss loading toast
      toast.dismiss(loadingToastId);

      console.log("✅ Analysis completed:", result);

      setAnalysisResult(result);
      setWalletAddress(cleanAddress); // Update with cleaned address

      // Lưu kết quả phân tích vào backend
      try {
        await blockchainService.saveAnalysis(result);
        console.log("💾 Analysis saved to history");

        // Reload history để cập nhật danh sách
        await loadAnalysisHistory();
      } catch (saveError) {
        console.warn("⚠️ Could not save analysis to history:", saveError);
        // Không hiển thị lỗi cho user vì phân tích vẫn thành công
      }

      // Show success message with risk level
      const riskLevel = result.risk_level?.toUpperCase();
      let message = "Phân tích hoàn tất!";

      if (riskLevel === "HIGH") {
        message = "⚠️ Phát hiện rủi ro cao! Hãy cẩn thận.";
        toast.error(message, { duration: 6000 });
      } else if (riskLevel === "MEDIUM") {
        message = "⚠️ Phát hiện rủi ro trung bình.";
        // Thay thế JSX với chuỗi text đơn giản
        toast.warning(`${message}\nKiểm tra kỹ thông tin phân tích`, {
          duration: 5000,
        });
      } else {
        message = "✅ Ví an toàn, rủi ro thấp.";
        toast.success(message, { duration: 4000 });
      }
    } catch (error) {
      console.error("❌ Analysis failed:", error);

      const errorMessage =
        error.message || "Không thể phân tích ví. Vui lòng thử lại sau.";
      setError(errorMessage);

      // Show user-friendly error message
      toast.error(errorMessage, {
        duration: 6000,
        style: {
          maxWidth: "400px",
        },
      });
    } finally {
      setIsAnalyzing(false);
    }
  }, [walletAddress, loadAnalysisHistory]);

  /**
   * Xóa giao dịch
   */
  const deleteAnalysis = useCallback(
    async (analysisId) => {
      if (!analysisId) {
        toast.error("ID phân tích không hợp lệ");
        return;
      }

      try {
        console.log(`🗑️ Deleting analysis: ${analysisId}`);

        await blockchainService.deleteAnalysis(analysisId);
        await loadAnalysisHistory();

        toast.success("Đã xóa phân tích");
      } catch (error) {
        console.error("❌ Delete analysis failed:", error);
        toast.error("Không thể xóa phân tích. Vui lòng thử lại.");
      }
    },
    [loadAnalysisHistory]
  );

  /**
   * Lấy màu cấp độ rủi ro
   */
  const getRiskLevelColor = useCallback((riskLevel) => {
    switch (riskLevel?.toUpperCase()) {
      case "LOW":
        return "bg-green-500/20 text-green-300 border-green-500/30";
      case "MEDIUM":
        return "bg-amber-500/20 text-amber-300 border-amber-500/30";
      case "HIGH":
        return "bg-red-500/20 text-red-300 border-red-500/30";
      default:
        return "bg-slate-500/20 text-slate-300 border-slate-500/30";
    }
  }, []);

  /**
   * Lấy icon cấp độ rủi ro
   */
  const getRiskIcon = useCallback((riskLevel) => {
    const iconMap = {
      LOW: "CheckCircle",
      MEDIUM: "Info",
      HIGH: "AlertTriangle",
      DEFAULT: "Shield",
    };

    return iconMap[riskLevel?.toUpperCase()] || iconMap.DEFAULT;
  }, []);

  /**
   * Lấy mô tả cấp độ rủi ro
   */
  const getRiskDescription = useCallback((riskLevel, fraudProbability) => {
    const probability = parseFloat(fraudProbability) || 0;

    switch (riskLevel?.toUpperCase()) {
      case "LOW":
        return `Rủi ro thấp (${probability.toFixed(1)}%) - Ví an toàn`;
      case "MEDIUM":
        return `Rủi ro trung bình (${probability.toFixed(
          1
        )}%) - Cần thận trọng`;
      case "HIGH":
        return `Rủi ro cao (${probability.toFixed(1)}%) - Nguy hiểm`;
      default:
        return `Không xác định (${probability.toFixed(1)}%)`;
    }
  }, []);

  /**
   * Làm mới dữ liệu
   */
  const refreshData = useCallback(async () => {
    setError(null);
    await loadAnalysisHistory();
  }, [loadAnalysisHistory]);

  /**
   * Đặt lại form
   */
  const resetForm = useCallback(() => {
    setWalletAddress("");
    setAnalysisResult(null);
    setError(null);
  }, []);

  /**
   * Chọn ví từ lịch sử
   */
  const selectFromHistory = useCallback((analysis) => {
    setAnalysisResult(analysis);
    setWalletAddress(analysis.address || "");
    setActiveTab("analyze");

    toast.success("Đã tải phân tích từ lịch sử");
  }, []);

  /**
   * Tìm kiếm trong lịch sử
   */
  const searchHistory = useCallback(async (searchTerm, riskLevel = null) => {
    try {
      setIsLoadingHistory(true);

      const options = {
        limit: 50,
        offset: 0,
      };

      if (riskLevel) {
        options.risk_level = riskLevel;
      }

      const data = await blockchainService.getAnalysisHistory(options);

      let filteredAnalyses = data.analyses || [];

      // Filter by search term if provided
      if (searchTerm && searchTerm.trim()) {
        const term = searchTerm.trim().toLowerCase();
        filteredAnalyses = filteredAnalyses.filter(
          (analysis) =>
            analysis.address?.toLowerCase().includes(term) ||
            analysis.summarize?.toLowerCase().includes(term)
        );
      }

      setAnalysisHistory(filteredAnalyses);
    } catch (error) {
      console.error("❌ Search history failed:", error);
      toast.error("Không thể tìm kiếm lịch sử");
    } finally {
      setIsLoadingHistory(false);
    }
  }, []);

  /**
   * Kiểm tra trạng thái AI server
   */
  const checkAIServerStatus = useCallback(async () => {
    try {
      const status = await blockchainService.checkAIServerHealth();

      if (status.status === "healthy") {
        toast.success("AI Server đang hoạt động bình thường");
      } else {
        toast.error("AI Server không khả dụng");
      }

      return status;
    } catch (error) {
      console.error("❌ AI Server health check failed:", error);
      toast.error("Không thể kiểm tra trạng thái AI Server");
      return { status: "unavailable" };
    }
  }, []);

  return {
    // State
    walletAddress,
    setWalletAddress: memoizedSetWalletAddress,
    isAnalyzing,
    analysisResult,
    setAnalysisResult,
    analysisHistory,
    activeTab,
    setActiveTab,
    isLoadingHistory,
    error,

    // Actions
    handleAnalyze,
    loadAnalysisHistory,
    deleteAnalysis,
    refreshData,
    resetForm,
    selectFromHistory,
    searchHistory,
    checkAIServerStatus,

    // Utilities
    getRiskLevelColor,
    getRiskIcon,
    getRiskDescription,
  };
};

export default useBlockchainAnalysis;
