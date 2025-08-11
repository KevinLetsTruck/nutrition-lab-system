import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// Utility function for token management (can be called from browser console)
export const tokenUtils = {
  clearToken: () => {
    if (typeof window !== "undefined") {
      localStorage.removeItem("token");
      console.log("Token cleared from localStorage");
      return true;
    }
    return false;
  },

  checkToken: () => {
    if (typeof window !== "undefined") {
      const token = localStorage.getItem("token");
      if (!token) {
        console.log("No token found in localStorage");
        return false;
      }

      const tokenParts = token.split(".");
      if (tokenParts.length !== 3) {
        console.log("Token format is invalid (should have 3 parts)");
        return false;
      }

      try {
        tokenParts.forEach((part, index) => {
          if (part) {
            atob(part.replace(/-/g, "+").replace(/_/g, "/"));
          }
        });
        console.log("Token format appears valid");
        return true;
      } catch (error) {
        console.log("Token contains invalid base64:", error);
        return false;
      }
    }
    return false;
  },

  refreshPage: () => {
    if (typeof window !== "undefined") {
      window.location.reload();
    }
  },
};

// Make tokenUtils available globally for debugging
if (typeof window !== "undefined") {
  (window as any).tokenUtils = tokenUtils;
}
