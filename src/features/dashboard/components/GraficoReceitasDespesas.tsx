"use client";

import { useState, useMemo } from "react";
import { DashboardMensal } from "@/types/dashboard";
import { ContaFixa } from "@/types/contasFixas";
import { TipoMovimentacao } from "@/types/movimentacoes";
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
  Cell,
} from "recharts";
import { BarChart3, Sparkles, Calendar } from "lucide-react";

interface GraficoReceitasDespesasProps {
  mensal: DashboardMensal;
  contasFixas?: ContaFixa[];
  faturaCartoesTotal?: number;
}

const NOMES_MESES = [
  "Jan", "Fev", "Mar", "Abr", "Mai", "Jun",
  "Jul", "Ago", "Set", "Out", "Nov", "Dez"
];

// Custom Tooltip com suporte a indicador de Projeção vs Realizado
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    const isProjecao = payload[0]?.payload?.isProjecao;

    return (
      <div className="rounded-xl border border-border bg-card p-3.5 shadow-lg text-xs space-y-2 max-w-[240px]">
        <div className="flex items-center justify-between border-b border-border/40 pb-1.5 gap-2">
          <span className="font-bold text-foreground">{label}</span>
          <span
            className={`px-2 py-0.5 rounded-full text-[10px] font-semibold border ${
              isProjecao
                ? "bg-amber-500/10 text-amber-600 border-amber-500/20 dark:text-amber-400"
                : "bg-emerald-500/10 text-emerald-600 border-emerald-500/20 dark:text-emerald-400"
            }`}
          >
            {isProjecao ? "Projeção" : "Realizado"}
          </span>
        </div>

        <div className="space-y-1.5">
          {payload.map((item: any, index: number) => (
            <div key={index} className="flex items-center justify-between gap-4">
              <span style={{ color: item.color }} className="font-medium">
                {item.name}:
              </span>
              <span className="font-bold text-foreground">
                {formatarMoeda(item.value)}
              </span>
            </div>
          ))}
        </div>

        {isProjecao && (
          <p className="text-[10px] text-muted-foreground pt-1 border-t border-border/30 italic">
            * Baseado em contas fixas ativas e faturas de cartão.
          </p>
        )}
      </div>
    );
  }
  return null;
};

