
"use client";

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/use-auth';
import { DashboardLayout } from '@/components/dashboard-layout';
import { LayoutDashboard, BarChart3, Package, Sparkles, Utensils } from 'lucide-react';

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user, isLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading && (!user || user.role !== 'admin')) {
      router.push('/login');
    }
  }, [user, isLoading, router]);

  if (isLoading || !user || user.role !== 'admin') {
    // Show a loading state while we verify auth
    return (
        <div className="flex h-screen w-screen items-center justify-center">
            <div>Cargando y verificando acceso...</div>
        </div>
    );
  }

  const navItems = [
    { href: '/admin', label: 'Reportes', icon: BarChart3 },
    { href: '/admin/menu-editor', label: 'Editor de Menú', icon: Utensils },
    { href: '/admin/inventory', label: 'Inventario', icon: Package },
    { href: '/admin/pricing-optimizer', label: 'Optimizador IA', icon: Sparkles },
    { href: '/waiter', label: 'Mesas', icon: LayoutDashboard },
    { href: '/kitchen', label: 'Cocina', icon: LayoutDashboard },
  ];

  return <DashboardLayout navItems={navItems}>{children}</DashboardLayout>;
}
