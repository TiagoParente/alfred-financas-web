"use client";

import { useState, useEffect } from "react";
import { useFamilias } from "@/features/familias/hooks/useFamilias";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Sparkles, Users, ArrowRight, ShieldCheck, UserCheck } from "lucide-react";

export function BoasVindasFamiliaModal() {
  const { familiaAtiva, atualizarFamilia, isAtualizandoFamilia, isLoading } =
    useFamilias();

  const [nomeFamilia, setNomeFamilia] = useState("");
  const [erro, setErro] = useState("");

  // O modal exibe apenas se o usuário tiver uma família ativa ainda não configurada
  const deveExibir =
    !isLoading &&
    familiaAtiva !== null &&
    (familiaAtiva.configurada === false ||
      familiaAtiva.nome.startsWith("Família de "));

  useEffect(() => {
    if (familiaAtiva && familiaAtiva.nome && !familiaAtiva.nome.startsWith("Família de ")) {
      setNomeFamilia(familiaAtiva.nome);
    } else {
      setNomeFamilia("");
    }
  }, [familiaAtiva]);

  if (!deveExibir) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErro("");

    const nomeFormatado = nomeFamilia.trim();
    if (!nomeFormatado) {
      setErro("Por favor, informe um nome para a sua família.");
      return;
    }

    if (nomeFormatado.length < 3) {
      setErro("O nome da família deve conter no mínimo 3 caracteres.");
      return;
    }

    try {
      if (familiaAtiva) {
        await atualizarFamilia({
          id: familiaAtiva.id,
          nome: nomeFormatado,
        });
      }
    } catch {
      setErro("Ocorreu um problema ao salvar o nome da família. Tente novamente.");
    }
  };

  return (
    <Dialog open={true}>
      <DialogContent
        showCloseButton={false}
        className="sm:max-w-[460px] p-0 overflow-hidden border border-border/80 shadow-[0_4px_16px_rgba(0,0,0,0.08)] rounded-[20px] bg-background"
      >
        {/* Banner de Boas-Vindas com Identidade do Alfred (Azul Petróleo #1F4E79) */}
        <div className="relative bg-[#1F4E79] p-6 text-white text-center flex flex-col items-center">
          {/* Avatar do Alfred */}
          <div className="h-14 w-14 rounded-full bg-white/10 backdrop-blur-md border border-white/20 flex items-center justify-center mb-3 shadow-sm">
            <UserCheck className="h-7 w-7 text-white" />
          </div>

          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/10 text-white/90 text-xs font-medium backdrop-blur-sm mb-2">
            <Sparkles className="h-3.5 w-3.5 text-amber-300" />
            <span>Assistente Alfred</span>
          </div>

          <DialogTitle className="text-xl font-bold text-white tracking-tight">
            Seja bem-vindo ao Alfred Finanças
          </DialogTitle>
          <DialogDescription className="text-slate-200 text-sm mt-1.5 max-w-sm leading-relaxed">
            Olá! Sou o Alfred, seu assessor financeiro. Para iniciarmos a organização do seu patrimônio com clareza e segurança, como gostaria de nomear seu espaço familiar?
          </DialogDescription>
        </div>

        {/* Formulário de Configuração */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div className="space-y-2">
            <Label
              htmlFor="nome-familia-boas-vindas"
              className="text-sm font-semibold text-foreground flex items-center gap-2"
            >
              <Users className="h-4 w-4 text-[#1F4E79]" />
              <span>Nome da sua Família / Espaço</span>
            </Label>
            <Input
              id="nome-familia-boas-vindas"
              placeholder="Ex: Família Silva, Finanças Pessoais..."
              value={nomeFamilia}
              onChange={(e) => setNomeFamilia(e.target.value)}
              className="h-11 rounded-[10px] border-border/80 focus:border-[#1F4E79] focus:ring-[#1F4E79] text-sm"
              autoFocus
              required
            />
            {erro ? (
              <p className="text-xs text-[#EF4444] font-medium">{erro}</p>
            ) : (
              <p className="text-xs text-muted-foreground">
                Você poderá convidar outros membros ou alterar este nome futuramente nas configurações.
              </p>
            )}
          </div>

          <Button
            type="submit"
            disabled={isAtualizandoFamilia || !nomeFamilia.trim()}
            className="w-full h-11 rounded-[10px] bg-[#1F4E79] hover:bg-[#153654] text-white font-medium text-sm transition-all flex items-center justify-center gap-2 shadow-sm hover:shadow disabled:opacity-50 cursor-pointer"
          >
            <span>{isAtualizandoFamilia ? "Salvando..." : "Salvar e Continuar"}</span>
            {!isAtualizandoFamilia && <ArrowRight className="h-4 w-4" />}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
