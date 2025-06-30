import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Send,
  Info,
  BarChart3,
  Search,
  Calendar,
  TrendingUp,
  Brain,
} from "lucide-react";
import PropTypes from "prop-types";
import MarkdownRenderer from "../../../components/common/MarkdownRenderer";

/**
 * Panel chat cho quản lý tài chính
 *
 * @component
 */
const ChatPanel = ({
  messages,
  inputMessage,
  setInputMessage,
  isLoading,
  messagesEndRef,
  handleSendMessage,
  handleGuidance,
  setActiveTab,
  handleQuickAction,
  setMessages,
  onSmartPlanning,
}) => {
  const quickActions = [
    {
      id: "guidance",
      label: "Hướng dẫn",
      icon: Info,
      color: "from-blue-600 to-cyan-600",
      action: handleGuidance,
    },
    {
      id: "stats",
      label: "Thống kê",
      icon: BarChart3,
      color: "from-purple-600 to-pink-600",
      action: () => setActiveTab("stats"),
    },
    {
      id: "daily_review",
      label: "Dò lại chi tiêu",
      icon: Search,
      color: "from-green-600 to-emerald-600",
      action: () => handleQuickAction("dò lại chi tiêu hôm nay"),
    },
    {
      id: "daily_expenses",
      label: "Chi tiêu hôm nay",
      icon: TrendingUp,
      color: "from-teal-600 to-cyan-600",
      action: () => handleQuickAction("chi tiêu hôm nay"),
    },
    {
      id: "monthly_expenses",
      label: "Chi tiêu tháng",
      icon: Calendar,
      color: "from-orange-600 to-red-600",
      action: () => handleQuickAction("chi tiêu tháng này"),
    },
    {
      id: "smart_planning",
      label: "Lập kế hoạch thông minh",
      icon: Brain,
      color: "from-purple-600 to-indigo-600",
      action: () => onSmartPlanning && onSmartPlanning(),
    },
  ];

  return (
    <motion.div
      key="chat"
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 20 }}
      className="glass rounded-2xl border border-slate-700/50 flex flex-col h-[800px]"
    >
      {/* Quick Actions Navigation */}
      <div className="p-4 border-b border-slate-700/50">
        <div className="grid grid-cols-3 gap-2">
          {quickActions.map((action) => {
            const IconComponent = action.icon;
            return (
              <button
                key={action.id}
                onClick={action.action}
                className={`group relative px-3 py-2 bg-gradient-to-r ${action.color} rounded-xl transition-all hover:scale-105 active:scale-95 text-white text-xs font-medium shadow-lg hover:shadow-xl`}
              >
                <div className="flex items-center justify-center space-x-1">
                  <IconComponent className="w-3 h-3" />
                  <span className="hidden sm:inline">{action.label}</span>
                </div>

                {/* Tooltip for mobile */}
                <div className="absolute -top-8 left-1/2 transform -translate-x-1/2 bg-slate-900 text-white px-2 py-1 rounded text-xs opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none sm:hidden whitespace-nowrap z-10">
                  {action.label}
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Chat Messages */}
      <div className="flex-1 p-6 overflow-y-auto">
        <div className="space-y-4">
          {messages.map((message) => (
            <motion.div
              key={message.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className={`flex ${
                message.type === "user" ? "justify-end" : "justify-start"
              }`}
            >
              <div
                className={`max-w-xs lg:max-w-md px-4 py-3 rounded-xl ${
                  message.type === "user"
                    ? "bg-gradient-to-r from-blue-700/50 to-violet-700/50 text-white border border-blue-500/30"
                    : "bg-slate-800/50 text-slate-300 border border-slate-700/30"
                }`}
              >
                {message.type === "user" ? (
                  <div className="whitespace-pre-wrap text-sm">
                    {message.content}
                  </div>
                ) : (
                  <MarkdownRenderer
                    content={message.content}
                    className="text-sm"
                  />
                )}
                <div
                  className={`text-xs mt-2 ${
                    message.type === "user"
                      ? "text-slate-200"
                      : "text-slate-400"
                  }`}
                >
                  {message.timestamp.toLocaleTimeString()}
                </div>
              </div>
            </motion.div>
          ))}

          {isLoading && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="flex justify-start"
            >
              <div className="px-4 py-3 rounded-xl bg-slate-800/50 text-slate-300 border border-slate-700/30">
                <div className="flex items-center space-x-2">
                  <div className="w-2 h-2 bg-slate-300 rounded-full animate-pulse"></div>
                  <div className="w-2 h-2 bg-slate-300 rounded-full animate-pulse delay-150"></div>
                  <div className="w-2 h-2 bg-slate-300 rounded-full animate-pulse delay-300"></div>
                </div>
              </div>
            </motion.div>
          )}
          <div ref={messagesEndRef} />
        </div>
      </div>

      {/* Input Area */}
      <div className="p-4 border-t border-slate-700/50">
        <div className="flex space-x-2">
          <input
            type="text"
            value={inputMessage}
            onChange={(e) => setInputMessage(e.target.value)}
            onKeyPress={(e) => e.key === "Enter" && handleSendMessage()}
            placeholder="Ví dụ: 25k cafe, +7tr lương, dò lại chi tiêu..."
            className="flex-1 bg-slate-800/50 border border-slate-700/50 rounded-xl px-4 py-3 text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            disabled={isLoading}
          />
          <button
            onClick={handleSendMessage}
            disabled={isLoading || !inputMessage.trim()}
            className="px-4 py-3 bg-gradient-to-r from-blue-700 to-violet-700 text-white rounded-xl hover:from-blue-600 hover:to-violet-600 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Send className="w-5 h-5" />
          </button>
        </div>
      </div>
    </motion.div>
  );
};

ChatPanel.propTypes = {
  /** Danh sách tin nhắn */
  messages: PropTypes.array.isRequired,
  /** Nội dung tin nhắn đang nhập */
  inputMessage: PropTypes.string.isRequired,
  /** Hàm cập nhật tin nhắn đang nhập */
  setInputMessage: PropTypes.func.isRequired,
  /** Trạng thái đang tải */
  isLoading: PropTypes.bool.isRequired,
  /** Ref đến phần tử cuối cùng để cuộn */
  messagesEndRef: PropTypes.object.isRequired,
  /** Hàm xử lý gửi tin nhắn */
  handleSendMessage: PropTypes.func.isRequired,
  /** Hàm xử lý hiển thị hướng dẫn */
  handleGuidance: PropTypes.func.isRequired,
  /** Hàm chuyển tab */
  setActiveTab: PropTypes.func.isRequired,
  /** Hàm xử lý quick actions */
  handleQuickAction: PropTypes.func.isRequired,
  /** Hàm set messages */
  setMessages: PropTypes.func.isRequired,
  /** Hàm mở Smart Planning */
  onSmartPlanning: PropTypes.func,
};

export default ChatPanel;
