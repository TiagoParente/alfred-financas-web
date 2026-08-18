"use client";

import { useMemo } from "react";
import { ProjecaoCartoesData } from "@/types/projecoes";
import { formatarMoeda, formatarPorcentagem } from "@/utils/formatters";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
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
import {
  CreditCard,
  TrendingDown,
  Sparkles,
  CheckCircle2,
  Calendar,
  Layers,
  ArrowDownRight,
  Clock,
  ShieldAlert,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface CardProjecaoCartoesProps {
  projecaoCartoes?: ProjecaoCartoesData;
  periodoMeses: number;
}

// Custom Tooltip para o gráfico de faturas
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const CustomTooltipFaturas = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    const rawData = payload[0]?.payload;
    const isProjecao = rawData?.is_projecao;

    return (
      <div className="rounded-xl border border-border bg-card p-3.5 shadow-xl text-xs space-y-2.5 min-w-[260px]">
        <div className="flex items-center justify-between border-b border-border/50 pb-1.5">
          <span className="font-bold text-foreground text-sm">{label}</span>
          <span
            className={cn(
              "px-2 py-0.5 rounded-full text-[10px] font-semibold border",
              isProjecao
                ? "bg-amber-500/10 text-amber-600 border-amber-500/20 dark:text-amber-400"
                : "bg-emerald-500/10 text-emerald-600 border-emerald-500/20 dark:text-emerald-400"
            )}
          >
            {isProjecao ? "Fatura Prevista" : "Fatura Atual"}
          </span>
        </div>

        <div className="space-y-1.5 pt-1">
          <div className="flex items-center justify-between gap-4">
            <span className="text-muted-foreground">Total da Fatura:</span>
            <span className="font-bold text-foreground text-sm">
              {formatarMoeda(rawData.total_faturas)}
            </span>
          </div>

          <div className="flex items-center justify-between gap-4 text-[11px]">
            <span className="flex items-center gap-1 text-amber-600 dark:text-amber-400">
              <span className="w-2 h-2 rounded-full bg-amber-500 inline-block" />
              Parcelas de Compras:
            </span>
            <span className="font-semibold text-foreground">
              {formatarMoeda(rawData.total_parcelas)}
            </span>
          </div>

          <div className="flex items-center justify-between gap-4 text-[11px]">
            <span className="flex items-center gap-1 text-[#1F4E79] dark:text-sky-400">
              <span className="w-2 h-2 rounded-full bg-[#1F4E79] dark:bg-sky-400 inline-block" />
              Assinaturas / Fixas no Cartão:
            </span>
            <span className="font-semibold text-foreground">
              {formatarMoeda(rawData.total_fixas_cartao)}
            </span>
          </div>
        </div>
      </div>
    );
  }
  return null;
};

