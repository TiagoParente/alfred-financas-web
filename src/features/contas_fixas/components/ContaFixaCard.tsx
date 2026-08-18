"use client";

import { ContaFixa, FormaPagamentoContaFixa, FrequenciaContaFixaDescricao } from "@/types/contasFixas";
import { TipoMovimentacao } from "@/types/movimentacoes";
import { formatarData, formatarMoeda } from "@/utils/formatters";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  MoreVertical,
  Pencil,
  Trash2,
  Calendar,
  Landmark,
  CreditCard,
  Tag,
  Clock,
} from "lucide-react";

interface ContaFixaCardProps {
  contaFixa: ContaFixa;
  onEdit: (contaFixa: ContaFixa) => void;
  onDelete: (id: number) => void;
  onToggleStatus: (id: number) => void;
  isAlternandoStatus?: boolean;
}

export function ContaFixaCard({
  contaFixa,
  onEdit,
  onDelete,
  onToggleStatus,
  isAlternandoStatus = false,
}: ContaFixaCardProps) {
  const isReceita = contaFixa.tipo === TipoMovimentacao.RECEITA;

  return (
    <Card
      className={`border-border/60 shadow-sm transition-all hover:shadow-md ${
        !contaFixa.ativa ? "opacity-60 bg-muted/20" : "bg-card"
      }`}
    >
      <CardContent className="p-5 flex flex-col justify-between gap-4 h-full">
        {/* Top bar: Badges e Dropdown de Ações */}
        <div className="flex items-start justify-between gap-2">
          <div className="flex flex-wrap items-center gap-1.5">
            {/* Tipo */}
            <Badge
              variant="outline"
              className={
                isReceita
                  ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20"
                  : "bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/20"
              }
            >
              {isReceita ? "Receita Fixa" : "Despesa Fixa"}
            </Badge>

            {/* Frequência */}
            <Badge variant="secondary" className="text-xs font-normal">
              {FrequenciaContaFixaDescricao[contaFixa.frequencia] || contaFixa.frequencia}
            </Badge>

            {/* Status Ativa/Inativa */}
            {!contaFixa.ativa && (
              <Badge variant="outline" className="text-xs text-muted-foreground border-border/40">
                Inativa
              </Badge>
            )}
          </div>

          <DropdownMenu>
            <DropdownMenuTrigger className="h-8 w-8 rounded-lg flex items-center justify-center text-muted-foreground hover:bg-accent hover:text-foreground transition-colors cursor-pointer outline-none">
              <MoreVertical className="h-4 w-4" />
              <span className="sr-only">Ações</span>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-40">
              <DropdownMenuItem onClick={() => onEdit(contaFixa)}>
                <Pencil className="mr-2 h-4 w-4 text-muted-foreground" />
                Editar
              </DropdownMenuItem>
              <DropdownMenuItem
                className="text-rose-600 focus:text-rose-600"
                onClick={() => onDelete(contaFixa.id)}
              >
                <Trash2 className="mr-2 h-4 w-4 text-rose-600" />
                Excluir
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        {/* Informações Principais */}
        <div className="space-y-1">
          <h3 className="font-semibold text-base text-foreground leading-tight line-clamp-1">
            {contaFixa.descricao}
          </h3>
          <p
            className={`text-xl font-bold ${
              isReceita
                ? "text-emerald-600 dark:text-emerald-400"
                : "text-rose-600 dark:text-rose-400"
            }`}
          >
            {formatarMoeda(contaFixa.valor)}
          </p>
        </div>

        {/* Detalhes complementares */}
        <div className="space-y-2 text-xs text-muted-foreground border-t border-border/40 pt-3 mt-1">
          {/* Dia de vencimento */}
          <div className="flex items-center gap-2">
            <Calendar className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
            <span>Vence todo dia <strong className="text-foreground font-semibold">{contaFixa.dia_vencimento}</strong></span>
          </div>

          {/* Forma de Pagamento / Origem */}
          <div className="flex items-center gap-2">
            {contaFixa.forma_pagamento === FormaPagamentoContaFixa.CARTAO_CREDITO ? (
              <div className="flex items-center gap-1.5 min-w-0">
                <div
                  className="flex h-4 w-4 shrink-0 items-center justify-center rounded text-white font-bold text-[9px] overflow-hidden"
                  style={{ backgroundColor: contaFixa.cartao_credito?.cor_hex || "#1F4E79" }}
                >
                  {contaFixa.cartao_credito?.banco?.logo_url ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={contaFixa.cartao_credito.banco.logo_url}
                      alt={contaFixa.cartao_credito.banco.nome}
                      className="h-3 w-3 object-contain"
                    />
                  ) : (
                    <CreditCard className="h-2.5 w-2.5 text-white" />
                  )}
                </div>
                <span className="truncate">
                  {contaFixa.cartao_credito?.nome
                    ? `Cartão: ${contaFixa.cartao_credito.nome}`
                    : "Cartão de Crédito"}
                </span>
              </div>
            ) : (
              <div className="flex items-center gap-1.5 min-w-0">
                <div
                  className="flex h-4 w-4 shrink-0 items-center justify-center rounded text-white font-bold text-[9px] overflow-hidden"
                  style={{ backgroundColor: contaFixa.conta_bancaria?.cor_hex || "#1F4E79" }}
                >
                  {contaFixa.conta_bancaria?.banco?.logo_url ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={contaFixa.conta_bancaria.banco.logo_url}
                      alt={contaFixa.conta_bancaria.banco.nome}
                      className="h-3 w-3 object-contain"
                    />
                  ) : (
                    <Landmark className="h-2.5 w-2.5 text-white" />
                  )}
                </div>
                <span className="truncate">
                  {contaFixa.conta_bancaria?.nome
                    ? `Conta: ${contaFixa.conta_bancaria.nome}`
                    : "Conta Bancária"}
                </span>
              </div>
            )}
          </div>

          {/* Categoria */}
          {contaFixa.categoria && (
            <div className="flex items-center gap-2">
              <Tag className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
              <span>
                {contaFixa.categoria.nome}
                {contaFixa.subcategoria && ` / ${contaFixa.subcategoria.nome}`}
              </span>
            </div>
          )}

          {/* Última geração */}
          {contaFixa.ultima_geracao_em && (
            <div className="flex items-center gap-2 text-[11px] text-muted-foreground/80">
              <Clock className="h-3 w-3 shrink-0" />
              <span>Gerada em: {formatarData(contaFixa.ultima_geracao_em)}</span>
            </div>
          )}
        </div>

        {/* Rodapé: Switch de Ativa/Inativa */}
        <div className="flex items-center justify-between border-t border-border/40 pt-3 mt-1">
          <span className="text-xs font-medium text-muted-foreground">
            {contaFixa.ativa ? "Conta Fixa Ativa" : "Conta Fixa Pausada"}
          </span>
          <Switch
            checked={contaFixa.ativa}
            onCheckedChange={() => onToggleStatus(contaFixa.id)}
            disabled={isAlternandoStatus}
          />
        </div>
      </CardContent>
    </Card>
  );
}
