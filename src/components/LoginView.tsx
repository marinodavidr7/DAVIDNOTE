import React, { useState } from 'react';
import {
  ShoppingBag,
  User,
  Shield,
  Phone,
  Lock,
  Mail,
  ArrowLeft,
  Eye,
  EyeOff,
  Sparkles,
  Smartphone,
  CheckCircle2,
  ChevronRight,
  KeyRound
} from 'lucide-react';
import { DatosColmado, ClienteCalculado } from '../types';

interface LoginViewProps {
  initialRole?: 'client' | 'admin';
  onAdminLogin: (e: React.FormEvent) => Promise<void>;
  onClientLogin: (e: React.FormEvent) => Promise<void>;
  onBackToLanding: () => void;
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
  clientesDemo?: ClienteCalculado[];
  onRoleChanged?: (role: 'client' | 'admin') => void;
}

export const LoginView: React.FC<LoginViewProps> = ({
  initialRole = 'client',
  onAdminLogin,
  onClientLogin,
  onBackToLanding,
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
  clientesDemo = [],
  onRoleChanged
}) => {
  const [role, setRole] = useState<'client' | 'admin'>(initialRole);
  const [showAdminPass, setShowAdminPass] = useState(false);
  const [showClientPin, setShowClientPin] = useState(false);
  const [showDemoList, setShowDemoList] = useState(false);

  const handleRoleSwitch = (newRole: 'client' | 'admin') => {
    if (navigator.vibrate) navigator.vibrate(10);
    setRole(newRole);
    if (onRoleChanged) onRoleChanged(newRole);
  };

  const fillAdminDemo = () => {
    if (navigator.vibrate) navigator.vibrate(15);
    setAdminEmail('admin@colmado.com');
    setAdminPass('1234');
  };

  const fillClientDemo = (phone: string, pin: string = '1234') => {
    if (navigator.vibrate) navigator.vibrate(15);
    setClientPhone(phone);
    setClientPin(pin);
  };

  return (
    <div className="w-full flex-1 flex flex-col justify-between p-4 sm:p-6 lg:p-10 relative overflow-hidden bg-gradient-to-b from-slate-950 via-slate-900 to-blue-950 text-white min-h-[100dvh]">
      {/* Glow ambient background lights */}
      <div className="absolute top-0 right-0 w-96 h-96 bg-blue-600/15 rounded-full -mr-32 -mt-32 pointer-events-none blur-3xl animate-pulse"></div>
      <div className="absolute bottom-0 left-0 w-80 h-80 bg-indigo-500/15 rounded-full -ml-28 -mb-28 pointer-events-none blur-3xl"></div>

      {/* Top Navigation Bar */}
      <div className="relative z-10 w-full max-w-md mx-auto flex items-center justify-between pt-1 pb-4">
        <button
          type="button"
          onClick={onBackToLanding}
          className="flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/10 hover:bg-white/20 active:scale-95 text-slate-200 text-xs font-bold backdrop-blur-md border border-white/10 transition shadow-sm"
        >
          <ArrowLeft className="w-4 h-4 text-blue-300" />
          <span>Inicio</span>
        </button>

        <button
          type="button"
          onClick={onOpenApkGuide}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-yellow-400/20 hover:bg-yellow-400/30 text-yellow-300 font-bold text-xs transition border border-yellow-400/30 active:scale-95"
        >
          <Smartphone className="w-3.5 h-3.5" />
          <span>App / APK</span>
        </button>
      </div>

      {/* Main Login Card */}
      <div className="relative z-10 w-full max-w-md mx-auto my-auto bg-slate-900/90 border border-slate-800/90 shadow-2xl shadow-black/60 rounded-3xl p-6 sm:p-8 backdrop-blur-xl">
        {/* Brand Header */}
        <div className="text-center mb-6">
          <div className="w-16 h-16 sm:w-20 sm:h-20 bg-gradient-to-br from-blue-600 via-indigo-600 to-blue-700 rounded-2xl sm:rounded-3xl mx-auto mb-3 flex items-center justify-center shadow-xl shadow-blue-500/25 border border-white/15">
            {role === 'client' ? (
              <ShoppingBag className="w-8 h-8 sm:w-10 sm:h-10 text-white" />
            ) : (
              <Shield className="w-8 h-8 sm:w-10 sm:h-10 text-yellow-300" />
            )}
          </div>
          <h1 className="text-xl sm:text-2xl font-black text-white tracking-tight">
            {datosColmado.nombre}
          </h1>
          <p className="text-xs sm:text-sm text-blue-200/80 font-medium mt-1">
            {role === 'client'
              ? 'Consulta tu balance de fiado e historial'
              : 'Acceso para administración y cobros'}
          </p>
        </div>

        {/* Role Toggle Selector */}
        <div className="grid grid-cols-2 bg-slate-950/80 p-1.5 rounded-2xl border border-slate-800 mb-6 gap-1.5">
          <button
            type="button"
            onClick={() => handleRoleSwitch('client')}
            className={`py-2.5 px-3 rounded-xl text-xs sm:text-sm font-bold transition flex items-center justify-center gap-2 touch-manipulation cursor-pointer ${
              role === 'client'
                ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/30 font-black'
                : 'text-slate-400 hover:text-white hover:bg-white/5'
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
                : 'text-slate-400 hover:text-white hover:bg-white/5'
            }`}
          >
            <Shield className="w-4 h-4 text-yellow-400" />
            <span className="whitespace-nowrap">Soy Colmadero</span>
          </button>
        </div>

        {/* CLIENT FORM */}
        {role === 'client' && (
          <form onSubmit={onClientLogin} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1.5 flex items-center justify-between">
                <span>Número de Teléfono</span>
                <span className="text-[10px] text-blue-400 font-semibold normal-case">Registrado en colmado</span>
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
                  className="w-full pl-10 pr-4 py-3.5 bg-slate-950/70 border-2 border-slate-700/80 rounded-2xl text-base font-semibold text-white placeholder-slate-500 focus:border-blue-500 focus:outline-hidden focus:ring-2 focus:ring-blue-500/20 transition"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1.5 flex items-center justify-between">
                <span>PIN de 4 dígitos</span>
                <button
                  type="button"
                  onClick={() => setShowClientPin(!showClientPin)}
                  className="text-[11px] text-blue-400 hover:text-blue-300 font-bold flex items-center gap-1"
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
                  className="w-full pl-10 pr-10 py-3.5 bg-slate-950/70 border-2 border-slate-700/80 rounded-2xl text-center text-xl tracking-widest font-black text-white placeholder-slate-600 focus:border-blue-500 focus:outline-hidden focus:ring-2 focus:ring-blue-500/20 transition"
                  required
                />
              </div>
              <p className="text-[11px] text-slate-400 mt-1 pl-1">
                PIN inicial predeterminado: <strong className="text-blue-300">1234</strong>
              </p>
            </div>

            <div className="flex items-center justify-between pt-1">
              <label className="flex items-center gap-2.5 cursor-pointer">
                <input
                  type="checkbox"
                  checked={clientRemember}
                  onChange={e => setClientRemember(e.target.checked)}
                  className="w-4 h-4 rounded text-blue-600 border-slate-700 bg-slate-800 focus:ring-0"
                />
                <span className="text-xs font-medium text-slate-300">Recordar mi teléfono</span>
              </label>
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full py-4 mt-2 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-black rounded-2xl text-base shadow-xl shadow-blue-600/30 active:scale-[0.98] transition disabled:opacity-50 flex items-center justify-center gap-2 cursor-pointer touch-manipulation"
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

            {/* Quick Demo Clients Dropdown/Helper */}
            <div className="pt-2 border-t border-slate-800/80 text-center">
              <button
                type="button"
                onClick={() => setShowDemoList(!showDemoList)}
                className="text-xs text-blue-300/80 hover:text-blue-200 inline-flex items-center gap-1 font-semibold py-1 transition"
              >
                <Sparkles className="w-3.5 h-3.5 text-yellow-400" />
                <span>{showDemoList ? 'Ocultar clientes de prueba' : 'Ver clientes demo para probar'}</span>
              </button>

              {showDemoList && (
                <div className="mt-2 bg-slate-950/80 p-2.5 rounded-2xl border border-slate-800 space-y-1.5 text-left text-xs">
                  <div className="text-[11px] text-slate-400 font-bold uppercase tracking-wider mb-1 px-1">
                    Haz clic para auto-rellenar:
                  </div>
                  {clientesDemo.slice(0, 4).map(c => (
                    <button
                      key={c.id}
                      type="button"
                      onClick={() => fillClientDemo(c.telefono, c.pin || '1234')}
                      className="w-full flex items-center justify-between p-2 rounded-xl bg-slate-900 hover:bg-blue-900/40 border border-slate-800 text-slate-200 transition"
                    >
                      <span className="font-bold truncate">{c.nombre}</span>
                      <span className="text-[11px] text-blue-300 font-mono shrink-0">{c.telefono}</span>
                    </button>
                  ))}
                  {clientesDemo.length === 0 && (
                    <button
                      type="button"
                      onClick={() => fillClientDemo('829-555-0101', '1234')}
                      className="w-full flex items-center justify-between p-2 rounded-xl bg-slate-900 hover:bg-blue-900/40 border border-slate-800 text-slate-200 transition"
                    >
                      <span className="font-bold">Juan Pérez</span>
                      <span className="text-[11px] text-blue-300 font-mono">829-555-0101</span>
                    </button>
                  )}
                </div>
              )}
            </div>
          </form>
        )}

        {/* ADMIN FORM */}
        {role === 'admin' && (
          <form onSubmit={onAdminLogin} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1.5">
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
                  className="w-full pl-10 pr-4 py-3.5 bg-slate-950/70 border-2 border-slate-700/80 rounded-2xl text-base font-semibold text-white placeholder-slate-500 focus:border-blue-500 focus:outline-hidden focus:ring-2 focus:ring-blue-500/20 transition"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1.5 flex items-center justify-between">
                <span>Contraseña</span>
                <button
                  type="button"
                  onClick={() => setShowAdminPass(!showAdminPass)}
                  className="text-[11px] text-blue-400 hover:text-blue-300 font-bold flex items-center gap-1"
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
                  className="w-full pl-10 pr-10 py-3.5 bg-slate-950/70 border-2 border-slate-700/80 rounded-2xl text-base font-semibold text-white placeholder-slate-500 focus:border-blue-500 focus:outline-hidden focus:ring-2 focus:ring-blue-500/20 transition"
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
                  className="w-4 h-4 rounded text-blue-600 border-slate-700 bg-slate-800 focus:ring-0"
                />
                <span className="text-xs font-medium text-slate-300">Recordar mi email</span>
              </label>

              <button
                type="button"
                onClick={fillAdminDemo}
                className="text-[11px] text-amber-300/90 hover:text-amber-200 font-bold flex items-center gap-1 transition"
              >
                <Sparkles className="w-3 h-3 text-amber-400" />
                <span>Rellenar Demo (1234)</span>
              </button>
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full py-4 mt-2 bg-gradient-to-r from-indigo-600 via-blue-600 to-indigo-700 hover:from-indigo-500 hover:to-blue-500 text-white font-black rounded-2xl text-base shadow-xl shadow-indigo-600/30 active:scale-[0.98] transition disabled:opacity-50 flex items-center justify-center gap-2 cursor-pointer touch-manipulation"
            >
              {isSubmitting ? (
                <>
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                  <span>Verificando Administrador...</span>
                </>
              ) : (
                <>
                  <Shield className="w-5 h-5 text-yellow-300" />
                  <span>Iniciar Sesión Administrativa</span>
                </>
              )}
            </button>
          </form>
        )}
      </div>

      {/* Security & Support Footer */}
      <div className="relative z-10 w-full max-w-md mx-auto text-center pt-4 pb-2 text-xs text-slate-400 space-y-1">
        <div className="flex items-center justify-center gap-1.5 text-[11px] text-slate-400">
          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
          <span>Acceso seguro y cifrado para {datosColmado.nombre}</span>
        </div>
        <div className="text-[10px] text-slate-500">
          v2.2 · Súper Colmado DAVID
        </div>
      </div>
    </div>
  );
};
