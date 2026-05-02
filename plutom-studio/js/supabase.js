// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// SUPABASE INTEGRATION - PLUTOM STUDIO
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

const SUPABASE_URL = 'https://fpapzoepmzyeypschboy.supabase.co';
const SUPABASE_KEY = 'sb_publishable_ZxyxXv8xsc516CqjVbxcLw_klUXtotr';

class SupabaseDB {
  constructor() {
    this.url = SUPABASE_URL;
    this.key = SUPABASE_KEY;
    this.isConfigured = this.url !== 'https://YOUR_PROJECT.supabase.co';
  }

  // Obtener datos de una tabla
  async get(table) {
    if (!this.isConfigured) {
      console.warn('⚠️ Supabase no configurado. Usando localStorage.');
      return JSON.parse(localStorage.getItem(`ps_${table}`) || '[]');
    }

    try {
      const response = await fetch(
        `${this.url}/rest/v1/${table}?select=*`,
        {
          headers: {
            'apikey': this.key,
            'Content-Type': 'application/json',
          }
        }
      );

      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      const data = await response.json();
      return data || [];
    } catch (error) {
      console.error(`Error obteniendo ${table}:`, error);
      // Fallback a localStorage
      return JSON.parse(localStorage.getItem(`ps_${table}`) || '[]');
    }
  }

  // Insertar datos
  async insert(table, data) {
    if (!this.isConfigured) {
      // Fallback a localStorage
      const items = JSON.parse(localStorage.getItem(`ps_${table}`) || '[]');
      items.push(data);
      localStorage.setItem(`ps_${table}`, JSON.stringify(items));
      return data;
    }

    try {
      const response = await fetch(
        `${this.url}/rest/v1/${table}`,
        {
          method: 'POST',
          headers: {
            'apikey': this.key,
            'Content-Type': 'application/json',
            'Prefer': 'return=representation',
          },
          body: JSON.stringify(data)
        }
      );

      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      const result = await response.json();
      
      // También guardar en localStorage como respaldo
      const items = JSON.parse(localStorage.getItem(`ps_${table}`) || '[]');
      items.push(data);
      localStorage.setItem(`ps_${table}`, JSON.stringify(items));
      
      return result[0] || data;
    } catch (error) {
      console.error(`Error insertando en ${table}:`, error);
      // Fallback a localStorage
      const items = JSON.parse(localStorage.getItem(`ps_${table}`) || '[]');
      items.push(data);
      localStorage.setItem(`ps_${table}`, JSON.stringify(items));
      return data;
    }
  }

  // Actualizar datos
  async update(table, id, data) {
    if (!this.isConfigured) {
      const items = JSON.parse(localStorage.getItem(`ps_${table}`) || '[]');
      const idx = items.findIndex(x => x.id === id);
      if (idx !== -1) {
        items[idx] = { ...items[idx], ...data };
        localStorage.setItem(`ps_${table}`, JSON.stringify(items));
      }
      return items[idx];
    }

    try {
      const response = await fetch(
        `${this.url}/rest/v1/${table}?id=eq.${id}`,
        {
          method: 'PATCH',
          headers: {
            'apikey': this.key,
            'Content-Type': 'application/json',
            'Prefer': 'return=representation',
          },
          body: JSON.stringify(data)
        }
      );

      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      
      // También actualizar localStorage
      const items = JSON.parse(localStorage.getItem(`ps_${table}`) || '[]');
      const idx = items.findIndex(x => x.id === id);
      if (idx !== -1) {
        items[idx] = { ...items[idx], ...data };
        localStorage.setItem(`ps_${table}`, JSON.stringify(items));
      }
      
      const result = await response.json();
      return result[0] || data;
    } catch (error) {
      console.error(`Error actualizando ${table}:`, error);
      // Fallback a localStorage
      const items = JSON.parse(localStorage.getItem(`ps_${table}`) || '[]');
      const idx = items.findIndex(x => x.id === id);
      if (idx !== -1) {
        items[idx] = { ...items[idx], ...data };
        localStorage.setItem(`ps_${table}`, JSON.stringify(items));
      }
      return data;
    }
  }

  // Eliminar datos
  async delete(table, id) {
    if (!this.isConfigured) {
      let items = JSON.parse(localStorage.getItem(`ps_${table}`) || '[]');
      items = items.filter(x => x.id !== id);
      localStorage.setItem(`ps_${table}`, JSON.stringify(items));
      return true;
    }

    try {
      const response = await fetch(
        `${this.url}/rest/v1/${table}?id=eq.${id}`,
        {
          method: 'DELETE',
          headers: {
            'apikey': this.key,
            'Content-Type': 'application/json',
          }
        }
      );

      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      
      // También eliminar de localStorage
      let items = JSON.parse(localStorage.getItem(`ps_${table}`) || '[]');
      items = items.filter(x => x.id !== id);
      localStorage.setItem(`ps_${table}`, JSON.stringify(items));
      
      return true;
    } catch (error) {
      console.error(`Error eliminando de ${table}:`, error);
      // Fallback a localStorage
      let items = JSON.parse(localStorage.getItem(`ps_${table}`) || '[]');
      items = items.filter(x => x.id !== id);
      localStorage.setItem(`ps_${table}`, JSON.stringify(items));
      return true;
    }
  }

  // Sincronizar todo
  async syncAll() {
    if (!this.isConfigured) {
      console.log('⚠️ Supabase no configurado. Usando localStorage.');
      return;
    }

    const tables = [
      'clientes', 'cotizaciones', 'facturas', 'finanzas',
      'eventos', 'proyectos', 'servicios', 'inventario'
    ];

    console.log('🔄 Sincronizando con Supabase...');

    for (const table of tables) {
      try {
        const cloudData = await this.get(table);
        const localData = JSON.parse(localStorage.getItem(`ps_${table}`) || '[]');

        // Si hay datos en la nube, usar esos (más actualizados)
        if (cloudData.length > 0) {
          localStorage.setItem(`ps_${table}`, JSON.stringify(cloudData));
        } else if (localData.length > 0) {
          // Si hay datos locales pero no en la nube, subirlos
          for (const item of localData) {
            await this.insert(table, item);
          }
        }
      } catch (error) {
        console.warn(`Error sincronizando ${table}:`, error);
      }
    }

    console.log('✅ Sincronización completada');
  }

  // Obtener estado de configuración
  getStatus() {
    return {
      configured: this.isConfigured,
      url: this.isConfigured ? this.url : '❌ No configurado',
      mode: this.isConfigured ? 'Supabase + localStorage' : 'localStorage solo'
    };
  }
}

// Instancia global
const db = new SupabaseDB();

// Al cargar la app
window.addEventListener('load', async () => {
  console.log('📊 Estado de BD:', db.getStatus());
  
  // Sincronizar automáticamente al cargar
  if (db.isConfigured) {
    await db.syncAll();
  }
});

console.log('✅ Supabase Integration cargado');