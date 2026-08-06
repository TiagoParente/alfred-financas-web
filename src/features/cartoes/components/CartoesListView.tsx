"use client";

import { CartaoCredito } from "@/types/cartoes";
import { CartaoCreditoListItem } from "./CartaoCreditoListItem";

interface CartoesListViewProps {
  cartoes: CartaoCredito[];
  onVisualizarFatura: (cartao: CartaoCredito) => void;
  onLancarDespesa?: (cartao: CartaoCredito) => void;
  onEditar: (cartao: CartaoCredito) => void;
  onDeletar: (cartao: CartaoCredito) => void;
}

export function CartoesListView({
  cartoes,
  onVisualizarFatura,
  onLancarDespesa,
  onEditar,
  onDeletar,
}: CartoesListViewProps) {
  return (
    <div className="space-y-2">
      {cartoes.map((cartao) => (
        <CartaoCreditoListItem
          key={cartao.id}
          cartao={cartao}
          onVisualizarFatura={onVisualizarFatura}
          onLancarDespesa={onLancarDespesa}
          onEditar={onEditar}
          onDeletar={onDeletar}
        />
      ))}
    </div>
  );
}
