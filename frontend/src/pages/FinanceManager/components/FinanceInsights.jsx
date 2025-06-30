import React from "react";
import { motion } from "framer-motion";

/**
 * Component hiển thị gợi ý tài chính từ AI
 * 
 * @component
 */
const FinanceInsights = () => {
    // Danh sách gợi ý tài chính
    const insights = [
        {
            text: "💡 Nhập giao dịch nhanh chóng bằng cách sử dụng các từ viết tắt như 'k' cho nghìn và 'tr' cho triệu",
        },
        {
            text: "📊 Kiểm tra thống kê định kỳ để theo dõi thói quen chi tiêu",
        },
        {
            text: "🎯 Đặt mục tiêu tiết kiệm và theo dõi tiến độ hàng tháng",
        },
    ];

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="glass rounded-xl p-6 border border-slate-700/50"
        >
            <h3 className="text-white font-semibold mb-4">Gợi ý AI</h3>
            <div className="space-y-3 text-sm">
                {insights.map((insight, index) => (
                    <div
                        key={index}
                        className="p-3 bg-slate-800/40 rounded-lg border border-slate-700/30"
                    >
                        <p className="text-slate-300">{insight.text}</p>
                    </div>
                ))}
            </div>
        </motion.div>
    );
};

export default FinanceInsights;