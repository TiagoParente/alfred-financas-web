import { api } from "@/lib/api";
import type {
  SolicitarCodigoPayload,
  VerificarCodigoPayload,
  VerificarCodigoResponse,
} from "@/types/auth";

export const authService = {
  /**
   * Solicita o envio do código OTP de 6 dígitos para o e-mail informado.
   * POST /v1/auth/solicitar-codigo
   */
  async solicitarCodigo(payload: SolicitarCodigoPayload): Promise<void> {
    await api.post("/v1/auth/solicitar-codigo", payload);
  },

  /**
   * Verifica o código OTP e retorna o Bearer Token de acesso.
   * POST /v1/auth/verificar-codigo
   */
  async verificarCodigo(
    payload: VerificarCodigoPayload
  ): Promise<VerificarCodigoResponse> {
    const { data } = await api.post<{ data: VerificarCodigoResponse }>(
      "/v1/auth/verificar-codigo",
      payload
    );
    return data.data;
  },
};
