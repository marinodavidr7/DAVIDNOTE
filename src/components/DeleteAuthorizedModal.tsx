import React, { useState } from 'react';
import { X, Trash2 } from 'lucide-react';
import { Autorizado } from '../types';

interface DeleteAuthorizedModalProps {
  autorizado: Autorizado | null;
  onClose: () => void;
  onConfirm: () => Promise<void>;
}

export const DeleteAuthorizedModal: React.FC<DeleteAuthorizedModalProps> = ({
  autorizado,
  onClose,
  onConfirm
}) => {
  const [deleting, setDeleting] = useState(false);

  if (!autorizado) return null;

  const handleConfirm = async () => {
    setDeleting(true);
    try {
      await onConfirm();
      onClose();
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/60 backdrop-blur-xs p-0 sm:p-4">
      <div className="w-full max-w-md bg-white rounded-t-3xl sm:rounded-3xl shadow-2xl overflow-hidden animate-in slide-in-from-bottom sm:zoom-in-95 duration-200">
        <div className="p-6 text-center text-white bg-gradient-to-r from-red-600 to-rose-700 relative">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 w-9 h-9 rounded-full bg-white/20 hover:bg-white/30 text-white flex items-center justify-center transition"
          >
            <X className="w-5 h-5" />
          </button>
          <div className="w-14 h-14 rounded-2xl bg-white/20 backdrop-blur-md flex items-center justify-center mx-auto mb-2">
            <Trash2 className="w-7 h-7 text-white" />
          </div>
          <div className="text-xs font-bold uppercase tracking-widest text-red-200">Eliminar Autorizado</div>
          <div className="text-xl font-black mt-1 truncate">{autorizado.nombre}</div>
        </div>

        <div className="p-6 space-y-4">
          <p className="text-sm text-slate-600 text-center leading-relaxed">
            ¿Estás seguro que deseas eliminar a <strong>{autorizado.nombre}</strong> ({autorizado.parentesco}) de la lista de personas autorizadas para retirar fiado?
          </p>

          <div className="flex gap-2 pt-2">
            <button
              onClick={onClose}
              className="flex-1 py-3.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-2xl text-sm transition"
            >
              Cancelar
            </button>
            <button
              onClick={handleConfirm}
              disabled={deleting}
              className="flex-1 py-3.5 bg-red-600 hover:bg-red-700 text-white font-bold rounded-2xl text-sm shadow-md transition disabled:opacity-50"
            >
              {deleting ? 'Eliminando...' : 'Sí, Eliminar'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
