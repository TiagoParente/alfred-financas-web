"use client";

import { useState, useCallback, useEffect } from "react";
import { alfredIaService } from "../services/alfredIaService";
import { AlfredConversa, AlfredMensagem } from "@/types/alfredIa";

export function useAlfredIa(familiaIdActive?: number) {
  const [conversas, setConversas] = useState<AlfredConversa[]>([]);
  const [conversaAtivaId, setConversaAtivaId] = useState<number | null>(null);
  const [mensagens, setMensagens] = useState<AlfredMensagem[]>([]);
  const [loading, setLoading] = useState(false);
  const [enviando, setEnviando] = useState(false);

  const carregarConversas = useCallback(async () => {
    try {
      setLoading(true);
      const data = await alfredIaService.listarConversas(familiaIdActive);
      setConversas(data);
    } catch (err) {
      console.error("Erro ao carregar conversas do Alfred IA", err);
    } finally {
      setLoading(false);
    }
  }, [familiaIdActive]);

  const carregarMensagensConversa = useCallback(
    async (id: number) => {
      try {
        setLoading(true);
        const data = await alfredIaService.obterConversa(id, familiaIdActive);
        setConversaAtivaId(data.id);
        setMensagens(data.mensagens || []);
      } catch (err) {
        console.error("Erro ao carregar histórico de mensagens", err);
      } finally {
        setLoading(false);
      }
    },
    [familiaIdActive]
  );

  const enviarMensagem = async (texto: string) => {
    if (!texto.trim() || enviando) return;

    // Criar mensagem otimista do usuário
    const tempUserMsg: AlfredMensagem = {
      id: Date.now(),
      alfred_conversa_id: conversaAtivaId || 0,
      papel: "user",
      conteudo: texto,
      created_at: new Date().toISOString(),
    };

    setMensagens((prev) => [...prev, tempUserMsg]);
    setEnviando(true);

    try {
      const resp = await alfredIaService.enviarMensagem(
        texto,
        conversaAtivaId || undefined,
        familiaIdActive
      );

      setConversaAtivaId(resp.conversa_id);

      // Substituir/Atualizar mensagens com as retornadas pelo servidor
      setMensagens((prev) => [
        ...prev.filter((m) => m.id !== tempUserMsg.id),
        resp.mensagem_usuario,
        resp.mensagem_assistente,
      ]);

      await carregarConversas();
    } catch (err) {
      console.error("Erro ao enviar mensagem para o Alfred IA", err);
      // Notificar falha
      setMensagens((prev) => [
        ...prev,
        {
          id: Date.now() + 1,
          alfred_conversa_id: conversaAtivaId || 0,
          papel: "assistant",
          conteudo: "Desculpe, ocorreu uma instabilidade ao processar sua solicitação. Por favor, tente novamente em instantes.",
          created_at: new Date().toISOString(),
        },
      ]);
    } finally {
      setEnviando(false);
    }
  };

  const novaConversa = () => {
    setConversaAtivaId(null);
    setMensagens([]);
  };

  const deletarConversa = async (id: number) => {
    try {
      await alfredIaService.deletarConversa(id, familiaIdActive);
      if (conversaAtivaId === id) {
        novaConversa();
      }
      await carregarConversas();
    } catch (err) {
      console.error("Erro ao deletar conversa", err);
    }
  };

  useEffect(() => {
    carregarConversas();
  }, [carregarConversas]);

  return {
    conversas,
    conversaAtivaId,
    mensagens,
    loading,
    enviando,
    enviarMensagem,
    carregarMensagensConversa,
    novaConversa,
    deletarConversa,
    carregarConversas,
  };
}
