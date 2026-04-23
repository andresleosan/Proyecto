# Cargar Productos en Firebase Firestore

## ✅ Requisitos

1. **Archivo de credenciales** de Firebase (Service Account JSON)
   - Ve a Firebase Console → Proyecto → Project Settings
   - Pestaña "Service Accounts"
   - Descarga el archivo JSON

## 📋 Pasos

### 1. Instalar dependencias en la raíz del proyecto

```powershell
npm install
```

### 2. Configurar credenciales de Firebase

En PowerShell, ejecuta:

```powershell
$env:GOOGLE_APPLICATION_CREDENTIALS = "C:\ruta\a\tu\serviceAccount.json"
```

Reemplaza `C:\ruta\a\tu\serviceAccount.json` con la ruta real de tu archivo.

### 3. Cargar los productos

En la raíz del proyecto (`Proyecto-main`), ejecuta:

```powershell
npm run seed:products
```

### 4. Verificar en Firebase Console

1. Ve a [Firebase Console](https://console.firebase.google.com)
2. Abre tu proyecto `smartmarket-b37ce`
3. Firestore Database → Colección `products`
4. Deberías ver los 8 productos cargados

## 📊 Productos que se cargarán

| ID | Nombre | Precio | Stock |
|----|--------|--------|-------|
| p1 | Manzana Roja | $2.50 | 100 |
| p2 | Pan Integral | $1.50 | 50 |
| p3 | Leche Entera 1L | $3.50 | 30 |
| p4 | Queso Cheddar | $6.50 | 20 |
| p5 | Huevos (Docena) | $2.80 | 40 |
| p6 | Yogur Natural | $1.80 | 45 |
| p7 | Arroz 1kg | $4.20 | 60 |
| p8 | Azúcar 1kg | $3.80 | 35 |

## 💾 Sobre las Ventas

El sistema **ya está funcionando correctamente**:
- Cuando creas una venta en la app, se guarda automáticamente en la colección `sales` con todos los items
- Se actualiza el stock de cada producto automáticamente
- Cada venta tiene: fecha, total, método de pago, items detallados, y timestamp

## ⚠️ Solución de problemas

### Error: "GOOGLE_APPLICATION_CREDENTIALS no está establecido"
- Verifica que ejecutaste el comando anterior en PowerShell
- La ruta debe ser absoluta y existir el archivo

### Error: "Module not found: firebase-admin"
- Ejecuta `npm install` en la raíz del proyecto

### No ves cambios en Firestore
- Recarga la página de Firebase Console
- Verifica que el proyecto ID sea correcto
- Revisa los logs en la terminal
