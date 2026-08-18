"use client";

import { useState, useMemo } from "react";
import { ProjecaoMesItem } from "@/types/projecoes";
import { formatarMoeda } from "@/utils/formatters";
import {
  ResponsiveContainer,
  ComposedChart,
  Bar,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  Legend,
  ReferenceLine,
  Cell,
} from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  TrendingUp,
  CreditCard,
  Landmark,
  Sparkles,
  Info,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface GraficoFluxoProjetadoProps {
  meses: ProjecaoMesItem[];
  saldoInicialDisponivel: number;
}

// Custom Tooltip rico com composição de fluxo e saldo acumulado
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    const rawData = payload[0]?.payload;
    const isProjecao = rawData?.is_projecao;
    const detalhes = rawData?.detalhes;

    return (
      <div className="rounded-xl border border-border bg-card p-3.5 shadow-xl text-xs space-y-2.5 min-w-[280px]">
        <div className="flex items-center justify-between border-b border-border/50 pb-2">
          <span className="font-bold text-foreground text-sm">{label}</span>
          <span
            className={cn(
              "px-2 py-0.5 rounded-full text-[10px] font-semibold border",
              isProjecao
                ? "bg-amber-500/10 text-amber-600 border-amber-500/20 dark:text-amber-400"
                : "bg-emerald-500/10 text-emerald-600 border-emerald-500/20 dark:text-emerald-400"
            )}
          >
            {isProjecao ? "Estimado / Projeção" : "Realizado + Agendado"}
          </span>
        </div>

        {/* Linhas principais */}
        <div className="space-y-1.5 pt-1">
          <div className="flex items-center justify-between gap-4">
            <span className="flex items-center gap-1.5 text-emerald-600 dark:text-emerald-400 font-semibold">
              <span className="w-2 h-2 rounded-full bg-emerald-500 inline-block" />
              Receitas:
            </span>
            <span className="font-bold text-foreground">
              {formatarMoeda(rawData.total_receitas)}
            </span>
          </div>

          <div className="flex items-center justify-between gap-4">
            <span className="flex items-center gap-1.5 text-rose-600 dark:text-rose-400 font-semibold">
              <span className="w-2 h-2 rounded-full bg-rose-500 inline-block" />
              Despesas Totais:
            </span>
            <span className="font-bold text-foreground">
              {formatarMoeda(rawData.total_despesas)}
            </span>
          </div>

          <div className="flex items-center justify-between gap-4 pt-1 border-t border-border/40 font-semibold">
            <span className="text-muted-foreground">Balanço do Mês:</span>
            <span
              className={cn(
                "font-bold",
                rawData.balanco_mensal >= 0
                  ? "text-emerald-600 dark:text-emerald-400"
                  : "text-rose-600 dark:text-rose-400"
              )}
            >
              {formatarMoeda(rawData.balanco_mensal)}
            </span>
          </div>

          <div className="flex items-center justify-between gap-4 pt-1 bg-muted/40 p-1.5 rounded-lg">
            <span className="text-[#1F4E79] dark:text-sky-400 font-bold">
              Saldo Acumulado:
            </span>
            <span
              className={cn(
                "font-bold",
                rawData.saldo_acumulado >= 0
                  ? "text-foreground"
                  : "text-rose-600 dark:text-rose-400"
              )}
            >
              {formatarMoeda(rawData.saldo_acumulado)}
            </span>
          </div>
        </div>

        {/* Detalhamento de Composição */}
        {detalhes && (
          <div className="pt-2 border-t border-border/40 space-y-1 text-[11px] text-muted-foreground">
            <p className="font-semibold text-foreground text-[10px] uppercase tracking-wider">
              Composição das Despesas:
            </p>
            {detalhes.despesas_contas !== undefined && (
              <div className="flex items-center justify-between gap-2">
                <span className="flex items-center gap-1">
                  <Landmark className="h-3 w-3 text-slate-500" />
                  <span>Débito em Conta:</span>
                </span>
                <span className="font-semibold text-foreground">
                  {formatarMoeda(detalhes.despesas_contas)}
                </span>
              </div>
            )}
            {detalhes.faturas_cartao !== undefined && (
              <div className="flex items-center justify-between gap-2">
                <span className="flex items-center gap-1">
                  <CreditCard className="h-3 w-3 text-[#1F4E79] dark:text-sky-400" />
                  <span>Fatura Cartões:</span>
                </span>
                <span className="font-semibold text-foreground">
                  {formatarMoeda(detalhes.faturas_cartao)}
                </span>
              </div>
            )}
            {detalhes.parcelas_cartao !== undefined && detalhes.parcelas_cartao > 0 && (
              <div className="flex items-center justify-between gap-2 pl-4 text-[10px] text-muted-foreground/80">
                <span>↳ Parcelas programadas:</span>
                <span>{formatarMoeda(detalhes.parcelas_cartao)}</span>
              </div>
            )}
          </div>
        )}
      </div>
    );
  }
  return null;
};

