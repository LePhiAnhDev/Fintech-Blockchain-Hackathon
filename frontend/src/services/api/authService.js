import { backendAPI } from './apiClient';

/**
 * Dịch vụ xử lý xác thực người dùng
 */
const authService = {
    /**
     * Đăng nhập bằng địa chỉ ví và chữ ký
     * @param {string} walletAddress - Địa chỉ ví
     * @param {string} signature - Chữ ký
     * @returns {Promise} Thông tin người dùng đã đăng nhập
     */
    login: (walletAddress, signature) =>
        backendAPI.post('/auth/login', { walletAddress, signature }),

    /**
     * Đăng xuất khỏi hệ thống
     * @returns {Promise} Kết quả đăng xuất
     */
    logout: () =>
        backendAPI.post('/auth/logout'),

    /**
     * Lấy thông tin profile người dùng
     * @returns {Promise} Thông tin profile người dùng
     */
    getProfile: () =>
        backendAPI.get('/auth/profile'),

    /**
     * Xác thực token
     * @returns {Promise} Kết quả xác thực
     */
    verifyToken: () =>
        backendAPI.get('/auth/verify'),

    /**
     * Lấy thống kê người dùng
     * @returns {Promise} Thông tin thống kê
     */
    getStats: () =>
        backendAPI.get('/auth/stats'),

    /**
     * Cập nhật thông tin người dùng
     * @param {Object} profileData - Dữ liệu cần cập nhật
     * @returns {Promise} Thông tin người dùng đã cập nhật
     */
    updateProfile: (profileData) =>
        backendAPI.put('/auth/profile', profileData),
};

export default authService;