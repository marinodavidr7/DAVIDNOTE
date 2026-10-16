import React, { useState, useEffect } from 'react';
import { X, Copy, Check, Send, Phone, Calendar, RefreshCw, MessageSquare } from 'lucide-react';
import { WhatsAppIcon, WhatsAppClientData } from './WhatsAppButton';
import {
  generarMensajeRecordatorio,
  normalizarTelefonoWhatsApp,
  esTelefonoValidoWhatsApp
} from '../utils/whatsapp';
import { formatoMoneda } from '../utils/paymentCycle';

interface WhatsAppModalProps {
  isOpen: boolean;
  cliente: WhatsAppClientData | null;
  nombreColmado?: string;
  onClose: () => void;
  onSent?: (cliente: WhatsAppClientData) => void;
  showToast?: (title: string, message: string, type: 'success' | 'error' | 'warning' | 'info') => void;
}

export const WhatsAppModal: React.FC<WhatsAppModalProps> = ({
  isOpen,
  cliente,
  nombreColmado = 'Súper Colmado DAVID',
  onClose,
  onSent,
  showToast
}) => {
  const [mensaje, setMensaje] = useState('');
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (cliente) {
      setMensaje(generarMensajeRecordatorio(cliente, nombreColmado));
      setCopied(false);
    }
  }, [cliente, nombreColmado, isOpen]);

  if (!isOpen || !cliente) return null;

  const tieneTelefono = esTelefonoValidoWhatsApp(cliente.telefono);
  const telefonoNorm = normalizarTelefonoWhatsApp(cliente.telefono);

  const handleResetMensaje = () => {
    setMensaje(generarMensajeRecordatorio(cliente, nombreColmado));
    showToast?.('Mensaje Restablecido', 'Plantilla original cargada', 'info');
  };

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(mensaje);
      setCopied(true);
      showToast?.('Texto Copiado', 'Mensaje copiado al portapapeles', 'success');
      setTimeout(() => setCopied(false), 2500);
    } catch {
      showToast?.('Error', 'No se pudo copiar el texto', 'error');
    }
  };

  const handleSendWhatsApp = (e: React.MouseEvent<HTMLAnchorElement>) => {
    if (!tieneTelefono) {
      e.preventDefault();
      showToast?.('Teléfono Requerido', 'El cliente no tiene un número válido para WhatsApp', 'error');
      return;
    }

    if (onSent) {
      onSent(cliente);
    }

    // Auto cerrar el modal tras abrir WhatsApp
    setTimeout(() => {
      onClose();
    }, 500);
  };

  const waUrl = tieneTelefono
    ? `https://api.whatsapp.com/send?phone=${telefonoNorm}&text=${encodeURIComponent(mensaje)}`
    : '#';

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/60 backdrop-blur-xs p-0 sm:p-4 animate-in fade-in duration-150">
      <div className="w-full max-w-md bg-white rounded-t-3xl sm:rounded-3xl shadow-2xl overflow-hidden animate-in slide-in-from-bottom sm:zoom-in-95 duration-200 max-h-[92vh] flex flex-col">
        {/* Header */}
        <div className="p-5 text-center text-white bg-gradient-to-r from-[#25D366] via-[#128C7E] to-[#075E54] relative shrink-0">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 w-9 h-9 rounded-full bg-white/20 hover:bg-white/30 text-white flex items-center justify-center transition"
            aria-label="Cerrar modal"
          >
            <X className="w-5 h-5" />
          </button>
          
          <div className="w-13 h-13 rounded-2xl bg-white/20 backdrop-blur-md flex items-center justify-center mx-auto mb-2 shadow-inner">
            <WhatsAppIcon className="w-7 h-7 text-white" />
          </div>
          
          <div className="text-[11px] font-bold uppercase tracking-widest text-emerald-100">
            Recordatorio por WhatsApp
          </div>
          <div className="text-xl font-black mt-0.5 truncate px-6">
            {cliente.nombre}
          </div>
        </div>

        {/* Content */}
        <div className="p-4 sm:p-5 space-y-3.5 overflow-y-auto flex-1">
          {/* Client Details Bar */}
          <div className="flex items-center justify-between gap-2 p-3 bg-slate-50 border border-slate-100 rounded-2xl text-xs">
            <div className="flex items-center gap-2 min-w-0">
              <div className="w-8 h-8 rounded-xl bg-emerald-100 text-emerald-800 flex items-center justify-center shrink-0">
                <Phone className="w-4 h-4" />
              </div>
              <div className="min-w-0">
                <div className="text-[10px] uppercase font-bold text-slate-400">Número WhatsApp</div>
                <div className="font-extrabold text-slate-800 truncate">
                  {tieneTelefono ? cliente.telefono : <span className="text-red-500">Sin teléfono</span>}
                </div>
              </div>
            </div>

            <div className="text-right shrink-0">
              <div className="text-[10px] uppercase font-bold text-slate-400">Saldo Pendiente</div>
              <div className={`font-black text-sm ${cliente.saldo > 0 ? 'text-red-600' : 'text-emerald-600'}`}>
                {formatoMoneda(cliente.saldo)}
              </div>
            </div>
          </div>

          {/* Payment days if available */}
          {cliente.diasPago && (
            <div className="flex items-center gap-2 px-3 py-1.5 bg-blue-50/70 text-blue-700 border border-blue-100 rounded-xl text-[11px]">
              <Calendar className="w-3.5 h-3.5 shrink-0" />
              <span>Días de pago acordados: <strong className="font-bold">{cliente.diasPago}</strong></span>
            </div>
          )}

          {/* Message Area */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <label className="text-[11px] font-black uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
                <MessageSquare className="w-3.5 h-3.5 text-emerald-600" />
                <span>Mensaje a enviar</span>
              </label>
              <button
                type="button"
                onClick={handleResetMensaje}
                className="text-[10px] text-blue-600 hover:text-blue-700 font-bold flex items-center gap-1 hover:underline"
                title="Restablecer mensaje predeterminado"
              >
                <RefreshCw className="w-3 h-3" />
                <span>Restablecer</span>
              </button>
            </div>

            <div className="relative">
              <textarea
                value={mensaje}
                onChange={(e) => setMensaje(e.target.value)}
                rows={5}
                className="w-full p-3 bg-white border border-slate-200 rounded-2xl text-xs text-slate-800 font-sans leading-relaxed focus:outline-hidden focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-500 resize-none shadow-2xs"
                placeholder="Escribe el mensaje..."
              />
            </div>
            <p className="text-[10px] text-slate-400">
              Puedes editar este mensaje antes de enviarlo. Se abrirá listo en WhatsApp.
            </p>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="p-4 border-t border-slate-100 bg-slate-50 flex flex-wrap gap-2 shrink-0">
          <a
            href={waUrl}
            target="_blank"
            rel="noopener noreferrer"
            onClick={handleSendWhatsApp}
            className="flex-1 min-w-[150px] py-3.5 px-4 bg-gradient-to-r from-[#25D366] to-[#1ebe5b] hover:from-[#20ba5a] hover:to-[#17a34e] active:scale-98 text-white font-black text-xs sm:text-sm rounded-2xl flex items-center justify-center gap-2 shadow-md shadow-emerald-600/30 transition-all select-none"
          >
            <WhatsAppIcon className="w-4 h-4 shrink-0" />
            <span>Enviar por WhatsApp</span>
            <Send className="w-3.5 h-3.5 opacity-90" />
          </a>

          <button
            type="button"
            onClick={handleCopy}
            className="px-4 py-3.5 bg-white hover:bg-slate-100 active:bg-slate-200 border border-slate-200 text-slate-700 font-bold text-xs sm:text-sm rounded-2xl flex items-center justify-center gap-1.5 transition-all shadow-2xs"
            title="Copiar texto al portapapeles"
          >
            {copied ? (
              <>
                <Check className="w-4 h-4 text-emerald-600" />
                <span className="text-emerald-700 font-extrabold">Copiado</span>
              </>
            ) : (
              <>
                <Copy className="w-4 h-4 text-slate-500" />
                <span>Copiar</span>
              </>
            )}
          </button>

          <button
            type="button"
            onClick={onClose}
            className="px-4 py-3.5 bg-slate-200 hover:bg-slate-300 text-slate-700 font-bold text-xs sm:text-sm rounded-2xl transition"
          >
            Cerrar
          </button>
        </div>
      </div>
    </div>
  );
};
