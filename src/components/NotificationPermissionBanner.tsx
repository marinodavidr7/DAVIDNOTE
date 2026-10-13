import React, { useState, useEffect } from 'react';
import { Bell, X, CheckCircle2, Shield } from 'lucide-react';
import { notificationService } from '../services/notificationService';

interface NotificationPermissionBannerProps {
  rol: 'admin' | 'cliente';
  onActivated?: () => void;
}

export const NotificationPermissionBanner: React.FC<NotificationPermissionBannerProps> = ({
  rol,
  onActivated
}) => {
  const [show, setShow] = useState(false);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    // Verificar si el navegador soporta notificaciones y si no se ha solicitado aún
    if (!notificationService.isPushSupported()) return;

    const dismissed = sessionStorage.getItem(`colmado_notif_banner_dismissed_${rol}`);
    if (dismissed === 'true') return;

    const perm = notificationService.getPermissionStatus();
    if (perm === 'default') {
      setShow(true);
    }
  }, [rol]);

  if (!show) return null;

  const handleEnable = async () => {
    const res = await notificationService.requestPermission();
    if (res === 'granted') {
      setSuccess(true);
      await notificationService.testNotification(rol);
      if (onActivated) onActivated();
      setTimeout(() => {
        setShow(false);
      }, 3000);
    } else {
      setShow(false);
    }
  };

  const handleDismiss = () => {
    sessionStorage.setItem(`colmado_notif_banner_dismissed_${rol}`, 'true');
    setShow(false);
  };

  return (
    <div className="mb-4 p-3.5 sm:p-4 rounded-2xl bg-gradient-to-r from-blue-950/80 via-slate-900 to-indigo-950/80 border border-blue-500/30 shadow-lg relative overflow-hidden animate-in fade-in slide-in-from-top-2 duration-300">
      <div className="flex items-start sm:items-center justify-between gap-3">
        <div className="flex items-start sm:items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-blue-600/30 border border-blue-500/40 flex items-center justify-center text-blue-400 shrink-0">
            <Bell className="w-5 h-5 animate-bounce" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-sm font-bold text-white">
                {rol === 'admin'
                  ? 'Activar Notificaciones Push del Colmado'
                  : 'Recibe Alertas de tus Consumos al Instante'}
              </span>
              <span className="px-2 py-0.5 text-[10px] font-bold rounded-full bg-blue-600/30 text-blue-300 border border-blue-500/30">
                Service Worker
              </span>
            </div>
            <p className="text-xs text-slate-300 mt-0.5 leading-relaxed">
              {rol === 'admin'
                ? 'Recibe alertas del navegador sobre nuevos clientes registrados, límites de crédito alcanzados y fiados.'
                : 'Te avisaremos en tu teléfono cada vez que se anote un fiado o se registre un abono en tu cuenta.'}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={handleEnable}
            className="px-3.5 py-1.5 bg-blue-600 hover:bg-blue-500 text-white font-semibold text-xs rounded-xl shadow-md transition flex items-center gap-1.5"
          >
            <Shield className="w-3.5 h-3.5" />
            Activar
          </button>
          <button
            onClick={handleDismiss}
            className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition"
            title="Descartar por ahora"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>

      {success && (
        <div className="mt-2.5 pt-2 border-t border-blue-500/20 text-xs text-emerald-400 flex items-center gap-1.5 font-medium">
          <CheckCircle2 className="w-4 h-4" />
          ¡Notificaciones push activadas! Te enviamos una alerta de confirmación.
        </div>
      )}
    </div>
  );
};
