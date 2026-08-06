import { api } from "@/lib/api";
import {
  AtualizarCartaoCreditoPayload,
  CartaoCredito,
  CriarCartaoCreditoPayload,
  DetalhesFaturaResponse,
  ListarCartoesCreditoResponse,
} from "@/types/cartoes";

export const cartaoCreditoService = {
  /**
   * Lista os cartões de crédito da família ativa com resumo consolidado de limites e faturas.
   * GET /v1/cartoes-credito
   */
  async listar(familiaId?: number): Promise<ListarCartoesCreditoResponse> {
    const headers: Record<string, string> = {};
    if (familiaId) {
      headers["X-Familia-Id"] = familiaId.toString();
    }

    const { data } = await api.get<{ data: ListarCartoesCreditoResponse }>(
      "/v1/cartoes-credito",
      { headers }
    );
    return data.data;
  },

  /**
   * Cria um novo cartão de crédito na família ativa.
   * POST /v1/cartoes-credito
   */
  async criar(
    payload: CriarCartaoCreditoPayload,
    familiaId?: number
  ): Promise<CartaoCredito> {
    const headers: Record<string, string> = {};
    if (familiaId) {
      headers["X-Familia-Id"] = familiaId.toString();
    }

    const { data } = await api.post<{ data: CartaoCredito }>(
      "/v1/cartoes-credito",
      payload,
      { headers }
    );
    return data.data;
  },

  /**
   * Obtém detalhes de um cartão de crédito.
   * GET /v1/cartoes-credito/{id}
   */
  async obter(id: number): Promise<CartaoCredito> {
    const { data } = await api.get<{ data: CartaoCredito }>(
      `/v1/cartoes-credito/${id}`
    );
    return data.data;
  },

  /**
   * Atualiza dados de um cartão de crédito.
   * PUT /v1/cartoes-credito/{id}
   */
  async atualizar(
    id: number,
    payload: AtualizarCartaoCreditoPayload
  ): Promise<CartaoCredito> {
    const { data } = await api.put<{ data: CartaoCredito }>(
      `/v1/cartoes-credito/${id}`,
      payload
    );
    return data.data;
  },

  /**
   * Remove (soft delete) um cartão de crédito.
   * DELETE /v1/cartoes-credito/{id}
   */
  async deletar(id: number): Promise<void> {
    await api.delete(`/v1/cartoes-credito/${id}`);
  },

  /**
   * Obtém os detalhes da fatura do cartão para um mês/ano de referência (ex: "2026-08").
   * GET /v1/cartoes-credito/{id}/fatura?mes_ano=YYYY-MM
   */
  async obterFatura(
    id: number,
    mesAno?: string
  ): Promise<DetalhesFaturaResponse> {
    const params: Record<string, string> = {};
    if (mesAno) {
      params["mes_ano"] = mesAno;
    }

    const { data } = await api.get<{ data: DetalhesFaturaResponse }>(
      `/v1/cartoes-credito/${id}/fatura`,
      { params }
    );
    return data.data;
  },
};
