'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import {
  Home,
  ClipboardCheck,
  FileText,
  Settings
} from 'lucide-react';

const navItems = [
  {
    title: 'Dashboard',
    href: '/dashboard',
    icon: Home
  },
  {
    title: 'Assessments',
    href: '/dashboard/assessments',
    icon: ClipboardCheck
  },
  {
    title: 'Documents',
    href: '/dashboard/documents',
    icon: FileText
  }
];

export function MainNav() {
  const pathname = usePathname();

  return (
    <nav className="bg-white border-b">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center space-x-8">
            <Link href="/dashboard" className="flex items-center space-x-2">
              <Home className="h-6 w-6 text-purple-600" />
              <span className="font-bold text-xl">FNTP Dashboard</span>
            </Link>
            
            <div className="hidden md:flex space-x-1">
              {navItems.map((item) => {
                const Icon = item.icon;
                const isActive = pathname === item.href;
                
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={cn(
                      'flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors',
                      isActive
                        ? 'bg-purple-100 text-purple-700'
                        : 'text-gray-600 hover:bg-gray-100'
                    )}
                  >
                    <Icon className="h-4 w-4" />
                    {item.title}
                    {item.badge && (
                      <span className="ml-1 px-1.5 py-0.5 text-xs bg-green-100 text-green-700 rounded">
                        {item.badge}
                      </span>
                    )}
                  </Link>
                );
              })}
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            <Link href="/dashboard/settings">
              <Settings className="h-5 w-5 text-gray-600 hover:text-gray-900" />
            </Link>
          </div>
        </div>
      </div>
    </nav>
  );
}
