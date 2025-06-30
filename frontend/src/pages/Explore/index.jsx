import React, { useState, useEffect } from "react";
import {
  Sparkles,
  TrendingUp,
  Users,
  BookOpen,
  Shield,
  Zap,
  Globe,
  Star,
  Award,
  ExternalLink,
  MessageCircle,
  ArrowLeft,
} from "lucide-react";
import { Link } from "react-router-dom";

const Explore = () => {
  const [stats, setStats] = useState({
    users: 0,
    nfts: 0,
    transactions: 0,
    volume: 0,
  });

  // Animate stats on mount
  useEffect(() => {
    const animateStats = () => {
      const targetStats = {
        users: 1234,
        nfts: 856,
        transactions: 2341,
        volume: 45.67,
      };
      const duration = 2000;
      const steps = 60;
      const stepDuration = duration / steps;

      let currentStep = 0;
      const interval = setInterval(() => {
        currentStep++;
        const progress = currentStep / steps;

        setStats({
          users: Math.floor(targetStats.users * progress),
          nfts: Math.floor(targetStats.nfts * progress),
          transactions: Math.floor(targetStats.transactions * progress),
          volume: (targetStats.volume * progress).toFixed(2),
        });

        if (currentStep >= steps) {
          clearInterval(interval);
          setStats(targetStats);
        }
      }, stepDuration);
    };

    animateStats();
  }, []);

  // Platform features
  const features = [
    {
      icon: BookOpen,
      title: "Academic Hub",
      description: "Tạo, giao dịch và khám phá NFT từ tài liệu học tập",
      color: "from-blue-500 to-cyan-500",
      link: "/academic",
    },
    {
      icon: TrendingUp,
      title: "Finance Manager",
      description: "Quản lý chi tiêu và phân tích giao dịch blockchain",
      color: "from-green-500 to-emerald-500",
      link: "/finance",
    },
    {
      icon: Sparkles,
      title: "AI Collections",
      description: "Công cụ tạo sinh AI cho hình ảnh, video và content",
      color: "from-purple-500 to-pink-500",
      link: "/ai-collections",
    },
    {
      icon: MessageCircle,
      title: "Study Chat",
      description: "Trợ lý AI học tập thông minh cho sinh viên",
      color: "from-orange-500 to-red-500",
      link: "/study",
    },
  ];

  // Platform stats
  const platformStats = [
    {
      label: "Người dùng",
      value: stats.users.toLocaleString(),
      icon: Users,
      color: "text-blue-400",
    },
    {
      label: "NFTs đã tạo",
      value: stats.nfts.toLocaleString(),
      icon: BookOpen,
      color: "text-green-400",
    },
    {
      label: "Giao dịch",
      value: stats.transactions.toLocaleString(),
      icon: TrendingUp,
      color: "text-purple-400",
    },
    {
      label: "Khối lượng (ETH)",
      value: stats.volume,
      icon: Sparkles,
      color: "text-orange-400",
    },
  ];

  // Key benefits
  const benefits = [
    {
      icon: Shield,
      title: "Bảo mật tuyệt đối",
      description:
        "Smart contracts được audit và bảo mật trên blockchain Ethereum",
    },
    {
      icon: Zap,
      title: "Hiệu suất cao",
      description:
        "Tối ưu hóa GPU và AI để xử lý nhanh chóng, trải nghiệm mượt mà",
    },
    {
      icon: Globe,
      title: "Cộng đồng toàn cầu",
      description: "Kết nối với sinh viên và nhà giáo dục trên toàn thế giới",
    },
    {
      icon: Award,
      title: "Chất lượng cao",
      description: "Nền tảng được thiết kế đặc biệt cho giáo dục và học tập",
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      {/* Hero Section */}
      <div className="relative overflow-hidden">
        {/* Background Effects */}
        <div className="absolute inset-0">
          <div className="absolute inset-0 bg-gradient-to-r from-emerald-600/20 to-teal-600/20" />
          <div className="absolute top-0 left-1/4 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl" />
          <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-teal-500/10 rounded-full blur-3xl" />
        </div>

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
          <div className="text-center">
            {/* Logo */}
            <div className="flex justify-center mb-8">
              <div className="w-20 h-20 bg-gradient-to-r from-emerald-500 to-teal-500 rounded-xl flex items-center justify-center">
                <Sparkles className="w-10 h-10 text-white" />
              </div>
            </div>

            {/* Main Title */}
            <h1 className="text-5xl md:text-7xl font-bold mb-6">
              <span className="bg-gradient-to-r from-white via-emerald-100 to-teal-100 bg-clip-text text-transparent">
                From learning to creating with
              </span>
              <br />
              <span className="bg-gradient-to-r from-emerald-400 via-teal-400 to-cyan-400 bg-clip-text text-transparent">
                AI powered collections
              </span>
            </h1>

            {/* Subtitle */}
            <p className="text-xl md:text-2xl text-slate-300 mb-12 max-w-3xl mx-auto leading-relaxed">
              Nền tảng blockchain giáo dục toàn diện với AI, NFT và quản lý tài
              chính thông minh
            </p>

            {/* Back Button */}
            <div className="flex justify-center mb-16">
              <Link
                to="/"
                className="px-8 py-4 bg-slate-800/50 backdrop-blur-sm border border-slate-700 text-white font-semibold rounded-xl hover:bg-slate-800/70 transition-all duration-200 flex items-center justify-center group"
              >
                <ArrowLeft className="w-5 h-5 mr-2" />
                Back to Home
              </Link>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
              {platformStats.map((stat, index) => (
                <div key={index} className="text-center">
                  <div className="flex justify-center mb-2">
                    <stat.icon className={`w-8 h-8 ${stat.color}`} />
                  </div>
                  <div className="text-3xl font-bold text-white mb-1">
                    {stat.value}
                  </div>
                  <div className="text-slate-400 text-sm">{stat.label}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-white mb-4">
              Khám phá các tính năng
            </h2>
            <p className="text-xl text-slate-300">
              Tất cả trong một nền tảng duy nhất
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {features.map((feature, index) => (
              <div key={index} className="group">
                <div className="bg-slate-800/50 backdrop-blur-sm border border-slate-700 rounded-2xl p-8 hover:bg-slate-800/70 transition-all duration-300 group-hover:scale-105">
                  <div
                    className={`w-16 h-16 bg-gradient-to-r ${feature.color} rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300`}
                  >
                    <feature.icon className="w-8 h-8 text-white" />
                  </div>
                  <h3 className="text-2xl font-bold text-white mb-4">
                    {feature.title}
                  </h3>
                  <p className="text-slate-300 mb-6 leading-relaxed">
                    {feature.description}
                  </p>
                  <div className="flex items-center text-slate-400 font-medium">
                    Tính năng nổi bật
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Benefits Section */}
      <div className="py-20 bg-slate-900/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-white mb-4">
              Tại sao chọn CashDig9?
            </h2>
            <p className="text-xl text-slate-300">
              Những lợi ích vượt trội cho người dùng
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {benefits.map((benefit, index) => (
              <div key={index} className="text-center group">
                <div className="w-16 h-16 bg-gradient-to-r from-emerald-500 to-teal-500 rounded-xl flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform duration-300">
                  <benefit.icon className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-xl font-bold text-white mb-4">
                  {benefit.title}
                </h3>
                <p className="text-slate-300 leading-relaxed">
                  {benefit.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Info Section */}
      <div className="py-20">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="bg-gradient-to-r from-emerald-500/10 to-teal-500/10 backdrop-blur-sm border border-emerald-500/20 rounded-3xl p-12">
            <Star className="w-16 h-16 text-emerald-400 mx-auto mb-6" />
            <h2 className="text-4xl font-bold text-white mb-6">
              CashDig9 Platform
            </h2>
            <p className="text-xl text-slate-300 mb-8">
              Nền tảng blockchain giáo dục toàn diện với AI, NFT và quản lý tài
              chính thông minh
            </p>
            <div className="flex justify-center">
              <Link
                to="/help"
                className="px-8 py-4 bg-slate-800/50 backdrop-blur-sm border border-slate-700 text-white font-semibold rounded-xl hover:bg-slate-800/70 transition-all duration-200 flex items-center justify-center"
              >
                Tìm hiểu thêm
                <ExternalLink className="w-5 h-5 ml-2" />
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Explore;
