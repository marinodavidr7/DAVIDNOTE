import React from 'react';
import { X, ShoppingBag, ArrowDownLeft, Calendar, Clock, User, UserCheck, MessageSquare, Hash, Download, FileText } from 'lucide-react';
import { Movimiento } from '../types';
import { formatoMoneda } from '../utils/paymentCycle';
import { generarReciboPDF } from '../utils/pdfGenerator';

interface ReceiptModalProps {
  movimiento: Movimiento | null;
  onClose: () => void;
}

export const ReceiptModal: React.FC<ReceiptModalProps> = ({ movimiento, onClose }) => {
  if (!movimiento) return null;

  const esFiado = movimiento.tipo === 'Fiado';

  const handleDescargarPDF = () => {
    generarReciboPDF(movimiento);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/60 backdrop-blur-xs p-0 sm:p-4">
      <div className="w-full max-w-md bg-white rounded-t-3xl sm:rounded-3xl shadow-2xl overflow-hidden animate-in slide-in-from-bottom sm:zoom-in-95 duration-200 max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className={`p-6 text-center text-white relative ${esFiado ? 'bg-gradient-to-r from-red-600 to-rose-700' : 'bg-gradient-to-r from-emerald-600 to-teal-700'}`}>
          <button
            onClick={onClose}
            className="absolute top-4 right-4 w-9 h-9 rounded-full bg-white/20 hover:bg-white/30 text-white flex items-center justify-center transition"
          >
            <X className="w-5 h-5" />
          </button>
          <div className="w-14 h-14 rounded-2xl bg-white/20 backdrop-blur-md flex items-center justify-center mx-auto mb-2">
            {esFiado ? <ShoppingBag className="w-7 h-7" /> : <ArrowDownLeft className="w-7 h-7" />}
          </div>
          <div className="text-xs font-bold uppercase tracking-widest text-white/80">{movimiento.tipo}</div>
          <div className="text-3xl font-black mt-1 tracking-tight">{formatoMoneda(movimiento.monto)}</div>
        </div>

        {/* Receipt Details */}
        <div className="p-6 space-y-4 overflow-y-auto divide-y divide-slate-100 flex-1">
          <div className="flex items-start gap-3 pt-2 first:pt-0">
            <div className="w-9 h-9 rounded-xl bg-slate-100 text-slate-600 flex items-center justify-center shrink-0">
              <Calendar className="w-4 h-4" />
            </div>
            <div className="flex-1">
              <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Fecha</div>
              <div className="text-sm font-bold text-slate-800">{movimiento.fechaLarga || movimiento.fechaTexto || '—'}</div>
            </div>
          </div>

          <div className="flex items-start gap-3 pt-3">
            <div className="w-9 h-9 rounded-xl bg-slate-100 text-slate-600 flex items-center justify-center shrink-0">
              <Clock className="w-4 h-4" />
            </div>
            <div className="flex-1">
              <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Hora</div>
              <div className="text-sm font-bold text-slate-800">{movimiento.hora || '—'}</div>
            </div>
          </div>

          {movimiento.nombreCliente && (
            <div className="flex items-start gap-3 pt-3">
              <div className="w-9 h-9 rounded-xl bg-slate-100 text-slate-600 flex items-center justify-center shrink-0">
                <User className="w-4 h-4" />
              </div>
              <div className="flex-1">
                <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Cliente</div>
                <div className="text-sm font-bold text-slate-800">{movimiento.nombreCliente}</div>
              </div>
            </div>
          )}

          {esFiado && movimiento.autorizadoNombre && movimiento.autorizadoNombre !== '-' && (
            <div className="flex items-start gap-3 pt-3">
              <div className="w-9 h-9 rounded-xl bg-slate-100 text-slate-600 flex items-center justify-center shrink-0">
                <UserCheck className="w-4 h-4" />
              </div>
              <div className="flex-1">
                <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Comprado por</div>
                <div className="text-sm font-bold text-slate-800">
                  {movimiento.autorizadoNombre}
                  {movimiento.autorizadoParentesco && movimiento.autorizadoParentesco !== '-' && (
                    <span className="text-xs text-slate-500 font-normal ml-1">({movimiento.autorizadoParentesco})</span>
                  )}
                </div>
              </div>
            </div>
          )}

          {movimiento.observaciones && (
            <div className="flex items-start gap-3 pt-3">
              <div className="w-9 h-9 rounded-xl bg-slate-100 text-slate-600 flex items-center justify-center shrink-0">
                <MessageSquare className="w-4 h-4" />
              </div>
              <div className="flex-1">
                <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Observaciones</div>
                <div className="text-sm font-medium text-slate-700 leading-relaxed">{movimiento.observaciones}</div>
              </div>
            </div>
          )}

          <div className="flex items-start gap-3 pt-3">
            <div className="w-9 h-9 rounded-xl bg-slate-100 text-slate-600 flex items-center justify-center shrink-0">
              <Hash className="w-4 h-4" />
            </div>
            <div className="flex-1">
              <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">ID Movimiento</div>
              <div className="text-sm font-mono font-bold text-slate-800">#{movimiento.idMov}</div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-slate-100 bg-slate-50 flex gap-2">
          <button
            onClick={handleDescargarPDF}
            className="flex-1 py-3.5 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-2xl text-xs sm:text-sm flex items-center justify-center gap-2 shadow-md transition active:scale-98"
          >
            <Download className="w-4 h-4" />
            Descargar Recibo PDF
          </button>
          <button
            onClick={onClose}
            className="px-5 py-3.5 bg-slate-200 hover:bg-slate-300 text-slate-700 font-bold rounded-2xl text-xs sm:text-sm transition"
          >
            Cerrar
          </button>
        </div>
      </div>
    </div>
  );
};
