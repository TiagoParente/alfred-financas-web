"use client";

import { useMemo } from "react";
import { Orcamento } from "@/types/orcamento";
import { formatarMoeda } from "@/utils/formatters";
import {
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Tooltip,
} from "recharts";
import { PieChart as PieChartIcon, Tag } from "lucide-react";

import { DespesaCategoriaItem } from "@/types/dashboard";

interface GraficoTopCategoriasDespesasProps {
  despesasPorCategoria?: DespesaCategoriaItem[];
  orcamentos?: Orcamento[];
}

const CORES_PADRAO = [
  "#1F4E79", // Azul Petróleo (Primária)
  "#0EA5E9", // Sky Blue
  "#F59E0B", // Âmbar
  "#EC4899", // Rosa
  "#8B5CF6", // Roxo
  "#10B981", // Esmeralda
  "#64748B", // Slate
];

// Custom Tooltip estilizado para o Donut Chart
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const CustomTooltip = ({ active, payload }: any) => {
  if (active && payload && payload.length) {
    const data = payload[0].payload;
    return (
      <div className="rounded-xl border border-border bg-card p-3 shadow-lg text-xs space-y-1 max-w-[220px]">
        <div className="flex items-center gap-2 font-bold text-foreground">
          <span
            className="h-2.5 w-2.5 rounded-full shrink-0"
            style={{ backgroundColor: data.color }}
          />
          <span className="truncate">{data.name}</span>
        </div>
        <div className="flex items-center justify-between gap-4 text-muted-foreground pt-1 border-t border-border/40">
          <span>Gasto:</span>
          <span className="font-bold text-foreground">{formatarMoeda(data.value)}</span>
        </div>
        <div className="flex items-center justify-between gap-4 text-muted-foreground">
          <span>Participação:</span>
          <span className="font-semibold text-emerald-600 dark:text-emerald-400">
            {data.percentual.toFixed(1)}%
          </span>
        </div>
      </div>
    );
  }
  return null;
};

export function GraficoTopCategoriasDespesas({
  despesasPorCategoria = [],
  orcamentos = [],
}: GraficoTopCategoriasDespesasProps) {
  // Filtra e ordena as categorias que possuem gasto > 0
  const { topCategorias, totalGasto } = useMemo(() => {
    // 1. Se despesasPorCategoria estiver disponível, utiliza os dados consolidados do backend
    if (despesasPorCategoria && despesasPorCategoria.length > 0) {
      const comGastos = despesasPorCategoria
        .filter((item) => Number(item.total) > 0)
        .map((item, idx) => ({
          id: item.categoria_id ?? `cat-${idx}`,
          name: item.nome,
          value: Number(item.total),
          color: item.cor_hex || CORES_PADRAO[idx % CORES_PADRAO.length],
          limite: item.valor_limite ? Number(item.valor_limite) : undefined,
          percentual: Number(item.percentual),
        }))
        .sort((a, b) => b.value - a.value);

      const total = comGastos.reduce((acc, curr) => acc + curr.value, 0);

      return {
        topCategorias: comGastos,
        totalGasto: total,
      };
    }

    // 2. Fallback para orcamentos caso despesasPorCategoria não venha preenchido
    const comGastos = orcamentos
      .filter((o) => Number(o.valor_gasto) > 0)
      .map((o, idx) => ({
        id: o.id,
        name: o.categoria?.nome || `Categoria ${idx + 1}`,
        value: Number(o.valor_gasto),
        color: o.categoria?.cor_hex || CORES_PADRAO[idx % CORES_PADRAO.length],
        limite: Number(o.valor_limite),
      }))
      .sort((a, b) => b.value - a.value);

    const total = comGastos.reduce((acc, curr) => acc + curr.value, 0);

    const comPercentual = comGastos.map((item) => ({
      ...item,
      percentual: total > 0 ? (item.value / total) * 100 : 0,
    }));

    return {
      topCategorias: comPercentual,
      totalGasto: total,
    };
  }, [despesasPorCategoria, orcamentos]);

  return (
    <div className="rounded-[16px] border border-border/50 bg-card p-6 shadow-sm space-y-4">
      {/* Cabeçalho */}
      <div className="flex items-center justify-between">
        <div className="space-y-0.5">
          <div className="flex items-center gap-2">
            <PieChartIcon className="h-5 w-5 text-[#1F4E79]" />
            <h3 className="text-base font-bold text-foreground">
              Maiores Gastos por Categoria
            </h3>
          </div>
          <p className="text-xs text-muted-foreground font-medium">
            Distribuição percentual das despesas no mês
          </p>
        </div>
        {totalGasto > 0 && (
          <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-accent text-foreground">
            Total: {formatarMoeda(totalGasto)}
          </span>
        )}
      </div>

      {/* Conteúdo */}
      {topCategorias.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-[12px] border border-dashed border-border/60 p-8 text-center bg-accent/10 min-h-[220px]">
          <PieChartIcon className="h-8 w-8 text-muted-foreground/60 mb-2" />
          <p className="text-sm font-medium text-foreground">
            Nenhuma despesa registrada no período
          </p>
          <p className="text-xs text-muted-foreground mt-1 max-w-xs">
            Assim que você registrar movimentações ou faturas, o gráfico exibirá onde está concentrado seu gasto.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-center pt-2">
          {/* Gráfico Donut */}
          <div className="md:col-span-5 relative h-[200px] w-full flex items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={topCategorias}
                  cx="50%"
                  cy="50%"
                  innerRadius={52}
                  outerRadius={78}
                  paddingAngle={4}
                  dataKey="value"
                  stroke="none"
                >
                  {topCategorias.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip content={<CustomTooltip />} />
              </PieChart>
            </ResponsiveContainer>

            {/* Texto Centralizado dentro da Rosca */}
            <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none text-center">
              <span className="text-[10px] uppercase tracking-wider font-semibold text-muted-foreground">
                Categorias
              </span>
              <span className="text-lg font-bold text-foreground">
                {topCategorias.length}
              </span>
            </div>
          </div>

          {/* Ranking em Lista */}
          <div className="md:col-span-7 space-y-3">
            {topCategorias.slice(0, 5).map((cat) => (
              <div key={cat.id} className="space-y-1">
                <div className="flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2 min-w-0">
                    <span
                      className="h-3 w-3 rounded-full shrink-0"
                      style={{ backgroundColor: cat.color }}
                    />
                    <span className="font-semibold text-foreground truncate">
                      {cat.name}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <span className="font-bold text-foreground">
                      {formatarMoeda(cat.value)}
                    </span>
                    <span className="text-[11px] font-semibold text-muted-foreground w-11 text-right">
                      {cat.percentual.toFixed(0)}%
                    </span>
                  </div>
                </div>

                {/* Barra de Progresso da Categoria */}
                <div className="h-1.5 w-full rounded-full bg-accent overflow-hidden">
                  <div
                    className="h-full rounded-full transition-all duration-500"
                    style={{
                      width: `${cat.percentual}%`,
                      backgroundColor: cat.color,
                    }}
                  />
                </div>
              </div>
            ))}

            {topCategorias.length > 5 && (
              <p className="text-[11px] text-muted-foreground pt-1 text-right italic">
                + {topCategorias.length - 5} outras categorias
              </p>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
