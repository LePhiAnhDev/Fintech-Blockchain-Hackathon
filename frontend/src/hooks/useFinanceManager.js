import { useState, useEffect, useRef, useCallback } from "react";
import toast from "react-hot-toast";
import financeService from "../services/api/financeService";
import {
    parseFinanceCommand,
    formatCurrency,
    formatShortAmount,
} from "../utils/formatUtils";
import { useWallet } from "../contexts/WalletContext";

/**
 * Hook quản lý tài chính
 *
 * @returns {Object} Trạng thái và hàm xử lý quản lý tài chính
 */
const useFinanceManager = () => {
    const { isAuthenticated, isInitializing } = useWallet();
    const [activeTab, setActiveTab] = useState("chat"); // 'chat' or 'stats'
    const [messages, setMessages] = useState([]);
    const [inputMessage, setInputMessage] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const [summary, setSummary] = useState({
        total_income: 0,
        total_expenses: 0,
        net_amount: 0,
        transaction_count: {
            income: 0,
            expenses: 0,
            total: 0,
        },
    });
    const [transactions, setTransactions] = useState([]);
    const [isInitialized, setIsInitialized] = useState(false);
    const messagesEndRef = useRef(null);

    /**
     * Tải tổng quan tài chính
     */
    const loadSummary = useCallback(async () => {
        if (!isAuthenticated) return null;

        try {
            const response = await financeService.getSummary();

            if (response && response.success) {
                const summaryData = {
                    total_income: response.data?.total_income || 0,
                    total_expenses: response.data?.total_expenses || 0,
                    net_amount: response.data?.net_amount || 0,
                    transaction_count: {
                        income: response.data?.transaction_count?.income || 0,
                        expenses: response.data?.transaction_count?.expenses || 0,
                        total: response.data?.transaction_count?.total || 0,
                    },
                };

                setSummary(summaryData);
                return summaryData;
            } else {
                const defaultSummary = {
                    total_income: 0,
                    total_expenses: 0,
                    net_amount: 0,
                    transaction_count: {
                        income: 0,
                        expenses: 0,
                        total: 0,
                    },
                };

                setSummary(defaultSummary);
                return defaultSummary;
            }
        } catch (error) {
            console.error("Error loading summary:", error);
            const defaultSummary = {
                total_income: 0,
                total_expenses: 0,
                net_amount: 0,
                transaction_count: {
                    income: 0,
                    expenses: 0,
                    total: 0,
                },
            };

            setSummary(defaultSummary);
            return defaultSummary;
        }
    }, [isAuthenticated]);

    /**
     * Tải danh sách giao dịch
     */
    const loadTransactions = useCallback(async () => {
        if (!isAuthenticated) return [];

        try {
            const response = await financeService.getTransactions(20);

            if (response && response.success) {
                const formattedTransactions = (response.data.transactions || []).map(
                    (tx) => {
                        return {
                            ...tx,
                            date:
                                tx.date ||
                                tx.created_at ||
                                tx.createdAt ||
                                new Date().toISOString(),
                        };
                    }
                );

                setTransactions(formattedTransactions);
                return formattedTransactions;
            }
            return [];
        } catch (error) {
            console.error("Error loading transactions:", error);
            return [];
        }
    }, [isAuthenticated]);

    // Tải dữ liệu ban đầu
    useEffect(() => {
        const initData = async () => {
            try {
                if (!isInitializing && isAuthenticated && !isInitialized) {
                    setIsLoading(true);

                    try {
                        await loadSummary();
                        await loadTransactions();
                    } catch (dataError) {
                        console.error("Error loading initial data:", dataError);
                    }

                    if (messages.length === 0) {
                        setMessages([
                            {
                                id: 1,
                                type: "ai",
                                content:
                                    "👋 Chào bạn! Tôi là AI quản lý tài chính với những tính năng mới siêu cool! 🚀\n\n**💰 Ghi giao dịch:**\n• `25k cafe` - chi tiêu\n• `+7tr lương` - thu nhập\n\n**🔍 Truy vấn dí dỏm:**\n• `dò lại chi tiêu` - xem chi tiêu hôm nay\n• `chi tiêu tháng này` - báo cáo tháng\n\n**⛓️ Blockchain:**\n• Thêm từ `blockchain` để lưu bất biến!\n\nHãy thử ngay! 😎",
                                timestamp: new Date(),
                            },
                        ]);
                    }

                    setIsInitialized(true);
                }
            } catch (error) {
                console.error("Error initializing finance manager:", error);
                toast.error("Không thể tải dữ liệu tài chính");
            } finally {
                setIsLoading(false);
            }
        };

        initData();
    }, [isAuthenticated, isInitializing, isInitialized, messages.length, loadSummary, loadTransactions]);

    // Tự động cuộn xuống dưới cùng khi có tin nhắn mới
    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [messages]);

    /**
     * Xử lý quick actions từ navigation menu
     */
    const handleQuickAction = useCallback(async (command) => {
        if (isLoading || !isAuthenticated) return;

        const userMessage = {
            id: Date.now(),
            type: "user",
            content: command,
            timestamp: new Date(),
        };

        setMessages((prev) => [...prev, userMessage]);
        setIsLoading(true);

        try {
            let responseMessage = null;

            // Xử lý các command khác nhau một cách rõ ràng
            if (command === 'dò lại chi tiêu hôm nay') {
                // Dò lại chi tiêu - phân tích chi tiết hôm nay  
                const response = await financeService.getDailyExpenses();
                if (response?.success && response.data) {
                    const data = response.data;
                    const total = data.totalAmount || 0;
                    const count = data.count || 0;

                    responseMessage = `🔍 **Dò lại chi tiêu hôm nay:**\n\n💸 Tổng chi: **${formatShortAmount(total)} VNĐ**\n📊 Số giao dịch: **${count} lần**\n\n`;

                    if (data.expenses?.length > 0) {
                        responseMessage += `📝 **Chi tiết từng giao dịch:**\n`;
                        data.expenses.forEach((expense, index) => {
                            const amount = formatShortAmount(expense.amount);
                            const time = new Date(expense.date).toLocaleTimeString('vi-VN', {
                                hour: '2-digit',
                                minute: '2-digit'
                            });
                            responseMessage += `${index + 1}. ${time} - ${amount}đ - ${expense.description}\n`;
                        });

                        responseMessage += `\n🎯 **Nhận xét:** Hôm nay bạn đã chi tiêu khá hợp lý! Tiếp tục duy trì nhé! 👍`;
                    } else {
                        responseMessage += `🎉 Hôm nay bạn chưa chi tiêu gì cả! Ví vẫn còn nguyên vẹn! 👏`;
                    }
                } else {
                    responseMessage = `🎉 Hôm nay bạn chưa chi tiêu gì cả! Ví vẫn còn nguyên! 👏`;
                }
            }
            else if (command === 'chi tiêu hôm nay') {
                // Chi tiêu hôm nay - tổng quan ngắn gọn
                const response = await financeService.getDailyExpenses();
                if (response?.success && response.data) {
                    const data = response.data;
                    const total = data.totalAmount || 0;
                    const count = data.count || 0;

                    responseMessage = `📊 **Chi tiêu hôm nay:**\n\n💰 Tổng chi: **${formatShortAmount(total)} VNĐ**\n🔢 Số lần chi: **${count} lần**\n\n`;

                    if (data.expenses?.length > 0) {
                        responseMessage += `💡 **Khoản chi lớn nhất:** ${formatShortAmount(Math.max(...data.expenses.map(e => e.amount)))}đ\n`;
                        responseMessage += `💡 **Khoản chi nhỏ nhất:** ${formatShortAmount(Math.min(...data.expenses.map(e => e.amount)))}đ\n\n`;
                        responseMessage += `🎯 **Đánh giá:** ${total < 100000 ? 'Tiết kiệm tốt! 👍' : total < 300000 ? 'Mức chi tiêu hợp lý! 😊' : 'Hôm nay chi tiêu hơi nhiều! 😅'}`;
                    } else {
                        responseMessage += `🎉 Hôm nay bạn chưa chi tiêu gì cả! Ngày tiết kiệm hoàn hảo! 🌟`;
                    }
                } else {
                    responseMessage = `📊 **Chi tiêu hôm nay:** 0đ\n\n🎉 Hôm nay bạn chưa chi tiêu gì! Tuyệt vời! 🌟`;
                }
            }
            else if (command === 'chi tiêu tháng này') {
                const response = await financeService.getMonthlyExpenses();
                if (response?.success && response.data) {
                    const data = response.data;
                    const total = data.totalExpenses || 0;
                    const monthName = data.monthName || 'tháng này';

                    responseMessage = `📅 **Chi tiêu ${monthName}:**\n\n💰 Tổng chi: **${formatShortAmount(total)} VNĐ**\n\n`;

                    if (data.expenses?.length > 0) {
                        responseMessage += `📊 **Top giao dịch lớn nhất:**\n`;
                        // Sắp xếp theo amount giảm dần và lấy top 5
                        const topExpenses = data.expenses
                            .sort((a, b) => b.amount - a.amount)
                            .slice(0, 5);

                        topExpenses.forEach((expense, index) => {
                            const amount = formatShortAmount(expense.amount);
                            const date = new Date(expense.date).toLocaleDateString('vi-VN');
                            responseMessage += `${index + 1}. ${amount}đ - ${expense.description} (${date})\n`;
                        });

                        if (data.categories?.length > 0) {
                            responseMessage += `\n🏷️ **Top danh mục:**\n`;
                            data.categories.slice(0, 3).forEach((cat, index) => {
                                const amount = formatShortAmount(cat.total);
                                const categoryName = cat._id === 'food_drink' ? 'Ăn uống' :
                                    cat._id === 'transport' ? 'Di chuyển' :
                                        cat._id === 'education' ? 'Học tập' :
                                            cat._id === 'utilities' ? 'Tiện ích' : 'Khác';
                                responseMessage += `${index + 1}. ${amount}đ - ${categoryName}\n`;
                            });
                        }
                    }

                    responseMessage += `\n💡 Tháng sau hãy cố gắng tiết kiệm hơn nhé! 🎯`;
                } else {
                    responseMessage = `📅 **Chi tiêu tháng này:** 0đ\n\n🎉 Tháng này bạn chưa chi tiêu gì! Siêu tiết kiệm! 💪`;
                }
            }

            if (responseMessage) {
                const aiMessage = {
                    id: Date.now() + 1,
                    type: "ai",
                    content: responseMessage,
                    timestamp: new Date(),
                };
                setMessages((prev) => [...prev, aiMessage]);
            }

        } catch (error) {
            console.error("Error processing quick command:", error);
            const errorResponse = {
                id: Date.now() + 1,
                type: "ai",
                content: `❌ Có lỗi xảy ra: ${error.message || "Vui lòng thử lại."}`,
                timestamp: new Date(),
            };
            setMessages((prev) => [...prev, errorResponse]);
        } finally {
            setIsLoading(false);
        }
    }, [isLoading, isAuthenticated]);

    /**
     * Gửi tin nhắn và xử lý lệnh tài chính
     */
    const handleSendMessage = useCallback(async () => {
        if (!inputMessage.trim() || isLoading || !isAuthenticated) return;

        const userMessage = {
            id: Date.now(),
            type: "user",
            content: inputMessage,
            timestamp: new Date(),
        };

        setMessages((prev) => [...prev, userMessage]);
        const currentInput = inputMessage;
        setInputMessage("");
        setIsLoading(true);

        try {
            // Kiểm tra query commands trước - cải tiến logic matching
            if (currentInput.toLowerCase().includes('dò lại chi tiêu')) {
                await handleQuickAction('dò lại chi tiêu hôm nay');
                return;
            } else if (currentInput.toLowerCase().includes('chi tiêu tháng')) {
                await handleQuickAction('chi tiêu tháng này');
                return;
            } else if (currentInput.toLowerCase().includes('chi tiêu hôm nay')) {
                await handleQuickAction('chi tiêu hôm nay');
                return;
            }

            // Xử lý giao dịch thông thường
            const parsed = parseFinanceCommand(currentInput);

            if (parsed) {
                let response;

                const isBlockchain = currentInput.toLowerCase().includes('blockchain');

                if (isBlockchain) {
                    response = await financeService.saveToBlockchain(
                        parsed.type,
                        parsed.amount,
                        parsed.description
                    );
                } else {
                    response = await financeService.addTransaction(
                        parsed.type,
                        parsed.amount,
                        parsed.description
                    );
                }

                if (response?.success) {
                    await loadSummary();
                    await loadTransactions();

                    let responseText;
                    if (isBlockchain) {
                        const blockchainInfo = response.data?.blockchain;
                        responseText = parsed.type === "income"
                            ? `✅ **Thu nhập được lưu vào Blockchain!** 🔗⛓️\n\n💰 Số tiền: **${formatShortAmount(parsed.amount)} VNĐ**\n📝 Mô tả: "${parsed.description}"\n\n🔒 **Bảo vệ Immutable:**\n• Hash: \`${blockchainInfo?.hash?.slice(0, 20)}...\`\n• Block: #${blockchainInfo?.block_number}\n• Không thể chỉnh sửa hoặc xóa\n\n🎯 Giao dịch đã được bảo mật 100%!`
                            : `✅ **Chi tiêu được lưu vào Blockchain!** 🔗⛓️\n\n💸 Số tiền: **${formatShortAmount(parsed.amount)} VNĐ**\n📝 Mô tả: "${parsed.description}"\n\n🔒 **Bảo vệ Immutable:**\n• Hash: \`${blockchainInfo?.hash?.slice(0, 20)}...\`\n• Block: #${blockchainInfo?.block_number}\n• Không thể chỉnh sửa hoặc xóa\n\n🎯 Lịch sử chi tiêu được bảo vệ minh bạch!`;
                    } else {
                        responseText = parsed.type === "income"
                            ? `✅ Đã lưu: thu **${formatShortAmount(parsed.amount)} VNĐ** từ "${parsed.description}"`
                            : `✅ Đã lưu: chi **${formatShortAmount(parsed.amount)} VNĐ** cho "${parsed.description}"`;
                    }

                    const aiResponse = {
                        id: Date.now() + 1,
                        type: "ai",
                        content: responseText,
                        timestamp: new Date(),
                    };

                    setMessages((prev) => [...prev, aiResponse]);
                } else {
                    throw new Error(response?.message || "Lỗi khi lưu giao dịch");
                }
            } else {
                const aiResponse = {
                    id: Date.now() + 1,
                    type: "ai",
                    content:
                        "❌ Cú pháp không đúng! Vui lòng nhập theo định dạng:\n\n• `25k cafe` - chi tiêu\n• `+7tr lương` - thu nhập\n• `25k cafe blockchain` - lưu blockchain\n\nHoặc dùng các nút bấm nhanh bên trên! 👆",
                    timestamp: new Date(),
                };

                setMessages((prev) => [...prev, aiResponse]);
            }
        } catch (error) {
            console.error("Error processing command:", error);
            const errorResponse = {
                id: Date.now() + 1,
                type: "ai",
                content: `❌ Có lỗi xảy ra: ${error.message || "Vui lòng thử lại."}`,
                timestamp: new Date(),
            };
            setMessages((prev) => [...prev, errorResponse]);
        } finally {
            setIsLoading(false);
        }
    }, [inputMessage, isLoading, isAuthenticated, loadSummary, loadTransactions, handleQuickAction]);

    /**
     * Hiển thị hướng dẫn sử dụng
     */
    const handleGuidance = useCallback(() => {
        const guidanceMessage = {
            id: Date.now(),
            type: "ai",
            content: `📝 **Hướng dẫn sử dụng AI Quản lý tài chính:**

**💰 Ghi lại giao dịch:**
• \`25k cafe\` - Chi tiêu mua cafe
• \`+7tr lương\` - Thu nhập lương tháng
• \`35k trà sữa\` - Chi phí uống trà sữa
• \`+500k bán đồ\` - Thu từ bán đồ cũ

**🔍 Truy vấn thông tin:**
• \`dò lại chi tiêu\` - Xem chi tiêu hôm nay (dí dỏm!)
• \`chi tiêu tháng này\` - Tổng chi tiêu tháng hiện tại

**⛓️ Lưu trữ blockchain (bất biến):**
• \`25k cafe blockchain\` - Ghi chi tiêu lên blockchain
• \`+7tr lương blockchain\` - Lưu thu nhập bất biến

**📊 Đơn vị hỗ trợ:**
• \`k/nghìn\` = x1,000
• \`tr/triệu/m\` = x1,000,000

**🎯 Mẹo:** Thêm "blockchain" vào câu lệnh để lưu trữ giao dịch bất biến!

Nhấn **Thống kê** để xem báo cáo tài chính chi tiết! 🚀`,
            timestamp: new Date(),
        };

        setMessages((prev) => [...prev, guidanceMessage]);
    }, []);

    /**
     * Xóa giao dịch
     */
    const deleteTransaction = useCallback(
        async (transactionId) => {
            if (!isAuthenticated) return;

            try {
                const response = await financeService.deleteTransaction(transactionId);

                if (response?.success) {
                    await loadSummary();
                    await loadTransactions();
                    toast.success("Đã xóa giao dịch");
                } else {
                    throw new Error(response?.message || "Không thể xóa giao dịch");
                }
            } catch (error) {
                console.error("Error deleting transaction:", error);
                toast.error(error.message || "Không thể xóa giao dịch");
            }
        },
        [loadSummary, loadTransactions, isAuthenticated]
    );

    return {
        activeTab,
        setActiveTab,
        messages,
        setMessages,
        inputMessage,
        setInputMessage,
        isLoading,
        summary,
        transactions,
        messagesEndRef,
        handleSendMessage,
        handleGuidance,
        handleQuickAction,
        deleteTransaction,
        formatCurrency,
        isInitialized,
        refreshData: useCallback(async () => {
            if (isAuthenticated) {
                await loadSummary();
                await loadTransactions();
            }
        }, [loadSummary, loadTransactions, isAuthenticated]),
    };
};

export default useFinanceManager;
