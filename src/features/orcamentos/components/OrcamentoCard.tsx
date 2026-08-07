"use client";

import { Orcamento, StatusOrcamento } from "@/types/orcamento";
import { formatarMoeda } from "@/utils/formatters";
import { AlertTriangle, CheckCircle2, AlertOctagon, Pencil, Trash2, Tag } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

interface OrcamentoCardProps {
  orcamento: Orcamento;
  onEditar: (orcamento: Orcamento) => void;
  onDeletar: (orcamento: Orcamento) => void;
}

export function OrcamentoCard({ orcamento, onEditar, onDeletar }: OrcamentoCardProps) {
  const isExcedido = orcamento.status === StatusOrcamento.EXCEDIDO;
  const isAtencao = orcamento.status === StatusOrcamento.ATENCAO;
  const isDentro = orcamento.status === StatusOrcamento.DENTRO_DO_LIMITE;

  const percentual = Math.min(100, Math.max(0, orcamento.percentual_atingido));

  return (
    <div
      className={cn(
        "group relative flex flex-col justify-between rounded-[20px] border border-border/60 bg-card p-6 shadow-sm transition-all duration-200 hover:shadow-md hover:border-border",
        isExcedido && "border-red-500/40 bg-red-500/5",
        isAtencao && "border-amber-500/40 bg-amber-500/5"
      )}
    >
      {/* Indicador Lateral de Status */}
      <div
        className={cn(
          "absolute left-0 top-6 bottom-6 w-1.5 rounded-r-full transition-all",
          isDentro && "bg-emerald-500",
          isAtencao && "bg-amber-500",
          isExcedido && "bg-red-500"
        )}
      />

      <div className="pl-3 space-y-4">
        {/* Header do Card */}
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-3">
            <div
              className={cn(
                "flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl text-white shadow-sm",
                orcamento.categoria?.cor_hex ? "" : "bg-[#1F4E79]"
              )}
              style={
                orcamento.categoria?.cor_hex
                  ? { backgroundColor: orcamento.categoria.cor_hex }
                  : {}
              }
            >
              <Tag className="h-6 w-6 text-white" />
            </div>
            <div>
              <h3 className="font-bold text-foreground text-base tracking-tight leading-tight">
                {orcamento.categoria?.nome ?? "Categoria Excluída"}
              </h3>
              {orcamento.observacao && (
                <p className="text-xs text-muted-foreground line-clamp-1 mt-0.5">
                  {orcamento.observacao}
                </p>
              )}
            </div>
          </div>

          <Badge
            variant="outline"
            className={cn(
              "text-xs px-2.5 py-0.5 font-semibold rounded-full border-0 gap-1",
              isDentro && "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400",
              isAtencao && "bg-amber-500/10 text-amber-600 dark:text-amber-400",
              isExcedido && "bg-red-500/10 text-red-600 dark:text-red-400"
            )}
          >
            {isDentro && <CheckCircle2 className="h-3.5 w-3.5 inline" />}
            {isAtencao && <AlertTriangle className="h-3.5 w-3.5 inline" />}
            {isExcedido && <AlertOctagon className="h-3.5 w-3.5 inline" />}
            {orcamento.status_label ?? (isDentro ? "Dentro do Limite" : isAtencao ? "Atenção" : "Excedido")}
          </Badge>
        </div>

        {/* Valores e Progresso */}
        <div className="space-y-2 pt-1">
          <div className="flex items-baseline justify-between">
            <span className="text-xs text-muted-foreground">Consumido</span>
            <span className="text-xs text-muted-foreground">Teto / Limite</span>
          </div>

          <div className="flex items-baseline justify-between">
            <span
              className={cn(
                "text-xl font-extrabold tracking-tight",
                isExcedido ? "text-red-500" : isAtencao ? "text-amber-500" : "text-foreground"
              )}
            >
              {formatarMoeda(orcamento.valor_gasto)}
            </span>
            <span className="text-sm font-semibold text-muted-foreground">
              {formatarMoeda(orcamento.valor_limite)}
            </span>
          </div>

          {/* Barra de Progresso Customizada */}
          <div className="space-y-1.5 pt-1">
            <div className="h-2.5 w-full rounded-full bg-accent overflow-hidden">
              <div
                className={cn(
                  "h-full rounded-full transition-all duration-500",
                  isDentro && "bg-emerald-500",
                  isAtencao && "bg-amber-500",
                  isExcedido && "bg-red-500"
                )}
                style={{ width: `${percentual}%` }}
              />
            </div>
            <div className="flex items-center justify-between text-xs">
              <span
                className={cn(
                  "font-semibold",
                  isDentro && "text-emerald-600 dark:text-emerald-400",
                  isAtencao && "text-amber-600 dark:text-amber-400",
                  isExcedido && "text-red-600 dark:text-red-400"
                )}
              >
                {orcamento.percentual_atingido.toFixed(1)}% utilizado
              </span>
              <span className="text-muted-foreground">
                {isExcedido
                  ? `Excedeu ${formatarMoeda(orcamento.valor_gasto - orcamento.valor_limite)}`
                  : `Restam ${formatarMoeda(orcamento.valor_restante)}`}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Footer / Ações */}
      <div className="pl-3 mt-6 flex items-center justify-end gap-2 border-t border-border/40 pt-4">
        <Button
          onClick={() => onEditar(orcamento)}
          variant="ghost"
          size="sm"
          className="rounded-[10px] text-muted-foreground hover:text-foreground gap-1.5"
        >
          <Pencil className="h-4 w-4" />
          <span>Editar</span>
        </Button>

        <Button
          onClick={() => onDeletar(orcamento)}
          variant="ghost"
          size="sm"
          className="rounded-[10px] text-muted-foreground hover:text-red-500 gap-1.5"
        >
          <Trash2 className="h-4 w-4" />
          <span>Excluir</span>
        </Button>
      </div>
    </div>
  );
}
