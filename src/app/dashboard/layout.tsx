'use client';

import { ProtectedRoute } from '@/components/auth/ProtectedRoute';
import Link from 'next/link';
import { useAuth } from '@/lib/auth-context';
import { Home, Users, FileText, ClipboardList, LogOut } from 'lucide-react';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { logout, user } = useAuth();
  
  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-gray-50">
        {/* Navigation */}
        <nav className="bg-white shadow-sm">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between h-16">
              <div className="flex">
                <div className="flex-shrink-0 flex items-center">
                  <h1 className="text-xl font-semibold">FNTP Dashboard</h1>
                </div>
                <div className="hidden sm:ml-6 sm:flex sm:space-x-8">
                  <Link
                    href="/dashboard"
                    className="border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700 inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium"
                  >
                    <Home className="h-4 w-4 mr-1" />
                    Home
                  </Link>
                  <Link
                    href="/dashboard/clients"
                    className="border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700 inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium"
                  >
                    <Users className="h-4 w-4 mr-1" />
                    Clients
                  </Link>
                  <Link
                    href="/dashboard/documents"
                    className="border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700 inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium"
                  >
                    <FileText className="h-4 w-4 mr-1" />
                    Documents
                  </Link>
                  <Link
                    href="/dashboard/assessments"
                    className="border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700 inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium"
                  >
                    <ClipboardList className="h-4 w-4 mr-1" />
                    Assessments
                  </Link>
                </div>
              </div>
              <div className="flex items-center">
                <span className="text-sm text-gray-500 mr-4">
                  {user?.name || user?.email}
                </span>
                <button
                  onClick={logout}
                  className="text-gray-500 hover:text-gray-700 inline-flex items-center text-sm font-medium"
                >
                  <LogOut className="h-4 w-4 mr-1" />
                  Logout
                </button>
              </div>
            </div>
          </div>
        </nav>
        
        {/* Main Content */}
        <main>{children}</main>
      </div>
    </ProtectedRoute>
  );
}
