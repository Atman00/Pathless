// tailwind.config.ts
import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        black: "#000000",
        white: "#FFFFFF",
        gray: {
          100: "#F0F0F0",
          200: "#E0E0E0",
          500: "#808080",
          900: "#1A1A1A",
        },
      },
      borderWidth: {
        DEFAULT: '1px',
        '0': '0',
        '2': '2px',
        '3': '3px',
        '4': '4px',
        '8': '8px',
      },
      letterSpacing: {
        tighter: '-0.05em',
        tight: '-0.02.5em',
        widest: '0.25em',
      },
    },
  },
  plugins: [],
};

export default config;