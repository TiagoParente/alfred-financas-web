"use client";

import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { familiaService } from "@/services/familias";
import { CriarFamiliaPayload, Familia } from "@/types/familias";

interface FamiliaContextType {
  familias: Familia[];
  familiaAtiva: Familia | null;
  familiaAtivaId: number | null;
  setFamiliaAtivaId: (id: number) => void;
  isLoading: boolean;
  isError: boolean;
  refetch: () => void;
  criarFamilia: (payload: CriarFamiliaPayload) => Promise<Familia>;
  isCriandoFamilia: boolean;
  atualizarFamilia: (params: { id: number; nome: string }) => Promise<Familia>;
  isAtualizandoFamilia: boolean;
}

const FamiliaContext = createContext<FamiliaContextType | undefined>(undefined);

export function FamiliaProvider({ children }: { children: ReactNode }) {
  const queryClient = useQueryClient();
  const [familiaAtivaIdState, setFamiliaAtivaIdState] = useState<number | null>(null);

  useEffect(() => {
    const savedId = localStorage.getItem("alfred_familia_id");
    if (savedId) {
      setFamiliaAtivaIdState(Number(savedId));
    }
  }, []);

  const { data: familias = [], isLoading, isError, refetch } = useQuery({
    queryKey: ["familias"],
    queryFn: () => familiaService.listar(),
    enabled: typeof window !== "undefined" && !!localStorage.getItem("alfred_token"),
  });

  // Garantir que a lista de famílias não possua elementos duplicados por id
  const familiasUnicas = Array.from(
    new Map(familias.map((f) => [f.id, f])).values()
  );

  const familiaAtiva =
    familiasUnicas.find((f) => f.id === familiaAtivaIdState) || familiasUnicas[0] || null;

  const familiaAtivaId = familiaAtiva?.id ?? null;

  useEffect(() => {
    if (familiaAtivaId && typeof window !== "undefined") {
      const savedId = localStorage.getItem("alfred_familia_id");
      if (!savedId || savedId !== familiaAtivaId.toString()) {
        localStorage.setItem("alfred_familia_id", familiaAtivaId.toString());
      }
    }
  }, [familiaAtivaId]);

  const setFamiliaAtivaId = (id: number) => {
    setFamiliaAtivaIdState(id);
    if (typeof window !== "undefined") {
      localStorage.setItem("alfred_familia_id", id.toString());
    }
    // Invalida todas as queries do TanStack Query para forçar o recarregamento automático dos dados da tela
    queryClient.invalidateQueries();
  };

  const criarFamiliaMutation = useMutation({
    mutationFn: (payload: CriarFamiliaPayload) => familiaService.criar(payload),
    onSuccess: (novaFamilia) => {
      queryClient.invalidateQueries({ queryKey: ["familias"] });
      setFamiliaAtivaId(novaFamilia.id);
    },
  });

  const atualizarFamiliaMutation = useMutation({
    mutationFn: ({ id, nome }: { id: number; nome: string }) =>
      familiaService.atualizar(id, { nome }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["familias"] });
    },
  });

  return (
    <FamiliaContext.Provider
      value={{
        familias: familiasUnicas,
        familiaAtiva,
        familiaAtivaId,
        setFamiliaAtivaId,
        isLoading,
        isError,
        refetch,
        criarFamilia: criarFamiliaMutation.mutateAsync,
        isCriandoFamilia: criarFamiliaMutation.isPending,
        atualizarFamilia: atualizarFamiliaMutation.mutateAsync,
        isAtualizandoFamilia: atualizarFamiliaMutation.isPending,
      }}
    >
      {children}
    </FamiliaContext.Provider>
  );
}

export function useFamilias() {
  const context = useContext(FamiliaContext);
  if (!context) {
    throw new Error("useFamilias deve ser usado dentro de um FamiliaProvider");
  }
  return context;
}
