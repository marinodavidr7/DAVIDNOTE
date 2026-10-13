import React, { useState, useEffect } from 'react';
import { X, Sliders, Wallet } from 'lucide-react';
import { formatoMoneda } from '../utils/paymentCycle';

interface EditLimitModalProps {
  isOpen: boolean;
  nombreCliente: string;
  saldoActual: number;
  limiteActual: number;
  onClose: () => void;
  onSave: (nuevoLimite: number) => Promise<void>;
}

export const EditLimitModal: React.FC<EditLimitModalProps> = ({
  isOpen,
  nombreCliente,
  saldoActual,
  limiteActual,
  onClose,
  onSave
}) => {
  const [limite, setLimite] = useState<string>(String(limiteActual || 5000));
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    setLimite(String(limiteActual || 5000));
  }, [limiteActual, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const num = parseFloat(limite);
    if (isNaN(num) || num < 0) return;
    setSaving(true);
    try {
      await onSave(num);
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
            <Sliders className="w-7 h-7 text-yellow-300" />
          </div>
          <div className="text-xs font-bold uppercase tracking-widest text-blue-200">Límite de Fiado</div>
          <div className="text-2xl font-black mt-1 truncate">{nombreCliente}</div>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 flex items-center justify-between">
            <div className="flex items-center gap-2 text-xs text-slate-500 font-semibold">
              <Wallet className="w-4 h-4 text-slate-400" />
              Deuda actual:
            </div>
            <div className="text-base font-black text-red-600">{formatoMoneda(saldoActual)}</div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wide mb-2">
              Nuevo Límite (RD$)
            </label>
            <input
              type="number"
              step="100"
              min="0"
              value={limite}
              onChange={e => setLimite(e.target.value)}
              placeholder="5000"
              className="w-full px-4 py-3.5 border-2 border-slate-200 rounded-2xl text-xl font-bold text-slate-800 focus:border-blue-600 focus:outline-hidden"
              required
            />
            <p className="text-[11px] text-slate-500 mt-2">
              Ingresa 0 para clientes sin límite restrictivo. El nuevo límite no debe ser menor a la deuda actual.
            </p>
          </div>

          <div className="flex gap-2 pt-2">
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
              {saving ? 'Guardando...' : 'Guardar Límite'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
