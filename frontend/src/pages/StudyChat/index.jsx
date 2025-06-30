import React from "react";
import { GraduationCap } from "lucide-react";
import PageHeader from "../../components/common/PageHeader";
import useStudyChat from "../../hooks/useStudyChat";
import ChatSidebar from "./components/ChatSidebar";
import ChatHeader from "./components/ChatHeader";
import ChatMessages from "./components/ChatMessages";
import ChatInput from "./components/ChatInput";

/**
 * Trang trợ giúp học tập với AI
 * 
 * @component
 */
const StudyChat = () => {
    const {
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
    } = useStudyChat();

    if (loading) {
        return (
            <div className="space-y-6">
                <PageHeader
                    title="AI Study Assistant"
                    description="Trợ lý AI học tập chuyên về các môn học Việt Nam - Toán, Văn, Anh, Lý, Hóa, Sinh, Sử, Địa"
                    icon={<GraduationCap className="w-6 h-6" />}
                />
                <div className="h-[calc(100vh-14rem)] flex items-center justify-center">
                    <div className="text-center">
                        <div className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                        <p className="text-slate-400">Đang tải cuộc trò chuyện...</p>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <PageHeader
                title="AI Study Assistant"
                description="Trợ lý AI học tập chuyên về các môn học Việt Nam - Toán, Văn, Anh, Lý, Hóa, Sinh, Sử, Địa"
                icon={<GraduationCap className="w-6 h-6" />}
            />

            <div className="h-[calc(100vh-14rem)] flex gap-6">
                {/* Conversations Sidebar */}
                <ChatSidebar
                    conversations={conversations}
                    activeConversationId={activeConversationId}
                    setActiveConversationId={setActiveConversationId}
                    sidebarCollapsed={sidebarCollapsed}
                    setSidebarCollapsed={setSidebarCollapsed}
                    createNewConversation={createNewConversation}
                    deleteConversation={deleteConversation}
                />

                {/* Main Chat Area */}
                <div className="flex-1 flex flex-col">
                    {/* Chat Header */}
                    <ChatHeader
                        activeConversation={activeConversation}
                        activeConversationId={activeConversationId}
                        currentSubject={currentSubject}
                    />

                    {/* Messages Area */}
                    <div className="flex-1 glass rounded-2xl border border-slate-700/50 flex flex-col overflow-hidden">
                        <ChatMessages
                            activeConversationId={activeConversationId}
                            messages={messages}
                            isTyping={isTyping}
                            messagesEndRef={messagesEndRef}
                        />

                        {/* Input Area */}
                        <ChatInput
                            inputMessage={inputMessage}
                            setInputMessage={setInputMessage}
                            handleSendMessage={handleSendMessage}
                            handleKeyPress={handleKeyPress}
                            isTyping={isTyping}
                            inputRef={inputRef}
                            quickQuestions={quickQuestions}
                            messages={messages}
                            currentSubject={currentSubject}
                            setCurrentSubject={setCurrentSubject}
                            currentDifficulty={currentDifficulty}
                            setCurrentDifficulty={setCurrentDifficulty}
                        />
                    </div>
                </div>
            </div>
        </div>
    );
};

export default StudyChat;