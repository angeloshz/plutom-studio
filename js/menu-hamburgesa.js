/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
   MENU HAMBURGUESA - MODO OFFLINE (localStorage)
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

// ━━━━━━━━━━━━━━━━━━ GUARDAR EN LOCALSTORAGE ━━━━━━━━━━━━━━━━━━

/**
 * Guardar datos en localStorage
 * NOTA: Supabase está deshabilitado. Los datos se guardan SOLO en escritorio.
 * Para sincronización multi-dispositivo, habilitar supabase.js más adelante.
 */
function guardarEnSupabase(tabla, dato, actualizar = false) {
  // SUPABASE DESHABILITADO - SOLO LOCALSTORAGE
  // Este archivo se mantiene por compatibilidad con las páginas
  // Pero el guardado YA se hace en cada página HTML directamente
  return true;
}

function eliminarDeSupabase(tabla, id) {
  // SUPABASE DESHABILITADO - SOLO LOCALSTORAGE
  return true;
}

console.log('✅ Modo OFFLINE activado - Datos guardados en localStorage');