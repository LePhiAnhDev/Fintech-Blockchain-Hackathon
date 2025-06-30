import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Send, BookOpen, BrainCircuit, ChevronDown } from "lucide-react";
import PropTypes from "prop-types";
import Button from "../../../components/common/Button";

/**
 * Custom Dropdown Component
 */
const CustomDropdown = ({
  value,
  onChange,
  options,
  icon: Icon,
  label,
  placeholder,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const selectedOption = options.find((opt) => opt.key === value) || options[0];

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 bg-slate-800/60 border border-slate-600/50 rounded-xl px-3 py-2 text-white text-sm hover:bg-slate-700/60 transition-all duration-200 min-w-[140px] justify-center"
      >
        <Icon className="w-4 h-4 text-blue-400" />
        <span className="text-slate-400 text-xs">{label}:</span>
        <span className="flex-1 text-center truncate">
          {selectedOption.label}
        </span>
        <ChevronDown
          className={`w-4 h-4 text-slate-400 transition-transform duration-200 ${
            isOpen ? "rotate-180" : ""
          }`}
        />
      </button>

      <AnimatePresence>
        {isOpen && (
          <>
            {/* Backdrop */}
            <div
              className="fixed inset-0 z-10"
              onClick={() => setIsOpen(false)}
            />

            {/* Dropdown Menu */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 10 }}
              transition={{ duration: 0.2 }}
              className="absolute bottom-full left-0 mb-2 w-full bg-slate-800/95 backdrop-blur-sm border border-slate-600/50 rounded-xl shadow-xl z-20 max-h-60 overflow-y-auto"
            >
              {options.map((option) => (
                <button
                  key={option.key}
                  type="button"
                  onClick={() => {
                    onChange(option.key);
                    setIsOpen(false);
                  }}
                  className={`w-full text-center px-4 py-3 text-sm transition-all duration-200 first:rounded-t-xl last:rounded-b-xl hover:bg-slate-700/60 ${
                    value === option.key
                      ? "bg-blue-600/20 text-blue-300 border-l-2 border-blue-500"
                      : "text-slate-300 hover:text-white"
                  }`}
                >
                  {option.label}
                </button>
              ))}
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
};

/**
 * Component nhập tin nhắn chat
 *
 * @component
 */
const ChatInput = ({
  inputMessage,
  setInputMessage,
  handleSendMessage,
  handleKeyPress,
  isTyping,
  inputRef,
  quickQuestions,
  messages,
  currentSubject,
  setCurrentSubject,
  currentDifficulty,
  setCurrentDifficulty,
}) => {
  const [showQuickQuestions, setShowQuickQuestions] = useState(false);

  const subjects = [
    { key: "", label: "Tự động" },
    { key: "toán", label: "Toán học" },
    { key: "lý", label: "Vật lý" },
    { key: "hóa", label: "Hóa học" },
    { key: "sinh", label: "Sinh học" },
    { key: "văn", label: "Văn học" },
    { key: "sử", label: "Lịch sử" },
    { key: "địa", label: "Địa lý" },
    { key: "anh", label: "Tiếng Anh" },
    { key: "tin", label: "Tin học" },
  ];

  const difficulties = [
    { key: "beginner", label: "Cơ bản" },
    { key: "intermediate", label: "Trung bình" },
    { key: "advanced", label: "Nâng cao" },
  ];

  const handleQuickQuestion = (question) => {
    setInputMessage(question);
    handleSendMessage(null, question);
    setShowQuickQuestions(false);
  };

  return (
    <div className="border-t border-slate-700/50 bg-slate-900/50 backdrop-blur-sm">
      {/* Subject and Difficulty Selection */}
      <div className="px-4 py-3 border-b border-slate-700/30">
        <div className="flex flex-wrap gap-3 items-center">
          <CustomDropdown
            value={currentSubject}
            onChange={setCurrentSubject}
            options={subjects}
            icon={BookOpen}
            label="Môn học"
          />
          <CustomDropdown
            value={currentDifficulty}
            onChange={setCurrentDifficulty}
            options={difficulties}
            icon={BrainCircuit}
            label="Trình độ"
          />
        </div>
      </div>

      {/* Quick Questions */}
      {messages.length <= 1 && (
        <div className="px-4 py-3 border-b border-slate-700/30">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-slate-400">Câu hỏi gợi ý:</span>
            <button
              onClick={() => setShowQuickQuestions(!showQuickQuestions)}
              className="text-xs text-blue-400 hover:text-blue-300 transition-colors"
            >
              {showQuickQuestions ? "Ẩn" : "Hiện thêm"}
            </button>
          </div>
          <div className="flex flex-wrap gap-2">
            {(showQuickQuestions
              ? quickQuestions
              : quickQuestions.slice(0, 3)
            ).map((question, index) => (
              <button
                key={index}
                onClick={() => handleQuickQuestion(question)}
                className="text-xs bg-gradient-to-r from-blue-600/20 to-purple-600/20 
                                         border border-blue-500/30 rounded-full px-3 py-1.5 
                                         text-blue-300 hover:bg-blue-600/30 transition-all duration-200
                                         hover:scale-105 hover:border-blue-400/50"
                disabled={isTyping}
              >
                {question}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Input Area */}
      <form onSubmit={handleSendMessage} className="p-4">
        <div className="flex gap-3">
          <div className="flex-1">
            <textarea
              ref={inputRef}
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder={
                isTyping
                  ? "AI đang suy nghĩ..."
                  : "Hỏi về bất kỳ môn học nào..."
              }
              disabled={isTyping}
              rows={1}
              className="w-full bg-slate-800/50 border border-slate-600/50 rounded-xl 
                                     px-4 text-white placeholder-slate-400 
                                     focus:outline-none focus:ring-2 focus:ring-blue-500/50 
                                     focus:border-transparent resize-none disabled:opacity-50
                                     transition-all duration-200 overflow-hidden chat-input-textarea"
              style={{
                height: "52px",
                lineHeight: "20px",
                paddingTop: "16px",
                paddingBottom: "16px",
                maxHeight: "120px",
                resize: "none",
              }}
              onInput={(e) => {
                e.target.style.height = "52px";
                if (e.target.scrollHeight > 52) {
                  e.target.style.height =
                    Math.min(e.target.scrollHeight, 120) + "px";
                }
              }}
            />
          </div>
          <button
            type="submit"
            disabled={!inputMessage.trim() || isTyping}
            className="h-[52px] w-[52px] bg-gradient-to-r from-blue-600 to-purple-600 
                                 hover:from-blue-700 hover:to-purple-700 disabled:from-slate-600 
                                 disabled:to-slate-600 disabled:cursor-not-allowed
                                 transition-all duration-200 hover:scale-105 flex items-center justify-center flex-shrink-0 rounded-xl"
          >
            {isTyping ? (
              <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            ) : (
              <Send className="w-5 h-5" />
            )}
          </button>
        </div>

        {/* Input Helper Text */}
        <div className="mt-2 text-xs text-slate-500 flex items-center justify-between">
          <span>Nhấn Enter để gửi, Shift + Enter để xuống dòng</span>
          <span>{inputMessage.length}/5000</span>
        </div>
      </form>
    </div>
  );
};

ChatInput.propTypes = {
  /** Nội dung tin nhắn đang nhập */
  inputMessage: PropTypes.string.isRequired,
  /** Hàm cập nhật tin nhắn đang nhập */
  setInputMessage: PropTypes.func.isRequired,
  /** Hàm xử lý gửi tin nhắn */
  handleSendMessage: PropTypes.func.isRequired,
  /** Hàm xử lý phím tắt */
  handleKeyPress: PropTypes.func.isRequired,
  /** Trạng thái đang nhập */
  isTyping: PropTypes.bool.isRequired,
  /** Ref đến phần tử input */
  inputRef: PropTypes.object.isRequired,
  /** Danh sách câu hỏi nhanh */
  quickQuestions: PropTypes.array.isRequired,
  /** Danh sách tin nhắn */
  messages: PropTypes.array.isRequired,
  /** Môn học hiện tại */
  currentSubject: PropTypes.string.isRequired,
  /** Hàm cập nhật môn học hiện tại */
  setCurrentSubject: PropTypes.func.isRequired,
  /** Trình độ hiện tại */
  currentDifficulty: PropTypes.string.isRequired,
  /** Hàm cập nhật trình độ hiện tại */
  setCurrentDifficulty: PropTypes.func.isRequired,
};

export default ChatInput;
