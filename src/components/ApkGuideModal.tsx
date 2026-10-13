import React, { useState } from 'react';
import { Download, Smartphone, Check, Copy, ExternalLink, X, ShieldAlert, Sparkles, Layers } from 'lucide-react';
import { usePWAInstall } from '../hooks/usePWAInstall';

interface ApkGuideModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ApkGuideModal: React.FC<ApkGuideModalProps> = ({ isOpen, onClose }) => {
  const { isInstallable, install, isInstalled } = usePWAInstall();
  const [copiedUrl, setCopiedUrl] = useState(false);
  const currentUrl = typeof window !== 'undefined' ? window.location.origin : '';

  if (!isOpen) return null;

  const handleCopyUrl = () => {
    navigator.clipboard.writeText(currentUrl);
    setCopiedUrl(true);
    setTimeout(() => setCopiedUrl(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-xs p-4 overflow-y-auto">
      <div className="w-full max-w-lg bg-white rounded-3xl shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200 my-8">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-700 via-blue-600 to-indigo-700 p-6 text-white relative">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 w-9 h-9 rounded-full bg-white/20 hover:bg-white/30 text-white flex items-center justify-center transition"
          >
            <X className="w-5 h-5" />
          </button>
          <div className="flex items-center gap-3 mb-2">
            <div className="w-12 h-12 rounded-2xl bg-white/20 backdrop-blur-md flex items-center justify-center">
              <Smartphone className="w-6 h-6 text-yellow-300" />
            </div>
            <div>
              <h3 className="text-xl font-black">Cómo crear la APK</h3>
              <p className="text-blue-100 text-xs">Instala en Android o compila tu archivo .APK</p>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6 max-h-[75vh] overflow-y-auto">
          {/* Method 1: Direct Android Install (WebAPK) */}
          <div className="border border-blue-200 bg-blue-50/60 rounded-2xl p-4">
            <div className="flex items-center gap-2 mb-2">
              <span className="w-6 h-6 rounded-full bg-blue-600 text-white text-xs font-bold flex items-center justify-center">1</span>
              <h4 className="font-bold text-slate-900 text-sm">Método Rápido: Instalar directo en Android (WebAPK)</h4>
            </div>
            <p className="text-xs text-slate-600 mb-3 leading-relaxed">
              Android genera automáticamente una <strong>APK nativa</strong> en el teléfono sin necesidad de descargar archivos externos. Funciona con icono propio, pantalla completa y acceso offline.
            </p>
            {isInstallable ? (
              <button
                onClick={install}
                className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold text-sm flex items-center justify-center gap-2 shadow-md transition"
              >
                <Download className="w-4 h-4" />
                Instalar ahora en este celular
              </button>
            ) : isInstalled ? (
              <div className="bg-emerald-100 text-emerald-800 text-xs font-semibold px-3 py-2 rounded-xl flex items-center gap-2">
                <Check className="w-4 h-4 text-emerald-600" />
                ¡Esta app ya está instalada en tu dispositivo!
              </div>
            ) : (
              <div className="text-xs text-slate-500 bg-white border border-slate-200 rounded-xl p-3">
                👉 En Chrome para Android: Pulsa los <strong>3 puntos (⋮)</strong> en la esquina superior y selecciona <strong>"Instalar aplicación"</strong> o <strong>"Añadir a pantalla de inicio"</strong>.
              </div>
            )}
          </div>

          {/* Method 2: Generate standalone .APK with PWABuilder */}
          <div className="border border-amber-200 bg-amber-50/50 rounded-2xl p-4">
            <div className="flex items-center gap-2 mb-2">
              <span className="w-6 h-6 rounded-full bg-amber-600 text-white text-xs font-bold flex items-center justify-center">2</span>
              <h4 className="font-bold text-slate-900 text-sm">Método Oficial: Descargar archivo .APK listo</h4>
            </div>
            <p className="text-xs text-slate-600 mb-3 leading-relaxed">
              Usa la herramienta oficial gratuita de Microsoft/Google <strong>PWABuilder</strong> para empaquetar esta web en un instalador <strong>.APK</strong> o <strong>.AAB</strong> para Google Play:
            </p>

            <ol className="text-xs text-slate-700 space-y-2 list-decimal list-inside bg-white p-3.5 rounded-xl border border-amber-200/80 mb-3">
              <li>
                Copia la URL de tu aplicación:
                <div className="flex items-center gap-2 mt-1.5 mb-1.5">
                  <input
                    type="text"
                    readOnly
                    value={currentUrl}
                    className="flex-1 bg-slate-100 border border-slate-300 rounded-lg px-2.5 py-1.5 text-[11px] font-mono text-slate-700"
                  />
                  <button
                    onClick={handleCopyUrl}
                    className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-bold flex items-center gap-1 transition"
                  >
                    {copiedUrl ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                    {copiedUrl ? 'Copiado' : 'Copiar'}
                  </button>
                </div>
              </li>
              <li>Abre <strong>PWABuilder.com</strong> y pega el enlace copiado.</li>
              <li>Haz clic en <strong>"Start"</strong> y luego en <strong>"Package for Android"</strong>.</li>
              <li>¡Listo! Descarga el archivo <strong>.apk</strong> e instálalo en cualquier teléfono Android.</li>
            </ol>

            <a
              href="https://www.pwabuilder.com"
              target="_blank"
              rel="noopener noreferrer"
              className="w-full py-2.5 bg-amber-600 hover:bg-amber-700 text-white rounded-xl font-bold text-xs flex items-center justify-center gap-2 transition"
            >
              <ExternalLink className="w-4 h-4" />
              Abrir PWABuilder.com en una nueva pestaña
            </a>
          </div>

          {/* Method 3: Capacitor / Android Studio */}
          <div className="border border-slate-200 bg-slate-50 rounded-2xl p-4 text-xs text-slate-600">
            <div className="flex items-center gap-2 mb-1.5">
              <span className="w-6 h-6 rounded-full bg-slate-700 text-white text-xs font-bold flex items-center justify-center">3</span>
              <h4 className="font-bold text-slate-900 text-sm">Método Desarrollador (Capacitor / Android Studio)</h4>
            </div>
            <p className="leading-relaxed">
              Si prefieres compilar con código nativo en tu computadora:
              <br />
              <code className="bg-slate-200 text-slate-800 px-2 py-0.5 rounded text-[11px] font-mono mt-1 inline-block">
                npx cap init "Colmado DAVID" com.colmado.david
              </code>
              <br />
              <code className="bg-slate-200 text-slate-800 px-2 py-0.5 rounded text-[11px] font-mono mt-1 inline-block">
                npx cap add android && npx cap open android
              </code>
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-slate-100 bg-slate-50 flex justify-end">
          <button
            onClick={onClose}
            className="px-6 py-2.5 bg-slate-800 hover:bg-slate-900 text-white font-bold rounded-xl text-sm transition"
          >
            Cerrar
          </button>
        </div>
      </div>
    </div>
  );
};
