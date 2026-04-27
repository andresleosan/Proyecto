# Guía de Implementación - WhatsApp Chatbot

## 🚀 Próximos Pasos

Ya tenemos la estructura frontend lista. Ahora necesitas implementar lo siguiente:

### **Fase 1: Configuración Inicial**

#### 1. Instalar Firebase Admin SDK (Backend)

```bash
npm install firebase-admin express cors
```

#### 2. Crear variables de entorno (.env)

```env
# En la carpeta raíz del proyecto
FIREBASE_SERVICE_ACCOUNT_KEY=tu_clave_json
WHATSAPP_API_TOKEN=tu_token_de_whatsapp
WHATSAPP_PHONE_NUMBER_ID=tu_numero_id
WHATSAPP_BUSINESS_ACCOUNT_ID=tu_account_id
WEBHOOK_VERIFY_TOKEN=tu_token_secreto_webhook
```

---

### **Fase 2: Backend - Cloud Functions o Express Server**

#### Crear archivo: `backend/functions/webhooks.js`

```javascript
const express = require("express");
const admin = require("firebase-admin");
const cors = require("cors");

const app = express();
app.use(cors());
app.use(express.json());

// Inicializar Firebase Admin
const serviceAccount = require("./serviceAccountKey.json");
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
});

const db = admin.firestore();

// Webhook para verificación (GET)
app.get("/api/webhooks/whatsapp", (req, res) => {
  const mode = req.query["hub.mode"];
  const token = req.query["hub.verify_token"];
  const challenge = req.query["hub.challenge"];

  if (mode === "subscribe" && token === process.env.WEBHOOK_VERIFY_TOKEN) {
    res.status(200).send(challenge);
  } else {
    res.sendStatus(403);
  }
});

// Webhook para recibir mensajes (POST)
app.post("/api/webhooks/whatsapp", async (req, res) => {
  const body = req.body;

  if (body.object === "whatsapp_business_account") {
    for (const entry of body.entry) {
      for (const change of entry.changes) {
        if (change.field === "messages") {
          const message = change.value.messages[0];
          const contact = change.value.contacts[0];

          const phoneNumber = message.from;
          const messageText = message.text?.body || "";
          const timestamp = new Date(parseInt(message.timestamp) * 1000);

          // Buscar o crear conversación
          const conversationRef = db
            .collection("whatsapp_conversations")
            .where("phoneNumber", "==", phoneNumber);

          const snapshot = await conversationRef.get();
          let conversationId;

          if (snapshot.empty) {
            // Crear nueva conversación
            const newConv = await db.collection("whatsapp_conversations").add({
              phoneNumber,
              customerName: contact.profile?.name || "Cliente",
              firstMessageDate: admin.firestore.Timestamp.now(),
              lastMessageDate: admin.firestore.Timestamp.now(),
              status: "active",
            });
            conversationId = newConv.id;
          } else {
            conversationId = snapshot.docs[0].id;
            // Actualizar lastMessageDate
            await db
              .collection("whatsapp_conversations")
              .doc(conversationId)
              .update({
                lastMessageDate: admin.firestore.Timestamp.now(),
              });
          }

          // Guardar mensaje
          await db.collection("whatsapp_messages").add({
            conversationId,
            sender: "customer",
            message: messageText,
            timestamp: admin.firestore.Timestamp.fromDate(timestamp),
            messageType: "text",
          });
        }
      }
    }
    res.sendStatus(200);
  } else {
    res.sendStatus(404);
  }
});

// Función para enviar mensajes de WhatsApp
async function sendWhatsAppMessage(phoneNumber, message) {
  const url = `https://graph.instagram.com/v18.0/${process.env.WHATSAPP_PHONE_NUMBER_ID}/messages`;

  const response = await fetch(url, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${process.env.WHATSAPP_API_TOKEN}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      messaging_product: "whatsapp",
      to: phoneNumber,
      type: "text",
      text: { body: message },
    }),
  });

  return response.json();
}

