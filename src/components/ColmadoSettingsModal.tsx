import React, { useState, useEffect } from 'react';
import {
  Store,
  MapPin,
  Phone,
  Clock,
  Calendar,
  MessageCircle,
  FileText,
  X,
  Save,
  RotateCcw,
  CheckCircle2,
  Eye,
  ShoppingBag
} from 'lucide-react';
import { DatosColmado } from '../types';
import { store } from '../services/storeService';

interface ColmadoSettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSaved: (datos: DatosColmado) => void;
}

export const ColmadoSettingsModal: React.FC<ColmadoSettingsModalProps> = ({
  isOpen,
  onClose,
  onSaved
}) => {
  const [formData, setFormData] = useState<DatosColmado>(store.getDatosColmado());
  const [tab, setTab] = useState<'formulario' | 'preview'>('formulario');
  const [isSaved, setIsSaved] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setFormData(store.getDatosColmado());
      setIsSaved(false);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    const updated = store.actualizarDatosColmado(formData);
    setIsSaved(true);
    onSaved(updated);
    setTimeout(() => {
      onClose();
    }, 600);
  };

  const handleReset = () => {
    const defaultData: DatosColmado = {
      nombre: 'Súper Colmado DAVID',
      slogan: 'Tu colmado de confianza',
      direccion: 'Calle Principal #45, Ensanche La Fe, Santo Domingo, D.N.',
      telefono: '829-555-0101',
      whatsapp: '829-555-0101',
      horario: '6:30 AM - 11:00 PM',
      diasAtencion: 'Lunes a Domingo',
      rnc: '131-98765-4',
      nota: '¡Gracias por su preferencia! Servicio a domicilio disponible.'
    };
    setFormData(defaultData);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl w-full max-w-lg shadow-2xl overflow-hidden flex flex-col max-h-[90vh] border border-slate-100">
        
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-700 via-blue-800 to-indigo-900 p-5 text-white flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-white/20 backdrop-blur-md flex items-center justify-center border border-white/20">
              <Store className="w-6 h-6 text-yellow-300" />
            </div>
            <div>
              <h2 className="text-lg font-black tracking-tight">Datos del Colmado</h2>
              <p className="text-xs text-blue-200">
                Nombre, dirección, teléfono, horario y datos oficiales
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-9 h-9 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation Tabs */}
        <div className="flex border-b border-slate-200 px-5 pt-3 bg-slate-50 gap-4">
          <button
            type="button"
            onClick={() => setTab('formulario')}
            className={`pb-3 text-xs font-bold transition border-b-2 flex items-center gap-1.5 ${
              tab === 'formulario'
                ? 'border-blue-600 text-blue-700'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <Store className="w-4 h-4" />
            Editar Información
          </button>

          <button
            type="button"
            onClick={() => setTab('preview')}
            className={`pb-3 text-xs font-bold transition border-b-2 flex items-center gap-1.5 ${
              tab === 'preview'
                ? 'border-blue-600 text-blue-700'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <Eye className="w-4 h-4" />
            Vista Previa de la Ficha
          </button>
        </div>

        {/* Content Body */}
        <div className="flex-1 overflow-y-auto p-5">
          {tab === 'formulario' ? (
            <form id="colmado-settings-form" onSubmit={handleSave} className="space-y-4">
              
              {/* Nombre y Slogan */}
              <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200/80 space-y-3">
                <span className="text-[11px] font-black uppercase text-blue-800 tracking-wider flex items-center gap-1">
                  <Store className="w-3.5 h-3.5" /> Identidad del Negocio
                </span>
                
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Nombre del Colmado *
                  </label>
                  <input
                    type="text"
                    name="nombre"
                    required
                    value={formData.nombre}
                    onChange={handleChange}
                    placeholder="Ej. Súper Colmado DAVID"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 focus:outline-hidden focus:ring-2 focus:ring-blue-500 bg-white text-sm font-semibold text-slate-900"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Slogan o Lema Comercial
                  </label>
                  <input
                    type="text"
                    name="slogan"
                    value={formData.slogan}
                    onChange={handleChange}
                    placeholder="Ej. Tu colmado de confianza"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 focus:outline-hidden focus:ring-2 focus:ring-blue-500 bg-white text-sm text-slate-900"
                  />
                </div>
              </div>

              {/* Ubicación y Dirección */}
              <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200/80 space-y-3">
                <span className="text-[11px] font-black uppercase text-blue-800 tracking-wider flex items-center gap-1">
                  <MapPin className="w-3.5 h-3.5" /> Ubicación y Dirección
                </span>
                
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Dirección Física *
                  </label>
                  <input
                    type="text"
                    name="direccion"
                    required
                    value={formData.direccion}
                    onChange={handleChange}
                    placeholder="Calle, número, sector, ciudad"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 focus:outline-hidden focus:ring-2 focus:ring-blue-500 bg-white text-sm text-slate-900"
                  />
                  <p className="text-[10px] text-slate-400 mt-1">
                    Esta dirección aparecerá en los recibos impresos en PDF y en la ficha de los clientes.
                  </p>
                </div>
              </div>

              {/* Teléfonos y Contacto */}
              <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200/80 space-y-3">
                <span className="text-[11px] font-black uppercase text-blue-800 tracking-wider flex items-center gap-1">
                  <Phone className="w-3.5 h-3.5" /> Canales de Contacto
                </span>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Teléfono de Llamadas *
                    </label>
                    <input
                      type="text"
                      name="telefono"
                      required
                      value={formData.telefono}
                      onChange={handleChange}
                      placeholder="Ej. 829-555-0101"
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 focus:outline-hidden focus:ring-2 focus:ring-blue-500 bg-white text-sm text-slate-900 font-medium"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1 flex items-center gap-1">
                      <MessageCircle className="w-3 h-3 text-emerald-600" /> WhatsApp Oficial
                    </label>
                    <input
                      type="text"
                      name="whatsapp"
                      value={formData.whatsapp}
                      onChange={handleChange}
                      placeholder="Ej. 829-555-0101"
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 focus:outline-hidden focus:ring-2 focus:ring-blue-500 bg-white text-sm text-slate-900 font-medium"
                    />
                  </div>
                </div>
              </div>

              {/* Horarios y Atención */}
              <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200/80 space-y-3">
                <span className="text-[11px] font-black uppercase text-blue-800 tracking-wider flex items-center gap-1">
                  <Clock className="w-3.5 h-3.5" /> Horarios de Servicio
                </span>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Horario Diario *
                    </label>
                    <input
                      type="text"
                      name="horario"
                      required
                      value={formData.horario}
                      onChange={handleChange}
                      placeholder="Ej. 6:30 AM - 11:00 PM"
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 focus:outline-hidden focus:ring-2 focus:ring-blue-500 bg-white text-sm text-slate-900"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1 flex items-center gap-1">
                      <Calendar className="w-3 h-3 text-blue-600" /> Días de Atención
                    </label>
                    <input
                      type="text"
                      name="diasAtencion"
                      value={formData.diasAtencion}
                      onChange={handleChange}
                      placeholder="Ej. Lunes a Domingo"
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 focus:outline-hidden focus:ring-2 focus:ring-blue-500 bg-white text-sm text-slate-900"
                    />
                  </div>
                </div>
              </div>

              {/* RNC y Notas del Recibo */}
              <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200/80 space-y-3">
                <span className="text-[11px] font-black uppercase text-blue-800 tracking-wider flex items-center gap-1">
                  <FileText className="w-3.5 h-3.5" /> RNC y Notas de Recibo
                </span>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    RNC / Registro Mercantil (Opcional)
                  </label>
                  <input
                    type="text"
                    name="rnc"
                    value={formData.rnc || ''}
                    onChange={handleChange}
                    placeholder="Ej. 131-98765-4"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 focus:outline-hidden focus:ring-2 focus:ring-blue-500 bg-white text-sm text-slate-900"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Mensaje de Agradecimiento / Nota al Pie
                  </label>
                  <textarea
                    name="nota"
                    rows={2}
                    value={formData.nota || ''}
                    onChange={handleChange}
                    placeholder="Texto que saldrá al final de los recibos de fiado o abono"
                    className="w-full px-3.5 py-2 rounded-xl border border-slate-300 focus:outline-hidden focus:ring-2 focus:ring-blue-500 bg-white text-xs text-slate-900"
                  />
                </div>
              </div>
            </form>
          ) : (
            /* Vista Previa de la Ficha */
            <div className="space-y-4">
              <div className="bg-gradient-to-b from-blue-900 via-blue-800 to-indigo-950 text-white rounded-3xl p-5 shadow-xl relative overflow-hidden">
                <div className="w-14 h-14 bg-white/20 rounded-2xl flex items-center justify-center mb-3">
                  <ShoppingBag className="w-8 h-8 text-yellow-300" />
                </div>
                <h3 className="text-xl font-black">{formData.nombre}</h3>
                <p className="text-yellow-300 text-xs font-bold">{formData.slogan}</p>
                {formData.rnc && (
                  <span className="inline-block mt-1 text-[10px] bg-white/10 px-2 py-0.5 rounded-full text-blue-200">
                    RNC: {formData.rnc}
                  </span>
                )}

                <div className="mt-4 pt-3 border-t border-white/10 space-y-2 text-xs text-blue-100">
                  <div className="flex items-start gap-2">
                    <MapPin className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                    <span>{formData.direccion}</span>
                  </div>

                  <div className="flex items-center gap-2">
                    <Phone className="w-4 h-4 text-amber-400 shrink-0" />
                    <span>Tel: {formData.telefono}</span>
                  </div>

                  <div className="flex items-center gap-2">
                    <MessageCircle className="w-4 h-4 text-emerald-400 shrink-0" />
                    <span>WhatsApp: {formData.whatsapp}</span>
                  </div>

                  <div className="flex items-center gap-2">
                    <Clock className="w-4 h-4 text-cyan-400 shrink-0" />
                    <span>{formData.horario} ({formData.diasAtencion})</span>
                  </div>
                </div>
              </div>

              {/* Simulación de Recibo Térmico */}
              <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 text-slate-800 text-xs font-mono space-y-1 shadow-inner">
                <div className="text-center font-bold text-sm text-slate-900">{formData.nombre.toUpperCase()}</div>
                <div className="text-center text-[10px] text-slate-600">{formData.slogan}</div>
                <div className="text-center text-[10px] text-slate-600">{formData.direccion}</div>
                <div className="text-center text-[10px] text-slate-600">Tel: {formData.telefono} · {formData.horario}</div>
                {formData.rnc && (
                  <div className="text-center text-[10px] text-slate-600">RNC: {formData.rnc}</div>
                )}
                <div className="border-t border-dashed border-slate-300 my-2 pt-1 text-center text-[11px] font-bold">
                  *** COMPROBANTE DE COMPRA ***
                </div>
                <div className="flex justify-between text-[11px]">
                  <span>TOTAL:</span>
                  <span className="font-bold">RD$ 1,250.00</span>
                </div>
                <div className="border-t border-dashed border-slate-300 my-2 pt-1 text-center text-[10px] text-slate-500 italic">
                  {formData.nota || '¡Gracias por su compra!'}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 bg-slate-50 border-t border-slate-200 flex items-center justify-between">
          <button
            type="button"
            onClick={handleReset}
            className="px-3 py-2 text-xs font-bold text-slate-600 hover:text-slate-900 flex items-center gap-1.5 transition rounded-xl hover:bg-slate-200/60"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            Restablecer
          </button>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 text-xs font-bold text-slate-600 hover:text-slate-900 transition rounded-xl hover:bg-slate-200/60"
            >
              Cancelar
            </button>

            <button
              type="submit"
              form="colmado-settings-form"
              className={`px-5 py-2.5 rounded-xl font-bold text-xs text-white flex items-center gap-2 shadow-lg transition active:scale-98 ${
                isSaved
                  ? 'bg-emerald-600 hover:bg-emerald-700'
                  : 'bg-blue-600 hover:bg-blue-700'
              }`}
            >
              {isSaved ? (
                <>
                  <CheckCircle2 className="w-4 h-4" />
                  ¡Guardado!
                </>
              ) : (
                <>
                  <Save className="w-4 h-4" />
                  Guardar Datos
                </>
              )}
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};
