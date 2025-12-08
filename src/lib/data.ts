import type { User, MenuItem, Table, Order } from '@/lib/types';
import { PlaceHolderImages } from './placeholder-images';

const getImage = (id: string) => PlaceHolderImages.find(img => img.id === id)?.imageUrl || '';

export const users: User[] = [
  { id: '1', name: 'Maria', username: 'Maria', role: 'admin' },
  { id: '2', name: 'Jhon', username: 'Jhon', role: 'waiter' },
  { id: '3', name: 'Camila', username: 'Camila', role: 'kitchen' },
];

export const menuItems: MenuItem[] = [
  {
    id: '1',
    name: 'Ceviche Clásico',
    description: 'Trozos de pescado fresco marinados en jugo de limón, ají y cilantro.',
    price: 35.00,
    image: getImage('ceviche'),
    stock: 15,
    category: 'Entradas',
  },
  {
    id: '2',
    name: 'Arroz con Mariscos',
    description: 'Abundante arroz amarillo con una mezcla de mariscos frescos salteados.',
    price: 45.00,
    image: getImage('arroz-con-mariscos'),
    stock: 20,
    category: 'Platos Fuertes',
  },
  {
    id: '3',
    name: 'Pescado Frito Entero',
    description: 'Pescado del día, frito hasta quedar crujiente, servido con yuca y ensalada.',
    price: 40.00,
    image: getImage('pescado-frito'),
    stock: 10,
    category: 'Platos Fuertes',
  },
  {
    id: '4',
    name: 'Pulpo a la Parrilla',
    description: 'Tiernos tentáculos de pulpo a la parrilla con un toque de pimentón y aceite de oliva.',
    price: 55.00,
    image: getImage('pulpo-a-la-parrilla'),
    stock: 8,
    category: 'Platos Fuertes',
  },
  {
    id: '5',
    name: 'Causa de Langostinos',
    description: 'Suave puré de papa amarilla con ají, relleno de langostinos y palta.',
    price: 30.00,
    image: getImage('causa-de-langostinos'),
    stock: 12,
    category: 'Entradas',
  },
  {
    id: '6',
    name: 'Choritos a la Chalaca',
    description: 'Mejillones cubiertos con una fresca salsa de cebolla, tomate y choclo.',
    price: 28.00,
    image: getImage('choritos-a-la-chalaca'),
    stock: 3,
    category: 'Entradas',
  },
  {
    id: '7',
    name: 'Sopa Parihuela',
    description: 'Potente sopa concentrada con una gran variedad de pescados y mariscos.',
    price: 50.00,
    image: getImage('sopa-parihuela'),
    stock: 7,
    category: 'Platos Fuertes',
  },
  {
    id: '8',
    name: 'Jalea Mixta',
    description: 'Trozos de pescado y mariscos fritos y crujientes con salsa tártara y yuca.',
    price: 60.00,
    image: getImage('jalea-mixta'),
    stock: 18,
    category: 'Platos Fuertes',
  },
];

export const tables: Table[] = Array.from({ length: 12 }, (_, i) => ({
  id: i + 1,
  status: i % 3 === 0 ? 'free' : (i % 3 === 1 ? 'occupied' : 'free'),
}));

export const initialOrders: Order[] = [
  { 
    id: 'order-1',
    tableId: 2,
    items: [
      { menuItemId: '1', quantity: 2 },
      { menuItemId: '2', quantity: 1 },
    ],
    status: 'preparing',
    createdAt: Date.now() - 5 * 60 * 1000,
    estimatedDeliveryTime: 15,
  },
  {
    id: 'order-2',
    tableId: 5,
    items: [
      { menuItemId: '4', quantity: 1 },
    ],
    status: 'pending',
    createdAt: Date.now() - 2 * 60 * 1000,
    estimatedDeliveryTime: 10,
  },
  {
    id: 'order-3',
    tableId: 8,
    items: [
      { menuItemId: '7', quantity: 2 },
      { menuItemId: '3', quantity: 2 },
    ],
    status: 'ready',
    createdAt: Date.now() - 10 * 60 * 1000,
    estimatedDeliveryTime: 20,
  },
];

// Associate initial orders with tables
initialOrders.forEach(order => {
  const table = tables.find(t => t.id === order.tableId);
  if(table) {
    table.orderId = order.id;
    table.status = 'occupied';
  }
});
