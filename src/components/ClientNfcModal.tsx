import React, { useState, useEffect } from 'react';
import {
  X,
  Wifi,
  Radio,
  CheckCircle2,
  AlertCircle,
  Sparkles,
  Zap,
  Save,
  RotateCcw,
  Tag
} from 'lucide-react';
import { ClienteCalculado } from '../types';
import { store } from '../services/storeService';

interface ClientNfcModalProps {
  cliente: ClienteCalculado | null;
  onClose: () => void;
  onSuccess: (nuevoNfcUid: string) => void;
}

export const ClientNfcModal: React.FC<ClientNfcModalProps> = ({
  cliente,
  onClose,
  onSuccess
}) => {
  const [isScanning, setIsScanning] = useState(false);
  const [nfcSupported, setNfcSupported] = useState(false);
  const [detectedUid, setDetectedUid] = useState<string>('');
  const [inputUid, setInputUid] = useState<string>('');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (!cliente) return;
    setInputUid(cliente.nfcUid || '');
    setDetectedUid('');
    setErrorMsg(null);
    setSuccessMsg(null);

    // Comprobar soporte Web NFC nativo
    if (typeof window !== 'undefined' && 'NDEFReader' in window) {
      setNfcSupported(true);
      startNfcScan();
    } else {
      setNfcSupported(false);
    }

    return () => {
      setIsScanning(false);
    };
  }, [cliente]);

  const startNfcScan = async () => {
    setErrorMsg(null);
    setSuccessMsg(null);
    setIsScanning(true);

    if (typeof window !== 'undefined' && 'NDEFReader' in window) {
      try {
        const ndef = new (window as any).NDEFReader();
        await ndef.scan();
        ndef.addEventListener('reading', ({ message, serialNumber }: any) => {
          if (navigator.vibrate) {
            navigator.vibrate([60, 40, 60]);
          }
          let uid = (serialNumber || '').trim().toUpperCase();
          if (!uid && message && message.records) {
            for (const record of message.records) {
              try {
                const textDecoder = new TextDecoder(record.encoding || 'utf-8');
                const text = textDecoder.decode(record.data);
                if (text && text.trim()) {
                  uid = text.trim().toUpperCase();
                  break;
                }
              } catch {}
            }
          }
          if (uid) {
            setDetectedUid(uid);
            setInputUid(uid);
            setSuccessMsg(`¡Tag NFC detectado con éxito! UID: ${uid}`);
          }
        });
      } catch (err: any) {
        console.warn('Error leyendo NFC en modal:', err);
        setErrorMsg('No se pudo activar el sensor NFC. Puedes ingresar o generar el UID manualmente abajo.');
        setIsScanning(false);
      }
    } else {
      setIsScanning(false);
    }
  };

  const handleSimularLectura = (tipo: 'tarjeta' | 'llavero' | 'celular') => {
    if (!cliente) return;
    if (navigator.vibrate) navigator.vibrate(50);
    // Generar UID simulado realista (ej. 04:A1:B2:C3:D4:E5 o TAG-NFC-XXXX)
    const randomHex = Array.from({ length: 4 }, () =>
      Math.floor(Math.random() * 256)
        .toString(16)
        .toUpperCase()
        .padStart(2, '0')
    ).join(':');

    const prefix = tipo === 'tarjeta' ? '04' : tipo === 'llavero' ? '2B' : 'E0';
    const fakeUid = `${prefix}:${randomHex}`;

    setDetectedUid(fakeUid);
    setInputUid(fakeUid);
    setSuccessMsg(`Tag NFC simulado (${tipo.toUpperCase()}) detectado: ${fakeUid}`);
    setErrorMsg(null);
  };

  const handleGuardar = async () => {
    if (!cliente) return;
    const cleanUid = inputUid.trim().toUpperCase();
    if (!cleanUid) {
      setErrorMsg('Debes ingresar o escanear un UID de tarjeta/tag NFC');
      return;
    }

    setIsSaving(true);
    setErrorMsg(null);
    try {
      const res = await store.vincularNfcCliente(cliente.id, cleanUid);
      if (res.success) {
        if (navigator.vibrate) navigator.vibrate([40, 80, 40]);
        setSuccessMsg(`¡Tarjeta NFC vinculada a ${cliente.nombre}!`);
        setTimeout(() => {
          onSuccess(cleanUid);
          onClose();
        }, 600);
      } else {
        setErrorMsg(res.message || 'Error al vincular tag NFC');
      }
    } catch (e: any) {
      setErrorMsg(e?.message || 'Error al guardar');
    } finally {
      setIsSaving(false);
    }
  };

  const handleDesvincular = async () => {
    if (!cliente) return;
    if (!window.confirm(`¿Deseas desvincular el tag NFC de ${cliente.nombre}?`)) return;
    setIsSaving(true);
    try {
      const res = await store.desvincularNfcCliente(cliente.id);
      if (res.success) {
        onSuccess('');
        onClose();
      } else {
        setErrorMsg(res.message || 'Error al desvincular');
      }
    } catch (e: any) {
      setErrorMsg(e?.message || 'Error al desvincular');
    } finally {
      setIsSaving(false);
    }
  };

  if (!cliente) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/70 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl max-w-md w-full overflow-hidden shadow-2xl border border-slate-100 animate-in zoom-in-95 duration-200 max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="bg-gradient-to-r from-indigo-700 via-indigo-800 to-purple-800 text-white p-5 relative shrink-0">
          <button
            type="button"
            onClick={onClose}
            className="absolute top-4 right-4 w-9 h-9 rounded-full bg-white/20 hover:bg-white/30 flex items-center justify-center transition text-white"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-white/20 backdrop-blur-md flex items-center justify-center text-white shadow-inner">
              <Wifi className="w-6 h-6 animate-pulse" />
            </div>
            <div className="min-w-0 pr-8">
              <h3 className="text-lg font-black leading-tight">Vincular Tarjeta NFC</h3>
              <p className="text-xs text-indigo-200 mt-0.5 truncate">
                Cliente: <span className="font-bold text-white">{cliente.nombre}</span> (#{cliente.id})
              </p>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="p-5 overflow-y-auto space-y-4">
          {/* Radar Animado */}
          <div className="relative p-5 rounded-2xl bg-gradient-to-b from-indigo-950 via-slate-900 to-indigo-900 text-white text-center overflow-hidden border border-indigo-700/60 shadow-inner flex flex-col items-center justify-center">
            <div className="absolute w-28 h-28 rounded-full border border-indigo-400/25 animate-ping pointer-events-none" />
            <div className="absolute w-20 h-20 rounded-full border border-indigo-300/35 animate-pulse pointer-events-none" />

            <div className="relative w-14 h-14 rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-600 shadow-lg shadow-indigo-500/40 flex items-center justify-center mb-2.5">
              <Radio className="w-7 h-7 text-white animate-pulse" />
            </div>

            <h4 className="font-black text-sm text-white">Acerca el Tag o Celular NFC</h4>
            <p className="text-[11px] text-indigo-200 max-w-xs mt-1">
              Coloca la tarjeta, sticker o llavero NFC del cliente en la parte trasera del teléfono para capturar su UID único.
            </p>

            <div className="mt-2.5 inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-indigo-500/20 border border-indigo-400/40 text-[10px] font-bold text-indigo-200">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
              <span>
                {nfcSupported
                  ? isScanning
                    ? 'Sensor Web NFC Escuchando en Vivo'
                    : 'Sensor NFC Listo'
                  : 'Modo Sensor Activo'}
              </span>
            </div>
          </div>

          {/* Feedback Messages */}
          {errorMsg && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-red-700 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0 text-red-600" />
              <span>{errorMsg}</span>
            </div>
          )}

          {successMsg && (
            <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-emerald-800 text-xs flex items-center gap-2 font-bold">
              <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-600" />
              <span>{successMsg}</span>
            </div>
          )}

          {/* Campo de UID */}
          <div className="space-y-1.5">
            <label className="block text-xs font-bold text-slate-800 uppercase tracking-wide">
              UID / Serial de Tarjeta NFC:
            </label>
            <div className="flex gap-2">
              <div className="relative flex-1">
                <Tag className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  value={inputUid}
                  onChange={e => setInputUid(e.target.value.toUpperCase())}
                  placeholder="Ej: 04:A1:B2:C3:D4 o NFC-0001..."
                  className="w-full pl-9 pr-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl font-mono font-bold text-xs text-slate-900 uppercase focus:outline-hidden focus:border-indigo-600 focus:bg-white focus:ring-1 focus:ring-indigo-600 transition"
                />
              </div>

              {nfcSupported && (
                <button
                  type="button"
                  onClick={startNfcScan}
                  className="px-3 py-2 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 border border-indigo-200 font-bold text-xs rounded-xl flex items-center gap-1 transition"
                  title="Reactivar escaneo NFC nativo"
                >
                  <Zap className="w-3.5 h-3.5" />
                  <span>Escanear</span>
                </button>
              )}
            </div>

            {cliente.nfcUid && (
              <p className="text-[11px] text-slate-500 font-medium">
                UID Actual registrado: <span className="font-mono font-bold text-slate-800">{cliente.nfcUid}</span>
              </p>
            )}
          </div>

          {/* Simulador rápido de Tag NFC (para pruebas sin hardware físico) */}
          <div className="bg-slate-50 p-3 rounded-2xl border border-slate-200 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-black uppercase text-slate-700 flex items-center gap-1">
                <Sparkles className="w-3.5 h-3.5 text-indigo-600" />
                <span>Simular Toque de Tag para Pruebas:</span>
              </span>
              <span className="text-[10px] text-slate-400">1-clic</span>
            </div>

            <div className="grid grid-cols-3 gap-1.5">
              <button
                type="button"
                onClick={() => handleSimularLectura('tarjeta')}
                className="py-2 px-2 bg-white hover:bg-indigo-50 border border-slate-200 hover:border-indigo-300 rounded-xl text-center text-xs font-bold text-slate-700 hover:text-indigo-700 transition active:scale-95 shadow-2xs"
              >
                💳 Tarjeta
              </button>
              <button
                type="button"
                onClick={() => handleSimularLectura('llavero')}
                className="py-2 px-2 bg-white hover:bg-indigo-50 border border-slate-200 hover:border-indigo-300 rounded-xl text-center text-xs font-bold text-slate-700 hover:text-indigo-700 transition active:scale-95 shadow-2xs"
              >
                🔑 Llavero
              </button>
              <button
                type="button"
                onClick={() => handleSimularLectura('celular')}
                className="py-2 px-2 bg-white hover:bg-indigo-50 border border-slate-200 hover:border-indigo-300 rounded-xl text-center text-xs font-bold text-slate-700 hover:text-indigo-700 transition active:scale-95 shadow-2xs"
              >
                📱 Celular
              </button>
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="p-4 bg-slate-50 border-t border-slate-200 flex items-center justify-between gap-2 shrink-0">
          {cliente.nfcUid ? (
            <button
              type="button"
              disabled={isSaving}
              onClick={handleDesvincular}
              className="py-2.5 px-3 bg-red-50 hover:bg-red-100 text-red-700 border border-red-200 rounded-xl font-bold text-xs flex items-center gap-1.5 transition active:scale-95"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Desvincular</span>
            </button>
          ) : (
            <div />
          )}

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onClose}
              className="py-2.5 px-4 bg-white hover:bg-slate-100 border border-slate-200 text-slate-700 font-bold text-xs rounded-xl transition"
            >
              Cancelar
            </button>

            <button
              type="button"
              disabled={isSaving || !inputUid.trim()}
              onClick={handleGuardar}
              className="py-2.5 px-5 bg-indigo-600 hover:bg-indigo-700 active:scale-95 disabled:opacity-50 text-white font-extrabold text-xs rounded-xl flex items-center gap-1.5 transition shadow-md shadow-indigo-600/25"
            >
              <Save className="w-3.5 h-3.5" />
              <span>{isSaving ? 'Guardando...' : 'Asociar NFC'}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
