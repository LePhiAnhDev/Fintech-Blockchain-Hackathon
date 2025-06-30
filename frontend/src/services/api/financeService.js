import { backendAPI, aiServerAPI } from './apiClient';

/**
 * Dịch vụ quản lý tài chính
 */
const financeService = {
    /**
     * Thêm giao dịch mới
     * @param {string} type - Loại giao dịch ('income' hoặc 'expense')
     * @param {number} amount - Số tiền
     * @param {string} description - Mô tả giao dịch
     * @param {string} category - Danh mục (tùy chọn)
     * @param {Array} tags - Thẻ đánh dấu (tùy chọn)
     * @returns {Promise} Thông tin giao dịch đã tạo
     */
    addTransaction: (type, amount, description, category = null, tags = []) => {
        const data = {
            type,
            amount,
            description
        };

        if (category) data.category = category;
        if (tags && tags.length > 0) data.tags = tags;

        return backendAPI.post('/finance/transactions', data);
    },

    /**
     * Lấy danh sách giao dịch
     * @param {number} limit - Số lượng giao dịch tối đa
     * @param {number} offset - Vị trí bắt đầu
     * @param {Object} filters - Bộ lọc bổ sung (loại, ngày bắt đầu, ngày kết thúc...)
     * @returns {Promise} Danh sách giao dịch
     */
    getTransactions: (limit = 50, offset = 0, filters = {}) => {
        const params = {
            limit,
            offset,
            ...filters
        };

        return backendAPI.get('/finance/transactions', { params });
    },

    /**
     * Lấy tổng quan tài chính
     * @param {Object} params - Tham số bổ sung (khoảng thời gian...)
     * @returns {Promise} Thông tin tổng quan tài chính
     */
    getSummary: (params = {}) => {
        return backendAPI.get('/finance/summary', { params });
    },

    /**
     * Xóa giao dịch
     * @param {string} transactionId - ID giao dịch cần xóa
     * @returns {Promise} Kết quả xóa giao dịch
     */
    deleteTransaction: (transactionId) => {
        return backendAPI.delete(`/finance/transactions/${transactionId}`);
    },

    /**
     * Cập nhật thông tin giao dịch
     * @param {string} transactionId - ID giao dịch cần cập nhật
     * @param {object} data - Dữ liệu cần cập nhật
     * @returns {Promise} Thông tin giao dịch đã cập nhật
     */
    updateTransaction: (transactionId, data) => {
        return backendAPI.put(`/finance/transactions/${transactionId}`, data);
    },

    /**
     * Lấy thông tin phân tích theo danh mục
     * @param {string} type - Loại giao dịch (tùy chọn)
     * @returns {Promise} Thống kê theo danh mục
     */
    getCategoryBreakdown: (type = null) => {
        const params = {};
        if (type) params.type = type;

        return backendAPI.get('/finance/categories', { params });
    },

    /**
     * Lấy insights tài chính
     * @returns {Promise} Thông tin insights
     */
    getInsights: () => {
        return backendAPI.get('/finance/insights');
    },

    /**
     * Thêm nhiều giao dịch cùng lúc
     * @param {Array} transactions - Danh sách giao dịch
     * @returns {Promise} Kết quả thêm giao dịch
     */
    addBulkTransactions: (transactions) => {
        return backendAPI.post('/finance/bulk', { transactions });
    },

    /**
     * Lấy chi tiêu theo ngày
     * @param {string} date - Ngày cần truy vấn (YYYY-MM-DD)
     * @returns {Promise} Danh sách chi tiêu trong ngày
     */
    getDailyExpenses: (date = null) => {
        const params = {};
        if (date) params.date = date;
        return backendAPI.get('/finance/daily-expenses', { params });
    },

    /**
     * Lấy chi tiêu tháng hiện tại
     * @returns {Promise} Thông tin chi tiêu tháng này
     */
    getMonthlyExpenses: () => {
        return backendAPI.get('/finance/monthly-expenses');
    },

    /**
     * Lấy tổng thu chi hôm nay
     * @returns {Promise} Thông tin thu chi hôm nay
     */
    getTodaySummary: () => {
        return backendAPI.get('/finance/today-summary');
    },

    /**
     * Lưu giao dịch lên blockchain
     * @param {string} type - Loại giao dịch
     * @param {number} amount - Số tiền
     * @param {string} description - Mô tả
     * @param {string} category - Danh mục
     * @param {Array} tags - Thẻ đánh dấu
     * @returns {Promise} Kết quả lưu blockchain
     */
    saveToBlockchain: (type, amount, description, category = null, tags = []) => {
        const data = {
            type,
            amount,
            description
        };

        if (category) data.category = category;
        if (tags && tags.length > 0) data.tags = tags;

        return backendAPI.post('/finance/blockchain-transaction', data);
    },

    /**
     * Lấy dữ liệu chi tiết cho lập kế hoạch thông minh
     * @returns {Promise} Dữ liệu tài chính chi tiết
     */
    getDetailedFinancialData: () => {
        return backendAPI.get('/finance/detailed-summary');
    }
};

/**
 * Dịch vụ AI tài chính
 */
export const financeAIService = {
    /**
     * Xử lý lệnh tài chính qua AI
     * @param {string} command - Lệnh cần xử lý
     * @returns {Promise} Kết quả xử lý lệnh
     */
    processCommand: (command) => {
        return aiServerAPI.post('/finance-ai', { command });
    },

    /**
     * Lấy thông tin phân tích tài chính
     * @param {Array} transactions - Dữ liệu giao dịch (tùy chọn)
     * @param {string} period - Khoảng thời gian ('month', 'year', etc.)
     * @returns {Promise} Thông tin phân tích
     */
    getInsights: (transactions = [], period = 'month') => {
        return aiServerAPI.post('/finance-insights', {
            transactions,
            period
        });
    },

    /**
     * Tạo báo cáo tài chính
     * @param {string} period - Khoảng thời gian ('month', 'year', etc.)
     * @returns {Promise} Báo cáo tài chính
     */
    generateReport: (period = 'month') => {
        return aiServerAPI.post('/finance-report', { period });
    },

    /**
     * Xử lý query tài chính với dữ liệu từ backend
     * @param {string} queryType - Loại query
     * @param {Object} data - Dữ liệu từ backend
     * @returns {Promise} Kết quả query
     */
    processQuery: (queryType, data) => {
        return aiServerAPI.post('/finance-query', {
            query_type: queryType,
            data: data
        });
    },

    /**
     * Tạo kế hoạch tài chính thông minh bằng AI
     * @param {Object} planningData - Dữ liệu tài chính và mục tiêu
     * @returns {Promise} Kế hoạch từ AI
     */
    generateSmartPlan: (planningData) => {
        return aiServerAPI.post('/smart-planning', planningData);
    }
};

export default financeService;