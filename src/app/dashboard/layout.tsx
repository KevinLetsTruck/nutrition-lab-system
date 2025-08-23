"use client";

import { ProtectedRoute } from "@/components/auth/ProtectedRoute";
import Link from "next/link";
import { useAuth } from "@/lib/auth-context";
import { usePathname } from "next/navigation";
import {
  Users,
  LogOut,
  Leaf,
  Calendar,
} from "lucide-react";

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
      <div
        className="min-h-screen"
        style={{
          background: "linear-gradient(135deg, #0f172a 0%, #1e293b 100%)",
        }}
      >
        {/* Navigation */}
        <nav className="bg-[#0f172a] border-b border-[#334155] shadow-lg">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            {/* Top Row - Logo and User Menu */}
            <div className="flex justify-between items-center h-20">
              {/* Logo */}
              <div className="flex-shrink-0 flex items-center">
                <div className="flex items-center space-x-4">
                  <div className="p-3 rounded-xl bg-gradient-to-br from-[#4ade80] to-[#fb923c] shadow-lg">
                    <Leaf className="h-8 w-8 text-[#0f172a]" />
                  </div>
                  <div>
                    <h1 className="text-3xl font-bold gradient-text">
                      DestinationHealth
                    </h1>
                  </div>
                </div>
              </div>

              {/* User Menu */}
              <div className="flex items-center space-x-4">
                <div className="hidden md:block">
                  <span className="text-sm text-[#94a3b8]">
                    Welcome,{" "}
                    <span className="text-[#f1f5f9] font-medium">
                      {user?.name || user?.email}
                    </span>
                  </span>
                </div>

                <div className="flex items-center space-x-2">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#4ade80] to-[#fb923c] flex items-center justify-center shadow-lg">
                    <span className="text-[#0f172a] font-bold text-lg">
                      {(user?.name || user?.email)?.charAt(0).toUpperCase()}
                    </span>
                  </div>
                  <button
                    onClick={logout}
                    className="text-[#94a3b8] hover:text-[#f1f5f9] inline-flex items-center px-4 py-2 text-sm font-medium transition-colors duration-200 rounded-lg hover:bg-[#334155]"
                  >
                    <LogOut className="h-5 w-5 mr-2" />
                    <span className="hidden sm:inline">Logout</span>
                  </button>
                </div>
              </div>
            </div>

            {/* Bottom Row - Navigation Links */}
            <div className="hidden sm:flex sm:space-x-8 pb-4">
              <Link
                href="/dashboard/clients"
                className={`nav-link-large inline-flex items-center px-4 py-3 text-base font-medium text-gray-300 hover:text-white ${
                  isActive("/dashboard/clients") ? "active" : ""
                }`}
              >
                <Users className="h-5 w-5 mr-3" />
                Clients
              </Link>
              <Link
                href="/dashboard/scheduled"
                className={`nav-link-large inline-flex items-center px-4 py-3 text-base font-medium text-gray-300 hover:text-white ${
                  isActive("/dashboard/scheduled") ? "active" : ""
                }`}
              >
                <Calendar className="h-5 w-5 mr-3" />
                Thursday Calls
              </Link>
            </div>
          </div>

          {/* Mobile Navigation */}
          <div className="sm:hidden border-t border-[#334155]">
            <div className="px-4 py-3 space-y-2">
              <Link
                href="/dashboard/clients"
                className={`nav-link-large block px-4 py-3 text-base font-medium text-gray-300 hover:text-white ${
                  isActive("/dashboard/clients") ? "active" : ""
                }`}
              >
                <Users className="h-5 w-5 mr-3 inline" />
                Clients
              </Link>
              <Link
                href="/dashboard/scheduled"
                className={`nav-link-large block px-4 py-3 text-base font-medium text-gray-300 hover:text-white ${
                  isActive("/dashboard/scheduled") ? "active" : ""
                }`}
              >
                <Calendar className="h-5 w-5 mr-3 inline" />
                Thursday Calls
              </Link>
            </div>
          </div>
        </nav>

        {/* Main Content */}
        <main className="min-h-[calc(100vh-8rem)]">{children}</main>
      </div>
    </ProtectedRoute>
  );
}
