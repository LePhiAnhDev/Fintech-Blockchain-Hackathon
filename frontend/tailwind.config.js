/** @type {import('tailwindcss').Config} */
export default {
    content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
    theme: {
        extend: {
            fontFamily: {
                sans: ["Inter", "system-ui", "sans-serif"],
                mono: ["JetBrains Mono", "Menlo", "Monaco", "Consolas", "monospace"],
            },
            colors: {
                primary: {
                    50: "#f0f9ff",
                    100: "#e0f2fe",
                    200: "#bae6fd",
                    300: "#7dd3fc",
                    400: "#38bdf8",
                    500: "#0ea5e9",
                    600: "#0284c7",
                    700: "#0369a1",
                    800: "#075985",
                    900: "#0c4a6e",
                    950: "#082f49",
                    DEFAULT: "#0369a1",
                },
                secondary: {
                    50: "#faf5ff",
                    100: "#f3e8ff",
                    200: "#e9d5ff",
                    300: "#d8b4fe",
                    400: "#c084fc",
                    500: "#a855f7",
                    600: "#9333ea",
                    700: "#7c3aed",
                    800: "#6b21a8",
                    900: "#581c87",
                    950: "#3b0764",
                    DEFAULT: "#7c3aed",
                },
                accent: {
                    50: "#ecfeff",
                    100: "#cffafe",
                    200: "#a5f3fc",
                    300: "#67e8f9",
                    400: "#22d3ee",
                    500: "#06b6d4",
                    600: "#0891b2",
                    700: "#0e7490",
                    800: "#155e75",
                    900: "#164e63",
                    950: "#083344",
                    DEFAULT: "#06b6d4",
                },
                background: {
                    DEFAULT: "#020617", // slate-950 - giữ nguyên vì đã rất đậm
                    secondary: "#0c1220", // đậm hơn slate-900  
                    tertiary: "#1a202c", // đậm hơn slate-800
                },
                foreground: {
                    DEFAULT: "#f8fafc", // slate-50
                    secondary: "#e2e8f0", // slate-200
                    muted: "#94a3b8", // slate-400
                },
                border: {
                    DEFAULT: "rgba(148, 163, 184, 0.15)", // giảm opacity để đậm hơn
                    secondary: "rgba(148, 163, 184, 0.08)",
                    muted: "rgba(148, 163, 184, 0.03)",
                },
                // Neutral grays - keeping existing structure but adjusting values
                neutral: {
                    50: "#f8fafc",
                    100: "#f1f5f9",
                    200: "#e2e8f0",
                    300: "#cbd5e1",
                    400: "#94a3b8",
                    500: "#64748b",
                    600: "#475569",
                    700: "#334155",
                    800: "#1e293b",
                    900: "#0f172a",
                    950: "#020617",
                },
                // Dark theme colors - deep blue/slate theme
                dark: {
                    50: "#f8fafc",
                    100: "#f1f5f9",
                    200: "#e2e8f0",
                    300: "#cbd5e1",
                    400: "#94a3b8",
                    500: "#64748b",
                    600: "#475569",
                    700: "#334155",
                    800: "#1e293b",
                    900: "#0f172a",
                    950: "#020617",
                },
                // Custom brand colors - làm đậm hơn
                brand: {
                    bg: {
                        primary: "#010409", // đậm hơn slate-950
                        secondary: "#0c1220", // đậm hơn slate-900
                        tertiary: "#1a202c", // đậm hơn slate-800
                        surface: "#2d3748", // đậm hơn slate-700
                        elevated: "#4a5568", // đậm hơn slate-600
                    },
                    border: {
                        primary: "#2d3748", // slate-700 đậm hơn
                        secondary: "#4a5568", // slate-600 đậm hơn
                        muted: "#1a202c", // slate-800 đậm hơn
                    },
                    text: {
                        primary: "#f8fafc", // slate-50
                        secondary: "#e2e8f0", // slate-200
                        tertiary: "#cbd5e1", // slate-300
                        muted: "#94a3b8", // slate-400
                        disabled: "#64748b", // slate-500
                    },
                },
            },
            fontSize: {
                display: ["3.5rem", { lineHeight: "1.1", letterSpacing: "-0.02em" }],
                h1: ["2.25rem", { lineHeight: "1.2", letterSpacing: "-0.02em" }],
                h2: ["1.875rem", { lineHeight: "1.3", letterSpacing: "-0.01em" }],
                h3: ["1.5rem", { lineHeight: "1.4" }],
                "body-lg": ["1.125rem", { lineHeight: "1.6" }],
                body: ["1rem", { lineHeight: "1.6" }],
                "body-sm": ["0.875rem", { lineHeight: "1.5" }],
                caption: ["0.75rem", { lineHeight: "1.4" }],
            },
            spacing: {
                18: "4.5rem",
                72: "18rem",
                84: "21rem",
                96: "24rem",
            },
            animation: {
                "fade-in": "fadeIn 0.5s ease-out",
                "slide-up": "slideUp 0.3s ease-out",
                "slide-down": "slideDown 0.3s ease-out",
                "slide-in-left": "slideInLeft 0.3s ease-out",
                "slide-in-right": "slideInRight 0.3s ease-out",
                "pulse-glow": "pulse-glow 2s ease-in-out infinite",
                "gradient-shift": "gradient-shift 3s ease infinite",
                shimmer: "shimmer 1.5s infinite",
            },
            keyframes: {
                fadeIn: {
                    from: { opacity: "0" },
                    to: { opacity: "1" },
                },
                slideUp: {
                    from: {
                        opacity: "0",
                        transform: "translateY(20px)",
                    },
                    to: {
                        opacity: "1",
                        transform: "translateY(0)",
                    },
                },
                slideDown: {
                    from: {
                        opacity: "0",
                        transform: "translateY(-20px)",
                    },
                    to: {
                        opacity: "1",
                        transform: "translateY(0)",
                    },
                },
                slideInLeft: {
                    from: {
                        opacity: "0",
                        transform: "translateX(-20px)",
                    },
                    to: {
                        opacity: "1",
                        transform: "translateX(0)",
                    },
                },
                slideInRight: {
                    from: {
                        opacity: "0",
                        transform: "translateX(20px)",
                    },
                    to: {
                        opacity: "1",
                        transform: "translateX(0)",
                    },
                },
                "pulse-glow": {
                    "0%, 100%": {
                        opacity: "1",
                        boxShadow: "0 0 5px rgba(56, 189, 248, 0.3)",
                    },
                    "50%": {
                        opacity: "0.8",
                        boxShadow: "0 0 20px rgba(56, 189, 248, 0.5)",
                    },
                },
                "gradient-shift": {
                    "0%": { backgroundPosition: "0% 50%" },
                    "50%": { backgroundPosition: "100% 50%" },
                    "100%": { backgroundPosition: "0% 50%" },
                },
                shimmer: {
                    "0%": { left: "-100%" },
                    "100%": { left: "100%" },
                },
            },
            backdropBlur: {
                xs: "2px",
            },
            screens: {
                xs: "475px",
                "3xl": "1600px",
            },
            borderRadius: {
                "4xl": "2rem",
            },
            boxShadow: {
                glass: "0 8px 32px rgba(15, 23, 42, 0.3)",
                glow: "0 0 20px rgba(56, 189, 248, 0.3)",
                "inner-light": "inset 0 1px 0 rgba(248, 250, 252, 0.1)",
            },
            zIndex: {
                60: "60",
                70: "70",
                80: "80",
                90: "90",
                100: "100",
            },
            transitionDuration: {
                400: "400ms",
                600: "600ms",
            },
            gradientColorStops: {
                "primary-start": "#0369a1", // blue-700
                "primary-end": "#7c3aed", // violet-700
                "secondary-start": "#7c3aed", // violet-700
                "secondary-end": "#06b6d4", // cyan-500
            },
        },
    },
    plugins: [],
};
