import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

const userSchema = new mongoose.Schema({
    walletAddress: {
        type: String,
        required: true,
        unique: true,
        lowercase: true,
        trim: true,
        match: /^0x[a-fA-F0-9]{40}$/
    },
    email: {
        type: String,
        sparse: true,
        trim: true,
        lowercase: true
    },
    name: {
        type: String,
        trim: true,
        maxlength: 100
    },
    preferences: {
        theme: {
            type: String,
            enum: ['light', 'dark'],
            default: 'dark'
        },
        language: {
            type: String,
            enum: ['vi', 'en'],
            default: 'vi'
        },
        notifications: {
            email: { type: Boolean, default: true },
            push: { type: Boolean, default: true }
        }
    },
    stats: {
        totalTransactions: { type: Number, default: 0 },
        totalAnalyses: { type: Number, default: 0 },
        totalConversations: { type: Number, default: 0 },
        lastActiveDate: { type: Date, default: Date.now }
    },
    isActive: {
        type: Boolean,
        default: true
    }
}, {
    timestamps: true,
    collection: 'users'
});

// Indexes
// Đã xóa các chỉ mục trùng lặp:
// userSchema.index({ walletAddress: 1 });
// userSchema.index({ email: 1 }, { sparse: true });
userSchema.index({ 'stats.lastActiveDate': -1 });

// Virtual for user ID display
userSchema.virtual('displayId').get(function () {
    return this.walletAddress.substring(0, 6) + '...' + this.walletAddress.substring(this.walletAddress.length - 4);
});

// Pre-save middleware
userSchema.pre('save', function (next) {
    // Update last active date
    this.stats.lastActiveDate = new Date();
    next();
});

// Instance methods
userSchema.methods.updateStats = function (type) {
    switch (type) {
        case 'transaction':
            this.stats.totalTransactions += 1;
            break;
        case 'analysis':
            this.stats.totalAnalyses += 1;
            break;
        case 'conversation':
            this.stats.totalConversations += 1;
            break;
    }
    this.stats.lastActiveDate = new Date();
    return this.save();
};

userSchema.methods.toJSON = function () {
    const userObject = this.toObject();
    delete userObject.__v;
    return userObject;
};

// Static methods
userSchema.statics.findByWallet = function (walletAddress) {
    return this.findOne({ walletAddress: walletAddress.toLowerCase() });
};

userSchema.statics.getActiveUsers = function (days = 30) {
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - days);

    return this.find({
        isActive: true,
        'stats.lastActiveDate': { $gte: cutoffDate }
    });
};

export default mongoose.model('User', userSchema);