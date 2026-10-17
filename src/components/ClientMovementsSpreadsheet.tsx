import React from 'react';
import { ShoppingBag, ArrowDownLeft, FileSpreadsheet, CheckCircle2 } from 'lucide-react';
import { Movimiento } from '../types';
import { formatoMoneda } from '../utils/paymentCycle';

interface ClientMovementsSpreadsheetProps {
  movimientos: Movimiento[];
  fechaCorteFiltro?: string;
  onSelectMovimiento: (m: Movimiento) => void;
  saldoActual?: number;
}

export const ClientMovementsSpreadsheet: React.FC<ClientMovementsSpreadsheetProps> = ({
  movimientos,
  fechaCorteFiltro = '',
  onSelectMovimiento,
  saldoActual = 0,
}) => {
  const totalFiados = movimientos
    .filter((m) => m.tipo === 'Fiado')
    .reduce((sum, m) => sum + m.monto, 0);

  const totalAbonos = movimientos
    .filter((m) => m.tipo === 'Abono')
    .reduce((sum, m) => sum + m.monto, 0);

  if (movimientos.length === 0) {
    return (
      <div className="py-8 text-center text-slate-400 text-xs border border-dashed border-slate-200 rounded-2xl bg-slate-50/50">
        <FileSpreadsheet className="w-8 h-8 text-slate-300 mx-auto mb-2" />
        <span>No hay movimientos registrados en la hoja para este cliente</span>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      {/* Indicador estilo Hoja de Cálculo */}
      <div className="flex items-center justify-between text-[11px] text-slate-500 px-1 font-sans">
        <div className="flex items-center gap-1.5 font-bold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200/60">
          <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-600" />
          <span>Formato Hoja de Cálculo</span>
        </div>
        <span className="text-[10px] text-slate-400">Toca cualquier fila para ver recibo</span>
      </div>

      {/* Contenedor de la Tabla con scroll horizontal */}
      <div className="overflow-auto max-h-[60vh] rounded-2xl border border-slate-200 shadow-2xs bg-white">
        <table className="w-full text-left text-xs border-collapse font-sans min-w-[560px]">
          {/* Encabezado estilo Excel / Google Sheets */}
          <thead>
            <tr className="sticky top-0 z-10 bg-slate-100 border-b border-slate-200 text-slate-700 font-black text-[10px] uppercase tracking-wider select-none">
              <th className="py-2.5 px-3 border-r border-slate-200 text-center w-12 bg-slate-200/60">#</th>
              <th className="py-2.5 px-3 border-r border-slate-200">Fecha</th>
              <th className="py-2.5 px-3 border-r border-slate-200">Hora</th>
              <th className="py-2.5 px-3 border-r border-slate-200 text-center">Tipo</th>
              <th className="py-2.5 px-3 border-r border-slate-200 text-right">Monto</th>
              <th className="py-2.5 px-3 border-r border-slate-200">Retirado Por</th>
              <th className="py-2.5 px-3 border-r border-slate-200">Detalle / Obs</th>
              <th className="py-2.5 px-3 text-center">Estado</th>
            </tr>
          </thead>

          {/* Filas de Movimientos */}
          <tbody className="divide-y divide-slate-100">
            {movimientos.map((m, idx) => {
              const esFiado = m.tipo === 'Fiado';
              const esPagado = esFiado && m.pagado;
              const isAnterior = fechaCorteFiltro ? m.fechaHora.slice(0, 10) < fechaCorteFiltro : false;
              const rowZebra = idx % 2 === 1 ? 'bg-slate-50/60' : 'bg-white';

              return (
                <tr
                  key={m.idMov}
                  onClick={() => onSelectMovimiento(m)}
                  className={`${rowZebra} hover:bg-blue-50/80 cursor-pointer transition-colors ${
                    isAnterior ? 'opacity-60 bg-slate-100/50' : ''
                  }`}
                  title="Haz clic para ver el recibo"
                >
                  {/* Número de fila / ID */}
                  <td className="py-2 px-3 border-r border-slate-200 text-center font-mono text-[10px] text-slate-400 bg-slate-50/50">
                    {idx + 1}
                  </td>

                  {/* Fecha */}
                  <td className="py-2 px-3 border-r border-slate-200 font-semibold text-slate-700 whitespace-nowrap">
                    <span className={isAnterior ? 'line-through text-slate-400' : ''}>
                      {m.fechaTexto || m.fechaHora.slice(0, 10)}
                    </span>
                    {isAnterior && (
                      <span className="ml-1 text-[8px] bg-slate-200 text-slate-600 px-1 py-0.2 rounded font-bold uppercase not-italic">
                        Ant.
                      </span>
                    )}
                  </td>

                  {/* Hora */}
                  <td className="py-2 px-3 border-r border-slate-200 text-slate-500 text-[11px] whitespace-nowrap">
                    {m.hora || '—'}
                  </td>

                  {/* Tipo */}
                  <td className="py-2 px-3 border-r border-slate-200 text-center whitespace-nowrap">
                    {esFiado ? (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-red-100 text-red-700 border border-red-200/60">
                        <ShoppingBag className="w-2.5 h-2.5" />
                        FIADO
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-emerald-100 text-emerald-700 border border-emerald-200/60">
                        <ArrowDownLeft className="w-2.5 h-2.5" />
                        ABONO
                      </span>
                    )}
                  </td>

                  {/* Monto */}
                  <td className="py-2 px-3 border-r border-slate-200 text-right whitespace-nowrap font-mono font-black">
                    <span className={isAnterior ? 'line-through text-slate-400' : esFiado ? 'text-red-600' : 'text-emerald-600'}>
                      {esFiado ? '-' : '+'}{formatoMoneda(m.monto)}
                    </span>
                    {esFiado && !esPagado && (m.montoPagado || 0) > 0 && (
                      <div className="text-[9px] font-sans font-extrabold text-amber-700 mt-0.5">
                        Resta: {formatoMoneda(m.saldoPendiente || 0)}
                      </div>
                    )}
                  </td>

                  {/* Retirado Por */}
                  <td className="py-2 px-3 border-r border-slate-200 text-slate-700 text-[11px] truncate max-w-[120px]">
                    {m.autorizadoNombre && m.autorizadoNombre !== '-' ? (
                      <span className="font-semibold">{m.autorizadoNombre}</span>
                    ) : (
                      <span className="text-slate-400">Titular</span>
                    )}
                  </td>

                  {/* Detalle / Observación */}
                  <td className="py-2 px-3 border-r border-slate-200 text-slate-600 text-[11px] truncate max-w-[160px]">
                    {m.observaciones ? (
                      <span title={m.observaciones}>{m.observaciones}</span>
                    ) : (
                      <span className="text-slate-300 italic">—</span>
                    )}
                  </td>

                  {/* Estado */}
                  <td className="py-2 px-3 text-center whitespace-nowrap">
                    {esPagado ? (
                      <span className="inline-flex items-center gap-1 text-[9px] font-extrabold text-emerald-700 bg-emerald-50 border border-emerald-200 px-1.5 py-0.5 rounded-md">
                        <CheckCircle2 className="w-2.5 h-2.5 text-emerald-600" />
                        PAGADO
                      </span>
                    ) : esFiado ? (
                      (m.montoPagado || 0) > 0 ? (
                        <span
                          className="inline-flex items-center gap-1 text-[9px] font-black text-amber-900 bg-amber-100 border border-amber-300 px-2 py-0.5 rounded-md"
                          title={`Abonado: RD$ ${m.montoPagado} · Pendiente para la otra cuenta: RD$ ${m.saldoPendiente}`}
                        >
                          PAGO {formatoMoneda(m.montoPagado || 0)} / PENDIENTE {formatoMoneda(m.saldoPendiente || 0)}
                        </span>
                      ) : (
                        <span className="text-[9px] font-extrabold text-amber-700 bg-amber-50 border border-amber-200 px-1.5 py-0.5 rounded-md">
                          PENDIENTE
                        </span>
                      )
                    ) : (
                      <span className="text-[9px] font-bold text-slate-500 bg-slate-100 px-1.5 py-0.5 rounded-md">
                        APLICADO
                      </span>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>

          {/* Fila de Totales estilo Hoja de Cálculo */}
          <tfoot>
            <tr className="bg-slate-100/90 border-t-2 border-slate-300 font-mono text-[11px] font-black text-slate-800">
              <td colSpan={4} className="py-2 px-3 text-right uppercase tracking-wider text-slate-500 font-sans border-r border-slate-200">
                Totales Calculados:
              </td>
              <td className="py-2 px-3 text-right border-r border-slate-200 text-slate-900">
                <div className="text-[10px] text-red-600 font-bold">Fiados: {formatoMoneda(totalFiados)}</div>
                <div className="text-[10px] text-emerald-600 font-bold">Abonos: {formatoMoneda(totalAbonos)}</div>
              </td>
              <td colSpan={2} className="py-2 px-3 border-r border-slate-200 text-slate-600 text-[10px] font-sans">
                Registros: {movimientos.length}
              </td>
              <td className="py-2 px-3 text-center font-sans font-bold text-[10px]">
                <span className={saldoActual > 0 ? 'text-red-700' : 'text-emerald-700'}>
                  Balance: {formatoMoneda(saldoActual)}
                </span>
              </td>
            </tr>
          </tfoot>
        </table>
      </div>
    </div>
  );
};
