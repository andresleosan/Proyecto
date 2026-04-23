/**
 * Backend Server para WhatsApp Integration
 * 
 * Este es un archivo de ejemplo que muestra cómo configurar un servidor Node.js/Express
 * para recibir mensajes de WhatsApp a través de Twilio y sincronizarlos con Firebase.
 * 
 * ⚠️ NOTA: Este es solo un ejemplo. Para producción, considera:
 * - Autenticación más robusta
 * - Rate limiting
 * - Manejo de errores más completo
 * - Logging más detallado
 * - Validación de webhooks
 */

// ============================================
// INSTALACIÓN DE DEPENDENCIAS
// ============================================
/*
npm install express twilio firebase-admin dotenv cors body-parser
npm install -D @types/express @types/node typescript ts-node
*/

// ============================================
// CONFIGURACIÓN DE VARIABLES DE ENTORNO (.env)
// ============================================
/*
# Twilio Credentials
TWILIO_ACCOUNT_SID=your_account_sid
TWILIO_AUTH_TOKEN=your_auth_token
TWILIO_WHATSAPP_NUMBER=whatsapp:+1234567890

# Firebase
FIREBASE_PROJECT_ID=your_project_id
FIREBASE_PRIVATE_KEY=your_private_key
FIREBASE_CLIENT_EMAIL=your_client_email

# Server
PORT=3001
NODE_ENV=development
WEBHOOK_URL=https://your-domain.com/webhook/whatsapp
*/

// ============================================
// EJEMPLO DE CÓDIGO (TypeScript)
// ============================================

/*
import express, { Express, Request, Response } from 'express';
import twilio from 'twilio';
import admin from 'firebase-admin';
import cors from 'cors';
import dotenv from 'dotenv';

dotenv.config();

const app: Express = express();
const port = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Twilio Client
const twilioClient = twilio(
  process.env.TWILIO_ACCOUNT_SID,
  process.env.TWILIO_AUTH_TOKEN
);

// Firebase Admin
admin.initializeApp({
  projectId: process.env.FIREBASE_PROJECT_ID,
  privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
  clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
});

const db = admin.firestore();

// ============================================
// WEBHOOK PARA RECIBIR MENSAJES DE TWILIO
// ============================================

app.post('/webhook/whatsapp', async (req: Request, res: Response) => {
  try {
    const { From, Body, ProfileName, MessageSid } = req.body;

    if (!From || !Body) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    const clientPhone = From.replace('whatsapp:', '');
    const clientName = ProfileName || clientPhone;

    // 1. Verificar si existe conversación
    let conversationId: string | null = null;
    const conversationsSnapshot = await db
      .collection('whatsapp_conversations')
      .where('clientPhone', '==', clientPhone)
      .limit(1)
      .get();

    if (conversationsSnapshot.empty) {
      // Crear nueva conversación
      const newConversation = await db
        .collection('whatsapp_conversations')
        .add({
          clientPhone,
          clientName,
          lastMessage: Body,
          lastMessageTime: admin.firestore.FieldValue.serverTimestamp(),
          status: 'active',
          createdAt: admin.firestore.FieldValue.serverTimestamp(),
          messages: [],
          unreadCount: 1,
        });
      conversationId = newConversation.id;
    } else {
      conversationId = conversationsSnapshot.docs[0].id;
    }

    // 2. Agregar mensaje a la conversación
    const message = {
      id: MessageSid,
      sender: 'client',
      message: Body,
      timestamp: admin.firestore.FieldValue.serverTimestamp(),
      type: 'text',
    };

    await db
      .collection('whatsapp_conversations')
      .doc(conversationId)
      .update({
        messages: admin.firestore.FieldValue.arrayUnion(message),
        lastMessage: Body,
        lastMessageTime: admin.firestore.FieldValue.serverTimestamp(),
        unreadCount: admin.firestore.FieldValue.increment(1),
      });

    // 3. Respuesta automática (opcional)
    await sendWhatsAppMessage(
      From,
      '¡Gracias por tu mensaje! El administrador te responderá pronto. 😊'
    );

    res.status(200).json({ success: true, conversationId });
  } catch (error) {
    console.error('Error processing webhook:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// ============================================
// ENDPOINT PARA ENVIAR MENSAJES DESDE EL ADMIN
// ============================================

app.post('/api/whatsapp/send', async (req: Request, res: Response) => {
  try {
    const { conversationId, message, clientPhone } = req.body;

    if (!conversationId || !message || !clientPhone) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    // Enviar a través de Twilio
    const whatsappPhone = `whatsapp:${clientPhone}`;
    const result = await sendWhatsAppMessage(whatsappPhone, message);

    // Guardar en Firebase
    const msgData = {
      id: result.sid,
      sender: 'admin',
      message,
      timestamp: admin.firestore.FieldValue.serverTimestamp(),
      type: 'text',
    };

    await db
      .collection('whatsapp_conversations')
      .doc(conversationId)
      .update({
        messages: admin.firestore.FieldValue.arrayUnion(msgData),
        lastMessage: message,
        lastMessageTime: admin.firestore.FieldValue.serverTimestamp(),
      });

    res.status(200).json({ success: true, messageSid: result.sid });
  } catch (error) {
    console.error('Error sending message:', error);
    res.status(500).json({ error: 'Failed to send message' });
  }
});

// ============================================
// FUNCIÓN AUXILIAR PARA ENVIAR MENSAJES
// ============================================

async function sendWhatsAppMessage(
  toPhone: string,
  messageBody: string
): Promise<{ sid: string }> {
  const message = await twilioClient.messages.create({
    from: process.env.TWILIO_WHATSAPP_NUMBER,
    to: toPhone,
    body: messageBody,
  });

  return { sid: message.sid };
}

// ============================================
// ENDPOINT PARA CREAR ORDEN DESDE WHATSAPP
// ============================================

app.post('/api/whatsapp/orders', async (req: Request, res: Response) => {
  try {
    const {
      conversationId,
      clientPhone,
      clientName,
      items,
      deliveryAddress,
    } = req.body;

    const total = items.reduce(
      (sum: number, item: any) => sum + item.subtotal,
      0
    );

    // Crear orden en Firebase
    const order = await db.collection('whatsapp_orders').add({
      conversationId,
      clientPhone,
      clientName,
      items,
      total,
      deliveryAddress,
      status: 'pending',
      paymentMethod: 'pending',
      notes: '',
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
      updatedAt: admin.firestore.FieldValue.serverTimestamp(),
    });

    // Agregar mensaje de orden a la conversación
    const orderMessage = {
      id: `order_${order.id}`,
      sender: 'system',
      message: `✅ Orden creada: ${items.length} producto(s), Total: $${total}`,
      timestamp: admin.firestore.FieldValue.serverTimestamp(),
      type: 'order',
    };

    await db
      .collection('whatsapp_conversations')
      .doc(conversationId)
      .update({
        messages: admin.firestore.FieldValue.arrayUnion(orderMessage),
      });

    // Notificar al cliente
    await sendWhatsAppMessage(
      `whatsapp:${clientPhone}`,
      `Tu pedido ha sido recibido. Total: $${total}\\nNos comunicaremos pronto para confirmar.`
    );

    res.status(201).json({ success: true, orderId: order.id });
  } catch (error) {
    console.error('Error creating order:', error);
    res.status(500).json({ error: 'Failed to create order' });
  }
});

// ============================================
// HEALTH CHECK
// ============================================

app.get('/health', (req: Request, res: Response) => {
  res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

// ============================================
// INICIAR SERVIDOR
// ============================================

app.listen(port, () => {
  console.log(`🚀 WhatsApp Server running on port ${port}`);
  console.log(`📱 Webhook URL: ${process.env.WEBHOOK_URL}`);
});

export default app;
*/

