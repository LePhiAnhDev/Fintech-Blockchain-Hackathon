import React, { useState } from "react";
import {
  HelpCircle,
  Search,
  Book,
  MessageCircle,
  Mail,
  Phone,
  ExternalLink,
  ChevronDown,
  ChevronRight,
  Wallet,
  CreditCard,
  Shield,
  Zap,
  Users,
  Globe,
  FileText,
  Video,
  Download,
  ArrowLeft,
} from "lucide-react";
import { Link } from "react-router-dom";
import PageHeader from "../../components/common/PageHeader";

const HelpCenter = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [expandedFaq, setExpandedFaq] = useState(null);
  const [selectedCategory, setSelectedCategory] = useState("all");

  console.log("HelpCenter component rendered");

  // FAQ Categories
  const faqCategories = [
    { id: "all", name: "Tất cả", icon: Globe },
    { id: "wallet", name: "Ví điện tử", icon: Wallet },
    { id: "nft", name: "NFT & Academic Hub", icon: FileText },
    { id: "finance", name: "Quản lý tài chính", icon: CreditCard },
    { id: "ai", name: "AI Collections", icon: Zap },
    { id: "security", name: "Bảo mật", icon: Shield },
  ];

  // FAQ Data
  const faqData = [
    {
      id: 1,
      category: "wallet",
      question: "Làm thế nào để kết nối ví MetaMask?",
      answer:
        'Để kết nối ví MetaMask, hãy nhấp vào nút "Connect Wallet" ở góc trên bên phải. Đảm bảo bạn đã cài đặt extension MetaMask và có tài khoản. Chọn mạng Sepolia testnet để sử dụng với ứng dụng.',
    },
    {
      id: 2,
      category: "nft",
      question: "Cách tạo NFT từ tài liệu học tập?",
      answer:
        'Vào Academic Hub, chọn tab "Create", tải lên tài liệu của bạn (PDF, DOCX, TXT, MD, PNG, JPG), điền thông tin mô tả, thiết lập phần trăm royalty, và nhấn "Create NFT". Phí mint là 0.01 ETH.',
    },
    {
      id: 3,
      category: "finance",
      question: "Finance Manager hoạt động như thế nào?",
      answer:
        "Finance Manager giúp bạn theo dõi chi tiêu, phân tích giao dịch blockchain, và quản lý ngân sách. Bạn có thể nhập dữ liệu thủ công hoặc kết nối với ví để tự động theo dõi.",
    },
    {
      id: 4,
      category: "ai",
      question: "AI Collections có những tính năng gì?",
      answer:
        "AI Collections cung cấp các công cụ tạo sinh AI bao gồm: tạo hình ảnh từ text, tạo video AI, và streaming generative content. Tất cả được tối ưu hóa cho GPU để xử lý nhanh chóng.",
    },
    {
      id: 5,
      category: "security",
      question: "Làm thế nào để bảo mật tài khoản?",
      answer:
        "Luôn giữ private key an toàn, không chia sẻ seed phrase, sử dụng hardware wallet khi có thể, và luôn kiểm tra URL trang web trước khi kết nối ví. Chúng tôi không bao giờ yêu cầu private key của bạn.",
    },
    {
      id: 6,
      category: "nft",
      question: "Phí giao dịch NFT là bao nhiêu?",
      answer:
        "Phí mint NFT là 0.01 ETH. Ngoài ra còn có gas fee của mạng Ethereum. Khi bán NFT, platform thu phí 1% và creator nhận royalty theo tỷ lệ đã thiết lập (tối đa 20%).",
    },
    {
      id: 7,
      category: "wallet",
      question: "Tại sao tôi cần Sepolia testnet?",
      answer:
        "Ứng dụng hoạt động trên Sepolia testnet để testing an toàn. Bạn có thể lấy ETH test miễn phí từ Sepolia faucet. Điều này giúp bạn trải nghiệm mà không mất ETH thật.",
    },
    {
      id: 8,
      category: "ai",
      question: "GPU requirements cho AI Collections?",
      answer:
        "AI Collections tự động phát hiện GPU. Để có hiệu suất tốt nhất, khuyến nghị GPU NVIDIA với CUDA support. Nếu không có GPU, hệ thống sẽ sử dụng CPU nhưng sẽ chậm hơn.",
    },
  ];

  // Support Options
  const supportOptions = [
    {
      title: "Chat trực tiếp",
      description: "Trò chuyện với team support",
      icon: MessageCircle,
      action: "Bắt đầu chat",
      color: "bg-blue-500",
    },
    {
      title: "Email hỗ trợ",
      description: "Gửi email cho chúng tôi",
      icon: Mail,
      action: "support@cashdig9.com",
      color: "bg-green-500",
    },
    {
      title: "Tài liệu API",
      description: "Hướng dẫn cho developers",
      icon: Book,
      action: "Xem docs",
      color: "bg-purple-500",
    },
    {
      title: "Video hướng dẫn",
      description: "Tutorials và demos",
      icon: Video,
      action: "Xem videos",
      color: "bg-red-500",
    },
  ];

  // Quick Links
  const quickLinks = [
    { title: "Hướng dẫn bắt đầu", icon: Download },
    { title: "Troubleshooting", icon: HelpCircle },
    { title: "System Status", icon: Zap },
    { title: "Community Forum", icon: Users },
  ];

  // Filter FAQs
  const filteredFaqs = faqData.filter((faq) => {
    const matchesCategory =
      selectedCategory === "all" || faq.category === selectedCategory;
    const matchesSearch =
      faq.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
      faq.answer.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      {/* Header */}
      <PageHeader
        title="Help & Support Center"
        description="Tìm câu trả lời cho mọi thắc mắc của bạn"
        icon={<HelpCircle className="w-6 h-6" />}
        actions={
          <Link
            to="/"
            className="px-4 py-2 bg-slate-800/50 border border-slate-700 text-white rounded-lg hover:bg-slate-800/70 transition-all duration-200 flex items-center gap-2"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Home
          </Link>
        }
      />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Search Section */}
        <div className="mb-12">
          <div className="max-w-2xl mx-auto">
            <div className="relative">
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-slate-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Tìm kiếm câu hỏi, hướng dẫn..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-12 pr-4 py-4 bg-slate-800/50 border border-slate-700 rounded-xl text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
              />
            </div>
          </div>
        </div>

        {/* Support Options */}
        <div className="mb-12">
          <h2 className="text-2xl font-bold text-white mb-6">Liên hệ hỗ trợ</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {supportOptions.map((option, index) => (
              <div
                key={index}
                className="bg-slate-800/50 backdrop-blur-sm border border-slate-700 rounded-xl p-6 hover:bg-slate-800/70 transition-all duration-200 cursor-pointer group"
              >
                <div
                  className={`w-12 h-12 ${option.color} rounded-lg flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-200`}
                >
                  <option.icon className="w-6 h-6 text-white" />
                </div>
                <h3 className="text-lg font-semibold text-white mb-2">
                  {option.title}
                </h3>
                <p className="text-slate-400 text-sm mb-4">
                  {option.description}
                </p>
                <div className="flex items-center text-emerald-400 text-sm font-medium group-hover:text-emerald-300">
                  {option.action}
                  <ExternalLink className="w-4 h-4 ml-1" />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Quick Links */}
        <div className="mb-12">
          <h2 className="text-2xl font-bold text-white mb-6">Liên kết nhanh</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {quickLinks.map((link, index) => (
              <div
                key={index}
                className="bg-slate-800/30 border border-slate-700 rounded-lg p-4 hover:bg-slate-800/50 transition-all duration-200 cursor-pointer group"
              >
                <div className="flex items-center space-x-3">
                  <link.icon className="w-5 h-5 text-emerald-400 group-hover:text-emerald-300" />
                  <span className="text-white text-sm font-medium">
                    {link.title}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* FAQ Section */}
        <div>
          <h2 className="text-2xl font-bold text-white mb-6">
            Câu hỏi thường gặp
          </h2>

          {/* Category Filter */}
          <div className="mb-8">
            <div className="flex flex-wrap gap-2">
              {faqCategories.map((category) => (
                <button
                  key={category.id}
                  onClick={() => setSelectedCategory(category.id)}
                  className={`flex items-center space-x-2 px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                    selectedCategory === category.id
                      ? "bg-emerald-500 text-white"
                      : "bg-slate-800/50 text-slate-300 hover:bg-slate-800/70 hover:text-white"
                  }`}
                >
                  <category.icon className="w-4 h-4" />
                  <span>{category.name}</span>
                </button>
              ))}
            </div>
          </div>

          {/* FAQ List */}
          <div className="space-y-4">
            {filteredFaqs.map((faq) => (
              <div
                key={faq.id}
                className="bg-slate-800/50 backdrop-blur-sm border border-slate-700 rounded-xl overflow-hidden"
              >
                <button
                  onClick={() =>
                    setExpandedFaq(expandedFaq === faq.id ? null : faq.id)
                  }
                  className="w-full px-6 py-4 text-left flex items-center justify-between hover:bg-slate-800/70 transition-all duration-200"
                >
                  <span className="text-white font-medium">{faq.question}</span>
                  {expandedFaq === faq.id ? (
                    <ChevronDown className="w-5 h-5 text-slate-400" />
                  ) : (
                    <ChevronRight className="w-5 h-5 text-slate-400" />
                  )}
                </button>
                {expandedFaq === faq.id && (
                  <div className="px-6 pb-4">
                    <div className="border-t border-slate-700 pt-4">
                      <p className="text-slate-300 leading-relaxed">
                        {faq.answer}
                      </p>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>

          {filteredFaqs.length === 0 && (
            <div className="text-center py-12">
              <HelpCircle className="w-12 h-12 text-slate-500 mx-auto mb-4" />
              <p className="text-slate-400">
                Không tìm thấy câu hỏi nào phù hợp với tìm kiếm của bạn.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default HelpCenter;
