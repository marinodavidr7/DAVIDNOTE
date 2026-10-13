import React, { useState, useEffect } from 'react';
import { X, Calendar } from 'lucide-react';

interface EditPaymentDaysModalProps {
  isOpen: boolean;
  nombreCliente: string;
  diasActuales: string;
  onClose: () => void;
  onSave: (nuevosDias: string) => Promise<void>;
}

export const EditPaymentDaysModal: React.FC<EditPaymentDaysModalProps> = ({
  isOpen,
  nombreCliente,
  diasActuales,
  onClose,
  onSave
}) => {
  const [dias, setDias] = useState(diasActuales || '15,30');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    setDias(diasActuales || '15,30');
  }, [diasActuales, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!dias.trim()) return;
    setSaving(true);
    try {
      await onSave(dias.trim());
      onClose();
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/60 backdrop-blur-xs p-0 sm:p-4">
      <div className="w-full max-w-md bg-white rounded-t-3xl sm:rounded-3xl shadow-2xl overflow-hidden animate-in slide-in-from-bottom sm:zoom-in-95 duration-200">
        <div className="p-6 text-center text-white bg-gradient-to-r from-blue-700 to-indigo-800 relative">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 w-9 h-9 rounded-full bg-white/20 hover:bg-white/30 text-white flex items-center justify-center transition"
          >
            <X className="w-5 h-5" />
          </button>
          <div className="w-14 h-14 rounded-2xl bg-white/20 backdrop-blur-md flex items-center justify-center mx-auto mb-2">
            <Calendar className="w-7 h-7 text-yellow-300" />
          </div>
          <div className="text-xs font-bold uppercase tracking-widest text-blue-200">Ciclo de Pago</div>
          <div className="text-2xl font-black mt-1 truncate">{nombreCliente}</div>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wide mb-2">
              Días de pago del mes
            </label>
            <input
              type="text"
              value={dias}
              onChange={e => setDias(e.target.value)}
              placeholder="15,30"
              className="w-full px-4 py-3.5 border-2 border-slate-200 rounded-2xl text-xl font-bold text-slate-800 focus:border-blue-600 focus:outline-hidden"
              required
            />
            <p className="text-[11px] text-slate-500 mt-2">
              Ingresa los días separados por coma. Ejemplo: <strong>15,30</strong> (quincenas dominicanas).
            </p>

            <div className="mt-3 flex flex-wrap gap-2">
              {['15,30', '15', '30', '1,15', '1,15,30'].map(op => (
                <button
                  type="button"
                  key={op}
                  onClick={() => setDias(op)}
                  className={`text-xs px-3 py-1.5 rounded-full font-bold transition ${
                    dias === op
                      ? 'bg-blue-600 text-white'
                      : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
                  }`}
                >
                  {op}
                </button>
              ))}
            </div>
          </div>

          <div className="flex gap-2 pt-3">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-3.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-2xl text-sm transition"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={saving}
              className="flex-1 py-3.5 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-2xl text-sm shadow-md transition disabled:opacity-50"
            >
              {saving ? 'Guardando...' : 'Guardar Días'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
