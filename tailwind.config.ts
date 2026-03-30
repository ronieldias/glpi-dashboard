import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: ["class"],
  content: [
    "./pages/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
    "./app/**/*.{ts,tsx}",
    "./providers/**/*.{ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        glpi: {
          primary: "#AEC43B",
          "primary-dark": "#8C9E33",
          "primary-light": "#C4D65A",
          text: "#4D5B63",
          bg: "#F5F5F5",
          dark: "#181A1D",
          border: "#E0E0E0",
        },
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
};

export default config;
