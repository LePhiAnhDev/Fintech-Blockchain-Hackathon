import express from 'express';
import { body, query, validationResult } from 'express-validator';
import Analysis from '../models/Analysis.js';
import User from '../models/User.js';
import { authenticate, validateEthAddress, userRateLimit } from '../middleware/auth.js';

const router = express.Router();

// Apply authentication to all routes
router.use(authenticate);

// Validation middleware
const validateAnalysisData = [
    body('address')
        .matches(/^0x[a-fA-F0-9]{40}$/)
        .withMessage('Invalid Ethereum address format'),
    body('risk_level')
        .isIn(['LOW', 'MEDIUM', 'HIGH', 'UNKNOWN'])
        .withMessage('Risk level must be LOW, MEDIUM, HIGH, or UNKNOWN'),
    body('fraud_probability')
        .isFloat({ min: 0, max: 100 })
        .withMessage('Fraud probability must be between 0 and 100'),
    body('prediction')
        .isIn(['NORMAL', 'FRAUDULENT'])
        .withMessage('Prediction must be NORMAL or FRAUDULENT'),
    body('confidence')
        .isIn(['Low', 'Medium', 'High'])
        .withMessage('Confidence must be Low, Medium, or High')
];

const validateQueryParams = [
    query('risk_level')
        .optional()
        .isIn(['LOW', 'MEDIUM', 'HIGH', 'UNKNOWN'])
        .withMessage('Risk level must be LOW, MEDIUM, HIGH, or UNKNOWN'),
    query('limit')
        .optional()
        .isInt({ min: 1, max: 100 })
        .withMessage('Limit must be between 1 and 100'),
    query('offset')
        .optional()
        .isInt({ min: 0 })
        .withMessage('Offset must be a non-negative number')
];

// @route   POST /api/blockchain/save
// @desc    Save blockchain analysis result
// @access  Private
router.post('/save', userRateLimit(20, 15 * 60 * 1000), validateAnalysisData, async (req, res) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({
                success: false,
                message: 'Validation failed',
                errors: errors.array()
            });
        }

        const {
            address,
            risk_level,
            fraud_probability,
            prediction,
            confidence,
            account_age,
            current_balance,
            total_received,
            total_transactions,
            unique_senders,
            avg_send_interval,
            data_source,
            summarize
        } = req.body;

        // Check if analysis already exists for this wallet by this user recently
        const recentAnalysis = await Analysis.findOne({
            userId: req.user._id,
            analyzedWallet: address.toLowerCase(),
            createdAt: { $gte: new Date(Date.now() - 60 * 60 * 1000) } // within last hour
        });

        if (recentAnalysis) {
            return res.status(409).json({
                success: false,
                message: 'Analysis for this wallet already exists within the last hour',
                data: { analysis: recentAnalysis }
            });
        }

        // Create new analysis record
        const analysis = new Analysis({
            userId: req.user._id,
            requestorWallet: req.user.walletAddress,
            analyzedWallet: address.toLowerCase(),
            riskLevel: risk_level,
            fraudProbability: parseFloat(fraud_probability),
            prediction,
            confidence,
            blockchainData: {
                accountAge: account_age,
                currentBalance: current_balance,
                totalReceived: total_received,
                totalTransactions: parseInt(total_transactions) || 0,
                uniqueSenders: parseInt(unique_senders) || 0,
                avgSendInterval: avg_send_interval,
                dataSource: data_source || 'Live Blockchain (Etherscan)'
            },
            aiAnalysis: {
                summary: summarize,
                modelUsed: 'XGBoost + LLM',
                processingTime: 0
            },
            metadata: {
                apiVersion: '1.0',
                etherscanCalls: 3,
                processingDuration: 0
            }
        });

        await analysis.save();

        // Update user stats
        await req.user.updateStats('analysis');

        console.log(`✅ Analysis saved for wallet: ${address}`);

        res.status(201).json({
            success: true,
            message: 'Analysis saved successfully',
            data: { analysis }
        });

    } catch (error) {
        console.error('Save analysis error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to save analysis'
        });
    }
});

