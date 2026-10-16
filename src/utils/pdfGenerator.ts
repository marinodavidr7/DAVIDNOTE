import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { Movimiento } from '../types';
import { formatoMoneda, obtenerQuincenaActual } from './paymentCycle';
import { store } from '../services/storeService';

/**
 * Genera y descarga un recibo en PDF para un movimiento individual (Fiado o Abono)
 */
export function generarReciboPDF(mov: Movimiento): void {
  const datosColmado = store.getDatosColmado();
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: [80, 150] // Formato ticket de recibo térmico/móvil estándar (80mm ancho x 150mm alto)
  });

  const esFiado = mov.tipo === 'Fiado';
  const colorPrimario = esFiado ? [220, 38, 38] : [16, 185, 129]; // Rojo para fiado, Verde para abono

  // Encabezado
  doc.setFillColor(30, 58, 138); // Azul marino colmado
  doc.rect(0, 0, 80, 24, 'F');

  doc.setTextColor(255, 255, 255);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(12);
  doc.text(datosColmado.nombre.toUpperCase(), 40, 9, { align: 'center' });

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7.5);
  doc.setTextColor(219, 234, 254);
  doc.text(`${datosColmado.slogan} · Tel: ${datosColmado.telefono}`, 40, 14, { align: 'center' });
  doc.text(datosColmado.direccion.substring(0, 42), 40, 18, { align: 'center' });

  // Tipo de comprobante
  doc.setFillColor(colorPrimario[0], colorPrimario[1], colorPrimario[2]);
  doc.roundedRect(12, 28, 56, 9, 2, 2, 'F');
  doc.setTextColor(255, 255, 255);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(10);
  doc.text(esFiado ? 'COMPROBANTE DE FIADO' : 'RECIBO DE ABONO', 40, 34, { align: 'center' });

  // Línea divisoria decorativa
  doc.setDrawColor(226, 232, 240);
  doc.setLineWidth(0.5);
  doc.line(8, 41, 72, 41);

  // Datos del movimiento
  let y = 47;
  const paso = 6;

  doc.setFontSize(8);

  // ID Movimiento y Fecha
  doc.setTextColor(100, 116, 139);
  doc.setFont('helvetica', 'normal');
  doc.text('No. Comprobante:', 8, y);
  doc.setTextColor(30, 41, 59);
  doc.setFont('helvetica', 'bold');
  doc.text(`#${mov.idMov}`, 72, y, { align: 'right' });
  y += paso;

  doc.setTextColor(100, 116, 139);
  doc.setFont('helvetica', 'normal');
  doc.text('Fecha:', 8, y);
  doc.setTextColor(30, 41, 59);
  doc.setFont('helvetica', 'bold');
  doc.text(mov.fechaTexto || 'Hoy', 72, y, { align: 'right' });
  y += paso;

  if (mov.hora) {
    doc.setTextColor(100, 116, 139);
    doc.setFont('helvetica', 'normal');
    doc.text('Hora:', 8, y);
    doc.setTextColor(30, 41, 59);
    doc.setFont('helvetica', 'bold');
    doc.text(mov.hora, 72, y, { align: 'right' });
    y += paso;
  }

  // Cliente
  doc.setTextColor(100, 116, 139);
  doc.setFont('helvetica', 'normal');
  doc.text('Cliente Titular:', 8, y);
  doc.setTextColor(30, 41, 59);
  doc.setFont('helvetica', 'bold');
  const clienteCorto = (mov.nombreCliente || 'Cliente').substring(0, 22);
  doc.text(clienteCorto, 72, y, { align: 'right' });
  y += paso;

  // Autorizado si aplica
  if (esFiado && mov.autorizadoNombre && mov.autorizadoNombre !== '-') {
    doc.setTextColor(100, 116, 139);
    doc.setFont('helvetica', 'normal');
    doc.text('Retirado por:', 8, y);
    doc.setTextColor(30, 41, 59);
    doc.setFont('helvetica', 'bold');
    const autInfo = `${mov.autorizadoNombre} (${mov.autorizadoParentesco || 'Aut.'})`.substring(0, 22);
    doc.text(autInfo, 72, y, { align: 'right' });
    y += paso;
  }

  // Observaciones
  if (mov.observaciones && mov.observaciones.trim()) {
    doc.setTextColor(100, 116, 139);
    doc.setFont('helvetica', 'normal');
    doc.text('Detalle/Nota:', 8, y);
    y += 4;
    doc.setTextColor(71, 85, 105);
    doc.setFont('helvetica', 'italic');
    const splitObs = doc.splitTextToSize(mov.observaciones, 64);
    doc.text(splitObs, 8, y);
    y += splitObs.length * 4 + 2;
  } else {
    y += 2;
  }

  // Monto total destacado
  doc.setFillColor(248, 250, 252);
  doc.setDrawColor(203, 213, 225);
  doc.roundedRect(8, y, 64, 18, 3, 3, 'FD');

  doc.setTextColor(100, 116, 139);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8);
  doc.text('MONTO TOTAL:', 40, y + 5.5, { align: 'center' });

  doc.setTextColor(colorPrimario[0], colorPrimario[1], colorPrimario[2]);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(14);
  doc.text(formatoMoneda(mov.monto), 40, y + 13.5, { align: 'center' });
  y += 24;

  // Pie de recibo
  doc.setTextColor(148, 163, 184);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(6.5);
  doc.text('¡Gracias por su preferencia!', 40, y, { align: 'center' });
  doc.text('Súper Colmado DAVID · Sistema Digital de Fiados', 40, y + 4, { align: 'center' });

  // Descargar archivo
  doc.save(`Recibo_ColmadoDAVID_${mov.tipo}_${mov.idMov}.pdf`);
}

