'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';

interface ClientUser {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  phoneNumber?: string;
  practitionerId?: string;
  subscriptionStatus: 'trial' | 'active' | 'expired';
  onboardingCompleted: boolean;
  assessmentCompleted: boolean;
  lastActiveAt?: Date;
  createdAt: Date;
}

interface ClientAuthContextType {
  clientUser: ClientUser | null;
  clientToken: string | null;
  login: (email: string, password: string) => Promise<boolean>;
  logout: () => void;
  register: (userData: ClientRegistrationData) => Promise<boolean>;
  isLoading: boolean;
  refreshClientData: () => Promise<void>;
}

interface ClientRegistrationData {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  phoneNumber?: string;
  practitionerCode?: string; // Links to practitioner
}

const ClientAuthContext = createContext<ClientAuthContextType | undefined>(undefined);

export function ClientAuthProvider({ children }: { children: React.ReactNode }) {
  const [clientUser, setClientUser] = useState<ClientUser | null>(null);
  const [clientToken, setClientToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('clientToken');
    if (token) {
      setClientToken(token);
      refreshClientData();
    } else {
      setIsLoading(false);
    }
  }, []);

  const login = async (email: string, password: string): Promise<boolean> => {
    try {
      console.log('🔐 Client login attempt:', email);
      const response = await fetch('/api/client-auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      if (response.ok) {
        const data = await response.json();
        setClientToken(data.token);
        setClientUser(data.client);
        localStorage.setItem('clientToken', data.token);
        console.log('✅ Client login successful');
        return true;
      } else {
        const errorData = await response.json();
        console.error('❌ Client login failed:', errorData.error);
        return false;
      }
    } catch (error) {
      console.error('Client login error:', error);
      return false;
    }
  };

  const register = async (userData: ClientRegistrationData): Promise<boolean> => {
    try {
      console.log('📝 Client registration attempt:', userData.email);
      const response = await fetch('/api/client-auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(userData),
      });

      if (response.ok) {
        const data = await response.json();
        setClientToken(data.token);
        setClientUser(data.client);
        localStorage.setItem('clientToken', data.token);
        console.log('✅ Client registration successful');
        return true;
      } else {
        const errorData = await response.json();
        console.error('❌ Client registration failed:', errorData.error);
        return false;
      }
    } catch (error) {
      console.error('Client registration error:', error);
      return false;
    }
  };

  const logout = () => {
    console.log('👋 Client logout');
    setClientUser(null);
    setClientToken(null);
    localStorage.removeItem('clientToken');
  };

  const refreshClientData = async () => {
    try {
      if (!clientToken) return;
      
      const response = await fetch('/api/client-auth/me', {
        headers: { Authorization: `Bearer ${clientToken}` },
      });

      if (response.ok) {
        const data = await response.json();
        setClientUser(data.client);
        console.log('✅ Client data refreshed');
      } else {
        console.log('❌ Client token invalid, logging out');
        logout();
      }
    } catch (error) {
      console.error('Error refreshing client data:', error);
      logout();
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <ClientAuthContext.Provider value={{
      clientUser,
      clientToken,
      login,
      logout,
      register,
      isLoading,
      refreshClientData,
    }}>
      {children}
    </ClientAuthContext.Provider>
  );
}

export function useClientAuth() {
  const context = useContext(ClientAuthContext);
  if (!context) {
    throw new Error('useClientAuth must be used within ClientAuthProvider');
  }
  return context;
}
