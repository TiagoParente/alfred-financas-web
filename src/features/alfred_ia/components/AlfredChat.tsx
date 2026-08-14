"use client";

import { useState, useRef, useEffect } from "react";
import Image from "next/image";
import { useAlfredIa } from "../hooks/useAlfredIa";
import {
  Sparkles,
  Send,
  Plus,
  Trash2,
  MessageSquare,
  User,
  Loader2,
  TrendingUp,
  CreditCard,
  CalendarClock,
  ShieldCheck,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

interface AlfredChatProps {
  familiaId?: number;
}

const sugestoesRapidas = [
  {
    label: "Qual meu saldo disponível?",
    icone: ShieldCheck,
    prompt: "Qual o saldo livre e o saldo reservado atualmente na minha conta?",
  },
  {
    label: "Maiores gastos do mês",
    icone: TrendingUp,
    prompt: "Quais são as principais categorias de despesas da família neste mês?",
  },
  {
    label: "Próximos vencimentos",
    icone: CalendarClock,
    prompt: "Tenho alguma conta ou fatura a vencer nos próximos 15 dias?",
  },
  {
    label: "Resumo da reserva",
    icone: CreditCard,
    prompt: "Como está o andamento da minha reserva de emergência e metas?",
  },
];

export function AlfredChat({ familiaId }: AlfredChatProps) {
  const {
    conversas,
    conversaAtivaId,
    mensagens,
    enviando,
    enviarMensagem,
    carregarMensagensConversa,
    novaConversa,
    deletarConversa,
  } = useAlfredIa(familiaId);

  const [input, setInput] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [mensagens, enviando]);

  const handleSend = (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!input.trim() || enviando) return;
    const text = input;
    setInput("");
    enviarMensagem(text);
  };

  const handlePromptChip = (promptText: string) => {
    if (enviando) return;
    enviarMensagem(promptText);
  };

  return (
    <div className="flex flex-col lg:flex-row h-[calc(100vh-8.5rem)] rounded-2xl border border-border/40 bg-card overflow-hidden shadow-sm">
      {/* Sidebar de Histórico de Conversas */}
      <div className="w-full lg:w-72 border-r border-border/40 bg-muted/20 flex flex-col p-4 space-y-4">
        <Button
          onClick={novaConversa}
          className="w-full justify-start gap-2 bg-[#1F4E79] hover:bg-[#1F4E79]/90 text-white rounded-xl shadow-sm font-medium"
        >
          <Plus className="h-4 w-4" />
          <span>Nova Conversa</span>
        </Button>

        <div className="flex-1 overflow-hidden flex flex-col">
          <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider px-1 mb-2">
            Conversas Anteriores
          </p>

          <div className="flex-1 overflow-y-auto pr-2">
            <div className="space-y-1">
              {conversas.length === 0 ? (
                <p className="text-xs text-muted-foreground p-3 text-center italic">
                  Nenhuma conversa iniciada.
                </p>
              ) : (
                conversas.map((item) => {
                  const isSelected = conversaAtivaId === item.id;
                  return (
                    <div
                      key={item.id}
                      onClick={() => carregarMensagensConversa(item.id)}
                      className={cn(
                        "group flex items-center justify-between p-2.5 rounded-xl text-xs cursor-pointer transition-colors",
                        isSelected
                          ? "bg-[#1F4E79]/10 text-[#1F4E79] font-semibold border border-[#1F4E79]/20"
                          : "text-foreground/80 hover:bg-accent hover:text-foreground"
                      )}
                    >
                      <div className="flex items-center gap-2 truncate pr-2">
                        <MessageSquare className="h-3.5 w-3.5 shrink-0 text-[#1F4E79]" />
                        <span className="truncate">{item.titulo}</span>
                      </div>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={(e) => {
                          e.stopPropagation();
                          deletarConversa(item.id);
                        }}
                        className="h-6 w-6 opacity-0 group-hover:opacity-100 hover:text-destructive hover:bg-destructive/10 rounded-lg transition-opacity"
                      >
                        <Trash2 className="h-3 w-3" />
                      </Button>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Área Central de Chat */}
      <div className="flex-1 flex flex-col h-full bg-background/50">
        {/* Header do Chat */}
        <div className="flex items-center justify-between p-4 border-b border-border/40 bg-card">
          <div className="flex items-center gap-3">
            <div className="relative flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white border border-[#1F4E79]/20 shadow-sm overflow-hidden">
              <Image
                src="/images/brand/alfred.png"
                alt="Alfred IA"
                width={128}
                height={128}
                quality={95}
                className="h-full w-full object-cover"
              />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-sm font-bold text-foreground">Alfred</h3>
                <Badge variant="outline" className="text-[10px] px-2 py-0 border-[#1F4E79]/30 text-[#1F4E79] bg-[#1F4E79]/5 gap-1">
                  <Sparkles className="h-3 w-3" />
                  IA Proativa
                </Badge>
              </div>
              <p className="text-xs text-muted-foreground">
                Assessor Financeiro da Família
              </p>
            </div>
          </div>
        </div>

        {/* Lista de Mensagens */}
        <div className="flex-1 overflow-y-auto p-4">
          <div className="space-y-4 max-w-3xl mx-auto">
            {mensagens.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 text-center space-y-6">
                <div className="relative flex h-20 w-20 items-center justify-center rounded-3xl bg-white border border-[#1F4E79]/20 shadow-md p-1">
                  <Image
                    src="/images/brand/alfred.png"
                    alt="Alfred Logo"
                    width={256}
                    height={256}
                    quality={95}
                    className="h-full w-full object-cover rounded-2xl"
                  />
                </div>
                <div className="space-y-2 max-w-md">
                  <h3 className="text-lg font-bold text-foreground">
                    Olá! Sou o Alfred, seu assessor financeiro.
                  </h3>
                  <p className="text-xs text-muted-foreground leading-relaxed">
                    Estou aqui para ajudar sua família a entender os números, organizar despesas e alcançar metas com tranquilidade. Como posso ajudar hoje?
                  </p>
                </div>

                {/* Sugestões de Perguntas Rápidas */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5 w-full max-w-xl pt-4">
                  {sugestoesRapidas.map((chip, idx) => {
                    const ChipIcon = chip.icone;
                    return (
                      <button
                        key={idx}
                        onClick={() => handlePromptChip(chip.prompt)}
                        className="flex items-center gap-3 p-3 rounded-xl border border-border/60 bg-card hover:bg-accent/60 hover:border-[#1F4E79]/40 text-left transition-all group"
                      >
                        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-[#1F4E79]/10 text-[#1F4E79] group-hover:bg-[#1F4E79] group-hover:text-white transition-colors">
                          <ChipIcon className="h-4 w-4" />
                        </div>
                        <span className="text-xs font-medium text-foreground group-hover:text-[#1F4E79]">
                          {chip.label}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>
            ) : (
              mensagens.map((msg, index) => {
                const isUser = msg.papel === "user";
                return (
                  <div
                    key={index}
                    className={cn(
                      "flex items-start gap-3 text-sm",
                      isUser ? "flex-row-reverse" : "flex-row"
                    )}
                  >
                    <div
                      className={cn(
                        "flex h-8 w-8 shrink-0 items-center justify-center rounded-xl font-bold text-xs shadow-sm overflow-hidden",
                        isUser
                          ? "bg-accent text-foreground"
                          : "bg-white border border-[#1F4E79]/30 text-[#1F4E79]"
                      )}
                    >
                      {isUser ? (
                        <User className="h-4 w-4 text-muted-foreground" />
                      ) : (
                        <Image
                          src="/images/brand/alfred.png"
                          alt="Alfred"
                          width={64}
                          height={64}
                          className="h-full w-full object-cover"
                        />
                      )}
                    </div>

                    <div
                      className={cn(
                        "rounded-2xl px-4 py-3 max-w-[85%] text-sm leading-relaxed shadow-sm space-y-1",
                        isUser
                          ? "bg-[#1F4E79] text-white rounded-tr-none"
                          : "bg-card border border-border/60 text-foreground rounded-tl-none"
                      )}
                    >
                      <div
                        dangerouslySetInnerHTML={{
                          __html: msg.conteudo.replace(
                            /\*\*(.*?)\*\*/g,
                            "<strong>$1</strong>"
                          ),
                        }}
                      />
                    </div>
                  </div>
                );
              })
            )}

            {enviando && (
              <div className="flex items-start gap-3 text-sm">
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-white border border-[#1F4E79]/30 overflow-hidden shadow-sm">
                  <Image
                    src="/images/brand/alfred.png"
                    alt="Alfred"
                    width={64}
                    height={64}
                    className="h-full w-full object-cover"
                  />
                </div>
                <div className="rounded-2xl rounded-tl-none px-4 py-3 bg-card border border-border/60 text-foreground text-xs flex items-center gap-2">
                  <Loader2 className="h-4 w-4 animate-spin text-[#1F4E79]" />
                  <span className="text-muted-foreground">
                    Alfred está consultando os dados financeiros da família...
                  </span>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>
        </div>

        {/* Input de Mensagem */}
        <div className="p-4 border-t border-border/40 bg-card">
          <form
            onSubmit={handleSend}
            className="flex items-center gap-2 max-w-3xl mx-auto"
          >
            <Input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Digite sua mensagem para o Alfred..."
              disabled={enviando}
              className="rounded-xl text-sm border-border/60 focus-visible:ring-[#1F4E79]"
            />
            <Button
              type="submit"
              disabled={!input.trim() || enviando}
              className="bg-[#1F4E79] hover:bg-[#1F4E79]/90 text-white rounded-xl px-4 shadow-sm"
            >
              {enviando ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Send className="h-4 w-4" />
              )}
            </Button>
          </form>
        </div>
      </div>
    </div>
  );
}
