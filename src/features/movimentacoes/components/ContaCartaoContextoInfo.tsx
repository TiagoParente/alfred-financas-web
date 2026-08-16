"use client";

import { ContaBancaria } from "@/types/contas";
import { CartaoCredito } from "@/types/cartoes";
import { useUltimaMovimentacao } from "../hooks/useUltimaMovimentacao";
import { formatarData, formatarMoeda } from "@/utils/formatters";
import {
  Wallet,
  CreditCard,
  History,
  Clock,
  ArrowDownLeft,
  ArrowUpRight,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { TipoMovimentacao } from "@/types/movimentacoes";

interface ContaCartaoContextoInfoProps {
  conta?: ContaBancaria | null;
  cartao?: CartaoCredito | null;
  familiaId?: number | null;
  className?: string;
  labelPersonalizado?: string;
}

export function ContaCartaoContextoInfo({
  conta,
  cartao,
  familiaId,
  className,
  labelPersonalizado,
}: ContaCartaoContextoInfoProps) {
  const contaId = conta?.id ?? null;
  const cartaoId = cartao?.id ?? null;

  const { ultimaMovimentacao, isLoading } = useUltimaMovimentacao({
    contaBancariaId: contaId,
    cartaoCreditoId: cartaoId,
    familiaId,
    enabled: Boolean(contaId || cartaoId),
  });

  if (!conta && !cartao) {
    return null;
  }

  return (
    <div
      className={cn(
        "rounded-xl border border-border/50 bg-muted/30 p-2.5 text-xs transition-all space-y-1.5",
        className
      )}
    >
      {/* Linha 1: Saldo ou Fatura / Limite */}
      <div className="flex flex-wrap items-center justify-between gap-1.5">
        {conta && (
          <div className="flex items-center gap-1.5">
            <Wallet className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
            <span className="text-muted-foreground font-medium">
              {labelPersonalizado || "Saldo Atual"}:
            </span>
            <span
              className={cn(
                "font-semibold",
                conta.saldo_atual < 0
                  ? "text-red-600 dark:text-red-400"
                  : "text-emerald-600 dark:text-emerald-400"
              )}
            >
              {formatarMoeda(conta.saldo_atual)}
            </span>
          </div>
        )}

        {cartao && (
          <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
            <div className="flex items-center gap-1.5">
              <CreditCard className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
              <span className="text-muted-foreground font-medium">Fatura Atual:</span>
              <span className="font-semibold text-red-600 dark:text-red-400">
                {formatarMoeda(cartao.fatura_atual)}
              </span>
            </div>
            <div className="flex items-center gap-1">
              <span className="text-muted-foreground text-[11px]">Limite Disp.:</span>
              <span className="font-medium text-foreground text-[11px]">
                {formatarMoeda(cartao.limite_disponivel)}
              </span>
            </div>
          </div>
        )}
      </div>

      {/* Linha 2: Data e detalhes da última movimentação */}
      <div className="flex items-center gap-1.5 text-[11px] text-muted-foreground pt-1 border-t border-border/40">
        <History className="h-3 w-3 text-muted-foreground/80 shrink-0" />
        {isLoading ? (
          <span className="inline-flex items-center gap-1 text-muted-foreground/70 animate-pulse">
            <Clock className="h-2.5 w-2.5 animate-spin" />
            Buscando última movimentação...
          </span>
        ) : ultimaMovimentacao ? (
          <div className="flex items-center gap-1.5 truncate">
            <span>Última movimentação:</span>
            <span className="font-semibold text-foreground">
              {formatarData(ultimaMovimentacao.data_movimentacao)}
            </span>
            <span className="text-muted-foreground/70">•</span>
            <span className="truncate font-medium text-foreground max-w-[140px] sm:max-w-[200px]" title={ultimaMovimentacao.descricao}>
              {ultimaMovimentacao.descricao}
            </span>
            <span className="inline-flex items-center text-muted-foreground font-semibold">
              (
              {ultimaMovimentacao.tipo === TipoMovimentacao.RECEITA ? (
                <ArrowDownLeft className="h-3 w-3 text-emerald-500 inline mr-0.5" />
              ) : (
                <ArrowUpRight className="h-3 w-3 text-red-500 inline mr-0.5" />
              )}
              {formatarMoeda(ultimaMovimentacao.valor)}
              )
            </span>
          </div>
        ) : (
          <span className="text-muted-foreground/80 italic">
            Nenhuma movimentação anterior registrada
          </span>
        )}
      </div>
    </div>
  );
}
