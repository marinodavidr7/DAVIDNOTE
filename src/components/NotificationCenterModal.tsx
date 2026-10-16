import React, { useState, useEffect } from 'react';
import {
  Bell,
  X,
  CheckCheck,
  Trash2,
  AlertTriangle,
  UserPlus,
  ShoppingBag,
  DollarSign,
  Info,
  CheckCircle2,
  Send,
  ShieldCheck,
  ShieldAlert,
  Smartphone
} from 'lucide-react';
import {
  notificationService,
  ColmadoNotification,
  NotificationType
} from '../services/notificationService';

interface NotificationCenterModalProps {
  isOpen: boolean;
  onClose: () => void;
  rol: 'admin' | 'cliente';
  clienteId?: number;
  onSelectNotification?: (notification: ColmadoNotification) => void;
}

export const NotificationCenterModal: React.FC<NotificationCenterModalProps> = ({
  isOpen,
  onClose,
  rol,
  clienteId,
  onSelectNotification
}) => {
  const [notifications, setNotifications] = useState<ColmadoNotification[]>([]);
  const [permission, setPermission] = useState<NotificationPermission>('default');
  const [filter, setFilter] = useState<string>('todos');
  const [testing, setTesting] = useState(false);
  const [testSuccess, setTestSuccess] = useState(false);

  useEffect(() => {
    if (!isOpen) return;

    const updateState = () => {
      setNotifications(notificationService.getNotifications(rol, clienteId));
      setPermission(notificationService.getPermissionStatus());
    };

    updateState();
    const unsubscribe = notificationService.subscribe(updateState);
    return () => unsubscribe();
  }, [isOpen, rol, clienteId]);

  if (!isOpen) return null;

  const handleRequestPermission = async () => {
    const res = await notificationService.requestPermission();
    setPermission(res);
    if (res === 'granted') {
      await notificationService.testNotification(rol);
      setTestSuccess(true);
      setTimeout(() => setTestSuccess(false), 4000);
    }
  };


  const handleMarkAllRead = () => {
    notificationService.markAllAsRead(rol, clienteId);
  };

  const handleClear = () => {
    if (window.confirm('¿Deseas vaciar el historial de notificaciones?')) {
      notificationService.clearNotifications();
    }
  };

  const handleItemClick = (notif: ColmadoNotification) => {
    notificationService.markAsRead(notif.id);
    if (onSelectNotification) {
      onSelectNotification(notif);
    }
  };

  const filteredList = notifications.filter((n) => {
    if (filter === 'todos') return true;
    if (filter === 'limite') return n.tipo === 'limite-credito';
    if (filter === 'registro') return n.tipo === 'nuevo-registro';
    if (filter === 'consumo') return n.tipo === 'consumo';
    if (filter === 'abono') return n.tipo === 'abono';
    return true;
  });

  const getIconForType = (tipo: NotificationType) => {
    switch (tipo) {
      case 'limite-credito':
        return <AlertTriangle className="w-5 h-5 text-red-400" />;
      case 'nuevo-registro':
        return <UserPlus className="w-5 h-5 text-blue-400" />;
      case 'consumo':
        return <ShoppingBag className="w-5 h-5 text-amber-400" />;
      case 'abono':
        return <DollarSign className="w-5 h-5 text-emerald-400" />;
      default:
        return <Bell className="w-5 h-5 text-indigo-400" />;
    }
  };

  const getBadgeColorForType = (tipo: NotificationType) => {
    switch (tipo) {
      case 'limite-credito':
        return 'bg-red-500/20 text-red-300 border-red-500/30';
      case 'nuevo-registro':
        return 'bg-blue-500/20 text-blue-300 border-blue-500/30';
      case 'consumo':
        return 'bg-amber-500/20 text-amber-300 border-amber-500/30';
      case 'abono':
        return 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30';
      default:
        return 'bg-indigo-500/20 text-indigo-300 border-indigo-500/30';
    }
  };

  const formatFechaRelativa = (isoString: string) => {
    try {
      const date = new Date(isoString);
      const now = new Date();
      const diffMs = now.getTime() - date.getTime();
      const diffSecs = Math.floor(diffMs / 1000);
      const diffMins = Math.floor(diffSecs / 60);
      const diffHours = Math.floor(diffMins / 60);
      const diffDays = Math.floor(diffHours / 24);

      if (diffSecs < 60) return 'Hace unos momentos';
      if (diffMins < 60) return `Hace ${diffMins} min`;
      if (diffHours < 24) return `Hace ${diffHours} h`;
      if (diffDays === 1) return 'Ayer';
      return date.toLocaleDateString('es-DO', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' });
    } catch {
      return '';
    }
  };

  const unreadCount = notifications.filter((n) => !n.leida).length;

  return (
    <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-end sm:items-center justify-center p-0 sm:p-4">
      <div className="bg-slate-900 border border-slate-800 rounded-t-3xl sm:rounded-2xl max-w-lg w-full max-h-[92vh] flex flex-col shadow-2xl overflow-hidden animate-in fade-in slide-in-from-bottom duration-200">
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-slate-800 flex items-center justify-between bg-slate-900/95 sticky top-0 z-10">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-600/20 border border-blue-500/30 flex items-center justify-center text-blue-400">
              <Bell className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-lg font-bold text-white">Centro de Notificaciones</h3>
                {unreadCount > 0 && (
                  <span className="px-2 py-0.5 text-xs font-bold rounded-full bg-blue-600 text-white">
                    {unreadCount} nuevas
                  </span>
                )}
              </div>
              <p className="text-xs text-slate-400">
                Push Notifications Service Worker API
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Browser Permission Banner */}
        <div className="p-4 bg-slate-950/60 border-b border-slate-800/80">
          {permission === 'granted' ? (
            <div className="flex items-center justify-between gap-3 p-3 rounded-xl bg-emerald-950/30 border border-emerald-500/30">
              <div className="flex items-center gap-2.5">
                <ShieldCheck className="w-5 h-5 text-emerald-400 shrink-0" />
                <div>
                  <div className="text-xs font-semibold text-emerald-300">
                    Notificaciones Push Activas en Navegador
                  </div>
                  <div className="text-[11px] text-emerald-400/80">
                    Recibirás alertas de tus consumos y operaciones en tu dispositivo
                  </div>
                </div>
              </div>
              <span className="px-2.5 py-1 text-[11px] font-bold rounded-lg bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 shrink-0">
                Activo
              </span>
            </div>
          ) : permission === 'denied' ? (
            <div className="flex items-start gap-2.5 p-3 rounded-xl bg-amber-950/30 border border-amber-500/30 text-amber-300 text-xs">
              <ShieldAlert className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
              <div>
                <span className="font-semibold text-amber-200">Notificaciones bloqueadas por el navegador: </span>
                Para recibir avisos push en tu pantalla, permite las notificaciones en el candado o configuración del navegador.
              </div>
            </div>
          ) : (
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 p-3.5 rounded-xl bg-blue-950/40 border border-blue-500/40">
              <div className="flex items-center gap-2.5">
                <Smartphone className="w-5 h-5 text-blue-400 shrink-0" />
                <div>
                  <div className="text-xs font-semibold text-blue-200">
                    Activar Notificaciones Push del Navegador
                  </div>
                  <div className="text-[11px] text-blue-300/80">
                    Alerta instantánea sobre nuevos registros, límites y consumos
                  </div>
                </div>
              </div>
              <button
                onClick={handleRequestPermission}
                className="w-full sm:w-auto px-3.5 py-1.5 bg-blue-600 hover:bg-blue-500 text-white font-semibold text-xs rounded-lg shadow-sm transition flex items-center justify-center gap-1.5 shrink-0"
              >
                <Bell className="w-3.5 h-3.5" />
                Permitir Ahora
              </button>
            </div>
          )}

          {testSuccess && (
            <div className="mt-2 text-xs text-emerald-400 flex items-center gap-1.5 animate-in fade-in">
              <CheckCircle2 className="w-3.5 h-3.5" />
              ¡Notificación push emitida exitosamente a través del Service Worker!
            </div>
          )}
        </div>

        {/* Filter Chips & Action Buttons */}
        <div className="px-4 py-2.5 border-b border-slate-800 flex items-center justify-between gap-2 overflow-x-auto no-scrollbar">
          <div className="flex items-center gap-1.5 shrink-0">
            <button
              onClick={() => setFilter('todos')}
              className={`px-2.5 py-1 text-xs rounded-lg transition font-medium ${
                filter === 'todos'
                  ? 'bg-blue-600 text-white'
                  : 'bg-slate-800 text-slate-400 hover:text-white'
              }`}
            >
              Todas ({notifications.length})
            </button>
            <button
              onClick={() => setFilter('limite')}
              className={`px-2.5 py-1 text-xs rounded-lg transition font-medium flex items-center gap-1 ${
                filter === 'limite'
                  ? 'bg-red-600 text-white'
                  : 'bg-slate-800 text-slate-400 hover:text-white'
              }`}
            >
              <AlertTriangle className="w-3 h-3 text-red-400" />
              Límites
            </button>
            <button
              onClick={() => setFilter('registro')}
              className={`px-2.5 py-1 text-xs rounded-lg transition font-medium flex items-center gap-1 ${
                filter === 'registro'
                  ? 'bg-blue-600 text-white'
                  : 'bg-slate-800 text-slate-400 hover:text-white'
              }`}
            >
              <UserPlus className="w-3 h-3 text-blue-400" />
              Registros
            </button>
            <button
              onClick={() => setFilter('consumo')}
              className={`px-2.5 py-1 text-xs rounded-lg transition font-medium flex items-center gap-1 ${
                filter === 'consumo'
                  ? 'bg-amber-600 text-white'
                  : 'bg-slate-800 text-slate-400 hover:text-white'
              }`}
            >
              <ShoppingBag className="w-3 h-3 text-amber-400" />
              Consumos
            </button>
          </div>

          <div className="flex items-center gap-1 shrink-0">
            {unreadCount > 0 && (
              <button
                onClick={handleMarkAllRead}
                title="Marcar todas como leídas"
                className="p-1.5 text-slate-400 hover:text-emerald-400 rounded-lg hover:bg-slate-800 transition text-xs flex items-center gap-1"
              >
                <CheckCheck className="w-4 h-4" />
              </button>
            )}
            {notifications.length > 0 && (
              <button
                onClick={handleClear}
                title="Vaciar notificaciones"
                className="p-1.5 text-slate-400 hover:text-red-400 rounded-lg hover:bg-slate-800 transition"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>

        {/* Notification List */}
        <div className="flex-1 overflow-y-auto divide-y divide-slate-800/60 p-2 space-y-1.5 min-h-[220px]">
          {filteredList.length === 0 ? (
            <div className="py-12 px-4 text-center">
              <div className="w-12 h-12 rounded-full bg-slate-800/80 border border-slate-700 flex items-center justify-center text-slate-500 mx-auto mb-3">
                <Info className="w-6 h-6" />
              </div>
              <p className="text-sm font-semibold text-slate-300">No hay notificaciones aquí</p>
              <p className="text-xs text-slate-500 mt-1 max-w-xs mx-auto">
                Las alertas sobre nuevos clientes, límites superados y consumos aparecerán en este lugar.
              </p>

            </div>
          ) : (
            filteredList.map((notif) => (
              <div
                key={notif.id}
                onClick={() => handleItemClick(notif)}
                className={`p-3 rounded-xl border transition cursor-pointer flex items-start gap-3 ${
                  notif.leida
                    ? 'bg-slate-900/60 border-slate-800/80 opacity-80 hover:opacity-100 hover:bg-slate-800/40'
                    : 'bg-slate-800/50 border-blue-500/30 hover:bg-slate-800 shadow-sm'
                }`}
              >
                <div className="p-2 rounded-lg bg-slate-800 border border-slate-700/60 shrink-0 mt-0.5">
                  {getIconForType(notif.tipo)}
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-2 mb-1">
                    <span className="font-semibold text-sm text-white truncate flex items-center gap-1.5">
                      {!notif.leida && (
                        <span className="w-2 h-2 rounded-full bg-blue-500 shrink-0 animate-pulse" />
                      )}
                      {notif.titulo}
                    </span>
                    <span className="text-[11px] text-slate-400 shrink-0 font-medium">
                      {formatFechaRelativa(notif.fechaHora)}
                    </span>
                  </div>

                  <p className="text-xs text-slate-300 leading-relaxed break-words">
                    {notif.cuerpo}
                  </p>

                  <div className="mt-2 flex items-center gap-2">
                    <span className={`px-2 py-0.5 text-[10px] font-semibold rounded-md border ${getBadgeColorForType(notif.tipo)}`}>
                      {notif.tipo === 'limite-credito' && 'Límite de Crédito'}
                      {notif.tipo === 'nuevo-registro' && 'Nuevo Registro'}
                      {notif.tipo === 'consumo' && 'Consumo'}
                      {notif.tipo === 'abono' && 'Abono'}
                      {notif.tipo === 'sistema' && 'Sistema'}
                    </span>
                    {notif.monto !== undefined && notif.monto > 0 && (
                      <span className="text-[11px] font-bold text-slate-300">
                        RD$ {notif.monto.toLocaleString('es-DO', { minimumFractionDigits: 2 })}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Footer */}
        <div className="p-3 border-t border-slate-800 bg-slate-950/80 flex items-center justify-between text-xs text-slate-400">
          <span className="flex items-center gap-1.5 text-[11px]">
            <Smartphone className="w-3.5 h-3.5 text-blue-400" />
            Alertas sincronizadas vía Service Worker
          </span>
          <button
            onClick={onClose}
            className="px-4 py-1.5 bg-slate-800 hover:bg-slate-700 text-white rounded-lg font-medium transition"
          >
            Cerrar
          </button>
        </div>
      </div>
    </div>
  );
};
