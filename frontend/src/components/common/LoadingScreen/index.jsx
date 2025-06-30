import React from "react";

/**
 * Màn hình loading đơn giản với spinner xoay
 * @component
 */
const LoadingScreen = ({ message = "Đang tải..." }) => {
    return (
        <div className="fixed inset-0 bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center overflow-hidden">
            {/* Main Content */}
            <div className="text-center">
                {/* Simple Spinning Loader */}
                <div className="inline-flex items-center justify-center w-16 h-16 border-4 border-primary-500/30 border-t-primary-500 rounded-full animate-spin mb-6"></div>

                {/* Loading Text */}
                <h2 className="text-xl font-semibold text-white mb-2">
                    FinTech Blockchain
                </h2>
                <p className="text-slate-300 text-base">
                    {message}
                </p>
            </div>
        </div>
    );
};

export default LoadingScreen;
