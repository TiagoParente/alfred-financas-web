"use client";

import { useEffect, useMemo, useState } from "react";
import {
  ChevronLeft,
  ChevronRight,
  Receipt,
  Calendar,
  Tag,
  CheckCircle2,
  Clock,
  FileText,
  Plus,
  Layers,
} from "lucide-react";
import { CartaoCredito, StatusFatura } from "@/types/cartoes";
import { useFaturaCartao } from "../hooks/useFaturaCartao";
import { formatarMoeda, formatarData } from "@/utils/formatters";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";

interface ItemFaturaExibicao {
  id: string;
  descricao: string;
  categoriaNome: string;
  categoriaCor: string;
  subcategoriaNome?: string | null;
  data: string;
  valor: number;
  status: string;
  isParcela: boolean;
  parcelaInfo?: {
    numero: number;
    total: number;
  };
}

interface FaturaModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  cartao: CartaoCredito | null;
  onLancarDespesa?: (cartao: CartaoCredito) => void;
}

export function FaturaModal({
  open,
  onOpenChange,
  cartao,
  onLancarDespesa,
}: FaturaModalProps) {
  // Data de referência padrão: ano-mês da fatura aberta
  const [dataRef, setDataRef] = useState<Date>(new Date());

  useEffect(() => {
    if (open && cartao) {
      const hoje = new Date();
      const diaHoje = hoje.getDate();
      const anoHoje = hoje.getFullYear();
      const mesHoje = hoje.getMonth();

      let dataInicial: Date;

      if (cartao.dia_fechamento < cartao.dia_vencimento) {
        if (diaHoje <= cartao.dia_fechamento) {
          dataInicial = new Date(anoHoje, mesHoje, 1);
        } else {
          dataInicial = new Date(anoHoje, mesHoje + 1, 1);
        }
      } else {
        if (diaHoje <= cartao.dia_fechamento) {
          dataInicial = new Date(anoHoje, mesHoje + 1, 1);
        } else {
          dataInicial = new Date(anoHoje, mesHoje + 2, 1);
        }
      }

      setDataRef(dataInicial);
    }
  }, [open, cartao]);

  const ano = dataRef.getFullYear();
  const mes = String(dataRef.getMonth() + 1).padStart(2, "0");
  const mesAnoStr = `${ano}-${mes}`;

  const { fatura, isLoading } = useFaturaCartao(
    open && cartao ? cartao.id : null,
    mesAnoStr
  );

  const mesAnoExtenso = new Intl.DateTimeFormat("pt-BR", {
    month: "long",
    year: "numeric",
  }).format(dataRef);

  const mesAnoTitulo = mesAnoExtenso.charAt(0).toUpperCase() + mesAnoExtenso.slice(1);

  const handleMesAnterior = () => {
    setDataRef(new Date(ano, dataRef.getMonth() - 1, 1));
  };

  const handleProximoMes = () => {
    setDataRef(new Date(ano, dataRef.getMonth() + 1, 1));
  };

  // Lista unificada de lançamentos (compras normais + parcelas da fatura)
  const itensExibicao = useMemo(() => {
    if (!fatura) return [];

    const listaItens: ItemFaturaExibicao[] = [
      ...(fatura.itens || []).map((item) => ({
        id: `item-${item.id}`,
        descricao: item.descricao,
        categoriaNome: item.categoria?.nome ?? "Sem Categoria",
        categoriaCor: item.categoria?.cor_hex || "#1F4E79",
        subcategoriaNome: item.subcategoria?.nome,
        data: item.data_movimentacao,
        valor: Number(item.valor),
        status: item.status,
        isParcela: false,
      })),
      ...(fatura.parcelas || []).map((parcela) => ({
        id: `parcela-${parcela.id}`,
        descricao: parcela.movimentacao?.descricao || "Compra Parcelada",
        categoriaNome: parcela.movimentacao?.categoria?.nome ?? "Sem Categoria",
        categoriaCor: parcela.movimentacao?.categoria?.cor_hex || "#1F4E79",
        subcategoriaNome: parcela.movimentacao?.subcategoria?.nome,
        data: parcela.movimentacao?.data_movimentacao || parcela.data_vencimento,
        valor: Number(parcela.valor),
        status: parcela.status,
        isParcela: true,
        parcelaInfo: {
          numero: parcela.numero_parcela,
          total: parcela.total_parcelas,
        },
      })),
    ];

    return listaItens.sort(
      (a, b) => new Date(a.data).getTime() - new Date(b.data).getTime()
    );
  }, [fatura]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[650px] rounded-[20px] max-h-[90vh] flex flex-col p-0 overflow-hidden">
        {/* Header Fixo */}
        <DialogHeader className="p-6 pb-4 border-b border-border/40">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div
                className="flex h-10 w-10 items-center justify-center rounded-xl text-white font-bold"
                style={{
                  backgroundColor: cartao?.cor_hex || cartao?.banco?.cor_hex || "#1F4E79",
                }}
              >
                <Receipt className="h-5 w-5" />
              </div>
              <div>
                <DialogTitle className="text-lg font-bold">
                  Fatura: {cartao?.nome}
                </DialogTitle>
                <p className="text-xs text-muted-foreground">
                  {cartao?.banco?.nome ?? "Cartão de Crédito"}
                </p>
              </div>
            </div>

            {onLancarDespesa && cartao && (
              <Button
                onClick={() => {
                  onOpenChange(false);
                  onLancarDespesa(cartao);
                }}
                className="rounded-xl bg-[#1F4E79] hover:bg-[#1F4E79]/90 text-white text-xs gap-1.5 h-9 cursor-pointer"
              >
                <Plus className="h-3.5 w-3.5" />
                <span>Nova Despesa</span>
              </Button>
            )}
          </div>

          {/* Navegação entre Meses */}
          <div className="mt-4 flex items-center justify-between bg-accent/40 rounded-xl p-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={handleMesAnterior}
              className="h-8 rounded-lg text-xs hover:bg-background"
            >
              <ChevronLeft className="h-4 w-4 mr-1" />
              Mês anterior
            </Button>
            <span className="text-sm font-semibold text-foreground">
              {mesAnoTitulo}
            </span>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleProximoMes}
              className="h-8 rounded-lg text-xs hover:bg-background"
            >
              Próximo mês
              <ChevronRight className="h-4 w-4 ml-1" />
            </Button>
          </div>
        </DialogHeader>

        {/* Conteúdo com Scroll */}
        <div className="flex-1 overflow-y-auto p-6 space-y-5">
          {isLoading ? (
            <div className="space-y-4">
              <Skeleton className="h-20 w-full rounded-xl" />
              <Skeleton className="h-12 w-full rounded-xl" />
              <Skeleton className="h-12 w-full rounded-xl" />
            </div>
          ) : !fatura ? (
            <div className="text-center py-8 text-muted-foreground text-sm">
              Não foi possível carregar a fatura para este período.
            </div>
          ) : (
            <>
              {/* Resumo da Fatura & Badges */}
              <div className="rounded-2xl border border-border/50 bg-card/60 p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    <span className="text-xs text-muted-foreground uppercase font-medium tracking-wider">
                      Valor Total da Fatura
                    </span>
                    <h3 className="text-2xl font-bold text-foreground">
                      {formatarMoeda(fatura.valor_total)}
                    </h3>
                  </div>

                  {/* Badge de Status */}
                  <div>
                    {fatura.status === StatusFatura.PAGA ? (
                      <Badge className="bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20 px-3 py-1 gap-1.5 rounded-full text-xs font-semibold">
                        <CheckCircle2 className="h-3.5 w-3.5" />
                        Fatura Paga
                      </Badge>
                    ) : fatura.status === StatusFatura.FECHADA ? (
                      <Badge className="bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20 px-3 py-1 gap-1.5 rounded-full text-xs font-semibold">
                        <Clock className="h-3.5 w-3.5" />
                        Fatura Fechada
                      </Badge>
                    ) : (
                      <Badge className="bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20 px-3 py-1 gap-1.5 rounded-full text-xs font-semibold">
                        <FileText className="h-3.5 w-3.5" />
                        Fatura Aberta
                      </Badge>
                    )}
                  </div>
                </div>

                {/* Ciclo da Fatura (Início, Fechamento, Vencimento) */}
                <div className="grid grid-cols-3 gap-2 pt-2 border-t border-border/40 text-xs">
                  <div>
                    <span className="text-muted-foreground block text-[11px]">
                      Início do Ciclo
                    </span>
                    <span className="font-medium text-foreground">
                      {formatarData(fatura.data_inicio_ciclo)}
                    </span>
                  </div>
                  <div>
                    <span className="text-muted-foreground block text-[11px]">
                      Fechamento
                    </span>
                    <span className="font-medium text-foreground">
                      {formatarData(fatura.data_fechamento_ciclo)}
                    </span>
                  </div>
                  <div>
                    <span className="text-muted-foreground block text-[11px]">
                      Vencimento
                    </span>
                    <span className="font-medium text-foreground">
                      {formatarData(fatura.data_vencimento_ciclo)}
                    </span>
                  </div>
                </div>
              </div>

              {/* Lista de Itens da Fatura */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                    Lançamentos ({itensExibicao.length})
                  </h4>

                  {onLancarDespesa && cartao && (
                    <button
                      type="button"
                      onClick={() => {
                        onOpenChange(false);
                        onLancarDespesa(cartao);
                      }}
                      className="text-xs font-medium text-[#1F4E79] dark:text-blue-400 hover:underline cursor-pointer"
                    >
                      + Lançar Despesa
                    </button>
                  )}
                </div>

                {itensExibicao.length === 0 ? (
                  <div className="text-center py-8 border border-dashed rounded-xl bg-accent/20">
                    <Receipt className="h-8 w-8 mx-auto text-muted-foreground/50 mb-2" />
                    <p className="text-xs font-medium text-muted-foreground">
                      Nenhuma despesa lançada nesta fatura.
                    </p>
                    {onLancarDespesa && cartao && (
                      <Button
                        size="sm"
                        onClick={() => {
                          onOpenChange(false);
                          onLancarDespesa(cartao);
                        }}
                        className="mt-3 text-xs rounded-xl bg-[#1F4E79] text-white"
                      >
                        <Plus className="h-3.5 w-3.5 mr-1" />
                        Lançar Primeira Despesa
                      </Button>
                    )}
                  </div>
                ) : (
                  <div className="space-y-2">
                    {itensExibicao.map((item) => (
                      <div
                        key={item.id}
                        className="flex items-center justify-between p-3 rounded-xl border border-border/40 bg-card hover:bg-accent/30 transition-colors"
                      >
                        <div className="flex items-center gap-3">
                          <div
                            className="h-9 w-9 rounded-lg flex items-center justify-center text-white shrink-0"
                            style={{
                              backgroundColor: item.categoriaCor,
                            }}
                          >
                            <Tag className="h-4 w-4" />
                          </div>

                          <div className="min-w-0">
                            <div className="flex items-center gap-2 flex-wrap">
                              <p className="text-sm font-medium text-foreground leading-tight">
                                {item.descricao}
                              </p>
                              {item.isParcela && item.parcelaInfo && (
                                <Badge
                                  variant="outline"
                                  className="text-[10px] px-1.5 py-0 rounded-md font-medium border-0 bg-[#1F4E79]/10 text-[#1F4E79] dark:text-sky-400 gap-1"
                                >
                                  <Layers className="h-2.5 w-2.5" />
                                  <span>
                                    Parcela {item.parcelaInfo.numero}/
                                    {item.parcelaInfo.total}
                                  </span>
                                </Badge>
                              )}
                            </div>
                            <div className="flex items-center gap-2 mt-0.5 text-[11px] text-muted-foreground flex-wrap">
                              <span>{item.categoriaNome}</span>
                              {item.subcategoriaNome && (
                                <>
                                  <span>•</span>
                                  <span>{item.subcategoriaNome}</span>
                                </>
                              )}
                              <span>•</span>
                              <span className="flex items-center gap-1">
                                <Calendar className="h-3 w-3" />
                                {formatarData(item.data)}
                              </span>
                            </div>
                          </div>
                        </div>

                        <div className="text-right shrink-0">
                          <span className="text-sm font-bold text-red-600 dark:text-red-400 block">
                            {formatarMoeda(item.valor)}
                          </span>
                          <span className="text-[10px] text-muted-foreground capitalize">
                            {item.status === "pago" ? "Liquidado" : "Pendente"}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
