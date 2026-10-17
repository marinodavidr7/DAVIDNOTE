export interface DatosColmado {
  nombre: string;
  slogan: string;
  direccion: string;
  telefono: string;
  whatsapp: string;
  horario: string;
  diasAtencion: string;
  rnc?: string;
  nota?: string;
  etiquetaCliente?: string; // Etiqueta/badge que se muestra al cliente (ej. "Cliente VIP", "Cliente Oro")
}

export interface Cliente {
  id: number;
  nombre: string;
  apodo?: string; // Sobrenombre / Apodo (ej. "Ñangon")
  telefono: string;
  pin: string;
  saldo: number;
  limite: number;
  diasPago: string; // e.g. "15,30"
  bloqueada?: boolean;
  nfcUid?: string; // Identificador / serial de tarjeta o llavero NFC
  codigoQR?: string; // Código QR del cliente
  numeroCuenta?: string; // Formato requerido: CU-27001-161001 ... CU-27001-161009, luego CU-27001-171001 ...
}

/**
 * Genera el número de cuenta de tarjeta según el formato solicitado:
 * Bloques de 9 clientes:
 * 1..9:   CU-27001-161001 hasta CU-27001-161009
 * 10..18: CU-27001-171001 hasta CU-27001-171009
 * 19..27: CU-27001-181001 hasta CU-27001-181009
 */
export function generarNumeroCuentaCliente(clienteIdOrIndex: number): string {
  const num = Number(clienteIdOrIndex);
  const index = Math.max(0, isNaN(num) ? 0 : Math.floor(num - 1));
  const blockNumber = 16 + Math.floor(index / 9);
  const posInBlock = (index % 9) + 1; // 1 to 9
  const suffix = `100${posInBlock}`; // "1001" .. "1009"
  return `CU-27001-${blockNumber}${suffix}`;
}

export interface Autorizado {
  id: number;
  idCliente: number;
  nombre: string;
  parentesco: string;
  telefono?: string;
  bloqueado?: boolean;
}

export interface Movimiento {
  idMov: number;
  idCliente: number;
  idAutorizado: number | null;
  tipo: 'Fiado' | 'Abono';
  monto: number;
  fechaHora: string; // ISO string
  observaciones: string;
  pagado?: boolean; // True if this fiado has been fully paid (saldoPendiente === 0)
  montoPagado?: number; // Cuánto se ha abonado a este fiado específico
  saldoPendiente?: number; // Cuánto resta por pagar de este fiado
  fiadosPagadosIds?: number[]; // For Abonos, list of fiado idMovs paid with this abono
  nombreCliente?: string;
  autorizadoNombre?: string;
  autorizadoParentesco?: string;
  fechaTexto?: string;
  fechaLarga?: string;
  hora?: string;
}

export interface Usuario {
  id: number;
  nombre: string;
  email: string;
  password?: string;
  rol: string;
  activo: boolean;
  fechaCreacion?: string;
  ultimoAcceso?: string | null;
}

export interface AuditoriaLog {
  id: number;
  fecha: string;
  usuario: string;
  tipo: 'Admin' | 'Cliente';
  accion: string;
  detalle: string;
  ipAddress?: string;
}

export type EstadoPago = 'al_dia' | 'pendiente' | 'sin_pago';

export interface ClienteCalculado extends Cliente {
  disponible: number;
  alLimite: boolean;
  ultimoAbono: string | null;
  estadoPago: EstadoPago;
  proximoPago: string;
  ultimoPagoEsperado: string;
}

export interface DiaGastoCliente {
  key: string;
  fecha: string;
  totalFiados: number;
  totalAbonos: number;
  movimientos: Movimiento[];
}

export interface DashboardAdminData {
  totalCobrar: number;
  totalClientes: number;
  clientes: ClienteCalculado[];
  pendientesPago: number;
  alDiaPago: number;
  hoyFiados: number;
  hoyAbonos: number;
}
