import {
    LayoutDashboard,
    DollarSign,
    Shield,
    GraduationCap,
    HelpCircle,
    TrendingUp,
    Activity,
    BookOpen,
    Home,
    BarChart3,
    Search,
    MessageSquare,
    Wallet,
    Sparkles,
} from "lucide-react";

/**
 * Cấu hình menu điều hướng chính
 */
export const MAIN_NAVIGATION = [
    {
        id: "academic",
        label: "Academic Hub",
        icon: BookOpen,
        path: "/academic",
        description: "Create, Trade & Discover Academic NFTs",
    },
    {
        id: "finance",
        label: "Finance Manager",
        icon: DollarSign,
        path: "/finance",
        description: "Portfolio & Transactions",
    },
    {
        id: "study",
        label: "Study Chat",
        icon: GraduationCap,
        path: "/study",
        description: "AI Learning Assistant",
    },
    {
        id: "ai-collections",
        label: "AI Collections",
        icon: Sparkles,
        path: "/ai-collections",
        description: "Generative AI Tools",
    },
];

/**
 * Cấu hình điều hướng chính
 */
export const NAVIGATION_ITEMS = [
    {
        name: 'Academic Hub',
        href: '/academic',
        icon: BookOpen,
        current: false,
        description: 'Tạo, giao dịch và khám phá tài liệu học tập NFT'
    },
    {
        name: 'Finance Manager',
        href: '/finance',
        icon: BarChart3,
        current: false,
        description: 'Quản lý chi tiêu và ngân sách cá nhân'
    },
    {
        name: 'Study Chat',
        href: '/study',
        icon: GraduationCap,
        current: false,
        description: 'Trợ lý AI học tập cho sinh viên'
    },
    {
        name: 'AI Collections',
        href: '/ai-collections',
        icon: Sparkles,
        current: false,
        description: 'Công cụ tạo sinh AI - Hình ảnh, Video và Streaming'
    }
];

/**
 * Danh sách câu hỏi nhanh cho Study Chat
 */
export const QUICK_STUDY_QUESTIONS = [
    // Toán học
    "Giải phương trình bậc hai ax² + bx + c = 0",
    "Cách tính đạo hàm của hàm số",
    "Công thức tính diện tích hình tròn",
    "Định lý Pytago và ứng dụng",

    // Văn học
    "Phân tích bài thơ 'Việt Bắc' của Tố Hữu",
    "Tác phẩm 'Số Đỏ' của Vũ Trọng Phụng",
    "Nghệ thuật miêu tả trong văn xuôi",
    "Biện pháp tu từ trong thơ ca",

    // Tiếng Anh
    "Cách sử dụng thì hiện tại hoàn thành",
    "Phân biệt giữa 'a', 'an' và 'the'",
    "Cấu trúc câu điều kiện loại 2",
    "Từ vựng về chủ đề môi trường",

    // Vật lý
    "Định luật Newton và ứng dụng",
    "Hiện tượng khúc xạ ánh sáng",
    "Công thức tính công suất điện",
    "Sóng cơ và đặc tính sóng",

    // Hóa học
    "Cân bằng phương trình hóa học",
    "Tính pH của dung dịch",
    "Phản ứng oxi hóa khử",
    "Bảng tuần hoàn các nguyên tố",

    // Sinh học
    "Quá trình quang hợp ở thực vật",
    "Cấu trúc tế bào và chức năng",
    "Hệ tuần hoàn máu ở người",
    "Di truyền học Mendel",

    // Lịch sử
    "Chiến thắng Điện Biên Phủ 1954",
    "Cách mạng tháng Tám 1945",
    "Phong trào Tây Sơn",
    "Lịch sử hình thành nước Việt Nam",

    // Địa lý
    "Khí hậu nhiệt đới gió mùa",
    "Dãy núi Trường Sơn",
    "Đồng bằng sông Cửu Long",
    "Tài nguyên thiên nhiên Việt Nam",

    // Tin học
    "Lập trình Python cơ bản",
    "Thuật toán sắp xếp bubble sort",
    "Cấu trúc dữ liệu mảng",
    "HTML và CSS cơ bản"
];

/**
 * Thống kê nhanh cho Dashboard
 */
export const DASHBOARD_QUICK_STATS = [
    {
        title: 'Tổng người dùng',
        value: '1,234',
        icon: Wallet,
        trend: '+12%',
        color: 'blue'
    },
    {
        title: 'Phân tích blockchain',
        value: '856',
        icon: Search,
        trend: '+8%',
        color: 'green'
    },
    {
        title: 'Cuộc trò chuyện',
        value: '2,341',
        icon: MessageSquare,
        trend: '+23%',
        color: 'purple'
    },
    {
        title: 'Giao dịch tài chính',
        value: '4,567',
        icon: TrendingUp,
        trend: '+15%',
        color: 'orange'
    }
];

/**
 * Danh sách các môn học được hỗ trợ
 */
export const SUPPORTED_SUBJECTS = [
    { key: 'toán', name: 'Toán học', icon: '📊', color: 'blue' },
    { key: 'lý', name: 'Vật lý', icon: '⚡', color: 'yellow' },
    { key: 'hóa', name: 'Hóa học', icon: '🧪', color: 'green' },
    { key: 'sinh', name: 'Sinh học', icon: '🌱', color: 'emerald' },
    { key: 'văn', name: 'Văn học', icon: '📚', color: 'purple' },
    { key: 'sử', name: 'Lịch sử', icon: '🏛️', color: 'amber' },
    { key: 'địa', name: 'Địa lý', icon: '🌍', color: 'cyan' },
    { key: 'anh', name: 'Tiếng Anh', icon: '🇬🇧', color: 'red' },
    { key: 'tin', name: 'Tin học', icon: '💻', color: 'indigo' }
];

/**
 * Các cấp độ học tập
 */
export const STUDY_LEVELS = [
    { key: 'beginner', name: 'Cơ bản', icon: '🌟', description: 'Phù hợp cho người mới bắt đầu' },
    { key: 'intermediate', name: 'Trung bình', icon: '📈', description: 'Cho học sinh có kiến thức nền tảng' },
    { key: 'advanced', name: 'Nâng cao', icon: '🎓', description: 'Dành cho học sinh ưu tú và thi đại học' }
];

/**
 * Cấu hình trợ giúp và hỗ trợ
 */
export const HELP_NAVIGATION = {
    id: "help",
    label: "Help & Support",
    icon: HelpCircle,
    path: "/help",
    description: "Get Assistance",
};