export function GraficoReceitasDespesas({
  mensal,
  contasFixas = [],
  faturaCartoesTotal = 0,
}: GraficoReceitasDespesasProps) {
  const [modoProjecao, setModoProjecao] = useState<boolean>(true);

  // Calcula totais recorrentes de contas fixas ativas
  const receitasFixasTotal = useMemo(() => {
    return contasFixas
      .filter((c) => c.ativa && c.tipo === TipoMovimentacao.RECEITA)
      .reduce((acc, c) => acc + Number(c.valor), 0);
  }, [contasFixas]);

  const despesasFixasTotal = useMemo(() => {
    return contasFixas
      .filter((c) => c.ativa && c.tipo === TipoMovimentacao.DESPESA)
      .reduce((acc, c) => acc + Number(c.valor), 0);
  }, [contasFixas]);

  // Monta a série temporal (Mês Atual + Próximos 3 Meses)
  const dados = useMemo(() => {
    const mesAtualNum = mensal.mes || new Date().getMonth() + 1;
    const anoAtualNum = mensal.ano || new Date().getFullYear();

    // Se estiver em modo Mês Atual, retorna apenas o mês selecionado
    if (!modoProjecao) {
      return [
        {
          name: `${NOMES_MESES[mesAtualNum - 1]} (Atual)`,
          Receitas: mensal.total_receitas,
          Despesas: mensal.total_despesas,
          "Saldo do Mês": mensal.balanco_mensal,
          isProjecao: false,
        },
      ];
    }

    const serie = [];

    // Mês 0: Mês Selecionado / Atual (Dados Reais do Backend)
    serie.push({
      name: NOMES_MESES[mesAtualNum - 1],
      Receitas: mensal.total_receitas,
      Despesas: mensal.total_despesas,
      "Saldo do Mês": mensal.balanco_mensal,
      isProjecao: false,
    });

    // Meses +1, +2, +3: Projeção Estimada
    for (let i = 1; i <= 3; i++) {
      const idxMes = (mesAtualNum - 1 + i) % 12;

      // Estimativa: Receitas Fixas vs Despesas Fixas + Fatura de Cartões
      const receitaProjetada = receitasFixasTotal;
      const despesaProjetada = despesasFixasTotal + faturaCartoesTotal;
      const saldoProjetado = receitaProjetada - despesaProjetada;

      serie.push({
        name: NOMES_MESES[idxMes],
        Receitas: receitaProjetada,
        Despesas: despesaProjetada,
        "Saldo do Mês": saldoProjetado,
        isProjecao: true,
      });
    }

    return serie;
  }, [mensal, modoProjecao, receitasFixasTotal, despesasFixasTotal, faturaCartoesTotal]);

  return (
    <div className="rounded-[16px] border border-border/50 bg-card p-6 shadow-sm space-y-4">
      {/* Cabeçalho do Card */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="space-y-0.5">
          <div className="flex items-center gap-2">
            <BarChart3 className="h-5 w-5 text-[#1F4E79]" />
            <h3 className="text-base font-bold text-foreground">
              Fluxo de Caixa & Projeções
            </h3>
          </div>
          <p className="text-xs text-muted-foreground font-medium">
            {modoProjecao
              ? "Comparativo do mês atual e tendência dos próximos 3 meses"
              : "Receitas, despesas e saldo do mês selecionado"}
          </p>
        </div>

        {/* Seletor de Modo (Mês Atual vs Projeção) */}
        <div className="flex items-center p-1 bg-accent/40 rounded-xl border border-border/40 self-start sm:self-auto">
          <button
            onClick={() => setModoProjecao(false)}
            className={`px-3 py-1 text-xs font-semibold rounded-lg transition-all ${
              !modoProjecao
                ? "bg-card text-foreground shadow-2xs"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            Mês Atual
          </button>
          <button
            onClick={() => setModoProjecao(true)}
            className={`px-3 py-1 text-xs font-semibold rounded-lg transition-all flex items-center gap-1.5 ${
              modoProjecao
                ? "bg-[#1F4E79] text-white shadow-2xs"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            <Sparkles className="h-3 w-3" />
            <span>Projeção (4M)</span>
          </button>
        </div>
      </div>

      {/* Gráfico Recharts */}
      <div className="h-[250px] w-full pt-2">
        <ResponsiveContainer width="100%" height="100%">
          <ComposedChart data={dados} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
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

            {/* Receitas */}
            <Bar
              dataKey="Receitas"
              fill="#22C55E"
              radius={[6, 6, 0, 0]}
              maxBarSize={45}
            >
              {dados.map((entry, index) => (
                <Cell
                  key={`cell-rec-${index}`}
                  fill="#22C55E"
                  fillOpacity={entry.isProjecao ? 0.45 : 1}
                  stroke={entry.isProjecao ? "#16A34A" : "none"}
                  strokeDasharray={entry.isProjecao ? "3 3" : undefined}
                />
              ))}
            </Bar>

            {/* Despesas */}
            <Bar
              dataKey="Despesas"
              fill="#EF4444"
              radius={[6, 6, 0, 0]}
              maxBarSize={45}
            >
              {dados.map((entry, index) => (
                <Cell
                  key={`cell-desp-${index}`}
                  fill="#EF4444"
                  fillOpacity={entry.isProjecao ? 0.45 : 1}
                  stroke={entry.isProjecao ? "#DC2626" : "none"}
                  strokeDasharray={entry.isProjecao ? "3 3" : undefined}
                />
              ))}
            </Bar>

            {/* Linha de Saldo */}
            <Line
              type="monotone"
              dataKey="Saldo do Mês"
              stroke="#F59E0B"
              strokeWidth={3}
              dot={({ cx, cy, payload }) => {
                const isProj = payload.isProjecao;
                return (
                  <circle
                    key={`dot-${cx}-${cy}`}
                    cx={cx}
                    cy={cy}
                    r={5}
                    fill={isProj ? "#F59E0B" : "#F59E0B"}
                    fillOpacity={isProj ? 0.6 : 1}
                    stroke="#FFFFFF"
                    strokeWidth={2}
                  />
                );
              }}
              activeDot={{ r: 7 }}
            />
          </ComposedChart>
        </ResponsiveContainer>
      </div>

      {/* Legenda Explicativa de Projeção */}
      {modoProjecao && (
        <div className="flex items-center justify-between text-[11px] text-muted-foreground pt-2 border-t border-border/40">
          <div className="flex items-center gap-2">
            <span className="inline-block h-2 w-5 rounded bg-emerald-500/40 border border-emerald-600/50" />
            <span>Colunas translúcidas = Projeção futura</span>
          </div>
          <div className="flex items-center gap-1 text-[#1F4E79] font-medium">
            <Calendar className="h-3.5 w-3.5" />
            <span>Estimativa baseada em contas fixas & cartões</span>
          </div>
        </div>
      )}
    </div>
  );
}

