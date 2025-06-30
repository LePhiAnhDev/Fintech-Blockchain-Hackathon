/**
 * Công cụ định dạng và xử lý chuỗi
 */

/**
 * Định dạng số tiền theo đơn vị tiền tệ Việt Nam
 * @param {number} amount - Số tiền cần định dạng
 * @returns {string} Chuỗi đã định dạng
 */
export const formatCurrency = (amount) => {
    // Sử dụng Intl.NumberFormat để định dạng tiền tệ
    return new Intl.NumberFormat('vi-VN', {
        style: 'currency',
        currency: 'VND',
        maximumFractionDigits: 0
    }).format(amount);
};

/**
 * Định dạng số tiền dạng rút gọn
 * @param {number} amount - Số tiền cần định dạng
 * @returns {string} Chuỗi đã định dạng rút gọn
 */
export const formatShortAmount = (amount) => {
    if (amount >= 1000000000) {
        return `${(amount / 1000000000).toFixed(1)}B`;
    } else if (amount >= 1000000) {
        return `${(amount / 1000000).toFixed(1)}Tr`;
    } else if (amount >= 1000) {
        return `${(amount / 1000).toFixed(0)}K`;
    } else {
        return amount.toString();
    }
};

/**
 * Phân tích lệnh tài chính từ ngôn ngữ tự nhiên
 * @param {string} command - Lệnh cần phân tích
 * @returns {Object|null} Thông tin đã phân tích hoặc null nếu không hợp lệ
 */
export const parseFinanceCommand = (command) => {
    if (!command) return null;

    command = command.trim();

    // Mẫu regex cho các định dạng lệnh phổ biến
    const patterns = {
        // Mẫu: [+/-]<số><đơn vị> <mô tả>
        // Ví dụ: "+7tr lương", "25k cafe", "-150k ăn trưa"
        main: /^([+\-])?(\d+(?:[,.]\d+)?)(k|tr|m|triệu|nghìn)?(?:\s+(.+))?$/i,

        // Mẫu thay thế: <mô tả> <số><đơn vị>
        // Ví dụ: "lương 7tr", "cafe 25k"
        alternative: /^(.+?)(?:\s+)(\d+(?:[,.]\d+)?)(k|tr|m|triệu|nghìn)$/i
    };

    // Kiểm tra mẫu chính
    const mainMatch = command.match(patterns.main);
    if (mainMatch) {
        const [, sign, amountStr, unit, description] = mainMatch;

        // Xử lý số tiền
        let amount = parseFloat(amountStr.replace(',', '.'));
        if (isNaN(amount) || amount <= 0) return null;

        // Xử lý đơn vị
        if (unit) {
            const unitLower = unit.toLowerCase();
            if (unitLower === 'k' || unitLower === 'nghìn') {
                amount *= 1000;
            } else if (unitLower === 'tr' || unitLower === 'm' || unitLower === 'triệu') {
                amount *= 1000000;
            }
        }

        // Xác định loại giao dịch (thu nhập hoặc chi tiêu)
        let type = 'expense'; // Mặc định là chi tiêu
        if (sign === '+') {
            type = 'income';
        } else if (description) {
            // Kiểm tra các từ khóa thu nhập
            const incomeKeywords = ['lương', 'thưởng', 'thu', 'nhận', 'bán', 'làm thêm', 'gia sư', 'đầu tư', 'cổ tức'];
            for (const keyword of incomeKeywords) {
                if (description.toLowerCase().includes(keyword)) {
                    type = 'income';
                    break;
                }
            }
        }

        return {
            type,
            amount,
            description: description || (type === 'income' ? 'Thu nhập' : 'Chi tiêu')
        };
    }

    // Kiểm tra mẫu thay thế
    const altMatch = command.match(patterns.alternative);
    if (altMatch) {
        const [, description, amountStr, unit] = altMatch;

        // Xử lý số tiền
        let amount = parseFloat(amountStr.replace(',', '.'));
        if (isNaN(amount) || amount <= 0) return null;

        // Xử lý đơn vị
        if (unit) {
            const unitLower = unit.toLowerCase();
            if (unitLower === 'k' || unitLower === 'nghìn') {
                amount *= 1000;
            } else if (unitLower === 'tr' || unitLower === 'm' || unitLower === 'triệu') {
                amount *= 1000000;
            }
        }

        // Xác định loại giao dịch (thu nhập hoặc chi tiêu)
        let type = 'expense'; // Mặc định là chi tiêu

        // Kiểm tra các từ khóa thu nhập
        const incomeKeywords = ['lương', 'thưởng', 'thu', 'nhận', 'bán', 'làm thêm', 'gia sư', 'đầu tư', 'cổ tức'];
        for (const keyword of incomeKeywords) {
            if (description.toLowerCase().includes(keyword)) {
                type = 'income';
                break;
            }
        }

        return {
            type,
            amount,
            description: description || (type === 'income' ? 'Thu nhập' : 'Chi tiêu')
        };
    }

    // Không khớp mẫu nào
    return null;
};

