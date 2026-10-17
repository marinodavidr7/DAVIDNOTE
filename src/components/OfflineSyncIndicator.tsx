import React from 'react';
import { CloudOff, RefreshCw } from 'lucide-react';

interface OfflineSyncIndicatorProps {
  isOnline: boolean;
  pendingCount: number;
  onForceSync?: () => void;
}

export const OfflineSyncIndicator: React.FC<OfflineSyncIndicatorProps> = ({ isOnline, pendingCount, onForceSync }) => {
  if (isOnline && pendingCount === 0) return null;

  const offline = !isOnline;

  return (
    <div
      className="fixed inset-x-0 bottom-24 md:bottom-6 z-[70] flex justify-center px-4 pointer-events-none"
      role="status"
      aria-live="polite"
    >
      <div
        className={`pointer-events-auto flex items-center gap-2.5 rounded-full pl-3 pr-2 py-1.5 border shadow-lg backdrop-blur-md text-xs font-bold max-w-full animate-in slide-in-from-bottom-2 fade-in duration-200 ${
          offline
            ? 'bg-amber-600/95 border-amber-400/50 text-white'
            : 'bg-blue-700/95 border-blue-400/50 text-white'
        }`}
      >
        <span
          className={`w-6 h-6 rounded-full flex items-center justify-center shrink-0 ${
            offline ? 'bg-black/20' : 'bg-white/15'
          }`}
        >
          {offline ? (
            <CloudOff className="w-3.5 h-3.5 text-amber-100" />
          ) : (
            <RefreshCw className="w-3.5 h-3.5 animate-spin text-blue-100" />
          )}
        </span>

        <span className="truncate leading-tight">
          {offline ? 'Sin conexión' : 'Sincronizando…'}
        </span>

        {pendingCount > 0 && (
          <span
            className={`shrink-0 min-w-[20px] h-5 px-1.5 rounded-full text-[11px] font-black flex items-center justify-center ${
              offline ? 'bg-black/25' : 'bg-white/20'
            }`}
            title={offline ? `${pendingCount} en cola` : `${pendingCount} pendientes de sincronizar`}
          >
            {pendingCount}
          </span>
        )}

        {onForceSync && pendingCount > 0 && !offline && (
          <button
            type="button"
            onClick={onForceSync}
            className="shrink-0 flex items-center gap-1 bg-white/20 hover:bg-white/30 text-white px-2.5 py-1 rounded-full text-[11px] font-extrabold transition"
          >
            <RefreshCw className="w-3 h-3" />
            Sincronizar
          </button>
        )}
      </div>
    </div>
  );
};

export default OfflineSyncIndicator;
