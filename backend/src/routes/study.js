import express from "express";
import { body, query, validationResult } from "express-validator";
import mongoose from "mongoose";
import { authenticate, userRateLimit } from "../middleware/auth.js";

const router = express.Router();

// Apply authentication to all routes
router.use(authenticate);

// Conversation Schema
const conversationSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    walletAddress: {
      type: String,
      required: true,
      lowercase: true,
      index: true,
    },
    title: {
      type: String,
      required: true,
      trim: true,
      maxlength: 200,
      default: "New Conversation",
    },
    subject: {
      type: String,
      trim: true,
      maxlength: 100,
    },
    messageCount: {
      type: Number,
      default: 0,
    },
    lastMessageAt: {
      type: Date,
      default: Date.now,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    metadata: {
      language: { type: String, default: "vi" },
      difficulty: {
        type: String,
        enum: ["beginner", "intermediate", "advanced"],
        default: "beginner",
      },
      tags: [String],
    },
  },
  {
    timestamps: true,
    collection: "conversations",
  }
);

// Message Schema
const messageSchema = new mongoose.Schema(
  {
    conversationId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Conversation",
      required: true,
      index: true,
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    type: {
      type: String,
      enum: ["user", "ai"],
      required: true,
    },
    content: {
      type: String,
      required: true,
      maxlength: 10000,
    },
    metadata: {
      model: String,
      processingTime: Number,
      confidence: Number,
      tokens: Number,
      subject: String,
      followUp: [String],
    },
  },
  {
    timestamps: true,
    collection: "messages",
  }
);

// Indexes
conversationSchema.index({ userId: 1, updatedAt: -1 });
conversationSchema.index({ walletAddress: 1, isActive: 1 });
messageSchema.index({ conversationId: 1, createdAt: 1 });
messageSchema.index({ userId: 1, type: 1 });

// Create models
const Conversation = mongoose.model("Conversation", conversationSchema);
const Message = mongoose.model("Message", messageSchema);

// Validation middleware
const validateConversation = [
  body("title")
    .optional()
    .trim()
    .isLength({ min: 1, max: 200 })
    .withMessage("Title must be 1-200 characters"),
  body("subject")
    .optional()
    .trim()
    .isLength({ max: 100 })
    .withMessage("Subject must be less than 100 characters"),
];

const validateMessage = [
  body("message")
    .trim()
    .isLength({ min: 1, max: 10000 })
    .withMessage("Message must be 1-10000 characters"),
  body("conversation_id")
    .optional()
    .isMongoId()
    .withMessage("Invalid conversation ID"),
];

const validateQuery = [
  query("limit")
    .optional()
    .isInt({ min: 1, max: 50 })
    .withMessage("Limit must be between 1 and 50"),
  query("offset")
    .optional()
    .isInt({ min: 0 })
    .withMessage("Offset must be a non-negative number"),
];

// @route   GET /api/study/conversations
// @desc    Get user's conversations
// @access  Private
router.get("/conversations", validateQuery, async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: "Validation failed",
        errors: errors.array(),
      });
    }

    const { limit = 20, offset = 0 } = req.query;

    const conversations = await Conversation.find({
      userId: req.user._id,
      isActive: true,
    })
      .sort({ updatedAt: -1 })
      .limit(parseInt(limit))
      .skip(parseInt(offset))
      .select("-__v");

    const total = await Conversation.countDocuments({
      userId: req.user._id,
      isActive: true,
    });

    res.status(200).json({
      success: true,
      data: {
        conversations,
        pagination: {
          total,
          limit: parseInt(limit),
          offset: parseInt(offset),
          hasMore: parseInt(offset) + parseInt(limit) < total,
        },
      },
    });
  } catch (error) {
    console.error("Get conversations error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to get conversations",
    });
  }
});

// @route   POST /api/study/conversations
// @desc    Create new conversation
// @access  Private
router.post(
  "/conversations",
  userRateLimit(20, 15 * 60 * 1000),
  validateConversation,
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          success: false,
          message: "Validation failed",
          errors: errors.array(),
        });
      }

      const { title, subject } = req.body;

      const conversation = new Conversation({
        userId: req.user._id,
        walletAddress: req.user.walletAddress,
        title: title || "New Conversation",
        subject: subject || "",
        metadata: {
          language: req.user.preferences?.language || "vi",
        },
      });

      await conversation.save();

      // Update user stats
      await req.user.updateStats("conversation");

      res.status(201).json({
        success: true,
        message: "Conversation created successfully",
        data: { conversation },
      });
    } catch (error) {
      console.error("Create conversation error:", error);
      res.status(500).json({
        success: false,
        message: "Failed to create conversation",
      });
    }
  }
);

