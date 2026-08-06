import { ArrowUpCircle, ArrowDownCircle, Scale, Clock } from "lucide-react";
import { ResumoPeriodo } from "@/types/movimentacoes";
import { formatarMoeda } from "@/utils/formatters";
import { cn } from "@/lib/utils";

interface ResumoMovimentacoesCardsProps {
  resumo: ResumoPeriodo;
}

export function ResumoMovimentacoesCards({ resumo }: ResumoMovimentacoesCardsProps) {
  const isPositivo = resumo.saldo_periodo >= 0;

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {/* Entradas / Receitas */}
      <div className="p-5 rounded-2xl border border-emerald-500/20 bg-emerald-500/5 dark:bg-emerald-950/20 shadow-xs space-y-2">
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold text-emerald-700 dark:text-emerald-400 uppercase tracking-wider">
            Entradas (Receitas)
          </span>
          <div className="p-2 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
            <ArrowUpCircle className="h-5 w-5" />
          </div>
        </div>
        <p className="text-2xl font-bold text-emerald-600 dark:text-emerald-400 tracking-tight">
          {formatarMoeda(resumo.total_receitas)}
        </p>
        <p className="text-xs text-muted-foreground">No período selecionado</p>
      </div>

      {/* Saídas / Despesas */}
      <div className="p-5 rounded-2xl border border-red-500/20 bg-red-500/5 dark:bg-red-950/20 shadow-xs space-y-2">
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold text-red-700 dark:text-red-400 uppercase tracking-wider">
            Saídas (Despesas)
          </span>
          <div className="p-2 rounded-xl bg-red-500/10 text-red-600 dark:text-red-400">
            <ArrowDownCircle className="h-5 w-5" />
          </div>
        </div>
        <p className="text-2xl font-bold text-red-600 dark:text-red-400 tracking-tight">
          {formatarMoeda(resumo.total_despesas)}
        </p>
        <p className="text-xs text-muted-foreground">No período selecionado</p>
      </div>

      {/* Resultado do Período */}
      <div className="p-5 rounded-2xl border border-border/60 bg-card/60 shadow-xs space-y-2">
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
            Resultado do Período
          </span>
          <div className="p-2 rounded-xl bg-[#1F4E79]/10 text-[#1F4E79]">
            <Scale className="h-5 w-5" />
          </div>
        </div>
        <p
          className={cn(
            "text-2xl font-bold tracking-tight",
            isPositivo
              ? "text-emerald-600 dark:text-emerald-400"
              : "text-red-600 dark:text-red-400"
          )}
        >
          {formatarMoeda(resumo.saldo_periodo)}
        </p>
        <p className="text-xs text-muted-foreground">
          {isPositivo ? "Superávit do período" : "Déficit do período"}
        </p>
      </div>

      {/* Pendentes */}
      <div className="p-5 rounded-2xl border border-amber-500/20 bg-amber-500/5 dark:bg-amber-950/20 shadow-xs space-y-2">
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold text-amber-700 dark:text-amber-400 uppercase tracking-wider">
            A Vencer / Pendente
          </span>
          <div className="p-2 rounded-xl bg-amber-500/10 text-amber-600 dark:text-amber-400">
            <Clock className="h-5 w-5" />
          </div>
        </div>
        <p className="text-2xl font-bold text-amber-600 dark:text-amber-400 tracking-tight">
          {formatarMoeda(resumo.total_pendente)}
        </p>
        <p className="text-xs text-muted-foreground">Aguardando confirmação</p>
      </div>
    </div>
  );
}
