/**
 * Công cụ validation và kiểm tra dữ liệu
 */

/**
 * Kiểm tra tính hợp lệ của địa chỉ Ethereum
 * 
 * @param {string} address - Địa chỉ cần kiểm tra
 * @returns {boolean} Kết quả kiểm tra
 */
export const isValidEthereumAddress = (address) => {
    if (!address || typeof address !== 'string') {
        return false;
    }

    // Kiểm tra format cơ bản: bắt đầu bằng 0x và có 40 ký tự hex
    const ethereumAddressRegex = /^0x[a-fA-F0-9]{40}$/;
    return ethereumAddressRegex.test(address);
};

/**
 * Kiểm tra và chuẩn hóa địa chỉ Ethereum
 * 
 * @param {string} address - Địa chỉ cần kiểm tra
 * @returns {string|null} Địa chỉ đã chuẩn hóa hoặc null nếu không hợp lệ
 */
export const normalizeEthereumAddress = (address) => {
    if (!address || typeof address !== 'string') {
        return null;
    }

    // Loại bỏ khoảng trắng
    address = address.trim();

    // Thêm 0x nếu thiếu
    if (!address.startsWith('0x')) {
        address = '0x' + address;
    }

    // Kiểm tra hợp lệ
    if (!isValidEthereumAddress(address)) {
        return null;
    }

    // Trả về địa chỉ lowercase để đảm bảo tính nhất quán
    return address.toLowerCase();
};

/**
 * Kiểm tra xem đối tượng có phải là đối tượng rỗng không
 * 
 * @param {object} obj - Đối tượng cần kiểm tra
 * @returns {boolean} Kết quả kiểm tra
 */
export const isEmptyObject = (obj) => {
    return obj && Object.keys(obj).length === 0 && obj.constructor === Object;
};

/**
 * Kiểm tra xem chuỗi có phải là chuỗi JSON hợp lệ không
 * 
 * @param {string} str - Chuỗi cần kiểm tra
 * @returns {boolean} Kết quả kiểm tra
 */
export const isValidJSON = (str) => {
    if (typeof str !== 'string') {
        return false;
    }

    try {
        JSON.parse(str);
        return true;
    } catch (e) {
        return false;
    }
};

/**
 * Kiểm tra tính hợp lệ của số tiền
 * 
 * @param {number|string} amount - Số tiền cần kiểm tra
 * @returns {boolean} Kết quả kiểm tra
 */
export const isValidAmount = (amount) => {
    if (amount === null || amount === undefined || amount === '') {
        return false;
    }

    const parsedAmount = typeof amount === 'string' ? parseFloat(amount) : amount;
    return !isNaN(parsedAmount) && parsedAmount >= 0 && isFinite(parsedAmount);
};

/**
 * Kiểm tra tính hợp lệ của chuỗi đường dẫn URL
 * 
 * @param {string} url - URL cần kiểm tra
 * @returns {boolean} Kết quả kiểm tra
 */
export const isValidURL = (url) => {
    if (!url || typeof url !== 'string') {
        return false;
    }

    try {
        new URL(url);
        return true;
    } catch (e) {
        return false;
    }
};

/**
 * Kiểm tra tính hợp lệ của địa chỉ email
 * 
 * @param {string} email - Email cần kiểm tra
 * @returns {boolean} Kết quả kiểm tra
 */
export const isValidEmail = (email) => {
    if (!email || typeof email !== 'string') {
        return false;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email.trim());
};

/**
 * Kiểm tra định dạng mật khẩu
 * 
 * @param {string} password - Mật khẩu cần kiểm tra
 * @param {object} options - Tùy chọn kiểm tra
 * @returns {boolean} Kết quả kiểm tra
 */
export const isValidPassword = (password, options = {}) => {
    if (!password || typeof password !== 'string') {
        return false;
    }

    const {
        minLength = 8,
        requireUppercase = true,
        requireLowercase = true,
        requireNumbers = true,
        requireSpecialChars = true
    } = options;

    if (password.length < minLength) return false;

    if (requireUppercase && !/[A-Z]/.test(password)) return false;
    if (requireLowercase && !/[a-z]/.test(password)) return false;
    if (requireNumbers && !/[0-9]/.test(password)) return false;
    if (requireSpecialChars && !/[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?]/.test(password)) return false;

    return true;
};

/**
 * Kiểm tra độ mạnh của mật khẩu
 * 
 * @param {string} password - Mật khẩu cần kiểm tra
 * @returns {string} Đánh giá: 'weak', 'medium', 'strong'
 */
export const getPasswordStrength = (password) => {
    if (!password || typeof password !== 'string') {
        return 'weak';
    }

    let score = 0;

    // Chiều dài
    if (password.length >= 8) score += 1;
    if (password.length >= 12) score += 1;

    // Tính phức tạp
    if (/[A-Z]/.test(password)) score += 1;
    if (/[a-z]/.test(password)) score += 1;
    if (/[0-9]/.test(password)) score += 1;
    if (/[^A-Za-z0-9]/.test(password)) score += 1;

    // Kết quả
    if (score < 3) return 'weak';
    if (score < 5) return 'medium';
    return 'strong';
};

