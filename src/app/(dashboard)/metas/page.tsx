"use client";

import { useState, useMemo } from "react";
import { useFamilias } from "@/features/familias/hooks/useFamilias";
import { useContasBancarias } from "@/features/contas_bancarias/hooks/useContasBancarias";
import { useMetas } from "@/features/metas/hooks/useMetas";
import { useMovimentacoesInvestimento } from "@/features/metas/hooks/useMovimentacoesInvestimento";
import { ResumoMetasCards } from "@/features/metas/components/ResumoMetasCards";
import { MetaCard } from "@/features/metas/components/MetaCard";
import { MetaListItem } from "@/features/metas/components/MetaListItem";
import { MetasListView } from "@/features/metas/components/MetasListView";
import { MetaModal } from "@/features/metas/components/MetaModal";
import { AporteResgateModal } from "@/features/metas/components/AporteResgateModal";
import { MetaDetalhesModal } from "@/features/metas/components/MetaDetalhesModal";
import { DeletarMetaModal } from "@/features/metas/components/DeletarMetaModal";
import { MetasSkeleton } from "@/features/metas/components/MetasSkeleton";
import { MetasEmptyState } from "@/features/metas/components/MetasEmptyState";
import { Meta, StatusMeta, TipoMovimentacaoInvestimento } from "@/types/metas";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Plus,
  ArrowUpRight,
  Target,
  AlertCircle,
  Search,
  LayoutList,
  LayoutGrid,
  X,
} from "lucide-react";
import { cn } from "@/lib/utils";

type ModoExibicao = "lista" | "grid";

