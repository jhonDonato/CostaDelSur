export type User = {
  id: string;
  name: string;
  username: string;
  role: 'admin' | 'waiter' | 'kitchen';
};

export type MenuItem = {
  id: string;
  name: string;
  description: string;
  price: number;
  image: string;
  stock: number;
  category: 'Entradas' | 'Platos Fuertes' | 'Platos a la Carta' | 'Bebidas' | 'Postres';
};

export type OrderItem = {
  menuItemId: string;
  quantity: number;
};

export type Order = {
  id: string;
  tableId: number;
  items: OrderItem[];
  status: 'pending' | 'preparing' | 'ready' | 'delivered' | 'cancelled';
  createdAt: number;
  estimatedDeliveryTime: number; // in minutes
  deliveryTimerId?: number; // Store timer ID
};

export type TableStatus = 'free' | 'occupied' | 'needs-attention';

export type Table = {
  id: number;
  status: TableStatus;
  orderId?: string;
};

export type Notification = {
  id: string;
  message: string;
  type: 'call' | 'low-stock' | 'order-ready' | 'delivery-due';
  timestamp: number;
  read: boolean;
  tableId?: number;
};
