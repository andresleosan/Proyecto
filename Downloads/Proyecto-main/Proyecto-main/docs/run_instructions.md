# Instrucciones para ejecutar el proyecto (mínimo)

Requisitos previos

- Node.js (LTS) y npm deben estar instalados y en el `PATH`.
- (Opcional para seeds) Una Service Account JSON para Firebase si quieres usar los scripts de seeding.

Instalación rápida en Windows

```powershell
# instalar Node.js (winget)
winget install OpenJS.NodeJS.LTS -e --source winget
# Reinicia PowerShell / cierra y abre una nueva ventana antes de continuar
```

Comandos útiles (desde la raíz del proyecto `S:\Respaldo\UPB\Proyecto`)

```powershell
# 1) Instala dependencias root (si hay package.json)
npm install

# 2) Instala dependencias del frontend (si existe carpeta web)
Push-Location .\web
npm install
Pop-Location

# 3) Establece la variable de entorno para Firebase (PowerShell)
$env:GOOGLE_APPLICATION_CREDENTIALS = 'C:\ruta\a\serviceAccountKey.json'

# 4) Ejecuta los seeds (roles + productos)
npm run seed:all

# 5) Para iniciar el frontend (en otra terminal o después de cd web)
cd web
npm run start
```

Uso alternativo: ejecutar el helper PowerShell (desde la raíz del repo)

```powershell
# Si quieres que el script haga install + seeds automáticamente
.
# con ruta explícita al service account:
.
# powershell -ExecutionPolicy Bypass -File .\run-all.ps1 -ServiceAccountPath 'C:\ruta\a\serviceAccountKey.json'
```

Notas

- Los scripts de seeding usan `firebase-admin`. Instala con `npm install firebase-admin` antes de ejecutar si planeas usar Firebase real.
- Los precios se guardan en `price_cents` (entero) siguiendo la convención del proyecto.
