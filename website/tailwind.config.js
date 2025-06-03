import {heroui} from "@heroui/theme"

/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    './src/layouts/**/*.{js,ts,jsx,tsx,mdx}',
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    "./node_modules/@heroui/theme/dist/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      animation: {
        'pulse-delay-1': 'pulse 2s cubic-bezier(0.4, 0, 0.6, 1) 0.2s infinite',
        'pulse-delay-2': 'pulse 2s cubic-bezier(0.4, 0, 0.6, 1) 0.4s infinite',
      },
    },
  },
  darkMode: "class",
  plugins: [heroui()],
}
