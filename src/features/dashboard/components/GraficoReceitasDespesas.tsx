"use client";

import { useState, useMemo } from "react";
import { DashboardMensal, ProjecaoFluxoItem } from "@/types/dashboard";
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
import { BarChart3, Sparkles, Calendar, CreditCard, Landmark } from "lucide-react";

interface GraficoReceitasDespesasProps {
  mensal: DashboardMensal;
  projecaoFluxo?: ProjecaoFluxoItem[];
  contasFixas?: ContaFixa[];
  faturaCartoesTotal?: number;
}

const NOMES_MESES = [
  "Jan", "Fev", "Mar", "Abr", "Mai", "Jun",
  "Jul", "Ago", "Set", "Out", "Nov", "Dez"
];

// Custom Tooltip com suporte a indicador de Projeção vs Realizado e detalhamento de Cartões
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    const rawPayload = payload[0]?.payload;
    const isProjecao = rawPayload?.isProjecao;
    const detalhes = rawPayload?.detalhes;

    return (
      <div className="rounded-xl border border-border bg-card p-3.5 shadow-xl text-xs space-y-2.5 max-w-[270px]">
        <div className="flex items-center justify-between border-b border-border/40 pb-1.5 gap-2">
          <span className="font-bold text-foreground text-sm">{label}</span>
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

        {/* Linhas principais */}
        <div className="space-y-1.5">
          {payload.map((item: any, index: number) => (
            <div key={index} className="flex items-center justify-between gap-4">
              <span style={{ color: item.color }} className="font-semibold">
                {item.name}:
              </span>
              <span className="font-bold text-foreground">
                {formatarMoeda(item.value)}
              </span>
            </div>
          ))}
        </div>

        {/* Detalhamento das Despesas (Cartão vs Conta Bancária) */}
        {detalhes && (detalhes.faturas_cartao !== undefined || detalhes.despesas_contas !== undefined) && (
          <div className="pt-2 border-t border-border/40 space-y-1 text-[11px] text-muted-foreground">
            <p className="font-semibold text-foreground text-[10px] uppercase tracking-wider">
              Composição das Despesas:
            </p>
            {detalhes.faturas_cartao !== undefined && (
              <div className="flex items-center justify-between gap-2">
                <span className="flex items-center gap-1">
                  <CreditCard className="h-3 w-3 text-[#1F4E79] dark:text-sky-400 shrink-0" />
                  <span>Cartões de Crédito:</span>
                </span>
                <span className="font-semibold text-foreground">
                  {formatarMoeda(detalhes.faturas_cartao)}
                </span>
              </div>
            )}
            {detalhes.parcelas_cartao !== undefined && detalhes.parcelas_cartao > 0 && (
              <div className="flex items-center justify-between gap-2 pl-4 text-[10px] text-muted-foreground/80">
                <span>↳ Parcelas de compras:</span>
                <span>{formatarMoeda(detalhes.parcelas_cartao)}</span>
              </div>
            )}
            {detalhes.contas_fixas_cartao !== undefined && detalhes.contas_fixas_cartao > 0 && (
              <div className="flex items-center justify-between gap-2 pl-4 text-[10px] text-muted-foreground/80">
                <span>↳ Fixas / Assinaturas no cartão:</span>
                <span>{formatarMoeda(detalhes.contas_fixas_cartao)}</span>
              </div>
            )}
            {detalhes.despesas_contas !== undefined && (
              <div className="flex items-center justify-between gap-2">
                <span className="flex items-center gap-1">
                  <Landmark className="h-3 w-3 text-muted-foreground shrink-0" />
                  <span>Débito em Conta:</span>
                </span>
                <span className="font-semibold text-foreground">
                  {formatarMoeda(detalhes.despesas_contas)}
                </span>
              </div>
            )}
          </div>
        )}

        {isProjecao && (
          <p className="text-[10px] text-muted-foreground pt-1 border-t border-border/30 italic">
            * Projeção calculada com faturas de cartão (parcelas + recorrentes) e contas fixas.
          </p>
        )}
      </div>
    );
  }
  return null;
};

export function GraficoReceitasDespesas({
  mensal,
  projecaoFluxo = [],
  contasFixas = [],
  faturaCartoesTotal = 0,
}: GraficoReceitasDespesasProps) {
  const [modoProjecao, setModoProjecao] = useState<boolean>(true);

  // Calcula totais recorrentes de contas fixas ativas como fallback
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

    // Se estiver em modo Mês Atual, retorna apenas o mês selecionado
    if (!modoProjecao) {
      return [
        {
          name: `${NOMES_MESES[mesAtualNum - 1]} (Atual)`,
          Receitas: mensal.total_receitas,
          Despesas: mensal.total_despesas,
          "Saldo do Mês": mensal.balanco_mensal,
          isProjecao: false,
          detalhes: {
            despesas_contas: mensal.caixa?.despesas_contas ?? mensal.competencia?.despesas_contas,
            faturas_cartao: mensal.caixa?.faturas_cartao,
            compras_cartao: mensal.competencia?.compras_cartao,
          },
        },
      ];
    }

    // Se o backend retornou a projeção calculada, utiliza diretamente
    if (projecaoFluxo && projecaoFluxo.length > 0) {
      return projecaoFluxo.map((item) => ({
        name: item.nome_mes,
        Receitas: item.total_receitas,
        Despesas: item.total_despesas,
        "Saldo do Mês": item.balanco_mensal,
        isProjecao: item.is_projecao,
        detalhes: item.detalhes,
      }));
    }

    // Fallback caso a API ainda não tenha retornado a projeção
    const serie = [];

    // Mês 0: Mês Selecionado / Atual (Dados Reais do Backend)
    serie.push({
      name: NOMES_MESES[mesAtualNum - 1],
      Receitas: mensal.total_receitas,
      Despesas: mensal.total_despesas,
      "Saldo do Mês": mensal.balanco_mensal,
      isProjecao: false,
      detalhes: {
        despesas_contas: mensal.caixa?.despesas_contas,
        faturas_cartao: faturaCartoesTotal,
      },
    });

    // Meses +1, +2, +3: Projeção Estimada
    for (let i = 1; i <= 3; i++) {
      const idxMes = (mesAtualNum - 1 + i) % 12;
      const receitaProjetada = receitasFixasTotal;
      const despesaProjetada = despesasFixasTotal + faturaCartoesTotal;
      const saldoProjetado = receitaProjetada - despesaProjetada;

      serie.push({
        name: NOMES_MESES[idxMes],
        Receitas: receitaProjetada,
        Despesas: despesaProjetada,
        "Saldo do Mês": saldoProjetado,
        isProjecao: true,
        detalhes: {
          despesas_contas: despesasFixasTotal,
          faturas_cartao: faturaCartoesTotal,
        },
      });
    }

    return serie;
  }, [
    mensal,
    modoProjecao,
    projecaoFluxo,
    receitasFixasTotal,
    despesasFixasTotal,
    faturaCartoesTotal,
  ]);

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
              ? "Comparativo consolidado e projeção dos próximos 3 meses com faturas e contas fixas"
              : "Receitas, despesas e saldo consolidado do mês"}
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
            <span>Projeção considera faturas de cartão (parcelas + recorrentes) & contas fixas</span>
          </div>
        </div>
      )}
    </div>
  );
}

