import React, { useState } from "react";
import { motion } from "framer-motion";
import PropTypes from "prop-types";
import { PlusCircle, MinusCircle, Calendar, Trash2, MessageCircle, Shield, Eye, Copy, X } from "lucide-react";

/**
 * Panel thống kê tài chính
 * 
 * @component
 */
const StatisticsPanel = ({
    summary,
    transactions,
    formatCurrency,
    deleteTransaction,
    setActiveTab,
}) => {
    // Log the summary to see what we're getting
    console.log("Summary in StatisticsPanel:", summary);

    return (
        <motion.div
            key="stats"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="space-y-6"
        >
            {/* Navigation back to chat */}
            <div className="flex justify-start">
                <button
                    onClick={() => setActiveTab("chat")}
                    className="flex items-center space-x-2 px-4 py-2 bg-gradient-to-r from-blue-600 to-violet-600 text-white rounded-xl hover:from-blue-500 hover:to-violet-500 transition-all shadow-lg hover:shadow-xl"
                >
                    <MessageCircle className="w-4 h-4" />
                    <span>← Quay lại Chat</span>
                </button>
            </div>
            {/* Thẻ tổng quan */}
            {summary && (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <SummaryCard
                        title="Tổng thu"
                        amount={summary.total_income || 0}
                        formatCurrency={formatCurrency}
                        type="income"
                    />
                    <SummaryCard
                        title="Tổng chi"
                        amount={summary.total_expenses || 0}
                        formatCurrency={formatCurrency}
                        type="expense"
                    />
                    <SummaryCard
                        title="Số dư"
                        amount={(summary.total_income || 0) - (summary.total_expenses || 0)}
                        formatCurrency={formatCurrency}
                        type="balance"
                    />
                </div>
            )}

            {/* Giao dịch gần đây */}
            <div className="glass rounded-xl border border-slate-700/50">
                <div className="p-6 border-b border-slate-700/50">
                    <h3 className="text-white text-lg font-semibold">
                        Giao dịch gần đây
                    </h3>
                </div>
                <div className="p-6">
                    {transactions.length > 0 ? (
                        <div className="space-y-3">
                            {transactions.map((transaction) => (
                                <TransactionItem
                                    key={transaction._id}
                                    transaction={transaction}
                                    formatCurrency={formatCurrency}
                                    deleteTransaction={deleteTransaction}
                                />
                            ))}
                        </div>
                    ) : (
                        <div className="text-center py-8">
                            <p className="text-slate-400">Chưa có giao dịch nào</p>
                        </div>
                    )}
                </div>
            </div>
        </motion.div>
    );
};

/**
 * Thẻ tổng quan tài chính
 */
const SummaryCard = ({ title, amount, formatCurrency, type }) => {
    const icon =
        type === "income" ? (
            <PlusCircle className="w-8 h-8 text-white" />
        ) : type === "expense" ? (
            <MinusCircle className="w-8 h-8 text-slate-400" />
        ) : (
            <div className="w-8 h-8 rounded-full border-2 border-white flex items-center justify-center">
                <span className="text-white font-bold">=</span>
            </div>
        );

    const textColor =
        type === "expense" || (type === "balance" && amount < 0)
            ? "text-slate-400"
            : "text-white";

    return (
        <div className="glass rounded-xl p-6 border border-slate-700/50">
            <div className="flex items-center justify-between">
                <div>
                    <p className="text-slate-300 text-sm">{title}</p>
                    <p className={`text-2xl font-bold ${textColor}`}>
                        {formatCurrency(amount)}
                    </p>
                </div>
                {icon}
            </div>
        </div>
    );
};

/**
 * Item giao dịch
 */
