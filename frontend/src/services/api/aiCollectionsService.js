import { aiServerAPI } from './apiClient';
import toast from 'react-hot-toast';

/**
 * Service for AI Collections functionality
 */
class AICollectionsService {

    /**
     * Generate art using prompthero/openjourney model
     */
    async generateArt(prompt, options = {}) {
        try {
            const requestData = {
                prompt,
                num_inference_steps: options.num_inference_steps || 70,
                guidance_scale: options.guidance_scale || 5.0,
                width: options.width || 512,
                height: options.height || 512,
            };

            const response = await aiServerAPI.post('/generate-art', requestData);

            if (response.success) {
                return {
                    success: true,
                    data: response
                };
            } else {
                throw new Error(response.message || 'Art generation failed');
            }
        } catch (error) {
            console.error('Art generation error:', error);
            const errorMessage = error.response?.data?.detail || error.message || 'Không thể tạo hình ảnh';
            toast.error(errorMessage);
            return {
                success: false,
                error: errorMessage
            };
        }
    }

    /**
     * Generate video using AnimateDiff-Lightning model
     */
    async generateVideo(prompt, options = {}) {
        try {
            const requestData = {
                prompt,
                num_frames: options.num_frames || 32,
                guidance_scale: options.guidance_scale || 1.0,
                num_inference_steps: options.num_inference_steps || 4,
                width: options.width || 512,
                height: options.height || 512,
            };

            // Tăng timeout riêng cho video generation (5 phút)
            const response = await aiServerAPI.post('/generate-video', requestData, {
                timeout: 300000 // 5 phút = 300000ms
            });

            if (response.success) {
                return {
                    success: true,
                    data: response
                };
            } else {
                throw new Error(response.message || 'Video generation failed');
            }
        } catch (error) {
            console.error('Video generation error:', error);
            const errorMessage = error.response?.data?.detail || error.message || 'Không thể tạo video';
            toast.error(errorMessage);
            return {
                success: false,
                error: errorMessage
            };
        }
    }

    /**
     * Generate streaming art using SDXL-Turbo model
     */
    async generateStreaming(prompt, options = {}) {
        try {
            const requestData = {
                prompt,
                num_inference_steps: options.num_inference_steps || 2,
                guidance_scale: options.guidance_scale || 0.0,
                width: options.width || 512,
                height: options.height || 512,
            };

            const response = await aiServerAPI.post('/generate-streaming', requestData);

            if (response.success) {
                return {
                    success: true,
                    data: response
                };
            } else {
                throw new Error(response.message || 'Streaming generation failed');
            }
        } catch (error) {
            console.error('Streaming generation error:', error);
            const errorMessage = error.response?.data?.detail || error.message || 'Không thể tạo ảnh streaming';
            return {
                success: false,
                error: errorMessage
            };
        }
    }

    /**
     * Load a specific model
     */
    async loadModel(modelType, forceReload = false) {
        try {
            const requestData = {
                model_type: modelType,
                force_reload: forceReload
            };

            const response = await aiServerAPI.post('/models/load', requestData);

            if (response.loaded) {
                return {
                    success: true,
                    data: response
                };
            } else {
                throw new Error(response.error || 'Model loading failed');
            }
        } catch (error) {
            console.error('Model loading error:', error);
            const errorMessage = error.response?.data?.detail || error.message || 'Không thể tải model';
            toast.error(errorMessage);
            return {
                success: false,
                error: errorMessage
            };
        }
    }

    /**
     * Unload a specific model
     */
    async unloadModel(modelType) {
        try {
            const requestData = {
                model_type: modelType
            };

            const response = await aiServerAPI.post('/models/unload', requestData);

            if (response.success) {
                return {
                    success: true,
                    data: response
                };
            } else {
                throw new Error(response.message || 'Model unloading failed');
            }
        } catch (error) {
            console.error('Model unloading error:', error);
            const errorMessage = error.response?.data?.detail || error.message || 'Không thể gỡ bỏ model';
            toast.error(errorMessage);
            return {
                success: false,
                error: errorMessage
            };
        }
    }

    /**
     * Get model manager status
     */
    async getModelStatus() {
        try {
            const response = await aiServerAPI.get('/models/manager-status');

            if (response.success) {
                return {
                    success: true,
                    data: response.data
                };
            } else {
                throw new Error('Failed to get model status');
            }
        } catch (error) {
            console.error('Model status error:', error);
            return {
                success: false,
                error: error.message || 'Không thể lấy trạng thái model'
            };
        }
    }

    /**
     * Get overall models status (existing endpoint)
     */
    async getModelsStatus() {
        try {
            const response = await aiServerAPI.get('/models/status');
            return {
                success: true,
                data: response
            };
        } catch (error) {
            console.error('Models status error:', error);
            return {
                success: false,
                error: error.message || 'Không thể lấy trạng thái models'
            };
        }
    }

    /**
     * Clear all models and GPU memory
     */
    async clearAllModels() {
        try {
            console.log('🧹 Clearing all models and GPU memory...');
            const response = await aiServerAPI.post('/models/clear-all');

            if (response.success) {
                return {
                    success: true,
                    data: response
                };
            } else {
                throw new Error(response.message || 'Failed to clear models');
            }
        } catch (error) {
            console.error('Clear all models error:', error);
            const errorMessage = error.response?.data?.detail || error.message || 'Không thể clear models';
            toast.error(errorMessage);
            return {
                success: false,
                error: errorMessage
            };
        }
    }
}

// Create and export service instance
const aiCollectionsService = new AICollectionsService();

export default aiCollectionsService; 