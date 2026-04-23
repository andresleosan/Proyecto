# Guía de Implementación: Backend para WhatsApp Integration

## 📋 Tabla de Contenidos

1. [Configuración de Twilio](#configuración-de-twilio)
2. [Crear Backend](#crear-backend)
3. [Configurar Firebase](#configurar-firebase)
4. [Desplegar](#desplegar)
5. [Pruebas](#pruebas)

---

## 🔧 Configuración de Twilio

### Paso 1: Crear Cuenta en Twilio

1. Ir a [Twilio.com](https://www.twilio.com)
2. Registrarse con email y contraseña
3. Verificar el email
4. Completar el formulario de datos personales

### Paso 2: Obtener Número de WhatsApp

1. En el Dashboard, ir a: **Messaging** > **Try it out** > **Send an SMS**
2. Hacer clic en **Explore** en la sección WhatsApp
3. Seguir los pasos para obtener un número de WhatsApp Business
4. Verificar el número de teléfono

### Paso 3: Obtener Credenciales

```
Ir a: Account > General
Copiar:
- Account SID: AC...
- Auth Token: [token]

Ir a: Messaging > Services > Tu Servicio
Copiar:
- Sender Phone Number (WhatsApp): whatsapp:+1...
```

### Paso 4: Configurar Webhook

1. Ir a: **Messaging** > **Services** > Tu servicio
2. Hacer clic en **Outbound Settings**
3. En **Webhook URL**, ingresar: `https://tu-dominio.com/webhook/whatsapp`
4. Seleccionar **HTTP POST**
5. Guardar

---

## 🛠️ Crear Backend

### Opción 1: Setup Rápido (Recomendado)

#### 1.1 Crear carpeta del backend

```bash
# En la raíz del proyecto
mkdir backend
cd backend
```

#### 1.2 Inicializar Node.js

```bash
npm init -y
npm install express twilio firebase-admin dotenv cors body-parser
npm install -D @types/express @types/node typescript ts-node nodemon
```

#### 1.3 Crear estructura de archivos

```
backend/
├── src/
│   └── server.ts
├── .env
├── package.json
├── tsconfig.json
└── nodemon.json
```

#### 1.4 Archivo: `tsconfig.json`

```json
{
  "compilerOptions": {
    "target": "ES2020",
    "module": "commonjs",
    "lib": ["ES2020"],
    "outDir": "./dist",
    "rootDir": "./src",
    "strict": true,
    "esModuleInterop": true,
    "skipLibCheck": true,
    "forceConsistentCasingInFileNames": true,
    "resolveJsonModule": true,
    "declaration": true,
    "declarationMap": true,
    "sourceMap": true,
    "noImplicitAny": true
  },
  "include": ["src/**/*"],
  "exclude": ["node_modules"]
}
```

#### 1.5 Archivo: `nodemon.json`

```json
{
  "watch": ["src"],
  "ext": "ts",
  "ignore": ["src/**/*.test.ts"],
  "exec": "ts-node",
  "events": {
    "restart": "clear"
  },
  "delay": 500
}
```

#### 1.6 Archivo: `.env`

```env
# Twilio
TWILIO_ACCOUNT_SID=your_account_sid_here
TWILIO_AUTH_TOKEN=your_auth_token_here
TWILIO_WHATSAPP_NUMBER=whatsapp:+1234567890

# Firebase
FIREBASE_PROJECT_ID=your_project_id
FIREBASE_PRIVATE_KEY=your_private_key_with_quotes
FIREBASE_CLIENT_EMAIL=your_service_account_email

# Server
PORT=3001
NODE_ENV=development
WEBHOOK_URL=https://your-domain.com/webhook/whatsapp
ALLOWED_ORIGINS=http://localhost:5173,https://tu-dominio.com
```

#### 1.7 Archivo: `src/server.ts`

Copiar desde: [backend-whatsapp-example.ts](./backend-whatsapp-example.ts)

#### 1.8 Actualizar `package.json`

```json
{
  "scripts": {
    "dev": "nodemon",
    "build": "tsc",
    "start": "node dist/server.js",
    "test": "echo \"Error: no test specified\" && exit 1"
  }
}
```

#### 1.9 Ejecutar en desarrollo

```bash
npm run dev
```

Debería ver:

```
🚀 WhatsApp Server running on port 3001
📱 Webhook URL: https://your-domain.com/webhook/whatsapp
```

---

## 🔥 Configurar Firebase

### Paso 1: Crear Proyecto Firebase (si no existe)

1. Ir a [Firebase Console](https://console.firebase.google.com)
2. Crear nuevo proyecto
3. Habilitar Firestore Database
4. Ir a: **Settings** > **Service Account**
5. Descargar como JSON

### Paso 2: Obtener Credenciales

```json
{
  "type": "service_account",
  "project_id": "your_project_id",
  "private_key_id": "...",
  "private_key": "-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n",
  "client_email": "firebase-adminsdk-xxxx@your_project_id.iam.gserviceaccount.com",
  "client_id": "...",
  "auth_uri": "https://accounts.google.com/o/oauth2/auth",
  "token_uri": "https://oauth2.googleapis.com/token",
  "auth_provider_x509_cert_url": "https://www.googleapis.com/oauth2/v1/certs"
}
```

### Paso 3: Crear Colecciones en Firebase

```javascript
// Ejecutar en Firebase Console (Firestore)

// 1. Crear documento de prueba en "whatsapp_conversations"
db.collection("whatsapp_conversations").add({
  clientPhone: "+573005555555",
  clientName: "Test Client",
  lastMessage: "Hola",
  lastMessageTime: new Date(),
  status: "active",
  createdAt: new Date(),
  messages: [],
  unreadCount: 0,
});

// 2. Crear documento de prueba en "whatsapp_orders"
db.collection("whatsapp_orders").add({
  conversationId: "conv_id",
  clientPhone: "+573005555555",
  clientName: "Test Client",
  items: [
    {
      productId: "prod_1",
      productName: "Arroz",
      quantity: 2,
      price: 2500,
      subtotal: 5000,
    },
  ],
  total: 5000,
  deliveryAddress: "Calle 1 #1-1",
  status: "pending",
  paymentMethod: "pending",
  notes: "",
  createdAt: new Date(),
  updatedAt: new Date(),
});
```

---

## 🌍 Desplegar

### Opción 1: Heroku (Gratis - Recomendado para pruebas)

#### 1.1 Instalar Heroku CLI

```bash
# Windows
choco install heroku-cli

# o descargar desde: https://devcenter.heroku.com/articles/heroku-cli
```

#### 1.2 Crear app en Heroku

```bash
heroku login
heroku create tu-nombre-app
```

#### 1.3 Configurar variables de entorno

```bash
heroku config:set TWILIO_ACCOUNT_SID=your_account_sid
heroku config:set TWILIO_AUTH_TOKEN=your_auth_token
heroku config:set TWILIO_WHATSAPP_NUMBER=whatsapp:+1234567890
heroku config:set FIREBASE_PROJECT_ID=your_project_id
heroku config:set FIREBASE_PRIVATE_KEY='your_private_key'
heroku config:set FIREBASE_CLIENT_EMAIL=your_email
heroku config:set WEBHOOK_URL=https://tu-nombre-app.herokuapp.com/webhook/whatsapp
```

#### 1.4 Crear Procfile

```
web: npm start
```

#### 1.5 Deploy

```bash
git add .
git commit -m "Add WhatsApp backend"
git push heroku main
```

#### 1.6 Verificar

```bash
heroku logs --tail
```

### Opción 2: DigitalOcean (Recomendado para producción)

1. Crear Droplet con Ubuntu 22.04
2. Instalar Node.js: `curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash - && sudo apt-get install -y nodejs`
3. Clonar repositorio
4. Instalar dependencias: `npm install`
5. Usar PM2 para ejecutar: `npm install -g pm2 && pm2 start src/server.ts`
6. Configurar NGINX como reverse proxy
7. Instalar SSL con Let's Encrypt

### Opción 3: AWS EC2 / Google Cloud Run / Azure

Seguir las guías oficiales de cada proveedor.

---

## 🧪 Pruebas

### Prueba 1: Health Check

```bash
curl http://localhost:3001/health

# Respuesta esperada:
# {"status":"OK","timestamp":"2024-..."}
```

### Prueba 2: Enviar Mensaje desde Admin

```bash
curl -X POST http://localhost:3001/api/whatsapp/send \
  -H "Content-Type: application/json" \
  -d '{
    "conversationId": "conv_id",
    "clientPhone": "+573005555555",
    "message": "Hola desde el admin!"
  }'
```

### Prueba 3: Desde WhatsApp Real

1. Ir a Twilio Console
2. Copiar tu número de WhatsApp temporal
3. Enviar un mensaje a ese número
4. Ver en Firestore si se creó la conversación

### Prueba 4: En la aplicación

1. Acceder a http://localhost:5173
2. Hacer clic en la pestaña "WhatsApp"
3. Deberías ver las conversaciones y órdenes

---

## 🐛 Solución de Problemas

### Error: "TWILIO_ACCOUNT_SID is not defined"

**Solución**: Verificar que `.env` está en la carpeta `backend/`

### Error: "Firebase initialization failed"

**Solución**: Verificar que `FIREBASE_PRIVATE_KEY` está con comillas simples

### Webhook no recibe mensajes

**Solución**:

- Verificar que la URL es accesible desde internet
- Usar `ngrok` para pruebas locales: `ngrok http 3001`
- Copiar la URL de ngrok a Twilio Webhook URL

### Error 403 en webhooks

**Solución**: Verificar ALLOWED_ORIGINS en `.env`

---

## 📚 Recursos Adicionales

- [Documentación de Twilio WhatsApp](https://www.twilio.com/docs/whatsapp)
- [Firebase Admin SDK](https://firebase.google.com/docs/firestore)
- [Express.js Documentation](https://expressjs.com/)
- [Heroku Deployment Guide](https://devcenter.heroku.com/)

---

## ✅ Checklist de Implementación

- [ ] Cuenta Twilio creada
- [ ] Número WhatsApp obtenido
- [ ] Credenciales de Twilio guardadas
- [ ] Backend creado localmente
- [ ] Variables de entorno configuradas
- [ ] Firebase configurado
- [ ] Webhook funcionando
- [ ] Backend desplegado
- [ ] Webhook actualizado en Twilio
- [ ] Pruebas completadas
- [ ] Frontend conectado
- [ ] Listo para producción
