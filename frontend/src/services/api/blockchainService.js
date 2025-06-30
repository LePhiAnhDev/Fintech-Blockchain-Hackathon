import { backendAPI, aiServerAPI } from './apiClient';

/**
 * Dịch vụ phân tích blockchain
 */
const blockchainService = {
    /**
     * Phân tích địa chỉ ví
     * @param {string} walletAddress - Địa chỉ ví cần phân tích
     * @returns {Promise} Kết quả phân tích
     */
    analyzeWallet: async (walletAddress) => {
        try {
            console.log(`🔍 Analyzing wallet: ${walletAddress}`);

            // Validate input
            if (!walletAddress || typeof walletAddress !== 'string') {
                throw new Error('Địa chỉ ví không hợp lệ');
            }

            // Clean address
            let cleanAddress = walletAddress.trim();
            if (!cleanAddress.startsWith('0x')) {
                cleanAddress = '0x' + cleanAddress;
            }

            // Basic validation
            if (cleanAddress.length !== 42) {
                throw new Error('Địa chỉ ví phải có đúng 42 ký tự (bao gồm 0x)');
            }

            // Check hex format
            const hexPattern = /^0x[a-fA-F0-9]{40}$/;
            if (!hexPattern.test(cleanAddress)) {
                throw new Error('Địa chỉ ví chứa ký tự không hợp lệ. Chỉ chấp nhận ký tự hex (0-9, a-f, A-F)');
            }

            console.log(`📤 Sending request to AI server: ${cleanAddress}`);

            // Gọi AI server để phân tích
            const response = await aiServerAPI.post('/analyze-wallet', {
                wallet_address: cleanAddress
            });

            console.log('✅ Analysis completed:', response);

            // Đảm bảo response có đầy đủ các field cần thiết
            const analysisResult = {
                address: response.address || cleanAddress,
                risk_level: response.risk_level || 'UNKNOWN',
                fraud_probability: response.fraud_probability || 0,
                prediction: response.prediction || 'NORMAL',
                confidence: response.confidence || 'Medium',
                account_age: response.account_age || '0 days',
                current_balance: response.current_balance || '0.0000 ETH',
                total_received: response.total_received || '0.0000 ETH',
                total_transactions: response.total_transactions || 0,
                unique_senders: response.unique_senders || 0,
                avg_send_interval: response.avg_send_interval || '0.0 minutes',
                data_source: response.data_source || 'Live Blockchain (Etherscan)',
                summarize: response.summarize || 'Không có phân tích chi tiết.',
                created_at: new Date().toISOString()
            };

            return analysisResult;

        } catch (error) {
            console.error('❌ Wallet analysis failed:', error);

            // Xử lý lỗi cụ thể
            if (error.response) {
                const { status, data } = error.response;

                console.error(`HTTP ${status}:`, data);

                if (status === 422) {
                    // Validation error - extract meaningful message
                    if (data.errors && data.errors.length > 0) {
                        const firstError = data.errors[0];
                        throw new Error(firstError.message || 'Dữ liệu đầu vào không hợp lệ');
                    } else {
                        throw new Error(data.message || 'Địa chỉ ví không hợp lệ');
                    }
                } else if (status === 400) {
                    throw new Error(data.detail || data.message || 'Địa chỉ ví không hợp lệ');
                } else if (status === 429) {
                    throw new Error('Quá nhiều yêu cầu. Vui lòng thử lại sau vài phút.');
                } else if (status === 503) {
                    throw new Error('Dịch vụ phân tích tạm thời không khả dụng. Vui lòng thử lại sau.');
                } else if (status >= 500) {
                    throw new Error(data.detail || 'Lỗi máy chủ. Vui lòng thử lại sau.');
                } else {
                    throw new Error(data.detail || data.message || 'Không thể phân tích ví. Vui lòng thử lại.');
                }
            } else if (error.request) {
                throw new Error('Không thể kết nối đến máy chủ AI. Vui lòng kiểm tra kết nối mạng.');
            } else if (error.message) {
                // Our own validation errors
                throw error;
            } else {
                throw new Error('Đã xảy ra lỗi không mong muốn. Vui lòng thử lại.');
            }
        }
    },

    /**
     * Lấy lịch sử phân tích
     * @param {object} options - Tùy chọn lọc
     * @returns {Promise} Lịch sử phân tích
     */
    getAnalysisHistory: async (options = {}) => {
        try {
            console.log('📋 Fetching analysis history...');

            const params = new URLSearchParams();

            if (options.risk_level) {
                params.append('risk_level', options.risk_level);
            }
            if (options.limit) {
                params.append('limit', options.limit);
            }
            if (options.offset) {
                params.append('offset', options.offset);
            }

            const queryString = params.toString();
            const url = `/blockchain/history${queryString ? `?${queryString}` : ''}`;

            const response = await backendAPI.get(url);

            console.log('✅ Analysis history fetched:', response);

            return {
                analyses: response.data?.analyses || response.analyses || [],
                pagination: response.data?.pagination || response.pagination || {
                    total: 0,
                    limit: 20,
                    offset: 0,
                    hasMore: false
                }
            };

        } catch (error) {
            console.error('❌ Failed to fetch analysis history:', error);

            // Trả về dữ liệu trống thay vì throw error để tránh crash UI
            return {
                analyses: [],
                pagination: {
                    total: 0,
                    limit: 20,
                    offset: 0,
                    hasMore: false
                }
            };
        }
    },

    /**
     * Lưu kết quả phân tích
     * @param {object} analysisData - Dữ liệu phân tích
     * @returns {Promise} Kết quả lưu phân tích
     */
    saveAnalysis: async (analysisData) => {
        try {
            console.log('💾 Saving analysis result...');

            // Chuẩn bị dữ liệu để lưu vào backend
            const dataToSave = {
                address: analysisData.address,
                risk_level: analysisData.risk_level,
                fraud_probability: analysisData.fraud_probability,
                prediction: analysisData.prediction,
                confidence: analysisData.confidence,
                account_age: analysisData.account_age,
                current_balance: analysisData.current_balance,
                total_received: analysisData.total_received,
                total_transactions: analysisData.total_transactions,
                unique_senders: analysisData.unique_senders,
                avg_send_interval: analysisData.avg_send_interval,
                data_source: analysisData.data_source,
                summarize: analysisData.summarize
            };

            const response = await backendAPI.post('/blockchain/save', dataToSave);

            console.log('✅ Analysis saved successfully:', response);

            return response;

        } catch (error) {
            console.error('❌ Failed to save analysis:', error);

            // Không throw error để tránh crash UI, chỉ log lỗi
            if (error.response?.status === 409) {
                console.warn('⚠️ Analysis already exists for this wallet');
            }

            return null;
        }
    },

    /**
     * Xóa phân tích (soft delete)
     * @param {string} analysisId - ID của phân tích cần xóa
     * @returns {Promise} Kết quả xóa
     */
    deleteAnalysis: async (analysisId) => {
        try {
            console.log(`🗑️ Deleting analysis: ${analysisId}`);

            const response = await backendAPI.delete(`/blockchain/analysis/${analysisId}`);

            console.log('✅ Analysis deleted successfully');

            return response;

        } catch (error) {
            console.error('❌ Failed to delete analysis:', error);
            throw new Error('Không thể xóa phân tích. Vui lòng thử lại.');
        }
    },

    /**
     * Lấy phân tích cho địa chỉ cụ thể
     * @param {string} address - Địa chỉ ví
     * @returns {Promise} Kết quả phân tích
     */
    getAnalysisForAddress: async (address) => {
        try {
            console.log(`🔍 Getting analysis for address: ${address}`);

            const response = await backendAPI.get(`/blockchain/analysis/${address}`);

            console.log('✅ Analysis found:', response);

            return response.data?.analysis || response.analysis;

        } catch (error) {
            console.error('❌ Failed to get analysis for address:', error);

            if (error.response?.status === 404) {
                return null; // Không có phân tích nào cho địa chỉ này
            }

            throw new Error('Không thể lấy thông tin phân tích. Vui lòng thử lại.');
        }
    },

    /**
     * Lấy thống kê phân tích blockchain
     * @returns {Promise} Thống kê phân tích
     */
    getAnalysisStats: async () => {
        try {
            console.log('📊 Fetching analysis statistics...');

            const response = await backendAPI.get('/blockchain/stats');

            console.log('✅ Analysis stats fetched:', response);

            return response.data?.stats || response.stats || {
                totalAnalyses: 0,
                riskDistribution: { high: 0, medium: 0, low: 0 },
                avgFraudProbability: 0,
                uniqueWalletsCount: 0
            };

        } catch (error) {
            console.error('❌ Failed to fetch analysis stats:', error);

            // Trả về stats trống thay vì throw error
            return {
                totalAnalyses: 0,
                riskDistribution: { high: 0, medium: 0, low: 0 },
                avgFraudProbability: 0,
                uniqueWalletsCount: 0
            };
        }
    },

    /**
     * Cập nhật độ hiển thị của phân tích (public/private)
     * @param {string} analysisId - ID phân tích
     * @param {boolean} isPublic - Có công khai không
     * @returns {Promise} Kết quả cập nhật
     */
    updateAnalysisVisibility: async (analysisId, isPublic) => {
        try {
            console.log(`🔄 Updating analysis visibility: ${analysisId} -> ${isPublic ? 'public' : 'private'}`);

            const response = await backendAPI.put(`/blockchain/analysis/${analysisId}/visibility`, {
                isPublic
            });

            console.log('✅ Analysis visibility updated');

            return response;

        } catch (error) {
            console.error('❌ Failed to update analysis visibility:', error);
            throw new Error('Không thể cập nhật độ hiển thị. Vui lòng thử lại.');
        }
    },

    /**
     * Thêm tag cho phân tích
     * @param {string} analysisId - ID phân tích
     * @param {string} tag - Tag cần thêm
     * @returns {Promise} Kết quả thêm tag
     */
    addAnalysisTag: async (analysisId, tag) => {
        try {
            console.log(`🏷️ Adding tag to analysis: ${analysisId} -> ${tag}`);

            const response = await backendAPI.post(`/blockchain/analysis/${analysisId}/tags`, {
                tag
            });

            console.log('✅ Tag added successfully');

            return response;

        } catch (error) {
            console.error('❌ Failed to add analysis tag:', error);
            throw new Error('Không thể thêm tag. Vui lòng thử lại.');
        }
    },

    /**
     * Xóa tag khỏi phân tích
     * @param {string} analysisId - ID phân tích
     * @param {string} tag - Tag cần xóa
     * @returns {Promise} Kết quả xóa tag
     */
    removeAnalysisTag: async (analysisId, tag) => {
        try {
            console.log(`🗑️ Removing tag from analysis: ${analysisId} -> ${tag}`);

            const response = await backendAPI.delete(`/blockchain/analysis/${analysisId}/tags/${tag}`);

            console.log('✅ Tag removed successfully');

            return response;

        } catch (error) {
            console.error('❌ Failed to remove analysis tag:', error);
            throw new Error('Không thể xóa tag. Vui lòng thử lại.');
        }
    },

    /**
     * Lấy danh sách phân tích công khai
     * @param {object} options - Tùy chọn lọc
     * @returns {Promise} Danh sách phân tích công khai
     */
    getPublicAnalyses: async (options = {}) => {
        try {
            console.log('🌐 Fetching public analyses...');

            const params = new URLSearchParams();

            if (options.risk_level) {
                params.append('risk_level', options.risk_level);
            }
            if (options.limit) {
                params.append('limit', options.limit);
            }
            if (options.offset) {
                params.append('offset', options.offset);
            }

            const queryString = params.toString();
            const url = `/blockchain/public${queryString ? `?${queryString}` : ''}`;

            const response = await backendAPI.get(url);

            console.log('✅ Public analyses fetched:', response);

            return {
                analyses: response.data?.analyses || response.analyses || [],
                pagination: response.data?.pagination || response.pagination || {
                    total: 0,
                    limit: 20,
                    offset: 0,
                    hasMore: false
                }
            };

        } catch (error) {
            console.error('❌ Failed to fetch public analyses:', error);

            // Trả về dữ liệu trống thay vì throw error
            return {
                analyses: [],
                pagination: {
                    total: 0,
                    limit: 20,
                    offset: 0,
                    hasMore: false
                }
            };
        }
    },

    /**
     * Kiểm tra trạng thái AI server
     * @returns {Promise} Trạng thái server
     */
    checkAIServerHealth: async () => {
        try {
            const response = await aiServerAPI.get('/health');

            return {
                status: 'healthy',
                uptime: response.uptime,
                models_loaded: response.models_loaded
            };

        } catch (error) {
            console.error('❌ AI Server health check failed:', error);

            return {
                status: 'unavailable',
                uptime: 0,
                models_loaded: {
                    fraud_detector: false,
                    llm_blockchain: false,
                    llm_study: false
                }
            };
        }
    }
};

export default blockchainService;