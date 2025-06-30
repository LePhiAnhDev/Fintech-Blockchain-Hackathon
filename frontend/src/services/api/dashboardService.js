import { backendAPI } from './apiClient';

/**
 * Dịch vụ cho trang Dashboard
 */
const dashboardService = {
    /**
     * Lấy tổng quan
     * @returns {Promise} Thông tin tổng quan
     */
    getOverview: () => {
        return backendAPI.get('/dashboard/overview');
    },

    /**
     * Lấy hoạt động gần đây
     * @param {number} limit - Giới hạn số lượng
     * @returns {Promise} Danh sách hoạt động
     */
    getActivity: (limit = 10) => {
        return backendAPI.get('/dashboard/activity', { params: { limit } });
    }
};

export default dashboardService;