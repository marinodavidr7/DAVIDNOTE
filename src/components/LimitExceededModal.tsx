import React from 'react';
import { X, AlertTriangle, Phone, Wallet, Sliders, CheckCircle, ShoppingCart } from 'lucide-react';
import { formatoMoneda } from '../utils/paymentCycle';

interface LimitExceededModalProps {
  data: {
    nombreCliente: string;
    telefonoCliente: string;
    limite: number;
    saldoActual: number;
    disponible: number;
    montoIntentado: number;
  } | null;
  onClose: () => void;
}

export const LimitExceededModal: React.FC<LimitExceededModalProps> = ({ data, onClose }) => {
  if (!data) return null;

  const telClean = data.telefonoCliente.replace(/[^0-9]/g, '');

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/60 backdrop-blur-xs p-0 sm:p-4">
      <div className="w-full max-w-md bg-white rounded-t-3xl sm:rounded-3xl shadow-2xl overflow-hidden animate-in slide-in-from-bottom sm:zoom-in-95 duration-200">
        {/* Header */}
        <div className="p-6 text-center text-white bg-gradient-to-r from-amber-500 via-orange-600 to-amber-700 relative">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 w-9 h-9 rounded-full bg-white/20 hover:bg-white/30 text-white flex items-center justify-center transition"
          >
            <X className="w-5 h-5" />
          </button>
          <div className="w-14 h-14 rounded-2xl bg-white/20 backdrop-blur-md flex items-center justify-center mx-auto mb-2">
            <AlertTriangle className="w-8 h-8 text-white" />
          </div>
          <div className="text-xs font-bold uppercase tracking-widest text-amber-100">Límite Superado</div>
          <div className="text-2xl font-black mt-1">{data.nombreCliente}</div>
        </div>

        {/* Body */}
        <div className="p-6 space-y-4">
          <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 text-xs text-amber-900 leading-relaxed">
            <p className="font-bold text-amber-950 mb-1 flex items-center gap-1.5">
              <Phone className="w-4 h-4 text-amber-700" />
              Contacta al cliente para regularizar el pago
            </p>
            {data.nombreCliente} ha alcanzado o supera su límite de fiado. Para autorizar una compra adicional debe abonar a su deuda o aumentarle el límite.
          </div>

          <div className="space-y-2.5 divide-y divide-slate-100 text-sm">
            <div className="flex justify-between items-center pt-2 first:pt-0">
              <span className="text-slate-500 flex items-center gap-1.5">
                <Wallet className="w-4 h-4 text-slate-400" /> Deuda actual:
              </span>
              <span className="font-black text-red-600">{formatoMoneda(data.saldoActual)}</span>
            </div>

            <div className="flex justify-between items-center pt-2.5">
              <span className="text-slate-500 flex items-center gap-1.5">
                <Sliders className="w-4 h-4 text-slate-400" /> Límite total:
              </span>
              <span className="font-bold text-slate-800">{formatoMoneda(data.limite)}</span>
            </div>

            <div className="flex justify-between items-center pt-2.5">
              <span className="text-slate-500 flex items-center gap-1.5">
                <CheckCircle className="w-4 h-4 text-slate-400" /> Disponible:
              </span>
              <span className="font-bold text-slate-800">{formatoMoneda(data.disponible)}</span>
            </div>

            <div className="flex justify-between items-center pt-2.5">
              <span className="text-slate-500 flex items-center gap-1.5">
                <ShoppingCart className="w-4 h-4 text-slate-400" /> Monto intentado:
              </span>
              <span className="font-black text-amber-600">{formatoMoneda(data.montoIntentado)}</span>
            </div>

            <div className="flex justify-between items-center pt-2.5">
              <span className="text-slate-500 flex items-center gap-1.5">
                <Phone className="w-4 h-4 text-slate-400" /> Teléfono:
              </span>
              <a
                href={`tel:${telClean}`}
                className="font-bold text-blue-600 underline flex items-center gap-1"
              >
                {data.telefonoCliente}
              </a>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-slate-100 bg-slate-50 flex gap-2">
          <a
            href={`tel:${telClean}`}
            className="flex-1 py-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-2xl font-bold text-sm flex items-center justify-center gap-2 transition"
          >
            <Phone className="w-4 h-4" />
            Llamar Cliente
          </a>
          <button
            onClick={onClose}
            className="px-6 py-3 bg-slate-800 hover:bg-slate-900 text-white font-bold rounded-2xl text-sm transition"
          >
            Entendido
          </button>
        </div>
      </div>
    </div>
  );
};