/**
 * Genera y descarga un informe en PDF con el listado filtrado de movimientos
 */
export function generarReporteHistorialPDF(
  movimientos: Movimiento[],
  filtro: 'todos' | 'Fiado' | 'Abono',
  totalCobrar?: number
): void {
  const datosColmado = store.getDatosColmado();
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4' // Formato estándar A4 para reportes
  });

  const fechaHoy = new Date().toLocaleDateString('es-DO', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });

  // Encabezado corporativo
  doc.setFillColor(30, 58, 138); // #1e3a8a
  doc.rect(0, 0, 210, 32, 'F');

  doc.setTextColor(255, 255, 255);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(18);
  doc.text(datosColmado.nombre.toUpperCase(), 14, 15);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9.5);
  doc.setTextColor(219, 234, 254);
  doc.text('Reporte Oficial de Movimientos y Fiados', 14, 22);
  doc.text(`${datosColmado.slogan} · ${datosColmado.direccion.substring(0, 50)}`, 14, 27);

  // Fecha generación en esquina superior derecha
  doc.setFontSize(8);
  doc.text(`Generado: ${fechaHoy}`, 196, 15, { align: 'right' });
  doc.text(`Filtro aplicado: ${filtro === 'todos' ? 'TODOS' : filtro.toUpperCase() + 'S'}`, 196, 20, { align: 'right' });

  // Tarjetas de Resumen
  const totalFiados = movimientos.filter(m => m.tipo === 'Fiado').reduce((acc, m) => acc + m.monto, 0);
  const totalAbonos = movimientos.filter(m => m.tipo === 'Abono').reduce((acc, m) => acc + m.monto, 0);

  // Card 1: Cantidad
  doc.setFillColor(241, 245, 249);
  doc.roundedRect(14, 38, 42, 20, 2, 2, 'F');
  doc.setTextColor(100, 116, 139);
  doc.setFontSize(8);
  doc.setFont('helvetica', 'bold');
  doc.text('TOTAL REGISTROS', 18, 44);
  doc.setTextColor(30, 41, 59);
  doc.setFontSize(13);
  doc.text(`${movimientos.length}`, 18, 52);

  // Card 2: Total Fiados
  doc.setFillColor(254, 242, 242);
  doc.roundedRect(60, 38, 44, 20, 2, 2, 'F');
  doc.setTextColor(220, 38, 38);
  doc.setFontSize(8);
  doc.setFont('helvetica', 'bold');
  doc.text('TOTAL EN FIADOS', 64, 44);
  doc.setFontSize(11);
  doc.text(formatoMoneda(totalFiados), 64, 52);

  // Card 3: Total Abonos
  doc.setFillColor(236, 253, 245);
  doc.roundedRect(108, 38, 44, 20, 2, 2, 'F');
  doc.setTextColor(5, 150, 105);
  doc.setFontSize(8);
  doc.setFont('helvetica', 'bold');
  doc.text('TOTAL EN ABONOS', 112, 44);
  doc.setFontSize(11);
  doc.text(formatoMoneda(totalAbonos), 112, 52);

  // Card 4: Deuda Total en Sistema (si se pasa)
  if (totalCobrar !== undefined) {
    doc.setFillColor(239, 246, 255);
    doc.roundedRect(156, 38, 40, 20, 2, 2, 'F');
    doc.setTextColor(37, 99, 235);
    doc.setFontSize(8);
    doc.setFont('helvetica', 'bold');
    doc.text('DEUDA COBRAR', 160, 44);
    doc.setFontSize(11);
    doc.text(formatoMoneda(totalCobrar), 160, 52);
  }

  // Tabla con autoTable
  const tablaDatos = movimientos.map(m => [
    `#${m.idMov}`,
    `${m.fechaTexto || ''}\n${m.hora || ''}`.trim(),
    m.tipo,
    m.nombreCliente || 'Cliente',
    m.autorizadoNombre && m.autorizadoNombre !== '-' ? `${m.autorizadoNombre} (${m.autorizadoParentesco || ''})` : '-',
    m.observaciones || '-',
    formatoMoneda(m.monto)
  ]);

  autoTable(doc, {
    startY: 64,
    head: [['ID', 'Fecha/Hora', 'Tipo', 'Cliente', 'Autorizado', 'Observaciones', 'Monto']],
    body: tablaDatos,
    theme: 'grid',
    headStyles: {
      fillColor: [30, 58, 138],
      textColor: [255, 255, 255],
      fontStyle: 'bold',
      fontSize: 8.5,
      halign: 'left'
    },
    styles: {
      fontSize: 8,
      cellPadding: 2.5,
      textColor: [30, 41, 59],
      valign: 'middle'
    },
    columnStyles: {
      0: { cellWidth: 14, halign: 'center', fontStyle: 'bold' },
      1: { cellWidth: 26 },
      2: { cellWidth: 18, halign: 'center', fontStyle: 'bold' },
      3: { cellWidth: 36, fontStyle: 'bold' },
      4: { cellWidth: 32 },
      5: { cellWidth: 'auto' },
      6: { cellWidth: 26, halign: 'right', fontStyle: 'bold' }
    },
    alternateRowStyles: {
      fillColor: [248, 250, 252]
    },
    didParseCell: (data) => {
      // Colorear el Tipo según sea Fiado o Abono
      if (data.section === 'body' && data.column.index === 2) {
        if (data.cell.raw === 'Fiado') {
          data.cell.styles.textColor = [220, 38, 38];
        } else if (data.cell.raw === 'Abono') {
          data.cell.styles.textColor = [5, 150, 105];
        }
      }
      if (data.section === 'body' && data.column.index === 6) {
        const rowType = data.row.raw && (data.row.raw as string[])[2];
        if (rowType === 'Fiado') {
          data.cell.styles.textColor = [220, 38, 38];
        } else if (rowType === 'Abono') {
          data.cell.styles.textColor = [5, 150, 105];
        }
      }
    }
  });

  // Pie de página con número de páginas
  const totalPages = (doc as any).internal.getNumberOfPages();
  for (let i = 1; i <= totalPages; i++) {
    doc.setPage(i);
    doc.setFontSize(7.5);
    doc.setTextColor(148, 163, 184);
    doc.text(
      `Página ${i} de ${totalPages} · Súper Colmado DAVID · Sistema Digital de Fiados`,
      105,
      290,
      { align: 'center' }
    );
  }

  // Guardar archivo PDF
  doc.save(`Reporte_Movimientos_ColmadoDAVID_${filtro}_${new Date().toISOString().split('T')[0]}.pdf`);
}

