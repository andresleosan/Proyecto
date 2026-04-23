#!/usr/bin/env node
const fs = require('fs');
const path = require('path');

// Obtener la ruta del archivo de credenciales
const credentialsPath = process.env.GOOGLE_APPLICATION_CREDENTIALS;

if (!credentialsPath) {
  console.error('\n❌ ERROR: Debes establecer la variable de entorno GOOGLE_APPLICATION_CREDENTIALS\n');
  console.error('📝 En PowerShell, ejecuta:\n');
  console.error('$env:GOOGLE_APPLICATION_CREDENTIALS = "C:\\ruta\\a\\serviceAccount.json"\n');
  process.exit(1);
}

// Verificar que el archivo existe
if (!fs.existsSync(credentialsPath)) {
  console.error(`\n❌ ERROR: El archivo no existe: ${credentialsPath}\n`);
  process.exit(1);
}

// Cargar el archivo de credenciales (similar a Java FileInputStream)
let admin;
try {
  admin = require('firebase-admin');
} catch (e) {
  console.error('❌ ERROR: Falta la dependencia "firebase-admin"');
  console.error('Instálala con: npm install firebase-admin\n');
  process.exit(1);
}

// Leer el archivo de credenciales explícitamente
const serviceAccountKey = JSON.parse(fs.readFileSync(credentialsPath, 'utf8'));

// Inicializar Firebase Admin (similar a FirebaseApp.initializeApp en Java)
if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccountKey)
  });
  console.log(`✅ Firebase initialized with credentials from: ${credentialsPath}\n`);
}

const db = admin.firestore();

const products = [
  { id: 'p1', name: 'Manzana Roja', price_cents: 250, stock: 100 },
  { id: 'p2', name: 'Pan Integral', price_cents: 150, stock: 50 },
  { id: 'p3', name: 'Leche Entera 1L', price_cents: 350, stock: 30 },
  { id: 'p4', name: 'Queso Cheddar', price_cents: 650, stock: 20 },
  { id: 'p5', name: 'Huevos (Docena)', price_cents: 280, stock: 40 },
  { id: 'p6', name: 'Yogur Natural', price_cents: 180, stock: 45 },
  { id: 'p7', name: 'Arroz 1kg', price_cents: 420, stock: 60 },
  { id: 'p8', name: 'Azúcar 1kg', price_cents: 380, stock: 35 }
];

(async () => {
  console.log('🔄 Seeding products...\n');
  for (const p of products) {
    await db.collection('products').doc(p.id).set({
      name: p.name,
      price_cents: p.price_cents,
      stock: p.stock,
      createdAt: admin.firestore.FieldValue.serverTimestamp()
    });
    console.log(`  ✓ ${p.id}: ${p.name}`);
  }
  console.log('\n✅ Products loaded successfully!\n');
  process.exit(0);
})().catch(err => { 
  console.error('\n❌ Error:', err.message);
  process.exit(1); 
});