// Endpoint para enviar respuesta desde admin
app.post("/api/whatsapp/send", async (req, res) => {
  try {
    const { phoneNumber, message } = req.body;
    const result = await sendWhatsAppMessage(phoneNumber, message);
    res.json(result);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
```

---

### **Fase 3: Configurar Webhook en WhatsApp**

1. Ve a [WhatsApp Business API Dashboard](https://business.facebook.com/)
2. En "App Configuration" → "Webhooks"
3. Establece:
   - **Webhook URL**: `https://tu-dominio.com/api/webhooks/whatsapp`
   - **Verify Token**: El valor de `WEBHOOK_VERIFY_TOKEN` de tu `.env`
4. Suscríbete a eventos: `messages`, `message_status`

---

### **Fase 4: Variables de Entorno Frontend**

Crear `.env.local` en `web/`:

```env
VITE_FIREBASE_API_KEY=tu_api_key
VITE_FIREBASE_AUTH_DOMAIN=tu_auth_domain
VITE_FIREBASE_PROJECT_ID=tu_project_id
VITE_FIREBASE_STORAGE_BUCKET=tu_storage_bucket
VITE_FIREBASE_MESSAGING_SENDER_ID=tu_messaging_sender_id
VITE_FIREBASE_APP_ID=tu_app_id
VITE_BACKEND_URL=http://localhost:3000
```

---

### **Fase 5: Reglas de Firebase Security**

Actualiza `firestore.rules`:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Proteger colecciones de WhatsApp
    match /whatsapp_conversations/{document=**} {
      allow read, write: if request.auth != null;
    }
    match /whatsapp_messages/{document=**} {
      allow read, write: if request.auth != null;
    }
    match /whatsapp_orders/{document=**} {
      allow read, write: if request.auth != null;
    }
  }
}
```

---

## 📋 Checklist de Implementación

- [ ] Crear cuenta en Meta/WhatsApp Business
- [ ] Obtener API Token y Phone Number ID
- [ ] Crear proyecto Express/Cloud Functions
- [ ] Implementar webhook para recibir mensajes
- [ ] Configurar webhook en WhatsApp Dashboard
- [ ] Crear índices en Firestore (si es necesario)
- [ ] Implementar autenticación en el backend
- [ ] Desplegar en producción (Firebase, Heroku, Google Cloud, etc.)
- [ ] Probar envío y recepción de mensajes
- [ ] Integrar IA para procesamiento de órdenes (OpenAI, Dialogflow)

---

## 🔧 Mejoras Futuras

### Nivel 2 - Automático

- [ ] Procesar órdenes con IA (OpenAI API)
- [ ] Validar productos contra inventario
- [ ] Calcular precios dinámicos
- [ ] Enviar confirmación automática
- [ ] Validar direcciones con Google Maps API

### Nivel 3 - Avanzado

- [ ] Notificaciones en tiempo real (WebSockets)
- [ ] Historial completo de conversaciones
- [ ] Integración con sistema de pagos
- [ ] Estadísticas de ventas desde WhatsApp
- [ ] Soporte multiidioma
- [ ] Chatbot con Dialogflow o similar

---

## 📱 Prueba Rápida

Para probar la integración sin servidor, puedes:

1. Instalar [ngrok](https://ngrok.com/)
2. Ejecutar: `ngrok http 3000`
3. Usar la URL de ngrok como webhook temporal

```bash
# Terminal 1
npm run dev  # Frontend

# Terminal 2
node backend/functions/webhooks.js  # Backend local

# Terminal 3
ngrok http 3000  # Exponer localmente
```

---

## 🆘 Troubleshooting

### "Webhook no se conecta"

- Verifica que el `WEBHOOK_VERIFY_TOKEN` sea idéntico
- Usa ngrok para probar localmente
- Revisa los logs de WhatsApp Dashboard

### "No recibo mensajes"

- Confirma que el webhook está activo en WhatsApp
- Revisa la colección `whatsapp_conversations` en Firestore
- Valida que el teléfono esté verificado en WhatsApp Business

### "El componente no carga"

- Verifica que Firebase esté inicializado correctamente
- Revisa la consola del navegador (F12)
- Asegúrate de que las colecciones existan en Firestore

---

## 📚 Recursos Útiles

- [WhatsApp Business API Docs](https://developers.facebook.com/docs/whatsapp/cloud-api/get-started)
- [Firebase Admin SDK](https://firebase.google.com/docs/database/admin/start)
- [OpenAI API](https://openai.com/api/) - Para procesamiento de IA
- [Dialogflow](https://cloud.google.com/dialogflow) - Para chatbots más avanzados
