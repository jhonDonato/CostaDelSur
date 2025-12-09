
"use client";

import React, { Suspense, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import Image from 'next/image';
import { Phone, Clock, AlertTriangle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useAppState } from '@/hooks/use-app-state';
import { useToast } from '@/hooks/use-toast';
import { Logo } from '@/components/icons';
import type { MenuItem } from '@/lib/types';
import { PlaceHolderImages } from '@/lib/placeholder-images';
import Link from 'next/link';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Input } from '@/components/ui/input';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';

function MenuItemCard({ item }: { item: MenuItem }) {
  const placeholder = PlaceHolderImages.find(p => p.imageUrl === item.image);
  return (
    <Card className="overflow-hidden transition-all duration-300 hover:shadow-lg hover:shadow-primary/20">
      <div className="relative h-48 w-full">
        <Image
          src={item.image}
          alt={item.name}
          fill
          className="object-cover"
          data-ai-hint={placeholder?.imageHint}
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
        />
      </div>
      <CardHeader>
        <div className="flex justify-between items-start">
            <CardTitle className="font-headline text-lg">{item.name}</CardTitle>
            <p className="text-lg font-bold text-primary">${item.price.toFixed(2)}</p>
        </div>
        <CardDescription className="pt-2">{item.description}</CardDescription>
      </CardHeader>
    </Card>
  );
}

function CustomerMenuPageContent() {
  const { state, dispatch } = useAppState();
  const { toast } = useToast();
  const searchParams = useSearchParams();
  const tableQuery = searchParams.get('table');

  const [isCallAlertOpen, setIsCallAlertOpen] = useState(false);
  const [tableNumberInput, setTableNumberInput] = useState('');

  const { menuItems } = state;

  const categories: MenuItem['category'][] = ['Entradas', 'Platos a la Carta', 'Bebidas', 'Postres'];
  const menuByCategory = categories.reduce((acc, category) => {
    const items = menuItems.filter(item => item.category === category && item.stock > 0);
    if (items.length > 0) {
      acc[category] = items;
    }
    return acc;
  }, {} as Record<MenuItem['category'], MenuItem[]>);

  const handleCallWaiter = () => {
    if (tableQuery) {
        const tableId = parseInt(tableQuery, 10);
        if (isNaN(tableId)) {
             toast({
                title: "Error",
                description: "Número de mesa inválido en la URL.",
                variant: "destructive",
            });
            return;
        }
        dispatch({ type: 'CALL_WAITER', payload: { tableId } });
        toast({
            title: "Llamada Enviada",
            description: `Un mesero atenderá la mesa ${tableId} pronto.`,
            variant: "default",
        });
    } else {
        setIsCallAlertOpen(true);
    }
  };

  const submitCallFromAlert = () => {
    const tableId = parseInt(tableNumberInput, 10);
    if (isNaN(tableId) || tableId <= 0) {
      toast({
        title: "Número de Mesa Inválido",
        description: "Por favor, ingrese un número de mesa válido.",
        variant: "destructive",
      });
      return;
    }
    dispatch({ type: 'CALL_WAITER', payload: { tableId } });
    toast({
      title: "Llamada Enviada",
      description: `Un mesero atenderá la mesa ${tableId} pronto.`,
      variant: "default",
    });
    setIsCallAlertOpen(false);
    setTableNumberInput('');
  };


  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-40 w-full border-b bg-background/80 backdrop-blur-sm">
        <div className="container mx-auto flex h-16 items-center justify-between px-4">
           <Link href="/" className="flex items-center gap-2">
            <Logo className="h-8 w-8 text-primary" />
            <h1 className="text-xl font-bold font-headline">Marisquería Online</h1>
          </Link>
          {tableQuery && (
            <div className="font-semibold rounded-md bg-secondary text-secondary-foreground px-3 py-1">Mesa {tableQuery}</div>
          )}
        </div>
      </header>
      
      <main className="container mx-auto p-4 md:p-8">
        <div className="text-center mb-8">
          <h2 className="text-4xl font-bold font-headline">Nuestro Menú</h2>
          <p className="text-muted-foreground mt-2">Sabores frescos del mar, directo a tu mesa.</p>
        </div>
        
        <Alert className="mb-8 bg-blue-50 border-blue-200 text-blue-800">
            <Clock className="h-4 w-4 !text-blue-800" />
            <AlertTitle>Tiempo de Preparación</AlertTitle>
            <AlertDescription>
                El tiempo de espera estimado para los platos es de 30 minutos. Agradecemos su paciencia.
            </AlertDescription>
        </Alert>

        {Object.keys(menuByCategory).length > 0 ? (
          <Tabs defaultValue={Object.keys(menuByCategory)[0]} className="w-full">
            <TabsList className="grid w-full grid-cols-2 md:grid-cols-4 mb-6">
              {categories.map((category) => (
                menuByCategory[category] && <TabsTrigger key={category} value={category}>{category}</TabsTrigger>
              ))}
            </TabsList>
            
            {Object.entries(menuByCategory).map(([category, items]) => (
              <TabsContent key={category} value={category}>
                <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                  {items.map((item) => (
                    <MenuItemCard key={item.id} item={item} />
                  ))}
                </div>
              </TabsContent>
            ))}
          </Tabs>
        ) : (
          <div className="text-center py-16">
            <p className="text-muted-foreground">El menú no está disponible en este momento. Por favor, consulte a nuestro personal.</p>
          </div>
        )}
      </main>

      <Button
        onClick={handleCallWaiter}
        className="fixed bottom-6 right-6 h-16 w-16 rounded-full shadow-lg"
        size="icon"
      >
        <Phone className="h-8 w-8" />
        <span className="sr-only">Llamar al Mesero</span>
      </Button>

      <AlertDialog open={isCallAlertOpen} onOpenChange={setIsCallAlertOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Llamar a un mesero</AlertDialogTitle>
            <AlertDialogDescription>
              Por favor, ingrese su número de mesa para que podamos atenderle.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <div className="py-2">
            <Input 
              type="number"
              placeholder="Número de Mesa"
              value={tableNumberInput}
              onChange={(e) => setTableNumberInput(e.target.value)}
            />
          </div>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={submitCallFromAlert}>Llamar</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

export default function CustomerMenuPage() {
    return (
        <Suspense fallback={<div className="flex h-screen w-screen items-center justify-center">Cargando...</div>}>
            <CustomerMenuPageContent />
        </Suspense>
    )
}
