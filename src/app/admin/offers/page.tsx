
"use client";

import { useForm, useFieldArray } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useAppState } from '@/hooks/use-app-state';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { useToast } from '@/hooks/use-toast';
import { Tag, PlusCircle, Trash2, Save } from 'lucide-react';
import Image from 'next/image';
import type { Offer } from '@/lib/types';

const offerSchema = z.object({
  id: z.string().optional(),
  title: z.string().min(5, "El título debe tener al menos 5 caracteres."),
  description: z.string().min(10, "La descripción debe tener al menos 10 caracteres."),
  image: z.string().url("Se requiere una URL de imagen válida."),
  published: z.boolean().default(true),
});

const offersFormSchema = z.object({
  offers: z.array(offerSchema),
});

export default function OffersPage() {
  const { state, dispatch } = useAppState();
  const { toast } = useToast();

  const form = useForm<z.infer<typeof offersFormSchema>>({
    resolver: zodResolver(offersFormSchema),
    defaultValues: {
      offers: state.offers,
    },
  });

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "offers",
  });

  const onSubmit = (data: z.infer<typeof offersFormSchema>) => {
    data.offers.forEach(offerData => {
        dispatch({ type: 'UPDATE_OFFER', payload: offerData as Offer });
    })
    toast({
      title: "Ofertas Actualizadas",
      description: "Los cambios en las ofertas han sido guardados.",
    });
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>, index: number) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const dataUrl = reader.result as string;
        form.setValue(`offers.${index}.image`, dataUrl, { shouldValidate: true });
      };
      reader.readAsDataURL(file);
    }
  };

  const addNewOffer = () => {
    append({
        id: `new-offer-${Date.now()}`,
        title: '',
        description: '',
        image: 'https://picsum.photos/seed/offer-placeholder/600/400',
        published: true,
    })
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
            <Tag className="h-8 w-8 text-primary" />
            <div>
                <h1 className="text-3xl font-bold font-headline">Gestor de Ofertas</h1>
                <p className="text-muted-foreground">Crea y administra las promociones especiales.</p>
            </div>
        </div>
        <Button onClick={addNewOffer}>
            <PlusCircle className="mr-2 h-4 w-4" />
            Añadir Oferta
        </Button>
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
          <div className="space-y-6">
            {fields.map((field, index) => (
              <Card key={field.id}>
                <CardHeader>
                    <div className="flex justify-between items-center">
                        <CardTitle>Editando: {form.watch(`offers.${index}.title`) || "Nueva Oferta"}</CardTitle>
                        <Button variant="ghost" size="icon" onClick={() => remove(index)}>
                            <Trash2 className="h-4 w-4 text-destructive" />
                        </Button>
                    </div>
                </CardHeader>
                <CardContent className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="space-y-4 md:col-span-1">
                     <FormField
                        control={form.control}
                        name={`offers.${index}.image`}
                        render={({ field }) => (
                            <FormItem>
                            <FormLabel>Imagen de la Oferta</FormLabel>
                            <FormControl>
                                <div>
                                    <Image src={field.value} alt="preview" width={300} height={200} className="rounded-md object-cover aspect-video mb-2" />
                                    <Input type="file" accept="image/*" onChange={(e) => handleImageUpload(e, index)} />
                                </div>
                            </FormControl>
                            <FormMessage />
                            </FormItem>
                        )}
                        />
                  </div>
                  <div className="space-y-4 md:col-span-2">
                    <FormField
                        control={form.control}
                        name={`offers.${index}.title`}
                        render={({ field }) => (
                            <FormItem>
                            <FormLabel>Título de la Oferta</FormLabel>
                            <FormControl><Input {...field} /></FormControl>
                            <FormMessage />
                            </FormItem>
                        )}
                    />
                     <FormField
                        control={form.control}
                        name={`offers.${index}.description`}
                        render={({ field }) => (
                            <FormItem>
                            <FormLabel>Descripción</FormLabel>
                            <FormControl><Textarea {...field} /></FormControl>
                            <FormMessage />
                            </FormItem>
                        )}
                        />
                    <div className="flex items-center space-x-4 pt-4">
                         <FormField
                            control={form.control}
                            name={`offers.${index}.published`}
                            render={({ field }) => (
                                <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3 shadow-sm">
                                  <div className="space-y-0.5 mr-4">
                                      <FormLabel>Publicado</FormLabel>
                                      <p className="text-xs text-muted-foreground">
                                        {field.value ? "La oferta será visible para los clientes." : "La oferta estará oculta."}
                                      </p>
                                  </div>
                                  <FormControl>
                                    <Switch checked={field.value} onCheckedChange={field.onChange} />
                                  </FormControl>
                                </FormItem>
                            )}
                        />
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          <div className="flex justify-end">
            <Button type="submit">
                <Save className="mr-2 h-4 w-4" />
                Guardar Cambios
            </Button>
          </div>
        </form>
      </Form>
    </div>
  );
}
