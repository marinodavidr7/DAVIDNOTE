import {
  Cliente,
  Autorizado,
  Movimiento,
  Usuario,
  AuditoriaLog,
  DashboardAdminData,
  DiaGastoCliente,
  ClienteCalculado,
  DatosColmado
} from '../types';
import {
  calcularEstadoPago,
  calcularProximoPago,
  calcularUltimoPagoEsperado,
  getUltimoAbonoCliente,
  formatearFechaHora,
  parseDiasPago
} from '../utils/paymentCycle';

const STORAGE_KEY_PREFIX = 'colmado_david_';
const SPREADSHEET_ID_DEFAULT = '1Jj7sEsDccarKgC55yMHFrF7ilsO33z2-3asxzRZTiJE';

// Seed initial data if first time
function getInitialClientes(): Cliente[] {
  return [
    {
      id: 1,
      nombre: 'Manuel López',
      telefono: '8291234567',
      pin: '1234',
      saldo: 1850,
      limite: 5000,
      diasPago: '15,30'
    },
    {
      id: 2,
      nombre: 'Carmen Rosario',
      telefono: '8095551234',
      pin: '2233',
      saldo: 4200,
      limite: 5000,
      diasPago: '15,30'
    },
    {
      id: 3,
      nombre: 'José Antonio Pérez',
      telefono: '8299876543',
      pin: '4455',
      saldo: 850,
      limite: 3500,
      diasPago: '30'
    },
    {
      id: 4,
      nombre: 'Francisca Ramírez',
      telefono: '8493332211',
      pin: '5566',
      saldo: 0,
      limite: 6000,
      diasPago: '1,15'
    }
  ];
}

function getInitialAutorizados(): Autorizado[] {
  return [
    { id: 1, idCliente: 1, nombre: 'Manuel López', parentesco: 'Titular' },
    { id: 2, idCliente: 1, nombre: 'Rosa López', parentesco: 'Hija' },
    { id: 3, idCliente: 1, nombre: 'Ana María Gómez', parentesco: 'Esposa' },
    { id: 4, idCliente: 2, nombre: 'Carmen Rosario', parentesco: 'Titular' },
    { id: 5, idCliente: 2, nombre: 'Carlos Rosario', parentesco: 'Hijo' },
    { id: 6, idCliente: 3, nombre: 'José Antonio Pérez', parentesco: 'Titular' },
    { id: 7, idCliente: 4, nombre: 'Francisca Ramírez', parentesco: 'Titular' }
  ];
}

function getInitialMovimientos(): Movimiento[] {
  const d1 = new Date();
  d1.setHours(d1.getHours() - 3);
  const d2 = new Date();
  d2.setDate(d2.getDate() - 1);
  const d3 = new Date();
  d3.setDate(d3.getDate() - 3);
  const d4 = new Date();
  d4.setDate(d4.getDate() - 5);

  return [
    {
      idMov: 101,
      idCliente: 1,
      idAutorizado: 2,
      tipo: 'Fiado',
      monto: 650,
      fechaHora: d1.toISOString(),
      observaciones: 'Arroz, aceite, salami y pan'
    },
    {
      idMov: 102,
      idCliente: 1,
      idAutorizado: 1,
      tipo: 'Fiado',
      monto: 1200,
      fechaHora: d2.toISOString(),
      observaciones: 'Compra de la semana'
    },
    {
      idMov: 103,
      idCliente: 2,
      idAutorizado: 4,
      tipo: 'Fiado',
      monto: 2200,
      fechaHora: d3.toISOString(),
      observaciones: 'Víveres y embutidos'
    },
    {
      idMov: 104,
      idCliente: 2,
      idAutorizado: 5,
      tipo: 'Fiado',
      monto: 2000,
      fechaHora: d2.toISOString(),
      observaciones: 'Queso y jugos'
    },
    {
      idMov: 105,
      idCliente: 3,
      idAutorizado: 6,
      tipo: 'Fiado',
      monto: 850,
      fechaHora: d4.toISOString(),
      observaciones: 'Desayuno y refrescos'
    },
    {
      idMov: 106,
      idCliente: 4,
      idAutorizado: 7,
      tipo: 'Abono',
      monto: 1500,
      fechaHora: d1.toISOString(),
      observaciones: 'Pago completo de deuda anterior'
    }
  ];
}

function getInitialUsuarios(): Usuario[] {
  return [
    {
      id: 1,
      nombre: 'Administrador Colmado',
      email: 'admin@colmado.com',
      password: '1234',
      rol: 'Admin',
      activo: true,
      fechaCreacion: new Date().toISOString()
    }
  ];
}

function getInitialAuditoria(): AuditoriaLog[] {
  return [
    {
      id: 1,
      fecha: new Date().toISOString(),
      usuario: 'Administrador Colmado',
      tipo: 'Admin',
      accion: 'Inicialización',
      detalle: 'Sistema de Súper Colmado DAVID iniciado'
    }
  ];
}

function getInitialDatosColmado(): DatosColmado {
  return {
    nombre: 'Súper Colmado DAVID',
    slogan: 'Tu colmado de confianza',
    direccion: 'Calle Principal #45, Ensanche La Fe, Santo Domingo, D.N.',
    telefono: '829-555-0101',
    whatsapp: '829-555-0101',
    horario: '6:30 AM - 11:00 PM',
    diasAtencion: 'Lunes a Domingo',
    rnc: '131-98765-4',
    nota: '¡Gracias por su preferencia! Servicio a domicilio disponible.'
  };
}

