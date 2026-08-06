"use client";

import {
  CreditCard as CreditCardIcon,
  MoreVertical,
  Receipt,
  Pencil,
  Trash2,
  Calendar,
  Plus,
} from "lucide-react";
import { CartaoCredito } from "@/types/cartoes";
import { formatarMoeda } from "@/utils/formatters";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface CartaoCreditoListItemProps {
  cartao: CartaoCredito;
  onVisualizarFatura: (cartao: CartaoCredito) => void;
  onLancarDespesa?: (cartao: CartaoCredito) => void;
  onEditar: (cartao: CartaoCredito) => void;
  onDeletar: (cartao: CartaoCredito) => void;
}

export function CartaoCreditoListItem({
  cartao,
  onVisualizarFatura,
  onLancarDespesa,
  onEditar,
  onDeletar,
}: CartaoCreditoListItemProps) {
  const corHex = cartao.cor_hex || cartao.banco?.cor_hex || "#1F4E79";

  const percentualUsado =
    cartao.limite > 0
      ? Math.min(
          100,
          Math.round((cartao.limite_usado / cartao.limite) * 100)
        )
      : 0;

  return (
    <div className="group rounded-xl border border-border/40 bg-card p-3 sm:px-4 sm:py-3 transition-all duration-200 hover:border-border/80 hover:shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-3">
      {/* Lado Esquerdo: Ícone/Logo + Informações do Cartão */}
      <div className="flex items-center gap-3 min-w-0 flex-1">
        <div
          className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl text-white font-bold text-sm shadow-inner transition-transform duration-200 group-hover:scale-105"
          style={{ backgroundColor: corHex }}
        >
          {cartao.banco?.logo_url ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={cartao.banco.logo_url}
              alt={cartao.banco.nome}
              className="h-6 w-6 object-contain"
            />
          ) : (
            <CreditCardIcon className="h-5 w-5" />
          )}
        </div>

        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="font-semibold text-foreground text-sm truncate">
              {cartao.nome}
            </span>

            {cartao.banco?.nome && (
              <span className="text-xs text-muted-foreground hidden md:inline">
                • {cartao.banco.nome}
              </span>
            )}

            {cartao.bandeira_descricao && (
              <Badge
                variant="outline"
                className="text-[9px] px-1.5 py-0 h-4 border-border/60 uppercase text-muted-foreground font-medium"
              >
                {cartao.bandeira_descricao}
              </Badge>
            )}
          </div>

          <div className="flex items-center gap-3 mt-1 text-[11px] text-muted-foreground">
            <span className="flex items-center gap-1">
              <Calendar className="h-3 w-3 text-muted-foreground/70" />
              Fechamento: Dia {cartao.dia_fechamento}
            </span>
            <span>•</span>
            <span className="font-medium text-foreground">
              Vencimento: Dia {cartao.dia_vencimento}
            </span>
          </div>
        </div>
      </div>

      {/* Lado Direito: Fatura Atual, Limite & Ações */}
      <div className="flex items-center justify-between sm:justify-end gap-4 shrink-0 border-t sm:border-t-0 pt-2 sm:pt-0 border-border/40">
        {/* Progresso e Limite */}
        <div className="hidden lg:block w-36 space-y-1 text-right">
          <div className="flex justify-between text-[10px] text-muted-foreground">
            <span>Usado</span>
            <span className="font-medium text-foreground">{percentualUsado}%</span>
          </div>
          <div className="w-full bg-accent/60 h-1.5 rounded-full overflow-hidden">
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
          <p className="text-[10px] text-muted-foreground">
            Disp: {formatarMoeda(cartao.limite_disponivel)}
          </p>
        </div>

        {/* Fatura Atual */}
        <div className="text-right">
          <span className="text-[10px] text-muted-foreground block font-medium uppercase tracking-wider">
            Fatura Atual
          </span>
          <span className="text-sm sm:text-base font-bold text-foreground block">
            {formatarMoeda(cartao.fatura_atual)}
          </span>
        </div>

        {/* Botão Ver Fatura */}
        <Button
          variant="outline"
          size="sm"
          onClick={() => onVisualizarFatura(cartao)}
          className="h-8 text-xs font-medium border-border/60 hover:bg-accent rounded-lg gap-1 px-2.5 cursor-pointer"
        >
          <Receipt className="h-3.5 w-3.5 text-amber-500" />
          <span className="hidden xs:inline">Fatura</span>
        </Button>

        {/* Menu de Ações */}
        <DropdownMenu>
          <DropdownMenuTrigger className="h-8 w-8 text-muted-foreground hover:text-foreground rounded-lg flex items-center justify-center hover:bg-accent cursor-pointer transition-colors">
            <MoreVertical className="h-4 w-4" />
            <span className="sr-only">Ações</span>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-44 rounded-xl">
            <DropdownMenuItem
              onClick={() => onVisualizarFatura(cartao)}
              className="cursor-pointer gap-2"
            >
              <Receipt className="h-4 w-4 text-amber-500" />
              <span>Ver Fatura</span>
            </DropdownMenuItem>
            {onLancarDespesa && (
              <DropdownMenuItem
                onClick={() => onLancarDespesa(cartao)}
                className="cursor-pointer gap-2"
              >
                <Plus className="h-4 w-4 text-emerald-500" />
                <span>Lançar Despesa</span>
              </DropdownMenuItem>
            )}
            <DropdownMenuItem
              onClick={() => onEditar(cartao)}
              className="cursor-pointer gap-2"
            >
              <Pencil className="h-4 w-4 text-blue-500" />
              <span>Editar Cartão</span>
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={() => onDeletar(cartao)}
              className="cursor-pointer gap-2 text-red-600 dark:text-red-400 focus:text-red-600 focus:bg-red-50 dark:focus:bg-red-950/40"
            >
              <Trash2 className="h-4 w-4" />
              <span>Excluir</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  );
}
