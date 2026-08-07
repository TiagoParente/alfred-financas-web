"use client";

import { ContaFixa, FormaPagamentoContaFixa, FrequenciaContaFixaDescricao } from "@/types/contasFixas";
import { TipoMovimentacao } from "@/types/movimentacoes";
import { formatarMoeda } from "@/utils/formatters";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  ArrowDownLeft,
  ArrowUpRight,
  MoreVertical,
  Pencil,
  Trash2,
  Calendar,
  Landmark,
  CreditCard,
  Tag,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface ContaFixaListItemProps {
  contaFixa: ContaFixa;
  onEdit: (contaFixa: ContaFixa) => void;
  onDelete: (id: number) => void;
  onToggleStatus: (id: number) => void;
  isAlternandoStatus?: boolean;
}

export function ContaFixaListItem({
  contaFixa,
  onEdit,
  onDelete,
  onToggleStatus,
  isAlternandoStatus = false,
}: ContaFixaListItemProps) {
  const isReceita = contaFixa.tipo === TipoMovimentacao.RECEITA;

  return (
    <div
      className={cn(
        "p-4 rounded-2xl border border-border/40 bg-card/40 hover:bg-card/70 hover:border-border/80 transition-all group flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4",
        !contaFixa.ativa && "opacity-60 bg-muted/20"
      )}
    >
      {/* Esquerda: Ícone + Título + Badges + Detalhes */}
      <div className="flex items-start sm:items-center gap-3.5 flex-1 min-w-0">
        {/* Ícone por Tipo */}
        <div
          className={cn(
            "h-11 w-11 rounded-2xl flex items-center justify-center shrink-0 shadow-xs transition-transform group-hover:scale-105",
            isReceita
              ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"
              : "bg-rose-500/10 text-rose-600 dark:text-rose-400"
          )}
        >
          {isReceita ? (
            <ArrowDownLeft className="h-5 w-5 stroke-[2.25]" />
          ) : (
            <ArrowUpRight className="h-5 w-5 stroke-[2.25]" />
          )}
        </div>

        {/* Informações textuais */}
        <div className="space-y-1 min-w-0 flex-1">
          <div className="flex items-center gap-2 flex-wrap">
            <h4 className="font-semibold text-sm text-foreground truncate max-w-xs sm:max-w-sm">
              {contaFixa.descricao}
            </h4>

            {/* Badges Frequência e Status */}
            <Badge variant="secondary" className="text-[10px] px-2 py-0.5 font-medium">
              {FrequenciaContaFixaDescricao[contaFixa.frequencia] || contaFixa.frequencia}
            </Badge>

            {!contaFixa.ativa && (
              <Badge variant="outline" className="text-[10px] text-muted-foreground border-border/40">
                Inativa
              </Badge>
            )}
          </div>

          {/* Subtítulo: Vencimento, Categoria, Origem/Conta */}
          <div className="flex items-center gap-3 text-xs text-muted-foreground flex-wrap">
            {/* Vencimento */}
            <div className="flex items-center gap-1">
              <Calendar className="h-3.5 w-3.5 text-muted-foreground/70" />
              <span>Vence dia <strong className="text-foreground font-semibold">{contaFixa.dia_vencimento}</strong></span>
            </div>

            <span>•</span>

            {/* Forma de Pagamento */}
            <div className="flex items-center gap-1">
              {contaFixa.forma_pagamento === FormaPagamentoContaFixa.CARTAO_CREDITO ? (
                <>
                  <CreditCard className="h-3.5 w-3.5 text-muted-foreground/70" />
                  <span>{contaFixa.cartao_credito?.nome || "Cartão de Crédito"}</span>
                </>
              ) : (
                <>
                  <Landmark className="h-3.5 w-3.5 text-muted-foreground/70" />
                  <span>{contaFixa.conta_bancaria?.nome || "Conta Bancária"}</span>
                </>
              )}
            </div>

            {/* Categoria */}
            {contaFixa.categoria && (
              <>
                <span>•</span>
                <div className="flex items-center gap-1">
                  <Tag className="h-3.5 w-3.5 text-muted-foreground/70" />
                  <span>
                    {contaFixa.categoria.nome}
                    {contaFixa.subcategoria && ` / ${contaFixa.subcategoria.nome}`}
                  </span>
                </div>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Direita: Valor + Toggle Status + Menu de Ações */}
      <div className="flex items-center justify-between sm:justify-end gap-4 w-full sm:w-auto shrink-0 pt-2 sm:pt-0 border-t sm:border-t-0 border-border/30">
        <div className="text-left sm:text-right">
          <p
            className={cn(
              "text-base font-bold tracking-tight",
              isReceita ? "text-emerald-600 dark:text-emerald-400" : "text-rose-600 dark:text-rose-400"
            )}
          >
            {isReceita ? "+ " : "- "}
            {formatarMoeda(contaFixa.valor)}
          </p>
        </div>

        {/* Switch Ativa / Inativa */}
        <div className="flex items-center gap-2">
          <Switch
            checked={contaFixa.ativa}
            onCheckedChange={() => onToggleStatus(contaFixa.id)}
            disabled={isAlternandoStatus}
          />
        </div>

        {/* Dropdown Menu */}
        <DropdownMenu>
          <DropdownMenuTrigger className="h-8 w-8 rounded-xl flex items-center justify-center text-muted-foreground hover:bg-accent hover:text-foreground transition-colors cursor-pointer outline-none">
            <MoreVertical className="h-4 w-4" />
            <span className="sr-only">Opções</span>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-40">
            <DropdownMenuItem onClick={() => onEdit(contaFixa)}>
              <Pencil className="mr-2 h-4 w-4 text-muted-foreground" />
              <span>Editar</span>
            </DropdownMenuItem>
            <DropdownMenuItem
              className="text-rose-600 focus:text-rose-600"
              onClick={() => onDelete(contaFixa.id)}
            >
              <Trash2 className="mr-2 h-4 w-4 text-rose-600" />
              <span>Excluir</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  );
}
