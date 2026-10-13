import React, { useState, useEffect } from 'react';
import { Bell } from 'lucide-react';
import { notificationService } from '../services/notificationService';

interface NotificationBellButtonProps {
  rol: 'admin' | 'cliente';
  clienteId?: number;
  onClick: () => void;
  className?: string;
}

export const NotificationBellButton: React.FC<NotificationBellButtonProps> = ({
  rol,
  clienteId,
  onClick,
  className = ''
}) => {
  const [unreadCount, setUnreadCount] = useState(0);
  const [hasPermission, setHasPermission] = useState(false);

  useEffect(() => {
    const update = () => {
      setUnreadCount(notificationService.getUnreadCount(rol, clienteId));
      setHasPermission(notificationService.getPermissionStatus() === 'granted');
    };

    update();
    const unsub = notificationService.subscribe(update);
    return () => unsub();
  }, [rol, clienteId]);

  return (
    <button
      onClick={onClick}
      title={unreadCount > 0 ? `${unreadCount} notificaciones pendientes` : 'Centro de notificaciones'}
      className={`relative p-2.5 rounded-xl transition border flex items-center justify-center ${
        unreadCount > 0
          ? 'bg-blue-600/20 hover:bg-blue-600/30 text-blue-400 border-blue-500/40'
          : 'bg-slate-800/80 hover:bg-slate-700/80 text-slate-300 border-slate-700/60 hover:text-white'
      } ${className}`}
    >
      <Bell className="w-5 h-5" />

      {/* Unread Counter Badge */}
      {unreadCount > 0 ? (
        <span className="absolute -top-1 -right-1 min-w-[18px] h-[18px] px-1 bg-red-600 text-white text-[10px] font-black rounded-full flex items-center justify-center shadow-lg border-2 border-slate-900 animate-pulse">
          {unreadCount > 9 ? '9+' : unreadCount}
        </span>
      ) : !hasPermission ? (
        /* Dot indicating permission can be enabled */
        <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-amber-400 rounded-full border border-slate-900" />
      ) : null}
    </button>
  );
};
