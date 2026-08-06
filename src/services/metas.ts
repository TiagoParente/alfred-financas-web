import { api } from "@/lib/api";
import {
  AtualizarMetaPayload,
  CriarMetaPayload,
  CriarMovimentacaoInvestimentoPayload,
  ListarMetasResponse,
  Meta,
  MovimentacaoInvestimento,
  ResumoReservas,
  StatusMeta,
} from "@/types/metas";

export const metaService = {
  /**
   * Lista as metas da família ativa com resumo financeiro.
   * GET /v1/metas
   */
  async listar(
    familiaId?: number,
    status?: StatusMeta
  ): Promise<ListarMetasResponse> {
    const headers: Record<string, string> = {};
    if (familiaId) {
      headers["X-Familia-Id"] = familiaId.toString();
    }

    const params: Record<string, string> = {};
    if (status) {
      params.status = status;
    }

    const { data } = await api.get<{ data: ListarMetasResponse }>("/v1/metas", {
      headers,
      params,
    });
    return data.data;
  },

  /**
   * Cria uma nova meta na família ativa.
   * POST /v1/metas
   */
  async criar(
    payload: CriarMetaPayload,
    familiaId?: number
  ): Promise<Meta> {
    const headers: Record<string, string> = {};
    if (familiaId) {
      headers["X-Familia-Id"] = familiaId.toString();
    }

    const { data } = await api.post<{ data: Meta }>("/v1/metas", payload, {
      headers,
    });
    return data.data;
  },

  /**
   * Obtém detalhes de uma meta específica.
   * GET /v1/metas/{id}
   */
  async obter(id: number): Promise<Meta> {
    const { data } = await api.get<{ data: Meta }>(`/v1/metas/${id}`);
    return data.data;
  },

  /**
   * Atualiza dados de uma meta existente.
   * PUT /v1/metas/{id}
   */
  async atualizar(
    id: number,
    payload: AtualizarMetaPayload
  ): Promise<Meta> {
    const { data } = await api.put<{ data: Meta }>(
      `/v1/metas/${id}`,
      payload
    );
    return data.data;
  },

  /**
   * Remove (soft delete) uma meta.
   * DELETE /v1/metas/{id}
   */
  async deletar(id: number): Promise<void> {
    await api.delete(`/v1/metas/${id}`);
  },

  /**
   * Retorna apenas o resumo de reservas e metas da família ativa.
   * GET /v1/metas/resumo-reservas
   */
  async resumoReservas(familiaId?: number): Promise<ResumoReservas> {
    const headers: Record<string, string> = {};
    if (familiaId) {
      headers["X-Familia-Id"] = familiaId.toString();
    }

    const { data } = await api.get<{ data: ResumoReservas }>(
      "/v1/metas/resumo-reservas",
      { headers }
    );
    return data.data;
  },
};

export const movimentacaoInvestimentoService = {
  /**
   * Lista movimentações de investimento da família.
   * GET /v1/movimentacoes-investimento
   */
  async listar(
    familiaId?: number,
    filters?: { meta_id?: number; conta_bancaria_id?: number }
  ): Promise<MovimentacaoInvestimento[]> {
    const headers: Record<string, string> = {};
    if (familiaId) {
      headers["X-Familia-Id"] = familiaId.toString();
    }

    const params: Record<string, unknown> = {};
    if (filters?.meta_id) {
      params.meta_id = filters.meta_id;
    }
    if (filters?.conta_bancaria_id) {
      params.conta_bancaria_id = filters.conta_bancaria_id;
    }

    const { data } = await api.get<{ data: MovimentacaoInvestimento[] }>(
      "/v1/movimentacoes-investimento",
      { headers, params }
    );
    return data.data;
  },

  /**
   * Registra um novo aporte ou resgate.
   * POST /v1/movimentacoes-investimento
   */
  async registrar(
    payload: CriarMovimentacaoInvestimentoPayload,
    familiaId?: number
  ): Promise<MovimentacaoInvestimento> {
    const headers: Record<string, string> = {};
    if (familiaId) {
      headers["X-Familia-Id"] = familiaId.toString();
    }

    const { data } = await api.post<{ data: MovimentacaoInvestimento }>(
      "/v1/movimentacoes-investimento",
      payload,
      { headers }
    );
    return data.data;
  },

  /**
   * Exclui uma movimentação de investimento e reverte saldos.
   * DELETE /v1/movimentacoes-investimento/{id}
   */
  async deletar(id: number): Promise<void> {
    await api.delete(`/v1/movimentacoes-investimento/${id}`);
  },
};
