"use client";

import { useQuery } from "@tanstack/react-query";
import { cartaoCreditoService } from "@/services/cartoes";

export function useFaturaCartao(cartaoId: number | null, mesAno?: string) {
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

  return {
    fatura: data,
    isLoading,
    isError,
    error,
    refetch,
  };
}
