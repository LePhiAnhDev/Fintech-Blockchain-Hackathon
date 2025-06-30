import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import PropTypes from "prop-types";
import Sidebar from "../Sidebar";
import Navbar from "../Navbar";

/**
 * Layout chính của ứng dụng
 * 
 * @component
 */
const AppLayout = ({ children }) => {
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
    const [scrolled, setScrolled] = useState(false);

    // Kiểm tra vị trí cuộn cho styling navbar
    useEffect(() => {
        const handleScroll = () => {
            setScrolled(window.scrollY > 10);
        };

        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    return (
        <div
            className="min-h-screen text-slate-50 relative overflow-hidden"
            style={{
                background: "linear-gradient(135deg, #010409 0%, #0c1220 50%, #1a202c 100%)"
            }}
        >
            {/* Background Elements */}
            <BackgroundElements />

            {/* Sidebar */}
            <Sidebar
                isOpen={sidebarOpen}
                setIsOpen={setSidebarOpen}
                onCollapsedChange={setSidebarCollapsed}
            />

            {/* Main Content */}
            <div
                className={`transition-all duration-300 ${sidebarCollapsed ? "lg:ml-20" : "lg:ml-64"}`}
            >
                {/* Navbar */}
                <Navbar
                    onMenuClick={() => setSidebarOpen(true)}
                    sidebarCollapsed={sidebarCollapsed}
                    scrolled={scrolled}
                />

                {/* Page Content */}
                <main className="pt-20 px-4 py-6 md:p-6 md:pt-20">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.3 }}
                        className="max-w-7xl mx-auto"
                    >
                        {children}
                    </motion.div>
                </main>
            </div>
        </div>
    );
};

/**
 * Component phần tử nền
 */
const BackgroundElements = () => (
    <div className="fixed inset-0 overflow-hidden pointer-events-none">
        {/* Animated background orbs */}
        <motion.div
            className="absolute -top-40 -right-40 w-80 h-80 rounded-full opacity-20"
            style={{
                background: "linear-gradient(135deg, #0369a1 0%, #7c3aed 100%)"
            }}
            animate={{
                scale: [1, 1.2, 1],
                rotate: [0, 180, 360],
            }}
            transition={{
                duration: 20,
                repeat: Infinity,
                ease: "linear",
            }}
        />
        <motion.div
            className="absolute -bottom-40 -left-40 w-96 h-96 rounded-full opacity-15"
            style={{
                background: "linear-gradient(135deg, #7c3aed 0%, #06b6d4 100%)"
            }}
            animate={{
                scale: [1.2, 1, 1.2],
                rotate: [360, 180, 0],
            }}
            transition={{
                duration: 25,
                repeat: Infinity,
                ease: "linear",
            }}
        />

        {/* Grid pattern */}
        <div
            className="absolute inset-0 opacity-5"
            style={{
                backgroundImage: `
                    linear-gradient(rgba(148, 163, 184, 0.2) 1px, transparent 1px),
                    linear-gradient(90deg, rgba(148, 163, 184, 0.2) 1px, transparent 1px)
                `,
                backgroundSize: "50px 50px",
            }}
        />
    </div>
);

AppLayout.propTypes = {
    /** Nội dung trang */
    children: PropTypes.node.isRequired
};

export default AppLayout;