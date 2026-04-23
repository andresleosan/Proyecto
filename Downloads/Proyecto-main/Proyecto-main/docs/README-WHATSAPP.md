# WhatsApp Integration para SmartMarket Admin

## 📱 Descripción

Este módulo permite integrar un sistema de ChatBot con WhatsApp directamente en la aplicación SmartMarket Admin. Los clientes pueden:

✅ Realizar pedidos por WhatsApp  
✅ Solicitar domicilios  
✅ Consultar disponibilidad  
✅ Recibir notificaciones de estado  
✅ Ver historial de órdenes

## 🏗️ Estructura del Proyecto

### Frontend (React)

```
web/src/
├── components/
│   └── WhatsAppManager.tsx          # Panel principal de WhatsApp
├── services/
│   └── whatsappService.ts           # Servicios Firestore
└── App.tsx                          # Actualizado con ruta WhatsApp
```

### Backend (Node.js/Express)

```
backend/
├── src/
│   └── server.ts                    # Servidor Express
├── .env                             # Variables de entorno
└── package.json                     # Dependencias
```

### Documentación

```
docs/
├── whatsapp-integration-strategy.md     # Estrategia completa
├── backend-implementation-guide.md      # Guía paso a paso
├── backend-whatsapp-example.ts         # Código del servidor
└── whatsapp-api-specification.md       # Especificación de API
```

---

## 🚀 Inicio Rápido

### 1. Frontend está listo

La pestaña de WhatsApp ya está integrada en la UI. Simplemente:

```bash
# El dev server ya está corriendo
# Acceder a: http://localhost:5173
# Haz clic en "💬 WhatsApp"
```

### 2. Crear Backend (IMPORTANTE)

```bash
# En la raíz del proyecto
mkdir backend
cd backend
npm init -y
npm install express twilio firebase-admin dotenv cors body-parser
npm install -D @types/express @types/node typescript ts-node nodemon
```

### 3. Configurar Twilio

