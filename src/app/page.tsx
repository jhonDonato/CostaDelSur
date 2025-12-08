
"use client";

import Image from 'next/image';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useAppState } from '@/hooks/use-app-state';
import { Logo } from '@/components/icons';
import type { MenuItem } from '@/lib/types';
import { PlaceHolderImages } from '@/lib/placeholder-images';
import { Utensils, Waves, Ship } from 'lucide-react';

function MenuItemCard({ item }: { item: MenuItem }) {
  const placeholder = PlaceHolderImages.find(p => p.imageUrl === item.image);
  return (
    <Card className="overflow-hidden transition-all duration-300 hover:shadow-lg hover:shadow-primary/20 flex flex-col">
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
        <CardTitle className="font-headline text-lg">{item.name}</CardTitle>
      </CardHeader>
      <CardContent className="flex-grow">
        <p className="text-sm text-muted-foreground">{item.description}</p>
      </CardContent>
    </Card>
  );
}


export default function HomePage() {
    const { state } = useAppState();
    const featuredItems = state.menuItems.slice(0, 3);

  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Header */}
      <header className="sticky top-0 z-40 w-full border-b bg-background/80 backdrop-blur-sm">
        <div className="container mx-auto flex h-16 items-center justify-between px-4">
          <Link href="/" className="flex items-center gap-2">
            <Logo className="h-8 w-8 text-primary" />
            <h1 className="text-xl font-bold font-headline">Marisquería Online</h1>
          </Link>
          <nav className="flex items-center gap-4">
            <Link href="/menu" passHref>
              <Button variant="ghost">Menú</Button>
            </Link>
            <Link href="/login" passHref>
              <Button variant="outline">Acceso Personal</Button>
            </Link>
          </nav>
        </div>
      </header>

      {/* Hero Section */}
      <main>
        <section className="relative h-[60vh] w-full">
            <Image 
                src="https://images.unsplash.com/photo-1509315811345-672d83ef2fbc?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3NDE5ODJ8MHwxfHNlYXJjaHwxfHxzb2xlJTIwYmVhY2glMjBkaW5pbmcsJTIwcmVzdGF1cmFudHxlbnwwfHx8fDE3NjU1NDQ5NzR8MA&ixlib=rb-4.1.0&q=80&w=1080"
                alt="Restaurante con vista al mar"
                fill
                className="object-cover"
                data-ai-hint="beach restaurant"
                priority
            />
            <div className="absolute inset-0 bg-black/50 flex flex-col items-center justify-center text-center text-white p-4">
                <h2 className="text-5xl md:text-7xl font-bold font-headline drop-shadow-lg">El Sabor Auténtico del Mar</h2>
                <p className="mt-4 max-w-2xl text-lg md:text-xl drop-shadow-md">
                    Una experiencia culinaria que captura la frescura y la tradición de la costa en cada plato.
                </p>
            </div>
        </section>

        {/* Featured Items Section */}
        <section className="py-16 bg-card/50">
            <div className="container mx-auto px-4">
                <div className="text-center mb-12">
                    <h3 className="text-4xl font-bold font-headline">Platos Destacados</h3>
                    <p className="text-muted-foreground mt-2">Una selección de los favoritos de nuestros clientes.</p>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    {featuredItems.map(item => (
                        <MenuItemCard key={item.id} item={item} />
                    ))}
                </div>
                <div className="text-center mt-12">
                   <Link href="/menu" passHref>
                     <Button size="lg">Ver Menú Completo</Button>
                   </Link>
                </div>
            </div>
        </section>

        {/* About Us Section */}
        <section className="py-16">
            <div className="container mx-auto px-4">
                <div className="grid md:grid-cols-2 gap-12 items-center">
                    <div>
                        <h3 className="text-4xl font-bold font-headline">Nuestra Historia</h3>
                        <p className="text-muted-foreground mt-4 leading-relaxed">
                            Desde 1998, Marisquería Online ha sido un rincón de tradición y sabor. Nacimos de la pasión de una familia de pescadores por compartir la riqueza del océano, transformando ingredientes frescos en platos memorables. Cada receta cuenta una historia, cada sabor es un viaje a la costa.
                        </p>
                        <div className="mt-8 flex gap-8">
                            <div className="flex items-center gap-3">
                                <Waves className="h-8 w-8 text-primary" />
                                <div>
                                    <h4 className="font-bold">Ingredientes Frescos</h4>
                                    <p className="text-sm text-muted-foreground">Directo del mar a tu mesa.</p>
                                </div>
                            </div>
                             <div className="flex items-center gap-3">
                                <Ship className="h-8 w-8 text-primary" />
                                <div>
                                    <h4 className="font-bold">Tradición Familiar</h4>
                                    <p className="text-sm text-muted-foreground">Recetas pasadas por generaciones.</p>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div className="relative h-80 rounded-lg overflow-hidden shadow-xl">
                        <Image 
                            src="https://images.unsplash.com/photo-1540422588095-23c7c223616a?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3NDE5ODJ8MHwxfHNlYXJjaHw0fHxmaXNoaW5nJTIwdmlsbGFnZXxlbnwwfHx8fDE3NjU1NDUwMDZ8MA&ixlib=rb-4.1.0&q=80&w=1080" 
                            alt="Pueblo pesquero tradicional"
                            fill
                            className="object-cover"
                            data-ai-hint="fishing village"
                        />
                    </div>
                </div>
            </div>
        </section>
      </main>

       {/* Footer */}
      <footer className="bg-secondary/50 py-8">
        <div className="container mx-auto px-4 text-center text-muted-foreground">
            <p>&copy; {new Date().getFullYear()} Marisquería Online. Todos los derechos reservados.</p>
            <p className="mt-2 text-sm">Av. del Mar 123, Playa Hermosa | Tel: (123) 456-7890</p>
        </div>
      </footer>
    </div>
  );
}
