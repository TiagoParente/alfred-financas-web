"use client";

import {
  ArrowUpRight,
  ArrowDownLeft,
  ArrowLeftRight,
  MoreVertical,
  CheckCircle2,
  Pencil,
  Trash2,
  Calendar,
  Landmark,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Movimentacao,
  StatusMovimentacao,
  TipoMovimentacao,
} from "@/types/movimentacoes";
import { formatarData, formatarMoeda } from "@/utils/formatters";
import { cn } from "@/lib/utils";

interface MovimentacaoListItemProps {
  movimentacao: Movimentacao;
  onEditar: (movimentacao: Movimentacao) => void;
  onDeletar: (movimentacao: Movimentacao) => void;
  onMarcarPago: (movimentacao: Movimentacao) => void;
}

export function MovimentacaoListItem({
  movimentacao,
  onEditar,
  onDeletar,
  onMarcarPago,
}: MovimentacaoListItemProps) {
  const isReceita = movimentacao.tipo === TipoMovimentacao.RECEITA;
  const isDespesa = movimentacao.tipo === TipoMovimentacao.DESPESA;
  const isTransferencia = movimentacao.tipo === TipoMovimentacao.TRANSFERENCIA;
  const isPago = movimentacao.status === StatusMovimentacao.PAGO;

  return (
    <div className="p-4 rounded-2xl border border-border/40 bg-card/40 hover:bg-card/70 hover:border-border/80 transition-all group flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
      {/* Esquerda: Ícone + Descrição + Metadados */}
      <div className="flex items-start sm:items-center gap-3.5 flex-1 min-w-0">
        {/* Ícone por Tipo */}
        <div
          className={cn(
            "h-11 w-11 rounded-2xl flex items-center justify-center shrink-0 shadow-xs transition-transform group-hover:scale-105",
            isReceita && "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400",
            isDespesa && "bg-red-500/10 text-red-600 dark:text-red-400",
            isTransferencia && "bg-[#1F4E79]/15 text-[#1F4E79] dark:text-sky-400"
          )}
        >
          {isReceita && <ArrowDownLeft className="h-5 w-5 stroke-[2.25]" />}
          {isDespesa && <ArrowUpRight className="h-5 w-5 stroke-[2.25]" />}
          {isTransferencia && <ArrowLeftRight className="h-5 w-5 stroke-[2.25]" />}
        </div>

        {/* Textos */}
        <div className="space-y-1 min-w-0 flex-1">
          <div className="flex items-center gap-2 flex-wrap">
            <h4 className="font-semibold text-sm text-foreground truncate max-w-xs sm:max-w-sm">
              {movimentacao.descricao}
            </h4>

            {/* Status Badge */}
            <Badge
              variant="outline"
              className={cn(
                "text-[10px] px-2 py-0.5 rounded-full font-medium border-0",
                isPago
                  ? "bg-emerald-500/10 text-emerald-700 dark:text-emerald-400"
                  : "bg-amber-500/10 text-amber-700 dark:text-amber-400"
              )}
            >
              {isPago ? "Pago" : "Pendente"}
            </Badge>
          </div>

          {/* Categoria, Subcategoria e Conta */}
          <div className="flex items-center gap-3 text-xs text-muted-foreground flex-wrap">
            {/* Categoria / Subcategoria */}
            {isTransferencia ? (
              <span className="font-medium text-[#1F4E79] dark:text-sky-400">
                Transferência
              </span>
            ) : (
              <span>
                {movimentacao.categoria?.nome || "Sem categoria"}
                {movimentacao.subcategoria?.nome && (
                  <span className="opacity-75"> • {movimentacao.subcategoria.nome}</span>
                )}
              </span>
            )}

            <span>•</span>

            {/* Conta Bancária */}
            <div className="flex items-center gap-1">
              <Landmark className="h-3.5 w-3.5 text-muted-foreground/70" />
              <span>{movimentacao.conta_bancaria?.nome || "Conta"}</span>
              {isTransferencia && movimentacao.conta_bancaria_destino && (
                <span className="font-medium text-foreground">
                  {" → "}
                  {movimentacao.conta_bancaria_destino.nome}
                </span>
              )}
            </div>

            <span>•</span>

            {/* Data */}
            <div className="flex items-center gap-1">
              <Calendar className="h-3.5 w-3.5 text-muted-foreground/70" />
              <span>{formatarData(movimentacao.data_movimentacao)}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Direita: Valor + Ações */}
      <div className="flex items-center justify-between sm:justify-end gap-3 w-full sm:w-auto shrink-0 pt-2 sm:pt-0 border-t sm:border-t-0 border-border/30">
        <div className="text-left sm:text-right">
          <p
            className={cn(
              "text-base font-bold tracking-tight",
              isReceita && "text-emerald-600 dark:text-emerald-400",
              isDespesa && "text-red-600 dark:text-red-400",
              isTransferencia && "text-foreground font-semibold"
            )}
          >
            {isReceita && "+ "}
            {isDespesa && "- "}
            {formatarMoeda(movimentacao.valor)}
          </p>

          {/* Nome de quem criou se disponível */}
          {movimentacao.usuario_nome && (
            <p className="text-[11px] text-muted-foreground">
              por {movimentacao.usuario_nome}
            </p>
          )}
        </div>

        {/* Menu de Ações */}
        <DropdownMenu>
          <DropdownMenuTrigger
            render={
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 rounded-xl hover:bg-accent text-muted-foreground hover:text-foreground"
              >
                <MoreVertical className="h-4 w-4" />
                <span className="sr-only">Opções</span>
              </Button>
            }
          />
          <DropdownMenuContent align="end" className="w-48 rounded-2xl p-1.5 space-y-0.5">
            {!isPago && (
              <DropdownMenuItem
                onClick={() => onMarcarPago(movimentacao)}
                className="rounded-xl text-xs font-medium cursor-pointer text-emerald-600 dark:text-emerald-400 focus:bg-emerald-500/10 focus:text-emerald-600"
              >
                <CheckCircle2 className="h-4 w-4 mr-2" />
                <span>Marcar como Pago</span>
              </DropdownMenuItem>
            )}

            <DropdownMenuItem
              onClick={() => onEditar(movimentacao)}
              className="rounded-xl text-xs font-medium cursor-pointer"
            >
              <Pencil className="h-4 w-4 mr-2 text-muted-foreground" />
              <span>Editar Movimentação</span>
            </DropdownMenuItem>

            <DropdownMenuSeparator className="bg-border/40" />

            <DropdownMenuItem
              onClick={() => onDeletar(movimentacao)}
              className="rounded-xl text-xs font-medium cursor-pointer text-destructive focus:bg-destructive/10 focus:text-destructive"
            >
              <Trash2 className="h-4 w-4 mr-2" />
              <span>Excluir Movimentação</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  );
}
