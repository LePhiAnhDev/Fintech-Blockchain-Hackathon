import { forwardRef } from "react";
import { Loader2 } from "lucide-react";
import PropTypes from "prop-types";

/**
 * Button component với nhiều biến thể và kích thước
 * 
 * @component
 */
const Button = forwardRef(
    (
        {
            variant = "default",
            size = "md",
            isLoading = false,
            disabled = false,
            children,
            className = "",
            leftIcon,
            rightIcon,
            ...props
        },
        ref
    ) => {
        const baseClasses =
            "inline-flex items-center justify-center font-medium transition-all duration-300 ease-out focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-slate-900 disabled:opacity-50 disabled:cursor-not-allowed rounded-xl border";

        const variants = {
            default:
                "bg-slate-900/90 border-slate-700/60 text-slate-200 hover:bg-slate-800/90 hover:border-slate-600/60 focus:ring-slate-500",
            primary:
                "bg-gradient-to-r from-blue-600 to-violet-600 border-blue-500/30 text-white hover:from-blue-500 hover:to-violet-500 hover:border-blue-400/40 focus:ring-blue-500/50 shadow-md hover:shadow-lg backdrop-blur-sm",
            secondary:
                "bg-slate-900/90 border-slate-700/60 text-slate-200 hover:bg-slate-800/90 hover:border-slate-600/60 focus:ring-slate-500",
            outline:
                "border-2 border-slate-600/60 bg-transparent text-slate-200 hover:bg-slate-800/60 hover:border-slate-500/60 focus:ring-slate-500",
            ghost:
                "bg-transparent border-transparent text-slate-200 hover:bg-slate-800/60 hover:text-slate-100 focus:ring-slate-500",
            danger:
                "bg-red-600 border-red-600/60 text-white hover:bg-red-500 hover:border-red-500/60 focus:ring-red-500",
            success:
                "bg-emerald-600 border-emerald-600/60 text-white hover:bg-emerald-500 hover:border-emerald-500/60 focus:ring-emerald-500",
            warning:
                "bg-amber-600 border-amber-600/60 text-white hover:bg-amber-500 hover:border-amber-500/60 focus:ring-amber-500",
        };

        const sizes = {
            sm: "h-8 px-3 text-sm",
            md: "h-10 px-4 text-sm",
            lg: "h-12 px-6 text-base font-semibold",
            xl: "h-14 px-8 text-lg font-semibold",
        };

        const variantClass = variants[variant] || variants.default;
        const sizeClass = sizes[size] || sizes.md;

        return (
            <button
                ref={ref}
                className={`${baseClasses} ${variantClass} ${sizeClass} ${className}`}
                disabled={disabled || isLoading}
                {...props}
            >
                {isLoading ? (
                    <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Loading...
                    </>
                ) : (
                    <>
                        {leftIcon && <span className="mr-2">{leftIcon}</span>}
                        {children}
                        {rightIcon && <span className="ml-2">{rightIcon}</span>}
                    </>
                )}
            </button>
        );
    }
);

Button.displayName = "Button";

Button.propTypes = {
    /** Biến thể của button */
    variant: PropTypes.oneOf([
        "default",
        "primary",
        "secondary",
        "outline",
        "ghost",
        "danger",
        "success",
        "warning",
    ]),
    /** Kích thước của button */
    size: PropTypes.oneOf(["sm", "md", "lg", "xl"]),
    /** Trạng thái đang tải */
    isLoading: PropTypes.bool,
    /** Trạng thái vô hiệu hóa */
    disabled: PropTypes.bool,
    /** Nội dung button */
    children: PropTypes.node,
    /** Class tùy chỉnh */
    className: PropTypes.string,
    /** Icon bên trái */
    leftIcon: PropTypes.node,
    /** Icon bên phải */
    rightIcon: PropTypes.node,
};

export default Button;