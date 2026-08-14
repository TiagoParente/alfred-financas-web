"use client";

import { useState, useMemo } from "react";
import { useFamilias } from "@/features/familias/hooks/useFamilias";
import { useCategorias } from "@/features/categorias/hooks/useCategorias";
import { Categoria, Subcategoria, TipoCategoria } from "@/types/categorias";
import { CategoriaCard } from "@/features/categorias/components/CategoriaCard";
import { CategoriasListView } from "@/features/categorias/components/CategoriasListView";
import { CategoriaModal, CategoriaFormData } from "@/features/categorias/components/CategoriaModal";
import { SubcategoriaModal } from "@/features/categorias/components/SubcategoriaModal";
import { DeletarCategoriaModal } from "@/features/categorias/components/DeletarCategoriaModal";
import { DeletarSubcategoriaModal } from "@/features/categorias/components/DeletarSubcategoriaModal";
import { CategoriasSkeleton } from "@/features/categorias/components/CategoriasSkeleton";
import { CategoriasEmptyState } from "@/features/categorias/components/CategoriasEmptyState";
import {
  Plus,
  RefreshCw,
  AlertCircle,
  Tag,
  Search,
  LayoutList,
  LayoutGrid,
  TrendingDown,
  TrendingUp,
  Layers,
  FolderTree,
  X,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

type TabFiltro = "todas" | "receitas" | "despesas";
type ModoExibicao = "lista" | "grid";

export default function CategoriasPage() {
  const { familiaAtivaId } = useFamilias();
  const [tabAtiva, setTabAtiva] = useState<TabFiltro>("todas");
  const [modoExibicao, setModoExibicao] = useState<ModoExibicao>("lista");
  const [searchTerm, setSearchTerm] = useState("");

  const {
    categorias,
    isLoading,
    isError,
    refetch,
    criarCategoria,
    isCriandoCategoria,
    atualizarCategoria,
    isAtualizandoCategoria,
    deletarCategoria,
    isDeletandoCategoria,
    criarSubcategoria,
    isCriandoSubcategoria,
    atualizarSubcategoria,
    isAtualizandoSubcategoria,
    deletarSubcategoria,
    isDeletandoSubcategoria,
  } = useCategorias(familiaAtivaId);

  const [modalFormAberta, setModalFormAberta] = useState(false);
  const [categoriaEmEdicao, setCategoriaEmEdicao] = useState<Categoria | null>(null);

  const [modalDeletarCatAberta, setModalDeletarCatAberta] = useState(false);
  const [categoriaParaDeletar, setCategoriaParaDeletar] = useState<Categoria | null>(null);

  const [modalDeletarSubAberta, setModalDeletarSubAberta] = useState(false);
  const [subcategoriaParaDeletar, setSubcategoriaParaDeletar] = useState<Subcategoria | null>(null);

  const [modalEditarSubAberta, setModalEditarSubAberta] = useState(false);
  const [subcategoriaEmEdicao, setSubcategoriaEmEdicao] = useState<Subcategoria | null>(null);

  // Estatísticas Rápidas
  const stats = useMemo(() => {
    const totalCategorias = categorias.length;
    const despesas = categorias.filter((c) => c.tipo === TipoCategoria.DESPESA).length;
    const receitas = categorias.filter((c) => c.tipo === TipoCategoria.RECEITA).length;
    const subcategorias = categorias.reduce(
      (acc, c) => acc + (c.subcategorias?.length || 0),
      0
    );

    return { totalCategorias, despesas, receitas, subcategorias };
  }, [categorias]);

  // Filtragem combinada por tipo e busca por texto
  const categoriasFiltradas = useMemo(() => {
    let result = categorias;

    // Filtro por Aba
    if (tabAtiva === "receitas") {
      result = result.filter((c) => c.tipo === TipoCategoria.RECEITA);
    } else if (tabAtiva === "despesas") {
      result = result.filter((c) => c.tipo === TipoCategoria.DESPESA);
    }

    // Filtro por Busca de Texto (Nome de categoria ou subcategoria)
    if (searchTerm.trim()) {
      const term = searchTerm.toLowerCase().trim();
      result = result.filter(
        (c) =>
          c.nome.toLowerCase().includes(term) ||
          c.subcategorias?.some((sub) => sub.nome.toLowerCase().includes(term))
      );
    }

    return result;
  }, [categorias, tabAtiva, searchTerm]);

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

  const handleEditarSubcategoria = (subcategoria: Subcategoria) => {
    setSubcategoriaEmEdicao(subcategoria);
    setModalEditarSubAberta(true);
  };

  const handleConfirmarEditarSubcategoria = async (
    subcategoriaId: number,
    payload: { nome: string; categoria_id: number }
  ) => {
    await atualizarSubcategoria({
      subcategoriaId,
      payload,
    });
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
          className="mt-4 gap-2 rounded-[10px] cursor-pointer"
        >
          <RefreshCw className="h-4 w-4" />
          <span>Tentar Novamente</span>
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header da Página */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground tracking-tight flex items-center gap-2">
            <Tag className="h-6 w-6 text-[#1F4E79]" />
            Categorias & Subcategorias
          </h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            Organize suas receitas e despesas com categorias personalizadas.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <Button
            onClick={handleNovaCategoria}
            className="rounded-[10px] bg-[#1F4E79] hover:bg-[#1F4E79]/90 text-white font-medium gap-2 shadow-2xs cursor-pointer"
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
        />
      ) : (
        <div className="space-y-5">
          {/* Métricas e Resumo Rápido (KPIs) */}
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 sm:gap-4">
            <div className="rounded-xl border border-border/40 bg-card p-3.5 sm:p-4 shadow-2xs flex items-center gap-3">
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-[#1F4E79]/10 text-[#1F4E79] shrink-0">
                <Layers className="h-4.5 w-4.5" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground font-medium">Categorias</p>
                <p className="text-lg font-bold text-foreground leading-tight">
                  {stats.totalCategorias}
                </p>
              </div>
            </div>

            <div className="rounded-xl border border-border/40 bg-card p-3.5 sm:p-4 shadow-2xs flex items-center gap-3">
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-rose-500/10 text-rose-600 dark:text-rose-400 shrink-0">
                <TrendingDown className="h-4.5 w-4.5" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground font-medium">Despesas</p>
                <p className="text-lg font-bold text-foreground leading-tight">
                  {stats.despesas}
                </p>
              </div>
            </div>

            <div className="rounded-xl border border-border/40 bg-card p-3.5 sm:p-4 shadow-2xs flex items-center gap-3">
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 shrink-0">
                <TrendingUp className="h-4.5 w-4.5" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground font-medium">Receitas</p>
                <p className="text-lg font-bold text-foreground leading-tight">
                  {stats.receitas}
                </p>
              </div>
            </div>

            <div className="rounded-xl border border-border/40 bg-card p-3.5 sm:p-4 shadow-2xs flex items-center gap-3">
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-accent text-muted-foreground shrink-0">
                <FolderTree className="h-4.5 w-4.5" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground font-medium">Subcategorias</p>
                <p className="text-lg font-bold text-foreground leading-tight">
                  {stats.subcategorias}
                </p>
              </div>
            </div>
          </div>

          {/* Barra de Filtros, Busca e Alternador de Modo de Visualização */}
          <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between border-b border-border/40 pb-3.5">
            {/* Abas por Tipo */}
            <div className="flex items-center gap-1.5 overflow-x-auto pb-1 md:pb-0">
              <button
                type="button"
                onClick={() => setTabAtiva("todas")}
                className={cn(
                  "px-3.5 py-1.5 text-xs font-semibold rounded-lg transition-colors shrink-0 cursor-pointer",
                  tabAtiva === "todas"
                    ? "bg-[#1F4E79] text-white shadow-2xs"
                    : "text-muted-foreground hover:bg-accent hover:text-foreground"
                )}
              >
                Todas ({stats.totalCategorias})
              </button>
              <button
                type="button"
                onClick={() => setTabAtiva("despesas")}
                className={cn(
                  "px-3.5 py-1.5 text-xs font-semibold rounded-lg transition-colors shrink-0 cursor-pointer",
                  tabAtiva === "despesas"
                    ? "bg-rose-600 text-white shadow-2xs"
                    : "text-muted-foreground hover:bg-accent hover:text-foreground"
                )}
              >
                Despesas ({stats.despesas})
              </button>
              <button
                type="button"
                onClick={() => setTabAtiva("receitas")}
                className={cn(
                  "px-3.5 py-1.5 text-xs font-semibold rounded-lg transition-colors shrink-0 cursor-pointer",
                  tabAtiva === "receitas"
                    ? "bg-emerald-600 text-white shadow-2xs"
                    : "text-muted-foreground hover:bg-accent hover:text-foreground"
                )}
              >
                Receitas ({stats.receitas})
              </button>
            </div>

            {/* Busca em Tempo Real + Alternador de Visualização */}
            <div className="flex items-center gap-2.5">
              {/* Campo de Busca */}
              <div className="relative flex-1 md:w-64">
                <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
                <Input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Buscar categoria ou subcategoria..."
                  className="h-8 pl-8 pr-7 text-xs rounded-lg bg-card"
                />
                {searchTerm && (
                  <button
                    type="button"
                    onClick={() => setSearchTerm("")}
                    className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground cursor-pointer"
                  >
                    <X className="h-3 w-3" />
                  </button>
                )}
              </div>

              {/* Botões do Alternador (Lista vs Grid) */}
              <div className="flex items-center rounded-lg border border-border/60 bg-muted/40 p-0.5 shrink-0">
                <button
                  type="button"
                  onClick={() => setModoExibicao("lista")}
                  className={cn(
                    "flex items-center gap-1 px-2.5 py-1 text-xs font-medium rounded-md transition-all cursor-pointer",
                    modoExibicao === "lista"
                      ? "bg-background text-foreground shadow-2xs font-semibold"
                      : "text-muted-foreground hover:text-foreground"
                  )}
                  title="Visão em Lista Compacta (Árvore Accordion)"
                >
                  <LayoutList className="h-3.5 w-3.5" />
                  <span className="hidden sm:inline">Lista</span>
                </button>
                <button
                  type="button"
                  onClick={() => setModoExibicao("grid")}
                  className={cn(
                    "flex items-center gap-1 px-2.5 py-1 text-xs font-medium rounded-md transition-all cursor-pointer",
                    modoExibicao === "grid"
                      ? "bg-background text-foreground shadow-2xs font-semibold"
                      : "text-muted-foreground hover:text-foreground"
                  )}
                  title="Visão em Cards Grid"
                >
                  <LayoutGrid className="h-3.5 w-3.5" />
                  <span className="hidden sm:inline">Cards</span>
                </button>
              </div>
            </div>
          </div>

          {/* Área de Exibição das Categorias */}
          {categoriasFiltradas.length === 0 ? (
            <div className="text-center py-12 rounded-2xl border border-dashed border-border/60 bg-accent/10 space-y-2">
              <p className="text-sm font-medium text-foreground">
                Nenhuma categoria encontrada
              </p>
              <p className="text-xs text-muted-foreground">
                {searchTerm
                  ? `Nenhum resultado para "${searchTerm}"`
                  : "Nenhuma categoria cadastrada neste filtro."}
              </p>
              {searchTerm && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setSearchTerm("")}
                  className="mt-2 text-xs rounded-lg cursor-pointer"
                >
                  Limpar busca
                </Button>
              )}
            </div>
          ) : modoExibicao === "lista" ? (
            <CategoriasListView
              categorias={categoriasFiltradas}
              onEditar={handleEditar}
              onDeletar={handleDeletarCategoria}
              onCriarSubcategoria={handleCriarSubcategoria}
              onEditarSubcategoria={handleEditarSubcategoria}
              onDeletarSubcategoria={handleDeletarSubcategoria}
              isCriandoSubcategoria={isCriandoSubcategoria}
            />
          ) : (
            <div className="grid grid-cols-1 gap-3.5 md:grid-cols-2 lg:grid-cols-3">
              {categoriasFiltradas.map((cat) => (
                <CategoriaCard
                  key={cat.id}
                  categoria={cat}
                  onEditar={handleEditar}
                  onDeletar={handleDeletarCategoria}
                  onCriarSubcategoria={handleCriarSubcategoria}
                  onEditarSubcategoria={handleEditarSubcategoria}
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

      <SubcategoriaModal
        open={modalEditarSubAberta}
        onOpenChange={setModalEditarSubAberta}
        subcategoria={subcategoriaEmEdicao}
        categorias={categorias}
        onSubmit={handleConfirmarEditarSubcategoria}
        isSubmitting={isAtualizandoSubcategoria}
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
