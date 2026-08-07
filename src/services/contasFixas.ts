import { api } from "@/lib/api";
import {
  AtualizarContaFixaPayload,
  ContaFixa,
  CriarContaFixaPayload,
  ResultadoGerarLancamentos,
} from "@/types/contasFixas";

export const contaFixaService = {
  /**
   * Lista as contas fixas da família ativa.
   * GET /v1/contas-fixas
   */
  async listar(
    familiaId?: number | null,
    apenasAtivas?: boolean
  ): Promise<ContaFixa[]> {
    const headers: Record<string, string> = {};
    if (familiaId) {
      headers["X-Familia-Id"] = familiaId.toString();
    }

    const params: Record<string, boolean> = {};
    if (apenasAtivas !== undefined) {
      params.apenas_ativas = apenasAtivas;
    }

    const { data } = await api.get<{ data: ContaFixa[] }>("/v1/contas-fixas", {
      headers,
      params,
    });
    return data.data;
  },

  /**
   * Obtém detalhes de uma conta fixa específica.
   * GET /v1/contas-fixas/{id}
   */
  async obter(id: number): Promise<ContaFixa> {
    const { data } = await api.get<{ data: ContaFixa }>(`/v1/contas-fixas/${id}`);
    return data.data;
  },

  /**
   * Cria uma nova conta fixa.
   * POST /v1/contas-fixas
   */
  async criar(
    payload: CriarContaFixaPayload,
    familiaId?: number | null
  ): Promise<ContaFixa> {
    const headers: Record<string, string> = {};
    if (familiaId) {
      headers["X-Familia-Id"] = familiaId.toString();
    }

    const { data } = await api.post<{ data: ContaFixa }>(
      "/v1/contas-fixas",
      payload,
      { headers }
    );
    return data.data;
  },

  /**
   * Atualiza dados de uma conta fixa.
   * PUT /v1/contas-fixas/{id}
   */
  async atualizar(
    id: number,
    payload: AtualizarContaFixaPayload
  ): Promise<ContaFixa> {
    const { data } = await api.put<{ data: ContaFixa }>(
      `/v1/contas-fixas/${id}`,
      payload
    );
    return data.data;
  },

  /**
   * Alterna o status (ativa/inativa) de uma conta fixa.
   * PATCH /v1/contas-fixas/{id}/alternar-status
   */
  async alternarStatus(id: number): Promise<ContaFixa> {
    const { data } = await api.patch<{ data: ContaFixa }>(
      `/v1/contas-fixas/${id}/alternar-status`
    );
    return data.data;
  },

  /**
   * Remove (soft delete) uma conta fixa.
   * DELETE /v1/contas-fixas/{id}
   */
  async deletar(id: number): Promise<void> {
    await api.delete(`/v1/contas-fixas/${id}`);
  },

  /**
   * Processa a geração de lançamentos de movimentações recorrentes para a família.
   * POST /v1/contas-fixas/gerar-lancamentos
   */
  async gerarLancamentos(
    familiaId?: number | null
  ): Promise<ResultadoGerarLancamentos> {
    const headers: Record<string, string> = {};
    if (familiaId) {
      headers["X-Familia-Id"] = familiaId.toString();
    }

    const { data } = await api.post<{ data: ResultadoGerarLancamentos }>(
      "/v1/contas-fixas/gerar-lancamentos",
      {},
      { headers }
    );
    return data.data;
  },
};
