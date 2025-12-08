
"use client";

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/use-auth';
import { DashboardLayout } from '@/components/dashboard-layout';
import { LayoutDashboard, BarChart3, Package, Utensils, UtensilsCrossed } from 'lucide-react';

export default function MenuEditorLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user, isLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    // Allow admin and waiter to access this page
    if (!isLoading && (!user || (user.role !== 'admin' && user.role !== 'waiter'))) {
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

  let navItems;

  if (user.role === 'admin') {
      navItems = [
        { href: '/admin', label: 'Reportes', icon: BarChart3 },
        { href: '/menu-editor', label: 'Editor de Menú', icon: Utensils },
        { href: '/admin/inventory', label: 'Inventario', icon: Package },
        { href: '/waiter', label: 'Mesas', icon: LayoutDashboard },
        { href: '/kitchen', label: 'Cocina', icon: LayoutDashboard },
      ];
  } else { // Waiter
      navItems = [
        { href: '/waiter', label: 'Mesas', icon: LayoutDashboard },
        { href: '/menu-editor', label: 'Editor de Menú', icon: Utensils },
        { href: '/kitchen', label: 'Cocina', icon: UtensilsCrossed },
      ];
  }

  return <DashboardLayout navItems={navItems}>{children}</DashboardLayout>;
}
