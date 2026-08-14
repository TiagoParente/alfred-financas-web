"use client";

import { useState, useMemo } from "react";
import { Categoria, Subcategoria } from "@/types/categorias";
import { CategoriaListItem } from "./CategoriaListItem";
import { Button } from "@/components/ui/button";
import { ChevronsDown, ChevronsUp } from "lucide-react";

interface CategoriasListViewProps {
  categorias: Categoria[];
  onEditar: (categoria: Categoria) => void;
  onDeletar: (categoria: Categoria) => void;
  onCriarSubcategoria: (categoriaId: number, nome: string) => Promise<void>;
  onEditarSubcategoria: (subcategoria: Subcategoria) => void;
  onDeletarSubcategoria: (subcategoria: Subcategoria) => void;
  isCriandoSubcategoria?: boolean;
}

export function CategoriasListView({
  categorias,
  onEditar,
  onDeletar,
  onCriarSubcategoria,
  onEditarSubcategoria,
  onDeletarSubcategoria,
  isCriandoSubcategoria = false,
}: CategoriasListViewProps) {
  // Guardar IDs das categorias cujas subcategorias estão expandidas
  const [expandedIds, setExpandedIds] = useState<Set<number>>(new Set());

  const todassExpandidas = useMemo(() => {
    return (
      categorias.length > 0 &&
      categorias.every((cat) => expandedIds.has(cat.id))
    );
  }, [categorias, expandedIds]);

  const toggleExpand = (id: number) => {
    setExpandedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  const handleExpandirTodas = () => {
    setExpandedIds(new Set(categorias.map((c) => c.id)));
  };

  const handleRecolherTodas = () => {
    setExpandedIds(new Set());
  };

  return (
    <div className="space-y-3">
      {/* Barra de controle de expansão */}
      <div className="flex items-center justify-between text-xs text-muted-foreground px-1 pb-1">
        <span>Exibindo {categorias.length} categorias</span>
        <div className="flex items-center gap-2">
          {todassExpandidas ? (
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={handleRecolherTodas}
              className="h-7 px-2 text-xs font-medium text-muted-foreground hover:text-foreground gap-1 cursor-pointer"
            >
              <ChevronsUp className="h-3.5 w-3.5" />
              <span>Recolher Todas</span>
            </Button>
          ) : (
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={handleExpandirTodas}
              className="h-7 px-2 text-xs font-medium text-muted-foreground hover:text-foreground gap-1 cursor-pointer"
            >
              <ChevronsDown className="h-3.5 w-3.5" />
              <span>Expandir Todas</span>
            </Button>
          )}
        </div>
      </div>

      {/* Lista de Itens Compactos */}
      <div className="space-y-2">
        {categorias.map((cat) => (
          <CategoriaListItem
            key={cat.id}
            categoria={cat}
            isExpanded={expandedIds.has(cat.id)}
            onToggleExpand={() => toggleExpand(cat.id)}
            onEditar={onEditar}
            onDeletar={onDeletar}
            onCriarSubcategoria={onCriarSubcategoria}
            onEditarSubcategoria={onEditarSubcategoria}
            onDeletarSubcategoria={onDeletarSubcategoria}
            isCriandoSubcategoria={isCriandoSubcategoria}
          />
        ))}
      </div>
    </div>
  );
}
