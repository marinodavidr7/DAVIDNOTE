import React, { useState } from 'react';
import { Database, Check, Copy, X, RefreshCw, AlertCircle, FileCode, ClipboardList, ArrowRight } from 'lucide-react';
import { store } from '../services/storeService';

interface GoogleSheetsConfigModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfigChanged: () => void;
}

export const GoogleSheetsConfigModal: React.FC<GoogleSheetsConfigModalProps> = ({
  isOpen,
  onClose,
  onConfigChanged
}) => {
  const [tab, setTab] = useState<'webapp' | 'pegar'>('webapp');
  const [url, setUrl] = useState(store.getWebAppUrl());
  const [syncing, setSyncing] = useState(false);
  const [exporting, setExporting] = useState(false);
  const [resultMessage, setResultMessage] = useState<{ success: boolean; message: string } | null>(null);
  const [copiedCode, setCopiedCode] = useState(false);
  const [showCode, setShowCode] = useState(false);
  const [pastedData, setPastedData] = useState('');

  if (!isOpen) return null;

  const handleSyncWebApp = async () => {
    if (!url.trim()) {
      setResultMessage({ success: false, message: 'Ingresa la URL de tu Web App de Google Apps Script' });
      return;
    }
    setSyncing(true);
    setResultMessage(null);
    try {
      store.setWebAppUrl(url.trim());
      const res = await store.syncWithGoogleSheet();
      setResultMessage({
        success: res.success,
        message: res.message
      });
      if (res.success) {
        onConfigChanged();
      }
    } catch (err: any) {
      setResultMessage({
        success: false,
        message: err.message || 'Error al conectar con la Web App'
      });
    } finally {
      setSyncing(false);
      onConfigChanged();
    }
  };

  const handleExportAll = async () => {
    if (!url.trim()) {
      setResultMessage({ success: false, message: 'Ingresa la URL de tu Web App de Google Apps Script' });
      return;
    }
    setExporting(true);
    setResultMessage(null);
    try {
      store.setWebAppUrl(url.trim());
      const res = await store.exportarTodosLosDatosAGoogleSheet();
      setResultMessage({
        success: res.success,
        message: res.message
      });
      if (res.success) {
        onConfigChanged();
      }
    } catch (err: any) {
      setResultMessage({
        success: false,
        message: err.message || 'Error al exportar a Google Sheets'
      });
    } finally {
      setExporting(false);
    }
  };

  const handleImportPasted = () => {
    if (!pastedData.trim()) {
      setResultMessage({ success: false, message: 'Pega los datos de tu hoja Clientes primero' });
      return;
    }
    const res = store.importClientesFromText(pastedData);
    setResultMessage({
      success: res.success,
      message: res.message
    });
    if (res.success) {
      setPastedData('');
      onConfigChanged();
    }
  };

  const appsScriptCode = `// ==========================================
// CÓDIGO ACTUALIZADO PARA GOOGLE APPS SCRIPT
// SÚPER COLMADO DAVID - BACKEND CON API WEB
// ==========================================
const SPREADSHEET_ID = '${store.getSpreadsheetId()}';

function doGet(e) {
  try { inicializarSistema(); } catch (err) { Logger.log(err.message); }
  
  if (e && e.parameter && e.parameter.action) {
    return handleApiRequest(e.parameter.action, e.parameter);
  }
  
  return HtmlService.createHtmlOutputFromFile('Index')
    .setTitle('Súper Colmado DAVID')
    .addMetaTag('viewport', 'width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no')
    .addMetaTag('theme-color', '#2563eb')
    .setXFrameOptionsMode(HtmlService.XFrameOptionsMode.ALLOWALL);
}

function doPost(e) {
  try {
    var data = JSON.parse(e.postData.contents);
    var action = data.action;
    var result = handleApiRequest(action, data);
    return ContentService.createTextOutput(JSON.stringify(result))
      .setMimeType(ContentService.MimeType.JSON);
  } catch (err) {
    return ContentService.createTextOutput(JSON.stringify({ success: false, error: err.message }))
      .setMimeType(ContentService.MimeType.JSON);
  }
}

function handleApiRequest(action, data) {
  switch (action) {
    case 'ping':
      return { success: true, status: 'online', time: new Date() };
    case 'getDashboardAdmin':
      return getDashboardAdmin();
    case 'getDatosRegistroFiado':
      return getDatosRegistroFiado();
    case 'loginUsuario':
      return loginUsuario(data.email, data.password);
    case 'loginCliente':
      return loginCliente(data.telefono, data.pin);
    case 'registrarFiado':
      return registrarFiado(data.idCliente, data.idAutorizado, data.monto, data.observaciones);
    case 'registrarAbono':
      return registrarAbono(data.idCliente, data.monto, data.observaciones);
    case 'crearCliente':
      return crearCliente(data.nombre, data.telefono, data.pin, data.limite, data.autorizados, data.diasPago);
    case 'actualizarDiasPagoCliente':
      return actualizarDiasPagoCliente(data.idCliente, data.diasPago);
    case 'actualizarLimiteCliente':
      return actualizarLimiteCliente(data.idCliente, data.nuevoLimite, data.esCliente);
    case 'generarPINCliente':
      return generarPINCliente(data.idCliente);
    case 'getHistorialAdmin':
      return getHistorialAdmin();
    case 'getGastosDiariosCliente':
      return getGastosDiariosCliente(data.idCliente);
    case 'exportarDatosMasivos':
      return exportarDatosMasivos(data);
    default:
      return { success: false, message: 'Acción no reconocida' };
  }
}

function exportarDatosMasivos(data) {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  
  var sheetClientes = ss.getSheetByName('Clientes');
  if (!sheetClientes) sheetClientes = ss.insertSheet('Clientes');
  sheetClientes.clear();
  sheetClientes.appendRow(['ID', 'Nombre', 'Telefono', 'PIN', 'Saldo', 'Limite', 'Dias_Pago']);
  if (data.clientes && Array.isArray(data.clientes)) {
    data.clientes.forEach(function(c) {
      sheetClientes.appendRow([c.id, c.nombre, c.telefono, c.pin, c.saldo, c.limite, c.diasPago]);
    });
  }

  var sheetMovs = ss.getSheetByName('Movimientos');
  if (!sheetMovs) sheetMovs = ss.insertSheet('Movimientos');
  sheetMovs.clear();
  sheetMovs.appendRow(['ID_Mov', 'ID_Cliente', 'Tipo', 'Monto', 'FechaHora', 'Observaciones', 'Cliente']);
  if (data.movimientos && Array.isArray(data.movimientos)) {
    data.movimientos.forEach(function(m) {
      sheetMovs.appendRow([m.idMov, m.idCliente, m.tipo, m.monto, m.fechaHora, m.observaciones, m.nombreCliente || '']);
    });
  }

  var sheetAuts = ss.getSheetByName('Autorizados');
  if (!sheetAuts) sheetAuts = ss.insertSheet('Autorizados');
  sheetAuts.clear();
  sheetAuts.appendRow(['ID', 'ID_Cliente', 'Nombre', 'Parentesco']);
  if (data.autorizados && Array.isArray(data.autorizados)) {
    data.autorizados.forEach(function(a) {
      sheetAuts.appendRow([a.id, a.idCliente, a.nombre, a.parentesco]);
    });
  }

  return { success: true, message: 'Datos exportados correctamente' };
}`;

  const copyCode = () => {
    navigator.clipboard.writeText(appsScriptCode);
    setCopiedCode(true);
    setTimeout(() => setCopiedCode(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-xs p-4 overflow-y-auto">
      <div className="w-full max-w-lg bg-white rounded-3xl shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200 my-8">
        
        {/* Header */}
        <div className="bg-gradient-to-r from-emerald-700 to-teal-700 p-6 text-white relative">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 w-9 h-9 rounded-full bg-white/20 hover:bg-white/30 text-white flex items-center justify-center transition"
          >
            <X className="w-5 h-5" />
          </button>
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-white/20 backdrop-blur-md flex items-center justify-center">
              <Database className="w-6 h-6 text-emerald-200" />
            </div>
            <div>
              <h3 className="text-xl font-black">Sincronizar Google Sheets</h3>
              <p className="text-emerald-100 text-xs">Conecta tus clientes y deudas reales</p>
            </div>
          </div>
        </div>

        {/* Tab Selector */}
        <div className="flex border-b border-slate-200 bg-slate-50 px-6 pt-3 gap-2">
          <button
            onClick={() => { setTab('webapp'); setResultMessage(null); }}
            className={`pb-3 px-3 text-xs font-bold transition border-b-2 ${
              tab === 'webapp'
                ? 'border-emerald-600 text-emerald-700'
                : 'border-transparent text-slate-500 hover:text-slate-700'
            }`}
          >
            Sincronización Web App (En Vivo)
          </button>
          <button
            onClick={() => { setTab('pegar'); setResultMessage(null); }}
            className={`pb-3 px-3 text-xs font-bold transition border-b-2 ${
              tab === 'pegar'
                ? 'border-emerald-600 text-emerald-700'
                : 'border-transparent text-slate-500 hover:text-slate-700'
            }`}
          >
            Pegar Datos Directo (Rápido)
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-5 max-h-[70vh] overflow-y-auto">
          
          {/* Explanation Alert */}
          <div className="bg-amber-50 border border-amber-200 rounded-2xl p-3.5 text-xs text-amber-900 leading-relaxed flex items-start gap-2.5">
            <AlertCircle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
            <div>
              <strong>¿Por qué no eran iguales los datos?</strong>
              <p className="mt-0.5 text-amber-800">
                Todos los clientes, deudas y movimientos se sincronizan directamente con tu hoja de cálculo de Google Sheets.
              </p>
            </div>
          </div>

          {resultMessage && (
            <div
              className={`p-3.5 rounded-2xl text-xs flex items-start gap-2 ${
                resultMessage.success
                  ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                  : 'bg-red-50 text-red-800 border border-red-200'
              }`}
            >
              {resultMessage.success ? (
                <Check className="w-4 h-4 mt-0.5 text-emerald-600 shrink-0" />
              ) : (
                <AlertCircle className="w-4 h-4 mt-0.5 text-red-600 shrink-0" />
              )}
              <div className="leading-relaxed">{resultMessage.message}</div>
            </div>
          )}

          {/* TAB 1: WEB APP URL */}
          {tab === 'webapp' && (
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wide mb-1.5">
                  URL de la Web App de Apps Script (/exec)
                </label>
                <input
                  type="url"
                  value={url}
                  onChange={e => setUrl(e.target.value)}
                  placeholder="https://script.google.com/macros/s/AKfycb.../exec"
                  className="w-full px-4 py-3 border-2 border-slate-200 rounded-xl text-xs font-mono focus:border-emerald-500 focus:outline-hidden"
                />
                <p className="text-[11px] text-slate-500 mt-1">
                  Tu hoja de cálculo ID: <code className="bg-slate-100 px-1 py-0.5 rounded font-mono font-bold text-slate-700">{store.getSpreadsheetId()}</code>
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                <button
                  onClick={handleSyncWebApp}
                  disabled={syncing || exporting}
                  className="py-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold text-xs flex items-center justify-center gap-2 shadow-sm transition active:scale-98 disabled:opacity-50"
                >
                  <RefreshCw className={`w-4 h-4 ${syncing ? 'animate-spin' : ''}`} />
                  {syncing ? 'Sincronizando...' : '📥 Traer de la Hoja'}
                </button>
                <button
                  onClick={handleExportAll}
                  disabled={syncing || exporting}
                  className="py-3 bg-teal-700 hover:bg-teal-800 text-white rounded-xl font-bold text-xs flex items-center justify-center gap-2 shadow-sm transition active:scale-98 disabled:opacity-50"
                >
                  <ArrowRight className={`w-4 h-4 ${exporting ? 'animate-pulse' : ''}`} />
                  {exporting ? 'Exportando...' : '📤 Enviar a la Hoja'}
                </button>
              </div>

              {/* Instructions */}
              <div className="border border-slate-200 rounded-2xl p-4 bg-slate-50">
                <div className="flex items-center justify-between mb-2">
                  <h4 className="font-bold text-xs text-slate-800 uppercase tracking-wide flex items-center gap-1.5">
                    <FileCode className="w-4 h-4 text-emerald-600" />
                    Cómo obtener tu URL de Web App
                  </h4>
                  <button
                    onClick={() => setShowCode(!showCode)}
                    className="text-emerald-600 text-xs font-bold hover:underline"
                  >
                    {showCode ? 'Ocultar código' : 'Ver código doPost'}
                  </button>
                </div>
                <ol className="text-xs text-slate-600 space-y-1.5 list-decimal list-inside leading-relaxed">
                  <li>En tu editor de Google Apps Script, agrega la función <code className="bg-slate-200 px-1 rounded">doPost(e)</code>.</li>
                  <li>Haz clic arriba en <strong>Implementar &gt; Nueva implementación</strong>.</li>
                  <li>Selecciona tipo: <strong>Aplicación web</strong>.</li>
                  <li>En "Quién tiene acceso": <strong>Cualquier persona (Anyone)</strong>.</li>
                  <li>Copia la URL que termina en <code className="bg-slate-200 px-1 rounded">/exec</code> y pégala aquí.</li>
                </ol>

                {showCode && (
                  <div className="mt-3">
                    <div className="flex justify-between items-center bg-slate-800 text-slate-300 px-3 py-2 rounded-t-xl text-[11px]">
                      <span>codigo.gs (con soporte API)</span>
                      <button
                        onClick={copyCode}
                        className="flex items-center gap-1 text-emerald-400 hover:text-emerald-300 font-bold"
                      >
                        {copiedCode ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                        {copiedCode ? 'Copiado' : 'Copiar código'}
                      </button>
                    </div>
                    <pre className="bg-slate-900 text-slate-200 p-3 rounded-b-xl text-[10px] font-mono overflow-x-auto max-h-48">
                      {appsScriptCode}
                    </pre>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* TAB 2: PEGAR DATOS DIRECTAMENTE */}
          {tab === 'pegar' && (
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wide mb-1.5">
                  Copiar y Pegar desde tu Hoja "Clientes"
                </label>
                <p className="text-xs text-slate-500 mb-2 leading-relaxed">
                  Abre tu Google Sheet, selecciona las filas de tu hoja <strong>Clientes</strong> (con o sin encabezados), presiona <code className="bg-slate-100 px-1.5 py-0.5 rounded font-mono font-bold">Ctrl+C</code> y pégalas aquí:
                </p>
                <textarea
                  rows={6}
                  value={pastedData}
                  onChange={e => setPastedData(e.target.value)}
                  placeholder={`ID\tNombre\tTelefono\tPIN\tSaldo\tLimite\tDias_Pago\n1\tJuan Pérez\t8295550101\t1234\t1500\t5000\t15,30\n2\tMaría Rodríguez\t8091112233\t4321\t3200\t6000\t30`}
                  className="w-full px-3.5 py-3 border-2 border-slate-200 rounded-2xl text-xs font-mono text-slate-800 focus:border-emerald-500 focus:outline-hidden resize-none"
                />
              </div>

              <button
                onClick={handleImportPasted}
                className="w-full py-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold text-xs flex items-center justify-center gap-2 shadow-sm transition active:scale-98"
              >
                <ClipboardList className="w-4 h-4" />
                Cargar Mis Clientes Reales
              </button>

              <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl text-[11px] text-slate-500 leading-relaxed">
                💡 <strong>Formato admitido:</strong> Acepta separación por tabulación (el copiado nativo de Google Sheets) o por coma (CSV).
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-slate-100 bg-slate-50 flex justify-between items-center">
          <button
            onClick={() => {
              store.resetToDefault();
              onConfigChanged();
              setResultMessage({ success: true, message: 'Datos de prueba restablecidos' });
            }}
            className="text-xs text-slate-400 hover:text-slate-600 underline font-medium"
          >
            Restablecer demo
          </button>

          <button
            onClick={onClose}
            className="px-6 py-2.5 bg-slate-800 hover:bg-slate-900 text-white font-bold rounded-xl text-sm transition"
          >
            Listo
          </button>
        </div>
      </div>
    </div>
  );
};
