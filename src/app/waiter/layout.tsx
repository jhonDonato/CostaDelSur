"use client";

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/use-auth';
import { DashboardLayout } from '@/components/dashboard-layout';
import { LayoutDashboard, Package, UtensilsCrossed } from 'lucide-react';

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
    return <div>Cargando...</div>;
  }
  
  // Allow admin to see waiter page too
  if (user.role !== 'waiter' && user.role !== 'admin') {
      router.push('/login');
      return <div>Redirigiendo...</div>;
  }

  const navItems = [
    { href: '/waiter', label: 'Mesas', icon: LayoutDashboard },
    { href: '/admin/inventory', label: 'Inventario', icon: Package },
    { href: '/kitchen', label: 'Cocina', icon: UtensilsCrossed },
  ];

  return <DashboardLayout navItems={navItems}>{children}</DashboardLayout>;
}
