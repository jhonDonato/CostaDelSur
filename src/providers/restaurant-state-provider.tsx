

"use client";

import type { ReactNode } from 'react';
import { createContext, useState, useReducer, useEffect, useCallback } from 'react';
import type { Order, Table, MenuItem, Notification, TableStatus, OrderItem, Offer, CalendarEvent, Note } from '@/lib/types';
import { tables as initialTables, menuItems as initialMenuItems, initialOrders, offers as initialOffers, initialCalendarEvents, initialNotes } from '@/lib/data';
import { textToSpeech } from '@/ai/flows/text-to-speech-flow';
import { isToday } from 'date-fns';

type RestaurantState = {
  tables: Table[];
  menuItems: MenuItem[];
  orders: Order[];
  notifications: Notification[];
  offers: Offer[];
  calendarEvents: CalendarEvent[];
  notes: Note[];
};

type Action =
  | { type: 'CALL_WAITER'; payload: { tableId: number } }
  | { type: 'UPDATE_TABLE_STATUS'; payload: { tableId: number; status: TableStatus, orderId?: string | null } }
  | { type: 'CREATE_ORDER'; payload: { tableId: number; items: OrderItem[]; estimatedDeliveryTime: number } }
  | { type: 'UPDATE_ORDER_STATUS'; payload: { orderId: string; status: Order['status'] } }
  | { type: 'UPDATE_STOCK'; payload: { menuItemId: string; newStock: number } }
  | { type: 'DISMISS_NOTIFICATION'; payload: { notificationId: string } }
  | { type: 'UPDATE_MENU_ITEM'; payload: Partial<MenuItem> & { id: string } }
  | { type: 'UPDATE_OFFER'; payload: Offer }
  | { type: 'ADD_NOTIFICATION'; payload: Notification }
  | { type: 'SET_ORDER_TIMER'; payload: { orderId: string, timerId: number } }
  | { type: 'ADD_CALENDAR_EVENT', payload: CalendarEvent }
  | { type: 'ADD_NOTE', payload: Note };

const reducer = (state: RestaurantState, action: Action): RestaurantState => {
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
        estimatedDeliveryTime: action.payload.estimatedDeliveryTime,
      };
      // When a new order is created, also clear the orderId from the table if it was occupied
      const newTables = state.tables.map(table =>
          table.id === action.payload.tableId ? { ...table, status: 'occupied', orderId: newOrder.id } : table
      );

      return {
        ...state,
        orders: [newOrder, ...state.orders],
        tables: newTables
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
      
      // When order is delivered, clear its delivery timer
      if(action.payload.status === 'delivered' && order) {
          if (order.deliveryTimerId) {
            clearTimeout(order.deliveryTimerId);
          }
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
             // Avoid duplicate low stock notification
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
        const { id, ...data } = action.payload;
        const exists = state.menuItems.some(item => item.id === id);
        if (exists) {
            return {
                ...state,
                menuItems: state.menuItems.map(item =>
                    item.id === id ? { ...item, ...data } : item
                ),
            };
        } else {
            // This is a new item
            const newItem: MenuItem = {
              id,
              name: data.name || '',
              description: data.description || '',
              price: data.price || 0,
              category: data.category || 'Platos Fuertes',
              stock: data.stock || 0,
              image: data.image || ''
            };
            return {
                ...state,
                menuItems: [...state.menuItems, newItem],
            };
        }
    }
     case 'UPDATE_OFFER': {
        const { id, ...data } = action.payload;
        const exists = state.offers.some(offer => offer.id === id);
        if (exists) {
            return {
                ...state,
                offers: state.offers.map(offer =>
                    offer.id === id ? { ...offer, ...data } : offer
                ),
            };
        }
        return { // Add new offer
            ...state,
            offers: [...state.offers, action.payload],
        };
    }
    case 'SET_ORDER_TIMER':
        return {
            ...state,
            orders: state.orders.map(o => o.id === action.payload.orderId ? { ...o, deliveryTimerId: action.payload.timerId } : o)
        };
    case 'ADD_CALENDAR_EVENT':
        return {
            ...state,
            calendarEvents: [...state.calendarEvents, action.payload]
        };
    case 'ADD_NOTE':
        return {
            ...state,
            notes: [action.payload, ...state.notes]
        };
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
  calendarEvents: initialCalendarEvents,
  notes: initialNotes,
};

export function RestaurantProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(reducer, initialState);
  const [audioQueue, setAudioQueue] = useState<string[]>([]);
  const [isPlaying, setIsPlaying] = useState(false);
  const [processedNotifications, setProcessedNotifications] = useState<Set<string>>(new Set());

  // Function to handle Text-to-Speech conversion and queueing
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

  // Effect to play audio from the queue
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
      audio.onerror = (e) => { // Handle potential audio play errors
        console.error("Error playing audio.", e);
        setAudioQueue(prev => prev.slice(1));
        setIsPlaying(false);
      }
    }
  }, [audioQueue, isPlaying]);

  // Effect for unread notifications
  useEffect(() => {
    state.notifications.forEach(n => {
        if (!processedNotifications.has(n.id) && !n.read) {
            playVoiceNotification(n.message);
            setProcessedNotifications(prev => new Set(prev).add(n.id));
        }
    });
  }, [state.notifications, playVoiceNotification, processedNotifications]);
  
  // Effect for order delivery timers
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

    // Cleanup timers
    return () => {
        state.orders.forEach(order => {
            if (order.deliveryTimerId) {
                clearTimeout(order.deliveryTimerId);
            }
        });
    };
  }, [state.orders]);

  // Effect for calendar event reminders
  useEffect(() => {
    const checkEvents = () => {
        state.calendarEvents.forEach(event => {
            if (isToday(event.date)) {
                const notifId = `event-reminder-${event.id}`;
                 if (!state.notifications.some(n => n.id === notifId)) {
                    const newNotification: Notification = {
                        id: notifId,
                        message: `Recordatorio de evento hoy: ${event.title}`,
                        type: 'event-reminder',
                        timestamp: Date.now(),
                        read: false,
                    };
                    dispatch({ type: 'ADD_NOTIFICATION', payload: newNotification });
                 }
            }
        });
    };

    // Check once on mount and then set an interval to check daily
    checkEvents();
    const intervalId = setInterval(checkEvents, 1000 * 60 * 60 * 24); // Check once a day

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