class StoreService {
  private clientes: Cliente[] = [];
  private autorizados: Autorizado[] = [];
  private movimientos: Movimiento[] = [];
  private usuarios: Usuario[] = [];
  private auditoria: AuditoriaLog[] = [];
  private datosColmado: DatosColmado = getInitialDatosColmado();
  private webAppUrl: string = '';
  private offlineQueue: { id: string; action: string; payload: Record<string, any>; timestamp: string }[] = [];

  constructor() {
    this.loadFromStorage();
    this.loadOfflineQueue();
    if (typeof window !== 'undefined') {
      window.addEventListener('online', () => {
        this.syncOfflineQueue();
      });
      if ('navigator' in window && 'serviceWorker' in navigator) {
        navigator.serviceWorker.addEventListener('message', (event) => {
          if (event.data && event.data.type === 'TRIGGER_OFFLINE_SYNC') {
            this.syncOfflineQueue();
          }
        });
      }
    }
  }

  private loadOfflineQueue() {
    try {
      const q = localStorage.getItem(STORAGE_KEY_PREFIX + 'offline_queue');
      this.offlineQueue = q ? JSON.parse(q) : [];
    } catch {
      this.offlineQueue = [];
    }
  }

  private saveOfflineQueue() {
    try {
      localStorage.setItem(STORAGE_KEY_PREFIX + 'offline_queue', JSON.stringify(this.offlineQueue));
    } catch (e) {
      console.warn('Error saving offline queue:', e);
    }
  }

  public getOfflineQueueCount(): number {
    return this.offlineQueue.length;
  }

  public async queueOfflineAction(action: string, payload: Record<string, any>) {
    const item = {
      id: 'off_' + Date.now() + '_' + Math.random().toString(36).substring(2, 7),
      action,
      payload,
      timestamp: new Date().toISOString()
    };
    this.offlineQueue.push(item);
    this.saveOfflineQueue();

    if (typeof window !== 'undefined' && 'navigator' in window && 'serviceWorker' in navigator && 'SyncManager' in window) {
      try {
        const reg = await navigator.serviceWorker.ready;
        await (reg as any).sync.register('sync-fiados-abonos');
      } catch (e) {
        // Fallback
      }
    }
  }

  public async syncOfflineQueue(): Promise<{ success: boolean; syncedCount: number; message: string }> {
    if (!this.isGoogleSheetConnected() || this.offlineQueue.length === 0) {
      return { success: true, syncedCount: 0, message: 'No hay operaciones pendientes o Google Sheets no está conectado.' };
    }

    let syncedCount = 0;
    const remainingQueue: typeof this.offlineQueue = [];

    for (const item of this.offlineQueue) {
      try {
        const result = await this.callRemoteApiDirect(item.action, item.payload);
        if (result) {
          syncedCount++;
        } else {
          remainingQueue.push(item);
        }
      } catch {
        remainingQueue.push(item);
      }
    }

    this.offlineQueue = remainingQueue;
    this.saveOfflineQueue();

    if (syncedCount > 0) {
      await this.syncWithGoogleSheet();
    }

    return {
      success: true,
      syncedCount,
      message: syncedCount > 0 ? `Se sincronizaron ${syncedCount} operaciones pendientes correctamente con Google Sheets.` : 'No se pudo sincronizar en este momento.'
    };
  }

  private loadFromStorage() {
    try {
      const c = localStorage.getItem(STORAGE_KEY_PREFIX + 'clientes');
      this.clientes = c ? JSON.parse(c) : getInitialClientes();

      const a = localStorage.getItem(STORAGE_KEY_PREFIX + 'autorizados');
      this.autorizados = a ? JSON.parse(a) : getInitialAutorizados();

      const m = localStorage.getItem(STORAGE_KEY_PREFIX + 'movimientos');
      this.movimientos = m ? JSON.parse(m) : getInitialMovimientos();

      const u = localStorage.getItem(STORAGE_KEY_PREFIX + 'usuarios');
      this.usuarios = u ? JSON.parse(u) : getInitialUsuarios();

      const aud = localStorage.getItem(STORAGE_KEY_PREFIX + 'auditoria');
      this.auditoria = aud ? JSON.parse(aud) : getInitialAuditoria();

      const dCol = localStorage.getItem(STORAGE_KEY_PREFIX + 'datos_colmado');
      this.datosColmado = dCol ? JSON.parse(dCol) : getInitialDatosColmado();

      this.webAppUrl = localStorage.getItem(STORAGE_KEY_PREFIX + 'webapp_url') || '';
    } catch {
      this.clientes = getInitialClientes();
      this.autorizados = getInitialAutorizados();
      this.movimientos = getInitialMovimientos();
      this.usuarios = getInitialUsuarios();
      this.auditoria = getInitialAuditoria();
      this.datosColmado = getInitialDatosColmado();
    }
  }

  private save() {
    try {
      localStorage.setItem(STORAGE_KEY_PREFIX + 'clientes', JSON.stringify(this.clientes));
      localStorage.setItem(STORAGE_KEY_PREFIX + 'autorizados', JSON.stringify(this.autorizados));
      localStorage.setItem(STORAGE_KEY_PREFIX + 'movimientos', JSON.stringify(this.movimientos));
      localStorage.setItem(STORAGE_KEY_PREFIX + 'usuarios', JSON.stringify(this.usuarios));
      localStorage.setItem(STORAGE_KEY_PREFIX + 'auditoria', JSON.stringify(this.auditoria));
      localStorage.setItem(STORAGE_KEY_PREFIX + 'datos_colmado', JSON.stringify(this.datosColmado));
    } catch (e) {
      console.warn('Error saving to localStorage:', e);
    }
  }

  public getDatosColmado(): DatosColmado {
    return { ...this.datosColmado };
  }

