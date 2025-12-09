
"use client";

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { format, startOfDay } from 'date-fns';
import { es } from 'date-fns/locale';
import { useAppState } from '@/hooks/use-app-state';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar as CalendarIcon, PlusCircle, Calendar as CalendarComponentIcon } from 'lucide-react';
import { Calendar as CalendarComponent } from '@/components/ui/calendar';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';
import type { CalendarEvent } from '@/lib/types';


const eventSchema = z.object({
  title: z.string().min(3, "El título debe tener al menos 3 caracteres."),
  description: z.string().optional(),
  date: z.date({
    required_error: "Se requiere una fecha para el evento.",
  }),
});

export default function CalendarPage() {
  const { state, dispatch } = useAppState();
  const { toast } = useToast();

  const form = useForm<z.infer<typeof eventSchema>>({
    resolver: zodResolver(eventSchema),
    defaultValues: {
      title: '',
      description: '',
    },
  });

  const onSubmit = (data: z.infer<typeof eventSchema>) => {
    const newEvent: CalendarEvent = {
        id: `event-${Date.now()}`,
        ...data,
    };
    dispatch({ type: 'ADD_CALENDAR_EVENT', payload: newEvent });
    toast({
        title: "Evento Creado",
        description: `El evento "${data.title}" ha sido añadido al calendario.`,
    });
    form.reset();
  };
  
  const futureEvents = state.calendarEvents
    .filter(event => startOfDay(event.date) >= startOfDay(new Date()))
    .sort((a,b) => a.date.getTime() - b.date.getTime());

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <CalendarComponentIcon className="h-8 w-8 text-primary" />
        <div>
          <h1 className="text-3xl font-bold font-headline">Calendario de Actividades</h1>
          <p className="text-muted-foreground">Planifica y visualiza los eventos importantes.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
        <div className="md:col-span-2">
            <Card>
                <CardHeader>
                    <CardTitle>Calendario</CardTitle>
                </CardHeader>
                <CardContent>
                    <CalendarComponent
                        mode="multiple"
                        selected={state.calendarEvents.map(e => e.date)}
                        className="p-0"
                        classNames={{
                            day_selected: "bg-primary text-primary-foreground rounded-full",
                            day: "h-9 w-9 p-0",
                        }}
                        locale={es}
                     />
                </CardContent>
            </Card>
            
            <Card className="mt-8">
                <CardHeader>
                    <CardTitle>Próximos Eventos</CardTitle>
                    <CardDescription>Eventos programados para los siguientes días.</CardDescription>
                </CardHeader>
                <CardContent>
                    {futureEvents.length > 0 ? (
                        <ul className="space-y-4">
                            {futureEvents.map(event => (
                                <li key={event.id} className="flex items-start gap-4">
                                    <div className="flex flex-col items-center justify-center p-2 rounded-md bg-muted text-muted-foreground font-bold">
                                        <span className="text-sm uppercase">{format(event.date, 'MMM', {locale: es})}</span>
                                        <span className="text-xl">{format(event.date, 'dd')}</span>
                                    </div>
                                    <div>
                                        <h4 className="font-semibold">{event.title}</h4>
                                        <p className="text-sm text-muted-foreground">{event.description}</p>
                                    </div>
                                </li>
                            ))}
                        </ul>
                    ) : (
                        <p className="text-sm text-muted-foreground text-center">No hay eventos próximos.</p>
                    )}
                </CardContent>
            </Card>

        </div>
        <div className="md:col-span-1">
          <Card>
            <CardHeader>
              <CardTitle>Añadir Nuevo Evento</CardTitle>
              <CardDescription>Crea un nuevo recordatorio o actividad.</CardDescription>
            </CardHeader>
            <CardContent>
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                  <FormField
                    control={form.control}
                    name="title"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Título del Evento</FormLabel>
                        <FormControl><Input {...field} /></FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="date"
                    render={({ field }) => (
                      <FormItem className="flex flex-col">
                        <FormLabel>Fecha</FormLabel>
                        <Popover>
                            <PopoverTrigger asChild>
                                <FormControl>
                                <Button
                                    variant={"outline"}
                                    className={cn(
                                    "pl-3 text-left font-normal",
                                    !field.value && "text-muted-foreground"
                                    )}
                                >
                                    {field.value ? (
                                    format(field.value, "PPP", { locale: es })
                                    ) : (
                                    <span>Elige una fecha</span>
                                    )}
                                    <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                                </Button>
                                </FormControl>
                            </PopoverTrigger>
                            <PopoverContent className="w-auto p-0" align="start">
                                <CalendarComponent
                                mode="single"
                                selected={field.value}
                                onSelect={field.onChange}
                                disabled={(date) => date < new Date()}
                                initialFocus
                                locale={es}
                                />
                            </PopoverContent>
                        </Popover>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="description"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Descripción (Opcional)</FormLabel>
                        <FormControl><Textarea {...field} /></FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <Button type="submit" className="w-full">
                    <PlusCircle className="mr-2 h-4 w-4" />
                    Guardar Evento
                  </Button>
                </form>
              </Form>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
