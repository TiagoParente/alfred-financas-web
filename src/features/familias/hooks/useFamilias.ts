"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { familiaService } from "@/services/familias";
import { CriarFamiliaPayload } from "@/types/familias";
import { useState } from "react";

export function useFamilias() {
  const queryClient = useQueryClient();
  const [familiaAtivaIdState, setFamiliaAtivaIdState] = useState<number | null>(() => {
    if (typeof window !== "undefined") {
      const savedId = localStorage.getItem("alfred_familia_id");
      return savedId ? Number(savedId) : null;
    }
    return null;
  });

  const { data: familias = [], isLoading, isError, refetch } = useQuery({
    queryKey: ["familias"],
    queryFn: () => familiaService.listar(),
  });

  const familiaAtiva =
    familias.find((f) => f.id === familiaAtivaIdState) || familias[0] || null;

  const familiaAtivaId = familiaAtiva?.id ?? null;

  const setFamiliaAtivaId = (id: number) => {
    setFamiliaAtivaIdState(id);
    if (typeof window !== "undefined") {
      localStorage.setItem("alfred_familia_id", id.toString());
    }
    queryClient.invalidateQueries({ queryKey: ["contas-bancarias"] });
  };

  const criarFamiliaMutation = useMutation({
    mutationFn: (payload: CriarFamiliaPayload) => familiaService.criar(payload),
    onSuccess: (novaFamilia) => {
      queryClient.invalidateQueries({ queryKey: ["familias"] });
      setFamiliaAtivaId(novaFamilia.id);
    },
  });

  return {
    familias,
    familiaAtiva,
    familiaAtivaId,
    setFamiliaAtivaId,
    isLoading,
    isError,
    refetch,
    criarFamilia: criarFamiliaMutation.mutateAsync,
    isCriandoFamilia: criarFamiliaMutation.isPending,
  };
}
