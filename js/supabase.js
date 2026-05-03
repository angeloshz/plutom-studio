// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// SUPABASE INTEGRATION - PLUTOM STUDIO
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

const SUPABASE_URL = 'https://fpapzoepmzyeypschboy.supabase.co';
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZwYXB6b2VwbXp5ZXlwc2NoYm95Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzcyMDI1NzgsImV4cCI6MjA5Mjc3ODU3OH0.ApepS--dO6Y2rXLEpAnrMXT0AvwDTRWhTtcDJ0L6G08';

class SupabaseDB {
  constructor() {
    this.url = SUPABASE_URL;
    this.key = SUPABASE_KEY;
    this.isConfigured = this.url !== 'https://YOUR_PROJECT.supabase.co' && this.key !== 'YOUR_PUBLIC_ANON_KEY';
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
      // Validar que el objeto tenga los campos requeridos
      if (!data.id) {
        console.warn(`⚠️ Dato sin ID en ${table}, usando localStorage solo`, data);
        const items = JSON.parse(localStorage.getItem(`ps_${table}`) || '[]');
        items.push(data);
        localStorage.setItem(`ps_${table}`, JSON.stringify(items));
        return data;
      }

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

      if (!response.ok) {
        const errorMsg = await response.text();
        console.error(`Error insertando en ${table}:`, response.status, errorMsg);
        throw new Error(`HTTP ${response.status}`);
      }
      
      const result = await response.json();
      
      // También guardar en localStorage como respaldo
      const items = JSON.parse(localStorage.getItem(`ps_${table}`) || '[]');
      if (!items.find(x => x.id === data.id)) {
        items.push(data);
        localStorage.setItem(`ps_${table}`, JSON.stringify(items));
      }
      
      return result[0] || data;
    } catch (error) {
      console.error(`Error insertando en ${table}:`, error);
      // Fallback a localStorage
      const items = JSON.parse(localStorage.getItem(`ps_${table}`) || '[]');
      if (!items.find(x => x.id === data.id)) {
        items.push(data);
        localStorage.setItem(`ps_${table}`, JSON.stringify(items));
      }
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
        const localData = JSON.parse(localStorage.getItem(`ps_${table}`) || '[]');

        // Si hay datos locales, intentar subirlos a Supabase
        if (localData.length > 0) {
          let uploadedCount = 0;
          let failedCount = 0;
          
          for (const item of localData) {
            // Validar que tenga ID antes de subir
            if (item.id) {
              try {
                // Intentar insertar en Supabase
                const response = await fetch(
                  `${this.url}/rest/v1/${table}`,
                  {
                    method: 'POST',
                    headers: {
                      'apikey': this.key,
                      'Content-Type': 'application/json',
                      'Prefer': 'return=representation',
                    },
                    body: JSON.stringify(item)
                  }
                );

                if (response.ok) {
                  uploadedCount++;
                  console.log(`✓ Uploadead ${table}:`, item.id);
                } else {
                  const errorMsg = await response.text();
                  failedCount++;
                  console.warn(`⚠️ Error uploading ${table} ${item.id}:`, response.status, errorMsg);
                }
              } catch (err) {
                failedCount++;
                console.warn(`⚠️ Error con ${table}:`, item.id, err);
              }
            } else {
              console.warn(`⚠️ Dato sin ID en ${table}:`, item);
            }
          }
          
          console.log(`📊 ${table}: ${uploadedCount} subidos, ${failedCount} fallidos de ${localData.length}`);
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
  
  // ⚠️ NO sincronizar automáticamente por ahora
  // Esperar a que el usuario lo haga manualmente
  // if (db.isConfigured) {
  //   await db.syncAll();
  // }
});

console.log('✅ Supabase Integration cargado');