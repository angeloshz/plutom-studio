# 🔧 CONFIGURAR SUPABASE EN PLUTOM STUDIO

## 🎯 ¿Qué es esto?

Una guía paso a paso para conectar tu cuenta **Supabase gratuita** a PLUTOM STUDIO.

Con esto conseguirás:
- ✅ Base de datos en la nube (500 MB gratuitos)
- ✅ Backups automáticos
- ✅ Acceso desde múltiples dispositivos con datos sincronizados
- ✅ Sin Google Drive necesario
- ✅ Totalmente gratuito

---

## 📋 PASO 1: CREAR PROYECTO EN SUPABASE

### 1.1 Ir a Supabase

```
https://supabase.com
```

### 1.2 Clickea "Start Your Project"

O si ya tienes cuenta, ve a:
```
https://app.supabase.com/projects
```

### 1.3 Crear nuevo proyecto

Clickea: **"New Project"**

### 1.4 Completa el formulario

**Name:**
```
plutom-studio
```

**Database Password:**
```
Genera una contraseña fuerte (ej: Plutom2025!Secure)
GUÁRDALA EN UN LUGAR SEGURO
```

**Region:**
```
Selecciona la más cercana a ti
(ej: us-east-1 si eres de RD)
```

**Pricing Plan:**
```
Selecciona: Free (Gratuito) ✅
```

Clickea: **"Create new project"**

⏳ Supabase está creando tu proyecto (2-3 minutos)...

---

## 🔑 PASO 2: OBTENER CREDENCIALES

### 2.1 Cuando el proyecto esté listo

Verás una pantalla con:
```
Your new project is almost ready. We're finishing up some infrastructure setup for you...
```

Espera a que se complete (verás un ✅).

### 2.2 Ir a Settings

En el menú izquierdo, clickea: **"Settings"** ⚙️

### 2.3 API

Clickea la pestaña: **"API"**

Verás algo como:

```
Supabase URL: https://xxxxxxxx.supabase.co

Supabase API Key (anon, public):
eyJhbGc....... (clave larga)
```

**COPIA ESTOS VALORES:**

1. **Supabase URL:**
```
https://xxxxxxxx.supabase.co
```

2. **Supabase Key (anon):**
```
eyJhbGc... (clave completa)
```

📌 **Guarda estos en un lugar seguro.**

---

## 📄 PASO 3: CREAR TABLAS EN SUPABASE

### 3.1 Ir a SQL Editor

En el menú izquierdo, clickea: **"SQL Editor"**

### 3.2 Nueva query

Clickea: **"New Query"**

### 3.3 Copiar y pegar SQL

Copia TODO esto y pégalo en el editor:

```sql
-- Crear tabla clientes
CREATE TABLE IF NOT EXISTS clientes (
  id TEXT PRIMARY KEY,
  nombre TEXT NOT NULL,
  empresa TEXT,
  email TEXT,
  telefono TEXT,
  ciudad TEXT,
  tipo TEXT,
  fecha TEXT,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Crear tabla cotizaciones
CREATE TABLE IF NOT EXISTS cotizaciones (
  id TEXT PRIMARY KEY,
  num TEXT,
  cliente TEXT,
  telefono TEXT,
  servicio TEXT,
  monto DECIMAL,
  lugar TEXT,
  fecha TEXT,
  detalles TEXT,
  creada TEXT,
  estado TEXT,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Crear tabla facturas
CREATE TABLE IF NOT EXISTS facturas (
  id TEXT PRIMARY KEY,
  num TEXT,
  cliente TEXT,
  servicio TEXT,
  monto DECIMAL,
  emision TEXT,
  vencimiento TEXT,
  estado TEXT,
  notas TEXT,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Crear tabla finanzas
CREATE TABLE IF NOT EXISTS finanzas (
  id TEXT PRIMARY KEY,
  tipo TEXT,
  desc TEXT,
  cat TEXT,
  monto DECIMAL,
  fecha TEXT,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Crear tabla eventos
CREATE TABLE IF NOT EXISTS eventos (
  id TEXT PRIMARY KEY,
  titulo TEXT,
  tipo TEXT,
  fecha TEXT,
  lugar TEXT,
  cliente TEXT,
  estado TEXT,
  notas TEXT,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Crear tabla proyectos
CREATE TABLE IF NOT EXISTS proyectos (
  id TEXT PRIMARY KEY,
  nombre TEXT,
  cliente TEXT,
  descripcion TEXT,
  valor DECIMAL,
  estado TEXT,
  progreso INTEGER,
  fecha_inicio TEXT,
  fecha_entrega TEXT,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Crear tabla servicios
CREATE TABLE IF NOT EXISTS servicios (
  id TEXT PRIMARY KEY,
  nombre TEXT,
  descripcion TEXT,
  precio DECIMAL,
  tipo TEXT,
  duracion TEXT,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Crear tabla inventario
CREATE TABLE IF NOT EXISTS inventario (
  id TEXT PRIMARY KEY,
  nombre TEXT,
  categoria TEXT,
  estado TEXT,
  valor DECIMAL,
  ubicacion TEXT,
  notas TEXT,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);
```

### 3.4 Ejecutar query

Clickea el botón: **"Run"** ▶️

✅ Las tablas se crearán automáticamente.

---

## 🔌 PASO 4: CONECTAR PLUTOM STUDIO CON SUPABASE

### 4.1 Editar archivo js/supabase.js

En tu carpeta `/outputs/js/supabase.js`, busca estas líneas:

```javascript
const SUPABASE_URL = 'https://YOUR_PROJECT.supabase.co';
const SUPABASE_KEY = 'YOUR_PUBLIC_ANON_KEY';
```

Reemplázalas con tus valores:

