import React from "react";
import { motion } from "framer-motion";
import PropTypes from "prop-types";

/**
 * Component hiển thị tổng quan tài chính
 * 
 * @component
 */
const FinanceSummary = ({ summary }) => {
    // Tính tỷ lệ % thu nhập và chi tiêu
    const totalValue = Math.max(
        (summary.total_income || 0) + (summary.total_expenses || 0),
        1
    );
    const incomePercentage = Math.min(
        100,
        ((summary.total_income || 0) / totalValue) * 100
    );
    const expensePercentage = Math.min(
        100,
        ((summary.total_expenses || 0) / totalValue) * 100
    );

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="glass rounded-xl p-6 border border-slate-700/50"
        >
            <h3 className="text-white font-semibold mb-4">
                Tóm tắt tài chính
            </h3>
            <div className="space-y-4">
                <div>
                    <div className="flex justify-between text-sm mb-1">
                        <span className="text-slate-300">Thu nhập</span>
                        <span className="text-white">
                            {summary.transaction_count?.income || 0} giao dịch
                        </span>
                    </div>
                    <div className="w-full bg-slate-800/50 rounded-full h-2">
                        <div
                            className="bg-white h-2 rounded-full"
                            style={{ width: `${incomePercentage}%` }}
                        ></div>
                    </div>
                </div>

                <div>
                    <div className="flex justify-between text-sm mb-1">
                        <span className="text-slate-300">Chi tiêu</span>
                        <span className="text-slate-400">
                            {summary.transaction_count?.expenses || 0} giao dịch
                        </span>
                    </div>
                    <div className="w-full bg-slate-800/50 rounded-full h-2">
                        <div
                            className="bg-slate-400 h-2 rounded-full"
                            style={{ width: `${expensePercentage}%` }}
                        ></div>
                    </div>
                </div>
            </div>
        </motion.div>
    );
};

FinanceSummary.propTypes = {
    /** Dữ liệu tổng quan tài chính */
    summary: PropTypes.shape({
        total_income: PropTypes.number,
        total_expenses: PropTypes.number,
        transaction_count: PropTypes.shape({
            income: PropTypes.number,
            expenses: PropTypes.number,
        }),
    }).isRequired,
};

export default FinanceSummary;