const TransactionItem = ({ transaction, formatCurrency, deleteTransaction }) => {
    const [showBlockchainModal, setShowBlockchainModal] = useState(false);

    // Ensure we have a valid date
    const getValidDate = () => {
        if (!transaction.date && !transaction.created_at && !transaction.createdAt) {
            return new Date().toLocaleString("vi-VN");
        }

        try {
            const dateStr = transaction.date || transaction.created_at || transaction.createdAt;
            return new Date(dateStr).toLocaleString("vi-VN");
        } catch (e) {
            console.error("Invalid date:", e);
            return new Date().toLocaleString("vi-VN");
        }
    };

    // Check if transaction is blockchain immutable
    const isBlockchainTransaction = transaction.metadata?.source === 'blockchain_immutable' &&
        transaction.metadata?.immutable;

    const copyToClipboard = (text) => {
        navigator.clipboard.writeText(text);
    };

    return (
        <>
            <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                className={`flex items-center justify-between p-4 bg-slate-800/30 rounded-lg hover:bg-slate-700/30 transition-colors group border ${isBlockchainTransaction ? 'border-yellow-500/50 bg-gradient-to-r from-yellow-900/20 to-slate-800/30' : 'border-slate-700/30'
                    }`}
            >
                <div className="flex items-center space-x-3">
                    <div
                        className={`w-10 h-10 rounded-lg flex items-center justify-center ${transaction.type === "income"
                            ? "bg-slate-700/50"
                            : "bg-slate-700/30"
                            }`}
                    >
                        {transaction.type === "income" ? (
                            <PlusCircle className="w-5 h-5 text-white" />
                        ) : (
                            <MinusCircle className="w-5 h-5 text-slate-400" />
                        )}
                    </div>
                    <div>
                        <div className="flex items-center space-x-2">
                            <p className="text-white font-medium">
                                {transaction.description}
                            </p>
                            {isBlockchainTransaction && (
                                <div className="flex items-center space-x-1">
                                    <div className="px-2 py-1 bg-yellow-600/20 text-yellow-400 text-xs rounded-full flex items-center space-x-1 border border-yellow-500/30">
                                        <Shield className="w-3 h-3" />
                                        <span>IMMUTABLE</span>
                                    </div>
                                    <button
                                        onClick={() => setShowBlockchainModal(true)}
                                        className="text-yellow-400 hover:text-yellow-300 transition-colors"
                                        title="Xem chi tiết blockchain"
                                    >
                                        <Eye className="w-4 h-4" />
                                    </button>
                                </div>
                            )}
                        </div>
                        <p className="text-slate-400 text-sm flex items-center">
                            <Calendar className="w-3 h-3 mr-1" />
                            {getValidDate()}
                        </p>
                    </div>
                </div>
                <div className="flex items-center space-x-3">
                    <p
                        className={`font-bold ${transaction.type === "income"
                            ? "text-white"
                            : "text-slate-400"
                            }`}
                    >
                        {transaction.type === "income" ? "+" : "-"}
                        {formatCurrency(transaction.amount)}
                    </p>
                    {deleteTransaction && !isBlockchainTransaction && (
                        <button
                            onClick={() => deleteTransaction(transaction._id)}
                            className="opacity-0 group-hover:opacity-100 text-slate-400 hover:text-white transition-all"
                        >
                            <Trash2 className="w-4 h-4" />
                        </button>
                    )}
                    {isBlockchainTransaction && (
                        <div className="opacity-0 group-hover:opacity-100 transition-all">
                            <span className="text-yellow-400 text-xs px-2 py-1 bg-yellow-600/10 rounded border border-yellow-500/30">
                                Không thể xóa
                            </span>
                        </div>
                    )}
                </div>
            </motion.div>

            {/* Blockchain Detail Modal */}
            {showBlockchainModal && isBlockchainTransaction && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="bg-slate-800 rounded-xl border border-slate-700 max-w-lg w-full max-h-[80vh] overflow-y-auto"
                    >
                        <div className="p-6 border-b border-slate-700">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center space-x-2">
                                    <Shield className="w-6 h-6 text-yellow-400" />
                                    <h3 className="text-white text-lg font-semibold">
                                        Blockchain Immutable Record
                                    </h3>
                                </div>
                                <button
                                    onClick={() => setShowBlockchainModal(false)}
                                    className="text-slate-400 hover:text-white transition-colors"
                                >
                                    <X className="w-6 h-6" />
                                </button>
                            </div>
                        </div>

                        <div className="p-6 space-y-4">
                            <div className="text-center p-4 bg-yellow-600/10 rounded-lg border border-yellow-500/30">
                                <Shield className="w-12 h-12 text-yellow-400 mx-auto mb-2" />
                                <p className="text-yellow-400 font-medium">
                                    Giao dịch được bảo vệ bởi Blockchain
                                </p>
                                <p className="text-slate-300 text-sm mt-1">
                                    Không thể chỉnh sửa hoặc xóa - Đảm bảo minh bạch 100%
                                </p>
                            </div>

                            {transaction.metadata?.blockchainRecord && (
                                <div className="space-y-3">
                                    <h4 className="text-white font-medium">📋 Chi tiết Record:</h4>

                                    <div className="space-y-2 bg-slate-900/50 p-4 rounded-lg">
                                        <div className="flex justify-between">
                                            <span className="text-slate-400">User Address:</span>
                                            <div className="flex items-center space-x-2">
                                                <span className="text-white font-mono text-sm">
                                                    {transaction.metadata.blockchainRecord.user_address?.slice(0, 10)}...
                                                    {transaction.metadata.blockchainRecord.user_address?.slice(-8)}
                                                </span>
                                                <button
                                                    onClick={() => copyToClipboard(transaction.metadata.blockchainRecord.user_address)}
                                                    className="text-slate-400 hover:text-white"
                                                >
                                                    <Copy className="w-4 h-4" />
                                                </button>
                                            </div>
                                        </div>

                                        <div className="flex justify-between">
                                            <span className="text-slate-400">Timestamp:</span>
                                            <span className="text-white">{transaction.metadata.blockchainRecord.timestamp}</span>
                                        </div>

                                        <div className="flex justify-between">
                                            <span className="text-slate-400">Amount:</span>
                                            <span className="text-white font-bold">
                                                {transaction.metadata.blockchainRecord.amount} VNĐ
                                            </span>
                                        </div>

                                        <div className="flex justify-between">
                                            <span className="text-slate-400">Description:</span>
                                            <span className="text-white">"{transaction.metadata.blockchainRecord.description}"</span>
                                        </div>

                                        <div className="flex justify-between">
                                            <span className="text-slate-400">Category:</span>
                                            <span className={`font-medium ${transaction.metadata.blockchainRecord.category === 'thu' ? 'text-green-400' : 'text-red-400'
                                                }`}>
                                                {transaction.metadata.blockchainRecord.category.toUpperCase()}
                                            </span>
                                        </div>

                                        <div className="flex justify-between">
                                            <span className="text-slate-400">Block Number:</span>
                                            <span className="text-white font-mono">#{transaction.metadata.blockchainRecord.block_number}</span>
                                        </div>
                                    </div>

                                    {transaction.metadata.blockchainHash && (
                                        <div>
                                            <h4 className="text-white font-medium mb-2">🔒 Immutable Hash:</h4>
                                            <div className="bg-slate-900/50 p-3 rounded-lg flex items-center justify-between">
                                                <span className="text-green-400 font-mono text-sm break-all">
                                                    {transaction.metadata.blockchainHash}
                                                </span>
                                                <button
                                                    onClick={() => copyToClipboard(transaction.metadata.blockchainHash)}
                                                    className="text-slate-400 hover:text-white ml-2"
                                                >
                                                    <Copy className="w-4 h-4" />
                                                </button>
                                            </div>
                                        </div>
                                    )}

                                    <div className="text-center pt-4">
                                        <p className="text-green-400 text-sm">
                                            ✅ {transaction.metadata.verificationStatus || 'IMMUTABLE_CONFIRMED'}
                                        </p>
                                    </div>
                                </div>
                            )}
                        </div>
                    </motion.div>
                </div>
            )}
        </>
    );
};

StatisticsPanel.propTypes = {
    /** Tổng quan tài chính */
    summary: PropTypes.object,
    /** Danh sách giao dịch */
    transactions: PropTypes.array.isRequired,
    /** Hàm định dạng tiền tệ */
    formatCurrency: PropTypes.func.isRequired,
    /** Hàm xóa giao dịch */
    deleteTransaction: PropTypes.func.isRequired,
    /** Hàm chuyển tab */
    setActiveTab: PropTypes.func.isRequired,
};

SummaryCard.propTypes = {
    /** Tiêu đề thẻ */
    title: PropTypes.string.isRequired,
    /** Số tiền */
    amount: PropTypes.number.isRequired,
    /** Hàm định dạng tiền tệ */
    formatCurrency: PropTypes.func.isRequired,
    /** Loại thẻ */
    type: PropTypes.oneOf(["income", "expense", "balance"]).isRequired,
};

TransactionItem.propTypes = {
    /** Thông tin giao dịch */
    transaction: PropTypes.object.isRequired,
    /** Hàm định dạng tiền tệ */
    formatCurrency: PropTypes.func.isRequired,
    /** Hàm xóa giao dịch */
    deleteTransaction: PropTypes.func,
};

export default StatisticsPanel;