// @route   GET /api/blockchain/history
// @desc    Get user's blockchain analysis history
// @access  Private
router.get('/history', validateQueryParams, async (req, res) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({
                success: false,
                message: 'Validation failed',
                errors: errors.array()
            });
        }

        const {
            risk_level,
            limit = 20,
            offset = 0
        } = req.query;

        const options = {
            limit: parseInt(limit),
            offset: parseInt(offset)
        };

        if (risk_level) {
            options.riskLevel = risk_level;
        }

        const analyses = await Analysis.findByUser(req.user._id, options);

        // Get total count for pagination
        const totalQuery = Analysis.countDocuments({
            userId: req.user._id,
            ...(risk_level && { riskLevel: risk_level })
        });

        const total = await totalQuery.exec();

        // Transform data for frontend
        const transformedAnalyses = analyses.map(analysis => ({
            _id: analysis._id,
            address: analysis.analyzedWallet,
            risk_level: analysis.riskLevel,
            fraud_probability: analysis.fraudProbability,
            prediction: analysis.prediction,
            confidence: analysis.confidence,
            account_age: analysis.blockchainData?.accountAge,
            current_balance: analysis.blockchainData?.currentBalance,
            total_received: analysis.blockchainData?.totalReceived,
            total_transactions: analysis.blockchainData?.totalTransactions,
            unique_senders: analysis.blockchainData?.uniqueSenders,
            avg_send_interval: analysis.blockchainData?.avgSendInterval,
            data_source: analysis.blockchainData?.dataSource,
            summarize: analysis.aiAnalysis?.summary,
            created_at: analysis.createdAt,
            updated_at: analysis.updatedAt
        }));

        console.log(`📋 Retrieved ${transformedAnalyses.length} analysis records for user ${req.user.walletAddress}`);

        res.status(200).json({
            success: true,
            data: {
                analyses: transformedAnalyses,
                pagination: {
                    total,
                    limit: parseInt(limit),
                    offset: parseInt(offset),
                    hasMore: (parseInt(offset) + parseInt(limit)) < total
                }
            }
        });

    } catch (error) {
        console.error('Get analysis history error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to get analysis history'
        });
    }
});

// @route   GET /api/blockchain/analysis/:address
// @desc    Get analysis for specific wallet address
// @access  Private
router.get('/analysis/:address', async (req, res) => {
    try {
        const { address } = req.params;

        // Validate address format
        if (!/^0x[a-fA-F0-9]{40}$/.test(address)) {
            return res.status(400).json({
                success: false,
                message: 'Invalid Ethereum address format'
            });
        }

        // Find most recent analysis for this address
        const analysis = await Analysis.findOne({
            analyzedWallet: address.toLowerCase()
        })
            .sort({ createdAt: -1 })
            .populate('userId', 'walletAddress');

        if (!analysis) {
            return res.status(404).json({
                success: false,
                message: 'No analysis found for this address'
            });
        }

        // Check if user can view this analysis (either they requested it or it's public)
        if (analysis.userId._id.toString() !== req.user._id.toString() && !analysis.isPublic) {
            return res.status(403).json({
                success: false,
                message: 'Access denied to this analysis'
            });
        }

        // Transform data for frontend
        const transformedAnalysis = {
            _id: analysis._id,
            address: analysis.analyzedWallet,
            risk_level: analysis.riskLevel,
            fraud_probability: analysis.fraudProbability,
            prediction: analysis.prediction,
            confidence: analysis.confidence,
            account_age: analysis.blockchainData?.accountAge,
            current_balance: analysis.blockchainData?.currentBalance,
            total_received: analysis.blockchainData?.totalReceived,
            total_transactions: analysis.blockchainData?.totalTransactions,
            unique_senders: analysis.blockchainData?.uniqueSenders,
            avg_send_interval: analysis.blockchainData?.avgSendInterval,
            data_source: analysis.blockchainData?.dataSource,
            summarize: analysis.aiAnalysis?.summary,
            created_at: analysis.createdAt,
            updated_at: analysis.updatedAt
        };

        res.status(200).json({
            success: true,
            data: { analysis: transformedAnalysis }
        });

    } catch (error) {
        console.error('Get analysis error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to get analysis'
        });
    }
});

// @route   DELETE /api/blockchain/analysis/:id
// @desc    Delete analysis (soft delete)
// @access  Private
router.delete('/analysis/:id', async (req, res) => {
    try {
        const { id } = req.params;

        const analysis = await Analysis.findOne({
            _id: id,
            userId: req.user._id
        });

        if (!analysis) {
            return res.status(404).json({
                success: false,
                message: 'Analysis not found or access denied'
            });
        }

        // Soft delete by setting isDeleted flag
        analysis.isDeleted = true;
        analysis.deletedAt = new Date();
        await analysis.save();

        console.log(`🗑️ Analysis deleted: ${id} by user ${req.user.walletAddress}`);

        res.status(200).json({
            success: true,
            message: 'Analysis deleted successfully'
        });

    } catch (error) {
        console.error('Delete analysis error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to delete analysis'
        });
    }
});

// @route   GET /api/blockchain/stats
// @desc    Get user's blockchain analysis statistics
// @access  Private
router.get('/stats', async (req, res) => {
    try {
        const stats = await Analysis.getStatsForUser(req.user._id);

        const result = stats.length > 0 ? stats[0] : {
            totalAnalyses: 0,
            riskDistribution: { high: 0, medium: 0, low: 0 },
            avgFraudProbability: 0,
            uniqueWalletsCount: 0
        };

        res.status(200).json({
            success: true,
            data: { stats: result }
        });

    } catch (error) {
        console.error('Get blockchain stats error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to get blockchain statistics'
        });
    }
});