/**
 * Xác thực định dạng địa chỉ Ethereum
 * @param {string} address - Địa chỉ cần kiểm tra
 * @returns {boolean} Kết quả xác thực
 */
export const isValidEthAddress = (address) => {
    return /^0x[a-fA-F0-9]{40}$/.test(address);
};

/**
 * Định dạng địa chỉ Ethereum
 * @param {string} address - Địa chỉ đầy đủ
 * @param {number} startChars - Số ký tự giữ lại ở đầu
 * @param {number} endChars - Số ký tự giữ lại ở cuối
 * @returns {string} Địa chỉ đã định dạng
 */
export const formatAddress = (address, startChars = 6, endChars = 4) => {
    if (!address) return '';

    // Kiểm tra nếu address ngắn hơn tổng số ký tự cần hiển thị
    if (address.length <= startChars + endChars) {
        return address;
    }

    return `${address.substring(0, startChars)}...${address.substring(address.length - endChars)}`;
};

/**
 * Định dạng địa chỉ Ethereum với checksum
 * @param {string} address - Địa chỉ cần định dạng
 * @returns {string} Địa chỉ đã được format với checksum
 */
export const formatEthereumAddress = (address) => {
    if (!address) return '';

    // Đảm bảo address bắt đầu bằng 0x
    const cleanAddress = address.toLowerCase().startsWith('0x') ? address : `0x${address}`;

    // Trả về địa chỉ đã được format
    return formatAddress(cleanAddress, 6, 4);
};

/**
 * Sao chép văn bản vào clipboard
 * @param {string} text - Văn bản cần sao chép
 * @returns {Promise<boolean>} Promise trả về true nếu thành công
 */
export const copyToClipboard = async (text) => {
    try {
        if (navigator.clipboard && window.isSecureContext) {
            // Sử dụng modern clipboard API
            await navigator.clipboard.writeText(text);
            return true;
        } else {
            // Fallback cho các trình duyệt cũ
            const textArea = document.createElement('textarea');
            textArea.value = text;
            textArea.style.position = 'fixed';
            textArea.style.left = '-999999px';
            textArea.style.top = '-999999px';
            document.body.appendChild(textArea);
            textArea.focus();
            textArea.select();

            const result = document.execCommand('copy');
            document.body.removeChild(textArea);
            return result;
        }
    } catch (error) {
        console.error('Failed to copy text to clipboard:', error);
        return false;
    }
};

/**
 * Định dạng ngày tháng
 * @param {Date|string} date - Đối tượng ngày hoặc chuỗi ISO
 * @param {string} format - Định dạng hiển thị
 * @returns {string} Ngày đã định dạng
 */
export const formatDate = (date, format = 'full') => {
    if (!date) return '';

    const d = typeof date === 'string' ? new Date(date) : date;

    // Kiểm tra ngày hợp lệ
    if (isNaN(d.getTime())) return '';

    if (format === 'full') {
        return d.toLocaleDateString('vi-VN', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    } else if (format === 'date') {
        return d.toLocaleDateString('vi-VN', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric'
        });
    } else if (format === 'time') {
        return d.toLocaleTimeString('vi-VN', {
            hour: '2-digit',
            minute: '2-digit'
        });
    } else if (format === 'relative') {
        return formatRelativeTime(d);
    }

    return d.toLocaleString('vi-VN');
};

/**
 * Định dạng thời gian tương đối
 * @param {Date} date - Ngày cần định dạng
 * @returns {string} Thời gian tương đối
 */
