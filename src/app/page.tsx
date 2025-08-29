'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function Home() {
  const router = useRouter();

  useEffect(() => {
    // Simple one-time redirect with token validation
    const checkAuth = async () => {
      const token = localStorage.getItem('token');
      const user = localStorage.getItem('user');

      if (token && user) {
        try {
          const parsedUser = JSON.parse(user);

          // Validate token with backend before redirecting
          const response = await fetch('/api/auth/verify', {
            method: 'GET',
            headers: {
              Authorization: `Bearer ${token}`,
              'Content-Type': 'application/json',
            },
          });

          if (response.ok) {
            // Token is valid, redirect based on role
            if (parsedUser.role === 'CLIENT') {
              router.replace('/dashboard');
            } else {
              router.replace('/dashboard/clients');
            }
          } else {
            // Token is invalid, clear and go to login
            console.log('Token validation failed, clearing auth state');
            localStorage.removeItem('token');
            localStorage.removeItem('user');
            sessionStorage.clear();
            router.replace('/auth/login');
          }
        } catch (e) {
          // If parsing fails or network error, clear and go to login
          console.log('Auth validation error:', e);
          localStorage.removeItem('token');
          localStorage.removeItem('user');
          sessionStorage.clear();
          router.replace('/auth/login');
        }
      } else {
        // No auth - go to login
        router.replace('/auth/login');
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
