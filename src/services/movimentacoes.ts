import { api } from "@/lib/api";
import {
  AtualizarMovimentacaoPayload,
  CriarMovimentacaoPayload,
  FiltroMovimentacaoParams,
  Movimentacao,
  MovimentacoesPaginadasResponse,
} from "@/types/movimentacoes";

export const movimentacaoService = {
  /**
   * Lista movimentações com suporte a filtros e paginação.
   * GET /v1/movimentacoes
   */
  async listar(
    familiaId?: number | null,
    params?: FiltroMovimentacaoParams
  ): Promise<MovimentacoesPaginadasResponse> {
    const headers: Record<string, string> = {};
    if (familiaId) {
      headers["X-Familia-Id"] = familiaId.toString();
    }

    const queryParams: Record<string, string | number | boolean> = {};
    if (params?.data_inicio) queryParams.data_inicio = params.data_inicio;
    if (params?.data_fim) queryParams.data_fim = params.data_fim;
    if (params?.tipo) queryParams.tipo = params.tipo;
    if (params?.status) queryParams.status = params.status;
    if (params?.categoria_id) queryParams.categoria_id = params.categoria_id;
    if (params?.conta_bancaria_id) queryParams.conta_bancaria_id = params.conta_bancaria_id;
    if (params?.cartao_credito_id) queryParams.cartao_credito_id = params.cartao_credito_id;
    if (params?.busca) queryParams.busca = params.busca;
    if (params?.per_page) queryParams.per_page = params.per_page;
    if (params?.page) queryParams.page = params.page;

    const { data } = await api.get<MovimentacoesPaginadasResponse>("/v1/movimentacoes", {
      headers,
      params: queryParams,
    });

    return data;
  },

  /**
   * Obtém os detalhes de uma movimentação por ID.
   * GET /v1/movimentacoes/{id}
   */
  async obter(id: number): Promise<Movimentacao> {
    const { data } = await api.get<{ data: Movimentacao }>(`/v1/movimentacoes/${id}`);
    return data.data;
  },

  /**
   * Cria uma nova movimentação.
   * POST /v1/movimentacoes
   */
  async criar(
    payload: CriarMovimentacaoPayload,
    familiaId?: number | null
  ): Promise<Movimentacao> {
    const headers: Record<string, string> = {};
    if (familiaId) {
      headers["X-Familia-Id"] = familiaId.toString();
    }

    const { data } = await api.post<{ data: Movimentacao }>(
      "/v1/movimentacoes",
      payload,
      { headers }
    );

    return data.data;
  },

  /**
   * Atualiza uma movimentação existente.
   * PUT /v1/movimentacoes/{id}
   */
  async atualizar(
    id: number,
    payload: AtualizarMovimentacaoPayload
  ): Promise<Movimentacao> {
    const { data } = await api.put<{ data: Movimentacao }>(
      `/v1/movimentacoes/${id}`,
      payload
    );

    return data.data;
  },

  /**
   * Marca uma movimentação pendente como PAGA.
   * POST /v1/movimentacoes/{id}/pagar
   */
  async marcarComoPago(
    id: number,
    dataPagamento?: string
  ): Promise<Movimentacao> {
    const { data } = await api.post<{ data: Movimentacao }>(
      `/v1/movimentacoes/${id}/pagar`,
      { data_pagamento: dataPagamento }
    );

    return data.data;
  },

  /**
   * Exclui (soft delete) uma movimentação.
   * DELETE /v1/movimentacoes/{id}
   */
  async deletar(id: number): Promise<void> {
    await api.delete(`/v1/movimentacoes/${id}`);
  },
};
