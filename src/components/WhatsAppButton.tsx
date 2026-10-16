import React, { useState } from 'react';
import { Copy, Check, ChevronDown, ChevronUp, Send } from 'lucide-react';
import {
  generarEnlaceWhatsApp,
  generarMensajeRecordatorio,
  normalizarTelefonoWhatsApp,
  esTelefonoValidoWhatsApp
} from '../utils/whatsapp';
import { formatoMoneda } from '../utils/paymentCycle';

export interface WhatsAppClientData {
  id?: number;
  nombre: string;
  telefono: string;
  saldo: number;
  diasPago?: string;
}

/**
 * Ícono oficial de WhatsApp en formato SVG vectorial de alta fidelidad
 */
export const WhatsAppIcon: React.FC<{ className?: string }> = ({ className = 'w-4 h-4' }) => (
  <svg
    viewBox="0 0 24 24"
    fill="currentColor"
    className={className}
    aria-hidden="true"
  >
    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51l-.57-.01c-.198 0-.52.074-.792.372s-1.04 1.016-1.04 2.479 1.065 2.876 1.213 3.074c.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
  </svg>
);

/**
 * Botón compacto con ícono oficial de WhatsApp para listas y tarjetas
 */
interface WhatsAppIconButtonProps {
  cliente: WhatsAppClientData;
  nombreColmado?: string;
  pagaHoy?: boolean;
  onSent?: (cliente: WhatsAppClientData) => void;
  onOpenModal?: (cliente: WhatsAppClientData) => void;
  className?: string;
  size?: 'sm' | 'md';
}

export const WhatsAppIconButton: React.FC<WhatsAppIconButtonProps> = ({
  cliente,
  nombreColmado = 'Súper Colmado DAVID',
  pagaHoy = false,
  onSent,
  onOpenModal,
  className = '',
  size = 'md'
}) => {
  const tieneTelefono = esTelefonoValidoWhatsApp(cliente.telefono);
  const waUrl = tieneTelefono ? generarEnlaceWhatsApp(cliente, nombreColmado) : '#';

  const handleClick = (e: React.MouseEvent<HTMLAnchorElement>) => {
    e.stopPropagation();
    if (onOpenModal) {
      e.preventDefault();
      onOpenModal(cliente);
      return;
    }
    if (!tieneTelefono) {
      e.preventDefault();
      return;
    }
    if (onSent) {
      onSent(cliente);
    }
  };

  const sizeClasses = size === 'sm' ? 'w-8 h-8 text-xs' : 'w-9 h-9 text-sm';
  const iconSize = size === 'sm' ? 'w-4 h-4' : 'w-4.5 h-4.5';

  return (
    <a
      href={waUrl}
      target="_blank"
      rel="noopener noreferrer"
      onClick={handleClick}
      title={`Enviar WhatsApp a ${cliente.nombre}`}
      aria-label={`Enviar WhatsApp a ${cliente.nombre}`}
      className={`relative inline-flex items-center justify-center rounded-full shrink-0 transition-all duration-200 active:scale-90 select-none ${sizeClasses} ${
        pagaHoy
          ? 'bg-[#25D366] hover:bg-[#20ba5a] text-white shadow-md shadow-emerald-500/30 ring-2 ring-emerald-300 ring-offset-1'
          : 'bg-[#25D366]/15 hover:bg-[#25D366] text-[#128C7E] hover:text-white border border-[#25D366]/30'
      } ${className}`}
    >
      <WhatsAppIcon className={iconSize} />
      {pagaHoy && (
        <span className="absolute -top-0.5 -right-0.5 flex h-2.5 w-2.5">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
          <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
        </span>
      )}
    </a>
  );
};

/**
 * Tarjeta completa y elegante de Recordatorio por WhatsApp para la vista de detalle de cliente
 */
interface WhatsAppReminderCardProps {
  cliente: WhatsAppClientData;
  nombreColmado?: string;
  onSent?: (cliente: WhatsAppClientData) => void;
  showToast?: (title: string, message: string, type: 'success' | 'error' | 'warning' | 'info') => void;
}

