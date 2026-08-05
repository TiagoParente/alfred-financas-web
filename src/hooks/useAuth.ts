"use client";

import { useMutation } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { authService } from "@/services/auth";
import type {
  SolicitarCodigoPayload,
  VerificarCodigoPayload,
} from "@/types/auth";
import axios from "axios";

export function useSolicitarCodigo() {
  return useMutation({
    mutationFn: (payload: SolicitarCodigoPayload) =>
      authService.solicitarCodigo(payload),
  });
}

export function useVerificarCodigo() {
  const router = useRouter();

  return useMutation({
    mutationFn: (payload: VerificarCodigoPayload) =>
      authService.verificarCodigo(payload),
    onSuccess: (data) => {
      localStorage.setItem("alfred_token", data.token);
      localStorage.setItem("alfred_user", JSON.stringify(data.usuario));
      router.push("/dashboard");
    },
  });
}

export function useLogout() {
  const router = useRouter();

  return async () => {
    try {
      await authService.logout();
    } catch {
      // Ignora erro de API no logout para garantir limpeza local
    } finally {
      localStorage.removeItem("alfred_token");
      localStorage.removeItem("alfred_user");
      localStorage.removeItem("alfred_familia_id");
      router.push("/entrar");
    }
  };
}

/**
 * Extrai a mensagem de erro de uma resposta da API.
 */
export function extrairMensagemErro(error: unknown): string {
  if (axios.isAxiosError(error)) {
    const data = error.response?.data;
    if (data?.message) return data.message;
    const firstError = Object.values(data?.errors ?? {})?.[0];
    if (Array.isArray(firstError)) return firstError[0];
  }
  return "Ocorreu um erro inesperado. Tente novamente.";
}
