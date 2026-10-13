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
}

export interface Cliente {
  id: number;
  nombre: string;
  telefono: string;
  pin: string;
  saldo: number;
  limite: number;
  diasPago: string; // e.g. "15,30"
  bloqueada?: boolean;
}

export interface Autorizado {
  id: number;
  idCliente: number;
  nombre: string;
  parentesco: string;
}

export interface Movimiento {
  idMov: number;
  idCliente: number;
  idAutorizado: number | null;
  tipo: 'Fiado' | 'Abono';
  monto: number;
  fechaHora: string; // ISO string
  observaciones: string;
  pagado?: boolean; // True if this fiado has been fully or partially paid
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
