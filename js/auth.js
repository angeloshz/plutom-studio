/* ═══════════════════════════════════════════════════════════════
   PLUTOM STUDIO — Sistema de Autenticación Global
   Incluir este script en TODAS las páginas excepto index.html
   <script src="js/auth.js"></script>
═══════════════════════════════════════════════════════════════ */

(function() {
  'use strict';

  // Verificar si hay usuario autenticado
  const currentUser = JSON.parse(localStorage.getItem('ps_currentUser') || 'null');

  if (!currentUser) {
    // No hay usuario autenticado → redirigir a login
    window.location.href = 'index.html';
    return;
  }

  // Usuario autenticado → agregar utilidades
  window.Auth = {
    user: currentUser,

    logout() {
      localStorage.removeItem('ps_currentUser');
      localStorage.removeItem('ps_rememberMe');
      window.location.href = 'index.html';
    },

    getUsername() {
      return currentUser.username || currentUser.email;
    },

    isAdmin() {
      return currentUser.role === 'admin';
    },
  };

  // Agregar botón de logout dinámico si existe
  document.addEventListener('DOMContentLoaded', () => {
    const userCard = document.querySelector('.user-card');
    if (userCard) {
      userCard.addEventListener('click', () => {
        const confirmed = confirm(`¿Cerrar sesión de ${Auth.getUsername()}?`);
        if (confirmed) Auth.logout();
      });
    }
  });

  console.log('✓ Autenticación activa para:', currentUser.email);
})();