/**
 * Kiểm tra số điện thoại Việt Nam
 * 
 * @param {string} phone - Số điện thoại cần kiểm tra
 * @returns {boolean} Kết quả kiểm tra
 */
export const isValidVietnamesePhone = (phone) => {
    if (!phone || typeof phone !== 'string') {
        return false;
    }

    // Loại bỏ khoảng trắng và dấu gạch ngang
    const cleanPhone = phone.replace(/[\s\-]/g, '');

    // Regex cho số điện thoại Việt Nam
    const phoneRegex = /^(\+84|84|0)[1-9][0-9]{8,9}$/;
    return phoneRegex.test(cleanPhone);
};

/**
 * Kiểm tra CMND/CCCD Việt Nam
 * 
 * @param {string} id - Số CMND/CCCD cần kiểm tra
 * @returns {boolean} Kết quả kiểm tra
 */
export const isValidVietnameseID = (id) => {
    if (!id || typeof id !== 'string') {
        return false;
    }

    const cleanId = id.replace(/\s/g, '');

    // CMND: 9-12 chữ số, CCCD: 12 chữ số
    const idRegex = /^[0-9]{9,12}$/;
    return idRegex.test(cleanId);
};

/**
 * Kiểm tra tính hợp lệ của ngày tháng
 * 
 * @param {string|Date} date - Ngày cần kiểm tra
 * @returns {boolean} Kết quả kiểm tra
 */
export const isValidDate = (date) => {
    if (!date) return false;

    const dateObj = typeof date === 'string' ? new Date(date) : date;
    return dateObj instanceof Date && !isNaN(dateObj.getTime());
};

/**
 * Kiểm tra xem ngày có trong tương lai không
 * 
 * @param {string|Date} date - Ngày cần kiểm tra
 * @returns {boolean} True nếu ngày trong tương lai
 */
export const isFutureDate = (date) => {
    if (!isValidDate(date)) return false;

    const dateObj = typeof date === 'string' ? new Date(date) : date;
    return dateObj > new Date();
};

/**
 * Kiểm tra xem ngày có trong quá khứ không
 * 
 * @param {string|Date} date - Ngày cần kiểm tra
 * @returns {boolean} True nếu ngày trong quá khứ
 */
export const isPastDate = (date) => {
    if (!isValidDate(date)) return false;

    const dateObj = typeof date === 'string' ? new Date(date) : date;
    return dateObj < new Date();
};

/**
 * Kiểm tra độ tuổi hợp lệ
 * 
 * @param {string|Date} birthDate - Ngày sinh
 * @param {number} minAge - Tuổi tối thiểu
 * @param {number} maxAge - Tuổi tối đa
 * @returns {boolean} Kết quả kiểm tra
 */
export const isValidAge = (birthDate, minAge = 0, maxAge = 150) => {
    if (!isValidDate(birthDate)) return false;

    const birth = typeof birthDate === 'string' ? new Date(birthDate) : birthDate;
    const now = new Date();
    const age = Math.floor((now - birth) / (365.25 * 24 * 60 * 60 * 1000));

    return age >= minAge && age <= maxAge;
};

/**
 * Kiểm tra chuỗi có chỉ chứa chữ cái không
 * 
 * @param {string} str - Chuỗi cần kiểm tra
 * @returns {boolean} Kết quả kiểm tra
 */
export const isAlphaOnly = (str) => {
    if (!str || typeof str !== 'string') return false;
    return /^[a-zA-ZÀ-ỹ\s]+$/.test(str);
};

/**
 * Kiểm tra chuỗi có chỉ chứa số không
 * 
 * @param {string} str - Chuỗi cần kiểm tra
 * @returns {boolean} Kết quả kiểm tra
 */
export const isNumericOnly = (str) => {
    if (!str || typeof str !== 'string') return false;
    return /^[0-9]+$/.test(str);
};

/**
 * Kiểm tra chuỗi có chỉ chứa chữ và số không
 * 
 * @param {string} str - Chuỗi cần kiểm tra
 * @returns {boolean} Kết quả kiểm tra
 */
export const isAlphaNumeric = (str) => {
    if (!str || typeof str !== 'string') return false;
    return /^[a-zA-Z0-9À-ỹ\s]+$/.test(str);
};

/**
 * Kiểm tra độ dài chuỗi
 * 
 * @param {string} str - Chuỗi cần kiểm tra
 * @param {number} min - Độ dài tối thiểu
 * @param {number} max - Độ dài tối đa
 * @returns {boolean} Kết quả kiểm tra
 */
export const isValidLength = (str, min = 0, max = Infinity) => {
    if (typeof str !== 'string') return false;
    return str.length >= min && str.length <= max;
};

