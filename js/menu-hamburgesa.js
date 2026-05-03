/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
   MENU HAMBURGUESA & AUTO-SAVE
   ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */

// ━━━━━━━━━━━━━━━━━━ MENÚ HAMBURGUESA ━━━━━━━━━━━━━━━━━━

function toggleMenu() {
  const menu = document.getElementById('menu-movil');
  if (menu) {
    menu.classList.toggle('open');
  }
}

function cerrarMenu() {
  const menu = document.getElementById('menu-movil');
  if (menu) {
    menu.classList.remove('open');
  }
}

// Cerrar menú al hacer click en un item
document.addEventListener('DOMContentLoaded', () => {
  const menuItems = document.querySelectorAll('.menu-item');
  menuItems.forEach(item => {
    item.addEventListener('click', () => {
      cerrarMenu();
    });
  });

  // Cerrar menú al hacer click fuera
  const menuOverlay = document.getElementById('menu-movil');
  if (menuOverlay) {
    menuOverlay.addEventListener('click', (e) => {
      if (e.target === menuOverlay) {
        cerrarMenu();
      }
    });
  }
});

// ━━━━━━━━━━━━━━━━━━ GUARDAR AUTOMÁTICO EN SUPABASE ━━━━━━━━━━━━━━━━━━

/**
 * Guardar datos automáticamente en Supabase
 * @param {string} tabla - Nombre de la tabla (clientes, cotizaciones, etc)
 * @param {object} dato - Objeto con los datos a guardar
 * @param {boolean} actualizar - Si es true, actualiza; si es false, inserta
 */
async function guardarEnSupabase(tabla, dato, actualizar = false) {
  // Validar que db esté disponible
  if (!window.db || !window.db.isConfigured) {
    console.warn('⚠️ Supabase no configurado, guardando solo en localStorage');
    return false;
  }

  try {
    if (actualizar && dato.id) {
      // Actualizar registro existente
      await window.db.update(tabla, dato.id, dato);
      console.log(`✅ Actualizado en Supabase: ${tabla} (${dato.id})`);
    } else {
      // Insertar nuevo registro
      await window.db.insert(tabla, dato);
      console.log(`✅ Guardado en Supabase: ${tabla} (${dato.id})`);
    }
    return true;
  } catch (error) {
    console.error(`❌ Error guardando en Supabase:`, error);
    return false;
  }
}

/**
 * Eliminar datos de Supabase
 * @param {string} tabla - Nombre de la tabla
 * @param {number|string} id - ID del registro a eliminar
 */
async function eliminarDeSupabase(tabla, id) {
  if (!window.db || !window.db.isConfigured) {
    console.warn('⚠️ Supabase no configurado');
    return false;
  }

  try {
    await window.db.delete(tabla, id);
    console.log(`✅ Eliminado de Supabase: ${tabla} (${id})`);
    return true;
  } catch (error) {
    console.error(`❌ Error eliminando de Supabase:`, error);
    return false;
  }
}

/**
 * Cargar datos de Supabase o localStorage
 * @param {string} tabla - Nombre de la tabla
 * @returns {array} Array de datos
 */
async function cargarDatos(tabla) {
  if (!window.db || !window.db.isConfigured) {
    // Si Supabase no está configurado, usar localStorage
    console.log(`📦 Cargando ${tabla} de localStorage`);
    return JSON.parse(localStorage.getItem(`ps_${tabla}`) || '[]');
  }

  try {
    // Intentar cargar de Supabase primero
    const datos = await window.db.get(tabla);
    if (datos && datos.length > 0) {
      console.log(`☁️ Cargados ${datos.length} registros de Supabase: ${tabla}`);
      // Guardar en localStorage como respaldo
      localStorage.setItem(`ps_${tabla}`, JSON.stringify(datos));
      return datos;
    } else {
      // Si no hay en Supabase, usar localStorage
      const local = JSON.parse(localStorage.getItem(`ps_${tabla}`) || '[]');
      if (local.length > 0) {
        console.log(`📦 Cargando ${tabla} de localStorage (${local.length} registros)`);
      }
      return local;
    }
  } catch (error) {
    console.warn(`⚠️ Error cargando de Supabase, usando localStorage:`, error);
    return JSON.parse(localStorage.getItem(`ps_${tabla}`) || '[]');
  }
}

// ━━━━━━━━━━━━━━━━━━ ESCUCHAR CAMBIOS EN TIEMPO REAL ━━━━━━━━━━━━━━━━━━

// Cuando los datos cambien en Supabase, recargar la página
window.addEventListener('dataUpdated', (event) => {
  const tabla = event.detail?.table;
  console.log(`🔄 Datos actualizados: ${tabla}`);
  
  // Recargar después de 500ms para dar tiempo a Supabase
  setTimeout(() => {
    location.reload();
  }, 500);
});

// ━━━━━━━━━━━━━━━━━━ INICIALIZAR AL CARGAR ━━━━━━━━━━━━━━━━━━

document.addEventListener('DOMContentLoaded', () => {
  console.log('✅ Menu hamburguesa & Auto-save iniciado');
  
  // Mostrar estado de Supabase
  if (window.db) {
    const status = window.db.getStatus();
    if (status.configured) {
      console.log('☁️ Supabase conectado - Datos se guardan automáticamente');
    } else {
      console.log('📦 Supabase desconectado - Usando localStorage');
    }
  }
});