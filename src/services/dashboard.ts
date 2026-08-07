import { api } from "@/lib/api";
import { DashboardData } from "@/types/dashboard";

export const dashboardService = {
  /**
   * Obtém os dados consolidados do dashboard para a família ativa.
   * GET /v1/dashboard
   */
  async obter(
    mes?: number,
    ano?: number,
    familiaId?: number
  ): Promise<DashboardData> {
    const headers: Record<string, string> = {};
    if (familiaId) {
      headers["X-Familia-Id"] = familiaId.toString();
    }

    const params: Record<string, number> = {};
    if (mes) params.mes = mes;
    if (ano) params.ano = ano;

    const { data } = await api.get<{ data: DashboardData }>("/v1/dashboard", {
      headers,
      params,
    });

    return data.data;
  },
};
