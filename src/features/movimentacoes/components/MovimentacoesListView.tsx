"use client";

import { useState } from "react";
import { Plus, ChevronLeft, ChevronRight, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "@/components/ui/toast";
import { Movimentacao, CriarMovimentacaoPayload } from "@/types/movimentacoes";
import { useMovimentacoes } from "../hooks/useMovimentacoes";
import { ResumoMovimentacoesCards } from "./ResumoMovimentacoesCards";
import { MovimentacaoFiltros } from "./MovimentacaoFiltros";
import { MovimentacaoListItem } from "./MovimentacaoListItem";
import { MovimentacaoModal } from "./MovimentacaoModal";
import { DeletarMovimentacaoModal } from "./DeletarMovimentacaoModal";
import { MovimentacoesEmptyState } from "./MovimentacoesEmptyState";
import { MovimentacoesSkeleton } from "./MovimentacoesSkeleton";
import { SeletorMes } from "./SeletorMes";

interface MovimentacoesListViewProps {
  familiaId?: number | null;
}

export function MovimentacoesListView({ familiaId }: MovimentacoesListViewProps) {
  const {
    movimentacoes,
    meta,
    resumo,
    filtros,
    setFiltros,
    dataAtual,
    alterarMes,
    isLoading,
    isError,
    refetch,
    criarMovimentacao,
    atualizarMovimentacao,
    marcarComoPago,
    deletarMovimentacao,
  } = useMovimentacoes(familiaId);

  const [modalOpen, setModalOpen] = useState(false);
  const [movimentacaoParaEditar, setMovimentacaoParaEditar] = useState<Movimentacao | null>(null);

  const [deletarModalOpen, setDeletarModalOpen] = useState(false);
  const [movimentacaoParaDeletar, setMovimentacaoParaDeletar] = useState<Movimentacao | null>(null);

  const handleNovaMovimentacao = () => {
    setMovimentacaoParaEditar(null);
    setModalOpen(true);
  };

  const handleEditar = (movimentacao: Movimentacao) => {
    setMovimentacaoParaEditar(movimentacao);
    setModalOpen(true);
  };

  const handleDeletarClick = (movimentacao: Movimentacao) => {
    setMovimentacaoParaDeletar(movimentacao);
    setDeletarModalOpen(true);
  };

  const handleSalvarMovimentacao = async (payload: CriarMovimentacaoPayload) => {
    if (movimentacaoParaEditar) {
      await atualizarMovimentacao({
        id: movimentacaoParaEditar.id,
        payload,
      });
      toast.add({
        title: "Movimentação atualizada",
        description: "Os dados da movimentação foram alterados com sucesso.",
        type: "success",
      });
    } else {
      await criarMovimentacao(payload);
      toast.add({
        title: "Movimentação criada",
        description: "Nova movimentação adicionada com sucesso.",
        type: "success",
      });
    }
  };

  const handleMarcarComoPago = async (movimentacao: Movimentacao) => {
    try {
      await marcarComoPago({ id: movimentacao.id });
      toast.add({
        title: "Status atualizado",
        description: `A movimentação "${movimentacao.descricao}" foi marcada como paga.`,
        type: "success",
      });
    } catch {
      toast.add({
        title: "Erro ao atualizar status",
        description: "Não foi possível marcar a movimentação como paga.",
        type: "error",
      });
    }
  };

  const handleConfirmarDeletar = async (id: number) => {
    try {
      await deletarMovimentacao(id);
      toast.add({
        title: "Movimentação excluída",
        description: "A movimentação foi removida com sucesso.",
        type: "success",
      });
    } catch {
      toast.add({
        title: "Erro ao excluir",
        description: "Não foi possível excluir a movimentação.",
        type: "error",
      });
    }
  };

  const hasFiltrosAtivos = Boolean(
    filtros.busca ||
      filtros.tipo ||
      filtros.status ||
      filtros.conta_bancaria_id ||
      filtros.categoria_id ||
      filtros.data_inicio ||
      filtros.data_fim
  );

  return (
    <div className="space-y-6">
      {/* Cabeçalho da Página */}
      <div className="flex flex-col gap-4">
        {/* Linha 1: Título + Botão Nova Movimentação */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-foreground">
              Movimentações
            </h1>
            <p className="text-sm text-muted-foreground">
              Gerencie suas receitas, despesas e transferências entre contas bancárias.
            </p>
          </div>

          <Button
            onClick={handleNovaMovimentacao}
            className="bg-[#1F4E79] hover:bg-[#153654] text-white rounded-xl shadow-md hover:shadow-lg transition-all gap-2 shrink-0 self-start sm:self-auto"
          >
            <Plus className="h-4 w-4" />
            <span>Nova Movimentação</span>
          </Button>
        </div>

        {/* Linha 2: Seletor de Mês */}
        <SeletorMes
          dataAtual={dataAtual}
          onDataChange={alterarMes}
        />
      </div>

      {/* Tratamento de Estados */}
      {isLoading ? (
        <MovimentacoesSkeleton />
      ) : isError ? (
        <div className="p-8 rounded-3xl border border-destructive/30 bg-destructive/5 text-center space-y-4">
          <p className="text-sm font-medium text-destructive">
            Ocorreu um erro ao carregar as movimentações financeiras.
          </p>
          <Button
            variant="outline"
            onClick={() => refetch()}
            className="rounded-xl border-destructive/40 text-destructive hover:bg-destructive/10 gap-2"
          >
            <RefreshCw className="h-4 w-4" />
            <span>Tentar Novamente</span>
          </Button>
        </div>
      ) : (
        <>
          {/* Cards de Resumo */}
          <ResumoMovimentacoesCards resumo={resumo} />

          {/* Barra de Filtros */}
          <MovimentacaoFiltros
            filtros={filtros}
            onFiltrosChange={setFiltros}
            familiaId={familiaId}
          />

          {/* Lista de Movimentações */}
          {movimentacoes.length === 0 ? (
            <MovimentacoesEmptyState
              onNovaMovimentacao={handleNovaMovimentacao}
              hasFiltros={hasFiltrosAtivos}
              onLimparFiltros={() =>
                setFiltros({ per_page: filtros.per_page ?? 15, page: 1 })
              }
            />
          ) : (
            <div className="space-y-3">
              {movimentacoes.map((item) => (
                <MovimentacaoListItem
                  key={item.id}
                  movimentacao={item}
                  onEditar={handleEditar}
                  onDeletar={handleDeletarClick}
                  onMarcarPago={handleMarcarComoPago}
                />
              ))}

              {/* Paginação */}
              {meta.last_page > 1 && (
                <div className="flex items-center justify-between pt-4 border-t border-border/40">
                  <p className="text-xs text-muted-foreground">
                    Exibindo página <span className="font-semibold">{meta.current_page}</span> de{" "}
                    <span className="font-semibold">{meta.last_page}</span> (total de {meta.total}{" "}
                    movimentações)
                  </p>

                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      disabled={meta.current_page <= 1}
                      onClick={() =>
                        setFiltros({ ...filtros, page: meta.current_page - 1 })
                      }
                      className="h-8 rounded-lg text-xs"
                    >
                      <ChevronLeft className="h-4 w-4 mr-1" />
                      Anterior
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      disabled={meta.current_page >= meta.last_page}
                      onClick={() =>
                        setFiltros({ ...filtros, page: meta.current_page + 1 })
                      }
                      className="h-8 rounded-lg text-xs"
                    >
                      Próxima
                      <ChevronRight className="h-4 w-4 ml-1" />
                    </Button>
                  </div>
                </div>
              )}
            </div>
          )}
        </>
      )}

      {/* Modais */}
      <MovimentacaoModal
        open={modalOpen}
        onOpenChange={setModalOpen}
        movimentacaoParaEditar={movimentacaoParaEditar}
        onSalvar={handleSalvarMovimentacao}
        familiaId={familiaId}
      />

      <DeletarMovimentacaoModal
        open={deletarModalOpen}
        onOpenChange={setDeletarModalOpen}
        movimentacao={movimentacaoParaDeletar}
        onConfirmar={handleConfirmarDeletar}
      />
    </div>
  );
}
