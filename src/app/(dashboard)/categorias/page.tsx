"use client";

import { useState, useMemo } from "react";
import { useFamilias } from "@/features/familias/hooks/useFamilias";
import { useCategorias } from "@/features/categorias/hooks/useCategorias";
import { Categoria, Subcategoria, TipoCategoria } from "@/types/categorias";
import { CategoriaCard } from "@/features/categorias/components/CategoriaCard";
import { CategoriaModal, CategoriaFormData } from "@/features/categorias/components/CategoriaModal";
import { DeletarCategoriaModal } from "@/features/categorias/components/DeletarCategoriaModal";
import { DeletarSubcategoriaModal } from "@/features/categorias/components/DeletarSubcategoriaModal";
import { CategoriasSkeleton } from "@/features/categorias/components/CategoriasSkeleton";
import { CategoriasEmptyState } from "@/features/categorias/components/CategoriasEmptyState";
import { Plus, RefreshCw, AlertCircle, Download, Tag } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type TabFiltro = "todas" | "receitas" | "despesas";

export default function CategoriasPage() {
  const { familiaAtivaId } = useFamilias();
  const [tabAtiva, setTabAtiva] = useState<TabFiltro>("todas");

  const {
    categorias,
    isLoading,
    isError,
    refetch,
    importarPadroes,
    isImportandoPadroes,
    criarCategoria,
    isCriandoCategoria,
    atualizarCategoria,
    isAtualizandoCategoria,
    deletarCategoria,
    isDeletandoCategoria,
    criarSubcategoria,
    isCriandoSubcategoria,
    deletarSubcategoria,
    isDeletandoSubcategoria,
  } = useCategorias(familiaAtivaId, { incluirSistema: true });

  const [modalFormAberta, setModalFormAberta] = useState(false);
  const [categoriaEmEdicao, setCategoriaEmEdicao] = useState<Categoria | null>(null);

  const [modalDeletarCatAberta, setModalDeletarCatAberta] = useState(false);
  const [categoriaParaDeletar, setCategoriaParaDeletar] = useState<Categoria | null>(null);

  const [modalDeletarSubAberta, setModalDeletarSubAberta] = useState(false);
  const [subcategoriaParaDeletar, setSubcategoriaParaDeletar] = useState<Subcategoria | null>(null);

  const categoriasFiltradas = useMemo(() => {
    if (tabAtiva === "receitas") {
      return categorias.filter((c) => c.tipo === TipoCategoria.RECEITA);
    }
    if (tabAtiva === "despesas") {
      return categorias.filter((c) => c.tipo === TipoCategoria.DESPESA);
    }
    return categorias;
  }, [categorias, tabAtiva]);

  const handleNovaCategoria = () => {
    setCategoriaEmEdicao(null);
    setModalFormAberta(true);
  };

  const handleEditar = (categoria: Categoria) => {
    setCategoriaEmEdicao(categoria);
    setModalFormAberta(true);
  };

  const handleDeletarCategoria = (categoria: Categoria) => {
    setCategoriaParaDeletar(categoria);
    setModalDeletarCatAberta(true);
  };

  const handleDeletarSubcategoria = (subcategoria: Subcategoria) => {
    setSubcategoriaParaDeletar(subcategoria);
    setModalDeletarSubAberta(true);
  };

  const handleImportarPadroes = async () => {
    await importarPadroes();
  };

  const handleSubmitForm = async (formData: CategoriaFormData) => {
    if (categoriaEmEdicao) {
      await atualizarCategoria({
        id: categoriaEmEdicao.id,
        payload: {
          nome: formData.nome,
          tipo: formData.tipo,
          icone: formData.icone || null,
          cor_hex: formData.cor_hex || null,
        },
      });
    } else {
      await criarCategoria({
        nome: formData.nome,
        tipo: formData.tipo,
        icone: formData.icone || null,
        cor_hex: formData.cor_hex || null,
      });
    }
  };

  const handleConfirmarDeletarCategoria = async () => {
    if (categoriaParaDeletar) {
      await deletarCategoria(categoriaParaDeletar.id);
      setCategoriaParaDeletar(null);
    }
  };

  const handleConfirmarDeletarSubcategoria = async () => {
    if (subcategoriaParaDeletar) {
      await deletarSubcategoria(subcategoriaParaDeletar.id);
      setSubcategoriaParaDeletar(null);
    }
  };

  const handleCriarSubcategoria = async (categoriaId: number, nome: string) => {
    await criarSubcategoria({
      categoriaId,
      payload: { nome },
    });
  };

  if (isLoading) {
    return <CategoriasSkeleton />;
  }

  if (isError) {
    return (
      <div className="flex flex-col items-center justify-center rounded-[20px] border border-red-200 bg-red-50/50 p-8 text-center dark:border-red-950 dark:bg-red-950/20">
        <AlertCircle className="h-10 w-10 text-red-500 mb-3" />
        <h3 className="text-base font-bold text-foreground">
          Não foi possível carregar as categorias
        </h3>
        <p className="mt-1 text-xs text-muted-foreground">
          Ocorreu uma falha de conexão com a API.
        </p>
        <Button
          onClick={() => refetch()}
          variant="outline"
          className="mt-4 gap-2 rounded-[10px]"
        >
          <RefreshCw className="h-4 w-4" />
          <span>Tentar Novamente</span>
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header da Página */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground tracking-tight flex items-center gap-2">
            <Tag className="h-6 w-6 text-[#1F4E79]" />
            Categorias & Subcategorias
          </h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            Organize suas receitas e despesas com categorias personalizadas ou do sistema.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <Button
            onClick={handleImportarPadroes}
            disabled={isImportandoPadroes}
            variant="outline"
            className="rounded-[10px] border-border/60 hover:bg-accent text-foreground font-medium gap-2 shadow-sm"
          >
            <Download className="h-4 w-4 text-[#1F4E79]" />
            <span>{isImportandoPadroes ? "Importando..." : "Importar Padrões"}</span>
          </Button>

          <Button
            onClick={handleNovaCategoria}
            className="rounded-[10px] bg-[#1F4E79] hover:bg-[#1F4E79]/90 text-white font-medium gap-2 shadow-sm"
          >
            <Plus className="h-4 w-4" />
            <span>Nova Categoria</span>
          </Button>
        </div>
      </div>

      {/* Conteúdo Principal */}
      {categorias.length === 0 ? (
        <CategoriasEmptyState
          onNovaCategoria={handleNovaCategoria}
          onImportarPadroes={handleImportarPadroes}
          isImportando={isImportandoPadroes}
        />
      ) : (
        <div className="space-y-6">
          {/* Abas de Filtro */}
          <div className="flex items-center justify-between border-b border-border/40 pb-3">
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => setTabAtiva("todas")}
                className={cn(
                  "px-4 py-2 text-xs font-semibold rounded-xl transition-colors",
                  tabAtiva === "todas"
                    ? "bg-[#1F4E79] text-white shadow-sm"
                    : "text-muted-foreground hover:bg-accent hover:text-foreground"
                )}
              >
                Todas ({categorias.length})
              </button>
              <button
                type="button"
                onClick={() => setTabAtiva("despesas")}
                className={cn(
                  "px-4 py-2 text-xs font-semibold rounded-xl transition-colors",
                  tabAtiva === "despesas"
                    ? "bg-rose-600 text-white shadow-sm"
                    : "text-muted-foreground hover:bg-accent hover:text-foreground"
                )}
              >
                Despesas (
                {categorias.filter((c) => c.tipo === TipoCategoria.DESPESA).length})
              </button>
              <button
                type="button"
                onClick={() => setTabAtiva("receitas")}
                className={cn(
                  "px-4 py-2 text-xs font-semibold rounded-xl transition-colors",
                  tabAtiva === "receitas"
                    ? "bg-emerald-600 text-white shadow-sm"
                    : "text-muted-foreground hover:bg-accent hover:text-foreground"
                )}
              >
                Receitas (
                {categorias.filter((c) => c.tipo === TipoCategoria.RECEITA).length})
              </button>
            </div>
          </div>

          {/* Grid de Cards */}
          {categoriasFiltradas.length === 0 ? (
            <div className="text-center py-12 rounded-2xl border border-dashed border-border/60 bg-accent/10">
              <p className="text-sm text-muted-foreground">
                Nenhuma categoria encontrada para o filtro selecionado.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
              {categoriasFiltradas.map((cat) => (
                <CategoriaCard
                  key={cat.id}
                  categoria={cat}
                  onEditar={handleEditar}
                  onDeletar={handleDeletarCategoria}
                  onCriarSubcategoria={handleCriarSubcategoria}
                  onDeletarSubcategoria={handleDeletarSubcategoria}
                  isCriandoSubcategoria={isCriandoSubcategoria}
                />
              ))}
            </div>
          )}
        </div>
      )}

      {/* Modais */}
      <CategoriaModal
        open={modalFormAberta}
        onOpenChange={setModalFormAberta}
        categoriaEmEdicao={categoriaEmEdicao}
        onSubmit={handleSubmitForm}
        isSubmitting={isCriandoCategoria || isAtualizandoCategoria}
      />

      <DeletarCategoriaModal
        open={modalDeletarCatAberta}
        onOpenChange={setModalDeletarCatAberta}
        categoria={categoriaParaDeletar}
        onConfirm={handleConfirmarDeletarCategoria}
        isDeleting={isDeletandoCategoria}
      />

      <DeletarSubcategoriaModal
        open={modalDeletarSubAberta}
        onOpenChange={setModalDeletarSubAberta}
        subcategoria={subcategoriaParaDeletar}
        onConfirm={handleConfirmarDeletarSubcategoria}
        isDeleting={isDeletandoSubcategoria}
      />
    </div>
  );
}
