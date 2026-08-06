"use client";

import { Target, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";

interface MetasEmptyStateProps {
  onCriarMeta: () => void;
  filtrosAtivos?: boolean;
}

export function MetasEmptyState({ onCriarMeta, filtrosAtivos = false }: MetasEmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center rounded-[24px] border border-dashed border-border/70 p-12 text-center bg-accent/10 space-y-4">
      <div className="flex h-16 w-16 items-center justify-center rounded-3xl bg-[#1F4E79]/10 text-[#1F4E79] shadow-inner">
        <Target className="h-8 w-8" />
      </div>

      <div className="space-y-1.5 max-w-md">
        <h3 className="text-lg font-bold text-foreground">
          {filtrosAtivos ? "Nenhuma meta encontrada no filtro" : "Nenhuma meta financeira cadastrada"}
        </h3>
        <p className="text-xs text-muted-foreground leading-relaxed">
          {filtrosAtivos
            ? "Não encontramos objetivos com o status selecionado. Tente alterar os filtros ou cadastrar uma nova meta."
            : "Defina seus objetivos de curto, médio e longo prazo (como viagens, reserva de emergência ou compras) para acompanhar a evolução do seu patrimônio."}
        </p>
      </div>

      <Button
        onClick={onCriarMeta}
        className="rounded-[10px] bg-[#1F4E79] hover:bg-[#1F4E79]/90 text-white font-medium text-xs gap-2 shadow-sm mt-2 px-5"
      >
        <Plus className="h-4 w-4" />
        <span>Criar Minha Primeira Meta</span>
      </Button>
    </div>
  );
}
