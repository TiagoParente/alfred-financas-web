"use client";

import { useState, useEffect } from "react";
import { PerfilUsuario } from "@/types/perfil";

export const USER_UPDATED_EVENT = "alfred_user_updated";

export function usePerfil() {
  const [usuario, setUsuario] = useState<PerfilUsuario | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const savedUser = localStorage.getItem("alfred_user");
    if (savedUser) {
      try {
        setUsuario(JSON.parse(savedUser));
      } catch {
        setUsuario(null);
      }
    }
    setIsLoading(false);

    const handleUserUpdate = (event: Event) => {
      const customEvent = event as CustomEvent<PerfilUsuario>;
      if (customEvent.detail) {
        setUsuario(customEvent.detail);
      } else if (typeof window !== "undefined") {
        const savedUser = localStorage.getItem("alfred_user");
        if (savedUser) {
          try {
            setUsuario(JSON.parse(savedUser));
          } catch {
            setUsuario(null);
          }
        }
      }
    };

    window.addEventListener(USER_UPDATED_EVENT, handleUserUpdate);
    return () => {
      window.removeEventListener(USER_UPDATED_EVENT, handleUserUpdate);
    };
  }, []);

  const atualizarNome = async (novoNome: string): Promise<PerfilUsuario> => {
    if (typeof window === "undefined" || !usuario) {
      throw new Error("Perfil do usuário não encontrado na sessão.");
    }

    const usuarioAtualizado: PerfilUsuario = {
      ...usuario,
      nome: novoNome.trim(),
    };

    localStorage.setItem("alfred_user", JSON.stringify(usuarioAtualizado));
    setUsuario(usuarioAtualizado);

    // Dispara evento para sincronizar Header e outros componentes consumidores
    window.dispatchEvent(
      new CustomEvent(USER_UPDATED_EVENT, { detail: usuarioAtualizado })
    );

    return usuarioAtualizado;
  };

  return {
    usuario,
    isLoading,
    atualizarNome,
  };
}