export const formatRelativeTime = (date) => {
    const now = new Date();
    const diffInSeconds = Math.floor((now - date) / 1000);

    if (diffInSeconds < 60) {
        return 'Vừa xong';
    } else if (diffInSeconds < 3600) {
        const minutes = Math.floor(diffInSeconds / 60);
        return `${minutes} phút trước`;
    } else if (diffInSeconds < 86400) {
        const hours = Math.floor(diffInSeconds / 3600);
        return `${hours} giờ trước`;
    } else if (diffInSeconds < 2592000) {
        const days = Math.floor(diffInSeconds / 86400);
        return `${days} ngày trước`;
    } else {
        return formatDate(date, 'date');
    }
};

/**
 * Định dạng số với đơn vị
 * @param {number} number - Số cần định dạng
 * @param {number} decimals - Số chữ số thập phân
 * @returns {string} Số đã định dạng
 */
export const formatNumber = (number, decimals = 0) => {
    if (typeof number !== 'number' || isNaN(number)) {
        return '0';
    }

    return number.toLocaleString('vi-VN', {
        minimumFractionDigits: decimals,
        maximumFractionDigits: decimals
    });
};

/**
 * Định dạng phần trăm
 * @param {number} value - Giá trị cần định dạng (0-100)
 * @param {number} decimals - Số chữ số thập phân
 * @returns {string} Phần trăm đã định dạng
 */
export const formatPercentage = (value, decimals = 1) => {
    if (typeof value !== 'number' || isNaN(value)) {
        return '0%';
    }

    return `${value.toFixed(decimals)}%`;
};

/**
 * Định dạng kích thước file
 * @param {number} bytes - Kích thước tính bằng bytes
 * @returns {string} Kích thước đã định dạng
 */
export const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';

    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));

    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};

/**
 * Định dạng thời gian khoảng cách
 * @param {number} minutes - Số phút
 * @returns {string} Thời gian đã định dạng
 */
export const formatDuration = (minutes) => {
    if (!minutes || minutes === 0) return '0 phút';

    const hours = Math.floor(minutes / 60);
    const remainingMinutes = Math.floor(minutes % 60);

    if (hours > 24) {
        const days = Math.floor(hours / 24);
        const remainingHours = hours % 24;

        if (remainingHours === 0) {
            return `${days} ngày`;
        } else {
            return `${days} ngày ${remainingHours} giờ`;
        }
    } else if (hours > 0) {
        if (remainingMinutes === 0) {
            return `${hours} giờ`;
        } else {
            return `${hours} giờ ${remainingMinutes} phút`;
        }
    } else {
        return `${remainingMinutes} phút`;
    }
};

/**
 * Cắt ngắn văn bản
 * @param {string} text - Văn bản cần cắt ngắn
 * @param {number} maxLength - Độ dài tối đa
 * @returns {string} Văn bản đã cắt ngắn
 */
export const truncateText = (text, maxLength = 100) => {
    if (!text) return '';

    if (text.length <= maxLength) {
        return text;
    }

    return text.substring(0, maxLength) + '...';
};

/**
 * Chuyển đổi snake_case thành Title Case
 * @param {string} str - Chuỗi snake_case
 * @returns {string} Chuỗi Title Case
 */
export const snakeToTitle = (str) => {
    return str
        .split('_')
        .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
        .join(' ');
};

/**
 * Validate và format URL
 * @param {string} url - URL cần format
 * @returns {string} URL đã được format
 */
export const formatUrl = (url) => {
    if (!url) return '';

    // Thêm protocol nếu thiếu
    if (!/^https?:\/\//i.test(url)) {
        return `https://${url}`;
    }

    return url;
};

/**
 * Tạo slug từ chuỗi
 * @param {string} text - Chuỗi cần tạo slug
 * @returns {string} Slug đã được tạo
 */
export const createSlug = (text) => {
    return text
        .toLowerCase()
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '') // Loại bỏ dấu
        .replace(/[^a-z0-9\s-]/g, '') // Chỉ giữ lại chữ, số, space, và dấu gạch ngang
        .trim()
        .replace(/\s+/g, '-') // Thay space bằng dấu gạch ngang
        .replace(/-+/g, '-'); // Loại bỏ dấu gạch ngang trùng lặp
};