/**
 * @file This file simulates a client-side API layer.
 * In a real application, this is where you would make your `fetch` calls to the Spring Boot backend.
 * For now, it simulates API calls by interacting with an in-memory data store.
 */

import type { MenuItem, Order, Table, Offer, Note, CalendarEvent, OrderItem, TableStatus, Notification } from './types';

// --- IN-MEMORY DATABASE SIMULATION ---

let db = {
  menuItems: [] as MenuItem[],
  orders: [] as Order[],
  tables: Array.from({ length: 12 }, (_, i) => ({ id: (i + 1).toString(), status: 'free' })) as Table[],
  offers: [] as Offer[],
  notes: [] as Note[],
  calendarEvents: [] as CalendarEvent[],
  notifications: [] as Notification[],
};

const LATENCY = 100; // ms

const wait = () => new Promise(resolve => setTimeout(resolve, LATENCY));

// --- API FUNCTIONS ---

// Menu Items
export async function getMenuItems(): Promise<MenuItem[]> {
  await wait();
  return [...db.menuItems];
}

export async function getMenuItem(id: string): Promise<MenuItem | undefined> {
    await wait();
    return db.menuItems.find(item => item.id === id);
}

export async function createMenuItem(itemData: Omit<MenuItem, 'id'>): Promise<MenuItem> {
    await wait();
    const newItem: MenuItem = { ...itemData, id: `menu-${Date.now()}` };
    db.menuItems.push(newItem);
    return newItem;
}

export async function updateMenuItem(id: string, updates: Partial<MenuItem>): Promise<MenuItem | null> {
    await wait();
    const index = db.menuItems.findIndex(item => item.id === id);
    if (index === -1) return null;
    const updatedItem = { ...db.menuItems[index], ...updates };
    db.menuItems[index] = updatedItem;
    return updatedItem;
}

export async function updateMenuItemStock(id: string, newStock: number): Promise<MenuItem | null> {
    return updateMenuItem(id, { stock: newStock });
}


export async function deleteMenuItem(id: string): Promise<boolean> {
    await wait();
    const initialLength = db.menuItems.length;
    db.menuItems = db.menuItems.filter(item => item.id !== id);
    return db.menuItems.length < initialLength;
}


// Offers
export async function getOffers(): Promise<Offer[]> {
  await wait();
  return [...db.offers];
}

export async function createOffer(offerData: Omit<Offer, 'id'>): Promise<Offer> {
    await wait();
    const newOffer: Offer = { ...offerData, id: `offer-${Date.now()}` };
    db.offers.push(newOffer);
    return newOffer;
}

export async function updateOffer(id: string, updates: Partial<Offer>): Promise<Offer | null> {
    await wait();
    const index = db.offers.findIndex(offer => offer.id === id);
    if (index === -1) return null;
    const updatedOffer = { ...db.offers[index], ...updates };
    db.offers[index] = updatedOffer;
    return updatedOffer;
}

export async function deleteOffer(id: string): Promise<boolean> {
    await wait();
    const initialLength = db.offers.length;
    db.offers = db.offers.filter(offer => offer.id !== id);
    return db.offers.length < initialLength;
}

// Tables
export async function getTables(): Promise<Table[]> {
  await wait();
  return [...db.tables];
}

export async function getTableById(id: number): Promise<Table | undefined> {
    await wait();
    return db.tables.find(t => t.id === id.toString());
}


export async function updateTableStatus(tableId: number, status: TableStatus): Promise<Table | null> {
    await wait();
    const index = db.tables.findIndex(t => t.id === tableId.toString());
    if (index === -1) return null;
    db.tables[index].status = status;
    if (status === 'free') {
        db.tables[index].orderId = undefined;
    }
    return db.tables[index];
}

export async function addTable(): Promise<Table | null> {
    await wait();
    if(db.tables.length >= 15) return null;
    const newId = (db.tables.length > 0 ? Math.max(...db.tables.map(t => parseInt(t.id))) : 0) + 1;
    const newTable: Table = { id: newId.toString(), status: 'free' };
    db.tables.push(newTable);
    return newTable;
}

export async function removeTable(): Promise<boolean> {
    await wait();
    if(db.tables.length <= 8) return false;
    const lastTable = db.tables[db.tables.length - 1];
    if (lastTable.status !== 'free') return false;
    db.tables.pop();
    return true;
}


// Orders
export async function getOrders(): Promise<Order[]> {
  await wait();
  return [...db.orders];
}

export async function getOrderByTableId(tableId: number): Promise<Order | null> {
    await wait();
    const table = db.tables.find(t => t.id === tableId.toString());
    if (!table || !table.orderId) return null;
    return db.orders.find(o => o.id === table.orderId) || null;
}

