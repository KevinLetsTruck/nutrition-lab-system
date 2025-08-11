import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        "custom-bg-primary": "var(--bg-primary)",
        "custom-bg-secondary": "var(--bg-secondary)",
        "custom-bg-card": "var(--bg-card)",
        "custom-bg-hover": "var(--bg-hover)",
        "custom-text-primary": "var(--text-primary)",
        "custom-text-secondary": "var(--text-secondary)",
        "custom-text-accent": "var(--text-accent)",
        "custom-border-primary": "var(--border-primary)",
        "custom-border-hover": "var(--border-hover)",
        "custom-primary-green": "var(--primary-green)",
        "custom-primary-green-hover": "var(--primary-green-hover)",
        "custom-primary-green-light": "var(--primary-green-light)",
        "custom-orange-accent": "var(--orange-accent)",
        "custom-red-accent": "var(--red-accent)",
      },
    },
  },
  plugins: [],
};

export default config;
