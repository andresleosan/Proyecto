import {
  collection,
  addDoc,
  updateDoc,
  doc,
  getDocs,
  query,
  orderBy,
  limit,
  serverTimestamp,
  Timestamp,
  QueryConstraint,
  where,
} from 'firebase/firestore';
import { db } from '../firebase/config';

/**
 * Tipos de datos para WhatsApp Integration
 */

export interface WhatsAppMessage {
  id: string;
  sender: 'client' | 'admin';
  message: string;
  timestamp: Timestamp;
  type: 'text' | 'order' | 'delivery' | 'system';
  mediaUrl?: string;
}

export interface WhatsAppConversation {
  id: string;
  clientPhone: string;
  clientName: string;
  lastMessage: string;
  lastMessageTime: Timestamp;
  status: 'active' | 'inactive' | 'archived';
  createdAt: Timestamp;
  messages: WhatsAppMessage[];
  unreadCount: number;
}

export interface WhatsAppOrderItem {
  productId: string;
  productName: string;
  quantity: number;
  price: number;
  subtotal: number;
}

export interface WhatsAppOrder {
  id: string;
  conversationId: string;
  clientPhone: string;
  clientName: string;
  items: WhatsAppOrderItem[];
  total: number;
  deliveryAddress: string;
  deliveryCoordinates?: {
    latitude: number;
    longitude: number;
  };
  status: 'pending' | 'confirmed' | 'in_preparation' | 'in_delivery' | 'delivered' | 'cancelled';
  paymentMethod: 'cash' | 'bank_transfer' | 'pending';
  notes: string;
  createdAt: Timestamp;
  updatedAt: Timestamp;
  estimatedDelivery?: Timestamp;
}

/**
 * Servicio para gestionar conversaciones de WhatsApp
 */

export async function createConversation(
  clientPhone: string,
  clientName: string,
  initialMessage: string
): Promise<string> {
  try {
    const conversationRef = await addDoc(collection(db, 'whatsapp_conversations'), {
      clientPhone,
      clientName,
      lastMessage: initialMessage,
      lastMessageTime: serverTimestamp(),
      status: 'active',
      createdAt: serverTimestamp(),
      messages: [],
      unreadCount: 1,
    });

    await addMessage(conversationRef.id, 'client', initialMessage, 'text');
    return conversationRef.id;
  } catch (error) {
    console.error('Error creating conversation:', error);
    throw error;
  }
}

export async function getConversations(): Promise<WhatsAppConversation[]> {
  try {
    const conversationsRef = collection(db, 'whatsapp_conversations');
    const q = query(
      conversationsRef,
      orderBy('lastMessageTime', 'desc'),
      limit(50)
    );

    const snapshot = await getDocs(q);
    const conversations: WhatsAppConversation[] = [];

    snapshot.forEach((doc) => {
      conversations.push({
        id: doc.id,
        ...(doc.data() as Omit<WhatsAppConversation, 'id'>),
      });
    });

    return conversations;
  } catch (error) {
    console.error('Error getting conversations:', error);
    throw error;
  }
}

export async function getConversation(conversationId: string): Promise<WhatsAppConversation | null> {
  try {
    const docRef = doc(db, 'whatsapp_conversations', conversationId);
    const snapshot = await getDocs(collection(db, 'whatsapp_conversations'));
    
    for (const docSnap of snapshot.docs) {
      if (docSnap.id === conversationId) {
        return {
          id: docSnap.id,
          ...(docSnap.data() as Omit<WhatsAppConversation, 'id'>),
        };
      }
    }

    return null;
  } catch (error) {
    console.error('Error getting conversation:', error);
    throw error;
  }
}

