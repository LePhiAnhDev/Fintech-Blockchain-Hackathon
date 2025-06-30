import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useLocation, useNavigate } from "react-router-dom";
import {
    Wallet,
    LogOut,
    ExternalLink,
    Copy,
    ChevronDown,
    User,
    Settings,
    Menu,
    Bell,
    HelpCircle,
    CreditCard,
    Activity,
} from "lucide-react";
import PropTypes from "prop-types";
import { useWallet } from "../../../contexts/WalletContext";
import { MAIN_NAVIGATION } from "../../../constants/navigation";
import toast from "react-hot-toast";

/**
 * Thanh điều hướng chính của ứng dụng
 * 
 * @component
 */
const Navbar = ({
    onMenuClick,
    sidebarCollapsed = false,
    scrolled = false,
}) => {
    const {
        account,
        balance,
        formatAddress,
        formatBalance,
        getExplorerUrl,
        disconnectWallet,
    } = useWallet();

    const location = useLocation();
    const navigate = useNavigate();
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);
    const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);

    // Mock notifications
    const notifications = [
        {
            id: 1,
            title: "Transaction Completed",
            message: "Your transfer of 0.5 ETH was successful",
            time: "2m ago",
            type: "success",
        },
        {
            id: 2,
            title: "Security Alert",
            message: "New login detected from Chrome browser",
            time: "1h ago",
            type: "warning",
        },
        {
            id: 3,
            title: "Study Session Complete",
            message: "You completed 45 minutes of study time",
            time: "3h ago",
            type: "info",
        },
    ];

    /**
     * Sao chép địa chỉ ví vào clipboard
     */
    const copyAddress = () => {
        navigator.clipboard.writeText(account);
        toast.success("Address copied to clipboard!");
        setIsDropdownOpen(false);
    };

    /**
     * Mở trình duyệt blockchain explorer
     */
    const openExplorer = () => {
        window.open(getExplorerUrl(account), "_blank");
        setIsDropdownOpen(false);
    };

    /**
     * Ngắt kết nối ví
     */
    const handleDisconnect = () => {
        disconnectWallet();
        setIsDropdownOpen(false);
    };

    /**
     * Lấy icon thông báo theo loại
     */
    const getNotificationIcon = (type) => {
        switch (type) {
            case "success":
                return (
                    <div className="w-7 h-7 bg-emerald-500/20 rounded-full flex items-center justify-center">
                        <div className="w-2.5 h-2.5 bg-emerald-400 rounded-full" />
                    </div>
                );
            case "warning":
                return (
                    <div className="w-7 h-7 bg-amber-500/20 rounded-full flex items-center justify-center">
                        <div className="w-2.5 h-2.5 bg-amber-400 rounded-full" />
                    </div>
                );
            case "info":
                return (
                    <div className="w-7 h-7 bg-blue-500/20 rounded-full flex items-center justify-center">
                        <div className="w-2.5 h-2.5 bg-blue-400 rounded-full" />
                    </div>
                );
            default:
                return (
                    <div className="w-7 h-7 bg-slate-500/20 rounded-full flex items-center justify-center">
                        <div className="w-2.5 h-2.5 bg-white rounded-full" />
                    </div>
                );
        }
    };

    /**
     * Navigate to a page
     */
    const handleNavigate = (path) => {
        navigate(path);
    };

    return (
        <header
            className={`fixed top-0 right-0 left-0 h-16 backdrop-blur-xl border-b z-40 transition-all duration-300 ${sidebarCollapsed ? "lg:left-20" : "lg:left-64"
                } ${scrolled ? "border-slate-700/60 shadow-md" : "border-slate-700/30"}`}
            style={{
                background: scrolled
                    ? "rgba(12, 18, 32, 0.95)"
                    : "rgba(12, 18, 32, 0.85)",
            }}
        >
            <div className="flex items-center justify-between h-full px-4 lg:px-6">
                {/* Left Section - Mobile Menu */}
                <div className="flex items-center gap-4">
                    {/* Mobile Menu Button */}
                    <button
                        onClick={onMenuClick}
                        className="lg:hidden p-2 text-slate-200 hover:bg-slate-700/50 rounded-lg transition-colors border border-slate-600/50"
                    >
                        <Menu className="w-5 h-5" />
                    </button>

                    {/* Spacer for left side */}
                    <div className="hidden lg:block w-20"></div>
                </div>

                {/* Center Section - Navigation Tabs */}
                <div className="absolute left-1/2 transform -translate-x-1/2 -ml-16">
                    <NavigationTabs
                        currentPath={location.pathname}
                        onNavigate={handleNavigate}
                    />
                </div>

                {/* Right Section - Notifications & User Menu */}
                <div className="flex items-center gap-3">
                    {/* Quick Stats */}
                    <QuickStats balance={balance} formatBalance={formatBalance} />

                    {/* Notifications */}
                    <NotificationsDropdown
                        notifications={notifications}
                        isNotificationsOpen={isNotificationsOpen}
                        setIsNotificationsOpen={setIsNotificationsOpen}
                        setIsDropdownOpen={setIsDropdownOpen}
                        getNotificationIcon={getNotificationIcon}
                    />

                    {/* User Menu */}
                    <UserMenu
                        account={account}
                        balance={balance}
                        formatAddress={formatAddress}
                        formatBalance={formatBalance}
                        isDropdownOpen={isDropdownOpen}
                        setIsDropdownOpen={setIsDropdownOpen}
                        setIsNotificationsOpen={setIsNotificationsOpen}
                        copyAddress={copyAddress}
                        openExplorer={openExplorer}
                        handleDisconnect={handleDisconnect}
                    />
                </div>
            </div>
        </header>
    );
};

