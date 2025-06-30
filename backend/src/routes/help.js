import express from "express";

const router = express.Router();

// FAQ data
const faqData = [
  {
    id: 1,
    category: "wallet",
    question: "Làm thế nào để kết nối ví MetaMask?",
    answer:
      'Để kết nối ví MetaMask, hãy nhấp vào nút "Connect Wallet" ở góc trên bên phải. Đảm bảo bạn đã cài đặt extension MetaMask và có tài khoản. Chọn mạng Sepolia testnet để sử dụng với ứng dụng.',
    tags: ["metamask", "wallet", "connection"],
    createdAt: new Date("2025-01-01"),
    updatedAt: new Date("2025-01-27"),
  },
  {
    id: 2,
    category: "nft",
    question: "Cách tạo NFT từ tài liệu học tập?",
    answer:
      'Vào Academic Hub, chọn tab "Create", tải lên tài liệu của bạn (PDF, DOCX, TXT, MD, PNG, JPG), điền thông tin mô tả, thiết lập phần trăm royalty, và nhấn "Create NFT". Phí mint là 0.01 ETH.',
    tags: ["nft", "academic", "mint", "create"],
    createdAt: new Date("2025-01-01"),
    updatedAt: new Date("2025-01-27"),
  },
  {
    id: 3,
    category: "finance",
    question: "Finance Manager hoạt động như thế nào?",
    answer:
      "Finance Manager giúp bạn theo dõi chi tiêu, phân tích giao dịch blockchain, và quản lý ngân sách. Bạn có thể nhập dữ liệu thủ công hoặc kết nối với ví để tự động theo dõi.",
    tags: ["finance", "budget", "tracking"],
    createdAt: new Date("2025-01-01"),
    updatedAt: new Date("2025-01-27"),
  },
  {
    id: 4,
    category: "ai",
    question: "AI Collections có những tính năng gì?",
    answer:
      "AI Collections cung cấp các công cụ tạo sinh AI bao gồm: tạo hình ảnh từ text, tạo video AI, và streaming generative content. Tất cả được tối ưu hóa cho GPU để xử lý nhanh chóng.",
    tags: ["ai", "generation", "image", "video"],
    createdAt: new Date("2025-01-01"),
    updatedAt: new Date("2025-01-27"),
  },
  {
    id: 5,
    category: "security",
    question: "Làm thế nào để bảo mật tài khoản?",
    answer:
      "Luôn giữ private key an toàn, không chia sẻ seed phrase, sử dụng hardware wallet khi có thể, và luôn kiểm tra URL trang web trước khi kết nối ví. Chúng tôi không bao giờ yêu cầu private key của bạn.",
    tags: ["security", "safety", "private key"],
    createdAt: new Date("2025-01-01"),
    updatedAt: new Date("2025-01-27"),
  },
  {
    id: 6,
    category: "nft",
    question: "Phí giao dịch NFT là bao nhiêu?",
    answer:
      "Phí mint NFT là 0.01 ETH. Ngoài ra còn có gas fee của mạng Ethereum. Khi bán NFT, platform thu phí 1% và creator nhận royalty theo tỷ lệ đã thiết lập (tối đa 20%).",
    tags: ["nft", "fees", "cost", "mint"],
    createdAt: new Date("2025-01-01"),
    updatedAt: new Date("2025-01-27"),
  },
  {
    id: 7,
    category: "wallet",
    question: "Tại sao tôi cần Sepolia testnet?",
    answer:
      "Ứng dụng hoạt động trên Sepolia testnet để testing an toàn. Bạn có thể lấy ETH test miễn phí từ Sepolia faucet. Điều này giúp bạn trải nghiệm mà không mất ETH thật.",
    tags: ["sepolia", "testnet", "testing"],
    createdAt: new Date("2025-01-01"),
    updatedAt: new Date("2025-01-27"),
  },
  {
    id: 8,
    category: "ai",
    question: "GPU requirements cho AI Collections?",
    answer:
      "AI Collections tự động phát hiện GPU. Để có hiệu suất tốt nhất, khuyến nghị GPU NVIDIA với CUDA support. Nếu không có GPU, hệ thống sẽ sử dụng CPU nhưng sẽ chậm hơn.",
    tags: ["ai", "gpu", "requirements", "performance"],
    createdAt: new Date("2025-01-01"),
    updatedAt: new Date("2025-01-27"),
  },
];

// Support options
const supportOptions = [
  {
    id: 1,
    title: "Chat trực tiếp",
    description: "Trò chuyện với team support",
    type: "chat",
    contact: "Live chat available 24/7",
    available: true,
    responseTime: "< 5 minutes",
  },
  {
    id: 2,
    title: "Email hỗ trợ",
    description: "Gửi email cho chúng tôi",
    type: "email",
    contact: "support@cashdig9.com",
    available: true,
    responseTime: "< 24 hours",
  },
  {
    id: 3,
    title: "Tài liệu API",
    description: "Hướng dẫn cho developers",
    type: "documentation",
    contact: "https://docs.cashdig9.com",
    available: true,
    responseTime: "Instant",
  },
  {
    id: 4,
    title: "Video hướng dẫn",
    description: "Tutorials và demos",
    type: "video",
    contact: "https://youtube.com/cashdig9",
    available: true,
    responseTime: "Instant",
  },
];

