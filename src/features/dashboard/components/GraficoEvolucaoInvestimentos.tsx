"use client";

import { useState, useMemo } from "react";
import { EvolucaoInvestimentosResumo } from "@/types/dashboard";
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
} from "recharts";
import { TrendingUp, TrendingDown, Minus, ArrowUpRight, ArrowDownRight, ShieldCheck } from "lucide-react";

interface GraficoEvolucaoInvestimentosProps {
  evolucao?: EvolucaoInvestimentosResumo;
}

// Custom Tooltip estilizado padronizado
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    const dataItem = payload[0]?.payload;
    const entradas = dataItem?.Entradas || 0;
    const saidas = dataItem?.Saidas || 0;
    const saldoLiquido = entradas - saidas;
    const saldoTotal = dataItem?.["Saldo Acumulado"] ?? dataItem?.Total ?? 0;
    const contas = dataItem?.contas || [];

    return (
      <div className="rounded-xl border border-border bg-card p-3.5 shadow-lg text-xs space-y-2.5 max-w-[260px]">
        <div className="flex items-center justify-between border-b border-border/40 pb-1.5 gap-2">
          <span className="font-bold text-foreground">{label}</span>
          <span className="font-extrabold text-[#1F4E79] bg-[#1F4E79]/10 px-2 py-0.5 rounded-full text-[10px]">
            Saldo: {formatarMoeda(saldoTotal)}
          </span>
        </div>

        {/* Resumo de Movimentações da Reserva no Mês */}
        <div className="space-y-1.5 font-medium">
          <div className="flex items-center justify-between gap-3 text-emerald-600 dark:text-emerald-400">
            <span className="flex items-center gap-1">
              <ArrowUpRight className="h-3.5 w-3.5" />
              Entradas:
            </span>
            <span className="font-bold">{formatarMoeda(entradas)}</span>
          </div>

          <div className="flex items-center justify-between gap-3 text-rose-600 dark:text-rose-400">
            <span className="flex items-center gap-1">
              <ArrowDownRight className="h-3.5 w-3.5" />
              Saídas:
            </span>
            <span className="font-bold">{formatarMoeda(saidas)}</span>
          </div>

          <div className="flex items-center justify-between gap-3 pt-1 border-t border-border/30 text-foreground">
            <span className="text-muted-foreground font-medium">Fluxo Líquido:</span>
            <span className={`font-bold ${saldoLiquido >= 0 ? "text-emerald-600 dark:text-emerald-400" : "text-rose-600 dark:text-rose-400"}`}>
              {saldoLiquido >= 0 ? "+" : ""}{formatarMoeda(saldoLiquido)}
            </span>
          </div>
        </div>

        {/* Detalhamento de Saldo por Conta no Mês */}
        {contas.length > 0 && (
          <div className="space-y-1 pt-2 border-t border-border/30">
            <span className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider block mb-1">
              Contas de Reserva
            </span>
            {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
            {contas.map((c: any) => (
              <div key={c.id} className="flex items-center justify-between gap-3 text-[11px]">
                <div className="flex items-center gap-1.5 truncate">
                  <span
                    className="h-2 w-2 rounded-full flex-shrink-0"
                    style={{ backgroundColor: c.cor_hex || "#1F4E79" }}
                  />
                  <span className="font-medium text-foreground truncate">{c.nome}</span>
                </div>
                <span className="font-semibold text-foreground flex-shrink-0">
                  {formatarMoeda(c.saldo)}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    );
  }
  return null;
};

export function GraficoEvolucaoInvestimentos({ evolucao }: GraficoEvolucaoInvestimentosProps) {
  const [modoVisao, setModoVisao] = useState<"fluxo" | "contas">("fluxo");

  const historico = evolucao?.historico || [];
  const temDados = historico.length > 0;

  // Totais consolidados de Entradas e Saídas do histórico
  const totalEntradas6M = useMemo(() => {
    return historico.reduce((acc, h) => acc + (h.entradas || 0), 0);
  }, [historico]);

  const totalSaidas6M = useMemo(() => {
    return historico.reduce((acc, h) => acc + (h.saidas || 0), 0);
  }, [historico]);

  const listaContas = useMemo(() => {
    const mapContas = new Map<number, { id: number; nome: string; cor_hex: string }>();
    historico.forEach((h) => {
      h.contas.forEach((c) => {
        if (!mapContas.has(c.id)) {
          mapContas.set(c.id, {
            id: c.id,
            nome: c.nome,
            cor_hex: c.cor_hex || "#1F4E79",
          });
        }
      });
    });
    return Array.from(mapContas.values());
  }, [historico]);

  const chartData = useMemo(() => {
    return historico.map((h) => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const entry: Record<string, any> = {
        name: h.mes_ano,
        Entradas: h.entradas || 0,
        Saidas: h.saidas || 0,
        "Saldo Acumulado": h.saldo_total ?? h.total ?? 0,
        contas: h.contas,
      };

      h.contas.forEach((c) => {
        entry[c.nome] = c.saldo;
      });

      return entry;
    });
  }, [historico]);

  const variacaoValor = evolucao?.variacao_valor ?? 0;
  const variacaoPercentual = evolucao?.variacao_percentual ?? 0;
  const tendencia = evolucao?.tendencia ?? "estavel";

  const coresPadrao = ["#1F4E79", "#22C55E", "#0EA5E9", "#F59E0B", "#8B5CF6", "#EC4899"];

  if (!temDados) {
    return (
      <div className="rounded-[16px] border border-border/50 bg-card p-6 shadow-sm space-y-4">
        <div className="flex items-center gap-2">
          <TrendingUp className="h-5 w-5 text-[#1F4E79]" />
          <h3 className="text-base font-bold text-foreground">
            Reservas & Investimentos
          </h3>
        </div>
        <div className="flex flex-col items-center justify-center rounded-[12px] border border-dashed border-border/60 p-8 text-center bg-accent/10 min-h-[220px]">
          <ShieldCheck className="h-8 w-8 text-muted-foreground/60 mb-2" />
          <p className="text-sm font-medium text-foreground">
            Nenhuma conta de reserva cadastrada
          </p>
          <p className="text-xs text-muted-foreground mt-1 max-w-xs">
            Ao marcar uma conta bancária como &quot;Reserva / Investimento&quot;, as movimentações de aportes e resgates aparecerão aqui.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="rounded-[16px] border border-border/50 bg-card p-6 shadow-sm space-y-4">
      {/* Cabeçalho do Card */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="space-y-0.5">
          <div className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5 text-[#1F4E79]" />
            <h3 className="text-base font-bold text-foreground">
              Reservas & Investimentos
            </h3>
          </div>
          <p className="text-xs text-muted-foreground font-medium">
            Entradas, saídas e evolução do saldo dos últimos 6 meses
          </p>
        </div>

        {/* Seletor de Modo (Fluxo vs Saldo por Conta) */}
        <div className="flex items-center p-1 bg-accent/40 rounded-xl border border-border/40 self-start sm:self-auto">
          <button
            onClick={() => setModoVisao("fluxo")}
            className={`px-3 py-1 text-xs font-semibold rounded-lg transition-all ${
              modoVisao === "fluxo"
                ? "bg-[#1F4E79] text-white shadow-2xs"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            Fluxo & Saldo
          </button>
          <button
            onClick={() => setModoVisao("contas")}
            className={`px-3 py-1 text-xs font-semibold rounded-lg transition-all ${
              modoVisao === "contas"
                ? "bg-card text-foreground shadow-2xs"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            Por Conta
          </button>
        </div>
      </div>

      {/* Gráfico Recharts */}
      <div className="h-[250px] w-full pt-2">
        <ResponsiveContainer width="100%" height="100%">
          <ComposedChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" vertical={false} opacity={0.25} />
            <XAxis
              dataKey="name"
              tickLine={false}
              axisLine={false}
              tick={{ fontSize: 12 }}
            />
            <YAxis
              tickLine={false}
              axisLine={false}
              tickFormatter={(v) => `R$ ${v}`}
              tick={{ fontSize: 11 }}
            />
            <Tooltip content={<CustomTooltip />} />
            <Legend
              wrapperStyle={{ fontSize: "12px", paddingTop: "12px" }}
              iconType="circle"
            />

            {modoVisao === "fluxo" ? (
              <>
                {/* Entradas */}
                <Bar
                  dataKey="Entradas"
                  fill="#22C55E"
                  radius={[6, 6, 0, 0]}
                  maxBarSize={45}
                />

                {/* Saídas */}
                <Bar
                  dataKey="Saidas"
                  fill="#EF4444"
                  radius={[6, 6, 0, 0]}
                  maxBarSize={45}
                />

                {/* Linha de Saldo Acumulado */}
                <Line
                  type="monotone"
                  dataKey="Saldo Acumulado"
                  stroke="#1F4E79"
                  strokeWidth={3}
                  dot={{ r: 4, fill: "#1F4E79", stroke: "#FFFFFF", strokeWidth: 2 }}
                  activeDot={{ r: 7 }}
                />
              </>
            ) : (
              <>
                {listaContas.map((c, idx) => {
                  const cor = c.cor_hex || coresPadrao[idx % coresPadrao.length];
                  return (
                    <Bar
                      key={c.id}
                      dataKey={c.nome}
                      fill={cor}
                      radius={[6, 6, 0, 0]}
                      maxBarSize={45}
                    />
                  );
                })}
              </>
            )}
          </ComposedChart>
        </ResponsiveContainer>
      </div>

      {/* Roda-pé Explicativo e Resumo do Período */}
      <div className="flex items-center justify-between text-[11px] text-muted-foreground pt-2 border-t border-border/40">
        <div className="flex items-center gap-3">
          <span className="flex items-center gap-1 text-emerald-600 dark:text-emerald-400 font-medium">
            <ArrowUpRight className="h-3.5 w-3.5" />
            Entradas: {formatarMoeda(totalEntradas6M)}
          </span>
          <span className="flex items-center gap-1 text-rose-600 dark:text-rose-400 font-medium">
            <ArrowDownRight className="h-3.5 w-3.5" />
            Saídas: {formatarMoeda(totalSaidas6M)}
          </span>
        </div>

        {/* Badge de Variação Geral */}
        <div
          className={`flex items-center gap-1 font-bold ${
            tendencia === "subiu"
              ? "text-emerald-600 dark:text-emerald-400"
              : tendencia === "desceu"
              ? "text-rose-600 dark:text-rose-400"
              : "text-muted-foreground"
          }`}
        >
          {tendencia === "subiu" ? (
            <TrendingUp className="h-3.5 w-3.5" />
          ) : tendencia === "desceu" ? (
            <TrendingDown className="h-3.5 w-3.5" />
          ) : (
            <Minus className="h-3.5 w-3.5" />
          )}
          <span>
            {tendencia === "subiu" ? "+" : ""}
            {variacaoPercentual.toFixed(1)}% ({formatarMoeda(variacaoValor)})
          </span>
        </div>
      </div>
    </div>
  );
}
