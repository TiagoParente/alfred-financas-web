"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { cartaoCreditoService } from "@/services/cartoes";
import {
  AtualizarCartaoCreditoPayload,
  CriarCartaoCreditoPayload,
} from "@/types/cartoes";

export function useCartoes(familiaId?: number | null) {
  const queryClient = useQueryClient();
  const queryKey = ["cartoes-credito", familiaId];

  const {
    data,
    isLoading,
    isError,
    error,
    refetch,
  } = useQuery({
    queryKey,
    queryFn: () => cartaoCreditoService.listar(familiaId ?? undefined),
    enabled: true,
  });

  const criarMutation = useMutation({
    mutationFn: (payload: CriarCartaoCreditoPayload) =>
      cartaoCreditoService.criar(payload, familiaId ?? undefined),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["cartoes-credito"] });
    },
  });

  const atualizarMutation = useMutation({
    mutationFn: ({
      id,
      payload,
    }: {
      id: number;
      payload: AtualizarCartaoCreditoPayload;
    }) => cartaoCreditoService.atualizar(id, payload),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["cartoes-credito"] });
      queryClient.invalidateQueries({ queryKey: ["fatura-cartao", variables.id] });
    },
  });

  const deletarMutation = useMutation({
    mutationFn: (id: number) => cartaoCreditoService.deletar(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["cartoes-credito"] });
    },
  });

  return {
    cartoes: data?.cartoes ?? [],
    resumo: data?.resumo ?? {
      limite_total: 0,
      limite_usado_total: 0,
      limite_disponivel_total: 0,
      fatura_atual_total: 0,
      total_cartoes: 0,
    },
    isLoading,
    isError,
    error,
    refetch,
    criarCartao: criarMutation.mutateAsync,
    isCriando: criarMutation.isPending,
    atualizarCartao: atualizarMutation.mutateAsync,
    isAtualizando: atualizarMutation.isPending,
    deletarCartao: deletarMutation.mutateAsync,
    isDeletando: deletarMutation.isPending,
  };
}
