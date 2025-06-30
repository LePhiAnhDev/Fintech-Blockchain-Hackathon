import React from "react";
import { motion } from "framer-motion";
import { CheckCircle, AlertTriangle, Shield } from "lucide-react";

/**
 * Component hiển thị các mẹo bảo mật cho phân tích blockchain
 *
 * @component
 */
const SecurityTips = React.memo(() => {
  const tips = [
    {
      icon: <CheckCircle className="w-8 h-8 text-green-400 mb-3" />,
      title: "Luôn kiểm tra",
      description: "Phân tích địa chỉ ví trước khi gửi tiền để tránh rủi ro",
    },
    {
      icon: <AlertTriangle className="w-8 h-8 text-amber-400 mb-3" />,
      title: "Cẩn thận với ví mới",
      description: "Các ví có ít hoạt động có thể có rủi ro cao hơn",
    },
    {
      icon: <Shield className="w-8 h-8 text-blue-400 mb-3" />,
      title: "Xác minh nguồn",
      description: "Chỉ giao dịch với các địa chỉ ví đáng tin cậy",
    },
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.3 }}
      className="glass rounded-xl p-6 border border-slate-700/50"
    >
      <h3 className="text-white font-semibold mb-4">💡 Mẹo bảo mật</h3>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {tips.map((tip, index) => (
          <div
            key={index}
            className="bg-slate-800/50 rounded-lg p-4 border border-slate-700/30"
          >
            {tip.icon}
            <h4 className="text-slate-200 font-medium mb-2">{tip.title}</h4>
            <p className="text-slate-300 text-sm">{tip.description}</p>
          </div>
        ))}
      </div>
    </motion.div>
  );
});

SecurityTips.displayName = "SecurityTips";

export default SecurityTips;
