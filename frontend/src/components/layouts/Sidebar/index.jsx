import React, { useState, useEffect, useMemo, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useLocation, Link } from "react-router-dom";
import {
    ChevronLeft,
    ChevronRight,
    X,
} from "lucide-react";
import PropTypes from "prop-types";
import Logo from "../../common/Logo";
import { MAIN_NAVIGATION, HELP_NAVIGATION } from "../../../constants/navigation";

/**
 * Sidebar component chính của ứng dụng
 * 
 * @component
 */
const Sidebar = ({ isOpen, setIsOpen, onCollapsedChange }) => {
    const location = useLocation();
    const [isCollapsed, setIsCollapsed] = useState(false);

    // Đồng bộ hóa trạng thái thu gọn với component cha
    useEffect(() => {
        if (onCollapsedChange) {
            onCollapsedChange(isCollapsed);
        }
    }, [isCollapsed, onCollapsedChange]);

    const handleToggleCollapse = useCallback(() => {
        setIsCollapsed(!isCollapsed);
    }, [isCollapsed]);

    // Memoize navigation items để tránh tạo lại không cần thiết
    const navigationItems = useMemo(() => MAIN_NAVIGATION, []);

    const isActive = useCallback(
        (path) => location.pathname === path,
        [location.pathname]
    );

    return (
        <>
            {/* Desktop Sidebar */}
            <aside
                className="hidden lg:flex fixed left-0 top-0 h-screen z-50 backdrop-blur-xl border-r border-slate-700/50 shadow-2xl transition-all duration-300 ease-in-out"
                style={{
                    background:
                        "linear-gradient(135deg, rgba(12, 18, 32, 0.95) 0%, rgba(26, 32, 44, 0.9) 100%)",
                    width: isCollapsed ? 80 : 256,
                }}
            >
                <SidebarContent
                    isCollapsed={isCollapsed}
                    setIsOpen={setIsOpen}
                    navigationItems={navigationItems}
                    isActive={isActive}
                />

                {/* Toggle Button */}
                <button
                    onClick={handleToggleCollapse}
                    className="absolute -right-3 top-1/2 transform -translate-y-1/2 w-6 h-12 flex items-center justify-center bg-gradient-to-r from-slate-800 to-slate-700 text-slate-200 hover:from-slate-700 hover:to-slate-600 transition-all duration-200 rounded-md border border-slate-600/50 z-50 shadow-lg hover:shadow-xl group outline-none focus:ring-2 focus:ring-blue-500/50 focus:ring-offset-2 focus:ring-offset-slate-900"
                    title={isCollapsed ? "Expand sidebar" : "Collapse sidebar"}
                    aria-label={isCollapsed ? "Expand sidebar" : "Collapse sidebar"}
                >
                    <div
                        className="transition-transform duration-300 ease-in-out"
                        style={{ transform: `rotate(${isCollapsed ? 0 : 180}deg)` }}
                    >
                        <ChevronRight className="w-4 h-4 group-hover:text-white transition-colors" />
                    </div>
                </button>
            </aside>

            {/* Mobile Sidebar */}
            <AnimatePresence>
                {isOpen && (
                    <>
                        {/* Backdrop */}
                        <motion.div
                            className="lg:hidden fixed inset-0 bg-black/50 backdrop-blur-sm z-40"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={() => setIsOpen(false)}
                        />

                        {/* Sidebar */}
                        <motion.aside
                            className="lg:hidden fixed left-0 top-0 h-full w-64 z-50 backdrop-blur-xl border-r border-slate-700/50 shadow-2xl"
                            style={{
                                background:
                                    "linear-gradient(135deg, rgba(12, 18, 32, 0.95) 0%, rgba(26, 32, 44, 0.9) 100%)",
                            }}
                            initial={{ x: -320 }}
                            animate={{ x: 0 }}
                            exit={{ x: -320 }}
                            transition={{
                                type: "spring",
                                stiffness: 300,
                                damping: 30,
                            }}
                        >
                            <SidebarContent
                                isCollapsed={false}
                                setIsOpen={setIsOpen}
                                navigationItems={navigationItems}
                                isActive={isActive}
                            />
                        </motion.aside>
                    </>
                )}
            </AnimatePresence>
        </>
    );
};

/**
 * Nav Item component - Mục điều hướng
 */
