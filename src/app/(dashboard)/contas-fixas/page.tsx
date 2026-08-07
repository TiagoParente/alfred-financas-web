"use client";

import { useState, useMemo } from "react";
import { useFamilias } from "@/features/familias/hooks/useFamilias";
import { useContasFixas } from "@/features/contas_fixas/hooks/useContasFixas";
import { ContaFixaResumoCards } from "@/features/contas_fixas/components/ContaFixaResumoCards";
import { ContaFixaCard } from "@/features/contas_fixas/components/ContaFixaCard";
import { ContaFixaListView } from "@/features/contas_fixas/components/ContaFixaListView";
import { ContaFixaModal } from "@/features/contas_fixas/components/ContaFixaModal";
import { DeletarContaFixaModal } from "@/features/contas_fixas/components/DeletarContaFixaModal";
import { ContasFixasSkeleton } from "@/features/contas_fixas/components/ContasFixasSkeleton";
import { ContasFixasEmptyState } from "@/features/contas_fixas/components/ContasFixasEmptyState";
import { ContaFixa, CriarContaFixaPayload } from "@/types/contasFixas";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Plus,
  CalendarSync,
  AlertCircle,
  Search,
  X,
  Play,
  CheckCircle2,
  Loader2,
  LayoutList,
  LayoutGrid,
} from "lucide-react";
import { cn } from "@/lib/utils";

type ModoExibicao = "lista" | "grid";

