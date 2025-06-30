import { memo } from "react";
import PropTypes from "prop-types";

/**
 * Logo component với nhiều kích thước
 * 
 * @component
 */
const Logo = memo(({ size = "md", className = "", showText = true }) => {
    const sizeClasses = {
        sm: "w-8 h-8",
        md: "w-10 h-10",
        lg: "w-12 h-12",
        xl: "w-16 h-16",
        "2xl": "w-20 h-20",
    };

    const textSizeClasses = {
        sm: "text-lg",
        md: "text-xl",
        lg: "text-2xl",
        xl: "text-3xl",
        "2xl": "text-4xl",
    };

    return (
        <div className={`flex items-center space-x-3 ${className}`}>
            <div className={`${sizeClasses[size]} flex-shrink-0`}>
                <img
                    src="/logo.svg"
                    alt="CashDig9 Logo"
                    className="w-full h-full object-contain"
                />
            </div>

            {showText && (
                <span
                    className={`font-bold ${textSizeClasses[size]} text-white tracking-tight`}
                >
                    CashDig9
                </span>
            )}
        </div>
    );
});

Logo.displayName = "Logo";

Logo.propTypes = {
    /** Kích thước logo */
    size: PropTypes.oneOf(["sm", "md", "lg", "xl", "2xl"]),
    /** Class tùy chỉnh */
    className: PropTypes.string,
    /** Hiển thị tên bên cạnh logo */
    showText: PropTypes.bool,
};

export default Logo;