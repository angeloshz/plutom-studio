/* ═══════════════════════════════════════════════════════════════
   PLUTOM STUDIO — Global App Script
   Incluir en TODAS las páginas: <script src="js/app.js"></script>
   ─────────────────────────────────────────────────────────────
   Maneja:
   • Sidebar con logo correcto y tipografía consistente
   • Notificaciones inteligentes
   • Búsqueda global (nombres + fechas)
   • Google Drive backup
═══════════════════════════════════════════════════════════════ */

'use strict';

/* ─────────────────────────────────────────────────────────────
   1. SIDEBAR — inyectar logo y estilos correctos en todas las páginas
───────────────────────────────────────────────────────────── */
function fixSidebar() {
  // Asegurar tipografía Outfit + Manrope en todas las páginas
  if (!document.querySelector('link[href*="Outfit"]')) {
    const link = document.createElement('link');
    link.rel  = 'stylesheet';
    link.href = 'https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;500;600;700;800;900&family=Manrope:wght@300;400;500;600;700&display=swap';
    document.head.insertBefore(link, document.head.firstChild);
  }

  // Corregir imagen del logo — buscar cualquier logo-img
  const logoImgs = document.querySelectorAll('.logo-img');
  logoImgs.forEach(img => {
    img.src = 'img/logo-icon.png';
    img.onerror = function() {
      this.style.display = 'none';
      // Mostrar fallback SVG
      const fallback = document.createElement('div');
      fallback.style.cssText = `
        width:36px; height:36px; border-radius:9px;
        background:linear-gradient(135deg,#1a3a5c,#234d78);
        display:flex; align-items:center; justify-content:center;
        font-size:18px; flex-shrink:0;
      `;
      fallback.textContent = '🪐';
      this.parentNode.insertBefore(fallback, this);
    };
  });

  // Si no hay logo-img en el sidebar, insertarlo
  const logoDiv = document.querySelector('.logo');
  if (logoDiv && !logoDiv.querySelector('.logo-img')) {
    const img = document.createElement('img');
    img.src = 'img/logo-icon.png';
    img.alt = 'PLUTOM';
    img.className = 'logo-img';
    img.style.cssText = 'width:36px;height:36px;object-fit:contain;flex-shrink:0;';
    img.onerror = function() {
      this.style.display = 'none';
    };
    logoDiv.insertBefore(img, logoDiv.firstChild);
  }
}

