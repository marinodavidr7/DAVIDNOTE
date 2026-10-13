import React, { useState, useEffect, useMemo } from 'react';
import {
  ShoppingBag,
  User,
  UserCheck,
  Shield,
  Home,
  Users,
  Clock,
  PlusCircle,
  ArrowDownLeft,
  Calendar,
  Phone,
  Lock,
  Search,
  Menu,
  X,
  LogOut,
  Sliders,
  Key,
  CheckCircle,
  Database,
  Smartphone,
  Download,
  AlertTriangle,
  FileText,
  ChevronRight,
  TrendingDown,
  Trash2,
  Edit2,
  Share2,
  Info,
  Bell,
  Store,
  MapPin,
  ShieldAlert
} from 'lucide-react';
import { store } from './services/storeService';
import {
  ClienteCalculado,
  Movimiento,
  Autorizado,
  AuditoriaLog,
  DiaGastoCliente,
  DatosColmado
} from './types';
import { formatoMoneda, formatearFechaCorta, esDiaDePagoHoy, obtenerQuincenaActual } from './utils/paymentCycle';
import { ToastContainer, ToastMessage } from './components/Toast';
import { ReceiptModal } from './components/ReceiptModal';
import { LimitExceededModal } from './components/LimitExceededModal';
import { EditLimitModal } from './components/EditLimitModal';
import { EditPaymentDaysModal } from './components/EditPaymentDaysModal';
import { AuthorizedModal } from './components/AuthorizedModal';
import { DeleteAuthorizedModal } from './components/DeleteAuthorizedModal';
import { ApkGuideModal } from './components/ApkGuideModal';
import { GoogleSheetsConfigModal } from './components/GoogleSheetsConfigModal';
import { ColmadoSettingsModal } from './components/ColmadoSettingsModal';
import { TopDebtorsChart } from './components/TopDebtorsChart';
import { NotificationCenterModal } from './components/NotificationCenterModal';
import { NotificationBellButton } from './components/NotificationBellButton';
import { NotificationPermissionBanner } from './components/NotificationPermissionBanner';
import { notificationService } from './services/notificationService';
import { usePWAInstall } from './hooks/usePWAInstall';
import { generarReciboPDF, generarReporteHistorialPDF, generarGastosQuincenaPDF } from './utils/pdfGenerator';

type AppView =
  | 'landing'
  | 'admin-login'
  | 'admin-dashboard'
  | 'admin-fiado'
  | 'admin-abono'
  | 'admin-autorizado'
  | 'admin-crear-cliente'
  | 'admin-detalle-cliente'
  | 'admin-auditoria'
  | 'client-login'
  | 'client-dashboard';

