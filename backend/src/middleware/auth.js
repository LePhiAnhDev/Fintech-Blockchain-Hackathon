import jwt from 'jsonwebtoken';
import User from '../models/User.js';

// Generate JWT token
export const generateToken = (userId, walletAddress) => {
    return jwt.sign(
        {
            userId,
            walletAddress: walletAddress.toLowerCase(),
            iat: Math.floor(Date.now() / 1000)
        },
        process.env.JWT_SECRET,
        { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
    );
};

// Verify JWT token middleware
export const authenticate = async (req, res, next) => {
    try {
        let token;

        // Check for token in Authorization header
        if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
            token = req.headers.authorization.split(' ')[1];
        }

        if (!token) {
            return res.status(401).json({
                success: false,
                message: 'Access token is required'
            });
        }

        // Verify token
        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        // Check if user still exists
        const user = await User.findById(decoded.userId);
        if (!user || !user.isActive) {
            return res.status(401).json({
                success: false,
                message: 'User no longer exists or is inactive'
            });
        }

        // Check if wallet address matches
        if (user.walletAddress.toLowerCase() !== decoded.walletAddress.toLowerCase()) {
            return res.status(401).json({
                success: false,
                message: 'Token wallet address mismatch'
            });
        }

        // Add user to request object
        req.user = user;
        req.token = token;

        next();
    } catch (error) {
        if (error.name === 'JsonWebTokenError') {
            return res.status(401).json({
                success: false,
                message: 'Invalid token'
            });
        } else if (error.name === 'TokenExpiredError') {
            return res.status(401).json({
                success: false,
                message: 'Token expired'
            });
        } else {
            console.error('Authentication error:', error);
            return res.status(500).json({
                success: false,
                message: 'Authentication failed'
            });
        }
    }
};

// Optional authentication - doesn't fail if no token
export const optionalAuth = async (req, res, next) => {
    try {
        let token;

        if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
            token = req.headers.authorization.split(' ')[1];
        }

        if (!token) {
            return next();
        }

        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const user = await User.findById(decoded.userId);

        if (user && user.isActive && user.walletAddress.toLowerCase() === decoded.walletAddress.toLowerCase()) {
            req.user = user;
            req.token = token;
        }

        next();
    } catch (error) {
        // Continue without authentication for optional auth
        next();
    }
};

// Verify wallet ownership
export const verifyWalletOwnership = (req, res, next) => {
    const { walletAddress } = req.params;

    if (!walletAddress) {
        return res.status(400).json({
            success: false,
            message: 'Wallet address is required'
        });
    }

    if (req.user.walletAddress.toLowerCase() !== walletAddress.toLowerCase()) {
        return res.status(403).json({
            success: false,
            message: 'Access denied: wallet address mismatch'
        });
    }

    next();
};

// Rate limiting by user
export const userRateLimit = (maxRequests = 100, windowMs = 15 * 60 * 1000) => {
    const requests = new Map();

    return (req, res, next) => {
        if (!req.user) {
            return next();
        }

        const userId = req.user._id.toString();
        const now = Date.now();
        const windowStart = now - windowMs;

        // Clean old requests
        if (requests.has(userId)) {
            const userRequests = requests.get(userId).filter(time => time > windowStart);
            requests.set(userId, userRequests);
        }

        // Check current requests
        const currentRequests = requests.get(userId) || [];

        if (currentRequests.length >= maxRequests) {
            return res.status(429).json({
                success: false,
                message: 'Too many requests. Please try again later.',
                retryAfter: Math.ceil(windowMs / 1000)
            });
        }

        // Add current request
        currentRequests.push(now);
        requests.set(userId, currentRequests);

        next();
    };
};

// Admin role check (for future use)
export const requireAdmin = (req, res, next) => {
    if (!req.user) {
        return res.status(401).json({
            success: false,
            message: 'Authentication required'
        });
    }

    if (!req.user.isAdmin) {
        return res.status(403).json({
            success: false,
            message: 'Admin access required'
        });
    }

    next();
};

// Validate Ethereum address format
export const validateEthAddress = (req, res, next) => {
    const { walletAddress, address } = req.body;
    const addressToValidate = walletAddress || address;

    if (!addressToValidate) {
        return res.status(400).json({
            success: false,
            message: 'Ethereum address is required'
        });
    }

    const ethAddressRegex = /^0x[a-fA-F0-9]{40}$/;
    if (!ethAddressRegex.test(addressToValidate)) {
        return res.status(400).json({
            success: false,
            message: 'Invalid Ethereum address format'
        });
    }

    next();
};