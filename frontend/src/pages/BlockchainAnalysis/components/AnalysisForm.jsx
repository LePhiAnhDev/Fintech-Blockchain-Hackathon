import React, { useCallback } from "react";
import PropTypes from "prop-types";
import { Search, RefreshCw, Eye } from "lucide-react";

/**
 * Form nhập địa chỉ ví để phân tích
 *
 * @component
 */
const AnalysisForm = React.memo(
  ({
    walletAddress,
    setWalletAddress,
    isAnalyzing,
    handleAnalyze,
    exampleAddresses,
    formatAddress,
  }) => {
    // Tối ưu onChange handler
    const handleInputChange = useCallback(
      (e) => {
        setWalletAddress(e.target.value);
      },
      [setWalletAddress]
    );

    // Tối ưu submit handler
    const handleSubmit = useCallback(
      (e) => {
        e.preventDefault();
        handleAnalyze();
      },
      [handleAnalyze]
    );

    // Tối ưu example address click handler
    const handleExampleClick = useCallback(
      (address) => {
        setWalletAddress(address);
      },
      [setWalletAddress]
    );

    return (
      <div className="glass rounded-2xl p-6 border border-slate-700/50">
        <div className="space-y-4">
          <div>
            <label className="block text-white font-medium mb-2">
              Địa chỉ ví Ethereum
            </label>
            <div className="flex space-x-3">
              <input
                type="text"
                value={walletAddress}
                onChange={handleInputChange}
                placeholder="0x742d35Cc6634C0532925a3b8D8a1e6d59F..."
                className="flex-1 bg-slate-800/50 border border-slate-700/50 rounded-xl px-4 py-3 text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
              <button
                onClick={handleSubmit}
                disabled={isAnalyzing || !walletAddress.trim()}
                className="px-4 py-3 bg-gradient-to-r from-blue-700 to-violet-700 text-white rounded-xl hover:from-blue-600 hover:to-violet-600 disabled:opacity-50 disabled:cursor-not-allowed min-w-[120px] flex items-center justify-center"
              >
                {isAnalyzing ? (
                  <div className="flex items-center space-x-2">
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    <span>Đang phân tích...</span>
                  </div>
                ) : (
                  <div className="flex items-center space-x-2">
                    <Search className="w-4 h-4" />
                    <span>Phân tích</span>
                  </div>
                )}
              </button>
            </div>
          </div>

          {/* Example Addresses */}
          <div>
            <p className="text-slate-300 text-sm mb-3">Ví dụ để thử nghiệm:</p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {exampleAddresses.map((example, index) => (
                <div
                  key={index}
                  className="bg-slate-800/30 rounded-lg p-3 cursor-pointer hover:bg-slate-700/30 transition-colors border border-slate-700/30"
                  onClick={() => handleExampleClick(example.address)}
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-white text-sm font-medium">
                        {example.label}
                      </p>
                      <p className="text-slate-400 text-xs">
                        {example.description}
                      </p>
                      <p className="text-slate-300 text-xs font-mono mt-1">
                        {formatAddress(example.address)}
                      </p>
                    </div>
                    <Eye className="w-4 h-4 text-slate-400" />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }
);

AnalysisForm.displayName = "AnalysisForm";

AnalysisForm.propTypes = {
  /** Địa chỉ ví đang nhập */
  walletAddress: PropTypes.string.isRequired,
  /** Hàm cập nhật địa chỉ ví */
  setWalletAddress: PropTypes.func.isRequired,
  /** Trạng thái đang phân tích */
  isAnalyzing: PropTypes.bool.isRequired,
  /** Hàm xử lý phân tích */
  handleAnalyze: PropTypes.func.isRequired,
  /** Danh sách địa chỉ ví mẫu */
  exampleAddresses: PropTypes.arrayOf(
    PropTypes.shape({
      label: PropTypes.string.isRequired,
      address: PropTypes.string.isRequired,
      description: PropTypes.string.isRequired,
    })
  ).isRequired,
  /** Hàm định dạng địa chỉ */
  formatAddress: PropTypes.func.isRequired,
};

export default AnalysisForm;
