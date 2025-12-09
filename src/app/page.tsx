
"use client";

import Image from 'next/image';
import Link from 'next/link';
import Autoplay from "embla-carousel-autoplay";

import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from "@/components/ui/carousel";
import { useAppState } from '@/hooks/use-app-state';
import { Logo } from '@/components/icons';
import type { MenuItem } from '@/lib/types';
import { PlaceHolderImages } from '@/lib/placeholder-images';

function MenuItemCarouselCard({ item }: { item: MenuItem }) {
  const placeholder = PlaceHolderImages.find(p => p.imageUrl === item.image);
  return (
    <div className="relative h-full w-full">
      <Image
        src={item.image}
        alt={item.name}
        fill
        className="object-cover"
        data-ai-hint={placeholder?.imageHint}
        sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
      />
      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent"></div>
      <div className="absolute bottom-0 left-0 p-6 text-white">
          <h3 className="text-2xl font-bold font-headline">{item.name}</h3>
          <p className="text-sm text-white/90 line-clamp-2">{item.description}</p>
          <p className="mt-2 text-xl font-bold text-primary">${item.price.toFixed(2)}</p>
      </div>
    </div>
  );
}

export default function HomePage() {
  const { state } = useAppState();
  const allAvailableItems = state.menuItems.filter(item => item.stock > 0);

  const categoriesInOrder: MenuItem['category'][] = ['Platos Fuertes', 'Entradas', 'Platos a la Carta', 'Bebidas', 'Postres'];
  
  const menuByCategory = categoriesInOrder.reduce((acc, category) => {
    const items = state.menuItems.filter(item => item.category === category && item.stock > 0);
    if (items.length > 0) {
      acc[category] = items;
    }
    return acc;
  }, {} as Record<MenuItem['category'], MenuItem[]>);

  return (
    <div className="min-h-screen bg-background text-foreground">
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

      <main>
        <section className="relative h-[70vh] w-full">
            <Image 
                src="https://images.unsplash.com/photo-1509315811345-672d83ef2fbc?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3NDE5ODJ8MHwxfHNlYXJjaHwxfHxzb2xlJTIwYmVhY2glMjBkaW5pbmcsJTIwcmVzdGF1cmFudHxlbnwwfHx8fDE3NjU1NDQ5NzR8MA&ixlib=rb-4.1.0&q=80&w=1080"
                alt="Restaurante con vista al mar"
                fill
                className="object-cover"
                data-ai-hint="beach restaurant"
                priority
            />
            <div className="absolute inset-0 bg-black/60 flex flex-col items-center justify-center text-center text-white p-4">
                <h2 className="text-5xl md:text-7xl font-bold font-headline drop-shadow-lg animate-fade-in-down" style={{animation: 'fade-in-down 1s ease-out forwards'}}>El Sabor Auténtico del Mar</h2>
                <p className="mt-4 max-w-2xl text-lg md:text-xl drop-shadow-md animate-fade-in-up" style={{animation: 'fade-in-up 1s ease-out 0.5s forwards', opacity: 0}}>
                    Una experiencia culinaria que captura la frescura y la tradición de la costa en cada plato.
                </p>
                 <div className="mt-8" style={{animation: 'fade-in-up 1s ease-out 1s forwards', opacity: 0}}>
                   <Link href="/menu" passHref>
                     <Button size="lg" className="text-lg">Ver Menú Completo</Button>
                   </Link>
                </div>
            </div>
        </section>

        <section className="py-16">
            <div className="container mx-auto px-4 space-y-16">

              {allAvailableItems.length > 0 && (
                <div>
                  <div className="text-center mb-10">
                      <h3 className="text-4xl font-bold font-headline">Platos Destacados</h3>
                      <p className="text-muted-foreground mt-2 max-w-2xl mx-auto">Una selección de nuestros mejores platos, combinando tradición e innovación en cada bocado.</p>
                  </div>
                  <Carousel 
                      opts={{ loop: true, align: 'start' }} 
                      plugins={[Autoplay({ delay: 4000, stopOnInteraction: true })]}
                      className="w-full"
                  >
                      <CarouselContent className="-ml-4">
                          {allAvailableItems.map(item => (
                              <CarouselItem key={item.id} className="md:basis-1/2 lg:basis-1/3 pl-4">
                                   <Card className="overflow-hidden h-96 group">
                                      <MenuItemCarouselCard item={item} />
                                   </Card>
                              </CarouselItem>
                          ))}
                      </CarouselContent>
                      <CarouselPrevious className="absolute left-[-1rem] top-1/2 -translate-y-1/2 z-10" />
                      <CarouselNext className="absolute right-[-1rem] top-1/2 -translate-y-1/2 z-10" />
                  </Carousel>
                </div>
              )}
            
              {Object.entries(menuByCategory).map(([category, items]) => (
                <div key={category}>
                    <div className="text-center mb-10">
                        <h3 className="text-3xl font-bold font-headline">{category}</h3>
                    </div>
                    <Carousel 
                        opts={{ loop: items.length > 3, align: 'start' }} 
                        plugins={[Autoplay({ delay: 5000, stopOnInteraction: true })]}
                        className="w-full"
                    >
                        <CarouselContent className="-ml-4">
                            {items.map(item => (
                                <CarouselItem key={item.id} className="md:basis-1/2 lg:basis-1/3 pl-4">
                                     <Card className="overflow-hidden h-96 group">
                                        <MenuItemCarouselCard item={item} />
                                     </Card>
                                </CarouselItem>
                            ))}
                        </CarouselContent>
                         <CarouselPrevious className="absolute left-[-1rem] top-1/2 -translate-y-1/2 z-10" />
                         <CarouselNext className="absolute right-[-1rem] top-1/2 -translate-y-1/2 z-10" />
                    </Carousel>
                </div>
              ))}
            </div>
        </section>
      </main>

       <footer className="bg-secondary py-8">
        <div className="container mx-auto px-4 text-center text-muted-foreground">
            <p>&copy; {new Date().getFullYear()} Marisquería Online. Todos los derechos reservados.</p>
            <p className="mt-2 text-sm">Av. del Mar 123, Playa Hermosa | Tel: (123) 456-7890</p>
        </div>
      </footer>
    </div>
  );
}
