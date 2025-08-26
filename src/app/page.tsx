"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth-context";

export default function Home() {
  const router = useRouter();
  const { user, isLoading } = useAuth();

  useEffect(() => {
    if (!isLoading) {
      if (user) {
        // User is authenticated - redirect to appropriate dashboard
        if (user.role === "CLIENT") {
          router.replace("/dashboard");
        } else {
          // Admin/Practitioner - go directly to clients page
          router.replace("/dashboard/clients");
        }
      } else {
        // User not authenticated - redirect to login
        router.replace("/auth/login");
      }
    }
  }, [user, isLoading, router]);

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
