#!/usr/bin/env node
// Minimal seeding script for roles. Requires firebase-admin and a Service Account.
if (!process.env.GOOGLE_APPLICATION_CREDENTIALS) {
  console.error('\nERROR: Set the environment variable GOOGLE_APPLICATION_CREDENTIALS to the path of your service account JSON.\nExample (PowerShell): $env:GOOGLE_APPLICATION_CREDENTIALS = \"C:\\path\\to\\serviceAccount.json\"\n');
  process.exit(1);
}

let admin;
try {
  admin = require('firebase-admin');
} catch (e) {
  console.error('ERROR: Missing dependency `firebase-admin`. Install it with: npm install firebase-admin');
  process.exit(1);
}

if (!admin.apps.length) {
  admin.initializeApp({ credential: admin.credential.applicationDefault() });
}

const db = admin.firestore();

const roles = [
  { id: 'admin', name: 'Administrador' },
  { id: 'cajero', name: 'Cajero' },
  { id: 'gerente', name: 'Gerente' }
];

(async () => {
  console.log('Seeding roles...');
  for (const r of roles) {
    await db.collection('roles').doc(r.id).set({ name: r.name, createdAt: admin.firestore.FieldValue.serverTimestamp() });
    console.log(' - seeded', r.id);
  }
  console.log('Roles seeded successfully.');
  process.exit(0);
})().catch(err => { console.error(err); process.exit(1); });
