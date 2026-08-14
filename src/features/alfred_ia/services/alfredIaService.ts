import { api } from "@/lib/api";
import { AlfredConversa, AlfredIaInsights, ChatResponse } from "@/types/alfredIa";

export const alfredIaService = {
  async enviarMensagem(mensagem: string, conversaId?: number, familiaId?: number): Promise<ChatResponse> {
    const headers = familiaId ? { "X-Familia-Id": familiaId.toString() } : {};
    const { data } = await api.post<{ data: ChatResponse }>(
      "/v1/alfred-ia/chat",
      { mensagem, conversa_id: conversaId },
      { headers }
    );
    return data.data;
  },

  async listarConversas(familiaId?: number): Promise<AlfredConversa[]> {
    const headers = familiaId ? { "X-Familia-Id": familiaId.toString() } : {};
    const { data } = await api.get<{ data: AlfredConversa[] }>("/v1/alfred-ia/conversas", { headers });
    return data.data;
  },

  async obterConversa(id: number, familiaId?: number): Promise<AlfredConversa> {
    const headers = familiaId ? { "X-Familia-Id": familiaId.toString() } : {};
    const { data } = await api.get<{ data: AlfredConversa }>(`/v1/alfred-ia/conversas/${id}`, { headers });
    return data.data;
  },

  async deletarConversa(id: number, familiaId?: number): Promise<void> {
    const headers = familiaId ? { "X-Familia-Id": familiaId.toString() } : {};
    await api.delete(`/v1/alfred-ia/conversas/${id}`, { headers });
  },

  async obterInsights(familiaId?: number): Promise<AlfredIaInsights> {
    const headers = familiaId ? { "X-Familia-Id": familiaId.toString() } : {};
    const { data } = await api.get<{ data: AlfredIaInsights }>("/v1/alfred-ia/insights", { headers });
    return data.data;
  },
};