export async function addMessage(
  conversationId: string,
  sender: 'client' | 'admin',
  message: string,
  type: 'text' | 'order' | 'delivery' | 'system' = 'text',
  mediaUrl?: string
): Promise<void> {
  try {
    const newMessage: WhatsAppMessage = {
      id: `msg_${Date.now()}`,
      sender,
      message,
      timestamp: serverTimestamp() as Timestamp,
      type,
      mediaUrl,
    };

    const conversationRef = doc(db, 'whatsapp_conversations', conversationId);
    const conversationSnap = await getDocs(collection(db, 'whatsapp_conversations'));

    let currentMessages: WhatsAppMessage[] = [];
    for (const docSnap of conversationSnap.docs) {
      if (docSnap.id === conversationId) {
        currentMessages = docSnap.data().messages || [];
        break;
      }
    }

    currentMessages.push(newMessage);

    await updateDoc(conversationRef, {
      messages: currentMessages,
      lastMessage: message,
      lastMessageTime: serverTimestamp(),
      unreadCount: sender === 'client' ? (currentMessages.length || 0) : 0,
    });
  } catch (error) {
    console.error('Error adding message:', error);
    throw error;
  }
}

export async function markConversationAsRead(conversationId: string): Promise<void> {
  try {
    const conversationRef = doc(db, 'whatsapp_conversations', conversationId);
    await updateDoc(conversationRef, {
      unreadCount: 0,
    });
  } catch (error) {
    console.error('Error marking conversation as read:', error);
    throw error;
  }
}

/**
 * Servicio para gestionar órdenes de WhatsApp
 */

export async function createOrder(
  conversationId: string,
  clientPhone: string,
  clientName: string,
  items: WhatsAppOrderItem[],
  deliveryAddress: string
): Promise<string> {
  try {
    const total = items.reduce((sum, item) => sum + item.subtotal, 0);

    const orderRef = await addDoc(collection(db, 'whatsapp_orders'), {
      conversationId,
      clientPhone,
      clientName,
      items,
      total,
      deliveryAddress,
      status: 'pending',
      paymentMethod: 'pending',
      notes: '',
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });

    // Agregar mensaje de sistema a la conversación
    await addMessage(
      conversationId,
      'admin',
      `Pedido creado: ${items.length} producto(s), Total: $${total}`,
      'order'
    );

    return orderRef.id;
  } catch (error) {
    console.error('Error creating order:', error);
    throw error;
  }
}

export async function getOrders(filters?: {
  status?: string;
  clientPhone?: string;
}): Promise<WhatsAppOrder[]> {
  try {
    const ordersRef = collection(db, 'whatsapp_orders');
    let constraints: QueryConstraint[] = [orderBy('createdAt', 'desc')];

    if (filters?.status) {
      constraints.push(where('status', '==', filters.status));
    }

    const q = query(ordersRef, ...constraints, limit(100));
    const snapshot = await getDocs(q);
    const orders: WhatsAppOrder[] = [];

    snapshot.forEach((docSnap) => {
      orders.push({
        id: docSnap.id,
        ...(docSnap.data() as Omit<WhatsAppOrder, 'id'>),
      });
    });

    return orders;
  } catch (error) {
    console.error('Error getting orders:', error);
    throw error;
  }
}

export async function updateOrderStatus(
  orderId: string,
  status: WhatsAppOrder['status']
): Promise<void> {
  try {
    const orderRef = doc(db, 'whatsapp_orders', orderId);
    await updateDoc(orderRef, {
      status,
      updatedAt: serverTimestamp(),
    });
  } catch (error) {
    console.error('Error updating order status:', error);
    throw error;
  }
}

/**
 * Servicio para estadísticas
 */

export async function getWhatsAppStats() {
  try {
    const conversations = await getConversations();
    const orders = await getOrders();

    const activeConversations = conversations.filter((c) => c.status === 'active').length;
    const pendingOrders = orders.filter((o) => o.status === 'pending').length;
    const deliveredOrders = orders.filter((o) => o.status === 'delivered').length;
    const totalRevenue = orders
      .filter((o) => o.status === 'delivered')
      .reduce((sum, o) => sum + o.total, 0);

    return {
      totalConversations: conversations.length,
      activeConversations,
      totalOrders: orders.length,
      pendingOrders,
      deliveredOrders,
      totalRevenue,
    };
  } catch (error) {
    console.error('Error getting WhatsApp stats:', error);
    throw error;
  }
}
