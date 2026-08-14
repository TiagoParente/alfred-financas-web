export interface AlfredMensagem {
  id: number;
  alfred_conversa_id: number;
  papel: "user" | "assistant" | "system";
  conteudo: string;
  tokens_utilizados?: number;
  created_at: string;
}

export interface AlfredConversa {
  id: number;
  familia_id: number;
  user_id: number;
  titulo: string;
  mensagens_count?: number;
  mensagens?: AlfredMensagem[];
  created_at: string;
  updated_at: string;
}

export interface ChatResponse {
  conversa_id: number;
  titulo: string;
  mensagem_usuario: AlfredMensagem;
  mensagem_assistente: AlfredMensagem;
}

export interface AlfredIaInsights {
  titulo: string;
  mensagens: string[];
  nivel_alerta: "normal" | "atencao" | "critico";
}