/* ─────────────────────────────────────────────────────────────
   2. SISTEMA DE NOTIFICACIONES INTELIGENTES
───────────────────────────────────────────────────────────── */
const Notificaciones = {
  items: [],

  // Calcular todas las alertas importantes
  calcular() {
    this.items = [];
    const hoy = new Date(); hoy.setHours(0,0,0,0);
    const en5  = new Date(hoy); en5.setDate(en5.getDate() + 5);
    const en30 = new Date(hoy); en30.setDate(en30.getDate() + 30);

    // ── Cotizaciones pendientes sin responder ──
    const cotizaciones = JSON.parse(localStorage.getItem('ps_cotizaciones') || '[]');
    const cotPend = cotizaciones.filter(c => c.estado === 'Pendiente');
    if (cotPend.length > 0) {
      this.items.push({
        tipo: 'cotizacion',
        icono: '📄',
        titulo: `${cotPend.length} cotización${cotPend.length > 1 ? 'es' : ''} sin respuesta`,
        detalle: cotPend.slice(0, 2).map(c => c.cliente).join(', ') + (cotPend.length > 2 ? '...' : ''),
        urgencia: 'media',
        link: 'cotizaciones.html',
      });
    }

    // ── Facturas vencidas ──
    const facturas = JSON.parse(localStorage.getItem('ps_facturas') || '[]');
    const factVenc = facturas.filter(f => f.estado === 'Vencida');
    if (factVenc.length > 0) {
      this.items.push({
        tipo: 'factura',
        icono: '🧾',
        titulo: `${factVenc.length} factura${factVenc.length > 1 ? 's' : ''} vencida${factVenc.length > 1 ? 's' : ''}`,
        detalle: `Total pendiente: RD$${factVenc.reduce((s,f)=>s+Number(f.monto),0).toLocaleString('es-DO')}`,
        urgencia: 'alta',
        link: 'facturas.html',
      });
    }

    // ── Eventos próximos (en los próximos 7 días) ──
    const eventos = JSON.parse(localStorage.getItem('ps_eventos') || '[]');
    const en7 = new Date(hoy); en7.setDate(en7.getDate() + 7);
    const evPrx = eventos.filter(e => {
      const d = new Date(e.fecha + 'T00:00:00');
      return d >= hoy && d <= en7 && e.estado === 'Confirmado';
    });
    if (evPrx.length > 0) {
      this.items.push({
        tipo: 'evento',
        icono: '📅',
        titulo: `${evPrx.length} evento${evPrx.length > 1 ? 's' : ''} en los próximos 7 días`,
        detalle: evPrx.slice(0, 2).map(e => e.nombre).join(', '),
        urgencia: 'alta',
        link: 'eventos.html',
      });
    }

    // ── Cobros recurrentes vencidos o próximos ──
    const recurrentes = JSON.parse(localStorage.getItem('ps_recurrentes') || '[]');
    const recActivos  = recurrentes.filter(r => r.estado === 'activo');

    const cobrosVencidos = recActivos.filter(r => {
      const prox = proximoCobroFecha(r.diaCobro);
      return diasEntre(hoy, prox) <= 0;
    });
    const cobrosProximos = recActivos.filter(r => {
      const prox = proximoCobroFecha(r.diaCobro);
      const d = diasEntre(hoy, prox);
      return d > 0 && d <= 3;
    });

    if (cobrosVencidos.length > 0) {
      this.items.push({
        tipo: 'cobro',
        icono: '🚨',
        titulo: `${cobrosVencidos.length} cobro${cobrosVencidos.length > 1 ? 's' : ''} recurrente vencido`,
        detalle: cobrosVencidos.map(r => r.nombre).join(', '),
        urgencia: 'alta',
        link: 'plutom-studio-dashboard.html',
      });
    }

    if (cobrosProximos.length > 0) {
      this.items.push({
        tipo: 'cobro',
        icono: '⚠️',
        titulo: `${cobrosProximos.length} cobro${cobrosProximos.length > 1 ? 's' : ''} recurrente en ≤3 días`,
        detalle: cobrosProximos.map(r => r.nombre).join(', '),
        urgencia: 'media',
        link: 'plutom-studio-dashboard.html',
      });
    }

    // ── Proyectos sin actualizar ──
    const proyectos = JSON.parse(localStorage.getItem('ps_proyectos') || '[]');
    const proyAtras = proyectos.filter(p => {
      if (p.estado !== 'En Progreso' || !p.entrega) return false;
      const entrega = new Date(p.entrega + 'T00:00:00');
      return entrega <= en5;
    });
    if (proyAtras.length > 0) {
      this.items.push({
        tipo: 'proyecto',
        icono: '🎬',
        titulo: `${proyAtras.length} proyecto${proyAtras.length > 1 ? 's' : ''} con entrega próxima`,
        detalle: proyAtras.slice(0, 2).map(p => p.nombre).join(', '),
        urgencia: 'media',
        link: 'proyectos.html',
      });
    }

    return this.items;
  },

  // Renderizar panel de notificaciones
  render() {
    this.calcular();
    const alta  = this.items.filter(n => n.urgencia === 'alta').length;
    const total = this.items.length;

    // Actualizar botón de campana
    const btn = document.getElementById('notifBtn');
    const dot = document.getElementById('notifDot');
    if (btn) {
      // Quitar badge existente
      const oldBadge = btn.querySelector('.notif-count');
      if (oldBadge) oldBadge.remove();

      if (total > 0) {
        const badge = document.createElement('span');
        badge.className = 'notif-count';
        badge.textContent = total;
        badge.style.cssText = `
          position:absolute; top:-6px; right:-6px;
          background:${alta > 0 ? 'var(--red)' : 'var(--accent)'};
          color:#fff; font-size:10px; font-weight:800;
          min-width:18px; height:18px; border-radius:20px;
          display:flex; align-items:center; justify-content:center;
          padding:0 4px; border:2px solid var(--bg);
          font-family:'Outfit',sans-serif;
        `;
        btn.style.position = 'relative';
        btn.appendChild(badge);
        if (dot) dot.style.display = 'block';
      } else {
        if (dot) dot.style.display = 'none';
      }
    }
  },

  // Abrir panel de notificaciones
  abrirPanel() {
    this.calcular();
    let panel = document.getElementById('notifPanel');
    if (panel) { panel.remove(); return; }

    panel = document.createElement('div');
    panel.id = 'notifPanel';
    panel.style.cssText = `
      position:fixed; top:64px; right:20px; width:340px;
      background:var(--surface); border:1px solid var(--border-hover);
      border-radius:14px; z-index:300;
      box-shadow:0 16px 48px rgba(0,0,0,0.6);
      animation:fadeUp .25s var(--ease);
      overflow:hidden;
    `;

    const header = `
      <div style="padding:14px 18px;border-bottom:1px solid var(--border);display:flex;align-items:center;justify-content:space-between;">
        <span style="font-family:'Outfit',sans-serif;font-size:14px;font-weight:700;">🔔 Notificaciones</span>
        <span style="font-size:11px;color:var(--text-muted);">${this.items.length} alerta${this.items.length !== 1 ? 's' : ''}</span>
      </div>`;

    const itemsHTML = this.items.length === 0
      ? `<div style="padding:32px 18px;text-align:center;color:var(--text-muted);font-size:13px;">
           <div style="font-size:32px;margin-bottom:8px;opacity:0.3;">🎉</div>
           Todo al día, sin alertas pendientes
         </div>`
      : this.items.map(n => `
          <a href="${n.link}" style="display:flex;gap:12px;padding:13px 18px;border-bottom:1px solid var(--border);
             text-decoration:none;color:inherit;transition:background 0.15s;cursor:pointer;"
             onmouseover="this.style.background='var(--surface2)'"
             onmouseout="this.style.background='transparent'">
            <div style="width:36px;height:36px;border-radius:9px;flex-shrink:0;
              background:${n.urgencia==='alta' ? 'rgba(224,82,82,0.12)' : 'rgba(200,168,75,0.1)'};
              display:flex;align-items:center;justify-content:center;font-size:16px;">${n.icono}</div>
            <div style="flex:1;min-width:0;">
              <div style="font-size:13px;font-weight:600;color:${n.urgencia==='alta' ? 'var(--red)' : 'var(--text)'};">${n.titulo}</div>
              <div style="font-size:11.5px;color:var(--text-muted);margin-top:2px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;">${n.detalle}</div>
            </div>
            <div style="font-size:11px;color:var(--text-muted);flex-shrink:0;margin-top:2px;">›</div>
          </a>`).join('');

    const footer = `
      <div style="padding:10px 18px;text-align:center;border-top:1px solid var(--border);">
        <span style="font-size:11.5px;color:var(--text-muted);">Las alertas se actualizan automáticamente</span>
      </div>`;

    panel.innerHTML = header + itemsHTML + footer;
    document.body.appendChild(panel);

    // Cerrar al hacer clic fuera
    setTimeout(() => {
      document.addEventListener('click', function handler(e) {
        if (!panel.contains(e.target) && e.target.id !== 'notifBtn') {
          panel.remove();
          document.removeEventListener('click', handler);
        }
      });
    }, 100);
  },
};

