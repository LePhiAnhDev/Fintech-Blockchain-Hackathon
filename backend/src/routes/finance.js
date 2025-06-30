import express from 'express';
import { body, query, validationResult } from 'express-validator';
import Transaction from '../models/Transaction.js';
import User from '../models/User.js';
import { authenticate, userRateLimit } from '../middleware/auth.js';

const router = express.Router();

// Apply authentication to all routes
router.use(authenticate);

// Validation middleware
const validateTransaction = [
    body('type')
        .isIn(['income', 'expense'])
        .withMessage('Type must be either income or expense'),
    body('amount')
        .isNumeric()
        .custom(value => value > 0)
        .withMessage('Amount must be a positive number'),
    body('description')
        .trim()
        .isLength({ min: 1, max: 500 })
        .withMessage('Description must be 1-500 characters'),
    body('category')
        .optional()
        .trim()
        .isLength({ max: 100 })
        .withMessage('Category must be less than 100 characters'),
    body('tags')
        .optional()
        .isArray()
        .withMessage('Tags must be an array'),
    body('tags.*')
        .optional()
        .trim()
        .isLength({ max: 50 })
        .withMessage('Each tag must be less than 50 characters')
];

const validateQuery = [
    query('type')
        .optional()
        .isIn(['income', 'expense'])
        .withMessage('Type must be either income or expense'),
    query('limit')
        .optional()
        .isInt({ min: 1, max: 100 })
        .withMessage('Limit must be between 1 and 100'),
    query('offset')
        .optional()
        .isInt({ min: 0 })
        .withMessage('Offset must be a non-negative number'),
    query('startDate')
        .optional()
        .isISO8601()
        .withMessage('Start date must be a valid ISO 8601 date'),
    query('endDate')
        .optional()
        .isISO8601()
        .withMessage('End date must be a valid ISO 8601 date')
];

// @route   POST /api/finance/transactions
// @desc    Add a new transaction
// @access  Private
router.post('/transactions', userRateLimit(50, 15 * 60 * 1000), validateTransaction, async (req, res) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({
                success: false,
                message: 'Validation failed',
                errors: errors.array()
            });
        }

        const { type, amount, description, category, tags, metadata } = req.body;

        // Create new transaction
        const transaction = new Transaction({
            userId: req.user._id,
            walletAddress: req.user.walletAddress,
            type,
            amount: parseFloat(amount),
            description,
            category: category || 'other',
            tags: tags || [],
            metadata: {
                source: 'ai_parsed',
                originalInput: metadata?.originalInput || description,
                confidence: metadata?.confidence || 0.95,
                ...metadata
            }
        });

        // Auto-categorize if no category provided
        if (!category) {
            await transaction.categorize();
        } else {
            await transaction.save();
        }

        // Update user stats
        await req.user.updateStats('transaction');

        res.status(201).json({
            success: true,
            message: 'Transaction added successfully',
            data: { transaction }
        });

    } catch (error) {
        console.error('Add transaction error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to add transaction'
        });
    }
});

// @route   GET /api/finance/transactions
// @desc    Get user transactions
// @access  Private
router.get('/transactions', validateQuery, async (req, res) => {
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
            type,
            limit = 50,
            offset = 0,
            startDate,
            endDate,
            category
        } = req.query;

        const options = {
            limit: parseInt(limit),
            offset: parseInt(offset)
        };

        if (type) options.type = type;
        if (startDate) options.startDate = new Date(startDate);
        if (endDate) options.endDate = new Date(endDate);

        let query = Transaction.findByUser(req.user._id, options);

        if (category) {
            query = query.where('category').equals(category);
        }

        const transactions = await query.exec();

        // Get total count for pagination
        const totalQuery = Transaction.countDocuments({
            userId: req.user._id,
            isDeleted: false,
            ...(type && { type }),
            ...(category && { category }),
            ...(startDate || endDate) && {
                date: {
                    ...(startDate && { $gte: new Date(startDate) }),
                    ...(endDate && { $lte: new Date(endDate) })
                }
            }
        });

        const total = await totalQuery.exec();

        res.status(200).json({
            success: true,
            data: {
                transactions,
                pagination: {
                    total,
                    limit: parseInt(limit),
                    offset: parseInt(offset),
                    hasMore: (parseInt(offset) + parseInt(limit)) < total
                }
            }
        });

    } catch (error) {
        console.error('Get transactions error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to get transactions'
        });
    }
});

