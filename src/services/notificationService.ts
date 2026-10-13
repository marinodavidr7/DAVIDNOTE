// src/services/notificationService.ts
// Servicio de Notificaciones Push con Service Worker y registro local para Súper Colmado DAVID

export type NotificationType = 'nuevo-registro' | 'limite-credito' | 'consumo' | 'abono' | 'sistema';

export interface ColmadoNotification {
  id: string;
  tipo: NotificationType;
  titulo: string;
  cuerpo: string;
  fechaHora: string;
  leida: boolean;
  targetRol: 'admin' | 'cliente' | 'todos';
  clienteId?: number;
  monto?: number;
  url?: string;
  data?: Record<string, any>;
}

const STORAGE_KEY = 'colmado_notifications_history';

class NotificationService {
  private notifications: ColmadoNotification[] = [];
  private listeners: Set<() => void> = new Set();
  private audioCtx: AudioContext | null = null;

  constructor() {
    this.loadNotifications();
  }

  private loadNotifications() {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        this.notifications = JSON.parse(saved);
      } else {
        // Inicializar con bienvenida si no hay notificaciones
        this.notifications = [
          {
            id: 'init-1',
            tipo: 'sistema',
            titulo: '🔔 Sistema de Notificaciones Activo',
            cuerpo: 'Ahora recibirás alertas de nuevos clientes, límites de crédito alcanzados y consumos registrados.',
            fechaHora: new Date().toISOString(),
            leida: false,
            targetRol: 'todos'
          }
        ];
        this.saveNotifications();
      }
    } catch {
      this.notifications = [];
    }
  }

  private saveNotifications() {
    try {
      // Guardar máximo las últimas 50 notificaciones para no saturar memoria
      const toSave = this.notifications.slice(0, 50);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(toSave));
    } catch (e) {
      console.warn('Error saving notifications:', e);
    }
    this.notifyListeners();
  }

  public subscribe(listener: () => void): () => void {
    this.listeners.add(listener);
    return () => {
      this.listeners.delete(listener);
    };
  }

  private notifyListeners() {
    this.listeners.forEach((listener) => {
      try {
        listener();
      } catch (err) {
        console.error('Notification listener error:', err);
      }
    });
  }

  // Verificar compatibilidad del navegador
  public isPushSupported(): boolean {
    return typeof window !== 'undefined' && 'Notification' in window;
  }

  public isServiceWorkerSupported(): boolean {
    return typeof window !== 'undefined' && 'serviceWorker' in navigator;
  }

  // Obtener estado actual del permiso
  public getPermissionStatus(): NotificationPermission {
    if (!this.isPushSupported()) return 'denied';
    return Notification.permission;
  }

  // Solicitar permiso de notificaciones push al usuario
  public async requestPermission(): Promise<NotificationPermission> {
    if (!this.isPushSupported()) return 'denied';

    try {
      const permission = await Notification.requestPermission();
      this.notifyListeners();
      return permission;
    } catch (error) {
      console.error('Error requesting notification permission:', error);
      return 'denied';
    }
  }

  // Sonido suave y amigable de alerta con Web Audio API
  public playChime() {
    try {
      if (typeof window === 'undefined') return;
      const AudioContextClass = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (!AudioContextClass) return;

      if (!this.audioCtx) {
        this.audioCtx = new AudioContextClass();
      }
      if (this.audioCtx.state === 'suspended') {
        this.audioCtx.resume();
      }

      const now = this.audioCtx.currentTime;
      const osc = this.audioCtx.createOscillator();
      const gain = this.audioCtx.createGain();

      osc.type = 'sine';
      // Tono de dos notas suave: 587.33 Hz (D5) -> 880 Hz (A5)
      osc.frequency.setValueAtTime(587.33, now);
      osc.frequency.exponentialRampToValueAtTime(880, now + 0.12);

      gain.gain.setValueAtTime(0.001, now);
      gain.gain.exponentialRampToValueAtTime(0.25, now + 0.03);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.35);

      osc.connect(gain);
      gain.connect(this.audioCtx.destination);

      osc.start(now);
      osc.stop(now + 0.35);
    } catch {
      // Ignorar si el audio está bloqueado por interacción previa
    }
  }

  // Enviar notificación Push mediante Service Worker con fallback
  public async sendNotification(params: {
    tipo: NotificationType;
    titulo: string;
    cuerpo: string;
    targetRol: 'admin' | 'cliente' | 'todos';
    clienteId?: number;
    monto?: number;
    url?: string;
    tag?: string;
    data?: Record<string, any>;
  }): Promise<boolean> {
    const { tipo, titulo, cuerpo, targetRol, clienteId, monto, url = '/', tag, data } = params;

    // 1. Guardar en historial local siempre para visibilidad en la app
    const nuevaNotificacion: ColmadoNotification = {
      id: `notif-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      tipo,
      titulo,
      cuerpo,
      fechaHora: new Date().toISOString(),
      leida: false,
      targetRol,
      clienteId,
      monto,
      url,
      data
    };

    this.notifications.unshift(nuevaNotificacion);
    this.saveNotifications();

    // 2. Reproducir tono suave y vibración en el dispositivo
    this.playChime();
    if (typeof navigator !== 'undefined' && 'vibrate' in navigator) {
      try {
        navigator.vibrate([150, 75, 150]);
      } catch {
        // Ignorar si no está soportado
      }
    }

    // 3. Si no hay soporte o permiso para Push del navegador, termina aquí (ya quedó en historial)
    if (!this.isPushSupported() || Notification.permission !== 'granted') {
      return false;
    }

    // 4. Intentar mostrar notificación del navegador a través del Service Worker
    const options: any = {
      body: cuerpo,
      icon: '/pwa-192x192.png',
      badge: '/icon.svg',
      tag: tag || `colmado-${tipo}-${Date.now()}`,
      vibrate: [200, 100, 200],
      data: {
        url,
        tipo,
        clienteId,
        timestamp: Date.now()
      },
      renotify: true
    };

    try {
      if ('serviceWorker' in navigator) {
        const registration = await navigator.serviceWorker.ready;
        if (registration && 'showNotification' in registration) {
          await registration.showNotification(titulo, options);
          return true;
        }
      }
    } catch (swErr) {
      console.warn('[NotificationService] Fallback to standard Notification API:', swErr);
    }

    // 5. Fallback a constructor directo de Notification si SW aún no está listo
    try {
      const n = new Notification(titulo, options);
      n.onclick = () => {
        window.focus();
        n.close();
      };
      return true;
    } catch (e) {
      console.warn('[NotificationService] Could not trigger browser notification:', e);
      return false;
    }
  }

  // --- DISPARADORES ESPECÍFICOS SOLICITADOS ---

  // 1. Alerta al Administrador: Nuevo Cliente Registrado
  public async notifyNuevoRegistroCliente(cliente: {
    id: number;
    nombre: string;
    limite: number;
    telefono: string;
  }) {
    const limiteFormateado = cliente.limite > 0
      ? `RD$ ${cliente.limite.toLocaleString('es-DO', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
      : 'Sin límite';

    return this.sendNotification({
      tipo: 'nuevo-registro',
      titulo: '🎉 Nuevo Cliente Registrado',
      cuerpo: `${cliente.nombre} fue registrado con cupo de crédito ${limiteFormateado}. Tel: ${cliente.telefono}`,
      targetRol: 'admin',
      clienteId: cliente.id,
      tag: `nuevo-cliente-${cliente.id}`,
      url: '/#admin-clientes'
    });
  }

  // Alerta al Administrador: Nuevo Autorizado añadido
  public async notifyNuevoAutorizado(clienteNombre: string, autorizadoNombre: string, parentesco: string, clienteId?: number) {
    return this.sendNotification({
      tipo: 'nuevo-registro',
      titulo: '👤 Nuevo Autorizado Añadido',
      cuerpo: `${autorizadoNombre} (${parentesco}) fue registrado como autorizado a fiar para ${clienteNombre}.`,
      targetRol: 'admin',
      clienteId,
      tag: `nuevo-aut-${Date.now()}`,
      url: '/#admin-clientes'
    });
  }

  // 2. Alerta al Administrador (y cliente): Cliente alcanza o supera su límite de crédito
  public async notifyLimiteCreditoAlcanzado(info: {
    clienteId?: number;
    clienteNombre: string;
    saldo: number;
    limite: number;
    montoIntentado?: number;
    bloqueado?: boolean;
  }) {
    const saldoFormateado = `RD$ ${info.saldo.toLocaleString('es-DO', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
    const limiteFormateado = `RD$ ${info.limite.toLocaleString('es-DO', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

    let mensaje = `${info.clienteNombre} ha alcanzado su límite de crédito de ${limiteFormateado} (Deuda actual: ${saldoFormateado}).`;
    if (info.bloqueado && info.montoIntentado) {
      const intentoFormateado = `RD$ ${info.montoIntentado.toLocaleString('es-DO', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
      mensaje = `Se intentó fiar ${intentoFormateado} a ${info.clienteNombre}, pero superaría su límite de ${limiteFormateado} (Deuda actual: ${saldoFormateado}).`;
    }

    return this.sendNotification({
      tipo: 'limite-credito',
      titulo: info.bloqueado ? '🚫 Fiado Bloqueado: Límite Superado' : '⚠️ Límite de Crédito Alcanzado',
      cuerpo: mensaje,
      targetRol: 'todos',
      clienteId: info.clienteId,
      monto: info.saldo,
      tag: `limite-${info.clienteNombre}-${Date.now()}`,
      url: '/#admin-clientes'
    });
  }

  // 3. Alerta al Cliente: Cuando se realiza un consumo (fiado)
  public async notifyConsumoCliente(info: {
    clienteId: number;
    clienteNombre: string;
    monto: number;
    quienCompro: string;
    nuevoSaldo: number;
    limite: number;
  }) {
    const montoFormateado = `RD$ ${info.monto.toLocaleString('es-DO', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
    const nuevoSaldoFormateado = `RD$ ${info.nuevoSaldo.toLocaleString('es-DO', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
    const disponible = info.limite > 0 ? Math.max(0, info.limite - info.nuevoSaldo) : null;
    const disponibleTexto = disponible !== null
      ? ` • Cupo disponible: RD$ ${disponible.toLocaleString('es-DO', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
      : '';

    const quien = info.quienCompro && info.quienCompro !== info.clienteNombre
      ? `por ${info.quienCompro}`
      : 'en tu cuenta';

    return this.sendNotification({
      tipo: 'consumo',
      titulo: '🛍️ Nuevo Consumo Registrado',
      cuerpo: `Se anotó una compra de ${montoFormateado} ${quien}. Tu saldo pendiente actual es ${nuevoSaldoFormateado}${disponibleTexto}. ¡Gracias por preferirnos!`,
      targetRol: 'todos',
      clienteId: info.clienteId,
      monto: info.monto,
      tag: `consumo-${info.clienteId}-${Date.now()}`,
      url: '/#client-dashboard'
    });
  }

  // Alerta al Cliente: Cuando realiza un abono/pago
  public async notifyAbonoCliente(info: {
    clienteId: number;
    clienteNombre: string;
    monto: number;
    nuevoSaldo: number;
  }) {
    const montoFormateado = `RD$ ${info.monto.toLocaleString('es-DO', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
    const nuevoSaldoFormateado = `RD$ ${info.nuevoSaldo.toLocaleString('es-DO', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

    return this.sendNotification({
      tipo: 'abono',
      titulo: '💵 Abono Recibido',
      cuerpo: `Se acreditó tu pago de ${montoFormateado}. Tu saldo pendiente restante es ${nuevoSaldoFormateado}. ¡Muchas gracias!`,
      targetRol: 'todos',
      clienteId: info.clienteId,
      monto: info.monto,
      tag: `abono-${info.clienteId}-${Date.now()}`,
      url: '/#client-dashboard'
    });
  }

  // Notificación de prueba para verificar funcionamiento
  public async testNotification(rol: 'admin' | 'cliente' = 'admin') {
    if (rol === 'admin') {
      return this.sendNotification({
        tipo: 'sistema',
        titulo: '🔔 Prueba de Notificación Push Admin',
        cuerpo: '¡Las notificaciones del Service Worker están configuradas y funcionando perfectamente en Súper Colmado DAVID!',
        targetRol: 'admin',
        tag: `test-admin-${Date.now()}`
      });
    } else {
      return this.sendNotification({
        tipo: 'consumo',
        titulo: '🛍️ Prueba de Notificación a Cliente',
        cuerpo: 'Ejemplo de alerta: Se anotó una compra de RD$ 250.00 en tu cuenta de fiado. Saldo actual: RD$ 1,250.00.',
        targetRol: 'cliente',
        tag: `test-cliente-${Date.now()}`
      });
    }
  }

  // GESTIÓN DEL HISTORIAL EN PANTALLA

  public getNotifications(rol?: 'admin' | 'cliente', clienteId?: number): ColmadoNotification[] {
    let list = [...this.notifications];
    if (rol === 'admin') {
      list = list.filter((n) => n.targetRol === 'admin' || n.targetRol === 'todos');
    } else if (rol === 'cliente') {
      list = list.filter((n) => {
        if (n.targetRol === 'admin') return false;
        if (clienteId && n.clienteId && n.clienteId !== clienteId) return false;
        return true;
      });
    }
    return list;
  }

  public getUnreadCount(rol?: 'admin' | 'cliente', clienteId?: number): number {
    return this.getNotifications(rol, clienteId).filter((n) => !n.leida).length;
  }

  public markAsRead(id: string) {
    const item = this.notifications.find((n) => n.id === id);
    if (item) {
      item.leida = true;
      this.saveNotifications();
    }
  }

  public markAllAsRead(rol?: 'admin' | 'cliente', clienteId?: number) {
    const visible = this.getNotifications(rol, clienteId);
    visible.forEach((v) => {
      v.leida = true;
    });
    this.saveNotifications();
  }

  public clearNotifications() {
    this.notifications = [];
    this.saveNotifications();
  }
}

export const notificationService = new NotificationService();
