"use client";

import { Orcamento } from "@/types/orcamento";
import { OrcamentoListItem } from "./OrcamentoListItem";

interface OrcamentosListViewProps {
  orcamentos: Orcamento[];
  onEditar: (orcamento: Orcamento) => void;
  onDeletar: (orcamento: Orcamento) => void;
}

export function OrcamentosListView({
  orcamentos,
  onEditar,
  onDeletar,
}: OrcamentosListViewProps) {
  return (
    <div className="space-y-2.5">
      <div className="flex items-center justify-between text-xs text-muted-foreground px-1 pb-1">
        <span>
          Exibindo {orcamentos.length} {orcamentos.length === 1 ? "orçamento" : "orçamentos"}
        </span>
      </div>

      <div className="space-y-2.5">
        {orcamentos.map((orcamento) => (
          <OrcamentoListItem
            key={orcamento.id}
            orcamento={orcamento}
            onEditar={onEditar}
            onDeletar={onDeletar}
          />
        ))}
      </div>
    </div>
  );
}
