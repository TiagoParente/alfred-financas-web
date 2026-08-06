"use client";

import { CreditCard, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";

interface CartoesEmptyStateProps {
  onNovoCartao: () => void;
}

export function CartoesEmptyState({ onNovoCartao }: CartoesEmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-border/60 bg-card/30 p-12 text-center my-6">
      <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-[#1F4E79]/10 text-[#1F4E79] dark:text-blue-400 mb-4">
        <CreditCard className="h-8 w-8" />
      </div>
      <h3 className="text-lg font-bold text-foreground">
        Nenhum Cartão de Crédito Cadastrado
      </h3>
      <p className="mt-1.5 text-xs text-muted-foreground max-w-md leading-relaxed">
        Cadastre seus cartões de crédito para controlar limites, gerenciar datas de fechamento e vencimento, e acompanhar todas as faturas em um só lugar.
      </p>
      <Button
        onClick={onNovoCartao}
        className="mt-6 rounded-xl bg-[#1F4E79] hover:bg-[#1F4E79]/90 text-white gap-2"
      >
        <Plus className="h-4 w-4" />
        Cadastrar Primeiro Cartão
      </Button>
    </div>
  );
}
