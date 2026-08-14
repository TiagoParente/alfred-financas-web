"use client";

import { ContaBancaria } from "@/types/contas";
import { ContaBancariaListItem } from "./ContaBancariaListItem";

interface ContasBancariasListViewProps {
  contas: ContaBancaria[];
  onVerPainel?: (conta: ContaBancaria) => void;
  onLancarMovimentacao?: (conta: ContaBancaria) => void;
  onEditar: (conta: ContaBancaria) => void;
  onDeletar: (conta: ContaBancaria) => void;
}

export function ContasBancariasListView({
  contas,
  onVerPainel,
  onLancarMovimentacao,
  onEditar,
  onDeletar,
}: ContasBancariasListViewProps) {
  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between text-xs text-muted-foreground px-1 pb-1">
        <span>Exibindo {contas.length} {contas.length === 1 ? "conta" : "contas"}</span>
      </div>

      <div className="space-y-2">
        {contas.map((conta) => (
          <ContaBancariaListItem
            key={conta.id}
            conta={conta}
            onVerPainel={onVerPainel}
            onLancarMovimentacao={onLancarMovimentacao}
            onEditar={onEditar}
            onDeletar={onDeletar}
          />
        ))}
      </div>
    </div>
  );
}
