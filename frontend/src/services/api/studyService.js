import { backendAPI, aiServerAPI } from './apiClient';

/**
 * Dịch vụ trợ giúp học tập
 */
const studyService = {
    /**
     * Gửi tin nhắn đến chat AI
     * @param {string} message - Nội dung tin nhắn
     * @param {string} conversationId - ID cuộc hội thoại (tùy chọn)
     * @param {string} subject - Môn học (tùy chọn)
     * @param {string} difficulty - Độ khó (tùy chọn)
     * @returns {Promise} Phản hồi từ AI
     */
    sendMessage: (message, conversationId = null, subject = null, difficulty = 'intermediate') =>
        backendAPI.post('/study/chat', {
            message,
            conversation_id: conversationId,
            subject,
            difficulty
        }),

    /**
     * Lấy lịch sử cuộc hội thoại
     * @param {string} conversationId - ID cuộc hội thoại
     * @returns {Promise} Lịch sử tin nhắn
     */
    getChatHistory: (conversationId) =>
        backendAPI.get(`/study/conversations/${conversationId}`),

    /**
     * Lấy danh sách tất cả cuộc hội thoại
     * @param {Object} params - Tham số query (limit, offset)
     * @returns {Promise} Danh sách cuộc hội thoại
     */
    getConversations: (params = {}) =>
        backendAPI.get('/study/conversations', { params }),

    /**
     * Tạo cuộc hội thoại mới
     * @param {string} title - Tiêu đề cuộc hội thoại
     * @param {string} subject - Môn học
     * @returns {Promise} Thông tin cuộc hội thoại mới
     */
    createConversation: (title = 'New Conversation', subject = '') =>
        backendAPI.post('/study/conversations', { title, subject }),

    /**
     * Cập nhật cuộc hội thoại
     * @param {string} conversationId - ID cuộc hội thoại
     * @param {Object} data - Dữ liệu cập nhật
     * @returns {Promise} Kết quả cập nhật
     */
    updateConversation: (conversationId, data) =>
        backendAPI.put(`/study/conversations/${conversationId}`, data),

    /**
     * Xóa cuộc hội thoại
     * @param {string} conversationId - ID cuộc hội thoại cần xóa
     * @returns {Promise} Kết quả xóa
     */
    deleteConversation: (conversationId) =>
        backendAPI.delete(`/study/conversations/${conversationId}`),

    /**
     * Lấy thống kê học tập
     * @returns {Promise} Thống kê học tập
     */
    getStudyStats: () =>
        backendAPI.get('/study/stats'),

    /**
     * Tìm kiếm trong tin nhắn
     * @param {string} query - Từ khóa tìm kiếm
     * @param {number} limit - Giới hạn kết quả
     * @returns {Promise} Kết quả tìm kiếm
     */
    searchMessages: (query, limit = 10) =>
        backendAPI.get('/study/search', { params: { q: query, limit } }),

    /**
     * Kiểm tra trạng thái AI server
     * @returns {Promise} Trạng thái server
     */
    checkAIServerStatus: () =>
        aiServerAPI.get('/health'),
};

export default studyService;