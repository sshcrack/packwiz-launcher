import { CSSProperties } from "react";

export const MinecraftStyles = {
    // Common button styles that mimic Minecraft buttons
    button: {
        base: "px-4 py-2 font-bold uppercase text-sm tracking-wide border-b-4 active:border-b-0 active:border-t-4 active:translate-y-[4px] transition-all duration-100 font-minecraft shadow-md",
        primary: "bg-green-500 hover:bg-green-400 border-green-700 text-white",
        secondary: "bg-gray-500 hover:bg-gray-400 border-gray-700 text-white",
        danger: "bg-red-500 hover:bg-red-400 border-red-700 text-white",
    },

    // Card styles for Minecraft-like panels
    card: {
        base: "border-2 shadow-lg",
        light: "bg-gray-100 bg-opacity-90 border-gray-300",
        dark: "bg-gray-800 bg-opacity-90 border-gray-700",
    },

    // Overlay styles for modals and panels
    overlay: {
        base: "absolute inset-0 flex items-center justify-center z-50",
        backdrop: "bg-black bg-opacity-50",
    },

    // Input styles for Minecraft-like inputs
    input: {
        base: "py-2 px-3 border-2 bg-opacity-80 focus:outline-none focus:ring-2 font-minecraft",
        light: "bg-white border-gray-300 focus:ring-blue-500 text-gray-800",
        dark: "bg-gray-700 border-gray-600 focus:ring-blue-400 text-gray-100",
    },

    // Typography styles
    text: {
        title: "font-minecraft text-2xl uppercase tracking-wider",
        subtitle: "font-minecraft text-lg",
        body: "font-minecraft text-sm leading-relaxed",
    }
};

// Helper function to get card style based on theme
export const getCardStyle = (theme: "light" | "dark", customStyle?: CSSProperties): CSSProperties => {
    return {
        backdropFilter: `blur(3px)`,
        background: theme === "dark" ? "rgba(30, 30, 46, 0.85)" : "rgba(255, 255, 255, 0.85)",
        border: `2px solid ${theme === "dark" ? "#374151" : "#d1d5db"}`,
        boxShadow: `0 4px 6px ${theme === "dark" ? "rgba(0, 0, 0, 0.3)" : "rgba(0, 0, 0, 0.1)"}`,
        ...customStyle
    };
};