/**
 * Kiểm tra giá trị có trong khoảng cho phép không
 * 
 * @param {number} value - Giá trị cần kiểm tra
 * @param {number} min - Giá trị tối thiểu
 * @param {number} max - Giá trị tối đa
 * @returns {boolean} Kết quả kiểm tra
 */
export const isInRange = (value, min, max) => {
    if (typeof value !== 'number' || isNaN(value)) return false;
    return value >= min && value <= max;
};

/**
 * Kiểm tra mảng có rỗng không
 * 
 * @param {Array} arr - Mảng cần kiểm tra
 * @returns {boolean} True nếu mảng rỗng
 */
export const isEmptyArray = (arr) => {
    return !Array.isArray(arr) || arr.length === 0;
};

/**
 * Kiểm tra có phải file image không
 * 
 * @param {File|string} file - File object hoặc tên file
 * @returns {boolean} Kết quả kiểm tra
 */
export const isImageFile = (file) => {
    if (!file) return false;

    const fileName = typeof file === 'string' ? file : file.name;
    const imageExtensions = /\.(jpg|jpeg|png|gif|bmp|webp|svg)$/i;

    return imageExtensions.test(fileName);
};

/**
 * Kiểm tra kích thước file
 * 
 * @param {File} file - File object
 * @param {number} maxSizeInMB - Kích thước tối đa tính bằng MB
 * @returns {boolean} Kết quả kiểm tra
 */
export const isValidFileSize = (file, maxSizeInMB = 5) => {
    if (!file || !file.size) return false;

    const maxSizeInBytes = maxSizeInMB * 1024 * 1024;
    return file.size <= maxSizeInBytes;
};

/**
 * Kiểm tra định dạng hex color
 * 
 * @param {string} color - Màu hex cần kiểm tra
 * @returns {boolean} Kết quả kiểm tra
 */
export const isValidHexColor = (color) => {
    if (!color || typeof color !== 'string') return false;

    const hexRegex = /^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/;
    return hexRegex.test(color);
};

/**
 * Kiểm tra IPv4 address
 * 
 * @param {string} ip - IP address cần kiểm tra
 * @returns {boolean} Kết quả kiểm tra
 */
export const isValidIPv4 = (ip) => {
    if (!ip || typeof ip !== 'string') return false;

    const ipv4Regex = /^((25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$/;
    return ipv4Regex.test(ip);
};

/**
 * Kiểm tra MAC address
 * 
 * @param {string} mac - MAC address cần kiểm tra
 * @returns {boolean} Kết quả kiểm tra
 */
export const isValidMACAddress = (mac) => {
    if (!mac || typeof mac !== 'string') return false;

    const macRegex = /^([0-9A-Fa-f]{2}[:-]){5}([0-9A-Fa-f]{2})$/;
    return macRegex.test(mac);
};

/**
 * Validate form data với rules
 * 
 * @param {object} data - Dữ liệu cần validate
 * @param {object} rules - Rules validation
 * @returns {object} Kết quả validation { isValid, errors }
 */
export const validateFormData = (data, rules) => {
    const errors = {};
    let isValid = true;

    for (const field in rules) {
        const fieldRules = rules[field];
        const value = data[field];

        // Required check
        if (fieldRules.required && (!value || (typeof value === 'string' && !value.trim()))) {
            errors[field] = fieldRules.required === true ? `${field} là bắt buộc` : fieldRules.required;
            isValid = false;
            continue;
        }

        // Skip other validations if field is empty and not required
        if (!value) continue;

        // Email validation
        if (fieldRules.email && !isValidEmail(value)) {
            errors[field] = 'Email không hợp lệ';
            isValid = false;
        }

        // Ethereum address validation
        if (fieldRules.ethereumAddress && !isValidEthereumAddress(value)) {
            errors[field] = 'Địa chỉ Ethereum không hợp lệ';
            isValid = false;
        }

        // Length validation
        if (fieldRules.minLength && value.length < fieldRules.minLength) {
            errors[field] = `Tối thiểu ${fieldRules.minLength} ký tự`;
            isValid = false;
        }

        if (fieldRules.maxLength && value.length > fieldRules.maxLength) {
            errors[field] = `Tối đa ${fieldRules.maxLength} ký tự`;
            isValid = false;
        }

        // Number range validation
        if (fieldRules.min !== undefined && parseFloat(value) < fieldRules.min) {
            errors[field] = `Giá trị tối thiểu là ${fieldRules.min}`;
            isValid = false;
        }

        if (fieldRules.max !== undefined && parseFloat(value) > fieldRules.max) {
            errors[field] = `Giá trị tối đa là ${fieldRules.max}`;
            isValid = false;
        }

        // Custom validation function
        if (fieldRules.custom && typeof fieldRules.custom === 'function') {
            const customResult = fieldRules.custom(value, data);
            if (customResult !== true) {
                errors[field] = customResult || 'Giá trị không hợp lệ';
                isValid = false;
            }
        }
    }

    return { isValid, errors };
};