export function CardProjecaoCartoes({
  projecaoCartoes,
  periodoMeses,
}: CardProjecaoCartoesProps) {
  if (!projecaoCartoes || !projecaoCartoes.meses || projecaoCartoes.meses.length === 0) {
    return null;
  }

  const { resumo, meses, cartoes, parcelamentos_encerrando } = projecaoCartoes;

  const chartData = useMemo(() => {
    return meses.map((m) => ({
      ...m,
      label: `${m.nome_mes}/${m.ano.toString().slice(-2)}`,
    }));
  }, [meses]);

  const temAlivio = resumo.reducao_total_periodo > 0;

  return (
    <Card className="rounded-2xl border-border bg-card shadow-xs w-full overflow-hidden space-y-0">
      {/* 1. Header do Card */}
      <CardHeader className="p-5 pb-4 border-b border-border/50 bg-gradient-to-r from-[#1F4E79]/5 via-card to-card">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2.5">
              <div className="p-2 rounded-xl bg-[#1F4E79]/10 text-[#1F4E79] dark:bg-sky-500/10 dark:text-sky-400">
                <CreditCard className="h-5 w-5" />
              </div>
              <div>
                <CardTitle className="text-base font-bold text-foreground tracking-tight flex items-center gap-2">
                  <span>Projeção de Faturas de Cartão de Crédito</span>
                  <Badge
                    variant="outline"
                    className="text-[11px] font-semibold bg-[#1F4E79]/10 text-[#1F4E79] dark:text-sky-400 border-[#1F4E79]/20"
                  >
                    {cartoes.length} {cartoes.length === 1 ? "Cartão Ativo" : "Cartões Ativos"}
                  </Badge>
                </CardTitle>
                <p className="text-xs text-muted-foreground mt-0.5">
                  Acompanhe a curva de decréscimo das faturas e quando seus parcelamentos atuais serão quitados
                </p>
              </div>
            </div>
          </div>

          {/* Destaque do Alívio Previsto */}
          {temAlivio && resumo.fatura_menor_mes && (
            <div className="flex items-center gap-3 p-2.5 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-700 dark:text-emerald-300 shrink-0">
              <div className="p-1.5 rounded-lg bg-emerald-500/20 text-emerald-600 dark:text-emerald-400">
                <TrendingDown className="h-4 w-4" />
              </div>
              <div className="text-xs">
                <div className="flex items-center gap-1 font-bold">
                  <span>Alívio de {formatarMoeda(resumo.reducao_total_periodo)}</span>
                  <span className="text-[10px] font-semibold">(-{formatarPorcentagem(resumo.percentual_reducao)})</span>
                </div>
                <span className="text-[11px] text-muted-foreground block">
                  Fatura cai para {formatarMoeda(resumo.fatura_menor_mes.valor)} em {resumo.fatura_menor_mes.nome_mes_completo}
                </span>
              </div>
            </div>
          )}
        </div>
      </CardHeader>

      <CardContent className="p-5 space-y-6">
        {/* 2. Resumo em Mini KPIs de Cartões */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          <div className="p-3.5 rounded-xl bg-muted/30 border border-border/60 space-y-1">
            <span className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
              Fatura Atual (Mês Base)
            </span>
            <div className="text-xl font-bold text-foreground">
              {formatarMoeda(resumo.fatura_mes_atual)}
            </div>
            <span className="text-[10px] text-muted-foreground block">
              Ponto de partida dos compromissos
            </span>
          </div>

          <div className="p-3.5 rounded-xl bg-muted/30 border border-border/60 space-y-1">
            <span className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
              Menor Fatura Prevista
            </span>
            <div className="text-xl font-bold text-emerald-600 dark:text-emerald-400">
              {formatarMoeda(resumo.fatura_menor_mes?.valor ?? 0)}
            </div>
            <span className="text-[10px] text-muted-foreground block">
              Em {resumo.fatura_menor_mes?.nome_mes_completo ?? "--"}
            </span>
          </div>

          <div className="p-3.5 rounded-xl bg-muted/30 border border-border/60 space-y-1">
            <span className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
              Média Mensal em Cartões
            </span>
            <div className="text-xl font-bold text-foreground">
              {formatarMoeda(resumo.media_mensal)}
            </div>
            <span className="text-[10px] text-muted-foreground block">
              Média no horizonte de {periodoMeses} meses
            </span>
          </div>

          <div className="p-3.5 rounded-xl bg-muted/30 border border-border/60 space-y-1">
            <span className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
              Total Faturado no Período
            </span>
            <div className="text-xl font-bold text-foreground">
              {formatarMoeda(resumo.total_faturas_periodo)}
            </div>
            <span className="text-[10px] text-muted-foreground block">
              Total comprometido em {periodoMeses}M
            </span>
          </div>
        </div>

        {/* 3. Gráfico de Evolução das Faturas */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Layers className="h-4 w-4 text-[#1F4E79] dark:text-sky-400" />
              <span className="text-xs font-bold text-foreground uppercase tracking-wider">
                Trajetória Mensal das Faturas ({periodoMeses} Meses)
              </span>
            </div>
            <span className="text-[11px] text-muted-foreground">
              Parcelas de compras vs Assinaturas fixas
            </span>
          </div>

          <div className="h-[280px] w-full pt-2">
            <ResponsiveContainer width="100%" height="100%">
              <ComposedChart
                data={chartData}
                margin={{ top: 10, right: 15, left: -10, bottom: 10 }}
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
                <Tooltip content={<CustomTooltipFaturas />} />
                <Legend
                  verticalAlign="bottom"
                  height={30}
                  iconType="circle"
                  iconSize={8}
                  wrapperStyle={{ fontSize: 11, paddingTop: 8 }}
                />

                {/* Barra Empilhada 1: Assinaturas / Fixas em Cartão */}
                <Bar
                  dataKey="total_fixas_cartao"
                  name="Assinaturas / Fixas em Cartão"
                  stackId="fatura"
                  fill="#1F4E79"
                  radius={[0, 0, 0, 0]}
                  maxBarSize={42}
                />

                {/* Barra Empilhada 2: Parcelas de Compras */}
                <Bar
                  dataKey="total_parcelas"
                  name="Parcelas de Compras"
                  stackId="fatura"
                  fill="#F59E0B"
                  radius={[6, 6, 0, 0]}
                  maxBarSize={42}
                />

                {/* Linha de Trajetória da Fatura Total */}
                <Line
                  type="monotone"
                  dataKey="total_faturas"
                  name="Curva Total da Fatura"
                  stroke="#0284C7"
                  strokeWidth={2.5}
                  dot={{ r: 4, fill: "#0284C7", strokeWidth: 2, stroke: "#FFFFFF" }}
                  activeDot={{ r: 6 }}
                />
              </ComposedChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* 4. Lista de Parcelamentos que Encerrarão no Período ("Quando suas faturas diminuem") */}
        <div className="space-y-3 pt-3 border-t border-border/50">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Clock className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
              <span className="text-xs font-bold text-foreground uppercase tracking-wider">
                Liberação de Margem: Compras Próximas da Quitação ({parcelamentos_encerrando.length})
              </span>
            </div>
            <span className="text-[11px] text-muted-foreground">
              Parcelas que deixam de ser cobradas no período
            </span>
          </div>

          {parcelamentos_encerrando.length === 0 ? (
            <div className="p-6 rounded-xl bg-muted/20 border border-dashed border-border text-center text-xs text-muted-foreground">
              Nenhum parcelamento de compras cadastrado com término previsto neste período de {periodoMeses} meses.
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
              {parcelamentos_encerrando.map((item, idx) => (
                <div
                  key={`${item.movimentacao_id}-${idx}`}
                  className="p-3 rounded-xl border border-border/70 bg-card hover:bg-muted/20 transition-all space-y-2 shadow-2xs"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <span className="font-bold text-xs text-foreground block line-clamp-1">
                        {item.descricao}
                      </span>
                      <div className="flex items-center gap-1.5 mt-0.5">
                        <span
                          className="w-2 h-2 rounded-full inline-block shrink-0"
                          style={{ backgroundColor: item.cor_hex || "#1F4E79" }}
                        />
                        <span className="text-[10px] text-muted-foreground">
                          {item.cartao_nome}
                        </span>
                      </div>
                    </div>
                    <Badge
                      variant="outline"
                      className="text-[10px] px-1.5 py-0 font-semibold bg-amber-500/10 text-amber-600 border-amber-500/20 shrink-0"
                    >
                      {item.total_parcelas}x
                    </Badge>
                  </div>

                  <div className="pt-1.5 border-t border-border/40 flex items-center justify-between text-xs">
                    <div>
                      <span className="text-[10px] text-muted-foreground block">
                        Valor da Parcela:
                      </span>
                      <span className="font-bold text-foreground">
                        {formatarMoeda(item.valor_parcela)}
                      </span>
                    </div>

                    <div className="text-right">
                      <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-semibold block">
                        Alívio a partir de:
                      </span>
                      <span className="font-bold text-foreground text-[11px]">
                        {item.alivio_a_partir_de}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* 5. Detalhamento por Cartão (Tabela Resumida) */}
        {cartoes.length > 1 && (
          <div className="space-y-2 pt-3 border-t border-border/50">
            <span className="text-xs font-bold text-foreground uppercase tracking-wider block">
              Detalhamento por Cartão
            </span>
            <div className="overflow-x-auto">
              <table className="w-full text-xs text-left border-collapse">
                <thead>
                  <tr className="border-b border-border/60 bg-muted/30 text-muted-foreground font-semibold text-[10px] uppercase">
                    <th className="py-2.5 px-3">Cartão</th>
                    <th className="py-2.5 px-3 text-right">Fatura Mês Atual</th>
                    <th className="py-2.5 px-3 text-right">Média / Mês</th>
                    <th className="py-2.5 px-3 text-right">Total no Período ({periodoMeses}M)</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/40">
                  {cartoes.map((cartao) => {
                    const mesAtualData = cartao.meses[meses[0]?.mes_ano];
                    return (
                      <tr key={cartao.id} className="hover:bg-muted/20 transition-colors">
                        <td className="py-2.5 px-3">
                          <div className="flex items-center gap-2">
                            <span
                              className="w-2.5 h-2.5 rounded-full inline-block"
                              style={{ backgroundColor: cartao.cor_hex }}
                            />
                            <span className="font-semibold text-foreground">
                              {cartao.nome}
                            </span>
                          </div>
                        </td>
                        <td className="py-2.5 px-3 text-right font-medium text-foreground">
                          {formatarMoeda(mesAtualData?.total_fatura ?? 0)}
                        </td>
                        <td className="py-2.5 px-3 text-right text-muted-foreground">
                          {formatarMoeda(cartao.media_mensal)}
                        </td>
                        <td className="py-2.5 px-3 text-right font-bold text-foreground">
                          {formatarMoeda(cartao.total_periodo)}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
