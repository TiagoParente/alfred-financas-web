import { api } from "@/lib/api";
import {
  AtualizarContaBancariaPayload,
  ContaBancaria,
  CriarContaBancariaPayload,
  ListarContasBancariasResponse,
} from "@/types/contas";

export const contaBancariaService = {
  /**
   * Lista as contas bancárias da família ativa com resumo de saldos.
   * GET /v1/contas-bancarias
   */
  async listar(familiaId?: number): Promise<ListarContasBancariasResponse> {
    const headers: Record<string, string> = {};
    if (familiaId) {
      headers["X-Familia-Id"] = familiaId.toString();
    }

    const { data } = await api.get<{ data: ListarContasBancariasResponse }>(
      "/v1/contas-bancarias",
      { headers }
    );
    return data.data;
  },

  /**
   * Cria uma nova conta bancária na família ativa.
   * POST /v1/contas-bancarias
   */
  async criar(
    payload: CriarContaBancariaPayload,
    familiaId?: number
  ): Promise<ContaBancaria> {
    const headers: Record<string, string> = {};
    if (familiaId) {
      headers["X-Familia-Id"] = familiaId.toString();
    }

    const { data } = await api.post<{ data: ContaBancaria }>(
      "/v1/contas-bancarias",
      payload,
      { headers }
    );
    return data.data;
  },

  /**
   * Obtém detalhes de uma conta bancária.
   * GET /v1/contas-bancarias/{id}
   */
  async obter(id: number): Promise<ContaBancaria> {
    const { data } = await api.get<{ data: ContaBancaria }>(
      `/v1/contas-bancarias/${id}`
    );
    return data.data;
  },

  /**
   * Atualiza dados de uma conta bancária.
   * PUT /v1/contas-bancarias/{id}
   */
  async atualizar(
    id: number,
    payload: AtualizarContaBancariaPayload
  ): Promise<ContaBancaria> {
    const { data } = await api.put<{ data: ContaBancaria }>(
      `/v1/contas-bancarias/${id}`,
      payload
    );
    return data.data;
  },

  /**
   * Remove (soft delete) uma conta bancária.
   * DELETE /v1/contas-bancarias/{id}
   */
  async deletar(id: number): Promise<void> {
    await api.delete(`/v1/contas-bancarias/${id}`);
  },
};
