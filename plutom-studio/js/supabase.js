// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// SUPABASE INTEGRATION - DESHABILITADO
// MODO: LOCALSTORAGE ÚNICAMENTE
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

console.log('✅ Supabase deshabilitado - Usando SOLO localStorage');

class SupabaseDB {
  constructor() {
    this.isConfigured = false; // DESHABILITADO
  }

  async get(table) {
    // Leer SOLO de localStorage
    const data = JSON.parse(localStorage.getItem(`ps_${table}`) || '[]');
    console.log(`📁 Leyendo ${table} de localStorage:`, data.length, 'registros');
    return data;
  }

  async insert(table, data) {
    // Guardar SOLO en localStorage
    const items = JSON.parse(localStorage.getItem(`ps_${table}`) || '[]');
    items.push(data);
    localStorage.setItem(`ps_${table}`, JSON.stringify(items));
    console.log(`💾 Guardado en localStorage: ${table}`);
    return data;
  }

  async update(table, id, data) {
    // Actualizar SOLO en localStorage
    const items = JSON.parse(localStorage.getItem(`ps_${table}`) || '[]');
    const idx = items.findIndex(x => x.id === id);
    if (idx !== -1) {
      items[idx] = { ...items[idx], ...data };
      localStorage.setItem(`ps_${table}`, JSON.stringify(items));
      console.log(`✏️ Actualizado en localStorage: ${table}`);
    }
    return data;
  }

  async delete(table, id) {
    // Eliminar SOLO de localStorage
    const items = JSON.parse(localStorage.getItem(`ps_${table}`) || '[]');
    const filtered = items.filter(x => x.id !== id);
    localStorage.setItem(`ps_${table}`, JSON.stringify(filtered));
    console.log(`🗑️ Eliminado de localStorage: ${table}`);
  }
}

// Crear instancia global
window.db = new SupabaseDB();

console.log('🔒 Modo OFFLINE: Todos los datos se guardan en localStorage del navegador');