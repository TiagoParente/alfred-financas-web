"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { contaFixaService } from "@/services/contasFixas";
import {
  AtualizarContaFixaPayload,
  CriarContaFixaPayload,
} from "@/types/contasFixas";
import { TipoMovimentacao } from "@/types/movimentacoes";

export function useContasFixas(familiaId?: number | null, apenasAtivas?: boolean) {
  const queryClient = useQueryClient();
  const queryKey = ["contas-fixas", familiaId, apenasAtivas];

  const { data: contasFixas = [], isLoading, isError, error, refetch } = useQuery({
    queryKey,
    queryFn: () => contaFixaService.listar(familiaId, apenasAtivas),
    enabled: true,
  });

  // Cálculo de KPIs
  const contasAtivasList = contasFixas.filter((c) => c.ativa);

  const totalReceitaFixa = contasAtivasList
    .filter((c) => c.tipo === TipoMovimentacao.RECEITA)
    .reduce((acc, c) => acc + Number(c.valor), 0);

  const totalDespesaFixa = contasAtivasList
    .filter((c) => c.tipo === TipoMovimentacao.DESPESA)
    .reduce((acc, c) => acc + Number(c.valor), 0);

  const saldoProjetadoRecorrente = totalReceitaFixa - totalDespesaFixa;

  const resumo = {
    totalReceitaFixa,
    totalDespesaFixa,
    saldoProjetadoRecorrente,
    totalContasAtivas: contasAtivasList.length,
    totalContasInativas: contasFixas.length - contasAtivasList.length,
    totalGeral: contasFixas.length,
  };

  const criarMutation = useMutation({
    mutationFn: (payload: CriarContaFixaPayload) =>
      contaFixaService.criar(payload, familiaId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["contas-fixas"] });
    },
  });

  const atualizarMutation = useMutation({
    mutationFn: ({
      id,
      payload,
    }: {
      id: number;
      payload: AtualizarContaFixaPayload;
    }) => contaFixaService.atualizar(id, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["contas-fixas"] });
    },
  });

  const alternarStatusMutation = useMutation({
    mutationFn: (id: number) => contaFixaService.alternarStatus(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["contas-fixas"] });
    },
  });

  const deletarMutation = useMutation({
    mutationFn: (id: number) => contaFixaService.deletar(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["contas-fixas"] });
    },
  });

  const gerarLancamentosMutation = useMutation({
    mutationFn: () => contaFixaService.gerarLancamentos(familiaId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["contas-fixas"] });
      queryClient.invalidateQueries({ queryKey: ["movimentacoes"] });
    },
  });

  return {
    contasFixas,
    resumo,
    isLoading,
    isError,
    error,
    refetch,
    criarContaFixa: criarMutation.mutateAsync,
    isCriando: criarMutation.isPending,
    atualizarContaFixa: atualizarMutation.mutateAsync,
    isAtualizando: atualizarMutation.isPending,
    alternarStatus: alternarStatusMutation.mutateAsync,
    isAlternandoStatus: alternarStatusMutation.isPending,
    deletarContaFixa: deletarMutation.mutateAsync,
    isDeletando: deletarMutation.isPending,
    gerarLancamentos: gerarLancamentosMutation.mutateAsync,
    isGerandoLancamentos: gerarLancamentosMutation.isPending,
  };
}
