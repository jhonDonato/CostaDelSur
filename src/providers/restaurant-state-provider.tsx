

"use client";

import type { ReactNode } from 'react';
import { createContext, useState, useReducer, useEffect, useCallback } from 'react';
import type { Order, Table, MenuItem, Notification, TableStatus, OrderItem, Offer, Note, CalendarEvent } from '@/lib/types';
import { tables as initialTables, menuItems as initialMenuItems, initialOrders, offers as initialOffers, initialNotes, initialCalendarEvents } from '@/lib/data';
import { textToSpeech } from '@/ai/flows/text-to-speech-flow';
import { differenceInCalendarDays } from 'date-fns';
import { useToast } from '@/hooks/use-toast';

type RestaurantState = {
  tables: Table[];
  menuItems: MenuItem[];
  orders: Order[];
  notifications: Notification[];
  offers: Offer[];
  notes: Note[];
  calendarEvents: CalendarEvent[];
};

type Action =
  | { type: 'CALL_WAITER'; payload: { tableId: number } }
  | { type: 'UPDATE_TABLE_STATUS'; payload: { tableId: number; status: TableStatus, orderId?: string | null } }
  | { type: 'CREATE_ORDER'; payload: { tableId: number; items: OrderItem[]; estimatedDeliveryTime: number } }
  | { type: 'UPDATE_ORDER_STATUS'; payload: { orderId: string; status: Order['status'] } }
  | { type: 'UPDATE_STOCK'; payload: { menuItemId: string; newStock: number } }
  | { type: 'DISMISS_NOTIFICATION'; payload: { notificationId: string } }
  | { type: 'UPDATE_MENU_ITEM'; payload: { menuItems: MenuItem[] } }
  | { type: 'UPDATE_OFFER'; payload: { offers: Offer[] } }
  | { type: 'ADD_NOTIFICATION'; payload: Notification }
  | { type: 'SET_ORDER_TIMER'; payload: { orderId: string, timerId: number } }
  | { type: 'ADD_NOTE', payload: Note }
  | { type: 'REMOVE_NOTE', payload: { noteId: string } }
  | { type: 'ADD_EVENT', payload: CalendarEvent }
  | { type: 'REMOVE_EVENT', payload: { eventId: string } }
  | { type: 'ADD_TABLE' }
  | { type: 'REMOVE_TABLE' }
  | { type: 'EDIT_ORDER'; payload: { orderId: string; newItems: OrderItem[] } }
  | { type: 'CANCEL_ORDER'; payload: { orderId: string } };

