"use client";

import { useState } from 'react';
import { useForm, useFieldArray } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useAppState } from '@/hooks/use-app-state';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { useToast } from '@/hooks/use-toast';
import { Utensils, PlusCircle, Trash2, Upload, Save } from 'lucide-react';
import Image from 'next/image';
import type { MenuItem } from '@/lib/types';

const menuItemSchema = z.object({
  id: z.string().optional(),
  name: z.string().min(3, "El nombre debe tener al menos 3 caracteres."),
  description: z.string().min(10, "La descripción debe tener al menos 10 caracteres."),
  price: z.preprocess(
    (a) => parseFloat(z.string().parse(a)),
    z.number().positive("El precio debe ser un número positivo.")
  ),
  category: z.enum(['Entradas', 'Platos Fuertes', 'Bebidas', 'Postres']),
  stock: z.preprocess(
    (a) => parseInt(z.string().parse(a), 10),
    z.number().min(0, "El stock no puede ser negativo.")
  ),
  image: z.string().url("Se requiere una URL de imagen válida."),
  published: z.boolean().default(true),
});

const menuFormSchema = z.object({
  menuItems: z.array(menuItemSchema),
});

export default function MenuEditorPage() {
  const { state, dispatch } = useAppState();
  const { toast } = useToast();

  const form = useForm<z.infer<typeof menuFormSchema>>({
    resolver: zodResolver(menuFormSchema),
    defaultValues: {
      menuItems: state.menuItems.map(item => ({...item, published: item.stock > 0})),
    },
  });

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "menuItems",
  });

  const onSubmit = (data: z.infer<typeof menuFormSchema>) => {
    data.menuItems.forEach(itemData => {
        const payload = {
            ...itemData,
            stock: itemData.published ? (itemData.stock > 0 ? itemData.stock : 10) : 0
        };
        dispatch({ type: 'UPDATE_MENU_ITEM', payload });
    })
    toast({
      title: "Menú Actualizado",
      description: "Los cambios en el menú han sido guardados.",
    });
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>, index: number) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const dataUrl = reader.result as string;
        form.setValue(`menuItems.${index}.image`, dataUrl, { shouldValidate: true });
      };
      reader.readAsDataURL(file);
    }
  };

  const addNewDish = () => {
    append({
        id: `new-${Date.now()}`,
        name: '',
        description: '',
        price: 0,
        category: 'Platos Fuertes',
        stock: 10,
        image: 'https://picsum.photos/seed/placeholder/600/400',
        published: true,
    })
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
            <Utensils className="h-8 w-8 text-primary" />
            <div>
                <h1 className="text-3xl font-bold font-headline">Editor del Menú</h1>
                <p className="text-muted-foreground">Añade, edita y gestiona los platos de tu restaurante.</p>
            </div>
        </div>
        <Button onClick={addNewDish}>
            <PlusCircle className="mr-2 h-4 w-4" />
            Añadir Plato
        </Button>
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
          <div className="space-y-6">
            {fields.map((field, index) => (
              <Card key={field.id}>
                <CardHeader>
                    <div className="flex justify-between items-center">
                        <CardTitle>Editando: {form.watch(`menuItems.${index}.name`) || "Nuevo Plato"}</CardTitle>
                        <Button variant="ghost" size="icon" onClick={() => remove(index)}>
                            <Trash2 className="h-4 w-4 text-destructive" />
                        </Button>
                    </div>
                </CardHeader>
                <CardContent className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="space-y-4 md:col-span-1">
                     <FormField
                        control={form.control}
                        name={`menuItems.${index}.image`}
                        render={({ field }) => (
                            <FormItem>
                            <FormLabel>Imagen</FormLabel>
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
                     <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <FormField
                            control={form.control}
                            name={`menuItems.${index}.name`}
                            render={({ field }) => (
                                <FormItem>
                                <FormLabel>Nombre del Plato</FormLabel>
                                <FormControl><Input {...field} /></FormControl>
                                <FormMessage />
                                </FormItem>
                            )}
                        />
                        <FormField
                            control={form.control}
                            name={`menuItems.${index}.price`}
                            render={({ field }) => (
                                <FormItem>
                                <FormLabel>Precio</FormLabel>
                                <FormControl><Input type="number" step="0.01" {...field} /></FormControl>
                                <FormMessage />
                                </FormItem>
                            )}
                        />
                     </div>
                     <FormField
                        control={form.control}
                        name={`menuItems.${index}.description`}
                        render={({ field }) => (
                            <FormItem>
                            <FormLabel>Descripción</FormLabel>
                            <FormControl><Textarea {...field} /></FormControl>
                            <FormMessage />
                            </FormItem>
                        )}
                        />
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                        <FormField
                            control={form.control}
                            name={`menuItems.${index}.category`}
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Categoría</FormLabel>
                                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                                    <FormControl>
                                        <SelectTrigger><SelectValue placeholder="Seleccione categoría" /></SelectTrigger>
                                    </FormControl>
                                    <SelectContent>
                                        <SelectItem value="Entradas">Entradas</SelectItem>
                                        <SelectItem value="Platos Fuertes">Platos Fuertes</SelectItem>
                                        <SelectItem value="Bebidas">Bebidas</SelectItem>
                                        <SelectItem value="Postres">Postres</SelectItem>
                                    </SelectContent>
                                    </Select>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <FormField
                            control={form.control}
                            name={`menuItems.${index}.stock`}
                            render={({ field }) => (
                                <FormItem>
                                <FormLabel>Stock Inicial</FormLabel>
                                <FormControl><Input type="number" {...field} /></FormControl>
                                <FormMessage />
                                </FormItem>
                            )}
                        />
                         <FormField
                            control={form.control}
                            name={`menuItems.${index}.published`}
                            render={({ field }) => (
                                <FormItem className="flex flex-col pt-2">
                                <FormLabel>Publicado</FormLabel>
                                <FormControl>
                                    <div className="flex items-center space-x-2 pt-2">
                                        <Switch
                                            checked={field.value}
                                            onCheckedChange={field.onChange}
                                        />
                                        <span>{field.value ? "Visible" : "Oculto"}</span>
                                    </div>
                                </FormControl>
                                <FormMessage />
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
