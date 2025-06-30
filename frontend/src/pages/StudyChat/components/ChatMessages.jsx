import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { User, Bot } from "lucide-react";
import PropTypes from "prop-types";
import { MarkdownRenderer } from "../../../components/common";

/**
 * Phần hiển thị tin nhắn chat
 *
 * @component
 */
const ChatMessages = ({
  activeConversationId,
  messages,
  isTyping,
  messagesEndRef,
}) => {
  return (
    <motion.div
      key={activeConversationId}
      className="flex-1 overflow-y-auto p-6 space-y-4"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
    >
      <AnimatePresence mode="wait">
        {messages.map((message, index) => (
          <motion.div
            key={`${activeConversationId}-${message.id}`}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            transition={{
              delay: index * 0.05,
              duration: 0.2,
              ease: "easeOut",
            }}
            className={`flex ${
              message.sender === "user" ? "justify-end" : "justify-start"
            }`}
          >
            <div
              className={`max-w-lg p-4 rounded-2xl ${
                message.sender === "user"
                  ? "bg-gradient-to-r from-blue-700/50 to-violet-700/50 text-white border border-blue-500/30"
                  : "bg-slate-800/50 text-slate-300 border border-slate-700/30"
              }`}
            >
              <div className="flex items-start gap-3">
                <div
                  className={`p-1 rounded-lg flex-shrink-0 ${
                    message.sender === "user"
                      ? "bg-blue-500/30"
                      : "bg-slate-700/50"
                  }`}
                >
                  {message.sender === "user" ? (
                    <User className="w-4 h-4 text-white" />
                  ) : (
                    <Bot className="w-4 h-4 text-white" />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  {message.sender === "user" ? (
                    <p className="text-sm leading-relaxed whitespace-pre-wrap text-white">
                      {message.text}
                    </p>
                  ) : (
                    <MarkdownRenderer
                      content={message.text}
                      className="text-sm"
                    />
                  )}
                  <p
                    className={`text-xs mt-2 ${
                      message.sender === "user"
                        ? "text-slate-200"
                        : "text-slate-400"
                    }`}
                  >
                    {message.timestamp}
                  </p>
                </div>
              </div>
            </div>
          </motion.div>
        ))}
      </AnimatePresence>

      {isTyping && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex justify-start"
        >
          <div className="max-w-lg p-4 rounded-2xl bg-slate-800/50 border border-slate-700/30">
            <div className="flex items-center gap-3">
              <div className="p-1 bg-slate-700/50 rounded-lg">
                <Bot className="w-4 h-4 text-white" />
              </div>
              <div className="flex gap-1">
                <div className="w-2 h-2 bg-slate-300 rounded-full animate-bounce"></div>
                <div className="w-2 h-2 bg-slate-300 rounded-full animate-bounce delay-100"></div>
                <div className="w-2 h-2 bg-slate-300 rounded-full animate-bounce delay-200"></div>
              </div>
            </div>
          </div>
        </motion.div>
      )}
      <div ref={messagesEndRef} />
    </motion.div>
  );
};

ChatMessages.propTypes = {
  /** ID cuộc trò chuyện đang hiển thị */
  activeConversationId: PropTypes.number.isRequired,
  /** Danh sách tin nhắn */
  messages: PropTypes.array.isRequired,
  /** Trạng thái đang nhập */
  isTyping: PropTypes.bool.isRequired,
  /** Ref đến phần tử cuối cùng để cuộn */
  messagesEndRef: PropTypes.object.isRequired,
};

export default ChatMessages;
