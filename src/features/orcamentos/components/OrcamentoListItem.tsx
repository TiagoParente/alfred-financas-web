"use client";

import { Orcamento, StatusOrcamento } from "@/types/orcamento";
import { formatarMoeda } from "@/utils/formatters";
import {
  Tag,
  Pencil,
  Trash2,
  AlertTriangle,
  CheckCircle2,
  AlertOctagon,
  MoreVertical,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";

interface OrcamentoListItemProps {
  orcamento: Orcamento;
  onEditar: (orcamento: Orcamento) => void;
  onDeletar: (orcamento: Orcamento) => void;
}

export function OrcamentoListItem({
  orcamento,
  onEditar,
  onDeletar,
}: OrcamentoListItemProps) {
  const isExcedido = orcamento.status === StatusOrcamento.EXCEDIDO;
  const isAtencao = orcamento.status === StatusOrcamento.ATENCAO;
  const isDentro = orcamento.status === StatusOrcamento.DENTRO_DO_LIMITE;

  const percentual = Math.min(100, Math.max(0, orcamento.percentual_atingido));
  const corHex = orcamento.categoria?.cor_hex || "#1F4E79";

  return (
    <div
      className={cn(
        "group rounded-xl border border-border/50 bg-card p-3 sm:px-4 sm:py-3 transition-all duration-200 hover:border-border/80 hover:shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-3",
        isExcedido && "border-red-500/40 bg-red-500/5",
        isAtencao && "border-amber-500/40 bg-amber-500/5"
      )}
    >
      {/* Esquerda: Ícone Categoria + Nome + Badge */}
      <div className="flex items-center gap-3 min-w-0 flex-1">
        <div
          className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl text-white font-bold shadow-2xs transition-transform duration-200 group-hover:scale-105"
          style={{ backgroundColor: corHex }}
        >
          <Tag className="h-5 w-5" />
        </div>

        <div className="min-w-0 flex-1 space-y-0.5">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="font-semibold text-foreground text-sm truncate">
              {orcamento.categoria?.nome ?? "Categoria"}
            </span>

            <Badge
              variant="outline"
              className={cn(
                "text-[10px] px-2 py-0 h-4 font-semibold border-0 rounded-full gap-1",
                isDentro && "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400",
                isAtencao && "bg-amber-500/10 text-amber-600 dark:text-amber-400",
                isExcedido && "bg-red-500/10 text-red-600 dark:text-red-400"
              )}
            >
              {isDentro && <CheckCircle2 className="h-2.5 w-2.5 inline" />}
              {isAtencao && <AlertTriangle className="h-2.5 w-2.5 inline" />}
              {isExcedido && <AlertOctagon className="h-2.5 w-2.5 inline" />}
              {orcamento.status_label ?? (isDentro ? "Dentro do Limite" : isAtencao ? "Atenção" : "Excedido")}
            </Badge>
          </div>

          {orcamento.observacao && (
            <p className="text-xs text-muted-foreground truncate">
              {orcamento.observacao}
            </p>
          )}
        </div>
      </div>

      {/* Centro: Progresso e Valores */}
      <div className="flex items-center gap-4 sm:w-72 shrink-0">
        <div className="flex-1 space-y-1">
          <div className="flex items-center justify-between text-xs">
            <span
              className={cn(
                "font-bold",
                isExcedido ? "text-red-500" : isAtencao ? "text-amber-500" : "text-foreground"
              )}
            >
              {formatarMoeda(orcamento.valor_gasto)}
            </span>
            <span className="text-muted-foreground text-[11px]">
              / {formatarMoeda(orcamento.valor_limite)}
            </span>
          </div>

          <div className="h-2 w-full rounded-full bg-accent overflow-hidden">
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
        </div>

        <span
          className={cn(
            "text-xs font-bold shrink-0 min-w-[42px] text-right",
            isDentro && "text-emerald-600 dark:text-emerald-400",
            isAtencao && "text-amber-600 dark:text-amber-400",
            isExcedido && "text-red-600 dark:text-red-400"
          )}
        >
          {orcamento.percentual_atingido.toFixed(0)}%
        </span>
      </div>

      {/* Direita: Dropdown de Ações */}
      <div className="flex items-center gap-2 shrink-0 justify-end pt-2 sm:pt-0 border-t sm:border-t-0 border-border/40">
        <DropdownMenu>
          <DropdownMenuTrigger className="h-8 w-8 rounded-lg text-muted-foreground hover:text-foreground flex items-center justify-center hover:bg-accent cursor-pointer transition-colors">
            <MoreVertical className="h-4 w-4" />
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-40 rounded-xl">
            <DropdownMenuItem
              onClick={() => onEditar(orcamento)}
              className="flex items-center gap-2 cursor-pointer"
            >
              <Pencil className="h-3.5 w-3.5 text-muted-foreground" />
              <span>Editar</span>
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={() => onDeletar(orcamento)}
              className="flex items-center gap-2 text-red-500 focus:text-red-500 cursor-pointer"
            >
              <Trash2 className="h-3.5 w-3.5" />
              <span>Excluir</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  );
}