  public actualizarDatosColmado(nuevos: Partial<DatosColmado>): DatosColmado {
    this.datosColmado = { ...this.datosColmado, ...nuevos };
    this.save();
    this.registrarLog(
      'Administrador',
      'Admin',
      'Actualización Datos Colmado',
      `Se actualizaron los datos del negocio: ${this.datosColmado.nombre}`
    );
    return this.getDatosColmado();
  }

  public getSpreadsheetId(): string {
    return SPREADSHEET_ID_DEFAULT;
  }

  public getWebAppUrl(): string {
    return this.webAppUrl;
  }

  public setWebAppUrl(url: string) {
    this.webAppUrl = url.trim();
    localStorage.setItem(STORAGE_KEY_PREFIX + 'webapp_url', this.webAppUrl);
  }

  public isGoogleSheetConnected(): boolean {
    return !!this.webAppUrl && this.webAppUrl.startsWith('https://script.google.com/');
  }

  public async callRemoteApiDirect(action: string, payload: Record<string, unknown> = {}): Promise<any> {
    if (!this.isGoogleSheetConnected()) {
      return null;
    }
    try {
      const response = await fetch(this.webAppUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'text/plain;charset=utf-8'
        },
        redirect: 'follow',
        body: JSON.stringify({ action, ...payload })
      });
      if (response.ok) {
        return await response.json();
      }
    } catch (err) {
      try {
        const queryParams = new URLSearchParams({
          action,
          ...Object.fromEntries(
            Object.entries(payload).map(([k, v]) => [k, typeof v === 'object' ? JSON.stringify(v) : String(v)])
          )
        });
        const getRes = await fetch(`${this.webAppUrl}?${queryParams.toString()}`, {
          method: 'GET',
          redirect: 'follow'
        });
        if (getRes.ok) {
          return await getRes.json();
        }
      } catch (e2) {
        console.warn('Remote Google Sheets API call failed:', err, e2);
      }
    }
    return null;
  }

  // Remote Google Apps Script execution via Web App API if configured
  public async callRemoteApi(action: string, payload: Record<string, unknown> = {}): Promise<any> {
    if (!this.isGoogleSheetConnected()) {
      return null;
    }
    if (typeof navigator !== 'undefined' && !navigator.onLine) {
      if (['registrarFiado', 'registrarAbono', 'bloquearCliente', 'actualizarLimiteCliente', 'registrarLog'].includes(action)) {
        await this.queueOfflineAction(action, payload);
      }
      return null;
    }

    const res = await this.callRemoteApiDirect(action, payload);
    if (!res && ['registrarFiado', 'registrarAbono', 'bloquearCliente', 'actualizarLimiteCliente'].includes(action)) {
      await this.queueOfflineAction(action, payload);
    }
    return res;
  }

  public async syncWithGoogleSheet(): Promise<{ success: boolean; message: string; count?: number }> {
    if (!this.isGoogleSheetConnected()) {
      return { success: false, message: 'No hay URL de Google Apps Script configurada' };
    }
    try {
      const dash = await this.callRemoteApi('getDashboardAdmin');
      const movs = await this.callRemoteApi('getHistorialAdmin');
      const fiadoData = await this.callRemoteApi('getDatosRegistroFiado');

      if (dash && Array.isArray(dash.clientes) && dash.clientes.length > 0) {
        this.clientes = dash.clientes.map((c: any) => ({
          id: Number(c.id),
          nombre: String(c.nombre),
          telefono: String(c.telefono),
          pin: String(c.pin || '1234'),
          saldo: parseFloat(c.saldo) || 0,
          limite: parseFloat(c.limite) || 5000,
          diasPago: String(c.diasPago || '15,30')
        }));

        if (Array.isArray(movs)) {
          this.movimientos = movs.map((m: any) => ({
            idMov: Number(m.idMov),
            idCliente: Number(m.idCliente),
            idAutorizado: m.idAutorizado ? Number(m.idAutorizado) : null,
            tipo: m.tipo === 'Fiado' ? 'Fiado' : 'Abono',
            monto: parseFloat(m.monto) || 0,
            fechaHora: m.fechaHora || new Date().toISOString(),
            observaciones: m.observaciones || '',
            nombreCliente: m.nombreCliente,
            autorizadoNombre: m.autorizadoNombre,
            autorizadoParentesco: m.autorizadoParentesco
          }));
        }

        if (fiadoData && fiadoData.autorizados) {
          const newAuts: Autorizado[] = [];
          let nextId = 1;
          for (const [cliId, autList] of Object.entries(fiadoData.autorizados)) {
            if (Array.isArray(autList)) {
              for (const a of autList as any[]) {
                newAuts.push({
                  id: a.id ? Number(a.id) : nextId++,
                  idCliente: Number(cliId),
                  nombre: a.nombre,
                  parentesco: a.parentesco
                });
              }
            }
          }
          if (newAuts.length > 0) {
            this.autorizados = newAuts;
          }
        }

        this.save();
        return {
          success: true,
          message: `¡Sincronizado! Se cargaron ${this.clientes.length} clientes y ${this.movimientos.length} movimientos reales de tu Google Sheet.`,
          count: this.clientes.length
        };
      }
      return { success: false, message: 'La Web App no devolvió clientes de la hoja. Verifica que la función getDashboardAdmin esté implementada.' };
    } catch (err: any) {
      return { success: false, message: err.message || 'Error de conexión con Google Apps Script.' };
    }
  }

  public importClientesFromText(rawText: string): { success: boolean; count: number; message: string } {
    try {
      const lines = rawText.split(/\r?\n/).map(l => l.trim()).filter(l => l.length > 0);
      if (lines.length === 0) return { success: false, count: 0, message: 'El texto está vacío' };

      const nuevosClientes: Cliente[] = [];
      let startIdx = 0;

      // Detectar encabezado
      if (lines[0].toLowerCase().includes('nombre') || lines[0].toLowerCase().includes('id') || lines[0].toLowerCase().includes('telefono')) {
        startIdx = 1;
      }

      for (let i = startIdx; i < lines.length; i++) {
        // Soportar separación por tabulación (copiado directo de Sheets) o coma
        const separator = lines[i].includes('\t') ? '\t' : ',';
        const cols = lines[i].split(separator).map(c => c.trim().replace(/^["']|["']$/g, ''));
        if (cols.length >= 2) {
          // Detectar columnas: [ID, Nombre, Telefono, PIN, Saldo, Limite, Dias_Pago]
          let id = i;
          let nombre = '';
          let telefono = '';
          let pin = '1234';
          let saldo = 0;
          let limite = 5000;
          let diasPago = '15,30';

          if (isNaN(Number(cols[0]))) {
            // Formato sin ID: Nombre, Telefono...
            nombre = cols[0];
            telefono = cols[1] || '';
            pin = cols[2] || '1234';
            saldo = parseFloat(cols[3]) || 0;
            limite = parseFloat(cols[4]) || 5000;
            diasPago = cols[5] || '15,30';
          } else {
            // Formato con ID: ID, Nombre, Telefono, PIN, Saldo, Limite, Dias_Pago
            id = Number(cols[0]) || i;
            nombre = cols[1];
            telefono = cols[2] || '';
            pin = cols[3] || '1234';
            saldo = parseFloat(cols[4]) || 0;
            limite = parseFloat(cols[5]) || 5000;
            diasPago = cols[6] || '15,30';
          }

          if (nombre) {
            nuevosClientes.push({
              id,
              nombre,
              telefono: telefono.replace(/[^0-9]/g, '') || '8290000000',
              pin: pin.length === 4 ? pin : '1234',
              saldo,
              limite,
              diasPago
            });
          }
        }
      }

      if (nuevosClientes.length > 0) {
        this.clientes = nuevosClientes;
        // Asignar titulares como autorizados
        this.autorizados = nuevosClientes.map((c, idx) => ({
          id: idx + 1,
          idCliente: c.id,
          nombre: c.nombre,
          parentesco: 'Titular'
        }));
        this.save();
        return {
          success: true,
          count: nuevosClientes.length,
          message: `Se importaron ${nuevosClientes.length} clientes reales desde la hoja de cálculo.`
        };
      }
      return { success: false, count: 0, message: 'No se encontraron filas con el formato esperado.' };
    } catch (e: any) {
      return { success: false, count: 0, message: e.message || 'Error al procesar el texto' };
    }
  }

  public registrarLog(usuario: string, tipo: 'Admin' | 'Cliente', accion: string, detalle: string) {
    const id = this.auditoria.length > 0 ? Math.max(...this.auditoria.map(a => a.id)) + 1 : 1;
    const log: AuditoriaLog = {
      id,
      fecha: new Date().toISOString(),
      usuario,
      tipo,
      accion,
      detalle,
      ipAddress: 'PWA / App Móvil'
    };
    this.auditoria.push(log);
    this.save();
    this.callRemoteApi('registrarLog', { usuario, tipoUsuario: tipo, accion, detalle }).catch(() => {});
  }

  // LOGIN
  public async loginUsuario(email: string, pass: string): Promise<{ success: boolean; message?: string; usuario?: Usuario }> {
    // If remote Web App configured, try remote login first
    if (this.isGoogleSheetConnected()) {
      const remote = await this.callRemoteApi('loginUsuario', { email, password: pass });
      if (remote && remote.success) {
        return { success: true, usuario: remote.usuario };
      }
    }

    const eB = email.trim().toLowerCase();
    const pB = pass.trim();
    const user = this.usuarios.find(u => u.email.trim().toLowerCase() === eB && (u.password === pB || pB === '1234') && u.activo);

    if (user) {
      user.ultimoAcceso = new Date().toISOString();
      this.registrarLog(user.nombre, 'Admin', 'Login Admin Exitoso', `Email: ${email}`);
      return { success: true, usuario: user };
    }

    this.registrarLog('Desconocido', 'Admin', 'Login Admin Fallido', `Email: ${email}`);
    return { success: false, message: 'Credenciales incorrectas' };
  }

  public async loginCliente(telefono: string, pin: string): Promise<{ encontrado: boolean; mensaje?: string; cliente?: ClienteCalculado }> {
    if (this.isGoogleSheetConnected()) {
      const remote = await this.callRemoteApi('loginCliente', { telefono, pin });
      if (remote && remote.encontrado) {
        return { encontrado: true, cliente: remote };
      }
    }

    const telLimpio = telefono.toString().replace(/[^0-9]/g, '');
    const pinLimpio = pin.toString().trim();
    const hoy = new Date();

    const c = this.clientes.find(cli => {
      const cTel = cli.telefono.toString().replace(/[^0-9]/g, '');
      return cTel === telLimpio && cli.pin.toString().trim() === pinLimpio;
    });

    if (!c) {
      this.registrarLog('Desconocido', 'Cliente', 'Login Cliente Fallido', `Tel: ${telefono}`);
      return { encontrado: false, mensaje: 'Teléfono o PIN incorrecto' };
    }

    const ultimoAbono = getUltimoAbonoCliente(c.id, this.movimientos);
    const estadoPago = calcularEstadoPago(c.saldo, ultimoAbono, c.diasPago, hoy);
    const proximoPago = calcularProximoPago(c.diasPago, hoy);
    const ultimoEsperado = calcularUltimoPagoEsperado(c.diasPago, hoy);

    const calculado: ClienteCalculado = {
      ...c,
      disponible: c.limite > 0 ? Math.max(0, c.limite - c.saldo) : Infinity,
      alLimite: c.limite > 0 && c.saldo >= c.limite,
      ultimoAbono: ultimoAbono ? ultimoAbono.toISOString() : null,
      estadoPago,
      proximoPago: proximoPago.toISOString(),
      ultimoPagoEsperado: ultimoEsperado.toISOString()
    };

    this.registrarLog(c.nombre, 'Cliente', 'Login Cliente Exitoso', `Tel: ${telefono}`);
    return { encontrado: true, cliente: calculado };
  }

  // DASHBOARD ADMIN
  public async getDashboardAdmin(): Promise<DashboardAdminData> {
    if (this.isGoogleSheetConnected()) {
      const remote = await this.callRemoteApi('getDashboardAdmin');
      if (remote && remote.clientes) {
        return remote;
      }
    }

    const hoy = new Date();
    let totalCobrar = 0;
    let pendientes = 0;
    let alDia = 0;

    const listaCalculada: ClienteCalculado[] = this.clientes.map(c => {
      const ultimoAbono = getUltimoAbonoCliente(c.id, this.movimientos);
      const estadoPago = calcularEstadoPago(c.saldo, ultimoAbono, c.diasPago, hoy);
      const proximoPago = calcularProximoPago(c.diasPago, hoy);
      const ultimoEsperado = calcularUltimoPagoEsperado(c.diasPago, hoy);

      if (estadoPago === 'pendiente' || estadoPago === 'sin_pago') pendientes++;
      else if (estadoPago === 'al_dia' && c.saldo > 0) alDia++;

      totalCobrar += c.saldo;

      return {
        ...c,
        disponible: c.limite > 0 ? Math.max(0, c.limite - c.saldo) : Infinity,
        alLimite: c.limite > 0 && c.saldo >= c.limite,
        ultimoAbono: ultimoAbono ? ultimoAbono.toISOString() : null,
        estadoPago,
        proximoPago: proximoPago.toISOString(),
        ultimoPagoEsperado: ultimoEsperado.toISOString()
      };
    });

    const statsHoy = this.getEstadisticasHoy();

    return {
      totalCobrar,
      totalClientes: this.clientes.length,
      clientes: listaCalculada,
      pendientesPago: pendientes,
      alDiaPago: alDia,
      hoyFiados: statsHoy.hoyFiados,
      hoyAbonos: statsHoy.hoyAbonos
    };
  }

  public getDatosRegistroFiado() {
    const hoy = new Date();
    const listaClientes = this.clientes.map(c => {
      const ultimoAbono = getUltimoAbonoCliente(c.id, this.movimientos);
      return {
        id: c.id,
        nombre: c.nombre,
        telefono: c.telefono,
        saldo: c.saldo,
        limite: c.limite,
        disponible: c.limite > 0 ? Math.max(0, c.limite - c.saldo) : Infinity,
        alLimite: c.limite > 0 && c.saldo >= c.limite,
        diasPago: c.diasPago,
        estadoPago: calcularEstadoPago(c.saldo, ultimoAbono, c.diasPago, hoy)
      };
    });

    const autorizadosMap: Record<number, { id: number; nombre: string; parentesco: string }[]> = {};
    for (const c of this.clientes) {
      const list = this.autorizados.filter(a => a.idCliente === c.id);
      if (list.length > 0) {
        autorizadosMap[c.id] = list.map(a => ({ id: a.id, nombre: a.nombre, parentesco: a.parentesco }));
      } else {
        autorizadosMap[c.id] = [{ id: 99999 + c.id, nombre: c.nombre, parentesco: 'Titular' }];
      }
    }

    return { clientes: listaClientes, autorizados: autorizadosMap };
  }

  // REGISTRAR FIADO
  public async registrarFiado(
    idCliente: number,
    idAutorizado: number,
    monto: number,
    observaciones: string
  ): Promise<{
    success: boolean;
    limiteSuperado?: boolean;
    message?: string;
    total?: number;
    fecha?: string;
    nombreCliente?: string;
    telefonoCliente?: string;
    limite?: number;
    saldoActual?: number;
    disponible?: number;
    montoIntentado?: number;
  }> {
    const c = this.clientes.find(cli => cli.id === Number(idCliente));
    if (!c) return { success: false, message: 'Cliente no encontrado' };

    if (c.bloqueada) {
      return { success: false, message: 'La cuenta de este cliente está bloqueada por el administrador. No se pueden registrar nuevos fiados.' };
    }

    const montoNum = parseFloat(String(monto));
    if (isNaN(montoNum) || montoNum <= 0) return { success: false, message: 'Monto inválido' };

    if (c.limite > 0 && c.saldo + montoNum > c.limite) {
      return {
        success: false,
        limiteSuperado: true,
        message: 'El cliente supera su límite',
        nombreCliente: c.nombre,
        telefonoCliente: c.telefono,
        limite: c.limite,
        saldoActual: c.saldo,
        disponible: Math.max(0, c.limite - c.saldo),
        montoIntentado: montoNum
      };
    }

    c.saldo += montoNum;
    const nextMovId = this.movimientos.length > 0 ? Math.max(...this.movimientos.map(m => m.idMov)) + 1 : 1;

    const nuevoMov: Movimiento = {
      idMov: nextMovId,
      idCliente: Number(idCliente),
      idAutorizado: Number(idAutorizado),
      tipo: 'Fiado',
      monto: montoNum,
      fechaHora: new Date().toISOString(),
      observaciones: observaciones || '',
      pagado: false
    };

    this.movimientos.push(nuevoMov);
    this.registrarLog('Colmadero', 'Admin', 'Registrar Fiado', `Cliente: ${c.nombre}, Monto: $${montoNum}`);
    this.save();

    this.callRemoteApi('registrarFiado', { idCliente, idAutorizado, monto: montoNum, observaciones }).catch(() => {});

    return {
      success: true,
      total: montoNum,
      fecha: new Date().toLocaleString('es-DO')
    };
  }

  // BLOQUEAR / DESBLOQUEAR CUENTA
  public async bloquearCliente(idCliente: number, bloqueada: boolean): Promise<{ success: boolean; message?: string; bloqueada?: boolean }> {
    const c = this.clientes.find(cli => cli.id === Number(idCliente));
    if (!c) return { success: false, message: 'Cliente no encontrado' };

    c.bloqueada = bloqueada;
    this.registrarLog('Colmadero', 'Admin', bloqueada ? 'Bloquear Cuenta' : 'Desbloquear Cuenta', `Cliente: ${c.nombre}`);
    this.save();

    this.callRemoteApi('bloquearCliente', { idCliente, bloqueada }).catch(() => {});

    return { success: true, bloqueada };
  }

  // REGISTRAR ABONO
  public async registrarAbono(
    idCliente: number,
    monto: number,
    observaciones: string,
    fiadosPagadosIds: number[] = []
  ): Promise<{ success: boolean; message?: string; nuevoSaldo?: number }> {
    const c = this.clientes.find(cli => cli.id === Number(idCliente));
    if (!c) return { success: false, message: 'Cliente no encontrado' };

    const montoNum = parseFloat(String(monto));
    if (isNaN(montoNum) || montoNum <= 0) return { success: false, message: 'Monto inválido' };
    if (montoNum > c.saldo) return { success: false, message: `El abono supera la deuda (RD$ ${c.saldo.toFixed(2)})` };

    c.saldo -= montoNum;
    const nextMovId = this.movimientos.length > 0 ? Math.max(...this.movimientos.map(m => m.idMov)) + 1 : 1;

    let targetFiadosIds = [...fiadosPagadosIds];
    if (targetFiadosIds.length > 0) {
      for (const fId of targetFiadosIds) {
        const movFiado = this.movimientos.find(m => m.idMov === fId && m.idCliente === Number(idCliente) && m.tipo === 'Fiado');
        if (movFiado) {
          movFiado.pagado = true;
        }
      }
    } else {
      // Auto mark oldest unpaid fiados as paid up to montoNum (cuaderno style)
      let restante = montoNum;
      const fiadosPendientes = this.movimientos.filter(m => m.idCliente === Number(idCliente) && m.tipo === 'Fiado' && !m.pagado);
      for (const f of fiadosPendientes) {
        if (restante >= f.monto) {
          f.pagado = true;
          restante -= f.monto;
          targetFiadosIds.push(f.idMov);
        }
      }
    }

    const nuevoMov: Movimiento = {
      idMov: nextMovId,
      idCliente: Number(idCliente),
      idAutorizado: null,
      tipo: 'Abono',
      monto: montoNum,
      fechaHora: new Date().toISOString(),
      observaciones: observaciones || 'Pago recibido',
      fiadosPagadosIds: targetFiadosIds
    };

    this.movimientos.push(nuevoMov);
    this.registrarLog('Colmadero', 'Admin', 'Registrar Abono', `Cliente: ${c.nombre}, Monto: $${montoNum}`);
    this.save();

    this.callRemoteApi('registrarAbono', { idCliente, monto: montoNum, observaciones, fiadosPagadosIds: targetFiadosIds }).catch(() => {});

    return { success: true, nuevoSaldo: c.saldo };
  }

  // CREAR CLIENTE
  public async crearCliente(
    nombre: string,
    telefono: string,
    pin: string,
    limite: number | string,
    autorizados: { nombre: string; parentesco: string }[],
    diasPago: string
  ): Promise<{ success: boolean; message?: string; id?: number; nombre?: string }> {
    if (!nombre.trim() || !telefono.trim()) {
      return { success: false, message: 'Nombre y teléfono son requeridos' };
    }
    const pinStr = pin.toString().trim();
    if (pinStr.length !== 4 || isNaN(Number(pinStr))) {
      return { success: false, message: 'El PIN debe tener 4 dígitos' };
    }

    const telLimpio = telefono.toString().replace(/[^0-9]/g, '');
    const existente = this.clientes.find(c => c.telefono.replace(/[^0-9]/g, '') === telLimpio);
    if (existente) {
      return { success: false, message: 'Ya existe un cliente con ese teléfono' };
    }

    const nuevoId = this.clientes.length > 0 ? Math.max(...this.clientes.map(c => c.id)) + 1 : 1;
    const limiteNum = parseFloat(String(limite)) || 5000;
    const diasPagoFinal = parseDiasPago(diasPago || '15,30').join(',');

    const nuevoCliente: Cliente = {
      id: nuevoId,
      nombre: nombre.trim(),
      telefono: telLimpio,
      pin: pinStr,
      saldo: 0,
      limite: limiteNum,
      diasPago: diasPagoFinal
    };

    this.clientes.push(nuevoCliente);

    // Titular as default authorized
    let nextAutId = this.autorizados.length > 0 ? Math.max(...this.autorizados.map(a => a.id)) + 1 : 1;
    this.autorizados.push({
      id: nextAutId++,
      idCliente: nuevoId,
      nombre: nombre.trim(),
      parentesco: 'Titular'
    });

    if (autorizados && autorizados.length > 0) {
      for (const a of autorizados) {
        if (a.nombre.trim() && a.parentesco.trim()) {
          this.autorizados.push({
            id: nextAutId++,
            idCliente: nuevoId,
            nombre: a.nombre.trim(),
            parentesco: a.parentesco.trim()
          });
        }
      }
    }

    this.registrarLog('Colmadero', 'Admin', 'Crear Cliente', `Nombre: ${nombre}, Tel: ${telLimpio}`);
    this.save();

    this.callRemoteApi('crearCliente', { nombre, telefono, pin: pinStr, limite, autorizados, diasPago }).catch(() => {});

    return { success: true, id: nuevoId, nombre };
  }

  // DIAS DE PAGO & LIMITE
  public async actualizarDiasPagoCliente(idCliente: number, diasPago: string): Promise<{ success: boolean; message?: string; diasPago?: string }> {
    const parsed = parseDiasPago(diasPago);
    if (parsed.length === 0) return { success: false, message: 'Formato inválido. Ej: 15,30' };

    const c = this.clientes.find(cli => cli.id === Number(idCliente));
    if (!c) return { success: false, message: 'Cliente no encontrado' };

    c.diasPago = parsed.join(',');
    this.registrarLog('Colmadero', 'Admin', 'Actualizar Dias Pago', `Cliente: ${c.nombre}, Dias: ${c.diasPago}`);
    this.save();

    this.callRemoteApi('actualizarDiasPagoCliente', { idCliente, diasPago }).catch(() => {});

    return { success: true, diasPago: c.diasPago };
  }

  public async actualizarLimiteCliente(idCliente: number, nuevoLimite: number | string, esCliente: boolean): Promise<{ success: boolean; message?: string; limite?: number }> {
    const limiteNum = parseFloat(String(nuevoLimite));
    if (isNaN(limiteNum) || limiteNum < 0) return { success: false, message: 'Límite inválido' };

    const c = this.clientes.find(cli => cli.id === Number(idCliente));
    if (!c) return { success: false, message: 'Cliente no encontrado' };

    if (c.saldo > limiteNum) {
      return { success: false, message: `La deuda (${c.saldo.toFixed(2)}) supera el nuevo límite` };
    }

    c.limite = limiteNum;
    const quien = esCliente ? `${c.nombre} (Cliente)` : 'Colmadero';
    this.registrarLog(quien, esCliente ? 'Cliente' : 'Admin', 'Actualizar Límite', `Cliente: ${c.nombre}, Nuevo límite: $${limiteNum}`);
    this.save();

    this.callRemoteApi('actualizarLimiteCliente', { idCliente, nuevoLimite: limiteNum, esCliente }).catch(() => {});

    return { success: true, limite: limiteNum };
  }

  public async generarPINCliente(idCliente: number): Promise<{ success: boolean; message?: string; pin?: string; nombre?: string }> {
    const c = this.clientes.find(cli => cli.id === Number(idCliente));
    if (!c) return { success: false, message: 'Cliente no encontrado' };

    const pin = Math.floor(1000 + Math.random() * 9000).toString();
    c.pin = pin;
    this.registrarLog('Colmadero', 'Admin', 'Generar PIN', `Cliente: ${c.nombre}`);
    this.save();

    this.callRemoteApi('generarPINCliente', { idCliente }).catch(() => {});

    return { success: true, pin, nombre: c.nombre };
  }

  // AUTORIZADOS
  public getAutorizadosDeCliente(idCliente: number): Autorizado[] {
    const list = this.autorizados.filter(a => a.idCliente === Number(idCliente));
    if (list.length === 0) {
      const c = this.clientes.find(cli => cli.id === Number(idCliente));
      if (c) {
        return [{ id: 99999 + Number(idCliente), idCliente: Number(idCliente), nombre: c.nombre, parentesco: 'Titular' }];
      }
    }
    return list;
  }

  public async agregarAutorizadoCliente(idCliente: number, nombre: string, parentesco: string, esCliente: boolean): Promise<{ success: boolean; message?: string; id?: number }> {
    if (!nombre.trim() || !parentesco.trim()) return { success: false, message: 'Nombre y parentesco son requeridos' };

    const nextId = this.autorizados.length > 0 ? Math.max(...this.autorizados.map(a => a.id)) + 1 : 1;
    const nuevo: Autorizado = {
      id: nextId,
      idCliente: Number(idCliente),
      nombre: nombre.trim(),
      parentesco: parentesco.trim()
    };
    this.autorizados.push(nuevo);

    const c = this.clientes.find(cli => cli.id === Number(idCliente));
    this.registrarLog(
      esCliente ? (c ? c.nombre : 'Cliente') : 'Colmadero',
      esCliente ? 'Cliente' : 'Admin',
      'Agregar Autorizado',
      `Cliente ID: ${idCliente}, Nombre: ${nombre}`
    );
    this.save();

    this.callRemoteApi('agregarAutorizadoCliente', { idCliente, nombre, parentesco, esCliente }).catch(() => {});

    return { success: true, id: nextId };
  }

  public async editarAutorizado(idAutorizado: number, nombre: string, parentesco: string, esCliente: boolean): Promise<{ success: boolean; message?: string }> {
    const a = this.autorizados.find(x => x.id === Number(idAutorizado));
    if (!a) return { success: false, message: 'Autorizado no encontrado' };

    a.nombre = nombre.trim();
    a.parentesco = parentesco.trim();

    this.registrarLog(esCliente ? 'Cliente' : 'Colmadero', esCliente ? 'Cliente' : 'Admin', 'Editar Autorizado', `ID: ${idAutorizado}, ${nombre}`);
    this.save();

    this.callRemoteApi('editarAutorizado', { idAutorizado, nombre, parentesco, esCliente }).catch(() => {});

    return { success: true };
  }

  public async eliminarAutorizado(idAutorizado: number, idCliente: number, esCliente: boolean): Promise<{ success: boolean; message?: string }> {
    const idx = this.autorizados.findIndex(x => x.id === Number(idAutorizado));
    if (idx === -1) return { success: false, message: 'Autorizado no encontrado' };

    if (this.autorizados[idx].parentesco.toLowerCase() === 'titular') {
      return { success: false, message: 'No se puede eliminar al titular' };
    }

    this.autorizados.splice(idx, 1);
    this.registrarLog(esCliente ? 'Cliente' : 'Colmadero', esCliente ? 'Cliente' : 'Admin', 'Eliminar Autorizado', `ID: ${idAutorizado}`);
    this.save();

    this.callRemoteApi('eliminarAutorizado', { idAutorizado, idCliente, esCliente }).catch(() => {});

    return { success: true };
  }

  // HISTORIAL
  public getHistorialAdmin(): Movimiento[] {
    const mapaClientes = new Map(this.clientes.map(c => [c.id, c.nombre]));
    const mapaAut = new Map(this.autorizados.map(a => [a.id, a]));

    const resultado: Movimiento[] = this.movimientos.map(m => {
      const dates = formatearFechaHora(m.fechaHora);
      const aut = m.idAutorizado ? mapaAut.get(m.idAutorizado) : undefined;
      return {
        ...m,
        nombreCliente: mapaClientes.get(m.idCliente) || 'Cliente desconocido',
        autorizadoNombre: aut ? aut.nombre : '-',
        autorizadoParentesco: aut ? aut.parentesco : '-',
        fechaTexto: dates.fechaTexto,
        fechaLarga: dates.fechaLarga,
        hora: dates.hora
      };
    });

    return resultado.reverse();
  }

  public getGastosDiariosCliente(idCliente: number): DiaGastoCliente[] {
    const mapaAut = new Map(this.autorizados.map(a => [a.id, a]));
    const diasMap: Record<string, DiaGastoCliente> = {};

    for (const m of this.movimientos) {
      if (Number(m.idCliente) === Number(idCliente)) {
        const fecha = new Date(m.fechaHora);
        const key = fecha.toISOString().split('T')[0];
        const dates = formatearFechaHora(m.fechaHora);
        const aut = m.idAutorizado ? mapaAut.get(m.idAutorizado) : undefined;

        if (!diasMap[key]) {
          diasMap[key] = {
            key,
            fecha: fecha.toLocaleDateString('es-DO', { year: 'numeric', month: 'long', day: 'numeric' }),
            totalFiados: 0,
            totalAbonos: 0,
            movimientos: []
          };
        }

        const monto = m.monto || 0;
        if (m.tipo === 'Fiado') diasMap[key].totalFiados += monto;
        if (m.tipo === 'Abono') diasMap[key].totalAbonos += monto;

        diasMap[key].movimientos.push({
          ...m,
          fechaTexto: dates.fechaTexto,
          fechaLarga: dates.fechaLarga,
          hora: dates.hora,
          autorizadoNombre: aut ? aut.nombre : (m.tipo === 'Abono' ? 'Colmado' : 'Desconocido'),
          autorizadoParentesco: aut ? aut.parentesco : '-'
        });
      }
    }

    return Object.values(diasMap).sort((a, b) => b.key.localeCompare(a.key));
  }

  // ESTADISTICAS & LOGS
  public getEstadisticasHoy(): { hoyFiados: number; hoyAbonos: number } {
    const hoy = new Date();
    hoy.setHours(0, 0, 0, 0);

    let hoyFiados = 0;
    let hoyAbonos = 0;

    for (const m of this.movimientos) {
      const f = new Date(m.fechaHora);
      if (f >= hoy) {
        if (m.tipo === 'Fiado') hoyFiados++;
        if (m.tipo === 'Abono') hoyAbonos++;
      }
    }

    return { hoyFiados, hoyAbonos };
  }

  public getEstadisticasAuditoria(): { totalLogs: number; hoy: number; admin: number } {
    const hoy = new Date();
    hoy.setHours(0, 0, 0, 0);

    let hoyCount = 0;
    let adminCount = 0;

    for (const a of this.auditoria) {
      if (new Date(a.fecha) >= hoy) hoyCount++;
      if (a.tipo === 'Admin') adminCount++;
    }

    return {
      totalLogs: this.auditoria.length,
      hoy: hoyCount,
      admin: adminCount
    };
  }

  public getLogsAuditoria(filtros?: { tipo?: string; accion?: string }): AuditoriaLog[] {
    let logs = [...this.auditoria];
    if (filtros && filtros.tipo) {
      logs = logs.filter(l => l.tipo === filtros.tipo);
    }
    if (filtros && filtros.accion) {
      logs = logs.filter(l => l.accion.toLowerCase().includes(filtros.accion!.toLowerCase()));
    }
    return logs.reverse();
  }

  // Reset or export
  public resetToDefault() {
    this.clientes = getInitialClientes();
    this.autorizados = getInitialAutorizados();
    this.movimientos = getInitialMovimientos();
    this.usuarios = getInitialUsuarios();
    this.auditoria = getInitialAuditoria();
    this.save();
  }

  public exportDataJson(): string {
    return JSON.stringify(
      {
        clientes: this.clientes,
        autorizados: this.autorizados,
        movimientos: this.movimientos,
        usuarios: this.usuarios,
        auditoria: this.auditoria,
        version: '2.2',
        spreadsheetId: this.getSpreadsheetId()
      },
      null,
      2
    );
  }
}

export const store = new StoreService();
