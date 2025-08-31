'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useClientAuth } from '@/lib/client-auth-context';

interface ClientProtectedRouteProps {
  children: React.ReactNode;
  requireSubscription?: boolean;
}

export function ClientProtectedRoute({ 
  children, 
  requireSubscription = false 
}: ClientProtectedRouteProps) {
  const { clientUser, isLoading } = useClientAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading) {
      if (!clientUser) {
        console.log('🔒 Client not authenticated, redirecting to login');
        router.push('/client/login');
        return;
      }

      if (requireSubscription && clientUser.subscriptionStatus === 'expired') {
        console.log('💳 Client subscription expired, redirecting to upgrade');
        router.push('/client/upgrade');
        return;
      }

      console.log('✅ Client access granted:', clientUser.firstName);
    }
  }, [clientUser, isLoading, router, requireSubscription]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading your health portal...</p>
        </div>
      </div>
    );
  }

  if (!clientUser) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-600 mb-4">Redirecting to login...</p>
        </div>
      </div>
    );
  }

  if (requireSubscription && clientUser.subscriptionStatus === 'expired') {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="text-center max-w-md">
          <h2 className="text-xl font-bold text-gray-900 mb-4">Subscription Required</h2>
          <p className="text-gray-600 mb-6">
            Please renew your subscription to access this feature.
          </p>
          <button 
            onClick={() => router.push('/client/upgrade')}
            className="bg-green-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-green-700 transition-colors"
          >
            Upgrade Now
          </button>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
