"use client";

import { useState, useMemo, useEffect } from "react";
import {
  Landmark,
  ChevronLeft,
  ChevronRight,
  ArrowDownLeft,
  ArrowUpRight,
  Plus,
  Search,
  X,
  Calendar,
  Tag,
  CheckCircle2,
  Clock,
  ArrowLeftRight,
  Wallet,
  RotateCcw,
  Target,
} from "lucide-react";
import { ContaBancaria } from "@/types/contas";
import { TipoMovimentacao, StatusMovimentacao } from "@/types/movimentacoes";
import { TipoMovimentacaoInvestimento } from "@/types/metas";
import { useDetalhamentoContaBancaria } from "../hooks/useDetalhamentoContaBancaria";
import {
  formatarMoeda,
  formatarData,
  formatarMesAno,
  isMesAtual,
} from "@/utils/formatters";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";

interface PainelContaModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  conta: ContaBancaria | null;
  familiaId?: number | null;
  onLancarMovimentacao?: (conta: ContaBancaria) => void;
}

type TabFiltroTipo = "todas" | "entradas" | "saidas";

export function PainelContaModal({
  open,
  onOpenChange,
  conta,
  familiaId,
  onLancarMovimentacao,
}: PainelContaModalProps) {
  // Data de referência do mês exibido
  const [dataRef, setDataRef] = useState<Date>(new Date());
  const [tabAtiva, setTabAtiva] = useState<TabFiltroTipo>("todas");
  const [searchTerm, setSearchTerm] = useState("");

  // Reseta estado de dataRef e filtros sempre que abre o modal ou muda a conta
  useEffect(() => {
    if (open) {
      setDataRef(new Date());
      setTabAtiva("todas");
      setSearchTerm("");
    }
  }, [open, conta?.id]);

  const { movimentacoes, investimentos, resumoMes, isLoading, isError, refetch } =
    useDetalhamentoContaBancaria(conta?.id, familiaId, dataRef);

  const mesAnoTitulo = formatarMesAno(dataRef);
  const estaNoMesAtual = isMesAtual(dataRef);

  const handleMesAnterior = () => {
    setDataRef(
      (prev) => new Date(prev.getFullYear(), prev.getMonth() - 1, 1)
    );
  };

  const handleProximoMes = () => {
    setDataRef(
      (prev) => new Date(prev.getFullYear(), prev.getMonth() + 1, 1)
    );
  };

  const handleMesAtual = () => {
    setDataRef(new Date());
  };

  // Lista unificada e filtrada de itens de extrato (movimentações + aportes/resgates)
  const extratoItems = useMemo(() => {
    if (!conta?.id) return [];

    // Map movimentações normais
    const movsMapped = movimentacoes.map((m) => {
      const isEntrada =
        m.tipo === TipoMovimentacao.RECEITA ||
        (m.tipo === TipoMovimentacao.TRANSFERENCIA &&
          m.conta_bancaria_destino_id === conta.id);

      const isTransferencia = m.tipo === TipoMovimentacao.TRANSFERENCIA;
      let subtitulo = m.categoria?.nome ?? "Sem Categoria";
      if (isTransferencia) {
        subtitulo =
          m.conta_bancaria_destino_id === conta.id
            ? `Transferência de ${m.conta_bancaria?.nome ?? "outra conta"}`
            : `Transferência para ${m.conta_bancaria_destino?.nome ?? "outra conta"}`;
      } else if (m.subcategoria) {
        subtitulo += ` • ${m.subcategoria.nome}`;
      }

      return {
        key: `mov-${m.id}`,
        isInvestimento: false,
        id: m.id,
        data_movimentacao: m.data_movimentacao,
        valor: Number(m.valor),
        isEntrada,
        isTransferencia,
        descricao: m.descricao,
        subtitulo,
        categoriaCor: m.categoria?.cor_hex,
        tipoInvestimento: undefined as TipoMovimentacaoInvestimento | undefined,
        status: m.status,
        original: m,
      };
    });

    // Map aportes e resgates de reservas
    const invsMapped = investimentos.map((inv) => {
      const isEntrada = inv.tipo === TipoMovimentacaoInvestimento.RESGATE;
      const nomeMeta = inv.meta_nome || inv.meta?.nome || "Reserva Geral";
      const subtitulo = `Meta: ${nomeMeta}`;

      return {
        key: `inv-${inv.id}`,
        isInvestimento: true,
        id: inv.id,
        data_movimentacao: inv.data_movimentacao,
        valor: Number(inv.valor),
        isEntrada,
        isTransferencia: false,
        descricao: inv.motivo || (isEntrada ? `Resgate de ${nomeMeta}` : `Aporte em ${nomeMeta}`),
        subtitulo,
        categoriaCor: isEntrada ? "#F59E0B" : "#22C55E",
        tipoInvestimento: inv.tipo as TipoMovimentacaoInvestimento | undefined,
        status: StatusMovimentacao.PAGO,
        original: inv,
      };
    });

    // Unifica e ordena por data decrescente
    let unified = [...movsMapped, ...invsMapped].sort((a, b) => {
      return b.data_movimentacao.localeCompare(a.data_movimentacao);
    });

    // Filtro por tipo (entradas / saídas)
    if (tabAtiva === "entradas") {
      unified = unified.filter((item) => item.isEntrada);
    } else if (tabAtiva === "saidas") {
      unified = unified.filter((item) => !item.isEntrada);
    }

    // Filtro por busca
    if (searchTerm.trim()) {
      const term = searchTerm.toLowerCase().trim();
      unified = unified.filter(
        (item) =>
          item.descricao.toLowerCase().includes(term) ||
          item.subtitulo.toLowerCase().includes(term)
      );
    }

    return unified;
  }, [movimentacoes, investimentos, tabAtiva, searchTerm, conta?.id]);

  if (!conta) return null;

  const corBg = conta.cor_hex || "#1F4E79";

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[700px] rounded-[20px] max-h-[92vh] flex flex-col p-0 overflow-hidden">
        {/* Header Fixo do Painel */}
        <DialogHeader className="p-5 pb-4 border-b border-border/40 space-y-3">
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-3 min-w-0">
              <div
                className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl text-white font-bold text-base shadow-2xs"
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
                  <Landmark className="h-5 w-5" />
                )}
              </div>
              <div className="min-w-0">
                <DialogTitle className="text-lg font-bold truncate">
                  {conta.nome}
                </DialogTitle>
                <p className="text-xs text-muted-foreground truncate mt-0.5">
                  {conta.instituicao_financeira || conta.banco?.nome || "Instituição Privada"}{" "}
                  • {conta.tipo_conta_descricao}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2 shrink-0">
              {onLancarMovimentacao && (
                <Button
                  onClick={() => {
                    onOpenChange(false);
                    onLancarMovimentacao(conta);
                  }}
                  className="rounded-xl bg-[#1F4E79] hover:bg-[#1F4E79]/90 text-white text-xs gap-1.5 h-9 cursor-pointer shadow-2xs"
                >
                  <Plus className="h-4 w-4" />
                  <span className="hidden sm:inline">Nova Movimentação</span>
                  <span className="sm:hidden">Lançar</span>
                </Button>
              )}
            </div>
          </div>

          {/* Controle de Navegação Mensal */}
          <div className="flex items-center justify-between bg-accent/40 rounded-xl p-1.5 border border-border/30">
            <Button
              variant="ghost"
              size="sm"
              onClick={handleMesAnterior}
              className="h-8 rounded-lg text-xs hover:bg-background cursor-pointer"
            >
              <ChevronLeft className="h-4 w-4 mr-1" />
              <span className="hidden sm:inline">Mês anterior</span>
            </Button>

            <div className="flex items-center gap-2">
              <span className="text-sm font-bold text-foreground">
                {mesAnoTitulo}
              </span>
              {!estaNoMesAtual && (
                <button
                  type="button"
                  onClick={handleMesAtual}
                  className="text-[10px] bg-[#1F4E79]/10 text-[#1F4E79] hover:bg-[#1F4E79]/20 font-semibold px-2 py-0.5 rounded-full transition-colors cursor-pointer flex items-center gap-1"
                  title="Voltar ao mês atual"
                >
                  <RotateCcw className="h-2.5 w-2.5" />
                  Hoje
                </button>
              )}
            </div>

            <Button
              variant="ghost"
              size="sm"
              onClick={handleProximoMes}
              className="h-8 rounded-lg text-xs hover:bg-background cursor-pointer"
            >
              <span className="hidden sm:inline">Próximo mês</span>
              <ChevronRight className="h-4 w-4 ml-1" />
            </Button>
          </div>
        </DialogHeader>

        {/* Conteúdo com Scroll */}
        <div className="flex-1 overflow-y-auto p-5 space-y-5">
          {/* Cards de Resumo de Entradas, Saídas e Saldo do Mês */}
          <div className="grid grid-cols-3 gap-3">
            {/* Entradas */}
            <div className="rounded-xl border border-emerald-500/20 bg-emerald-500/5 p-3 flex flex-col justify-between">
              <div className="flex items-center justify-between text-emerald-600 dark:text-emerald-400">
                <span className="text-[11px] font-semibold uppercase tracking-wider">
                  Entradas
                </span>
                <div className="h-6 w-6 rounded-lg bg-emerald-500/10 flex items-center justify-center">
                  <ArrowDownLeft className="h-3.5 w-3.5" />
                </div>
              </div>
              <p className="text-sm sm:text-base font-bold text-emerald-600 dark:text-emerald-400 mt-2">
                {formatarMoeda(resumoMes.totalEntradas)}
              </p>
            </div>

            {/* Saídas */}
            <div className="rounded-xl border border-red-500/20 bg-red-500/5 p-3 flex flex-col justify-between">
              <div className="flex items-center justify-between text-red-600 dark:text-red-400">
                <span className="text-[11px] font-semibold uppercase tracking-wider">
                  Saídas
                </span>
                <div className="h-6 w-6 rounded-lg bg-red-500/10 flex items-center justify-center">
                  <ArrowUpRight className="h-3.5 w-3.5" />
                </div>
              </div>
              <p className="text-sm sm:text-base font-bold text-red-600 dark:text-red-400 mt-2">
                {formatarMoeda(resumoMes.totalSaidas)}
              </p>
            </div>

            {/* Resultado do Mês */}
            <div
              className={cn(
                "rounded-xl border p-3 flex flex-col justify-between",
                resumoMes.resultadoMes >= 0
                  ? "border-[#1F4E79]/20 bg-[#1F4E79]/5 text-[#1F4E79] dark:text-blue-400"
                  : "border-red-500/20 bg-red-500/5 text-red-600 dark:text-red-400"
              )}
            >
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                  Resultado
                </span>
                <div className="h-6 w-6 rounded-lg bg-accent flex items-center justify-center">
                  <Wallet className="h-3.5 w-3.5 text-muted-foreground" />
                </div>
              </div>
              <p
                className={cn(
                  "text-sm sm:text-base font-bold mt-2",
                  resumoMes.resultadoMes >= 0
                    ? "text-[#1F4E79] dark:text-blue-400"
                    : "text-red-600 dark:text-red-400"
                )}
              >
                {formatarMoeda(resumoMes.resultadoMes)}
              </p>
            </div>
          </div>

          {/* Filtros por Tipo e Busca Interna */}
          <div className="space-y-3">
            <div className="flex flex-col gap-2.5 sm:flex-row sm:items-center sm:justify-between border-b border-border/40 pb-3">
              {/* Abas */}
              <div className="flex items-center gap-1 bg-muted/40 p-1 rounded-lg">
                <button
                  type="button"
                  onClick={() => setTabAtiva("todas")}
                  className={cn(
                    "px-3 py-1 text-xs font-semibold rounded-md transition-colors cursor-pointer",
                    tabAtiva === "todas"
                      ? "bg-background text-foreground shadow-2xs"
                      : "text-muted-foreground hover:text-foreground"
                  )}
                >
                  Todas ({resumoMes.totalLancamentos})
                </button>
                <button
                  type="button"
                  onClick={() => setTabAtiva("entradas")}
                  className={cn(
                    "px-3 py-1 text-xs font-semibold rounded-md transition-colors cursor-pointer",
                    tabAtiva === "entradas"
                      ? "bg-background text-emerald-600 shadow-2xs font-bold"
                      : "text-muted-foreground hover:text-foreground"
                  )}
                >
                  Entradas
                </button>
                <button
                  type="button"
                  onClick={() => setTabAtiva("saidas")}
                  className={cn(
                    "px-3 py-1 text-xs font-semibold rounded-md transition-colors cursor-pointer",
                    tabAtiva === "saidas"
                      ? "bg-background text-red-600 shadow-2xs font-bold"
                      : "text-muted-foreground hover:text-foreground"
                  )}
                >
                  Saídas
                </button>
              </div>

              {/* Busca */}
              <div className="relative flex-1 sm:w-48 sm:flex-initial">
                <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
                <Input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Buscar lançamento..."
                  className="h-8 pl-8 pr-7 text-xs rounded-lg bg-card"
                />
                {searchTerm && (
                  <button
                    type="button"
                    onClick={() => setSearchTerm("")}
                    className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground cursor-pointer"
                  >
                    <X className="h-3 w-3" />
                  </button>
                )}
              </div>
            </div>

            {/* Conteúdo da Lista de Extrato */}
            {isLoading ? (
              <div className="space-y-2.5 py-2">
                <Skeleton className="h-14 w-full rounded-xl" />
                <Skeleton className="h-14 w-full rounded-xl" />
                <Skeleton className="h-14 w-full rounded-xl" />
              </div>
            ) : isError ? (
              <div className="text-center py-8 rounded-xl border border-red-200 bg-red-50/50 dark:bg-red-950/20">
                <p className="text-xs text-red-500 font-medium">
                  Ocorreu um erro ao carregar os lançamentos.
                </p>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => refetch()}
                  className="mt-2 text-xs rounded-lg cursor-pointer"
                >
                  Tentar novamente
                </Button>
              </div>
            ) : extratoItems.length === 0 ? (
              <div className="text-center py-10 rounded-xl border border-dashed border-border/60 bg-accent/10 space-y-2">
                <Landmark className="h-8 w-8 mx-auto text-muted-foreground/40" />
                <p className="text-xs font-semibold text-foreground">
                  Nenhuma movimentação registrada nesta conta
                </p>
                <p className="text-[11px] text-muted-foreground">
                  {searchTerm
                    ? `Nenhum resultado para "${searchTerm}" em ${mesAnoTitulo}`
                    : `Não há lançamentos nesta conta durante o mês de ${mesAnoTitulo}.`}
                </p>
                {onLancarMovimentacao && (
                  <Button
                    size="sm"
                    onClick={() => {
                      onOpenChange(false);
                      onLancarMovimentacao(conta);
                    }}
                    className="mt-2 text-xs rounded-xl bg-[#1F4E79] text-white cursor-pointer"
                  >
                    <Plus className="h-3.5 w-3.5 mr-1" />
                    Lançar Movimentação
                  </Button>
                )}
              </div>
            ) : (
              <div className="space-y-2">
                {extratoItems.map((item) => {
                  const isEntrada = item.isEntrada;
                  const isInvestimento = item.isInvestimento;
                  const isTransferencia = item.isTransferencia;
                  const corIcone = item.categoriaCor || (isEntrada ? "#22C55E" : "#EF4444");

                  return (
                    <div
                      key={item.key}
                      className="flex items-center justify-between p-3 rounded-xl border border-border/40 bg-card hover:bg-accent/30 transition-all duration-150 gap-3"
                    >
                      <div className="flex items-center gap-3 min-w-0 flex-1">
                        {/* Ícone de Categoria / Transferência / Investimento */}
                        <div
                          className="h-9 w-9 shrink-0 rounded-lg flex items-center justify-center text-white font-bold shadow-2xs"
                          style={{ backgroundColor: corIcone }}
                        >
                          {isInvestimento ? (
                            <Target className="h-4 w-4" />
                          ) : isTransferencia ? (
                            <ArrowLeftRight className="h-4 w-4" />
                          ) : (
                            <Tag className="h-4 w-4" />
                          )}
                        </div>

                        {/* Descrição e Subtítulo */}
                        <div className="min-w-0 flex-1">
                          <p className="text-xs sm:text-sm font-medium text-foreground truncate leading-tight">
                            {item.descricao}
                          </p>
                          <div className="flex items-center gap-1.5 mt-0.5 text-[11px] text-muted-foreground flex-wrap">
                            <span className={cn("truncate", isInvestimento && "font-medium text-foreground")}>
                              {item.subtitulo}
                            </span>
                            <span>•</span>
                            <span className="flex items-center gap-0.5 shrink-0">
                              <Calendar className="h-3 w-3" />
                              {formatarData(item.data_movimentacao)}
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* Valor e Badge */}
                      <div className="text-right shrink-0">
                        <span
                          className={cn(
                            "text-xs sm:text-sm font-bold block",
                            isEntrada
                              ? "text-emerald-600 dark:text-emerald-400"
                              : "text-red-600 dark:text-red-400"
                          )}
                        >
                          {isEntrada ? "+ " : "- "}
                          {formatarMoeda(item.valor)}
                        </span>
                        <div className="flex items-center justify-end gap-1 mt-0.5">
                          {isInvestimento ? (
                            <Badge
                              variant="outline"
                              className={cn(
                                "text-[9px] px-1.5 py-0 h-4 border-0 font-semibold",
                                item.tipoInvestimento === TipoMovimentacaoInvestimento.RESGATE
                                  ? "bg-amber-500/10 text-amber-600 dark:text-amber-400"
                                  : "bg-[#22C55E]/10 text-[#22C55E]"
                              )}
                            >
                              {item.tipoInvestimento === TipoMovimentacaoInvestimento.RESGATE
                                ? "Resgate de Reserva"
                                : "Aporte em Reserva"}
                            </Badge>
                          ) : item.status === StatusMovimentacao.PAGO ? (
                            <Badge
                              variant="outline"
                              className="text-[9px] px-1.5 py-0 h-4 border-emerald-500/30 text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/20 font-semibold"
                            >
                              <CheckCircle2 className="mr-0.5 h-2.5 w-2.5" />
                              Pago
                            </Badge>
                          ) : (
                            <Badge
                              variant="outline"
                              className="text-[9px] px-1.5 py-0 h-4 border-amber-500/30 text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/20 font-semibold"
                            >
                              <Clock className="mr-0.5 h-2.5 w-2.5" />
                              Pendente
                            </Badge>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
