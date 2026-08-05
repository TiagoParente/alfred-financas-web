"use client";

import { useState } from "react";
import { Categoria, Subcategoria, TipoCategoria } from "@/types/categorias";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import * as Icons from "lucide-react";
import {
  ChevronDown,
  ChevronRight,
  MoreVertical,
  Plus,
  Trash2,
  Edit2,
  Lock,
  Tag,
  FolderOpen,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface CategoriaListItemProps {
  categoria: Categoria;
  isExpanded: boolean;
  onToggleExpand: () => void;
  onEditar: (categoria: Categoria) => void;
  onDeletar: (categoria: Categoria) => void;
  onCriarSubcategoria: (categoriaId: number, nome: string) => Promise<void>;
  onDeletarSubcategoria: (subcategoria: Subcategoria) => void;
  isCriandoSubcategoria?: boolean;
}

function CategoriaIcon({
  iconName,
  className,
}: {
  iconName: string | null;
  className?: string;
}) {
  if (!iconName) return <Tag className={className} />;
  const IconComp = (Icons as unknown as Record<string, Icons.LucideIcon>)[
    iconName
  ] || Tag;
  return <IconComp className={className} />;
}

export function CategoriaListItem({
  categoria,
  isExpanded,
  onToggleExpand,
  onEditar,
  onDeletar,
  onCriarSubcategoria,
  onDeletarSubcategoria,
  isCriandoSubcategoria = false,
}: CategoriaListItemProps) {
  const [novaSubcategoriaNome, setNovaSubcategoriaNome] = useState("");
  const [mostrarAddSubcategoria, setMostrarAddSubcategoria] = useState(false);
  const [isSubmittingSub, setIsSubmittingSub] = useState(false);

  const corHex = categoria.cor_hex || "#1F4E79";
  const isReceita = categoria.tipo === TipoCategoria.RECEITA;
  const subcategoriasCount = categoria.subcategorias?.length || 0;

  const handleAddSubcategoria = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!novaSubcategoriaNome.trim()) return;

    try {
      setIsSubmittingSub(true);
      await onCriarSubcategoria(categoria.id, novaSubcategoriaNome.trim());
      setNovaSubcategoriaNome("");
      setMostrarAddSubcategoria(false);
    } finally {
      setIsSubmittingSub(false);
    }
  };

  return (
    <div
      className={cn(
        "group rounded-xl border border-border/40 bg-card transition-all duration-200 hover:border-border/80 hover:shadow-xs",
        isExpanded && "border-border/70 shadow-xs bg-card/95"
      )}
    >
      {/* Linha Principal da Categoria */}
      <div className="flex items-center justify-between p-3 sm:px-4 sm:py-3 gap-3">
        {/* Lado Esquerdo: Ícone + Expansão + Nome */}
        <div className="flex items-center gap-3 min-w-0 flex-1">
          {/* Botão para Expandir/Recolher Subcategorias */}
          <button
            type="button"
            onClick={onToggleExpand}
            className="flex h-7 w-7 items-center justify-center rounded-lg text-muted-foreground hover:bg-accent hover:text-foreground transition-colors shrink-0 cursor-pointer"
            title={isExpanded ? "Recolher subcategorias" : "Expandir subcategorias"}
          >
            {isExpanded ? (
              <ChevronDown className="h-4 w-4 text-[#1F4E79]" />
            ) : (
              <ChevronRight className="h-4 w-4" />
            )}
          </button>

          {/* Badge/Ícone Visual da Categoria */}
          <div
            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl text-white shadow-2xs transition-transform duration-200 group-hover:scale-105"
            style={{ backgroundColor: corHex }}
          >
            <CategoriaIcon iconName={categoria.icone} className="h-4.5 w-4.5" />
          </div>

          {/* Nome e Badges */}
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="font-semibold text-foreground text-sm truncate">
                {categoria.nome}
              </span>

              <Badge
                variant="outline"
                className={cn(
                  "text-[10px] px-2 py-0 h-4 font-medium border-0",
                  isReceita
                    ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"
                    : "bg-rose-500/10 text-rose-600 dark:text-rose-400"
                )}
              >
                {categoria.tipo_label}
              </Badge>

              {categoria.e_do_sistema ? (
                <Badge
                  variant="secondary"
                  className="text-[9px] px-1.5 py-0 h-4 bg-accent/70 text-muted-foreground gap-1"
                >
                  <Lock className="h-2.5 w-2.5" /> Sistema
                </Badge>
              ) : (
                <Badge
                  variant="outline"
                  className="text-[9px] px-1.5 py-0 h-4 border-border/60 text-muted-foreground"
                >
                  Personalizada
                </Badge>
              )}
            </div>
          </div>
        </div>

        {/* Lado Direito: Contagem de Subcategorias + Ações Rápidas */}
        <div className="flex items-center gap-2 shrink-0">
          {/* Tag de quantidade de subcategorias */}
          <button
            type="button"
            onClick={onToggleExpand}
            className="flex items-center gap-1.5 px-2 py-1 text-xs text-muted-foreground hover:text-foreground rounded-md hover:bg-accent transition-colors cursor-pointer"
          >
            <FolderOpen className="h-3.5 w-3.5" />
            <span className="font-medium text-[11px] sm:text-xs">
              {subcategoriasCount}{" "}
              <span className="hidden xs:inline">
                {subcategoriasCount === 1 ? "subcategoria" : "subcategorias"}
              </span>
            </span>
          </button>

          {/* Botão rápido para adicionar subcategoria */}
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => {
              if (!isExpanded) onToggleExpand();
              setMostrarAddSubcategoria(true);
            }}
            className="h-8 px-2 text-xs font-medium text-[#1F4E79] hover:bg-[#1F4E79]/10 rounded-lg gap-1 hidden sm:flex cursor-pointer"
            title="Adicionar subcategoria"
          >
            <Plus className="h-3.5 w-3.5" />
            <span className="hidden md:inline">Subcategoria</span>
          </Button>

          {/* Menu de Ações (Apenas para categorias personalizadas) */}
          {!categoria.e_do_sistema && (
            <DropdownMenu>
              <DropdownMenuTrigger className="h-8 w-8 rounded-lg text-muted-foreground hover:text-foreground flex items-center justify-center hover:bg-accent cursor-pointer transition-colors">
                <MoreVertical className="h-4 w-4" />
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="rounded-xl">
                <DropdownMenuItem
                  onClick={() => onEditar(categoria)}
                  className="gap-2 cursor-pointer"
                >
                  <Edit2 className="h-4 w-4 text-muted-foreground" />
                  <span>Editar Categoria</span>
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() => onDeletar(categoria)}
                  className="gap-2 text-red-600 dark:text-red-400 focus:text-red-600 cursor-pointer"
                >
                  <Trash2 className="h-4 w-4" />
                  <span>Excluir Categoria</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          )}
        </div>
      </div>

      {/* Conteúdo Expandido (Accordion de Subcategorias) */}
      {isExpanded && (
        <div className="border-t border-border/40 bg-accent/20 p-3 sm:px-4 sm:py-3 rounded-b-xl space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-semibold tracking-wider text-muted-foreground uppercase">
              Subcategorias ({subcategoriasCount})
            </span>

            {!mostrarAddSubcategoria && (
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setMostrarAddSubcategoria(true)}
                className="h-7 px-2 text-xs font-medium text-[#1F4E79] border-[#1F4E79]/30 hover:bg-[#1F4E79]/10 rounded-md gap-1"
              >
                <Plus className="h-3 w-3" /> Adicionar
              </Button>
            )}
          </div>

          {/* Formulário Inline para Nova Subcategoria */}
          {mostrarAddSubcategoria && (
            <form
              onSubmit={handleAddSubcategoria}
              className="flex items-center gap-2 pt-1 max-w-md"
            >
              <Input
                autoFocus
                value={novaSubcategoriaNome}
                onChange={(e) => setNovaSubcategoriaNome(e.target.value)}
                placeholder="Nome da subcategoria..."
                className="h-8 text-xs rounded-lg bg-background"
              />
              <Button
                type="submit"
                size="sm"
                disabled={
                  isSubmittingSub ||
                  isCriandoSubcategoria ||
                  !novaSubcategoriaNome.trim()
                }
                className="h-8 px-3 text-xs bg-[#1F4E79] hover:bg-[#1F4E79]/90 text-white rounded-lg cursor-pointer"
              >
                Salvar
              </Button>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => {
                  setMostrarAddSubcategoria(false);
                  setNovaSubcategoriaNome("");
                }}
                className="h-8 px-2 text-xs text-muted-foreground rounded-lg cursor-pointer"
              >
                Cancelar
              </Button>
            </form>
          )}

          {/* Chips/Pills das Subcategorias */}
          {categoria.subcategorias && categoria.subcategorias.length > 0 ? (
            <div className="flex flex-wrap gap-1.5">
              {categoria.subcategorias.map((sub) => (
                <div
                  key={sub.id}
                  className="group/sub flex items-center gap-1.5 rounded-lg border border-border/50 bg-background px-2.5 py-1 text-xs text-foreground transition-all hover:border-border hover:shadow-2xs"
                >
                  <span className="font-medium text-xs">{sub.nome}</span>
                  <button
                    type="button"
                    onClick={() => onDeletarSubcategoria(sub)}
                    className="opacity-60 group-hover/sub:opacity-100 transition-opacity text-muted-foreground hover:text-red-500 cursor-pointer ml-0.5"
                    title="Excluir subcategoria"
                  >
                    <Trash2 className="h-3 w-3" />
                  </button>
                </div>
              ))}
            </div>
          ) : (
            !mostrarAddSubcategoria && (
              <p className="text-xs text-muted-foreground italic">
                Nenhuma subcategoria cadastrada para {categoria.nome}.
              </p>
            )
          )}
        </div>
      )}
    </div>
  );
}
