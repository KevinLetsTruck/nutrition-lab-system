'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useAuth } from '@/lib/auth-context';
import { Leaf } from 'lucide-react';

export default function LoginPage() {
  const { login } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  
  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setIsLoading(true);
    setError('');
    
    const formData = new FormData(e.currentTarget);
    const email = formData.get('email') as string;
    const password = formData.get('password') as string;
    
    try {
      await login(email, password);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong');
      setIsLoading(false);
    }
  }
  
  return (
    <div 
      className="min-h-screen flex items-center justify-center px-4 sm:px-6 lg:px-8"
      style={{
        background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 100%)'
      }}
    >
      <div className="max-w-md w-full space-y-8">
        {/* Logo and Header */}
        <div className="text-center">
          <div className="flex justify-center items-center mb-6">
            <div className="flex items-center space-x-3">
              <div className="p-3 rounded-xl bg-[#4ade80] shadow-lg">
                <Leaf className="h-8 w-8 text-[#0f172a]" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-[#f1f5f9]">DestinationHealth</h1>
                <p className="text-sm text-[#94a3b8]">FNTP Nutrition System</p>
              </div>
            </div>
          </div>
          
          <h2 className="text-3xl font-bold text-[#f1f5f9] mb-2">
            Welcome Back
          </h2>
          <p className="text-[#94a3b8]">
            Sign in to access your nutrition practice dashboard
          </p>
        </div>
        
        {/* Login Form */}
        <div className="card bg-[#1e293b] border border-[#334155] rounded-xl p-8 shadow-xl">
          <form className="space-y-6" onSubmit={handleSubmit}>
            {error && (
              <div className="bg-red-500/10 border border-red-500/20 text-red-400 px-4 py-3 rounded-lg">
                <p className="text-sm font-medium">{error}</p>
              </div>
            )}
            
            <div className="space-y-4">
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-[#f1f5f9] mb-2">
                  Email Address
                </label>
                <input
                  id="email"
                  name="email"
                  type="email"
                  required
                  className="input w-full"
                  placeholder="Enter your email"
                />
              </div>
              
              <div>
                <label htmlFor="password" className="block text-sm font-medium text-[#f1f5f9] mb-2">
                  Password
                </label>
                <input
                  id="password"
                  name="password"
                  type="password"
                  required
                  className="input w-full"
                  placeholder="Enter your password"
                />
              </div>
            </div>
            
            <div className="pt-4">
              <button
                type="submit"
                disabled={isLoading}
                className="btn-primary w-full flex justify-center items-center disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoading ? (
                  <>
                    <div className="spinner w-4 h-4 mr-2"></div>
                    Signing in...
                  </>
                ) : (
                  'Sign In'
                )}
              </button>
            </div>
          </form>
          
          <div className="mt-8 pt-6 border-t border-[#334155]">
            <div className="text-center">
              <p className="text-[#94a3b8]">
                Don't have an account?{' '}
                <Link 
                  href="/register" 
                  className="text-[#4ade80] hover:text-[#22c55e] font-medium transition-colors duration-200"
                >
                  Create one here
                </Link>
              </p>
            </div>
          </div>
        </div>
        
        {/* Footer */}
        <div className="text-center">
          <p className="text-xs text-[#94a3b8]">
            © 2024 DestinationHealth. All rights reserved.
          </p>
        </div>
      </div>
    </div>
  );
}
