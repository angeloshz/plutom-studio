/* ═══════════════════════════════════════════════════════════════
   PLUTOM STUDIO — Shell Compartido v2
   ─────────────────────────────────────────────────────────────
   Este script reemplaza el sidebar y topbar completos en TODAS
   las páginas. Un solo archivo para controlar toda la UI global.

   USO en cada página:
     1. El <aside class="sidebar"> puede dejarse vacío o eliminarse
     2. El .topbar-right puede dejarse vacío
     3. Este script lo llena todo automáticamente
═══════════════════════════════════════════════════════════════ */

'use strict';

(function () {

  /* ───────────────────────────────────────────────────────────
     MAPA DE PÁGINAS — define título, ícono y página activa
  ─────────────────────────────────────────────────────────────── */
  const PAGES = {
    'plutom-studio-dashboard.html': { titulo: 'Dashboard',      icono: '⊞',  btnLabel: '+ Nuevo Proyecto', btnHref: 'proyectos.html' },
    'clientes.html':                { titulo: 'Clientes',        icono: '👥',  btnLabel: '+ Nuevo Cliente',  btnHref: null },
    'cotizaciones.html':            { titulo: 'Cotizaciones',    icono: '📄',  btnLabel: '+ Nueva Cotización', btnHref: null },
    'facturas.html':                { titulo: 'Facturas',        icono: '🧾',  btnLabel: '+ Nueva Factura',  btnHref: null },
    'finanzas.html':                { titulo: 'Finanzas',        icono: '💰',  btnLabel: '+ Registrar Movimiento', btnHref: null },
    'inventario.html':              { titulo: 'Inventario',      icono: '📦',  btnLabel: '+ Agregar Equipo', btnHref: null },
    'proyectos.html':               { titulo: 'Proyectos',       icono: '🎬',  btnLabel: '+ Nuevo Proyecto', btnHref: null },
    'eventos.html':                 { titulo: 'Eventos',         icono: '📅',  btnLabel: '+ Nuevo Evento',   btnHref: null },
    'reportes.html':                { titulo: 'Reportes',        icono: '📊',  btnLabel: '🖨️ Exportar',     btnHref: null },
    'servicios.html':               { titulo: 'Servicios',       icono: '⚙️',  btnLabel: '+ Nuevo Servicio', btnHref: null },
  };

  const NAV_ITEMS = [
    { section: 'Principal' },
    { href: 'plutom-studio-dashboard.html', icono: '⊞',  label: 'Dashboard' },
    { href: 'clientes.html',                icono: '👥',  label: 'Clientes' },
    { href: 'cotizaciones.html',            icono: '📄',  label: 'Cotizaciones' },
    { href: 'facturas.html',                icono: '🧾',  label: 'Facturas' },
    { section: 'Operaciones' },
    { href: 'finanzas.html',                icono: '💰',  label: 'Finanzas' },
    { href: 'inventario.html',              icono: '📦',  label: 'Inventario' },
    { href: 'proyectos.html',               icono: '🎬',  label: 'Proyectos' },
    { href: 'eventos.html',                 icono: '📅',  label: 'Eventos' },
    { section: 'Análisis' },
    { href: 'reportes.html',                icono: '📊',  label: 'Reportes' },
    { href: 'servicios.html',               icono: '⚙️',  label: 'Servicios' },
  ];

  /* ───────────────────────────────────────────────────────────
     DETECTAR PÁGINA ACTUAL
  ─────────────────────────────────────────────────────────────── */
  function getPaginaActual() {
    const path  = window.location.pathname;
    const parts = path.split('/');
    return parts[parts.length - 1] || 'plutom-studio-dashboard.html';
  }

  /* ───────────────────────────────────────────────────────────
     CONSTRUIR SIDEBAR COMPLETO
  ─────────────────────────────────────────────────────────────── */
  function buildSidebar() {
    const paginaActual = getPaginaActual();

    // Construir nav items
    const navHTML = NAV_ITEMS.map(item => {
      if (item.section) {
        return `<div class="nav-section">${item.section}</div>`;
      }
      const isActive = item.href === paginaActual ? 'active' : '';
      return `
        <a class="nav-item ${isActive}" href="${item.href}">
          <span class="nav-icon">${item.icono}</span>
          ${item.label}
        </a>`;
    }).join('\n');

    return `
      <div class="logo">
        <img src="img/logo-icon.png" alt="PLUTOM" class="logo-img"
             onerror="this.style.display='none';this.nextSibling&&(this.nextSibling.style.display='flex')">
        <div class="logo-fallback" style="display:none;width:36px;height:36px;border-radius:9px;
             background:linear-gradient(135deg,#1a3a5c,#234d78);
             align-items:center;justify-content:center;font-size:18px;flex-shrink:0;">🪐</div>
        <div class="logo-text">
          <span class="logo-name">PLUTOM STUDIO</span>
          <span class="logo-sub">Management Platform</span>
        </div>
      </div>
      <nav>${navHTML}</nav>
      <div class="sidebar-footer">
        <div class="admin-section">
          <div class="admin-label">⚙️ Admin</div>
          <button class="admin-button" onclick="AdminSettings.abrirConfiguraciones()" title="Configuraciones">
            ⚙️ Configuraciones
          </button>
        </div>
        <div class="user-card" id="userCard" title="Clic para cerrar sesión">
          <div class="avatar">PS</div>
          <div class="user-info">
            <p id="sidebarUserName">Plutom Studio</p>
            <span id="sidebarUserRole">Administrador</span>
          </div>
        </div>
      </div>`;
  }

  /* ───────────────────────────────────────────────────────────
     CONSTRUIR TOPBAR DERECHO (botones globales)
  ─────────────────────────────────────────────────────────────── */
  function buildTopbarRight(pageInfo) {
    const btnLabel = pageInfo ? pageInfo.btnLabel : '+ Nuevo';
    const btnHref  = pageInfo ? pageInfo.btnHref  : null;
    const btnEl    = btnHref
      ? `<a href="${btnHref}" class="btn btn-primary" id="topbarMainBtn">${btnLabel}</a>`
      : `<button class="btn btn-primary" id="topbarMainBtn" onclick="typeof abrirModal==='function'&&abrirModal()">${btnLabel}</button>`;

    return `
      <div class="icon-btn" id="btnDriveBackup" title="Backup Google Drive" style="cursor:pointer;">☁️</div>
      <div class="icon-btn" id="globalSearchBtn" title="Búsqueda global (/) " style="cursor:pointer;">🔍</div>
      <div class="icon-btn" id="notifBtn" title="Notificaciones" style="cursor:pointer;position:relative;">
        🔔<span class="notif-dot" id="notifDot" style="display:none"></span>
      </div>
      ${btnEl}`;
  }

  /* ───────────────────────────────────────────────────────────
     INYECTAR TODO
  ─────────────────────────────────────────────────────────────── */
  function inject() {
    const paginaActual = getPaginaActual();
    const pageInfo     = PAGES[paginaActual] || PAGES['plutom-studio-dashboard.html'];

    // ── 1. SIDEBAR ──
    let sidebar = document.querySelector('.sidebar');
    if (!sidebar) {
      sidebar = document.createElement('aside');
      sidebar.className = 'sidebar';
      document.body.insertBefore(sidebar, document.body.firstChild);
    }
    sidebar.innerHTML = buildSidebar();

    // ── 2. TOPBAR — actualizar título si está vacío ──
    const titleEl = document.querySelector('.page-title');
    if (titleEl && (!titleEl.textContent.trim() || titleEl.textContent.trim() === '')) {
      titleEl.textContent = pageInfo.titulo;
    }

    // ── 3. TOPBAR RIGHT — reemplazar contenido ──
    let topbarRight = document.querySelector('.topbar-right');
    if (topbarRight) {
      // Preservar elementos específicos de la página (search-bar local, selects)
      const localSearch = topbarRight.querySelector('.search-bar');
      const localSelects = [...topbarRight.querySelectorAll('select')];

      // Insertar botones globales al inicio
      const globalDiv = document.createElement('div');
      globalDiv.style.cssText = 'display:contents';
      globalDiv.innerHTML = `
        <div class="icon-btn" id="btnDriveBackup" title="Backup Google Drive" style="cursor:pointer;order:-3">☁️</div>
        <div class="icon-btn" id="globalSearchBtn" title="Búsqueda global (/)" style="cursor:pointer;order:-2">🔍</div>
        <div class="icon-btn" id="notifBtn" title="Notificaciones" style="cursor:pointer;position:relative;order:-1">
          🔔<span class="notif-dot" id="notifDot" style="display:none"></span>
        </div>`;

      // Limpiar botones de notif/búsqueda duplicados (versión anterior)
      topbarRight.querySelectorAll('.icon-btn').forEach(btn => {
        if (btn.textContent.includes('🔔') || btn.textContent.includes('🔍') || btn.textContent.includes('☁️')) {
          btn.remove();
        }
      });

      // Insertar al inicio del topbar-right
      topbarRight.insertBefore(globalDiv, topbarRight.firstChild);
    }

    // ── 4. USER CARD — logout ──
    const userCard = document.getElementById('userCard');
    if (userCard) {
      const user = JSON.parse(localStorage.getItem('ps_currentUser') || 'null');
      if (user) {
        const nameEl = document.getElementById('sidebarUserName');
        const roleEl = document.getElementById('sidebarUserRole');
        if (nameEl) nameEl.textContent = user.username || 'Plutom Studio';
        if (roleEl) roleEl.textContent = user.role === 'admin' ? 'Administrador' : 'Usuario';
      }
      userCard.addEventListener('click', () => {
        if (confirm('¿Cerrar sesión?')) {
          localStorage.removeItem('ps_currentUser');
          window.location.href = 'index.html';
        }
      });
    }

    // ── 5. WIRE BÚSQUEDA GLOBAL ──
    const searchBtn = document.getElementById('globalSearchBtn');
    if (searchBtn && window.BusquedaGlobal) {
      searchBtn.addEventListener('click', () => BusquedaGlobal.abrir());
    }

    // ── 6. WIRE NOTIFICACIONES ──
    const notifBtn = document.getElementById('notifBtn');
    if (notifBtn && window.Notificaciones) {
      Notificaciones.render();
      notifBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        Notificaciones.abrirPanel();
      });
    }

    // ── 7. WIRE GOOGLE DRIVE ──
    const driveBtn = document.getElementById('btnDriveBackup');
    if (driveBtn && window.GoogleDriveBackup) {
      const lastBackup = localStorage.getItem('ps_last_backup');
      if (lastBackup) {
        driveBtn.title = `Último backup: ${new Date(lastBackup).toLocaleString('es-DO')}`;
      }
      driveBtn.addEventListener('click', () => GoogleDriveBackup.backup());
    }

    // ── 8. ATAJO TECLADO BÚSQUEDA ──
    document.addEventListener('keydown', (e) => {
      if (e.key === '/' && !['INPUT','TEXTAREA','SELECT'].includes(e.target.tagName)) {
        e.preventDefault();
        if (window.BusquedaGlobal) BusquedaGlobal.abrir();
      }
    });
  }

  /* ───────────────────────────────────────────────────────────
     INIT — esperar DOM listo
  ─────────────────────────────────────────────────────────────── */
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', inject);
  } else {
    inject();
  }

})();

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// ADMIN SETTINGS - CONFIGURACIONES
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

