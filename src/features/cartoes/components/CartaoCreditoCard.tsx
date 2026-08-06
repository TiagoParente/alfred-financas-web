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

interface CartaoCreditoCardProps {
  cartao: CartaoCredito;
  onVisualizarFatura: (cartao: CartaoCredito) => void;
  onLancarDespesa?: (cartao: CartaoCredito) => void;
  onEditar: (cartao: CartaoCredito) => void;
  onDeletar: (cartao: CartaoCredito) => void;
}

export function CartaoCreditoCard({
  cartao,
  onVisualizarFatura,
  onLancarDespesa,
  onEditar,
  onDeletar,
}: CartaoCreditoCardProps) {
  const percentualUsado =
    cartao.limite > 0
      ? Math.min(
          100,
          Math.round((cartao.limite_usado / cartao.limite) * 100)
        )
      : 0;

  // Cor principal do cartão (do banco ou customizada)
  const corHex = cartao.cor_hex || cartao.banco?.cor_hex || "#1F4E79";

  return (
    <div className="group relative flex flex-col justify-between rounded-2xl border border-border/40 bg-card p-5 shadow-sm transition-all duration-200 hover:shadow-md hover:border-border">
      {/* Top Header do Card: Banco / Nome & Opções */}
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-3">
          <div
            className="flex h-11 w-11 items-center justify-center rounded-xl text-white font-bold shadow-inner"
            style={{ backgroundColor: corHex }}
          >
            {cartao.banco?.logo_url ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={cartao.banco.logo_url}
                alt={cartao.banco.nome}
                className="h-7 w-7 object-contain"
              />
            ) : (
              <CreditCardIcon className="h-6 w-6" />
            )}
          </div>
          <div>
            <h3 className="font-semibold text-foreground tracking-tight text-base">
              {cartao.nome}
            </h3>
            <p className="text-xs text-muted-foreground">
              {cartao.banco?.nome ?? "Sem banco vinculado"}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {cartao.bandeira_descricao && (
            <Badge
              variant="outline"
              className="text-[11px] font-medium border-border/60 uppercase tracking-wide px-2 py-0.5"
            >
              {cartao.bandeira_descricao}
            </Badge>
          )}

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

      {/* Meio: Informações de Fatura Atual e Limite */}
      <div className="mt-5 space-y-4">
        {/* Bloco Fatura Atual */}
        <div className="flex items-baseline justify-between rounded-xl bg-accent/40 p-3">
          <div>
            <span className="text-[11px] font-medium text-muted-foreground uppercase tracking-wider block">
              Fatura Atual
            </span>
            <span className="text-lg font-bold text-foreground">
              {formatarMoeda(cartao.fatura_atual)}
            </span>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={() => onVisualizarFatura(cartao)}
            className="h-8 text-xs font-medium border-border/60 hover:bg-accent rounded-lg gap-1.5 cursor-pointer"
          >
            <Receipt className="h-3.5 w-3.5 text-amber-500" />
            Detalhes
          </Button>
        </div>

        {/* Barra de Progresso do Limite */}
        <div className="space-y-1.5">
          <div className="flex justify-between text-xs">
            <span className="text-muted-foreground">
              Usado:{" "}
              <strong className="text-foreground font-semibold">
                {formatarMoeda(cartao.limite_usado)}
              </strong>
            </span>
            <span className="text-muted-foreground">
              Disponível:{" "}
              <strong className="text-emerald-600 dark:text-emerald-400 font-semibold">
                {formatarMoeda(cartao.limite_disponivel)}
              </strong>
            </span>
          </div>

          <div className="w-full bg-accent/60 h-2 rounded-full overflow-hidden">
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
          <p className="text-[11px] text-right text-muted-foreground">
            Limite Total: {formatarMoeda(cartao.limite)}
          </p>
        </div>
      </div>

      {/* Rodapé: Datas de Fechamento e Vencimento */}
      <div className="mt-4 pt-3 border-t border-border/40 flex items-center justify-between text-xs text-muted-foreground">
        <div className="flex items-center gap-1.5">
          <Calendar className="h-3.5 w-3.5 text-muted-foreground/70" />
          <span>Fechamento: Dia {cartao.dia_fechamento}</span>
        </div>
        <div className="flex items-center gap-1.5 font-medium text-foreground">
          <span>Vencimento: Dia {cartao.dia_vencimento}</span>
        </div>
      </div>
    </div>
  );
}