// @route   GET /api/study/conversations/:id
// @desc    Get conversation messages
// @access  Private
router.get("/conversations/:id", async (req, res) => {
  try {
    const { id } = req.params;

    // Validate conversation ID
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid conversation ID",
      });
    }

    // Check if conversation exists and belongs to user
    const conversation = await Conversation.findOne({
      _id: id,
      userId: req.user._id,
      isActive: true,
    });

    if (!conversation) {
      return res.status(404).json({
        success: false,
        message: "Conversation not found",
      });
    }

    // Get messages for this conversation
    const messages = await Message.find({
      conversationId: id,
    })
      .sort({ createdAt: 1 })
      .select("-__v");

    // Transform messages for frontend
    const transformedMessages = messages.map((msg) => ({
      id: msg._id,
      type: msg.type,
      content: msg.content,
      timestamp: msg.createdAt,
      metadata: msg.metadata,
    }));

    res.status(200).json({
      success: true,
      data: {
        conversation,
        messages: transformedMessages,
      },
    });
  } catch (error) {
    console.error("Get conversation messages error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to get conversation messages",
    });
  }
});

// @route   PUT /api/study/conversations/:id
// @desc    Update conversation
// @access  Private
router.put("/conversations/:id", validateConversation, async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: "Validation failed",
        errors: errors.array(),
      });
    }

    const { id } = req.params;
    const { title, subject } = req.body;

    const conversation = await Conversation.findOne({
      _id: id,
      userId: req.user._id,
      isActive: true,
    });

    if (!conversation) {
      return res.status(404).json({
        success: false,
        message: "Conversation not found",
      });
    }

    if (title) conversation.title = title;
    if (subject !== undefined) conversation.subject = subject;

    await conversation.save();

    res.status(200).json({
      success: true,
      message: "Conversation updated successfully",
      data: { conversation },
    });
  } catch (error) {
    console.error("Update conversation error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to update conversation",
    });
  }
});

// @route   DELETE /api/study/conversations/:id
// @desc    Delete conversation (soft delete)
// @access  Private
router.delete("/conversations/:id", async (req, res) => {
  try {
    const { id } = req.params;

    // Validate conversation ID
    if (!id || id === "undefined" || !mongoose.Types.ObjectId.isValid(id)) {
      console.error("❌ Invalid conversation ID:", id);
      return res.status(400).json({
        success: false,
        message: "Invalid conversation ID",
      });
    }

    console.log(
      "🔄 Attempting to delete conversation:",
      id,
      "for user:",
      req.user._id
    );

    const conversation = await Conversation.findOne({
      _id: id,
      userId: req.user._id,
      isActive: true,
    });

    if (!conversation) {
      console.log("❌ Conversation not found:", id);
      return res.status(404).json({
        success: false,
        message: "Conversation not found",
      });
    }

    conversation.isActive = false;
    await conversation.save();

    console.log("✅ Conversation deleted successfully:", id);

    res.status(200).json({
      success: true,
      message: "Conversation deleted successfully",
    });
  } catch (error) {
    console.error("Delete conversation error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to delete conversation",
    });
  }
});

