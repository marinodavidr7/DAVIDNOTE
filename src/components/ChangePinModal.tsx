import React, { useState } from 'react';
import { X, Key, Lock, Check, Eye, EyeOff, ShieldCheck } from 'lucide-react';
import { store } from '../services/storeService';
import { ClienteCalculado } from '../types';

interface ChangePinModalProps {
  isOpen: boolean;
  cliente: ClienteCalculado | null;
  onClose: () => void;
  onSuccess: (nuevoPin: string) => void;
}

export const ChangePinModal: React.FC<ChangePinModalProps> = ({
  isOpen,
  cliente,
  onClose,
  onSuccess
}) => {
  const [pinActual, setPinActual] = useState('');
  const [nuevoPin, setNuevoPin] = useState('');
  const [confirmarPin, setConfirmarPin] = useState('');
  const [showPins, setShowPins] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen || !cliente) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    // Validar PIN actual si el cliente ya tenía uno
    if (cliente.pin && pinActual.trim() !== cliente.pin.trim()) {
      setError('El PIN actual no es correcto');
      return;
    }

    // Validar que el nuevo PIN tenga 4 dígitos
    if (!/^\d{4}$/.test(nuevoPin)) {
      setError('El nuevo PIN debe tener exactamente 4 dígitos numéricos (0-9)');
      return;
    }

    // Validar que coincidan
    if (nuevoPin !== confirmarPin) {
      setError('El nuevo PIN y su confirmación no coinciden');
      return;
    }

    if (nuevoPin === cliente.pin) {
      setError('El nuevo PIN debe ser diferente al actual');
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await store.cambiarPINCliente(cliente.id, nuevoPin, pinActual);
      if (res.success && res.pin) {
        onSuccess(res.pin);
        onClose();
      } else {
        setError(res.message || 'No se pudo actualizar el PIN');
      }
    } catch (err: any) {
      setError(err?.message || 'Error al actualizar el PIN');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 animate-in fade-in duration-200">
      <div className="w-full max-w-sm bg-white rounded-3xl shadow-2xl overflow-hidden border border-slate-100 animate-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 via-blue-700 to-indigo-800 p-5 text-white relative text-center">
          <button
            type="button"
            onClick={onClose}
            className="absolute top-4 right-4 w-8 h-8 rounded-full bg-white/20 hover:bg-white/30 text-white flex items-center justify-center transition"
          >
            <X className="w-4 h-4" />
          </button>
          <div className="w-12 h-12 rounded-2xl bg-white/20 backdrop-blur-md flex items-center justify-center mx-auto mb-2 shadow-inner">
            <Key className="w-6 h-6 text-yellow-300" />
          </div>
          <h3 className="font-black text-lg leading-tight">Cambiar PIN de Seguridad</h3>
          <p className="text-xs text-blue-100 mt-1">
            Tu clave de 4 dígitos para consultar cuenta
          </p>
        </div>

        {/* Formulario */}
        <form onSubmit={handleSubmit} className="p-5 space-y-4">
          {error && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-xs text-red-700 font-semibold animate-in fade-in duration-150">
              {error}
            </div>
          )}

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              PIN Actual
            </label>
            <div className="relative">
              <input
                type={showPins ? 'text' : 'password'}
                inputMode="numeric"
                pattern="[0-9]*"
                maxLength={4}
                value={pinActual}
                onChange={e => setPinActual(e.target.value.replace(/[^0-9]/g, ''))}
                placeholder="••••"
                className="w-full px-4 py-3 bg-slate-50 border-2 border-slate-200 rounded-2xl text-center text-lg font-mono font-bold text-slate-800 focus:bg-white focus:border-blue-600 focus:outline-hidden transition"
                required
              />
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="block text-xs font-bold text-slate-700">
                Nuevo PIN (4 dígitos)
              </label>
              <button
                type="button"
                onClick={() => setShowPins(!showPins)}
                className="text-slate-400 hover:text-slate-600 text-[11px] font-semibold flex items-center gap-1"
              >
                {showPins ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                <span>{showPins ? 'Ocultar' : 'Ver'}</span>
              </button>
            </div>
            <input
              type={showPins ? 'text' : 'password'}
              inputMode="numeric"
              pattern="[0-9]*"
              maxLength={4}
              value={nuevoPin}
              onChange={e => setNuevoPin(e.target.value.replace(/[^0-9]/g, ''))}
              placeholder="••••"
              className="w-full px-4 py-3 bg-slate-50 border-2 border-slate-200 rounded-2xl text-center text-lg font-mono font-bold text-slate-800 focus:bg-white focus:border-blue-600 focus:outline-hidden transition"
              required
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Confirmar Nuevo PIN
            </label>
            <input
              type={showPins ? 'text' : 'password'}
              inputMode="numeric"
              pattern="[0-9]*"
              maxLength={4}
              value={confirmarPin}
              onChange={e => setConfirmarPin(e.target.value.replace(/[^0-9]/g, ''))}
              placeholder="••••"
              className="w-full px-4 py-3 bg-slate-50 border-2 border-slate-200 rounded-2xl text-center text-lg font-mono font-bold text-slate-800 focus:bg-white focus:border-blue-600 focus:outline-hidden transition"
              required
            />
          </div>

          <div className="pt-2 flex gap-2">
            <button
              type="button"
              onClick={onClose}
              disabled={isSubmitting}
              className="flex-1 py-3 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-2xl text-xs transition"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={isSubmitting || nuevoPin.length !== 4 || confirmarPin.length !== 4}
              className="flex-1 py-3 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white font-bold rounded-2xl text-xs shadow-md transition flex items-center justify-center gap-1.5"
            >
              <Check className="w-4 h-4" />
              <span>{isSubmitting ? 'Guardando...' : 'Guardar PIN'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
