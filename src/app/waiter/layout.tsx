
"use client";

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/use-auth';
import { DashboardLayout } from '@/components/dashboard-layout';
import { LayoutDashboard, Package, Utensils, UtensilsCrossed } from 'lucide-react';

export default function WaiterLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user, isLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading && !user) {
      router.push('/login');
    }
  }, [user, isLoading, router]);

  if (isLoading || !user) {
    return (
        <div className="flex h-screen w-screen items-center justify-center">
            <div>Cargando...</div>
        </div>
    );
  }
  
  // Allow admin to see waiter page too
  if (user.role !== 'waiter' && user.role !== 'admin') {
      router.push('/login');
      return <div className="flex h-screen w-screen items-center justify-center">Redirigiendo...</div>;
  }

  const navItems = [
    { href: '/waiter', label: 'Mesas', icon: LayoutDashboard },
    { href: '/admin/menu-editor', label: 'Editor de Menú', icon: Utensils },
    { href: '/kitchen', label: 'Cocina', icon: UtensilsCrossed },
  ];

  if (user.role === 'admin') {
      navItems.push({ href: '/admin', label: 'Admin', icon: LayoutDashboard });
  }

  return <DashboardLayout navItems={navItems}>{children}</DashboardLayout>;
}
