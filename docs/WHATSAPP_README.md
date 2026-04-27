# 💬 Integración WhatsApp - Resumen Ejecutivo

## ✅ Lo que se ha creado

### **Frontend (React + TypeScript)**

1. **Nueva Pestaña "WhatsApp"** en el navegador principal
   - Accesible desde: `App.tsx` → Botón "💬 WhatsApp"

2. **Componente: `WhatsAppChat.tsx`**
   - Panel de 3 columnas:
     - **Izquierda**: Lista de conversaciones activas
     - **Centro**: Chat en tiempo real con clientes
     - **Derecha Tab 1**: Historial de mensajes
     - **Derecha Tab 2**: Órdenes pendientes de confirmación

3. **Funcionalidades**:
   - ✅ Ver conversaciones con clientes
   - ✅ Responder mensajes en tiempo real
   - ✅ Respuestas rápidas preconfiguradas
   - ✅ Detección automática de órdenes (regex básico)
   - ✅ Extracción de direcciones de envío
   - ✅ Panel de órdenes pendientes
   - ✅ Confirmar órdenes directamente desde WhatsApp
   - ✅ Archivar conversaciones

4. **Servicio: `whatsappService.ts`**
   - Funciones para conectar con Firestore
   - Procesamiento de mensajes
   - Gestión de órdenes
   - Integración de datos

5. **Tipos TypeScript: `types/whatsapp.ts`**
   - Estructuras de conversación
   - Estructura de mensajes
   - Estructura de órdenes
   - Datos procesados

---

## 📊 Estructura de Base de Datos (Firestore)

### Colecciones creadas:

```
whatsapp_conversations
├── id
├── phoneNumber
├── customerName
├── firstMessageDate
├── lastMessageDate
└── status (active/archived)

whatsapp_messages
├── id
├── conversationId
├── sender (customer/admin)
├── message
├── timestamp
└── messageType (text/order_request/location/image)

whatsapp_orders
├── id
├── conversationId
├── phoneNumber
├── customerName
├── items (array de productos)
├── deliveryAddress
├── totalPrice
├── status (pending/confirmed/delivered/cancelled)
├── createdAt
└── orderNotes
```

---

## 📱 Flujo de Integración

```
Cliente envía WhatsApp
        ↓
Cloud Function recibe webhook
        ↓
Guarda en Firestore (whatsapp_messages)
        ↓
Frontend carga datos en tiempo real
        ↓
Admin ve conversación en panel
        ↓
Admin responde desde panel
        ↓
Sistema envía respuesta por WhatsApp API
```

---

## 🔧 Configuración Necesaria

### **Paso 1: Crear cuenta WhatsApp Business**