/**
 * Genera y descarga un PDF con todos los gastos de la quincena:
 * Columnas: Id, Fecha y Hora, Quién fue a comprar, Monto
 */
export function generarGastosQuincenaPDF(
  movimientos: Movimiento[],
  opciones?: {
    nombreCliente?: string;
    telefonoCliente?: string;
    quincenaTexto?: string;
    soloQuincenaActual?: boolean;
  }
): void {
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4'
  });

  const quincenaInfo = obtenerQuincenaActual();
  const tituloQuincena = opciones?.quincenaTexto || quincenaInfo.nombre;
  const esClienteIndividual = !!opciones?.nombreCliente;

  // Filtrar solo los fiados (gastos de compra)
  let fiadosQuincena = movimientos.filter(m => m.tipo === 'Fiado');

  // Si se solicita filtrar por fecha de la quincena actual
  if (opciones?.soloQuincenaActual !== false) {
    fiadosQuincena = fiadosQuincena.filter(m => {
      const f = new Date(m.fechaHora);
      return f >= quincenaInfo.inicio && f <= quincenaInfo.fin;
    });
    // Si la quincena actual aún no tiene movimientos suficientes, fallback a los fiados disponibles
    if (fiadosQuincena.length === 0) {
      fiadosQuincena = movimientos.filter(m => m.tipo === 'Fiado');
    }
  }

  const totalGastos = fiadosQuincena.reduce((acc, m) => acc + m.monto, 0);

  const datosColmado = store.getDatosColmado();

  // Encabezado institucional azul marino #1e3a8a
  doc.setFillColor(30, 58, 138);
  doc.rect(0, 0, 210, 36, 'F');

  doc.setTextColor(255, 255, 255);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(18);
  doc.text(datosColmado.nombre.toUpperCase(), 14, 13);

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(11);
  doc.setTextColor(250, 204, 21); // Amarillo dorado
  doc.text(`GASTOS DE LA QUINCENA · ${tituloQuincena.toUpperCase()}`, 14, 20);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8);
  doc.setTextColor(219, 234, 254);
  doc.text(`Período: ${quincenaInfo.rangoTexto} · ${datosColmado.direccion.substring(0, 45)}`, 14, 26);
  doc.text(
    `Fecha de emisión: ${new Date().toLocaleDateString('es-DO', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })}`,
    14,
    31
  );

  // Tarjeta de información / cliente
  let startY = 42;
  if (esClienteIndividual) {
    doc.setFillColor(241, 245, 249);
    doc.roundedRect(14, startY, 182, 18, 3, 3, 'F');
    doc.setTextColor(100, 116, 139);
    doc.setFontSize(8);
    doc.setFont('helvetica', 'bold');
    doc.text('CLIENTE TITULAR:', 18, startY + 6);
    doc.setTextColor(30, 41, 59);
    doc.setFontSize(11);
    doc.text(`${opciones?.nombreCliente} ${opciones?.telefonoCliente ? `(${opciones.telefonoCliente})` : ''}`, 18, startY + 13);

    doc.setTextColor(100, 116, 139);
    doc.setFontSize(8);
    doc.text('TOTAL GASTOS QUINCENA:', 130, startY + 6);
    doc.setTextColor(220, 38, 38);
    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    doc.text(formatoMoneda(totalGastos), 130, startY + 13);
    startY += 24;
  } else {
    doc.setFillColor(254, 242, 242);
    doc.roundedRect(14, startY, 182, 16, 3, 3, 'F');
    doc.setTextColor(220, 38, 38);
    doc.setFontSize(8);
    doc.setFont('helvetica', 'bold');
    doc.text('TOTAL DE GASTOS (FIADOS) DE LA QUINCENA:', 18, startY + 6);
    doc.setFontSize(12);
    doc.text(`${formatoMoneda(totalGastos)}  (${fiadosQuincena.length} compras en total)`, 18, startY + 12);
    startY += 22;
  }

  // Columnas exactas solicitadas:
  // Id, fecha y hora, Monto y quien fue a comprar (+ Cliente si es listado global)
  const headColumns = esClienteIndividual
    ? ['ID', 'Fecha y Hora', 'Quién fue a comprar', 'Monto']
    : ['ID', 'Fecha y Hora', 'Cliente Titular', 'Quién fue a comprar', 'Monto'];

  const rows = fiadosQuincena.map(m => {
    const fechaHora = `${m.fechaTexto || ''} ${m.hora || ''}`.trim() || new Date(m.fechaHora).toLocaleString('es-DO');
    const quienFue =
      m.autorizadoNombre && m.autorizadoNombre !== '-'
        ? `${m.autorizadoNombre} (${m.autorizadoParentesco || 'Titular'})`
        : (m.nombreCliente || 'Titular');

    if (esClienteIndividual) {
      return [`#${m.idMov}`, fechaHora, quienFue, formatoMoneda(m.monto)];
    } else {
      return [`#${m.idMov}`, fechaHora, m.nombreCliente || 'Cliente', quienFue, formatoMoneda(m.monto)];
    }
  });

  autoTable(doc, {
    startY: startY,
    head: [headColumns],
    body: rows,
    theme: 'striped',
    headStyles: {
      fillColor: [30, 58, 138],
      textColor: [255, 255, 255],
      fontStyle: 'bold',
      fontSize: 9,
      halign: 'left'
    },
    styles: {
      fontSize: 8.5,
      cellPadding: 3,
      textColor: [30, 41, 59],
      valign: 'middle'
    },
    columnStyles: esClienteIndividual
      ? {
          0: { cellWidth: 20, halign: 'center', fontStyle: 'bold' },
          1: { cellWidth: 42 },
          2: { cellWidth: 'auto', fontStyle: 'bold' },
          3: { cellWidth: 35, halign: 'right', fontStyle: 'bold', textColor: [220, 38, 38] }
        }
      : {
          0: { cellWidth: 16, halign: 'center', fontStyle: 'bold' },
          1: { cellWidth: 38 },
          2: { cellWidth: 42, fontStyle: 'bold' },
          3: { cellWidth: 'auto' },
          4: { cellWidth: 32, halign: 'right', fontStyle: 'bold', textColor: [220, 38, 38] }
        },
    alternateRowStyles: {
      fillColor: [248, 250, 252]
    },
    foot: [
      esClienteIndividual
        ? ['', '', 'TOTAL DE LA QUINCENA:', formatoMoneda(totalGastos)]
        : ['', '', '', 'TOTAL DE LA QUINCENA:', formatoMoneda(totalGastos)]
    ],
    footStyles: {
      fillColor: [241, 245, 249],
      textColor: [30, 41, 59],
      fontStyle: 'bold',
      fontSize: 9,
      halign: 'right'
    }
  });

  // Footer con paginación
  const totalPages = (doc as any).internal.getNumberOfPages();
  for (let i = 1; i <= totalPages; i++) {
    doc.setPage(i);
    doc.setFontSize(7.5);
    doc.setTextColor(148, 163, 184);
    doc.text(
      `Página ${i} de ${totalPages} · Gastos de la Quincena · Súper Colmado DAVID`,
      105,
      290,
      { align: 'center' }
    );
  }

  const nombreArchivo = esClienteIndividual
    ? `Gastos_Quincena_${opciones.nombreCliente?.replace(/\s+/g, '_')}.pdf`
    : `Gastos_Quincena_ColmadoDAVID_${new Date().toISOString().split('T')[0]}.pdf`;

  doc.save(nombreArchivo);
}

