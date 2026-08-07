import { api } from "@/lib/api";
import {
  AtualizarOrcamentoPayload,
  CriarOrcamentoPayload,
  ListarOrcamentosResponse,
  Orcamento,
  ResumoOrcamentos,
} from "@/types/orcamento";

export const orcamentosService = {
  /**
   * Lista os orçamentos da família ativa com resumo financeiro para o período.
   * GET /v1/orcamentos
   */
  async listar(
    mes?: number,
    ano?: number,
    familiaId?: number
  ): Promise<ListarOrcamentosResponse> {
    const headers: Record<string, string> = {};
    if (familiaId) {
      headers["X-Familia-Id"] = familiaId.toString();
    }

    const params: Record<string, number> = {};
    if (mes) params.mes = mes;
    if (ano) params.ano = ano;

    const { data } = await api.get<{ data: ListarOrcamentosResponse }>("/v1/orcamentos", {
      headers,
      params,
    });
    return data.data;
  },

  /**
   * Cria um novo orçamento na família ativa.
   * POST /v1/orcamentos
   */
  async criar(
    payload: CriarOrcamentoPayload,
    familiaId?: number
  ): Promise<Orcamento> {
    const headers: Record<string, string> = {};
    if (familiaId) {
      headers["X-Familia-Id"] = familiaId.toString();
    }

    const { data } = await api.post<{ data: Orcamento }>("/v1/orcamentos", payload, {
      headers,
    });
    return data.data;
  },

  /**
   * Obtém detalhes de um orçamento específico.
   * GET /v1/orcamentos/{id}
   */
  async obter(id: number): Promise<Orcamento> {
    const { data } = await api.get<{ data: Orcamento }>(`/v1/orcamentos/${id}`);
    return data.data;
  },

  /**
   * Atualiza dados de um orçamento existente.
   * PUT /v1/orcamentos/{id}
   */
  async atualizar(
    id: number,
    payload: AtualizarOrcamentoPayload
  ): Promise<Orcamento> {
    const { data } = await api.put<{ data: Orcamento }>(
      `/v1/orcamentos/${id}`,
      payload
    );
    return data.data;
  },

  /**
   * Remove (soft delete) um orçamento.
   * DELETE /v1/orcamentos/{id}
   */
  async deletar(id: number): Promise<void> {
    await api.delete(`/v1/orcamentos/${id}`);
  },

  /**
   * Retorna o resumo consolidado de orçamentos da família ativa.
   * GET /v1/orcamentos/resumo
   */
  async obterResumo(
    mes?: number,
    ano?: number,
    familiaId?: number
  ): Promise<ResumoOrcamentos> {
    const headers: Record<string, string> = {};
    if (familiaId) {
      headers["X-Familia-Id"] = familiaId.toString();
    }

    const params: Record<string, number> = {};
    if (mes) params.mes = mes;
    if (ano) params.ano = ano;

    const { data } = await api.get<{ data: ResumoOrcamentos }>(
      "/v1/orcamentos/resumo",
      { headers, params }
    );
    return data.data;
  },
};
