/* ═══════════════════════════════════════════════════════════════
   PLUTOM STUDIO — Generador de PDF para Cotizaciones
   Diseño limpio, minimalista y profesional
═══════════════════════════════════════════════════════════════ */

const CotizacionPDF = {

  /* ─────────────────────────────────────────────────────────
     Generar HTML limpio de la cotización
  ───────────────────────────────────────────────────────────── */
  generarHTML(cotizacion) {
    const fecha = new Date().toLocaleDateString('es-DO', {
      year: 'numeric', month: 'long', day: 'numeric'
    });

    const fechaEvento = cotizacion.fecha
      ? new Date(cotizacion.fecha + 'T00:00:00').toLocaleDateString('es-DO', {
          year: 'numeric', month: 'long', day: 'numeric'
        })
      : '—';

    const validezFecha = (() => {
      const d = new Date();
      d.setDate(d.getDate() + 30);
      return d.toLocaleDateString('es-DO', { year:'numeric', month:'long', day:'numeric' });
    })();

    // Servicios incluidos (si hay items separados por coma o newline)
    const servicios = (cotizacion.detalles || '')
      .split(/\n|,/)
      .map(s => s.trim())
      .filter(Boolean);

    return `<!DOCTYPE html>
<html lang="es">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>Cotización ${cotizacion.num || ''} — PLUTOM STUDIO</title>
<style>
  @import url('https://fonts.googleapis.com/css2?family=Outfit:wght@400;600;700&family=Manrope:wght@400;500;600&display=swap');

  * { margin: 0; padding: 0; box-sizing: border-box; }

  body {
    font-family: 'Manrope', sans-serif;
    background: #fff;
    color: #1a1a2e;
    font-size: 13.5px;
    line-height: 1.6;
    -webkit-print-color-adjust: exact;
    print-color-adjust: exact;
  }

  .page {
    max-width: 760px;
    margin: 0 auto;
    padding: 52px 56px;
    min-height: 100vh;
    position: relative;
  }

  /* ── HEADER ── */
  .header {
    display: flex;
    align-items: flex-start;
    justify-content: space-between;
    margin-bottom: 44px;
    padding-bottom: 28px;
    border-bottom: 1.5px solid #e8edf3;
  }

  .brand-name {
    font-family: 'Outfit', sans-serif;
    font-size: 20px;
    font-weight: 700;
    letter-spacing: 0.12em;
    color: #0f2744;
    margin-bottom: 4px;
  }

  .brand-sub {
    font-size: 11px;
    color: #8a9bb0;
    letter-spacing: 0.1em;
    text-transform: uppercase;
    font-weight: 600;
  }

  .brand-contact {
    font-size: 12px;
    color: #5a7190;
    margin-top: 10px;
    line-height: 1.8;
  }

  .doc-info {
    text-align: right;
  }

  .doc-label {
    font-family: 'Outfit', sans-serif;
    font-size: 10px;
    font-weight: 700;
    letter-spacing: 0.18em;
    text-transform: uppercase;
    color: #8a9bb0;
    margin-bottom: 6px;
  }

  .doc-num {
    font-family: 'Outfit', sans-serif;
    font-size: 22px;
    font-weight: 700;
    color: #0f2744;
    letter-spacing: -0.01em;
  }

  .doc-fecha {
    font-size: 12px;
    color: #5a7190;
    margin-top: 6px;
  }

  /* ── DESTINATARIO ── */
  .section-label {
    font-family: 'Outfit', sans-serif;
    font-size: 9.5px;
    font-weight: 700;
    letter-spacing: 0.18em;
    text-transform: uppercase;
    color: #8a9bb0;
    margin-bottom: 8px;
  }

  .destinatario-grid {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 32px;
    margin-bottom: 40px;
    padding: 22px 24px;
    background: #f8fafc;
    border-radius: 8px;
  }

  .destinatario-nombre {
    font-family: 'Outfit', sans-serif;
    font-size: 16px;
    font-weight: 700;
    color: #0f2744;
    margin-bottom: 3px;
  }

  .destinatario-detalle {
    font-size: 12.5px;
    color: #5a7190;
    line-height: 1.7;
  }

  /* ── RESUMEN DEL SERVICIO ── */
  .servicio-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-bottom: 16px;
  }

  .servicio-titulo {
    font-family: 'Outfit', sans-serif;
    font-size: 18px;
    font-weight: 700;
    color: #0f2744;
  }

  .servicio-tipo {
    font-size: 11px;
    font-weight: 700;
    padding: 4px 12px;
    border-radius: 20px;
    background: #eef2f7;
    color: #1a3a5c;
    letter-spacing: 0.04em;
    text-transform: uppercase;
  }

  /* ── TABLA DE SERVICIOS ── */
  .tabla-servicios {
    width: 100%;
    border-collapse: collapse;
    margin-bottom: 20px;
  }

  .tabla-servicios thead th {
    background: #f0f4f8;
    padding: 10px 16px;
    text-align: left;
    font-family: 'Outfit', sans-serif;
    font-size: 10px;
    font-weight: 700;
    letter-spacing: 0.12em;
    text-transform: uppercase;
    color: #5a7190;
  }

  .tabla-servicios thead th:last-child { text-align: right; }

  .tabla-servicios tbody tr {
    border-bottom: 1px solid #e8edf3;
  }

  .tabla-servicios tbody td {
    padding: 12px 16px;
    font-size: 13px;
    color: #374151;
    vertical-align: top;
  }

  .tabla-servicios tbody td:last-child { text-align: right; font-weight: 600; }

  /* ── TOTAL ── */
  .totales {
    margin-left: auto;
    width: 260px;
    margin-bottom: 36px;
  }

  .total-row {
    display: flex;
    justify-content: space-between;
    padding: 7px 0;
    font-size: 13px;
    color: #5a7190;
    border-bottom: 1px solid #e8edf3;
  }

  .total-row:last-child {
    border-bottom: none;
    border-top: 1.5px solid #0f2744;
    margin-top: 4px;
    padding-top: 12px;
    font-family: 'Outfit', sans-serif;
    font-size: 16px;
    font-weight: 700;
    color: #0f2744;
  }

  /* ── DETALLES ADICIONALES ── */
  .detalles-grid {
    display: grid;
    grid-template-columns: 1fr 1fr 1fr;
    gap: 20px;
    padding: 20px 24px;
    background: #f8fafc;
    border-radius: 8px;
    margin-bottom: 32px;
  }

  .detalle-item-label {
    font-size: 9.5px;
    font-weight: 700;
    letter-spacing: 0.14em;
    text-transform: uppercase;
    color: #8a9bb0;
    margin-bottom: 4px;
  }

  .detalle-item-val {
    font-size: 13px;
    font-weight: 600;
    color: #0f2744;
  }

  /* ── TÉRMINOS ── */
  .terminos {
    font-size: 11.5px;
    color: #8a9bb0;
    line-height: 1.7;
    padding-top: 20px;
    border-top: 1px solid #e8edf3;
    margin-bottom: 32px;
  }

  .terminos strong { color: #5a7190; }

  /* ── FOOTER ── */
  .footer {
    text-align: center;
    padding-top: 24px;
    border-top: 1.5px solid #e8edf3;
    font-size: 11.5px;
    color: #8a9bb0;
    line-height: 1.8;
  }

  .footer-brand {
    font-family: 'Outfit', sans-serif;
    font-weight: 700;
    font-size: 13px;
    color: #0f2744;
    letter-spacing: 0.1em;
    margin-bottom: 4px;
  }

  /* ── WATERMARK / ESTADO ── */
  .estado-badge {
    display: inline-block;
    padding: 3px 10px;
    border-radius: 4px;
    font-size: 10px;
    font-weight: 700;
    letter-spacing: 0.08em;
    text-transform: uppercase;
    margin-top: 6px;
  }

  .estado-pendiente { background: #fef3c7; color: #92400e; }
  .estado-aprobada  { background: #d1fae5; color: #065f46; }
  .estado-revision  { background: #dbeafe; color: #1e40af; }

  @media print {
    body { background: white; }
    .page { padding: 32px; }
    .no-print { display: none; }
  }
</style>
</head>
<body>
<div class="page">

  <!-- HEADER -->
  <div class="header">
    <div>
      <div class="brand-name">PLUTOM STUDIO</div>
      <div class="brand-sub">Marketing · Fotografía · Video · Diseño</div>
      <div class="brand-contact">
        Santiago de los Caballeros, República Dominicana<br>
        info@plutomstudio.com
      </div>
    </div>
    <div class="doc-info">
      <div class="doc-label">Cotización</div>
      <div class="doc-num">${cotizacion.num || 'COT-0001'}</div>
      <div class="doc-fecha">Emitida: ${fecha}</div>
      ${cotizacion.estado ? `<div class="estado-badge estado-${(cotizacion.estado||'').toLowerCase().replace(' ','-')}">${cotizacion.estado}</div>` : ''}
    </div>
  </div>

  <!-- DESTINATARIO -->
  <div class="destinatario-grid">
    <div>
      <div class="section-label">Para</div>
      <div class="destinatario-nombre">${cotizacion.cliente}</div>
      <div class="destinatario-detalle">
        ${cotizacion.telefono ? `Tel: ${cotizacion.telefono}<br>` : ''}
        ${cotizacion.lugar ? `📍 ${cotizacion.lugar}` : ''}
      </div>
    </div>
    <div>
      <div class="section-label">Válida hasta</div>
      <div class="destinatario-nombre" style="font-size:14px;">${validezFecha}</div>
      <div class="destinatario-detalle">Vigencia de 30 días calendario</div>
    </div>
  </div>

  <!-- SERVICIO PRINCIPAL -->
  <div style="margin-bottom:20px;">
    <div class="servicio-header">
      <div class="servicio-titulo">${cotizacion.servicio}</div>
      <div class="servicio-tipo">${cotizacion.servicio}</div>
    </div>
    ${cotizacion.lugar ? `<div style="font-size:12.5px;color:#5a7190;margin-bottom:4px;">📍 ${cotizacion.lugar}</div>` : ''}
    ${cotizacion.fecha ? `<div style="font-size:12.5px;color:#5a7190;">📅 Fecha del evento: <strong style="color:#0f2744;">${fechaEvento}</strong></div>` : ''}
  </div>

  <!-- TABLA DE SERVICIOS -->
  <table class="tabla-servicios">
    <thead>
      <tr>
        <th style="width:50%">Descripción del Servicio</th>
        <th>Detalles</th>
        <th>Monto</th>
      </tr>
    </thead>
    <tbody>
      ${servicios.length > 0
        ? servicios.map((s, i) => `
          <tr>
            <td>${s}</td>
            <td style="color:#8a9bb0;">Incluido</td>
            <td>${i === 0 ? `RD$${Number(cotizacion.monto).toLocaleString('es-DO')}` : '—'}</td>
          </tr>`).join('')
        : `<tr>
            <td>${cotizacion.servicio}</td>
            <td style="color:#8a9bb0;">Servicio completo</td>
            <td>RD$${Number(cotizacion.monto).toLocaleString('es-DO')}</td>
          </tr>`
      }
    </tbody>
  </table>

  <!-- TOTALES -->
  <div class="totales">
    <div class="total-row">
      <span>Subtotal</span>
      <span>RD$${Number(cotizacion.monto).toLocaleString('es-DO')}</span>
    </div>
    <div class="total-row">
      <span>ITBIS (0%)</span>
      <span>RD$0.00</span>
    </div>
    <div class="total-row">
      <span>Total a Pagar</span>
      <span>RD$${Number(cotizacion.monto).toLocaleString('es-DO')}</span>
    </div>
  </div>

  <!-- DETALLES ADICIONALES -->
  <div class="detalles-grid">
    <div>
      <div class="detalle-item-label">Forma de Pago</div>
      <div class="detalle-item-val">Transferencia bancaria</div>
    </div>
    <div>
      <div class="detalle-item-label">Entrega</div>
      <div class="detalle-item-val">15 días hábiles</div>
    </div>
    <div>
      <div class="detalle-item-label">Contrato</div>
      <div class="detalle-item-val">Se firma previo al servicio</div>
    </div>
  </div>

  <!-- TÉRMINOS -->
  <div class="terminos">
    <strong>Condiciones:</strong> Esta cotización tiene vigencia de 30 días calendario. El inicio del servicio requiere un adelanto del 50%.
    Los servicios adicionales no contemplados en este documento serán cotizados por separado.
    PLUTOM STUDIO se reserva el derecho de modificar precios pasada la fecha de vigencia.
  </div>

  <!-- FOOTER -->
  <div class="footer">
    <div class="footer-brand">PLUTOM STUDIO</div>
    <div>Santiago de los Caballeros, República Dominicana</div>
    <div>info@plutomstudio.com</div>
    <div style="margin-top:8px;font-size:10.5px;opacity:0.7;">
      Gracias por considerar nuestros servicios. Estamos comprometidos con la excelencia creativa.
    </div>
  </div>

</div>
</body>
</html>`;
  },

  /* ─────────────────────────────────────────────────────────
     Abrir PDF en nueva ventana (para imprimir / guardar PDF)
  ───────────────────────────────────────────────────────────── */
  abrirPDF(cotizacion) {
    const html = this.generarHTML(cotizacion);
    const win  = window.open('', '_blank');
    win.document.write(html);
    win.document.close();

    // Esperar a que carguen las fuentes y abrir diálogo de impresión
    win.onload = () => {
      setTimeout(() => {
        win.focus();
        win.print();
      }, 800);
    };
  },

  /* ─────────────────────────────────────────────────────────
     Descargar como HTML (fallback si no tiene impresora PDF)
  ───────────────────────────────────────────────────────────── */
  descargarHTML(cotizacion) {
    const html     = this.generarHTML(cotizacion);
    const blob     = new Blob([html], { type: 'text/html;charset=utf-8' });
    const link     = document.createElement('a');
    link.href      = URL.createObjectURL(blob);
    link.download  = `PLUTOM_Cotizacion_${cotizacion.num || 'COT'}_${cotizacion.cliente.replace(/\s+/g,'_')}.html`;
    link.click();
  },
};

window.CotizacionPDF = CotizacionPDF;