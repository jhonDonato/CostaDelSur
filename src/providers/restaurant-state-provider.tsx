"use client";

import type { ReactNode } from 'react';
import { createContext, useState, useReducer, useEffect } from 'react';
import type { Order, Table, MenuItem, Notification, TableStatus, OrderItem } from '@/lib/types';
import { tables as initialTables, menuItems as initialMenuItems, initialOrders } from '@/lib/data';
import NotificationSound from '@/components/notification-sound';

type RestaurantState = {
  tables: Table[];
  menuItems: MenuItem[];
  orders: Order[];
  notifications: Notification[];
};

type Action =
  | { type: 'CALL_WAITER'; payload: { tableId: number } }
  | { type: 'UPDATE_TABLE_STATUS'; payload: { tableId: number; status: TableStatus } }
  | { type: 'CREATE_ORDER'; payload: { tableId: number; items: OrderItem[] } }
  | { type: 'UPDATE_ORDER_STATUS'; payload: { orderId: string; status: Order['status'] } }
  | { type: 'UPDATE_STOCK'; payload: { menuItemId: string; newStock: number } }
  | { type: 'DISMISS_NOTIFICATION'; payload: { notificationId: string } };

const reducer = (state: RestaurantState, action: Action): RestaurantState => {
  switch (action.type) {
    case 'CALL_WAITER': {
      const newNotification: Notification = {
        id: `notif-${Date.now()}`,
        message: `Mesa ${action.payload.tableId} necesita atención!`,
        type: 'call',
        tableId: action.payload.tableId,
        timestamp: Date.now(),
        read: false,
      };
      return {
        ...state,
        notifications: [newNotification, ...state.notifications],
        tables: state.tables.map(table =>
          table.id === action.payload.tableId ? { ...table, status: 'needs-attention' } : table
        ),
      };
    }
    case 'UPDATE_TABLE_STATUS': {
        return {
            ...state,
            tables: state.tables.map(t => t.id === action.payload.tableId ? {...t, status: action.payload.status} : t)
        }
    }
    case 'CREATE_ORDER': {
      const newOrder: Order = {
        id: `order-${Date.now()}`,
        tableId: action.payload.tableId,
        items: action.payload.items,
        status: 'pending',
        createdAt: Date.now(),
      };
      return {
        ...state,
        orders: [newOrder, ...state.orders],
        tables: state.tables.map(table =>
          table.id === action.payload.tableId ? { ...table, status: 'occupied', orderId: newOrder.id } : table
        ),
      };
    }
    case 'UPDATE_ORDER_STATUS': {
      let newNotifications = state.notifications;
      const order = state.orders.find(o => o.id === action.payload.orderId);
      if (action.payload.status === 'ready' && order) {
        newNotifications = [{
          id: `notif-${Date.now()}`,
          message: `Pedido de la Mesa ${order.tableId} está listo!`,
          type: 'order-ready',
          tableId: order.tableId,
          timestamp: Date.now(),
          read: false,
        }, ...state.notifications];
      }
      return {
        ...state,
        orders: state.orders.map(o =>
          o.id === action.payload.orderId ? { ...o, status: action.payload.status } : o
        ),
        notifications: newNotifications,
      };
    }
    case 'UPDATE_STOCK': {
        let newNotifications = state.notifications;
        const menuItem = state.menuItems.find(item => item.id === action.payload.menuItemId);
        if (menuItem && action.payload.newStock > 0 && action.payload.newStock <= 5) {
             newNotifications = [{
                id: `notif-stock-${Date.now()}`,
                message: `Inventario bajo para ${menuItem.name} (${action.payload.newStock} restantes).`,
                type: 'low-stock',
                timestamp: Date.now(),
                read: false,
            }, ...state.notifications];
        }
      return {
        ...state,
        menuItems: state.menuItems.map(item =>
          item.id === action.payload.menuItemId ? { ...item, stock: action.payload.newStock } : item
        ),
        notifications: newNotifications
      };
    }
    case 'DISMISS_NOTIFICATION':
        return {
            ...state,
            notifications: state.notifications.map(n => n.id === action.payload.notificationId ? {...n, read: true} : n)
        }
    default:
      return state;
  }
};


interface RestaurantContextType {
  state: RestaurantState;
  dispatch: React.Dispatch<Action>;
  getMenuItem: (id: string) => MenuItem | undefined;
  getOrderForTable: (tableId: number) => Order | undefined;
}

export const RestaurantContext = createContext<RestaurantContextType | undefined>(undefined);

const initialState: RestaurantState = {
  tables: initialTables,
  menuItems: initialMenuItems,
  orders: initialOrders,
  notifications: [],
};

export function RestaurantProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(reducer, initialState);
  const [playNotification, setPlayNotification] = useState(false);

  useEffect(() => {
    // Check for low stock on initial load
    initialMenuItems.forEach(item => {
        if(item.stock > 0 && item.stock <= 5) {
            dispatch({ type: 'UPDATE_STOCK', payload: { menuItemId: item.id, newStock: item.stock }});
        }
    });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (state.notifications.some(n => !n.read)) {
      setPlayNotification(true);
      const timer = setTimeout(() => setPlayNotification(false), 500);
      return () => clearTimeout(timer);
    }
  }, [state.notifications]);


  const getMenuItem = (id: string) => state.menuItems.find(item => item.id === id);
  const getOrderForTable = (tableId: number) => {
    const table = state.tables.find(t => t.id === tableId);
    if (!table || !table.orderId) return undefined;
    return state.orders.find(o => o.id === table.orderId);
  }

  return (
    <RestaurantContext.Provider value={{ state, dispatch, getMenuItem, getOrderForTable }}>
      {children}
      <NotificationSound play={playNotification} />
    </RestaurantContext.Provider>
  );
}
