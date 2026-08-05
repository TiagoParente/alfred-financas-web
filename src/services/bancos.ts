import { api } from "@/lib/api";
import { Banco } from "@/types/bancos";

export const bancoService = {
  /**
   * Lista os bancos cadastrados e ativos no sistema.
   * GET /v1/bancos
   */
  async listar(): Promise<Banco[]> {
    const { data } = await api.get<{ data: Banco[] }>("/v1/bancos");
    return data.data;
  },
};