// ============================================
// CONFIGURACIÓN EN TWILIO
// ============================================
/*

1. Crear cuenta en Twilio.com
2. Ir a: Messaging > Try it out > Send an SMS
3. Habilitar WhatsApp:
   - Console > Messaging > Services > Create new Service
   - Seleccionar WhatsApp
   - Agregar número de teléfono

4. Configurar Webhook:
   - Messaging > Services > Tu servicio
   - Outbound Settings
   - Webhook URL: https://tu-dominio.com/webhook/whatsapp
   - HTTP POST

5. Obtener credenciales:
   - Account SID: En el dashboard principal
   - Auth Token: En el dashboard principal
   - WhatsApp Number: El número asignado por Twilio

*/

// ============================================
// ESTRUCTURA DE ARCHIVOS DEL BACKEND
// ============================================
/*

backend/
├── src/
│   ├── server.ts (o .js)
│   ├── config/
│   │   ├── firebase.ts
│   │   └── twilio.ts
│   ├── routes/
│   │   ├── webhook.ts
│   │   ├── whatsapp.ts
│   │   └── orders.ts
│   ├── controllers/
│   │   ├── whatsappController.ts
│   │   └── orderController.ts
│   ├── services/
│   │   ├── twilioService.ts
│   │   ├── firebaseService.ts
│   │   └── orderService.ts
│   └── types/
│       └── index.ts
├── .env
├── .env.example
├── package.json
├── tsconfig.json
└── nodemon.json

*/

// ============================================
// PRÓXIMOS PASOS
// ============================================
/*

1. Crear la carpeta backend/ en la raíz del proyecto
2. Copiar este código como referencia
3. Instalar las dependencias
4. Configurar las variables de entorno
5. Configurar el webhook en Twilio
6. Desplegar en un servidor (Heroku, AWS, DigitalOcean, etc.)
7. Probar enviando mensajes desde WhatsApp

*/

export {};
