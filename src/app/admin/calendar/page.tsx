"use client";

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useAppState } from '@/hooks/use-app-state';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { CalendarDays, PlusCircle, Trash2 } from 'lucide-react';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar as CalendarComponent } from '@/components/ui/calendar';
import { cn } from '@/lib/utils';
import { format, isSameDay } from 'date-fns';
import { es } from 'date-fns/locale';
import type { CalendarEvent } from '@/lib/types';

const eventSchema = z.object({
  title: z.string().min(3, "El título debe tener al menos 3 caracteres."),
  description: z.string().optional(),
  date: z.date({
    required_error: "La fecha es requerida.",
  }),
  time: z.string().regex(/^([01]\d|2[0-3]):([0-5]\d)$/, "Formato de hora inválido (HH:mm)."),
});

export default function CalendarPage() {
  const { state, dispatch } = useAppState();
  const { toast } = useToast();
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date());

  const form = useForm<z.infer<typeof eventSchema>>({
    resolver: zodResolver(eventSchema),
    defaultValues: {
      title: '',
      description: '',
      date: new Date(),
      time: '12:00',
    },
  });

  const onSubmit = (data: z.infer<typeof eventSchema>) => {
    const newEvent: CalendarEvent = {
        id: `event-${Date.now()}`,
        ...data,
    };
    dispatch({ type: 'ADD_EVENT', payload: newEvent });
    toast({
        title: "Evento Guardado",
        description: "Tu nuevo evento ha sido añadido al calendario.",
    });
    form.reset({ title: '', description: '', date: new Date(), time: '12:00' });
  };
  
  const upcomingEvents = state.calendarEvents
    .filter(event => new Date(event.date) >= new Date())
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());


  return (
    <div className="space-y-6">
        <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
                <CalendarDays className="h-8 w-8 text-primary" />
                <div>
                <h1 className="text-3xl font-bold font-headline">Calendario de Eventos</h1>
                <p className="text-muted-foreground">Organiza tus actividades y recordatorios importantes.</p>
                </div>
            </div>
        </div>


      <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
        <div className="md:col-span-1">
          <Card>
            <CardHeader>
              <CardTitle>Añadir Evento</CardTitle>
              <CardDescription>Crea un nuevo evento o recordatorio.</CardDescription>
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
                        <FormControl><Input {...field} placeholder="Ej: Reunión con proveedores" /></FormControl>
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
                        <FormControl><Textarea {...field} placeholder="Detalles sobre el evento..." rows={3} /></FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                   <div className="grid grid-cols-2 gap-4">
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
                                        <CalendarDays className="ml-auto h-4 w-4 opacity-50" />
                                        </Button>
                                    </FormControl>
                                    </PopoverTrigger>
                                    <PopoverContent className="w-auto p-0" align="start">
                                    <CalendarComponent
                                        mode="single"
                                        selected={field.value}
                                        onSelect={field.onChange}
                                        disabled={(date) => date < new Date(new Date().setHours(0,0,0,0))}
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
                            name="time"
                            render={({ field }) => (
                                <FormItem>
                                <FormLabel>Hora</FormLabel>
                                <FormControl><Input type="time" {...field} /></FormControl>
                                <FormMessage />
                                </FormItem>
                            )}
                        />
                   </div>
                  <Button type="submit" className="w-full">
                    <PlusCircle className="mr-2 h-4 w-4" />
                    Guardar Evento
                  </Button>
                </form>
              </Form>
            </CardContent>
          </Card>
        </div>

        <div className="md:col-span-2">
           <Card>
                <CardHeader>
                    <CardTitle>Próximos Eventos</CardTitle>
                </CardHeader>
                <CardContent>
                     {upcomingEvents.length > 0 ? (
                        <div className="space-y-4">
                            {upcomingEvents.map(event => (
                                <div key={event.id} className="flex items-start justify-between p-3 rounded-lg border bg-muted/50">
                                    <div className="flex items-center gap-4">
                                        <div className="flex flex-col items-center justify-center bg-primary text-primary-foreground rounded-md p-2 w-16">
                                            <span className="text-sm font-bold uppercase">{format(new Date(event.date), 'MMM', { locale: es })}</span>
                                            <span className="text-2xl font-bold">{format(new Date(event.date), 'dd')}</span>
                                        </div>
                                        <div>
                                            <h4 className="font-semibold">{event.title}</h4>
                                            <p className="text-sm text-muted-foreground">{event.time} - {event.description}</p>
                                        </div>
                                    </div>
                                     <Button variant="ghost" size="icon" onClick={() => dispatch({type: 'REMOVE_EVENT', payload: { eventId: event.id }})}>
                                        <Trash2 className="h-4 w-4 text-destructive" />
                                    </Button>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="text-center py-16 border-2 border-dashed rounded-lg">
                            <p className="text-muted-foreground">No tienes eventos programados.</p>
                        </div>
                    )}
                </CardContent>
           </Card>
        </div>
      </div>
    </div>
  );
}
