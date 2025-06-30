import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  ChevronLeft,
  ChevronRight,
  X,
  Plus,
  MessageCircle,
  Clock,
  Trash2,
} from "lucide-react";
import PropTypes from "prop-types";

/**
 * Sidebar cho trang StudyChat
 *
 * @component
 */
const ChatSidebar = ({
  conversations,
  activeConversationId,
  setActiveConversationId,
  sidebarCollapsed,
  setSidebarCollapsed,
  createNewConversation,
  deleteConversation,
}) => {
  return (
    <motion.div
      initial={false}
      animate={{ width: sidebarCollapsed ? 80 : 320 }}
      transition={{ duration: 0.3, ease: "easeInOut" }}
      className="glass rounded-2xl border border-slate-700/50 flex flex-col overflow-hidden"
    >
      {/* Sidebar Header */}
      <div className="p-4 border-b border-slate-700/50">
        <div className="flex items-center justify-between">
          <AnimatePresence mode="wait">
            {!sidebarCollapsed && (
              <motion.h3
                key="conversations-title"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.2 }}
                className="text-white font-semibold"
              >
                Conversations
              </motion.h3>
            )}
          </AnimatePresence>
          <div className="flex items-center gap-2">
            <AnimatePresence mode="wait">
              {!sidebarCollapsed && (
                <motion.button
                  key="new-conversation-btn"
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.8 }}
                  transition={{ duration: 0.2 }}
                  onClick={createNewConversation}
                  className="px-3 py-1 bg-slate-800/50 text-slate-300 hover:text-white rounded-lg hover:bg-slate-700/50 transition-all border border-slate-700/50 flex items-center gap-2 text-sm"
                >
                  <Plus className="w-4 h-4" />
                  New
                </motion.button>
              )}
            </AnimatePresence>
            <motion.button
              onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
              className="p-2 bg-slate-800/50 rounded-lg border border-slate-700/50 hover:bg-slate-700/50 transition-all text-slate-300 hover:text-white"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <motion.div
                animate={{ rotate: sidebarCollapsed ? 0 : 180 }}
                transition={{ duration: 0.3, ease: "easeInOut" }}
              >
                <ChevronRight className="w-4 h-4" />
              </motion.div>
            </motion.button>
          </div>
        </div>
      </div>

      {/* Conversations List */}
      <div className="flex-1 overflow-y-auto p-2">
        <motion.div
          className="space-y-1"
          layout
          transition={{ duration: 0.15, ease: "easeOut" }}
        >
          <AnimatePresence initial={false}>
            {conversations.map((conversation, index) => (
              <ConversationItem
                key={conversation._id}
                conversation={conversation}
                index={index}
                isActive={activeConversationId === conversation._id}
                sidebarCollapsed={sidebarCollapsed}
                onClick={() => setActiveConversationId(conversation._id)}
                onDelete={(e) => deleteConversation(conversation._id, e)}
              />
            ))}
          </AnimatePresence>
        </motion.div>
      </div>

      {/* Add New Button for Collapsed State */}
      <AnimatePresence>
        {sidebarCollapsed && (
          <motion.div
            key="collapsed-new-btn"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            transition={{ duration: 0.2, delay: 0.1 }}
            className="p-2 border-t border-slate-700/50"
          >
            <motion.button
              onClick={createNewConversation}
              className="w-full p-2 bg-slate-800/50 rounded-lg hover:bg-slate-700/50 transition-all border border-slate-700/50 flex items-center justify-center text-slate-300 hover:text-white"
              title="New Conversation"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <Plus className="w-4 h-4" />
            </motion.button>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

/**
 * Item cuộc trò chuyện
 */
const ConversationItem = React.memo(
  ({ conversation, index, isActive, sidebarCollapsed, onClick, onDelete }) => (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{
        opacity: 0,
        x: -20,
        transition: {
          duration: 0.15,
          ease: "easeIn",
        },
      }}
      transition={{
        duration: 0.15,
        delay: 0,
        ease: "easeOut",
      }}
      layout="position"
      className={`p-2 rounded-lg cursor-pointer transition-all duration-200 group relative border border-slate-700/30 group-hover/delete:border-red-500/20 ${
        isActive
          ? "bg-slate-800/70 border-slate-600/50 shadow-lg"
          : "bg-slate-800/30 hover:bg-slate-700/30 hover:border-slate-600/30"
      }`}
      onClick={onClick}
      title={sidebarCollapsed ? conversation.title : ""}
      whileHover={{ scale: sidebarCollapsed ? 1.05 : 1.02 }}
      whileTap={{ scale: 0.98 }}
    >
      {sidebarCollapsed ? (
        // Collapsed view - only show icon
        <div className="flex items-center justify-center">
          <MessageCircle className="w-4 h-4 text-white" />
          {isActive && (
            <motion.div
              initial={{ width: 0, opacity: 0 }}
              animate={{ width: 6, opacity: 1 }}
              exit={{ width: 0, opacity: 0 }}
              className="absolute -right-1 top-1/2 -translate-y-1/2 h-8 bg-white rounded-l-md"
            />
          )}
        </div>
      ) : (
        // Expanded view - show full content
        <div className="flex items-start justify-between">
          <div className="flex-1 min-w-0">
            <h4 className="text-white font-medium text-xs truncate">
              {conversation.title}
            </h4>
            <p className="text-slate-300 text-xs truncate mt-0.5 leading-tight">
              {conversation.lastMessage}
            </p>
            <div className="flex items-center gap-1 mt-1">
              <Clock className="w-2.5 h-2.5 text-slate-400" />
              <span className="text-slate-400 text-xs">
                {conversation.timestamp}
              </span>
            </div>
          </div>
          <motion.button
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 0, scale: 1 }}
            whileHover={{
              opacity: 1,
              scale: 1.1,
              backgroundColor: "rgba(239, 68, 68, 0.1)",
              transition: { duration: 0.2 },
            }}
            whileTap={{
              scale: 0.9,
              backgroundColor: "rgba(239, 68, 68, 0.2)",
            }}
            onClick={onDelete}
            className="text-slate-400 hover:text-red-400 transition-colors p-1.5 rounded-md group/delete"
          >
            <motion.div
              whileHover={{ rotate: [0, -10, 10, -10, 0] }}
              transition={{ duration: 0.3 }}
            >
              <Trash2 className="w-3 h-3" />
            </motion.div>
          </motion.button>
        </div>
      )}
    </motion.div>
  )
);