export function GraficoFluxoProjetado({
  meses,
  saldoInicialDisponivel,
}: GraficoFluxoProjetadoProps) {
  const [exibirLinhaSaldo, setExibirLinhaSaldo] = useState<boolean>(true);

  const chartData = useMemo(() => {
    return meses.map((item) => ({
      ...item,
      label: `${item.nome_mes}/${item.ano.toString().slice(-2)}`,
    }));
  }, [meses]);

  const maxVal = useMemo(() => {
    let max = 0;
    chartData.forEach((d) => {
      max = Math.max(max, d.total_receitas, d.total_despesas, Math.abs(d.saldo_acumulado));
    });
    return max * 1.15;
  }, [chartData]);

  return (
    <Card className="rounded-2xl border-border bg-card shadow-xs">
      <CardHeader className="p-5 pb-2">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <CardTitle className="text-base font-bold text-foreground flex items-center gap-2">
              <TrendingUp className="h-4 w-4 text-[#1F4E79] dark:text-sky-400" />
              <span>Evolução do Fluxo de Caixa & Saldo Projetado</span>
            </CardTitle>
            <p className="text-xs text-muted-foreground mt-0.5">
              Receitas vs Despesas previstas e projeção da curva de liquidez acumulada
            </p>
          </div>

          {/* Toggle de Saldo Acumulado */}
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setExibirLinhaSaldo(!exibirLinhaSaldo)}
              className={cn(
                "px-2.5 py-1 text-xs rounded-lg font-medium border transition-all flex items-center gap-1.5",
                exibirLinhaSaldo
                  ? "bg-[#1F4E79]/10 text-[#1F4E79] border-[#1F4E79]/30 dark:bg-sky-500/10 dark:text-sky-400 dark:border-sky-500/30 font-semibold"
                  : "bg-muted/40 text-muted-foreground border-border hover:bg-muted"
              )}
            >
              <span
                className="w-2.5 h-2.5 rounded-full inline-block"
                style={{ backgroundColor: "#1F4E79" }}
              />
              <span>Curva de Saldo Acumulado</span>
            </button>
          </div>
        </div>
      </CardHeader>

      <CardContent className="p-5 pt-3">
        <div className="h-[360px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <ComposedChart
              data={chartData}
              margin={{ top: 20, right: 20, left: 0, bottom: 20 }}
            >
              <CartesianGrid
                strokeDasharray="3 3"
                vertical={false}
                stroke="currentColor"
                className="text-border/40"
              />
              <XAxis
                dataKey="label"
                tickLine={false}
                axisLine={false}
                tick={{ fill: "currentColor", fontSize: 11 }}
                className="text-muted-foreground font-medium"
              />
              <YAxis
                tickLine={false}
                axisLine={false}
                tick={{ fill: "currentColor", fontSize: 11 }}
                className="text-muted-foreground"
                tickFormatter={(val) =>
                  Math.abs(val) >= 1000
                    ? `R$ ${(val / 1000).toFixed(0)}k`
                    : `R$ ${val}`
                }
              />
              <Tooltip content={<CustomTooltip />} />
              <Legend
                verticalAlign="bottom"
                height={36}
                iconType="circle"
                iconSize={8}
                wrapperStyle={{ fontSize: 12, paddingTop: 12 }}
              />
              <ReferenceLine
                y={0}
                stroke="#94A3B8"
                strokeDasharray="2 2"
                strokeWidth={1}
              />

              {/* Barra de Receitas */}
              <Bar
                dataKey="total_receitas"
                name="Receitas Previstas"
                fill="#22C55E"
                radius={[6, 6, 0, 0]}
                maxBarSize={38}
              >
                {chartData.map((entry, index) => (
                  <Cell
                    key={`receita-${index}`}
                    fill={entry.is_projecao ? "#22C55E" : "#16A34A"}
                    opacity={entry.is_projecao ? 0.85 : 1}
                  />
                ))}
              </Bar>

              {/* Barra de Despesas */}
              <Bar
                dataKey="total_despesas"
                name="Despesas Previstas"
                fill="#EF4444"
                radius={[6, 6, 0, 0]}
                maxBarSize={38}
              >
                {chartData.map((entry, index) => (
                  <Cell
                    key={`despesa-${index}`}
                    fill={entry.is_projecao ? "#EF4444" : "#DC2626"}
                    opacity={entry.is_projecao ? 0.85 : 1}
                  />
                ))}
              </Bar>

              {/* Linha de Saldo Acumulado */}
              {exibirLinhaSaldo && (
                <Line
                  type="monotone"
                  dataKey="saldo_acumulado"
                  name="Saldo Acumulado Projetado"
                  stroke="#1F4E79"
                  strokeWidth={3}
                  dot={{ r: 4, fill: "#1F4E79", strokeWidth: 2, stroke: "#FFFFFF" }}
                  activeDot={{ r: 6, fill: "#1F4E79" }}
                />
              )}
            </ComposedChart>
          </ResponsiveContainer>
        </div>

        {/* Legenda de auxílio sobre projeções */}
        <div className="mt-3 pt-3 border-t border-border/50 flex flex-wrap items-center justify-between gap-2 text-[11px] text-muted-foreground">
          <div className="flex items-center gap-1.5">
            <Sparkles className="h-3.5 w-3.5 text-amber-500" />
            <span>
              As barras dos meses futuros combinam Contas Fixas cadastradas + Parcelas de compras de cartão já faturadas.
            </span>
          </div>
          <div>
            Saldo de partida: <strong className="text-foreground">{formatarMoeda(saldoInicialDisponivel)}</strong>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