/**
 * Navigation Tabs
 */
const NavigationTabs = ({ currentPath, onNavigate }) => (
    <div className="hidden md:flex items-center">
        <div className="flex items-center gap-1 p-1 bg-slate-800/50 backdrop-blur-xl border border-slate-600/50 rounded-lg">
            {MAIN_NAVIGATION.map((item) => {
                const Icon = item.icon;
                const isActive = currentPath === item.path;

                return (
                    <motion.button
                        key={item.id}
                        onClick={() => onNavigate(item.path)}
                        className={`flex items-center gap-2 px-3 py-2 rounded-md transition-all duration-200 text-sm font-medium ${isActive
                            ? "bg-blue-500/20 text-blue-400 shadow-sm"
                            : "text-slate-300 hover:text-white hover:bg-slate-700/50"
                            }`}
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                    >
                        <Icon className="w-4 h-4" />
                        <span className="hidden lg:block">{item.label}</span>
                    </motion.button>
                );
            })}
        </div>
    </div>
);

/**
 * Hiển thị thống kê nhanh
 */
const QuickStats = ({ balance, formatBalance }) => (
    <div className="hidden xl:flex items-center gap-4 px-4 py-2 rounded-lg bg-slate-800/50 backdrop-blur-xl border border-slate-600/50">
        <div className="flex items-center gap-2">
            <Activity className="w-4 h-4 text-emerald-400" />
            <span className="text-sm text-slate-200">Online</span>
        </div>
        <div className="w-px h-4 bg-slate-600" />
        <div className="flex items-center gap-2">
            <CreditCard className="w-4 h-4 text-blue-400" />
            <span className="text-sm text-slate-200 font-medium">
                {formatBalance(balance)} SEP
            </span>
        </div>
    </div>
);

/**
 * Dropdown thông báo
 */
