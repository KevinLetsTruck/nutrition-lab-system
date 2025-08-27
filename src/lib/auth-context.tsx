"use client";

import { createContext, useContext, useEffect, useState } from "react";
import { useRouter } from "next/navigation";

interface AuthContextType {
  token: string | null;
  user: any | null;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const [token, setToken] = useState<string | null>(null);
  const [user, setUser] = useState<any | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Check for existing token on mount
    const storedToken = localStorage.getItem("token");
    const storedUser = localStorage.getItem("user");

    if (storedToken && storedUser) {
      try {
        const parsedUser = JSON.parse(storedUser);
        setToken(storedToken);
        setUser(parsedUser);
      } catch (e) {
        // If parsing fails, clear everything
        localStorage.removeItem("token");
        localStorage.removeItem("user");
        setToken(null);
        setUser(null);
      }
    } else {
      // Explicitly set to null if no token/user found
      setToken(null);
      setUser(null);
    }
    setIsLoading(false);
  }, []);

  // Listen for storage changes (e.g., logout in another tab)
  useEffect(() => {
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === "token" || e.key === "user") {
        if (!e.newValue) {
          // Token or user was removed
          setToken(null);
          setUser(null);
        }
      }
    };

    window.addEventListener("storage", handleStorageChange);

    // Temporarily disable interval to fix constant refreshing
    // const interval = setInterval(() => {
    //   const currentToken = localStorage.getItem("token");
    //   const currentUser = localStorage.getItem("user");
    //   if (!currentToken || !currentUser) {
    //     if (token || user) {
    //       setToken(null);
    //       setUser(null);
    //     }
    //   }
    // }, 30000);

    return () => {
      window.removeEventListener("storage", handleStorageChange);
      // clearInterval(interval); // Disabled with interval
    };
  }, []); // Remove token/user dependencies to prevent re-setup loops

  const login = async (email: string, password: string) => {
    const response = await fetch("/api/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || "Login failed");
    }

    const data = await response.json();

    // Store in state and localStorage
    setToken(data.token);
    setUser(data.user);
    localStorage.setItem("token", data.token);
    localStorage.setItem("user", JSON.stringify(data.user));

    // Redirect based on user role
    if (data.user.role === "CLIENT") {
      router.push("/dashboard");
    } else {
      router.push("/dashboard/clients");
    }
  };

  const logout = () => {
    // Clear state first
    setToken(null);
    setUser(null);

    // Clear localStorage
    localStorage.removeItem("token");
    localStorage.removeItem("user");

    // Clear sessionStorage
    sessionStorage.clear();

    // Navigate to home page
    router.push("/");
  };

  return (
    <AuthContext.Provider value={{ token, user, login, logout, isLoading }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
