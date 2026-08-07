"use client";

import { useEffect, useState, useMemo, useCallback } from "react";
import { useFamilias } from "@/features/familias/hooks/useFamilias";
import { orcamentosService } from "@/services/orcamentos";
import { Orcamento, ResumoOrcamentos, StatusOrcamento } from "@/types/orcamento";
import { OrcamentoCard } from "@/features/orcamentos/components/OrcamentoCard";
import { OrcamentosListView } from "@/features/orcamentos/components/OrcamentosListView";
import { CriarOrcamentoModal } from "@/features/orcamentos/components/CriarOrcamentoModal";
import { EditarOrcamentoModal } from "@/features/orcamentos/components/EditarOrcamentoModal";
import { DeletarOrcamentoModal } from "@/features/orcamentos/components/DeletarOrcamentoModal";
import { SeletorMes } from "@/features/movimentacoes/components/SeletorMes";
import { formatarMoeda } from "@/utils/formatters";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  PieChart,
  Plus,
  Search,
  X,
  AlertTriangle,
  CheckCircle2,
  Wallet,
  TrendingDown,
  Loader2,
  LayoutList,
  LayoutGrid,
} from "lucide-react";
import { cn } from "@/lib/utils";

type ModoExibicao = "lista" | "grid";

export default function OrcamentosPage() {
  const { familiaAtiva } = useFamilias();

  const [dataAtual, setDataAtual] = useState<Date>(new Date());
  const mes = dataAtual.getMonth() + 1;
  const ano = dataAtual.getFullYear();

  const [orcamentos, setOrcamentos] = useState<Orcamento[]>([]);
  const [resumo, setResumo] = useState<ResumoOrcamentos | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  const [modoExibicao, setModoExibicao] = useState<ModoExibicao>("lista");
  const [statusFiltro, setStatusFiltro] = useState<StatusOrcamento | undefined>(undefined);
  const [searchTerm, setSearchTerm] = useState<string>("");

  // Modais State
  const [modalCriarOpen, setModalCriarOpen] = useState<boolean>(false);
  const [modalEditarOpen, setModalEditarOpen] = useState<boolean>(false);
  const [modalDeletarOpen, setModalDeletarOpen] = useState<boolean>(false);

  const [orcamentoEmEdicao, setOrcamentoEmEdicao] = useState<Orcamento | null>(null);
  const [orcamentoEmDelecao, setOrcamentoEmDelecao] = useState<Orcamento | null>(null);

  const carregarDados = useCallback(async () => {
    try {
      setIsLoading(true);
      const data = await orcamentosService.listar(mes, ano, familiaAtiva?.id);
      setOrcamentos(data.orcamentos);
      setResumo(data.resumo);
    } catch {
      // tratativas genéricas de erro na requisição
    } finally {
      setIsLoading(false);
    }
  }, [mes, ano, familiaAtiva?.id]);

  useEffect(() => {
    carregarDados();
  }, [carregarDados]);

  // Filtragem por status e busca
  const orcamentosFiltrados = useMemo(() => {
    return orcamentos.filter((item) => {
      if (statusFiltro && item.status !== statusFiltro) {
        return false;
      }
      if (searchTerm.trim()) {
        const term = searchTerm.toLowerCase().trim();
        const catNome = item.categoria?.nome.toLowerCase() ?? "";
        const obs = item.observacao?.toLowerCase() ?? "";
        return catNome.includes(term) || obs.includes(term);
      }
      return true;
    });
  }, [orcamentos, statusFiltro, searchTerm]);

  return (
    <div className="space-y-8">
      {/* Cabeçalho da Página */}
      <div className="flex flex-col gap-4">
        {/* Linha 1: Título + Botão Novo Orçamento */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h1 className="text-2xl font-bold text-foreground tracking-tight flex items-center gap-2">
              <PieChart className="h-6 w-6 text-[#1F4E79]" />
              <span>Orçamentos por Categoria</span>
            </h1>
            <p className="text-sm text-muted-foreground mt-0.5">
              Defina tetos de gastos mensais e monitore a saúde financeira da{" "}
              <strong className="text-[#1F4E79]">{familiaAtiva?.nome || "sua família"}</strong>
            </p>
          </div>

          <Button
            onClick={() => setModalCriarOpen(true)}
            className="rounded-[10px] bg-[#1F4E79] hover:bg-[#1F4E79]/90 text-white font-medium text-xs gap-2 shadow-2xs self-start sm:self-auto"
          >
            <Plus className="h-4 w-4" />
            <span>Novo Orçamento</span>
          </Button>
        </div>

        {/* Linha 2: Seletor de Mês idêntico à tela de movimentações */}
        <SeletorMes
          dataAtual={dataAtual}
          onDataChange={setDataAtual}
        />
      </div>

      {/* KPI Cards Resumo */}
      {resumo && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Total Orçado */}
          <div className="rounded-[18px] border border-border/60 bg-card p-4 shadow-2xs">
            <div className="flex items-center justify-between text-xs text-muted-foreground">
              <span>Total Orçado (Teto)</span>
              <Wallet className="h-4 w-4 text-[#1F4E79]" />
            </div>
            <p className="text-2xl font-black text-foreground mt-2 tracking-tight">
              {formatarMoeda(resumo.total_orcado)}
            </p>
            <p className="text-xs text-muted-foreground mt-1">
              {resumo.quantidade_total} categorias com meta
            </p>
          </div>

          {/* Total Gasto */}
          <div className="rounded-[18px] border border-border/60 bg-card p-4 shadow-2xs">
            <div className="flex items-center justify-between text-xs text-muted-foreground">
              <span>Total Consumido</span>
              <TrendingDown className="h-4 w-4 text-amber-500" />
            </div>
            <p className="text-2xl font-black text-foreground mt-2 tracking-tight">
              {formatarMoeda(resumo.total_gasto)}
            </p>
            <p className="text-xs text-muted-foreground mt-1">
              {resumo.percentual_geral.toFixed(1)}% do orçamento total
            </p>
          </div>

          {/* Saldo Restante */}
          <div className="rounded-[18px] border border-border/60 bg-card p-4 shadow-2xs">
            <div className="flex items-center justify-between text-xs text-muted-foreground">
              <span>Saldo Disponível</span>
              <CheckCircle2 className="h-4 w-4 text-emerald-500" />
            </div>
            <p className="text-2xl font-black text-emerald-600 dark:text-emerald-400 mt-2 tracking-tight">
              {formatarMoeda(resumo.saldo_restante)}
            </p>
            <p className="text-xs text-muted-foreground mt-1">Margem segura para gastos</p>
          </div>

          {/* Status Geral */}
          <div className="rounded-[18px] border border-border/60 bg-card p-4 shadow-2xs flex flex-col justify-between">
            <div className="flex items-center justify-between text-xs text-muted-foreground">
              <span>Status das Categorias</span>
              <AlertTriangle className="h-4 w-4 text-amber-500" />
            </div>
            <div className="flex items-center gap-3 mt-2 text-xs font-semibold">
              <span className="text-emerald-600 dark:text-emerald-400">
                {resumo.quantidade_dentro_do_limite} OK
              </span>
              <span className="text-amber-600 dark:text-amber-400">
                {resumo.quantidade_atencao} Atenção
              </span>
              <span className="text-red-600 dark:text-red-400">
                {resumo.quantidade_excedidos} Excedidas
              </span>
            </div>
            <p className="text-[11px] text-muted-foreground mt-1">
              {resumo.quantidade_excedidos > 0
                ? `${resumo.quantidade_excedidos} categoria(s) ultrapassou o teto!`
                : "Todos os orçamentos sob controle"}
            </p>
          </div>
        </div>
      )}

      {/* Barra de Filtros, Busca e Alternador de Modo de Exibição */}
      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between border-b border-border/40 pb-3.5">
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 md:pb-0">
          <button
            type="button"
            onClick={() => setStatusFiltro(undefined)}
            className={cn(
              "px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all whitespace-nowrap cursor-pointer",
              statusFiltro === undefined
                ? "bg-[#1F4E79] text-white shadow-2xs"
                : "text-muted-foreground hover:bg-accent hover:text-foreground"
            )}
          >
            Todos ({orcamentos.length})
          </button>

          <button
            type="button"
            onClick={() => setStatusFiltro(StatusOrcamento.DENTRO_DO_LIMITE)}
            className={cn(
              "px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all whitespace-nowrap cursor-pointer",
              statusFiltro === StatusOrcamento.DENTRO_DO_LIMITE
                ? "bg-emerald-600 text-white shadow-2xs"
                : "text-muted-foreground hover:bg-accent hover:text-foreground"
            )}
          >
            No Limite ({resumo?.quantidade_dentro_do_limite ?? 0})
          </button>

          <button
            type="button"
            onClick={() => setStatusFiltro(StatusOrcamento.ATENCAO)}
            className={cn(
              "px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all whitespace-nowrap cursor-pointer",
              statusFiltro === StatusOrcamento.ATENCAO
                ? "bg-amber-500 text-white shadow-2xs"
                : "text-muted-foreground hover:bg-accent hover:text-foreground"
            )}
          >
            Atenção ({resumo?.quantidade_atencao ?? 0})
          </button>

          <button
            type="button"
            onClick={() => setStatusFiltro(StatusOrcamento.EXCEDIDO)}
            className={cn(
              "px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all whitespace-nowrap cursor-pointer",
              statusFiltro === StatusOrcamento.EXCEDIDO
                ? "bg-red-600 text-white shadow-2xs"
                : "text-muted-foreground hover:bg-accent hover:text-foreground"
            )}
          >
            Excedidos ({resumo?.quantidade_excedidos ?? 0})
          </button>
        </div>

        {/* Busca e Alternador de Visualização (Lista vs Grid) */}
        <div className="flex items-center gap-2.5">
          {/* Campo de Busca */}
          <div className="relative flex-1 md:w-64">
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
            <Input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Buscar por categoria..."
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

          {/* Botões do Alternador (Lista vs Grid) */}
          <div className="flex items-center rounded-lg border border-border/60 bg-muted/40 p-0.5 shrink-0">
            <button
              type="button"
              onClick={() => setModoExibicao("lista")}
              className={cn(
                "flex items-center gap-1 px-2.5 py-1 text-xs font-medium rounded-md transition-all cursor-pointer",
                modoExibicao === "lista"
                  ? "bg-background text-foreground shadow-2xs font-semibold"
                  : "text-muted-foreground hover:text-foreground"
              )}
              title="Visão em Lista Compacta"
            >
              <LayoutList className="h-3.5 w-3.5" />
              <span className="hidden sm:inline">Lista</span>
            </button>
            <button
              type="button"
              onClick={() => setModoExibicao("grid")}
              className={cn(
                "flex items-center gap-1 px-2.5 py-1 text-xs font-medium rounded-md transition-all cursor-pointer",
                modoExibicao === "grid"
                  ? "bg-background text-foreground shadow-2xs font-semibold"
                  : "text-muted-foreground hover:text-foreground"
              )}
              title="Visão em Cards Grid"
            >
              <LayoutGrid className="h-3.5 w-3.5" />
              <span className="hidden sm:inline">Cards</span>
            </button>
          </div>
        </div>
      </div>

      {/* Conteúdo Principal */}
      {isLoading ? (
        <div className="flex flex-col items-center justify-center py-16 space-y-3">
          <Loader2 className="h-8 w-8 text-[#1F4E79] animate-spin" />
          <p className="text-xs text-muted-foreground font-medium">
            Carregando orçamentos da família...
          </p>
        </div>
      ) : orcamentosFiltrados.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-[24px] border border-dashed border-border/70 p-12 text-center bg-card/50 space-y-4">
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-[#1F4E79]/10 text-[#1F4E79]">
            <PieChart className="h-7 w-7" />
          </div>
          <div>
            <h3 className="font-bold text-foreground text-base">Nenhum orçamento encontrado</h3>
            <p className="text-xs text-muted-foreground max-w-sm mt-1">
              {statusFiltro || searchTerm
                ? "Nenhum orçamento corresponde aos filtros selecionados."
                : "Sua família ainda não cadastrou orçamentos de gastos para este período."}
            </p>
          </div>
          <Button
            onClick={() => setModalCriarOpen(true)}
            className="rounded-[10px] bg-[#1F4E79] hover:bg-[#1F4E79]/90 text-white font-medium text-xs gap-2"
          >
            <Plus className="h-4 w-4" />
            <span>Criar Primeiro Orçamento</span>
          </Button>
        </div>
      ) : modoExibicao === "lista" ? (
        <OrcamentosListView
          orcamentos={orcamentosFiltrados}
          onEditar={(o) => {
            setOrcamentoEmEdicao(o);
            setModalEditarOpen(true);
          }}
          onDeletar={(o) => {
            setOrcamentoEmDelecao(o);
            setModalDeletarOpen(true);
          }}
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {orcamentosFiltrados.map((orcamento) => (
            <OrcamentoCard
              key={orcamento.id}
              orcamento={orcamento}
              onEditar={(o) => {
                setOrcamentoEmEdicao(o);
                setModalEditarOpen(true);
              }}
              onDeletar={(o) => {
                setOrcamentoEmDelecao(o);
                setModalDeletarOpen(true);
              }}
            />
          ))}
        </div>
      )}

      {/* Modais */}
      <CriarOrcamentoModal
        open={modalCriarOpen}
        onOpenChange={setModalCriarOpen}
        mesPadrao={mes}
        anoPadrao={ano}
        onSucesso={carregarDados}
      />

      <EditarOrcamentoModal
        orcamento={orcamentoEmEdicao}
        open={modalEditarOpen}
        onOpenChange={setModalEditarOpen}
        onSucesso={carregarDados}
      />

      <DeletarOrcamentoModal
        orcamento={orcamentoEmDelecao}
        open={modalDeletarOpen}
        onOpenChange={setModalDeletarOpen}
        onSucesso={carregarDados}
      />
    </div>
  );
}