// System status
const systemStatus = {
  overall: "operational",
  services: [
    { name: "Web Application", status: "operational", uptime: "99.9%" },
    { name: "API Services", status: "operational", uptime: "99.8%" },
    { name: "Blockchain Network", status: "operational", uptime: "100%" },
    { name: "AI Services", status: "operational", uptime: "99.5%" },
    { name: "IPFS Storage", status: "operational", uptime: "99.7%" },
  ],
  lastUpdated: new Date(),
};

/**
 * @route   GET /api/help/faq
 * @desc    Get all FAQ items or filter by category/search
 * @access  Public
 */
router.get("/faq", (req, res) => {
  try {
    const { category, search, limit = 50 } = req.query;

    let filteredFaq = [...faqData];

    // Filter by category
    if (category && category !== "all") {
      filteredFaq = filteredFaq.filter((item) => item.category === category);
    }

    // Filter by search query
    if (search) {
      const searchLower = search.toLowerCase();
      filteredFaq = filteredFaq.filter(
        (item) =>
          item.question.toLowerCase().includes(searchLower) ||
          item.answer.toLowerCase().includes(searchLower) ||
          item.tags.some((tag) => tag.toLowerCase().includes(searchLower))
      );
    }

    // Limit results
    filteredFaq = filteredFaq.slice(0, parseInt(limit));

    res.json({
      success: true,
      data: {
        faqs: filteredFaq,
        total: filteredFaq.length,
        categories: ["all", "wallet", "nft", "finance", "ai", "security"],
      },
    });
  } catch (error) {
    console.error("Error fetching FAQ:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch FAQ data",
    });
  }
});

/**
 * @route   GET /api/help/faq/:id
 * @desc    Get specific FAQ item
 * @access  Public
 */
router.get("/faq/:id", (req, res) => {
  try {
    const faqId = parseInt(req.params.id);
    const faq = faqData.find((item) => item.id === faqId);

    if (!faq) {
      return res.status(404).json({
        success: false,
        message: "FAQ item not found",
      });
    }

    res.json({
      success: true,
      data: faq,
    });
  } catch (error) {
    console.error("Error fetching FAQ item:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch FAQ item",
    });
  }
});

/**
 * @route   GET /api/help/support
 * @desc    Get support options
 * @access  Public
 */
router.get("/support", (req, res) => {
  try {
    res.json({
      success: true,
      data: {
        options: supportOptions,
        total: supportOptions.length,
      },
    });
  } catch (error) {
    console.error("Error fetching support options:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch support options",
    });
  }
});

/**
 * @route   GET /api/help/status
 * @desc    Get system status
 * @access  Public
 */
router.get("/status", (req, res) => {
  try {
    res.json({
      success: true,
      data: systemStatus,
    });
  } catch (error) {
    console.error("Error fetching system status:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch system status",
    });
  }
});

/**
 * @route   POST /api/help/contact
 * @desc    Submit contact form
 * @access  Public
 */
router.post("/contact", (req, res) => {
  try {
    const { name, email, subject, message, type = "general" } = req.body;

    // Validate required fields
    if (!name || !email || !subject || !message) {
      return res.status(400).json({
        success: false,
        message: "All fields are required",
      });
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({
        success: false,
        message: "Invalid email format",
      });
    }

    // In a real app, you would send this to your support system
    const contactRequest = {
      id: Date.now(),
      name,
      email,
      subject,
      message,
      type,
      status: "submitted",
      createdAt: new Date(),
      expectedResponse: type === "urgent" ? "< 2 hours" : "< 24 hours",
    };

    console.log("New contact request:", contactRequest);

    res.json({
      success: true,
      data: {
        id: contactRequest.id,
        message: "Your message has been submitted successfully",
        expectedResponse: contactRequest.expectedResponse,
      },
    });
  } catch (error) {
    console.error("Error submitting contact form:", error);
    res.status(500).json({
      success: false,
      message: "Failed to submit contact form",
    });
  }
});

/**
 * @route   GET /api/help/guides
 * @desc    Get help guides and tutorials
 * @access  Public
 */
router.get("/guides", (req, res) => {
  try {
    const guides = [
      {
        id: 1,
        title: "Getting Started with CashDig9",
        description: "Complete guide to start using the platform",
        category: "beginner",
        duration: "10 min read",
        url: "/guides/getting-started",
        topics: ["wallet setup", "first NFT", "navigation"],
      },
      {
        id: 2,
        title: "Creating Your First Academic NFT",
        description: "Step-by-step NFT creation tutorial",
        category: "academic",
        duration: "15 min read",
        url: "/guides/first-nft",
        topics: ["document upload", "metadata", "minting"],
      },
      {
        id: 3,
        title: "Finance Manager Advanced Features",
        description: "Master the finance tracking tools",
        category: "finance",
        duration: "20 min read",
        url: "/guides/finance-advanced",
        topics: ["analytics", "budgets", "reports"],
      },
      {
        id: 4,
        title: "AI Collections Creative Workflow",
        description: "Maximize your AI generation potential",
        category: "ai",
        duration: "25 min read",
        url: "/guides/ai-workflow",
        topics: ["prompts", "optimization", "batch processing"],
      },
    ];

    res.json({
      success: true,
      data: {
        guides,
        total: guides.length,
        categories: ["beginner", "academic", "finance", "ai", "advanced"],
      },
    });
  } catch (error) {
    console.error("Error fetching guides:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch guides",
    });
  }
});

export default router;
