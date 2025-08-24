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

      return true;
    }
    return false;
  },

  checkToken: () => {
    if (typeof window !== "undefined") {
      const token = localStorage.getItem("token");
      if (!token) {

        return false;
      }

      const tokenParts = token.split(".");
      if (tokenParts.length !== 3) {
        ");
        return false;
      }

      try {
        tokenParts.forEach((part, index) => {
          if (part) {
            atob(part.replace(/-/g, "+").replace(/_/g, "/"));
          }
        });

        return true;
      } catch (error) {

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