// @route   POST /api/study/conversations/:id/messages
// @desc    Add message to conversation
// @access  Private
router.post(
  "/conversations/:id/messages",
  userRateLimit(100, 15 * 60 * 1000),
  [
    body("content")
      .trim()
      .isLength({ min: 1, max: 10000 })
      .withMessage("Message content must be 1-10000 characters"),
    body("type")
      .isIn(["user", "ai"])
      .withMessage("Message type must be user or ai"),
  ],
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          success: false,
          message: "Validation failed",
          errors: errors.array(),
        });
      }

      const { id } = req.params;
      const { content, type, metadata } = req.body;

      // Check if conversation exists and belongs to user
      const conversation = await Conversation.findOne({
        _id: id,
        userId: req.user._id,
        isActive: true,
      });

      if (!conversation) {
        return res.status(404).json({
          success: false,
          message: "Conversation not found",
        });
      }

      // Create new message
      const message = new Message({
        conversationId: id,
        userId: req.user._id,
        type,
        content,
        metadata: metadata || {},
      });

      await message.save();

      // Update conversation
      conversation.messageCount += 1;
      conversation.lastMessageAt = new Date();

      // Auto-generate title from first user message
      if (
        conversation.messageCount === 1 &&
        type === "user" &&
        conversation.title === "New Conversation"
      ) {
        conversation.title =
          content.substring(0, 50) + (content.length > 50 ? "..." : "");
      }

      await conversation.save();

      res.status(201).json({
        success: true,
        message: "Message added successfully",
        data: {
          message: {
            id: message._id,
            type: message.type,
            content: message.content,
            timestamp: message.createdAt,
            metadata: message.metadata,
          },
        },
      });
    } catch (error) {
      console.error("Add message error:", error);
      res.status(500).json({
        success: false,
        message: "Failed to add message",
      });
    }
  }
);

// @route   GET /api/study/stats
// @desc    Get user's study statistics
// @access  Private
router.get("/stats", async (req, res) => {
  try {
    const userId = req.user._id;

    // Get conversation stats
    const conversationStats = await Conversation.aggregate([
      { $match: { userId: userId, isActive: true } },
      {
        $group: {
          _id: null,
          totalConversations: { $sum: 1 },
          totalMessages: { $sum: "$messageCount" },
          avgMessagesPerConversation: { $avg: "$messageCount" },
          subjects: { $addToSet: "$subject" },
        },
      },
    ]);

    // Get message stats by type
    const messageStats = await Message.aggregate([
      { $match: { userId: userId } },
      {
        $group: {
          _id: "$type",
          count: { $sum: 1 },
        },
      },
    ]);

    // Get recent activity (last 7 days)
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    const recentActivity = await Message.countDocuments({
      userId: userId,
      createdAt: { $gte: sevenDaysAgo },
    });

    const stats =
      conversationStats.length > 0
        ? conversationStats[0]
        : {
            totalConversations: 0,
            totalMessages: 0,
            avgMessagesPerConversation: 0,
            subjects: [],
          };

    const messagesByType = {};
    messageStats.forEach((stat) => {
      messagesByType[stat._id] = stat.count;
    });

    res.status(200).json({
      success: true,
      data: {
        stats: {
          ...stats,
          messagesByType,
          recentActivity,
          activeSubjects: stats.subjects.filter((s) => s).length,
        },
      },
    });
  } catch (error) {
    console.error("Get study stats error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to get study statistics",
    });
  }
});

// @route   GET /api/study/search
// @desc    Search through user's messages
// @access  Private
router.get(
  "/search",
  [
    query("q")
      .trim()
      .isLength({ min: 1, max: 100 })
      .withMessage("Search query must be 1-100 characters"),
    query("limit")
      .optional()
      .isInt({ min: 1, max: 50 })
      .withMessage("Limit must be between 1 and 50"),
  ],
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          success: false,
          message: "Validation failed",
          errors: errors.array(),
        });
      }

      const { q, limit = 10 } = req.query;

      // Search through messages
      const messages = await Message.find({
        userId: req.user._id,
        content: { $regex: q, $options: "i" },
      })
        .populate("conversationId", "title subject")
        .sort({ createdAt: -1 })
        .limit(parseInt(limit));

      res.status(200).json({
        success: true,
        data: {
          query: q,
          results: messages,
          count: messages.length,
        },
      });
    } catch (error) {
      console.error("Search messages error:", error);
      res.status(500).json({
        success: false,
        message: "Failed to search messages",
      });
    }
  }
);

