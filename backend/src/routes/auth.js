import express from 'express';
import { body, validationResult } from 'express-validator';
import { ethers } from 'ethers';
import User from '../models/User.js';
import { generateToken, authenticate, validateEthAddress } from '../middleware/auth.js';

const router = express.Router();

// Validation middleware
const validateLoginInput = [
    body('walletAddress')
        .isLength({ min: 42, max: 42 })
        .matches(/^0x[a-fA-F0-9]{40}$/)
        .withMessage('Invalid Ethereum address format'),
    body('signature')
        .notEmpty()
        .withMessage('Signature is required')
];

// @route   POST /api/auth/login
// @desc    Login with wallet signature
// @access  Public
router.post('/login', validateEthAddress, validateLoginInput, async (req, res) => {
    try {
        // Check validation result
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({
                success: false,
                message: 'Validation failed',
                errors: errors.array()
            });
        }

        const { walletAddress, signature } = req.body;

        // Normalize wallet address
        const normalizedAddress = walletAddress.toLowerCase();

        // For development, we'll skip signature verification
        // In production, you would verify the signature here
        if (process.env.NODE_ENV === 'production' && signature) {
            try {
                // Example message that should be signed by the frontend
                const message = `Welcome to Student AI Platform!\n\nSign this message to prove you own this wallet.\n\nWallet: ${normalizedAddress}\nTimestamp: ${Date.now()}`;

                // Verify signature (commented out for development)
                // const recoveredAddress = ethers.verifyMessage(message, signature);
                // if (recoveredAddress.toLowerCase() !== normalizedAddress) {
                //   return res.status(401).json({
                //     success: false,
                //     message: 'Invalid signature'
                //   });
                // }
            } catch (error) {
                return res.status(401).json({
                    success: false,
                    message: 'Invalid signature format'
                });
            }
        }

        // Find or create user
        let user = await User.findByWallet(normalizedAddress);

        if (!user) {
            // Create new user
            user = new User({
                walletAddress: normalizedAddress,
                name: `User ${normalizedAddress.substring(0, 8)}`,
                preferences: {
                    theme: 'dark',
                    language: 'vi'
                }
            });
            await user.save();
            console.log(`✅ New user created: ${normalizedAddress}`);
        } else {
            // Update last active date
            user.stats.lastActiveDate = new Date();
            await user.save();
        }

        // Generate JWT token
        const token = generateToken(user._id, user.walletAddress);

        res.status(200).json({
            success: true,
            message: 'Login successful',
            data: {
                user: {
                    id: user._id,
                    walletAddress: user.walletAddress,
                    name: user.name,
                    preferences: user.preferences,
                    stats: user.stats,
                    createdAt: user.createdAt
                },
                token
            }
        });

    } catch (error) {
        console.error('Login error:', error);
        res.status(500).json({
            success: false,
            message: 'Login failed',
            error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
        });
    }
});

// @route   POST /api/auth/logout
// @desc    Logout user (invalidate token)
// @access  Private
router.post('/logout', authenticate, async (req, res) => {
    try {
        // In a real application, you might want to blacklist the token
        // For now, we'll just send a success response
        res.status(200).json({
            success: true,
            message: 'Logout successful'
        });
    } catch (error) {
        console.error('Logout error:', error);
        res.status(500).json({
            success: false,
            message: 'Logout failed'
        });
    }
});

// @route   GET /api/auth/profile
// @desc    Get user profile
// @access  Private
router.get('/profile', authenticate, async (req, res) => {
    try {
        const user = await User.findById(req.user._id).select('-__v');

        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'User not found'
            });
        }

        res.status(200).json({
            success: true,
            data: {
                user: {
                    id: user._id,
                    walletAddress: user.walletAddress,
                    name: user.name,
                    email: user.email,
                    preferences: user.preferences,
                    stats: user.stats,
                    createdAt: user.createdAt,
                    updatedAt: user.updatedAt
                }
            }
        });

    } catch (error) {
        console.error('Get profile error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to get profile'
        });
    }
});

// @route   PUT /api/auth/profile
// @desc    Update user profile
// @access  Private
router.put('/profile', authenticate, [
    body('name').optional().isLength({ min: 1, max: 100 }).withMessage('Name must be 1-100 characters'),
    body('email').optional().isEmail().withMessage('Invalid email format'),
    body('preferences.theme').optional().isIn(['light', 'dark']).withMessage('Theme must be light or dark'),
    body('preferences.language').optional().isIn(['vi', 'en']).withMessage('Language must be vi or en')
], async (req, res) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({
                success: false,
                message: 'Validation failed',
                errors: errors.array()
            });
        }

        const updates = {};
        const allowedUpdates = ['name', 'email', 'preferences'];

        Object.keys(req.body).forEach(key => {
            if (allowedUpdates.includes(key)) {
                if (key === 'preferences') {
                    updates.preferences = { ...req.user.preferences, ...req.body.preferences };
                } else {
                    updates[key] = req.body[key];
                }
            }
        });

        const user = await User.findByIdAndUpdate(
            req.user._id,
            updates,
            { new: true, runValidators: true }
        ).select('-__v');

        res.status(200).json({
            success: true,
            message: 'Profile updated successfully',
            data: { user }
        });

    } catch (error) {
        console.error('Update profile error:', error);

        if (error.code === 11000) {
            return res.status(400).json({
                success: false,
                message: 'Email already exists'
            });
        }

        res.status(500).json({
            success: false,
            message: 'Failed to update profile'
        });
    }
});

// @route   GET /api/auth/verify
// @desc    Verify token validity
// @access  Private
router.get('/verify', authenticate, (req, res) => {
    res.status(200).json({
        success: true,
        message: 'Token is valid',
        data: {
            userId: req.user._id,
            walletAddress: req.user.walletAddress
        }
    });
});

// @route   DELETE /api/auth/account
// @desc    Delete user account (soft delete)
// @access  Private
router.delete('/account', authenticate, async (req, res) => {
    try {
        await User.findByIdAndUpdate(req.user._id, {
            isActive: false,
            deletedAt: new Date()
        });

        res.status(200).json({
            success: true,
            message: 'Account deactivated successfully'
        });

    } catch (error) {
        console.error('Delete account error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to delete account'
        });
    }
});

// @route   GET /api/auth/stats
// @desc    Get user statistics
// @access  Private
router.get('/stats', authenticate, async (req, res) => {
    try {
        const user = await User.findById(req.user._id);

        // You could aggregate data from other collections here
        const stats = {
            ...user.stats,
            memberSince: user.createdAt,
            lastLogin: user.stats.lastActiveDate,
            accountAge: Math.floor((new Date() - user.createdAt) / (1000 * 60 * 60 * 24)) // days
        };

        res.status(200).json({
            success: true,
            data: { stats }
        });

    } catch (error) {
        console.error('Get stats error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to get user statistics'
        });
    }
});

export default router;