export const WhatsAppReminderCard: React.FC<WhatsAppReminderCardProps> = ({
  cliente,
  nombreColmado = 'Súper Colmado DAVID',
  onSent,
  showToast
}) => {
  const [copied, setCopied] = useState(false);
  const [showPreview, setShowPreview] = useState(false);

  const tieneTelefono = esTelefonoValidoWhatsApp(cliente.telefono);
  const telefonoNorm = normalizarTelefonoWhatsApp(cliente.telefono);
  const mensaje = generarMensajeRecordatorio(cliente, nombreColmado);
  const waUrl = tieneTelefono ? generarEnlaceWhatsApp(cliente, nombreColmado) : '#';

  const handleCopyMessage = async (e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      await navigator.clipboard.writeText(mensaje);
      setCopied(true);
      showToast?.('Texto Copiado', 'Mensaje de WhatsApp copiado al portapapeles', 'success');
      setTimeout(() => setCopied(false), 2500);
    } catch {
      showToast?.('Error', 'No se pudo copiar el texto', 'error');
    }
  };

  const handleOpenWhatsApp = (e: React.MouseEvent<HTMLAnchorElement>) => {
    if (!tieneTelefono) {
      e.preventDefault();
      showToast?.('Teléfono Requerido', 'El cliente no tiene un número válido para WhatsApp', 'error');
      return;
    }
    if (onSent) {
      onSent(cliente);
    }
  };

  return (
    <div className="bg-gradient-to-br from-emerald-50/90 via-white to-teal-50/50 border border-emerald-200/80 rounded-2xl p-4 shadow-xs space-y-3">
      {/* Header Info */}
      <div className="flex items-start justify-between gap-2">
        <div className="flex items-center gap-2.5">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#25D366] to-[#128C7E] text-white flex items-center justify-center shadow-md shadow-emerald-500/20 shrink-0">
            <WhatsAppIcon className="w-5 h-5" />
          </div>
          <div>
            <h4 className="text-xs font-black text-slate-900 tracking-tight flex items-center gap-1.5">
              <span>Recordatorio por WhatsApp</span>
              <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800">
                Directo
              </span>
            </h4>
            <p className="text-[11px] text-slate-500 mt-0.5">
              {tieneTelefono ? (
                <span>Número: <strong className="text-slate-700 font-semibold">{cliente.telefono}</strong></span>
              ) : (
                <span className="text-red-500 font-semibold">Sin teléfono registrado</span>
              )}
            </p>
          </div>
        </div>

        {cliente.saldo > 0 ? (
          <div className="text-right shrink-0">
            <span className="text-[10px] uppercase font-bold text-slate-400 block">Deuda</span>
            <span className="text-xs font-black text-red-600">{formatoMoneda(cliente.saldo)}</span>
          </div>
        ) : (
          <div className="text-right shrink-0">
            <span className="text-[10px] font-bold text-emerald-600 bg-emerald-100 px-2 py-0.5 rounded-full">
              Al día
            </span>
          </div>
        )}
      </div>

      {/* Action Buttons */}
      <div className="flex items-center gap-2 pt-1">
        <a
          href={waUrl}
          target="_blank"
          rel="noopener noreferrer"
          onClick={handleOpenWhatsApp}
          className="flex-1 py-2.5 px-3 bg-gradient-to-r from-[#25D366] to-[#1ebe5b] hover:from-[#20ba5a] hover:to-[#17a34e] active:scale-98 text-white font-black text-xs rounded-xl flex items-center justify-center gap-2 shadow-md shadow-emerald-600/25 transition-all select-none"
        >
          <WhatsAppIcon className="w-4 h-4 shrink-0" />
          <span>Abrir WhatsApp</span>
          <Send className="w-3 h-3 opacity-80" />
        </a>

        <button
          type="button"
          onClick={handleCopyMessage}
          title="Copiar texto del mensaje"
          className="py-2.5 px-3 bg-white hover:bg-slate-50 active:bg-slate-100 border border-slate-200 text-slate-700 font-bold text-xs rounded-xl flex items-center justify-center gap-1.5 transition-all shadow-2xs"
        >
          {copied ? (
            <>
              <Check className="w-3.5 h-3.5 text-emerald-600" />
              <span className="text-emerald-700 font-extrabold text-[11px]">Copiado</span>
            </>
          ) : (
            <>
              <Copy className="w-3.5 h-3.5 text-slate-500" />
              <span className="text-[11px]">Copiar</span>
            </>
          )}
        </button>

        <button
          type="button"
          onClick={() => setShowPreview(!showPreview)}
          title="Ver mensaje previo"
          className="w-9 h-9 bg-white hover:bg-slate-50 border border-slate-200 text-slate-600 rounded-xl flex items-center justify-center transition-all shadow-2xs shrink-0"
        >
          {showPreview ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
        </button>
      </div>

      {/* Message Preview Accordion */}
      {showPreview && (
        <div className="mt-2 p-3 bg-white/90 border border-emerald-100 rounded-xl text-left text-[11px] text-slate-700 whitespace-pre-line font-sans leading-relaxed shadow-inner">
          <div className="flex items-center justify-between pb-1 mb-1 border-b border-slate-100 text-[10px] text-slate-400 font-bold uppercase tracking-wider">
            <span>Vista previa del mensaje:</span>
            <span>+{telefonoNorm}</span>
          </div>
          {mensaje}
        </div>
      )}
    </div>
  );
};
