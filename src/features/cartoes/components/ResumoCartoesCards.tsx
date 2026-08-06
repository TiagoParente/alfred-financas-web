"use client";

import { CreditCard, PieChart, ShieldCheck, Receipt } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { ResumoCartoes } from "@/types/cartoes";
import { formatarMoeda } from "@/utils/formatters";

interface ResumoCartoesCardsProps {
  resumo: ResumoCartoes;
}

export function ResumoCartoesCards({ resumo }: ResumoCartoesCardsProps) {
  const percentualUsado =
    resumo.limite_total > 0
      ? Math.min(
          100,
          Math.round((resumo.limite_usado_total / resumo.limite_total) * 100)
        )
      : 0;

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: Limite Total */}
        <Card className="border-border/40 bg-card/60 shadow-sm backdrop-blur-sm">
          <CardContent className="p-5">
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                Limite Total
              </span>
              <div className="p-2 rounded-xl bg-blue-500/10 text-blue-600 dark:text-blue-400">
                <CreditCard className="h-5 w-5" />
              </div>
            </div>
            <div className="mt-3">
              <span className="text-2xl font-bold tracking-tight text-foreground">
                {formatarMoeda(resumo.limite_total)}
              </span>
              <p className="mt-1 text-xs text-muted-foreground">
                {resumo.total_cartoes}{" "}
                {resumo.total_cartoes === 1
                  ? "cartão cadastrado"
                  : "cartões cadastrados"}
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Card 2: Limite Usado */}
        <Card className="border-border/40 bg-card/60 shadow-sm backdrop-blur-sm">
          <CardContent className="p-5">
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                Limite Usado
              </span>
              <div className="p-2 rounded-xl bg-red-500/10 text-red-600 dark:text-red-400">
                <PieChart className="h-5 w-5" />
              </div>
            </div>
            <div className="mt-3">
              <span className="text-2xl font-bold tracking-tight text-red-600 dark:text-red-400">
                {formatarMoeda(resumo.limite_usado_total)}
              </span>
              <p className="mt-1 text-xs text-muted-foreground">
                {percentualUsado}% do limite total comprometido
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Card 3: Limite Disponível */}
        <Card className="border-border/40 bg-card/60 shadow-sm backdrop-blur-sm">
          <CardContent className="p-5">
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                Limite Disponível
              </span>
              <div className="p-2 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
                <ShieldCheck className="h-5 w-5" />
              </div>
            </div>
            <div className="mt-3">
              <span className="text-2xl font-bold tracking-tight text-emerald-600 dark:text-emerald-400">
                {formatarMoeda(resumo.limite_disponivel_total)}
              </span>
              <p className="mt-1 text-xs text-muted-foreground">
                Livre para novos lançamentos
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Card 4: Faturas Atuais */}
        <Card className="border-border/40 bg-card/60 shadow-sm backdrop-blur-sm">
          <CardContent className="p-5">
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                Faturas Atuais
              </span>
              <div className="p-2 rounded-xl bg-amber-500/10 text-amber-600 dark:text-amber-400">
                <Receipt className="h-5 w-5" />
              </div>
            </div>
            <div className="mt-3">
              <span className="text-2xl font-bold tracking-tight text-amber-600 dark:text-amber-400">
                {formatarMoeda(resumo.fatura_atual_total)}
              </span>
              <p className="mt-1 text-xs text-muted-foreground">
                Soma das faturas no ciclo atual
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Progress bar do Limite Usado */}
      {resumo.limite_total > 0 && (
        <Card className="border-border/40 bg-card/40 p-4">
          <div className="space-y-2">
            <div className="flex justify-between items-center text-xs">
              <span className="font-medium text-muted-foreground">
                Uso Global do Limite
              </span>
              <span className="font-semibold text-foreground">
                {percentualUsado}% comprometido
              </span>
            </div>
            <div className="w-full bg-accent/60 h-2.5 rounded-full overflow-hidden">
              <div
                className={`h-full transition-all duration-300 rounded-full ${
                  percentualUsado > 80
                    ? "bg-red-500"
                    : percentualUsado > 50
                    ? "bg-amber-500"
                    : "bg-[#1F4E79]"
                }`}
                style={{ width: `${percentualUsado}%` }}
              />
            </div>
          </div>
        </Card>
      )}
    </div>
  );
}