export async function createOrder(orderData: { tableId: number, items: OrderItem[], estimatedDeliveryTime: number }): Promise<Order | null> {
    await wait();
    
    // Check stock
    for (const item of orderData.items) {
        const menuItem = db.menuItems.find(mi => mi.id === item.menuItemId);
        if (!menuItem || menuItem.stock < item.quantity) {
            return null; // Stock not available
        }
    }

    // Deduct stock
    for (const item of orderData.items) {
        const menuItem = db.menuItems.find(mi => mi.id === item.menuItemId);
        if (menuItem) {
            menuItem.stock -= item.quantity;
        }
    }

    const newOrder: Order = {
        id: `order-${Date.now()}`,
        tableId: orderData.tableId,
        items: orderData.items,
        status: 'pending',
        createdAt: Date.now(),
        lastUpdatedAt: Date.now(),
        estimatedDeliveryTime: orderData.estimatedDeliveryTime
    };
    db.orders.push(newOrder);

    // Update table
    const tableIndex = db.tables.findIndex(t => t.id === orderData.tableId.toString());
    if (tableIndex !== -1) {
        db.tables[tableIndex].status = 'occupied';
        db.tables[tableIndex].orderId = newOrder.id;
    }
    
    // Create notification
    createNotification({
      message: `Tienes un pedido para la mesa ${newOrder.tableId}.`,
      type: 'new-order',
      tableId: newOrder.tableId,
    });


    return newOrder;
}

export async function updateOrderStatus(orderId: string, status: Order['status']): Promise<Order | null> {
    await wait();
    const index = db.orders.findIndex(o => o.id === orderId);
    if (index === -1) return null;

    db.orders[index].status = status;
    db.orders[index].lastUpdatedAt = Date.now();

    const order = db.orders[index];

    if (status === 'ready') {
        createNotification({
            message: `El pedido de la Mesa ${order.tableId} está listo para entregar.`,
            type: 'order-ready',
            tableId: order.tableId
        });
    }

    if (status === 'delivered') {
        // This would logically be where the table is freed, but we leave it to a separate action for UX flow
    }

    return db.orders[index];
}

export async function editOrder(orderId: string, newItems: OrderItem[]): Promise<Order | null> {
    await wait();
    const orderIndex = db.orders.findIndex(o => o.id === orderId);
    if (orderIndex === -1) return null;

    const originalOrder = db.orders[orderIndex];

    // Return original items to stock
    for (const item of originalOrder.items) {
        const menuItem = db.menuItems.find(mi => mi.id === item.menuItemId);
        if (menuItem) menuItem.stock += item.quantity;
    }

    // Check new stock and deduct
    for (const item of newItems) {
        const menuItem = db.menuItems.find(mi => mi.id === item.menuItemId);
        if (!menuItem || menuItem.stock < item.quantity) {
             // Re-add original items to stock since transaction failed
             for (const item of originalOrder.items) {
                const menuItem = db.menuItems.find(mi => mi.id === item.menuItemId);
                if (menuItem) menuItem.stock -= item.quantity;
            }
            return null;
        }
        menuItem.stock -= item.quantity;
    }

    db.orders[orderIndex].items = newItems;
    db.orders[orderIndex].lastUpdatedAt = Date.now();
    
    createNotification({
        message: `El pedido de la Mesa ${originalOrder.tableId} fue modificado.`,
        type: 'new-order',
        tableId: originalOrder.tableId,
    });
    
    return db.orders[orderIndex];
}

export async function cancelOrder(orderId: string): Promise<boolean> {
    await wait();
    const orderIndex = db.orders.findIndex(o => o.id === orderId);
    if (orderIndex === -1) return false;

    const order = db.orders[orderIndex];

    // Return stock
    for (const item of order.items) {
        const menuItem = db.menuItems.find(mi => mi.id === item.menuItemId);
        if (menuItem) menuItem.stock += item.quantity;
    }

    // Update table
    const tableIndex = db.tables.findIndex(t => t.id === order.tableId.toString());
    if (tableIndex !== -1) {
        db.tables[tableIndex].status = 'free';
        db.tables[tableIndex].orderId = undefined;
    }
    
    // Remove order
    db.orders.splice(orderIndex, 1);
    
    return true;
}


// Notifications
export async function getNotifications(): Promise<Notification[]> {
    await wait();
    return [...db.notifications];
}

async function createNotification(data: Omit<Notification, 'id' | 'timestamp' | 'read'>) {
    const newNotif: Notification = {
        ...data,
        id: `notif-${Date.now()}`,
        timestamp: Date.now(),
        read: false
    };
    db.notifications.unshift(newNotif);
}

export async function callWaiter(tableId: number): Promise<void> {
    await wait();
    const tableIndex = db.tables.findIndex(t => t.id === tableId.toString());
    if (tableIndex !== -1) {
        db.tables[tableIndex].status = 'needs-attention';
    }
    createNotification({
        message: `Mesa ${tableId} necesita atención!`,
        type: 'call',
        tableId
    });
}

export async function acceptCall(tableId: number, notificationId: string): Promise<void> {
    await wait();
    const tableIndex = db.tables.findIndex(t => t.id === tableId.toString());
    if (tableIndex !== -1 && db.tables[tableIndex].status === 'needs-attention') {
        db.tables[tableIndex].status = 'occupied';
    }
    dismissNotification(notificationId);
}


export async function dismissNotification(notificationId: string): Promise<void> {
    await wait();
    db.notifications = db.notifications.filter(n => n.id !== notificationId);
}
