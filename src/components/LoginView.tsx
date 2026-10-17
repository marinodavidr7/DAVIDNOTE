import React, { useState } from 'react';
import {
  ShoppingBag,
  User,
  Shield,
  Phone,
  Lock,
  Mail,
  Eye,
  EyeOff,
  Smartphone,
  CheckCircle2,
  KeyRound,
  MapPin,
  Clock
} from 'lucide-react';
import { DatosColmado } from '../types';

interface LoginViewProps {
  initialRole?: 'client' | 'admin';
  onAdminLogin: (e: React.FormEvent) => Promise<void>;
  onClientLogin: (e: React.FormEvent) => Promise<void>;
  onOpenApkGuide: () => void;
  datosColmado: DatosColmado;
  adminEmail: string;
  setAdminEmail: (v: string) => void;
  adminPass: string;
  setAdminPass: (v: string) => void;
  adminRemember: boolean;
  setAdminRemember: (v: boolean) => void;
  clientPhone: string;
  setClientPhone: (v: string) => void;
  clientPin: string;
  setClientPin: (v: string) => void;
  clientRemember: boolean;
  setClientRemember: (v: boolean) => void;
  isSubmitting: boolean;
  onRoleChanged?: (role: 'client' | 'admin') => void;
}

const ColmadoIllustration = () => (
  <svg viewBox="0 0 420 320" className="w-full h-auto" role="img" aria-label="Ilustración de colmado">
    <ellipse cx="210" cy="272" rx="165" ry="20" fill="#dbeafe" />
    <circle cx="342" cy="66" r="26" fill="#fde68a" />
    <rect x="98" y="112" width="224" height="150" rx="16" fill="#ffffff" stroke="#bfdbfe" strokeWidth="3" />
    <path d="M86 112h248l-16-44H102z" fill="#2563eb" />
    <path d="M102 68h31l-7 44h-31z" fill="#3b82f6" />
    <path d="M164 68h31l-7 44h-31z" fill="#3b82f6" />
    <path d="M226 68h31l-7 44h-31z" fill="#3b82f6" />
    <path d="M288 68h30l-7 44h-31z" fill="#3b82f6" />
    <rect x="140" y="126" width="140" height="30" rx="9" fill="#1e3a8a" />
    <text x="210" y="147" textAnchor="middle" fill="#ffffff" fontSize="15" fontWeight="800" fontFamily="sans-serif">COLMADO</text>
    <rect x="118" y="176" width="52" height="46" rx="8" fill="#dbeafe" stroke="#93c5fd" strokeWidth="2" />
    <rect x="250" y="176" width="52" height="46" rx="8" fill="#dbeafe" stroke="#93c5fd" strokeWidth="2" />
    <rect x="186" y="182" width="48" height="80" rx="8" fill="#e0e7ff" stroke="#a5b4fc" strokeWidth="2" />
    <circle cx="226" cy="224" r="3.2" fill="#6366f1" />
    <circle cx="354" cy="182" r="24" fill="#fbbf24" stroke="#f59e0b" strokeWidth="3" />
    <text x="354" y="191" textAnchor="middle" fill="#92400e" fontSize="22" fontWeight="800" fontFamily="sans-serif">$</text>
    <circle cx="332" cy="216" r="17" fill="#fcd34d" stroke="#f59e0b" strokeWidth="3" />
    <text x="332" y="223" textAnchor="middle" fill="#92400e" fontSize="15" fontWeight="800" fontFamily="sans-serif">$</text>
    <g transform="translate(56,192)">
      <rect x="0" y="16" width="52" height="54" rx="11" fill="#34d399" />
      <path d="M13 18a13 13 0 0 1 26 0" fill="none" stroke="#065f46" strokeWidth="4" strokeLinecap="round" />
      <rect x="13" y="15" width="26" height="7" rx="3.5" fill="#10b981" />
    </g>
  </svg>
);

