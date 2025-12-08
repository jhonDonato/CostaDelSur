"use client";

import { useState } from 'react';
import { useAppState } from '@/hooks/use-app-state';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import { useToast } from '@/hooks/use-toast';
import { PackageOpen, Save, X } from 'lucide-react';
import type { MenuItem } from '@/lib/types';

export default function InventoryPage() {
  const { state, dispatch } = useAppState();
  const { toast } = useToast();
  const [editedStocks, setEditedStocks] = useState<Record<string, number | string>>({});

  const handleStockChange = (itemId: string, value: string) => {
    setEditedStocks(prev => ({ ...prev, [itemId]: value }));
  };

  const handleSaveStock = (itemId: string) => {
    const newStockStr = editedStocks[itemId];
    if (newStockStr === undefined || newStockStr === '') return;
    
    const newStock = parseInt(String(newStockStr), 10);
    if (isNaN(newStock) || newStock < 0) {
      toast({
        title: "Error",
        description: "Por favor ingrese un número válido para el stock.",
        variant: "destructive"
      });
      return;
    }

    dispatch({ type: 'UPDATE_STOCK', payload: { menuItemId: itemId, newStock } });
    toast({
      title: "Inventario Actualizado",
      description: `El stock para el ítem ha sido actualizado a ${newStock}.`,
    });
    setEditedStocks(prev => {
      const newState = { ...prev };
      delete newState[itemId];
      return newState;
    });
  };
  
  const handleToggleAvailability = (item: MenuItem) => {
    const currentStock = item.stock;
    const newStock = currentStock > 0 ? 0 : 10; // Simple toggle logic, could be more sophisticated
    
    dispatch({ type: 'UPDATE_STOCK', payload: { menuItemId: item.id, newStock } });
     toast({
      title: "Disponibilidad Cambiada",
      description: `${item.name} ahora está ${newStock > 0 ? 'disponible' : 'no disponible'}.`,
    });
  }

  const cancelEdit = (itemId: string) => {
     setEditedStocks(prev => {
      const newState = { ...prev };
      delete newState[itemId];
      return newState;
    });
  }

  return (
    <div className="space-y-6">
       <div className="flex items-center gap-4">
        <PackageOpen className="h-8 w-8 text-primary" />
        <div>
            <h1 className="text-3xl font-bold font-headline">Gestión de Inventario</h1>
            <p className="text-muted-foreground">Actualiza el stock y la disponibilidad de los platos del menú.</p>
        </div>
      </div>
      <Card>
        <CardHeader>
          <CardTitle>Stock de Platos</CardTitle>
          <CardDescription>El sistema emitirá una alerta de voz cuando el stock de un plato sea igual o inferior a 5.</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Plato</TableHead>
                <TableHead>Stock Actual</TableHead>
                <TableHead>Nuevo Stock</TableHead>
                <TableHead className="text-center">Disponible</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {state.menuItems.map((item) => (
                <TableRow key={item.id}>
                  <TableCell className="font-medium">{item.name}</TableCell>
                  <TableCell>
                    <span className={item.stock <= 5 && item.stock > 0 ? 'text-destructive font-bold' : ''}>
                      {item.stock}
                    </span>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Input
                        type="number"
                        value={editedStocks[item.id] ?? ''}
                        onChange={(e) => handleStockChange(item.id, e.target.value)}
                        className="h-9 w-24"
                        placeholder={String(item.stock)}
                      />
                      {editedStocks[item.id] !== undefined && (
                        <>
                          <Button size="icon" className="h-9 w-9" onClick={() => handleSaveStock(item.id)}>
                            <Save className="h-4 w-4" />
                          </Button>
                           <Button size="icon" variant="ghost" className="h-9 w-9" onClick={() => cancelEdit(item.id)}>
                            <X className="h-4 w-4" />
                          </Button>
                        </>
                      )}
                    </div>
                  </TableCell>
                  <TableCell className="text-center">
                    <Switch
                        checked={item.stock > 0}
                        onCheckedChange={() => handleToggleAvailability(item)}
                        aria-label={`Marcar ${item.name} como ${item.stock > 0 ? 'no disponible' : 'disponible'}`}
                    />
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
