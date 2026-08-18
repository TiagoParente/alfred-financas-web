import { api } from "@/lib/api";
import { ProjecaoData } from "@/types/projecoes";

export const projecoesService = {
  /**
   * Obtém os dados completos de projeção financeira da família.
   * GET /v1/projecoes
   */
  async obter(
    meses: number = 6,
    mes?: number,
    ano?: number,
    regime: string = "caixa",
    familiaId?: number
  ): Promise<ProjecaoData> {
    const headers: Record<string, string> = {};
    if (familiaId) {
      headers["X-Familia-Id"] = familiaId.toString();
    }

    const params: Record<string, string | number> = {
      meses,
      regime,
    };
    if (mes) params.mes = mes;
    if (ano) params.ano = ano;

    const { data } = await api.get<{ data: ProjecaoData }>("/v1/projecoes", {
      headers,
      params,
    });

    return data.data;
  },
};