const NotificationsDropdown = ({
    notifications,
    isNotificationsOpen,
    setIsNotificationsOpen,
    setIsDropdownOpen,
    getNotificationIcon
}) => (
    <div className="relative">
        <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => {
                setIsNotificationsOpen(!isNotificationsOpen);
                setIsDropdownOpen(false);
            }}
            className="relative p-2 text-slate-200 hover:bg-slate-700/50 rounded-lg transition-colors bg-slate-800/50 backdrop-blur-xl border border-slate-600/50"
        >
            <Bell className="w-5 h-5" />
            {notifications.length > 0 && (
                <div className="absolute -top-1 -right-1 w-3 h-3 bg-blue-500 rounded-full flex items-center justify-center">
                    <span className="text-xs font-bold text-white">
                        {notifications.length}
                    </span>
                </div>
            )}
        </motion.button>

        {/* Notifications Dropdown */}
        <AnimatePresence>
            {isNotificationsOpen && (
                <motion.div
                    initial={{ opacity: 0, y: 10, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 10, scale: 0.95 }}
                    transition={{ duration: 0.2 }}
                    className="absolute right-0 mt-2 w-80 bg-slate-800 border border-slate-600/50 rounded-xl shadow-xl overflow-hidden z-50"
                >
                    <div className="p-3 border-b border-slate-600/50 flex items-center justify-between">
                        <h3 className="text-white font-semibold text-base">
                            Notifications
                        </h3>
                        <span className="text-xs text-slate-400">
                            {notifications.length} new
                        </span>
                    </div>
                    <div className="max-h-80 overflow-y-auto">
                        {notifications.map((notification) => (
                            <div
                                key={notification.id}
                                className="py-3.5 px-4 border-b border-slate-600/20 hover:bg-slate-700/60 transition-colors cursor-pointer"
                            >
                                <div className="flex items-start gap-3">
                                    {getNotificationIcon(notification.type)}
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-center justify-between mb-1">
                                            <h4 className="text-white text-sm font-medium truncate">
                                                {notification.title}
                                            </h4>
                                            <span className="text-slate-400 text-xs flex-shrink-0 ml-1">
                                                {notification.time}
                                            </span>
                                        </div>
                                        <p className="text-slate-300 text-sm line-clamp-2">
                                            {notification.message}
                                        </p>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                    <div className="p-2.5 border-t border-slate-600/50 bg-slate-700/30">
                        <button className="w-full text-center text-blue-400 hover:text-blue-300 text-sm font-medium py-1 transition-colors">
                            View all notifications
                        </button>
                    </div>
                </motion.div>
            )}
        </AnimatePresence>
    </div>
);

/**
 * Menu người dùng
 */
const UserMenu = ({
    account,
    balance,
    formatAddress,
    formatBalance,
    isDropdownOpen,
    setIsDropdownOpen,
    setIsNotificationsOpen,
    copyAddress,
    openExplorer,
    handleDisconnect
}) => (
    <div className="relative">
        <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => {
                setIsDropdownOpen(!isDropdownOpen);
                setIsNotificationsOpen(false);
            }}
            className="flex items-center gap-3 hover:bg-slate-700/50 transition-all duration-200 rounded-xl px-3 py-2 border border-slate-600/50"
        >
            <div className="w-8 h-8 rounded-lg flex items-center justify-center bg-slate-700/70">
                <User className="w-4 h-4 text-white" />
            </div>
            <div className="hidden sm:block text-left">
                <div className="text-white text-sm font-medium">
                    {account ? formatAddress(account) : "Connect Wallet"}
                </div>
                <div className="text-slate-300 text-xs">
                    {account ? `${formatBalance(balance)} SEP` : "Not connected"}
                </div>
            </div>
            <ChevronDown className="w-4 h-4 text-slate-300" />
        </motion.button>

        {/* User Dropdown */}
        <AnimatePresence>
            {isDropdownOpen && (
                <motion.div
                    initial={{ opacity: 0, y: 10, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 10, scale: 0.95 }}
                    transition={{ duration: 0.2 }}
                    className="absolute right-0 mt-2 w-64 bg-slate-800 border border-slate-600/50 rounded-xl shadow-xl overflow-hidden z-50"
                >
                    {account ? (
                        <>
                            {/* Wallet Info */}
                            <div className="p-4 border-b border-slate-600/50">
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-lg flex items-center justify-center bg-slate-700/70">
                                        <Wallet className="w-5 h-5 text-white" />
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <div className="text-white font-medium text-sm">
                                            {formatAddress(account)}
                                        </div>
                                        <div className="text-slate-300 text-xs">
                                            {formatBalance(balance)} SEP
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Menu Items */}
                            <div className="py-2">
                                <button
                                    onClick={copyAddress}
                                    className="w-full flex items-center gap-3 px-4 py-2 text-slate-200 hover:bg-slate-700/60 transition-colors text-left"
                                >
                                    <Copy className="w-4 h-4" />
                                    <span>Copy Address</span>
                                </button>
                                <button
                                    onClick={openExplorer}
                                    className="w-full flex items-center gap-3 px-4 py-2 text-slate-200 hover:bg-slate-700/60 transition-colors text-left"
                                >
                                    <ExternalLink className="w-4 h-4" />
                                    <span>View on Explorer</span>
                                </button>
                                <button className="w-full flex items-center gap-3 px-4 py-2 text-slate-200 hover:bg-slate-700/60 transition-colors text-left">
                                    <Settings className="w-4 h-4" />
                                    <span>Settings</span>
                                </button>
                                <button className="w-full flex items-center gap-3 px-4 py-2 text-slate-200 hover:bg-slate-700/60 transition-colors text-left">
                                    <HelpCircle className="w-4 h-4" />
                                    <span>Help & Support</span>
                                </button>
                            </div>

                            {/* Disconnect */}
                            <div className="border-t border-slate-600/50 p-2">
                                <button
                                    onClick={handleDisconnect}
                                    className="w-full flex items-center gap-3 px-4 py-2 text-slate-200 hover:bg-slate-700/60 transition-colors text-left"
                                >
                                    <LogOut className="w-4 h-4" />
                                    <span>Disconnect</span>
                                </button>
                            </div>
                        </>
                    ) : (
                        <div className="p-4">
                            <p className="text-slate-200 text-sm text-center">
                                Connect your wallet to access all features
                            </p>
                        </div>
                    )}
                </motion.div>
            )}
        </AnimatePresence>
    </div>
);

