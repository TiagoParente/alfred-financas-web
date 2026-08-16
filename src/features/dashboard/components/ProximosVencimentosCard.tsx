"use client";

import { ProximoVencimento } from "@/types/dashboard";
import { formatarMoeda } from "@/utils/formatters";
import { CalendarClock, CreditCard, Landmark, CheckCircle2, ArrowRight } from "lucide-react";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";

interface ProximosVencimentosCardProps {
  vencimentos: ProximoVencimento[];
}

export function ProximosVencimentosCard({
  vencimentos,
}: ProximosVencimentosCardProps) {
  if (vencimentos.length === 0) {
    return (
      <div className="rounded-[16px] border border-border/50 bg-card p-6 shadow-sm space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <CalendarClock className="h-5 w-5 text-[#1F4E79]" />
            <h3 className="text-base font-bold text-foreground">
              Próximos Vencimentos
            </h3>
          </div>
        </div>
        <div className="flex flex-col items-center justify-center rounded-[12px] border border-dashed border-border/70 p-6 text-center bg-accent/10">
          <CheckCircle2 className="h-8 w-8 text-[#22C55E] mb-2" />
          <p className="text-sm font-medium text-foreground">
            Nenhuma despesa pendente a vencer nos próximos 30 dias!
          </p>
          <p className="text-xs text-muted-foreground mt-1">
            Suas contas recorrentes e faturas estão em dia.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="rounded-[16px] border border-border/50 bg-card p-6 shadow-sm space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <CalendarClock className="h-5 w-5 text-[#1F4E79]" />
          <h3 className="text-base font-bold text-foreground">
            Próximos Vencimentos
          </h3>
        </div>
        <Link
          href="/movimentacoes"
          className="flex items-center gap-1 text-xs font-semibold text-[#1F4E79] hover:underline"
        >
          <span>Ver todas</span>
          <ArrowRight className="h-3.5 w-3.5" />
        </Link>
      </div>

      <div className="divide-y divide-border/40">
        {vencimentos.map((vencimento) => {
          const isCartao = vencimento.origem === "cartao";
          const dataVenc = vencimento.data_vencimento
            ? new Date(vencimento.data_vencimento + "T00:00:00")
            : null;

          const dataFormatada = dataVenc
            ? dataVenc.toLocaleDateString("pt-BR", {
                day: "2-digit",
                month: "2-digit",
              })
            : "A definir";

          return (
            <div
              key={vencimento.id}
              className="flex items-center justify-between py-3 hover:bg-accent/20 px-2 rounded-lg transition-colors"
            >
              <div className="flex items-center gap-3">
                <div
                  className="flex h-10 w-10 items-center justify-center rounded-xl shrink-0"
                  style={{
                    backgroundColor: vencimento.categoria_cor
                      ? `${vencimento.categoria_cor}20`
                      : "#1F4E7915",
                    color: vencimento.categoria_cor || "#1F4E79",
                  }}
                >
                  {isCartao ? (
                    <CreditCard className="h-4 w-4" />
                  ) : (
                    <Landmark className="h-4 w-4" />
                  )}
                </div>

                <div className="space-y-0.5">
                  <p className="text-sm font-semibold text-foreground leading-snug">
                    {vencimento.descricao}
                  </p>
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-muted-foreground">
                      {vencimento.categoria_nome || (isCartao ? "Fatura de Cartão" : "Conta Bancária")}
                    </span>
                    <Badge
                      variant="outline"
                      className={`text-[10px] py-0 px-1.5 border-border/50 font-medium ${
                        isCartao
                          ? "bg-purple-500/10 text-purple-600 border-purple-500/20 dark:text-purple-400"
                          : "bg-blue-500/10 text-blue-600 border-blue-500/20 dark:text-blue-400"
                      }`}
                    >
                      {isCartao ? "Fatura" : "Conta"}
                    </Badge>
                  </div>
                </div>
              </div>

              <div className="text-right space-y-0.5">
                <span className="text-sm font-bold text-red-500">
                  {formatarMoeda(vencimento.valor)}
                </span>
                <p className="text-xs text-muted-foreground font-medium">
                  Vence {dataFormatada}
                </p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
