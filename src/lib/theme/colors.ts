export const darkTheme = {
  // Backgrounds
  bg: {
    primary: "bg-gray-900",
    secondary: "bg-gray-800",
    tertiary: "bg-gray-800/50",
    card: "bg-gray-900",
    hover: "hover:bg-gray-800",
    selected: "bg-blue-600",
  },

  // Text
  text: {
    primary: "text-gray-100",
    secondary: "text-gray-400",
    muted: "text-gray-500",
    inverse: "text-gray-900",
  },

  // Borders
  border: {
    primary: "border-gray-700",
    secondary: "border-gray-800",
    focus: "focus:border-blue-500",
  },

  // Status colors (with transparency for dark mode)
  status: {
    success: "bg-green-500/20 text-green-400",
    warning: "bg-yellow-500/20 text-yellow-400",
    error: "bg-red-500/20 text-red-400",
    info: "bg-blue-500/20 text-blue-400",
  },

  // Form elements
  input: {
    base: "bg-gray-800 border-gray-600 text-gray-100 placeholder-gray-500",
    focus: "focus:border-blue-500 focus:ring-blue-500/20",
  },

  // Buttons
  button: {
    primary: "bg-blue-600 hover:bg-blue-700 text-white",
    secondary:
      "bg-gray-800 hover:bg-gray-700 text-gray-100 border border-gray-600",
    danger: "bg-red-600 hover:bg-red-700 text-white",
  },
};

// Export as className strings for easy use
export const theme = darkTheme; // Can switch between light/dark themes later
