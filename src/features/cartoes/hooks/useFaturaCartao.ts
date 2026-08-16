"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { cartaoCreditoService } from "@/services/cartoes";
import { PagarFaturaPayload } from "@/types/cartoes";

export function useFaturaCartao(cartaoId: number | null, mesAno?: string) {
  const queryClient = useQueryClient();
  const queryKey = ["fatura-cartao", cartaoId, mesAno];

  const {
    data,
    isLoading,
    isError,
    error,
    refetch,
  } = useQuery({
    queryKey,
    queryFn: () => {
      if (!cartaoId) throw new Error("ID do cartão não informado");
      return cartaoCreditoService.obterFatura(cartaoId, mesAno);
    },
    enabled: !!cartaoId,
  });

  const pagarFaturaMutation = useMutation({
    mutationFn: ({
      id,
      payload,
    }: {
      id: number;
      payload: PagarFaturaPayload;
    }) => cartaoCreditoService.pagarFatura(id, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["fatura-cartao"] });
      queryClient.invalidateQueries({ queryKey: ["cartoes-credito"] });
      queryClient.invalidateQueries({ queryKey: ["contas-bancarias"] });
      queryClient.invalidateQueries({ queryKey: ["dashboard"] });
      queryClient.invalidateQueries({ queryKey: ["movimentacoes"] });
    },
  });

  return {
    fatura: data,
    isLoading,
    isError,
    error,
    refetch,
    pagarFatura: pagarFaturaMutation.mutateAsync,
    isPagandoFatura: pagarFaturaMutation.isPending,
  };
}