export default function ContasFixasPage() {
  const { familiaAtiva } = useFamilias();

  const [apenasAtivas, setApenasAtivas] = useState<boolean | undefined>(undefined);
  const [searchTerm, setSearchTerm] = useState("");
  const [modoExibicao, setModoExibicao] = useState<ModoExibicao>("lista");

  // Modais
  const [modalFormAberta, setModalFormAberta] = useState(false);
  const [contaFixaEmEdicao, setContaFixaEmEdicao] = useState<ContaFixa | null>(null);

  const [modalDeletarAberta, setModalDeletarAberta] = useState(false);
  const [contaFixaEmDelecao, setContaFixaEmDelecao] = useState<ContaFixa | null>(null);

  // Status de execução de geração de lançamentos
  const [resultadoGeracao, setResultadoGeracao] = useState<{
    total: number;
    mensagem: string;
  } | null>(null);

  const {
    contasFixas,
    resumo,
    isLoading,
    isError,
    refetch,
    criarContaFixa,
    isCriando,
    atualizarContaFixa,
    isAtualizando,
    alternarStatus,
    isAlternandoStatus,
    deletarContaFixa,
    gerarLancamentos,
    isGerandoLancamentos,
  } = useContasFixas(familiaAtiva?.id, apenasAtivas);

  // Filtragem local por termo de busca
  const contasFiltradas = useMemo(() => {
    if (!searchTerm.trim()) return contasFixas;
    const term = searchTerm.toLowerCase().trim();
    return contasFixas.filter(
      (c) =>
        c.descricao.toLowerCase().includes(term) ||
        c.categoria?.nome.toLowerCase().includes(term) ||
        c.subcategoria?.nome.toLowerCase().includes(term) ||
        c.conta_bancaria?.nome.toLowerCase().includes(term) ||
        c.cartao_credito?.nome.toLowerCase().includes(term)
    );
  }, [contasFixas, searchTerm]);

  const handleSalvarContaFixa = async (payload: CriarContaFixaPayload) => {
    if (contaFixaEmEdicao) {
      await atualizarContaFixa({
        id: contaFixaEmEdicao.id,
        payload,
      });
    } else {
      await criarContaFixa(payload);
    }
  };

  const handleConfirmarDeletar = async (id: number) => {
    await deletarContaFixa(id);
  };

  const handleGerarLancamentos = async () => {
    try {
      setResultadoGeracao(null);
      const res = await gerarLancamentos();
      setResultadoGeracao({
        total: res.total_gerados,
        mensagem:
          res.total_gerados > 0
            ? `${res.total_gerados} lançamento(s) gerado(s) com sucesso para o mês atual!`
            : "Todas as contas fixas ativas já possuem lançamentos gerados para o ciclo atual.",
      });
    } catch {
      // Trata erros de requisição
    }
  };

  return (
    <div className="space-y-8 pb-10">
      {/* Cabeçalho da Página */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground tracking-tight flex items-center gap-2">
            <CalendarSync className="h-6 w-6 text-[#1F4E79]" />
            <span>Contas Fixas & Recorrentes</span>
          </h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            Gerencie entradas e saídas automáticas que se repetem periodicamente na{" "}
            <strong className="text-[#1F4E79]">{familiaAtiva?.nome || "sua família"}</strong>
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          {/* Botão de Disparo Manual de Lançamentos */}
          <Button
            onClick={handleGerarLancamentos}
            disabled={isGerandoLancamentos}
            variant="outline"
            className="rounded-[10px] text-xs font-semibold gap-2 border-border/70 shadow-2xs hover:bg-accent cursor-pointer"
          >
            {isGerandoLancamentos ? (
              <Loader2 className="h-4 w-4 animate-spin text-[#1F4E79]" />
            ) : (
              <Play className="h-4 w-4 text-[#1F4E79]" />
            )}
            <span>
              {isGerandoLancamentos ? "Gerando Lançamentos..." : "Gerar Lançamentos no Mês"}
            </span>
          </Button>

          {/* Botão para Nova Conta Fixa */}
          <Button
            onClick={() => {
              setContaFixaEmEdicao(null);
              setModalFormAberta(true);
            }}
            className="rounded-[10px] bg-[#1F4E79] hover:bg-[#1F4E79]/90 text-white font-medium text-xs gap-2 shadow-2xs cursor-pointer"
          >
            <Plus className="h-4 w-4" />
            <span>Nova Conta Fixa</span>
          </Button>
        </div>
      </div>

      {/* Banner de Feedback de Geração */}
      {resultadoGeracao && (
        <div className="flex items-center justify-between p-4 rounded-xl border border-emerald-500/30 bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 text-xs">
          <div className="flex items-center gap-2.5">
            <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-600 dark:text-emerald-400" />
            <span>{resultadoGeracao.mensagem}</span>
          </div>
          <button
            type="button"
            onClick={() => setResultadoGeracao(null)}
            className="text-emerald-700 hover:text-emerald-900 dark:hover:text-emerald-100 cursor-pointer"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      )}

      {/* Condicional de Carregamento e Erro */}
      {isLoading ? (
        <ContasFixasSkeleton />
      ) : isError ? (
        <div className="flex flex-col items-center justify-center rounded-[20px] border border-rose-500/30 bg-rose-500/5 p-8 text-center space-y-3">
          <AlertCircle className="h-8 w-8 text-rose-500" />
          <p className="text-sm font-bold text-foreground">
            Erro ao carregar as contas fixas
          </p>
          <p className="text-xs text-muted-foreground">
            Ocorreu uma falha na comunicação com o servidor.
          </p>
          <Button
            onClick={() => refetch()}
            variant="outline"
            className="rounded-[10px] text-xs cursor-pointer"
          >
            Tentar Novamente
          </Button>
        </div>
      ) : (
        <>
          {/* Cards Métricos Superiores */}
          <ContaFixaResumoCards resumo={resumo} />

          {/* Barra de Filtros por Status, Busca e Alternador de Modo de Exibição */}
          <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between border-b border-border/40 pb-3.5">
            {/* Filtros por Status */}
            <div className="flex items-center gap-1.5 overflow-x-auto pb-1 md:pb-0">
              <button
                type="button"
                onClick={() => setApenasAtivas(undefined)}
                className={cn(
                  "px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all whitespace-nowrap cursor-pointer",
                  apenasAtivas === undefined
                    ? "bg-[#1F4E79] text-white shadow-2xs"
                    : "text-muted-foreground hover:bg-accent hover:text-foreground"
                )}
              >
                Todas ({contasFixas.length})
              </button>

              <button
                type="button"
                onClick={() => setApenasAtivas(true)}
                className={cn(
                  "px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all whitespace-nowrap cursor-pointer",
                  apenasAtivas === true
                    ? "bg-emerald-600 text-white shadow-2xs"
                    : "text-muted-foreground hover:bg-accent hover:text-foreground"
                )}
              >
                Ativas ({resumo.totalContasAtivas})
              </button>

              <button
                type="button"
                onClick={() => setApenasAtivas(false)}
                className={cn(
                  "px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all whitespace-nowrap cursor-pointer",
                  apenasAtivas === false
                    ? "bg-amber-600 text-white shadow-2xs"
                    : "text-muted-foreground hover:bg-accent hover:text-foreground"
                )}
              >
                Inativas ({resumo.totalContasInativas})
              </button>
            </div>

            {/* Busca em Tempo Real e Alternador de Modo de Exibição (Lista vs Grid) */}
            <div className="flex items-center gap-2.5">
              {/* Campo de Busca */}
              <div className="relative flex-1 md:w-64">
                <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
                <Input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Buscar por descrição, conta..."
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

              {/* Alternador de Modo de Exibição (Lista vs Grid) */}
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

          {/* Exibição em Modo Lista, Grid ou Estado Vazio */}
          {contasFiltradas.length === 0 ? (
            <ContasFixasEmptyState
              onNovaContaFixa={() => {
                setContaFixaEmEdicao(null);
                setModalFormAberta(true);
              }}
            />
          ) : modoExibicao === "lista" ? (
            <ContaFixaListView
              contasFixas={contasFiltradas}
              onEdit={(c) => {
                setContaFixaEmEdicao(c);
                setModalFormAberta(true);
              }}
              onDelete={(id) => {
                const item = contasFixas.find((c) => c.id === id);
                if (item) {
                  setContaFixaEmDelecao(item);
                  setModalDeletarAberta(true);
                }
              }}
              onToggleStatus={(id) => alternarStatus(id)}
              isAlternandoStatus={isAlternandoStatus}
            />
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {contasFiltradas.map((contaFixa) => (
                <ContaFixaCard
                  key={contaFixa.id}
                  contaFixa={contaFixa}
                  onEdit={(c) => {
                    setContaFixaEmEdicao(c);
                    setModalFormAberta(true);
                  }}
                  onDelete={(id) => {
                    const item = contasFixas.find((c) => c.id === id);
                    if (item) {
                      setContaFixaEmDelecao(item);
                      setModalDeletarAberta(true);
                    }
                  }}
                  onToggleStatus={(id) => alternarStatus(id)}
                  isAlternandoStatus={isAlternandoStatus}
                />
              ))}
            </div>
          )}
        </>
      )}

      {/* Modais */}
      <ContaFixaModal
        open={modalFormAberta}
        onOpenChange={setModalFormAberta}
        contaFixaEmEdicao={contaFixaEmEdicao}
        onSubmit={handleSalvarContaFixa}
        isSubmitting={isCriando || isAtualizando}
      />

      <DeletarContaFixaModal
        open={modalDeletarAberta}
        onOpenChange={setModalDeletarAberta}
        contaFixa={contaFixaEmDelecao}
        onConfirmar={handleConfirmarDeletar}
      />
    </div>
  );
}