/**
 * Genera un reporte PDF con la lista completa de abonos de un cliente para máxima transparencia
 */
export function generarReporteAbonosClientePDF(
  abonos: Movimiento[],
  opciones: { nombreCliente: string; telefonoCliente?: string }
): void {
  const datosColmado = store.getDatosColmado();
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4'
  });

  const totalAbonado = abonos.reduce((sum, a) => sum + a.monto, 0);

  // Encabezado
  doc.setFillColor(16, 185, 129); // Verde esmeralda para abonos
  doc.rect(0, 0, 210, 32, 'F');

  doc.setTextColor(255, 255, 255);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(16);
  doc.text(datosColmado.nombre.toUpperCase(), 14, 14);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8.5);
  doc.setTextColor(236, 253, 245);
  doc.text(`${datosColmado.slogan} · Tel: ${datosColmado.telefono} · ${datosColmado.direccion}`, 14, 21);
  doc.text(`HISTORIAL OFICIAL DE ABONOS Y PAGOS RECIBIDOS`, 14, 27);

  // Subtítulo con datos del cliente
  doc.setTextColor(30, 41, 59);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(12);
  doc.text(`Cliente: ${opciones.nombreCliente}`, 14, 42);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9);
  doc.setTextColor(100, 116, 139);
  if (opciones.telefonoCliente) {
    doc.text(`Teléfono: ${opciones.telefonoCliente}`, 14, 48);
  }
  doc.text(`Fecha de emisión: ${new Date().toLocaleDateString('es-DO')} · ${new Date().toLocaleTimeString('es-DO', { hour: '2-digit', minute: '2-digit' })}`, 14, opciones.telefonoCliente ? 54 : 48);

  // Resumen en caja
  const startBoxY = opciones.telefonoCliente ? 60 : 54;
  doc.setFillColor(240, 253, 244);
  doc.setDrawColor(187, 247, 208);
  doc.roundedRect(14, startBoxY, 182, 16, 2, 2, 'FD');

  doc.setTextColor(22, 101, 52);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(10);
  doc.text(`Total Pagado: ${formatoMoneda(totalAbonado)}`, 20, startBoxY + 10.5);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9);
  doc.setTextColor(71, 85, 105);
  doc.text(`Cantidad de Abonos: ${abonos.length}`, 130, startBoxY + 10.5);

  const startTableY = startBoxY + 22;

  // Filas de la tabla
  const rows = abonos.map((a, idx) => {
    const fechaHora = `${a.fechaTexto || a.fechaHora.slice(0, 10)} ${a.hora || ''}`.trim();
    const obs = a.observaciones || 'Pago recibido';
    const fiadosTxt = a.fiadosPagadosIds && a.fiadosPagadosIds.length > 0 ? ` (Fiados: #${a.fiadosPagadosIds.join(', #')})` : '';
    return [
      String(idx + 1),
      `#${a.idMov}`,
      fechaHora,
      obs + fiadosTxt,
      formatoMoneda(a.monto)
    ];
  });

  autoTable(doc, {
    startY: startTableY,
    head: [['#', 'Recibo', 'Fecha y Hora', 'Observaciones / Detalle', 'Monto Pagado']],
    body: rows,
    theme: 'striped',
    headStyles: {
      fillColor: [16, 185, 129],
      textColor: [255, 255, 255],
      fontStyle: 'bold',
      fontSize: 9
    },
    styles: {
      fontSize: 8.5,
      cellPadding: 3,
      textColor: [30, 41, 59],
      valign: 'middle'
    },
    columnStyles: {
      0: { cellWidth: 12, halign: 'center', fontStyle: 'bold' },
      1: { cellWidth: 22, halign: 'center', fontStyle: 'bold' },
      2: { cellWidth: 38 },
      3: { cellWidth: 'auto' },
      4: { cellWidth: 34, halign: 'right', fontStyle: 'bold', textColor: [16, 185, 129] }
    },
    alternateRowStyles: {
      fillColor: [248, 250, 252]
    },
    foot: [['', '', '', 'TOTAL ABONADO:', formatoMoneda(totalAbonado)]],
    footStyles: {
      fillColor: [240, 253, 244],
      textColor: [22, 101, 52],
      fontStyle: 'bold',
      fontSize: 9.5,
      halign: 'right'
    }
  });

  // Footer con paginación
  const totalPages = (doc as any).internal.getNumberOfPages();
  for (let i = 1; i <= totalPages; i++) {
    doc.setPage(i);
    doc.setFontSize(7.5);
    doc.setTextColor(148, 163, 184);
    doc.text(
      `Página ${i} de ${totalPages} · Historial de Abonos · Súper Colmado DAVID`,
      105,
      290,
      { align: 'center' }
    );
  }

  const nombreArchivo = `Historial_Abonos_${opciones.nombreCliente.replace(/\s+/g, '_')}.pdf`;
  doc.save(nombreArchivo);
}


