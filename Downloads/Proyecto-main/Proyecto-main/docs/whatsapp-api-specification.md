# Especificación de API - WhatsApp Integration

## 🔌 Base URL

- **Desarrollo**: `http://localhost:3001`
- **Producción**: `https://tu-dominio.com`

---

## 📱 Endpoints

### 1. Health Check

```http
GET /health
```

**Respuesta:**

```json
{
  "status": "OK",
  "timestamp": "2024-01-15T10:30:45.123Z"
}
```

---

### 2. Recibir Mensajes (Webhook de Twilio)

```http
POST /webhook/whatsapp
Content-Type: application/x-www-form-urlencoded
```

**Parámetros (enviados por Twilio):**

```
From: whatsapp:+573005555555
Body: Hola, quiero hacer un pedido
ProfileName: Cliente Name
MessageSid: SM123456789
```

**Respuesta:**

```json
{
  "success": true,
  "conversationId": "conv_abc123"
}
```

**Flujo:**

1. Twilio envía el mensaje
2. Backend busca conversación existente
3. Si no existe, crea una nueva
4. Guarda el mensaje en Firebase
5. Envía respuesta automática (opcional)

---

### 3. Enviar Mensaje desde Admin

```http
POST /api/whatsapp/send
Content-Type: application/json
```

**Body:**

```json
{
  "conversationId": "conv_abc123",
  "clientPhone": "+573005555555",
  "message": "Claro, ¿qué necesitas?"
}
```

**Respuesta:**

```json
{
  "success": true,
  "messageSid": "SM987654321"
}
```

---

### 4. Crear Orden desde WhatsApp

```http
POST /api/whatsapp/orders
Content-Type: application/json
```

**Body:**

```json
{
  "conversationId": "conv_abc123",
  "clientPhone": "+573005555555",
  "clientName": "Juan Pérez",
  "items": [
    {
      "productId": "prod_001",
      "productName": "Arroz Blanco",
      "quantity": 2,
      "price": 2500,
      "subtotal": 5000
    },
    {
      "productId": "prod_002",
      "productName": "Leche Entera",
      "quantity": 1,
      "price": 3200,
      "subtotal": 3200
    }
  ],
  "deliveryAddress": "Calle 5 #12-34, Apto 302, Bogotá"
}
```

**Respuesta:**

```json
{
  "success": true,
  "orderId": "order_xyz789",
  "total": 8200,
  "items": 3
}
```

---

### 5. Actualizar Estado de Orden

```http
PUT /api/whatsapp/orders/:orderId/status
Content-Type: application/json
```

**Body:**

```json
{
  "status": "in_preparation",
  "notes": "Preparando su pedido"
}
```

**Respuesta:**

```json
{
  "success": true,
  "orderId": "order_xyz789",
  "previousStatus": "confirmed",
  "newStatus": "in_preparation"
}
```

**Estados válidos:**

- `pending` - En espera de confirmación
- `confirmed` - Confirmado
- `in_preparation` - Preparando
- `in_delivery` - En entrega
- `delivered` - Entregado
- `cancelled` - Cancelado

---

### 6. Obtener Conversaciones

```http
GET /api/whatsapp/conversations?limit=50&offset=0
```

**Respuesta:**

```json
{
  "success": true,
  "data": [
    {
      "id": "conv_abc123",
      "clientPhone": "+573005555555",
      "clientName": "Juan Pérez",
      "lastMessage": "¿Pueden entregar hoy?",
      "lastMessageTime": "2024-01-15T10:30:45.123Z",
      "status": "active",
      "createdAt": "2024-01-15T09:15:30.000Z",
      "unreadCount": 2
    }
  ],
  "total": 150,
  "limit": 50,
  "offset": 0
}
```

---

### 7. Obtener Conversación Específica

```http
GET /api/whatsapp/conversations/:conversationId
```

**Respuesta:**

```json
{
  "success": true,
  "data": {
    "id": "conv_abc123",
    "clientPhone": "+573005555555",
    "clientName": "Juan Pérez",
    "messages": [
      {
        "id": "msg_001",
        "sender": "client",
        "message": "Hola",
        "timestamp": "2024-01-15T09:15:30.000Z",
        "type": "text"
      },
      {
        "id": "msg_002",
        "sender": "admin",
        "message": "¡Hola! ¿En qué te podemos ayudar?",
        "timestamp": "2024-01-15T09:16:00.000Z",
        "type": "text"
      }
    ]
  }
}
```

---

### 8. Obtener Órdenes

```http
GET /api/whatsapp/orders?status=pending&limit=50
```

**Parámetros query:**

- `status` (opcional): `pending`, `confirmed`, `in_preparation`, `in_delivery`, `delivered`, `cancelled`
- `limit` (opcional, default: 50)
- `offset` (opcional, default: 0)

**Respuesta:**

```json
{
  "success": true,
  "data": [
    {
      "id": "order_xyz789",
      "conversationId": "conv_abc123",
      "clientPhone": "+573005555555",
      "clientName": "Juan Pérez",
      "items": [
        {
          "productId": "prod_001",
          "productName": "Arroz Blanco",
          "quantity": 2,
          "price": 2500,
          "subtotal": 5000
        }
      ],
      "total": 5000,
      "deliveryAddress": "Calle 5 #12-34",
      "status": "pending",
      "paymentMethod": "pending",
      "createdAt": "2024-01-15T10:30:45.123Z",
      "updatedAt": "2024-01-15T10:30:45.123Z"
    }
  ],
  "total": 25,
  "pending": 8
}
```

