import { api } from "@/lib/api";
import {
  AtualizarFamiliaPayload,
  CriarFamiliaPayload,
  Familia,
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
};
