import axios from 'axios';
import toast from 'react-hot-toast';

// Lấy URL từ biến môi trường
const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || 'http://localhost:5001';
const AI_SERVER_URL = import.meta.env.VITE_AI_SERVER_URL || 'http://localhost:8000';

/**
 * Tạo axios instance cho backend API
 */
export const backendAPI = axios.create({
    baseURL: `${BACKEND_URL}/api`, // Thêm /api vào baseURL
    timeout: 30000,
    headers: {
        'Content-Type': 'application/json',
    },
});

/**
 * Tạo axios instance cho AI server
 */
export const aiServerAPI = axios.create({
    baseURL: AI_SERVER_URL,
    timeout: 60000, // Timeout dài hơn cho xử lý AI
    headers: {
        'Content-Type': 'application/json',
    },
});

// Request interceptors
backendAPI.interceptors.request.use((config) => {
    // Thêm token xác thực nếu có
    const token = localStorage.getItem('auth_token');
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

aiServerAPI.interceptors.request.use((config) => {
    // Thêm token xác thực nếu có
    const token = localStorage.getItem('auth_token');
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

// Xử lý response
const handleResponse = (response) => {
    // Only log upload responses for debugging
    if (response.config?.url?.includes('/upload-document')) {
        console.log('📥 Upload Raw response:', response);
        console.log('📄 Upload Response data:', response.data);
        console.log('📊 Upload Response status:', response.status);
    }

    // Return the data, or the full response if data is undefined
    return response.data !== undefined ? response.data : response;
};

// Xử lý lỗi một cách thống nhất
const handleError = (error) => {
    console.error('API Error:', error);
    console.error('Error config:', error.config?.url);
    console.error('Error response:', error.response);

    // Don't show toast for upload errors - let component handle them
    const isUploadRequest = error.config?.url?.includes('/upload-document');

    if (error.response) {
        const { status, data } = error.response;

        if (!isUploadRequest) {
            switch (status) {
                case 400:
                    toast.error(data.message || 'Bad request');
                    break;
                case 401:
                    toast.error('Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.');
                    // Xử lý đăng xuất
                    localStorage.removeItem('auth_token');
                    // Lưu lại trang hiện tại để redirect sau khi đăng nhập lại
                    if (window.location.pathname !== '/' && !window.location.pathname.includes('/login')) {
                        localStorage.setItem('redirect_after_login', window.location.pathname);
                        // Reload để reset trạng thái và chuyển về trang đăng nhập
                        setTimeout(() => {
                            window.location.reload();
                        }, 1500);
                    }
                    break;
                case 403:
                    toast.error('Bạn không có quyền truy cập vào tài nguyên này');
                    break;
                case 404:
                    toast.error('Không tìm thấy tài nguyên yêu cầu');
                    break;
                case 429:
                    toast.error('Quá nhiều yêu cầu. Vui lòng thử lại sau.');
                    break;
                case 500:
                    toast.error('Lỗi máy chủ. Vui lòng thử lại sau.');
                    break;
                default:
                    toast.error(data.message || 'Đã xảy ra lỗi không xác định');
            }
        }
    } else if (error.request) {
        if (!isUploadRequest) {
            toast.error('Lỗi kết nối mạng. Vui lòng kiểm tra kết nối của bạn.');
        }
    } else {
        if (!isUploadRequest) {
            toast.error('Đã xảy ra lỗi không mong muốn');
        }
    }

    return Promise.reject(error);
};

// Thêm interceptors
backendAPI.interceptors.response.use(handleResponse, handleError);
aiServerAPI.interceptors.response.use(handleResponse, handleError);

// Utility functions for file operations
export const uploadFile = async (file, endpoint = '/upload') => {
    const formData = new FormData();
    formData.append('file', file);

    return backendAPI.post(endpoint, formData, {
        headers: {
            'Content-Type': 'multipart/form-data',
        },
    });
};

export const downloadFile = async (fileId, filename) => {
    try {
        const response = await backendAPI.get(`/files/${fileId}`, {
            responseType: 'blob',
        });

        // Tạo URL cho blob và tạo link tải xuống
        const url = window.URL.createObjectURL(new Blob([response]));
        const link = document.createElement('a');
        link.href = url;
        link.setAttribute('download', filename);
        document.body.appendChild(link);
        link.click();

        // Dọn dẹp sau khi tải xuống
        setTimeout(() => {
            document.body.removeChild(link);
            window.URL.revokeObjectURL(url);
        }, 100);

        return true;
    } catch (error) {
        console.error('Download error:', error);
        toast.error('Không thể tải xuống tệp');
        return false;
    }
};

// Các tiện ích bổ sung cho API
export const api = {
    // Kiểm tra trạng thái đăng nhập
    isAuthenticated: () => {
        return !!localStorage.getItem('auth_token');
    },

    // Xóa dữ liệu đăng nhập
    clearAuth: () => {
        localStorage.removeItem('auth_token');
    },

    // Lấy token hiện tại
    getToken: () => {
        return localStorage.getItem('auth_token');
    },

    // Lưu token
    setToken: (token) => {
        localStorage.setItem('auth_token', token);
        // Cập nhật header cho tất cả các requests trong tương lai
        backendAPI.defaults.headers.common['Authorization'] = `Bearer ${token}`;
        aiServerAPI.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    }
};