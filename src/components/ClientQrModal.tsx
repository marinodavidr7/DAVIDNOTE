import React, { useEffect, useState } from 'react';
import { X, QrCode, Download, Copy, Check, Radio } from 'lucide-react';
import QRCode from 'qrcode';
import { ClienteCalculado, generarNumeroCuentaCliente } from '../types';
import { formatoMoneda } from '../utils/paymentCycle';

interface ClientQrModalProps {
  cliente: ClienteCalculado | null;
  onClose: () => void;
}

export const ClientQrModal: React.FC<ClientQrModalProps> = ({ cliente, onClose }) => {
  const [qrDataUrl, setQrDataUrl] = useState<string>('');
  const [copiado, setCopiado] = useState(false);

  useEffect(() => {
    if (!cliente) {
      setQrDataUrl('');
      return;
    }

    const numeroCuenta = cliente.numeroCuenta || generarNumeroCuentaCliente(cliente.id);

    const payload = JSON.stringify({
      tipo: 'CLIENTE_COLMADO_DAVID',
      id: cliente.id,
      nombre: cliente.nombre,
      telefono: cliente.telefono,
      numeroCuenta,
      apodo: cliente.apodo || '',
      codigoQR: cliente.codigoQR || `QR-${cliente.id}-${cliente.telefono}`
    });

    QRCode.toDataURL(payload, {
      width: 320,
      margin: 2,
      color: {
        dark: '#1e3a8a', // Azul colmado
        light: '#ffffff'
      }
    })
      .then(url => setQrDataUrl(url))
      .catch(err => console.error('Error generating QR:', err));
  }, [cliente]);

  if (!cliente) return null;

  const handleCopiarCodigo = () => {
    const code = cliente.codigoQR || `CLIENTE:${cliente.id}:${cliente.telefono}`;
    navigator.clipboard.writeText(code).then(() => {
      setCopiado(true);
      setTimeout(() => setCopiado(false), 2000);
    });
  };

  const handleDescargarQR = () => {
    if (!qrDataUrl) return;
    const link = document.createElement('a');
    link.download = `QR_Cliente_${cliente.nombre.replace(/\s+/g, '_')}.png`;
    link.href = qrDataUrl;
    link.click();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 animate-in fade-in duration-200">
      <div className="w-full max-w-sm bg-white rounded-3xl shadow-2xl overflow-hidden border border-slate-100 animate-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 to-indigo-700 p-5 text-white relative text-center">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 w-8 h-8 rounded-full bg-white/20 hover:bg-white/30 text-white flex items-center justify-center transition"
          >
            <X className="w-4 h-4" />
          </button>
          <div className="w-12 h-12 rounded-2xl bg-white/20 backdrop-blur-md flex items-center justify-center mx-auto mb-2">
            <QrCode className="w-6 h-6 text-white" />
          </div>
          <h3 className="font-black text-lg leading-tight">{cliente.nombre}</h3>
          {cliente.apodo && (
            <span className="inline-block mt-1 bg-white/25 text-white text-[10px] font-black px-2 py-0.5 rounded-full uppercase">
              {cliente.apodo}
            </span>
          )}
          <p className="text-xs text-blue-100 mt-1">Código QR Personal para Fiado Rápido</p>
        </div>

        {/* QR Display */}
        <div className="p-6 text-center space-y-4">
          <div className="p-3 bg-slate-50 rounded-2xl border-2 border-slate-100 inline-block shadow-inner mx-auto">
            {qrDataUrl ? (
              <img src={qrDataUrl} alt={`QR de ${cliente.nombre}`} className="w-52 h-52 mx-auto rounded-xl" />
            ) : (
              <div className="w-52 h-52 flex items-center justify-center text-slate-400 text-xs">
                Generando QR...
              </div>
            )}
          </div>

          <div className="bg-slate-50 p-3 rounded-2xl border border-slate-100 text-xs space-y-1.5">
            <div className="flex justify-between items-center text-slate-600">
              <span className="font-bold">No. de Cuenta:</span>
              <span className="font-mono font-bold text-blue-700 bg-blue-50 px-2 py-0.5 rounded-md border border-blue-200/80">
                {cliente.numeroCuenta || generarNumeroCuentaCliente(cliente.id)}
              </span>
            </div>
            <div className="flex justify-between items-center text-slate-600">
              <span className="font-bold">Teléfono:</span>
              <span className="font-mono">{cliente.telefono}</span>
            </div>
            <div className="flex justify-between items-center text-slate-600">
              <span className="font-bold">Deuda actual:</span>
              <span className={`font-black ${cliente.saldo > 0 ? 'text-red-600' : 'text-emerald-600'}`}>
                {formatoMoneda(cliente.saldo)}
              </span>
            </div>
            <div className="flex justify-between items-center text-slate-600">
              <span className="font-bold">Identificador:</span>
              <span className="font-mono text-[10px] text-slate-400">
                #{cliente.id} · {cliente.codigoQR || `QR-${cliente.id}`}
              </span>
            </div>
          </div>

          <div className="flex gap-2">
            <button
              type="button"
              onClick={handleDescargarQR}
              className="flex-1 py-3 bg-blue-600 hover:bg-blue-700 active:scale-98 text-white font-bold text-xs rounded-xl flex items-center justify-center gap-1.5 shadow-md transition"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Descargar QR</span>
            </button>
            <button
              type="button"
              onClick={handleCopiarCodigo}
              className="px-4 py-3 bg-slate-100 hover:bg-slate-200 active:scale-98 text-slate-700 font-bold text-xs rounded-xl flex items-center justify-center gap-1.5 transition"
              title="Copiar código al portapapeles"
            >
              {copiado ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copiado ? 'Copiado' : 'Copiar'}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
