import React, { useState, useEffect, useRef } from 'react';
import {
  User,
  QrCode,
  Wifi,
  Search,
  X,
  Camera,
  Upload,
  CheckCircle2,
  AlertCircle,
  Sparkles,
  Zap,
  Radio
} from 'lucide-react';
import jsQR from 'jsqr';
import { ClienteCalculado } from '../types';

interface ClientSearchScannerProps {
  clientes: ClienteCalculado[];
  activeMode: 'nombre' | 'qr' | 'nfc';
  onChangeMode: (mode: 'nombre' | 'qr' | 'nfc') => void;
  searchQuery: string;
  onSearchChange: (q: string) => void;
  onClientDetected: (cliente: ClienteCalculado, method: 'qr' | 'nfc') => void;
}

export const ClientSearchScanner: React.FC<ClientSearchScannerProps> = ({
  clientes,
  activeMode,
  onChangeMode,
  searchQuery,
  onSearchChange,
  onClientDetected
}) => {
  // Estados para Escáner QR
  const [cameraActive, setCameraActive] = useState(false);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [manualQrInput, setManualQrInput] = useState('');
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const animationFrameId = useRef<number | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  // Estados para Lector NFC
  const [nfcReading, setNfcReading] = useState(false);
  const [nfcError, setNfcError] = useState<string | null>(null);
  const [nfcSupported, setNfcSupported] = useState(false);
  const [nfcManualUid, setNfcManualUid] = useState('');
  const [nfcLastDetected, setNfcLastDetected] = useState<string | null>(null);

  // Chequeo de soporte nativo Web NFC
  useEffect(() => {
    if (typeof window !== 'undefined' && 'NDEFReader' in window) {
      setNfcSupported(true);
    } else {
      setNfcSupported(false);
    }
  }, []);

  // Limpieza y activación al cambiar de modo
  useEffect(() => {
    if (activeMode !== 'qr') {
      stopCamera();
    }
    if (activeMode !== 'nfc') {
      stopNfc();
    } else {
      startNfc();
    }
    return () => {
      stopCamera();
      stopNfc();
    };
  }, [activeMode]);

  // Manejo de Cámara QR en tiempo real
  const startCamera = async () => {
    setCameraError(null);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: { ideal: 'environment' } }
      });
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.setAttribute('playsinline', 'true');
        await videoRef.current.play();
        setCameraActive(true);
        scanQrLoop();
      }
    } catch (err: any) {
      console.warn('Error accediendo a cámara:', err);
      setCameraError('No se pudo acceder a la cámara. Puedes subir una foto del QR o ingresar el código.');
      setCameraActive(false);
    }
  };

  const stopCamera = () => {
    if (animationFrameId.current) {
      cancelAnimationFrame(animationFrameId.current);
      animationFrameId.current = null;
    }
    if (videoRef.current && videoRef.current.srcObject) {
      const stream = videoRef.current.srcObject as MediaStream;
      stream.getTracks().forEach(track => track.stop());
      videoRef.current.srcObject = null;
    }
    setCameraActive(false);
  };

  const scanQrLoop = () => {
    if (!videoRef.current || !canvasRef.current || videoRef.current.readyState !== videoRef.current.HAVE_ENOUGH_DATA) {
      animationFrameId.current = requestAnimationFrame(scanQrLoop);
      return;
    }

    const video = videoRef.current;
    const canvas = canvasRef.current;
    const context = canvas.getContext('2d', { willReadFrequently: true });

    if (context) {
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      context.drawImage(video, 0, 0, canvas.width, canvas.height);
      const imageData = context.getImageData(0, 0, canvas.width, canvas.height);
      const code = jsQR(imageData.data, imageData.width, imageData.height, {
        inversionAttempts: 'dontInvert'
      });

      if (code && code.data) {
        processDetectedQr(code.data);
        stopCamera();
        return;
      }
    }

    animationFrameId.current = requestAnimationFrame(scanQrLoop);
  };

  // Procesar código QR detectado
  const processDetectedQr = (rawQr: string) => {
    if (!rawQr) return;
    try {
      if (navigator.vibrate) navigator.vibrate([30, 40, 30]);
    } catch {}

    let clienteEncontrado: ClienteCalculado | undefined;

    // Intento 1: Es JSON con ID o código
    try {
      const parsed = JSON.parse(rawQr);
      if (parsed.id) {
        clienteEncontrado = clientes.find(c => c.id === Number(parsed.id));
      }
      if (!clienteEncontrado && parsed.telefono) {
        const tel = String(parsed.telefono).replace(/[^0-9]/g, '');
        clienteEncontrado = clientes.find(c => c.telefono.replace(/[^0-9]/g, '') === tel);
      }
    } catch {
      // No es JSON
    }

    // Intento 2: Búsqueda por ID numérico (#1, CLIENTE:1, QR-1-...)
    if (!clienteEncontrado) {
      const clean = rawQr.trim();
      clienteEncontrado = clientes.find(c => {
        const idStr = String(c.id);
        const telLimpio = c.telefono.replace(/[^0-9]/g, '');
        return (
          clean === idStr ||
          clean === `#${idStr}` ||
          clean === `CLIENTE:${idStr}` ||
          clean.includes(`QR-${idStr}`) ||
          clean.includes(`CLIENTE-${idStr}`) ||
          (telLimpio.length >= 7 && clean.includes(telLimpio)) ||
          clean.toLowerCase() === c.nombre.toLowerCase() ||
          (c.apodo && clean.toLowerCase() === c.apodo.toLowerCase())
        );
      });
    }

    if (clienteEncontrado) {
      onClientDetected(clienteEncontrado, 'qr');
    } else {
      setCameraError(`Código QR detectado ("${rawQr.slice(0, 30)}..."), pero no coincide con ningún cliente registrado.`);
    }
  };

  // Subir imagen con QR
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        canvas.width = img.width;
        canvas.height = img.height;
        const ctx = canvas.getContext('2d');
        if (ctx) {
          ctx.drawImage(img, 0, 0);
          const imgData = ctx.getImageData(0, 0, canvas.width, canvas.height);
          const code = jsQR(imgData.data, imgData.width, imgData.height);
          if (code && code.data) {
            processDetectedQr(code.data);
          } else {
            setCameraError('No se pudo encontrar ningún código QR legible en la imagen.');
          }
        }
      };
      img.src = event.target?.result as string;
    };
    reader.readAsDataURL(file);
  };

  // Lector Web NFC Real
  const startNfc = async () => {
    setNfcError(null);
    setNfcReading(true);

    if (typeof window !== 'undefined' && 'NDEFReader' in window) {
      try {
        const ndef = new (window as any).NDEFReader();
        await ndef.scan();
        ndef.addEventListener('reading', ({ message, serialNumber }: any) => {
          try {
            if (navigator.vibrate) navigator.vibrate([40, 80, 40]);
          } catch {}

          let tagPayload = serialNumber || '';
          if (message && message.records) {
            for (const record of message.records) {
              const textDecoder = new TextDecoder(record.encoding || 'utf-8');
              tagPayload += ' ' + textDecoder.decode(record.data);
            }
          }
          setNfcLastDetected(tagPayload);
          processDetectedNfc(tagPayload, serialNumber);
        });
      } catch (err: any) {
        console.warn('Error iniciando escaneo NFC nativo:', err);
        setNfcError('No se pudo activar el sensor NFC. Puedes usar la simulación táctil a continuación.');
      }
    } else {
      // Navegador sin API NDEFReader (ej. Desktop o Safari)
      // Mantenemos activo el modo de lectura virtual
    }
  };

  const stopNfc = () => {
    setNfcReading(false);
  };

  // Procesar lectura NFC
  const processDetectedNfc = (payload: string, serialNumber?: string) => {
    const cleanPayload = payload.trim().toLowerCase();
    const cleanSerial = (serialNumber || '').trim().toLowerCase();
    const norm = (s: string) => s.toLowerCase().replace(/[^a-z0-9]/g, '');
    const normPayload = norm(cleanPayload);
    const normSerial = norm(cleanSerial);

    const encontrado = clientes.find(c => {
      const idStr = String(c.id);
      const tel = c.telefono.replace(/[^0-9]/g, '');
      const uid = (c.nfcUid || '').toLowerCase();
      const normUid = norm(c.nfcUid || '');

      return (
        (normUid && (normPayload === normUid || normSerial === normUid || normPayload.includes(normUid) || normSerial.includes(normUid))) ||
        (uid && (cleanPayload.includes(uid) || cleanSerial.includes(uid))) ||
        cleanPayload.includes(`cliente:${idStr}`) ||
        cleanPayload.includes(`nfc-${idStr}`) ||
        cleanPayload === idStr ||
        (norm(idStr) && normPayload === norm(idStr)) ||
        (tel && (cleanPayload.includes(tel) || normPayload.includes(tel))) ||
        cleanPayload.includes(c.nombre.toLowerCase()) ||
        (c.apodo && cleanPayload.includes(c.apodo.toLowerCase()))
      );
    });

    if (encontrado) {
      if (navigator.vibrate) navigator.vibrate([40, 80, 40]);
      onClientDetected(encontrado, 'nfc');
    } else {
      setNfcError(`Tag NFC detectado (${serialNumber || payload.slice(0, 20)}), pero no está asignado a ningún cliente.`);
    }
  };

  return (
    <div className="space-y-3">
      {/* Selector de Modo: [ Nombre ]  [ QR ]  [ NFC ] */}
      <div className="bg-white p-1 rounded-2xl border border-slate-200/90 shadow-2xs flex gap-1 w-full select-none">
        <button
          type="button"
          onClick={() => onChangeMode('nombre')}
          className={`flex-1 min-h-[42px] py-2 px-1.5 sm:px-3 rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5 whitespace-nowrap shrink-0 min-w-0 touch-manipulation cursor-pointer ${
            activeMode === 'nombre'
              ? 'bg-blue-600 text-white shadow-sm font-black'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
          }`}
        >
          <User className="w-3.5 h-3.5 sm:w-4 sm:h-4 shrink-0" />
          <span className="whitespace-nowrap break-keep tracking-normal">Nombre</span>
        </button>

        <button
          type="button"
          onClick={() => {
            onChangeMode('qr');
            startCamera();
          }}
          className={`flex-1 min-h-[42px] py-2 px-1.5 sm:px-3 rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5 whitespace-nowrap shrink-0 min-w-0 touch-manipulation cursor-pointer ${
            activeMode === 'qr'
              ? 'bg-blue-600 text-white shadow-sm font-black'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
          }`}
        >
          <QrCode className="w-3.5 h-3.5 sm:w-4 sm:h-4 shrink-0" />
          <span className="whitespace-nowrap break-keep tracking-normal">QR</span>
        </button>

        <button
          type="button"
          onClick={() => {
            onChangeMode('nfc');
            startNfc();
          }}
          className={`flex-1 min-h-[42px] py-2 px-1.5 sm:px-3 rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5 whitespace-nowrap shrink-0 min-w-0 touch-manipulation cursor-pointer ${
            activeMode === 'nfc'
              ? 'bg-blue-600 text-white shadow-sm font-black'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
          }`}
        >
          <Wifi className="w-3.5 h-3.5 sm:w-4 sm:h-4 shrink-0" />
          <span className="whitespace-nowrap break-keep tracking-normal">NFC</span>
        </button>
      </div>

      {/* ============================================================ */}
      {/* 1. MODO: BÚSQUEDA POR NOMBRE / APODO / TELÉFONO */}
      {/* ============================================================ */}
      {activeMode === 'nombre' && (
        <div className="relative">
          <Search className="w-5 h-5 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={e => onSearchChange(e.target.value)}
            placeholder="Buscar por nombre, apodo o teléfono..."
            className="w-full pl-11 pr-10 py-3.5 bg-white text-slate-900 rounded-2xl text-xs sm:text-sm font-medium border-2 border-slate-200 placeholder-slate-400 focus:outline-hidden focus:border-blue-600 shadow-2xs transition"
          />
          {searchQuery && (
            <button
              type="button"
              onClick={() => onSearchChange('')}
              className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-1"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>
      )}

      {/* ============================================================ */}
      {/* 2. MODO: ESCÁNER QR CON CÁMARA & SIMULADOR */}
      {/* ============================================================ */}
      {activeMode === 'qr' && (
        <div className="bg-white rounded-3xl p-4 sm:p-5 border-2 border-blue-200 shadow-sm space-y-4 animate-in fade-in zoom-in-95 duration-200">
          <div className="flex items-center justify-between pb-2 border-b border-slate-100">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-xl bg-blue-100 text-blue-700 flex items-center justify-center font-bold">
                <QrCode className="w-4 h-4" />
              </div>
              <div>
                <h4 className="font-black text-xs sm:text-sm text-slate-900">Escáner de Código QR</h4>
                <p className="text-[10px] text-slate-500">Apunta la cámara al código QR de la tarjeta del cliente</p>
              </div>
            </div>
            <button
              type="button"
              onClick={() => onChangeMode('nombre')}
              className="text-xs text-slate-400 hover:text-slate-600 p-1"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Visor de Cámara */}
          <div className="relative rounded-2xl overflow-hidden bg-slate-950 aspect-4/3 max-h-64 flex items-center justify-center border-2 border-blue-500/40 shadow-inner">
            <video ref={videoRef} className="w-full h-full object-cover" />
            <canvas ref={canvasRef} className="hidden" />

            {cameraActive ? (
              <>
                {/* Cuadro de enfoque de QR */}
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                  <div className="w-44 h-44 border-2 border-emerald-400 rounded-2xl relative shadow-[0_0_20px_rgba(16,185,129,0.3)]">
                    {/* Esquinas destacadas */}
                    <div className="absolute -top-1 -left-1 w-4 h-4 border-t-3 border-l-3 border-emerald-400 rounded-tl-sm" />
                    <div className="absolute -top-1 -right-1 w-4 h-4 border-t-3 border-r-3 border-emerald-400 rounded-tr-sm" />
                    <div className="absolute -bottom-1 -left-1 w-4 h-4 border-b-3 border-l-3 border-emerald-400 rounded-bl-sm" />
                    <div className="absolute -bottom-1 -right-1 w-4 h-4 border-b-3 border-r-3 border-emerald-400 rounded-br-sm" />

                    {/* Línea de escaneo láser animada */}
                    <div className="w-full h-0.5 bg-gradient-to-r from-transparent via-emerald-400 to-transparent shadow-[0_0_8px_#34d399] animate-pulse" />
                  </div>
                </div>

                <div className="absolute bottom-2.5 left-0 right-0 text-center">
                  <span className="bg-black/70 backdrop-blur-md text-emerald-400 font-bold text-[10px] px-3 py-1 rounded-full border border-emerald-500/30">
                    Buscando código QR en vivo...
                  </span>
                </div>
              </>
            ) : (
              <div className="p-6 text-center text-white space-y-3">
                <Camera className="w-10 h-10 text-blue-400 mx-auto opacity-75" />
                <div className="text-xs font-bold text-slate-300">
                  {cameraError || 'Cámara pausada o esperando permiso'}
                </div>
                <button
                  type="button"
                  onClick={startCamera}
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 active:scale-95 text-white font-bold text-xs rounded-xl shadow-md transition"
                >
                  Activar Cámara
                </button>
              </div>
            )}
          </div>

          {/* Acciones de Apoyo: Subir imagen o Código manual */}
          <div className="flex gap-2">
            {cameraActive ? (
              <button
                type="button"
                onClick={stopCamera}
                className="flex-1 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-xl transition"
              >
                Pausar Cámara
              </button>
            ) : (
              <button
                type="button"
                onClick={startCamera}
                className="flex-1 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl transition shadow-xs"
              >
                Iniciar Cámara
              </button>
            )}

            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="px-3.5 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-xl flex items-center gap-1.5 transition"
              title="Subir foto con código QR"
            >
              <Upload className="w-3.5 h-3.5 text-blue-600" />
              <span>Subir Foto</span>
            </button>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleFileUpload}
              className="hidden"
            />
          </div>

          {/* Entrada de Código QR Manual / Simulado */}
          <div className="pt-2 border-t border-slate-100">
            <div className="text-[11px] font-bold text-slate-700 mb-1.5 flex items-center justify-between">
              <span>O pega/escribe el código del QR:</span>
              <span className="text-[10px] text-slate-400 font-normal">Ej. ID o Teléfono</span>
            </div>
            <div className="flex gap-1.5">
              <input
                type="text"
                value={manualQrInput}
                onChange={e => setManualQrInput(e.target.value)}
                placeholder="Código del cliente..."
                className="flex-1 px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-800 focus:outline-hidden focus:border-blue-600"
              />
              <button
                type="button"
                onClick={() => {
                  if (manualQrInput.trim()) {
                    processDetectedQr(manualQrInput.trim());
                    setManualQrInput('');
                  }
                }}
                className="px-3 py-2 bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold rounded-xl"
              >
                Buscar
              </button>
            </div>
          </div>

          {/* Simulador rápido de QR para pruebas */}
          <div className="bg-slate-50 p-2.5 rounded-2xl border border-slate-100 space-y-1.5">
            <div className="text-[10px] font-bold text-slate-600 uppercase tracking-wide flex items-center gap-1">
              <Sparkles className="w-3 h-3 text-amber-500" />
              <span>Prueba Rápida de Escaneo QR:</span>
            </div>
            <div className="flex flex-wrap gap-1.5 max-h-24 overflow-y-auto">
              {clientes.slice(0, 4).map(c => (
                <button
                  key={c.id}
                  type="button"
                  onClick={() => processDetectedQr(String(c.id))}
                  className="px-2.5 py-1 bg-white hover:bg-blue-50 text-blue-700 border border-blue-200 rounded-lg text-[10px] font-bold flex items-center gap-1 shadow-2xs transition active:scale-95"
                >
                  <QrCode className="w-2.5 h-2.5 text-blue-600" />
                  <span>{c.nombre} {c.apodo && `(${c.apodo})`}</span>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ============================================================ */}
      {/* 3. MODO: LECTOR NFC CON RADAR & SIMULADOR DE CHIP */}
      {/* ============================================================ */}
      {activeMode === 'nfc' && (
        <div className="bg-white rounded-3xl p-4 sm:p-5 border-2 border-indigo-200 shadow-sm space-y-4 animate-in fade-in zoom-in-95 duration-200">
          <div className="flex items-center justify-between pb-2 border-b border-slate-100">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-xl bg-indigo-100 text-indigo-700 flex items-center justify-center font-bold">
                <Wifi className="w-4 h-4" />
              </div>
              <div>
                <h4 className="font-black text-xs sm:text-sm text-slate-900">Lector de Tarjetas / Llaveros NFC</h4>
                <p className="text-[10px] text-slate-500">
                  {nfcSupported
                    ? 'Sensor Web NFC activado. Acerca la tarjeta o celular al dispositivo'
                    : 'Modo NFC activo. Acerca un tag NFC o simula el toque de tarjeta'}
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={() => onChangeMode('nombre')}
              className="text-xs text-slate-400 hover:text-slate-600 p-1"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Radar Animado de Detección NFC */}
          <div className="relative p-6 sm:p-8 rounded-2xl bg-gradient-to-b from-indigo-900 via-slate-900 to-indigo-950 text-white text-center overflow-hidden border border-indigo-700/50 shadow-inner flex flex-col items-center justify-center">
            {/* Ondas concéntricas de pulso NFC */}
            <div className="absolute w-36 h-36 rounded-full border border-indigo-400/20 animate-ping pointer-events-none" />
            <div className="absolute w-24 h-24 rounded-full border border-indigo-300/30 animate-pulse pointer-events-none" />

            {/* Ícono central de chip NFC */}
            <div className="relative w-16 h-16 rounded-2xl bg-gradient-to-br from-indigo-500 to-blue-600 shadow-lg shadow-indigo-500/40 flex items-center justify-center mb-3">
              <Radio className="w-8 h-8 text-white animate-pulse" />
            </div>

            <h5 className="font-black text-sm text-white">Lector NFC Escuchando</h5>
            <p className="text-[11px] text-indigo-200 max-w-xs mt-1">
              Acerca la tarjeta, llavero o celular del cliente a la parte trasera del dispositivo para identificación inmediata.
            </p>

            <div className="mt-3 inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-indigo-500/20 border border-indigo-400/40 text-[10px] font-bold text-indigo-200">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
              <span>{nfcReading ? 'Sensor Activo y Listo' : 'Listo para Lectura'}</span>
            </div>
          </div>

          {nfcError && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-red-700 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0 text-red-600" />
              <span>{nfcError}</span>
            </div>
          )}

          {/* Botones de control NFC */}
          <div className="flex gap-2">
            <button
              type="button"
              onClick={startNfc}
              className="flex-1 py-3 bg-indigo-600 hover:bg-indigo-700 active:scale-98 text-white font-bold text-xs rounded-xl transition shadow-md flex items-center justify-center gap-1.5"
            >
              <Zap className="w-3.5 h-3.5" />
              <span>{nfcSupported ? 'Reiniciar Lector NFC' : 'Escanear Sensor NFC'}</span>
            </button>
          </div>

          {/* Tarjetas NFC Virtuales para Simulación Táctil */}
          <div className="bg-slate-50 p-3 rounded-2xl border border-slate-200 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-extrabold text-slate-700 uppercase tracking-wide flex items-center gap-1">
                <Sparkles className="w-3.5 h-3.5 text-indigo-600" />
                <span>Simular Toque de Tarjeta NFC:</span>
              </span>
              <span className="text-[10px] text-slate-400">Haz clic para probar</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-36 overflow-y-auto pr-1">
              {clientes.slice(0, 6).map(c => (
                <button
                  key={c.id}
                  type="button"
                  onClick={() => {
                    processDetectedNfc(c.nfcUid || `NFC-${c.id}`, c.nfcUid);
                  }}
                  className="p-2.5 bg-white hover:bg-indigo-50 border border-slate-200 hover:border-indigo-300 rounded-xl text-left transition active:scale-95 shadow-2xs group flex items-center justify-between"
                >
                  <div className="min-w-0">
                    <div className="text-xs font-bold text-slate-800 truncate group-hover:text-indigo-700">
                      {c.nombre}
                    </div>
                    <div className="text-[10px] text-slate-400 font-mono">
                      {c.nfcUid || `NFC-${c.id.toString().padStart(4, '0')}`} {c.apodo && `· ${c.apodo}`}
                    </div>
                  </div>
                  <div className="w-6 h-6 rounded-lg bg-indigo-100 text-indigo-600 flex items-center justify-center shrink-0 ml-2 group-hover:bg-indigo-600 group-hover:text-white transition">
                    <Wifi className="w-3 h-3" />
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Entrada Manual de UID NFC */}
          <div className="pt-2 border-t border-slate-100">
            <div className="text-[11px] font-bold text-slate-700 mb-1 flex items-center justify-between">
              <span>Ingresar UID o Serial de Tarjeta NFC Manualmente:</span>
            </div>
            <div className="flex gap-1.5">
              <input
                type="text"
                value={nfcManualUid}
                onChange={e => setNfcManualUid(e.target.value)}
                placeholder="Ej. NFC-0001 o ID de cliente..."
                className="flex-1 px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-800 focus:outline-hidden focus:border-indigo-600"
              />
              <button
                type="button"
                onClick={() => {
                  if (nfcManualUid.trim()) {
                    processDetectedNfc(nfcManualUid.trim(), nfcManualUid.trim());
                    setNfcManualUid('');
                  }
                }}
                className="px-3.5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-xl"
              >
                Validar NFC
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