```javascript
const SUPABASE_URL = 'https://xxxxxxxx.supabase.co';  // Tu URL
const SUPABASE_KEY = 'eyJhbGc...';                    // Tu KEY
```

**Ejemplo real:**
```javascript
const SUPABASE_URL = 'https://abcdefgh.supabase.co';
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...';
```

### 4.2 Agregar script a index.html

En tu archivo `index.html`, encuentra la línea:

```html
<script src="js/auth.js"></script>
```

Agrega ANTES de esa línea:

```html
<script src="js/supabase.js"></script>
```

Así quedará:

```html
<script src="js/supabase.js"></script>
<script src="js/auth.js"></script>
```

### 4.3 Agregar script a dashboard y otros

Repite el paso anterior en TODOS estos archivos:

```
plutom-studio-dashboard.html
clientes.html
cotizaciones.html
facturas.html
finanzas.html
eventos.html
proyectos.html
inventario.html
reportes.html
servicios.html
```

En cada uno, agregar antes del `<script src="js/auth.js">`:

```html
<script src="js/supabase.js"></script>
```

---

## ✅ PASO 5: VERIFICAR QUE FUNCIONE

### 5.1 Abre DevTools

En cualquier página, presiona: **F12**

### 5.2 Ve a Console

Clickea la pestaña: **"Console"**

### 5.3 Verifica el estado

En la consola deberías ver algo como:

```
✅ Supabase Integration cargado
📊 Estado de BD: {
  configured: true,
  url: "https://xxxxxxxx.supabase.co",
  mode: "Supabase + localStorage"
}
```

✅ **Si ves esto, ¡está conectado!**

Si ves `configured: false`, revisa que hayas puesto las credenciales correctas.

---

## 📊 PASO 6: MIGRAR DATOS LOCALES A SUPABASE

### 6.1 Si tienes datos en localStorage

Si ya tienes datos en tu navegador (clientes, cotizaciones, etc.):

Abre DevTools (F12) → Console y ejecuta:

```javascript
await db.syncAll();
```

Verás:

```
🔄 Sincronizando con Supabase...
✅ Sincronización completada
```

**Esto subirá todos tus datos locales a Supabase automáticamente.**

### 6.2 Verificar en Supabase

Para verificar que los datos llegaron:

1. En Supabase, clickea **"Table Editor"**
2. Selecciona cualquier tabla (ej: "clientes")
3. Deberías ver tus datos allí

---

## 🔄 CÓMO FUNCIONA AHORA

### Con Supabase conectado:

```
1. Cuando agregas un cliente:
   ✅ Se guarda en localStorage (local)
   ✅ Se envía a Supabase (nube)

2. Cuando accedes desde otro dispositivo:
   ✅ Se sincroniza desde Supabase automáticamente
   ✅ Ves los mismos datos en todos lados

3. Backups:
   ✅ Automáticos en Supabase
   ✅ Cada cambio se registra
   ✅ No necesitas Google Drive
```

---

## 🛡️ SEGURIDAD

### Tus credenciales:

**API URL:** Pública (no hay problema)
**Public Anon Key:** Está diseñada para ser pública

**Pero NO compartas:**
- Contraseña de la base de datos
- Service Role Key (NUNCA, esta es para backend)

---

## 📱 ACCESO DESDE MÚLTIPLES DISPOSITIVOS

Ahora puedes acceder desde:

```
Teléfono 1:     https://plutom-studio.vercel.app
Teléfono 2:     https://plutom-studio.vercel.app
Computadora:    https://plutom-studio.vercel.app

✅ TODOS comparten los MISMOS datos
✅ Sincronización automática
✅ Backups en Supabase
```

---

## 📈 LÍMITES GRATUITOS (500 MB)

Tu plan gratuito incluye:

```
Almacenamiento: 500 MB
Usuarios: Ilimitados
Proyectos: 1
Tablas: Ilimitadas
Filas: Ilimitadas (hasta 500 MB)
Backup: Diario
```

Para PLUTOM STUDIO, 500 MB es **MÁS que suficiente**:

```
Un cliente con datos = ~1 KB
1000 clientes = ~1 MB
10,000 clientes = ~10 MB
1,000,000 de transacciones = ~100 MB
```

**Con 500 MB puedes tener:**
- 50,000 clientes
- 100,000 cotizaciones
- 50,000 facturas
- Y más...

---

## 🚀 PRÓXIMOS PASOS

1. ✅ Configurar Supabase (TÚ ESTÁS AQUÍ)
2. ✅ Agregar credenciales a supabase.js
3. ✅ Agregar script a HTML
4. ✅ Sincronizar datos
5. ✅ Deployar a Vercel
6. ✅ ¡Acceso desde cualquier dispositivo!

---

## ❓ PREGUNTAS FRECUENTES

**P: ¿Perderé mis datos cuando agregue Supabase?**
R: No. Los datos locales se sincronizarán automáticamente.

**P: ¿Qué pasa si pierdo internet?**
R: Funciona offline. Cuando vuelva la conexión, se sincroniza.

**P: ¿Puedo usar localStorage sin Supabase?**
R: Sí. El código tiene fallback a localStorage si Supabase no está configurado.

**P: ¿Supabase es seguro?**
R: Sí, está alojado en AWS con encriptación.

**P: ¿Necesito actualizar el código de PLUTOM?**
R: Mínimamente. El archivo `supabase.js` se encarga de todo.

---

## ✨ ¡LISTO!

Tu PLUTOM STUDIO ahora tiene:
- ✅ Base de datos en la nube
- ✅ Backups automáticos
- ✅ Sincronización entre dispositivos
- ✅ Totalmente gratuito (500 MB)
- ✅ Sin depender de Google Drive

**¡Tu plataforma es professional-grade!** 🚀
