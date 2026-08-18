"use client";

import { ProjecaoResumo } from "@/types/projecoes";
import { formatarMoeda, formatarPercentual } from "@/utils/formatters";
import {
  Wallet,
  Percent,
  PiggyBank,
  AlertTriangle,
  ArrowUpRight,
  ArrowDownRight,
  ShieldCheck,
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

interface ProjecaoKpisProps {
  resumo?: ProjecaoResumo;
  periodoMeses: number;
}

export function ProjecaoKpis({ resumo, periodoMeses }: ProjecaoKpisProps) {
  if (!resumo) return null;

  const {
    saldo_atual_disponivel,
    saldo_final_projetado,
    variacao_saldo,
    media_sobra_mensal,
    taxa_comprometimento_renda,
    ponto_critico,
  } = resumo;

  const isSaldoCrescendo = variacao_saldo >= 0;
  const isSobraPositiva = media_sobra_mensal >= 0;

  // Status de comprometimento: < 60% Seguro, 60-80% Atenção, > 80% Crítico
  const statusComprometimento =
    taxa_comprometimento_renda > 80
      ? { label: "Alto Risco", color: "text-rose-600 dark:text-rose-400", bg: "bg-rose-500/10 border-rose-500/20" }
      : taxa_comprometimento_renda > 60
      ? { label: "Moderado", color: "text-amber-600 dark:text-amber-400", bg: "bg-amber-500/10 border-amber-500/20" }
      : { label: "Saudável", color: "text-emerald-600 dark:text-emerald-400", bg: "bg-emerald-500/10 border-emerald-500/20" };

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {/* KPI 1: Saldo Final Projetado */}
      <Card className="rounded-2xl border-border bg-card shadow-xs transition-all hover:shadow-md">
        <CardContent className="p-5 flex flex-col justify-between h-full space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Saldo Final ({periodoMeses}M)
            </span>
            <div className="p-2 rounded-xl bg-[#1F4E79]/10 text-[#1F4E79] dark:bg-sky-500/10 dark:text-sky-400">
              <Wallet className="h-4 w-4" />
            </div>
          </div>

          <div>
            <div
              className={cn(
                "text-2xl font-bold tracking-tight",
                saldo_final_projetado >= 0
                  ? "text-foreground"
                  : "text-rose-600 dark:text-rose-400"
              )}
            >
              {formatarMoeda(saldo_final_projetado)}
            </div>
            <div className="flex items-center gap-1.5 mt-1.5 text-xs text-muted-foreground">
              <span
                className={cn(
                  "font-semibold inline-flex items-center gap-0.5",
                  isSaldoCrescendo
                    ? "text-emerald-600 dark:text-emerald-400"
                    : "text-rose-600 dark:text-rose-400"
                )}
              >
                {isSaldoCrescendo ? (
                  <ArrowUpRight className="h-3.5 w-3.5" />
                ) : (
                  <ArrowDownRight className="h-3.5 w-3.5" />
                )}
                {formatarMoeda(Math.abs(variacao_saldo))}
              </span>
              <span>vs saldo inicial ({formatarMoeda(saldo_atual_disponivel)})</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* KPI 2: Taxa de Comprometimento da Renda */}
      <Card className="rounded-2xl border-border bg-card shadow-xs transition-all hover:shadow-md">
        <CardContent className="p-5 flex flex-col justify-between h-full space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Comprometimento Renda
            </span>
            <div className="p-2 rounded-xl bg-amber-500/10 text-amber-600 dark:text-amber-400">
              <Percent className="h-4 w-4" />
            </div>
          </div>

          <div>
            <div className="flex items-baseline justify-between">
              <span className="text-2xl font-bold text-foreground tracking-tight">
                {formatarPercentual(taxa_comprometimento_renda)}
              </span>
              <Badge
                variant="outline"
                className={cn("text-[10px] px-2 py-0.5 font-semibold", statusComprometimento.bg, statusComprometimento.color)}
              >
                {statusComprometimento.label}
              </Badge>
            </div>

            {/* Barra de progresso visual */}
            <div className="w-full bg-muted rounded-full h-1.5 mt-2.5 overflow-hidden">
              <div
                className={cn(
                  "h-full rounded-full transition-all",
                  taxa_comprometimento_renda > 80
                    ? "bg-rose-500"
                    : taxa_comprometimento_renda > 60
                    ? "bg-amber-500"
                    : "bg-emerald-500"
                )}
                style={{ width: `${Math.min(100, taxa_comprometimento_renda)}%` }}
              />
            </div>
            <p className="text-[11px] text-muted-foreground mt-1.5">
              Compromissos fixos e faturas sobre receitas
            </p>
          </div>
        </CardContent>
      </Card>

      {/* KPI 3: Média Mensal de Sobra Livre */}
      <Card className="rounded-2xl border-border bg-card shadow-xs transition-all hover:shadow-md">
        <CardContent className="p-5 flex flex-col justify-between h-full space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Média Mensal Livre
            </span>
            <div className="p-2 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
              <PiggyBank className="h-4 w-4" />
            </div>
          </div>

          <div>
            <div
              className={cn(
                "text-2xl font-bold tracking-tight",
                isSobraPositiva
                  ? "text-emerald-600 dark:text-emerald-400"
                  : "text-rose-600 dark:text-rose-400"
              )}
            >
              {formatarMoeda(media_sobra_mensal)}
              <span className="text-xs font-normal text-muted-foreground ml-1">
                /mês
              </span>
            </div>
            <p className="text-xs text-muted-foreground mt-1.5">
              {isSobraPositiva
                ? "Capacidade média de poupança/investimento"
                : "Déficit mensal médio estimado"}
            </p>
          </div>
        </CardContent>
      </Card>

      {/* KPI 4: Ponto Crítico de Liquidez */}
      <Card className="rounded-2xl border-border bg-card shadow-xs transition-all hover:shadow-md">
        <CardContent className="p-5 flex flex-col justify-between h-full space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Ponto Crítico
            </span>
            <div
              className={cn(
                "p-2 rounded-xl",
                ponto_critico && ponto_critico.saldo_acumulado < 0
                  ? "bg-rose-500/10 text-rose-600 dark:text-rose-400"
                  : "bg-blue-500/10 text-blue-600 dark:text-blue-400"
              )}
            >
              {ponto_critico && ponto_critico.saldo_acumulado < 0 ? (
                <AlertTriangle className="h-4 w-4" />
              ) : (
                <ShieldCheck className="h-4 w-4" />
              )}
            </div>
          </div>

          <div>
            <div className="flex items-baseline justify-between">
              <span className="text-lg font-bold text-foreground">
                {ponto_critico ? ponto_critico.nome_mes_completo : "--"}
              </span>
              <span
                className={cn(
                  "text-xs font-bold",
                  ponto_critico && ponto_critico.saldo_acumulado < 0
                    ? "text-rose-600 dark:text-rose-400"
                    : "text-muted-foreground"
                )}
              >
                {ponto_critico ? formatarMoeda(ponto_critico.saldo_acumulado) : "--"}
              </span>
            </div>
            <p className="text-xs text-muted-foreground mt-1.5">
              {ponto_critico && ponto_critico.saldo_acumulado < 0
                ? "Mês com maior déficit projetado"
                : "Menor saldo de liquidez no período"}
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
