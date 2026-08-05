"use client";

import { ContaBancaria } from "@/types/contas";
import { formatarMoeda } from "@/utils/formatters";
import { Landmark, MoreVertical, Edit2, Trash2, ShieldAlert, Eye } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";

interface ContaBancariaListItemProps {
  conta: ContaBancaria;
  onEditar: (conta: ContaBancaria) => void;
  onDeletar: (conta: ContaBancaria) => void;
}

export function ContaBancariaListItem({
  conta,
  onEditar,
  onDeletar,
}: ContaBancariaListItemProps) {
  const corBg = conta.cor_hex || "#1F4E79";

  return (
    <div className="group rounded-xl border border-border/40 bg-card p-3 sm:px-4 sm:py-3 transition-all duration-200 hover:border-border/80 hover:shadow-2xs flex items-center justify-between gap-3">
      {/* Lado Esquerdo: Logo/Ícone + Nome + Informações */}
      <div className="flex items-center gap-3 min-w-0 flex-1">
        {/* Logo/Avatar do Banco */}
        <div
          className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl text-white font-bold text-sm shadow-2xs transition-transform duration-200 group-hover:scale-105"
          style={{ backgroundColor: corBg }}
        >
          {conta.banco?.logo_url ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={conta.banco.logo_url}
              alt={conta.banco.nome}
              className="h-5 w-5 object-contain"
            />
          ) : (
            <Landmark className="h-4.5 w-4.5" />
          )}
        </div>

        {/* Nome e Badges de Identificação */}
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="font-semibold text-foreground text-sm truncate">
              {conta.nome}
            </span>

            <span className="text-xs text-muted-foreground hidden md:inline">
              • {conta.instituicao_financeira || conta.banco?.nome || "Instituição Privada"}
            </span>

            <Badge
              variant="outline"
              className="text-[9px] px-1.5 py-0 h-4 border-border/60 text-muted-foreground font-medium"
            >
              {conta.tipo_conta_descricao}
            </Badge>

            {conta.incluir_no_saldo_geral ? (
              <Badge
                variant="outline"
                className="text-[9px] px-1.5 py-0 h-4 border-[#1F4E79]/30 text-[#1F4E79] bg-[#1F4E79]/5"
              >
                Saldo Geral
              </Badge>
            ) : conta.incluir_nas_reservas ? (
              <Badge
                variant="outline"
                className="text-[9px] px-1.5 py-0 h-4 border-amber-500/30 text-amber-600 bg-amber-50 dark:bg-amber-950/20"
              >
                <ShieldAlert className="mr-0.5 h-2.5 w-2.5" /> Reserva
              </Badge>
            ) : (
              <Badge
                variant="outline"
                className="text-[9px] px-1.5 py-0 h-4 border-slate-400/40 text-slate-500 bg-slate-50 dark:bg-slate-900/30"
              >
                <Eye className="mr-0.5 h-2.5 w-2.5" /> Visualização
              </Badge>
            )}
          </div>

          <p className="text-[11px] text-muted-foreground md:hidden mt-0.5 truncate">
            {conta.instituicao_financeira || conta.banco?.nome || "Instituição Privada"}
          </p>
        </div>
      </div>

      {/* Lado Direito: Saldo Atual + Menu de Ações */}
      <div className="flex items-center gap-3 shrink-0">
        <div className="text-right">
          <span className="text-[10px] text-muted-foreground block font-medium uppercase tracking-wider hidden sm:block">
            Saldo Atual
          </span>
          <p
            className={cn(
              "text-sm sm:text-base font-bold",
              conta.saldo_atual < 0 ? "text-red-500" : "text-foreground"
            )}
          >
            {formatarMoeda(conta.saldo_atual)}
          </p>
        </div>

        <DropdownMenu>
          <DropdownMenuTrigger className="h-8 w-8 rounded-lg text-muted-foreground hover:text-foreground flex items-center justify-center hover:bg-accent cursor-pointer transition-colors">
            <MoreVertical className="h-4 w-4" />
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-36 rounded-xl">
            <DropdownMenuItem
              onClick={() => onEditar(conta)}
              className="flex items-center gap-2 cursor-pointer"
            >
              <Edit2 className="h-3.5 w-3.5 text-muted-foreground" />
              <span>Editar</span>
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={() => onDeletar(conta)}
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
