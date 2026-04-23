# Estrategia de Integración WhatsApp Chatbot

## Descripción General

Integración de un chatbot de WhatsApp en SmartMarket Admin para recibir pedidos y direcciones de envío directamente desde los clientes.

## Arquitectura

### 1. **Stack Tecnológico**

- **WhatsApp Business API**: Para enviar/recibir mensajes
- **Firebase Firestore**: Almacenamiento de conversaciones y pedidos
- **Cloud Functions**: Procesamiento de webhooks desde WhatsApp
- **React Frontend**: Panel de administración para gestionar chats

### 2. **Estructura de Datos en Firestore**

#### Colección: `whatsapp_conversations`

```
{
  id: string,
  phoneNumber: string,           // Teléfono del cliente
  customerName: string,          // Nombre del cliente
  firstMessageDate: timestamp,   // Primera vez que contactó
  lastMessageDate: timestamp,    // Último mensaje
  status: 'active' | 'archived'  // Estado de la conversación
}
```

#### Colección: `whatsapp_messages`

```
{
  id: string,
  conversationId: string,        // Referencia a la conversación
  sender: 'customer' | 'admin',  // Quién envía
  message: string,               // Contenido del mensaje
  timestamp: timestamp,
  messageType: 'text' | 'order_request' | 'location' | 'image'
}
```

#### Colección: `whatsapp_orders`

```
{
  id: string,
  conversationId: string,        // Referencia a la conversación
  phoneNumber: string,
  customerName: string,
  items: [
    {
      productId: string,
      productName: string,
      quantity: number,
      price: number
    }
  ],
  deliveryAddress: string,
  totalPrice: number,
  status: 'pending' | 'confirmed' | 'delivered',
  createdAt: timestamp,
  orderNotes: string
}
```

### 3. **Flujo de Integración**

```
Cliente (WhatsApp)
     ↓
WhatsApp Business API
     ↓
Webhook (Backend/Cloud Function)
     ↓
Firebase Firestore
     ↓
React Admin Panel (Nueva Pestaña)
     ↓
Admin (Responde/Confirma órdenes)
```

### 4. **Características Principales**

#### Panel de WhatsApp (Frontend)

- **Lista de Conversaciones**: Muestra todos los chats activos
- **Chat Detail**: Vista del historial de mensajes
- **Procesamiento de Órdenes**:
  - Reconoce patrones de órdenes ("Quiero 2 manzanas, 3 naranjas")
  - Extrae direcciones de envío
  - Crea órdenes automáticamente en Firestore
- **Respuestas Rápidas**: Botones preconfigurados para respuestas comunes
- **Auto-responder**: Mensaje automático cuando un cliente escribe

### 5. **Integraciones Necesarias**

#### Backend (Cloud Functions)

```javascript
// Webhook para recibir mensajes de WhatsApp
POST /api/webhooks/whatsapp
{
  messaging_product: "whatsapp",
  message: {
    from: "5541999999999",
    text: "Hola, quiero 2 kg de arroz",
    timestamp: "1234567890"
  }
}
```

#### Environment Variables Necesarios

```env
VITE_WHATSAPP_API_TOKEN=tu_token_whatsapp
VITE_WHATSAPP_PHONE_NUMBER_ID=id_del_numero
VITE_WHATSAPP_BUSINESS_ACCOUNT_ID=id_del_negocio
FIREBASE_PROJECT_ID=tu_proyecto
```

### 6. **Proceso de Pedidos Automático**

1. **Cliente envía mensaje**: "Quiero 2 manzanas y 3 naranjas, llevar a Calle 5 #123"
2. **AI/Regex procesa**:
   - Identifica productos
   - Calcula cantidades
   - Extrae dirección
3. **Sistema crea borrador de orden**
4. **Admin revisa** en panel de WhatsApp
5. **Admin confirma o ajusta**
6. **Orden se mueve a "Ventas"**

### 7. **Próximos Pasos de Implementación**

1. **Fase 1**: Estructura básica del componente
2. **Fase 2**: Conexión con Firebase
3. **Fase 3**: Integración de API de WhatsApp
4. **Fase 4**: Cloud Functions para webhooks
5. **Fase 5**: IA simple para reconocimiento de órdenes

### 8. **Seguridad**

- **Validación de Webhooks**: Verificar firma de WhatsApp
- **Rate Limiting**: Limitar mensajes por usuario
- **Autenticación**: Solo admins pueden ver/responder
- **Encriptación**: Datos sensibles encriptados en Firestore

### 9. **Alternativas de Implementación**

- **Opción A (Recomendada)**: Usar Cloud Functions + Firestore + React
- **Opción B**: Usar servicio de terceros (Twilio, Messagebird)
- **Opción C**: Chatbot con IA (Dialogflow, OpenAI)