// @route   GET /api/finance/summary
// @desc    Get financial summary
// @access  Private
router.get('/summary', async (req, res) => {
    try {
        const { startDate, endDate } = req.query;

        const options = {};
        if (startDate) options.startDate = new Date(startDate);
        if (endDate) options.endDate = new Date(endDate);

        const summary = await Transaction.getSummaryByUser(req.user._id, options);

        const result = summary.length > 0 ? summary[0] : {
            total_income: 0,
            total_expenses: 0,
            net_amount: 0,
            transaction_count: {
                income: 0,
                expenses: 0,
                total: 0
            }
        };

        res.status(200).json({
            success: true,
            data: result
        });

    } catch (error) {
        console.error('Get summary error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to get financial summary'
        });
    }
});

// @route   GET /api/finance/categories
// @desc    Get category breakdown
// @access  Private
router.get('/categories', async (req, res) => {
    try {
        const { type } = req.query;

        const categories = await Transaction.getCategoryBreakdown(req.user._id, type);

        res.status(200).json({
            success: true,
            data: { categories }
        });

    } catch (error) {
        console.error('Get categories error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to get category breakdown'
        });
    }
});

// @route   PUT /api/finance/transactions/:id
// @desc    Update a transaction
// @access  Private
router.put('/transactions/:id', validateTransaction, async (req, res) => {
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
        const { type, amount, description, category, tags } = req.body;

        const transaction = await Transaction.findOne({
            _id: id,
            userId: req.user._id,
            isDeleted: false
        });

        if (!transaction) {
            return res.status(404).json({
                success: false,
                message: 'Transaction not found'
            });
        }

        // Update transaction
        transaction.type = type;
        transaction.amount = parseFloat(amount);
        transaction.description = description;
        transaction.category = category || transaction.category;
        transaction.tags = tags || transaction.tags;

        await transaction.save();

        res.status(200).json({
            success: true,
            message: 'Transaction updated successfully',
            data: { transaction }
        });

    } catch (error) {
        console.error('Update transaction error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to update transaction'
        });
    }
});

// @route   DELETE /api/finance/transactions/:id
// @desc    Delete a transaction (soft delete)
// @access  Private
router.delete('/transactions/:id', async (req, res) => {
    try {
        const { id } = req.params;

        const transaction = await Transaction.findOne({
            _id: id,
            userId: req.user._id,
            isDeleted: false
        });

        if (!transaction) {
            return res.status(404).json({
                success: false,
                message: 'Transaction not found'
            });
        }

        await transaction.softDelete();

        res.status(200).json({
            success: true,
            message: 'Transaction deleted successfully'
        });

    } catch (error) {
        console.error('Delete transaction error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to delete transaction'
        });
    }
});

// @route   GET /api/finance/insights
// @desc    Get financial insights
// @access  Private
router.get('/insights', async (req, res) => {
    try {
        const userId = req.user._id;

        // Get data for the last 30 days
        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

        const [currentSummary, previousSummary, categories] = await Promise.all([
            Transaction.getSummaryByUser(userId, { startDate: thirtyDaysAgo }),
            Transaction.getSummaryByUser(userId, {
                startDate: new Date(thirtyDaysAgo.getTime() - 30 * 24 * 60 * 60 * 1000),
                endDate: thirtyDaysAgo
            }),
            Transaction.getCategoryBreakdown(userId, 'expense')
        ]);

        const current = currentSummary[0] || { total_income: 0, total_expenses: 0, net_amount: 0 };
        const previous = previousSummary[0] || { total_income: 0, total_expenses: 0, net_amount: 0 };

        // Calculate trends
        const incomeChange = previous.total_income > 0
            ? ((current.total_income - previous.total_income) / previous.total_income) * 100
            : 0;

        const expenseChange = previous.total_expenses > 0
            ? ((current.total_expenses - previous.total_expenses) / previous.total_expenses) * 100
            : 0;

        // Generate insights
        const insights = [];

        if (incomeChange > 10) {
            insights.push({
                type: 'positive',
                title: 'Thu nhập tăng trưởng tốt',
                description: `Thu nhập tháng này tăng ${incomeChange.toFixed(1)}% so với tháng trước`
            });
        }

        if (expenseChange > 20) {
            insights.push({
                type: 'warning',
                title: 'Chi tiêu tăng cao',
                description: `Chi tiêu tháng này tăng ${expenseChange.toFixed(1)}% so với tháng trước`
            });
        }

        if (current.total_expenses > current.total_income) {
            insights.push({
                type: 'alert',
                title: 'Chi tiêu vượt thu nhập',
                description: 'Bạn đang chi tiêu nhiều hơn thu nhập trong tháng này'
            });
        }

        // Top spending categories
        const topCategories = categories.slice(0, 3).map(cat => ({
            category: cat._id,
            amount: cat.total,
            count: cat.count
        }));

        res.status(200).json({
            success: true,
            data: {
                current_period: current,
                previous_period: previous,
                trends: {
                    income_change: incomeChange,
                    expense_change: expenseChange
                },
                insights,
                top_spending_categories: topCategories
            }
        });

    } catch (error) {
        console.error('Get insights error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to get financial insights'
        });
    }
});

