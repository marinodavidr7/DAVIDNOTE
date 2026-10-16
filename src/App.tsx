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
  CheckCircle2,
  CheckSquare,
  DollarSign,
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
  ShieldAlert,
  MessageSquare,
  RefreshCw,
  FileSpreadsheet,
  ArrowLeft,
  QrCode,
  Wifi,
  UserPlus,
  Package,
  Tag,
  Crown,
  CreditCard,
  ListOrdered,
  ArrowDown,
  Eye,
  EyeOff,
  Unlock
} from 'lucide-react';
import { store } from './services/storeService';
import {
  ClienteCalculado,
  Movimiento,
  Autorizado,
  AuditoriaLog,
  DiaGastoCliente,
  DatosColmado,
  generarNumeroCuentaCliente
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
import { GoogleChatModal } from './components/GoogleChatModal';
import { ColmadoSettingsModal } from './components/ColmadoSettingsModal';
import { TopDebtorsChart } from './components/TopDebtorsChart';
import { NotificationCenterModal } from './components/NotificationCenterModal';
import { NotificationBellButton } from './components/NotificationBellButton';
import { NotificationPermissionBanner } from './components/NotificationPermissionBanner';
import { notificationService } from './services/notificationService';
import { usePWAInstall } from './hooks/usePWAInstall';
import { generarReciboPDF, generarReporteHistorialPDF, generarGastosQuincenaPDF } from './utils/pdfGenerator';
import { WhatsAppIconButton, WhatsAppIcon } from './components/WhatsAppButton';
import { WhatsAppModal } from './components/WhatsAppModal';
import { ClientMovementsSpreadsheet } from './components/ClientMovementsSpreadsheet';
import { ClientAbonosTable } from './components/ClientAbonosTable';
import { ClientSearchScanner } from './components/ClientSearchScanner';
import { ClientQrModal } from './components/ClientQrModal';
import { ClientNfcModal } from './components/ClientNfcModal';
import { DateRangePicker, DateRange } from './components/DateRangePicker';
import { ProductsModal } from './components/ProductsModal';
import { ChangePinModal } from './components/ChangePinModal';
import { LoginView } from './components/LoginView';
import { ejecutarAperturaWhatsApp, normalizarTelefonoWhatsApp } from './utils/whatsapp';

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

export type AdminTab = 'inicio' | 'clientes' | 'historial' | 'auditoria';

export default function App() {
  const { isInstallable, install, isInstalled } = usePWAInstall();

  // Navigation State
  const [currentView, setCurrentView] = useState<AppView>(() => {
    const saved = localStorage.getItem('colmado_current_view');
    if (saved === 'admin-detalle-cliente' || saved === 'admin-fiado' || saved === 'admin-abono' || saved === 'admin-autorizado' || saved === 'admin-crear-cliente' || saved === 'admin-auditoria') {
      return 'admin-dashboard';
    }
    if (saved === 'client-dashboard') {
      return 'landing';
    }
    if (saved && ['landing', 'admin-login', 'admin-dashboard', 'client-login'].includes(saved)) {
      return saved as AppView;
    }
    return 'landing';
  });
  const [adminTab, setAdminTab] = useState<'inicio' | 'clientes' | 'historial' | 'auditoria'>(() => {
    const saved = localStorage.getItem('colmado_admin_tab');
    return (saved as any) || 'inicio';
  });
  const [clientTab, setClientTab] = useState<'inicio' | 'tarjeta' | 'movimientos' | 'perfil' | 'historial'>('inicio');
  const [showClientPin, setShowClientPin] = useState(false);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [isChangePinModalOpen, setIsChangePinModalOpen] = useState(false);

  useEffect(() => {
    localStorage.setItem('colmado_current_view', currentView);
  }, [currentView]);

  useEffect(() => {
    localStorage.setItem('colmado_admin_tab', adminTab);
  }, [adminTab]);


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
  const [isGoogleChatOpen, setIsGoogleChatOpen] = useState(false);
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
  const [whatsAppModalCliente, setWhatsAppModalCliente] = useState<ClienteCalculado | null>(null);
  const [vistaTablaMovimientos, setVistaTablaMovimientos] = useState<boolean>(() => {
    return localStorage.getItem('colmado_vista_tabla_movimientos') === 'true';
  });

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
  const [adminDateRange, setAdminDateRange] = useState<DateRange>({ startDate: '', endDate: '' });
  const [selectedClientDetail, setSelectedClientDetail] = useState<ClienteCalculado | null>(null);
  const [selectedClientHistory, setSelectedClientHistory] = useState<Movimiento[]>([]);
  const [selectedClientDateFiltro, setSelectedClientDateFiltro] = useState<string>('');

  // Client Session State
  const [currentClient, setCurrentClient] = useState<ClienteCalculado | null>(null);
  const [clientGastos, setClientGastos] = useState<DiaGastoCliente[]>([]);
  const [clientMovimientos, setClientMovimientos] = useState<Movimiento[]>([]);
  const [clientHistorialFiltro, setClientHistorialFiltro] = useState<'todos' | 'Fiado' | 'Abono'>('todos');
  const [clientDateRange, setClientDateRange] = useState<DateRange>({ startDate: '', endDate: '' });
  const [clientAutorizados, setClientAutorizados] = useState<Autorizado[]>([]);

  useEffect(() => {
    if (currentView === 'admin-detalle-cliente' && !selectedClientDetail) {
      setCurrentView('admin-dashboard');
    }
    if (currentView === 'client-dashboard' && !currentClient) {
      setCurrentView('landing');
    }
  }, [currentView, selectedClientDetail, currentClient]);

  // Event handler global y capa de interacción para registrar touchstart en navegación ('inicio', 'clientes', 'historial')
  // sin interferencia de modales ni delays de toque en iOS/Android/WebViews
  useEffect(() => {
    const handleGlobalTouch = (e: TouchEvent) => {
      const target = e.target as HTMLElement | null;
      if (!target) return;

      // Si hay un modal abierto o el toque es dentro de un diálogo modal, no interferir
      if (
        target.closest('[role="dialog"]') ||
        target.closest('.modal-backdrop') ||
        target.closest('.drawer-backdrop.open')
      ) {
        return;
      }

      // Si el toque ocurrió en un elemento con data-nav-tab
      const navTarget = target.closest<HTMLElement>('[data-nav-tab]');
      if (navTarget) {
        const tab = navTarget.getAttribute('data-nav-tab') as AdminTab | null;
        if (tab && (tab === 'inicio' || tab === 'clientes' || tab === 'historial')) {
          if (adminTab !== tab) {
            vibrate(10);
            setAdminTab(tab);
          }
        }
      }
    };

    window.addEventListener('touchstart', handleGlobalTouch, { passive: true });
    return () => {
      window.removeEventListener('touchstart', handleGlobalTouch);
    };
  }, [adminTab]);

  // Login inputs
  const [adminEmail, setAdminEmail] = useState(() => localStorage.getItem('colmado_admin_email') || '');
  const [adminPass, setAdminPass] = useState('');
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
  const [formNewClientApodo, setFormNewClientApodo] = useState('');
  const [formNewClientTel, setFormNewClientTel] = useState('');
  const [formNewClientPin, setFormNewClientPin] = useState('');
  const [formNewClientLimite, setFormNewClientLimite] = useState('5000');
  const [formNewClientDias, setFormNewClientDias] = useState('15,30');
  const [formNewClientAuts, setFormNewClientAuts] = useState<{ nombre: string; parentesco: string }[]>([]);
  const [clienteSearchModo, setClienteSearchModo] = useState<'nombre' | 'qr' | 'nfc'>('nombre');
  const [activeQrModalCliente, setActiveQrModalCliente] = useState<ClienteCalculado | null>(null);
  const [activeNfcModalCliente, setActiveNfcModalCliente] = useState<ClienteCalculado | null>(null);
  const [isProductsModalOpen, setIsProductsModalOpen] = useState(false);
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

  // Polling automático de 30 segundos para sincronizar en vivo con Google Sheets
  useEffect(() => {
    refreshAdminDashboard();

    const pollingInterval = setInterval(async () => {
      if (typeof navigator !== 'undefined' && navigator.onLine && store.isGoogleSheetConnected()) {
        try {
          await store.syncWithGoogleSheet();
          await refreshAdminDashboard();
        } catch (e) {
          console.warn('Error en polling de Google Sheets:', e);
        }
      }
    }, 30000);

    return () => clearInterval(pollingInterval);
  }, [selectedClientDetail?.id]);

  // WhatsApp reminder
  const sendWhatsAppReminder = (c: { nombre: string; telefono: string; saldo: number; diasPago?: string }) => {
    vibrate(20);
    const res = ejecutarAperturaWhatsApp(c, datosColmado.nombre);
    if (!res.ok) {
      showToast('Error Teléfono', res.error || 'El cliente no tiene teléfono válido para WhatsApp', 'error');
      return;
    }
    store.registrarLog('Colmadero', 'Admin', 'Envío Recordatorio WhatsApp', `Cliente: ${c.nombre} - Monto: ${formatoMoneda(c.saldo)}`);
    showToast('WhatsApp Abierto', `Abriendo recordatorio para ${c.nombre}`, 'success');
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
          const freshMovs = store.getHistorialAdmin();
          setSelectedClientHistory(freshMovs.filter(m => m.idCliente === idC));
          const freshData = await store.getDashboardAdmin();
          const freshClient = freshData.clientes.find(c => c.id === idC);
          if (freshClient) setSelectedClientDetail(freshClient);
          setCurrentView('admin-detalle-cliente');
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
          const freshMovs = store.getHistorialAdmin();
          setSelectedClientHistory(freshMovs.filter(m => m.idCliente === idC));
          const freshData = await store.getDashboardAdmin();
          const freshClient = freshData.clientes.find(c => c.id === idC);
          if (freshClient) setSelectedClientDetail(freshClient);
          setCurrentView('admin-detalle-cliente');
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
      list = list.filter(c =>
        c.nombre.toLowerCase().includes(q) ||
        (c.apodo && c.apodo.toLowerCase().includes(q)) ||
        c.telefono.includes(q) ||
        (c.codigoQR && c.codigoQR.toLowerCase().includes(q)) ||
        (c.nfcUid && c.nfcUid.toLowerCase().includes(q))
      );
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

  // Filtered History for Admin with Date Range
  const filteredAdminHistorial = useMemo(() => {
    return adminHistorial.filter(m => {
      if (adminHistorialFiltro !== 'todos' && m.tipo !== adminHistorialFiltro) {
        return false;
      }
      const mDate = (m.fechaHora ? m.fechaHora.slice(0, 10) : m.fechaTexto || '').slice(0, 10);
      if (adminDateRange.startDate && mDate && mDate < adminDateRange.startDate) {
        return false;
      }
      if (adminDateRange.endDate && mDate && mDate > adminDateRange.endDate) {
        return false;
      }
      return true;
    });
  }, [adminHistorial, adminHistorialFiltro, adminDateRange]);

  // Filtered History for Client with Date Range
  const filteredClientMovimientos = useMemo(() => {
    return clientMovimientos.filter(m => {
      if (clientHistorialFiltro !== 'todos' && m.tipo !== clientHistorialFiltro) {
        return false;
      }
      const mDate = (m.fechaHora ? m.fechaHora.slice(0, 10) : m.fechaTexto || '').slice(0, 10);
      if (clientDateRange.startDate && mDate && mDate < clientDateRange.startDate) {
        return false;
      }
      if (clientDateRange.endDate && mDate && mDate > clientDateRange.endDate) {
        return false;
      }
      return true;
    });
  }, [clientMovimientos, clientHistorialFiltro, clientDateRange]);

  const clientTotalFiado = useMemo(() => {
    return clientMovimientos.filter(m => m.tipo === 'Fiado').reduce((sum, m) => sum + m.monto, 0);
  }, [clientMovimientos]);

  const clientTotalAbonado = useMemo(() => {
    return clientMovimientos.filter(m => m.tipo === 'Abono').reduce((sum, m) => sum + m.monto, 0);
  }, [clientMovimientos]);

  const formatMovementRelative = (m: Movimiento) => {
    try {
      const hoy = new Date();
      const mDate = new Date(m.fechaHora);
      const isHoy = hoy.toDateString() === mDate.toDateString();
      const ayer = new Date();
      ayer.setDate(ayer.getDate() - 1);
      const isAyer = ayer.toDateString() === mDate.toDateString();
      const timePart = m.hora || mDate.toLocaleTimeString('es-DO', { hour: '2-digit', minute: '2-digit' });

      if (isHoy) return `Hoy · ${timePart}`;
      if (isAyer) return `Ayer · ${timePart}`;

      const day = mDate.getDate();
      const month = mDate.toLocaleDateString('es-DO', { month: 'short' });
      const year = mDate.getFullYear();
      return `${day} ${month} ${year} · ${timePart}`;
    } catch {
      return `${m.fechaTexto || ''} · ${m.hora || ''}`;
    }
  };

  const clientGroupedMovimientos = useMemo(() => {
    const groups: { label: string; items: Movimiento[] }[] = [];
    const map = new Map<string, Movimiento[]>();

    filteredClientMovimientos.forEach(m => {
      let label = 'OTRAS FECHAS';
      try {
        const hoy = new Date();
        const mDate = new Date(m.fechaHora);
        if (hoy.toDateString() === mDate.toDateString()) {
          label = 'HOY';
        } else {
          const ayer = new Date();
          ayer.setDate(ayer.getDate() - 1);
          if (ayer.toDateString() === mDate.toDateString()) {
            label = 'AYER';
          } else {
            const day = mDate.getDate();
            const month = mDate.toLocaleDateString('es-DO', { month: 'short' }).toUpperCase();
            const year = mDate.getFullYear();
            label = `${day} ${month} ${year}`;
          }
        }
      } catch {
        label = m.fechaTexto?.toUpperCase() || 'MOVIMIENTOS';
      }

      if (!map.has(label)) {
        map.set(label, []);
        groups.push({ label, items: map.get(label)! });
      }
      map.get(label)!.push(m);
    });

    return groups;
  }, [filteredClientMovimientos]);

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

  // Fiados pendientes del cliente seleccionado en el formulario de Abono (solo fiados que no estén pagos)
  const fiadosPendientesAbono = useMemo(() => {
    const idC = Number(formAbonoCliente);
    if (!idC) return [];
    return adminHistorial
      .filter(m => m.idCliente === idC && m.tipo === 'Fiado' && !m.pagado && (m.saldoPendiente === undefined || m.saldoPendiente > 0))
      .sort((a, b) => new Date(a.fechaHora).getTime() - new Date(b.fechaHora).getTime() || a.idMov - b.idMov);
  }, [adminHistorial, formAbonoCliente]);

  const todosFiadosAbonoSeleccionados = useMemo(() => {
    return fiadosPendientesAbono.length > 0 && fiadosPendientesAbono.every(f => selectedFiadosPagados.includes(f.idMov));
  }, [fiadosPendientesAbono, selectedFiadosPagados]);

  const totalSumaFiadosSeleccionados = useMemo(() => {
    return fiadosPendientesAbono
      .filter(f => selectedFiadosPagados.includes(f.idMov))
      .reduce((acc, f) => acc + (typeof f.saldoPendiente === 'number' ? f.saldoPendiente : f.monto), 0);
  }, [fiadosPendientesAbono, selectedFiadosPagados]);

  const handleToggleSeleccionarTodosFiados = () => {
    vibrate(15);
    if (todosFiadosAbonoSeleccionados) {
      setSelectedFiadosPagados([]);
    } else {
      setSelectedFiadosPagados(fiadosPendientesAbono.map(f => f.idMov));
    }
  };

  // Simulación en tiempo real de cómo se distribuirá el pago entre los fiados seleccionados o todos los pendientes
  const simulacionDistribucionAbono = useMemo(() => {
    const montoNum = parseFloat(formAbonoMonto);
    if (isNaN(montoNum) || montoNum <= 0 || fiadosPendientesAbono.length === 0) {
      return null;
    }

    // Prioridad: primero fiados seleccionados expresamente (en orden cronológico), luego los demás
    let listaObjetivo: Movimiento[] = [];
    if (selectedFiadosPagados.length > 0) {
      const seleccionados = fiadosPendientesAbono.filter(f => selectedFiadosPagados.includes(f.idMov));
      const noSeleccionados = fiadosPendientesAbono.filter(f => !selectedFiadosPagados.includes(f.idMov));
      listaObjetivo = [...seleccionados, ...noSeleccionados];
    } else {
      listaObjetivo = fiadosPendientesAbono;
    }

    let restante = montoNum;
    const resultados: Record<number, {
      deudaPendiente: number;
      aplicado: number;
      quedaPendiente: number;
      estado: 'PAGO_COMPLETO' | 'PAGO_PARCIAL' | 'SIN_CUBRIR';
    }> = {};

    let countCompletos = 0;
    let parcialItem: { idMov: number; aplicado: number; quedaPendiente: number } | null = null;

    for (const f of listaObjetivo) {
      const deuda = typeof f.saldoPendiente === 'number' ? f.saldoPendiente : f.monto;
      if (deuda <= 0) continue;

      if (restante <= 0) {
        resultados[f.idMov] = {
          deudaPendiente: deuda,
          aplicado: 0,
          quedaPendiente: deuda,
          estado: 'SIN_CUBRIR'
        };
        continue;
      }

      if (restante >= deuda) {
        // Cubre completo
        resultados[f.idMov] = {
          deudaPendiente: deuda,
          aplicado: deuda,
          quedaPendiente: 0,
          estado: 'PAGO_COMPLETO'
        };
        restante = Math.round((restante - deuda) * 100) / 100;
        countCompletos++;
      } else {
        // Cubre parcial
        const aplicado = restante;
        const queda = Math.round((deuda - aplicado) * 100) / 100;
        resultados[f.idMov] = {
          deudaPendiente: deuda,
          aplicado,
          quedaPendiente: queda,
          estado: 'PAGO_PARCIAL'
        };
        parcialItem = { idMov: f.idMov, aplicado, quedaPendiente: queda };
        restante = 0;
      }
    }

    return {
      resultados,
      countCompletos,
      parcialItem,
      montoNum
    };
  }, [formAbonoMonto, fiadosPendientesAbono, selectedFiadosPagados]);

  return (
    <div className={`min-h-screen ${currentView === 'landing' || currentView === 'client-login' || currentView === 'admin-login' ? 'bg-slate-950 text-white' : 'bg-slate-50 text-slate-800'} flex flex-col selection:bg-blue-500 selection:text-white`}>
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
      <GoogleChatModal
        isOpen={isGoogleChatOpen}
        onClose={() => setIsGoogleChatOpen(false)}
        showToast={showToast}
      />
      <ColmadoSettingsModal
        isOpen={isColmadoSettingsOpen}
        onClose={() => setIsColmadoSettingsOpen(false)}
        vistaTablaMovimientos={vistaTablaMovimientos}
        onToggleVistaTabla={(val) => {
          setVistaTablaMovimientos(val);
          showToast('Vista de Movimientos', val ? 'Formato Hoja de Cálculo activado' : 'Formato Tarjetas activado', 'info');
        }}
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
      <WhatsAppModal
        isOpen={!!whatsAppModalCliente}
        cliente={whatsAppModalCliente}
        nombreColmado={datosColmado.nombre}
        onClose={() => setWhatsAppModalCliente(null)}
        showToast={showToast}
        onSent={(c) => {
          vibrate(20);
          store.registrarLog('Colmadero', 'Admin', 'Envío Recordatorio WhatsApp', `Cliente: ${c.nombre} - Monto: ${formatoMoneda(c.saldo)}`);
          showToast('WhatsApp Abierto', `Abriendo recordatorio para ${c.nombre}`, 'success');
        }}
      />
      <ClientQrModal
        cliente={activeQrModalCliente}
        onClose={() => setActiveQrModalCliente(null)}
      />
      <ClientNfcModal
        cliente={activeNfcModalCliente}
        onClose={() => setActiveNfcModalCliente(null)}
        onSuccess={async (nuevoUid) => {
          await refreshAdminDashboard();
          if (selectedClientDetail && activeNfcModalCliente && selectedClientDetail.id === activeNfcModalCliente.id) {
            setSelectedClientDetail(prev => prev ? { ...prev, nfcUid: nuevoUid || undefined } : null);
          }
          showToast(
            nuevoUid ? 'NFC Vinculado' : 'NFC Desvinculado',
            nuevoUid ? `Tag UID: ${nuevoUid}` : 'El tag NFC ha sido removido del cliente',
            'success'
          );
        }}
      />
      <ProductsModal
        isOpen={isProductsModalOpen}
        onClose={() => setIsProductsModalOpen(false)}
      />
      <ChangePinModal
        isOpen={isChangePinModalOpen}
        cliente={currentClient}
        onClose={() => setIsChangePinModalOpen(false)}
        onSuccess={(nuevoPin) => {
          vibrate(20);
          showToast('PIN Actualizado', 'Tu nuevo PIN ha sido guardado exitosamente', 'success');
          if (currentClient) {
            setCurrentClient(prev => prev ? { ...prev, pin: nuevoPin } : null);
          }
          refreshAdminDashboard();
        }}
      />

      {/* Main Container - Responsive Mobile-First Root */}
      <div className="w-full flex-1 flex flex-col relative overflow-x-hidden">
        
        {/* ======================================================== */}
        {/* 1. LANDING VIEW */}
        {/* ======================================================== */}
        {currentView === 'landing' && (
          <div className="w-full flex-1 flex flex-col justify-between p-6 sm:px-10 sm:py-10 text-center relative overflow-hidden bg-gradient-to-b from-blue-900 via-slate-900 to-slate-950 text-white min-h-[100dvh] lg:px-16 lg:py-8 lg:grid lg:grid-cols-2 lg:grid-rows-[auto_1fr] lg:gap-x-20 lg:text-left lg:bg-gradient-to-br lg:from-blue-900 lg:via-slate-900 lg:to-slate-950">
            <div className="absolute top-0 right-0 w-80 h-80 bg-blue-500/15 rounded-full -mr-32 -mt-32 pointer-events-none blur-2xl"></div>
            <div className="absolute bottom-0 left-0 w-72 h-72 bg-blue-400/10 rounded-full -ml-28 -mb-28 pointer-events-none blur-xl"></div>

            {/* Top Bar with APK button */}
            <div className="relative z-10 flex items-center justify-end pt-2 lg:col-span-2">
              <button
                onClick={() => { vibrate(); setIsApkGuideOpen(true); }}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-yellow-400/20 hover:bg-yellow-400/30 text-yellow-300 font-bold text-xs transition border border-yellow-400/30"
              >
                <Smartphone className="w-3.5 h-3.5" />
                <span>Instalar / APK</span>
              </button>
            </div>

            {/* Hero / Brand */}
            <div className="relative z-10 my-auto py-8 flex flex-col items-center lg:items-start lg:col-start-1 lg:row-start-2 lg:self-center">
              <div className="w-24 h-24 bg-white rounded-3xl mb-4 flex items-center justify-center shadow-2xl p-4 transform hover:scale-105 transition">
                <ShoppingBag className="w-14 h-14 text-blue-700" />
              </div>
              <h1 className="text-2xl sm:text-3xl lg:text-5xl font-extrabold tracking-tight text-white mb-1">
                {datosColmado.nombre}
              </h1>
              <p className="text-slate-300 text-xs sm:text-sm font-medium">{datosColmado.slogan}</p>

              {/* Info rápida del colmado */}
              <div className="mt-4 max-w-xs lg:max-w-md w-full bg-white/5 border border-white/10 px-3.5 py-2 rounded-2xl text-[11px] lg:text-xs text-blue-100 space-y-1 backdrop-blur-xs text-left">
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

              <div className="mt-8 max-w-xs lg:max-w-md bg-white/5 border border-white/10 rounded-2xl p-4 backdrop-blur-sm">
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
            <div className="relative z-10 w-full max-w-sm mx-auto space-y-3 pb-4 lg:col-start-2 lg:row-start-2 lg:self-center lg:max-w-md lg:mx-0 lg:justify-self-start">
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
          <LoginView
            initialRole="admin"
            onAdminLogin={handleAdminLogin}
            onClientLogin={handleClientLogin}
            onBackToLanding={() => { vibrate(10); setCurrentView('landing'); }}
            onOpenApkGuide={() => { vibrate(10); setIsApkGuideOpen(true); }}
            datosColmado={datosColmado}
            adminEmail={adminEmail}
            setAdminEmail={setAdminEmail}
            adminPass={adminPass}
            setAdminPass={setAdminPass}
            adminRemember={adminRemember}
            setAdminRemember={setAdminRemember}
            clientPhone={clientPhone}
            setClientPhone={setClientPhone}
            clientPin={clientPin}
            setClientPin={setClientPin}
            clientRemember={clientRemember}
            setClientRemember={setClientRemember}
            isSubmitting={isSubmitting}
            clientesDemo={adminClientes}
            onRoleChanged={(r) => {
              setCurrentView(r === 'client' ? 'client-login' : 'admin-login');
            }}
          />
        )}

        {/* ======================================================== */}
        {/* 3. ADMIN DASHBOARD */}
        {/* ======================================================== */}
        {currentView === 'admin-dashboard' && (
          <div id="view-admin-dashboard" className="w-full flex-1 flex flex-col lg:flex-row relative bg-slate-50 min-h-[100dvh] lg:h-screen lg:overflow-hidden">
            
            {/* Sidebar Desktop y Tablet (≥ 768px) */}
            <aside className="hidden lg:flex lg:flex-col lg:w-64 bg-slate-900 sticky top-0 h-screen border-r border-slate-800 z-30 shrink-0 select-none overflow-y-auto">
              <div className="p-5 border-b border-slate-800">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-blue-600 rounded-2xl flex items-center justify-center text-white shadow-md shadow-blue-500/20">
                    <ShoppingBag className="w-5 h-5 text-yellow-300" />
                  </div>
                  <div className="min-w-0">
                    <h3 className="font-black text-white text-sm leading-tight truncate">{datosColmado.nombre}</h3>
                    <p className="text-blue-400 text-[10px] font-bold">Panel Colmadero</p>
                  </div>
                </div>
              </div>

              {/* Sidebar Navigation */}
              <nav className="flex-1 p-3 space-y-1 overflow-y-auto">
                <button
                  type="button"
                  data-nav-tab="inicio"
                  onTouchStart={() => { vibrate(10); setAdminTab('inicio'); }}
                  onClick={() => { vibrate(10); setAdminTab('inicio'); }}
                  className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-bold transition touch-manipulation cursor-pointer ${
                    adminTab === 'inicio' ? 'bg-blue-600 text-white shadow-sm' : 'text-slate-400 hover:text-white hover:bg-slate-800/80'
                  }`}
                >
                  <Home className="w-4 h-4" />
                  <span>Inicio & Métricas</span>
                </button>

                <button
                  type="button"
                  data-nav-tab="clientes"
                  onTouchStart={() => { vibrate(10); setAdminTab('clientes'); }}
                  onClick={() => { vibrate(10); setAdminTab('clientes'); }}
                  className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-bold transition touch-manipulation cursor-pointer ${
                    adminTab === 'clientes' ? 'bg-blue-600 text-white shadow-sm' : 'text-slate-400 hover:text-white hover:bg-slate-800/80'
                  }`}
                >
                  <Users className="w-4 h-4" />
                  <span>Clientes</span>
                </button>

                <button
                  type="button"
                  data-nav-tab="historial"
                  onTouchStart={() => { vibrate(10); setAdminTab('historial'); }}
                  onClick={() => { vibrate(10); setAdminTab('historial'); }}
                  className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-bold transition touch-manipulation cursor-pointer ${
                    adminTab === 'historial' ? 'bg-blue-600 text-white shadow-sm' : 'text-slate-400 hover:text-white hover:bg-slate-800/80'
                  }`}
                >
                  <Clock className="w-4 h-4" />
                  <span>Historial General</span>
                </button>

                <div className="pt-3 pb-1 px-3 text-[10px] font-black text-slate-500 uppercase tracking-wider">
                  Acciones Rápidas
                </div>

                <button
                  onClick={() => { vibrate(); setCurrentView('admin-fiado'); }}
                  className="w-full flex items-center gap-3 px-3.5 py-2 rounded-xl text-xs font-medium text-slate-300 hover:text-white hover:bg-slate-800 transition"
                >
                  <PlusCircle className="w-4 h-4 text-blue-400" />
                  <span>Registrar Fiado</span>
                </button>

                <button
                  onClick={() => { vibrate(); setCurrentView('admin-abono'); }}
                  className="w-full flex items-center gap-3 px-3.5 py-2 rounded-xl text-xs font-medium text-slate-300 hover:text-white hover:bg-slate-800 transition"
                >
                  <ArrowDownLeft className="w-4 h-4 text-emerald-400" />
                  <span>Registrar Abono</span>
                </button>

                <button
                  onClick={() => { vibrate(); setCurrentView('admin-crear-cliente'); }}
                  className="w-full flex items-center gap-3 px-3.5 py-2 rounded-xl text-xs font-medium text-slate-300 hover:text-white hover:bg-slate-800 transition"
                >
                  <Users className="w-4 h-4 text-indigo-400" />
                  <span>Nuevo Cliente</span>
                </button>

                <button
                  onClick={() => { vibrate(); setCurrentView('admin-autorizado'); }}
                  className="w-full flex items-center gap-3 px-3.5 py-2 rounded-xl text-xs font-medium text-slate-300 hover:text-white hover:bg-slate-800 transition"
                >
                  <UserCheck className="w-4 h-4 text-purple-400" />
                  <span>Agregar Autorizado</span>
                </button>

                <button
                  onClick={() => { vibrate(); setIsProductsModalOpen(true); }}
                  className="w-full flex items-center gap-3 px-3.5 py-2 rounded-xl text-xs font-medium text-slate-300 hover:text-white hover:bg-slate-800 transition"
                >
                  <Tag className="w-4 h-4 text-amber-400" />
                  <span>Productos</span>
                </button>

                <div className="pt-3 pb-1 px-3 text-[10px] font-black text-slate-500 uppercase tracking-wider">
                  Configuración
                </div>

                <button
                  onClick={() => { vibrate(); setIsColmadoSettingsOpen(true); }}
                  className="w-full flex items-center gap-3 px-3.5 py-2 rounded-xl text-xs font-medium text-slate-300 hover:text-white hover:bg-slate-800 transition"
                >
                  <Store className="w-4 h-4 text-amber-400" />
                  <span>Datos del Colmado</span>
                </button>

                <button
                  onClick={() => { vibrate(); setIsSheetsConfigOpen(true); }}
                  className="w-full flex items-center gap-3 px-3.5 py-2 rounded-xl text-xs font-medium text-slate-300 hover:text-white hover:bg-slate-800 transition"
                >
                  <Database className="w-4 h-4 text-emerald-400" />
                  <span>Google Sheets API</span>
                </button>

                <button
                  onClick={() => { vibrate(); setCurrentView('admin-auditoria'); }}
                  className="w-full flex items-center gap-3 px-3.5 py-2 rounded-xl text-xs font-medium text-slate-300 hover:text-white hover:bg-slate-800 transition"
                >
                  <Shield className="w-4 h-4 text-blue-400" />
                  <span>Auditoría</span>
                </button>

                <button
                  onClick={() => { vibrate(); setIsNotificationModalOpen(true); }}
                  className="w-full flex items-center justify-between px-3.5 py-2 rounded-xl text-xs font-medium text-slate-300 hover:text-white hover:bg-slate-800 transition"
                >
                  <div className="flex items-center gap-3">
                    <Bell className="w-4 h-4 text-rose-400" />
                    <span>Notificaciones</span>
                  </div>
                  {notificationService.getUnreadCount('admin') > 0 && (
                    <span className="text-[10px] bg-red-600 text-white font-black px-1.5 py-0.5 rounded-full">
                      {notificationService.getUnreadCount('admin')}
                    </span>
                  )}
                </button>
              </nav>

              {/* Sidebar Footer */}
              <div className="p-4 border-t border-slate-800 bg-slate-950/40 flex items-center justify-between">
                <div className="min-w-0 pr-2">
                  <div className="text-xs font-bold text-white truncate">Administrador</div>
                  <div className="text-[10px] text-slate-400 truncate">{datosColmado.nombre}</div>
                </div>
                <button
                  onClick={() => {
                    vibrate();
                    setCurrentView('landing');
                    showToast('Sesión Cerrada', '', 'info');
                  }}
                  className="p-2 rounded-xl text-slate-400 hover:text-red-400 hover:bg-slate-800 transition"
                  title="Cerrar Sesión"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            </aside>

            {/* Drawer Backdrop y Drawer Lateral (solo se renderizan cuando está abierto para evitar interceptar toques o clics) */}
            {drawerOpen && (
              <>
                <div
                  onClick={() => setDrawerOpen(false)}
                  className="drawer-backdrop open"
                />
                <div className="drawer open">
              <div className="header-gradient p-6 text-white shrink-0">
                <div className="w-14 h-14 bg-white/20 rounded-2xl flex items-center justify-center mb-3">
                  <ShoppingBag className="w-7 h-7 text-yellow-300" />
                </div>
                <h3 className="font-extrabold text-lg">Súper Colmado</h3>
                <p className="text-blue-100 text-xs">DAVID · Panel de Control</p>
              </div>

              <div className="flex-1 py-3 overflow-y-auto divide-y divide-slate-100">
                <div className="py-2 space-y-1">
                  <button
                    type="button"
                    data-nav-tab="inicio"
                    onTouchStart={() => { vibrate(10); setAdminTab('inicio'); setDrawerOpen(false); }}
                    onClick={() => { vibrate(10); setAdminTab('inicio'); setDrawerOpen(false); }}
                    className={`w-full flex items-center gap-3 px-6 py-3.5 text-sm font-bold transition touch-manipulation cursor-pointer ${
                      adminTab === 'inicio' ? 'bg-blue-50 text-blue-700' : 'text-slate-700 hover:bg-slate-50'
                    }`}
                  >
                    <Home className="w-5 h-5 text-blue-600" />
                    Inicio
                  </button>

                  <button
                    type="button"
                    data-nav-tab="clientes"
                    onTouchStart={() => { vibrate(10); setAdminTab('clientes'); setDrawerOpen(false); }}
                    onClick={() => { vibrate(10); setAdminTab('clientes'); setDrawerOpen(false); }}
                    className={`w-full flex items-center gap-3 px-6 py-3.5 text-sm font-bold transition touch-manipulation cursor-pointer ${
                      adminTab === 'clientes' ? 'bg-blue-50 text-blue-700' : 'text-slate-700 hover:bg-slate-50'
                    }`}
                  >
                    <Users className="w-5 h-5 text-blue-600" />
                    Clientes
                  </button>

                  <button
                    type="button"
                    data-nav-tab="historial"
                    onTouchStart={() => { vibrate(10); setAdminTab('historial'); setDrawerOpen(false); }}
                    onClick={() => { vibrate(10); setAdminTab('historial'); setDrawerOpen(false); }}
                    className={`w-full flex items-center gap-3 px-6 py-3.5 text-sm font-bold transition touch-manipulation cursor-pointer ${
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
                    onClick={() => { setIsGoogleChatOpen(true); setDrawerOpen(false); }}
                    className="w-full flex items-center gap-3 px-6 py-3.5 text-sm font-bold text-blue-700 hover:bg-blue-50 transition"
                  >
                    <MessageSquare className="w-5 h-5 text-blue-600" />
                    Google Chat
                  </button>

                  <button
                    onClick={() => { setIsApkGuideOpen(true); setDrawerOpen(false); }}
                    className="w-full flex items-center gap-3 px-6 py-3.5 text-sm font-bold text-indigo-700 hover:bg-indigo-50 transition"
                  >
                    <Smartphone className="w-5 h-5 text-indigo-600" />
                    Generar APK Móvil
                  </button>

                  <button
                    onClick={async () => {
                      vibrate();
                      showToast('Actualizando', 'Limpiando caché y recargando la última versión...', 'info');
                      try {
                        if ('serviceWorker' in navigator) {
                          const regs = await navigator.serviceWorker.getRegistrations();
                          for (const r of regs) {
                            await r.unregister();
                          }
                        }
                        if ('caches' in window) {
                          const keys = await caches.keys();
                          for (const k of keys) {
                            await caches.delete(k);
                          }
                        }
                      } catch {}
                      setTimeout(() => {
                        window.location.reload();
                      }, 500);
                    }}
                    className="w-full flex items-center gap-3 px-6 py-3.5 text-sm font-bold text-amber-700 hover:bg-amber-50 transition"
                  >
                    <RefreshCw className="w-5 h-5 text-amber-600" />
                    Forzar Actualización / Limpiar Caché
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
          </>
        )}

            {/* MAIN CONTENT AREA (Full Width fluido sin espacios muertos laterales) */}
            <main className="flex-1 w-full px-4 sm:px-6 lg:px-8 xl:px-10 py-6 overflow-y-auto overscroll-contain lg:h-screen main-content-scroll">

            {/* TAB INICIO */}
            {adminTab === 'inicio' && (
              <div className="space-y-6">
                {/* Header compacto móvil (< 768px) */}
                <div className="lg:hidden flex justify-between items-center bg-blue-700 text-white p-4 rounded-2xl mb-6 shadow-md">
                  <div className="flex items-center gap-3">
                    <button
                      onClick={() => setDrawerOpen(true)}
                      className="w-10 h-10 rounded-xl bg-white/20 hover:bg-white/30 flex items-center justify-center transition active:scale-95"
                    >
                      <Menu className="w-5 h-5 text-white" />
                    </button>
                    <div className="min-w-0">
                      <h2 className="text-base font-black leading-tight text-white truncate">{datosColmado.nombre}</h2>
                      <p className="text-[10px] text-blue-200 truncate">{datosColmado.slogan}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <NotificationBellButton
                      rol="admin"
                      onClick={() => { vibrate(); setIsNotificationModalOpen(true); }}
                      className="bg-white/20 hover:bg-white/30 text-white border-white/20"
                    />
                    <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center font-black text-xs border border-white/30 text-white">
                      {datosColmado.nombre.charAt(0).toUpperCase()}
                    </div>
                  </div>
                </div>

                {/* Header Desktop y Tablet (≥ 768px) */}
                <div className="hidden lg:flex justify-between items-center mb-6 pb-4 border-b border-slate-200">
                  <div>
                    <h1 className="text-2xl font-black text-slate-900 tracking-tight">{datosColmado.nombre}</h1>
                    <p className="text-xs text-slate-500 font-medium">{datosColmado.slogan} · Panel de Control</p>
                  </div>
                  <div className="flex items-center gap-3">
                    <NotificationBellButton
                      rol="admin"
                      onClick={() => { vibrate(); setIsNotificationModalOpen(true); }}
                      className="bg-white hover:bg-slate-100 text-slate-700 border-slate-200 shadow-2xs"
                    />
                    <div className="flex items-center gap-2.5 bg-white px-3.5 py-1.5 rounded-2xl border border-slate-200 shadow-2xs hover:border-slate-300 transition">
                      <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-blue-600 to-indigo-700 text-white font-black text-xs flex items-center justify-center shadow-xs">
                        {datosColmado.nombre.charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <div className="text-xs font-bold text-slate-900 leading-tight">Colmadero</div>
                        <div className="text-[10px] text-emerald-600 font-bold flex items-center gap-1">
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                          En Línea
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Banner when using demo data */}
                {!store.isGoogleSheetConnected() && !dismissDemoBanner && (
                  <div
                    onClick={() => { vibrate(); setIsSheetsConfigOpen(true); }}
                    className="bg-amber-400/20 hover:bg-amber-400/30 border border-amber-300/40 rounded-2xl p-3 flex items-center justify-between text-amber-900 text-xs cursor-pointer transition backdrop-blur-xs"
                  >
                    <div className="flex items-center gap-2.5 min-w-0 pr-2">
                      <Database className="w-4 h-4 text-amber-600 shrink-0" />
                      <span className="font-semibold text-[11px] text-amber-900 truncate sm:whitespace-normal">
                        Viendo datos de prueba. Toca aquí para sincronizar tu Google Sheet.
                      </span>
                    </div>
                    <div className="flex items-center gap-1.5 shrink-0">
                      <ChevronRight className="w-4 h-4 text-amber-700" />
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          setDismissDemoBanner(true);
                          localStorage.setItem('colmado_dismiss_demo_banner', 'true');
                        }}
                        className="w-6 h-6 rounded-full hover:bg-amber-200/50 flex items-center justify-center text-amber-800 transition"
                        title="Cerrar aviso"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                )}

                {/* Banner de Permiso de Notificaciones Push */}
                <NotificationPermissionBanner rol="admin" />

                {/* KPIs dashboard: grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 */}
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
                  {/* Card 1: Total Por Cobrar */}
                  <div className="bg-white text-slate-800 rounded-3xl p-4 sm:p-5 shadow-xs border border-slate-200/80 flex flex-col justify-between min-w-0">
                    <div className="flex items-center justify-between text-[11px] sm:text-xs text-slate-500 font-bold uppercase tracking-wider mb-2">
                      <span className="truncate">Total por cobrar</span>
                      <span className="w-7 h-7 sm:w-8 sm:h-8 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
                        <DollarSign className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                      </span>
                    </div>
                    <div className="min-w-0">
                      <div className="text-lg sm:text-2xl xl:text-3xl font-black text-slate-900 tracking-tight truncate" title={formatoMoneda(adminTotalCobrar)}>
                        {formatoMoneda(adminTotalCobrar)}
                      </div>
                      <div className="text-[10px] sm:text-[11px] text-blue-600 font-bold mt-1 truncate">
                        {adminClientes.filter(c => c.saldo > 0).length} clientes con deuda
                      </div>
                    </div>
                  </div>

                  {/* Card 2: Deudores Activos */}
                  <div className="bg-white rounded-3xl p-4 sm:p-5 shadow-xs border border-slate-200/80 flex flex-col justify-between min-w-0">
                    <div className="flex items-center justify-between text-[11px] sm:text-xs text-slate-500 font-bold uppercase tracking-wider mb-2">
                      <span className="truncate">Deudores Activos</span>
                      <span className="w-7 h-7 sm:w-8 sm:h-8 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center shrink-0">
                        <Users className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                      </span>
                    </div>
                    <div className="min-w-0">
                      <div className="text-lg sm:text-2xl xl:text-3xl font-black text-slate-900 tracking-tight truncate">
                        {adminClientes.filter(c => c.saldo > 0).length}
                      </div>
                      <div className="text-[10px] sm:text-[11px] text-slate-500 font-medium mt-1 truncate">
                        de {adminClientes.length} registrados
                      </div>
                    </div>
                  </div>

                  {/* Card 3: Fiados Hoy */}
                  <div className="bg-white rounded-3xl p-4 sm:p-5 shadow-xs border border-slate-200/80 flex flex-col justify-between min-w-0">
                    <div className="flex items-center justify-between text-[11px] sm:text-xs text-slate-500 font-bold uppercase tracking-wider mb-2">
                      <span className="truncate">Fiados de Hoy</span>
                      <span className="w-7 h-7 sm:w-8 sm:h-8 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center shrink-0">
                        <ShoppingBag className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                      </span>
                    </div>
                    <div className="min-w-0">
                      <div className="text-lg sm:text-2xl xl:text-3xl font-black text-slate-900 tracking-tight truncate">
                        {adminHoyFiados}
                      </div>
                      <div className="text-[10px] sm:text-[11px] text-amber-600 font-bold mt-1 truncate">
                        Compras hoy
                      </div>
                    </div>
                  </div>

                  {/* Card 4: Abonos Hoy */}
                  <div className="bg-white rounded-3xl p-4 sm:p-5 shadow-xs border border-slate-200/80 flex flex-col justify-between min-w-0">
                    <div className="flex items-center justify-between text-[11px] sm:text-xs text-slate-500 font-bold uppercase tracking-wider mb-2">
                      <span className="truncate">Abonos de Hoy</span>
                      <span className="w-7 h-7 sm:w-8 sm:h-8 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
                        <ArrowDownLeft className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                      </span>
                    </div>
                    <div className="min-w-0">
                      <div className="text-lg sm:text-2xl xl:text-3xl font-black text-slate-900 tracking-tight truncate">
                        {adminHoyAbonos}
                      </div>
                      <div className="text-[10px] sm:text-[11px] text-emerald-600 font-bold mt-1 truncate">
                        Cobros hoy
                      </div>
                    </div>
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
                      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 gap-4 w-full">
                        {clientesCobroHoyConDeuda.map(c => (
                          <div
                            key={c.id}
                            role="button"
                            tabIndex={0}
                            data-action="open-detail"
                            onClick={() => openClientDetail(c)}
                            onKeyDown={(e) => {
                              if (e.key === 'Enter' || e.key === ' ') {
                                e.preventDefault();
                                openClientDetail(c);
                              }
                            }}
                            className="cliente-card w-full bg-white text-slate-800 p-4 rounded-2xl flex flex-col justify-between gap-3 cursor-pointer hover:shadow-md transition active:scale-98 shadow-xs border border-red-200 select-none touch-manipulation"
                          >
                            {/* Nivel Superior: Avatar, Nombre/Tel a la izq; Balance a la der */}
                            <div className="flex items-start justify-between gap-2.5">
                              <div className="flex items-center gap-2.5 min-w-0">
                                <div className="w-10 h-10 rounded-xl bg-red-600 text-white font-black text-sm flex items-center justify-center shrink-0 shadow-xs">
                                  {c.nombre.charAt(0).toUpperCase()}
                                </div>
                                <div className="min-w-0">
                                  <div className="font-extrabold text-xs sm:text-sm text-slate-900 truncate">{c.nombre}</div>
                                  <div className="flex items-center gap-1.5 flex-wrap mt-0.5">
                                    <span className="text-[11px] text-slate-500 truncate">{c.telefono}</span>
                                    <span className="font-mono text-[9px] text-blue-700 bg-blue-50 px-1.5 py-0.5 rounded font-bold border border-blue-200/60">
                                      {c.numeroCuenta || generarNumeroCuentaCliente(c.id)}
                                    </span>
                                  </div>
                                </div>
                              </div>
                              <div className="text-right shrink-0">
                                <div className="font-black text-xs sm:text-sm text-red-600">{formatoMoneda(c.saldo)}</div>
                                <div className="text-[10px] text-red-500 font-extrabold uppercase flex items-center gap-0.5 justify-end">
                                  <Bell className="w-2.5 h-2.5" /> Paga hoy
                                </div>
                              </div>
                            </div>

                            {/* Nivel Inferior: Días de pago a la izq; Botón WhatsApp a la der */}
                            <div className="flex items-center justify-between gap-2 pt-2 border-t border-slate-100">
                              <span className="text-[10px] font-bold text-slate-500 bg-slate-100 px-2 py-0.5 rounded-lg">
                                Días: {c.diasPago}
                              </span>
                              <WhatsAppIconButton
                                cliente={c}
                                nombreColmado={datosColmado.nombre}
                                pagaHoy={true}
                                size="sm"
                                onOpenModal={(cli) => {
                                  vibrate(15);
                                  setWhatsAppModalCliente(cli as ClienteCalculado);
                                }}
                              />
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Reportes/charts: grid-cols-1 md:grid-cols-2 gap-6 */}
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 min-w-0">
                    <TopDebtorsChart
                      clientes={adminClientes}
                      onSelectClient={(c) => openClientDetail(c)}
                    />

                    {/* Resumen de Cartera y Cobranzas */}
                    <div className="bg-white rounded-3xl p-5 border border-slate-200/80 shadow-sm flex flex-col justify-between">
                      <div>
                        <div className="flex items-center justify-between mb-4">
                          <div className="flex items-center gap-2">
                            <span className="w-8 h-8 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center font-bold">
                              <DollarSign className="w-4 h-4" />
                            </span>
                            <div>
                              <h3 className="font-extrabold text-sm text-slate-900 leading-tight">Estado de la Cartera</h3>
                              <p className="text-[11px] text-slate-500">Métricas clave de recuperación</p>
                            </div>
                          </div>
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-blue-100 text-blue-700">
                            {adminClientes.length} Clientes
                          </span>
                        </div>

                        <div className="space-y-3">
                          <div>
                            <div className="flex justify-between text-xs font-bold text-slate-600 mb-1">
                              <span>Clientes con Deuda ({adminClientes.filter(c => c.saldo > 0).length})</span>
                              <span className="text-red-600">
                                {Math.round((adminClientes.filter(c => c.saldo > 0).length / (adminClientes.length || 1)) * 100)}%
                              </span>
                            </div>
                            <div className="progress-track">
                              <div
                                className="progress-fill warn"
                                style={{
                                  width: `${(adminClientes.filter(c => c.saldo > 0).length / (adminClientes.length || 1)) * 100}%`
                                }}
                              />
                            </div>
                          </div>

                          <div>
                            <div className="flex justify-between text-xs font-bold text-slate-600 mb-1">
                              <span>Clientes al Día ({adminAlDiaPago})</span>
                              <span className="text-emerald-600">
                                {Math.round((adminAlDiaPago / (adminClientes.length || 1)) * 100)}%
                              </span>
                            </div>
                            <div className="progress-track">
                              <div
                                className="progress-fill ok"
                                style={{
                                  width: `${(adminAlDiaPago / (adminClientes.length || 1)) * 100}%`
                                }}
                              />
                            </div>
                          </div>
                        </div>

                        <div className="grid grid-cols-2 gap-3 mt-4 pt-4 border-t border-slate-100">
                          <div className="bg-slate-50 p-3 rounded-2xl">
                            <div className="text-[10px] font-bold text-slate-400 uppercase">Promedio por Deudor</div>
                            <div className="text-sm font-black text-slate-800 mt-0.5">
                              {formatoMoneda(
                                adminTotalCobrar / (adminClientes.filter(c => c.saldo > 0).length || 1)
                              )}
                            </div>
                          </div>
                          <div className="bg-slate-50 p-3 rounded-2xl">
                            <div className="text-[10px] font-bold text-slate-400 uppercase">Cobro Hoy (Día {diaHoyNumero})</div>
                            <div className="text-sm font-black text-blue-700 mt-0.5">
                              {clientesCobroHoyConDeuda.length} pendientes
                            </div>
                          </div>
                        </div>
                      </div>

                      <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
                        <span className="text-slate-500 font-medium">Ciclo principal de cobros:</span>
                        <span className="font-bold text-slate-800">Días 15 y 30 de cada mes</span>
                      </div>
                    </div>
                  </div>

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

                    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 gap-4 w-full">
                      {adminClientes.filter(c => c.saldo > 0).slice(0, 4).map((c, i) => {
                        const pagaHoy = esDiaDePagoHoy(c.diasPago);
                        return (
                          <div
                            key={c.id}
                            role="button"
                            tabIndex={0}
                            data-action="open-detail"
                            onClick={() => openClientDetail(c)}
                            onKeyDown={(e) => {
                              if (e.key === 'Enter' || e.key === ' ') {
                                e.preventDefault();
                                openClientDetail(c);
                              }
                            }}
                            className={`cliente-card w-full p-4 rounded-2xl flex flex-col justify-between gap-3 cursor-pointer hover:shadow-md transition active:scale-98 select-none touch-manipulation ${
                              pagaHoy && c.saldo > 0
                                ? 'bg-red-50/50 border-2 border-red-400/80 shadow-xs ring-1 ring-red-400/30'
                                : 'bg-white border border-slate-100 shadow-xs'
                            }`}
                          >
                            {/* Nivel Superior: Avatar, Nombre/Tel a la izq; Balance a la der */}
                            <div className="flex items-start justify-between gap-2.5">
                              <div className="flex items-center gap-2.5 min-w-0">
                                <div className={`w-10 h-10 rounded-xl font-bold flex items-center justify-center shrink-0 ${
                                  pagaHoy && c.saldo > 0
                                    ? 'bg-red-600 text-white shadow-sm'
                                    : 'bg-gradient-to-br from-blue-600 to-indigo-700 text-white'
                                }`}>
                                  {c.nombre.charAt(0).toUpperCase()}
                                </div>
                                <div className="min-w-0">
                                  <div className="font-bold text-xs sm:text-sm text-slate-900 truncate">{c.nombre}</div>
                                  <div className="flex items-center gap-1.5 flex-wrap mt-0.5">
                                    <span className="text-[11px] text-slate-500 truncate">{c.telefono}</span>
                                    <span className="font-mono text-[9px] text-blue-700 bg-blue-50 px-1.5 py-0.5 rounded font-bold border border-blue-200/60">
                                      {c.numeroCuenta || generarNumeroCuentaCliente(c.id)}
                                    </span>
                                  </div>
                                </div>
                              </div>
                              <div className="text-right shrink-0">
                                <div className="font-black text-xs sm:text-sm text-red-600">{formatoMoneda(c.saldo)}</div>
                                <div className="text-[10px] text-slate-400">
                                  {pagaHoy ? 'Cobrar hoy' : 'Deuda'}
                                </div>
                              </div>
                            </div>

                            {/* Nivel Inferior: Badges a la izq; WhatsApp a la der */}
                            <div className="flex items-center justify-between gap-2 pt-2 border-t border-slate-100">
                              <div className="flex flex-wrap gap-1 min-w-0">
                                {pagaHoy && c.saldo > 0 && (
                                  <span className="text-[9px] bg-red-600 text-white px-2 py-0.5 rounded-full font-black flex items-center gap-1 shadow-xs animate-pulse">
                                    <Bell className="w-2.5 h-2.5 text-yellow-300" />
                                    PAGA HOY
                                  </span>
                                )}
                                {c.alLimite && (
                                  <span className="text-[9px] bg-red-100 text-red-700 px-2 py-0.5 rounded-full font-bold">
                                    Al Límite
                                  </span>
                                )}
                              </div>
                              <WhatsAppIconButton
                                cliente={c}
                                nombreColmado={datosColmado.nombre}
                                pagaHoy={pagaHoy}
                                size="sm"
                                onOpenModal={(cli) => {
                                  vibrate(15);
                                  setWhatsAppModalCliente(cli as ClienteCalculado);
                                }}
                              />
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

                    <div className="divide-y divide-slate-100 md:divide-y-0 grid grid-cols-1 md:grid-cols-3 gap-3 text-xs text-slate-600 pt-1">
                      <div className="py-2 md:p-3 md:bg-slate-50 md:rounded-2xl flex items-start gap-2.5">
                        <MapPin className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                        <div>
                          <span className="font-bold text-slate-700 block text-[11px]">Dirección:</span>
                          <span className="text-slate-600">{datosColmado.direccion}</span>
                        </div>
                      </div>

                      <div className="py-2 md:p-3 md:bg-slate-50 md:rounded-2xl flex items-center justify-between">
                        <div className="flex items-center gap-2.5">
                          <Clock className="w-4 h-4 text-blue-600 shrink-0" />
                          <div>
                            <span className="font-bold text-slate-700 block text-[11px]">Horario:</span>
                            <span className="text-slate-600">{datosColmado.horario} ({datosColmado.diasAtencion})</span>
                          </div>
                        </div>
                      </div>

                      <div className="py-2 md:p-3 md:bg-slate-50 md:rounded-2xl flex items-center justify-between">
                        <div className="flex items-center gap-2.5">
                          <Phone className="w-4 h-4 text-amber-600 shrink-0" />
                          <div>
                            <span className="font-bold text-slate-700 block text-[11px]">Teléfono & WhatsApp:</span>
                            <span className="text-slate-600">{datosColmado.telefono}</span>
                          </div>
                        </div>
                        {datosColmado.rnc && (
                          <span className="text-[10px] bg-slate-200 text-slate-700 px-2 py-0.5 rounded-md font-mono">
                            RNC: {datosColmado.rnc}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
            )}

            {/* TAB CLIENTES */}
            {adminTab === 'clientes' && (
              <div>
                {/* Header Móvil (< 768px) */}
                <div className="lg:hidden header-gradient p-6 rounded-b-3xl text-white mb-4">
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

                </div>

                {/* Header Desktop y Tablet (≥ 768px) */}
                <div className="hidden lg:block mb-6">
                  <div className="flex items-center justify-between pb-4 border-b border-slate-200">
                    <div>
                      <h1 className="text-2xl font-black text-slate-900 tracking-tight">Directorio de Clientes</h1>
                      <p className="text-xs text-slate-500 font-medium">Gestión de cuentas, límites y fiados</p>
                    </div>
                    <button
                      onClick={() => { vibrate(); setCurrentView('admin-crear-cliente'); }}
                      className="py-2.5 px-4 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold text-xs flex items-center justify-center gap-2 shadow-sm transition active:scale-95 shrink-0"
                    >
                      <PlusCircle className="w-4 h-4" />
                      <span>Agregar Nuevo Cliente</span>
                    </button>
                  </div>
                </div>

                {/* Scanner / Búsqueda: una sola instancia para todos los tamaños */}
                <div className="mb-4 bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs">
                  <ClientSearchScanner
                    clientes={adminClientes}
                    activeMode={clienteSearchModo}
                    onChangeMode={setClienteSearchModo}
                    searchQuery={clienteSearch}
                    onSearchChange={setClienteSearch}
                    onClientDetected={(cliente, method) => {
                      vibrate(25);
                      showToast(
                        method === 'nfc' ? 'Cliente Identificado por NFC' : 'Cliente Identificado por QR',
                        `Bienvenido ${cliente.nombre}. Abriendo detalle...`,
                        'success'
                      );
                      openClientDetail(cliente);
                    }}
                  />
                </div>

                <div className="px-1 sm:px-0 space-y-3">
                  <button
                    onClick={() => { vibrate(); setCurrentView('admin-crear-cliente'); }}
                    className="lg:hidden w-full py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-2xl font-bold text-xs flex items-center justify-center gap-2 shadow-md transition"
                  >
                    <PlusCircle className="w-4 h-4" />
                    Agregar Nuevo Cliente
                  </button>

                  {/* Filters */}
                  <div className="bg-slate-200/70 p-1 rounded-2xl flex gap-1 w-full max-w-md sm:max-w-lg md:max-w-xl">
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

                  {/* Clientes List (Grid balanceado con estructura en 2 niveles) */}
                  <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 gap-4 w-full">
                    {filteredClientes.map(c => {
                      const pagaHoy = esDiaDePagoHoy(c.diasPago);
                      return (
                        <div
                          key={c.id}
                          role="button"
                          tabIndex={0}
                          data-action="open-detail"
                          onClick={() => openClientDetail(c)}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter' || e.key === ' ') {
                              e.preventDefault();
                              openClientDetail(c);
                            }
                          }}
                          className={`cliente-card w-full p-4 rounded-2xl flex flex-col justify-between gap-3 cursor-pointer hover:shadow-md transition active:scale-[0.99] select-none touch-manipulation ${
                            pagaHoy && c.saldo > 0
                              ? 'bg-red-50/40 border-2 border-red-300 shadow-xs'
                              : 'bg-white border border-slate-200/80 shadow-xs hover:border-slate-300'
                          }`}
                        >
                          {/* Nivel Superior: Avatar con inicial, Nombre y Teléfono a la izquierda; Balance pendiente (RD$) y estado a la derecha */}
                          <div className="flex items-start justify-between gap-2">
                            <div className="flex items-center gap-2 min-w-0 flex-1">
                              <div className={`w-11 h-11 rounded-2xl font-black text-base flex items-center justify-center shrink-0 shadow-xs ${
                                pagaHoy && c.saldo > 0
                                  ? 'bg-red-600 text-white'
                                  : 'bg-gradient-to-br from-blue-600 to-indigo-700 text-white'
                              }`}>
                                {c.nombre.charAt(0).toUpperCase()}
                              </div>
                              <div className="min-w-0 flex-1 whitespace-nowrap truncate">
                                <h4 className="font-extrabold text-sm sm:text-base text-slate-900 leading-tight whitespace-nowrap truncate">
                                  {c.nombre}
                                </h4>
                                <div className="flex items-center gap-2 flex-nowrap mt-0.5 overflow-hidden whitespace-nowrap">
                                  <p className="text-xs text-slate-500 font-medium flex items-center gap-1 shrink-0 whitespace-nowrap truncate">
                                    <Phone className="w-3 h-3 text-slate-400 shrink-0" />
                                    <span className="whitespace-nowrap truncate">{c.telefono}</span>
                                  </p>
                                  <span className="font-mono text-[9px] text-blue-700 bg-blue-50 px-1.5 py-0.5 rounded font-bold border border-blue-200/60 whitespace-nowrap shrink-0">
                                    {c.numeroCuenta || generarNumeroCuentaCliente(c.id)}
                                  </span>
                                </div>
                              </div>
                            </div>

                            <div className="text-right shrink-0 whitespace-nowrap">
                              <div className={`font-black text-base sm:text-lg tracking-tight whitespace-nowrap ${c.saldo > 0 ? 'text-red-600' : 'text-emerald-600'}`}>
                                {formatoMoneda(c.saldo)}
                              </div>
                              <div className="text-[11px] text-slate-400 font-medium whitespace-nowrap">
                                {pagaHoy ? 'Cobrar hoy' : (c.saldo > 0 ? 'Deuda' : 'Al día')}
                              </div>
                            </div>
                          </div>

                          {/* Nivel Inferior: Límite acordado y etiquetas a la izquierda; botones de acción rápida a la derecha */}
                          <div className="flex items-center justify-between gap-2 pt-2.5 border-t border-slate-100">
                            <div className="flex items-center gap-2 min-w-0 flex-nowrap overflow-x-auto no-scrollbar py-0.5 whitespace-nowrap">
                              <span className="text-[11px] font-semibold text-slate-500 bg-slate-100 px-2 py-0.5 rounded-lg shrink-0 whitespace-nowrap">
                                Lím: {formatoMoneda(c.limite)}
                              </span>
                              {pagaHoy && c.saldo > 0 && (
                                <span className="text-[10px] bg-red-600 text-white px-2.5 py-0.5 rounded-full font-black inline-flex items-center gap-1 shadow-xs shrink-0 whitespace-nowrap">
                                  <Bell className="w-2.5 h-2.5 text-yellow-300 shrink-0" />
                                  PAGA HOY (Día {diaHoyNumero})
                                </span>
                              )}
                              {pagaHoy && c.saldo <= 0 && (
                                <span className="text-[10px] bg-blue-100 text-blue-700 px-2.5 py-0.5 rounded-full font-bold inline-flex items-center gap-1 shrink-0 whitespace-nowrap">
                                  <Calendar className="w-2.5 h-2.5 shrink-0" />
                                  Al día
                                </span>
                              )}
                              {c.alLimite && (
                                <span className="text-[10px] bg-red-100 text-red-700 px-2 py-0.5 rounded-full font-bold shrink-0 whitespace-nowrap">
                                  Al Límite
                                </span>
                              )}
                              {c.nfcUid && (
                                <span className="text-[10px] bg-indigo-100 text-indigo-700 px-1.5 py-0.5 rounded-full font-bold inline-flex items-center gap-1 shrink-0 whitespace-nowrap">
                                  <Wifi className="w-2.5 h-2.5 shrink-0" />
                                  NFC
                                </span>
                              )}
                            </div>

                            <div className="flex items-center gap-2 shrink-0 whitespace-nowrap">
                              {c.saldo > 0 && (
                                <WhatsAppIconButton
                                  cliente={c}
                                  nombreColmado={datosColmado.nombre}
                                  pagaHoy={pagaHoy}
                                  size="sm"
                                  onOpenModal={(cli) => {
                                    vibrate(15);
                                    setWhatsAppModalCliente(cli as ClienteCalculado);
                                  }}
                                />
                              )}
                              <button
                                type="button"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  vibrate(10);
                                  setActiveNfcModalCliente(c);
                                }}
                                className={`w-8 h-8 rounded-xl flex items-center justify-center transition border ${
                                  c.nfcUid
                                    ? 'bg-indigo-50 border-indigo-200 text-indigo-700 hover:bg-indigo-100 shadow-2xs'
                                    : 'bg-slate-50 border-slate-200 text-slate-500 hover:bg-indigo-50 hover:text-indigo-600'
                                }`}
                                title={c.nfcUid ? `NFC: ${c.nfcUid}` : 'Vincular tarjeta NFC'}
                              >
                                <Wifi className="w-3.5 h-3.5" />
                              </button>

                              <button
                                type="button"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  vibrate(10);
                                  setActiveQrModalCliente(c);
                                }}
                                className="w-8 h-8 rounded-xl bg-blue-50/70 border border-blue-200 text-blue-600 hover:bg-blue-100 flex items-center justify-center transition shadow-2xs"
                                title="Ver código QR personal"
                              >
                                <QrCode className="w-3.5 h-3.5" />
                              </button>

                              <div className="w-6 h-6 flex items-center justify-center text-slate-300">
                                <ChevronRight className="w-4 h-4" />
                              </div>
                            </div>
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
                {/* Header Móvil (< 768px) */}
                <div className="lg:hidden header-gradient p-6 rounded-b-3xl text-white mb-4">
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

                {/* Header Desktop y Tablet (≥ 768px) */}
                <div className="hidden lg:block mb-6 pb-4 border-b border-slate-200">
                  <h1 className="text-2xl font-black text-slate-900 tracking-tight">Historial General</h1>
                  <p className="text-xs text-slate-500 font-medium">Registro de fiados y abonos del colmado con filtros y exportación en PDF</p>
                </div>

                <div className="px-1 sm:px-0 space-y-3">
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

                    {/* Selector de Rango de Fechas */}
                    <DateRangePicker
                      range={adminDateRange}
                      onChange={setAdminDateRange}
                      totalFilteredCount={filteredAdminHistorial.length}
                      totalUnfilteredCount={adminHistorial.length}
                    />

                    <div className="grid grid-cols-2 gap-2">
                      <button
                        type="button"
                        onClick={() => {
                          vibrate(15);
                          const fiados = filteredAdminHistorial.filter(m => m.tipo === 'Fiado');
                          if (fiados.length === 0) {
                            showToast('Sin gastos', 'No hay compras/fiados registrados en el periodo seleccionado', 'warning');
                            return;
                          }
                          generarGastosQuincenaPDF(filteredAdminHistorial);
                          showToast('PDF Quincena', 'Descargando reporte de gastos del periodo...', 'success');
                        }}
                        className="py-2.5 px-3 bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-700 hover:to-orange-700 text-white rounded-2xl font-bold text-xs flex items-center justify-center gap-1.5 shadow-sm transition active:scale-95"
                        title="Descargar PDF con gastos del periodo"
                      >
                        <FileText className="w-3.5 h-3.5" />
                        <span>Gastos Periodo (PDF)</span>
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
                            role="button"
                            tabIndex={0}
                            data-action="view-receipt"
                            onClick={() => setActiveReceipt(m)}
                            onKeyDown={(e) => {
                              if (e.key === 'Enter' || e.key === ' ') {
                                e.preventDefault();
                                setActiveReceipt(m);
                              }
                            }}
                            className="historial-item p-4 flex items-center justify-between cursor-pointer hover:bg-slate-50 transition active:scale-98 select-none touch-manipulation"
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
            </main>

            {/* Bottom Navigation (solo móvil y tablet < 1024px) */}
            <nav className="bottom-nav">
              <button
                type="button"
                data-nav-tab="inicio"
                onTouchStart={(e) => { e.stopPropagation(); vibrate(10); setAdminTab('inicio'); }}
                onClick={() => { vibrate(10); setAdminTab('inicio'); }}
                className={`nav-item touch-manipulation cursor-pointer ${adminTab === 'inicio' ? 'active' : ''}`}
              >
                <Home className="w-5 h-5 mb-0.5" />
                <span>Inicio</span>
              </button>

              <button
                type="button"
                data-nav-tab="clientes"
                onTouchStart={(e) => { e.stopPropagation(); vibrate(10); setAdminTab('clientes'); }}
                onClick={() => { vibrate(10); setAdminTab('clientes'); }}
                className={`nav-item touch-manipulation cursor-pointer ${adminTab === 'clientes' ? 'active' : ''}`}
              >
                <Users className="w-5 h-5 mb-0.5" />
                <span>Clientes</span>
              </button>

              <button
                type="button"
                onClick={() => { vibrate(); setCurrentView('admin-fiado'); }}
                className="w-12 h-12 -mt-5 bg-gradient-to-r from-blue-600 to-indigo-700 text-white rounded-full flex items-center justify-center shadow-lg shadow-blue-300 hover:scale-105 active:scale-95 transition touch-manipulation cursor-pointer shrink-0"
                title="Registrar Fiado"
              >
                <PlusCircle className="w-6 h-6" />
              </button>

              <button
                type="button"
                data-nav-tab="historial"
                onTouchStart={(e) => { e.stopPropagation(); vibrate(10); setAdminTab('historial'); }}
                onClick={() => { vibrate(10); setAdminTab('historial'); }}
                className={`nav-item touch-manipulation cursor-pointer ${adminTab === 'historial' ? 'active' : ''}`}
              >
                <Clock className="w-5 h-5 mb-0.5" />
                <span>Historial</span>
              </button>

              <button
                type="button"
                onClick={() => { vibrate(); setCurrentView('admin-auditoria'); }}
                className="nav-item touch-manipulation cursor-pointer"
              >
                <Shield className="w-5 h-5 mb-0.5" />
                <span>Auditoría</span>
              </button>
            </nav>

            {/* Botones flotantes de acción (solo desktop ≥ 1024px) */}
            <div className="hidden lg:flex fixed bottom-8 right-8 z-40 gap-3">
              <button
                onClick={() => { vibrate(); setCurrentView('admin-fiado'); }}
                className="py-3 px-5 bg-blue-600 hover:bg-blue-700 text-white font-extrabold text-xs rounded-2xl flex items-center gap-2 shadow-xl shadow-blue-600/30 active:scale-95 transition"
              >
                <PlusCircle className="w-4 h-4" />
                <span>+ Registrar Fiado</span>
              </button>
              <button
                onClick={() => { vibrate(); setCurrentView('admin-abono'); }}
                className="py-3 px-5 bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-xs rounded-2xl flex items-center gap-2 shadow-xl shadow-emerald-600/30 active:scale-95 transition"
              >
                <ArrowDownLeft className="w-4 h-4" />
                <span>+ Registrar Abono</span>
              </button>
            </div>
          </div>
        )}

        {/* ======================================================== */}
        {/* 4. ADMIN DETALLE CLIENTE */}
        {/* ======================================================== */}
        {currentView === 'admin-detalle-cliente' && selectedClientDetail && (
          <div className="flex-1 bg-slate-50 min-h-[100dvh] pb-28 relative">
            {/* Header */}
            <div className="header-gradient p-6 pb-14 rounded-b-3xl text-white relative">
              <div className="w-full px-4 sm:px-6 lg:px-8 xl:px-10 flex items-center justify-between">
                <button
                  onClick={() => setCurrentView('admin-dashboard')}
                  className="w-10 h-10 rounded-full bg-white/20 hover:bg-white/30 flex items-center justify-center transition active:scale-95"
                >
                  <ArrowLeft className="w-5 h-5 text-white" />
                </button>
                <div className="text-center">
                  <h2 className="text-xl font-black">Detalle del Cliente</h2>
                  <p className="text-xs text-blue-200">Ficha comercial y estado de cuenta</p>
                </div>
                <div className="w-10" />
              </div>
            </div>

            {/* Contenedor principal con Grid de 12 Columnas (Ancho fluido completo) */}
            <div className="w-full px-4 sm:px-6 lg:px-8 xl:px-10 -mt-8 relative z-10 pb-6">
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">

                {/* ======================================================== */}
                {/* COLUMNA IZQUIERDA: lg:col-span-4 xl:col-span-3 */}
                {/* ======================================================== */}
                <div className="lg:col-span-4 xl:col-span-3 space-y-4">
                  <div className="bg-white rounded-3xl p-5 border border-slate-100 shadow-md">
                    <div className="flex items-center gap-4 mb-4">
                      <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-blue-600 to-indigo-700 text-white font-black text-2xl flex items-center justify-center shadow-md">
                        {selectedClientDetail.nombre.charAt(0).toUpperCase()}
                      </div>
                      <div className="min-w-0 flex-1">
                        <h3 className="font-black text-lg text-slate-900 leading-tight">{selectedClientDetail.nombre}</h3>
                        <p className="text-xs text-slate-500 mt-0.5 flex items-center gap-1">
                          <Phone className="w-3 h-3 text-slate-400" />
                          <span>{selectedClientDetail.telefono}</span>
                        </p>
                        <div className="mt-1 flex items-center gap-1.5 flex-wrap">
                          <span className={`inline-flex items-center text-[10px] font-extrabold px-2 py-0.5 rounded-full ${
                            selectedClientDetail.saldo > 0
                              ? 'bg-red-50 text-red-600 border border-red-200'
                              : 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                          }`}>
                            {selectedClientDetail.saldo > 0 ? 'Con Deuda' : 'Al Día'}
                          </span>
                          {selectedClientDetail.bloqueada && (
                            <span className="inline-flex items-center text-[10px] font-extrabold px-2 py-0.5 rounded-full bg-slate-100 text-slate-600 border border-slate-300">
                              Bloqueado
                            </span>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Botón limpio para abrir Modal de WhatsApp */}
                    <div className="mb-4">
                      <button
                        type="button"
                        onClick={() => {
                          vibrate(15);
                          setWhatsAppModalCliente(selectedClientDetail);
                        }}
                        className="w-full py-2.5 px-3.5 bg-gradient-to-r from-emerald-50 to-teal-50 hover:from-emerald-100 hover:to-teal-100 border border-emerald-200/90 rounded-2xl flex items-center justify-between text-left transition active:scale-98 shadow-2xs group"
                      >
                        <div className="flex items-center gap-2.5 min-w-0">
                          <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-[#25D366] to-[#128C7E] text-white flex items-center justify-center shadow-xs shrink-0 group-hover:scale-105 transition-transform">
                            <WhatsAppIcon className="w-4 h-4" />
                          </div>
                          <div className="min-w-0">
                            <div className="text-xs font-black text-slate-800 leading-tight">Recordatorio por WhatsApp</div>
                            <div className="text-[10px] text-slate-500 font-medium">Ver mensaje y enviar cobro</div>
                          </div>
                        </div>
                        <div className="flex items-center gap-1.5 shrink-0">
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800">
                            Abrir
                          </span>
                          <ChevronRight className="w-4 h-4 text-emerald-600 group-hover:translate-x-0.5 transition-transform" />
                        </div>
                      </button>
                    </div>

                    {/* Metrics */}
                    <div className="divide-y divide-slate-100 text-xs">
                      <div className="flex justify-between items-center py-2.5">
                        <span className="text-slate-500 font-bold uppercase tracking-wider">No. de Cuenta</span>
                        <span className="font-mono font-bold text-blue-700 bg-blue-50 px-2 py-0.5 rounded-lg border border-blue-200/80">
                          {selectedClientDetail.numeroCuenta || generarNumeroCuentaCliente(selectedClientDetail.id)}
                        </span>
                      </div>

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
                          ¡Hoy es su día de pago (Día {diaHoyNumero})!
                        </span>
                        <span className="text-[10px] bg-red-600 text-white px-2 py-0.5 rounded-full uppercase">
                          {selectedClientDetail.saldo > 0 ? 'Cobrar hoy' : 'Al día'}
                        </span>
                      </div>
                    )}

                    {/* Botones de Identificación Rápida: QR y NFC */}
                    <div className="grid grid-cols-2 gap-2 mt-3 pt-3 border-t border-slate-100">
                      <button
                        type="button"
                        onClick={() => {
                          vibrate(10);
                          setActiveQrModalCliente(selectedClientDetail);
                        }}
                        className="py-2.5 px-3 bg-blue-50 hover:bg-blue-100 text-blue-700 border border-blue-200 rounded-xl font-bold text-xs flex items-center justify-center gap-1.5 transition active:scale-95"
                        title="Ver código QR personal del cliente"
                      >
                        <QrCode className="w-4 h-4 text-blue-600" />
                        <span>Código QR</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => {
                          vibrate(10);
                          setActiveNfcModalCliente(selectedClientDetail);
                        }}
                        className={`py-2.5 px-3 rounded-xl font-bold text-xs flex items-center justify-center gap-1.5 transition active:scale-95 border ${
                          selectedClientDetail.nfcUid
                            ? 'bg-indigo-50 hover:bg-indigo-100 text-indigo-700 border-indigo-200'
                            : 'bg-slate-100 hover:bg-indigo-50 text-slate-700 hover:text-indigo-700 border-slate-200'
                        }`}
                        title="Asociar o gestionar tarjeta/llavero NFC del cliente"
                      >
                        <Wifi className="w-4 h-4 text-indigo-600" />
                        <span>{selectedClientDetail.nfcUid ? 'NFC Vinculado' : 'Asociar NFC'}</span>
                      </button>
                    </div>

                    {selectedClientDetail.nfcUid && (
                      <div className="mt-1.5 text-[11px] text-indigo-700 bg-indigo-50/80 border border-indigo-100 rounded-xl px-2.5 py-1 flex items-center justify-between">
                        <span className="font-medium flex items-center gap-1">
                          <Wifi className="w-3 h-3 text-indigo-600" /> Tag NFC Vinculado:
                        </span>
                        <span className="font-mono font-bold tracking-wider">{selectedClientDetail.nfcUid}</span>
                      </div>
                    )}

                    <button
                      onClick={() => handleResetPin(selectedClientDetail)}
                      className="mt-2.5 w-full py-2.5 bg-purple-50 hover:bg-purple-100 text-purple-700 font-bold text-xs rounded-xl flex items-center justify-center gap-2 transition"
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
                </div>

                {/* ======================================================== */}
                {/* COLUMNA CENTRAL: lg:col-span-8 xl:col-span-5 */}
                {/* ======================================================== */}
                <div className="lg:col-span-8 xl:col-span-5 space-y-4">
                  {/* Direct Actions */}
                  <div className="grid grid-cols-2 gap-3">
                    <button
                      onClick={() => {
                        setFormFiadoCliente(String(selectedClientDetail.id));
                        setCurrentView('admin-fiado');
                      }}
                      className="py-3.5 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-2xl text-xs flex items-center justify-center gap-2 shadow-sm transition active:scale-95"
                    >
                      <PlusCircle className="w-4 h-4" />
                      Registrar Fiado
                    </button>
                    <button
                      onClick={() => {
                        setFormAbonoCliente(String(selectedClientDetail.id));
                        setCurrentView('admin-abono');
                      }}
                      className="py-3.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-2xl text-xs flex items-center justify-center gap-2 shadow-sm transition active:scale-95"
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

                  {/* Sección dedicada: Tabla completa de Historial de Abonos */}
                  <ClientAbonosTable
                    movimientos={selectedClientHistory}
                    clienteNombre={selectedClientDetail.nombre}
                    clienteTelefono={selectedClientDetail.telefono}
                    onSelectAbono={(abono) => setActiveReceipt(abono)}
                  />

                  {/* Client History */}
                  <div className="bg-white rounded-3xl p-4 border border-slate-100 shadow-xs">
                    <div className="flex flex-col gap-2.5 mb-3">
                      <div className="flex items-center justify-between flex-wrap gap-2">
                        <h4 className="font-bold text-slate-800 text-xs uppercase tracking-wide flex items-center gap-1.5">
                          <Clock className="w-4 h-4 text-blue-600" />
                          <span>Movimientos de este cliente</span>
                        </h4>

                        {/* Selector de Vista: Tarjetas vs Hoja de Cálculo */}
                        <div className="flex items-center gap-1 bg-slate-100 p-0.5 rounded-xl border border-slate-200">
                          <button
                            type="button"
                            onClick={() => {
                              setVistaTablaMovimientos(false);
                              localStorage.setItem('colmado_vista_tabla_movimientos', 'false');
                            }}
                            className={`px-2 py-1 rounded-lg text-[10px] font-bold transition flex items-center gap-1 ${
                              !vistaTablaMovimientos
                                ? 'bg-white text-slate-800 shadow-2xs font-extrabold'
                                : 'text-slate-500 hover:text-slate-700'
                            }`}
                            title="Vista en Tarjetas"
                          >
                            <Clock className="w-3 h-3 text-blue-600" />
                            <span>Tarjetas</span>
                          </button>

                          <button
                            type="button"
                            onClick={() => {
                              setVistaTablaMovimientos(true);
                              localStorage.setItem('colmado_vista_tabla_movimientos', 'true');
                            }}
                            className={`px-2 py-1 rounded-lg text-[10px] font-bold transition flex items-center gap-1 ${
                              vistaTablaMovimientos
                                ? 'bg-emerald-600 text-white shadow-2xs font-extrabold'
                                : 'text-slate-500 hover:text-slate-700'
                            }`}
                            title="Vista en Hoja de Cálculo"
                          >
                            <FileSpreadsheet className="w-3 h-3" />
                            <span>Hoja de Cálculo</span>
                          </button>
                        </div>
                      </div>

                      <div className="flex items-center justify-between bg-slate-50 p-2.5 rounded-2xl border border-slate-100 text-xs flex-wrap gap-2">
                        <span className="font-bold text-slate-600">Fecha de corte:</span>
                        <div className="flex items-center gap-1.5">
                          <input
                            type="date"
                            value={selectedClientDateFiltro}
                            onChange={e => setSelectedClientDateFiltro(e.target.value)}
                            className="bg-white border border-slate-200 rounded-xl px-2.5 py-1 font-bold text-xs text-slate-800 focus:outline-hidden focus:border-blue-600"
                          />
                          {selectedClientDateFiltro && (
                            <button
                              onClick={() => setSelectedClientDateFiltro('')}
                              className="text-[10px] text-blue-600 font-bold hover:underline"
                            >
                              Limpiar
                            </button>
                          )}
                        </div>
                      </div>
                    </div>

                    {vistaTablaMovimientos ? (
                      <ClientMovementsSpreadsheet
                        movimientos={selectedClientHistory}
                        fechaCorteFiltro={selectedClientDateFiltro}
                        onSelectMovimiento={(m) => setActiveReceipt(m)}
                        saldoActual={selectedClientDetail.saldo}
                      />
                    ) : (
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
                                      {esPagado ? 'Fiado (Pagado)' : esFiado && (m.montoPagado || 0) > 0 ? 'Fiado (Pago Parcial)' : m.tipo} {esFiado && !esPagado && m.autorizadoNombre !== '-' && `· ${m.autorizadoNombre}`}
                                      {isAnterior && <span className="ml-1.5 text-[9px] uppercase bg-slate-200 text-slate-600 px-1 rounded not-italic">Anterior</span>}
                                      {esPagado && <span className="ml-1.5 text-[9px] uppercase bg-emerald-100 text-emerald-700 px-1.5 py-0.5 rounded-md font-bold not-italic">Pago</span>}
                                      {esFiado && !esPagado && (m.montoPagado || 0) > 0 && (
                                        <span className="ml-1.5 text-[9px] bg-amber-100 text-amber-900 border border-amber-300 px-1.5 py-0.5 rounded-md font-extrabold not-italic">
                                          Pago {formatoMoneda(m.montoPagado || 0)} / Resta {formatoMoneda(m.saldoPendiente || 0)}
                                        </span>
                                      )}
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
                                    {esFiado && !esPagado && (m.montoPagado || 0) > 0 && (
                                      <div className="text-[9px] text-amber-700 font-bold not-italic">Resta {formatoMoneda(m.saldoPendiente || 0)}</div>
                                    )}
                                  </div>
                                </div>
                              </div>
                            );
                          })
                        )}
                      </div>
                    )}
                  </div>

                  {/* Acceso a Autorizados en pantallas menores a XL */}
                  <div className="xl:hidden bg-white rounded-3xl p-4 border border-slate-100 shadow-xs">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-2">
                        <UserCheck className="w-4 h-4 text-purple-600" />
                        <h4 className="font-bold text-xs uppercase tracking-wide text-slate-800">
                          Personas Autorizadas
                        </h4>
                      </div>
                      <button
                        type="button"
                        onClick={() => {
                          vibrate(10);
                          setAuthModal({
                            isOpen: true,
                            modo: 'agregar',
                            autorizado: null,
                            targetClienteId: selectedClientDetail.id,
                            esCliente: false
                          });
                        }}
                        className="bg-blue-600 hover:bg-blue-700 active:scale-95 text-white py-2 px-4 rounded-xl font-bold transition shadow-sm hover:shadow-md shadow-blue-500/25 flex items-center gap-1.5 cursor-pointer touch-manipulation text-xs"
                      >
                        <UserPlus className="w-3.5 h-3.5 text-white" />
                        <span>Agregar +</span>
                      </button>
                    </div>

                    <div className="space-y-2">
                      {store.getAutorizadosDeCliente(selectedClientDetail.id).length === 0 ? (
                        <div className="text-center py-3 text-xs text-slate-400">
                          Solo el titular está autorizado para fiar
                        </div>
                      ) : (
                        store.getAutorizadosDeCliente(selectedClientDetail.id).map(a => (
                          <div key={a.id} className="flex items-center justify-between p-2.5 bg-slate-50 rounded-xl text-xs">
                            <div>
                              <div className="font-bold text-slate-800">{a.nombre}</div>
                              <div className="text-[10px] text-slate-400 capitalize">{a.parentesco}</div>
                            </div>
                            <div className="flex items-center gap-1">
                              <button
                                onClick={() => setAuthModal({ isOpen: true, modo: 'editar', autorizado: a, targetClienteId: selectedClientDetail.id, esCliente: false })}
                                className="p-1 text-slate-400 hover:text-blue-600"
                              >
                                <Edit2 className="w-3.5 h-3.5" />
                              </button>
                              <button
                                onClick={() => setDeleteAuthModal({ autorizado: a, targetClienteId: selectedClientDetail.id, esCliente: false })}
                                className="p-1 text-slate-400 hover:text-red-600"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                </div>

                {/* ======================================================== */}
                {/* COLUMNA DERECHA: hidden xl:block xl:col-span-4 */}
                {/* ======================================================== */}
                <div className="hidden xl:block xl:col-span-4 space-y-4">
                  {/* Tarjeta de Personas Autorizadas */}
                  <div className="bg-white rounded-3xl p-5 border border-slate-100 shadow-md">
                    <div className="flex items-center justify-between mb-3 pb-2 border-b border-slate-100">
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center font-bold">
                          <UserCheck className="w-4 h-4" />
                        </div>
                        <div>
                          <h4 className="font-black text-sm text-slate-900 leading-tight">Personas Autorizadas</h4>
                          <p className="text-[10px] text-slate-400">Familiares con permiso para fiar</p>
                        </div>
                      </div>
                      <button
                        onClick={() => {
                          setAuthModal({
                            isOpen: true,
                            modo: 'agregar',
                            autorizado: null,
                            targetClienteId: selectedClientDetail.id,
                            esCliente: false
                          });
                        }}
                        className="bg-blue-600 hover:bg-blue-700 active:scale-95 text-white py-2 px-4 rounded-xl font-bold transition shadow-sm hover:shadow-md shadow-blue-500/25 flex items-center gap-1.5 cursor-pointer touch-manipulation text-xs"
                      >
                        <UserPlus className="w-3.5 h-3.5 text-white" />
                        <span>Agregar +</span>
                      </button>
                    </div>

                    <div className="space-y-2 mt-3">
                      {store.getAutorizadosDeCliente(selectedClientDetail.id).length === 0 ? (
                        <div className="text-center py-6 text-slate-400 bg-slate-50 rounded-2xl p-4">
                          <UserCheck className="w-8 h-8 mx-auto text-slate-300 mb-1" />
                          <p className="text-xs font-bold">Sin familiares autorizados</p>
                          <p className="text-[10px] text-slate-400 mt-0.5">Solo el titular puede retirar mercancía</p>
                        </div>
                      ) : (
                        store.getAutorizadosDeCliente(selectedClientDetail.id).map(a => (
                          <div
                            key={a.id}
                            className="flex items-center justify-between p-3 bg-slate-50 hover:bg-purple-50/50 rounded-2xl border border-slate-100 transition"
                          >
                            <div className="flex items-center gap-2.5 min-w-0">
                              <div className="w-8 h-8 rounded-xl bg-purple-100 text-purple-700 font-bold text-xs flex items-center justify-center shrink-0">
                                {a.nombre.charAt(0).toUpperCase()}
                              </div>
                              <div className="min-w-0">
                                <div className="font-bold text-xs text-slate-900 truncate">{a.nombre}</div>
                                <div className="text-[10px] text-slate-400 capitalize">{a.parentesco}</div>
                              </div>
                            </div>
                            <div className="flex items-center gap-1 shrink-0">
                              <button
                                onClick={() => setAuthModal({ isOpen: true, modo: 'editar', autorizado: a, targetClienteId: selectedClientDetail.id, esCliente: false })}
                                className="p-1.5 text-slate-400 hover:text-blue-600 rounded-lg hover:bg-white transition"
                                title="Editar"
                              >
                                <Edit2 className="w-3.5 h-3.5" />
                              </button>
                              <button
                                onClick={() => setDeleteAuthModal({ autorizado: a, targetClienteId: selectedClientDetail.id, esCliente: false })}
                                className="p-1.5 text-slate-400 hover:text-red-600 rounded-lg hover:bg-white transition"
                                title="Eliminar"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </div>
                        ))
                      )}
                    </div>
                  </div>

                  {/* Resumen Comercial del Cliente */}
                  <div className="bg-white rounded-3xl p-5 border border-slate-100 shadow-md">
                    <div className="flex items-center gap-2 mb-3 pb-2 border-b border-slate-100">
                      <div className="w-8 h-8 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center font-bold">
                        <ShoppingBag className="w-4 h-4" />
                      </div>
                      <div>
                        <h4 className="font-black text-sm text-slate-900 leading-tight">Resumen de Cuenta</h4>
                        <p className="text-[10px] text-slate-400">Comportamiento de pagos</p>
                      </div>
                    </div>

                    <div className="space-y-2.5 text-xs">
                      <div className="flex justify-between items-center py-1.5 border-b border-slate-50">
                        <span className="text-slate-500">Total fiados registrados</span>
                        <span className="font-black text-slate-900">
                          {selectedClientHistory.filter(m => m.tipo === 'Fiado').length} compras
                        </span>
                      </div>
                      <div className="flex justify-between items-center py-1.5 border-b border-slate-50">
                        <span className="text-slate-500">Total abonos efectuados</span>
                        <span className="font-black text-emerald-700">
                          {selectedClientHistory.filter(m => m.tipo === 'Abono').length} pagos
                        </span>
                      </div>
                      <div className="flex justify-between items-center py-1.5 border-b border-slate-50">
                        <span className="text-slate-500">Monto total fiado histórico</span>
                        <span className="font-black text-slate-900">
                          {formatoMoneda(
                            selectedClientHistory
                              .filter(m => m.tipo === 'Fiado')
                              .reduce((acc, m) => acc + m.monto, 0)
                          )}
                        </span>
                      </div>
                      <div className="flex justify-between items-center py-1.5">
                        <span className="text-slate-500">Monto total abonado histórico</span>
                        <span className="font-black text-emerald-600">
                          {formatoMoneda(
                            selectedClientHistory
                              .filter(m => m.tipo === 'Abono')
                              .reduce((acc, m) => acc + m.monto, 0)
                          )}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Atajos Rápidos */}
                  <div className="bg-gradient-to-br from-slate-900 to-slate-800 text-white rounded-3xl p-5 shadow-lg">
                    <h4 className="font-black text-xs uppercase tracking-wider text-blue-400 mb-2">
                      Atajos de Gestión
                    </h4>
                    <p className="text-xs text-slate-300 leading-relaxed mb-4">
                      Comunícate con {selectedClientDetail.nombre.split(' ')[0]} o imprime el estado de cuenta quincenal.
                    </p>
                    <div className="space-y-2">
                      <a
                        href={`tel:${selectedClientDetail.telefono}`}
                        className="w-full py-2.5 px-3 bg-white/10 hover:bg-white/20 rounded-xl text-xs font-bold flex items-center justify-center gap-2 transition"
                      >
                        <Phone className="w-3.5 h-3.5 text-emerald-400" />
                        Llamar al {selectedClientDetail.telefono}
                      </a>
                      <button
                        type="button"
                        onClick={() => {
                          vibrate(15);
                          setWhatsAppModalCliente(selectedClientDetail);
                        }}
                        className="w-full py-2.5 px-3 bg-[#25D366] hover:bg-[#20ba59] text-white rounded-xl text-xs font-bold flex items-center justify-center gap-2 transition shadow-xs"
                      >
                        <WhatsAppIcon className="w-3.5 h-3.5" />
                        Enviar WhatsApp
                      </button>
                    </div>
                  </div>
                </div>

              </div>
            </div>

            {/* Barra de Acciones Fija Inferior Siempre Visible: [ Salir ] [ Fiado ] [ Abono ] */}
            <div className="fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-md border-t border-slate-200/90 px-4 py-3 pb-[calc(12px+env(safe-area-inset-bottom))] shadow-[0_-4px_25px_rgba(0,0,0,0.12)] flex items-center justify-center">
              <div className="w-full max-w-5xl lg:max-w-6xl mx-auto flex items-center gap-3">
                {/* Botón Salir */}
                <button
                  type="button"
                  onClick={() => {
                    vibrate(10);
                    setCurrentView('admin-dashboard');
                  }}
                  className="flex-1 py-3 px-3 bg-slate-100 hover:bg-slate-200 active:bg-slate-300 text-slate-700 font-extrabold text-xs sm:text-sm rounded-2xl flex items-center justify-center gap-1.5 transition active:scale-95 shadow-2xs border border-slate-200"
                  title="Volver al panel principal"
                >
                  <X className="w-4 h-4 text-slate-500" />
                  <span>Salir</span>
                </button>

                {/* Botón Fiado */}
                <button
                  type="button"
                  disabled={selectedClientDetail.bloqueada}
                  onClick={() => {
                    vibrate(15);
                    setFormFiadoCliente(String(selectedClientDetail.id));
                    setCurrentView('admin-fiado');
                  }}
                  className={`flex-1 py-3 px-3 font-extrabold text-xs sm:text-sm rounded-2xl flex items-center justify-center gap-1.5 transition active:scale-95 shadow-md ${
                    selectedClientDetail.bloqueada
                      ? 'bg-slate-200 text-slate-400 cursor-not-allowed'
                      : 'bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white shadow-blue-500/25'
                  }`}
                  title="Registrar fiado para este cliente"
                >
                  <PlusCircle className="w-4 h-4" />
                  <span>+ Fiado</span>
                </button>

                {/* Botón Abono */}
                <button
                  type="button"
                  onClick={() => {
                    vibrate(15);
                    setFormAbonoCliente(String(selectedClientDetail.id));
                    setCurrentView('admin-abono');
                  }}
                  className="flex-1 py-3 px-3 bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 text-white font-extrabold text-xs sm:text-sm rounded-2xl flex items-center justify-center gap-1.5 transition active:scale-95 shadow-md shadow-emerald-500/25"
                  title="Registrar abono para este cliente"
                >
                  <ArrowDownLeft className="w-4 h-4" />
                  <span>Abono</span>
                </button>
              </div>
            </div>
          </div>
        )}

        {/* ======================================================== */}
        {/* 5. FORM REGISTRAR FIADO */}
        {/* ======================================================== */}
        {currentView === 'admin-fiado' && (
          <div className="flex-1 bg-slate-50 p-4 sm:p-6 lg:p-8 min-h-[100dvh]">
            <div className="w-full max-w-2xl md:max-w-4xl mx-auto">
              <button
                onClick={() => setCurrentView('admin-dashboard')}
                className="w-10 h-10 rounded-full bg-white shadow-xs flex items-center justify-center text-slate-600 mb-4 hover:bg-slate-100 transition"
              >
                <X className="w-5 h-5" />
              </button>

              <h2 className="text-2xl font-black text-slate-900 mb-6">Registrar Fiado</h2>

              <form onSubmit={handleGuardarFiado} className="bg-white rounded-3xl p-5 sm:p-6 border border-slate-100 shadow-md space-y-4">
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
          </div>
        )}

        {/* ======================================================== */}
        {/* 6. FORM REGISTRAR ABONO */}
        {/* ======================================================== */}
        {currentView === 'admin-abono' && (
          <div className="flex-1 bg-slate-50 p-4 sm:p-6 lg:p-8 min-h-[100dvh]">
            <div className="w-full max-w-2xl md:max-w-4xl mx-auto">
              <button
                onClick={() => setCurrentView('admin-dashboard')}
                className="w-10 h-10 rounded-full bg-white shadow-xs flex items-center justify-center text-slate-600 mb-4 hover:bg-slate-100 transition"
              >
                <X className="w-5 h-5" />
              </button>

              <h2 className="text-2xl font-black text-slate-900 mb-6">Registrar Abono</h2>

              <form onSubmit={handleGuardarAbono} className="bg-white rounded-3xl p-5 sm:p-6 border border-slate-100 shadow-md space-y-4">
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
                <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 space-y-3">
                  <div className="flex items-center justify-between gap-2 flex-wrap">
                    <div>
                      <label className="block text-xs font-bold text-slate-800 uppercase tracking-wide">
                        Seleccionar Fiados a Cobrar
                      </label>
                      <p className="text-[11px] text-slate-500">
                        Solo fiados pendientes. El abono se aplicará a las cuentas seleccionadas:
                      </p>
                    </div>

                    {fiadosPendientesAbono.length > 0 && (
                      <button
                        type="button"
                        onClick={handleToggleSeleccionarTodosFiados}
                        className={`text-xs font-bold px-3 py-1.5 rounded-xl border transition flex items-center gap-1.5 shadow-2xs ${
                          todosFiadosAbonoSeleccionados
                            ? 'bg-emerald-100 text-emerald-800 border-emerald-300 hover:bg-emerald-200'
                            : 'bg-white text-slate-700 border-slate-300 hover:bg-slate-100'
                        }`}
                      >
                        <CheckSquare className="w-3.5 h-3.5 text-emerald-600" />
                        <span>{todosFiadosAbonoSeleccionados ? 'Deseleccionar Todos' : `Seleccionar Todo (${fiadosPendientesAbono.length})`}</span>
                      </button>
                    )}
                  </div>

                  {fiadosPendientesAbono.length === 0 ? (
                    <div className="p-3 bg-white rounded-xl border border-dashed border-slate-300 text-center text-xs text-slate-400">
                      No hay fiados pendientes de cobro para este cliente.
                    </div>
                  ) : (
                    <>
                      {selectedFiadosPagados.length > 0 && (
                        <div className="flex items-center justify-between bg-emerald-50/70 border border-emerald-200 px-3 py-2 rounded-xl text-xs">
                          <span className="font-semibold text-emerald-800">
                            {selectedFiadosPagados.length} {selectedFiadosPagados.length === 1 ? 'fiado seleccionado' : 'fiados seleccionados'} (Total: <span className="font-black text-emerald-900">{formatoMoneda(totalSumaFiadosSeleccionados)}</span>)
                          </span>
                          <button
                            type="button"
                            onClick={() => {
                              vibrate(15);
                              setFormAbonoMonto(totalSumaFiadosSeleccionados.toString());
                            }}
                            className="text-[11px] font-extrabold text-emerald-700 hover:text-emerald-900 underline ml-2"
                          >
                            Poner este monto
                          </button>
                        </div>
                      )}

                      <div className="space-y-2 max-h-56 overflow-y-auto pr-1">
                        {fiadosPendientesAbono.map(f => {
                          const deudaActual = typeof f.saldoPendiente === 'number' ? f.saldoPendiente : f.monto;
                          const esParcialPrevio = (f.montoPagado || 0) > 0 && deudaActual < f.monto;
                          const isChecked = selectedFiadosPagados.includes(f.idMov);
                          const sim = simulacionDistribucionAbono?.resultados[f.idMov];

                          return (
                            <label
                              key={f.idMov}
                              className={`flex flex-col p-3 rounded-xl border text-xs cursor-pointer transition select-none ${
                                isChecked
                                  ? 'bg-emerald-50/40 border-emerald-400 ring-1 ring-emerald-300'
                                  : 'bg-white border-slate-200 hover:border-slate-300'
                              }`}
                            >
                              <div className="flex items-center justify-between gap-2">
                                <div className="flex items-center gap-2.5 min-w-0">
                                  <input
                                    type="checkbox"
                                    checked={isChecked}
                                    onChange={e => {
                                      if (e.target.checked) setSelectedFiadosPagados([...selectedFiadosPagados, f.idMov]);
                                      else setSelectedFiadosPagados(selectedFiadosPagados.filter(id => id !== f.idMov));
                                    }}
                                    className="w-4 h-4 rounded text-emerald-600 border-slate-300 shrink-0"
                                  />
                                  <div className="min-w-0">
                                    <div className="flex items-center gap-1.5 flex-wrap">
                                      <span className="font-black text-sm text-slate-900">
                                        {formatoMoneda(deudaActual)}
                                      </span>
                                      {esParcialPrevio && (
                                        <span className="text-[10px] font-bold bg-amber-100 text-amber-800 px-1.5 py-0.2 rounded border border-amber-200">
                                          Resta de {formatoMoneda(f.monto)}
                                        </span>
                                      )}
                                      <span className="text-[10px] text-slate-400">
                                        ({f.fechaTexto || f.fechaHora.slice(0, 10)})
                                      </span>
                                    </div>
                                    <div className="text-[11px] text-slate-500 truncate">
                                      {f.observaciones || 'Sin detalle'} {f.autorizadoNombre && f.autorizadoNombre !== '-' && `· ${f.autorizadoNombre}`}
                                    </div>
                                  </div>
                                </div>
                                <span className="text-[10px] font-mono text-slate-400 shrink-0">#{f.idMov}</span>
                              </div>

                              {/* Indicador de Simulación en Vivo según el abono digitado */}
                              {sim && (
                                <div className="mt-2 pt-2 border-t border-slate-100 flex items-center justify-between flex-wrap gap-1 text-[11px]">
                                  {sim.estado === 'PAGO_COMPLETO' && (
                                    <span className="inline-flex items-center gap-1 font-black text-emerald-700 bg-emerald-100/90 border border-emerald-300 px-2 py-0.5 rounded-md">
                                      ✓ PAGO ({formatoMoneda(sim.aplicado)})
                                    </span>
                                  )}
                                  {sim.estado === 'PAGO_PARCIAL' && (
                                    <div className="w-full bg-amber-50 border border-amber-300 rounded-lg p-1.5 text-amber-900 font-bold flex flex-col gap-0.5">
                                      <div className="flex items-center justify-between">
                                        <span className="text-emerald-700 font-black">PAGO: {formatoMoneda(sim.aplicado)}</span>
                                        <span className="text-amber-800 font-black">PENDIENTE: {formatoMoneda(sim.quedaPendiente)}</span>
                                      </div>
                                      <div className="text-[10px] text-amber-700 font-medium">
                                        * Quedarán {formatoMoneda(sim.quedaPendiente)} pendientes que saldrán en la otra cuenta
                                      </div>
                                    </div>
                                  )}
                                  {sim.estado === 'SIN_CUBRIR' && (
                                    <span className="text-[10px] font-semibold text-slate-400">
                                      Sin cubrir con este abono (resta {formatoMoneda(sim.deudaPendiente)})
                                    </span>
                                  )}
                                </div>
                              )}
                            </label>
                          );
                        })}
                      </div>

                      {/* Resumen explicativo de la distribución del abono */}
                      {simulacionDistribucionAbono && (
                        <div className="bg-emerald-50/90 border border-emerald-200 rounded-xl p-3 text-xs space-y-1 mt-2">
                          <div className="font-extrabold text-emerald-950 flex items-center gap-1.5">
                            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                            <span>Distribución del pago de {formatoMoneda(simulacionDistribucionAbono.montoNum)}:</span>
                          </div>
                          <div className="text-slate-700 space-y-1 pl-5 text-[11px]">
                            {simulacionDistribucionAbono.countCompletos > 0 && (
                              <div className="text-emerald-800 font-semibold">
                                • {simulacionDistribucionAbono.countCompletos} {simulacionDistribucionAbono.countCompletos === 1 ? 'fiado quedará' : 'fiados quedarán'} marcado como <span className="font-black bg-emerald-100 text-emerald-900 px-1 py-0.2 rounded">PAGO</span>
                              </div>
                            )}
                            {simulacionDistribucionAbono.parcialItem && (
                              <div className="text-amber-900 font-semibold">
                                • Fiado #{simulacionDistribucionAbono.parcialItem.idMov}: Se abonarán {formatoMoneda(simulacionDistribucionAbono.parcialItem.aplicado)} y quedará <span className="font-black bg-amber-100 text-amber-900 px-1 py-0.2 rounded">PENDIENTE {formatoMoneda(simulacionDistribucionAbono.parcialItem.quedaPendiente)}</span> para la otra cuenta
                              </div>
                            )}
                          </div>
                        </div>
                      )}
                    </>
                  )}
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
          </div>
        )}

        {/* ======================================================== */}
        {/* 7. FORM AGREGAR AUTORIZADO (Admin) */}
        {/* ======================================================== */}
        {currentView === 'admin-autorizado' && (
          <div className="flex-1 bg-slate-50 p-4 sm:p-6 lg:p-8 min-h-[100dvh]">
            <div className="w-full max-w-2xl md:max-w-4xl mx-auto">
              <button
                onClick={() => setCurrentView('admin-dashboard')}
                className="w-10 h-10 rounded-full bg-white shadow-xs flex items-center justify-center text-slate-600 mb-4 hover:bg-slate-100 transition"
              >
                <X className="w-5 h-5" />
              </button>

              <h2 className="text-2xl font-black text-slate-900 mb-6">Agregar Autorizado</h2>

              <div className="bg-white rounded-3xl p-5 sm:p-6 border border-slate-100 shadow-md space-y-4">
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
          </div>
        )}

        {/* ======================================================== */}
        {/* 8. FORM NUEVO CLIENTE (Admin) */}
        {/* ======================================================== */}
        {currentView === 'admin-crear-cliente' && (
          <div className="flex-1 bg-slate-50 p-4 sm:p-6 lg:p-8 min-h-[100dvh]">
            <div className="w-full max-w-2xl md:max-w-4xl mx-auto">
              <button
                onClick={() => setCurrentView('admin-dashboard')}
                className="w-10 h-10 rounded-full bg-white shadow-xs flex items-center justify-center text-slate-600 mb-4 hover:bg-slate-100 transition"
              >
                <X className="w-5 h-5" />
              </button>

              <h2 className="text-2xl font-black text-slate-900 mb-6">Nuevo Cliente</h2>

              <form onSubmit={handleCrearCliente} className="space-y-4">
                <div className="bg-white rounded-3xl p-5 sm:p-6 border border-slate-100 shadow-md space-y-4">
                  {/* Grid 2 campos: Nombre y Teléfono */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
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
                  </div>

                  {/* Grid 2 campos: PIN y Límite de fiado */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
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
                      <p className="text-[11px] text-slate-500 mt-1 text-center sm:text-left">
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
                      <p className="text-[11px] text-slate-500 mt-1">
                        Monto máximo permitido en crédito pendiente
                      </p>
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 uppercase tracking-wide mb-1.5">
                      Días de pago acordados
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
          </div>
        )}

        {/* ======================================================== */}
        {/* 9. AUDITORÍA (Admin) */}
        {/* ======================================================== */}
        {currentView === 'admin-auditoria' && (
          <div className="flex-1 bg-slate-50 min-h-[100dvh] pb-10">
            <div className="header-gradient p-6 pb-8 rounded-b-3xl text-white">
              <div className="max-w-4xl mx-auto flex items-center justify-between">
                <button
                  onClick={() => setCurrentView('admin-dashboard')}
                  className="w-9 h-9 rounded-full bg-white/20 flex items-center justify-center hover:bg-white/30 transition"
                >
                  <X className="w-5 h-5" />
                </button>
                <h2 className="text-xl font-black flex items-center gap-2">
                  <Shield className="w-6 h-6 text-yellow-300" />
                  Auditoría del Sistema
                </h2>
                <div className="w-9" />
              </div>
            </div>

            <div className="max-w-4xl mx-auto p-4 space-y-4">
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
          <LoginView
            initialRole="client"
            onAdminLogin={handleAdminLogin}
            onClientLogin={handleClientLogin}
            onBackToLanding={() => { vibrate(10); setCurrentView('landing'); }}
            onOpenApkGuide={() => { vibrate(10); setIsApkGuideOpen(true); }}
            datosColmado={datosColmado}
            adminEmail={adminEmail}
            setAdminEmail={setAdminEmail}
            adminPass={adminPass}
            setAdminPass={setAdminPass}
            adminRemember={adminRemember}
            setAdminRemember={setAdminRemember}
            clientPhone={clientPhone}
            setClientPhone={setClientPhone}
            clientPin={clientPin}
            setClientPin={setClientPin}
            clientRemember={clientRemember}
            setClientRemember={setClientRemember}
            isSubmitting={isSubmitting}
            clientesDemo={adminClientes}
            onRoleChanged={(r) => {
              setCurrentView(r === 'client' ? 'client-login' : 'admin-login');
            }}
          />
        )}

{/* ======================================================== */}
        {/* 11. CLIENT DASHBOARD (Completamente Responsivo) */}
        {/* ======================================================== */}
        {currentView === 'client-dashboard' && currentClient && (
          <div className="flex-1 flex flex-col bg-[#f8fafc] min-h-[100dvh] w-full max-w-5xl lg:max-w-6xl mx-auto sm:my-6 sm:rounded-3xl sm:shadow-2xl sm:border sm:border-slate-100 relative pb-28 md:pb-12">
            
            {/* Header del Cliente — Con navegación en Tablet y Desktop (≥ 768px) */}
            <header className="bg-white px-4 sm:px-6 py-3.5 border-b border-slate-100 flex items-center justify-between sticky top-0 z-30 shadow-xs sm:rounded-t-3xl">
              <div className="flex items-center gap-3 min-w-0">
                <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-blue-600 to-indigo-700 flex items-center justify-center text-white shadow-md shadow-blue-500/20 shrink-0">
                  <Crown className="w-6 h-6 fill-white text-white" />
                </div>
                <div className="min-w-0">
                  <h2 className="text-base sm:text-lg font-black text-slate-900 leading-tight truncate">
                    Hola, {currentClient.nombre.split(' ')[0]}
                  </h2>
                  <p className="text-xs font-semibold text-slate-400 truncate">
                    {datosColmado.nombre} · Cliente VIP
                  </p>
                </div>
              </div>

              {/* Navegación Desktop y Tablet integrada en el Header */}
              <div className="hidden md:flex items-center gap-1 bg-slate-100/90 p-1 rounded-2xl border border-slate-200/80">
                <button
                  onClick={() => { vibrate(); setClientTab('inicio'); }}
                  className={`px-3.5 py-1.5 rounded-xl font-bold text-xs transition flex items-center gap-1.5 ${
                    clientTab === 'inicio'
                      ? 'bg-white text-blue-700 shadow-xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  <Home className="w-3.5 h-3.5" />
                  <span>Inicio</span>
                </button>

                <button
                  onClick={() => { vibrate(); setClientTab('movimientos'); }}
                  className={`px-3.5 py-1.5 rounded-xl font-bold text-xs transition flex items-center gap-1.5 ${
                    clientTab === 'movimientos' || clientTab === 'historial'
                      ? 'bg-white text-blue-700 shadow-xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  <ListOrdered className="w-3.5 h-3.5" />
                  <span>Historial</span>
                </button>

                <button
                  onClick={() => { vibrate(); setClientTab('tarjeta'); }}
                  className={`px-3.5 py-1.5 rounded-xl font-bold text-xs transition flex items-center gap-1.5 ${
                    clientTab === 'tarjeta'
                      ? 'bg-white text-blue-700 shadow-xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  <CreditCard className="w-3.5 h-3.5" />
                  <span>Mi Tarjeta</span>
                </button>

                <button
                  onClick={() => { vibrate(); setClientTab('perfil'); }}
                  className={`px-3.5 py-1.5 rounded-xl font-bold text-xs transition flex items-center gap-1.5 ${
                    clientTab === 'perfil'
                      ? 'bg-white text-blue-700 shadow-xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  <User className="w-3.5 h-3.5" />
                  <span>Perfil</span>
                </button>
              </div>

              {/* Botones de la derecha */}
              <div className="flex items-center gap-2 shrink-0">
                <NotificationBellButton
                  rol="cliente"
                  clienteId={currentClient.id}
                  onClick={() => { vibrate(); setIsNotificationModalOpen(true); }}
                  className="bg-slate-100 hover:bg-slate-200 text-slate-700 border-slate-200"
                />
                <button
                  onClick={() => {
                    vibrate();
                    setCurrentClient(null);
                    setCurrentView('landing');
                    showToast('Sesión Cerrada', '', 'info');
                  }}
                  className="hidden md:flex items-center gap-1 px-3 py-1.5 text-xs font-bold text-red-600 hover:bg-red-50 rounded-xl transition"
                  title="Cerrar sesión"
                >
                  <LogOut className="w-3.5 h-3.5" />
                  <span>Salir</span>
                </button>
              </div>
            </header>

            {/* TAB 1: INICIO (IMAGE 1) — Adaptable a Móvil, Tablet y Desktop */}
            {clientTab === 'inicio' && (
              <div className="p-4 sm:p-6 space-y-5 animate-in fade-in duration-200">
                <NotificationPermissionBanner rol="cliente" />

                <div className="grid grid-cols-1 md:grid-cols-12 gap-5">
                  {/* Columna Principal / Izquierda en Desktop */}
                  <div className="md:col-span-7 lg:col-span-8 space-y-4">
                    {/* Tarjeta Azul: DEUDA ACTUAL */}
                    <div className="rounded-3xl p-6 sm:p-7 bg-gradient-to-br from-blue-600 via-blue-600 to-indigo-700 text-white shadow-xl shadow-blue-500/20 relative overflow-hidden">
                      <div className="flex items-center gap-1.5 text-xs font-extrabold text-blue-100 tracking-wider uppercase">
                        <CreditCard className="w-4 h-4 text-blue-200" />
                        <span>DEUDA ACTUAL</span>
                      </div>

                      <div className="text-3xl sm:text-4xl font-black text-white tracking-tight mt-1 mb-2.5">
                        RD$ {currentClient.saldo.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                      </div>

                      <div className="mb-4">
                        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/20 backdrop-blur-md text-xs font-bold text-white shadow-xs">
                          <span className={`w-2 h-2 rounded-full ${currentClient.saldo <= 0 ? 'bg-emerald-300' : currentClient.estadoPago === 'pendiente' ? 'bg-amber-300' : 'bg-emerald-300'}`}></span>
                          Estado: {currentClient.saldo <= 0 ? 'Al día' : currentClient.estadoPago === 'pendiente' ? 'Pendiente' : 'Al día'}
                        </div>
                      </div>

                      <div className="flex items-center justify-between text-xs font-bold text-blue-100 mb-1.5">
                        <span>Límite: RD$ {currentClient.limite.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                        <span>Disponible: RD$ {Math.max(0, currentClient.limite - currentClient.saldo).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                      </div>

                      {/* Barra de progreso */}
                      <div className="w-full h-2.5 rounded-full bg-black/25 overflow-hidden">
                        <div
                          className="h-full bg-amber-400 rounded-full transition-all duration-500"
                          style={{
                            width: `${Math.min(100, (currentClient.saldo / (currentClient.limite || 1)) * 100)}%`
                          }}
                        />
                      </div>
                    </div>

                    {/* Dos mini tarjetas (Próximo Pago & Estado) */}
                    <div className="grid grid-cols-2 gap-3">
                      <div className="bg-white rounded-3xl p-4 sm:p-5 shadow-xs border border-slate-100 flex flex-col justify-between">
                        <div className="w-10 h-10 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center mb-3">
                          <Calendar className="w-5 h-5 text-blue-600" />
                        </div>
                        <div>
                          <div className="text-[10px] font-black text-slate-400 tracking-wider uppercase">
                            PRÓXIMO PAGO
                          </div>
                          <div className="text-base sm:text-lg font-black text-slate-900 mt-0.5">
                            {formatearFechaCorta(currentClient.proximoPago)}
                          </div>
                        </div>
                      </div>

                      <div className="bg-white rounded-3xl p-4 sm:p-5 shadow-xs border border-slate-100 flex flex-col justify-between">
                        <div className="w-10 h-10 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center mb-3">
                          <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                        </div>
                        <div>
                          <div className="text-[10px] font-black text-slate-400 tracking-wider uppercase">
                            ESTADO
                          </div>
                          <div className={`text-base sm:text-lg font-black mt-0.5 ${currentClient.saldo <= 0 ? 'text-emerald-600' : currentClient.estadoPago === 'pendiente' ? 'text-amber-600' : 'text-emerald-600'}`}>
                            {currentClient.saldo <= 0 ? 'Al día' : currentClient.estadoPago === 'pendiente' ? 'Pendiente' : 'Al día'}
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* ACCIONES RÁPIDAS */}
                    <div>
                      <div className="text-xs font-black text-slate-800 uppercase tracking-wider mb-2.5">
                        ACCIONES RÁPIDAS
                      </div>
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                        <button
                          type="button"
                          onClick={() => { vibrate(); setClientTab('tarjeta'); }}
                          className="bg-white rounded-2xl p-4 shadow-xs border border-slate-100 flex flex-col items-center justify-center hover:bg-slate-50 active:scale-95 transition group cursor-pointer touch-manipulation"
                        >
                          <CreditCard className="w-6 h-6 text-blue-600 mb-1.5 group-hover:scale-110 transition-transform" />
                          <span className="text-xs font-bold text-slate-700">Mi Tarjeta</span>
                        </button>

                        <button
                          type="button"
                          onClick={() => { vibrate(); setClientTab('movimientos'); }}
                          className="bg-white rounded-2xl p-4 shadow-xs border border-slate-100 flex flex-col items-center justify-center hover:bg-slate-50 active:scale-95 transition group cursor-pointer touch-manipulation"
                        >
                          <ListOrdered className="w-6 h-6 text-purple-600 mb-1.5 group-hover:scale-110 transition-transform" />
                          <span className="text-xs font-bold text-slate-700 truncate">Historial</span>
                        </button>

                        <button
                          type="button"
                          onClick={() => { vibrate(); setClientTab('perfil'); }}
                          className="bg-white rounded-2xl p-4 shadow-xs border border-slate-100 flex flex-col items-center justify-center hover:bg-slate-50 active:scale-95 transition group cursor-pointer touch-manipulation"
                        >
                          <User className="w-6 h-6 text-slate-600 mb-1.5 group-hover:scale-110 transition-transform" />
                          <span className="text-xs font-bold text-slate-700">Mi Perfil</span>
                        </button>

                        <button
                          type="button"
                          onClick={() => { vibrate(); setIsChangePinModalOpen(true); }}
                          className="bg-white rounded-2xl p-4 shadow-xs border border-slate-100 flex flex-col items-center justify-center hover:bg-amber-50/50 active:scale-95 transition group cursor-pointer touch-manipulation border-amber-100/60"
                        >
                          <Key className="w-6 h-6 text-amber-500 mb-1.5 group-hover:scale-110 transition-transform" />
                          <span className="text-xs font-bold text-slate-700 truncate">Cambiar PIN</span>
                        </button>
                      </div>
                    </div>

                    {/* Últimos movimientos */}
                    <div className="bg-white rounded-3xl p-5 border border-slate-100 shadow-xs">
                      <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center gap-2">
                          <Clock className="w-4 h-4 text-blue-600" />
                          <span className="text-sm font-black text-slate-900">Últimos movimientos</span>
                        </div>
                        <button
                          onClick={() => { vibrate(); setClientTab('movimientos'); }}
                          className="text-xs font-bold text-blue-600 hover:text-blue-700 hover:underline"
                        >
                          Ver todos →
                        </button>
                      </div>

                      <div className="divide-y divide-slate-100">
                        {clientMovimientos.length === 0 ? (
                          <div className="py-6 text-center text-xs text-slate-400">
                            Sin movimientos registrados
                          </div>
                        ) : (
                          clientMovimientos.slice(0, 4).map(m => {
                            const esFiado = m.tipo === 'Fiado';
                            return (
                              <div
                                key={m.idMov}
                                onClick={() => { vibrate(10); setActiveReceipt(m); }}
                                className="py-3 flex items-center justify-between cursor-pointer hover:bg-slate-50/80 -mx-2 px-2 rounded-xl transition"
                              >
                                <div className="flex items-center gap-3 min-w-0">
                                  <div className={`w-10 h-10 rounded-2xl flex items-center justify-center shrink-0 ${esFiado ? 'bg-red-50 text-red-500' : 'bg-emerald-50 text-emerald-600'}`}>
                                    {esFiado ? <ShoppingBag className="w-5 h-5" /> : <ArrowDown className="w-5 h-5" />}
                                  </div>
                                  <div className="min-w-0">
                                    <div className="font-bold text-xs text-slate-800 truncate">
                                      {m.observaciones || (esFiado ? (m.autorizadoNombre || 'Compra') : 'Abono realizado')}
                                    </div>
                                    <div className="text-[10px] text-slate-400">
                                      {formatMovementRelative(m)}
                                    </div>
                                  </div>
                                </div>

                                <div className="text-right shrink-0">
                                  <div className={`text-sm font-black ${esFiado ? 'text-red-600' : 'text-emerald-600'}`}>
                                    {esFiado ? '-' : '+'}RD$ {m.monto.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                                  </div>
                                </div>
                              </div>
                            );
                          })
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Columna Lateral en Tablet y Desktop (md:col-span-5 lg:col-span-4) */}
                  <div className="md:col-span-5 lg:col-span-4 space-y-4">
                    {/* Mini Tarjeta VIP Digital Preview */}
                    <div
                      onClick={() => { vibrate(); setClientTab('tarjeta'); }}
                      className="cursor-pointer bg-gradient-to-br from-blue-700 to-indigo-900 rounded-3xl p-5 text-white shadow-lg relative overflow-hidden group hover:scale-[1.02] transition-transform"
                    >
                      <svg className="absolute inset-0 w-full h-full pointer-events-none opacity-40" preserveAspectRatio="none" viewBox="0 0 100 100">
                        <path d="M 0 65 Q 50 85 100 68 L 100 100 L 0 100 Z" fill="#ff5722" />
                      </svg>
                      <div className="relative z-10 flex justify-between items-center mb-6">
                        <span className="text-[10px] font-bold text-blue-200 uppercase tracking-widest">DÉBITO DAVID VIP</span>
                        <QrCode className="w-5 h-5 text-yellow-300" />
                      </div>
                      <div className="relative z-10">
                        <div className="text-xs uppercase text-slate-200 font-mono font-bold tracking-widest">
                          {currentClient.numeroCuenta || generarNumeroCuentaCliente(currentClient.id)}
                        </div>
                        <div className="text-base font-black truncate uppercase mt-0.5">
                          {currentClient.nombre}
                        </div>
                        <div className="text-[10px] text-emerald-300 font-bold mt-2 flex items-center justify-between">
                          <span>Tarjeta Activa</span>
                          <span className="text-white underline">Ver tarjeta completa →</span>
                        </div>
                      </div>
                    </div>

                    {/* Información del Negocio */}
                    <div className="bg-gradient-to-br from-slate-900 to-blue-950 text-white rounded-3xl p-5 shadow-md relative overflow-hidden">
                      <div className="flex items-center gap-3 mb-3">
                        <div className="w-10 h-10 rounded-2xl bg-white/10 backdrop-blur-md flex items-center justify-center">
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
                          <span className="leading-snug">{datosColmado.direccion}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Clock className="w-4 h-4 text-cyan-400 shrink-0" />
                          <span>{datosColmado.horario}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Phone className="w-4 h-4 text-amber-400 shrink-0" />
                          <span>Tel: {datosColmado.telefono}</span>
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-2 mt-4 pt-3 border-t border-white/10">
                        <a
                          href={`tel:${datosColmado.telefono.replace(/[^0-9]/g, '')}`}
                          className="py-2 px-3 rounded-xl bg-white/15 hover:bg-white/25 active:scale-95 text-xs font-bold text-white flex items-center justify-center gap-1.5 transition text-center"
                        >
                          <Phone className="w-3.5 h-3.5 text-yellow-300" />
                          Llamar
                        </a>

                        <a
                          href={`https://api.whatsapp.com/send?phone=${normalizarTelefonoWhatsApp(datosColmado.whatsapp)}&text=${encodeURIComponent('Hola, me comunico desde la app de ' + datosColmado.nombre)}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="py-2 px-3 rounded-xl bg-[#25D366] hover:bg-[#20ba5a] active:scale-95 text-xs font-bold text-white flex items-center justify-center gap-1.5 transition text-center shadow-md shadow-emerald-500/20"
                        >
                          <WhatsAppIcon className="w-3.5 h-3.5" />
                          <span>WhatsApp</span>
                        </a>
                      </div>
                    </div>

                    {/* Resumen de Autorizados */}
                    <div className="bg-white rounded-3xl p-5 border border-slate-100 shadow-xs">
                      <div className="flex justify-between items-center mb-2">
                        <span className="text-xs font-black text-slate-800 uppercase tracking-wider">
                          Autorizados ({clientAutorizados.length})
                        </span>
                        <button
                          onClick={() => { vibrate(); setClientTab('perfil'); }}
                          className="text-xs text-blue-600 font-bold hover:underline"
                        >
                          Gestionar →
                        </button>
                      </div>
                      <p className="text-[11px] text-slate-400 mb-2">Personas que pueden retirar fiado a tu nombre:</p>
                      <div className="space-y-1.5">
                        {clientAutorizados.slice(0, 3).map(a => (
                          <div key={a.id} className="text-xs flex items-center justify-between p-2 rounded-xl bg-slate-50">
                            <span className="font-bold text-slate-800 truncate">{a.nombre}</span>
                            <span className={`text-[9px] px-1.5 py-0.5 rounded-md font-bold ${a.bloqueado ? 'bg-red-100 text-red-700' : 'bg-emerald-100 text-emerald-700'}`}>
                              {a.bloqueado ? 'Bloqueado' : a.parentesco}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* TAB 2: MOVIMIENTOS (IMAGE 2) — Adaptable a Móvil, Tablet y Desktop */}
            {(clientTab === 'movimientos' || clientTab === 'historial') && (
              <div className="p-4 sm:p-6 space-y-5 animate-in fade-in duration-200">
                <div className="grid grid-cols-1 md:grid-cols-12 gap-5">
                  
                  {/* Columna Izquierda: Tarjeta de saldo y controles de filtro */}
                  <div className="md:col-span-5 lg:col-span-4 space-y-4">
                    {/* Tarjeta Azul: TU DEUDA ACTUAL */}
                    <div className="rounded-3xl p-6 bg-gradient-to-br from-blue-600 via-blue-600 to-indigo-700 text-white shadow-xl shadow-blue-500/20">
                      <div className="flex items-center gap-1.5 text-xs font-extrabold text-blue-100 tracking-wider uppercase">
                        <CreditCard className="w-4 h-4 text-blue-200" />
                        <span>TU DEUDA ACTUAL</span>
                      </div>

                      <div className="text-3xl sm:text-4xl font-black text-white tracking-tight mt-1 mb-4">
                        RD$ {currentClient.saldo.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                      </div>

                      <div className="grid grid-cols-2 gap-2.5">
                        <div className="bg-white/10 rounded-2xl p-3 border border-white/10 backdrop-blur-xs">
                          <div className="text-[10px] font-bold text-blue-200 uppercase tracking-wider mb-0.5">
                            TOTAL FIADO
                          </div>
                          <div className="text-sm font-black text-white truncate">
                            RD$ {clientTotalFiado.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                          </div>
                        </div>

                        <div className="bg-white/10 rounded-2xl p-3 border border-white/10 backdrop-blur-xs">
                          <div className="text-[10px] font-bold text-blue-200 uppercase tracking-wider mb-0.5">
                            TOTAL ABONADO
                          </div>
                          <div className="text-sm font-black text-emerald-300 truncate">
                            RD$ {clientTotalAbonado.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Filtros de Tipo */}
                    <div className="bg-white rounded-2xl p-2.5 border border-slate-100 shadow-xs space-y-2">
                      <div className="text-[11px] font-black text-slate-500 uppercase px-1">Filtrar por tipo</div>
                      <div className="flex items-center gap-1.5">
                        {(['todos', 'Fiado', 'Abono'] as const).map(f => (
                          <button
                            key={f}
                            onClick={() => { vibrate(); setClientHistorialFiltro(f); }}
                            className={`flex-1 py-2 rounded-xl text-xs font-bold transition ${
                              clientHistorialFiltro === f
                                ? 'bg-blue-600 text-white shadow-xs'
                                : 'bg-slate-50 text-slate-600 hover:bg-slate-100'
                            }`}
                          >
                            {f === 'todos' ? 'Todos' : f === 'Fiado' ? 'Fiados' : 'Abonos'}
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Selector de Rango de Fechas & Exportar PDF */}
                    <div className="bg-white rounded-2xl p-3 border border-slate-100 shadow-xs space-y-3">
                      <DateRangePicker
                        range={clientDateRange}
                        onChange={setClientDateRange}
                        totalFilteredCount={filteredClientMovimientos.length}
                        totalUnfilteredCount={clientMovimientos.length}
                      />

                      <div className="grid grid-cols-2 gap-2">
                        <button
                          type="button"
                          onClick={() => {
                            vibrate(15);
                            const fiados = filteredClientMovimientos.filter(m => m.tipo === 'Fiado');
                            if (fiados.length === 0) {
                              showToast('Sin gastos', 'No hay compras registradas en el periodo', 'warning');
                              return;
                            }
                            generarGastosQuincenaPDF(filteredClientMovimientos, {
                              nombreCliente: currentClient.nombre,
                              telefonoCliente: currentClient.telefono
                            });
                            showToast('PDF Quincena', 'Descargando gastos...', 'success');
                          }}
                          className="py-2.5 px-2 bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-700 hover:to-orange-700 text-white rounded-xl font-bold text-xs flex items-center justify-center gap-1.5 shadow-xs transition active:scale-95"
                        >
                          <FileText className="w-3.5 h-3.5" />
                          <span>Gastos (PDF)</span>
                        </button>

                        <button
                          type="button"
                          onClick={() => {
                            vibrate(15);
                            if (filteredClientMovimientos.length === 0) {
                              showToast('Sin movimientos', 'No hay registros para exportar', 'warning');
                              return;
                            }
                            generarReporteHistorialPDF(filteredClientMovimientos, clientHistorialFiltro, currentClient.saldo);
                            showToast('PDF Generado', `Descargando reporte...`, 'success');
                          }}
                          className="py-2.5 px-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold text-xs flex items-center justify-center gap-1.5 shadow-xs transition active:scale-95"
                        >
                          <Download className="w-3.5 h-3.5" />
                          <span>Reporte (PDF)</span>
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Columna Derecha: Lista agrupada de movimientos */}
                  <div className="md:col-span-7 lg:col-span-8 bg-white rounded-3xl p-5 border border-slate-100 shadow-xs space-y-5">
                    <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                      <h3 className="font-black text-slate-800 text-sm">Registro de Operaciones</h3>
                      <span className="text-xs text-slate-400 font-bold">{filteredClientMovimientos.length} registros</span>
                    </div>

                    {clientGroupedMovimientos.length === 0 ? (
                      <div className="py-12 text-center text-slate-400 text-xs">
                        No hay movimientos para los filtros o fechas seleccionadas
                      </div>
                    ) : (
                      clientGroupedMovimientos.map(group => (
                        <div key={group.label} className="space-y-2">
                          <div className="text-[11px] font-black text-slate-400 uppercase tracking-wider pb-1 border-b border-slate-100 flex items-center justify-between">
                            <span>{group.label}</span>
                            <span className="text-[10px] font-medium text-slate-400">{group.items.length} {group.items.length === 1 ? 'movimiento' : 'movimientos'}</span>
                          </div>

                          <div className="divide-y divide-slate-50">
                            {group.items.map(m => {
                              const esFiado = m.tipo === 'Fiado';
                              return (
                                <div
                                  key={m.idMov}
                                  onClick={() => { vibrate(10); setActiveReceipt(m); }}
                                  className="py-3 flex items-center justify-between cursor-pointer hover:bg-slate-50/80 -mx-2 px-2 rounded-xl transition"
                                >
                                  <div className="flex items-center gap-3 min-w-0">
                                    <div className={`w-10 h-10 rounded-2xl flex items-center justify-center shrink-0 ${esFiado ? 'bg-red-50 text-red-500' : 'bg-emerald-50 text-emerald-600'}`}>
                                      {esFiado ? <ShoppingBag className="w-5 h-5" /> : <ArrowDown className="w-5 h-5" />}
                                    </div>
                                    <div className="min-w-0">
                                      <div className="font-bold text-xs text-slate-800 truncate">
                                        {m.observaciones || (esFiado ? (m.autorizadoNombre || 'Compra') : 'Abono realizado')}
                                      </div>
                                      <div className="text-[10px] text-slate-400">
                                        {m.hora} · {m.tipo}
                                      </div>
                                    </div>
                                  </div>

                                  <div className="text-right shrink-0">
                                    <div className={`text-sm font-black ${esFiado ? 'text-red-600' : 'text-emerald-600'}`}>
                                      {esFiado ? '-' : '+'}RD$ {m.monto.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                                    </div>
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* TAB 3: TARJETA (IMAGE 3) — Adaptable a Móvil, Tablet y Desktop */}
            {clientTab === 'tarjeta' && (
              <div className="p-4 sm:p-6 space-y-5 animate-in fade-in duration-200">
                <div className="text-center md:text-left mb-2">
                  <h3 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
                    Mi Tarjeta VIP Digital
                  </h3>
                  <p className="text-xs text-slate-400 mt-0.5">
                    Preséntala en caja o muestra tu código QR al momento de comprar
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-start">
                  
                  {/* Columna Izquierda: La Tarjeta Física Digital */}
                  <div className="md:col-span-6 space-y-4">
                    <div className="relative aspect-[1.6/1] rounded-3xl overflow-hidden shadow-2xl p-6 sm:p-7 text-white flex flex-col justify-between bg-blue-600 select-none transition transform hover:scale-[1.01]">
                      {/* Onda Naranja Curva de Fondo */}
                      <svg className="absolute inset-0 w-full h-full pointer-events-none" preserveAspectRatio="none" viewBox="0 0 100 100">
                        <path d="M 0 62 Q 50 78 100 66 L 100 100 L 0 100 Z" fill="#ff5722" />
                      </svg>

                      {/* Fila Superior: Chip, Contactless y Nombre del Negocio */}
                      <div className="relative z-10 flex items-center justify-between">
                        <div className="flex items-center gap-2.5">
                          {/* Chip */}
                          <div className="w-11 h-8 rounded-lg bg-gradient-to-br from-amber-300 via-amber-200 to-yellow-500 border border-amber-400/80 shadow-xs flex items-center justify-center p-1 relative">
                            <div className="w-full h-full border border-amber-600/30 rounded-xs flex flex-col justify-around">
                              <div className="border-t border-amber-600/30"></div>
                              <div className="border-t border-amber-600/30"></div>
                            </div>
                          </div>
                          {/* Símbolo Contactless */}
                          <svg className="w-6 h-6 text-white/90" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                            <path d="M8.5 16.5a5 5 0 0 1 0-7"/>
                            <path d="M12 19a8.5 8.5 0 0 0 0-14"/>
                            <path d="M15.5 21.5a12 12 0 0 0 0-19"/>
                          </svg>
                        </div>

                        <div className="text-[11px] sm:text-xs font-black tracking-widest text-white/95 uppercase">
                          SÚPER COLMADO DAVID
                        </div>
                      </div>

                      {/* Fila Inferior: Titular, Código y Marca Débito DAVID */}
                      <div className="relative z-10 flex items-end justify-between pt-4">
                        <div>
                          <div className="text-[9px] font-bold text-orange-100 uppercase tracking-wider">
                            TITULAR
                          </div>
                          <div className="text-base sm:text-lg font-black text-white tracking-wide uppercase leading-tight truncate max-w-[200px] sm:max-w-xs">
                            {currentClient.nombre}
                          </div>
                          <div className="text-[11px] font-mono font-bold text-white tracking-widest mt-0.5">
                            {currentClient.numeroCuenta || generarNumeroCuentaCliente(currentClient.id)}
                          </div>
                        </div>

                        <div className="text-right">
                          <div className="text-[8px] font-black text-white/90 uppercase tracking-widest">
                            DÉBITO
                          </div>
                          <div className="text-xl sm:text-2xl font-black italic text-white tracking-tighter leading-none">
                            DAVID
                          </div>
                        </div>
                      </div>
                    </div>

                    <button
                      onClick={() => { vibrate(); setActiveQrModalCliente(currentClient); }}
                      className="w-full py-4 bg-blue-600 hover:bg-blue-700 active:scale-98 text-white font-bold rounded-2xl text-base shadow-lg shadow-blue-500/25 flex items-center justify-center gap-2.5 transition"
                    >
                      <QrCode className="w-5 h-5" />
                      <span>Mostrar código QR para comprar</span>
                    </button>
                  </div>

                  {/* Columna Derecha: Datos de la Tarjeta y Beneficios */}
                  <div className="md:col-span-6 space-y-4">
                    <div className="bg-white rounded-3xl p-5 sm:p-6 border border-slate-100 shadow-xs">
                      <div className="text-xs font-black text-slate-800 uppercase tracking-wider mb-3">
                        DATOS DE LA TARJETA
                      </div>

                      <div className="divide-y divide-slate-100 text-xs">
                        <div className="py-2.5 flex justify-between items-center">
                          <span className="text-slate-500 font-medium">Titular de la cuenta</span>
                          <span className="font-bold text-slate-900">{currentClient.nombre}</span>
                        </div>

                        <div className="py-2.5 flex justify-between items-center">
                          <span className="text-slate-500 font-medium">Número de Cuenta</span>
                          <span className="font-mono font-bold text-blue-700 bg-blue-50 px-2 py-0.5 rounded-lg border border-blue-200/80">
                            {currentClient.numeroCuenta || generarNumeroCuentaCliente(currentClient.id)}
                          </span>
                        </div>

                        <div className="py-2.5 flex justify-between items-center">
                          <span className="text-slate-500 font-medium">Tipo de Tarjeta</span>
                          <span className="font-bold text-blue-700">Débito VIP Colmado DAVID</span>
                        </div>

                        <div className="py-2.5 flex justify-between items-center">
                          <span className="text-slate-500 font-medium">Límite de Fiado</span>
                          <span className="font-bold text-slate-900">RD$ {currentClient.limite.toLocaleString('en-US', { minimumFractionDigits: 2 })}</span>
                        </div>

                        <div className="py-2.5 flex justify-between items-center">
                          <span className="text-slate-500 font-medium">Saldo Disponible</span>
                          <span className="font-bold text-emerald-600">RD$ {Math.max(0, currentClient.limite - currentClient.saldo).toLocaleString('en-US', { minimumFractionDigits: 2 })}</span>
                        </div>

                        <div className="py-2.5 flex justify-between items-center">
                          <span className="text-slate-500 font-medium">Estado</span>
                          <span className="font-bold text-emerald-600 flex items-center gap-1">
                            <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                            Activa
                          </span>
                        </div>

                        <div className="py-2.5 flex justify-between items-center flex-wrap gap-2 pt-3 border-t border-slate-100">
                          <div>
                            <span className="text-slate-700 font-bold block text-xs">Clave de Seguridad</span>
                            <span className="text-[10px] text-slate-400">PIN de 4 dígitos para acceder</span>
                          </div>
                          <button
                            type="button"
                            onClick={() => {
                              vibrate();
                              setIsChangePinModalOpen(true);
                            }}
                            className="px-3.5 py-1.5 bg-blue-50 hover:bg-blue-100 text-blue-700 rounded-xl font-bold text-xs flex items-center gap-1.5 border border-blue-200/80 transition active:scale-95 shadow-2xs cursor-pointer touch-manipulation"
                          >
                            <Key className="w-3.5 h-3.5 text-blue-600" />
                            <span>Cambiar PIN</span>
                          </button>
                        </div>
                      </div>
                    </div>

                    <div className="bg-blue-50/70 border border-blue-200/80 rounded-2xl p-4 text-xs text-blue-900 space-y-1.5">
                      <div className="font-bold flex items-center gap-1.5 text-blue-800">
                        <Shield className="w-4 h-4 text-blue-600" />
                        Seguridad de tu Tarjeta
                      </div>
                      <p className="text-[11px] text-blue-800 leading-relaxed">
                        Solo tú y las personas que tengas agregadas en <strong>Personal Autorizado</strong> pueden comprar con tu tarjeta. Puedes bloquear autorizados temporalmente en cualquier momento desde tu Perfil.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* TAB 4: PERFIL (IMAGE 4) — Adaptable a Móvil, Tablet y Desktop */}
            {clientTab === 'perfil' && (
              <div className="p-4 sm:p-6 space-y-5 animate-in fade-in duration-200">
                <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-start">
                  
                  {/* Columna Izquierda: Datos del usuario y del colmado */}
                  <div className="md:col-span-5 space-y-4">
                    {/* User Card */}
                    <div className="bg-white rounded-3xl p-6 text-center border border-slate-100 shadow-xs">
                      <div className="w-20 h-20 rounded-full bg-blue-600 mx-auto mb-3 flex items-center justify-center text-white shadow-lg shadow-blue-500/20">
                        <User className="w-10 h-10 text-white" />
                      </div>
                      <h3 className="text-xl font-black text-slate-900">{currentClient.nombre}</h3>
                      <p className="text-xs font-semibold text-slate-400 mt-0.5">Cliente VIP · {datosColmado.nombre}</p>
                    </div>

                    {/* INFORMACIÓN DE LA CUENTA */}
                    <div className="bg-white rounded-3xl p-5 border border-slate-100 shadow-xs">
                      <div className="text-xs font-black text-slate-800 uppercase tracking-wider mb-3">
                        INFORMACIÓN DE LA CUENTA
                      </div>

                      <div className="divide-y divide-slate-100 text-xs">
                        <div className="py-2.5 flex justify-between items-center">
                          <span className="text-slate-500 font-medium flex items-center gap-2">
                            <User className="w-4 h-4 text-slate-400" />
                            Nombre
                          </span>
                          <span className="font-bold text-slate-900">{currentClient.nombre}</span>
                        </div>

                        <div className="py-2.5 flex justify-between items-center">
                          <span className="text-slate-500 font-medium flex items-center gap-2">
                            <Phone className="w-4 h-4 text-slate-400" />
                            Teléfono
                          </span>
                          <span className="font-mono font-bold text-slate-900">{currentClient.telefono}</span>
                        </div>

                        <div className="py-2.5 flex justify-between items-center">
                          <span className="text-slate-500 font-medium flex items-center gap-2">
                            <CreditCard className="w-4 h-4 text-slate-400" />
                            Número de Cuenta
                          </span>
                          <span className="font-mono font-bold text-blue-700 bg-blue-50 px-2 py-0.5 rounded-lg border border-blue-200/80 text-xs">
                            {currentClient.numeroCuenta || generarNumeroCuentaCliente(currentClient.id)}
                          </span>
                        </div>

                        <div className="py-2.5 flex justify-between items-center flex-wrap gap-2">
                          <span className="text-slate-500 font-medium flex items-center gap-2">
                            <Lock className="w-4 h-4 text-slate-400" />
                            PIN de Seguridad
                          </span>
                          <div className="flex items-center gap-2">
                            <span className="font-mono font-bold text-slate-900 text-sm">
                              {showClientPin ? currentClient.pin : '••••'}
                            </span>
                            <button
                              type="button"
                              onClick={() => setShowClientPin(!showClientPin)}
                              className="text-slate-400 hover:text-slate-600 p-1 rounded-lg hover:bg-slate-100 transition"
                              title={showClientPin ? 'Ocultar PIN' : 'Mostrar PIN'}
                            >
                              {showClientPin ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                            </button>
                            <button
                              type="button"
                              onClick={() => {
                                vibrate();
                                setIsChangePinModalOpen(true);
                              }}
                              className="px-2.5 py-1 bg-blue-50 hover:bg-blue-100 text-blue-700 rounded-xl font-bold text-xs flex items-center gap-1 border border-blue-200/70 transition active:scale-95 shadow-2xs"
                            >
                              <Key className="w-3.5 h-3.5 text-blue-600" />
                              <span>Cambiar PIN</span>
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* INFORMACIÓN DEL NEGOCIO */}
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
                          href={`https://api.whatsapp.com/send?phone=${normalizarTelefonoWhatsApp(datosColmado.whatsapp)}&text=${encodeURIComponent('Hola, me comunico desde la app de ' + datosColmado.nombre)}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="py-2.5 px-3 rounded-xl bg-[#25D366] hover:bg-[#20ba5a] active:scale-95 text-xs font-bold text-white flex items-center justify-center gap-1.5 transition text-center shadow-md shadow-emerald-500/20"
                        >
                          <WhatsAppIcon className="w-4 h-4" />
                          <span>WhatsApp</span>
                        </a>
                      </div>
                    </div>

                    {/* Cerrar Sesión Button */}
                    <button
                      onClick={() => {
                        vibrate();
                        setCurrentClient(null);
                        setCurrentView('landing');
                        showToast('Sesión Cerrada', '', 'info');
                      }}
                      className="w-full py-4 bg-red-50 hover:bg-red-100 text-red-600 font-bold rounded-2xl text-sm flex items-center justify-center gap-2 border border-red-200/60 transition active:scale-98"
                    >
                      <LogOut className="w-4 h-4" />
                      <span>Cerrar sesión</span>
                    </button>
                  </div>

                  {/* Columna Derecha: PERSONAL AUTORIZADO (Requerimiento explícito: agregar, eliminar, editar o bloquear) */}
                  <div className="md:col-span-7 bg-white rounded-3xl p-5 sm:p-6 border border-slate-100 shadow-xs space-y-4">
                    <div className="flex justify-between items-center">
                      <div>
                        <div className="text-xs font-black text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
                          <Users className="w-4 h-4 text-purple-600" />
                          PERSONAL AUTORIZADO
                        </div>
                        <p className="text-[11px] text-slate-400 mt-0.5">
                          Personas autorizadas para retirar fiado a tu nombre.
                        </p>
                      </div>
                      <button
                        type="button"
                        onClick={() => {
                          vibrate(10);
                          setAuthModal({
                            isOpen: true,
                            modo: 'agregar',
                            autorizado: null,
                            targetClienteId: currentClient.id,
                            esCliente: true
                          });
                        }}
                        className="bg-blue-600 hover:bg-blue-700 active:scale-95 text-white py-2 px-4 rounded-xl font-bold transition shadow-md hover:shadow-lg shadow-blue-500/25 flex items-center gap-1.5 shrink-0 cursor-pointer touch-manipulation text-xs"
                      >
                        <UserPlus className="w-4 h-4 text-white" />
                        <span>Agregar +</span>
                      </button>
                    </div>

                    <div className="divide-y divide-slate-100">
                      {clientAutorizados.length === 0 ? (
                        <div className="py-8 text-center bg-slate-50/80 rounded-2xl border border-dashed border-slate-200 p-6 flex flex-col items-center justify-center">
                          <div className="w-12 h-12 rounded-2xl bg-blue-100 text-blue-600 flex items-center justify-center mb-2.5 shadow-2xs">
                            <Users className="w-6 h-6" />
                          </div>
                          <p className="text-xs font-bold text-slate-700">Sin personas autorizadas</p>
                          <p className="text-[11px] text-slate-400 max-w-xs mt-0.5 mb-3">
                            Agrega a familiares o allegados con permiso para retirar fiados a tu nombre.
                          </p>
                          <button
                            type="button"
                            onClick={() => {
                              vibrate(10);
                              setAuthModal({
                                isOpen: true,
                                modo: 'agregar',
                                autorizado: null,
                                targetClienteId: currentClient.id,
                                esCliente: true
                              });
                            }}
                            className="bg-blue-600 hover:bg-blue-700 active:scale-95 text-white py-2 px-4 rounded-xl font-bold transition shadow-md hover:shadow-lg shadow-blue-500/25 flex items-center gap-1.5 cursor-pointer touch-manipulation text-xs"
                          >
                            <UserPlus className="w-4 h-4 text-white" />
                            <span>Agregar +</span>
                          </button>
                        </div>
                      ) : (
                        clientAutorizados.map(a => {
                          const esTitular = a.parentesco.toLowerCase() === 'titular';
                          return (
                            <div key={a.id} className="py-3.5 flex items-center justify-between">
                              <div className="min-w-0 pr-3">
                                <div className="flex items-center gap-2 flex-wrap">
                                  <span className="font-bold text-sm text-slate-900 truncate">{a.nombre}</span>
                                  {a.bloqueado ? (
                                    <span className="text-[9px] bg-red-100 text-red-700 font-extrabold px-2 py-0.5 rounded-md">
                                      Bloqueado
                                    </span>
                                  ) : (
                                    <span className="text-[9px] bg-emerald-100 text-emerald-700 font-bold px-2 py-0.5 rounded-md">
                                      Activo
                                    </span>
                                  )}
                                </div>
                                <div className="text-xs text-slate-400 flex items-center gap-2 mt-0.5">
                                  <span className="font-medium text-slate-600">{a.parentesco}</span>
                                  {a.telefono && <span>· Tel: {a.telefono}</span>}
                                </div>
                              </div>

                              {esTitular ? (
                                <span className="text-[10px] bg-blue-100 text-blue-700 px-2.5 py-1 rounded-full font-black tracking-wide shrink-0">
                                  TITULAR
                                </span>
                              ) : (
                                <div className="flex items-center gap-1.5 shrink-0">
                                  {/* Bloquear / Desbloquear */}
                                  <button
                                    onClick={async () => {
                                      vibrate(10);
                                      const nuevoEstado = !a.bloqueado;
                                      await store.bloquearAutorizado(a.id, nuevoEstado, true);
                                      setClientAutorizados(store.getAutorizadosDeCliente(currentClient.id));
                                      showToast(
                                        nuevoEstado ? 'Autorizado bloqueado' : 'Autorizado activo',
                                        nuevoEstado ? `${a.nombre} ya no podrá retirar fiado` : `${a.nombre} puede retirar fiado`,
                                        nuevoEstado ? 'warning' : 'success'
                                      );
                                    }}
                                    title={a.bloqueado ? 'Desbloquear autorizado' : 'Bloquear autorizado'}
                                    className={`px-2.5 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1 transition ${
                                      a.bloqueado
                                        ? 'bg-amber-100 text-amber-800 hover:bg-amber-200'
                                        : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                                    }`}
                                  >
                                    {a.bloqueado ? <Unlock className="w-3.5 h-3.5" /> : <Lock className="w-3.5 h-3.5" />}
                                    <span className="hidden sm:inline">{a.bloqueado ? 'Desbloquear' : 'Bloquear'}</span>
                                  </button>

                                  {/* Editar */}
                                  <button
                                    onClick={() => {
                                      vibrate();
                                      setAuthModal({
                                        isOpen: true,
                                        modo: 'editar',
                                        autorizado: a,
                                        targetClienteId: currentClient.id,
                                        esCliente: true
                                      });
                                    }}
                                    title="Editar"
                                    className="w-8 h-8 rounded-xl bg-blue-50 text-blue-600 hover:bg-blue-100 flex items-center justify-center transition"
                                  >
                                    <Edit2 className="w-3.5 h-3.5" />
                                  </button>

                                  {/* Eliminar */}
                                  <button
                                    onClick={() => {
                                      vibrate();
                                      setDeleteAuthModal({
                                        autorizado: a,
                                        targetClienteId: currentClient.id,
                                        esCliente: true
                                      });
                                    }}
                                    title="Eliminar"
                                    className="w-8 h-8 rounded-xl bg-red-50 text-red-600 hover:bg-red-100 flex items-center justify-center transition"
                                  >
                                    <Trash2 className="w-3.5 h-3.5" />
                                  </button>
                                </div>
                              )}
                            </div>
                          );
                        })
                      )}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Bottom Nav Client (solo móvil < 768px para evitar tapar la pantalla en desktop) */}
            <nav className="md:hidden fixed bottom-0 left-0 right-0 w-full bg-white/95 backdrop-blur-md border-t border-slate-200/80 px-2 py-2 flex items-center justify-around z-30 shadow-lg">
              <button
                type="button"
                onClick={() => { vibrate(); setClientTab('inicio'); }}
                className={`flex-1 flex flex-col items-center py-1 font-bold text-[10px] transition touch-manipulation cursor-pointer ${
                  clientTab === 'inicio' ? 'text-blue-600' : 'text-slate-400 hover:text-slate-600'
                }`}
              >
                <Home className="w-5 h-5 mb-0.5" />
                <span>Inicio</span>
              </button>

              <button
                type="button"
                onClick={() => { vibrate(); setClientTab('tarjeta'); }}
                className={`flex-1 flex flex-col items-center py-1 font-bold text-[10px] transition touch-manipulation cursor-pointer ${
                  clientTab === 'tarjeta' ? 'text-blue-600' : 'text-slate-400 hover:text-slate-600'
                }`}
              >
                <CreditCard className="w-5 h-5 mb-0.5" />
                <span>Card</span>
              </button>

              <button
                type="button"
                onClick={() => { vibrate(); setClientTab('movimientos'); }}
                className={`flex-1 flex flex-col items-center py-1 font-bold text-[10px] transition touch-manipulation cursor-pointer ${
                  clientTab === 'movimientos' || clientTab === 'historial' ? 'text-blue-600' : 'text-slate-400 hover:text-slate-600'
                }`}
              >
                <ListOrdered className="w-5 h-5 mb-0.5" />
                <span className="truncate">Historial</span>
              </button>

              <button
                type="button"
                onClick={() => { vibrate(); setClientTab('perfil'); }}
                className={`flex-1 flex flex-col items-center py-1 font-bold text-[10px] transition touch-manipulation cursor-pointer ${
                  clientTab === 'perfil' ? 'text-blue-600' : 'text-slate-400 hover:text-slate-600'
                }`}
              >
                <User className="w-5 h-5 mb-0.5" />
                <span>Perfil</span>
              </button>
            </nav>
          </div>
        )}
      </div>
    </div>
  );
}
