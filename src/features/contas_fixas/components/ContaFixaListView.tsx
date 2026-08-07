"use client";

import { ContaFixa } from "@/types/contasFixas";
import { ContaFixaListItem } from "./ContaFixaListItem";

interface ContaFixaListViewProps {
  contasFixas: ContaFixa[];
  onEdit: (contaFixa: ContaFixa) => void;
  onDelete: (id: number) => void;
  onToggleStatus: (id: number) => void;
  isAlternandoStatus?: boolean;
}

export function ContaFixaListView({
  contasFixas,
  onEdit,
  onDelete,
  onToggleStatus,
  isAlternandoStatus = false,
}: ContaFixaListViewProps) {
  return (
    <div className="space-y-2.5">
      <div className="flex items-center justify-between text-xs text-muted-foreground px-1 pb-1">
        <span>
          Exibindo {contasFixas.length}{" "}
          {contasFixas.length === 1 ? "conta fixa" : "contas fixas"}
        </span>
      </div>

      <div className="space-y-2.5">
        {contasFixas.map((contaFixa) => (
          <ContaFixaListItem
            key={contaFixa.id}
            contaFixa={contaFixa}
            onEdit={onEdit}
            onDelete={onDelete}
            onToggleStatus={onToggleStatus}
            isAlternandoStatus={isAlternandoStatus}
          />
        ))}
      </div>
    </div>
  );
}