export default function MetasPage() {
  const { familiaAtiva } = useFamilias();
  const [statusFiltro, setStatusFiltro] = useState<StatusMeta | undefined>(undefined);
  const [modoExibicao, setModoExibicao] = useState<ModoExibicao>("lista");
  const [searchTerm, setSearchTerm] = useState("");

  const {
    metas,
    resumo,
    isLoading,
    isError,
    refetch,
    criarMeta,
    isCriando,
    atualizarMeta,
    isAtualizando,
    deletarMeta,
    isDeletando,
  } = useMetas(familiaAtiva?.id, statusFiltro);

  const { contas } = useContasBancarias(familiaAtiva?.id);
  const { registrarMovimentacao, isRegistrando } = useMovimentacoesInvestimento(familiaAtiva?.id);

  // Filtragem por busca em tempo real
  const metasFiltradas = useMemo(() => {
    if (!searchTerm.trim()) return metas;
    const term = searchTerm.toLowerCase().trim();
    return metas.filter(
      (m) =>
        m.nome.toLowerCase().includes(term) ||
        m.descricao?.toLowerCase().includes(term) ||
        m.status_label.toLowerCase().includes(term)
    );
  }, [metas, searchTerm]);

  // Estados dos Modais
  const [modalMetaAberta, setModalMetaAberta] = useState(false);
  const [metaEmEdicao, setMetaEmEdicao] = useState<Meta | null>(null);

  const [modalAporteAberta, setModalAporteAberta] = useState(false);
  const [metaPreSelecionada, setMetaPreSelecionada] = useState<Meta | null>(null);

  const [modalDetalhesAberta, setModalDetalhesAberta] = useState(false);
  const [metaDetalhes, setMetaDetalhes] = useState<Meta | null>(null);

  const [modalDeletarAberta, setModalDeletarAberta] = useState(false);
  const [metaEmDelecao, setMetaEmDelecao] = useState<Meta | null>(null);

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const handleSaveMeta = async (formData: any) => {
    if (metaEmEdicao) {
      await atualizarMeta({
        id: metaEmEdicao.id,
        payload: {
          nome: formData.nome,
          valor_alvo: Number(formData.valor_alvo),
          valor_atual: formData.valor_atual ? Number(formData.valor_atual) : undefined,
          descricao: formData.descricao || null,
          data_limite: formData.data_limite || null,
          cor_hex: formData.cor_hex || null,
          icone: formData.icone || null,
          status: formData.status,
        },
      });
    } else {
      await criarMeta({
        nome: formData.nome,
        valor_alvo: Number(formData.valor_alvo),
        valor_atual: formData.valor_atual ? Number(formData.valor_atual) : 0,
        descricao: formData.descricao || null,
        data_limite: formData.data_limite || null,
        cor_hex: formData.cor_hex || null,
        icone: formData.icone || null,
        status: formData.status || StatusMeta.EM_ANDAMENTO,
      });
    }
  };

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const handleSaveAporteResgate = async (formData: any) => {
    await registrarMovimentacao({
      conta_bancaria_id: Number(formData.conta_bancaria_id),
      meta_id: formData.meta_id ? Number(formData.meta_id) : null,
      tipo: formData.tipo as TipoMovimentacaoInvestimento,
      valor: Number(formData.valor),
      data_movimentacao: formData.data_movimentacao,
      motivo: formData.motivo,
      observacao: formData.observacao || null,
    });
  };

  const handleConfirmarDeletar = async (meta: Meta) => {
    await deletarMeta(meta.id);
  };

  return (
    <div className="space-y-8">
      {/* Cabeçalho da Página */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground tracking-tight flex items-center gap-2">
            <Target className="h-6 w-6 text-[#1F4E79]" />
            <span>Metas & Reservas</span>
          </h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            Planeje seus objetivos financeiros e acompanhe a evolução das suas reservas da{" "}
            <strong className="text-[#1F4E79]">{familiaAtiva?.nome || "sua família"}</strong>
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <Button
            onClick={() => {
              setMetaPreSelecionada(null);
              setModalAporteAberta(true);
            }}
            variant="outline"
            className="rounded-[10px] text-xs font-semibold gap-2 border-border/70 shadow-2xs"
          >
            <ArrowUpRight className="h-4 w-4 text-[#22C55E]" />
            <span>Aporte / Resgate</span>
          </Button>

          <Button
            onClick={() => {
              setMetaEmEdicao(null);
              setModalMetaAberta(true);
            }}
            className="rounded-[10px] bg-[#1F4E79] hover:bg-[#1F4E79]/90 text-white font-medium text-xs gap-2 shadow-2xs"
          >
            <Plus className="h-4 w-4" />
            <span>Nova Meta</span>
          </Button>
        </div>
      </div>

      {/* Condicional de Carregamento e Erro */}
      {isLoading ? (
        <MetasSkeleton />
      ) : isError ? (
        <div className="flex flex-col items-center justify-center rounded-[20px] border border-red-500/30 bg-red-500/5 p-8 text-center space-y-3">
          <AlertCircle className="h-8 w-8 text-red-500" />
          <p className="text-sm font-bold text-foreground">
            Erro ao carregar as metas financeiras
          </p>
          <p className="text-xs text-muted-foreground">
            Ocorreu uma falha na comunicação com o servidor.
          </p>
          <Button
            onClick={() => refetch()}
            variant="outline"
            className="rounded-[10px] text-xs"
          >
            Tentar Novamente
          </Button>
        </div>
      ) : (
        <>
          {/* Cards Métricos Superiores */}
          <ResumoMetasCards resumo={resumo} />

          {/* Barra de Filtros por Status, Busca e Alternador de Modo de Exibição */}
          <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between border-b border-border/40 pb-3.5">
            {/* Abas por Status da Meta */}
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
                Todas ({metas.length})
              </button>

              <button
                type="button"
                onClick={() => setStatusFiltro(StatusMeta.EM_ANDAMENTO)}
                className={cn(
                  "px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all whitespace-nowrap cursor-pointer",
                  statusFiltro === StatusMeta.EM_ANDAMENTO
                    ? "bg-amber-500 text-white shadow-2xs"
                    : "text-muted-foreground hover:bg-accent hover:text-foreground"
                )}
              >
                Em Andamento ({resumo.quantidade_metas_em_andamento})
              </button>

              <button
                type="button"
                onClick={() => setStatusFiltro(StatusMeta.CONCLUIDA)}
                className={cn(
                  "px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all whitespace-nowrap cursor-pointer",
                  statusFiltro === StatusMeta.CONCLUIDA
                    ? "bg-[#22C55E] text-white shadow-2xs"
                    : "text-muted-foreground hover:bg-accent hover:text-foreground"
                )}
              >
                Concluídas ({resumo.quantidade_metas_concluidas})
              </button>

              <button
                type="button"
                onClick={() => setStatusFiltro(StatusMeta.CANCELADA)}
                className={cn(
                  "px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all whitespace-nowrap cursor-pointer",
                  statusFiltro === StatusMeta.CANCELADA
                    ? "bg-muted-foreground text-white shadow-2xs"
                    : "text-muted-foreground hover:bg-accent hover:text-foreground"
                )}
              >
                Canceladas
              </button>
            </div>

            {/* Busca em Tempo Real + Alternador de Visualização (Lista vs Grid) */}
            <div className="flex items-center gap-2.5">
              {/* Campo de Busca */}
              <div className="relative flex-1 md:w-64">
                <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
                <Input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Buscar meta por nome..."
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

          {/* Grid de Metas ou Estado Vazio */}
          {metasFiltradas.length === 0 ? (
            <MetasEmptyState
              onCriarMeta={() => {
                setMetaEmEdicao(null);
                setModalMetaAberta(true);
              }}
              filtrosAtivos={statusFiltro !== undefined || Boolean(searchTerm)}
            />
          ) : modoExibicao === "lista" ? (
            <MetasListView
              metas={metasFiltradas}
              onAporteResgate={(m) => {
                setMetaPreSelecionada(m);
                setModalAporteAberta(true);
              }}
              onEditar={(m) => {
                setMetaEmEdicao(m);
                setModalMetaAberta(true);
              }}
              onDeletar={(m) => {
                setMetaEmDelecao(m);
                setModalDeletarAberta(true);
              }}
              onVerDetalhes={(m) => {
                setMetaDetalhes(m);
                setModalDetalhesAberta(true);
              }}
            />
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {metasFiltradas.map((meta) => (
                <MetaCard
                  key={meta.id}
                  meta={meta}
                  onAporteResgate={(m) => {
                    setMetaPreSelecionada(m);
                    setModalAporteAberta(true);
                  }}
                  onEditar={(m) => {
                    setMetaEmEdicao(m);
                    setModalMetaAberta(true);
                  }}
                  onDeletar={(m) => {
                    setMetaEmDelecao(m);
                    setModalDeletarAberta(true);
                  }}
                  onVerDetalhes={(m) => {
                    setMetaDetalhes(m);
                    setModalDetalhesAberta(true);
                  }}
                />
              ))}
            </div>
          )}
        </>
      )}

      {/* Modais da Aplicação */}
      <MetaModal
        open={modalMetaAberta}
        onOpenChange={setModalMetaAberta}
        metaEmEdicao={metaEmEdicao}
        onSubmit={handleSaveMeta}
        isSubmitting={isCriando || isAtualizando}
      />

      <AporteResgateModal
        open={modalAporteAberta}
        onOpenChange={setModalAporteAberta}
        metaPreSelecionada={metaPreSelecionada}
        metas={metas}
        contas={contas}
        onSubmit={handleSaveAporteResgate}
        isSubmitting={isRegistrando}
      />

      <MetaDetalhesModal
        open={modalDetalhesAberta}
        onOpenChange={setModalDetalhesAberta}
        meta={metaDetalhes}
        familiaId={familiaAtiva?.id}
      />

      <DeletarMetaModal
        open={modalDeletarAberta}
        onOpenChange={setModalDeletarAberta}
        meta={metaEmDelecao}
        onConfirmar={handleConfirmarDeletar}
        isDeletando={isDeletando}
      />
    </div>
  );
}
