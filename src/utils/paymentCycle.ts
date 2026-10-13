import { EstadoPago, Movimiento } from '../types';

export function parseDiasPago(diasPago?: string): number[] {
  const dias = (diasPago || '15,30')
    .toString()
    .split(',')
    .map(d => parseInt(d.trim(), 10))
    .filter(d => !isNaN(d) && d >= 1 && d <= 31);
  if (dias.length === 0) return [15, 30];
  return dias.sort((a, b) => a - b);
}

export function calcularUltimoPagoEsperado(diasPago: string, hoy: Date = new Date()): Date {
  const dias = parseDiasPago(diasPago).slice().sort((a, b) => b - a);
  const diaHoy = hoy.getDate();
  const mes = hoy.getMonth();
  const anio = hoy.getFullYear();

  for (let i = 0; i < dias.length; i++) {
    if (dias[i] <= diaHoy) {
      return new Date(anio, mes, dias[i], 0, 0, 0);
    }
  }

  const mesAnt = mes === 0 ? 11 : mes - 1;
  const anioAnt = mes === 0 ? anio - 1 : anio;
  return new Date(anioAnt, mesAnt, dias[0], 0, 0, 0);
}

export function calcularProximoPago(diasPago: string, hoy: Date = new Date()): Date {
  const dias = parseDiasPago(diasPago);
  const diaHoy = hoy.getDate();
  const mes = hoy.getMonth();
  const anio = hoy.getFullYear();

  for (let i = 0; i < dias.length; i++) {
    if (dias[i] > diaHoy) {
      return new Date(anio, mes, dias[i], 0, 0, 0);
    }
  }

  return new Date(anio, mes + 1, dias[0], 0, 0, 0);
}

export function getUltimoAbonoCliente(idCliente: number, movs: Movimiento[]): Date | null {
  let ultimo: Date | null = null;
  for (const m of movs) {
    if (Number(m.idCliente) === Number(idCliente) && m.tipo === 'Abono') {
      const f = new Date(m.fechaHora);
      if (!ultimo || f > ultimo) {
        ultimo = f;
      }
    }
  }
  return ultimo;
}

export function calcularEstadoPago(saldo: number, ultimoAbono: Date | null, diasPago: string, hoy: Date = new Date()): EstadoPago {
  if (saldo <= 0) return 'al_dia';
  if (!ultimoAbono) return 'sin_pago';
  const ultimoEsperado = calcularUltimoPagoEsperado(diasPago, hoy);
  if (ultimoAbono >= ultimoEsperado) return 'al_dia';
  return 'pendiente';
}

export function formatoMoneda(monto: number): string {
  return 'RD$ ' + Number(monto || 0).toLocaleString('es-DO', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  });
}

export function formatearFechaCorta(isoString?: string | null): string {
  if (!isoString) return '—';
  const f = new Date(isoString);
  const meses = ['ene', 'feb', 'mar', 'abr', 'may', 'jun', 'jul', 'ago', 'sep', 'oct', 'nov', 'dic'];
  return `${f.getDate()} de ${meses[f.getMonth()]}`;
}

export function formatearFechaHora(isoString?: string | null): { fechaTexto: string; fechaLarga: string; hora: string } {
  if (!isoString) return { fechaTexto: '—', fechaLarga: '—', hora: '—' };
  const fecha = new Date(isoString);
  return {
    fechaTexto: fecha.toLocaleDateString('es-DO', { day: '2-digit', month: 'short', year: 'numeric' }),
    fechaLarga: fecha.toLocaleDateString('es-DO', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' }),
    hora: fecha.toLocaleTimeString('es-DO', { hour: '2-digit', minute: '2-digit' })
  };
}

export function esDiaDePagoHoy(diasPago?: string, hoy: Date = new Date()): boolean {
  const dias = parseDiasPago(diasPago);
  const diaHoy = hoy.getDate();
  return dias.includes(diaHoy);
}

export function obtenerQuincenaActual(hoy: Date = new Date()): {
  esPrimeraQuincena: boolean;
  nombre: string;
  rangoTexto: string;
  inicio: Date;
  fin: Date;
} {
  const anio = hoy.getFullYear();
  const mes = hoy.getMonth();
  const dia = hoy.getDate();
  const meses = ['enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio', 'julio', 'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre'];

  if (dia <= 15) {
    return {
      esPrimeraQuincena: true,
      nombre: `1ra Quincena de ${meses[mes]} (${anio})`,
      rangoTexto: `1 al 15 de ${meses[mes]} de ${anio}`,
      inicio: new Date(anio, mes, 1, 0, 0, 0),
      fin: new Date(anio, mes, 15, 23, 59, 59)
    };
  } else {
    const ultimoDiaMes = new Date(anio, mes + 1, 0).getDate();
    return {
      esPrimeraQuincena: false,
      nombre: `2da Quincena de ${meses[mes]} (${anio})`,
      rangoTexto: `16 al ${ultimoDiaMes} de ${meses[mes]} de ${anio}`,
      inicio: new Date(anio, mes, 16, 0, 0, 0),
      fin: new Date(anio, mes, ultimoDiaMes, 23, 59, 59)
    };
  }
}