const NavItem = React.memo(({ item, isActive, isCollapsed, onClick }) => {
    const Icon = item.icon;
    const active = isActive(item.path);

    return (
        <div className={`${isCollapsed ? "mx-auto my-2" : "px-3 py-1"} relative`}>
            <Link
                to={item.path}
                className={`group relative flex items-center gap-3 transition-all duration-200 w-full outline-none ${isCollapsed
                    ? "justify-center w-12 h-12 rounded-xl"
                    : "px-4 py-3 rounded-xl"
                    } ${active
                        ? "bg-gradient-to-r from-blue-700/50 to-violet-700/50 text-white shadow-md border border-blue-500/30"
                        : "text-slate-300 hover:text-white hover:bg-slate-700/40 border border-transparent hover:border-slate-600/40"
                    } focus:ring-2 focus:ring-blue-500/50 focus:ring-offset-2 focus:ring-offset-slate-900 focus:border-blue-500/50`}
                onClick={onClick}
                title={isCollapsed ? item.label : undefined}
                aria-label={item.label}
                role="menuitem"
            >
                {/* Active indicator for expanded state */}
                {active && !isCollapsed && (
                    <div className="w-1.5 h-8 bg-white rounded-r-md absolute -left-3" />
                )}

                <div className="relative flex-shrink-0">
                    <Icon className="w-5 h-5 transition-colors duration-200" />
                    {active && !isCollapsed && (
                        <div className="absolute -inset-1 rounded-lg bg-blue-500/20" />
                    )}
                </div>

                {/* Text content */}
                {!isCollapsed && (
                    <div className="flex-1 min-w-0">
                        <div className="font-medium truncate">{item.label}</div>
                        <div className="text-xs opacity-70 truncate">
                            {item.description}
                        </div>
                    </div>
                )}
            </Link>

            {/* Tooltip for collapsed state */}
            {isCollapsed && (
                <div className="absolute left-full ml-2 top-1/2 transform -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none z-50 hidden lg:block">
                    <div className="bg-slate-800 text-slate-200 text-sm px-3 py-2 rounded-lg whitespace-nowrap border border-slate-600/50 shadow-lg">
                        {item.label}
                        <div className="absolute left-0 top-1/2 transform -translate-x-1 -translate-y-1/2 w-0 h-0 border-t-4 border-b-4 border-r-4 border-transparent border-r-slate-800"></div>
                    </div>
                </div>
            )}
        </div>
    );
});

NavItem.displayName = "NavItem";

/**
 * SidebarContent component - Nội dung sidebar
 */