// @route   POST /api/study/chat
// @desc    Send message to AI study chat
// @access  Private
router.post(
  "/chat",
  userRateLimit(60, 15 * 60 * 1000),
  [
    body("message")
      .trim()
      .isLength({ min: 1, max: 5000 })
      .withMessage("Message must be 1-5000 characters"),
    body("conversation_id")
      .optional()
      .isMongoId()
      .withMessage("Invalid conversation ID"),
    body("subject")
      .optional()
      .trim()
      .isLength({ max: 100 })
      .withMessage("Subject must be less than 100 characters"),
    body("difficulty")
      .optional()
      .isIn(["beginner", "intermediate", "advanced"])
      .withMessage("Difficulty must be beginner, intermediate, or advanced"),
  ],
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          success: false,
          message: "Validation failed",
          errors: errors.array(),
        });
      }

      const { message, conversation_id, subject, difficulty } = req.body;

      // If conversation_id is provided, verify it belongs to user
      let conversation = null;
      if (conversation_id) {
        conversation = await Conversation.findOne({
          _id: conversation_id,
          userId: req.user._id,
          isActive: true,
        });

        if (!conversation) {
          return res.status(404).json({
            success: false,
            message: "Conversation not found",
          });
        }
      } else {
        // Create new conversation if not provided
        conversation = new Conversation({
          userId: req.user._id,
          walletAddress: req.user.walletAddress,
          title: message.substring(0, 50) + (message.length > 50 ? "..." : ""),
          subject: subject || "",
          metadata: {
            language: req.user.preferences?.language || "vi",
            difficulty: difficulty || "intermediate",
          },
        });
        await conversation.save();
      }

      // Save user message
      const userMessage = new Message({
        conversationId: conversation._id,
        userId: req.user._id,
        type: "user",
        content: message,
        metadata: {
          subject: subject,
          difficulty: difficulty,
        },
      });
      await userMessage.save();

      // Send to AI server
      try {
        const aiServerUrl =
          process.env.AI_SERVER_URL || "http://localhost:8000";
        const response = await fetch(`${aiServerUrl}/study-chat`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            message: message,
            conversation_id: conversation._id.toString(),
            subject: subject,
            difficulty: difficulty || "intermediate",
            language: "vi",
          }),
        });

        if (!response.ok) {
          throw new Error(
            `AI Server responded with status: ${response.status}`
          );
        }

        const aiResponse = await response.json();

        // Save AI response message
        const aiMessage = new Message({
          conversationId: conversation._id,
          userId: req.user._id,
          type: "ai",
          content: aiResponse.response,
          metadata: {
            model: "gemini-2.0-flash-exp",
            processingTime: aiResponse.processing_time,
            confidence: aiResponse.confidence,
            subject: aiResponse.subject_detected,
            followUp: aiResponse.follow_up_questions || [],
            relatedTopics: aiResponse.related_topics || [],
          },
        });
        await aiMessage.save();

        // Update conversation
        conversation.messageCount += 2; // User + AI message
        conversation.lastMessageAt = new Date();
        conversation.subject =
          aiResponse.subject_detected || conversation.subject;
        await conversation.save();

        res.status(200).json({
          success: true,
          message: "Chat message processed successfully",
          data: {
            conversation_id: conversation._id,
            user_message: {
              id: userMessage._id,
              type: "user",
              content: message,
              timestamp: userMessage.createdAt,
            },
            ai_response: {
              id: aiMessage._id,
              type: "ai",
              content: aiResponse.response,
              timestamp: aiMessage.createdAt,
              subject_detected: aiResponse.subject_detected,
              confidence: aiResponse.confidence,
              follow_up_questions: aiResponse.follow_up_questions || [],
              related_topics: aiResponse.related_topics || [],
              processing_time: aiResponse.processing_time,
            },
          },
        });
      } catch (aiError) {
        console.error("AI Server error:", aiError);

        // Save error message as AI response
        const errorMessage = new Message({
          conversationId: conversation._id,
          userId: req.user._id,
          type: "ai",
          content:
            "Xin lỗi, có lỗi xảy ra khi xử lý câu hỏi của bạn. Vui lòng thử lại sau.",
          metadata: {
            error: true,
            errorMessage: aiError.message,
          },
        });
        await errorMessage.save();

        conversation.messageCount += 2;
        conversation.lastMessageAt = new Date();
        await conversation.save();

        res.status(200).json({
          success: true,
          message: "Message saved but AI processing failed",
          data: {
            conversation_id: conversation._id,
            user_message: {
              id: userMessage._id,
              type: "user",
              content: message,
              timestamp: userMessage.createdAt,
            },
            ai_response: {
              id: errorMessage._id,
              type: "ai",
              content: errorMessage.content,
              timestamp: errorMessage.createdAt,
              error: true,
            },
          },
        });
      }
    } catch (error) {
      console.error("Study chat error:", error);
      res.status(500).json({
        success: false,
        message: "Failed to process chat message",
      });
    }
  }
);

export default router;
