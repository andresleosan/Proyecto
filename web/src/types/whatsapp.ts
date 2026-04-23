// Tipos para la integración de WhatsApp

export interface WhatsAppConversation {
  id: string;
  phoneNumber: string;
  customerName: string;
  firstMessageDate: Date;
  lastMessageDate: Date;
  status: 'active' | 'archived';
}

export interface WhatsAppMessage {
  id: string;
  conversationId: string;
  sender: 'customer' | 'admin';
  message: string;
  timestamp: Date;
  messageType: 'text' | 'order_request' | 'location' | 'image';
}

export interface WhatsAppOrderItem {
  productId: string;
  productName: string;
  quantity: number;
  price: number;
}

export interface WhatsAppOrder {
  id: string;
  conversationId: string;
  phoneNumber: string;
  customerName: string;
  items: WhatsAppOrderItem[];
  deliveryAddress: string;
  totalPrice: number;
  status: 'pending' | 'confirmed' | 'delivered' | 'cancelled';
  createdAt: Date;
  orderNotes: string;
}

export interface ProcessedMessageData {
  hasOrder: boolean;
  products?: { name: string; quantity: number }[];
  address?: string;
  rawText: string;
}
