"use client";

import { useFamilias } from "@/features/familias/hooks/useFamilias";
import { MovimentacoesListView } from "@/features/movimentacoes/components/MovimentacoesListView";

export default function MovimentacoesPage() {
  const { familiaAtivaId } = useFamilias();

  return <MovimentacoesListView familiaId={familiaAtivaId} />;
}
