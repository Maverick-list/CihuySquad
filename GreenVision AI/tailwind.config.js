/** @type {import('tailwindcss').Config} */
export default {
    content: [
        "./index.html",
        "./src/**/*.{js,ts,jsx,tsx}",
    ],
    theme: {
        extend: {
            colors: {
                background: "#020617", // Slate-950
                foreground: "#f8fafc", // Slate-50
                primary: {
                    DEFAULT: "#10b981", // Emerald-500
                    hover: "#059669",   // Emerald-600
                },
                secondary: {
                    DEFAULT: "#14b8a6", // Teal-500
                    hover: "#0d9488",   // Teal-600
                },
                card: {
                    DEFAULT: "rgba(30, 41, 59, 0.7)", // Slate-800 with opacity
                    border: "rgba(255, 255, 255, 0.1)"
                },
            },
            fontFamily: {
                sans: ['Inter', 'sans-serif'],
            },
        },
    },
    plugins: [],
}
