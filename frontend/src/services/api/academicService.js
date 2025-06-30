import { backendAPI } from './apiClient';

/**
 * Academic Service - API calls for Academic Hub
 */
const academicService = {
    /**
     * Get contract information
     */
    async getContractInfo() {
        try {
            const response = await backendAPI.get('/academic/contract-info');
            return response.data;
        } catch (error) {
            console.error('Get contract info error:', error);
            throw error.response?.data || { success: false, message: error.message };
        }
    },

    /**
     * Upload document to IPFS and prepare NFT metadata
     * @param {FormData} formData - Form data containing file and metadata
     */
    async uploadDocument(formData) {
        try {
            console.log('🚀 Sending upload request to backend...');
            const response = await backendAPI.post('/academic/upload-document', formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
                // Add timeout for large file uploads
                timeout: 120000, // 2 minutes - enough for IPFS upload
            });

            console.log('✅ Upload response received:', {
                success: response?.success,
                hasData: !!response?.data,
                message: response?.message
            });
            console.log('📄 Full response:', response);

            return response;
        } catch (error) {
            console.error('❌ Upload document error:', error);
            console.error('❌ Error response:', error.response?.data);
            console.error('❌ Error status:', error.response?.status);
            throw error.response?.data || { success: false, message: error.message };
        }
    },

    /**
     * Get active NFT listings
     */
    async getListings() {
        try {
            const response = await backendAPI.get('/academic/listings');
            return response.data;
        } catch (error) {
            console.error('Get listings error:', error);
            throw error.response?.data || { success: false, message: error.message };
        }
    },

    /**
     * Get user's NFTs
     */
    async getUserNFTs() {
        try {
            const response = await backendAPI.get('/academic/my-nfts');
            return response.data;
        } catch (error) {
            console.error('Get user NFTs error:', error);
            throw error.response?.data || { success: false, message: error.message };
        }
    },

    /**
     * Get NFT details by token ID
     * @param {string} tokenId - Token ID
     */
    async getNFTDetails(tokenId) {
        try {
            const response = await backendAPI.get(`/academic/nft/${tokenId}`);
            return response.data;
        } catch (error) {
            console.error('Get NFT details error:', error);
            throw error.response?.data || { success: false, message: error.message };
        }
    },

    /**
     * Test IPFS connection
     */
    async testIPFS() {
        try {
            const response = await backendAPI.get('/academic/test-ipfs');
            return response.data;
        } catch (error) {
            console.error('IPFS test error:', error);
            throw error.response?.data || { success: false, message: error.message };
        }
    },

    /**
     * Helper function to format file size
     * @param {number} bytes - File size in bytes
     */
    formatFileSize(bytes) {
        if (bytes === 0) return '0 Bytes';

        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));

        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    },

    /**
     * Helper function to validate file type
     * @param {File} file - File to validate
     * @param {Array} allowedTypes - Array of allowed file extensions
     */
    validateFileType(file, allowedTypes = ['pdf', 'docx', 'txt', 'md', 'png', 'jpg', 'jpeg']) {
        if (!file) return { valid: false, error: 'No file selected' };

        const fileExtension = file.name.split('.').pop().toLowerCase();

        if (!allowedTypes.includes(fileExtension)) {
            return {
                valid: false,
                error: `File type .${fileExtension} is not supported. Allowed types: ${allowedTypes.join(', ')}`
            };
        }

        // Check file size (50MB limit)
        const maxSize = 50 * 1024 * 1024; // 50MB
        if (file.size > maxSize) {
            return {
                valid: false,
                error: `File size (${this.formatFileSize(file.size)}) exceeds the maximum limit of 50MB`
            };
        }

        return { valid: true };
    },

    /**
     * Helper function to extract file type from filename
     * @param {string} filename - Filename
     */
    getFileType(filename) {
        return filename.split('.').pop().toLowerCase();
    },

    /**
     * Helper function to get file icon based on type
     * @param {string} fileType - File extension
     */
    getFileIcon(fileType) {
        switch (fileType?.toLowerCase()) {
            case 'pdf':
                return '📄';
            case 'docx':
            case 'doc':
                return '📝';
            case 'txt':
                return '📄';
            case 'md':
                return '📝';
            case 'png':
            case 'jpg':
            case 'jpeg':
                return '🖼️';
            default:
                return '📁';
        }
    },

    /**
     * Helper function to format Ethereum address
     * @param {string} address - Ethereum address
     */
    formatAddress(address) {
        if (!address) return '';
        return `${address.slice(0, 6)}...${address.slice(-4)}`;
    },

    /**
     * Helper function to format date
     * @param {string} dateString - ISO date string
     */
    formatDate(dateString) {
        if (!dateString) return '';

        try {
            const date = new Date(dateString);
            return date.toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'short',
                day: 'numeric',
                hour: '2-digit',
                minute: '2-digit'
            });
        } catch (error) {
            return dateString;
        }
    },

    /**
     * Helper function to generate IPFS gateway URL
     * @param {string} hash - IPFS hash
     * @param {string} gateway - Gateway URL
     */
    getIPFSUrl(hash, gateway = 'https://gateway.pinata.cloud/ipfs/') {
        if (!hash) return '';
        return `${gateway}${hash}`;
    },

    /**
     * Helper function to validate Ethereum address
     * @param {string} address - Ethereum address
     */
    isValidAddress(address) {
        return /^0x[a-fA-F0-9]{40}$/.test(address);
    },

    /**
     * Helper function to validate price
     * @param {string|number} price - Price in ETH
     */
    validatePrice(price) {
        const numPrice = parseFloat(price);

        if (isNaN(numPrice) || numPrice <= 0) {
            return { valid: false, error: 'Price must be a positive number' };
        }

        if (numPrice > 1000) {
            return { valid: false, error: 'Price cannot exceed 1000 ETH' };
        }

        if (numPrice < 0.001) {
            return { valid: false, error: 'Minimum price is 0.001 ETH' };
        }

        return { valid: true };
    },

    /**
     * Helper function to calculate platform fee
     * @param {string|number} price - Price in ETH
     * @param {number} feePercent - Fee percentage (default 1%)
     */
    calculateFees(price, feePercent = 1) {
        const numPrice = parseFloat(price);
        if (isNaN(numPrice)) return { price: 0, fee: 0, net: 0 };

        const fee = numPrice * (feePercent / 100);
        const net = numPrice - fee;

        return {
            price: numPrice,
            fee: fee,
            net: net,
            feePercent: feePercent
        };
    },

    /**
     * Helper function to format ETH amount
     * @param {string|number} amount - Amount in ETH
     * @param {number} decimals - Number of decimal places
     */
    formatETH(amount, decimals = 4) {
        const num = parseFloat(amount);
        if (isNaN(num)) return '0';

        return num.toFixed(decimals).replace(/\.?0+$/, '');
    },

    /**
     * Helper function to get Sepolia explorer URL
     * @param {string} hash - Transaction hash or address
     * @param {string} type - 'tx' or 'address'
     */
    getExplorerUrl(hash, type = 'tx') {
        const baseUrl = 'https://sepolia.etherscan.io';
        return `${baseUrl}/${type}/${hash}`;
    }
};

export default academicService; 