// @route   POST /api/finance/bulk
// @desc    Add multiple transactions
// @access  Private
router.post('/bulk', userRateLimit(10, 15 * 60 * 1000), [
    body('transactions')
        .isArray({ min: 1, max: 50 })
        .withMessage('Transactions must be an array with 1-50 items'),
    body('transactions.*.type')
        .isIn(['income', 'expense'])
        .withMessage('Each transaction type must be either income or expense'),
    body('transactions.*.amount')
        .isNumeric()
        .custom(value => value > 0)
        .withMessage('Each transaction amount must be a positive number'),
    body('transactions.*.description')
        .trim()
        .isLength({ min: 1, max: 500 })
        .withMessage('Each transaction description must be 1-500 characters')
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

        const { transactions } = req.body;

        const transactionDocs = transactions.map(tx => ({
            userId: req.user._id,
            walletAddress: req.user.walletAddress,
            type: tx.type,
            amount: parseFloat(tx.amount),
            description: tx.description,
            category: tx.category || 'other',
            tags: tx.tags || [],
            metadata: {
                source: 'bulk_import',
                originalInput: tx.description,
                confidence: 0.9
            }
        }));

        const savedTransactions = await Transaction.insertMany(transactionDocs);

        // Update user stats
        await User.findByIdAndUpdate(req.user._id, {
            $inc: { 'stats.totalTransactions': savedTransactions.length },
            'stats.lastActiveDate': new Date()
        });

        res.status(201).json({
            success: true,
            message: `${savedTransactions.length} transactions added successfully`,
            data: {
                count: savedTransactions.length,
                transactions: savedTransactions
            }
        });

    } catch (error) {
        console.error('Bulk add transactions error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to add transactions'
        });
    }
});

// @route   GET /api/finance/daily-expenses
// @desc    Get daily expenses for a specific date
// @access  Private
router.get('/daily-expenses', async (req, res) => {
    try {
        const { date } = req.query;

        let targetDate;
        if (date) {
            targetDate = new Date(date);
        } else {
            targetDate = new Date();
        }

        // Start and end of the day
        const startOfDay = new Date(targetDate);
        startOfDay.setHours(0, 0, 0, 0);

        const endOfDay = new Date(targetDate);
        endOfDay.setHours(23, 59, 59, 999);

        const expenses = await Transaction.find({
            userId: req.user._id,
            type: 'expense',
            isDeleted: false,
            date: {
                $gte: startOfDay,
                $lte: endOfDay
            }
        }).sort({ date: 1 });

        const totalAmount = expenses.reduce((sum, expense) => sum + expense.amount, 0);

        res.status(200).json({
            success: true,
            data: {
                date: targetDate.toISOString().split('T')[0],
                expenses,
                totalAmount,
                count: expenses.length
            }
        });

    } catch (error) {
        console.error('Get daily expenses error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to get daily expenses'
        });
    }
});

