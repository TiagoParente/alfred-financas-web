import { api } from "@/lib/api";
import {
  AtualizarFamiliaPayload,
  ConvidarMembroPayload,
  ConviteFamilia,
  CriarFamiliaPayload,
  Familia,
  MembroFamilia,
} from "@/types/familias";

export const familiaService = {
  /**
   * Lista todas as famílias do usuário autenticado.
   * GET /v1/familias
   */
  async listar(): Promise<Familia[]> {
    const { data } = await api.get<{ data: Familia[] }>("/v1/familias");
    return data.data;
  },

  /**
   * Cria uma nova família para o usuário.
   * POST /v1/familias
   */
  async criar(payload: CriarFamiliaPayload): Promise<Familia> {
    const { data } = await api.post<{ data: Familia }>(
      "/v1/familias",
      payload
    );
    return data.data;
  },

  /**
   * Obtém detalhes de uma família.
   * GET /v1/familias/{id}
   */
  async obter(id: number): Promise<Familia> {
    const { data } = await api.get<{ data: Familia }>(`/v1/familias/${id}`);
    return data.data;
  },

  /**
   * Atualiza uma família.
   * PUT /v1/familias/{id}
   */
  async atualizar(
    id: number,
    payload: AtualizarFamiliaPayload
  ): Promise<Familia> {
    const { data } = await api.put<{ data: Familia }>(
      `/v1/familias/${id}`,
      payload
    );
    return data.data;
  },

  /**
   * Lista os membros de uma família.
   * GET /v1/familias/{id}/membros
   */
  async listarMembros(familiaId: number): Promise<MembroFamilia[]> {
    const { data } = await api.get<{ data: MembroFamilia[] }>(
      `/v1/familias/${familiaId}/membros`
    );
    return data.data;
  },

  /**
   * Lista o histórico de convites de uma família.
   * GET /v1/familias/{id}/convites
   */
  async listarConvites(familiaId: number): Promise<ConviteFamilia[]> {
    const { data } = await api.get<{ data: ConviteFamilia[] }>(
      `/v1/familias/${familiaId}/convites`
    );
    return data.data;
  },

  /**
   * Convida um membro para a família por e-mail.
   * POST /v1/familias/{id}/membros
   */
  async convidarMembro(
    familiaId: number,
    payload: ConvidarMembroPayload
  ): Promise<ConviteFamilia> {
    const { data } = await api.post<{ data: ConviteFamilia }>(
      `/v1/familias/${familiaId}/membros`,
      payload
    );
    return data.data;
  },

  /**
   * Cancela um convite pendente.
   * DELETE /v1/familias/{id}/convites/{conviteId}
   */
  async cancelarConvite(familiaId: number, conviteId: number): Promise<void> {
    await api.delete(`/v1/familias/${familiaId}/convites/${conviteId}`);
  },

  /**
   * Remove um membro da família.
   * DELETE /v1/familias/{id}/membros/{membroId}
   */
  async removerMembro(familiaId: number, membroId: number): Promise<void> {
    await api.delete(`/v1/familias/${familiaId}/membros/${membroId}`);
  },

  /**
   * Obtém convites pendentes recebidos pelo usuário autenticado.
   * GET /v1/convites/pendentes
   */
  async obterConvitesPendentes(): Promise<ConviteFamilia[]> {
    const { data } = await api.get<{ data: ConviteFamilia[] }>(
      "/v1/convites/pendentes"
    );
    return data.data;
  },

  /**
   * Aceita um convite de família.
   * POST /v1/convites/{conviteId}/aceitar
   */
  async aceitarConvite(conviteId: number): Promise<void> {
    await api.post(`/v1/convites/${conviteId}/aceitar`);
  },

  /**
   * Recusa um convite de família.
   * POST /v1/convites/{conviteId}/recusar
   */
  async recusarConvite(conviteId: number): Promise<void> {
    await api.post(`/v1/convites/${conviteId}/recusar`);
  },
};


