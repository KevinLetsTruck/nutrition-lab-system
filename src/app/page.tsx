"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function Home() {
  const router = useRouter();

  useEffect(() => {
    // Simple one-time redirect without auth context dependencies
    const checkAuth = () => {
      const token = localStorage.getItem("token");
      const user = localStorage.getItem("user");
      
      if (token && user) {
        try {
          const parsedUser = JSON.parse(user);
          // Redirect based on role
          if (parsedUser.role === "CLIENT") {
            router.replace("/dashboard");
          } else {
            router.replace("/dashboard/clients");
          }
        } catch (e) {
          // If parsing fails, clear and go to login
          localStorage.removeItem("token");
          localStorage.removeItem("user");
          router.replace("/auth/login");
        }
      } else {
        // No auth - go to login
        router.replace("/auth/login");
      }
    };

    // Small delay to prevent immediate redirect loops
    const timeout = setTimeout(checkAuth, 100);
    return () => clearTimeout(timeout);
  }, [router]); // Only depend on router, not auth context

  // Show loading while determining redirect
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-900">
      <div className="text-center space-y-4">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-400 mx-auto"></div>
        <p className="text-gray-300">Redirecting...</p>
      </div>
    </div>
  );
}
