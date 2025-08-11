"use client";

import { ProtectedRoute } from "@/components/auth/ProtectedRoute";
import Link from "next/link";
import { useAuth } from "@/lib/auth-context";
import { usePathname } from "next/navigation";
import { Users, FileText, LogOut, Leaf } from "lucide-react";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { logout, user } = useAuth();
  const pathname = usePathname();

  const isActive = (path: string) => pathname.startsWith(path);

  return (
    <ProtectedRoute>
      <div className="min-h-screen" style={{ background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 100%)' }}>
        {/* Navigation */}
        <nav className="bg-[#0f172a] border-b border-[#334155] shadow-lg">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between h-16">
              <div className="flex items-center">
                {/* Logo */}
                <div className="flex-shrink-0 flex items-center">
                  <div className="flex items-center space-x-3">
                    <div className="p-2 rounded-lg bg-[#4ade80]">
                      <Leaf className="h-6 w-6 text-[#0f172a]" />
                    </div>
                    <div>
                      <h1 className="text-xl font-bold text-[#f1f5f9]">DestinationHealth</h1>
                    </div>
                  </div>
                </div>
                
                {/* Navigation Links */}
                <div className="hidden sm:ml-8 sm:flex sm:space-x-6">
                  <Link
                    href="/dashboard/clients"
                    className={`nav-link inline-flex items-center px-3 py-2 text-sm font-medium ${
                      isActive('/dashboard/clients') ? 'active' : ''
                    }`}
                  >
                    <Users className="h-4 w-4 mr-2" />
                    Clients
                  </Link>
                  <Link
                    href="/dashboard/documents"
                    className={`nav-link inline-flex items-center px-3 py-2 text-sm font-medium ${
                      isActive('/dashboard/documents') ? 'active' : ''
                    }`}
                  >
                    <FileText className="h-4 w-4 mr-2" />
                    Documents
                  </Link>
                </div>
              </div>
              
              {/* User Menu */}
              <div className="flex items-center space-x-4">
                <div className="hidden md:block">
                  <span className="text-sm text-[#94a3b8]">
                    Welcome, <span className="text-[#f1f5f9] font-medium">{user?.name || user?.email}</span>
                  </span>
                </div>
                
                <div className="flex items-center space-x-2">
                  <div className="w-8 h-8 rounded-full bg-[#4ade80] flex items-center justify-center">
                    <span className="text-[#0f172a] font-bold text-sm">
                      {(user?.name || user?.email)?.charAt(0).toUpperCase()}
                    </span>
                  </div>
                  <button
                    onClick={logout}
                    className="text-[#94a3b8] hover:text-[#f1f5f9] inline-flex items-center px-3 py-2 text-sm font-medium transition-colors duration-200"
                  >
                    <LogOut className="h-4 w-4 mr-1" />
                    <span className="hidden sm:inline">Logout</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
          
          {/* Mobile Navigation */}
          <div className="sm:hidden border-t border-[#334155]">
            <div className="px-4 py-2 space-y-1">
              <Link
                href="/dashboard/clients"
                className={`nav-link block px-3 py-2 text-sm font-medium ${
                  isActive('/dashboard/clients') ? 'active' : ''
                }`}
              >
                <Users className="h-4 w-4 mr-2 inline" />
                Clients
              </Link>
              <Link
                href="/dashboard/documents"
                className={`nav-link block px-3 py-2 text-sm font-medium ${
                  isActive('/dashboard/documents') ? 'active' : ''
                }`}
              >
                <FileText className="h-4 w-4 mr-2 inline" />
                Documents
              </Link>
            </div>
          </div>
        </nav>

        {/* Main Content */}
        <main className="min-h-[calc(100vh-4rem)]">{children}</main>
      </div>
    </ProtectedRoute>
  );
}
