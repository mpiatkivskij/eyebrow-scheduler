/** @type {import('tailwindcss').Config} */
import { heroui } from "@heroui/react";

export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
    "./node_modules/@heroui/theme/dist/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        fresha: {
          light: "#F5F6F8",
          dark: "#101113",
        },
      },
      fontFamily: {
        sans: ["Public Sans", "sans-serif"],
      },
    },
  },
  darkMode: "class",
  plugins: [heroui()],
};
