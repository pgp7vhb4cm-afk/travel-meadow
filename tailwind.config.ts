import type { Config } from "tailwindcss";
const config: Config = {
  content: ["./app/**/*.{js,ts,jsx,tsx,mdx}", "./components/**/*.{js,ts,jsx,tsx,mdx}"],
  theme: {
    extend: {
      colors: {
        meadow: { light: "#e8f5ef", DEFAULT: "#1a6b4a", dark: "#0f4a32" },
      },
    },
  },
  plugins: [],
};
export default config;
