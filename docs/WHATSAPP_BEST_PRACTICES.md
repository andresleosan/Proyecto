# 🎯 Mejores Prácticas - WhatsApp Integration

## 1. Seguridad

### ✅ Autenticación

- [ ] Implementar JWT en el backend
- [ ] Validar requests con tokens
- [ ] Usar HTTPS en producción
- [ ] Encriptar API keys en .env

```javascript
// Validar API key
const verifyApiKey = (req, res, next) => {
  const apiKey = req.headers["x-api-key"];
  if (apiKey !== process.env.API_KEY) {
    return res.status(401).json({ error: "Unauthorized" });
  }
  next();
};

app.use("/api/whatsapp/", verifyApiKey);
```

### ✅ Validación de Webhooks

```javascript
// Verificar firma del webhook de WhatsApp
const crypto = require("crypto");

function verifyWebhook(req, appSecret) {
  const body = req.rawBody;
  const signature = req.headers["x-hub-signature-256"];

  const hash = crypto
    .createHmac("sha256", appSecret)
    .update(body)
    .digest("hex");

  return `sha256=${hash}` === signature;
}
```

### ✅ Rate Limiting

```javascript
const rateLimit = require("express-rate-limit");

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutos
  max: 100, // límite de 100 requests
});

app.use("/api/", limiter);
```

---

## 2. Manejo de Errores

### ✅ Estructura uniforme de errores

```javascript
class ApiError extends Error {
  constructor(statusCode, message) {
    super(message);
    this.statusCode = statusCode;
  }
}

app.use((err, req, res, next) => {
  const statusCode = err.statusCode || 500;
  res.status(statusCode).json({
    error: err.message,
    status: statusCode,
    timestamp: new Date().toISOString(),
  });
});
```

### ✅ Logging

```javascript
const fs = require("fs");

function logEvent(level, message, data) {
  const timestamp = new Date().toISOString();
  const logEntry = `[${timestamp}] ${level}: ${message} ${JSON.stringify(data)}\n`;

  fs.appendFileSync("logs/app.log", logEntry);
  console.log(logEntry);
}

logEvent("INFO", "Mensaje recibido", { phoneNumber, message });
```

---

## 3. Performance

### ✅ Caching

```javascript
const cache = new Map();

async function getCachedConversations(cacheTime = 60000) {
  const cacheKey = "conversations";

  if (cache.has(cacheKey)) {
    const cached = cache.get(cacheKey);
    if (Date.now() - cached.timestamp < cacheTime) {
      return cached.data;
    }
  }

  const data = await getConversations();
  cache.set(cacheKey, { data, timestamp: Date.now() });
  return data;
}
```

### ✅ Batching de requests

```javascript
// En lugar de enviar 100 mensajes individualmente
async function sendBatchMessages(messages) {
  const batches = [];
  for (let i = 0; i < messages.length; i += 10) {
    batches.push(messages.slice(i, i + 10));
  }

  for (const batch of batches) {
    await Promise.all(batch.map((m) => sendWhatsAppMessage(m.phone, m.text)));
    await new Promise((r) => setTimeout(r, 1000)); // Esperar 1s entre batches
  }
}
```

---

## 4. Monitoreo

### ✅ Métricas

```javascript
const metrics = {
  messagesReceived: 0,
  messagesSent: 0,
  ordersCreated: 0,
  errorsCount: 0,
};

app.get("/api/metrics", (req, res) => {
  res.json(metrics);
});

// Incrementar en cada acción
metrics.messagesReceived++;
```

### ✅ Alertas

```javascript
async function sendAlert(message) {
  // Enviar alerta por email o SMS
  if (metrics.errorsCount > 10) {
    console.error("⚠️ Muchos errores detectados");
    // Notificar admin
  }
}
```

---

## 5. Escalabilidad

### ✅ Queue de mensajes

```javascript
const Queue = require("bull");
const messageQueue = new Queue("whatsapp-messages");

// Agregar a queue
await messageQueue.add(
  { phoneNumber, message },
  { attempts: 3, backoff: "exponential" },
);

// Procesar queue
messageQueue.process(async (job) => {
  await sendWhatsAppMessage(job.data.phoneNumber, job.data.message);
});
```

### ✅ Usar Cloud Functions (Firebase)

