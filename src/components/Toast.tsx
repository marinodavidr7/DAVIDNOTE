import React from 'react';
import { CheckCircle, AlertTriangle, AlertCircle, Info, X } from 'lucide-react';

export interface ToastMessage {
  id: string;
  title: string;
  message: string;
  type: 'success' | 'error' | 'warning' | 'info';
}

interface ToastContainerProps {
  toasts: ToastMessage[];
  onDismiss: (id: string) => void;
}

export const ToastContainer: React.FC<ToastContainerProps> = ({ toasts, onDismiss }) => {
  if (toasts.length === 0) return null;

  return (
    <div className="fixed top-4 left-1/2 -translate-x-1/2 z-50 flex flex-col gap-2 w-[calc(100%-2rem)] max-w-md pointer-events-none">
      {toasts.map(toast => {
        let borderClass = 'border-l-blue-600';
        let bgIcon = 'bg-blue-100 text-blue-600';
        let Icon = Info;

        if (toast.type === 'success') {
          borderClass = 'border-l-emerald-600';
          bgIcon = 'bg-emerald-100 text-emerald-600';
          Icon = CheckCircle;
        } else if (toast.type === 'error') {
          borderClass = 'border-l-red-600';
          bgIcon = 'bg-red-100 text-red-600';
          Icon = AlertCircle;
        } else if (toast.type === 'warning') {
          borderClass = 'border-l-amber-600';
          bgIcon = 'bg-amber-100 text-amber-600';
          Icon = AlertTriangle;
        }

        return (
          <div
            key={toast.id}
            className={`pointer-events-auto bg-white rounded-2xl p-4 shadow-xl border-l-4 ${borderClass} flex items-start gap-3 animate-in fade-in slide-in-from-top-3 duration-200`}
          >
            <div className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${bgIcon}`}>
              <Icon className="w-5 h-5" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="font-bold text-sm text-slate-800 leading-tight">{toast.title}</div>
              {toast.message && <div className="text-xs text-slate-500 mt-0.5 leading-relaxed">{toast.message}</div>}
            </div>
            <button
              onClick={() => onDismiss(toast.id)}
              className="text-slate-400 hover:text-slate-600 p-1 shrink-0 transition"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        );
      })}
    </div>
  );
};
