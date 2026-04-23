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

const roles = [
  { id: 'admin', name: 'Administrador' },
  { id: 'cajero', name: 'Cajero' },
  { id: 'gerente', name: 'Gerente' }
];

(async () => {
  console.log('🔄 Seeding roles...\n');
  for (const r of roles) {
    await db.collection('roles').doc(r.id).set({ 
      name: r.name, 
      createdAt: admin.firestore.FieldValue.serverTimestamp() 
    });
    console.log(`  ✓ ${r.id}: ${r.name}`);
  }
  console.log('\n✅ Roles loaded successfully!\n');
  process.exit(0);
})().catch(err => { 
  console.error('\n❌ Error:', err.message);
  process.exit(1); 
});
