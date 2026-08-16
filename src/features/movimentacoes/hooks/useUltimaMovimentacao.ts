"use client";

import { useQuery } from "@tanstack/react-query";
import { movimentacaoService } from "@/services/movimentacoes";
import { Movimentacao } from "@/types/movimentacoes";

interface UseUltimaMovimentacaoParams {
  contaBancariaId?: number | null;
  cartaoCreditoId?: number | null;
  familiaId?: number | null;
  enabled?: boolean;
}

export function useUltimaMovimentacao({
  contaBancariaId,
  cartaoCreditoId,
  familiaId,
  enabled = true,
}: UseUltimaMovimentacaoParams) {
  const isConta = Boolean(contaBancariaId);
  const isCartao = Boolean(cartaoCreditoId);

  const queryKey = [
    "ultima-movimentacao",
    familiaId,
    isConta ? `conta-${contaBancariaId}` : isCartao ? `cartao-${cartaoCreditoId}` : "none",
  ];

  const { data, isLoading, isError, refetch } = useQuery<Movimentacao | null>({
    queryKey,
    queryFn: async () => {
      if (!isConta && !isCartao) return null;

      const response = await movimentacaoService.listar(familiaId, {
        conta_bancaria_id: contaBancariaId ?? undefined,
        cartao_credito_id: cartaoCreditoId ?? undefined,
        per_page: 1,
        page: 1,
      });

      return response.data && response.data.length > 0 ? response.data[0] : null;
    },
    enabled: enabled && (isConta || isCartao),
    staleTime: 1000 * 30, // 30s de cache
  });

  return {
    ultimaMovimentacao: data ?? null,
    isLoading,
    isError,
    refetch,
  };
}