// Helper para Notificaciones
function proximoCobroFecha(diaCobro) {
  diaCobro = parseInt(diaCobro);
  const hoy  = new Date(); hoy.setHours(0,0,0,0);
  const año  = hoy.getFullYear();
  const mes  = hoy.getMonth();
  const segunda = Math.min(diaCobro + 15, 28);
  const candidatos = [
    new Date(año, mes, diaCobro),
    new Date(año, mes, segunda),
    new Date(año, mes + 1, diaCobro),
    new Date(año, mes + 1, segunda),
  ].filter(d => d >= hoy).sort((a, b) => a - b);
  return candidatos[0] || new Date(año, mes + 1, diaCobro);
}

function diasEntre(desde, hasta) {
  return Math.round((hasta - desde) / 86400000);
}

/* ─────────────────────────────────────────────────────────────
   3. BÚSQUEDA GLOBAL (nombres + fechas)
───────────────────────────────────────────────────────────── */
const BusquedaGlobal = {
  abierto: false,

  abrir() {
    if (document.getElementById('searchPanel')) {
      this.cerrar(); return;
    }
    this.abierto = true;

    const overlay = document.createElement('div');
    overlay.id = 'searchPanel';
    overlay.style.cssText = `
      position:fixed; inset:0; z-index:400;
      background:rgba(4,8,16,0.85);
      backdrop-filter:blur(12px);
      display:flex; flex-direction:column; align-items:center;
      padding-top:80px;
      animation:fadeIn .2s ease;
    `;

    overlay.innerHTML = `
      <div style="width:100%;max-width:640px;padding:0 20px;">

        <!-- Input principal -->
        <div style="display:flex;align-items:center;gap:12px;
          background:var(--surface); border:1px solid var(--border-hover);
          border-radius:14px; padding:14px 18px; margin-bottom:16px;
          box-shadow:0 16px 48px rgba(0,0,0,0.5);">
          <span style="font-size:18px;color:var(--text-muted);">🔍</span>
          <input type="text" id="globalSearchInput" placeholder="Buscar cliente, evento, cotización, fecha (YYYY-MM-DD)..."
            style="background:none;border:none;outline:none;color:var(--text);font-size:16px;
            font-family:'Manrope',sans-serif;flex:1;"
            autocomplete="off">
          <span style="font-size:12px;color:var(--text-muted);cursor:pointer;padding:4px 8px;
            background:var(--surface2);border-radius:5px;" onclick="BusquedaGlobal.cerrar()">ESC</span>
        </div>

        <!-- Filtro rápido por categoría -->
        <div style="display:flex;gap:8px;margin-bottom:16px;flex-wrap:wrap;" id="searchFilters">
          <button class="sfilter active" data-cat="todo" onclick="BusquedaGlobal.setFiltro(this,'todo')">Todo</button>
          <button class="sfilter" data-cat="clientes" onclick="BusquedaGlobal.setFiltro(this,'clientes')">👥 Clientes</button>
          <button class="sfilter" data-cat="cotizaciones" onclick="BusquedaGlobal.setFiltro(this,'cotizaciones')">📄 Cotizaciones</button>
          <button class="sfilter" data-cat="eventos" onclick="BusquedaGlobal.setFiltro(this,'eventos')">📅 Eventos</button>
          <button class="sfilter" data-cat="facturas" onclick="BusquedaGlobal.setFiltro(this,'facturas')">🧾 Facturas</button>
          <button class="sfilter" data-cat="proyectos" onclick="BusquedaGlobal.setFiltro(this,'proyectos')">🎬 Proyectos</button>
        </div>

        <!-- Resultados -->
        <div id="searchResults" style="background:var(--surface);border:1px solid var(--border);
          border-radius:14px;overflow:hidden;max-height:420px;overflow-y:auto;">
          <div style="padding:24px;text-align:center;color:var(--text-muted);font-size:13.5px;">
            Comienza a escribir para buscar...
          </div>
        </div>

        <div style="text-align:center;margin-top:12px;font-size:12px;color:var(--text-muted);">
          Busca por nombre, fecha, monto o tipo de servicio
        </div>
      </div>

      <style>
        .sfilter {
          padding:5px 14px; border-radius:20px; font-size:12px; font-weight:600;
          border:1px solid var(--border); background:var(--surface2);
          color:var(--text-muted); cursor:pointer; transition:all .15s;
          font-family:'Manrope',sans-serif;
        }
        .sfilter:hover, .sfilter.active {
          background:rgba(26,58,92,0.5); color:var(--silver-light);
          border-color:rgba(138,155,176,0.3);
        }
        .search-result-item {
          display:flex; align-items:center; gap:12px; padding:13px 18px;
          border-bottom:1px solid var(--border); cursor:pointer;
          transition:background .12s; text-decoration:none; color:inherit;
        }
        .search-result-item:last-child { border-bottom:none; }
        .search-result-item:hover { background:var(--surface2); }
      </style>
    `;

    document.body.appendChild(overlay);

    this.filtroActual = 'todo';

    const input = document.getElementById('globalSearchInput');
    input.focus();

    let debounce;
    input.addEventListener('input', () => {
      clearTimeout(debounce);
      debounce = setTimeout(() => this.buscar(input.value.trim()), 200);
    });

    // Cerrar con ESC
    document.addEventListener('keydown', this._escHandler = (e) => {
      if (e.key === 'Escape') this.cerrar();
    });

    overlay.addEventListener('click', (e) => {
      if (e.target === overlay) this.cerrar();
    });
  },

  cerrar() {
    const panel = document.getElementById('searchPanel');
    if (panel) panel.remove();
    document.removeEventListener('keydown', this._escHandler);
    this.abierto = false;
  },

  setFiltro(btn, cat) {
    document.querySelectorAll('.sfilter').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    this.filtroActual = cat;
    const input = document.getElementById('globalSearchInput');
    if (input && input.value) this.buscar(input.value.trim());
  },

  filtroActual: 'todo',

  buscar(query) {
    const resultsDiv = document.getElementById('searchResults');
    if (!resultsDiv) return;

    if (!query) {
      resultsDiv.innerHTML = '<div style="padding:24px;text-align:center;color:var(--text-muted);font-size:13.5px;">Comienza a escribir para buscar...</div>';
      return;
    }

    const q = query.toLowerCase();
    const resultados = [];

    // Helper de búsqueda por fecha
    const matchFecha = (fechaStr) => {
      if (!fechaStr) return false;
      return fechaStr.toLowerCase().includes(q);
    };

    // ── Clientes ──
    if (this.filtroActual === 'todo' || this.filtroActual === 'clientes') {
      const clientes = JSON.parse(localStorage.getItem('ps_clientes') || '[]');
      clientes.filter(c =>
        c.nombre.toLowerCase().includes(q) ||
        (c.empresa||'').toLowerCase().includes(q) ||
        (c.telefono||'').includes(q) ||
        (c.tipo||'').toLowerCase().includes(q) ||
        matchFecha(c.fecha)
      ).forEach(c => resultados.push({
        icono:'👥', titulo:c.nombre,
        sub:`${c.tipo} · ${c.estado} · ${c.fecha || ''}`,
        link:'clientes.html', tipo:'Cliente',
        chipClass:'chip-navy',
      }));
    }

    // ── Cotizaciones ──
    if (this.filtroActual === 'todo' || this.filtroActual === 'cotizaciones') {
      const cotizaciones = JSON.parse(localStorage.getItem('ps_cotizaciones') || '[]');
      cotizaciones.filter(c =>
        c.cliente.toLowerCase().includes(q) ||
        (c.servicio||'').toLowerCase().includes(q) ||
        (c.num||'').toLowerCase().includes(q) ||
        matchFecha(c.fecha) ||
        matchFecha(c.creada)
      ).forEach(c => resultados.push({
        icono:'📄', titulo:`${c.num||''} — ${c.cliente}`,
        sub:`${c.servicio} · RD$${Number(c.monto).toLocaleString('es-DO')} · ${c.estado}`,
        link:'cotizaciones.html', tipo:'Cotización',
        chipClass:'chip-blue',
      }));
    }

    // ── Eventos ──
    if (this.filtroActual === 'todo' || this.filtroActual === 'eventos') {
      const eventos = JSON.parse(localStorage.getItem('ps_eventos') || '[]');
      eventos.filter(e =>
        e.nombre.toLowerCase().includes(q) ||
        (e.lugar||'').toLowerCase().includes(q) ||
        (e.tipo||'').toLowerCase().includes(q) ||
        matchFecha(e.fecha)
      ).forEach(e => resultados.push({
        icono:'📅', titulo:e.nombre,
        sub:`${e.tipo} · ${e.fecha} · ${e.lugar||'Sin lugar'}`,
        link:'eventos.html', tipo:'Evento',
        chipClass:'chip-purple',
      }));
    }

    // ── Facturas ──
    if (this.filtroActual === 'todo' || this.filtroActual === 'facturas') {
      const facturas = JSON.parse(localStorage.getItem('ps_facturas') || '[]');
      facturas.filter(f =>
        f.cliente.toLowerCase().includes(q) ||
        (f.num||'').toLowerCase().includes(q) ||
        (f.servicio||'').toLowerCase().includes(q) ||
        matchFecha(f.emision) ||
        matchFecha(f.vencimiento)
      ).forEach(f => resultados.push({
        icono:'🧾', titulo:`${f.num||''} — ${f.cliente}`,
        sub:`RD$${Number(f.monto).toLocaleString('es-DO')} · ${f.estado} · ${f.emision}`,
        link:'facturas.html', tipo:'Factura',
        chipClass: f.estado === 'Pagada' ? 'chip-green' : 'chip-amber',
      }));
    }

    // ── Proyectos ──
    if (this.filtroActual === 'todo' || this.filtroActual === 'proyectos') {
      const proyectos = JSON.parse(localStorage.getItem('ps_proyectos') || '[]');
      proyectos.filter(p =>
        p.nombre.toLowerCase().includes(q) ||
        (p.cliente||'').toLowerCase().includes(q) ||
        (p.tipo||'').toLowerCase().includes(q) ||
        matchFecha(p.inicio) ||
        matchFecha(p.entrega)
      ).forEach(p => resultados.push({
        icono:'🎬', titulo:p.nombre,
        sub:`${p.cliente} · ${p.estado} · Entrega: ${p.entrega||'—'}`,
        link:'proyectos.html', tipo:'Proyecto',
        chipClass:'chip-teal',
      }));
    }

    // ── Render ──
    if (resultados.length === 0) {
      resultsDiv.innerHTML = `
        <div style="padding:32px;text-align:center;color:var(--text-muted);">
          <div style="font-size:32px;margin-bottom:10px;opacity:0.25;">🔍</div>
          <div style="font-size:14px;font-weight:600;margin-bottom:4px;color:var(--text);opacity:0.4;">Sin resultados</div>
          <div style="font-size:12.5px;">No encontramos nada para "<strong>${query}</strong>"</div>
        </div>`;
      return;
    }

    resultsDiv.innerHTML = resultados.slice(0, 12).map(r => `
      <a href="${r.link}" class="search-result-item">
        <div style="width:36px;height:36px;background:var(--surface2);border-radius:9px;
          display:flex;align-items:center;justify-content:center;font-size:16px;flex-shrink:0;">${r.icono}</div>
        <div style="flex:1;min-width:0;">
          <div style="font-size:13px;font-weight:600;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;">${r.titulo}</div>
          <div style="font-size:11.5px;color:var(--text-muted);white-space:nowrap;overflow:hidden;text-overflow:ellipsis;">${r.sub}</div>
        </div>
        <span class="chip ${r.chipClass}" style="flex-shrink:0;">${r.tipo}</span>
      </a>`).join('') +
      (resultados.length > 12 ? `<div style="padding:10px 18px;text-align:center;font-size:12px;color:var(--text-muted);">+${resultados.length - 12} resultados más. Refina la búsqueda.</div>` : '');
  },
};

