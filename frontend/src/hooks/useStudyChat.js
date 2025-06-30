import { useState, useEffect, useRef, useCallback } from "react";
import { toast } from "react-hot-toast";
import studyService from "../services/api/studyService";
import { QUICK_STUDY_QUESTIONS } from "../constants/navigation";

/**
 * Hook quản lý chat học tập
 *
 * @returns {Object} Trạng thái và hàm xử lý chat học tập
 */
const useStudyChat = () => {
  const [conversations, setConversations] = useState([]);
  const [activeConversationId, setActiveConversationId] = useState(null);
  const [messages, setMessages] = useState([]);
  const [inputMessage, setInputMessage] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [loading, setLoading] = useState(true);
  const [currentSubject, setCurrentSubject] = useState("");
  const [currentDifficulty, setCurrentDifficulty] = useState("intermediate");

  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);

  // Lấy câu hỏi nhanh từ constants
  const quickQuestions = QUICK_STUDY_QUESTIONS;

  // Load conversations khi component mount
  useEffect(() => {
    loadConversations();
  }, []);

  // Load messages khi activeConversationId thay đổi
  useEffect(() => {
    if (activeConversationId) {
      loadConversationMessages(activeConversationId);
    } else {
      setMessages([]);
    }
  }, [activeConversationId]);

  // Cuộn xuống dưới khi có tin nhắn mới
  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  /**
   * Load danh sách cuộc trò chuyện
   */
  const loadConversations = async () => {
    try {
      setLoading(true);
      const response = await studyService.getConversations({ limit: 50 });

      if (response.success) {
        setConversations(response.data.conversations || []);

        // Auto select first conversation if exists
        if (
          response.data.conversations &&
          response.data.conversations.length > 0
        ) {
          setActiveConversationId(response.data.conversations[0]._id);
        }
      } else {
        toast.error("Không thể tải danh sách cuộc trò chuyện");
      }
    } catch (error) {
      console.error("Error loading conversations:", error);
      toast.error("Lỗi khi tải danh sách cuộc trò chuyện");

      // Fallback to demo data if API fails
      setConversations([
        {
          _id: "demo-1",
          title: "Blockchain Fundamentals",
          lastMessageAt: new Date(),
          messageCount: 3,
        },
      ]);
      setActiveConversationId("demo-1");
    } finally {
      setLoading(false);
    }
  };

  /**
   * Load tin nhắn của cuộc trò chuyện
   */
  const loadConversationMessages = async (conversationId) => {
    try {
      // Don't load demo conversation
      if (conversationId === "demo-1") {
        setMessages([
          {
            id: 1,
            type: "ai",
            content:
              "Xin chào! Tôi là trợ lý AI học tập của bạn. Tôi có thể giúp bạn học về Toán, Văn, Anh, Lý, Hóa, Sinh, Sử, Địa và nhiều môn học khác. Bạn muốn học gì hôm nay?",
            timestamp: new Date().toLocaleTimeString([], {
              hour: "2-digit",
              minute: "2-digit",
            }),
          },
        ]);
        return;
      }

      const response = await studyService.getChatHistory(conversationId);

      if (response.success) {
        const transformedMessages = response.data.messages.map((msg) => ({
          id: msg.id,
          sender: msg.type, // 'user' or 'ai'
          type: msg.type,
          text: msg.content,
          content: msg.content,
          timestamp: new Date(msg.timestamp).toLocaleTimeString([], {
            hour: "2-digit",
            minute: "2-digit",
          }),
          metadata: msg.metadata,
        }));

        setMessages(transformedMessages);

        // Set subject from conversation
        const conversation = conversations.find(
          (c) => c._id === conversationId
        );
        if (conversation && conversation.subject) {
          setCurrentSubject(conversation.subject);
        }
      }
    } catch (error) {
      console.error("Error loading messages:", error);
      toast.error("Không thể tải tin nhắn");
    }
  };

  /**
   * Cuộn xuống dưới cùng của khung chat
   */
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  /**
   * Xử lý gửi tin nhắn
   */
  const handleSendMessage = useCallback(
    async (e, quickQuestion = null) => {
      e?.preventDefault();

      const messageToSend = quickQuestion || inputMessage.trim();
      if (!messageToSend || isTyping) return;

      const userMessage = {
        id: Date.now(),
        sender: "user",
        type: "user",
        text: messageToSend,
        content: messageToSend,
        timestamp: new Date().toLocaleTimeString([], {
          hour: "2-digit",
          minute: "2-digit",
        }),
      };

      setMessages((prev) => [...prev, userMessage]);
      setInputMessage("");
      setIsTyping(true);

      try {
        // Determine conversation ID
        let conversationId = activeConversationId;
        if (conversationId === "demo-1") {
          conversationId = null; // Let backend create new conversation
        }

        const response = await studyService.sendMessage(
          messageToSend,
          conversationId,
          currentSubject,
          currentDifficulty
        );

        if (response.success) {
          const { ai_response, conversation_id } = response.data;

          // Update active conversation ID if it was created
          if (!activeConversationId || activeConversationId === "demo-1") {
            setActiveConversationId(conversation_id);
            // Reload conversations to get the new one
            loadConversations();
          }

          // Add AI response
          const aiMessage = {
            id: ai_response.id,
            sender: "ai",
            type: "ai",
            text: ai_response.content,
            content: ai_response.content,
            timestamp: new Date(ai_response.timestamp).toLocaleTimeString([], {
              hour: "2-digit",
              minute: "2-digit",
            }),
            metadata: {
              subject_detected: ai_response.subject_detected,
              confidence: ai_response.confidence,
              follow_up_questions: ai_response.follow_up_questions,
              related_topics: ai_response.related_topics,
              processing_time: ai_response.processing_time,
            },
          };

          setMessages((prev) => [...prev, aiMessage]);

          // Update subject if detected
          if (ai_response.subject_detected) {
            setCurrentSubject(ai_response.subject_detected);
          }

          // Update conversation in list
          setConversations((prev) =>
            prev.map((conv) =>
              conv._id === conversation_id
                ? {
                    ...conv,
                    lastMessageAt: new Date(),
                    messageCount: conv.messageCount + 2,
                  }
                : conv
            )
          );
        } else {
          throw new Error(response.message || "Failed to send message");
        }
      } catch (error) {
        console.error("Send message error:", error);
        toast.error("Không thể gửi tin nhắn. Vui lòng thử lại.");

        // Add error message
        const errorMessage = {
          id: Date.now() + 1,
          sender: "ai",
          type: "ai",
          text: "Xin lỗi, có lỗi xảy ra khi xử lý câu hỏi của bạn. Vui lòng thử lại sau.",
          content:
            "Xin lỗi, có lỗi xảy ra khi xử lý câu hỏi của bạn. Vui lòng thử lại sau.",
          timestamp: new Date().toLocaleTimeString([], {
            hour: "2-digit",
            minute: "2-digit",
          }),
        };
        setMessages((prev) => [...prev, errorMessage]);
      } finally {
        setIsTyping(false);
      }
    },
    [
      inputMessage,
      isTyping,
      activeConversationId,
      currentSubject,
      currentDifficulty,
    ]
  );

  /**
   * Xử lý phím tắt
   */
  const handleKeyPress = useCallback(
    (e) => {
      if (e.key === "Enter" && !e.shiftKey) {
        e.preventDefault();
        handleSendMessage();
      }
    },
    [handleSendMessage]
  );

  /**
   * Tạo cuộc trò chuyện mới
   */
  const createNewConversation = useCallback(async () => {
    try {
      const response = await studyService.createConversation(
        "Cuộc trò chuyện mới",
        currentSubject
      );

      if (response.success) {
        const newConversation = response.data.conversation;

        setConversations((prev) => [newConversation, ...prev]);
        setActiveConversationId(newConversation._id);

        // Reset messages with welcome message
        setMessages([
          {
            id: 1,
            sender: "ai",
            type: "ai",
            text: "Xin chào! Tôi sẵn sàng giúp bạn học tập. Bạn muốn hỏi về gì?",
            content:
              "Xin chào! Tôi sẵn sàng giúp bạn học tập. Bạn muốn hỏi về gì?",
            timestamp: new Date().toLocaleTimeString([], {
              hour: "2-digit",
              minute: "2-digit",
            }),
          },
        ]);

        toast.success("Đã tạo cuộc trò chuyện mới");
      }
    } catch (error) {
      console.error("Create conversation error:", error);
      toast.error("Không thể tạo cuộc trò chuyện mới");
    }
  }, [currentSubject]);

  /**
   * Xóa cuộc trò chuyện
   */
  const deleteConversation = useCallback(
    async (conversationId, e) => {
      e?.stopPropagation();

      // Debug log
      console.log("🗑️ Attempting to delete conversation:", conversationId);

      // Validation
      if (!conversationId || conversationId === "undefined") {
        console.error("❌ Invalid conversation ID:", conversationId);
        toast.error("ID cuộc trò chuyện không hợp lệ");
        return;
      }

      if (conversationId === "demo-1") {
        toast.error("Không thể xóa cuộc trò chuyện demo");
        return;
      }

      if (conversations.length <= 1) {
        toast.error("Không thể xóa cuộc trò chuyện cuối cùng");
        return;
      }

      try {
        console.log("🔄 Calling delete API for conversation:", conversationId);
        const response = await studyService.deleteConversation(conversationId);

        if (response.success) {
          console.log("✅ Conversation deleted successfully");

          // Nếu xóa cuộc trò chuyện đang hiển thị, chuyển sang cuộc trò chuyện khác
          if (activeConversationId === conversationId) {
            const remaining = conversations.filter(
              (c) => c._id !== conversationId
            );
            if (remaining.length > 0) {
              setActiveConversationId(remaining[0]._id);
            }
          }

          setConversations((prev) =>
            prev.filter((c) => c._id !== conversationId)
          );
          toast.success("Đã xóa cuộc trò chuyện");
        }
      } catch (error) {
        console.error("❌ Delete conversation error:", error);
        toast.error("Không thể xóa cuộc trò chuyện");
      }
    },
    [conversations, activeConversationId]
  );

  /**
   * Lấy cuộc trò chuyện đang hiển thị
   */
  const activeConversation = conversations.find(
    (c) => c._id === activeConversationId
  );

  return {
    conversations,
    activeConversationId,
    setActiveConversationId,
    activeConversation,
    messages,
    inputMessage,
    setInputMessage,
    isTyping,
    sidebarCollapsed,
    setSidebarCollapsed,
    messagesEndRef,
    inputRef,
    quickQuestions,
    currentSubject,
    setCurrentSubject,
    currentDifficulty,
    setCurrentDifficulty,
    loading,
    handleSendMessage,
    handleKeyPress,
    createNewConversation,
    deleteConversation,
    loadConversations,
  };
};

export default useStudyChat;
