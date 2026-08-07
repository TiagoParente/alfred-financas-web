"use client";

import { Card, CardContent } from "@/components/ui/card";
import { formatarMoeda } from "@/utils/formatters";
import { TrendingUp, TrendingDown, Wallet, CalendarSync } from "lucide-react";

interface ContaFixaResumoCardsProps {
  resumo: {
    totalReceitaFixa: number;
    totalDespesaFixa: number;
    saldoProjetadoRecorrente: number;
    totalContasAtivas: number;
    totalContasInativas: number;
    totalGeral: number;
  };
}

export function ContaFixaResumoCards({ resumo }: ContaFixaResumoCardsProps) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {/* Receita Fixa */}
      <Card className="border-border/60 shadow-sm relative overflow-hidden">
        <div className="absolute top-0 left-0 right-0 h-1 bg-emerald-500" />
        <CardContent className="p-5 flex items-center justify-between">
          <div className="space-y-1">
            <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
              Receitas Fixas
            </p>
            <p className="text-2xl font-bold text-emerald-600 dark:text-emerald-400">
              {formatarMoeda(resumo.totalReceitaFixa)}
            </p>
            <p className="text-[11px] text-muted-foreground">
              Total de entradas recorrentes
            </p>
          </div>
          <div className="h-10 w-10 rounded-xl bg-emerald-500/10 flex items-center justify-center text-emerald-600 dark:text-emerald-400 shrink-0">
            <TrendingUp className="h-5 w-5" />
          </div>
        </CardContent>
      </Card>

      {/* Despesa Fixa */}
      <Card className="border-border/60 shadow-sm relative overflow-hidden">
        <div className="absolute top-0 left-0 right-0 h-1 bg-rose-500" />
        <CardContent className="p-5 flex items-center justify-between">
          <div className="space-y-1">
            <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
              Despesas Fixas
            </p>
            <p className="text-2xl font-bold text-rose-600 dark:text-rose-400">
              {formatarMoeda(resumo.totalDespesaFixa)}
            </p>
            <p className="text-[11px] text-muted-foreground">
              Total de saídas recorrentes
            </p>
          </div>
          <div className="h-10 w-10 rounded-xl bg-rose-500/10 flex items-center justify-center text-rose-600 dark:text-rose-400 shrink-0">
            <TrendingDown className="h-5 w-5" />
          </div>
        </CardContent>
      </Card>

      {/* Saldo Projetado */}
      <Card className="border-border/60 shadow-sm relative overflow-hidden">
        <div className="absolute top-0 left-0 right-0 h-1 bg-[#1F4E79]" />
        <CardContent className="p-5 flex items-center justify-between">
          <div className="space-y-1">
            <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
              Resultado Recorrente
            </p>
            <p
              className={`text-2xl font-bold ${
                resumo.saldoProjetadoRecorrente >= 0
                  ? "text-emerald-600 dark:text-emerald-400"
                  : "text-rose-600 dark:text-rose-400"
              }`}
            >
              {formatarMoeda(resumo.saldoProjetadoRecorrente)}
            </p>
            <p className="text-[11px] text-muted-foreground">
              Receitas - Despesas fixas
            </p>
          </div>
          <div className="h-10 w-10 rounded-xl bg-[#1F4E79]/10 flex items-center justify-center text-[#1F4E79] dark:text-sky-400 shrink-0">
            <Wallet className="h-5 w-5" />
          </div>
        </CardContent>
      </Card>

      {/* Total de Contas Ativas */}
      <Card className="border-border/60 shadow-sm relative overflow-hidden">
        <div className="absolute top-0 left-0 right-0 h-1 bg-amber-500" />
        <CardContent className="p-5 flex items-center justify-between">
          <div className="space-y-1">
            <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
              Contas Ativas
            </p>
            <p className="text-2xl font-bold text-foreground">
              {resumo.totalContasAtivas}{" "}
              <span className="text-xs font-normal text-muted-foreground">
                / {resumo.totalGeral}
              </span>
            </p>
            <p className="text-[11px] text-muted-foreground">
              {resumo.totalContasInativas} inativa(s)
            </p>
          </div>
          <div className="h-10 w-10 rounded-xl bg-amber-500/10 flex items-center justify-center text-amber-600 dark:text-amber-400 shrink-0">
            <CalendarSync className="h-5 w-5" />
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