/* ─────────────────────────────────────────────────────────────
   4. GOOGLE DRIVE BACKUP
───────────────────────────────────────────────────────────── */
const GoogleDriveBackup = {
  CLIENT_ID: 'TU_CLIENT_ID_AQUI',         // ← reemplazar con tu Client ID de Google Cloud
  API_KEY:   'TU_API_KEY_AQUI',            // ← reemplazar con tu API Key de Google Cloud
  SCOPES:    'https://www.googleapis.com/auth/drive.file',
  FOLDER_NAME: 'PLUTOM STUDIO Backups',

  tokenClient: null,
  accessToken:  null,
  isConfigured: false,

  init() {
    // Verificar si Google API está disponible
    if (typeof google === 'undefined' || this.CLIENT_ID === 'TU_CLIENT_ID_AQUI') {
      console.log('Google Drive: No configurado. Ver js/app.js para setup.');
      return;
    }
    this.isConfigured = true;

    google.accounts.id.initialize({
      client_id: this.CLIENT_ID,
    });

    this.tokenClient = google.accounts.oauth2.initTokenClient({
      client_id: this.CLIENT_ID,
      scope: this.SCOPES,
      callback: (resp) => {
        if (resp.access_token) {
          this.accessToken = resp.access_token;
          this.subirBackup();
        }
      },
    });
  },

  // Solicitar permiso y hacer backup
  async backup() {
    if (!this.isConfigured) {
      this.mostrarSetupModal();
      return;
    }
    if (!this.accessToken) {
      this.tokenClient.requestAccessToken();
    } else {
      await this.subirBackup();
    }
  },

  // Mostrar modal de configuración
  mostrarSetupModal() {
    let modal = document.getElementById('driveSetupModal');
    if (modal) { modal.remove(); return; }

    modal = document.createElement('div');
    modal.id = 'driveSetupModal';
    modal.className = 'modal-overlay open';
    modal.innerHTML = `
      <div class="modal" style="max-width:500px;">
        <div class="modal-header">
          <div class="modal-title">☁️ Configurar Google Drive Backup</div>
          <button class="modal-close" onclick="document.getElementById('driveSetupModal').remove()">✕</button>
        </div>
        <div style="display:flex;flex-direction:column;gap:16px;font-size:13.5px;line-height:1.6;color:var(--text-muted);">

          <div style="background:rgba(77,143,214,0.08);border:1px solid rgba(77,143,214,0.2);border-radius:9px;padding:14px;">
            <div style="font-weight:700;color:var(--text);margin-bottom:6px;">Para activar Google Drive necesitas:</div>
            <ol style="padding-left:18px;display:flex;flex-direction:column;gap:5px;">
              <li>Ir a <a href="https://console.cloud.google.com" target="_blank" style="color:var(--accent2);">Google Cloud Console</a></li>
              <li>Crear un proyecto nuevo</li>
              <li>Activar la API de Google Drive</li>
              <li>Crear credenciales OAuth 2.0</li>
              <li>Copiar el Client ID y API Key aquí abajo</li>
            </ol>
          </div>

          <div class="form-group">
            <label>Google Client ID</label>
            <input type="text" id="drive-client-id" placeholder="xxxx.apps.googleusercontent.com"
              value="${localStorage.getItem('ps_drive_client_id')||''}">
          </div>
          <div class="form-group">
            <label>Google API Key</label>
            <input type="text" id="drive-api-key" placeholder="AIzaSy..."
              value="${localStorage.getItem('ps_drive_api_key')||''}">
          </div>

          <div style="background:rgba(61,186,127,0.08);border:1px solid rgba(61,186,127,0.15);border-radius:9px;padding:12px;font-size:12.5px;">
            💡 Una vez configurado, cada backup se guardará automáticamente en una carpeta "<strong>PLUTOM STUDIO Backups</strong>" en tu Google Drive personal.
          </div>
        </div>
        <div class="modal-footer">
          <button class="btn btn-ghost" onclick="document.getElementById('driveSetupModal').remove()">Cancelar</button>
          <button class="btn btn-primary" onclick="GoogleDriveBackup.guardarConfig()">💾 Guardar Configuración</button>
        </div>
      </div>`;
    document.body.appendChild(modal);
  },

  guardarConfig() {
    const clientId = document.getElementById('drive-client-id').value.trim();
    const apiKey   = document.getElementById('drive-api-key').value.trim();

    if (!clientId || !apiKey) {
      alert('Por favor ingresa Client ID y API Key');
      return;
    }

    localStorage.setItem('ps_drive_client_id', clientId);
    localStorage.setItem('ps_drive_api_key', apiKey);

    // Recargar con las nuevas credenciales
    alert('✅ Configuración guardada. Recarga la página y prueba el backup nuevamente.');
    document.getElementById('driveSetupModal').remove();
  },

  // Hacer el backup real
  async subirBackup() {
    const btn = document.getElementById('btnDriveBackup');
    if (btn) { btn.innerHTML = '☁️ Subiendo...'; btn.disabled = true; }

    try {
      // Recolectar todos los datos
      const backup = {
        fecha:        new Date().toISOString(),
        version:      '1.0',
        clientes:     JSON.parse(localStorage.getItem('ps_clientes')     || '[]'),
        cotizaciones: JSON.parse(localStorage.getItem('ps_cotizaciones') || '[]'),
        facturas:     JSON.parse(localStorage.getItem('ps_facturas')     || '[]'),
        eventos:      JSON.parse(localStorage.getItem('ps_eventos')      || '[]'),
        finanzas:     JSON.parse(localStorage.getItem('ps_finanzas')     || '[]'),
        proyectos:    JSON.parse(localStorage.getItem('ps_proyectos')    || '[]'),
        inventario:   JSON.parse(localStorage.getItem('ps_inventario')   || '[]'),
        recurrentes:  JSON.parse(localStorage.getItem('ps_recurrentes')  || '[]'),
        servicios:    JSON.parse(localStorage.getItem('ps_servicios')    || '[]'),
      };

      const filename = `PLUTOM_Backup_${new Date().toISOString().slice(0,10)}.json`;
      const content  = JSON.stringify(backup, null, 2);

      // Buscar/crear carpeta
      const folderId = await this.obtenerOCrearCarpeta();

      // Subir archivo
      const metadata = { name: filename, parents: [folderId] };
      const form = new FormData();
      form.append('metadata', new Blob([JSON.stringify(metadata)], { type:'application/json' }));
      form.append('file',     new Blob([content], { type:'application/json' }));

      const res = await fetch('https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart', {
        method: 'POST',
        headers: { Authorization: `Bearer ${this.accessToken}` },
        body: form,
      });

      if (!res.ok) throw new Error('Error al subir archivo');

      const file = await res.json();
      localStorage.setItem('ps_last_backup', new Date().toISOString());

      this.mostrarExito(`✅ Backup subido: "${filename}" en Google Drive`);
      if (btn) { btn.innerHTML = '✅ Backup Listo'; setTimeout(() => { btn.innerHTML = '☁️ Drive'; btn.disabled = false; }, 3000); }

    } catch (err) {
      console.error('Error Google Drive:', err);
      this.mostrarError('No se pudo subir el backup. Revisa tus credenciales en la configuración.');
      if (btn) { btn.innerHTML = '☁️ Drive'; btn.disabled = false; }
    }
  },

  async obtenerOCrearCarpeta() {
    // Buscar carpeta existente
    const search = await fetch(
      `https://www.googleapis.com/drive/v3/files?q=name='${this.FOLDER_NAME}'+and+mimeType='application/vnd.google-apps.folder'+and+trashed=false`,
      { headers: { Authorization: `Bearer ${this.accessToken}` } }
    );
    const data = await search.json();
    if (data.files && data.files.length > 0) return data.files[0].id;

    // Crear carpeta nueva
    const create = await fetch('https://www.googleapis.com/drive/v3/files', {
      method: 'POST',
      headers: { Authorization: `Bearer ${this.accessToken}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: this.FOLDER_NAME, mimeType: 'application/vnd.google-apps.folder' }),
    });
    const folder = await create.json();
    return folder.id;
  },

  // Restaurar backup desde Drive
  async restaurarDesdeArchivo(jsonContent) {
    try {
      const backup = JSON.parse(jsonContent);
      if (!backup.version || !backup.clientes) {
        alert('El archivo no parece un backup válido de PLUTOM STUDIO');
        return;
      }

      const confirmar = confirm(`¿Restaurar backup del ${new Date(backup.fecha).toLocaleString('es-DO')}?\n\nEsto REEMPLAZARÁ todos tus datos actuales.`);
      if (!confirmar) return;

      const keys = ['clientes','cotizaciones','facturas','eventos','finanzas','proyectos','inventario','recurrentes','servicios'];
      keys.forEach(k => {
        if (backup[k]) localStorage.setItem(`ps_${k}`, JSON.stringify(backup[k]));
      });

      alert('✅ Backup restaurado correctamente. Recargando la plataforma...');
      location.reload();
    } catch {
      alert('Error al restaurar el backup. El archivo puede estar dañado.');
    }
  },

  mostrarExito(msg) {
    this._toast(msg, 'var(--green)', 'rgba(61,186,127,0.15)', 'rgba(61,186,127,0.25)');
  },

  mostrarError(msg) {
    this._toast(msg, 'var(--red)', 'rgba(224,82,82,0.15)', 'rgba(224,82,82,0.25)');
  },

  _toast(msg, color, bg, border) {
    const t = document.createElement('div');
    t.style.cssText = `
      position:fixed;bottom:28px;left:50%;transform:translateX(-50%);
      background:var(--surface);border:1px solid ${border};
      color:${color};padding:12px 24px;border-radius:10px;
      font-weight:600;font-size:13.5px;z-index:999;
      box-shadow:0 8px 24px rgba(0,0,0,0.4);
      animation:fadeUp .3s ease;white-space:nowrap;
      font-family:'Manrope',sans-serif;
    `;
    t.textContent = msg;
    document.body.appendChild(t);
    setTimeout(() => t.remove(), 4000);
  },
};

/* ─────────────────────────────────────────────────────────────
   5. WIRING — conectar botones existentes al cargar la página
───────────────────────────────────────────────────────────── */
document.addEventListener('DOMContentLoaded', () => {

  // Fix logo y fuentes
  fixSidebar();

  // Calcular y mostrar notificaciones
  Notificaciones.render();

  // Botón campana
  const notifBtn = document.getElementById('notifBtn');
  if (notifBtn) {
    notifBtn.style.cursor = 'pointer';
    notifBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      Notificaciones.abrirPanel();
    });
  }

  // Botón búsqueda global (ícono lupa del topbar)
  document.querySelectorAll('.icon-btn').forEach(btn => {
    if (btn.textContent.includes('🔍')) {
      btn.style.cursor = 'pointer';
      btn.addEventListener('click', () => BusquedaGlobal.abrir());
    }
  });

  // Tecla "/" para abrir búsqueda rápida
  document.addEventListener('keydown', (e) => {
    if (e.key === '/' && !['INPUT','TEXTAREA','SELECT'].includes(e.target.tagName)) {
      e.preventDefault();
      BusquedaGlobal.abrir();
    }
  });

  // Google Drive: cargar credenciales guardadas
  const savedClientId = localStorage.getItem('ps_drive_client_id');
  const savedApiKey   = localStorage.getItem('ps_drive_api_key');
  if (savedClientId && savedApiKey) {
    GoogleDriveBackup.CLIENT_ID = savedClientId;
    GoogleDriveBackup.API_KEY   = savedApiKey;
  }
  GoogleDriveBackup.init();

  // Insertar botón Drive en topbar (derecha)
  const topbarRight = document.querySelector('.topbar-right');
  if (topbarRight) {
    // Botón Drive
    const driveBtn = document.createElement('div');
    driveBtn.id = 'btnDriveBackup';
    driveBtn.className = 'icon-btn';
    driveBtn.title = 'Backup en Google Drive';
    driveBtn.innerHTML = '☁️';
    driveBtn.style.cursor = 'pointer';
    driveBtn.addEventListener('click', () => GoogleDriveBackup.backup());
    topbarRight.insertBefore(driveBtn, topbarRight.firstChild);

    // Tooltip con fecha del último backup
    const lastBackup = localStorage.getItem('ps_last_backup');
    if (lastBackup) {
      driveBtn.title = `Último backup: ${new Date(lastBackup).toLocaleString('es-DO')}`;
    }
  }

  // Eliminar badges hardcodeados del sidebar (cotizaciones (3), eventos (2))
  document.querySelectorAll('.nav-badge').forEach(badge => badge.remove());

  // Actualizar notificaciones cada 5 minutos
  setInterval(() => Notificaciones.render(), 5 * 60 * 1000);

  // Restaurar backup (input de archivo oculto)
  if (!document.getElementById('restoreInput')) {
    const restoreInput = document.createElement('input');
    restoreInput.type = 'file';
    restoreInput.id   = 'restoreInput';
    restoreInput.accept = '.json';
    restoreInput.style.display = 'none';
    restoreInput.onchange = async (e) => {
      const file = e.target.files[0];
      if (!file) return;
      const text = await file.text();
      GoogleDriveBackup.restaurarDesdeArchivo(text);
    };
    document.body.appendChild(restoreInput);
  }

});

// Exponer globalmente
window.Notificaciones       = Notificaciones;
window.BusquedaGlobal       = BusquedaGlobal;
window.GoogleDriveBackup    = GoogleDriveBackup;