Navbar.propTypes = {
    /** Handler cho nút menu */
    onMenuClick: PropTypes.func.isRequired,
    /** Trạng thái thu gọn của sidebar */
    sidebarCollapsed: PropTypes.bool,
    /** Trạng thái cuộn của trang */
    scrolled: PropTypes.bool,
};

NavigationTabs.propTypes = {
    currentPath: PropTypes.string.isRequired,
    onNavigate: PropTypes.func.isRequired,
};

QuickStats.propTypes = {
    balance: PropTypes.string.isRequired,
    formatBalance: PropTypes.func.isRequired
};

NotificationsDropdown.propTypes = {
    notifications: PropTypes.array.isRequired,
    isNotificationsOpen: PropTypes.bool.isRequired,
    setIsNotificationsOpen: PropTypes.func.isRequired,
    setIsDropdownOpen: PropTypes.func.isRequired,
    getNotificationIcon: PropTypes.func.isRequired
};

UserMenu.propTypes = {
    account: PropTypes.string.isRequired,
    balance: PropTypes.string.isRequired,
    formatAddress: PropTypes.func.isRequired,
    formatBalance: PropTypes.func.isRequired,
    isDropdownOpen: PropTypes.bool.isRequired,
    setIsDropdownOpen: PropTypes.func.isRequired,
    setIsNotificationsOpen: PropTypes.func.isRequired,
    copyAddress: PropTypes.func.isRequired,
    openExplorer: PropTypes.func.isRequired,
    handleDisconnect: PropTypes.func.isRequired
};

export default Navbar;