1. Ve a [business.facebook.com](https://business.facebook.com)
2. Crea una aplicación WhatsApp
3. Obtén:
   - `WHATSAPP_API_TOKEN`
   - `WHATSAPP_PHONE_NUMBER_ID`
   - `WHATSAPP_BUSINESS_ACCOUNT_ID`

### **Paso 2: Configurar Backend**

```bash
# En raíz del proyecto
cp .env.example .env

# Editar .env y agregar credenciales de WhatsApp

# Instalar dependencias
npm install express cors firebase-admin dotenv

# Ejecutar servidor
node backend/whatsapp-webhook.js
```

### **Paso 3: Configurar Webhook en WhatsApp**

1. En Meta Business Dashboard → Aplicación WhatsApp
2. Ir a "Webhooks" → "Configuración"
3. Agregar webhook:
   - URL: `https://tu-dominio.com/api/webhooks/whatsapp`
   - Verify Token: Mismo valor de `.env`
4. Suscribirse a eventos: `messages`, `message_status`

### **Paso 4: Configurar Firebase Rules**

1. En Firebase Console → Firestore → Rules
2. Copiar contenido de `docs/firestore.rules`
3. Publicar reglas

---

## 🚀 Comenzar Rápido

### **Desarrollo Local**

```bash
# Terminal 1: Frontend
cd web
npm install
npm run dev  # http://localhost:5173

# Terminal 2: Backend
npm install  # (si no lo hizo)
node backend/whatsapp-webhook.js  # http://localhost:3000

# Terminal 3: Exponer localmente (opcional con ngrok)
ngrok http 3000
# Usar URL de ngrok como webhook temporal
```

### **Crear Conversación de Prueba**

Puede agregar datos manualmente en Firestore:

```json
// Collection: whatsapp_conversations
{
  "phoneNumber": "5491234567890",
  "customerName": "Juan Pérez",
  "firstMessageDate": "2024-01-15T10:00:00Z",
  "lastMessageDate": "2024-01-15T10:00:00Z",
  "status": "active"
}

// Collection: whatsapp_messages
{
  "conversationId": "<ID_DEL_DOCUMENTO_ANTERIOR>",
  "sender": "customer",
  "message": "Hola, quiero 2 kilos de manzanas",
  "timestamp": "2024-01-15T10:00:00Z",
  "messageType": "text"
}
```

---

## 🧠 Cómo funciona la detección de órdenes

El sistema intenta extraer productos y direcciones usando expresiones regulares:

```javascript
// Ejemplo 1: "Quiero 2 kg de manzanas y 3 naranjas, llevar a Calle 5 #123"
// Detecta:
// - Productos: [{quantity: 2, name: "de manzanas"}, {quantity: 3, name: "naranjas"}]
// - Dirección: "Calle 5 #123"

// Ejemplo 2: "Necesito 1 paquete de arroz"
// Detecta:
// - Productos: [{quantity: 1, name: "de arroz"}]
```

**Limitación**: La detección actual es básica. Para IA avanzada, integrar OpenAI o Dialogflow.

---

## 📈 Próximas Mejoras (Recomendadas)

### **Fase 2: Automatización Inteligente**

```javascript
// Integrar OpenAI para procesamiento de lenguaje natural
const openai = new OpenAI();
const parsed = await openai.chat.completions.create({
  model: "gpt-3.5-turbo",
  messages: [
    {
      role: "user",
      content: `Extrae productos, cantidades y dirección: "${messageText}"`,
    },
  ],
});
```

### **Fase 3: Notificaciones en Tiempo Real**

```javascript
// Usar Firebase Realtime Database o WebSockets
const unsubscribe = onSnapshot(
  collection(db, "whatsapp_messages"),
  (snapshot) => {
    // Actualizar UI en tiempo real
  },
);
```

### **Fase 4: Integración de Pagos**

- Stripe/Mercado Pago API
- Link de pago en respuesta automática
- Confirmación de pago automática

---

## 📁 Estructura de Archivos Creados

```
proyecto/
├── backend/
│   └── whatsapp-webhook.js          (Servidor Express)
├── docs/
│   ├── WHATSAPP_INTEGRATION.md       (Estrategia)
│   ├── WHATSAPP_IMPLEMENTATION.md    (Guía de implementación)
│   └── firestore.rules               (Seguridad)
├── web/src/
│   ├── types/
│   │   └── whatsapp.ts               (Tipos TypeScript)
│   ├── services/
│   │   └── whatsappService.ts        (Servicio)
│   └── components/
│       └── WhatsAppChat.tsx          (Componente principal)
└── .env.example                      (Variables de entorno)
```

---

## ⚙️ Variables de Entorno

**Backend (.env)**:

```env
WHATSAPP_API_TOKEN=xxx
WHATSAPP_PHONE_NUMBER_ID=xxx
WEBHOOK_VERIFY_TOKEN=xxx
```

**Frontend (web/.env.local)**:

```env
VITE_FIREBASE_API_KEY=xxx
VITE_FIREBASE_PROJECT_ID=xxx
```

---

## 🆘 Troubleshooting

| Problema                | Solución                                               |
| ----------------------- | ------------------------------------------------------ |
| Webhook no se conecta   | Verificar token de webhook y URL correcta              |
| No recibo mensajes      | Validar credenciales de WhatsApp y webhook activo      |
| Frontend no carga datos | Verificar Firestore rules y autenticación              |
| Órdenes no se crean     | Revisar procesamiento de mensajes y datos en Firestore |

---

## 📞 Contacto / Recursos

- [WhatsApp API Docs](https://developers.facebook.com/docs/whatsapp)
- [Firebase Firestore](https://firebase.google.com/docs/firestore)
- [Meta Developer](https://developers.facebook.com)
- [OpenAI API](https://openai.com/api/) (Para IA)
