import React from "react";
import { motion } from "framer-motion";
import { Brain } from "lucide-react";
import PropTypes from "prop-types";

/**
 * Header phần chat
 * 
 * @component
 */
const ChatHeader = ({ activeConversation, activeConversationId }) => {
    return (
        <motion.div
            key={`header-${activeConversationId}`}
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.2 }}
            className="glass rounded-2xl p-4 border border-slate-700/50 mb-4"
        >
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <div className="flex items-center gap-2">
                        <div className="p-2 bg-slate-800/70 rounded-lg">
                            <Brain className="w-5 h-5 text-white" />
                        </div>
                        <motion.div
                            key={`title-${activeConversationId}`}
                            initial={{ opacity: 0, x: -10 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ duration: 0.2, delay: 0.1 }}
                        >
                            <h1 className="text-lg font-semibold text-white">
                                {activeConversation?.title || "AI Study Assistant"}
                            </h1>
                            <p className="text-slate-300 text-sm">
                                Powered by advanced AI • Always learning
                            </p>
                        </motion.div>
                    </div>
                </div>
                <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                    <span className="text-slate-300 text-sm">Online</span>
                </div>
            </div>
        </motion.div>
    );
};

ChatHeader.propTypes = {
    /** Thông tin cuộc trò chuyện đang hiển thị */
    activeConversation: PropTypes.object,
    /** ID cuộc trò chuyện đang hiển thị */
    activeConversationId: PropTypes.number.isRequired,
};

export default ChatHeader;