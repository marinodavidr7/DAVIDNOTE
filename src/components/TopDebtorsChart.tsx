import React, { useMemo } from 'react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Cell,
  CartesianGrid
} from 'recharts';
import { TrendingUp, Users, CheckCircle2 } from 'lucide-react';
import { ClienteCalculado } from '../types';
import { formatoMoneda } from '../utils/paymentCycle';

interface TopDebtorsChartProps {
  clientes: ClienteCalculado[];
  onSelectClient?: (cliente: ClienteCalculado) => void;
}

const BAR_COLORS = [
  '#dc2626', // Rojo intenso para el #1
  '#ea580c', // Naranja rojizo para el #2
  '#f59e0b', // Ámbar para el #3
  '#3b82f6', // Azul para el #4
  '#6366f1'  // Índigo para el #5
];

export const TopDebtorsChart: React.FC<TopDebtorsChartProps> = ({
  clientes,
  onSelectClient
}) => {
  // Obtener los 5 clientes con mayor saldo pendiente
  const topClientes = useMemo(() => {
    return [...clientes]
      .filter(c => c.saldo > 0)
      .sort((a, b) => b.saldo - a.saldo)
      .slice(0, 5)
      .map((c, index) => {
        // Nombre corto para etiquetas de eje (ej. "Manuel L.")
        const partes = c.nombre.trim().split(' ');
        const nombreCorto = partes.length > 1
          ? `${partes[0]} ${partes[1].charAt(0)}.`
          : partes[0];

        return {
          id: c.id,
          nombreCompleto: c.nombre,
          nombreCorto,
          saldo: c.saldo,
          limite: c.limite,
          porcentajeUso: c.limite > 0 ? Math.min(100, Math.round((c.saldo / c.limite) * 100)) : 0,
          color: BAR_COLORS[index % BAR_COLORS.length],
          clienteOriginal: c
        };
      });
  }, [clientes]);

  const totalTop5 = useMemo(() => {
    return topClientes.reduce((acc, curr) => acc + curr.saldo, 0);
  }, [topClientes]);

  if (topClientes.length === 0) {
    return (
      <div className="bg-white rounded-3xl p-5 shadow-xs border border-slate-100 text-center">
        <div className="w-12 h-12 bg-emerald-100 text-emerald-600 rounded-2xl flex items-center justify-center mx-auto mb-3">
          <CheckCircle2 className="w-6 h-6" />
        </div>
        <h4 className="font-bold text-slate-800 text-sm">Sin Deudas Pendientes</h4>
        <p className="text-xs text-slate-500 mt-1 max-w-xs mx-auto">
          ¡Excelente noticia! Ningún cliente tiene saldo fiado pendiente en este momento.
        </p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-3xl p-5 shadow-xs border border-slate-100 overflow-hidden">
      {/* Header del gráfico */}
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          <div className="w-9 h-9 rounded-xl bg-red-100 text-red-600 flex items-center justify-center shrink-0">
            <TrendingUp className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-extrabold text-sm text-slate-900 leading-tight">
              Top 5 Clientes con Mayor Deuda
            </h3>
            <p className="text-[11px] text-slate-500 font-medium">
              Distribución de los mayores fiados pendientes
            </p>
          </div>
        </div>
        <div className="text-right">
          <span className="text-[10px] font-bold text-slate-400 block uppercase tracking-wider">
            Total Top 5
          </span>
          <span className="text-xs font-black text-red-600">
            {formatoMoneda(totalTop5)}
          </span>
        </div>
      </div>

      {/* Gráfico Recharts */}
      <div className="h-56 w-full -ml-2 my-2">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            data={topClientes}
            margin={{ top: 15, right: 10, left: -10, bottom: 20 }}
            onClick={(eventData: any) => {
              if (eventData && eventData.activePayload && eventData.activePayload[0] && onSelectClient) {
                const item = eventData.activePayload[0].payload;
                if (item?.clienteOriginal) {
                  onSelectClient(item.clienteOriginal);
                }
              }
            }}
          >
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
            <XAxis
              dataKey="nombreCorto"
              tickLine={false}
              axisLine={{ stroke: '#e2e8f0' }}
              tick={{ fill: '#64748b', fontSize: 11, fontWeight: 600 }}
              interval={0}
            />
            <YAxis
              tickLine={false}
              axisLine={false}
              tick={{ fill: '#94a3b8', fontSize: 10 }}
              tickFormatter={(val) => `$${val >= 1000 ? `${(val / 1000).toFixed(0)}k` : val}`}
              width={42}
            />
            <Tooltip
              cursor={{ fill: 'rgba(241, 245, 249, 0.6)' }}
              content={({ active, payload }) => {
                if (active && payload && payload.length) {
                  const data = payload[0].payload;
                  return (
                    <div className="bg-slate-900 text-white p-3 rounded-2xl shadow-2xl border border-slate-700 text-xs min-w-[170px] pointer-events-none z-50">
                      <div className="font-extrabold text-white text-sm mb-1">
                        {data.nombreCompleto}
                      </div>
                      <div className="flex justify-between items-center py-0.5 border-t border-slate-800 pt-1.5 mt-1">
                        <span className="text-slate-400">Saldo pendiente:</span>
                        <span className="font-bold text-red-400">
                          {formatoMoneda(data.saldo)}
                        </span>
                      </div>
                      <div className="flex justify-between items-center py-0.5">
                        <span className="text-slate-400">Límite crédito:</span>
                        <span className="font-semibold text-slate-200">
                          {formatoMoneda(data.limite)}
                        </span>
                      </div>
                      <div className="flex justify-between items-center py-0.5">
                        <span className="text-slate-400">Uso de crédito:</span>
                        <span className="font-bold text-amber-300">
                          {data.porcentajeUso}%
                        </span>
                      </div>
                      <div className="text-[10px] text-blue-300 mt-2 font-medium text-center bg-white/10 rounded-lg py-1">
                        Toca la barra para ver detalles
                      </div>
                    </div>
                  );
                }
                return null;
              }}
            />
            <Bar
              dataKey="saldo"
              radius={[6, 6, 0, 0]}
              animationDuration={800}
            >
              {topClientes.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.color} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Mini ranking de los 5 clientes con barra de progreso */}
      <div className="divide-y divide-slate-100 pt-1">
        {topClientes.map((c, idx) => (
          <div
            key={c.id}
            onClick={() => onSelectClient && onSelectClient(c.clienteOriginal)}
            className="py-2 flex items-center justify-between text-xs hover:bg-slate-50 rounded-xl px-2 -mx-2 transition cursor-pointer group active:scale-98"
          >
            <div className="flex items-center gap-2.5 min-w-0">
              <span
                className="w-5 h-5 rounded-full flex items-center justify-center font-black text-[10px] text-white shrink-0 shadow-xs"
                style={{ backgroundColor: c.color }}
              >
                {idx + 1}
              </span>
              <div className="min-w-0">
                <div className="font-bold text-slate-800 truncate group-hover:text-blue-600 transition">
                  {c.nombreCompleto}
                </div>
                <div className="text-[10px] text-slate-400">
                  {c.porcentajeUso}% del límite usado ({formatoMoneda(c.limite)})
                </div>
              </div>
            </div>

            <div className="text-right shrink-0 font-extrabold text-slate-900 ml-2">
              <span className="text-red-600">{formatoMoneda(c.saldo)}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
