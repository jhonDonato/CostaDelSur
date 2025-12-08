"use client";

import type { ReactNode } from 'react';
import { createContext, useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import type { User } from '@/lib/types';
import { users } from '@/lib/data';
import { Skeleton } from '@/components/ui/skeleton';

interface AuthContextType {
  user: User | null;
  login: (username: string, password_not_used: string) => Promise<boolean>;
  logout: () => void;
  isLoading: boolean;
}

export const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const storedUser = localStorage.getItem('marisqueria-user');
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
    setIsLoading(false);
  }, []);

  const login = useCallback(async (username: string, password_not_used: string) => {
    // In a real app, you'd verify the password against a hash.
    // For this mock, we just find the user by username and assume password is '123456'.
    const foundUser = users.find(u => u.username === username);

    if (foundUser) {
      setUser(foundUser);
      localStorage.setItem('marisqueria-user', JSON.stringify(foundUser));
      if (foundUser.role === 'admin') {
        router.push('/admin');
      } else {
        router.push('/waiter');
      }
      return true;
    }
    return false;
  }, [router]);

  const logout = useCallback(() => {
    setUser(null);
    localStorage.removeItem('marisqueria-user');
    router.push('/login');
  }, [router]);

  if (isLoading) {
    return (
      <div className="flex h-screen w-screen items-center justify-center">
        <div className="w-full max-w-md space-y-4 p-4">
          <Skeleton className="h-12 w-full" />
          <Skeleton className="h-32 w-full" />
          <Skeleton className="h-12 w-full" />
        </div>
      </div>
    );
  }

  return (
    <AuthContext.Provider value={{ user, login, logout, isLoading }}>
      {children}
    </AuthContext.Provider>
  );
}