const createReducer = (toast: (options: { title: string, description: string, variant?: 'default' | 'destructive' }) => void) => (state: RestaurantState, action: Action): RestaurantState => {
  switch (action.type) {
    case 'ADD_NOTIFICATION':
        // Ensure no duplicate notifications are added
        if (state.notifications.some(n => n.id === action.payload.id)) {
            return state;
        }
        return {
            ...state,
            notifications: [action.payload, ...state.notifications],
        };
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
            tables: state.tables.map(t => 
                t.id === action.payload.tableId 
                ? {...t, status: action.payload.status, orderId: action.payload.orderId === null ? undefined : (action.payload.orderId || t.orderId)} 
                : t)
        }
    }
    case 'CREATE_ORDER': {
      const newOrder: Order = {
        id: `order-${Date.now()}`,
        tableId: action.payload.tableId,
        items: action.payload.items,
        status: 'pending',
        createdAt: Date.now(),
        lastUpdatedAt: Date.now(),
        estimatedDeliveryTime: action.payload.estimatedDeliveryTime,
      };
      const newTables = state.tables.map(table =>
          table.id === action.payload.tableId ? { ...table, status: 'occupied', orderId: newOrder.id } : table
      );
      
      const newMenuItems = state.menuItems.map(menuItem => {
        const orderItem = action.payload.items.find(i => i.menuItemId === menuItem.id);
        if (orderItem) {
          return { ...menuItem, stock: menuItem.stock - orderItem.quantity };
        }
        return menuItem;
      });

      return {
        ...state,
        orders: [newOrder, ...state.orders],
        tables: newTables,
        menuItems: newMenuItems,
      };
    }
    case 'UPDATE_ORDER_STATUS': {
      let newNotifications = state.notifications;
      const orderIndex = state.orders.findIndex(o => o.id === action.payload.orderId);

      if (orderIndex === -1) return state;

      const order = state.orders[orderIndex];

      if (action.payload.status === 'ready' && order) {
        const notifId = `notif-ready-${order.id}`;
         if (!state.notifications.some(n => n.id === notifId)) {
            newNotifications = [{
              id: notifId,
              message: `El pedido de la Mesa ${order.tableId} está listo para entregar.`,
              type: 'order-ready',
              tableId: order.tableId,
              timestamp: Date.now(),
              read: false,
            }, ...state.notifications];
         }
      }
      
      if(action.payload.status === 'delivered' && order) {
          if (order.deliveryTimerId) {
            clearTimeout(order.deliveryTimerId);
          }
      }
      
      if(action.payload.status === 'cancelled' && order){
          // Return stock to inventory
          const newMenuItems = state.menuItems.map(menuItem => {
            const orderItem = order.items.find(i => i.menuItemId === menuItem.id);
            if (orderItem) {
                return { ...menuItem, stock: menuItem.stock + orderItem.quantity };
            }
            return menuItem;
          });
          const newTables = state.tables.map(t => t.id === order.tableId ? { ...t, status: 'free', orderId: undefined } : t);

          const updatedOrders = state.orders.filter(o => o.id !== action.payload.orderId);
          
          return {
              ...state,
              menuItems: newMenuItems,
              tables: newTables,
              orders: updatedOrders,
          };
      }


      const updatedOrders = state.orders.map(o =>
          o.id === action.payload.orderId ? { ...o, status: action.payload.status, deliveryTimerId: action.payload.status === 'delivered' ? undefined : o.deliveryTimerId } : o
        );

      return {
        ...state,
        orders: updatedOrders,
        notifications: newNotifications,
      };
    }
    case 'UPDATE_STOCK': {
        let newNotifications = state.notifications;
        const menuItem = state.menuItems.find(item => item.id === action.payload.menuItemId);
        if (menuItem && action.payload.newStock > 0 && action.payload.newStock <= 5) {
             const notifId = `notif-stock-${menuItem.id}`;
             if (!state.notifications.some(n => n.id === notifId)) {
                newNotifications = [{
                    id: notifId,
                    message: `Alerta de inventario. Quedan ${action.payload.newStock} unidades de ${menuItem.name}.`,
                    type: 'low-stock',
                    timestamp: Date.now(),
                    read: false,
                }, ...state.notifications];
             }
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
    case 'UPDATE_MENU_ITEM': {
       return { ...state, menuItems: action.payload.menuItems };
    }
     case 'UPDATE_OFFER': {
        return { ...state, offers: action.payload.offers };
    }
    case 'SET_ORDER_TIMER':
        return {
            ...state,
            orders: state.orders.map(o => o.id === action.payload.orderId ? { ...o, deliveryTimerId: action.payload.timerId } : o)
        };
    case 'ADD_NOTE':
        return {
            ...state,
            notes: [action.payload, ...state.notes]
        };
    case 'REMOVE_NOTE':
        return {
            ...state,
            notes: state.notes.filter(n => n.id !== action.payload.noteId),
        };
    case 'ADD_EVENT':
        return {
            ...state,
            calendarEvents: [...state.calendarEvents, action.payload]
        };
    case 'REMOVE_EVENT':
        return {
            ...state,
            calendarEvents: state.calendarEvents.filter(e => e.id !== action.payload.eventId)
        };
    case 'ADD_TABLE': {
        if (state.tables.length >= 15) {
            toast({
                title: "Límite alcanzado",
                description: "No se pueden agregar más de 15 mesas.",
                variant: "destructive"
            });
            return state;
        }
        const newTableId = state.tables.length > 0 ? Math.max(...state.tables.map(t => t.id)) + 1 : 1;
        const newTable: Table = { id: newTableId, status: 'free' };
        return {
            ...state,
            tables: [...state.tables, newTable],
        };
    }
    case 'REMOVE_TABLE': {
        if (state.tables.length <= 8) {
             toast({
                title: "Límite alcanzado",
                description: "No se pueden tener menos de 8 mesas.",
                variant: "destructive"
            });
            return state;
        }
        const tableToRemove = state.tables[state.tables.length - 1];
        if (tableToRemove.status !== 'free') {
            toast({
                title: "Acción no permitida",
                description: "No se puede eliminar una mesa que está ocupada o requiere atención.",
                variant: "destructive"
            });
            return state;
        }
        return {
            ...state,
            tables: state.tables.slice(0, -1),
        };
    }
     case 'EDIT_ORDER': {
      const { orderId, newItems } = action.payload;
      const orderIndex = state.orders.findIndex((o) => o.id === orderId);
      if (orderIndex === -1) return state;

      const originalOrder = state.orders[orderIndex];
      if (originalOrder.status !== 'pending') {
        toast({ title: "Error", description: "Solo se pueden editar pedidos pendientes.", variant: 'destructive' });
        return state;
      }
      
      let currentStock = [...state.menuItems];
      // 1. Return original items to stock
      for (const item of originalOrder.items) {
          const menuItemIndex = currentStock.findIndex(mi => mi.id === item.menuItemId);
          if (menuItemIndex !== -1) {
              currentStock[menuItemIndex] = { ...currentStock[menuItemIndex], stock: currentStock[menuItemIndex].stock + item.quantity };
          }
      }

      // 2. Check if new items are available and deduct them from stock
      let canFulfill = true;
      let updatedStock = [...currentStock];
      for (const item of newItems) {
          const menuItemIndex = updatedStock.findIndex(mi => mi.id === item.menuItemId);
          if (menuItemIndex === -1 || updatedStock[menuItemIndex].stock < item.quantity) {
              canFulfill = false;
              break;
          }
          updatedStock[menuItemIndex] = { ...updatedStock[menuItemIndex], stock: updatedStock[menuItemIndex].stock - item.quantity };
      }

      if (!canFulfill) {
        toast({ title: "Stock Insuficiente", description: "No hay suficiente stock para la nueva orden. No se aplicaron cambios.", variant: "destructive" });
        return state; // Revert stock changes by not updating the state
      }

      // 3. If successful, update order and stock
      const updatedOrders = state.orders.map(o =>
        o.id === orderId ? { ...o, items: newItems, lastUpdatedAt: Date.now() } : o
      );
      
      const newNotification: Notification = {
        id: `notif-edit-${Date.now()}`,
        message: `El pedido de la Mesa ${originalOrder.tableId} fue modificado.`,
        type: 'order-ready', // Using this type for now
        tableId: originalOrder.tableId,
        timestamp: Date.now(),
        read: false,
      };

      return {
        ...state,
        orders: updatedOrders,
        menuItems: updatedStock,
        notifications: [newNotification, ...state.notifications],
      };
    }

    case 'CANCEL_ORDER': {
      const { orderId } = action.payload;
      const orderToCancel = state.orders.find((o) => o.id === orderId);

      if (!orderToCancel) return state;

      // Return stock
      const newMenuItems = state.menuItems.map(menuItem => {
          const orderItem = orderToCancel.items.find(i => i.menuItemId === menuItem.id);
          if (orderItem) {
              return { ...menuItem, stock: menuItem.stock + orderItem.quantity };
          }
          return menuItem;
      });

      // Free up table
      const newTables = state.tables.map(t =>
          t.id === orderToCancel.tableId ? { ...t, status: 'free', orderId: undefined } : t
      );
      
       const newNotification: Notification = {
        id: `notif-cancel-${Date.now()}`,
        message: `El pedido de la Mesa ${orderToCancel.tableId} ha sido cancelado.`,
        type: 'call',
        tableId: orderToCancel.tableId,
        timestamp: Date.now(),
        read: false,
      };

      return {
        ...state,
        orders: state.orders.filter(o => o.id !== orderId),
        menuItems: newMenuItems,
        tables: newTables,
        notifications: [newNotification, ...state.notifications],
      };
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
  offers: initialOffers,
  notes: initialNotes,
  calendarEvents: initialCalendarEvents,
};

export function RestaurantProvider({ children }: { children: ReactNode }) {
  const { toast } = useToast();
  const [state, dispatch] = useReducer(createReducer(toast), initialState);
  const [audioQueue, setAudioQueue] = useState<string[]>([]);
  const [isPlaying, setIsPlaying] = useState(false);
  const [processedNotifications, setProcessedNotifications] = useState<Set<string>>(new Set());

  const playVoiceNotification = useCallback(async (text: string) => {
      try {
          const { media } = await textToSpeech(text);
          if (media) {
              setAudioQueue(prev => [...prev, media]);
          }
      } catch (error) {
          console.error("Error converting text to speech:", error);
      }
  }, []);

  useEffect(() => {
    if (audioQueue.length > 0 && !isPlaying) {
      setIsPlaying(true);
      const audioUrl = audioQueue[0];
      const audio = new Audio(audioUrl);
      audio.play().catch(e => console.error("Audio play failed", e));
      audio.onended = () => {
        setAudioQueue(prev => prev.slice(1));
        setIsPlaying(false);
      };
      audio.onerror = (e) => { 
        console.error("Error playing audio.", e);
        setAudioQueue(prev => prev.slice(1));
        setIsPlaying(false);
      }
    }
  }, [audioQueue, isPlaying]);

  useEffect(() => {
    state.notifications.forEach(n => {
        if (!processedNotifications.has(n.id) && !n.read) {
            playVoiceNotification(n.message);
            setProcessedNotifications(prev => new Set(prev).add(n.id));
        }
    });
  }, [state.notifications, playVoiceNotification, processedNotifications]);
  
  useEffect(() => {
    state.orders.forEach(order => {
        if (order.status === 'preparing' && !order.deliveryTimerId) {
            const timerId = window.setTimeout(() => {
                const notifId = `delivery-due-${order.id}`;
                const newNotification: Notification = {
                    id: notifId,
                    message: `El tiempo de entrega para el pedido de la mesa ${order.tableId} ha expirado.`,
                    type: 'delivery-due',
                    timestamp: Date.now(),
                    read: false,
                    tableId: order.tableId,
                };
                dispatch({ type: 'ADD_NOTIFICATION', payload: newNotification });
            }, order.estimatedDeliveryTime * 60 * 1000);

            dispatch({ type: 'SET_ORDER_TIMER', payload: {orderId: order.id, timerId }});
        }
    });

    return () => {
        state.orders.forEach(order => {
            if (order.deliveryTimerId) {
                clearTimeout(order.deliveryTimerId);
            }
        });
    };
  }, [state.orders]);

  useEffect(() => {
    const checkEvents = () => {
        const now = new Date();
        state.calendarEvents.forEach(event => {
            const eventDate = new Date(event.date);
            const diffDays = differenceInCalendarDays(eventDate, now);

            if (diffDays === 1) { // 1 day before
                const notifId = `event-reminder-${event.id}`;
                if (!state.notifications.some(n => n.id === notifId)) {
                    const newNotification: Notification = {
                        id: notifId,
                        message: `Recordatorio: Mañana es el evento "${event.title}" a las ${event.time}.`,
                        type: 'event-reminder',
                        timestamp: Date.now(),
                        read: false,
                    };
                    dispatch({ type: 'ADD_NOTIFICATION', payload: newNotification });
                }
            }
        });
    };

    checkEvents();
    const intervalId = setInterval(checkEvents, 60 * 60 * 1000); 

    return () => clearInterval(intervalId);
  }, [state.calendarEvents, state.notifications]);

  const getMenuItem = (id: string) => state.menuItems.find(item => item.id === id);
  const getOrderForTable = (tableId: number) => {
    const table = state.tables.find(t => t.id === tableId);
    if (!table || !table.orderId) return undefined;
    return state.orders.find(o => o.id === table.orderId && o.status !== 'cancelled');
  }

  return (
    <RestaurantContext.Provider value={{ state, dispatch, getMenuItem, getOrderForTable }}>
      {children}
    </RestaurantContext.Provider>
  );
}