// @route   PUT /api/blockchain/analysis/:id/visibility
// @desc    Update analysis visibility (public/private)
// @access  Private
router.put('/analysis/:id/visibility', [
    body('isPublic')
        .isBoolean()
        .withMessage('isPublic must be a boolean')
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

        const { id } = req.params;
        const { isPublic } = req.body;

        const analysis = await Analysis.findOne({
            _id: id,
            userId: req.user._id
        });

        if (!analysis) {
            return res.status(404).json({
                success: false,
                message: 'Analysis not found or access denied'
            });
        }

        analysis.isPublic = isPublic;
        await analysis.save();

        res.status(200).json({
            success: true,
            message: `Analysis ${isPublic ? 'made public' : 'made private'}`,
            data: { analysis }
        });

    } catch (error) {
        console.error('Update analysis visibility error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to update analysis visibility'
        });
    }
});

// @route   POST /api/blockchain/analysis/:id/tags
// @desc    Add tag to analysis
// @access  Private
router.post('/analysis/:id/tags', [
    body('tag')
        .trim()
        .isLength({ min: 1, max: 50 })
        .withMessage('Tag must be 1-50 characters')
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

        const { id } = req.params;
        const { tag } = req.body;

        const analysis = await Analysis.findOne({
            _id: id,
            userId: req.user._id
        });

        if (!analysis) {
            return res.status(404).json({
                success: false,
                message: 'Analysis not found or access denied'
            });
        }

        await analysis.addTag(tag);

        res.status(200).json({
            success: true,
            message: 'Tag added successfully',
            data: { analysis }
        });

    } catch (error) {
        console.error('Add analysis tag error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to add tag'
        });
    }
});

// @route   DELETE /api/blockchain/analysis/:id/tags/:tag
// @desc    Remove tag from analysis
// @access  Private
router.delete('/analysis/:id/tags/:tag', async (req, res) => {
    try {
        const { id, tag } = req.params;

        const analysis = await Analysis.findOne({
            _id: id,
            userId: req.user._id
        });

        if (!analysis) {
            return res.status(404).json({
                success: false,
                message: 'Analysis not found or access denied'
            });
        }

        await analysis.removeTag(tag);

        res.status(200).json({
            success: true,
            message: 'Tag removed successfully',
            data: { analysis }
        });

    } catch (error) {
        console.error('Remove analysis tag error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to remove tag'
        });
    }
});

// @route   GET /api/blockchain/public
// @desc    Get public blockchain analyses
// @access  Private
router.get('/public', validateQueryParams, async (req, res) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({
                success: false,
                message: 'Validation failed',
                errors: errors.array()
            });
        }

        const {
            risk_level,
            limit = 20,
            offset = 0
        } = req.query;

        const query = { isPublic: true, isDeleted: { $ne: true } };
        if (risk_level) query.riskLevel = risk_level;

        const analyses = await Analysis.find(query)
            .populate('userId', 'walletAddress')
            .sort({ createdAt: -1 })
            .limit(parseInt(limit))
            .skip(parseInt(offset));

        const total = await Analysis.countDocuments(query);

        // Transform data for frontend
        const transformedAnalyses = analyses.map(analysis => ({
            _id: analysis._id,
            address: analysis.analyzedWallet,
            risk_level: analysis.riskLevel,
            fraud_probability: analysis.fraudProbability,
            prediction: analysis.prediction,
            confidence: analysis.confidence,
            account_age: analysis.blockchainData?.accountAge,
            current_balance: analysis.blockchainData?.currentBalance,
            total_received: analysis.blockchainData?.totalReceived,
            total_transactions: analysis.blockchainData?.totalTransactions,
            unique_senders: analysis.blockchainData?.uniqueSenders,
            avg_send_interval: analysis.blockchainData?.avgSendInterval,
            data_source: analysis.blockchainData?.dataSource,
            summarize: analysis.aiAnalysis?.summary,
            created_at: analysis.createdAt,
            requestor: analysis.userId?.walletAddress
        }));

        res.status(200).json({
            success: true,
            data: {
                analyses: transformedAnalyses,
                pagination: {
                    total,
                    limit: parseInt(limit),
                    offset: parseInt(offset),
                    hasMore: (parseInt(offset) + parseInt(limit)) < total
                }
            }
        });

    } catch (error) {
        console.error('Get public analyses error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to get public analyses'
        });
    }
});

// @route   GET /api/blockchain/health
// @desc    Health check for blockchain service
// @access  Private
router.get('/health', async (req, res) => {
    try {
        // Check database connection
        const analysisCount = await Analysis.countDocuments();

        res.status(200).json({
            success: true,
            message: 'Blockchain service is healthy',
            data: {
                service: 'blockchain-analysis',
                status: 'operational',
                totalAnalyses: analysisCount,
                timestamp: new Date().toISOString()
            }
        });

    } catch (error) {
        console.error('Blockchain health check error:', error);
        res.status(500).json({
            success: false,
            message: 'Blockchain service health check failed'
        });
    }
});

export default router;