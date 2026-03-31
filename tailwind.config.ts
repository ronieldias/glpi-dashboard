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
          text: "var(--color-text)",
          bg: "var(--color-bg)",
          dark: "var(--color-header)",
          border: "var(--color-border)",
        },
        card: {
          DEFAULT: "var(--color-card)",
          foreground: "var(--color-card-fg)",
        },
        muted: {
          DEFAULT: "var(--color-text-muted)",
          foreground: "var(--color-text-faint)",
        },
        skeleton: "var(--color-skeleton)",
        "input-bg": "var(--color-input-bg)",
        "tabs-bg": "var(--color-tabs-bg)",
        "tabs-active": "var(--color-tabs-active)",
        "header-border": "var(--color-header-border)",
        "chart-text": "var(--color-chart-text)",
        "progress-track": "var(--color-progress-track)",
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
};

export default config;
