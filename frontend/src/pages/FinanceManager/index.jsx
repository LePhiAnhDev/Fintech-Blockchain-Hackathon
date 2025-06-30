import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { MessageCircle } from "lucide-react";
import PageHeader from "../../components/common/PageHeader";
import useFinanceManager from "../../hooks/useFinanceManager";
import ChatPanel from "./components/ChatPanel";
import StatisticsPanel from "./components/StatisticsPanel";
import FinanceSummary from "./components/FinanceSummary";
import FinanceInsights from "./components/FinanceInsights";
import SmartPlanning from "./components/SmartPlanning";

/**
 * Trang quản lý tài chính sinh viên
 * 
 * @component
 */
const FinanceManager = () => {
    const [showSmartPlanning, setShowSmartPlanning] = useState(false);

    const {
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
    } = useFinanceManager();

    const handleSmartPlanning = () => {
        setShowSmartPlanning(true);
    };

    const handleBackFromPlanning = () => {
        setShowSmartPlanning(false);
    };

    return (
        <div className="space-y-6">
            {/* Header */}
            <PageHeader
                title="AI Quản lý tài chính sinh viên"
                description="Nhập giao dịch bằng ngôn ngữ tự nhiên và xem thống kê chi tiết. Sử dụng menu nhanh để dễ dàng truy cập các tính năng!"
                icon={<MessageCircle className="w-6 h-6" />}
            />

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Main Content */}
                <div className="lg:col-span-2">
                    <AnimatePresence mode="wait">
                        {showSmartPlanning ? (
                            <SmartPlanning
                                onBack={handleBackFromPlanning}
                                summary={summary}
                            />
                        ) : activeTab === "chat" ? (
                            <ChatPanel
                                messages={messages}
                                setMessages={setMessages}
                                inputMessage={inputMessage}
                                setInputMessage={setInputMessage}
                                isLoading={isLoading}
                                messagesEndRef={messagesEndRef}
                                handleSendMessage={handleSendMessage}
                                handleGuidance={handleGuidance}
                                handleQuickAction={handleQuickAction}
                                setActiveTab={setActiveTab}
                                onSmartPlanning={handleSmartPlanning}
                            />
                        ) : (
                            <StatisticsPanel
                                summary={summary}
                                transactions={transactions}
                                formatCurrency={formatCurrency}
                                deleteTransaction={deleteTransaction}
                                setActiveTab={setActiveTab}
                            />
                        )}
                    </AnimatePresence>
                </div>

                {/* Sidebar Statistics */}
                <div className="space-y-4">
                    {summary && (
                        <FinanceSummary summary={summary} />
                    )}

                    <FinanceInsights />
                </div>
            </div>
        </div>
    );
};

export default FinanceManager;