/* ═══════════════════════════════════════════════════════════════
   PLUTOM STUDIO — Sistema Global de Búsqueda y Notificaciones
   Incluir en TODAS las páginas: <script src="js/global.js"></script>
═══════════════════════════════════════════════════════════════ */

(function () {
  'use strict';

  /* ─────────────────────────────────────────────
     HELPERS
  ───────────────────────────────────────────── */
  function cargar(k) { return JSON.parse(localStorage.getItem(k) || '[]'); }

  /* ─────────────────────────────────────────────
     SISTEMA DE NOTIFICACIONES
     Construye alertas reales desde los datos
  ───────────────────────────────────────────── */
  function calcularNotificaciones() {
    const alertas = [];
    const hoy = new Date(); hoy.setHours(0, 0, 0, 0);
    const en5  = new Date(hoy); en5.setDate(en5.getDate() + 5);
    const en3  = new Date(hoy); en3.setDate(en3.getDate() + 3);

    // ── Cotizaciones pendientes sin responder
    const cotizaciones = cargar('ps_cotizaciones');
    const pendientes   = cotizaciones.filter(c => c.estado === 'Pendiente');
    if (pendientes.length > 0) {
      alertas.push({
        id:     'cot-pend',
        tipo:   'warning',
        icono:  '📄',
        titulo: `${pendientes.length} cotización${pendientes.length > 1 ? 'es' : ''} pendiente${pendientes.length > 1 ? 's' : ''}`,
        desc:   'Sin respuesta del cliente',
        link:   'cotizaciones.html',
        prioridad: 2,
      });
    }

    // ── Facturas vencidas
    const facturas      = cargar('ps_facturas');
    const facVencidas   = facturas.filter(f => f.estado === 'Vencida');
    if (facVencidas.length > 0) {
      alertas.push({
        id:     'fac-venc',
        tipo:   'danger',
        icono:  '🧾',
        titulo: `${facVencidas.length} factura${facVencidas.length > 1 ? 's' : ''} vencida${facVencidas.length > 1 ? 's' : ''}`,
        desc:   `RD$${facVencidas.reduce((s, f) => s + Number(f.monto), 0).toLocaleString('es-DO')} por cobrar`,
        link:   'facturas.html',
        prioridad: 1,
      });
    }

    // ── Facturas pendientes de pago próximas
    const facPendientes = facturas.filter(f => {
      if (f.estado !== 'Pendiente' || !f.vencimiento) return false;
      const d = new Date(f.vencimiento + 'T00:00:00');
      return d >= hoy && d <= en5;
    });
    if (facPendientes.length > 0) {
      alertas.push({
        id:     'fac-prox',
        tipo:   'warning',
        icono:  '⏳',
        titulo: `${facPendientes.length} factura${facPendientes.length > 1 ? 's' : ''} vence${facPendientes.length > 1 ? 'n' : ''} pronto`,
        desc:   'En los próximos 5 días',
        link:   'facturas.html',
        prioridad: 2,
      });
    }

    // ── Eventos próximos (3 días)
    const eventos    = cargar('ps_eventos');
    const evProximos = eventos.filter(e => {
      const d = new Date(e.fecha + 'T00:00:00');
      return d >= hoy && d <= en3 && e.estado === 'Confirmado';
    });
    if (evProximos.length > 0) {
      alertas.push({
        id:     'ev-prox',
        tipo:   'info',
        icono:  '📅',
        titulo: `${evProximos.length} evento${evProximos.length > 1 ? 's' : ''} en los próximos 3 días`,
        desc:   evProximos.map(e => e.nombre).join(', '),
        link:   'eventos.html',
        prioridad: 1,
      });
    }

    // ── Clientes recurrentes: cobros vencidos o en ≤3 días
    const recurrentes = cargar('ps_recurrentes');
    const cobrosUrgentes = recurrentes.filter(r => {
      if (r.estado !== 'activo') return false;
      const diaCobro = parseInt(r.diaCobro);
      const segunda  = diaCobro + 15 > 28 ? 28 : diaCobro + 15;
      const mes = hoy.getMonth(), anio = hoy.getFullYear();
      const candidatos = [
        new Date(anio, mes, diaCobro),
        new Date(anio, mes, segunda),
        new Date(anio, mes + 1, diaCobro),
      ].filter(d => d >= hoy).sort((a, b) => a - b);
      const prox = candidatos[0];
      if (!prox) return false;
      const dias = Math.round((prox - hoy) / 86400000);
      return dias <= 3;
    });
    if (cobrosUrgentes.length > 0) {
      alertas.push({
        id:     'rec-cobro',
        tipo:   'danger',
        icono:  '🔁',
        titulo: `${cobrosUrgentes.length} cobro${cobrosUrgentes.length > 1 ? 's' : ''} quincenal${cobrosUrgentes.length > 1 ? 'es' : ''} pendiente${cobrosUrgentes.length > 1 ? 's' : ''}`,
        desc:   cobrosUrgentes.map(r => r.nombre).join(', '),
        link:   'plutom-studio-dashboard.html',
        prioridad: 1,
      });
    }

    // ── Proyectos vencidos (fecha entrega pasada, no completados)
    const proyectos    = cargar('ps_proyectos');
    const proyVencidos = proyectos.filter(p => {
      if (!p.entrega || p.estado === 'Completado') return false;
      return new Date(p.entrega + 'T00:00:00') < hoy;
    });
    if (proyVencidos.length > 0) {
      alertas.push({
        id:     'proy-venc',
        tipo:   'warning',
        icono:  '🎬',
        titulo: `${proyVencidos.length} proyecto${proyVencidos.length > 1 ? 's' : ''} con entrega vencida`,
        desc:   proyVencidos.map(p => p.nombre).join(', '),
        link:   'proyectos.html',
        prioridad: 2,
      });
    }

    // Ordenar por prioridad
    alertas.sort((a, b) => a.prioridad - b.prioridad);
    return alertas;
  }

  /* ─────────────────────────────────────────────
     RENDERIZAR PANEL DE NOTIFICACIONES
  ───────────────────────────────────────────── */
  function renderPanelNotificaciones(alertas, btnEl) {
    // Remover panel existente
    const existing = document.getElementById('notifPanel');
    if (existing) { existing.remove(); return; }

    const panel = document.createElement('div');
    panel.id = 'notifPanel';
    panel.style.cssText = `
      position: fixed;
      top: ${btnEl.getBoundingClientRect().bottom + 8}px;
      right: 24px;
      width: 340px;
      background: var(--surface);
      border: 1px solid var(--border-hover);
      border-radius: 14px;
      box-shadow: 0 20px 48px rgba(0,0,0,0.55);
      z-index: 500;
      overflow: hidden;
      animation: fadeUp 0.22s var(--ease, cubic-bezier(0.16,1,0.3,1)) both;
    `;

    const header = `
      <div style="padding:14px 18px 12px;border-bottom:1px solid var(--border);display:flex;align-items:center;justify-content:space-between;">
        <div style="font-family:'Outfit',sans-serif;font-size:14px;font-weight:700;">Notificaciones</div>
        <span style="font-size:11px;color:var(--text-muted);">${alertas.length} alerta${alertas.length !== 1 ? 's' : ''}</span>
      </div>`;

    const TIPO_COLORS = {
      danger:  { bg: 'rgba(224,82,82,0.08)',  border: 'rgba(224,82,82,0.18)',  dot: 'var(--red)' },
      warning: { bg: 'rgba(200,168,75,0.08)', border: 'rgba(200,168,75,0.18)', dot: 'var(--accent2)' },
      info:    { bg: 'rgba(77,143,214,0.08)', border: 'rgba(77,143,214,0.18)', dot: 'var(--blue)' },
      success: { bg: 'rgba(61,186,127,0.08)', border: 'rgba(61,186,127,0.18)', dot: 'var(--green)' },
    };

    let body = '';
    if (alertas.length === 0) {
      body = `<div style="padding:32px 18px;text-align:center;color:var(--text-muted);">
        <div style="font-size:28px;margin-bottom:8px;opacity:0.3;">✅</div>
        <div style="font-size:13px;font-weight:600;">Todo al día</div>
        <div style="font-size:12px;margin-top:4px;">No hay alertas pendientes</div>
      </div>`;
    } else {
      body = `<div style="max-height:360px;overflow-y:auto;">` +
        alertas.map(a => {
          const c = TIPO_COLORS[a.tipo] || TIPO_COLORS.info;
          return `
          <a href="${a.link}" onclick="document.getElementById('notifPanel').remove()"
             style="display:flex;align-items:flex-start;gap:12px;padding:13px 18px;
                    border-bottom:1px solid var(--border);cursor:pointer;
                    transition:background .15s;text-decoration:none;color:inherit;"
             onmouseover="this.style.background='var(--surface2)'"
             onmouseout="this.style.background=''">
            <div style="width:34px;height:34px;border-radius:9px;background:${c.bg};
                        border:1px solid ${c.border};display:flex;align-items:center;
                        justify-content:center;font-size:16px;flex-shrink:0;">${a.icono}</div>
            <div style="flex:1;min-width:0;">
              <div style="font-size:13px;font-weight:600;margin-bottom:2px;">${a.titulo}</div>
              <div style="font-size:11.5px;color:var(--text-muted);white-space:nowrap;overflow:hidden;text-overflow:ellipsis;">${a.desc}</div>
            </div>
            <div style="width:7px;height:7px;border-radius:50%;background:${c.dot};margin-top:5px;flex-shrink:0;"></div>
          </a>`;
        }).join('') + `</div>`;
    }

    panel.innerHTML = header + body;
    document.body.appendChild(panel);

    // Cerrar al hacer clic afuera
    setTimeout(() => {
      document.addEventListener('click', function handler(e) {
        if (!panel.contains(e.target) && e.target !== btnEl) {
          panel.remove();
          document.removeEventListener('click', handler);
        }
      });
    }, 100);
  }

  /* ─────────────────────────────────────────────
     SISTEMA GLOBAL DE BÚSQUEDA
  ───────────────────────────────────────────── */
  function abrirBusquedaGlobal() {
    if (document.getElementById('searchOverlay')) return;

    const overlay = document.createElement('div');
    overlay.id = 'searchOverlay';
    overlay.style.cssText = `
      position:fixed;inset:0;background:rgba(4,8,16,0.75);
      backdrop-filter:blur(8px);z-index:600;
      display:flex;align-items:flex-start;justify-content:center;
      padding-top:80px;
      animation:fadeIn .2s ease;
    `;

    overlay.innerHTML = `
      <div style="width:100%;max-width:580px;padding:0 16px;">

        <!-- Input de búsqueda -->
        <div style="background:var(--surface);border:1px solid var(--border-hover);
                    border-radius:14px;padding:0;overflow:hidden;
                    box-shadow:0 24px 56px rgba(0,0,0,0.6);">
          <div style="display:flex;align-items:center;gap:12px;padding:14px 18px;
                      border-bottom:1px solid var(--border);">
            <span style="font-size:16px;opacity:0.5;">🔍</span>
            <input id="globalSearchInput" type="text" placeholder="Buscar clientes, eventos, proyectos, cotizaciones..."
                   style="flex:1;background:none;border:none;outline:none;
                          font-size:15px;color:var(--text,#e8edf3);font-family:inherit;"
                   autocomplete="off">
            <div style="display:flex;gap:6px;align-items:center;">
              <div id="searchFilterDate" style="display:flex;align-items:center;gap:6px;">
                <input type="date" id="searchDateFrom" placeholder="Desde"
                       style="background:var(--surface2,#141f30);border:1px solid var(--border);
                              border-radius:7px;padding:5px 10px;font-size:12px;color:var(--text-muted);
                              outline:none;width:130px;cursor:pointer;">
                <span style="font-size:11px;color:var(--text-muted);">—</span>
                <input type="date" id="searchDateTo" placeholder="Hasta"
                       style="background:var(--surface2,#141f30);border:1px solid var(--border);
                              border-radius:7px;padding:5px 10px;font-size:12px;color:var(--text-muted);
                              outline:none;width:130px;cursor:pointer;">
              </div>
              <kbd style="background:var(--surface2);border:1px solid var(--border);
                          border-radius:5px;padding:2px 7px;font-size:11px;
                          color:var(--text-muted);cursor:pointer;" onclick="cerrarBusqueda()">ESC</kbd>
            </div>
          </div>

          <!-- Filtros rápidos -->
          <div style="display:flex;gap:6px;padding:10px 18px;border-bottom:1px solid var(--border);">
            ${['Todo','Clientes','Eventos','Proyectos','Cotizaciones','Facturas'].map((f,i) =>
              `<button onclick="setFiltro('${f.toLowerCase()}')" id="filtro-${f.toLowerCase()}"
                style="padding:4px 12px;border-radius:20px;font-size:12px;font-weight:600;
                       cursor:pointer;transition:all .15s;border:1px solid var(--border);
                       background:${i===0?'var(--navy-mid,#1a3a5c)':'var(--surface2)'};
                       color:${i===0?'var(--silver-pale,#d4dce5)':'var(--text-muted)'};">${f}</button>`
            ).join('')}
          </div>

          <!-- Resultados -->
          <div id="searchResults" style="max-height:420px;overflow-y:auto;">
            <div style="padding:28px 18px;text-align:center;color:var(--text-muted);">
              <div style="font-size:13px;">Escribe para buscar en toda la plataforma</div>
            </div>
          </div>

          <!-- Footer -->
          <div style="padding:10px 18px;border-top:1px solid var(--border);
                      display:flex;align-items:center;gap:16px;">
            <span style="font-size:11.5px;color:var(--text-muted);">↵ Ir al resultado &nbsp;·&nbsp; ESC Cerrar</span>
            <span id="resultCount" style="margin-left:auto;font-size:11.5px;color:var(--text-muted);"></span>
          </div>
        </div>
      </div>
    `;

    document.body.appendChild(overlay);
    overlay.addEventListener('click', e => { if (e.target === overlay) cerrarBusqueda(); });

    const input = document.getElementById('globalSearchInput');
    input.focus();

    let filtroActivo = 'todo';

    function setFiltro(f) {
      filtroActivo = f;
      document.querySelectorAll('[id^="filtro-"]').forEach(btn => {
        const isActive = btn.id === `filtro-${f}`;
        btn.style.background = isActive ? 'var(--navy-mid,#1a3a5c)' : 'var(--surface2)';
        btn.style.color = isActive ? 'var(--silver-pale,#d4dce5)' : 'var(--text-muted)';
      });
      buscar(input.value);
    }
    window.setFiltro = setFiltro;

    function buscar(query) {
      const dateFrom = document.getElementById('searchDateFrom').value;
      const dateTo   = document.getElementById('searchDateTo').value;
      const q        = query.trim().toLowerCase();
      const results  = [];

      if (!q && !dateFrom && !dateTo) {
        document.getElementById('searchResults').innerHTML = `
          <div style="padding:28px 18px;text-align:center;color:var(--text-muted);">
            <div style="font-size:13px;">Escribe para buscar en toda la plataforma</div>
          </div>`;
        document.getElementById('resultCount').textContent = '';
        return;
      }

      function inDateRange(fechaStr) {
        if (!dateFrom && !dateTo) return true;
        if (!fechaStr) return false;
        const d = new Date(fechaStr + 'T00:00:00');
        if (dateFrom && d < new Date(dateFrom + 'T00:00:00')) return false;
        if (dateTo   && d > new Date(dateTo   + 'T00:00:00')) return false;
        return true;
      }

      // CLIENTES
      if (filtroActivo === 'todo' || filtroActivo === 'clientes') {
        cargar('ps_clientes').forEach(c => {
          const match = !q || c.nombre.toLowerCase().includes(q) || (c.empresa||'').toLowerCase().includes(q) || c.telefono.includes(q);
          if (match && inDateRange(c.fecha)) {
            results.push({
              icono: '👥', titulo: c.nombre, sub: `${c.tipo} · ${c.telefono}`,
              chip: c.estado, chipClass: c.estado==='Activo'?'#3dba7f':'#c8a84b',
              link: 'clientes.html', tipo: 'Cliente',
            });
          }
        });
      }

      // EVENTOS
      if (filtroActivo === 'todo' || filtroActivo === 'eventos') {
        cargar('ps_eventos').forEach(e => {
          const match = !q || e.nombre.toLowerCase().includes(q) || (e.lugar||'').toLowerCase().includes(q) || e.tipo.toLowerCase().includes(q);
          if (match && inDateRange(e.fecha)) {
            results.push({
              icono: '📅', titulo: e.nombre, sub: `${e.tipo} · ${e.fecha}${e.lugar?' · '+e.lugar:''}`,
              chip: e.estado, chipClass: e.estado==='Confirmado'?'#3dba7f':'#c8a84b',
              link: 'eventos.html', tipo: 'Evento',
            });
          }
        });
      }

      // PROYECTOS
      if (filtroActivo === 'todo' || filtroActivo === 'proyectos') {
        cargar('ps_proyectos').forEach(p => {
          const match = !q || p.nombre.toLowerCase().includes(q) || p.cliente.toLowerCase().includes(q) || p.tipo.toLowerCase().includes(q);
          if (match && inDateRange(p.inicio)) {
            results.push({
              icono: '🎬', titulo: p.nombre, sub: `${p.cliente} · ${p.estado}`,
              chip: `${p.progreso||0}%`, chipClass: '#4d8fd6',
              link: 'proyectos.html', tipo: 'Proyecto',
            });
          }
        });
      }

      // COTIZACIONES
      if (filtroActivo === 'todo' || filtroActivo === 'cotizaciones') {
        cargar('ps_cotizaciones').forEach(c => {
          const match = !q || c.cliente.toLowerCase().includes(q) || (c.servicio||'').toLowerCase().includes(q) || (c.num||'').toLowerCase().includes(q);
          if (match && inDateRange(c.fecha)) {
            results.push({
              icono: '📄', titulo: `${c.num||''} — ${c.cliente}`, sub: `${c.servicio} · RD$${Number(c.monto).toLocaleString('es-DO')}`,
              chip: c.estado, chipClass: c.estado==='Aprobada'?'#3dba7f':c.estado==='Rechazada'?'#e05252':'#c8a84b',
              link: 'cotizaciones.html', tipo: 'Cotización',
            });
          }
        });
      }

      // FACTURAS
      if (filtroActivo === 'todo' || filtroActivo === 'facturas') {
        cargar('ps_facturas').forEach(f => {
          const match = !q || f.cliente.toLowerCase().includes(q) || (f.num||'').toLowerCase().includes(q) || (f.servicio||'').toLowerCase().includes(q);
          if (match && inDateRange(f.emision)) {
            results.push({
              icono: '🧾', titulo: `${f.num||''} — ${f.cliente}`, sub: `RD$${Number(f.monto).toLocaleString('es-DO')} · ${f.estado}`,
              chip: f.estado, chipClass: f.estado==='Pagada'?'#3dba7f':f.estado==='Vencida'?'#e05252':'#c8a84b',
              link: 'facturas.html', tipo: 'Factura',
            });
          }
        });
      }

      // Renderizar resultados
      document.getElementById('resultCount').textContent = `${results.length} resultado${results.length!==1?'s':''}`;

      if (results.length === 0) {
        document.getElementById('searchResults').innerHTML = `
          <div style="padding:36px 18px;text-align:center;color:var(--text-muted);">
            <div style="font-size:28px;margin-bottom:8px;opacity:0.25;">🔍</div>
            <div style="font-size:14px;font-weight:600;opacity:0.5;">Sin resultados</div>
            <div style="font-size:12.5px;margin-top:4px;">Intenta con otro término o ajusta las fechas</div>
          </div>`;
        return;
      }

      document.getElementById('searchResults').innerHTML = results.map(r => `
        <a href="${r.link}" onclick="cerrarBusqueda()"
           style="display:flex;align-items:center;gap:12px;padding:12px 18px;
                  border-bottom:1px solid var(--border);cursor:pointer;
                  transition:background .12s;text-decoration:none;color:inherit;"
           onmouseover="this.style.background='var(--surface2)'"
           onmouseout="this.style.background=''">
          <div style="width:34px;height:34px;border-radius:9px;background:var(--surface2);
                      display:flex;align-items:center;justify-content:center;font-size:15px;flex-shrink:0;">${r.icono}</div>
          <div style="flex:1;min-width:0;">
            <div style="font-size:13px;font-weight:600;margin-bottom:1px;">${r.titulo}</div>
            <div style="font-size:11.5px;color:var(--text-muted);white-space:nowrap;overflow:hidden;text-overflow:ellipsis;">${r.sub}</div>
          </div>
          <div style="display:flex;flex-direction:column;align-items:flex-end;gap:4px;flex-shrink:0;">
            <span style="font-size:10px;color:var(--text-muted);background:var(--surface2);
                         padding:1px 7px;border-radius:10px;">${r.tipo}</span>
            <span style="font-size:11px;font-weight:700;color:${r.chipClass};">${r.chip}</span>
          </div>
        </a>
      `).join('');
    }

    input.addEventListener('input', () => buscar(input.value));
    document.getElementById('searchDateFrom').addEventListener('change', () => buscar(input.value));
    document.getElementById('searchDateTo').addEventListener('change', () => buscar(input.value));
  }

  function cerrarBusqueda() {
    const el = document.getElementById('searchOverlay');
    if (el) el.remove();
  }
  window.cerrarBusqueda = cerrarBusqueda;

  /* ─────────────────────────────────────────────
     INYECCIÓN EN EL DOM AL CARGAR
  ───────────────────────────────────────────── */
  document.addEventListener('DOMContentLoaded', function () {

    // ── Conectar botón de notificaciones ──
    const notifBtn = document.querySelector('.icon-btn[title="Notificaciones"], #notifBtn');
    if (notifBtn) {
      const alertas = calcularNotificaciones();

      // Actualizar badge / punto
      const dot = notifBtn.querySelector('.notif-dot');
      if (alertas.length > 0) {
        if (dot) dot.style.display = 'block';
        // Mostrar contador si hay muchas
        if (alertas.length >= 2 && !notifBtn.querySelector('.notif-count')) {
          const cnt = document.createElement('span');
          cnt.className = 'notif-count';
          cnt.style.cssText = `position:absolute;top:-4px;right:-4px;background:var(--red);
            color:#fff;font-size:9px;font-weight:800;width:16px;height:16px;
            border-radius:50%;display:flex;align-items:center;justify-content:center;
            border:2px solid var(--bg);`;
          cnt.textContent = alertas.length > 9 ? '9+' : alertas.length;
          notifBtn.appendChild(cnt);
        }
      } else {
        if (dot) dot.style.display = 'none';
      }

      notifBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        renderPanelNotificaciones(alertas, notifBtn);
      });
    }

    // ── Conectar botón de búsqueda ──
    const searchBtn = document.querySelector('.icon-btn[title="Buscar"], .icon-btn[title="buscar"]');
    if (searchBtn) {
      searchBtn.addEventListener('click', abrirBusquedaGlobal);
    }

    // ── Atajo de teclado Ctrl+K / Cmd+K ──
    document.addEventListener('keydown', (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault();
        abrirBusquedaGlobal();
      }
      if (e.key === 'Escape') {
        cerrarBusqueda();
        const panel = document.getElementById('notifPanel');
        if (panel) panel.remove();
      }
    });
  });

})();