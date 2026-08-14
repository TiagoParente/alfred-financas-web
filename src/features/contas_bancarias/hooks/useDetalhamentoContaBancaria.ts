"use client";

import { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { movimentacaoService } from "@/services/movimentacoes";
import { movimentacaoInvestimentoService } from "@/services/metas";
import { TipoMovimentacao } from "@/types/movimentacoes";
import { MovimentacaoInvestimento, TipoMovimentacaoInvestimento } from "@/types/metas";
import { obterIntervaloMes } from "@/utils/formatters";

export interface ItemExtratoConta {
  isInvestimento: boolean;
  id: string | number;
  data_movimentacao: string;
  valor: number;
  isEntrada: boolean; // true = Crédito na conta bancária (Receita, Transferência destino ou Resgate)
  descricao: string;
  subtitulo: string;
  categoriaCor?: string;
  itemOriginal: unknown;
  tipoInvestimento?: TipoMovimentacaoInvestimento;
}

export function useDetalhamentoContaBancaria(
  contaId: number | null | undefined,
  familiaId: number | null | undefined,
  dataRef: Date
) {
  const { data_inicio, data_fim } = useMemo(
    () => obterIntervaloMes(dataRef),
    [dataRef]
  );

  const queryKey = [
    "detalhamento-conta-bancaria",
    contaId,
    familiaId,
    data_inicio,
    data_fim,
  ];

  const { data, isLoading, isError, error, refetch } = useQuery({
    queryKey,
    queryFn: async () => {
      if (!contaId) return { movimentacoes: [], investimentos: [] };

      const [resMovs, resInvest] = await Promise.all([
        movimentacaoService.listar(familiaId, {
          conta_bancaria_id: contaId,
          data_inicio,
          data_fim,
          per_page: 100,
        }),
        movimentacaoInvestimentoService.listar(familiaId ?? undefined, {
          conta_bancaria_id: contaId,
        }),
      ]);

      const investimentosNoMes = (resInvest || []).filter((inv: MovimentacaoInvestimento) => {
        return inv.data_movimentacao >= data_inicio && inv.data_movimentacao <= data_fim;
      });

      return {
        movimentacoes: resMovs?.data ?? [],
        investimentos: investimentosNoMes,
      };
    },
    enabled: Boolean(contaId),
  });

  const movimentacoes = data?.movimentacoes ?? [];
  const investimentos = data?.investimentos ?? [];

  // Recalcula totais específicos da conta no mês selecionado unificando transações e investimentos
  const resumoMes = useMemo(() => {
    let totalEntradas = 0;
    let totalSaidas = 0;

    for (const mov of movimentacoes) {
      const valor = Number(mov.valor) || 0;
      if (mov.tipo === TipoMovimentacao.RECEITA) {
        totalEntradas += valor;
      } else if (mov.tipo === TipoMovimentacao.DESPESA) {
        totalSaidas += valor;
      } else if (mov.tipo === TipoMovimentacao.TRANSFERENCIA) {
        if (mov.conta_bancaria_destino_id === contaId) {
          totalEntradas += valor;
        } else if (mov.conta_bancaria_id === contaId) {
          totalSaidas += valor;
        }
      }
    }

    for (const inv of investimentos) {
      const valor = Number(inv.valor) || 0;
      if (inv.tipo === TipoMovimentacaoInvestimento.RESGATE) {
        // Resgate = Devolução da reserva para a conta (Entrada/Crédito)
        totalEntradas += valor;
      } else if (inv.tipo === TipoMovimentacaoInvestimento.APORTE) {
        // Aporte = Retirada da conta para a reserva (Saída/Débito)
        totalSaidas += valor;
      }
    }

    const resultadoMes = totalEntradas - totalSaidas;

    return {
      totalEntradas,
      totalSaidas,
      resultadoMes,
      totalLancamentos: movimentacoes.length + investimentos.length,
    };
  }, [movimentacoes, investimentos, contaId]);

  return {
    movimentacoes,
    investimentos,
    resumoMes,
    isLoading,
    isError,
    error,
    refetch,
  };
}

