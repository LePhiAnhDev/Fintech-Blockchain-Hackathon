import mongoose from 'mongoose';

const analysisSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
        index: true
    },
    requestorWallet: {
        type: String,
        required: true,
        lowercase: true,
        index: true
    },
    analyzedWallet: {
        type: String,
        required: true,
        lowercase: true,
        index: true,
        match: /^0x[a-fA-F0-9]{40}$/
    },
    riskLevel: {
        type: String,
        enum: ['LOW', 'MEDIUM', 'HIGH', 'UNKNOWN'],
        required: true,
        index: true
    },
    fraudProbability: {
        type: Number,
        required: true,
        min: 0,
        max: 100
    },
    prediction: {
        type: String,
        enum: ['NORMAL', 'FRAUDULENT'],
        required: true
    },
    confidence: {
        type: String,
        enum: ['Low', 'Medium', 'High'],
        required: true
    },
    blockchainData: {
        accountAge: String,
        currentBalance: String,
        totalReceived: String,
        totalTransactions: Number,
        uniqueSenders: Number,
        avgSendInterval: String,
        dataSource: String
    },
    aiAnalysis: {
        summary: String,
        keyFindings: [String],
        recommendations: [String],
        modelUsed: String,
        processingTime: Number
    },
    metadata: {
        apiVersion: String,
        etherscanCalls: Number,
        processingDuration: Number,
        errorLogs: [String]
    },
    isPublic: {
        type: Boolean,
        default: false
    },
    tags: [{
        type: String,
        trim: true,
        maxlength: 50
    }]
}, {
    timestamps: true,
    collection: 'analyses'
});

// Indexes
analysisSchema.index({ analyzedWallet: 1, createdAt: -1 });
analysisSchema.index({ userId: 1, createdAt: -1 });
analysisSchema.index({ riskLevel: 1, fraudProbability: -1 });
analysisSchema.index({ requestorWallet: 1, analyzedWallet: 1 });

// Virtual for risk score
analysisSchema.virtual('riskScore').get(function () {
    const riskMap = {
        'LOW': 1,
        'MEDIUM': 2,
        'HIGH': 3,
        'UNKNOWN': 0
    };
    return riskMap[this.riskLevel] || 0;
});

// Virtual for formatted wallet addresses
analysisSchema.virtual('formattedAnalyzedWallet').get(function () {
    return this.analyzedWallet.substring(0, 6) + '...' + this.analyzedWallet.substring(this.analyzedWallet.length - 4);
});

// Instance methods
analysisSchema.methods.addTag = function (tag) {
    if (!this.tags.includes(tag)) {
        this.tags.push(tag);
        return this.save();
    }
    return Promise.resolve(this);
};

analysisSchema.methods.removeTag = function (tag) {
    this.tags = this.tags.filter(t => t !== tag);
    return this.save();
};

analysisSchema.methods.updateRisk = function (newRiskLevel, newProbability) {
    this.riskLevel = newRiskLevel;
    this.fraudProbability = newProbability;
    return this.save();
};

// Static methods
analysisSchema.statics.findByWallet = function (walletAddress, options = {}) {
    const query = { analyzedWallet: walletAddress.toLowerCase() };

    return this.find(query)
        .populate('userId', 'walletAddress name')
        .sort({ createdAt: -1 })
        .limit(options.limit || 10);
};

analysisSchema.statics.findByUser = function (userId, options = {}) {
    const query = { userId: userId };

    if (options.riskLevel) {
        query.riskLevel = options.riskLevel;
    }

    return this.find(query)
        .sort({ createdAt: -1 })
        .limit(options.limit || 50)
        .skip(options.offset || 0);
};

analysisSchema.statics.getStatsForUser = function (userId) {
    return this.aggregate([
        { $match: { userId: new mongoose.Types.ObjectId(userId) } },
        {
            $group: {
                _id: null,
                totalAnalyses: { $sum: 1 },
                highRiskCount: {
                    $sum: { $cond: [{ $eq: ['$riskLevel', 'HIGH'] }, 1, 0] }
                },
                mediumRiskCount: {
                    $sum: { $cond: [{ $eq: ['$riskLevel', 'MEDIUM'] }, 1, 0] }
                },
                lowRiskCount: {
                    $sum: { $cond: [{ $eq: ['$riskLevel', 'LOW'] }, 1, 0] }
                },
                avgFraudProbability: { $avg: '$fraudProbability' },
                uniqueWallets: { $addToSet: '$analyzedWallet' }
            }
        },
        {
            $project: {
                _id: 0,
                totalAnalyses: 1,
                riskDistribution: {
                    high: '$highRiskCount',
                    medium: '$mediumRiskCount',
                    low: '$lowRiskCount'
                },
                avgFraudProbability: { $round: ['$avgFraudProbability', 2] },
                uniqueWalletsCount: { $size: '$uniqueWallets' }
            }
        }
    ]);
};

analysisSchema.statics.getGlobalStats = function () {
    return this.aggregate([
        {
            $group: {
                _id: null,
                totalAnalyses: { $sum: 1 },
                highRiskCount: {
                    $sum: { $cond: [{ $eq: ['$riskLevel', 'HIGH'] }, 1, 0] }
                },
                mediumRiskCount: {
                    $sum: { $cond: [{ $eq: ['$riskLevel', 'MEDIUM'] }, 1, 0] }
                },
                lowRiskCount: {
                    $sum: { $cond: [{ $eq: ['$riskLevel', 'LOW'] }, 1, 0] }
                },
                avgFraudProbability: { $avg: '$fraudProbability' },
                uniqueWallets: { $addToSet: '$analyzedWallet' },
                uniqueUsers: { $addToSet: '$userId' }
            }
        },
        {
            $project: {
                _id: 0,
                totalAnalyses: 1,
                riskDistribution: {
                    high: '$highRiskCount',
                    medium: '$mediumRiskCount',
                    low: '$lowRiskCount'
                },
                avgFraudProbability: { $round: ['$avgFraudProbability', 2] },
                uniqueWalletsAnalyzed: { $size: '$uniqueWallets' },
                activeUsers: { $size: '$uniqueUsers' }
            }
        }
    ]);
};

analysisSchema.statics.findSimilarRisk = function (walletAddress, riskLevel) {
    return this.find({
        analyzedWallet: { $ne: walletAddress.toLowerCase() },
        riskLevel: riskLevel,
        isPublic: true
    })
        .sort({ fraudProbability: -1, createdAt: -1 })
        .limit(5)
        .select('analyzedWallet riskLevel fraudProbability createdAt');
};

export default mongoose.model('Analysis', analysisSchema);