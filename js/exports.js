/* ═══════════════════════════════════════════════════════════════
   PLUTOM STUDIO — Sistema de Exportación de Reportes
   Métodos para generar PDF, Excel y CSV
═══════════════════════════════════════════════════════════════ */

const ExportUtils = {
  /* ─────────────────────────────────────────────────────────
     EXPORT A CSV
  ───────────────────────────────────────────────────────────── */
  toCSV(data, filename = 'export.csv') {
    if (!data || data.length === 0) {
      alert('No hay datos para exportar');
      return;
    }

    const headers = Object.keys(data[0]);
    const csv = [
      headers.join(','),
      ...data.map(row =>
        headers
          .map(header => {
            const cell = row[header];
            const value = cell === null || cell === undefined ? '' : String(cell);
            // Escapar comillas y envolver si contiene comas
            return value.includes(',') ? `"${value.replace(/"/g, '""')}"` : value;
          })
          .join(',')
      ),
    ].join('\n');

    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = filename;
    link.click();
  },

  /* ─────────────────────────────────────────────────────────
     EXPORT A XLSX (Excel usando SheetJS si disponible)
  ───────────────────────────────────────────────────────────── */
  toExcel(data, filename = 'export.xlsx', sheetName = 'Datos') {
    // Si SheetJS no está disponible, usar CSV como fallback
    if (!window.XLSX) {
      console.warn('SheetJS no disponible. Exportando como CSV.');
      return this.toCSV(data, filename.replace('.xlsx', '.csv'));
    }

    const ws = XLSX.utils.json_to_sheet(data);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, sheetName);
    XLSX.writeFile(wb, filename);
  },

  /* ─────────────────────────────────────────────────────────
     EXPORT A PDF (usando html2pdf si está disponible)
  ───────────────────────────────────────────────────────────── */
  async toPDF(htmlContent, filename = 'report.pdf') {
    if (!window.html2pdf) {
      // Fallback: generar documento HTML imprimible
      const printWindow = window.open('', '_blank');
      printWindow.document.write(`
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="UTF-8">
          <title>${filename}</title>
          <style>
            body { font-family: Arial, sans-serif; margin: 40px; }
            table { width: 100%; border-collapse: collapse; margin: 20px 0; }
            th, td { border: 1px solid #ddd; padding: 12px; text-align: left; }
            th { background-color: #f5f5f5; font-weight: bold; }
            h1, h2 { color: #333; }
          </style>
        </head>
        <body>
          ${htmlContent}
        </body>
        </html>
      `);
      printWindow.document.close();
      printWindow.print();
      return;
    }

    const element = document.createElement('div');
    element.innerHTML = htmlContent;
    const opt = {
      margin: 10,
      filename: filename,
      image: { type: 'jpeg', quality: 0.98 },
      html2canvas: { scale: 2 },
      jsPDF: { orientation: 'portrait', unit: 'mm', format: 'a4' },
    };
    await html2pdf().set(opt).from(element).save();
  },

  /* ─────────────────────────────────────────────────────────
     GENERAR REPORTE DE CLIENTES
  ───────────────────────────────────────────────────────────── */
  reporteClientes(formato = 'csv') {
    const clientes = JSON.parse(localStorage.getItem('ps_clientes') || '[]');

    if (clientes.length === 0) {
      alert('No hay clientes para exportar');
      return;
    }

    const datos = clientes.map(c => ({
      'Nombre': c.nombre,
      'Empresa': c.empresa || '—',
      'Email': c.email || '—',
      'Teléfono': c.telefono,
      'Tipo de Servicio': c.tipo,
      'Estado': c.estado,
      'Registrado': c.fecha,
    }));

    if (formato === 'csv') {
      this.toCSV(datos, `PLUTOM_Clientes_${new Date().toISOString().slice(0, 10)}.csv`);
    } else if (formato === 'excel') {
      this.toExcel(datos, `PLUTOM_Clientes_${new Date().toISOString().slice(0, 10)}.xlsx`, 'Clientes');
    }
  },

  /* ─────────────────────────────────────────────────────────
     GENERAR REPORTE DE FINANZAS
  ───────────────────────────────────────────────────────────── */
  reporteFinanzas(mes = null, formato = 'csv') {
    const finanzas = JSON.parse(localStorage.getItem('ps_finanzas') || '[]');

    let datos = finanzas.map(f => ({
      'Tipo': f.tipo === 'ingreso' ? 'INGRESO' : 'GASTO',
      'Descripción': f.desc,
      'Categoría': f.cat,
      'Monto': `RD$${Number(f.monto).toLocaleString('es-DO')}`,
      'Fecha': f.fecha,
      'Método': f.metodo,
      'Notas': f.notas || '—',
    }));

    // Filtrar por mes si se especifica
    if (mes !== null) {
      datos = datos.filter(d => {
        const fechaParts = d.Fecha.split('-');
        return parseInt(fechaParts[1]) === mes + 1;
      });
    }

    if (datos.length === 0) {
      alert('No hay movimientos para exportar');
      return;
    }

    const mesNombre = mes !== null ? ['Enero','Febrero','Marzo','Abril','Mayo','Junio','Julio','Agosto','Septiembre','Octubre','Noviembre','Diciembre'][mes] : 'Todos';

    if (formato === 'csv') {
      this.toCSV(datos, `PLUTOM_Finanzas_${mesNombre}_${new Date().getFullYear()}.csv`);
    } else if (formato === 'excel') {
      this.toExcel(datos, `PLUTOM_Finanzas_${mesNombre}_${new Date().getFullYear()}.xlsx`, 'Movimientos');
    }
  },

  /* ─────────────────────────────────────────────────────────
     GENERAR REPORTE DE EVENTOS
  ───────────────────────────────────────────────────────────── */
  reporteEventos(estado = null, formato = 'csv') {
    const eventos = JSON.parse(localStorage.getItem('ps_eventos') || '[]');

    let datos = eventos.map(e => ({
      'Nombre': e.nombre,
      'Tipo': e.tipo,
      'Fecha': e.fecha,
      'Hora': e.hora || '—',
      'Lugar': e.lugar || '—',
      'Estado': e.estado,
      'Contacto': e.contacto || '—',
      'Notas': e.notas || '—',
    }));

    if (estado) {
      datos = datos.filter(d => d.Estado === estado);
    }

    if (datos.length === 0) {
      alert('No hay eventos para exportar');
      return;
    }

    if (formato === 'csv') {
      this.toCSV(datos, `PLUTOM_Eventos_${new Date().toISOString().slice(0, 10)}.csv`);
    } else if (formato === 'excel') {
      this.toExcel(datos, `PLUTOM_Eventos_${new Date().toISOString().slice(0, 10)}.xlsx`, 'Eventos');
    }
  },

  /* ─────────────────────────────────────────────────────────
     GENERAR REPORTE DE PROYECTOS
  ───────────────────────────────────────────────────────────── */
  reporteProyectos(estado = null, formato = 'csv') {
    const proyectos = JSON.parse(localStorage.getItem('ps_proyectos') || '[]');

    let datos = proyectos.map(p => ({
      'Nombre': p.nombre,
      'Cliente': p.cliente,
      'Tipo': p.tipo,
      'Estado': p.estado,
      'Progreso': `${p.progreso || 0}%`,
      'Fecha Inicio': p.inicio || '—',
      'Fecha Entrega': p.entrega || '—',
      'Valor': `RD$${Number(p.valor || 0).toLocaleString('es-DO')}`,
    }));

    if (estado) {
      datos = datos.filter(d => d.Estado === estado);
    }

    if (datos.length === 0) {
      alert('No hay proyectos para exportar');
      return;
    }

    if (formato === 'csv') {
      this.toCSV(datos, `PLUTOM_Proyectos_${new Date().toISOString().slice(0, 10)}.csv`);
    } else if (formato === 'excel') {
      this.toExcel(datos, `PLUTOM_Proyectos_${new Date().toISOString().slice(0, 10)}.xlsx`, 'Proyectos');
    }
  },

  /* ─────────────────────────────────────────────────────────
     GENERAR RESUMEN EJECUTIVO EN HTML
  ───────────────────────────────────────────────────────────── */
  generarResumenEjecutivo() {
    const clientes = JSON.parse(localStorage.getItem('ps_clientes') || '[]');
    const finanzas = JSON.parse(localStorage.getItem('ps_finanzas') || '[]');
    const eventos = JSON.parse(localStorage.getItem('ps_eventos') || '[]');
    const proyectos = JSON.parse(localStorage.getItem('ps_proyectos') || '[]');
    const recurrentes = JSON.parse(localStorage.getItem('ps_recurrentes') || '[]');

    const hoy = new Date();
    const ingresos = finanzas.filter(f => f.tipo === 'ingreso').reduce((s, f) => s + Number(f.monto), 0);
    const gastos = finanzas.filter(f => f.tipo === 'gasto').reduce((s, f) => s + Number(f.monto), 0);
    const balance = ingresos - gastos;
    const eventosMes = eventos.filter(e => new Date(e.fecha + 'T00:00:00').getMonth() === hoy.getMonth()).length;
    const proyectosActivos = proyectos.filter(p => p.estado === 'En Progreso').length;

    const html = `
      <h1>PLUTOM STUDIO — Resumen Ejecutivo</h1>
      <p><strong>Generado:</strong> ${hoy.toLocaleDateString('es-DO')}</p>

      <h2>Métricas Generales</h2>
      <table>
        <tr><th>Métrica</th><th>Valor</th></tr>
        <tr><td>Total de Clientes</td><td>${clientes.length}</td></tr>
        <tr><td>Clientes Activos</td><td>${clientes.filter(c => c.estado === 'Activo').length}</td></tr>
        <tr><td>Clientes Recurrentes</td><td>${recurrentes.filter(r => r.estado === 'activo').length}</td></tr>
        <tr><td>Proyectos Activos</td><td>${proyectosActivos}</td></tr>
        <tr><td>Eventos Este Mes</td><td>${eventosMes}</td></tr>
      </table>

      <h2>Finanzas</h2>
      <table>
        <tr><th>Concepto</th><th>Monto</th></tr>
        <tr><td>Ingresos Totales</td><td>RD$${ingresos.toLocaleString('es-DO')}</td></tr>
        <tr><td>Gastos Totales</td><td>RD$${gastos.toLocaleString('es-DO')}</td></tr>
        <tr><td><strong>Balance Neto</strong></td><td><strong>RD$${balance.toLocaleString('es-DO')}</strong></td></tr>
        <tr><td>Margen</td><td>${ingresos > 0 ? Math.round((balance / ingresos) * 100) : 0}%</td></tr>
      </table>

      <h2>Ingresos Recurrentes Mensuales</h2>
      <table>
        <tr><th>Cliente</th><th>Servicio</th><th>Monto Mensual</th></tr>
        ${recurrentes
          .filter(r => r.estado === 'activo')
          .map(r => `<tr><td>${r.nombre}</td><td>${r.servicio}</td><td>RD$${(r.monto * 2).toLocaleString('es-DO')}</td></tr>`)
          .join('')}
        <tr style="font-weight:bold;">
          <td colspan="2">TOTAL MENSUAL FIJO</td>
          <td>RD$${(recurrentes.filter(r => r.estado === 'activo').reduce((s, r) => s + r.monto * 2, 0)).toLocaleString('es-DO')}</td>
        </tr>
      </table>

      <p style="margin-top: 40px; font-size: 12px; color: #666; border-top: 1px solid #ddd; padding-top: 20px;">
        Este reporte fue generado automáticamente por PLUTOM STUDIO Management Platform.
      </p>
    `;

    this.toPDF(html, `PLUTOM_Resumen_Ejecutivo_${hoy.toISOString().slice(0, 10)}.pdf`);
  },
};

// Exposer globalmente
window.ExportUtils = ExportUtils;