---

### 9. Obtener Estadísticas

```http
GET /api/whatsapp/stats
```

**Respuesta:**

```json
{
  "success": true,
  "data": {
    "totalConversations": 250,
    "activeConversations": 15,
    "totalOrders": 89,
    "pendingOrders": 12,
    "inDeliveryOrders": 5,
    "deliveredOrders": 72,
    "totalRevenue": 450000,
    "averageOrderValue": 5056.18,
    "conversionRate": 35.6,
    "responseTime": "2m 15s"
  }
}
```

---

### 10. Enviar Notificación

```http
POST /api/whatsapp/notifications
Content-Type: application/json
```

**Body:**

```json
{
  "clientPhone": "+573005555555",
  "type": "order_update",
  "title": "Tu pedido está en camino",
  "message": "Tu pedido llegará en 30 minutos",
  "data": {
    "orderId": "order_xyz789",
    "estimatedTime": 30
  }
}
```

**Respuesta:**

```json
{
  "success": true,
  "messageSid": "SM123456789",
  "deliveryStatus": "queued"
}
```

---

## 🔐 Autenticación

Actualmente no hay autenticación, pero para producción agregar:

```http
Authorization: Bearer token_aqui
```

---

## ❌ Códigos de Error

| Código | Descripción                                |
| ------ | ------------------------------------------ |
| 200    | OK - Exitoso                               |
| 201    | Created - Recurso creado                   |
| 400    | Bad Request - Parámetros inválidos         |
| 401    | Unauthorized - Falta autenticación         |
| 404    | Not Found - Recurso no encontrado          |
| 500    | Internal Server Error - Error del servidor |
| 503    | Service Unavailable - Twilio no disponible |

**Ejemplo de error:**

```json
{
  "success": false,
  "error": "Missing required fields: conversationId, message",
  "code": 400
}
```

---

## 📊 Modelos de Datos

### Conversación

```json
{
  "id": "string (Firestore Doc ID)",
  "clientPhone": "+57XXXXXXXXXX",
  "clientName": "string",
  "lastMessage": "string",
  "lastMessageTime": "timestamp",
  "status": "active|inactive|archived",
  "createdAt": "timestamp",
  "messages": [
    {
      "id": "string",
      "sender": "client|admin",
      "message": "string",
      "timestamp": "timestamp",
      "type": "text|order|delivery|system",
      "mediaUrl": "string (optional)"
    }
  ],
  "unreadCount": "number"
}
```

### Orden

```json
{
  "id": "string (Firestore Doc ID)",
  "conversationId": "string",
  "clientPhone": "+57XXXXXXXXXX",
  "clientName": "string",
  "items": [
    {
      "productId": "string",
      "productName": "string",
      "quantity": "number",
      "price": "number",
      "subtotal": "number"
    }
  ],
  "total": "number",
  "deliveryAddress": "string",
  "deliveryCoordinates": {
    "latitude": "number",
    "longitude": "number"
  },
  "status": "pending|confirmed|in_preparation|in_delivery|delivered|cancelled",
  "paymentMethod": "cash|bank_transfer|pending",
  "notes": "string",
  "createdAt": "timestamp",
  "updatedAt": "timestamp",
  "estimatedDelivery": "timestamp (optional)"
}
```

---

## 🔄 Flujos de Integración

### Flujo 1: Cliente Envía Mensaje

```
Cliente (WhatsApp)
  → Twilio recibe
  → POST /webhook/whatsapp
  → Backend procesa
  → Guarda en Firebase
  → Frontend se actualiza (Real-time)
  → Admin ve el mensaje
```

### Flujo 2: Admin Responde

```
Admin (React App)
  → POST /api/whatsapp/send
  → Backend envía a Twilio
  → Twilio envía a cliente
  → Guarda en Firebase
  → Cliente recibe en WhatsApp
```

### Flujo 3: Crear Orden

```
Cliente (WhatsApp)
  → Solicita hacer pedido
  → Admin crea orden vía POST /api/whatsapp/orders
  → Se guarda en Firebase
  → Se notifica al cliente
  → Aparece en panel de órdenes
```

---

## 🧪 Ejemplos con cURL

### Prueba de salud

```bash
curl http://localhost:3001/health
```

### Enviar mensaje

```bash
curl -X POST http://localhost:3001/api/whatsapp/send \
  -H "Content-Type: application/json" \
  -d '{
    "conversationId": "conv_123",
    "clientPhone": "+573005555555",
    "message": "Hola!"
  }'
```

### Crear orden

```bash
curl -X POST http://localhost:3001/api/whatsapp/orders \
  -H "Content-Type: application/json" \
  -d '{
    "conversationId": "conv_123",
    "clientPhone": "+573005555555",
    "clientName": "Juan",
    "items": [
      {"productId": "1", "productName": "Arroz", "quantity": 2, "price": 2500, "subtotal": 5000}
    ],
    "deliveryAddress": "Calle 5 #12-34"
  }'
```

---

## 📝 Notas Importantes

1. **Webhook de Twilio**: Debe ser una URL HTTPS pública
2. **CORS**: Configurar para permitir requests del frontend
3. **Rate Limiting**: Agregar para evitar abuso
4. **Logging**: Implementar para debugging
5. **Validación**: Validar todos los inputs en el backend
6. **Encriptación**: Encriptar datos sensibles en Firebase