```javascript
// Reemplaza el servidor Express con Cloud Functions
const functions = require("firebase-functions");

exports.whatsappWebhook = functions.https.onRequest(async (req, res) => {
  // Mismo código del webhook
  // Ejecuta automáticamente y escala
});
```

---

## 6. Experiencia del Usuario (Frontend)

### ✅ Indicadores de escritura

```typescript
// Mostrar que el admin está escribiendo
const [isTyping, setIsTyping] = useState(false);

useEffect(() => {
  // Enviar "is_typing: true" cada segundo mientras el admin escribe
}, []);
```

### ✅ Confirmación de entrega

```typescript
// Mostrar checkmark en mensajes confirmados
const MessageItem = ({ message }) => (
  <div>
    {message.text}
    {message.delivered && <span>✓✓</span>}
  </div>
);
```

### ✅ Buscar en conversaciones

```typescript
const [searchTerm, setSearchTerm] = useState("");

const filteredConversations = conversations.filter(
  (conv) =>
    conv.customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    conv.phoneNumber.includes(searchTerm),
);
```

---

## 7. Testing

### ✅ Test unitario del webhook

```javascript
const request = require("supertest");

describe("POST /api/webhooks/whatsapp", () => {
  it("should save message to Firestore", async () => {
    const res = await request(app)
      .post("/api/webhooks/whatsapp")
      .send({
        object: "whatsapp_business_account",
        entry: [
          {
            changes: [
              {
                field: "messages",
                value: {
                  messages: [
                    {
                      from: "5491234567890",
                      text: { body: "Hola" },
                    },
                  ],
                },
              },
            ],
          },
        ],
      });

    expect(res.status).toBe(200);
  });
});
```

### ✅ Test de component

```typescript
import { render, screen } from '@testing-library/react';
import WhatsAppChat from './WhatsAppChat';

describe('WhatsAppChat', () => {
  it('should render conversations list', () => {
    render(<WhatsAppChat />);
    expect(screen.getByText('💬 WhatsApp Chats')).toBeInTheDocument();
  });
});
```

---

## 8. Documentación

### ✅ Comentarios en código

```javascript
/**
 * Recibe mensajes del webhook de WhatsApp
 * @param {string} phoneNumber - Teléfono del cliente
 * @param {string} message - Contenido del mensaje
 * @returns {Promise<string>} ID del mensaje guardado
 * @throws {Error} Si hay error al guardar
 */
async function saveMessage(phoneNumber, message) {
  // ...
}
```

### ✅ API Documentation

```javascript
/**
 * POST /api/whatsapp/send
 *
 * Envía un mensaje a un cliente
 *
 * Body:
 * {
 *   "phoneNumber": "5491234567890",
 *   "message": "Tu mensaje",
 *   "conversationId": "doc_id"
 * }
 *
 * Response: { success: true, data: {...} }
 */
```

---

## 9. Deployment

### ✅ Checklist pre-producción

- [ ] Variables de entorno configuradas
- [ ] Firebase Rules publicadas
- [ ] SSL/HTTPS habilitado
- [ ] Backups de datos configurados
- [ ] Logs habilitados
- [ ] Monitoreo activo
- [ ] Plan de rollback
- [ ] Prueba de failover

### ✅ Opciones de hosting

| Opción                   | Pros                     | Contras                |
| ------------------------ | ------------------------ | ---------------------- |
| Firebase Cloud Functions | Serverless, auto-scaling | Costo por invocación   |
| Heroku                   | Fácil deployment         | Caro en producción     |
| Google Cloud Run         | Containerizado           | Requiere Docker        |
| AWS Lambda               | Escalable                | Complejo de configurar |

---

## 10. Mantenimiento

### ✅ Limpieza de datos antigos

```javascript
// Archivar conversaciones inactivas > 30 días
async function archiveOldConversations() {
  const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);

  const snapshot = await db
    .collection("whatsapp_conversations")
    .where("lastMessageDate", "<", thirtyDaysAgo)
    .get();

  for (const doc of snapshot.docs) {
    await doc.ref.update({ status: "archived" });
  }
}
```

### ✅ Backup automático

```javascript
// Ejecutar diariamente con Cloud Scheduler
exports.backupDatabase = functions.pubsub
  .schedule("every 24 hours")
  .onRun(async (context) => {
    // Copiar datos a backup collection
  });
```
