"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { movimentacaoService } from "@/services/movimentacoes";
import {
  AtualizarMovimentacaoPayload,
  CriarMovimentacaoPayload,
  FiltroMovimentacaoParams,
} from "@/types/movimentacoes";
import { obterIntervaloMes } from "@/utils/formatters";

export function useMovimentacoes(familiaId?: number | null) {
  const queryClient = useQueryClient();

  const [filtros, setFiltros] = useState<FiltroMovimentacaoParams>(() => {
    const { data_inicio, data_fim } = obterIntervaloMes(new Date());
    return {
      data_inicio,
      data_fim,
      per_page: 15,
      page: 1,
    };
  });

  const dataAtual = filtros.data_inicio
    ? new Date(filtros.data_inicio + "T00:00:00")
    : new Date();

  const alterarMes = (novaData: Date) => {
    const { data_inicio, data_fim } = obterIntervaloMes(novaData);
    setFiltros((prev) => ({
      ...prev,
      data_inicio,
      data_fim,
      page: 1,
    }));
  };

  const queryKey = ["movimentacoes", familiaId, filtros];

  const {
    data,
    isLoading,
    isFetching,
    isError,
    error,
    refetch,
  } = useQuery({
    queryKey,
    queryFn: () => movimentacaoService.listar(familiaId, filtros),
    enabled: true,
  });

  const invalidateQueries = () => {
    queryClient.invalidateQueries({ queryKey: ["movimentacoes"] });
    queryClient.invalidateQueries({ queryKey: ["contas-bancarias"] });
    queryClient.invalidateQueries({ queryKey: ["cartoes-credito"] });
    queryClient.invalidateQueries({ queryKey: ["fatura-cartao"] });
    queryClient.invalidateQueries({ queryKey: ["dashboard-resumo"] });
  };

  const criarMutation = useMutation({
    mutationFn: (payload: CriarMovimentacaoPayload) =>
      movimentacaoService.criar(payload, familiaId),
    onSuccess: invalidateQueries,
  });

  const atualizarMutation = useMutation({
    mutationFn: ({
      id,
      payload,
    }: {
      id: number;
      payload: AtualizarMovimentacaoPayload;
    }) => movimentacaoService.atualizar(id, payload),
    onSuccess: invalidateQueries,
  });

  const marcarComoPagoMutation = useMutation({
    mutationFn: ({
      id,
      dataPagamento,
    }: {
      id: number;
      dataPagamento?: string;
    }) => movimentacaoService.marcarComoPago(id, dataPagamento),
    onSuccess: invalidateQueries,
  });

  const deletarMutation = useMutation({
    mutationFn: (id: number) => movimentacaoService.deletar(id),
    onSuccess: invalidateQueries,
  });

  return {
    movimentacoes: data?.data ?? [],
    meta: data?.meta ?? { current_page: 1, last_page: 1, per_page: 15, total: 0 },
    resumo: data?.resumo ?? {
      total_receitas: 0,
      total_despesas: 0,
      saldo_periodo: 0,
      total_pendente: 0,
    },
    filtros,
    setFiltros,
    dataAtual,
    alterarMes,
    isLoading,
    isFetching,
    isError,
    error,
    refetch,
    criarMovimentacao: criarMutation.mutateAsync,
    isCriando: criarMutation.isPending,
    atualizarMovimentacao: atualizarMutation.mutateAsync,
    isAtualizando: atualizarMutation.isPending,
    marcarComoPago: marcarComoPagoMutation.mutateAsync,
    isMarcandoComoPago: marcarComoPagoMutation.isPending,
    deletarMovimentacao: deletarMutation.mutateAsync,
    isDeletando: deletarMutation.isPending,
  };
}
