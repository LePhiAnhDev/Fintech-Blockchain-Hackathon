import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Brain, TrendingUp, PiggyBank, Target, ArrowLeft, Loader2, AlertCircle } from "lucide-react";
import financeService, { financeAIService } from "../../../services/api/financeService";
import { formatCurrency, formatShortAmount } from "../../../utils/formatUtils";
import MarkdownRenderer from "../../../components/common/MarkdownRenderer";
import toast from "react-hot-toast";

/**
 * Component lập kế hoạch tài chính thông minh
 */
const SmartPlanning = ({ onBack, summary }) => {
    const [step, setStep] = useState('overview'); // 'overview', 'goal_selection', 'ai_planning'
    const [financialData, setFinancialData] = useState(null);
    const [selectedGoal, setSelectedGoal] = useState('');
    const [aiPlan, setAiPlan] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [needsMoreData, setNeedsMoreData] = useState(false);
    const [formData, setFormData] = useState({
        monthlyIncome: '',
        categories: {
            housing: '',
            food: '',
            transport: '',
            utilities: '',
            education: ''
        }
    });

    // Tải dữ liệu tài chính chi tiết khi component mount
    useEffect(() => {
        loadFinancialData();
    }, []);

    const loadFinancialData = async () => {
        setIsLoading(true);
        try {
            // Lấy transactions gần đây để phân tích
            const transactionsResponse = await financeService.getTransactions(100);
            const summaryResponse = await financeService.getSummary();

            if (transactionsResponse?.success && summaryResponse?.success) {
                const transactions = transactionsResponse.data.transactions || [];
                const summary = summaryResponse.data || {};

                // Phân tích chi tiêu theo danh mục
                const categoryBreakdown = analyzeTransactionsByCategory(transactions);

                const data = {
                    totalIncome: summary.total_income || 0,
                    totalExpenses: summary.total_expenses || 0,
                    netAmount: summary.net_amount || 0,
                    transactionCount: summary.transaction_count || {},
                    categoryBreakdown,
                    recentTransactions: transactions.slice(0, 10)
                };

                setFinancialData(data);

                // Kiểm tra dữ liệu có đầy đủ không
                if (data.totalIncome === 0 || Object.keys(categoryBreakdown).length < 3) {
                    setNeedsMoreData(true);
                }
            } else {
                // Fallback: Tạo sample data nếu không có dữ liệu
                const fallbackData = {
                    totalIncome: 0,
                    totalExpenses: 0,
                    netAmount: 0,
                    transactionCount: { income: 0, expenses: 0, total: 0 },
                    categoryBreakdown: {},
                    recentTransactions: []
                };
                setFinancialData(fallbackData);
                setNeedsMoreData(true);
            }
        } catch (error) {
            console.error('Error loading financial data:', error);
            toast.error('Không thể tải dữ liệu tài chính');
        }
        setIsLoading(false);
    };

    const analyzeTransactionsByCategory = (transactions) => {
        const breakdown = {};

        transactions.forEach(tx => {
            if (tx.type === 'expense') {
                const category = tx.category || 'other';
                const displayCategory = getCategoryDisplayName(category);

                if (!breakdown[displayCategory]) {
                    breakdown[displayCategory] = 0;
                }
                breakdown[displayCategory] += tx.amount;
            }
        });

        return breakdown;
    };

    const getCategoryDisplayName = (category) => {
        const mapping = {
            'food_drink': 'Ăn uống',
            'transport': 'Đi lại',
            'education': 'Học phí',
            'utilities': 'Điện nước, mạng',
            'healthcare': 'Y tế',
            'entertainment': 'Giải trí',
            'shopping': 'Mua sắm',
            'other': 'Khác'
        };
        return mapping[category] || 'Khác';
    };

    const handleGoalSelect = (goal) => {
        setSelectedGoal(goal);
        setStep('ai_planning');
        generateAIPlan(goal);
    };

    const generateAIPlan = async (goal) => {
        setIsLoading(true);
        try {
            // Validation dữ liệu tài chính
            if (!financialData) {
                throw new Error('Không có dữ liệu tài chính');
            }

            console.log('Financial data to send:', financialData);

            // Chuẩn bị dữ liệu để gửi cho AI
            const planningData = {
                financial_summary: {
                    total_income: financialData.totalIncome || 0,
                    total_expenses: financialData.totalExpenses || 0,
                    net_amount: financialData.netAmount || 0,
                    category_breakdown: financialData.categoryBreakdown || {},
                    transaction_count: financialData.transactionCount || {}
                },
                goal_type: goal,
                user_profile: 'student' // Sinh viên
            };

            console.log('Planning data to send:', planningData);

            const response = await financeAIService.generateSmartPlan(planningData);
            console.log('Smart planning response:', response);

            if (response?.success) {
                // Python server trả về plan trực tiếp, không có data wrapper
                const planText = response.plan || response.data?.plan;
                if (planText) {
                    setAiPlan(planText);
                } else {
                    console.error('No plan found in response:', response);
                    throw new Error('Không tìm thấy kế hoạch trong phản hồi');
                }
            } else {
                console.error('Response not successful:', response);
                throw new Error('Không thể tạo kế hoạch');
            }
        } catch (error) {
            console.error('Error generating AI plan:', error);
            toast.error('Không thể tạo kế hoạch thông minh');
            setAiPlan('❌ Có lỗi xảy ra khi tạo kế hoạch. Vui lòng thử lại sau.');
        }
        setIsLoading(false);
    };

    const handleFormSubmit = (e) => {
        e.preventDefault();
        // Cập nhật dữ liệu tài chính với thông tin từ form
        const updatedData = {
            ...financialData,
            totalIncome: parseFloat(formData.monthlyIncome) || 0,
            categoryBreakdown: {
                'Tiền nhà': parseFloat(formData.categories.housing) || 0,
                'Ăn uống': parseFloat(formData.categories.food) || 0,
                'Đi lại': parseFloat(formData.categories.transport) || 0,
                'Điện nước, mạng': parseFloat(formData.categories.utilities) || 0,
                'Học phí': parseFloat(formData.categories.education) || 0,
            }
        };

        updatedData.totalExpenses = Object.values(updatedData.categoryBreakdown).reduce((sum, val) => sum + val, 0);
        updatedData.netAmount = updatedData.totalIncome - updatedData.totalExpenses;

        setFinancialData(updatedData);
        setNeedsMoreData(false);
        setStep('overview');
    };

    if (isLoading && !financialData) {
        return (
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="glass rounded-2xl border border-slate-700/50 p-8 text-center"
            >
                <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4 text-primary-500" />
                <p className="text-slate-300">Đang phân tích dữ liệu tài chính...</p>
            </motion.div>
        );
    }

    return (
        <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="glass rounded-2xl border border-slate-700/50"
        >
            {/* Header */}
            <div className="p-6 border-b border-slate-700/50">
                <div className="flex items-center space-x-3">
                    <button
                        onClick={onBack}
                        className="p-2 hover:bg-slate-700/50 rounded-lg transition-colors"
                    >
                        <ArrowLeft className="w-5 h-5 text-slate-400" />
                    </button>
                    <Brain className="w-6 h-6 text-primary-500" />
                    <h2 className="text-xl font-bold text-white">Lập kế hoạch thông minh</h2>
                </div>
            </div>

            <div className="p-6">
                <AnimatePresence mode="wait">
                    {/* Bước 1: Hiển thị tổng quan tài chính */}
                    {step === 'overview' && (
                        <motion.div
                            key="overview"
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -20 }}
                            className="space-y-6"
                        >
                            {needsMoreData ? (
                                // Form bổ sung dữ liệu
                                <div className="space-y-4">
                                    <div className="flex items-center space-x-2 p-4 bg-amber-500/10 border border-amber-500/30 rounded-lg">
                                        <AlertCircle className="w-5 h-5 text-amber-500" />
                                        <p className="text-amber-200 text-sm">
                                            Dữ liệu tài chính chưa đầy đủ. Vui lòng bổ sung thông tin để có kế hoạch chính xác hơn.
                                        </p>
                                    </div>

                                    <form onSubmit={handleFormSubmit} className="space-y-4">
                                        <div>
                                            <label className="block text-sm font-medium text-slate-300 mb-2">
                                                Tổng thu nhập hàng tháng (VNĐ)
                                            </label>
                                            <input
                                                type="number"
                                                value={formData.monthlyIncome}
                                                onChange={(e) => setFormData({ ...formData, monthlyIncome: e.target.value })}
                                                className="w-full bg-slate-800/50 border border-slate-700/50 rounded-lg px-4 py-2 text-white"
                                                placeholder="6000000"
                                                required
                                            />
                                        </div>

                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            <div>
                                                <label className="block text-sm font-medium text-slate-300 mb-2">Tiền nhà (VNĐ)</label>
                                                <input
                                                    type="number"
                                                    value={formData.categories.housing}
                                                    onChange={(e) => setFormData({
                                                        ...formData,
                                                        categories: { ...formData.categories, housing: e.target.value }
                                                    })}
                                                    className="w-full bg-slate-800/50 border border-slate-700/50 rounded-lg px-4 py-2 text-white"
                                                    placeholder="2000000"
                                                />
                                            </div>
                                            <div>
                                                <label className="block text-sm font-medium text-slate-300 mb-2">Ăn uống (VNĐ)</label>
                                                <input
                                                    type="number"
                                                    value={formData.categories.food}
                                                    onChange={(e) => setFormData({
                                                        ...formData,
                                                        categories: { ...formData.categories, food: e.target.value }
                                                    })}
                                                    className="w-full bg-slate-800/50 border border-slate-700/50 rounded-lg px-4 py-2 text-white"
                                                    placeholder="1200000"
                                                />
                                            </div>
                                            <div>
                                                <label className="block text-sm font-medium text-slate-300 mb-2">Đi lại (VNĐ)</label>
                                                <input
                                                    type="number"
                                                    value={formData.categories.transport}
                                                    onChange={(e) => setFormData({
                                                        ...formData,
                                                        categories: { ...formData.categories, transport: e.target.value }
                                                    })}
                                                    className="w-full bg-slate-800/50 border border-slate-700/50 rounded-lg px-4 py-2 text-white"
                                                    placeholder="300000"
                                                />
                                            </div>
                                            <div>
                                                <label className="block text-sm font-medium text-slate-300 mb-2">Điện nước, mạng (VNĐ)</label>
                                                <input
                                                    type="number"
                                                    value={formData.categories.utilities}
                                                    onChange={(e) => setFormData({
                                                        ...formData,
                                                        categories: { ...formData.categories, utilities: e.target.value }
                                                    })}
                                                    className="w-full bg-slate-800/50 border border-slate-700/50 rounded-lg px-4 py-2 text-white"
                                                    placeholder="500000"
                                                />
                                            </div>
                                            <div className="md:col-span-2">
                                                <label className="block text-sm font-medium text-slate-300 mb-2">Học phí (VNĐ)</label>
                                                <input
                                                    type="number"
                                                    value={formData.categories.education}
                                                    onChange={(e) => setFormData({
                                                        ...formData,
                                                        categories: { ...formData.categories, education: e.target.value }
                                                    })}
                                                    className="w-full bg-slate-800/50 border border-slate-700/50 rounded-lg px-4 py-2 text-white"
                                                    placeholder="500000"
                                                />
                                            </div>
                                        </div>

                                        <button
                                            type="submit"
                                            className="w-full bg-gradient-to-r from-primary-600 to-primary-500 text-white py-3 rounded-lg hover:from-primary-500 hover:to-primary-400 transition-all font-medium"
                                        >
                                            Tiếp tục với dữ liệu này
                                        </button>
                                    </form>
                                </div>
                            ) : (
                                // Hiển thị tổng quan tài chính
                                <div className="space-y-6">
                                    {/* Tổng quan số liệu */}
                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                        <div className="bg-green-500/10 border border-green-500/30 rounded-lg p-4">
                                            <h3 className="text-green-400 font-medium mb-2">Tổng thu nhập</h3>
                                            <p className="text-2xl font-bold text-white">
                                                {formatShortAmount(financialData?.totalIncome || 0)} ₫
                                            </p>
                                        </div>
                                        <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-4">
                                            <h3 className="text-red-400 font-medium mb-2">Tổng chi bắt buộc</h3>
                                            <p className="text-2xl font-bold text-white">
                                                {formatShortAmount(financialData?.totalExpenses || 0)} ₫
                                            </p>
                                        </div>
                                        <div className={`${(financialData?.netAmount || 0) > 0 ? 'bg-blue-500/10 border-blue-500/30' : 'bg-red-500/10 border-red-500/30'} rounded-lg p-4`}>
                                            <h3 className={`${(financialData?.netAmount || 0) > 0 ? 'text-blue-400' : 'text-red-400'} font-medium mb-2`}>Mỗi tháng còn dư</h3>
                                            <p className="text-2xl font-bold text-white">
                                                {formatShortAmount(financialData?.netAmount || 0)} ₫
                                            </p>
                                        </div>
                                    </div>

                                    {/* Chi tiết các khoản chi */}
                                    {financialData?.categoryBreakdown && Object.keys(financialData.categoryBreakdown).length > 0 && (
                                        <div className="bg-slate-800/30 rounded-lg p-4">
                                            <h3 className="text-slate-300 font-medium mb-3">Các khoản đã chi:</h3>
                                            <div className="space-y-2">
                                                {Object.entries(financialData.categoryBreakdown).map(([category, amount]) => (
                                                    <div key={category} className="flex justify-between items-center">
                                                        <span className="text-slate-400">- {category}:</span>
                                                        <span className="text-white font-medium">
                                                            {formatShortAmount(amount)} ₫
                                                        </span>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    )}

                                    {/* Nút tiếp tục */}
                                    <button
                                        onClick={() => setStep('goal_selection')}
                                        className="w-full bg-gradient-to-r from-primary-600 to-primary-500 text-white py-3 rounded-lg hover:from-primary-500 hover:to-primary-400 transition-all font-medium"
                                    >
                                        Tiếp tục lập kế hoạch
                                    </button>
                                </div>
                            )}
                        </motion.div>
                    )}

                    {/* Bước 2: Lựa chọn mục tiêu */}
                    {step === 'goal_selection' && (
                        <motion.div
                            key="goal_selection"
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -20 }}
                            className="space-y-6"
                        >
                            <div className="text-center">
                                <Target className="w-12 h-12 text-primary-500 mx-auto mb-4" />
                                <h3 className="text-2xl font-bold text-white mb-2">
                                    Bạn đang muốn lập kế hoạch cho việc gì?
                                </h3>
                                <p className="text-slate-400">
                                    Chọn mục tiêu để nhận được lời khuyên phù hợp nhất
                                </p>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <button
                                    onClick={() => handleGoalSelect('savings')}
                                    className="group p-6 bg-gradient-to-br from-green-600/20 to-emerald-600/20 border border-green-500/30 rounded-xl hover:from-green-600/30 hover:to-emerald-600/30 transition-all text-left"
                                >
                                    <PiggyBank className="w-10 h-10 text-green-400 mb-4 group-hover:scale-110 transition-transform" />
                                    <h4 className="text-xl font-bold text-white mb-2">Tiết kiệm</h4>
                                    <p className="text-slate-300 text-sm">
                                        Lập kế hoạch tiết kiệm cho mục tiêu cụ thể như mua laptop,
                                        du lịch, hoặc dự phòng khẩn cấp
                                    </p>
                                </button>

                                <button
                                    onClick={() => handleGoalSelect('investment')}
                                    className="group p-6 bg-gradient-to-br from-blue-600/20 to-purple-600/20 border border-blue-500/30 rounded-xl hover:from-blue-600/30 hover:to-purple-600/30 transition-all text-left"
                                >
                                    <TrendingUp className="w-10 h-10 text-blue-400 mb-4 group-hover:scale-110 transition-transform" />
                                    <h4 className="text-xl font-bold text-white mb-2">Đầu tư</h4>
                                    <p className="text-slate-300 text-sm">
                                        Tìm hiểu các hình thức đầu tư an toàn phù hợp với sinh viên
                                        để tăng thu nhập thụ động
                                    </p>
                                </button>
                            </div>
                        </motion.div>
                    )}

                    {/* Bước 3: Kế hoạch từ AI */}
                    {step === 'ai_planning' && (
                        <motion.div
                            key="ai_planning"
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -20 }}
                            className="space-y-6"
                        >
                            <div className="text-center">
                                <Brain className="w-12 h-12 text-primary-500 mx-auto mb-4" />
                                <h3 className="text-2xl font-bold text-white mb-2">
                                    Kế hoạch thông minh cho bạn
                                </h3>
                                <p className="text-slate-400">
                                    Dựa trên phân tích tình hình tài chính hiện tại của bạn
                                </p>
                            </div>

                            {isLoading ? (
                                <div className="text-center py-8">
                                    <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4 text-primary-500" />
                                    <p className="text-slate-300">AI đang phân tích và tạo kế hoạch tối ưu...</p>
                                </div>
                            ) : (
                                <div className="bg-slate-800/30 rounded-lg p-6">
                                    <MarkdownRenderer
                                        content={aiPlan}
                                        className="text-slate-300"
                                    />
                                </div>
                            )}

                            <div className="flex space-x-3">
                                <button
                                    onClick={() => setStep('goal_selection')}
                                    className="flex-1 bg-slate-700 text-white py-3 rounded-lg hover:bg-slate-600 transition-colors"
                                >
                                    Thay đổi mục tiêu
                                </button>
                                <button
                                    onClick={() => generateAIPlan(selectedGoal)}
                                    className="flex-1 bg-gradient-to-r from-primary-600 to-primary-500 text-white py-3 rounded-lg hover:from-primary-500 hover:to-primary-400 transition-all"
                                    disabled={isLoading}
                                >
                                    Tạo kế hoạch mới
                                </button>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </motion.div>
    );
};

export default SmartPlanning; 