export default function App() {
  const { isInstallable, install, isInstalled } = usePWAInstall();

  // Navigation State
  const [currentView, setCurrentView] = useState<AppView>('landing');
  const [adminTab, setAdminTab] = useState<'inicio' | 'clientes' | 'historial'>('inicio');
  const [clientTab, setClientTab] = useState<'inicio' | 'historial' | 'perfil'>('inicio');
  const [drawerOpen, setDrawerOpen] = useState(false);

  // Toast Notifications
  const [toasts, setToasts] = useState<ToastMessage[]>([]);
  const showToast = (title: string, message: string = '', type: 'success' | 'error' | 'warning' | 'info' = 'info') => {
    const id = Math.random().toString(36).substring(2, 9);
    setToasts(prev => [...prev, { id, title, message, type }]);
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id));
    }, 4000);
  };
  const dismissToast = (id: string) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  };

  const vibrate = (ms: number = 10) => {
    if (typeof navigator !== 'undefined' && navigator.vibrate) {
      try { navigator.vibrate(ms); } catch {}
    }
  };

  // Modals state
  const [isApkGuideOpen, setIsApkGuideOpen] = useState(false);
  const [isSheetsConfigOpen, setIsSheetsConfigOpen] = useState(false);
  const [isColmadoSettingsOpen, setIsColmadoSettingsOpen] = useState(false);
  const [isNotificationModalOpen, setIsNotificationModalOpen] = useState(false);
  const [datosColmado, setDatosColmado] = useState<DatosColmado>(() => store.getDatosColmado());
  const [dismissDemoBanner, setDismissDemoBanner] = useState(() => localStorage.getItem('colmado_dismiss_demo_banner') === 'true');
  const [activeReceipt, setActiveReceipt] = useState<Movimiento | null>(null);
  const [limitExceededData, setLimitExceededData] = useState<{
    nombreCliente: string;
    telefonoCliente: string;
    limite: number;
    saldoActual: number;
    disponible: number;
    montoIntentado: number;
  } | null>(null);

  // Edit modals state
  const [editLimitModal, setEditLimitModal] = useState<{
    isOpen: boolean;
    nombre: string;
    saldo: number;
    limite: number;
    targetId: number;
    esCliente: boolean;
  }>({ isOpen: false, nombre: '', saldo: 0, limite: 0, targetId: 0, esCliente: false });

  const [editPaymentDaysModal, setEditPaymentDaysModal] = useState<{
    isOpen: boolean;
    nombre: string;
    dias: string;
    targetId: number;
  }>({ isOpen: false, nombre: '', dias: '15,30', targetId: 0 });

  const [authModal, setAuthModal] = useState<{
    isOpen: boolean;
    modo: 'agregar' | 'editar';
    autorizado: Autorizado | null;
    targetClienteId: number;
    esCliente: boolean;
  }>({ isOpen: false, modo: 'agregar', autorizado: null, targetClienteId: 0, esCliente: false });

  const [deleteAuthModal, setDeleteAuthModal] = useState<{
    autorizado: Autorizado | null;
    targetClienteId: number;
    esCliente: boolean;
  }>({ autorizado: null, targetClienteId: 0, esCliente: false });

  // Admin Data State
  const [adminClientes, setAdminClientes] = useState<ClienteCalculado[]>([]);
  const [adminTotalCobrar, setAdminTotalCobrar] = useState(0);
  const [adminPendientesPago, setAdminPendientesPago] = useState(0);
  const [adminAlDiaPago, setAdminAlDiaPago] = useState(0);
  const [adminHoyFiados, setAdminHoyFiados] = useState(0);
  const [adminHoyAbonos, setAdminHoyAbonos] = useState(0);
  const [clienteSearch, setClienteSearch] = useState('');
  const [filtroCliente, setFiltroCliente] = useState<'todos' | 'deuda' | 'aldia'>('todos');
  const [adminHistorial, setAdminHistorial] = useState<Movimiento[]>([]);
  const [adminHistorialFiltro, setAdminHistorialFiltro] = useState<'todos' | 'Fiado' | 'Abono'>('todos');
  const [selectedClientDetail, setSelectedClientDetail] = useState<ClienteCalculado | null>(null);
  const [selectedClientHistory, setSelectedClientHistory] = useState<Movimiento[]>([]);
  const [selectedClientDateFiltro, setSelectedClientDateFiltro] = useState<string>('');

  // Client Session State
  const [currentClient, setCurrentClient] = useState<ClienteCalculado | null>(null);
  const [clientGastos, setClientGastos] = useState<DiaGastoCliente[]>([]);
  const [clientMovimientos, setClientMovimientos] = useState<Movimiento[]>([]);
  const [clientHistorialFiltro, setClientHistorialFiltro] = useState<'todos' | 'Fiado' | 'Abono'>('todos');
  const [clientAutorizados, setClientAutorizados] = useState<Autorizado[]>([]);

  // Login inputs
  const [adminEmail, setAdminEmail] = useState(() => localStorage.getItem('colmado_admin_email') || 'admin@colmado.com');
  const [adminPass, setAdminPass] = useState('1234');
  const [adminRemember, setAdminRemember] = useState(true);
  const [clientPhone, setClientPhone] = useState(() => localStorage.getItem('colmado_cliente_tel') || '');
  const [clientPin, setClientPin] = useState('');
  const [clientRemember, setClientRemember] = useState(true);

  // Form states
  const [formFiadoCliente, setFormFiadoCliente] = useState('');
  const [formFiadoAutorizado, setFormFiadoAutorizado] = useState('');
  const [formFiadoMonto, setFormFiadoMonto] = useState('');
  const [formFiadoObs, setFormFiadoObs] = useState('');
  const [formAbonoCliente, setFormAbonoCliente] = useState('');
  const [formAbonoMonto, setFormAbonoMonto] = useState('');
  const [formAbonoObs, setFormAbonoObs] = useState('');
  const [selectedFiadosPagados, setSelectedFiadosPagados] = useState<number[]>([]);
  const [formNewClientNombre, setFormNewClientNombre] = useState('');
  const [formNewClientTel, setFormNewClientTel] = useState('');
  const [formNewClientPin, setFormNewClientPin] = useState('');
  const [formNewClientLimite, setFormNewClientLimite] = useState('5000');
  const [formNewClientDias, setFormNewClientDias] = useState('15,30');
  const [formNewClientAuts, setFormNewClientAuts] = useState<{ nombre: string; parentesco: string }[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Load Admin Dashboard
  const refreshAdminDashboard = async () => {
    try {
      const data = await store.getDashboardAdmin();
      setAdminTotalCobrar(data.totalCobrar);
      setAdminClientes(data.clientes);
      setAdminPendientesPago(data.pendientesPago);
      setAdminAlDiaPago(data.alDiaPago);
      setAdminHoyFiados(data.hoyFiados);
      setAdminHoyAbonos(data.hoyAbonos);
      setAdminHistorial(store.getHistorialAdmin());

      // If viewing detail, update that client
      if (selectedClientDetail) {
        const updated = data.clientes.find(c => c.id === selectedClientDetail.id);
        if (updated) {
          setSelectedClientDetail(updated);
          const allMovs = store.getHistorialAdmin();
          setSelectedClientHistory(allMovs.filter(m => m.idCliente === updated.id));
        }
      }
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    refreshAdminDashboard();
  }, []);

  // WhatsApp reminder
  const sendWhatsAppReminder = (c: { nombre: string; telefono: string; saldo: number }) => {
    vibrate(20);
    const telLimpio = c.telefono.replace(/[^0-9]/g, '');
    if (!telLimpio) {
      showToast('Error', 'El cliente no tiene teléfono válido', 'error');
      return;
    }
    const numeroCompleto = telLimpio.length <= 10 ? '1' + telLimpio : telLimpio;
    const mensaje =
      `Hola *${c.nombre}*, te saludamos de *Súper Colmado DAVID*.\n\n` +
      `Te recordamos amablemente que tu saldo pendiente actual es de *${formatoMoneda(c.saldo)}*.\n\n` +
      `Puedes pasar por el colmado para regularizarlo cuando te sea posible. ¡Gracias por tu preferencia!`;
    const url = `https://wa.me/${numeroCompleto}?text=${encodeURIComponent(mensaje)}`;
    window.open(url, '_blank');
    store.registrarLog('Colmadero', 'Admin', 'Envío Recordatorio WhatsApp', `Cliente: ${c.nombre} - Monto: ${formatoMoneda(c.saldo)}`);
    showToast('WhatsApp Abierto', `Recordatorio enviado a ${c.nombre}`, 'success');
  };

  // Open Client Detail (Admin)
  const openClientDetail = (c: ClienteCalculado) => {
    vibrate(15);
    setSelectedClientDetail(c);
    const allMovs = store.getHistorialAdmin();
    setSelectedClientHistory(allMovs.filter(m => m.idCliente === c.id));
    setCurrentView('admin-detalle-cliente');
  };

  // Admin Login Action
  const handleAdminLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    vibrate(15);
    setIsSubmitting(true);
    try {
      const res = await store.loginUsuario(adminEmail, adminPass);
      if (res.success) {
        if (adminRemember) localStorage.setItem('colmado_admin_email', adminEmail);
        else localStorage.removeItem('colmado_admin_email');
        showToast('¡Bienvenido!', 'Administrador de Súper Colmado DAVID', 'success');
        await refreshAdminDashboard();
        setCurrentView('admin-dashboard');
        setAdminTab('inicio');
      } else {
        showToast('Error de acceso', res.message || 'Credenciales incorrectas', 'error');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  // Client Login Action
  const handleClientLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    vibrate(15);
    setIsSubmitting(true);
    try {
      const res = await store.loginCliente(clientPhone, clientPin);
      if (res.encontrado && res.cliente) {
        if (clientRemember) localStorage.setItem('colmado_cliente_tel', clientPhone);
        else localStorage.removeItem('colmado_cliente_tel');

        setCurrentClient(res.cliente);
        const dias = store.getGastosDiariosCliente(res.cliente.id);
        setClientGastos(dias);
        const movs: Movimiento[] = [];
        dias.forEach(d => movs.push(...d.movimientos));
        setClientMovimientos(movs);
        setClientAutorizados(store.getAutorizadosDeCliente(res.cliente.id));

        showToast('¡Bienvenido!', res.cliente.nombre, 'success');
        setCurrentView('client-dashboard');
        setClientTab('inicio');
      } else {
        showToast('Error de acceso', res.mensaje || 'Teléfono o PIN incorrecto', 'error');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  // Submit Fiado
  const handleGuardarFiado = async (e: React.FormEvent) => {
    e.preventDefault();
    vibrate(20);
    const idC = Number(formFiadoCliente);
    const idA = Number(formFiadoAutorizado);
    const monto = parseFloat(formFiadoMonto);
    if (!idC || !idA || isNaN(monto) || monto <= 0) {
      showToast('Campos requeridos', 'Selecciona cliente, autorizado y monto', 'warning');
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await store.registrarFiado(idC, idA, monto, formFiadoObs);
      if (res.success) {
        showToast('Fiado registrado', `Monto: ${formatoMoneda(res.total || monto)}`, 'success');
        
        // Datos para alertas y notificaciones push
        const clientObj = adminClientes.find(c => c.id === idC);
        const auths = store.getAutorizadosDeCliente(idC);
        const authObj = auths.find(a => a.id === idA);
        const quienCompro = authObj ? `${authObj.nombre} (${authObj.parentesco})` : (clientObj?.nombre || 'Cliente');
        const nuevoSaldo = (clientObj?.saldo || 0) + monto;
        const limite = clientObj?.limite || 0;

        // 1. Alerta Push al cliente notificando el consumo registrado
        notificationService.notifyConsumoCliente({
          clienteId: idC,
          clienteNombre: clientObj?.nombre || 'Cliente',
          monto,
          quienCompro,
          nuevoSaldo,
          limite
        }).catch(() => {});

        // 2. Alerta Push al administrador si el cliente alcanza su límite de crédito
        if (limite > 0 && nuevoSaldo >= limite) {
          notificationService.notifyLimiteCreditoAlcanzado({
            clienteId: idC,
            clienteNombre: clientObj?.nombre || 'Cliente',
            saldo: nuevoSaldo,
            limite,
            bloqueado: false
          }).catch(() => {});
        }

        setFormFiadoMonto('');
        setFormFiadoObs('');
        await refreshAdminDashboard();
        if (selectedClientDetail) {
          openClientDetail(selectedClientDetail);
        } else {
          setCurrentView('admin-dashboard');
        }
      } else if (res.limiteSuperado) {
        // Alerta Push al administrador: intento que superaría el límite de crédito
        notificationService.notifyLimiteCreditoAlcanzado({
          clienteId: idC,
          clienteNombre: res.nombreCliente || 'Cliente',
          saldo: res.saldoActual || 0,
          limite: res.limite || 0,
          montoIntentado: res.montoIntentado || monto,
          bloqueado: true
        }).catch(() => {});

        setLimitExceededData({
          nombreCliente: res.nombreCliente || 'Cliente',
          telefonoCliente: res.telefonoCliente || '',
          limite: res.limite || 0,
          saldoActual: res.saldoActual || 0,
          disponible: res.disponible || 0,
          montoIntentado: res.montoIntentado || monto
        });
      } else {
        showToast('Error', res.message || 'No se pudo registrar el fiado', 'error');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  // Submit Abono
  const handleGuardarAbono = async (e: React.FormEvent) => {
    e.preventDefault();
    vibrate(20);
    const idC = Number(formAbonoCliente);
    const monto = parseFloat(formAbonoMonto);
    if (!idC || isNaN(monto) || monto <= 0) {
      showToast('Campos requeridos', 'Selecciona cliente y monto', 'warning');
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await store.registrarAbono(idC, monto, formAbonoObs, selectedFiadosPagados);
      if (res.success) {
        showToast('Abono registrado', `Nuevo saldo: ${formatoMoneda(res.nuevoSaldo || 0)}`, 'success');

        // Notificación Push al cliente confirmando el abono
        const clientObj = adminClientes.find(c => c.id === idC);
        notificationService.notifyAbonoCliente({
          clienteId: idC,
          clienteNombre: clientObj?.nombre || 'Cliente',
          monto,
          nuevoSaldo: res.nuevoSaldo || 0
        }).catch(() => {});

        setFormAbonoMonto('');
        setFormAbonoObs('');
        setSelectedFiadosPagados([]);
        await refreshAdminDashboard();
        if (selectedClientDetail) {
          openClientDetail(selectedClientDetail);
        } else {
          setCurrentView('admin-dashboard');
        }
      } else {
        showToast('Error', res.message || 'No se pudo registrar el abono', 'error');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  // Submit Crear Cliente
  const handleCrearCliente = async (e: React.FormEvent) => {
    e.preventDefault();
    vibrate(20);
    if (!formNewClientNombre.trim() || !formNewClientTel.trim()) {
      showToast('Campos requeridos', 'Nombre y teléfono son obligatorios', 'warning');
      return;
    }
    if (formNewClientPin.length !== 4) {
      showToast('PIN inválido', 'El PIN debe ser exactamente de 4 dígitos', 'warning');
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await store.crearCliente(
        formNewClientNombre,
        formNewClientTel,
        formNewClientPin,
        formNewClientLimite,
        formNewClientAuts,
        formNewClientDias
      );
      if (res.success) {
        // Alerta Push al Administrador: Nuevo Cliente Registrado
        const limiteNum = parseFloat(formNewClientLimite) || 5000;
        notificationService.notifyNuevoRegistroCliente({
          id: res.id || Date.now(),
          nombre: formNewClientNombre,
          limite: limiteNum,
          telefono: formNewClientTel
        }).catch(() => {});

        showToast('Cliente Creado', `${formNewClientNombre} fue registrado con éxito`, 'success');
        setFormNewClientNombre('');
        setFormNewClientTel('');
        setFormNewClientPin('');
        setFormNewClientAuts([]);
        await refreshAdminDashboard();
        setCurrentView('admin-dashboard');
        setAdminTab('clientes');
      } else {
        showToast('Error', res.message || 'Error al crear cliente', 'error');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  // Reset PIN
  const handleResetPin = async (c: ClienteCalculado) => {
    vibrate(20);
    const res = await store.generarPINCliente(c.id);
    if (res.success) {
      showToast('Nuevo PIN Generado', `El PIN para ${c.nombre} es: ${res.pin}`, 'success');
      await refreshAdminDashboard();
    }
  };

  // Filtered Clients for Admin Clientes Tab
  const filteredClientes = useMemo(() => {
    let list = adminClientes;
    if (filtroCliente === 'deuda') list = list.filter(c => c.saldo > 0);
    if (filtroCliente === 'aldia') list = list.filter(c => c.saldo <= 0);
    if (clienteSearch.trim()) {
      const q = clienteSearch.toLowerCase().trim();
      list = list.filter(c => c.nombre.toLowerCase().includes(q) || c.telefono.includes(q));
    }
    return list;
  }, [adminClientes, filtroCliente, clienteSearch]);

  // Clientes cuyo día de pago coincide con hoy
  const diaHoyNumero = new Date().getDate();
  const clientesPaganHoy = useMemo(() => {
    return adminClientes.filter(c => esDiaDePagoHoy(c.diasPago));
  }, [adminClientes]);

  const clientesCobroHoyConDeuda = useMemo(() => {
    return adminClientes.filter(c => esDiaDePagoHoy(c.diasPago) && c.saldo > 0);
  }, [adminClientes]);

  // Filtered History for Admin
  const filteredAdminHistorial = useMemo(() => {
    if (adminHistorialFiltro === 'todos') return adminHistorial;
    return adminHistorial.filter(m => m.tipo === adminHistorialFiltro);
  }, [adminHistorial, adminHistorialFiltro]);

  // Client Fiado selection autorizados
  const fiadoAutorizados = useMemo(() => {
    if (!formFiadoCliente) return [];
    return store.getAutorizadosDeCliente(Number(formFiadoCliente));
  }, [formFiadoCliente]);

  const fiadoClienteSeleccionado = useMemo(() => {
    if (!formFiadoCliente) return null;
    return adminClientes.find(c => c.id === Number(formFiadoCliente)) || null;
  }, [formFiadoCliente, adminClientes]);

  const abonoClienteSeleccionado = useMemo(() => {
    if (!formAbonoCliente) return null;
    return adminClientes.find(c => c.id === Number(formAbonoCliente)) || null;
  }, [formAbonoCliente, adminClientes]);

  return (
    <div className="min-h-screen bg-slate-900 text-slate-800 flex justify-center selection:bg-blue-500 selection:text-white">
      {/* Toast Notifications */}
      <ToastContainer toasts={toasts} onDismiss={dismissToast} />

      {/* Modals */}
      <ReceiptModal movimiento={activeReceipt} onClose={() => setActiveReceipt(null)} />
      <LimitExceededModal data={limitExceededData} onClose={() => setLimitExceededData(null)} />
      <ApkGuideModal isOpen={isApkGuideOpen} onClose={() => setIsApkGuideOpen(false)} />
      <GoogleSheetsConfigModal
        isOpen={isSheetsConfigOpen}
        onClose={() => setIsSheetsConfigOpen(false)}
        onConfigChanged={refreshAdminDashboard}
      />
      <ColmadoSettingsModal
        isOpen={isColmadoSettingsOpen}
        onClose={() => setIsColmadoSettingsOpen(false)}
        onSaved={updated => {
          setDatosColmado(updated);
          showToast('Datos del Colmado Guardados', updated.nombre, 'success');
        }}
      />
      <NotificationCenterModal
        isOpen={isNotificationModalOpen}
        onClose={() => setIsNotificationModalOpen(false)}
        rol={currentView.startsWith('admin') ? 'admin' : 'cliente'}
        clienteId={currentClient?.id}
        onSelectNotification={(notif) => {
          if (notif.clienteId && currentView.startsWith('admin')) {
            const target = adminClientes.find(c => c.id === notif.clienteId);
            if (target) {
              openClientDetail(target);
              setIsNotificationModalOpen(false);
            }
          }
        }}
      />
      <EditLimitModal
        isOpen={editLimitModal.isOpen}
        nombreCliente={editLimitModal.nombre}
        saldoActual={editLimitModal.saldo}
        limiteActual={editLimitModal.limite}
        onClose={() => setEditLimitModal(prev => ({ ...prev, isOpen: false }))}
        onSave={async nuevo => {
          await store.actualizarLimiteCliente(editLimitModal.targetId, nuevo, editLimitModal.esCliente);
          showToast('Límite actualizado', `Nuevo límite: ${formatoMoneda(nuevo)}`, 'success');
          await refreshAdminDashboard();
          if (editLimitModal.esCliente && currentClient) {
            const updated = store.getDashboardAdmin();
            updated.then(d => {
              const cli = d.clientes.find(c => c.id === currentClient.id);
              if (cli) setCurrentClient(cli);
            });
          }
        }}
      />
      <EditPaymentDaysModal
        isOpen={editPaymentDaysModal.isOpen}
        nombreCliente={editPaymentDaysModal.nombre}
        diasActuales={editPaymentDaysModal.dias}
        onClose={() => setEditPaymentDaysModal(prev => ({ ...prev, isOpen: false }))}
        onSave={async dias => {
          await store.actualizarDiasPagoCliente(editPaymentDaysModal.targetId, dias);
          showToast('Días de pago guardados', `Días: ${dias}`, 'success');
          await refreshAdminDashboard();
        }}
      />
      <AuthorizedModal
        isOpen={authModal.isOpen}
        modo={authModal.modo}
        autorizado={authModal.autorizado}
        onClose={() => setAuthModal(prev => ({ ...prev, isOpen: false }))}
        onSave={async (nombre, parentesco) => {
          if (authModal.modo === 'editar' && authModal.autorizado) {
            await store.editarAutorizado(authModal.autorizado.id, nombre, parentesco, authModal.esCliente);
            showToast('Autorizado actualizado', nombre, 'success');
          } else {
            await store.agregarAutorizadoCliente(authModal.targetClienteId, nombre, parentesco, authModal.esCliente);
            const cli = adminClientes.find(c => c.id === authModal.targetClienteId);
            notificationService.notifyNuevoAutorizado(
              cli?.nombre || 'Cliente',
              nombre,
              parentesco,
              authModal.targetClienteId
            ).catch(() => {});
            showToast('Autorizado agregado', nombre, 'success');
          }
          if (authModal.esCliente) {
            setClientAutorizados(store.getAutorizadosDeCliente(authModal.targetClienteId));
          }
          await refreshAdminDashboard();
        }}
      />
      <DeleteAuthorizedModal
        autorizado={deleteAuthModal.autorizado}
        onClose={() => setDeleteAuthModal({ autorizado: null, targetClienteId: 0, esCliente: false })}
        onConfirm={async () => {
          if (deleteAuthModal.autorizado) {
            await store.eliminarAutorizado(
              deleteAuthModal.autorizado.id,
              deleteAuthModal.targetClienteId,
              deleteAuthModal.esCliente
            );
            showToast('Eliminado', deleteAuthModal.autorizado.nombre, 'success');
            if (deleteAuthModal.esCliente) {
              setClientAutorizados(store.getAutorizadosDeCliente(deleteAuthModal.targetClienteId));
            }
            await refreshAdminDashboard();
          }
        }}
      />

      {/* Main Container - Responsive Mobile Mockup / Frame */}
      <div className="w-full max-w-md sm:max-w-lg md:max-w-xl min-h-screen bg-slate-50 relative flex flex-col shadow-2xl overflow-x-hidden sm:my-0 md:my-4 sm:rounded-none md:rounded-3xl border-slate-700/30">
        
        {/* ======================================================== */}
        {/* 1. LANDING VIEW */}
        {/* ======================================================== */}
        {currentView === 'landing' && (
          <div className="flex-1 flex flex-col justify-between p-6 text-center relative overflow-hidden bg-gradient-to-b from-blue-900 via-slate-900 to-slate-950 text-white min-h-[100dvh]">
            <div className="absolute top-0 right-0 w-80 h-80 bg-blue-500/15 rounded-full -mr-32 -mt-32 pointer-events-none blur-2xl"></div>
            <div className="absolute bottom-0 left-0 w-72 h-72 bg-blue-400/10 rounded-full -ml-28 -mb-28 pointer-events-none blur-xl"></div>

            {/* Top Bar with Sheets status & APK button */}
            <div className="relative z-10 flex items-center justify-between pt-2">
              <button
                onClick={() => { vibrate(); setIsSheetsConfigOpen(true); }}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/10 hover:bg-white/20 backdrop-blur-md text-xs font-semibold text-blue-100 transition border border-white/10"
              >
                <Database className="w-3.5 h-3.5 text-emerald-400" />
                <span>{store.isGoogleSheetConnected() ? 'Sheets En Vivo' : 'Modo Local'}</span>
              </button>

              <button
                onClick={() => { vibrate(); setIsApkGuideOpen(true); }}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-yellow-400/20 hover:bg-yellow-400/30 text-yellow-300 font-bold text-xs transition border border-yellow-400/30"
              >
                <Smartphone className="w-3.5 h-3.5" />
                <span>Instalar / APK</span>
              </button>
            </div>

            {/* Hero / Brand */}
            <div className="relative z-10 my-auto py-8 flex flex-col items-center">
              <div className="w-24 h-24 bg-white rounded-3xl mb-4 flex items-center justify-center shadow-2xl p-4 transform hover:scale-105 transition">
                <ShoppingBag className="w-14 h-14 text-blue-700" />
              </div>
              <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white mb-1">
                {datosColmado.nombre}
              </h1>
              <p className="text-slate-300 text-xs sm:text-sm font-medium">{datosColmado.slogan}</p>

              {/* Info rápida del colmado */}
              <div className="mt-4 max-w-xs bg-white/5 border border-white/10 px-3.5 py-2 rounded-2xl text-[11px] text-blue-100 space-y-1 backdrop-blur-xs text-left">
                <div className="flex items-start gap-1.5">
                  <MapPin className="w-3.5 h-3.5 text-emerald-400 shrink-0 mt-0.5" />
                  <span className="truncate">{datosColmado.direccion}</span>
                </div>
                <div className="flex items-center justify-between text-[10px] text-slate-300 pt-0.5">
                  <span className="flex items-center gap-1">
                    <Clock className="w-3 h-3 text-cyan-400" />
                    {datosColmado.horario}
                  </span>
                  <span className="flex items-center gap-1 font-semibold text-amber-300">
                    <Phone className="w-3 h-3" />
                    {datosColmado.telefono}
                  </span>
                </div>
              </div>

              <div className="mt-8 max-w-xs bg-white/5 border border-white/10 rounded-2xl p-4 backdrop-blur-sm">
                <p className="text-sm font-bold text-slate-100">
                  Consulta tu deuda en línea
                </p>
                <p className="text-xs text-blue-200 mt-1">
                  Solo necesitas tu número de teléfono y tu PIN de 4 dígitos
                </p>
              </div>

              {/* Install PWA Prompt if installable */}
              {isInstallable && (
                <button
                  onClick={() => { vibrate(); install(); }}
                  className="mt-5 px-4 py-2 bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white rounded-full text-xs font-bold flex items-center gap-2 shadow-lg transition animate-pulse"
                >
                  <Download className="w-4 h-4" />
                  Instalar App en tu pantalla de inicio
                </button>
              )}
            </div>

            {/* Bottom Actions */}
            <div className="relative z-10 w-full max-w-sm mx-auto space-y-3 pb-4">
              <button
                onClick={() => { vibrate(); setCurrentView('client-login'); }}
                className="w-full py-4 bg-blue-600 hover:bg-blue-700 active:scale-98 text-white rounded-2xl font-bold text-base shadow-xl flex items-center justify-center gap-3 transition"
              >
                <User className="w-5 h-5" />
                Soy Cliente
              </button>

              <button
                onClick={() => { vibrate(); setCurrentView('admin-login'); }}
                className="w-full py-4 bg-white/10 hover:bg-white/20 active:scale-98 text-white rounded-2xl font-bold text-base border border-white/20 backdrop-blur-md flex items-center justify-center gap-3 transition"
              >
                <Shield className="w-5 h-5 text-yellow-400" />
                Soy Colmadero
              </button>

              <div className="flex justify-between items-center text-[11px] text-slate-400 pt-3 px-2">
                <span>v2.2 · Súper Colmado</span>
                <button
                  onClick={() => setIsApkGuideOpen(true)}
                  className="text-blue-300 underline font-semibold"
                >
                  Generador de APK
                </button>
              </div>
            </div>
          </div>
        )}

        {/* ======================================================== */}
        {/* 2. ADMIN LOGIN */}
        {/* ======================================================== */}
        {currentView === 'admin-login' && (
          <div className="flex-1 p-6 bg-white flex flex-col justify-between min-h-[100dvh]">
            <div>
              <button
                onClick={() => { vibrate(); setCurrentView('landing'); }}
                className="w-10 h-10 rounded-full bg-slate-100 hover:bg-slate-200 flex items-center justify-center text-slate-700 transition"
              >
                <X className="w-5 h-5" />
              </button>

              <div className="text-center mt-6 mb-8">
                <div className="w-20 h-20 bg-gradient-to-br from-blue-600 to-indigo-800 rounded-3xl mx-auto mb-4 flex items-center justify-center shadow-xl shadow-blue-200">
                  <Shield className="w-10 h-10 text-white" />
                </div>
                <h2 className="text-2xl font-black text-slate-900">Acceso Colmadero</h2>
                <p className="text-slate-500 text-sm mt-1">Ingresa tus credenciales de administración</p>
              </div>

              <form onSubmit={handleAdminLogin} className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wide mb-1.5">
                    Email
                  </label>
                  <input
                    type="email"
                    value={adminEmail}
                    onChange={e => setAdminEmail(e.target.value)}
                    placeholder="admin@colmado.com"
                    className="w-full px-4 py-3.5 border-2 border-slate-200 rounded-2xl text-base text-slate-800 focus:border-blue-600 focus:outline-hidden"
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wide mb-1.5">
                    Contraseña
                  </label>
                  <input
                    type="password"
                    value={adminPass}
                    onChange={e => setAdminPass(e.target.value)}
                    placeholder="••••••••"
                    className="w-full px-4 py-3.5 border-2 border-slate-200 rounded-2xl text-base text-slate-800 focus:border-blue-600 focus:outline-hidden"
                    required
                  />
                </div>

                <label className="flex items-center gap-3 pt-1 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={adminRemember}
                    onChange={e => setAdminRemember(e.target.checked)}
                    className="w-5 h-5 rounded-md text-blue-600 border-slate-300"
                  />
                  <span className="text-xs font-semibold text-slate-600">Recordar mi email</span>
                </label>

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full py-4 mt-4 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-2xl text-base shadow-lg transition active:scale-98 disabled:opacity-50"
                >
                  {isSubmitting ? 'Verificando...' : 'Iniciar Sesión'}
                </button>
              </form>
            </div>

            <div className="text-center text-xs text-slate-400 py-4">
              Contraseña predeterminada: <strong className="text-slate-600">1234</strong>
            </div>
          </div>
        )}

        {/* ======================================================== */}
        {/* 3. ADMIN DASHBOARD */}
        {/* ======================================================== */}
        {currentView === 'admin-dashboard' && (
          <div className="flex-1 flex flex-col pb-20 relative bg-slate-50 min-h-[100dvh]">
            
            {/* Drawer Backdrop */}
            {drawerOpen && (
              <div
                onClick={() => setDrawerOpen(false)}
                className="fixed inset-0 z-40 bg-black/50 backdrop-blur-xs transition-opacity"
              />
            )}

            {/* Drawer */}
            <div
              className={`fixed top-0 left-0 bottom-0 w-72 bg-white z-50 shadow-2xl flex flex-col transition-transform duration-300 ${
                drawerOpen ? 'translate-x-0' : '-translate-x-full'
              }`}
            >
              <div className="header-gradient p-6 text-white">
                <div className="w-14 h-14 bg-white/20 rounded-2xl flex items-center justify-center mb-3">
                  <ShoppingBag className="w-7 h-7 text-yellow-300" />
                </div>
                <h3 className="font-extrabold text-lg">Súper Colmado</h3>
                <p className="text-blue-100 text-xs">DAVID · Panel de Control</p>
              </div>

              <div className="flex-1 py-3 overflow-y-auto divide-y divide-slate-100">
                <div className="py-2 space-y-1">
                  <button
                    onClick={() => { setAdminTab('inicio'); setDrawerOpen(false); }}
                    className={`w-full flex items-center gap-3 px-6 py-3.5 text-sm font-bold transition ${
                      adminTab === 'inicio' ? 'bg-blue-50 text-blue-700' : 'text-slate-700 hover:bg-slate-50'
                    }`}
                  >
                    <Home className="w-5 h-5 text-blue-600" />
                    Inicio
                  </button>

                  <button
                    onClick={() => { setAdminTab('clientes'); setDrawerOpen(false); }}
                    className={`w-full flex items-center gap-3 px-6 py-3.5 text-sm font-bold transition ${
                      adminTab === 'clientes' ? 'bg-blue-50 text-blue-700' : 'text-slate-700 hover:bg-slate-50'
                    }`}
                  >
                    <Users className="w-5 h-5 text-blue-600" />
                    Clientes
                  </button>

                  <button
                    onClick={() => { setAdminTab('historial'); setDrawerOpen(false); }}
                    className={`w-full flex items-center gap-3 px-6 py-3.5 text-sm font-bold transition ${
                      adminTab === 'historial' ? 'bg-blue-50 text-blue-700' : 'text-slate-700 hover:bg-slate-50'
                    }`}
                  >
                    <Clock className="w-5 h-5 text-blue-600" />
                    Historial de Movimientos
                  </button>

                  <button
                    onClick={() => { setCurrentView('admin-auditoria'); setDrawerOpen(false); }}
                    className="w-full flex items-center gap-3 px-6 py-3.5 text-sm font-bold text-slate-700 hover:bg-slate-50 transition"
                  >
                    <Shield className="w-5 h-5 text-blue-600" />
                    Auditoría del Sistema
                  </button>

                  <button
                    onClick={() => { setIsColmadoSettingsOpen(true); setDrawerOpen(false); }}
                    className="w-full flex items-center justify-between px-6 py-3.5 text-sm font-bold text-slate-700 hover:bg-slate-50 transition"
                  >
                    <div className="flex items-center gap-3">
                      <Store className="w-5 h-5 text-blue-600" />
                      <span>Datos del Colmado</span>
                    </div>
                    <span className="text-[10px] bg-blue-100 text-blue-700 font-extrabold px-2 py-0.5 rounded-full">
                      Editar
                    </span>
                  </button>

                  <button
                    onClick={() => { setIsNotificationModalOpen(true); setDrawerOpen(false); }}
                    className="w-full flex items-center justify-between px-6 py-3.5 text-sm font-bold text-slate-700 hover:bg-slate-50 transition"
                  >
                    <div className="flex items-center gap-3">
                      <Bell className="w-5 h-5 text-blue-600" />
                      <span>Notificaciones Push</span>
                    </div>
                    {notificationService.getUnreadCount('admin') > 0 ? (
                      <span className="text-[10px] bg-red-600 text-white font-black px-2 py-0.5 rounded-full">
                        {notificationService.getUnreadCount('admin')} nuevas
                      </span>
                    ) : (
                      <span className="text-[10px] bg-slate-100 text-slate-600 font-bold px-2 py-0.5 rounded-full">
                        SW API
                      </span>
                    )}
                  </button>
                </div>

                <div className="py-2 space-y-1">
                  <button
                    onClick={() => { setIsSheetsConfigOpen(true); setDrawerOpen(false); }}
                    className="w-full flex items-center gap-3 px-6 py-3.5 text-sm font-bold text-emerald-700 hover:bg-emerald-50 transition"
                  >
                    <Database className="w-5 h-5 text-emerald-600" />
                    Google Sheets & API
                  </button>

                  <button
                    onClick={() => { setIsApkGuideOpen(true); setDrawerOpen(false); }}
                    className="w-full flex items-center gap-3 px-6 py-3.5 text-sm font-bold text-indigo-700 hover:bg-indigo-50 transition"
                  >
                    <Smartphone className="w-5 h-5 text-indigo-600" />
                    Generar APK Móvil
                  </button>
                </div>
              </div>

              <div className="p-4 border-t border-slate-100">
                <button
                  onClick={() => {
                    vibrate();
                    setDrawerOpen(false);
                    setCurrentView('landing');
                    showToast('Sesión Cerrada', '', 'info');
                  }}
                  className="w-full py-3 bg-red-50 hover:bg-red-100 text-red-600 font-bold text-sm rounded-xl flex items-center justify-center gap-2 transition"
                >
                  <LogOut className="w-4 h-4" />
                  Cerrar Sesión
                </button>
              </div>
            </div>

            {/* TAB INICIO */}
            {adminTab === 'inicio' && (
              <div>
                {/* Header Gradient */}
                <div className="header-gradient p-6 pb-20 rounded-b-3xl text-white relative">
                  <div className="flex justify-between items-center mb-5">
                    <button
                      onClick={() => setDrawerOpen(true)}
                      className="w-10 h-10 rounded-2xl bg-white/15 hover:bg-white/25 flex items-center justify-center transition"
                    >
                      <Menu className="w-5 h-5" />
                    </button>
                    <div className="flex items-center gap-2">
                      <NotificationBellButton
                        rol="admin"
                        onClick={() => { vibrate(); setIsNotificationModalOpen(true); }}
                        className="bg-white/15 hover:bg-white/25 text-white border-white/20"
                      />
                      <button
                        onClick={() => { vibrate(); setIsColmadoSettingsOpen(true); }}
                        className="flex items-center gap-1 px-2.5 py-1.5 rounded-full bg-white/20 hover:bg-white/30 text-white font-bold text-xs transition border border-white/25 shadow-xs"
                        title="Configurar datos del colmado"
                      >
                        <Store className="w-3.5 h-3.5 text-yellow-300" />
                        <span className="text-[11px]">Datos Negocio</span>
                      </button>
                      <div className="w-9 h-9 rounded-full bg-white/20 flex items-center justify-center font-bold text-sm border border-white/30">
                        {datosColmado.nombre.charAt(0).toUpperCase()}
                      </div>
                    </div>
                  </div>

                  <h2 className="text-2xl font-black">{datosColmado.nombre}</h2>
                  <p className="text-xs text-blue-200 mt-0.5">{datosColmado.slogan}</p>

                  {/* Total Por Cobrar Card */}
                  <div className="mt-5 bg-white text-slate-800 rounded-3xl p-5 shadow-2xl">
                    <div className="flex items-center justify-between text-xs text-slate-500 font-bold uppercase tracking-wider mb-2">
                      <span>Total por cobrar</span>
                      <span className="text-blue-600 font-black">{adminClientes.filter(c => c.saldo > 0).length} con deuda</span>
                    </div>
                    <div className="text-3xl font-black text-slate-900 tracking-tight">
                      {formatoMoneda(adminTotalCobrar)}
                    </div>
                  </div>

                  {/* Banner when using demo data */}
                  {!store.isGoogleSheetConnected() && !dismissDemoBanner && (
                    <div
                      onClick={() => { vibrate(); setIsSheetsConfigOpen(true); }}
                      className="mt-3 bg-amber-400/20 hover:bg-amber-400/30 border border-amber-300/40 rounded-2xl p-3 flex items-center justify-between text-white text-xs cursor-pointer transition backdrop-blur-xs"
                    >
                      <div className="flex items-center gap-2.5 min-w-0 pr-2">
                        <Database className="w-4 h-4 text-yellow-300 shrink-0" />
                        <span className="font-semibold text-[11px] text-amber-100 truncate sm:whitespace-normal">
                          Viendo datos de prueba. Toca aquí para sincronizar tu Google Sheet.
                        </span>
                      </div>
                      <div className="flex items-center gap-1.5 shrink-0">
                        <ChevronRight className="w-4 h-4 text-amber-300" />
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            setDismissDemoBanner(true);
                            localStorage.setItem('colmado_dismiss_demo_banner', 'true');
                          }}
                          className="w-6 h-6 rounded-full hover:bg-white/20 flex items-center justify-center text-amber-200 transition"
                          title="Cerrar aviso"
                        >
                          <X className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  )}
                </div>

                {/* Submetrics Card */}
                <div className="px-4 -mt-10 relative z-10 space-y-4">
                  {/* Banner de Permiso de Notificaciones Push */}
                  <NotificationPermissionBanner rol="admin" />

                  <div className="grid grid-cols-3 gap-2">
                    <div className="bg-white rounded-2xl p-3 text-center shadow-xs border border-slate-100">
                      <div className="w-9 h-9 bg-blue-100 text-blue-600 rounded-xl flex items-center justify-center mx-auto mb-1">
                        <Users className="w-4 h-4" />
                      </div>
                      <div className="text-lg font-black text-slate-900">
                        {adminClientes.filter(c => c.saldo > 0).length}
                      </div>
                      <div className="text-[10px] text-slate-500 font-medium leading-tight">Deudores</div>
                    </div>

                    <div className="bg-white rounded-2xl p-3 text-center shadow-xs border border-slate-100">
                      <div className="w-9 h-9 bg-amber-100 text-amber-600 rounded-xl flex items-center justify-center mx-auto mb-1">
                        <ShoppingBag className="w-4 h-4" />
                      </div>
                      <div className="text-lg font-black text-slate-900">{adminHoyFiados}</div>
                      <div className="text-[10px] text-slate-500 font-medium leading-tight">Fiados hoy</div>
                    </div>

                    <div className="bg-white rounded-2xl p-3 text-center shadow-xs border border-slate-100">
                      <div className="w-9 h-9 bg-emerald-100 text-emerald-600 rounded-xl flex items-center justify-center mx-auto mb-1">
                        <ArrowDownLeft className="w-4 h-4" />
                      </div>
                      <div className="text-lg font-black text-slate-900">{adminHoyAbonos}</div>
                      <div className="text-[10px] text-slate-500 font-medium leading-tight">Abonos hoy</div>
                    </div>
                  </div>

                  {/* Payment Cycles Alert */}
                  <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-2xl p-4 flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-blue-600 text-white flex items-center justify-center shrink-0">
                      <Calendar className="w-5 h-5" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="text-xs font-bold text-slate-800 uppercase tracking-wide">
                        Ciclos de pago (15 y 30)
                      </div>
                      <div className="flex items-center gap-4 text-xs font-bold mt-1">
                        <span className="text-amber-700">
                          <strong>{adminPendientesPago}</strong> pendientes
                        </span>
                        <span className="text-emerald-700">
                          <strong>{adminAlDiaPago}</strong> al día
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Big Primary Action: Registrar Fiado */}
                  <button
                    onClick={() => { vibrate(); setCurrentView('admin-fiado'); }}
                    className="w-full bg-gradient-to-r from-blue-600 via-blue-700 to-indigo-700 text-white rounded-2xl p-4 flex items-center justify-between shadow-xl shadow-blue-200 active:scale-98 transition"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-11 h-11 rounded-xl bg-white/20 backdrop-blur-md flex items-center justify-center">
                        <PlusCircle className="w-6 h-6 text-white" />
                      </div>
                      <div className="text-left">
                        <div className="font-black text-base">Registrar Fiado</div>
                        <div className="text-xs text-blue-100">Anota compra y autorizado</div>
                      </div>
                    </div>
                    <ChevronRight className="w-5 h-5 text-blue-200" />
                  </button>

                  {/* Quick Grid: Abono, Autorizado, Nuevo Cliente */}
                  <div className="grid grid-cols-3 gap-2">
                    <button
                      onClick={() => { vibrate(); setCurrentView('admin-abono'); }}
                      className="bg-white p-3 rounded-2xl border border-slate-100 flex flex-col items-center text-center hover:bg-slate-50 transition active:scale-95"
                    >
                      <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-600 flex items-center justify-center mb-1.5">
                        <ArrowDownLeft className="w-5 h-5" />
                      </div>
                      <span className="font-bold text-xs text-slate-800">Abono</span>
                      <span className="text-[10px] text-slate-400">Cobrar deuda</span>
                    </button>

                    <button
                      onClick={() => { vibrate(); setCurrentView('admin-autorizado'); }}
                      className="bg-white p-3 rounded-2xl border border-slate-100 flex flex-col items-center text-center hover:bg-slate-50 transition active:scale-95"
                    >
                      <div className="w-10 h-10 rounded-xl bg-purple-100 text-purple-600 flex items-center justify-center mb-1.5">
                        <UserCheck className="w-5 h-5" />
                      </div>
                      <span className="font-bold text-xs text-slate-800">Autorizado</span>
                      <span className="text-[10px] text-slate-400">Pariente</span>
                    </button>

                    <button
                      onClick={() => { vibrate(); setCurrentView('admin-crear-cliente'); }}
                      className="bg-white p-3 rounded-2xl border border-slate-100 flex flex-col items-center text-center hover:bg-slate-50 transition active:scale-95"
                    >
                      <div className="w-10 h-10 rounded-xl bg-blue-100 text-blue-600 flex items-center justify-center mb-1.5">
                        <Users className="w-5 h-5" />
                      </div>
                      <span className="font-bold text-xs text-slate-800">Nuevo</span>
                      <span className="text-[10px] text-slate-400">Registrar</span>
                    </button>
                  </div>

                  {/* Widget Especial: Clientes con Día de Pago HOY */}
                  {clientesCobroHoyConDeuda.length > 0 && (
                    <div className="bg-gradient-to-r from-red-600 via-rose-600 to-amber-600 rounded-3xl p-4 text-white shadow-lg shadow-red-200 animate-in fade-in duration-300">
                      <div className="flex items-center justify-between mb-1.5">
                        <div className="flex items-center gap-2">
                          <span className="relative flex h-3 w-3">
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-yellow-300 opacity-75"></span>
                            <span className="relative inline-flex rounded-full h-3 w-3 bg-yellow-400"></span>
                          </span>
                          <h3 className="font-black text-sm uppercase tracking-wide flex items-center gap-1.5">
                            <Bell className="w-4 h-4 text-yellow-300" />
                            ¡Cobros de Hoy (Día {diaHoyNumero})!
                          </h3>
                        </div>
                        <span className="text-[11px] font-black bg-white/20 backdrop-blur-xs px-2.5 py-0.5 rounded-full">
                          {clientesCobroHoyConDeuda.length} por cobrar
                        </span>
                      </div>
                      <p className="text-xs text-red-100 mb-3">
                        Hoy coincide con su fecha de pago acordada. Recuérdales su saldo pendiente por WhatsApp:
                      </p>
                      <div className="space-y-2">
                        {clientesCobroHoyConDeuda.map(c => (
                          <div
                            key={c.id}
                            onClick={() => openClientDetail(c)}
                            className="bg-white text-slate-800 p-3.5 rounded-2xl flex items-center justify-between cursor-pointer hover:bg-slate-50 transition active:scale-98 shadow-xs border border-red-200"
                          >
                            <div className="min-w-0 flex items-center gap-2.5">
                              <div className="w-9 h-9 rounded-xl bg-red-100 text-red-700 font-black text-sm flex items-center justify-center shrink-0">
                                {c.nombre.charAt(0).toUpperCase()}
                              </div>
                              <div className="min-w-0">
                                <div className="font-bold text-xs text-slate-900 truncate">{c.nombre}</div>
                                <div className="text-[10px] text-slate-500">{c.telefono} · Días: {c.diasPago}</div>
                              </div>
                            </div>
                            <div className="flex items-center gap-2 shrink-0">
                              <div className="text-right">
                                <div className="font-black text-xs text-red-600">{formatoMoneda(c.saldo)}</div>
                                <div className="text-[9px] text-red-500 font-extrabold uppercase flex items-center gap-0.5 justify-end">
                                  <Bell className="w-2.5 h-2.5" /> Paga hoy
                                </div>
                              </div>
                              <button
                                type="button"
                                onClick={e => {
                                  e.stopPropagation();
                                  sendWhatsAppReminder(c);
                                }}
                                className="w-8 h-8 rounded-full bg-emerald-500 hover:bg-emerald-600 text-white flex items-center justify-center transition shadow-xs"
                                title="Enviar Recordatorio por WhatsApp"
                              >
                                <Share2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Gráfico de Barras con Recharts: Top 5 Clientes con Mayor Deuda */}
                  <TopDebtorsChart
                    clientes={adminClientes}
                    onSelectClient={(c) => openClientDetail(c)}
                  />

                  {/* Clientes con Deuda List */}
                  <div className="pt-2">
                    <div className="flex justify-between items-center mb-2 px-1">
                      <h3 className="font-bold text-slate-800 text-sm flex items-center gap-1.5">
                        <Users className="w-4 h-4 text-blue-600" />
                        Clientes con Deuda Pendiente
                      </h3>
                      <button
                        onClick={() => setAdminTab('clientes')}
                        className="text-blue-600 text-xs font-bold hover:underline"
                      >
                        Ver todos →
                      </button>
                    </div>

                    <div className="space-y-2">
                      {adminClientes.filter(c => c.saldo > 0).slice(0, 4).map((c, i) => {
                        const pagaHoy = esDiaDePagoHoy(c.diasPago);
                        return (
                          <div
                            key={c.id}
                            onClick={() => openClientDetail(c)}
                            className={`p-4 rounded-2xl flex items-center justify-between cursor-pointer hover:shadow-md transition active:scale-98 ${
                              pagaHoy && c.saldo > 0
                                ? 'bg-red-50/50 border-2 border-red-400/80 shadow-xs ring-1 ring-red-400/30'
                                : 'bg-white border border-slate-100'
                            }`}
                          >
                            <div className="flex items-center gap-3 min-w-0">
                              <div className={`w-11 h-11 rounded-2xl font-bold flex items-center justify-center shrink-0 ${
                                pagaHoy && c.saldo > 0
                                  ? 'bg-red-600 text-white shadow-sm'
                                  : 'bg-gradient-to-br from-blue-600 to-indigo-700 text-white'
                              }`}>
                                {c.nombre.charAt(0).toUpperCase()}
                              </div>
                              <div className="min-w-0">
                                <div className="font-bold text-sm text-slate-900 truncate">{c.nombre}</div>
                                <div className="text-xs text-slate-500 flex items-center gap-2 mt-0.5">
                                  <span>{c.telefono}</span>
                                </div>
                                <div className="flex flex-wrap gap-1 mt-1">
                                  {pagaHoy && c.saldo > 0 && (
                                    <span className="text-[9px] bg-red-600 text-white px-2 py-0.5 rounded-full font-black flex items-center gap-1 shadow-xs animate-pulse">
                                      <Bell className="w-2.5 h-2.5 text-yellow-300" />
                                      PAGA HOY (Día {diaHoyNumero})
                                    </span>
                                  )}
                                  {pagaHoy && c.saldo <= 0 && (
                                    <span className="text-[9px] bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full font-bold flex items-center gap-1">
                                      <Calendar className="w-2.5 h-2.5" />
                                      Paga hoy (Al día)
                                    </span>
                                  )}
                                  {c.estadoPago === 'pendiente' && !pagaHoy && (
                                    <span className="text-[9px] bg-amber-100 text-amber-700 px-2 py-0.5 rounded-full font-bold">
                                      Pendiente
                                    </span>
                                  )}
                                  {c.alLimite && (
                                    <span className="text-[9px] bg-red-100 text-red-700 px-2 py-0.5 rounded-full font-bold">
                                      Al Límite
                                    </span>
                                  )}
                                </div>
                              </div>
                            </div>

                            <div className="flex items-center gap-2 shrink-0">
                              <div className="text-right">
                                <div className="font-black text-sm text-red-600">{formatoMoneda(c.saldo)}</div>
                                <div className="text-[10px] text-slate-400">
                                  {pagaHoy ? 'Cobrar hoy' : 'Deuda'}
                                </div>
                              </div>
                              <button
                                type="button"
                                onClick={e => {
                                  e.stopPropagation();
                                  sendWhatsAppReminder(c);
                                }}
                                className={`w-9 h-9 rounded-full flex items-center justify-center transition ${
                                  pagaHoy
                                    ? 'bg-emerald-600 hover:bg-emerald-700 text-white shadow-sm'
                                    : 'bg-emerald-100 hover:bg-emerald-200 text-emerald-700'
                                }`}
                                title="Enviar WhatsApp"
                              >
                                <Share2 className="w-4 h-4" />
                              </button>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* Ficha del Negocio / Datos del Colmado */}
                  <div className="bg-white rounded-3xl p-5 border border-slate-100 shadow-xs space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2.5">
                        <div className="w-10 h-10 rounded-2xl bg-blue-50 text-blue-700 flex items-center justify-center">
                          <Store className="w-5 h-5" />
                        </div>
                        <div>
                          <h4 className="font-extrabold text-sm text-slate-900">{datosColmado.nombre}</h4>
                          <p className="text-[11px] text-slate-500 font-medium">{datosColmado.slogan}</p>
                        </div>
                      </div>
                      <button
                        onClick={() => { vibrate(); setIsColmadoSettingsOpen(true); }}
                        className="px-3 py-1.5 rounded-xl bg-blue-50 hover:bg-blue-100 text-blue-700 text-xs font-bold transition flex items-center gap-1.5"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                        Editar
                      </button>
                    </div>

                    <div className="divide-y divide-slate-100 text-xs text-slate-600 pt-1">
                      <div className="py-2 flex items-start gap-2.5">
                        <MapPin className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                        <div>
                          <span className="font-bold text-slate-700 block text-[11px]">Dirección:</span>
                          <span className="text-slate-600">{datosColmado.direccion}</span>
                        </div>
                      </div>

                      <div className="py-2 flex items-center justify-between">
                        <div className="flex items-center gap-2.5">
                          <Clock className="w-4 h-4 text-blue-600 shrink-0" />
                          <div>
                            <span className="font-bold text-slate-700 block text-[11px]">Horario:</span>
                            <span className="text-slate-600">{datosColmado.horario} ({datosColmado.diasAtencion})</span>
                          </div>
                        </div>
                      </div>

                      <div className="py-2 flex items-center justify-between">
                        <div className="flex items-center gap-2.5">
                          <Phone className="w-4 h-4 text-amber-600 shrink-0" />
                          <div>
                            <span className="font-bold text-slate-700 block text-[11px]">Teléfono & WhatsApp:</span>
                            <span className="text-slate-600">{datosColmado.telefono}</span>
                          </div>
                        </div>
                        {datosColmado.rnc && (
                          <span className="text-[10px] bg-slate-100 text-slate-600 px-2 py-0.5 rounded-md font-mono">
                            RNC: {datosColmado.rnc}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* TAB CLIENTES */}
            {adminTab === 'clientes' && (
              <div>
                <div className="header-gradient p-6 rounded-b-3xl text-white">
                  <div className="flex items-center justify-between mb-4">
                    <button
                      onClick={() => setAdminTab('inicio')}
                      className="w-9 h-9 rounded-full bg-white/20 flex items-center justify-center"
                    >
                      <X className="w-5 h-5" />
                    </button>
                    <h2 className="text-xl font-black">Directorio de Clientes</h2>
                    <div className="w-9" />
                  </div>

                  {/* Search */}
                  <div className="relative">
                    <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                    <input
                      type="text"
                      value={clienteSearch}
                      onChange={e => setClienteSearch(e.target.value)}
                      placeholder="Buscar por nombre o teléfono..."
                      className="w-full pl-10 pr-4 py-3 bg-white text-slate-800 rounded-2xl text-xs font-medium placeholder-slate-400 focus:outline-hidden"
                    />
                  </div>
                </div>

                <div className="p-4 space-y-3">
                  <button
                    onClick={() => { vibrate(); setCurrentView('admin-crear-cliente'); }}
                    className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-2xl font-bold text-xs flex items-center justify-center gap-2 shadow-md transition"
                  >
                    <PlusCircle className="w-4 h-4" />
                    Agregar Nuevo Cliente
                  </button>

                  {/* Filters */}
                  <div className="bg-slate-200/70 p-1 rounded-2xl flex gap-1">
                    {(['todos', 'deuda', 'aldia'] as const).map(f => (
                      <button
                        key={f}
                        onClick={() => setFiltroCliente(f)}
                        className={`flex-1 py-2 rounded-xl text-xs font-bold transition ${
                          filtroCliente === f ? 'bg-white text-blue-700 shadow-xs' : 'text-slate-600 hover:text-slate-900'
                        }`}
                      >
                        {f === 'todos' ? 'Todos' : f === 'deuda' ? 'Con deuda' : 'Al día'}
                      </button>
                    ))}
                  </div>

                  {/* Clientes List */}
                  <div className="space-y-2">
                    {filteredClientes.map(c => {
                      const pagaHoy = esDiaDePagoHoy(c.diasPago);
                      return (
                        <div
                          key={c.id}
                          onClick={() => openClientDetail(c)}
                          className={`p-4 rounded-2xl flex items-center justify-between cursor-pointer hover:shadow-md transition active:scale-98 ${
                            pagaHoy && c.saldo > 0
                              ? 'bg-red-50/50 border-2 border-red-400/80 shadow-xs ring-1 ring-red-400/30'
                              : 'bg-white border border-slate-100'
                          }`}
                        >
                          <div className="flex items-center gap-3 min-w-0">
                            <div className={`w-11 h-11 rounded-2xl font-bold flex items-center justify-center shrink-0 ${
                              pagaHoy && c.saldo > 0
                                ? 'bg-red-600 text-white shadow-sm'
                                : 'bg-gradient-to-br from-blue-600 to-indigo-700 text-white'
                            }`}>
                              {c.nombre.charAt(0).toUpperCase()}
                            </div>
                            <div className="min-w-0">
                              <div className="font-bold text-sm text-slate-900 truncate">{c.nombre}</div>
                              <div className="text-xs text-slate-500 flex items-center gap-2 mt-0.5">
                                <span>{c.telefono}</span>
                                <span className="text-[10px] text-slate-400">Lím: {formatoMoneda(c.limite)}</span>
                              </div>
                              <div className="flex flex-wrap gap-1 mt-1">
                                {pagaHoy && c.saldo > 0 && (
                                  <span className="text-[9px] bg-red-600 text-white px-2 py-0.5 rounded-full font-black flex items-center gap-1 shadow-xs animate-pulse">
                                    <Bell className="w-2.5 h-2.5 text-yellow-300" />
                                    PAGA HOY (Día {diaHoyNumero})
                                  </span>
                                )}
                                {pagaHoy && c.saldo <= 0 && (
                                  <span className="text-[9px] bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full font-bold flex items-center gap-1">
                                    <Calendar className="w-2.5 h-2.5" />
                                    Paga hoy (Al día)
                                  </span>
                                )}
                                {c.alLimite && (
                                  <span className="text-[9px] bg-red-100 text-red-700 px-2 py-0.5 rounded-full font-bold">
                                    Al Límite
                                  </span>
                                )}
                                {c.estadoPago === 'pendiente' && !pagaHoy && (
                                  <span className="text-[9px] bg-amber-100 text-amber-700 px-2 py-0.5 rounded-full font-bold">
                                    Pendiente
                                  </span>
                                )}
                              </div>
                            </div>
                          </div>

                          <div className="flex items-center gap-2 shrink-0">
                            <div className="text-right">
                              <div className={`font-black text-sm ${c.saldo > 0 ? 'text-red-600' : 'text-emerald-600'}`}>
                                {formatoMoneda(c.saldo)}
                              </div>
                              <div className="text-[10px] text-slate-400">
                                {pagaHoy ? 'Cobrar hoy' : (c.saldo > 0 ? 'Deuda' : 'Al día')}
                              </div>
                            </div>
                            {c.saldo > 0 && (
                              <button
                                type="button"
                                onClick={e => {
                                  e.stopPropagation();
                                  sendWhatsAppReminder(c);
                                }}
                                className={`w-9 h-9 rounded-full flex items-center justify-center transition ${
                                  pagaHoy
                                    ? 'bg-emerald-600 hover:bg-emerald-700 text-white shadow-sm'
                                    : 'bg-emerald-100 hover:bg-emerald-200 text-emerald-700'
                                }`}
                                title="Enviar WhatsApp"
                              >
                                <Share2 className="w-4 h-4" />
                              </button>
                            )}
                            <ChevronRight className="w-4 h-4 text-slate-300" />
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            )}

            {/* TAB HISTORIAL */}
            {adminTab === 'historial' && (
              <div>
                <div className="header-gradient p-6 rounded-b-3xl text-white">
                  <div className="flex items-center justify-between mb-2">
                    <button
                      onClick={() => setAdminTab('inicio')}
                      className="w-9 h-9 rounded-full bg-white/20 flex items-center justify-center"
                    >
                      <X className="w-5 h-5" />
                    </button>
                    <h2 className="text-xl font-black">Historial General</h2>
                    <div className="w-9" />
                  </div>
                  <p className="text-xs text-blue-100 text-center">Registro de fiados y abonos del colmado</p>
                </div>

                <div className="p-4 space-y-3">
                  {/* Filters & PDF Export Actions */}
                  <div className="space-y-2">
                    <div className="flex-1 bg-slate-200/70 p-1 rounded-2xl flex gap-1">
                      {(['todos', 'Fiado', 'Abono'] as const).map(f => (
                        <button
                          key={f}
                          onClick={() => setAdminHistorialFiltro(f)}
                          className={`flex-1 py-2 rounded-xl text-xs font-bold transition ${
                            adminHistorialFiltro === f
                              ? 'bg-white text-blue-700 shadow-xs'
                              : 'text-slate-600 hover:text-slate-900'
                          }`}
                        >
                          {f === 'todos' ? 'Todos' : f === 'Fiado' ? 'Fiados' : 'Abonos'}
                        </button>
                      ))}
                    </div>

                    <div className="grid grid-cols-2 gap-2">
                      <button
                        type="button"
                        onClick={() => {
                          vibrate(15);
                          const fiados = adminHistorial.filter(m => m.tipo === 'Fiado');
                          if (fiados.length === 0) {
                            showToast('Sin gastos', 'No hay compras/fiados registrados para la quincena', 'warning');
                            return;
                          }
                          generarGastosQuincenaPDF(adminHistorial);
                          showToast('PDF Quincena', 'Descargando reporte de gastos de la quincena...', 'success');
                        }}
                        className="py-2.5 px-3 bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-700 hover:to-orange-700 text-white rounded-2xl font-bold text-xs flex items-center justify-center gap-1.5 shadow-sm transition active:scale-95"
                        title="Descargar PDF con todos los gastos de la quincena"
                      >
                        <FileText className="w-3.5 h-3.5" />
                        <span>Gastos Quincena (PDF)</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => {
                          vibrate(15);
                          if (filteredAdminHistorial.length === 0) {
                            showToast('Sin movimientos', 'No hay registros para exportar', 'warning');
                            return;
                          }
                          generarReporteHistorialPDF(filteredAdminHistorial, adminHistorialFiltro, adminTotalCobrar);
                          showToast('Reporte PDF', `Descargando reporte de ${filteredAdminHistorial.length} movimientos...`, 'success');
                        }}
                        className="py-2.5 px-3 bg-blue-600 hover:bg-blue-700 text-white rounded-2xl font-bold text-xs flex items-center justify-center gap-1.5 shadow-sm transition active:scale-95"
                        title="Descargar listado filtrado en PDF"
                      >
                        <Download className="w-3.5 h-3.5" />
                        <span>Reporte Lista (PDF)</span>
                      </button>
                    </div>
                  </div>

                  <div className="bg-white rounded-3xl border border-slate-100 overflow-hidden divide-y divide-slate-100">
                    {filteredAdminHistorial.length === 0 ? (
                      <div className="p-8 text-center text-slate-400 text-xs">No hay movimientos registrados</div>
                    ) : (
                      filteredAdminHistorial.map(m => {
                        const esFiado = m.tipo === 'Fiado';
                        return (
                          <div
                            key={m.idMov}
                            onClick={() => setActiveReceipt(m)}
                            className="p-4 flex items-center justify-between cursor-pointer hover:bg-slate-50 transition active:scale-98"
                          >
                            <div className="flex items-center gap-3 min-w-0">
                              <div
                                className={`w-11 h-11 rounded-2xl flex items-center justify-center shrink-0 ${
                                  esFiado ? 'bg-red-100 text-red-600' : 'bg-emerald-100 text-emerald-600'
                                }`}
                              >
                                {esFiado ? <ShoppingBag className="w-5 h-5" /> : <ArrowDownLeft className="w-5 h-5" />}
                              </div>
                              <div className="min-w-0">
                                <div className="font-bold text-sm text-slate-900 truncate">{m.nombreCliente}</div>
                                <div className="text-xs text-slate-400 mt-0.5">
                                  {m.fechaTexto} · {m.hora}
                                </div>
                                {esFiado && m.autorizadoNombre && m.autorizadoNombre !== '-' && (
                                  <div className="text-[11px] text-blue-600 font-medium">
                                    Por: {m.autorizadoNombre}
                                  </div>
                                )}
                              </div>
                            </div>
                            <div className="flex items-center gap-2.5 shrink-0">
                              <div className="text-right">
                                <div className={`font-black text-sm ${esFiado ? 'text-red-600' : 'text-emerald-600'}`}>
                                  {esFiado ? '-' : '+'}{formatoMoneda(m.monto)}
                                </div>
                                <div className="text-[10px] text-slate-400 font-mono">#{m.idMov}</div>
                              </div>
                              <button
                                type="button"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  vibrate(10);
                                  generarReciboPDF(m);
                                  showToast('Recibo PDF', `Descargando comprobante #${m.idMov}...`, 'success');
                                }}
                                className="w-8 h-8 rounded-xl bg-slate-100 hover:bg-blue-100 text-slate-500 hover:text-blue-600 flex items-center justify-center transition"
                                title="Descargar comprobante en PDF"
                              >
                                <Download className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </div>
                        );
                      })
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* Bottom Navigation */}
            <div className="fixed bottom-0 left-0 right-0 max-w-md sm:max-w-lg md:max-w-xl mx-auto bg-white/95 backdrop-blur-md border-t border-slate-200/80 px-4 py-2 flex items-center justify-around z-30 shadow-lg">
              <button
                onClick={() => { vibrate(); setAdminTab('inicio'); }}
                className={`flex flex-col items-center py-1 font-bold text-[10px] transition ${
                  adminTab === 'inicio' ? 'text-blue-600' : 'text-slate-400 hover:text-slate-600'
                }`}
              >
                <Home className="w-5 h-5 mb-0.5" />
                Inicio
              </button>

              <button
                onClick={() => { vibrate(); setAdminTab('clientes'); }}
                className={`flex flex-col items-center py-1 font-bold text-[10px] transition ${
                  adminTab === 'clientes' ? 'text-blue-600' : 'text-slate-400 hover:text-slate-600'
                }`}
              >
                <Users className="w-5 h-5 mb-0.5" />
                Clientes
              </button>

              <button
                onClick={() => { vibrate(); setCurrentView('admin-fiado'); }}
                className="w-12 h-12 -mt-6 bg-gradient-to-r from-blue-600 to-indigo-700 text-white rounded-full flex items-center justify-center shadow-lg shadow-blue-300 hover:scale-105 active:scale-95 transition"
                title="Registrar Fiado"
              >
                <PlusCircle className="w-6 h-6" />
              </button>

              <button
                onClick={() => { vibrate(); setAdminTab('historial'); }}
                className={`flex flex-col items-center py-1 font-bold text-[10px] transition ${
                  adminTab === 'historial' ? 'text-blue-600' : 'text-slate-400 hover:text-slate-600'
                }`}
              >
                <Clock className="w-5 h-5 mb-0.5" />
                Historial
              </button>

              <button
                onClick={() => { vibrate(); setCurrentView('admin-auditoria'); }}
                className="flex flex-col items-center py-1 font-bold text-[10px] text-slate-400 hover:text-slate-600 transition"
              >
                <Shield className="w-5 h-5 mb-0.5" />
                Auditoría
              </button>
            </div>
          </div>
        )}

        {/* ======================================================== */}
        {/* 4. ADMIN DETALLE CLIENTE */}
        {/* ======================================================== */}
        {currentView === 'admin-detalle-cliente' && selectedClientDetail && (
          <div className="flex-1 bg-slate-50 min-h-[100dvh] pb-10">
            <div className="header-gradient p-6 pb-12 rounded-b-3xl text-white relative">
              <button
                onClick={() => setCurrentView('admin-dashboard')}
                className="w-9 h-9 rounded-full bg-white/20 flex items-center justify-center mb-3"
              >
                <X className="w-5 h-5" />
              </button>
              <h2 className="text-xl font-black">Detalle del Cliente</h2>
            </div>

            <div className="p-4 -mt-8 relative z-10 space-y-4">
              <div className="bg-white rounded-3xl p-5 border border-slate-100 shadow-md">
                <div className="flex items-center gap-4 mb-4">
                  <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-blue-600 to-indigo-700 text-white font-black text-2xl flex items-center justify-center shadow-md">
                    {selectedClientDetail.nombre.charAt(0).toUpperCase()}
                  </div>
                  <div className="min-w-0 flex-1">
                    <h3 className="font-black text-lg text-slate-900 leading-tight">{selectedClientDetail.nombre}</h3>
                    <p className="text-xs text-slate-500 mt-0.5">{selectedClientDetail.telefono}</p>
                    <button
                      onClick={() => sendWhatsAppReminder(selectedClientDetail)}
                      className="mt-2 w-full py-2 bg-emerald-500 hover:bg-emerald-600 text-white font-bold text-xs rounded-xl flex items-center justify-center gap-1.5 shadow-sm transition"
                    >
                      <Share2 className="w-3.5 h-3.5" />
                      Enviar Recordatorio por WhatsApp
                    </button>
                  </div>
                </div>

                {/* Metrics */}
                <div className="divide-y divide-slate-100 text-xs">
                  <div className="flex justify-between items-center py-2.5">
                    <span className="text-slate-500 font-bold uppercase tracking-wider">Deuda Pendiente</span>
                    <span className="text-xl font-black text-red-600">{formatoMoneda(selectedClientDetail.saldo)}</span>
                  </div>

                  <div className="flex justify-between items-center py-2.5">
                    <span className="text-slate-500 font-bold uppercase tracking-wider">Límite de Fiado</span>
                    <button
                      onClick={() =>
                        setEditLimitModal({
                          isOpen: true,
                          nombre: selectedClientDetail.nombre,
                          saldo: selectedClientDetail.saldo,
                          limite: selectedClientDetail.limite,
                          targetId: selectedClientDetail.id,
                          esCliente: false
                        })
                      }
                      className="font-bold text-blue-600 flex items-center gap-1 hover:underline"
                    >
                      <span>{formatoMoneda(selectedClientDetail.limite)}</span>
                      <Edit2 className="w-3 h-3" />
                    </button>
                  </div>

                  <div className="flex justify-between items-center py-2.5">
                    <span className="text-slate-500 font-bold uppercase tracking-wider">Días de Pago</span>
                    <button
                      onClick={() =>
                        setEditPaymentDaysModal({
                          isOpen: true,
                          nombre: selectedClientDetail.nombre,
                          dias: selectedClientDetail.diasPago,
                          targetId: selectedClientDetail.id
                        })
                      }
                      className="font-bold text-blue-600 flex items-center gap-1 hover:underline"
                    >
                      <span>{selectedClientDetail.diasPago}</span>
                      <Edit2 className="w-3 h-3" />
                    </button>
                  </div>

                  <div className="flex justify-between items-center py-2.5">
                    <span className="text-slate-500 font-bold uppercase tracking-wider">Estado de Pago</span>
                    <span className="font-bold">
                      {selectedClientDetail.saldo <= 0 ? (
                        <span className="text-emerald-600">Al día (Sin deuda)</span>
                      ) : selectedClientDetail.estadoPago === 'pendiente' ? (
                        <span className="text-amber-600">Pendiente de pago</span>
                      ) : (
                        <span className="text-emerald-600">Al día</span>
                      )}
                    </span>
                  </div>
                </div>

                {/* Progress bar */}
                {selectedClientDetail.limite > 0 && (
                  <div className="mt-4 pt-3 border-t border-slate-100">
                    <div className="flex justify-between text-[11px] font-bold text-slate-500 mb-1">
                      <span>Uso de crédito</span>
                      <span>
                        {Math.round((selectedClientDetail.saldo / selectedClientDetail.limite) * 100)}%
                      </span>
                    </div>
                    <div className="progress-track">
                      <div
                        className={`progress-fill ${
                          selectedClientDetail.alLimite ? 'danger' : 'ok'
                        }`}
                        style={{
                          width: `${Math.min(
                            100,
                            (selectedClientDetail.saldo / selectedClientDetail.limite) * 100
                          )}%`
                        }}
                      />
                    </div>
                    <div className="text-[11px] text-slate-500 mt-1">
                      Disponible: {formatoMoneda(selectedClientDetail.disponible)}
                    </div>
                  </div>
                )}

                {/* Notice if payment day is today */}
                {esDiaDePagoHoy(selectedClientDetail.diasPago) && (
                  <div className="mt-3 bg-red-50 border border-red-300 text-red-900 rounded-2xl p-3 text-xs flex items-center justify-between font-bold">
                    <span className="flex items-center gap-1.5">
                      <Bell className="w-4 h-4 text-red-600 animate-pulse" />
                      ¡Hoy es su día de pago acordado (Día {diaHoyNumero})!
                    </span>
                    <span className="text-[10px] bg-red-600 text-white px-2 py-0.5 rounded-full uppercase">
                      {selectedClientDetail.saldo > 0 ? 'Cobrar hoy' : 'Al día'}
                    </span>
                  </div>
                )}

                <button
                  onClick={() => handleResetPin(selectedClientDetail)}
                  className="mt-4 w-full py-2.5 bg-purple-50 hover:bg-purple-100 text-purple-700 font-bold text-xs rounded-xl flex items-center justify-center gap-2 transition"
                >
                  <Key className="w-3.5 h-3.5" />
                  Generar Nuevo PIN para este cliente
                </button>

                <button
                  type="button"
                  onClick={async () => {
                    vibrate(20);
                    const res = await store.bloquearCliente(selectedClientDetail.id, !selectedClientDetail.bloqueada);
                    if (res.success) {
                      showToast(
                        selectedClientDetail.bloqueada ? 'Cuenta Desbloqueada' : 'Cuenta Bloqueada',
                        `El cliente ${selectedClientDetail.nombre} ha sido ${selectedClientDetail.bloqueada ? 'desbloqueado' : 'bloqueado'}`,
                        'success'
                      );
                      await refreshAdminDashboard();
                    }
                  }}
                  className={`mt-2.5 w-full py-3 rounded-xl font-bold text-xs flex items-center justify-center gap-2 transition shadow-sm ${
                    selectedClientDetail.bloqueada
                      ? 'bg-emerald-600 hover:bg-emerald-700 text-white'
                      : 'bg-red-600 hover:bg-red-700 text-white'
                  }`}
                >
                  <ShieldAlert className="w-4 h-4" />
                  {selectedClientDetail.bloqueada ? 'Desbloquear Cuenta de Cliente' : 'Bloquear Cuenta (Impedir Fiados)'}
                </button>

                {selectedClientDetail.bloqueada && (
                  <div className="mt-2.5 bg-red-600 text-white p-3 rounded-2xl text-xs font-black text-center flex items-center justify-center gap-2 shadow-sm animate-pulse">
                    <ShieldAlert className="w-4 h-4" />
                    CUENTA BLOQUEADA - No se pueden registrar nuevos fiados
                  </div>
                )}
              </div>

              {/* Direct Actions */}
              <div className="grid grid-cols-2 gap-3">
                <button
                  onClick={() => {
                    setFormFiadoCliente(String(selectedClientDetail.id));
                    setCurrentView('admin-fiado');
                  }}
                  className="py-3.5 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-2xl text-xs flex items-center justify-center gap-2 shadow-sm transition"
                >
                  <PlusCircle className="w-4 h-4" />
                  Registrar Fiado
                </button>
                <button
                  onClick={() => {
                    setFormAbonoCliente(String(selectedClientDetail.id));
                    setCurrentView('admin-abono');
                  }}
                  className="py-3.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-2xl text-xs flex items-center justify-center gap-2 shadow-sm transition"
                >
                  <ArrowDownLeft className="w-4 h-4" />
                  Registrar Abono
                </button>
              </div>

              {/* Botón Descargar Gastos de la Quincena en PDF */}
              <button
                onClick={() => {
                  vibrate(15);
                  generarGastosQuincenaPDF(selectedClientHistory, {
                    nombreCliente: selectedClientDetail.nombre,
                    telefonoCliente: selectedClientDetail.telefono
                  });
                  showToast('PDF Quincena', `Descargando gastos de la quincena de ${selectedClientDetail.nombre}...`, 'success');
                }}
                className="w-full py-3.5 bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-700 hover:to-orange-700 text-white font-bold text-xs rounded-2xl flex items-center justify-center gap-2 shadow-md transition active:scale-98"
              >
                <FileText className="w-4 h-4 text-yellow-200" />
                Descargar Gastos de la Quincena (PDF)
              </button>

              {/* Client History */}
              <div className="bg-white rounded-3xl p-4 border border-slate-100 shadow-xs">
                <div className="flex flex-col gap-2 mb-3">
                  <div className="flex items-center justify-between">
                    <h4 className="font-bold text-slate-800 text-xs uppercase tracking-wide flex items-center gap-1.5">
                      <Clock className="w-4 h-4 text-blue-600" />
                      Movimientos de este cliente
                    </h4>
                    {selectedClientDateFiltro && (
                      <button
                        onClick={() => setSelectedClientDateFiltro('')}
                        className="text-[10px] text-blue-600 font-bold hover:underline"
                      >
                        Limpiar fecha
                      </button>
                    )}
                  </div>
                  <div className="flex items-center justify-between bg-slate-50 p-2.5 rounded-2xl border border-slate-100 text-xs">
                    <span className="font-bold text-slate-600">Fecha de corte (Deuda anterior tachada):</span>
                    <input
                      type="date"
                      value={selectedClientDateFiltro}
                      onChange={e => setSelectedClientDateFiltro(e.target.value)}
                      className="bg-white border border-slate-200 rounded-xl px-2.5 py-1 font-bold text-xs text-slate-800 focus:outline-hidden focus:border-blue-600"
                    />
                  </div>
                </div>

                <div className="divide-y divide-slate-100">
                  {selectedClientHistory.length === 0 ? (
                    <div className="py-6 text-center text-slate-400 text-xs">Sin movimientos</div>
                  ) : (
                    selectedClientHistory.map(m => {
                      const esFiado = m.tipo === 'Fiado';
                      const esPagado = esFiado && m.pagado;
                      const isAnterior = selectedClientDateFiltro ? m.fechaHora.slice(0, 10) < selectedClientDateFiltro : false;
                      return (
                        <div
                          key={m.idMov}
                          onClick={() => setActiveReceipt(m)}
                          className={`py-3 flex items-center justify-between cursor-pointer hover:bg-slate-50 transition ${isAnterior ? 'opacity-75' : ''}`}
                        >
                          <div className="flex items-center gap-2.5">
                            <div
                              className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${
                                isAnterior
                                  ? 'bg-slate-100 text-slate-400'
                                  : esPagado
                                  ? 'bg-emerald-100 text-emerald-600'
                                  : esFiado
                                  ? 'bg-red-100 text-red-600'
                                  : 'bg-emerald-100 text-emerald-600'
                              }`}
                            >
                              {esFiado ? <ShoppingBag className="w-4 h-4" /> : <ArrowDownLeft className="w-4 h-4" />}
                            </div>
                            <div>
                              <div className={`font-bold text-xs ${isAnterior ? 'text-slate-400 line-through' : esPagado ? 'text-emerald-700' : 'text-slate-800'}`}>
                                {esPagado ? 'Fiado (Pagado)' : m.tipo} {esFiado && !esPagado && m.autorizadoNombre !== '-' && `· ${m.autorizadoNombre}`}
                                {isAnterior && <span className="ml-1.5 text-[9px] uppercase bg-slate-200 text-slate-600 px-1 rounded not-italic">Anterior</span>}
                                {esPagado && <span className="ml-1.5 text-[9px] uppercase bg-emerald-100 text-emerald-700 px-1.5 py-0.5 rounded-md font-bold not-italic">Pago</span>}
                              </div>
                              <div className={`text-[10px] ${isAnterior ? 'text-slate-400 line-through' : 'text-slate-400'}`}>
                                {m.fechaTexto} · {m.hora}
                              </div>
                            </div>
                          </div>
                          <div className="text-right">
                            <div className={`font-black text-xs ${isAnterior ? 'text-slate-400 line-through' : esPagado ? 'text-emerald-600' : esFiado ? 'text-red-600' : 'text-emerald-600'}`}>
                              {esFiado ? '-' : '+'}{formatoMoneda(m.monto)}
                              {esPagado && <div className="text-[9px] text-emerald-600 font-bold not-italic">Pagado</div>}
                            </div>
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ======================================================== */}
        {/* 5. FORM REGISTRAR FIADO */}
        {/* ======================================================== */}
        {currentView === 'admin-fiado' && (
          <div className="flex-1 bg-slate-50 p-6 min-h-[100dvh]">
            <button
              onClick={() => setCurrentView('admin-dashboard')}
              className="w-10 h-10 rounded-full bg-white shadow-xs flex items-center justify-center text-slate-600 mb-4"
            >
              <X className="w-5 h-5" />
            </button>

            <h2 className="text-2xl font-black text-slate-900 mb-6">Registrar Fiado</h2>

            <form onSubmit={handleGuardarFiado} className="bg-white rounded-3xl p-5 border border-slate-100 shadow-md space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wide mb-1.5">
                  Cliente *
                </label>
                <select
                  value={formFiadoCliente}
                  onChange={e => {
                    setFormFiadoCliente(e.target.value);
                    setFormFiadoAutorizado('');
                  }}
                  className="w-full px-4 py-3.5 border-2 border-slate-200 rounded-2xl text-sm font-semibold text-slate-800 focus:border-blue-600 focus:outline-hidden"
                  required
                >
                  <option value="">Seleccione cliente...</option>
                  {adminClientes.map(c => (
                    <option key={c.id} value={c.id}>
                      {c.nombre} (Debe: {formatoMoneda(c.saldo)})
                    </option>
                  ))}
                </select>
              </div>

              {/* Warning if at or near limit */}
              {fiadoClienteSeleccionado && fiadoClienteSeleccionado.limite > 0 && (
                <div
                  className={`p-3 rounded-2xl text-xs flex items-start gap-2 ${
                    fiadoClienteSeleccionado.alLimite
                      ? 'bg-red-50 text-red-900 border border-red-200'
                      : 'bg-amber-50 text-amber-900 border border-amber-200'
                  }`}
                >
                  <AlertTriangle className="w-4 h-4 mt-0.5 shrink-0" />
                  <div>
                    <strong>
                      {fiadoClienteSeleccionado.alLimite ? 'Cliente al límite:' : 'Límite de fiado:'}
                    </strong>{' '}
                    Debe {formatoMoneda(fiadoClienteSeleccionado.saldo)} de{' '}
                    {formatoMoneda(fiadoClienteSeleccionado.limite)} (Disponible:{' '}
                    {formatoMoneda(fiadoClienteSeleccionado.disponible)}).
                  </div>
                </div>
              )}

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wide mb-1.5">
                  ¿Quién vino a comprar? (Autorizado) *
                </label>
                <select
                  value={formFiadoAutorizado}
                  onChange={e => setFormFiadoAutorizado(e.target.value)}
                  className="w-full px-4 py-3.5 border-2 border-slate-200 rounded-2xl text-sm font-semibold text-slate-800 focus:border-blue-600 focus:outline-hidden"
                  required
                >
                  <option value="">
                    {formFiadoCliente ? 'Seleccione autorizado...' : 'Seleccione cliente primero'}
                  </option>
                  {fiadoAutorizados.map(a => (
                    <option key={a.id} value={a.id}>
                      {a.nombre} ({a.parentesco})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wide mb-1.5">
                  Monto (RD$) *
                </label>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  value={formFiadoMonto}
                  onChange={e => setFormFiadoMonto(e.target.value)}
                  placeholder="0.00"
                  className="w-full px-4 py-3.5 border-2 border-slate-200 rounded-2xl text-2xl font-black text-slate-900 focus:border-blue-600 focus:outline-hidden"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wide mb-1.5">
                  Observaciones / Artículos (Opcional)
                </label>
                <textarea
                  value={formFiadoObs}
                  onChange={e => setFormFiadoObs(e.target.value)}
                  placeholder="Ej. Arroz, aceite, salami..."
                  rows={2}
                  className="w-full px-4 py-3 border-2 border-slate-200 rounded-2xl text-sm text-slate-800 focus:border-blue-600 focus:outline-hidden resize-none"
                />
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full py-4 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-2xl text-base shadow-lg transition active:scale-98 disabled:opacity-50"
              >
                {isSubmitting ? 'Guardando Fiado...' : 'Guardar Fiado'}
              </button>
            </form>
          </div>
        )}

        {/* ======================================================== */}
        {/* 6. FORM REGISTRAR ABONO */}
        {/* ======================================================== */}
        {currentView === 'admin-abono' && (
          <div className="flex-1 bg-slate-50 p-6 min-h-[100dvh]">
            <button
              onClick={() => setCurrentView('admin-dashboard')}
              className="w-10 h-10 rounded-full bg-white shadow-xs flex items-center justify-center text-slate-600 mb-4"
            >
              <X className="w-5 h-5" />
            </button>

            <h2 className="text-2xl font-black text-slate-900 mb-6">Registrar Abono</h2>

            <form onSubmit={handleGuardarAbono} className="bg-white rounded-3xl p-5 border border-slate-100 shadow-md space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wide mb-1.5">
                  Cliente *
                </label>
                <select
                  value={formAbonoCliente}
                  onChange={e => setFormAbonoCliente(e.target.value)}
                  className="w-full px-4 py-3.5 border-2 border-slate-200 rounded-2xl text-sm font-semibold text-slate-800 focus:border-emerald-600 focus:outline-hidden"
                  required
                >
                  <option value="">Seleccione cliente...</option>
                  {adminClientes.map(c => (
                    <option key={c.id} value={c.id}>
                      {c.nombre} (Debe: {formatoMoneda(c.saldo)})
                    </option>
                  ))}
                </select>
                {abonoClienteSeleccionado && (
                  <p className="text-xs font-bold text-emerald-700 mt-2">
                    Deuda actual: {formatoMoneda(abonoClienteSeleccionado.saldo)}
                  </p>
                )}
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wide mb-1.5">
                  Monto del Abono (RD$) *
                </label>
                <input
                  type="number"
                  step="0.01"
                  min="0.01"
                  max={abonoClienteSeleccionado ? abonoClienteSeleccionado.saldo : undefined}
                  value={formAbonoMonto}
                  onChange={e => setFormAbonoMonto(e.target.value)}
                  placeholder="0.00"
                  className="w-full px-4 py-3.5 border-2 border-slate-200 rounded-2xl text-2xl font-black text-slate-900 focus:border-emerald-600 focus:outline-hidden"
                  required
                />
              </div>

              {formAbonoCliente && (
                <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 space-y-2">
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wide">
                    Seleccionar Fiados a Cobrar (Opcional - Cuaderno)
                  </label>
                  <p className="text-[11px] text-slate-500">
                    Marca cuáles fiados específicos está pagando el cliente (ej. el de $1,200):
                  </p>
                  <div className="space-y-1.5 max-h-44 overflow-y-auto">
                    {adminHistorial
                      .filter(m => m.idCliente === Number(formAbonoCliente) && m.tipo === 'Fiado' && !m.pagado)
                      .map(f => (
                        <label key={f.idMov} className="flex items-center justify-between p-2.5 bg-white rounded-xl border border-slate-200 text-xs cursor-pointer hover:border-emerald-500 transition">
                          <div className="flex items-center gap-2.5">
                            <input
                              type="checkbox"
                              checked={selectedFiadosPagados.includes(f.idMov)}
                              onChange={e => {
                                if (e.target.checked) setSelectedFiadosPagados([...selectedFiadosPagados, f.idMov]);
                                else setSelectedFiadosPagados(selectedFiadosPagados.filter(id => id !== f.idMov));
                              }}
                              className="w-4 h-4 rounded text-emerald-600 border-slate-300"
                            />
                            <div>
                              <span className="font-bold text-slate-900">{formatoMoneda(f.monto)}</span>
                              <span className="text-[10px] text-slate-400 ml-1.5">({f.fechaTexto})</span>
                              {f.observaciones && <div className="text-[10px] text-slate-500">{f.observaciones}</div>}
                            </div>
                          </div>
                          <span className="text-[10px] font-mono text-slate-400">#{f.idMov}</span>
                        </label>
                      ))}
                  </div>
                </div>
              )}

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wide mb-1.5">
                  Observaciones (Opcional)
                </label>
                <textarea
                  value={formAbonoObs}
                  onChange={e => setFormAbonoObs(e.target.value)}
                  placeholder="Ej. Pago parcial quincena..."
                  rows={2}
                  className="w-full px-4 py-3 border-2 border-slate-200 rounded-2xl text-sm text-slate-800 focus:border-emerald-600 focus:outline-hidden resize-none"
                />
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full py-4 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-2xl text-base shadow-lg transition active:scale-98 disabled:opacity-50"
              >
                {isSubmitting ? 'Guardando Abono...' : 'Guardar Abono'}
              </button>
            </form>
          </div>
        )}

        {/* ======================================================== */}
        {/* 7. FORM AGREGAR AUTORIZADO (Admin) */}
        {/* ======================================================== */}
        {currentView === 'admin-autorizado' && (
          <div className="flex-1 bg-slate-50 p-6 min-h-[100dvh]">
            <button
              onClick={() => setCurrentView('admin-dashboard')}
              className="w-10 h-10 rounded-full bg-white shadow-xs flex items-center justify-center text-slate-600 mb-4"
            >
              <X className="w-5 h-5" />
            </button>

            <h2 className="text-2xl font-black text-slate-900 mb-6">Agregar Autorizado</h2>

            <div className="bg-white rounded-3xl p-5 border border-slate-100 shadow-md space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wide mb-1.5">
                  Cliente Titular *
                </label>
                <select
                  value={formFiadoCliente}
                  onChange={e => setFormFiadoCliente(e.target.value)}
                  className="w-full px-4 py-3.5 border-2 border-slate-200 rounded-2xl text-sm font-semibold text-slate-800 focus:border-purple-600 focus:outline-hidden"
                >
                  <option value="">Seleccione cliente...</option>
                  {adminClientes.map(c => (
                    <option key={c.id} value={c.id}>
                      {c.nombre}
                    </option>
                  ))}
                </select>
              </div>

              <button
                onClick={() => {
                  if (!formFiadoCliente) {
                    showToast('Selecciona un cliente', '', 'warning');
                    return;
                  }
                  setAuthModal({
                    isOpen: true,
                    modo: 'agregar',
                    autorizado: null,
                    targetClienteId: Number(formFiadoCliente),
                    esCliente: false
                  });
                }}
                className="w-full py-4 bg-purple-600 hover:bg-purple-700 text-white font-bold rounded-2xl text-base shadow-lg transition"
              >
                Continuar y Agregar Persona
              </button>
            </div>
          </div>
        )}

        {/* ======================================================== */}
        {/* 8. FORM NUEVO CLIENTE (Admin) */}
        {/* ======================================================== */}
        {currentView === 'admin-crear-cliente' && (
          <div className="flex-1 bg-slate-50 p-6 min-h-[100dvh]">
            <button
              onClick={() => setCurrentView('admin-dashboard')}
              className="w-10 h-10 rounded-full bg-white shadow-xs flex items-center justify-center text-slate-600 mb-4"
            >
              <X className="w-5 h-5" />
            </button>

            <h2 className="text-2xl font-black text-slate-900 mb-6">Nuevo Cliente</h2>

            <form onSubmit={handleCrearCliente} className="space-y-4">
              <div className="bg-white rounded-3xl p-5 border border-slate-100 shadow-md space-y-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wide mb-1.5">
                    Nombre completo *
                  </label>
                  <input
                    type="text"
                    value={formNewClientNombre}
                    onChange={e => setFormNewClientNombre(e.target.value)}
                    placeholder="Ej. Juan Pérez"
                    className="w-full px-4 py-3.5 border-2 border-slate-200 rounded-2xl text-base font-semibold text-slate-800 focus:border-blue-600 focus:outline-hidden"
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wide mb-1.5">
                    Teléfono *
                  </label>
                  <input
                    type="tel"
                    value={formNewClientTel}
                    onChange={e => setFormNewClientTel(e.target.value)}
                    placeholder="Ej. 8295550101"
                    className="w-full px-4 py-3.5 border-2 border-slate-200 rounded-2xl text-base font-semibold text-slate-800 focus:border-blue-600 focus:outline-hidden"
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wide mb-1.5">
                    PIN de 4 dígitos *
                  </label>
                  <input
                    type="password"
                    maxLength={4}
                    value={formNewClientPin}
                    onChange={e => setFormNewClientPin(e.target.value.replace(/[^0-9]/g, ''))}
                    placeholder="0000"
                    className="w-full px-4 py-3.5 border-2 border-slate-200 rounded-2xl text-center text-2xl tracking-widest font-black text-slate-800 focus:border-blue-600 focus:outline-hidden"
                    required
                  />
                  <p className="text-[11px] text-slate-500 mt-1 text-center">
                    El cliente usará este PIN para ver su deuda en su celular
                  </p>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wide mb-1.5">
                    Límite de fiado (RD$)
                  </label>
                  <input
                    type="number"
                    step="100"
                    min="0"
                    value={formNewClientLimite}
                    onChange={e => setFormNewClientLimite(e.target.value)}
                    placeholder="5000"
                    className="w-full px-4 py-3.5 border-2 border-slate-200 rounded-2xl text-base font-bold text-slate-800 focus:border-blue-600 focus:outline-hidden"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wide mb-1.5">
                    Días de pago
                  </label>
                  <input
                    type="text"
                    value={formNewClientDias}
                    onChange={e => setFormNewClientDias(e.target.value)}
                    placeholder="15,30"
                    className="w-full px-4 py-3.5 border-2 border-slate-200 rounded-2xl text-base font-bold text-slate-800 focus:border-blue-600 focus:outline-hidden"
                  />
                  <div className="mt-2 flex flex-wrap gap-2">
                    {['15,30', '15', '30', '1,15'].map(op => (
                      <button
                        type="button"
                        key={op}
                        onClick={() => setFormNewClientDias(op)}
                        className={`text-xs px-3 py-1 rounded-full font-bold transition ${
                          formNewClientDias === op ? 'bg-blue-600 text-white' : 'bg-slate-100 text-slate-600'
                        }`}
                      >
                        {op}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Dynamic Authorized persons */}
              <div className="bg-white rounded-3xl p-5 border border-slate-100 shadow-md">
                <div className="flex justify-between items-center mb-3">
                  <h3 className="font-bold text-sm text-slate-800 flex items-center gap-1.5">
                    <UserCheck className="w-4 h-4 text-purple-600" />
                    Autorizados iniciales (Opcional)
                  </h3>
                  <button
                    type="button"
                    onClick={() => setFormNewClientAuts(prev => [...prev, { nombre: '', parentesco: '' }])}
                    className="text-xs text-blue-600 font-bold hover:underline"
                  >
                    + Agregar
                  </button>
                </div>

                {formNewClientAuts.length === 0 ? (
                  <p className="text-xs text-slate-400 text-center py-2">
                    El titular se agrega automáticamente. Puedes añadir parientes aquí o más tarde.
                  </p>
                ) : (
                  <div className="space-y-2">
                    {formNewClientAuts.map((aut, idx) => (
                      <div key={idx} className="flex gap-2 items-center">
                        <input
                          type="text"
                          placeholder="Nombre"
                          value={aut.nombre}
                          onChange={e => {
                            const val = e.target.value;
                            setFormNewClientAuts(prev => {
                              const copy = [...prev];
                              copy[idx].nombre = val;
                              return copy;
                            });
                          }}
                          className="flex-1 px-3 py-2 border border-slate-200 rounded-xl text-xs"
                        />
                        <input
                          type="text"
                          placeholder="Parentesco"
                          value={aut.parentesco}
                          onChange={e => {
                            const val = e.target.value;
                            setFormNewClientAuts(prev => {
                              const copy = [...prev];
                              copy[idx].parentesco = val;
                              return copy;
                            });
                          }}
                          className="flex-1 px-3 py-2 border border-slate-200 rounded-xl text-xs"
                        />
                        <button
                          type="button"
                          onClick={() => setFormNewClientAuts(prev => prev.filter((_, i) => i !== idx))}
                          className="w-8 h-8 rounded-lg bg-red-50 text-red-600 flex items-center justify-center shrink-0"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full py-4 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-2xl text-base shadow-lg transition active:scale-98 disabled:opacity-50"
              >
                {isSubmitting ? 'Creando Cliente...' : 'Crear Cliente'}
              </button>
            </form>
          </div>
        )}

        {/* ======================================================== */}
        {/* 9. AUDITORÍA (Admin) */}
        {/* ======================================================== */}
        {currentView === 'admin-auditoria' && (
          <div className="flex-1 bg-slate-50 min-h-[100dvh] pb-10">
            <div className="header-gradient p-6 pb-8 rounded-b-3xl text-white">
              <button
                onClick={() => setCurrentView('admin-dashboard')}
                className="w-9 h-9 rounded-full bg-white/20 flex items-center justify-center mb-3"
              >
                <X className="w-5 h-5" />
              </button>
              <h2 className="text-xl font-black flex items-center gap-2">
                <Shield className="w-6 h-6 text-yellow-300" />
                Auditoría del Sistema
              </h2>
            </div>

            <div className="p-4 space-y-4">
              <div className="grid grid-cols-3 gap-2">
                <div className="bg-white p-3 rounded-2xl border border-slate-100 text-center">
                  <div className="text-[10px] text-blue-600 font-bold">TOTAL</div>
                  <div className="text-xl font-black text-slate-800">{store.getEstadisticasAuditoria().totalLogs}</div>
                </div>
                <div className="bg-white p-3 rounded-2xl border border-slate-100 text-center">
                  <div className="text-[10px] text-emerald-600 font-bold">HOY</div>
                  <div className="text-xl font-black text-slate-800">{store.getEstadisticasAuditoria().hoy}</div>
                </div>
                <div className="bg-white p-3 rounded-2xl border border-slate-100 text-center">
                  <div className="text-[10px] text-purple-600 font-bold">ADMIN</div>
                  <div className="text-xl font-black text-slate-800">{store.getEstadisticasAuditoria().admin}</div>
                </div>
              </div>

              <div className="bg-white rounded-3xl p-4 border border-slate-100 divide-y divide-slate-100">
                {store.getLogsAuditoria().map(log => (
                  <div key={log.id} className="py-3 first:pt-0 last:pb-0">
                    <div className="flex justify-between items-start mb-1">
                      <div>
                        <div className="font-bold text-xs text-slate-800">{log.accion}</div>
                        <div className="text-[10px] text-slate-400">{log.usuario}</div>
                      </div>
                      <span className="text-[9px] font-bold px-2 py-0.5 rounded-full bg-blue-50 text-blue-700">
                        {log.tipo}
                      </span>
                    </div>
                    <div className="text-xs text-slate-600 leading-relaxed">{log.detalle}</div>
                    <div className="text-[10px] text-slate-400 mt-1">
                      {new Date(log.fecha).toLocaleString('es-DO')}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* ======================================================== */}
        {/* 10. CLIENT LOGIN */}
        {/* ======================================================== */}
        {currentView === 'client-login' && (
          <div className="flex-1 p-6 bg-white flex flex-col justify-between min-h-[100dvh]">
            <div>
              <button
                onClick={() => setCurrentView('landing')}
                className="w-10 h-10 rounded-full bg-slate-100 hover:bg-slate-200 flex items-center justify-center text-slate-700 transition"
              >
                <X className="w-5 h-5" />
              </button>

              <div className="text-center mt-6 mb-8">
                <div className="w-20 h-20 bg-gradient-to-br from-blue-500 to-indigo-700 rounded-3xl mx-auto mb-4 flex items-center justify-center shadow-xl shadow-blue-200">
                  <Phone className="w-10 h-10 text-white" />
                </div>
                <h2 className="text-2xl font-black text-slate-900">Verifica tu número</h2>
                <p className="text-slate-500 text-sm mt-1">Ingresa el teléfono registrado en el colmado</p>
              </div>

              <form onSubmit={handleClientLogin} className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wide mb-1.5">
                    Número de Teléfono
                  </label>
                  <input
                    type="tel"
                    value={clientPhone}
                    onChange={e => setClientPhone(e.target.value)}
                    placeholder="829 123 4567"
                    className="w-full px-4 py-3.5 border-2 border-slate-200 rounded-2xl text-base font-semibold text-slate-800 focus:border-blue-600 focus:outline-hidden"
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wide mb-1.5">
                    PIN de 4 dígitos
                  </label>
                  <input
                    type="password"
                    maxLength={4}
                    value={clientPin}
                    onChange={e => setClientPin(e.target.value.replace(/[^0-9]/g, ''))}
                    placeholder="••••"
                    className="w-full px-4 py-3.5 border-2 border-slate-200 rounded-2xl text-center text-2xl tracking-widest font-black text-slate-800 focus:border-blue-600 focus:outline-hidden"
                    required
                  />
                </div>

                <label className="flex items-center gap-3 pt-1 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={clientRemember}
                    onChange={e => setClientRemember(e.target.checked)}
                    className="w-5 h-5 rounded-md text-blue-600 border-slate-300"
                  />
                  <span className="text-xs font-semibold text-slate-600">Recordar mi teléfono</span>
                </label>

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full py-4 mt-4 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-2xl text-base shadow-lg transition active:scale-98 disabled:opacity-50"
                >
                  {isSubmitting ? 'Consultando...' : 'Ingresar'}
                </button>
              </form>
            </div>

            <div className="bg-blue-50 border border-blue-200 rounded-2xl p-4 text-xs text-blue-800 leading-relaxed">
              <strong>Demostración:</strong> Puedes probar con el teléfono{' '}
              <strong className="text-blue-950">8291234567</strong> y PIN{' '}
              <strong className="text-blue-950">1234</strong> (Manuel López).
            </div>
          </div>
        )}

        {/* ======================================================== */}
        {/* 11. CLIENT DASHBOARD */}
        {/* ======================================================== */}
        {currentView === 'client-dashboard' && currentClient && (
          <div className="flex-1 flex flex-col pb-20 bg-slate-50 min-h-[100dvh]">
            
            {/* INICIO TAB */}
            {clientTab === 'inicio' && (
              <div>
                <div className="header-gradient p-6 pb-24 rounded-b-3xl text-white relative">
                  <div className="flex justify-between items-center mb-4">
                    <button
                      onClick={() => setClientTab('perfil')}
                      className="w-10 h-10 rounded-2xl bg-white/20 flex items-center justify-center font-bold"
                    >
                      <User className="w-5 h-5" />
                    </button>
                    <div className="flex items-center gap-2">
                      <NotificationBellButton
                        rol="cliente"
                        clienteId={currentClient.id}
                        onClick={() => { vibrate(); setIsNotificationModalOpen(true); }}
                        className="bg-white/20 hover:bg-white/30 text-white border-white/25"
                      />
                      <div className="flex items-center gap-1.5 bg-emerald-500/20 border border-emerald-400/30 text-emerald-300 px-3 py-1 rounded-full text-xs font-bold">
                        <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
                        Activo
                      </div>
                    </div>
                  </div>

                  <h2 className="text-2xl font-black">Hola, {currentClient.nombre.split(' ')[0]}</h2>
                  <p className="text-xs text-blue-200 mt-0.5">{datosColmado.nombre}</p>

                  <div className="mt-4">
                    <NotificationPermissionBanner rol="cliente" />
                  </div>

                  {/* Client Debt Card */}
                  <div className="mt-6 bg-white text-slate-800 rounded-3xl p-6 shadow-2xl text-center">
                    <div className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">
                      Tu Deuda Actual
                    </div>
                    <div className="text-4xl font-black text-slate-900 tracking-tight">
                      {formatoMoneda(currentClient.saldo)}
                    </div>

                    {/* Progress Bar & Available */}
                    {currentClient.limite > 0 && (
                      <div className="mt-5 pt-4 border-t border-slate-100 text-left">
                        <div className="flex justify-between text-xs font-bold text-slate-600 mb-1.5">
                          <span>Límite de fiado</span>
                          <span>{formatoMoneda(currentClient.limite)}</span>
                        </div>
                        <div className="progress-track">
                          <div
                            className={`progress-fill ${
                              currentClient.alLimite ? 'danger' : 'ok'
                            }`}
                            style={{
                              width: `${Math.min(
                                100,
                                (currentClient.saldo / currentClient.limite) * 100
                              )}%`
                            }}
                          />
                        </div>
                        <div className="text-[11px] font-bold text-slate-500 mt-1">
                          Disponible para fiar: {formatoMoneda(currentClient.disponible)}
                        </div>
                      </div>
                    )}

                    {/* Next payment info */}
                    <div className="mt-4 pt-3 border-t border-slate-100 flex justify-between text-xs text-slate-600">
                      <div>
                        <div className="text-[10px] text-slate-400 uppercase font-bold">Próximo Pago</div>
                        <div className="font-bold text-blue-600">
                          {formatearFechaCorta(currentClient.proximoPago)}
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-[10px] text-slate-400 uppercase font-bold">Estado</div>
                        <div className="font-bold">
                          {currentClient.saldo <= 0 ? (
                            <span className="text-emerald-600">Al día</span>
                          ) : currentClient.estadoPago === 'pendiente' ? (
                            <span className="text-amber-600">Pendiente</span>
                          ) : (
                            <span className="text-emerald-600">Al día</span>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Recent client movements */}
                <div className="px-4 -mt-14 relative z-10 space-y-4">
                  <div className="bg-white rounded-3xl p-5 border border-slate-100 shadow-md">
                    <div className="flex justify-between items-center mb-3">
                      <h3 className="font-bold text-slate-800 text-sm flex items-center gap-1.5">
                        <Clock className="w-4 h-4 text-blue-600" />
                        Tus Movimientos Recientes
                      </h3>
                      <button
                        onClick={() => setClientTab('historial')}
                        className="text-xs text-blue-600 font-bold hover:underline"
                      >
                        Ver todos →
                      </button>
                    </div>

                    <div className="divide-y divide-slate-100">
                      {clientMovimientos.length === 0 ? (
                        <div className="py-6 text-center text-slate-400 text-xs">Sin movimientos registrados</div>
                      ) : (
                        clientMovimientos.slice(0, 5).map(m => {
                          const esFiado = m.tipo === 'Fiado';
                          const esPagado = esFiado && m.pagado;
                          return (
                            <div
                              key={m.idMov}
                              onClick={() => setActiveReceipt(m)}
                              className="py-3 flex items-center justify-between cursor-pointer hover:bg-slate-50 transition"
                            >
                              <div className="flex items-center gap-3">
                                <div
                                  className={`w-10 h-10 rounded-2xl flex items-center justify-center shrink-0 ${
                                    esPagado
                                      ? 'bg-emerald-100 text-emerald-600'
                                      : esFiado
                                      ? 'bg-red-100 text-red-600'
                                      : 'bg-emerald-100 text-emerald-600'
                                  }`}
                                >
                                  {esFiado ? <ShoppingBag className="w-4 h-4" /> : <ArrowDownLeft className="w-4 h-4" />}
                                </div>
                                <div>
                                  <div className={`font-bold text-xs ${esPagado ? 'text-emerald-700' : 'text-slate-800'}`}>
                                    {esPagado ? 'Fiado (Pagado)' : (esFiado ? m.autorizadoNombre || 'Compra' : 'Abono realizado')}
                                    {esPagado && <span className="ml-1.5 text-[9px] uppercase bg-emerald-100 text-emerald-700 px-1.5 py-0.5 rounded-md font-bold not-italic">Pago</span>}
                                  </div>
                                  <div className="text-[10px] text-slate-400">{m.fechaTexto} · {m.hora}</div>
                                </div>
                              </div>
                              <div className="text-right">
                                <div className={`font-black text-xs ${esPagado ? 'text-emerald-600' : esFiado ? 'text-red-600' : 'text-emerald-600'}`}>
                                  {esFiado ? '-' : '+'}{formatoMoneda(m.monto)}
                                  {esPagado && <div className="text-[9px] text-emerald-600 font-bold not-italic">Pagado</div>}
                                </div>
                              </div>
                            </div>
                          );
                        })
                      )}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* HISTORIAL TAB */}
            {clientTab === 'historial' && (
              <div>
                <div className="header-gradient p-6 rounded-b-3xl text-white">
                  <div className="flex items-center justify-between mb-2">
                    <button
                      onClick={() => setClientTab('inicio')}
                      className="w-9 h-9 rounded-full bg-white/20 flex items-center justify-center"
                    >
                      <X className="w-5 h-5" />
                    </button>
                    <h2 className="text-xl font-black">Historial Completo</h2>
                    <div className="w-9" />
                  </div>
                  <p className="text-xs text-blue-100 text-center">Tus compras y pagos en el colmado</p>
                </div>

                <div className="p-4 space-y-3">
                  <div className="space-y-2">
                    <div className="flex-1 bg-slate-200/70 p-1 rounded-2xl flex gap-1">
                      {(['todos', 'Fiado', 'Abono'] as const).map(f => (
                        <button
                          key={f}
                          onClick={() => setClientHistorialFiltro(f)}
                          className={`flex-1 py-2 rounded-xl text-xs font-bold transition ${
                            clientHistorialFiltro === f
                              ? 'bg-white text-blue-700 shadow-xs'
                              : 'text-slate-600 hover:text-slate-900'
                          }`}
                        >
                          {f === 'todos' ? 'Todos' : f === 'Fiado' ? 'Fiados' : 'Abonos'}
                        </button>
                      ))}
                    </div>

                    <div className="grid grid-cols-2 gap-2">
                      <button
                        type="button"
                        onClick={() => {
                          vibrate(15);
                          const fiados = clientMovimientos.filter(m => m.tipo === 'Fiado');
                          if (fiados.length === 0) {
                            showToast('Sin gastos', 'No hay compras registradas en la quincena', 'warning');
                            return;
                          }
                          generarGastosQuincenaPDF(clientMovimientos, {
                            nombreCliente: currentClient.nombre,
                            telefonoCliente: currentClient.telefono
                          });
                          showToast('PDF Quincena', 'Descargando tus gastos de la quincena...', 'success');
                        }}
                        className="py-2.5 px-3 bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-700 hover:to-orange-700 text-white rounded-2xl font-bold text-xs flex items-center justify-center gap-1.5 shadow-sm transition active:scale-95"
                        title="Descargar PDF con tus gastos de la quincena"
                      >
                        <FileText className="w-3.5 h-3.5" />
                        <span>Gastos Quincena (PDF)</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => {
                          vibrate(15);
                          const list = clientMovimientos.filter(
                            m => clientHistorialFiltro === 'todos' || m.tipo === clientHistorialFiltro
                          );
                          if (list.length === 0) {
                            showToast('Sin movimientos', 'No hay registros para exportar', 'warning');
                            return;
                          }
                          generarReporteHistorialPDF(list, clientHistorialFiltro, currentClient.saldo);
                          showToast('PDF Generado', `Descargando reporte de ${list.length} movimientos...`, 'success');
                        }}
                        className="py-2.5 px-3 bg-blue-600 hover:bg-blue-700 text-white rounded-2xl font-bold text-xs flex items-center justify-center gap-1.5 shadow-sm transition active:scale-95"
                        title="Descargar historial en PDF"
                      >
                        <Download className="w-3.5 h-3.5" />
                        <span>Reporte Lista (PDF)</span>
                      </button>
                    </div>
                  </div>

                  <div className="bg-white rounded-3xl border border-slate-100 divide-y divide-slate-100 overflow-hidden shadow-xs">
                    {clientMovimientos
                      .filter(m => clientHistorialFiltro === 'todos' || m.tipo === clientHistorialFiltro)
                      .map(m => {
                        const esFiado = m.tipo === 'Fiado';
                        const esPagado = esFiado && m.pagado;
                        return (
                          <div
                            key={m.idMov}
                            onClick={() => setActiveReceipt(m)}
                            className="p-4 flex items-center justify-between cursor-pointer hover:bg-slate-50 transition"
                          >
                            <div className="flex items-center gap-3 min-w-0">
                              <div
                                className={`w-10 h-10 rounded-2xl flex items-center justify-center shrink-0 ${
                                  esPagado
                                    ? 'bg-emerald-100 text-emerald-600'
                                    : esFiado
                                    ? 'bg-red-100 text-red-600'
                                    : 'bg-emerald-100 text-emerald-600'
                                }`}
                              >
                                {esFiado ? <ShoppingBag className="w-4 h-4" /> : <ArrowDownLeft className="w-4 h-4" />}
                              </div>
                              <div className="min-w-0">
                                <div className={`font-bold text-xs ${esPagado ? 'text-emerald-700' : 'text-slate-800'}`}>
                                  {esPagado ? 'Fiado (Pagado)' : m.tipo} {esFiado && !esPagado && m.autorizadoNombre && `· ${m.autorizadoNombre}`}
                                  {esPagado && <span className="ml-1.5 text-[9px] uppercase bg-emerald-100 text-emerald-700 px-1.5 py-0.5 rounded-md font-bold not-italic">Pago</span>}
                                </div>
                                <div className="text-[10px] text-slate-400">{m.fechaTexto} · {m.hora}</div>
                              </div>
                            </div>
                            <div className="flex items-center gap-2 shrink-0">
                              <div className="text-right">
                                <div className={`font-black text-xs ${esPagado ? 'text-emerald-600' : esFiado ? 'text-red-600' : 'text-emerald-600'}`}>
                                  {esFiado ? '-' : '+'}{formatoMoneda(m.monto)}
                                  {esPagado && <div className="text-[9px] text-emerald-600 font-bold not-italic">Pagado</div>}
                                </div>
                              </div>
                              <button
                                type="button"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  vibrate(10);
                                  generarReciboPDF(m);
                                  showToast('Recibo PDF', `Descargando comprobante #${m.idMov}...`, 'success');
                                }}
                                className="w-8 h-8 rounded-xl bg-slate-100 hover:bg-blue-100 text-slate-500 hover:text-blue-600 flex items-center justify-center transition"
                                title="Descargar comprobante en PDF"
                              >
                                <Download className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </div>
                        );
                      })}
                  </div>
                </div>
              </div>
            )}

            {/* PERFIL TAB */}
            {clientTab === 'perfil' && (
              <div className="p-4 space-y-4">
                <div className="bg-white rounded-3xl p-6 text-center border border-slate-100 shadow-md">
                  <div className="w-20 h-20 bg-gradient-to-br from-blue-600 to-indigo-700 text-white rounded-full mx-auto mb-3 flex items-center justify-center text-3xl font-black shadow-lg">
                    {currentClient.nombre.charAt(0).toUpperCase()}
                  </div>
                  <h3 className="text-xl font-black text-slate-900">{currentClient.nombre}</h3>
                  <p className="text-xs text-slate-500 mt-0.5">{currentClient.telefono}</p>
                </div>

                {/* Authorized Family Members */}
                <div className="bg-white rounded-3xl p-5 border border-slate-100 shadow-md">
                  <div className="flex justify-between items-center mb-3">
                    <h4 className="font-bold text-sm text-slate-800 flex items-center gap-1.5">
                      <Users className="w-4 h-4 text-purple-600" />
                      Personas Autorizadas
                    </h4>
                    <button
                      onClick={() =>
                        setAuthModal({
                          isOpen: true,
                          modo: 'agregar',
                          autorizado: null,
                          targetClienteId: currentClient.id,
                          esCliente: true
                        })
                      }
                      className="text-xs text-blue-600 font-bold hover:underline"
                    >
                      + Agregar
                    </button>
                  </div>
                  <p className="text-xs text-slate-500 mb-3">
                    Estas personas pueden retirar productos fiados a tu nombre en el colmado.
                  </p>

                  <div className="divide-y divide-slate-100">
                    {clientAutorizados.map(a => {
                      const esTitular = a.parentesco.toLowerCase() === 'titular';
                      return (
                        <div key={a.id} className="py-3 flex items-center justify-between">
                          <div>
                            <div className="font-bold text-xs text-slate-800">{a.nombre}</div>
                            <div className="text-[10px] text-slate-400">{a.parentesco}</div>
                          </div>
                          {esTitular ? (
                            <span className="text-[10px] bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full font-bold">
                              TITULAR
                            </span>
                          ) : (
                            <div className="flex gap-1.5">
                              <button
                                onClick={() =>
                                  setAuthModal({
                                    isOpen: true,
                                    modo: 'editar',
                                    autorizado: a,
                                    targetClienteId: currentClient.id,
                                    esCliente: true
                                  })
                                }
                                className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center hover:bg-blue-100 transition"
                              >
                                <Edit2 className="w-3.5 h-3.5" />
                              </button>
                              <button
                                onClick={() =>
                                  setDeleteAuthModal({
                                    autorizado: a,
                                    targetClienteId: currentClient.id,
                                    esCliente: true
                                  })
                                }
                                className="w-8 h-8 rounded-lg bg-red-50 text-red-600 flex items-center justify-center hover:bg-red-100 transition"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Tarjeta de Información del Colmado para el Cliente */}
                <div className="bg-gradient-to-br from-blue-900 to-indigo-950 text-white rounded-3xl p-5 shadow-xl relative overflow-hidden">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-10 h-10 rounded-2xl bg-white/20 backdrop-blur-md flex items-center justify-center">
                      <Store className="w-5 h-5 text-yellow-300" />
                    </div>
                    <div>
                      <h4 className="font-extrabold text-sm text-white">{datosColmado.nombre}</h4>
                      <p className="text-[11px] text-blue-200">{datosColmado.slogan}</p>
                    </div>
                  </div>

                  <div className="space-y-2 text-xs text-blue-100 pt-2 border-t border-white/10">
                    <div className="flex items-start gap-2">
                      <MapPin className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                      <span>{datosColmado.direccion}</span>
                    </div>

                    <div className="flex items-center gap-2">
                      <Clock className="w-4 h-4 text-cyan-400 shrink-0" />
                      <span>{datosColmado.horario} ({datosColmado.diasAtencion})</span>
                    </div>

                    <div className="flex items-center gap-2">
                      <Phone className="w-4 h-4 text-amber-400 shrink-0" />
                      <span>Tel: {datosColmado.telefono}</span>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-2 mt-4 pt-3 border-t border-white/10">
                    <a
                      href={`tel:${datosColmado.telefono.replace(/[^0-9]/g, '')}`}
                      className="py-2.5 px-3 rounded-xl bg-white/15 hover:bg-white/25 active:scale-95 text-xs font-bold text-white flex items-center justify-center gap-1.5 transition text-center"
                    >
                      <Phone className="w-3.5 h-3.5 text-yellow-300" />
                      Llamar
                    </a>

                    <a
                      href={`https://wa.me/${datosColmado.whatsapp.replace(/[^0-9]/g, '')}?text=${encodeURIComponent('Hola, me comunico desde la app de ' + datosColmado.nombre)}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="py-2.5 px-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 active:scale-95 text-xs font-bold text-white flex items-center justify-center gap-1.5 transition text-center shadow-md"
                    >
                      <Share2 className="w-3.5 h-3.5" />
                      WhatsApp
                    </a>
                  </div>
                </div>

                {/* Logout Button */}
                <button
                  onClick={() => {
                    vibrate();
                    setCurrentClient(null);
                    setCurrentView('landing');
                    showToast('Sesión Cerrada', '', 'info');
                  }}
                  className="w-full py-4 bg-red-50 hover:bg-red-100 text-red-600 font-bold rounded-2xl text-sm flex items-center justify-center gap-2 transition"
                >
                  <LogOut className="w-4 h-4" />
                  Cerrar Sesión
                </button>
              </div>
            )}

            {/* Bottom Nav Client */}
            <div className="fixed bottom-0 left-0 right-0 max-w-md sm:max-w-lg md:max-w-xl mx-auto bg-white/95 backdrop-blur-md border-t border-slate-200/80 px-4 py-2 flex items-center justify-around z-30 shadow-lg">
              <button
                onClick={() => { vibrate(); setClientTab('inicio'); }}
                className={`flex flex-col items-center py-1 font-bold text-[10px] transition ${
                  clientTab === 'inicio' ? 'text-blue-600' : 'text-slate-400 hover:text-slate-600'
                }`}
              >
                <Home className="w-5 h-5 mb-0.5" />
                Inicio
              </button>

              <button
                onClick={() => { vibrate(); setClientTab('historial'); }}
                className={`flex flex-col items-center py-1 font-bold text-[10px] transition ${
                  clientTab === 'historial' ? 'text-blue-600' : 'text-slate-400 hover:text-slate-600'
                }`}
              >
                <Clock className="w-5 h-5 mb-0.5" />
                Historial
              </button>

              <button
                onClick={() => { vibrate(); setClientTab('perfil'); }}
                className={`flex flex-col items-center py-1 font-bold text-[10px] transition ${
                  clientTab === 'perfil' ? 'text-blue-600' : 'text-slate-400 hover:text-slate-600'
                }`}
              >
                <User className="w-5 h-5 mb-0.5" />
                Mi Perfil
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
