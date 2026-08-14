"use client";

import { ContaBancaria } from "@/types/contas";
import { formatarMoeda } from "@/utils/formatters";
import { Landmark, MoreVertical, Edit2, Trash2, ShieldAlert, Eye, PlusCircle, BarChart3 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface ContaBancariaCardProps {
  conta: ContaBancaria;
  onVerPainel?: (conta: ContaBancaria) => void;
  onLancarMovimentacao?: (conta: ContaBancaria) => void;
  onEditar: (conta: ContaBancaria) => void;
  onDeletar: (conta: ContaBancaria) => void;
}

export function ContaBancariaCard({
  conta,
  onVerPainel,
  onLancarMovimentacao,
  onEditar,
  onDeletar,
}: ContaBancariaCardProps) {
  const corBg = conta.cor_hex || "#1F4E79";

  return (
    <div className="group relative flex flex-col justify-between rounded-[16px] border border-border/50 bg-card p-4 shadow-2xs hover:shadow-xs transition-all space-y-4">
      <div className="flex items-start justify-between gap-3">
        <div
          onClick={() => onVerPainel?.(conta)}
          className="flex items-center gap-3 cursor-pointer group-hover:opacity-90 transition-opacity flex-1 min-w-0"
        >
          <div
            className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl text-white font-bold text-base shadow-2xs"
            style={{ backgroundColor: corBg }}
          >
            {conta.banco?.logo_url ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={conta.banco.logo_url}
                alt={conta.banco.nome}
                className="h-6 w-6 object-contain"
              />
            ) : (
              <Landmark className="h-4.5 w-4.5" />
            )}
          </div>
          <div className="min-w-0">
            <h3 className="font-semibold text-foreground text-sm leading-tight group-hover:text-[#1F4E79] dark:group-hover:text-blue-400 transition-colors truncate">
              {conta.nome}
            </h3>
            <p className="text-xs text-muted-foreground mt-0.5 truncate">
              {conta.instituicao_financeira || "Instituição Privada"} •{" "}
              {conta.tipo_conta_descricao}
            </p>
          </div>
        </div>

        <DropdownMenu>
          <DropdownMenuTrigger className="h-7 w-7 rounded-lg text-muted-foreground hover:text-foreground flex items-center justify-center hover:bg-accent cursor-pointer transition-colors shrink-0">
            <MoreVertical className="h-3.5 w-3.5" />
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="min-w-[180px] rounded-xl">
            {onVerPainel && (
              <DropdownMenuItem
                onClick={() => onVerPainel(conta)}
                className="flex items-center gap-2 cursor-pointer font-medium text-[#1F4E79] dark:text-blue-400"
              >
                <BarChart3 className="h-4 w-4 text-[#1F4E79] dark:text-blue-400 shrink-0" />
                <span>Painel da Conta</span>
              </DropdownMenuItem>
            )}
            {onLancarMovimentacao && (
              <DropdownMenuItem
                onClick={() => onLancarMovimentacao(conta)}
                className="flex items-center gap-2 cursor-pointer"
              >
                <PlusCircle className="h-4 w-4 text-muted-foreground shrink-0" />
                <span className="whitespace-nowrap">Nova Movimentação</span>
              </DropdownMenuItem>
            )}
            <DropdownMenuItem
              onClick={() => onEditar(conta)}
              className="flex items-center gap-2 cursor-pointer"
            >
              <Edit2 className="h-4 w-4" />
              <span>Editar</span>
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={() => onDeletar(conta)}
              className="flex items-center gap-2 text-red-500 focus:text-red-500 cursor-pointer"
            >
              <Trash2 className="h-4 w-4" />
              <span>Excluir</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      <div className="mt-6 flex items-end justify-between">
        <div>
          <span className="text-xs font-medium text-muted-foreground">Saldo Atual</span>
          <p
            className={`text-xl font-bold ${
              conta.saldo_atual < 0
                ? "text-red-500"
                : "text-foreground"
            }`}
          >
            {formatarMoeda(conta.saldo_atual)}
          </p>
        </div>

        <div>
          {conta.incluir_no_saldo_geral ? (
            <Badge variant="outline" className="text-[11px] font-normal border-[#1F4E79]/30 text-[#1F4E79] bg-[#1F4E79]/5">
              Saldo Geral
            </Badge>
          ) : conta.incluir_nas_reservas ? (
            <Badge variant="outline" className="text-[11px] font-normal border-amber-500/30 text-amber-600 bg-amber-50 dark:bg-amber-950/20">
              <ShieldAlert className="mr-1 h-3 w-3" /> Reserva
            </Badge>
          ) : (
            <Badge variant="outline" className="text-[11px] font-normal border-slate-400/40 text-slate-500 bg-slate-50 dark:bg-slate-900/30">
              <Eye className="mr-1 h-3 w-3" /> Visualização
            </Badge>
          )}
        </div>
      </div>
    </div>
  );
}
