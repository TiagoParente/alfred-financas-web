"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { contaBancariaService } from "@/services/contasBancarias";
import {
  AtualizarContaBancariaPayload,
  CriarContaBancariaPayload,
} from "@/types/contas";

export function useContasBancarias(familiaId?: number | null) {
  const queryClient = useQueryClient();
  const queryKey = ["contas-bancarias", familiaId];

  const {
    data,
    isLoading,
    isError,
    error,
    refetch,
  } = useQuery({
    queryKey,
    queryFn: () => contaBancariaService.listar(familiaId ?? undefined),
    enabled: true,
  });

  const criarMutation = useMutation({
    mutationFn: (payload: CriarContaBancariaPayload) =>
      contaBancariaService.criar(payload, familiaId ?? undefined),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["contas-bancarias"] });
    },
  });

  const atualizarMutation = useMutation({
    mutationFn: ({
      id,
      payload,
    }: {
      id: number;
      payload: AtualizarContaBancariaPayload;
    }) => contaBancariaService.atualizar(id, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["contas-bancarias"] });
    },
  });

  const deletarMutation = useMutation({
    mutationFn: (id: number) => contaBancariaService.deletar(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["contas-bancarias"] });
    },
  });

  return {
    contas: data?.contas ?? [],
    resumo: data?.resumo ?? {
      saldo_disponivel: 0,
      saldo_reservas: 0,
      saldo_total: 0,
      total_contas: 0,
    },
    isLoading,
    isError,
    error,
    refetch,
    criarConta: criarMutation.mutateAsync,
    isCriando: criarMutation.isPending,
    atualizarConta: atualizarMutation.mutateAsync,
    isAtualizando: atualizarMutation.isPending,
    deletarConta: deletarMutation.mutateAsync,
    isDeletando: deletarMutation.isPending,
  };
}
