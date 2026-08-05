"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  categoriaService,
  ListarCategoriasParams,
} from "@/services/categorias";
import {
  AtualizarCategoriaPayload,
  CriarCategoriaPayload,
  CriarSubcategoriaPayload,
} from "@/types/categorias";

export function useCategorias(
  familiaId?: number | null,
  params?: ListarCategoriasParams
) {
  const queryClient = useQueryClient();
  const queryKey = [
    "categorias",
    familiaId,
    params?.incluirSistema ?? true,
    params?.tipo ?? "todos",
  ];

  const {
    data: categorias = [],
    isLoading,
    isError,
    error,
    refetch,
  } = useQuery({
    queryKey,
    queryFn: () =>
      categoriaService.listar(familiaId ?? undefined, {
        incluirSistema: params?.incluirSistema ?? true,
        tipo: params?.tipo,
      }),
    enabled: true,
  });

  const importarPadroesMutation = useMutation({
    mutationFn: () => categoriaService.importarPadroes(familiaId ?? undefined),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["categorias"] });
    },
  });

  const criarCategoriaMutation = useMutation({
    mutationFn: (payload: CriarCategoriaPayload) =>
      categoriaService.criar(payload, familiaId ?? undefined),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["categorias"] });
    },
  });

  const atualizarCategoriaMutation = useMutation({
    mutationFn: ({
      id,
      payload,
    }: {
      id: number;
      payload: AtualizarCategoriaPayload;
    }) => categoriaService.atualizar(id, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["categorias"] });
    },
  });

  const deletarCategoriaMutation = useMutation({
    mutationFn: (id: number) => categoriaService.deletar(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["categorias"] });
    },
  });

  const criarSubcategoriaMutation = useMutation({
    mutationFn: ({
      categoriaId,
      payload,
    }: {
      categoriaId: number;
      payload: CriarSubcategoriaPayload;
    }) => categoriaService.criarSubcategoria(categoriaId, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["categorias"] });
    },
  });

  const deletarSubcategoriaMutation = useMutation({
    mutationFn: (subcategoriaId: number) =>
      categoriaService.deletarSubcategoria(subcategoriaId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["categorias"] });
    },
  });

  return {
    categorias,
    isLoading,
    isError,
    error,
    refetch,
    importarPadroes: importarPadroesMutation.mutateAsync,
    isImportandoPadroes: importarPadroesMutation.isPending,
    criarCategoria: criarCategoriaMutation.mutateAsync,
    isCriandoCategoria: criarCategoriaMutation.isPending,
    atualizarCategoria: atualizarCategoriaMutation.mutateAsync,
    isAtualizandoCategoria: atualizarCategoriaMutation.isPending,
    deletarCategoria: deletarCategoriaMutation.mutateAsync,
    isDeletandoCategoria: deletarCategoriaMutation.isPending,
    criarSubcategoria: criarSubcategoriaMutation.mutateAsync,
    isCriandoSubcategoria: criarSubcategoriaMutation.isPending,
    deletarSubcategoria: deletarSubcategoriaMutation.mutateAsync,
    isDeletandoSubcategoria: deletarSubcategoriaMutation.isPending,
  };
}
