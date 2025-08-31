'use client';

import { ClientAuthProvider } from '@/lib/client-auth-context';
import { ClientProtectedRoute } from '@/components/client-auth/ClientProtectedRoute';
import Link from 'next/link';
import { useClientAuth } from '@/lib/client-auth-context';
import { usePathname } from 'next/navigation';
import {
  Home,
  BarChart3,
  MapPin,
  MessageCircle,
  Calendar,
  LogOut,
  User,
  Truck,
  Bell,
  Settings,
} from 'lucide-react';

function ClientNavigation({ children }: { children: React.ReactNode }) {
  const { clientUser, logout } = useClientAuth();
  const pathname = usePathname();

  // Skip navigation for login page
  if (pathname === '/client/login') {
    return <>{children}</>;
  }

  const isActive = (path: string) => pathname.startsWith(path);

  const navItems = [
    { href: '/client/dashboard', label: 'Dashboard', icon: Home },
    { href: '/client/assessment', label: 'Assessment', icon: BarChart3 },
    { href: '/client/travel-tools', label: 'Travel', icon: MapPin },
    { href: '/client/coaching', label: 'Coaching', icon: MessageCircle },
    { href: '/client/profile', label: 'Profile', icon: User },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Mobile Header */}
      <header className="bg-white shadow-sm border-b border-gray-200 sticky top-0 z-50">
        <div className="px-4 py-3">
          <div className="flex items-center justify-between">
            {/* Logo */}
            <Link href="/client/dashboard" className="flex items-center gap-2">
              <div className="p-2 bg-gradient-to-br from-green-600 to-blue-600 rounded-lg shadow-md">
                <Truck className="h-5 w-5 text-white" />
              </div>
              <div>
                <h1 className="text-lg font-bold text-gray-900">TruckHealth</h1>
                <p className="text-xs text-gray-500">Destination Health Portal</p>
              </div>
            </Link>

            {/* User Menu */}
            <div className="flex items-center gap-3">
              {/* Notifications */}
              <button className="relative p-2 text-gray-500 hover:text-gray-700 transition-colors">
                <Bell className="h-5 w-5" />
                {/* Notification dot */}
                <div className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full"></div>
              </button>

              {/* User Info */}
              <div className="text-right hidden sm:block">
                <p className="text-sm font-medium text-gray-900">
                  {clientUser?.firstName} {clientUser?.lastName}
                </p>
                <p className="text-xs text-gray-500 capitalize">
                  {clientUser?.subscriptionStatus} Member
                </p>
              </div>
              
              {/* Avatar */}
              <div className="w-8 h-8 bg-gradient-to-br from-green-500 to-blue-600 rounded-full flex items-center justify-center shadow-md">
                <span className="text-white font-medium text-sm">
                  {clientUser?.firstName?.charAt(0)}{clientUser?.lastName?.charAt(0)}
                </span>
              </div>
              
              {/* Logout */}
              <button
                onClick={logout}
                className="p-2 text-gray-500 hover:text-gray-700 transition-colors"
                title="Sign Out"
              >
                <LogOut className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="pb-20 min-h-[calc(100vh-140px)]">
        {children}
      </main>

      {/* Mobile Bottom Navigation */}
      <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 z-50 shadow-lg">
        <div className="grid grid-cols-5 py-2">
          {navItems.map((item) => {
            const Icon = item.icon;
            const active = isActive(item.href);
            
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex flex-col items-center py-2 px-1 transition-colors ${
                  active 
                    ? 'text-green-600 bg-green-50' 
                    : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'
                } rounded-lg mx-1`}
              >
                <Icon className={`h-5 w-5 mb-1 ${active ? 'text-green-600' : ''}`} />
                <span className={`text-xs font-medium ${active ? 'text-green-600' : ''}`}>
                  {item.label}
                </span>
              </Link>
            );
          })}
        </div>
      </nav>
    </div>
  );
}

export default function ClientLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ClientAuthProvider>
      <ClientProtectedRoute>
        <ClientNavigation>
          {children}
        </ClientNavigation>
      </ClientProtectedRoute>
    </ClientAuthProvider>
  );
}
