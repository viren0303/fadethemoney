import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}"],
  darkMode: "class",
  theme: {
    extend: {
      colors: {
        bg: "#0b0d12",
        panel: "#12151c",
        panel2: "#181c25",
        border: "#222836",
        accent: "#22c55e",
        danger: "#ef4444",
        muted: "#7a8497",
      },
      fontFamily: {
        sans: ["Inter", "system-ui", "sans-serif"],
      },
    },
  },
  plugins: [],
};
export default config;
