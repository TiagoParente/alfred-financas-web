// ─── Tipos de Autenticação ────────────────────────────────────────────────────

export interface SolicitarCodigoPayload {
  email: string;
}

export interface VerificarCodigoPayload {
  email: string;
  codigo: string;
}

export interface VerificarCodigoResponse {
  token: string;
  usuario: {
    id: number;
    nome: string;
    email: string;
  };
}

export interface ApiError {
  message: string;
  errors?: Record<string, string[]>;
}
