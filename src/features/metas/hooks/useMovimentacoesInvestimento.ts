"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { movimentacaoInvestimentoService } from "@/services/metas";
import { CriarMovimentacaoInvestimentoPayload } from "@/types/metas";

export function useMovimentacoesInvestimento(
  familiaId?: number | null,
  filters?: { meta_id?: number; conta_bancaria_id?: number }
) {
  const queryClient = useQueryClient();
  const queryKey = [
    "movimentacoes-investimento",
    familiaId,
    filters?.meta_id,
    filters?.conta_bancaria_id,
  ];

  const { data, isLoading, isError, error, refetch } = useQuery({
    queryKey,
    queryFn: () =>
      movimentacaoInvestimentoService.listar(familiaId ?? undefined, filters),
    enabled: true,
  });

  const registrarMutation = useMutation({
    mutationFn: (payload: CriarMovimentacaoInvestimentoPayload) =>
      movimentacaoInvestimentoService.registrar(payload, familiaId ?? undefined),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["metas"] });
      queryClient.invalidateQueries({ queryKey: ["contas-bancarias"] });
      queryClient.invalidateQueries({ queryKey: ["movimentacoes-investimento"] });
    },
  });

  const deletarMutation = useMutation({
    mutationFn: (id: number) => movimentacaoInvestimentoService.deletar(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["metas"] });
      queryClient.invalidateQueries({ queryKey: ["contas-bancarias"] });
      queryClient.invalidateQueries({ queryKey: ["movimentacoes-investimento"] });
    },
  });

  return {
    movimentacoes: data ?? [],
    isLoading,
    isError,
    error,
    refetch,
    registrarMovimentacao: registrarMutation.mutateAsync,
    isRegistrando: registrarMutation.isPending,
    deletarMovimentacao: deletarMutation.mutateAsync,
    isDeletando: deletarMutation.isPending,
  };
}
