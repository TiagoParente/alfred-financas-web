"use client";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  TrendingUp,
  RefreshCw,
  SlidersHorizontal,
  Calendar,
  Sparkles,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface ProjecaoHeaderProps {
  meses: number;
  onSelectMeses: (meses: number) => void;
  regime: "caixa" | "competencia";
  onSelectRegime: (regime: "caixa" | "competencia") => void;
  temSimulacaoAtiva: boolean;
  simulacoesCount: number;
  onAbrirSimulador: () => void;
  onAtualizar: () => void;
  isAtualizando?: boolean;
}

export function ProjecaoHeader({
  meses,
  onSelectMeses,
  regime,
  onSelectRegime,
  temSimulacaoAtiva,
  simulacoesCount,
  onAbrirSimulador,
  onAtualizar,
  isAtualizando = false,
}: ProjecaoHeaderProps) {
  const opcoesMeses = [
    { label: "3 Meses", valor: 3 },
    { label: "6 Meses", valor: 6 },
    { label: "12 Meses", valor: 12 },
  ];

  return (
    <div className="flex flex-col gap-4">
      {/* Linha Superior: Título e Ações */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-[#1F4E79]/10 dark:bg-sky-500/10 text-[#1F4E79] dark:text-sky-400">
              <TrendingUp className="h-6 w-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-2xl font-bold text-foreground tracking-tight">
                  Projeção Financeira
                </h1>
                {temSimulacaoAtiva && (
                  <Badge
                    variant="outline"
                    className="bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/30 flex items-center gap-1 text-xs px-2.5 py-0.5"
                  >
                    <Sparkles className="h-3 w-3" />
                    Cenário Simulado Ativo ({simulacoesCount})
                  </Badge>
                )}
              </div>
              <p className="text-sm text-muted-foreground mt-0.5">
                Previsibilidade de fluxo de caixa futuro, compromissos fixos, faturas e despesas por categoria.
              </p>
            </div>
          </div>
        </div>

        {/* Botão de Simulação e Refresh */}
        <div className="flex items-center gap-2.5 flex-wrap">
          <Button
            variant={temSimulacaoAtiva ? "default" : "outline"}
            onClick={onAbrirSimulador}
            className={cn(
              "flex items-center gap-2 text-sm font-medium transition-all shadow-sm",
              temSimulacaoAtiva
                ? "bg-amber-600 hover:bg-amber-700 text-white border-amber-600"
                : "border-border hover:bg-muted/80"
            )}
          >
            <SlidersHorizontal className="h-4 w-4" />
            <span>Simulador &quot;E se?&quot;</span>
            {simulacoesCount > 0 && (
              <span className="ml-1 px-1.5 py-0.2 rounded-full text-[11px] bg-white/20">
                {simulacoesCount}
              </span>
            )}
          </Button>

          <Button
            variant="outline"
            size="icon"
            onClick={onAtualizar}
            disabled={isAtualizando}
            className="border-border text-muted-foreground hover:text-foreground h-9 w-9"
            title="Recarregar dados de projeção"
          >
            <RefreshCw className={cn("h-4 w-4", isAtualizando && "animate-spin")} />
          </Button>
        </div>
      </div>

      {/* Linha Inferior: Controles de Horizonte e Regime */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 p-3 rounded-xl bg-card border border-border/80 shadow-xs">
        {/* Seletor de Horizonte Temporal */}
        <div className="flex items-center gap-2">
          <span className="text-xs font-semibold text-muted-foreground flex items-center gap-1.5">
            <Calendar className="h-3.5 w-3.5" />
            Horizonte:
          </span>
          <div className="inline-flex rounded-lg bg-muted/60 p-1 border border-border/40">
            {opcoesMeses.map((opcao) => (
              <button
                key={opcao.valor}
                type="button"
                onClick={() => onSelectMeses(opcao.valor)}
                className={cn(
                  "px-3 py-1 text-xs font-medium rounded-md transition-all",
                  meses === opcao.valor
                    ? "bg-[#1F4E79] text-white shadow-xs dark:bg-sky-600"
                    : "text-muted-foreground hover:text-foreground hover:bg-background/60"
                )}
              >
                {opcao.label}
              </button>
            ))}
          </div>
        </div>

        {/* Seletor de Regime */}
        <div className="flex items-center gap-2">
          <span className="text-xs font-semibold text-muted-foreground">
            Regime:
          </span>
          <div className="inline-flex rounded-lg bg-muted/60 p-1 border border-border/40">
            <button
              type="button"
              onClick={() => onSelectRegime("caixa")}
              className={cn(
                "px-2.5 py-1 text-xs font-medium rounded-md transition-all",
                regime === "caixa"
                  ? "bg-background text-foreground shadow-xs border border-border/60"
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              Caixa (Fatura Cartão)
            </button>
            <button
              type="button"
              onClick={() => onSelectRegime("competencia")}
              className={cn(
                "px-2.5 py-1 text-xs font-medium rounded-md transition-all",
                regime === "competencia"
                  ? "bg-background text-foreground shadow-xs border border-border/60"
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              Competência
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
