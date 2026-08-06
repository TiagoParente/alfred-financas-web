"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { metaService } from "@/services/metas";
import {
  AtualizarMetaPayload,
  CriarMetaPayload,
  StatusMeta,
} from "@/types/metas";

export function useMetas(familiaId?: number | null, statusFilter?: StatusMeta) {
  const queryClient = useQueryClient();
  const queryKey = ["metas", familiaId, statusFilter];

  const { data, isLoading, isError, error, refetch } = useQuery({
    queryKey,
    queryFn: () => metaService.listar(familiaId ?? undefined, statusFilter),
    enabled: true,
  });

  const criarMutation = useMutation({
    mutationFn: (payload: CriarMetaPayload) =>
      metaService.criar(payload, familiaId ?? undefined),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["metas"] });
      queryClient.invalidateQueries({ queryKey: ["contas-bancarias"] });
    },
  });

  const atualizarMutation = useMutation({
    mutationFn: ({
      id,
      payload,
    }: {
      id: number;
      payload: AtualizarMetaPayload;
    }) => metaService.atualizar(id, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["metas"] });
      queryClient.invalidateQueries({ queryKey: ["contas-bancarias"] });
    },
  });

  const deletarMutation = useMutation({
    mutationFn: (id: number) => metaService.deletar(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["metas"] });
      queryClient.invalidateQueries({ queryKey: ["contas-bancarias"] });
      queryClient.invalidateQueries({ queryKey: ["movimentacoes-investimento"] });
    },
  });

  return {
    metas: data?.metas ?? [],
    resumo: data?.resumo ?? {
      total_saldo_reservas: 0,
      total_acumulado_metas: 0,
      total_alvo_metas: 0,
      percentual_geral_metas: 0,
      quantidade_metas_em_andamento: 0,
      quantidade_metas_concluidas: 0,
    },
    isLoading,
    isError,
    error,
    refetch,
    criarMeta: criarMutation.mutateAsync,
    isCriando: criarMutation.isPending,
    atualizarMeta: atualizarMutation.mutateAsync,
    isAtualizando: atualizarMutation.isPending,
    deletarMeta: deletarMutation.mutateAsync,
    isDeletando: deletarMutation.isPending,
  };
}
