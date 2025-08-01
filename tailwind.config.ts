import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: ["class"],
  content: [
    "./pages/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
    "./app/**/*.{ts,tsx}",
    "./src/**/*.{ts,tsx}",
  ],
  theme: {
    container: {
      center: true,
      padding: "2rem",
      screens: {
        "2xl": "1400px",
      },
    },
    extend: {
      colors: {
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--primary))",
        background: {
          DEFAULT: "hsl(var(--background))",
          secondary: "hsl(var(--background-secondary))",
          tertiary: "hsl(var(--background-tertiary))",
        },
        foreground: {
          DEFAULT: "hsl(var(--foreground))",
          secondary: "hsl(var(--foreground-secondary))",
          muted: "hsl(var(--foreground-muted))",
        },
        primary: {
          DEFAULT: "hsl(var(--primary))",
          foreground: "hsl(var(--background))",
          hover: "hsl(var(--primary-hover))",
          light: "hsl(var(--primary-light))",
        },
        secondary: {
          DEFAULT: "hsl(var(--background-secondary))",
          foreground: "hsl(var(--foreground-secondary))",
        },
        accent: {
          DEFAULT: "hsl(var(--accent))",
          purple: "hsl(var(--accent-purple))",
          orange: "hsl(var(--accent-orange))",
          foreground: "hsl(var(--background))",
        },
        destructive: {
          DEFAULT: "hsl(var(--error))",
          foreground: "hsl(var(--background))",
        },
        success: {
          DEFAULT: "hsl(var(--success))",
          foreground: "hsl(var(--background))",
        },
        warning: {
          DEFAULT: "hsl(var(--warning))",
          foreground: "hsl(var(--background))",
        },
        muted: {
          DEFAULT: "hsl(var(--background-secondary))",
          foreground: "hsl(var(--foreground-muted))",
        },
        card: {
          DEFAULT: "hsl(var(--card))",
          foreground: "hsl(var(--foreground))",
          hover: "hsl(var(--card-hover))",
        },
        // Legacy color mappings for compatibility
        dark: {
          50: '#f8fafc',
          100: '#f1f5f9',
          200: '#e2e8f0',
          300: '#cbd5e1',
          400: '#94a3b8',
          500: '#64748b',
          600: '#475569',
          700: '#334155',
          800: '#1e293b',
          900: '#0f172a',
          950: '#020617',
        },
        // Lab Results Colors
        lab: {
          normal: '#10b981',    // Green for normal results
          warning: '#f59e0b',   // Amber for borderline
          critical: '#ef4444',  // Red for critical
          info: '#3b82f6',      // Blue for informational
        },
        // Health Status Colors
        health: {
          excellent: '#059669',
          good: '#10b981',
          fair: '#f59e0b',
          poor: '#dc2626',
        },
        // Nutrition Colors
        nutrition: {
          protein: '#8b5cf6',   // Purple
          carbs: '#f59e0b',     // Amber
          fats: '#ef4444',      // Red
          fiber: '#10b981',     // Green
          vitamins: '#3b82f6',  // Blue
        }
      },
      backgroundImage: {
        'gradient-brand': 'linear-gradient(135deg, #10B981 0%, #FB923C 100%)',
        'gradient-primary': 'linear-gradient(135deg, #10B981 0%, #06B6D4 100%)',
        'gradient-button': 'linear-gradient(135deg, #3B82F6 0%, #8B5CF6 100%)',
        'gradient-dark': 'linear-gradient(135deg, #0F1419 0%, #1A1F2E 100%)',
      },
      fontFamily: {
        sans: ["Inter", "system-ui", "sans-serif"],
        heading: ["Outfit", "sans-serif"],
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
      },
      keyframes: {
        "fade-in": {
          "0%": { opacity: "0", transform: "translateY(10px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        "slide-in-right": {
          "0%": { opacity: "0", transform: "translateX(20px)" },
          "100%": { opacity: "1", transform: "translateX(0)" },
        },
      },
      animation: {
        "fade-in": "fade-in 0.5s ease-out",
        "slide-in-right": "slide-in-right 0.3s ease-out",
      },
    },
  },
  plugins: [],
};

export default config;