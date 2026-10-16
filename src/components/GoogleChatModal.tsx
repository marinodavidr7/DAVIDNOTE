import React, { useState, useEffect } from 'react';
import { MessageSquare, X, Send, Check, AlertCircle, RefreshCw, LogOut, Link2, Info } from 'lucide-react';
import { User } from 'firebase/auth';
import {
  initChatAuth,
  chatGoogleSignIn,
  chatLogout,
  getChatAccessToken,
  fetchChatSpaces,
  sendChatMessage,
  sendChatWebhookMessage,
  ChatSpace
} from '../services/googleChatService';

interface GoogleChatModalProps {
  isOpen: boolean;
  onClose: () => void;
  showToast: (title: string, msg: string, type: 'success' | 'error' | 'info') => void;
}

export const GoogleChatModal: React.FC<GoogleChatModalProps> = ({ isOpen, onClose, showToast }) => {
  const [activeTab, setActiveTab] = useState<'oauth' | 'webhook'>('oauth');
  const [needsAuth, setNeedsAuth] = useState(true);
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [loadingLogin, setLoadingLogin] = useState(false);
  const [spaces, setSpaces] = useState<ChatSpace[]>([]);
  const [loadingSpaces, setLoadingSpaces] = useState(false);
  const [selectedSpace, setSelectedSpace] = useState<string>('');
  const [chatDisabled, setChatDisabled] = useState(false);
  const [webhookUrl, setWebhookUrl] = useState(() => localStorage.getItem('colmado_google_chat_webhook') || '');
  const [messageText, setMessageText] = useState('¡Hola! Recordatorio de pago pendiente de Súper Colmado DAVID.');
  const [sending, setSending] = useState(false);
  const [resultMessage, setResultMessage] = useState<{ success: boolean; message: string } | null>(null);
  const [confirmSend, setConfirmSend] = useState(false);

  useEffect(() => {
    if (!isOpen) return;
    const unsubscribe = initChatAuth(
      async (u, t) => {
        setUser(u);
        setToken(t);
        setNeedsAuth(false);
        loadSpaces(t);
      },
      () => {
        setNeedsAuth(true);
        setUser(null);
        setToken(null);
      }
    );
    getChatAccessToken().then(t => {
      if (t) {
        setToken(t);
        setNeedsAuth(false);
        loadSpaces(t);
      }
    });
    return () => unsubscribe();
  }, [isOpen]);

  const loadSpaces = async (t: string) => {
    setLoadingSpaces(true);
    setChatDisabled(false);
    try {
      const res = await fetchChatSpaces(t);
      if (res.chatDisabled) {
        setChatDisabled(true);
        setSpaces([]);
        return;
      }
      setSpaces(res.spaces || []);
      if (res.spaces && res.spaces.length > 0) {
        setSelectedSpace(res.spaces[0].name);
      }
    } catch {
      // Safe fallback
      setSpaces([]);
    } finally {
      setLoadingSpaces(false);
    }
  };

  const handleLogin = async () => {
    setLoadingLogin(true);
    try {
      const res = await chatGoogleSignIn();
      if (res) {
        setUser(res.user);
        setToken(res.accessToken);
        setNeedsAuth(false);
        loadSpaces(res.accessToken);
        showToast('Conectado', 'Autenticado correctamente con Google', 'success');
      }
    } catch (err: any) {
      showToast('Error', err.message || 'Error al autenticar con Google', 'error');
    } finally {
      setLoadingLogin(false);
    }
  };

  const handleLogout = async () => {
    await chatLogout();
    setNeedsAuth(true);
    setUser(null);
    setToken(null);
    setSpaces([]);
    setChatDisabled(false);
  };

  const handleSend = async () => {
    if (!messageText.trim()) return;

    if (activeTab === 'webhook') {
      if (!webhookUrl.trim()) {
        showToast('Webhook Requerido', 'Ingresa la URL del webhook de Google Chat', 'error');
        return;
      }
      setSending(true);
      setResultMessage(null);
      try {
        await sendChatWebhookMessage(webhookUrl.trim(), messageText.trim());
        localStorage.setItem('colmado_google_chat_webhook', webhookUrl.trim());
        setResultMessage({ success: true, message: '¡Mensaje enviado con éxito al Webhook de Google Chat!' });
        showToast('Enviado', 'Mensaje enviado a Google Chat vía Webhook', 'success');
        setConfirmSend(false);
      } catch (err: any) {
        setResultMessage({ success: false, message: err?.message || 'Error al enviar por webhook' });
        showToast('Error', 'No se pudo enviar el mensaje por webhook', 'error');
      } finally {
        setSending(false);
      }
      return;
    }

    if (!token || !selectedSpace) return;
    setSending(true);
    setResultMessage(null);
    try {
      const spaceId = selectedSpace.replace(/^spaces\//, '');
      await sendChatMessage(token, spaceId, messageText.trim());
      setResultMessage({ success: true, message: '¡Mensaje enviado con éxito a Google Chat!' });
      showToast('Enviado', 'Mensaje enviado a Google Chat', 'success');
      setConfirmSend(false);
    } catch (err: any) {
      setResultMessage({ success: false, message: err.message || 'Error al enviar mensaje' });
      showToast('Error', 'No se pudo enviar el mensaje', 'error');
    } finally {
      setSending(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-xs p-4 overflow-y-auto">
      <div className="w-full max-w-lg bg-white rounded-3xl shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200 my-8">
        
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-700 to-indigo-700 p-6 text-white relative">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 w-9 h-9 rounded-full bg-white/20 hover:bg-white/30 text-white flex items-center justify-center transition"
          >
            <X className="w-5 h-5" />
          </button>
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-white/20 backdrop-blur-md flex items-center justify-center">
              <MessageSquare className="w-6 h-6 text-blue-200" />
            </div>
            <div>
              <h3 className="text-xl font-black">Google Chat</h3>
              <p className="text-blue-100 text-xs">Envía avisos y recordatorios a tus chats</p>
            </div>
          </div>
        </div>

        {/* Tab Selection */}
        <div className="flex border-b border-slate-200 bg-slate-50 px-6 pt-3 gap-2">
          <button
            type="button"
            onClick={() => setActiveTab('oauth')}
            className={`pb-3 px-3 text-xs font-bold border-b-2 flex items-center gap-1.5 transition ${
              activeTab === 'oauth'
                ? 'border-blue-600 text-blue-700'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <MessageSquare className="w-4 h-4" />
            <span>Cuenta Google</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('webhook')}
            className={`pb-3 px-3 text-xs font-bold border-b-2 flex items-center gap-1.5 transition ${
              activeTab === 'webhook'
                ? 'border-blue-600 text-blue-700'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <Link2 className="w-4 h-4" />
            <span>Webhook Directo</span>
            <span className="text-[9px] bg-emerald-100 text-emerald-800 px-1.5 py-0.2 rounded-full font-extrabold">
              100% Estable
            </span>
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-5 max-h-[70vh] overflow-y-auto">
          {resultMessage && (
            <div className={`p-3.5 rounded-2xl text-xs flex items-start gap-2 ${resultMessage.success ? 'bg-emerald-50 text-emerald-800 border border-emerald-200' : 'bg-red-50 text-red-800 border border-red-200'}`}>
              {resultMessage.success ? <Check className="w-4 h-4 mt-0.5 text-emerald-600 shrink-0" /> : <AlertCircle className="w-4 h-4 mt-0.5 text-red-600 shrink-0" />}
              <div className="leading-relaxed">{resultMessage.message}</div>
            </div>
          )}

          {activeTab === 'webhook' ? (
            /* Modo Webhook Directo */
            <div className="space-y-4">
              <div className="p-3.5 bg-blue-50 border border-blue-200 rounded-2xl text-xs text-blue-900 space-y-1.5">
                <div className="font-bold flex items-center gap-1.5 text-blue-800">
                  <Info className="w-4 h-4 text-blue-600 shrink-0" />
                  <span>¿Cómo obtener un Webhook de Google Chat?</span>
                </div>
                <p className="text-[11px] text-blue-800 leading-relaxed">
                  En Google Chat: abre tu espacio o grupo &gt; haz clic en el nombre &gt; <strong>Aplicaciones e integraciones</strong> &gt; <strong>Webhooks</strong> &gt; Agrega un webhook y copia su URL aquí.
                </p>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wide mb-1.5">
                  URL del Webhook de Google Chat
                </label>
                <input
                  type="url"
                  value={webhookUrl}
                  onChange={e => setWebhookUrl(e.target.value)}
                  placeholder="https://chat.googleapis.com/v1/spaces/.../messages?key=...&token=..."
                  className="w-full px-3.5 py-2.5 border-2 border-slate-200 rounded-xl text-xs font-mono text-slate-800 focus:border-blue-600 focus:outline-hidden"
                />
              </div>

              {/* Message text */}
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wide mb-1.5">
                  Mensaje a Enviar
                </label>
                <textarea
                  rows={4}
                  value={messageText}
                  onChange={e => setMessageText(e.target.value)}
                  placeholder="Escribe el mensaje o recordatorio..."
                  className="w-full px-3.5 py-3 border-2 border-slate-200 rounded-2xl text-xs font-mono text-slate-800 focus:border-blue-600 focus:outline-hidden resize-none"
                />
              </div>

              {/* Quick Templates */}
              <div className="space-y-1.5">
                <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Plantillas Rápidas:</span>
                <div className="flex flex-wrap gap-1.5">
                  <button
                    onClick={() => setMessageText('🚨 ¡Recordatorio de cobro de fiados en Súper Colmado DAVID! Por favor regularizar las cuentas acordadas hoy.')}
                    className="px-2.5 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-[10px] font-bold transition"
                  >
                    Recordatorio de Cobro
                  </button>
                  <button
                    onClick={() => setMessageText('📊 Reporte Súper Colmado DAVID: Cuadre del día registrado satisfactoriamente en el sistema.')}
                    className="px-2.5 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-[10px] font-bold transition"
                  >
                    Cuadre Diario
                  </button>
                </div>
              </div>

              <button
                type="button"
                onClick={handleSend}
                disabled={!webhookUrl.trim() || !messageText.trim() || sending}
                className="w-full py-3.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold text-xs flex items-center justify-center gap-2 shadow-sm transition active:scale-98 disabled:opacity-50 cursor-pointer"
              >
                {sending ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                <span>{sending ? 'Enviando...' : 'Enviar vía Webhook'}</span>
              </button>
            </div>
          ) : needsAuth ? (
            /* Modo OAuth - Necesita autenticación */
            <div className="text-center py-8 space-y-4">
              <div className="w-16 h-16 bg-blue-50 text-blue-600 rounded-3xl mx-auto flex items-center justify-center shadow-inner">
                <MessageSquare className="w-8 h-8" />
              </div>
              <h4 className="font-black text-slate-800 text-base">Inicia sesión con Google</h4>
              <p className="text-xs text-slate-500 max-w-xs mx-auto leading-relaxed">
                Para enviar notificaciones y recordatorios a través de Google Chat, autoriza el acceso con tu cuenta de Google.
              </p>
              
              <button
                onClick={handleLogin}
                disabled={loadingLogin}
                className="gsi-material-button mx-auto shadow-md transition hover:scale-102 active:scale-98 disabled:opacity-50 cursor-pointer"
              >
                <div className="gsi-material-button-state"></div>
                <div className="gsi-material-button-content-wrapper">
                  <div className="gsi-material-button-icon">
                    <svg version="1.1" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48" style={{ display: 'block' }}>
                      <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"></path>
                      <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"></path>
                      <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"></path>
                      <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"></path>
                      <path fill="none" d="M0 0h48v48H0z"></path>
                    </svg>
                  </div>
                  <span className="gsi-material-button-contents">{loadingLogin ? 'Conectando...' : 'Sign in with Google'}</span>
                </div>
              </button>
            </div>
          ) : (
            /* Modo OAuth - Conectado */
            <div className="space-y-4">
              <div className="flex items-center justify-between bg-slate-50 p-3 rounded-2xl border border-slate-200">
                <div className="flex items-center gap-2.5">
                  <div className="w-9 h-9 rounded-xl bg-blue-100 text-blue-700 font-bold flex items-center justify-center">
                    {user?.displayName?.charAt(0) || user?.email?.charAt(0) || 'G'}
                  </div>
                  <div className="text-xs">
                    <div className="font-bold text-slate-800">{user?.displayName || 'Usuario Google'}</div>
                    <div className="text-slate-400">{user?.email}</div>
                  </div>
                </div>
                <button
                  onClick={handleLogout}
                  className="px-3 py-1.5 bg-red-50 hover:bg-red-100 text-red-600 rounded-xl font-bold text-xs flex items-center gap-1 transition"
                >
                  <LogOut className="w-3.5 h-3.5" />
                  Desconectar
                </button>
              </div>

              {chatDisabled && (
                <div className="p-4 bg-amber-50 border border-amber-200 rounded-2xl text-xs text-amber-900 space-y-2">
                  <div className="flex items-center gap-2 font-bold text-amber-800">
                    <AlertCircle className="w-4 h-4 text-amber-600 shrink-0" />
                    <span>Google Chat está desactivado en esta cuenta</span>
                  </div>
                  <p className="text-[11px] text-amber-700 leading-relaxed">
                    Tu cuenta de Google no tiene habilitada la API de Google Chat (común en cuentas personales o de trabajo con restricciones de administrador).
                  </p>
                  <button
                    type="button"
                    onClick={() => setActiveTab('webhook')}
                    className="w-full py-2 bg-amber-200/80 hover:bg-amber-300 active:bg-amber-400 text-amber-900 font-extrabold text-xs rounded-xl transition flex items-center justify-center gap-1.5"
                  >
                    <Link2 className="w-3.5 h-3.5" />
                    <span>Usar Webhook de Google Chat (Recomendado)</span>
                  </button>
                </div>
              )}

              {/* Select Space */}
              {!chatDisabled && (
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wide mb-1.5">
                    Seleccionar Espacio / Chat
                  </label>
                  {loadingSpaces ? (
                    <div className="py-4 text-center text-xs text-slate-400 flex items-center justify-center gap-2">
                      <RefreshCw className="w-4 h-4 animate-spin text-blue-600" />
                      Cargando espacios de Google Chat...
                    </div>
                  ) : spaces.length === 0 ? (
                    <div className="p-4 bg-amber-50 border border-amber-200 rounded-2xl text-xs text-amber-800 space-y-2">
                      <div>No se encontraron espacios de Google Chat activos en tu cuenta.</div>
                      <button
                        type="button"
                        onClick={() => setActiveTab('webhook')}
                        className="text-xs text-blue-700 font-bold underline block"
                      >
                        O utiliza un Webhook directo para conectar tu chat
                      </button>
                    </div>
                  ) : (
                    <select
                      value={selectedSpace}
                      onChange={e => setSelectedSpace(e.target.value)}
                      className="w-full px-4 py-3 border-2 border-slate-200 rounded-xl text-xs font-semibold text-slate-800 focus:border-blue-600 focus:outline-hidden"
                    >
                      {spaces.map(s => (
                        <option key={s.name} value={s.name}>
                          {s.displayName || s.name} ({s.type || 'SPACE'})
                        </option>
                      ))}
                    </select>
                  )}
                </div>
              )}

              {/* Message text */}
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wide mb-1.5">
                  Mensaje a Enviar
                </label>
                <textarea
                  rows={4}
                  value={messageText}
                  onChange={e => setMessageText(e.target.value)}
                  placeholder="Escribe el mensaje o recordatorio..."
                  className="w-full px-3.5 py-3 border-2 border-slate-200 rounded-2xl text-xs font-mono text-slate-800 focus:border-blue-600 focus:outline-hidden resize-none"
                />
              </div>

              {/* Confirmation Dialog before sending */}
              {confirmSend ? (
                <div className="bg-amber-50 border border-amber-300 p-4 rounded-2xl space-y-3">
                  <div className="flex items-center gap-2 text-xs font-bold text-amber-900">
                    <AlertCircle className="w-4 h-4 text-amber-600 shrink-0" />
                    ¿Confirmas el envío de este mensaje a Google Chat?
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => setConfirmSend(false)}
                      className="flex-1 py-2 bg-slate-200 hover:bg-slate-300 text-slate-700 font-bold rounded-xl text-xs transition"
                    >
                      Cancelar
                    </button>
                    <button
                      onClick={handleSend}
                      disabled={sending}
                      className="flex-1 py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl text-xs flex items-center justify-center gap-1.5 transition disabled:opacity-50"
                    >
                      {sending ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Send className="w-3.5 h-3.5" />}
                      {sending ? 'Enviando...' : 'Sí, Enviar'}
                    </button>
                  </div>
                </div>
              ) : (
                <button
                  onClick={() => setConfirmSend(true)}
                  disabled={!selectedSpace || !messageText.trim() || sending || chatDisabled}
                  className="w-full py-3.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold text-xs flex items-center justify-center gap-2 shadow-sm transition active:scale-98 disabled:opacity-50 cursor-pointer"
                >
                  <Send className="w-4 h-4" />
                  Enviar a Google Chat
                </button>
              )}
            </div>
          )}
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
