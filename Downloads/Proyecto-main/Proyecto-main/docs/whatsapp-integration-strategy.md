# Estrategia de Integración de ChatBot WhatsApp - SmartMarket Admin

## 📱 Visión General

Integración de un sistema de ChatBot con WhatsApp que permita a los clientes:

- Realizar pedidos directamente desde WhatsApp
- Solicitar domicilios
- Ver historial de pedidos
- Recibir confirmaciones y notificaciones
- Gestionar el carrito de compra

---

## 🏗️ Arquitectura Propuesta

### 1. **Frontend (React)**

- Nueva pestaña "WhatsApp Manager" en la aplicación
- Dashboard para monitorear conversaciones
- Panel de gestión de pedidos desde WhatsApp
- Chat integrado para responder mensajes

### 2. **Backend (Backend Necesario)**

- Crear un servidor Node.js/Express como intermediario
- Webhook para recibir mensajes de WhatsApp
- Motor de procesamiento de órdenes
- Gestión de sesiones de chat

### 3. **Integraciones**

- **Twilio API** (recomendado) o **WhatsApp Business API**
- **Firebase** para almacenar conversaciones y órdenes
- **Sistema de notificaciones** en tiempo real

---

## 🗂️ Estructura de Datos en Firebase

### Colección: `whatsapp_conversations`

```
{
  id: string (ID del cliente/teléfono)
  clientPhone: "+57XXXXXXXXXX"
  clientName: string
  lastMessage: string
  lastMessageTime: timestamp
  status: "active" | "inactive"
  createdAt: timestamp
  messages: [
    {
      id: string
      sender: "client" | "admin"
      message: string
      timestamp: timestamp
      type: "text" | "order" | "delivery"
    }
  ]
}
```

### Colección: `whatsapp_orders`

```
{
  id: string
  conversationId: string
  clientPhone: string
  items: [
    {
      productId: string
      productName: string
      quantity: number
      price: number
    }
  ]
  total: number
  deliveryAddress: string
  deliveryCoordinates: {lat: number, lng: number}
  status: "pending" | "confirmed" | "in_delivery" | "delivered"
  createdAt: timestamp
  updatedAt: timestamp
}
```

### Colección: `whatsapp_settings`

```
{
  id: string
  twilioAccountSid: string (encriptado)
  twilioAuthToken: string (encriptado)
  twilioPhoneNumber: string
  businessHours: {
    startTime: "09:00"
    endTime: "18:00"
    timezone: "America/Bogota"
  }
  autoReplyTemplate: string
}
```

---

## 🔄 Flujo de Operación

### Flujo 1: Cliente Envía Mensaje

```
Cliente envía mensaje por WhatsApp
        ↓
Twilio recibe el mensaje
        ↓
Webhook recibe notificación
        ↓
Backend procesa el mensaje
        ↓
Guarda en Firebase (whatsapp_conversations)
        ↓
Frontend recibe actualización en tiempo real
        ↓
Admin ve el mensaje en el panel
```

### Flujo 2: Cliente Realiza Pedido

```
Cliente solicita ver productos
        ↓
Bot envía catálogo/opciones
        ↓
Cliente selecciona productos (por número o nombre)
        ↓
Sistema crea orden en Firebase (whatsapp_orders)
        ↓
Bot solicita dirección de envío
        ↓
Bot calcula total y solicita confirmación
        ↓
Cliente confirma pago (COD/banco)
        ↓
Orden se marca como "confirmed"
        ↓
Admin ve la orden en el panel
```

---

## 🛠️ Implementación por Fases

### **Fase 1: Básica (MVP)**

- [ ] Componente WhatsApp Manager en la UI
- [ ] Servicio para conectar con Twilio
- [ ] Guardar conversaciones en Firebase
- [ ] Panel simple para ver mensajes
- [ ] Responder mensajes desde el admin

### **Fase 2: Gestión de Pedidos**

- [ ] Crear órdenes desde WhatsApp
- [ ] Sistema de catálogo de productos por chat
- [ ] Cálculo de totales
- [ ] Confirmación de pedidos

### **Fase 3: Logística**

- [ ] Sistema de dirección de envío
- [ ] Mapeo de ubicaciones
- [ ] Seguimiento de entregas
- [ ] Confirmación de entrega

### **Fase 4: Automatización**

- [ ] Bot inteligente con IA (opcional)
- [ ] Respuestas automáticas basadas en palabras clave
- [ ] Notificaciones automáticas
- [ ] Integración con proveedores externos

---

## 📦 Dependencias Necesarias

```json
{
  "dependencies": {
    "twilio": "^4.x.x",
    "axios": "^1.x.x",
    "socket.io-client": "^4.x.x"
  },
  "devDependencies": {
    "@types/twilio": "^3.x.x"
  }
}
```

### Backend (Node.js)

```json
{
  "dependencies": {
    "express": "^4.18.x",
    "twilio": "^4.x.x",
    "firebase-admin": "^12.x.x",
    "socket.io": "^4.x.x",
    "dotenv": "^16.x.x"
  }
}
```

---

## 🔐 Seguridad y Configuración

### Variables de Entorno (Frontend)

```env
VITE_WHATSAPP_API_URL=http://localhost:3001/api/whatsapp
VITE_FIREBASE_REALTIME_DB=https://your-project.firebaseio.com
```

### Variables de Entorno (Backend)

```env
TWILIO_ACCOUNT_SID=your_account_sid
TWILIO_AUTH_TOKEN=your_auth_token
TWILIO_WHATSAPP_NUMBER=whatsapp:+1234567890
FIREBASE_PROJECT_ID=your_project_id
WEBHOOK_URL=https://your-domain.com/webhook/whatsapp
```

---

## 📱 Casos de Uso

### Caso 1: Cliente Realiza Pedido Simple

1. Cliente: "Hola, quiero hacer un pedido"
2. Bot: "¡Bienvenido! Estos son nuestros productos disponibles: [lista]"
3. Cliente: "2 arroz, 1 leche"
4. Bot: "¿Cuál es tu dirección de envío?"
5. Cliente: "[Dirección]"
6. Bot: "Tu pedido es $X. ¿Confirmas?"
7. Cliente: "Sí"
8. Admin ve la orden en el sistema

### Caso 2: Admin Responde Consulta

1. Cliente pregunta "¿Tienen pan integral?"
2. Admin ve el mensaje en el panel
3. Admin responde: "Sí, acabamos de recibir"
4. Cliente recibe la respuesta

---

## 📊 Flujo Frontend (React)

### Nuevo Componente: `WhatsAppManager.tsx`

```
├─ Header (Info de conexión)
├─ ChatPanel
│  ├─ ConversationList (lista de clientes)
│  └─ MessageThread (conversación actual)
├─ OrderPanel
│  └─ OrdersList (órdenes desde WhatsApp)
└─ Analytics (estadísticas)
```

---

## 🚀 Próximos Pasos

1. **Configurar Twilio**: Crear cuenta y obtener credenciales
2. **Crear Backend**: Servidor Express con webhooks
3. **Implementar Frontend**: Componente WhatsApp Manager
4. **Configurar Firebase**: Crear las colecciones necesarias
5. **Pruebas**: Enviar mensajes de prueba
6. **Desplegar**: En servidor de producción

---

## 📚 Recursos

- [Twilio WhatsApp API](https://www.twilio.com/docs/whatsapp)
- [Firebase Real-time Database](https://firebase.google.com/docs/database)
- [WhatsApp Business API](https://developers.facebook.com/docs/whatsapp)
