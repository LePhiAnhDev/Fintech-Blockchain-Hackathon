import { forwardRef } from "react";
import PropTypes from "prop-types";

/**
 * Card component với nhiều biến thể và tùy chọn
 * 
 * @component
 */
const Card = forwardRef(
    (
        {
            variant = "default",
            children,
            className = "",
            padding = "default",
            hover = false,
            ...props
        },
        ref
    ) => {
        const baseClasses = "rounded-xl transition-all duration-200 border";

        const variants = {
            default: "bg-slate-900/90 border-slate-700/60 shadow-lg",
            glass: "backdrop-blur-xl bg-slate-900/85 border-slate-700/40 shadow-glass",
            gradient: "bg-gradient-to-br from-slate-900/90 to-slate-800/90 border-slate-700/60 shadow-lg",
            primary: "bg-gradient-to-br from-blue-900/60 to-violet-900/60 border-blue-700/40 shadow-xl",
            secondary: "bg-gradient-to-br from-violet-900/60 to-cyan-900/60 border-violet-700/40 shadow-lg",
            danger: "bg-red-900/30 border-red-700/40 shadow-lg",
            warning: "bg-amber-900/30 border-amber-700/40 shadow-lg",
            success: "bg-emerald-900/30 border-emerald-700/40 shadow-lg",
        };

        const paddings = {
            none: "",
            sm: "p-4",
            default: "p-6",
            lg: "p-8",
            xl: "p-10",
        };

        const hoverClasses = hover
            ? "hover:shadow-xl hover:scale-105 cursor-pointer hover:border-slate-600"
            : "";

        const variantClass = variants[variant] || variants.default;
        const paddingClass = paddings[padding] || paddings.default;

        return (
            <div
                ref={ref}
                className={`${baseClasses} ${variantClass} ${paddingClass} ${hoverClasses} ${className}`}
                {...props}
            >
                {children}
            </div>
        );
    }
);

Card.displayName = "Card";

Card.propTypes = {
    /** Biến thể của card */
    variant: PropTypes.oneOf([
        "default",
        "glass",
        "gradient",
        "primary",
        "secondary",
        "danger",
        "warning",
        "success"
    ]),
    /** Nội dung card */
    children: PropTypes.node,
    /** Class tùy chỉnh */
    className: PropTypes.string,
    /** Kích thước padding */
    padding: PropTypes.oneOf(["none", "sm", "default", "lg", "xl"]),
    /** Hiệu ứng hover */
    hover: PropTypes.bool,
};

export default Card;