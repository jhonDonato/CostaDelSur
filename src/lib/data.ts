

import type { User, MenuItem, Table, Order, Offer, Note } from '@/lib/types';
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
    category: 'Platos a la Carta',
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
    category: 'Platos a la Carta',
  },
  {
    id: '9',
    name: 'Chicha Morada',
    description: 'Jarra de 1 litro de refrescante chicha morada, hecha de maíz morado.',
    price: 15.00,
    image: 'https://picsum.photos/seed/chicha/600/400',
    stock: 30,
    category: 'Bebidas',
  },
  {
    id: '10',
    name: 'Inca Kola',
    description: 'Gaseosa personal de 500ml, la bebida dorada del Perú.',
    price: 5.00,
    image: 'https://picsum.photos/seed/inka/600/400',
    stock: 50,
    category: 'Bebidas',
  },
];

export const offers: Offer[] = [
  {
    id: 'offer-1',
    title: '2x1 en Chilcanos',
    description: 'Todos los jueves, pide un chilcano y llévate el segundo gratis. ¡La mejor manera de empezar el fin de semana!',
    image: 'https://images.unsplash.com/photo-1596231920875-1a06a6c1236c?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3NDE5ODJ8MHwxfHNlYXJjaHwxfHxjaGlsY2Fub3xlbnwwfHx8fDE3NjU4NTg5ODJ8MA&ixlib=rb-4.1.0&q=80&w=1080',
    published: true,
  },
  {
    id: 'offer-2',
    title: 'Gaseosa Gratis',
    description: 'Por la compra de dos platos a la carta, llévate una gaseosa de 1 litro totalmente gratis.',
    image: 'https://images.unsplash.com/photo-1581014122131-b17a3564993a?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3NDE5ODJ8MHwxfHNlYXJjaHwxfHxzb2RhJTIwZmxhc2h8ZW58MHx8fHwxNzY1ODU5MDMyfDA&ixlib=rb-4.1.0&q=80&w=1080',
    published: true,
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

export const initialNotes: Note[] = [
    {
        id: 'note-1',
        title: 'Tareas de Mantenimiento Semanal',
        content: '- Limpieza profunda de la campana extractora.\n- Revisar niveles de gas de los refrigeradores.\n- Afilar cuchillos.',
        createdAt: Date.now() - 3 * 24 * 60 * 60 * 1000
    },
    {
        id: 'note-2',
        title: 'Contacto Proveedores',
        content: '- Pescados Juanito: 987654321\n- Verduras Frescas S.A: 912345678',
        createdAt: Date.now() - 5 * 24 * 60 * 60 * 1000
    }
]

// Associate initial orders with tables
initialOrders.forEach(order => {
  const table = tables.find(t => t.id === order.tableId);
  if(table) {
    table.orderId = order.id;
    table.status = 'occupied';
  }
});
