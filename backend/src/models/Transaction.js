import mongoose from 'mongoose';

const transactionSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
        index: true
    },
    walletAddress: {
        type: String,
        required: true,
        lowercase: true,
        index: true
    },
    type: {
        type: String,
        enum: ['income', 'expense'],
        required: true,
        index: true
    },
    amount: {
        type: Number,
        required: true,
        min: 0
    },
    description: {
        type: String,
        required: true,
        trim: true,
        maxlength: 500
    },
    category: {
        type: String,
        trim: true,
        maxlength: 100,
        default: 'other'
    },
    tags: [{
        type: String,
        trim: true,
        maxlength: 50
    }],
    metadata: {
        source: {
            type: String,
            enum: ['manual', 'ai_parsed', 'blockchain_immutable'],
            default: 'ai_parsed'
        },
        originalInput: String,
        confidence: {
            type: Number,
            min: 0,
            max: 1
        },
        blockchainHash: String,
        blockNumber: Number,
        blockchainRecord: {
            user_address: String,
            timestamp: String,
            amount: Number,
            description: String,
            category: String,
            transaction_id: String,
            block_number: Number
        },
        blockchainStatus: String,
        verificationStatus: String,
        immutable: {
            type: Boolean,
            default: false
        }
    },
    date: {
        type: Date,
        default: Date.now,
        index: true
    },
    isDeleted: {
        type: Boolean,
        default: false
    }
}, {
    timestamps: true,
    collection: 'transactions'
});

// Compound indexes
transactionSchema.index({ userId: 1, date: -1 });
transactionSchema.index({ walletAddress: 1, type: 1 });
transactionSchema.index({ userId: 1, type: 1, date: -1 });

// Virtual for formatted amount
transactionSchema.virtual('formattedAmount').get(function () {
    return new Intl.NumberFormat('vi-VN', {
        style: 'currency',
        currency: 'VND'
    }).format(this.amount);
});

// Instance methods
transactionSchema.methods.softDelete = function () {
    this.isDeleted = true;
    return this.save();
};

transactionSchema.methods.categorize = function () {
    const description = this.description.toLowerCase();

    // Auto-categorization logic
    if (description.includes('cafe') || description.includes('cà phê') || description.includes('trà sữa')) {
        this.category = 'food_drink';
    } else if (description.includes('học phí') || description.includes('sách') || description.includes('văn phòng phẩm')) {
        this.category = 'education';
    } else if (description.includes('lương') || description.includes('thưởng') || description.includes('làm thêm')) {
        this.category = 'income';
    } else if (description.includes('xe') || description.includes('xăng') || description.includes('grab')) {
        this.category = 'transport';
    } else if (description.includes('điện thoại') || description.includes('internet') || description.includes('điện')) {
        this.category = 'utilities';
    } else {
        this.category = 'other';
    }

    return this.save();
};

// Static methods
transactionSchema.statics.findByUser = function (userId, options = {}) {
    const query = {
        userId: userId,
        isDeleted: false
    };

    if (options.type) {
        query.type = options.type;
    }

    if (options.startDate || options.endDate) {
        query.date = {};
        if (options.startDate) query.date.$gte = options.startDate;
        if (options.endDate) query.date.$lte = options.endDate;
    }

    return this.find(query)
        .sort({ date: -1 })
        .limit(options.limit || 50)
        .skip(options.offset || 0);
};

transactionSchema.statics.getSummaryByUser = function (userId, options = {}) {
    const matchStage = {
        userId: new mongoose.Types.ObjectId(userId),
        isDeleted: false
    };

    if (options.startDate || options.endDate) {
        matchStage.date = {};
        if (options.startDate) matchStage.date.$gte = options.startDate;
        if (options.endDate) matchStage.date.$lte = options.endDate;
    }

    return this.aggregate([
        { $match: matchStage },
        {
            $group: {
                _id: '$type',
                total: { $sum: '$amount' },
                count: { $sum: 1 },
                avgAmount: { $avg: '$amount' },
                maxAmount: { $max: '$amount' },
                minAmount: { $min: '$amount' }
            }
        },
        {
            $group: {
                _id: null,
                income: {
                    $sum: {
                        $cond: [{ $eq: ['$_id', 'income'] }, '$total', 0]
                    }
                },
                expenses: {
                    $sum: {
                        $cond: [{ $eq: ['$_id', 'expense'] }, '$total', 0]
                    }
                },
                incomeCount: {
                    $sum: {
                        $cond: [{ $eq: ['$_id', 'income'] }, '$count', 0]
                    }
                },
                expenseCount: {
                    $sum: {
                        $cond: [{ $eq: ['$_id', 'expense'] }, '$count', 0]
                    }
                },
                totalTransactions: { $sum: '$count' }
            }
        },
        {
            $project: {
                _id: 0,
                total_income: '$income',
                total_expenses: '$expenses',
                net_amount: { $subtract: ['$income', '$expenses'] },
                transaction_count: {
                    income: '$incomeCount',
                    expenses: '$expenseCount',
                    total: '$totalTransactions'
                }
            }
        }
    ]);
};

transactionSchema.statics.getCategoryBreakdown = function (userId, type = null) {
    const matchStage = {
        userId: new mongoose.Types.ObjectId(userId),
        isDeleted: false
    };

    if (type) {
        matchStage.type = type;
    }

    return this.aggregate([
        { $match: matchStage },
        {
            $group: {
                _id: '$category',
                total: { $sum: '$amount' },
                count: { $sum: 1 },
                avgAmount: { $avg: '$amount' }
            }
        },
        { $sort: { total: -1 } }
    ]);
};

export default mongoose.model('Transaction', transactionSchema);