# 🪐 PLUTOM STUDIO — Management Platform

**Plataforma integral de gestión para tu agencia creativa de fotografía, video, diseño y marketing digital.**

---

## 📋 Tabla de Contenidos

1. [Descripción General](#descripción-general)
2. [Instalación y Configuración](#instalación-y-configuración)
3. [Credenciales de Acceso](#credenciales-de-acceso)
4. [Módulos Disponibles](#módulos-disponibles)
5. [Características Principales](#características-principales)
6. [Flujos de Trabajo Recomendados](#flujos-de-trabajo-recomendados)
7. [Preguntas Frecuentes](#preguntas-frecuentes)

---

## 🎯 Descripción General

PLUTOM STUDIO es una plataforma web desarrollada para empresas de **marketing digital, fotografía, video y diseño gráfico**. Permite gestionar de manera integrada:

- 👥 **Clientes** — Base de datos centralizada
- 💼 **Servicios Recurrentes** — Contratos de manejo de redes y contenido con facturas automáticas
- 📄 **Cotizaciones** — Generación y seguimiento de propuestas
- 🧾 **Facturas** — Emisión con vista previa imprimible
- 📊 **Finanzas** — Ingresos, gastos y balance
- 📸 **Proyectos** — Seguimiento de trabajos en progreso
- 📅 **Eventos** — Calendario de bodas, 15 años, corporativos
- 📦 **Inventario** — Control de equipo fotográfico y de video
- 📈 **Reportes** — Análisis con gráficos y exportación de datos

**Todas las datos se guardan de forma segura en el navegador** — no requiere servidor.

---

## 🔧 Instalación y Configuración

### Requisitos
- Navegador moderno (Chrome, Firefox, Safari, Edge)
- Conexión a Internet (solo para la carga inicial)

### Pasos de Instalación

1. **Descarga todos los archivos** proporcionados
2. **Crea la siguiente estructura de carpetas:**
   ```
   plutom-studio/
   ├── index.html                           (Página de login)
   ├── plutom-studio-dashboard.html         (Dashboard principal)
   ├── clientes.html
   ├── cotizaciones.html
   ├── eventos.html
   ├── facturas.html
   ├── finanzas.html
   ├── inventario.html
   ├── proyectos.html
   ├── reportes.html
   ├── servicios.html
   ├── css/
   │   └── styles.css                       (Estilos globales)
   ├── js/
   │   ├── auth.js                          (Sistema de autenticación)
   │   └── exports.js                       (Exportación de reportes)
   └── img/
       ├── logo-icon.png                    (Logo del planeta)
       ├── logo-dark.png                    (Variante oscura)
       └── logo.png                         (Logo completo)
   ```

3. **Abre `index.html` en tu navegador** — esto inicia la plataforma
4. **Inicia sesión** con las credenciales por defecto (ver abajo)

### Usando Live Server (VS Code)

1. Abre la carpeta en VS Code
2. Instala la extensión "Live Server" de Ritwick Dey
3. Haz clic derecho en `index.html`
4. Selecciona "Open with Live Server"

---

## 🔐 Credenciales de Acceso

Por defecto, hay dos usuarios configurados:

| Usuario | Email | Contraseña | Rol |
|---------|-------|-----------|-----|
| `admin` | admin@plutomstudio.com | `admin123` | Administrador |
| `plutom` | info@plutomstudio.com | `plutom2025` | Administrador |

**Nota:** El registro de nuevos usuarios está deshabilitado en esta versión por seguridad. Para agregar usuarios, edita manualmente `localStorage` en el navegador o modifica el archivo `auth.js`.

---

## 📦 Módulos Disponibles

### 1. Dashboard (plutom-studio-dashboard.html)
**Página principal con:**
- 4 KPIs principales (ingresos, cotizaciones, eventos, clientes)
- **Módulo de Servicios Recurrentes** — clientes con facturas quincenales
- Resumen de actividad reciente
- Próximos eventos agendados
- Botón para exportar resumen ejecutivo en PDF

**Funcionalidades Clave:**
- 🔁 Gestión de clientes recurrentes (redes, contenido, etc.)
- 💰 Cálculo automático de ingresos mensuales fijos
- 🚨 Alertas visuales para cobros vencidos o próximos
- 📞 Botón directo a WhatsApp para enviar recordatorios
- 🧾 Marcar cobros realizados → registra automáticamente en Finanzas

### 2. Clientes (clientes.html)
**Gestión completa de tu cartera:**
- Tabla filtrable por tipo de servicio y estado
- Búsqueda en tiempo real
- Crear, editar, eliminar clientes
- Tipos de servicio: Boda, 15 Años, Corporativo, Marketing, etc.
- Estados: Activo, Prospecto, Inactivo

### 3. Cotizaciones (cotizaciones.html)
- Numeración automática (COT-0001, COT-0002...)
- Estados: Pendiente, En Revisión, Aprobada, Rechazada
- Cambio rápido de estado desde la tabla
- Cálculo automático de valor total aprobado
- Tasa de aprobación en KPIs

### 4. Eventos (eventos.html)
- **Calendario interactivo** con navegación por meses
- **Timeline visual** de próximos eventos
- Tipos: Boda, 15 Años, Corporativo, Sesión Fotos
- Estados: Confirmado, Tentativo, Cancelado, Completado
- Filtros por tipo y estado

### 5. Finanzas (finanzas.html)
- Registro de ingresos y gastos
- Categorías personalizables
- Gráficas de ingresos vs gastos por mes
- Balance neto y margen de utilidad
- Filtros por mes y tipo

### 6. Proyectos (proyectos.html)
- Tarjetas visuales con barras de progreso
- Estados: Pendiente, En Progreso, En Revisión, Completado, Pausado
- Valor total de proyectos
- Seguimiento por cliente y tipo

### 7. Inventario (inventario.html)
- Control de cámaras, lentes, drones, equipo de iluminación
- Estados: Disponible, En Uso, Prestado, En Mantenimiento, Dañado
- Valor estimado del equipo
- Número de serie y notas

### 8. Facturas (facturas.html)
- Numeración automática (FAC-0001...)
- **Vista previa imprimible** de facturas profesionales
- Desglose de items
- Estados: Pendiente, Pagada, Vencida, Anulada
- Historial de cobros

### 9. Reportes (reportes.html)
- **Dashboard analítico** con 4 KPIs globales
- Gráficas de ingresos vs gastos por mes
- Servicios más solicitados
- Donut chart de tipos de eventos
- Estadísticas rápidas (clientes activos, tasas de cobro, etc.)

### 10. Servicios (servicios.html)
- Catálogo de paquetes (Boda, 15 Años, Marketing Digital, etc.)
- 6 servicios precargados como ejemplo
- Botón "Cotizar" para crear cotización rápidamente
- Precios base y duraciones

---

## ✨ Características Principales

### 🔐 Seguridad
- Sistema de login con autenticación local
- Protección de páginas — redirige al login si no está autenticado
- Opción "Recuérdame" para acceso rápido
- Recuperación de contraseña con email

### 💾 Almacenamiento
- **Todos los datos en localStorage del navegador** (sin servidor)
- Datos persisten aunque cierres el navegador
- Exportación a CSV y Excel
- Backup automático en el historial de navegación

### 📊 Reportes y Exportación
- Exportar clientes a CSV/Excel
- Exportar finanzas a CSV/Excel
- Exportar eventos a CSV/Excel
- Exportar proyectos a CSV/Excel
- **Resumen Ejecutivo en PDF** con todas las métricas

### 🎨 Diseño
- Branding profesional con colores azul marino + plateado + dorado
- Tipografía minimalista (Outfit + Manrope)
- Animaciones suaves y transiciones
- Responsive (funciona en desktop, tablet y móvil)
- Tema oscuro optimizado para la vista

### 🔄 Automatización
- Cotizaciones pendientes marcadas automáticamente
- Ingresos recurrentes calculados automáticamente
- Facturas quincenales con recordatorios
- Registro automático de cobros en Finanzas
- KPIs que se actualizan en tiempo real

---

## 🚀 Flujos de Trabajo Recomendados

### Flujo: Captar y Faturar un Cliente Nuevo

1. Ve a **Clientes** → "+ Nuevo Cliente"
2. Registra nombre, teléfono, tipo de servicio
3. Ve a **Cotizaciones** → "+ Nueva Cotización"
4. Selecciona el cliente y servicio
5. Una vez aprobada, ve a **Facturas** → "+ Nueva Factura"
6. Envía la factura al cliente
7. Cuando pague, registra en **Finanzas** → "+ Registrar Ingreso"

### Flujo: Gestionar un Cliente Recurrente (Redes + Contenido)

1. **Dashboard** → "+ Agregar Cliente" (en Servicios Recurrentes)
2. Ingresa: nombre, servicio, monto quincenal, día de cobro
3. El dashboard calcula automáticamente el ingreso mensual fijo
4. Cada 15 días, cuando llega la fecha: haz clic en "🧾 Facturar"
5. Envía el recordatorio por WhatsApp al cliente
6. Una vez pagado, marca "✅ Marcar como Facturado"
7. Se registra automáticamente en Finanzas

### Flujo: Registrar un Evento (Boda, 15 años)

1. Ve a **Eventos** → "+ Nuevo Evento"
2. Ingresa fecha, tipo, lugar, estado
3. Ve a **Proyectos** → "+ Nuevo Proyecto" para el trabajo de edición
4. Monitorea el progreso con la barra
5. Al completar, cambia estado a "Completado"

---

## ❓ Preguntas Frecuentes

### ¿Dónde se guardan mis datos?
Todo está guardado en el `localStorage` del navegador. Los datos persisten aunque cierres la pestaña, pero **si limpias el caché/datos de navegación, se pierden**. Te recomendamos exportar regularmente tus reportes como backup.

### ¿Puedo acceder desde múltiples dispositivos?
No directamente, porque los datos están en el navegador local. Puedes:
- Exportar desde una computadora y importar en otra (aunque requiere desarrollo adicional)
- Usar la misma computadora en múltiples navegadores (cada uno tiene su localStorage)

### ¿Cómo agrego nuevos usuarios?
Actualmente está deshabilitado. Para agregar usuarios, edita `js/auth.js` y modifica el array `DEFAULT_USERS`. Luego, reinicia el navegador.

### ¿Puedo personalizar los colores y logotipos?
Sí. Edita `css/styles.css` para cambiar las variables de color. Para cambiar el logo, reemplaza los archivos en `img/`.

### ¿Cómo hago backup de mis datos?
1. Ve a **Reportes** → "📊 Exportar Resumen"
2. O exporta cada módulo por separado (Clientes, Finanzas, Eventos...)
3. Guarda los CSV/Excel en una carpeta segura

### ¿Funciona sin Internet?
Sí, una vez cargada la plataforma, funciona completamente offline. Solo necesitas Internet la primera vez para descargar los archivos.

### ¿Cómo elimino toda la información?
Abre las DevTools del navegador (F12) → Console y ejecuta:
```javascript
localStorage.clear();
location.reload();
```

---

## 📞 Soporte y Mejoras Futuras

**Posibles mejoras:**
- Sincronización con Google Drive para backup automático
- Integración con WhatsApp API para enviar cotizaciones directamente
- Importación de datos desde Excel
- Gráficas más avanzadas con Chart.js
- Sistema de pagos integrado (Stripe, PayPal)
- Aplicación móvil nativa
- Sincronización multi-dispositivo con backend

---

## 🎓 Créditos

Desarrollado por: **Claude AI**
Para: **PLUTOM STUDIO** — Agencia de Marketing Digital

**Branding y Diseño inspirado en:**
- Tu identidad visual: Azul marino + Plateado + Dorado
- Tu misión: Transformar ideas en campañas exitosas

---

## 📄 Licencia

Esta plataforma es propiedad de PLUTOM STUDIO. Está diseñada específicamente para el uso de tu agencia.

---

**Versión:** 1.0  
**Última actualización:** Abril 2025  
**Estado:** ✅ Completamente funcional