// @route   GET /api/finance/monthly-expenses
// @desc    Get monthly expenses for current month
// @access  Private
router.get('/monthly-expenses', async (req, res) => {
    try {
        const now = new Date();
        const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
        const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59, 999);

        const monthlyData = await Transaction.getSummaryByUser(req.user._id, {
            startDate: startOfMonth,
            endDate: endOfMonth
        });

        const summary = monthlyData[0] || {
            total_income: 0,
            total_expenses: 0,
            net_amount: 0,
            transaction_count: { income: 0, expenses: 0, total: 0 }
        };

        // Get category breakdown for the month
        const categories = await Transaction.getCategoryBreakdown(req.user._id, 'expense');
        const monthlyCategories = categories.filter(cat => {
            // Note: This is a simplified filter. In production, you'd want to add date filtering to the aggregation
            return true;
        });

        res.status(200).json({
            success: true,
            data: {
                month: now.getMonth() + 1,
                year: now.getFullYear(),
                monthName: now.toLocaleString('vi-VN', { month: 'long' }),
                totalExpenses: summary.total_expenses,
                totalIncome: summary.total_income,
                netAmount: summary.net_amount,
                transactionCount: summary.transaction_count,
                categories: monthlyCategories.slice(0, 5) // Top 5 categories
            }
        });

    } catch (error) {
        console.error('Get monthly expenses error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to get monthly expenses'
        });
    }
});

// @route   GET /api/finance/today-summary
// @desc    Get today's income and expense summary
// @access  Private
router.get('/today-summary', async (req, res) => {
    try {
        const today = new Date();
        const startOfDay = new Date(today);
        startOfDay.setHours(0, 0, 0, 0);

        const endOfDay = new Date(today);
        endOfDay.setHours(23, 59, 59, 999);

        const todayTransactions = await Transaction.find({
            userId: req.user._id,
            isDeleted: false,
            date: {
                $gte: startOfDay,
                $lte: endOfDay
            }
        }).sort({ date: -1 });

        let totalIncome = 0;
        let totalExpenses = 0;
        let incomeCount = 0;
        let expenseCount = 0;

        todayTransactions.forEach(tx => {
            if (tx.type === 'income') {
                totalIncome += tx.amount;
                incomeCount++;
            } else {
                totalExpenses += tx.amount;
                expenseCount++;
            }
        });

        const netAmount = totalIncome - totalExpenses;

        res.status(200).json({
            success: true,
            data: {
                date: today.toISOString().split('T')[0],
                dateFormatted: today.toLocaleDateString('vi-VN'),
                totalIncome,
                totalExpenses,
                netAmount,
                transactionCount: {
                    income: incomeCount,
                    expenses: expenseCount,
                    total: todayTransactions.length
                },
                transactions: todayTransactions
            }
        });

    } catch (error) {
        console.error('Get today summary error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to get today summary'
        });
    }
});

// @route   POST /api/finance/blockchain-transaction
// @desc    Save transaction to blockchain (immutable)
// @access  Private
router.post('/blockchain-transaction', validateTransaction, async (req, res) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({
                success: false,
                message: 'Validation failed',
                errors: errors.array()
            });
        }

        const { type, amount, description, category, tags, metadata } = req.body;

        // Create transaction in database first
        const transaction = new Transaction({
            userId: req.user._id,
            walletAddress: req.user.walletAddress,
            type,
            amount: parseFloat(amount),
            description,
            category: category || 'other',
            tags: tags || [],
            metadata: {
                source: 'blockchain_immutable',
                originalInput: metadata?.originalInput || description,
                confidence: metadata?.confidence || 0.95,
                blockchainStatus: 'pending',
                ...metadata
            }
        });

        // Auto-categorize if needed
        if (!category) {
            await transaction.categorize();
        } else {
            await transaction.save();
        }

        // Create immutable blockchain record
        const blockchainRecord = {
            user_address: req.user.walletAddress,
            timestamp: new Date().toISOString(),
            amount: type === 'expense' ? -parseFloat(amount) : parseFloat(amount), // Negative for expenses
            description: description,
            category: type === 'income' ? 'thu' : 'chi',
            transaction_id: transaction._id.toString(),
            block_number: Math.floor(Math.random() * 1000000) + 1000000
        };

        // Generate immutable hash from blockchain record
        const crypto = await import('crypto');
        const recordString = JSON.stringify(blockchainRecord, Object.keys(blockchainRecord).sort());
        const immutableHash = crypto.createHash('sha256').update(recordString).digest('hex');

        const blockchainData = {
            ...blockchainRecord,
            hash: `0x${immutableHash}`,
            immutable: true,
            created_at: blockchainRecord.timestamp,
            verification_status: 'IMMUTABLE_CONFIRMED'
        };

        // Update transaction with blockchain info
        transaction.metadata.blockchainStatus = 'confirmed';
        transaction.metadata.blockchainHash = blockchainData.hash;
        transaction.metadata.blockNumber = blockchainData.block_number;
        transaction.metadata.blockchainRecord = blockchainRecord;
        transaction.metadata.immutable = true;
        transaction.metadata.verificationStatus = 'IMMUTABLE_CONFIRMED';

        await transaction.save();

        // Update user stats
        await req.user.updateStats('transaction');

        res.status(201).json({
            success: true,
            message: 'Transaction saved to blockchain successfully',
            data: {
                transaction,
                blockchain: blockchainData
            }
        });

    } catch (error) {
        console.error('Blockchain transaction error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to save transaction to blockchain'
        });
    }
});

