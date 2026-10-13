import React, { useState, useEffect } from 'react';
import { X, UserPlus, Users } from 'lucide-react';
import { Autorizado } from '../types';

interface AuthorizedModalProps {
  isOpen: boolean;
  modo: 'agregar' | 'editar';
  autorizado?: Autorizado | null;
  onClose: () => void;
  onSave: (nombre: string, parentesco: string) => Promise<void>;
}

export const AuthorizedModal: React.FC<AuthorizedModalProps> = ({
  isOpen,
  modo,
  autorizado,
  onClose,
  onSave
}) => {
  const [nombre, setNombre] = useState('');
  const [parentesco, setParentesco] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (modo === 'editar' && autorizado) {
      setNombre(autorizado.nombre);
      setParentesco(autorizado.parentesco);
    } else {
      setNombre('');
      setParentesco('');
    }
  }, [modo, autorizado, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!nombre.trim() || !parentesco.trim()) return;
    setSaving(true);
    try {
      await onSave(nombre.trim(), parentesco.trim());
      onClose();
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/60 backdrop-blur-xs p-0 sm:p-4">
      <div className="w-full max-w-md bg-white rounded-t-3xl sm:rounded-3xl shadow-2xl overflow-hidden animate-in slide-in-from-bottom sm:zoom-in-95 duration-200">
        <div className="p-6 text-center text-white bg-gradient-to-r from-purple-700 to-indigo-800 relative">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 w-9 h-9 rounded-full bg-white/20 hover:bg-white/30 text-white flex items-center justify-center transition"
          >
            <X className="w-5 h-5" />
          </button>
          <div className="w-14 h-14 rounded-2xl bg-white/20 backdrop-blur-md flex items-center justify-center mx-auto mb-2">
            {modo === 'agregar' ? <UserPlus className="w-7 h-7" /> : <Users className="w-7 h-7" />}
          </div>
          <div className="text-xs font-bold uppercase tracking-widest text-purple-200">
            {modo === 'agregar' ? 'Nuevo Autorizado' : 'Editar Autorizado'}
          </div>
          <div className="text-xl font-black mt-1">
            {modo === 'agregar' ? 'Persona que puede retirar fiado' : autorizado?.nombre}
          </div>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wide mb-1.5">
              Nombre completo *
            </label>
            <input
              type="text"
              value={nombre}
              onChange={e => setNombre(e.target.value)}
              placeholder="Ej. Juan Pérez"
              className="w-full px-4 py-3.5 border-2 border-slate-200 rounded-2xl text-base font-semibold text-slate-800 focus:border-purple-600 focus:outline-hidden"
              required
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wide mb-1.5">
              Parentesco o relación *
            </label>
            <input
              type="text"
              value={parentesco}
              onChange={e => setParentesco(e.target.value)}
              placeholder="Ej. Esposa, Hijo, Madre, Empleado..."
              className="w-full px-4 py-3.5 border-2 border-slate-200 rounded-2xl text-base font-semibold text-slate-800 focus:border-purple-600 focus:outline-hidden"
              required
            />
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
              className="flex-1 py-3.5 bg-purple-600 hover:bg-purple-700 text-white font-bold rounded-2xl text-sm shadow-md transition disabled:opacity-50"
            >
              {saving ? 'Guardando...' : 'Guardar'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