export const LoginView: React.FC<LoginViewProps> = ({
  initialRole = 'client',
  onAdminLogin,
  onClientLogin,
  onOpenApkGuide,
  datosColmado,
  adminEmail,
  setAdminEmail,
  adminPass,
  setAdminPass,
  adminRemember,
  setAdminRemember,
  clientPhone,
  setClientPhone,
  clientPin,
  setClientPin,
  clientRemember,
  setClientRemember,
  isSubmitting,
  onRoleChanged
}) => {
  const [role, setRole] = useState<'client' | 'admin'>(initialRole);
  const [showAdminPass, setShowAdminPass] = useState(false);
  const [showClientPin, setShowClientPin] = useState(false);

  const handleRoleSwitch = (newRole: 'client' | 'admin') => {
    if (navigator.vibrate) navigator.vibrate(10);
    setRole(newRole);
    if (onRoleChanged) onRoleChanged(newRole);
  };

  return (
    <div className="w-full flex-1 flex flex-col lg:grid lg:grid-cols-2 relative bg-slate-50 text-slate-800 min-h-[100dvh]">
      {/* Panel de ilustración (solo desktop lg+) */}
      <div className="hidden lg:flex flex-col justify-between p-12 xl:p-16 relative overflow-hidden bg-gradient-to-br from-blue-50 via-indigo-50 to-sky-100 border-r border-slate-200/70">
        <div className="absolute -top-24 -right-24 w-80 h-80 bg-blue-200/50 rounded-full blur-3xl pointer-events-none"></div>
        <div className="absolute -bottom-28 -left-24 w-80 h-80 bg-indigo-200/50 rounded-full blur-3xl pointer-events-none"></div>

        <div className="relative z-10 flex items-center gap-3">
          <div className="w-14 h-14 bg-gradient-to-br from-blue-600 to-indigo-700 rounded-2xl flex items-center justify-center shadow-lg shadow-blue-500/25 shrink-0">
            <ShoppingBag className="w-7 h-7 text-white" />
          </div>
          <div className="min-w-0">
            <h1 className="text-2xl font-black text-slate-900 tracking-tight truncate">{datosColmado.nombre}</h1>
            <p className="text-xs text-slate-500 font-medium truncate">{datosColmado.slogan}</p>
          </div>
        </div>

        <div className="relative z-10 max-w-md">
          <div className="max-w-sm mx-auto mb-6"><ColmadoIllustration /></div>
          <h2 className="text-3xl xl:text-4xl font-black leading-[1.15] text-slate-900">
            {role === 'client' ? 'Tu fiado, siempre a la mano.' : 'Control total de tu colmado.'}
          </h2>
          <p className="text-slate-600 text-sm leading-relaxed mt-3">
            {role === 'client'
              ? 'Consulta tu balance, tus movimientos y abonos desde cualquier dispositivo, sin filas ni papeleo.'
              : 'Registra fiados y abonos, administra clientes y cobra a tiempo desde un solo panel.'}
          </p>
          <div className="space-y-2.5 text-sm text-slate-600 pt-4">
            <div className="flex items-center gap-2.5"><MapPin className="w-4 h-4 text-blue-600 shrink-0" /><span className="truncate">{datosColmado.direccion}</span></div>
            <div className="flex items-center gap-2.5"><Clock className="w-4 h-4 text-indigo-500 shrink-0" /><span className="truncate">{datosColmado.horario}</span></div>
            <div className="flex items-center gap-2.5"><Phone className="w-4 h-4 text-amber-500 shrink-0" /><span className="truncate">{datosColmado.telefono}</span></div>
          </div>
        </div>

        <div className="relative z-10 flex items-center gap-1.5 text-[11px] text-slate-500">
          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
          <span>Acceso seguro y cifrado · v2.2</span>
        </div>
      </div>

      {/* Columna del formulario */}
      <div className="w-full flex-1 flex flex-col justify-between bg-white p-4 sm:p-6 lg:p-10">
        {/* Top Navigation Bar */}
        <div className="w-full max-w-md mx-auto flex items-center justify-end pt-1 pb-4">
          <button
            type="button"
            onClick={onOpenApkGuide}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-amber-50 hover:bg-amber-100 text-amber-700 font-bold text-xs transition border border-amber-200 active:scale-95"
          >
            <Smartphone className="w-3.5 h-3.5" />
            <span>App / APK</span>
          </button>
        </div>

        {/* Login Card */}
        <div className="relative w-full max-w-md mx-auto my-auto bg-white border border-slate-200 shadow-xl shadow-slate-200/60 rounded-3xl p-6 sm:p-8">
          {/* Brand Header */}
          <div className="text-center mb-6">
            <div className="w-16 h-16 sm:w-20 sm:h-20 bg-gradient-to-br from-blue-600 via-indigo-600 to-blue-700 rounded-2xl sm:rounded-3xl mx-auto mb-3 flex items-center justify-center shadow-xl shadow-blue-500/25">
              {role === 'client' ? (
                <ShoppingBag className="w-8 h-8 sm:w-10 sm:h-10 text-white" />
              ) : (
                <Shield className="w-8 h-8 sm:w-10 sm:h-10 text-white" />
              )}
            </div>
            <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
              {datosColmado.nombre}
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 font-medium mt-1">
              {role === 'client'
                ? 'Consulta tu balance de fiado e historial'
                : 'Acceso para administración y cobros'}
            </p>
          </div>

          {/* Role Toggle Selector */}
          <div className="grid grid-cols-2 bg-slate-100 p-1.5 rounded-2xl border border-slate-200 mb-6 gap-1.5">
            <button
              type="button"
              onClick={() => handleRoleSwitch('client')}
              className={`py-2.5 px-3 rounded-xl text-xs sm:text-sm font-bold transition flex items-center justify-center gap-2 touch-manipulation cursor-pointer ${
                role === 'client'
                  ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/30 font-black'
                  : 'text-slate-500 hover:text-slate-800 hover:bg-white/70'
              }`}
            >
              <User className="w-4 h-4" />
              <span className="whitespace-nowrap">Soy Cliente</span>
            </button>
            <button
              type="button"
              onClick={() => handleRoleSwitch('admin')}
              className={`py-2.5 px-3 rounded-xl text-xs sm:text-sm font-bold transition flex items-center justify-center gap-2 touch-manipulation cursor-pointer ${
                role === 'admin'
                  ? 'bg-gradient-to-r from-indigo-600 to-blue-700 text-white shadow-lg shadow-indigo-600/30 font-black'
                  : 'text-slate-500 hover:text-slate-800 hover:bg-white/70'
              }`}
            >
              <Shield className="w-4 h-4" />
              <span className="whitespace-nowrap">Soy Colmadero</span>
            </button>
          </div>

          {/* CLIENT FORM */}
          {role === 'client' && (
            <form onSubmit={onClientLogin} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5 flex items-center justify-between">
                  <span>Número de Teléfono</span>
                  <span className="text-[10px] text-blue-600 font-semibold normal-case">Registrado en colmado</span>
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                    <Phone className="w-4 h-4" />
                  </div>
                  <input
                    type="tel"
                    value={clientPhone}
                    onChange={e => setClientPhone(e.target.value)}
                    placeholder="829 555 0101"
                    className="w-full pl-10 pr-4 py-3.5 bg-slate-50 border-2 border-slate-200 rounded-2xl text-base font-semibold text-slate-800 placeholder-slate-400 focus:border-blue-600 focus:bg-white focus:outline-hidden transition"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5 flex items-center justify-between">
                  <span>PIN de 4 dígitos</span>
                  <button
                    type="button"
                    onClick={() => setShowClientPin(!showClientPin)}
                    className="text-[11px] text-blue-600 hover:text-blue-700 font-bold flex items-center gap-1"
                  >
                    {showClientPin ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                    <span>{showClientPin ? 'Ocultar' : 'Mostrar'}</span>
                  </button>
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                    <KeyRound className="w-4 h-4" />
                  </div>
                  <input
                    type={showClientPin ? 'text' : 'password'}
                    maxLength={4}
                    value={clientPin}
                    onChange={e => setClientPin(e.target.value.replace(/[^0-9]/g, ''))}
                    placeholder="••••"
                    className="w-full pl-10 pr-10 py-3.5 bg-slate-50 border-2 border-slate-200 rounded-2xl text-center text-xl tracking-widest font-black text-slate-800 placeholder-slate-300 focus:border-blue-600 focus:bg-white focus:outline-hidden transition"
                    required
                  />
                </div>
                <p className="text-[11px] text-slate-400 mt-1 pl-1">
                  PIN inicial predeterminado: <strong className="text-blue-600">1234</strong>
                </p>
              </div>

              <div className="flex items-center justify-between pt-1">
                <label className="flex items-center gap-2.5 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={clientRemember}
                    onChange={e => setClientRemember(e.target.checked)}
                    className="w-4 h-4 rounded text-blue-600 border-slate-300 bg-white focus:ring-0"
                  />
                  <span className="text-xs font-medium text-slate-600">Recordar mi teléfono</span>
                </label>
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full py-4 mt-2 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-black rounded-2xl text-base shadow-xl shadow-blue-600/25 active:scale-[0.98] transition disabled:opacity-50 flex items-center justify-center gap-2 cursor-pointer touch-manipulation"
              >
                {isSubmitting ? (
                  <>
                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                    <span>Verificando...</span>
                  </>
                ) : (
                  <>
                    <User className="w-5 h-5" />
                    <span>Consultar Mi Cuenta</span>
                  </>
                )}
              </button>
            </form>
          )}

          {/* ADMIN FORM */}
          {role === 'admin' && (
            <form onSubmit={onAdminLogin} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">
                  Correo Electrónico
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                    <Mail className="w-4 h-4" />
                  </div>
                  <input
                    type="email"
                    value={adminEmail}
                    onChange={e => setAdminEmail(e.target.value)}
                    placeholder="admin@colmado.com"
                    className="w-full pl-10 pr-4 py-3.5 bg-slate-50 border-2 border-slate-200 rounded-2xl text-base font-semibold text-slate-800 placeholder-slate-400 focus:border-blue-600 focus:bg-white focus:outline-hidden transition"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5 flex items-center justify-between">
                  <span>Contraseña</span>
                  <button
                    type="button"
                    onClick={() => setShowAdminPass(!showAdminPass)}
                    className="text-[11px] text-blue-600 hover:text-blue-700 font-bold flex items-center gap-1"
                  >
                    {showAdminPass ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                    <span>{showAdminPass ? 'Ocultar' : 'Mostrar'}</span>
                  </button>
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                    <Lock className="w-4 h-4" />
                  </div>
                  <input
                    type={showAdminPass ? 'text' : 'password'}
                    value={adminPass}
                    onChange={e => setAdminPass(e.target.value)}
                    placeholder="••••••••"
                    className="w-full pl-10 pr-10 py-3.5 bg-slate-50 border-2 border-slate-200 rounded-2xl text-base font-semibold text-slate-800 placeholder-slate-400 focus:border-blue-600 focus:bg-white focus:outline-hidden transition"
                    required
                  />
                </div>
              </div>

              <div className="flex items-center justify-between pt-1">
                <label className="flex items-center gap-2.5 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={adminRemember}
                    onChange={e => setAdminRemember(e.target.checked)}
                    className="w-4 h-4 rounded text-blue-600 border-slate-300 bg-white focus:ring-0"
                  />
                  <span className="text-xs font-medium text-slate-600">Recordar mi email</span>
                </label>
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full py-4 mt-2 bg-gradient-to-r from-indigo-600 via-blue-600 to-indigo-700 hover:from-indigo-500 hover:to-blue-500 text-white font-black rounded-2xl text-base shadow-xl shadow-indigo-600/25 active:scale-[0.98] transition disabled:opacity-50 flex items-center justify-center gap-2 cursor-pointer touch-manipulation"
              >
                {isSubmitting ? (
                  <>
                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                    <span>Verificando Administrador...</span>
                  </>
                ) : (
                  <>
                    <Shield className="w-5 h-5" />
                    <span>Iniciar Sesión Administrativa</span>
                  </>
                )}
              </button>
            </form>
          )}
        </div>

        {/* Security & Support Footer */}
        <div className="w-full max-w-md mx-auto text-center pt-4 pb-2 text-xs text-slate-400 space-y-1">
          <div className="flex items-center justify-center gap-1.5 text-[11px] text-slate-500">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
            <span>Acceso seguro y cifrado para {datosColmado.nombre}</span>
          </div>
          <div className="text-[10px] text-slate-400">
            v2.2 · Súper Colmado DAVID
          </div>
        </div>
      </div>
    </div>
  );
};