const SidebarContent = React.memo(({ isCollapsed, setIsOpen, navigationItems, isActive }) => (
    <div className="flex flex-col h-full overflow-hidden">
        {/* Header */}
        <div
            className={`flex items-center p-6 flex-shrink-0 transition-all duration-300 ${isCollapsed ? "justify-center" : "justify-between"
                }`}
        >
            <div className="transition-all duration-300">
                <Logo size={isCollapsed ? "md" : "lg"} showText={!isCollapsed} />
            </div>

            {/* Mobile close button */}
            {!isCollapsed && (
                <button
                    onClick={() => setIsOpen(false)}
                    className="lg:hidden p-2 text-slate-200 hover:bg-slate-700/50 transition-colors rounded-lg border border-slate-600/50 focus:ring-2 focus:ring-blue-500/50 focus:ring-offset-2 focus:ring-offset-slate-900 outline-none"
                    aria-label="Close sidebar"
                >
                    <X className="w-5 h-5" />
                </button>
            )}
        </div>

        {/* Divider */}
        <div className="flex justify-center px-6 flex-shrink-0">
            <div
                className="h-px bg-gradient-to-r from-transparent via-slate-600/50 to-transparent transition-all duration-300"
                style={{ width: isCollapsed ? 32 : 64 }}
            />
        </div>

        {/* Navigation */}
        <nav
            className={`flex-1 py-6 transition-all duration-300 ${isCollapsed ? "px-2" : "px-0"
                } overflow-y-auto overflow-x-hidden custom-scrollbar`}
            role="navigation"
            aria-label="Main navigation"
            style={{ scrollBehavior: "smooth" }}
        >
            {/* Menu title */}
            {!isCollapsed && (
                <div className="px-6 mb-2 transition-opacity duration-300">
                    <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                        Main Menu
                    </h3>
                </div>
            )}

            <div className="space-y-1" role="menu">
                {navigationItems.map((item) => (
                    <NavItem
                        key={item.id}
                        item={item}
                        isActive={isActive}
                        isCollapsed={isCollapsed}
                        onClick={() => setIsOpen && setIsOpen(false)}
                    />
                ))}
            </div>
        </nav>

        {/* Footer */}
        <div className="p-6 mt-auto flex-shrink-0">
            <div className="relative">
                {/* Decorative line */}
                <div
                    className="absolute -top-3 left-1/2 transform -translate-x-1/2 h-px bg-gradient-to-r from-transparent via-slate-600/30 to-transparent transition-all duration-300"
                    style={{ width: isCollapsed ? 32 : 48 }}
                />

                {isCollapsed ? (
                    <div className="flex justify-center">
                        <Link
                            to={HELP_NAVIGATION.path}
                            className="group flex items-center justify-center w-12 h-12 rounded-xl transition-all duration-200 text-slate-300 hover:text-white hover:bg-gradient-to-r hover:from-emerald-700/30 hover:to-teal-700/30 border border-transparent hover:border-emerald-500/30 relative overflow-hidden outline-none focus:ring-2 focus:ring-emerald-500/50 focus:ring-offset-2 focus:ring-offset-slate-900 focus:border-emerald-500/50"
                            onClick={() => setIsOpen && setIsOpen(false)}
                            title="Help & Support"
                            aria-label="Help & Support"
                        >
                            <div className="absolute inset-0 bg-gradient-to-r from-emerald-600/10 to-teal-600/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                            <HELP_NAVIGATION.icon className="w-5 h-5 relative z-10 transition-transform duration-200 group-hover:scale-110" />
                        </Link>
                    </div>
                ) : (
                    <Link
                        to={HELP_NAVIGATION.path}
                        className="group flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 text-slate-300 hover:text-white hover:bg-gradient-to-r hover:from-emerald-700/30 hover:to-teal-700/30 border border-transparent hover:border-emerald-500/30 relative overflow-hidden outline-none focus:ring-2 focus:ring-emerald-500/50 focus:ring-offset-2 focus:ring-offset-slate-900 focus:border-emerald-500/50"
                        onClick={() => setIsOpen && setIsOpen(false)}
                        aria-label="Help & Support"
                    >
                        <div className="absolute inset-0 bg-gradient-to-r from-emerald-600/10 to-teal-600/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

                        <div className="relative text-slate-300 group-hover:text-white flex-shrink-0">
                            <HELP_NAVIGATION.icon className="w-5 h-5 transition-transform duration-200 group-hover:scale-110" />
                        </div>

                        <div className="flex-1 min-w-0 relative z-10 transition-all duration-200">
                            <div className="font-medium flex items-center gap-2">
                                {HELP_NAVIGATION.label}
                                <div className="w-2 h-2 bg-emerald-400 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                            </div>
                            <div className="text-xs opacity-70 group-hover:opacity-90 transition-opacity">
                                {HELP_NAVIGATION.description}
                            </div>
                        </div>
                    </Link>
                )}
            </div>
        </div>
    </div>
));

SidebarContent.displayName = "SidebarContent";

Sidebar.propTypes = {
    /** Trạng thái mở/đóng sidebar (mobile) */
    isOpen: PropTypes.bool.isRequired,
    /** Handler thay đổi trạng thái mở/đóng */
    setIsOpen: PropTypes.func.isRequired,
    /** Callback khi trạng thái thu gọn thay đổi */
    onCollapsedChange: PropTypes.func,
};

NavItem.propTypes = {
    /** Thông tin mục điều hướng */
    item: PropTypes.shape({
        id: PropTypes.string.isRequired,
        label: PropTypes.string.isRequired,
        icon: PropTypes.elementType.isRequired,
        path: PropTypes.string.isRequired,
        description: PropTypes.string,
    }).isRequired,
    /** Hàm kiểm tra trạng thái active */
    isActive: PropTypes.func.isRequired,
    /** Trạng thái thu gọn */
    isCollapsed: PropTypes.bool.isRequired,
    /** Handler khi click */
    onClick: PropTypes.func,
};

SidebarContent.propTypes = {
    /** Trạng thái thu gọn */
    isCollapsed: PropTypes.bool.isRequired,
    /** Handler thay đổi trạng thái mở/đóng */
    setIsOpen: PropTypes.func,
    /** Danh sách mục điều hướng */
    navigationItems: PropTypes.array.isRequired,
    /** Hàm kiểm tra trạng thái active */
    isActive: PropTypes.func.isRequired,
};

export default Sidebar;