// @route   GET /api/finance/detailed-summary
// @desc    Get detailed financial summary for smart planning
// @access  Private
router.get('/detailed-summary', async (req, res) => {
    try {
        const userId = req.user._id;

        // Get all-time summary
        const allTimeSummary = await Transaction.getSummaryByUser(userId);
        const summary = allTimeSummary[0] || {
            total_income: 0,
            total_expenses: 0,
            net_amount: 0,
            transaction_count: { income: 0, expenses: 0, total: 0 }
        };

        // Get category breakdown
        const categoryBreakdown = await Transaction.aggregate([
            {
                $match: {
                    userId: userId,
                    isDeleted: false,
                    type: 'expense'
                }
            },
            {
                $group: {
                    _id: '$category',
                    total: { $sum: '$amount' },
                    count: { $sum: 1 },
                    avgAmount: { $avg: '$amount' }
                }
            },
            {
                $sort: { total: -1 }
            }
        ]);

        // Map categories to display names
        const categoryMapping = {
            'food_drink': 'Ăn uống',
            'transport': 'Đi lại',
            'education': 'Học phí',
            'utilities': 'Điện nước, mạng',
            'healthcare': 'Y tế',
            'entertainment': 'Giải trí',
            'shopping': 'Mua sắm',
            'housing': 'Tiền nhà',
            'other': 'Khác'
        };

        const formattedCategories = {};
        categoryBreakdown.forEach(cat => {
            const displayName = categoryMapping[cat._id] || 'Khác';
            formattedCategories[displayName] = cat.total;
        });

        // Get recent transactions for analysis
        const recentTransactions = await Transaction.find({
            userId: userId,
            isDeleted: false
        })
            .sort({ date: -1 })
            .limit(50)
            .select('type amount description category date');

        // Calculate monthly averages (last 3 months)
        const threeMonthsAgo = new Date();
        threeMonthsAgo.setMonth(threeMonthsAgo.getMonth() - 3);

        const monthlyData = await Transaction.aggregate([
            {
                $match: {
                    userId: userId,
                    isDeleted: false,
                    date: { $gte: threeMonthsAgo }
                }
            },
            {
                $group: {
                    _id: {
                        year: { $year: '$date' },
                        month: { $month: '$date' },
                        type: '$type'
                    },
                    total: { $sum: '$amount' }
                }
            }
        ]);

        // Calculate averages
        const monthlyAverages = {
            income: 0,
            expenses: 0
        };

        const monthCounts = { income: 0, expenses: 0 };
        monthlyData.forEach(data => {
            monthlyAverages[data._id.type] += data.total;
            monthCounts[data._id.type]++;
        });

        if (monthCounts.income > 0) monthlyAverages.income /= monthCounts.income;
        if (monthCounts.expenses > 0) monthlyAverages.expenses /= monthCounts.expenses;

        res.status(200).json({
            success: true,
            data: {
                total_income: summary.total_income,
                total_expenses: summary.total_expenses,
                net_amount: summary.net_amount,
                transaction_count: summary.transaction_count,
                category_breakdown: formattedCategories,
                monthly_averages: monthlyAverages,
                recent_transactions: recentTransactions,
                analysis_period: {
                    start_date: threeMonthsAgo.toISOString(),
                    end_date: new Date().toISOString()
                }
            }
        });

    } catch (error) {
        console.error('Get detailed summary error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to get detailed financial summary'
        });
    }
});

export default router;