# Método 2: Cargar Productos Manualmente en Firebase Console

Si prefieres no usar el script de Node.js, puedes cargar los productos directamente desde la consola de Firebase.

## 📋 Pasos

### 1. Ve a Firebase Console
[https://console.firebase.google.com/project/smartmarket-b37ce/firestore/databases/-default-/data](https://console.firebase.google.com/project/smartmarket-b37ce/firestore/databases/-default-/data)

### 2. Crea la colección "products"
- Click en "+ Iniciar colección"
- Nombre: `products`
- Click "Siguiente"

### 3. Agrega cada producto

Para cada producto, haz click en "+ Agregar documento" y rellena estos campos:

#### Producto 1
- **ID del documento**: `p1`
- **Campos**:
  - `name`: `Manzana Roja` (texto)
  - `price_cents`: `250` (número)
  - `stock`: `100` (número)
  - `createdAt`: (Firestore timestamp - se agrega automáticamente)

#### Producto 2
- **ID**: `p2`
- `name`: `Pan Integral`
- `price_cents`: `150`
- `stock`: `50`

#### Producto 3
- **ID**: `p3`
- `name`: `Leche Entera 1L`
- `price_cents`: `350`
- `stock`: `30`

#### Producto 4
- **ID**: `p4`
- `name`: `Queso Cheddar`
- `price_cents`: `650`
- `stock`: `20`

#### Producto 5
- **ID**: `p5`
- `name`: `Huevos (Docena)`
- `price_cents`: `280`
- `stock`: `40`

#### Producto 6
- **ID**: `p6`
- `name`: `Yogur Natural`
- `price_cents`: `180`
- `stock`: `45`

#### Producto 7
- **ID**: `p7`
- `name`: `Arroz 1kg`
- `price_cents`: `420`
- `stock`: `60`

#### Producto 8
- **ID**: `p8`
- `name`: `Azúcar 1kg`
- `price_cents`: `380`
- `stock`: `35`

### 4. ¡Listo!
Una vez agregues todos los productos, tu aplicación los mostrará automáticamente.

## 📊 Referencia de Precios

| Producto | Precio en Centavos | Precio USD |
|----------|-------------------|-----------|
| Manzana Roja | 250 | $2.50 |
| Pan Integral | 150 | $1.50 |
| Leche Entera 1L | 350 | $3.50 |
| Queso Cheddar | 650 | $6.50 |
| Huevos (Docena) | 280 | $2.80 |
| Yogur Natural | 180 | $1.80 |
| Arroz 1kg | 420 | $4.20 |
| Azúcar 1kg | 380 | $3.80 |

## 💡 Notas

- Los precios se guardan en **centavos** (1 dólar = 100 centavos)
- El stock es la cantidad inicial disponible
- La app actualizará automáticamente el stock cuando se registren ventas
- Las ventas se guardarán en la colección `sales` automáticamente
