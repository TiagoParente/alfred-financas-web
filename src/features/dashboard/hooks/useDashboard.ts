"use client";

import { useQuery } from "@tanstack/react-query";
import { dashboardService } from "@/services/dashboard";

export function useDashboard(
  familiaId?: number | null,
  mes?: number,
  ano?: number
) {
  const queryKey = ["dashboard", familiaId, mes, ano];

  const { data, isLoading, isError, error, refetch } = useQuery({
    queryKey,
    queryFn: () => dashboardService.obter(mes, ano, familiaId ?? undefined),
    enabled: true,
  });

  return {
    dashboard: data,
    saldos: data?.saldos ?? {
      saldo_disponivel: 0,
      saldo_reservas: 0,
      saldo_total: 0,
      total_contas: 0,
    },
    mensal: data?.mensal ?? {
      mes: mes ?? new Date().getMonth() + 1,
      ano: ano ?? new Date().getFullYear(),
      total_receitas: 0,
      total_despesas: 0,
      balanco_mensal: 0,
      total_investimentos: 0,
    },
    proximosVencimentos: data?.proximos_vencimentos ?? [],
    resumoOrcamentos: data?.resumo_orcamentos,
    orcamentos: data?.orcamentos ?? [],
    resumoMetas: data?.resumo_metas,
    metas: data?.metas ?? [],
    evolucaoInvestimentos: data?.evolucao_investimentos,
    alfredInsights: data?.alfred_insights,
    isLoading,
    isError,
    error,
    refetch,
  };
}
