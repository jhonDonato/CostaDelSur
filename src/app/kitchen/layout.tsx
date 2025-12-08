
"use client";

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/use-auth';
import { DashboardLayout } from '@/components/dashboard-layout';
import { LayoutDashboard, UtensilsCrossed } from 'lucide-react';

export default function KitchenLayout({
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
  
  const navItems = [
    { href: '/kitchen', label: 'Pedidos', icon: UtensilsCrossed },
    { href: '/waiter', label: 'Mesas', icon: LayoutDashboard },
  ];

  // Admins can also see the kitchen
  if (user.role === 'admin') {
      navItems.push({ href: '/admin', label: 'Admin', icon: LayoutDashboard });
  }


  return <DashboardLayout navItems={navItems}>{children}</DashboardLayout>;
}
