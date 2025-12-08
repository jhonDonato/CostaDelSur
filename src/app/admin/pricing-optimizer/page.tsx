"use client";

import { useState } from 'react';
import { useFlow } from '@genkit-ai/next/client';
import { Sparkles, Bot } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Skeleton } from '@/components/ui/skeleton';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { analyzeSalesDataForPricing, AnalyzeSalesDataForPricingOutput, AnalyzeSalesDataForPricingInput } from '@/ai/flows/analyze-sales-data-for-pricing';

const sampleSalesData: AnalyzeSalesDataForPricingInput['salesData'] = [
    { dishName: "Ceviche Clásico", salesQuantity: 150, revenue: 5250, costOfGoodsSold: 1500 },
    { dishName: "Arroz con Mariscos", salesQuantity: 200, revenue: 9000, costOfGoodsSold: 3000 },
    { dishName: "Pescado Frito Entero", salesQuantity: 100, revenue: 4000, costOfGoodsSold: 1800 },
    { dishName: "Pulpo a la Parrilla", salesQuantity: 80, revenue: 4400, costOfGoodsSold: 2400 },
    { dishName: "Jalea Mixta", salesQuantity: 180, revenue: 10800, costOfGoodsSold: 4500 },
    { dishName: "Choritos a la Chalaca", salesQuantity: 50, revenue: 1400, costOfGoodsSold: 700 },
];

export default function PricingOptimizerPage() {
  const [flow,流] = useFlow(analyzeSalesDataForPricing);
  const [recommendations, setRecommendations] = useState<AnalyzeSalesDataForPricingOutput | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleAnalyze = async () => {
    setIsLoading(true);
    setError(null);
    setRecommendations(null);
    try {
      const result = await flow({ salesData: sampleSalesData });
      setRecommendations(result);
    } catch (e: any) {
      setError("Hubo un error al analizar los datos. Por favor, inténtelo de nuevo más tarde.");
      console.error(e);
    }
    setIsLoading(false);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Sparkles className="h-8 w-8 text-primary" />
        <div>
            <h1 className="text-3xl font-bold font-headline">Optimizador de Precios con IA</h1>
            <p className="text-muted-foreground">Utiliza IA para analizar datos de ventas y encontrar oportunidades de aumento de precios.</p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Análisis de Rentabilidad</CardTitle>
          <CardDescription>
            Presiona el botón para que la IA analice los datos de ventas de muestra e identifique platos con alta rentabilidad
            que podrían beneficiarse de un ligero aumento de precio.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Button onClick={handleAnalyze} disabled={isLoading}>
            <Sparkles className="mr-2 h-4 w-4" />
            {isLoading ? 'Analizando...' : 'Analizar Datos de Ventas'}
          </Button>
        </CardContent>
      </Card>

      {error && (
        <Alert variant="destructive">
          <Bot className="h-4 w-4" />
          <AlertTitle>Error de IA</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {isLoading && <LoadingSkeleton />}
      
      {recommendations && recommendations.recommendations.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Recomendaciones de Precios</CardTitle>
            <CardDescription>La IA ha identificado las siguientes oportunidades para optimizar precios.</CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Plato</TableHead>
                  <TableHead>Precio Actual</TableHead>
                  <TableHead>Precio Sugerido</TableHead>
                  <TableHead>Justificación</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {recommendations.recommendations.map((rec, index) => (
                  <TableRow key={index}>
                    <TableCell className="font-medium">{rec.dishName}</TableCell>
                    <TableCell>${rec.currentPrice.toFixed(2)}</TableCell>
                    <TableCell className="font-bold text-green-600">${rec.suggestedNewPrice.toFixed(2)}</TableCell>
                    <TableCell>{rec.reason}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}

       {recommendations && recommendations.recommendations.length === 0 && (
         <Card>
            <CardContent className="p-6">
                <div className="text-center text-muted-foreground">
                    <p>La IA no encontró oportunidades claras de aumento de precios en este momento.</p>
                </div>
            </CardContent>
         </Card>
      )}
    </div>
  );
}

function LoadingSkeleton() {
    return (
        <Card>
            <CardHeader>
                <Skeleton className="h-6 w-1/2" />
                <Skeleton className="h-4 w-3/4" />
            </CardHeader>
            <CardContent>
                <div className="space-y-2">
                    <Skeleton className="h-10 w-full" />
                    <Skeleton className="h-10 w-full" />
                    <Skeleton className="h-10 w-full" />
                </div>
            </CardContent>
        </Card>
    )
}