const AdminSettings = {
  abrirConfiguraciones() {
    const modal = document.createElement('div');
    modal.className = 'modal-overlay open';
    modal.id = 'adminModal';
    modal.innerHTML = `
      <div class="modal">
        <div class="modal-header">
          <div class="modal-title">⚙️ Configuraciones del Administrador</div>
          <button class="modal-close" onclick="document.getElementById('adminModal').remove()">✕</button>
        </div>
        <div style="padding:20px;display:flex;flex-direction:column;gap:20px;">
          
          <div style="border-bottom:1px solid var(--border-color);padding-bottom:16px;">
            <div style="font-size:13px;font-weight:600;color:var(--text-primary);margin-bottom:12px;">👤 Cuenta</div>
            <div style="display:flex;flex-direction:column;gap:8px;">
              <div style="padding:10px;background:var(--bg-surface-hover);border-radius:var(--radius-md);">
                <div style="font-size:11px;color:var(--text-muted);">USUARIO</div>
                <div style="font-size:13px;color:var(--text-primary);font-weight:600;" id="adminUser">admin</div>
              </div>
              <button class="btn btn-ghost" style="justify-content:flex-start;" onclick="AdminSettings.cambiarPassword()">
                🔑 Cambiar Contraseña
              </button>
              <button class="btn btn-ghost" style="justify-content:flex-start;" onclick="AdminSettings.cerrarSesion()">
                🚪 Cerrar Sesión
              </button>
            </div>
          </div>

          <div style="border-bottom:1px solid var(--border-color);padding-bottom:16px;">
            <div style="font-size:13px;font-weight:600;color:var(--text-primary);margin-bottom:12px;">🏢 Empresa</div>
            <div style="display:flex;flex-direction:column;gap:8px;">
              <div class="form-group">
                <label>Nombre de la Empresa</label>
                <input type="text" id="adminEmpresa" value="PLUTOM STUDIO" style="font-size:13px;">
              </div>
              <div class="form-group">
                <label>Email</label>
                <input type="email" id="adminEmail" value="info@plutomstudio.com" style="font-size:13px;">
              </div>
              <div class="form-group">
                <label>Teléfono</label>
                <input type="tel" id="adminTelefono" placeholder="809-000-0000" style="font-size:13px;">
              </div>
              <button class="btn btn-primary" style="width:100%;" onclick="AdminSettings.guardarEmpresa()">
                💾 Guardar Cambios
              </button>
            </div>
          </div>

          <div style="border-bottom:1px solid var(--border-color);padding-bottom:16px;">
            <div style="font-size:13px;font-weight:600;color:var(--text-primary);margin-bottom:12px;">🗑️ Datos</div>
            <div style="display:flex;flex-direction:column;gap:8px;">
              <button class="btn btn-ghost" style="justify-content:flex-start;color:var(--status-warning);" onclick="AdminSettings.exportarDatos()">
                📥 Exportar Base de Datos
              </button>
              <button class="btn btn-ghost" style="justify-content:flex-start;color:var(--status-error);" onclick="AdminSettings.limpiarDatos()">
                🧹 Limpiar Todos los Datos
              </button>
            </div>
          </div>

          <div>
            <div style="font-size:13px;font-weight:600;color:var(--text-primary);margin-bottom:12px;">ℹ️ Sistema</div>
            <div style="padding:12px;background:var(--bg-surface-hover);border-radius:var(--radius-md);font-size:11px;color:var(--text-muted);line-height:1.8;">
              <div><strong>Versión:</strong> PLUTOM STUDIO v1.0</div>
              <div><strong>Última actualización:</strong> ${new Date().toLocaleDateString('es-DO')}</div>
              <div><strong>Navegador:</strong> ${navigator.userAgent.substring(0, 50)}...</div>
              <div><strong>Storage:</strong> localStorage disponible</div>
            </div>
          </div>

        </div>
      </div>
    `;
    document.body.appendChild(modal);
    modal.addEventListener('click', (e) => {
      if (e.target === modal) modal.remove();
    });
  },

  cambiarPassword() {
    const newPass = prompt('Ingresa la nueva contraseña:');
    if (newPass && newPass.length >= 6) {
      const users = JSON.parse(localStorage.getItem('ps_users') || '[]');
      const currentUser = JSON.parse(localStorage.getItem('ps_currentUser') || '{}');
      const idx = users.findIndex(u => u.username === currentUser.username);
      if (idx !== -1) {
        users[idx].password = newPass;
        localStorage.setItem('ps_users', JSON.stringify(users));
        alert('✓ Contraseña actualizada correctamente');
      }
    } else if (newPass) {
      alert('❌ La contraseña debe tener al menos 6 caracteres');
    }
  },

  guardarEmpresa() {
    const empresa = document.getElementById('adminEmpresa').value;
    const email = document.getElementById('adminEmail').value;
    const telefono = document.getElementById('adminTelefono').value;

    localStorage.setItem('ps_admin_empresa', JSON.stringify({ empresa, email, telefono }));
    alert('✓ Datos de la empresa guardados');
  },

  exportarDatos() {
    const datos = {
      clientes: JSON.parse(localStorage.getItem('ps_clientes') || '[]'),
      cotizaciones: JSON.parse(localStorage.getItem('ps_cotizaciones') || '[]'),
      facturas: JSON.parse(localStorage.getItem('ps_facturas') || '[]'),
      finanzas: JSON.parse(localStorage.getItem('ps_finanzas') || '[]'),
      eventos: JSON.parse(localStorage.getItem('ps_eventos') || '[]'),
      proyectos: JSON.parse(localStorage.getItem('ps_proyectos') || '[]'),
      servicios: JSON.parse(localStorage.getItem('ps_servicios') || '[]'),
      inventario: JSON.parse(localStorage.getItem('ps_inventario') || '[]'),
      fecha_exportacion: new Date().toISOString(),
    };

    const blob = new Blob([JSON.stringify(datos, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `PLUTOM_Backup_${new Date().toISOString().slice(0, 10)}.json`;
    link.click();
    URL.revokeObjectURL(url);
    alert('✓ Base de datos exportada');
  },

  limpiarDatos() {
    if (confirm('⚠️ ADVERTENCIA: Esto eliminará TODOS los datos de la plataforma.\n\n¿Estás seguro?')) {
      if (confirm('Esta acción NO se puede deshacer. ¿Continuar?')) {
        localStorage.clear();
        alert('✓ Todos los datos han sido eliminados. Recargando...');
        window.location.reload();
      }
    }
  },

  cerrarSesion() {
    if (confirm('¿Cerrar sesión?')) {
      localStorage.removeItem('ps_currentUser');
      window.location.href = 'index.html';
    }
  }
};

console.log('✓ Admin Settings cargado');