ChatSidebar.propTypes = {
  /** Danh sách cuộc trò chuyện */
  conversations: PropTypes.array.isRequired,
  /** ID cuộc trò chuyện đang hiển thị */
  activeConversationId: PropTypes.number.isRequired,
  /** Hàm cập nhật cuộc trò chuyện đang hiển thị */
  setActiveConversationId: PropTypes.func.isRequired,
  /** Trạng thái thu gọn của sidebar */
  sidebarCollapsed: PropTypes.bool.isRequired,
  /** Hàm cập nhật trạng thái thu gọn */
  setSidebarCollapsed: PropTypes.func.isRequired,
  /** Hàm tạo cuộc trò chuyện mới */
  createNewConversation: PropTypes.func.isRequired,
  /** Hàm xóa cuộc trò chuyện */
  deleteConversation: PropTypes.func.isRequired,
};

ConversationItem.propTypes = {
  /** Thông tin cuộc trò chuyện */
  conversation: PropTypes.object.isRequired,
  /** Vị trí của cuộc trò chuyện */
  index: PropTypes.number.isRequired,
  /** Trạng thái hiển thị */
  isActive: PropTypes.bool.isRequired,
  /** Trạng thái thu gọn của sidebar */
  sidebarCollapsed: PropTypes.bool.isRequired,
  /** Hàm xử lý khi nhấp vào */
  onClick: PropTypes.func.isRequired,
  /** Hàm xử lý khi xóa */
  onDelete: PropTypes.func.isRequired,
};

export default ChatSidebar;