- [Crear cuenta en Twilio.com](https://www.twilio.com)
- Obtener número de WhatsApp
- Copiar credenciales (Account SID, Auth Token)

### 4. Configurar Firebase

- Crear colecciones en Firestore:
  - `whatsapp_conversations`
  - `whatsapp_orders`
  - `whatsapp_settings`

### 5. Desplegar Backend

- Usar Heroku, DigitalOcean o tu servidor
- Configurar variables de entorno
- Activar webhooks en Twilio

---

## 📖 Documentación Completa

| Documento                                                              | Propósito                               |
| ---------------------------------------------------------------------- | --------------------------------------- |
| [whatsapp-integration-strategy.md](./whatsapp-integration-strategy.md) | Visión general, arquitectura y flujos   |
| [backend-implementation-guide.md](./backend-implementation-guide.md)   | Guía paso a paso para crear el backend  |
| [whatsapp-api-specification.md](./whatsapp-api-specification.md)       | Especificación de todos los endpoints   |
| [backend-whatsapp-example.ts](./backend-whatsapp-example.ts)           | Código fuente del servidor (referencia) |

---

## 🎯 Características Implementadas

### ✅ Frontend

- [x] Componente WhatsApp Manager
- [x] Panel de conversaciones
- [x] Chat integrado
- [x] Panel de órdenes
- [x] Estadísticas
- [x] Servicio Firestore
- [x] Integración con React

### ⏳ Backend (Necesario crear)

- [ ] Servidor Express
- [ ] Webhooks de Twilio
- [ ] Sincronización con Firebase
- [ ] Envío de mensajes
- [ ] Gestión de órdenes
- [ ] Notificaciones automáticas

### 📱 Twilio (Necesario configurar)

- [ ] Cuenta Twilio
- [ ] Número WhatsApp
- [ ] Credenciales API
- [ ] Webhooks configurados

---

## 🔄 Flujo de Datos

```
┌─────────────────┐
│  Cliente (WA)   │
└────────┬────────┘
         │ Envía mensaje
         ▼
┌─────────────────┐
│   Twilio API    │
└────────┬────────┘
         │ POST /webhook/whatsapp
         ▼
┌─────────────────┐
│  Backend Server │
└────────┬────────┘
         │ Procesa
         ▼
┌─────────────────┐
│   Firebase      │
│  Conversaciones │
│    & Órdenes    │
└────────┬────────┘
         │ Real-time updates
         ▼
┌─────────────────┐
│  React App      │
│   (Admin UI)    │
└─────────────────┘
```

---

## 💬 Casos de Uso

### Caso 1: Cliente Hace Pedido

```
Cliente: "Hola, quiero 2 arroz y 1 leche"
    ↓
Backend: Procesa el mensaje
    ↓
Firebase: Crea orden con estado "pending"
    ↓
Admin: Ve la orden en el panel
    ↓
Admin: Confirma y cambia estado a "confirmed"
    ↓
Cliente: Recibe notificación de confirmación
    ↓
Admin: Cambia a "in_delivery"
    ↓
Cliente: Recibe notificación de entrega
    ↓
Admin: Cambia a "delivered"
    ↓
Orden completada ✅
```

### Caso 2: Admin Responde Consulta

```
Cliente: "¿Tienen pan integral?"
    ↓
Admin ve el mensaje en el panel
    ↓
Admin escribe respuesta: "Sí, tenemos"
    ↓
Backend envía por Twilio
    ↓
Cliente recibe respuesta
```

---

## 🔧 Variables de Entorno Necesarias

### `.env` (Backend)

```env
# Twilio
TWILIO_ACCOUNT_SID=ACxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
TWILIO_AUTH_TOKEN=your_auth_token_here
TWILIO_WHATSAPP_NUMBER=whatsapp:+1234567890

# Firebase
FIREBASE_PROJECT_ID=your-project-id
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n"
FIREBASE_CLIENT_EMAIL=firebase-adminsdk@your-project.iam.gserviceaccount.com

# Server
PORT=3001
NODE_ENV=production
WEBHOOK_URL=https://tu-dominio.com/webhook/whatsapp
ALLOWED_ORIGINS=https://tu-dominio.com
```

### `.env.local` (Frontend - Vite)

```env
VITE_WHATSAPP_API_URL=https://tu-dominio.com/api/whatsapp
```

---

## 📊 Endpoints Disponibles

### Conversaciones

```
GET  /api/whatsapp/conversations          # Listar todas
GET  /api/whatsapp/conversations/:id      # Obtener una
POST /api/whatsapp/send                   # Enviar mensaje
```

### Órdenes

```
GET  /api/whatsapp/orders                 # Listar órdenes
GET  /api/whatsapp/orders/:id             # Obtener una
POST /api/whatsapp/orders                 # Crear orden
PUT  /api/whatsapp/orders/:id/status      # Actualizar estado
```

### Estadísticas

```
GET  /api/whatsapp/stats                  # Dashboard stats
```

---

## 🧪 Pruebas Locales

### 1. Probar Backend Localmente

```bash
cd backend
npm run dev

# Debería mostrar:
# 🚀 WhatsApp Server running on port 3001
```

### 2. Probar Webhooks con ngrok (para development)

```bash
# En otra terminal
ngrok http 3001

# Copiar URL de ngrok (ej: https://abcd-1234.ngrok.io)
# Agregar a Twilio: https://abcd-1234.ngrok.io/webhook/whatsapp
```

### 3. Probar Endpoints

```bash
# Health check
curl http://localhost:3001/health

# Enviar mensaje
curl -X POST http://localhost:3001/api/whatsapp/send \
  -H "Content-Type: application/json" \
  -d '{"conversationId":"test","clientPhone":"+573005555555","message":"Hola"}'
```

### 4. Desde la UI

1. Acceder a http://localhost:5173
2. Hacer clic en "💬 WhatsApp"
3. Ver datos (vacío hasta que backend esté corriendo)

---

## 📋 Checklist de Implementación

### Fase 1: Preparación

- [ ] Leer la documentación estratégica
- [ ] Crear cuenta en Twilio
- [ ] Obtener número de WhatsApp
- [ ] Configurar Firebase
- [ ] Clonar credenciales

### Fase 2: Backend

- [ ] Crear carpeta backend/
- [ ] Instalar dependencias
- [ ] Crear estructura de archivos
- [ ] Copiar código del servidor
- [ ] Configurar variables de entorno
- [ ] Probar localmente

### Fase 3: Integración

- [ ] Conectar Backend a Firebase
- [ ] Configurar webhooks de Twilio
- [ ] Probar con ngrok
- [ ] Verificar que datos se guardan

### Fase 4: Despliegue

- [ ] Elegir proveedor (Heroku/DigitalOcean/AWS)
- [ ] Desplegar backend
- [ ] Actualizar URL de webhook
- [ ] Actualizar variables de entorno
- [ ] Probar en producción

### Fase 5: Optimización

- [ ] Agregar autenticación
- [ ] Implementar rate limiting
- [ ] Mejorar manejo de errores
- [ ] Agregar logging
- [ ] Optimizar performance

---

## 🐛 Troubleshooting

### "WhatsApp Manager se ve vacío"

**Causa**: Backend no está corriendo o no tiene datos  
**Solución**: Crear backend y ejecutar en desarrollo

### "Webhook no recibe mensajes"

**Causa**: URL no es accesible desde internet  
**Solución**: Usar ngrok o desplegar en servidor público

### "Error: Firebase is not configured"

**Causa**: Credenciales inválidas  
**Solución**: Verificar .env con credenciales correctas

### "Error: TWILIO_ACCOUNT_SID is undefined"

**Causa**: .env no está en backend/  
**Solución**: Mover .env a la carpeta backend/

---

## 🚀 Próximos Pasos

1. **Crear Backend** - Seguir [backend-implementation-guide.md](./backend-implementation-guide.md)
2. **Configurar Twilio** - Obtener credenciales
3. **Desplegar** - Heroku o tu servidor
4. **Conectar APIs** - Verificar integración
5. **Mejorar UX** - Agregar más funcionalidades

---

## 📚 Recursos

- [Twilio WhatsApp Docs](https://www.twilio.com/docs/whatsapp)
- [Firebase Firestore](https://firebase.google.com/docs/firestore)
- [Express.js Guide](https://expressjs.com)
- [React Best Practices](https://react.dev)

---

## ❓ Preguntas Frecuentes

**¿Es necesario el backend?**  
Sí, el backend es esencial para recibir mensajes de Twilio y sincronizar con Firebase.

**¿Cuál es el costo de Twilio?**  
El primer mes tiene créditos gratis ($15). Luego pagas por mensajes (~$0.008 por mensaje).

**¿Puedo usar otra plataforma que no sea Twilio?**  
Sí, puedes usar WhatsApp Business API directamente, pero requiere más configuración.

**¿Cómo hago que funcione sin backend?**  
No es posible. Los mensajes de WhatsApp necesitan un servidor para procesarlos.

**¿Dónde doy soporte a clientes?**  
Tú mismo desde el panel de WhatsApp Manager en la UI.

---

## 📞 Contacto y Soporte

Para preguntas sobre la implementación:

1. Revisar la documentación
2. Consultar ejemplos de código
3. Verificar logs del backend
4. Usar console.log() para debugging

---

**¡Listo para comenzar! 🚀**
