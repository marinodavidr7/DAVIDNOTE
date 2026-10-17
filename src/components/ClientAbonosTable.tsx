import React, { useState, useMemo } from 'react';
import { ArrowDownLeft, Calendar, FileText, Search, Download, CheckCircle2, Receipt, ShieldCheck } from 'lucide-react';
import { Movimiento } from '../types';
import { formatoMoneda } from '../utils/paymentCycle';
import { generarReporteAbonosClientePDF } from '../utils/pdfGenerator';

interface ClientAbonosTableProps {
  movimientos: Movimiento[];
  clienteNombre: string;
  clienteTelefono?: string;
  onSelectAbono: (m: Movimiento) => void;
}

export const ClientAbonosTable: React.FC<ClientAbonosTableProps> = ({
  movimientos,
  clienteNombre,
  clienteTelefono = '',
  onSelectAbono
}) => {
  const [busqueda, setBusqueda] = useState('');

  // Filtrar exclusivamente los movimientos de tipo Abono
  const todosAbonos = useMemo(() => {
    return movimientos
      .filter(m => m.tipo === 'Abono')
      .sort((a, b) => new Date(b.fechaHora).getTime() - new Date(a.fechaHora).getTime() || b.idMov - a.idMov);
  }, [movimientos]);

  // Filtrar por término de búsqueda (fecha, observaciones, ID, monto)
  const abonosFiltrados = useMemo(() => {
    if (!busqueda.trim()) return todosAbonos;
    const query = busqueda.toLowerCase().trim();
    return todosAbonos.filter(a => {
      const fecha = (a.fechaTexto || a.fechaHora).toLowerCase();
      const obs = (a.observaciones || '').toLowerCase();
      const id = String(a.idMov);
      const monto = String(a.monto);
      return fecha.includes(query) || obs.includes(query) || id.includes(query) || monto.includes(query);
    });
  }, [todosAbonos, busqueda]);

  // Estadísticas de Abonos
  const totalAbonado = useMemo(() => {
    return todosAbonos.reduce((acc, a) => acc + a.monto, 0);
  }, [todosAbonos]);

  const ultimoAbono = todosAbonos[0] || null;

  const handleDescargarPDF = () => {
    generarReporteAbonosClientePDF(todosAbonos, {
      nombreCliente: clienteNombre,
      telefonoCliente: clienteTelefono
    });
  };

  return (
    <div className="bg-white rounded-3xl p-5 border border-slate-100 shadow-sm space-y-4">
      {/* Encabezado de la Sección */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-2 border-b border-slate-100">
        <div>
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0 shadow-2xs">
              <ArrowDownLeft className="w-4 h-4" />
            </div>
            <div>
              <h4 className="font-black text-slate-900 text-sm sm:text-base flex items-center gap-1.5">
                <span>Historial de Abonos Realizados</span>
                <span className="text-[10px] font-extrabold bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-full">
                  {todosAbonos.length} {todosAbonos.length === 1 ? 'abono' : 'abonos'}
                </span>
              </h4>
              <p className="text-[11px] text-slate-500 font-medium">
                Tabla de pagos recibidos con fecha, monto y comprobante para total transparencia
              </p>
            </div>
          </div>
        </div>

        {todosAbonos.length > 0 && (
          <button
            type="button"
            onClick={handleDescargarPDF}
            className="self-start sm:self-auto px-3.5 py-2 bg-emerald-50 hover:bg-emerald-100 active:bg-emerald-200 text-emerald-800 text-xs font-bold rounded-xl border border-emerald-200 flex items-center gap-1.5 transition shadow-2xs"
            title="Descargar comprobante en PDF de todos los abonos"
          >
            <Download className="w-3.5 h-3.5 text-emerald-700" />
            <span>Descargar PDF</span>
          </button>
        )}
      </div>

      {/* Tarjetas KPI de Resumen de Transparencia */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
        <div className="bg-gradient-to-br from-emerald-50/90 to-teal-50/60 border border-emerald-200/80 rounded-2xl p-3">
          <div className="text-[10px] uppercase font-bold text-emerald-700 tracking-wider flex items-center gap-1">
            <ShieldCheck className="w-3 h-3 text-emerald-600" />
            <span>Total Pagado</span>
          </div>
          <div className="text-lg sm:text-xl font-black text-emerald-900 mt-0.5">
            {formatoMoneda(totalAbonado)}
          </div>
          <div className="text-[10px] text-emerald-700/80 font-medium mt-0.5">
            Suma de todos los abonos
          </div>
        </div>

        <div className="bg-slate-50 border border-slate-200/80 rounded-2xl p-3">
          <div className="text-[10px] uppercase font-bold text-slate-500 tracking-wider flex items-center gap-1">
            <Receipt className="w-3 h-3 text-slate-500" />
            <span>Cantidad de Pagos</span>
          </div>
          <div className="text-lg sm:text-xl font-black text-slate-800 mt-0.5">
            {todosAbonos.length}
          </div>
          <div className="text-[10px] text-slate-500 font-medium mt-0.5">
            {todosAbonos.length === 1 ? 'Transacción registrada' : 'Transacciones registradas'}
          </div>
        </div>

        <div className="col-span-2 sm:col-span-1 bg-slate-50 border border-slate-200/80 rounded-2xl p-3">
          <div className="text-[10px] uppercase font-bold text-slate-500 tracking-wider flex items-center gap-1">
            <Calendar className="w-3 h-3 text-slate-500" />
            <span>Último Abono</span>
          </div>
          <div className="text-sm font-black text-slate-800 mt-0.5">
            {ultimoAbono ? formatoMoneda(ultimoAbono.monto) : 'Ninguno'}
          </div>
          <div className="text-[10px] text-slate-500 font-medium mt-0.5 truncate">
            {ultimoAbono ? `${ultimoAbono.fechaTexto || ultimoAbono.fechaHora.slice(0, 10)}` : 'Sin abonos aún'}
          </div>
        </div>
      </div>

      {/* Buscador de Abonos si hay más de 3 */}
      {todosAbonos.length > 3 && (
        <div className="relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={busqueda}
            onChange={e => setBusqueda(e.target.value)}
            placeholder="Buscar por fecha, observación o monto de abono..."
            className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-800 placeholder:text-slate-400 focus:outline-hidden focus:border-emerald-500 focus:bg-white transition"
          />
          {busqueda && (
            <button
              type="button"
              onClick={() => setBusqueda('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-[10px] font-bold text-slate-400 hover:text-slate-600"
            >
              Limpiar
            </button>
          )}
        </div>
      )}

      {/* Contenedor de la Tabla */}
      {todosAbonos.length === 0 ? (
        <div className="py-8 text-center text-slate-400 text-xs border border-dashed border-slate-200 rounded-2xl bg-slate-50/60 space-y-1.5">
          <ArrowDownLeft className="w-7 h-7 text-slate-300 mx-auto" />
          <div className="font-bold text-slate-600">No hay abonos registrados para este cliente</div>
          <div className="text-[11px] text-slate-400 max-w-xs mx-auto">
            Cuando el cliente realice un pago mediante «Registrar Abono», aparecerá detallado en esta tabla con su respectivo comprobante.
          </div>
        </div>
      ) : abonosFiltrados.length === 0 ? (
        <div className="py-6 text-center text-slate-400 text-xs border border-slate-200 rounded-2xl bg-slate-50">
          No se encontraron abonos que coincidan con &quot;{busqueda}&quot;
        </div>
      ) : (
        <div className="overflow-auto max-h-[60vh] rounded-2xl border border-slate-200 shadow-2xs bg-white">
          <table className="w-full text-left text-xs border-collapse font-sans min-w-[540px]">
            {/* Encabezado de la Tabla */}
            <thead>
              <tr className="sticky top-0 z-10 bg-slate-100 border-b border-slate-200 text-slate-700 font-black text-[10px] uppercase tracking-wider select-none">
                <th className="py-2.5 px-3 border-r border-slate-200 text-center w-12 bg-slate-200/50">#</th>
                <th className="py-2.5 px-3 border-r border-slate-200 text-center w-20">Recibo</th>
                <th className="py-2.5 px-3 border-r border-slate-200">Fecha y Hora</th>
                <th className="py-2.5 px-3 border-r border-slate-200 text-right">Monto Abonado</th>
                <th className="py-2.5 px-3 border-r border-slate-200">Observaciones / Detalle</th>
                <th className="py-2.5 px-3 text-center w-24">Acción</th>
              </tr>
            </thead>

            {/* Cuerpo de la Tabla */}
            <tbody className="divide-y divide-slate-100">
              {abonosFiltrados.map((abono, idx) => {
                const zebra = idx % 2 === 1 ? 'bg-slate-50/50' : 'bg-white';
                return (
                  <tr
                    key={abono.idMov}
                    onClick={() => onSelectAbono(abono)}
                    className={`${zebra} hover:bg-emerald-50/70 cursor-pointer transition-colors group`}
                    title="Haz clic para ver el comprobante oficial de este abono"
                  >
                    {/* Número correlativo */}
                    <td className="py-2.5 px-3 border-r border-slate-200 text-center font-mono text-[11px] text-slate-400 bg-slate-50/40">
                      {idx + 1}
                    </td>

                    {/* ID Comprobante */}
                    <td className="py-2.5 px-3 border-r border-slate-200 text-center font-mono font-bold text-slate-700 text-xs">
                      <span className="bg-slate-100 text-slate-700 px-1.5 py-0.5 rounded-md border border-slate-200 text-[10px]">
                        #{abono.idMov}
                      </span>
                    </td>

                    {/* Fecha y Hora */}
                    <td className="py-2.5 px-3 border-r border-slate-200 whitespace-nowrap">
                      <div className="font-bold text-slate-800">
                        {abono.fechaTexto || abono.fechaHora.slice(0, 10)}
                      </div>
                      <div className="text-[10px] text-slate-400 font-medium">
                        {abono.hora || '—'}
                      </div>
                    </td>

                    {/* Monto */}
                    <td className="py-2.5 px-3 border-r border-slate-200 text-right whitespace-nowrap">
                      <span className="font-black font-mono text-sm text-emerald-700 bg-emerald-50/80 px-2 py-0.5 rounded-md border border-emerald-200/60 inline-block">
                        +{formatoMoneda(abono.monto)}
                      </span>
                    </td>

                    {/* Observaciones */}
                    <td className="py-2.5 px-3 border-r border-slate-200 text-slate-600 text-[11px]">
                      <div className="font-medium text-slate-800">
                        {abono.observaciones || 'Pago recibido'}
                      </div>
                      {abono.fiadosPagadosIds && abono.fiadosPagadosIds.length > 0 && (
                        <div className="text-[10px] text-emerald-700 font-semibold mt-0.5 flex items-center gap-1">
                          <CheckCircle2 className="w-3 h-3 shrink-0" />
                          <span>Aplicado a fiados: #{abono.fiadosPagadosIds.join(', #')}</span>
                        </div>
                      )}
                    </td>

                    {/* Acción / Ver Comprobante */}
                    <td className="py-2.5 px-3 text-center whitespace-nowrap">
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          onSelectAbono(abono);
                        }}
                        className="inline-flex items-center gap-1 px-2.5 py-1 bg-white hover:bg-emerald-600 text-slate-700 hover:text-white border border-slate-200 hover:border-emerald-600 rounded-lg text-[10px] font-bold transition shadow-2xs group-hover:border-emerald-400"
                        title="Ver recibo de este abono"
                      >
                        <FileText className="w-3 h-3 text-emerald-600 group-hover:text-white transition" />
                        <span>Recibo</span>
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>

            {/* Pie de Tabla con Totales */}
            <tfoot>
              <tr className="bg-slate-100/95 border-t-2 border-slate-300 font-mono text-xs font-black text-slate-800">
                <td colSpan={3} className="py-2.5 px-3 text-right uppercase tracking-wider text-slate-600 font-sans border-r border-slate-200 text-[11px]">
                  Total de Abonos en esta vista ({abonosFiltrados.length}):
                </td>
                <td className="py-2.5 px-3 text-right text-emerald-700 bg-emerald-50/70 border-r border-slate-200 text-sm">
                  {formatoMoneda(abonosFiltrados.reduce((acc, a) => acc + a.monto, 0))}
                </td>
                <td colSpan={2} className="py-2.5 px-3 text-[10px] text-slate-400 font-sans font-normal italic">
                  Todos los abonos quedan auditados en la cuenta
                </td>
              </tr>
            </tfoot>
          </table>
        </div>
      )}
    </div>
  );
};
