import React, { useState } from 'react';
import { Calendar, X, RotateCcw, ChevronDown, Check } from 'lucide-react';

export interface DateRange {
  startDate: string; // YYYY-MM-DD or ''
  endDate: string;   // YYYY-MM-DD or ''
}

interface DateRangePickerProps {
  range: DateRange;
  onChange: (range: DateRange) => void;
  className?: string;
  totalFilteredCount?: number;
  totalUnfilteredCount?: number;
}

export const DateRangePicker: React.FC<DateRangePickerProps> = ({
  range,
  onChange,
  className = '',
  totalFilteredCount,
  totalUnfilteredCount,
}) => {
  const [isExpanded, setIsExpanded] = useState(false);

  const hasFilter = Boolean(range.startDate || range.endDate);

  const getTodayStr = () => {
    const now = new Date();
    return now.toISOString().slice(0, 10);
  };

  const setPreset = (type: 'hoy' | 'ayer' | 'semana' | 'quincena' | 'mes' | 'mes_anterior') => {
    const today = new Date();
    const pad = (n: number) => String(n).padStart(2, '0');
    const toYMD = (d: Date) => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;

    let start = '';
    let end = toYMD(today);

    if (type === 'hoy') {
      start = toYMD(today);
      end = toYMD(today);
    } else if (type === 'ayer') {
      const yesterday = new Date();
      yesterday.setDate(today.getDate() - 1);
      start = toYMD(yesterday);
      end = toYMD(yesterday);
    } else if (type === 'semana') {
      const day = today.getDay(); // 0 is Sunday
      const diffToMonday = (day + 6) % 7;
      const monday = new Date(today);
      monday.setDate(today.getDate() - diffToMonday);
      start = toYMD(monday);
      end = toYMD(today);
    } else if (type === 'quincena') {
      const day = today.getDate();
      if (day <= 15) {
        start = `${today.getFullYear()}-${pad(today.getMonth() + 1)}-01`;
        end = `${today.getFullYear()}-${pad(today.getMonth() + 1)}-15`;
      } else {
        start = `${today.getFullYear()}-${pad(today.getMonth() + 1)}-16`;
        const lastDay = new Date(today.getFullYear(), today.getMonth() + 1, 0).getDate();
        end = `${today.getFullYear()}-${pad(today.getMonth() + 1)}-${pad(lastDay)}`;
      }
    } else if (type === 'mes') {
      start = `${today.getFullYear()}-${pad(today.getMonth() + 1)}-01`;
      end = toYMD(today);
    } else if (type === 'mes_anterior') {
      const prevMonth = new Date(today.getFullYear(), today.getMonth() - 1, 1);
      const lastDayPrev = new Date(today.getFullYear(), today.getMonth(), 0).getDate();
      start = `${prevMonth.getFullYear()}-${pad(prevMonth.getMonth() + 1)}-01`;
      end = `${prevMonth.getFullYear()}-${pad(prevMonth.getMonth() + 1)}-${pad(lastDayPrev)}`;
    }

    onChange({ startDate: start, endDate: end });
  };

  const handleClear = () => {
    onChange({ startDate: '', endDate: '' });
  };

  const formatDisplayRange = () => {
    if (!range.startDate && !range.endDate) return 'Todo el tiempo (sin filtro de fecha)';
    if (range.startDate && range.endDate) {
      if (range.startDate === range.endDate) {
        return `Fecha: ${range.startDate}`;
      }
      return `${range.startDate} al ${range.endDate}`;
    }
    if (range.startDate) return `Desde: ${range.startDate}`;
    return `Hasta: ${range.endDate}`;
  };

  return (
    <div className={`bg-white rounded-2xl border ${hasFilter ? 'border-blue-400/80 shadow-xs ring-1 ring-blue-300/40' : 'border-slate-200'} transition-all ${className}`}>
      {/* Header bar / Toggle */}
      <div className="p-2.5 sm:p-3 flex items-center justify-between gap-2 flex-wrap">
        <button
          type="button"
          onClick={() => setIsExpanded(!isExpanded)}
          className="flex items-center gap-2 text-left group min-w-0"
        >
          <div className={`w-8 h-8 rounded-xl flex items-center justify-center transition shrink-0 ${
            hasFilter ? 'bg-blue-600 text-white shadow-2xs' : 'bg-slate-100 text-slate-600 group-hover:bg-slate-200'
          }`}>
            <Calendar className="w-4 h-4" />
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-1.5 flex-wrap">
              <span className="text-[11px] font-black uppercase tracking-wider text-slate-700">
                Filtro por Fechas
              </span>
              {hasFilter && (
                <span className="text-[9px] bg-blue-100 text-blue-700 font-extrabold px-1.5 py-0.5 rounded-md">
                  Activo
                </span>
              )}
            </div>
            <p className="text-xs font-semibold text-slate-800 truncate">
              {formatDisplayRange()}
            </p>
          </div>
        </button>

        <div className="flex items-center gap-1.5 shrink-0">
          {hasFilter && (
            <button
              type="button"
              onClick={handleClear}
              className="text-xs font-bold text-red-600 hover:text-red-700 bg-red-50 hover:bg-red-100 px-2 py-1 rounded-lg flex items-center gap-1 transition"
              title="Quitar filtro de fechas"
            >
              <RotateCcw className="w-3 h-3" />
              <span>Limpiar</span>
            </button>
          )}

          <button
            type="button"
            onClick={() => setIsExpanded(!isExpanded)}
            className="p-1 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100 transition"
            title={isExpanded ? 'Ocultar selector' : 'Mostrar selector de rango'}
          >
            <ChevronDown className={`w-4 h-4 transition-transform ${isExpanded ? 'rotate-180 text-blue-600' : ''}`} />
          </button>
        </div>
      </div>

      {/* Expanded controls */}
      {isExpanded && (
        <div className="px-3 pb-3 pt-1 border-t border-slate-100 space-y-2.5 animate-in fade-in duration-150">
          {/* Quick preset buttons */}
          <div>
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1.5">
              Accesos rápidos:
            </span>
            <div className="flex flex-wrap gap-1">
              {[
                { id: 'hoy', label: 'Hoy' },
                { id: 'ayer', label: 'Ayer' },
                { id: 'semana', label: 'Esta Semana' },
                { id: 'quincena', label: 'Quincena Actual' },
                { id: 'mes', label: 'Este Mes' },
                { id: 'mes_anterior', label: 'Mes Anterior' },
              ].map(preset => (
                <button
                  key={preset.id}
                  type="button"
                  onClick={() => setPreset(preset.id as any)}
                  className="px-2 py-1 text-[11px] font-bold rounded-lg bg-slate-100 hover:bg-blue-50 text-slate-700 hover:text-blue-700 transition"
                >
                  {preset.label}
                </button>
              ))}
            </div>
          </div>

          {/* Date inputs: Desde - Hasta */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1">
            <div>
              <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-1">
                Desde (Inicio):
              </label>
              <input
                type="date"
                value={range.startDate}
                onChange={e => onChange({ ...range, startDate: e.target.value })}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-2.5 py-1.5 text-xs font-bold text-slate-800 focus:outline-hidden focus:bg-white focus:border-blue-600 focus:ring-1 focus:ring-blue-600 transition"
              />
            </div>

            <div>
              <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-1">
                Hasta (Fin):
              </label>
              <input
                type="date"
                value={range.endDate}
                onChange={e => onChange({ ...range, endDate: e.target.value })}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-2.5 py-1.5 text-xs font-bold text-slate-800 focus:outline-hidden focus:bg-white focus:border-blue-600 focus:ring-1 focus:ring-blue-600 transition"
              />
            </div>
          </div>

          {/* Range summary count if available */}
          {totalFilteredCount !== undefined && totalUnfilteredCount !== undefined && (
            <div className="flex items-center justify-between text-[11px] text-slate-500 pt-1 font-medium">
              <span>Mostrando <strong>{totalFilteredCount}</strong> de <strong>{totalUnfilteredCount}</strong> movimientos</span>
              {hasFilter && (
                <span className="text-blue-600 font-bold flex items-center gap-1">
                  <Check className="w-3 h-3" /> Filtrado aplicado
                </span>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
};
