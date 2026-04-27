#!/usr/bin/env node
// Minimal seeding script for products. Requires firebase-admin and a Service Account.
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

const products = [
  { id: 'p1', name: 'Manzana', price_cents: 250, stock: 100 },
  { id: 'p2', name: 'Pan', price_cents: 150, stock: 50 },
  { id: 'p3', name: 'Leche', price_cents: 350, stock: 30 }
];

(async () => {
  console.log('Seeding products...');
  for (const p of products) {
    await db.collection('products').doc(p.id).set({
      name: p.name,
      price_cents: p.price_cents,
      stock: p.stock,
      createdAt: admin.firestore.FieldValue.serverTimestamp()
    });
    console.log(' - seeded', p.id);
  }
  console.log('Products seeded successfully.');
  process.exit(0);
})().catch(err => { console.error(err); process.exit(1); });
