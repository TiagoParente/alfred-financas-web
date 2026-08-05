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
import { MoreVertical, Plus, Trash2, Edit2, Lock, Tag } from "lucide-react";

interface CategoriaCardProps {
  categoria: Categoria;
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

export function CategoriaCard({
  categoria,
  onEditar,
  onDeletar,
  onCriarSubcategoria,
  onDeletarSubcategoria,
  isCriandoSubcategoria = false,
}: CategoriaCardProps) {
  const [novaSubcategoriaNome, setNovaSubcategoriaNome] = useState("");
  const [mostrarAddSubcategoria, setMostrarAddSubcategoria] = useState(false);
  const [isSubmittingSub, setIsSubmittingSub] = useState(false);

  const corHex = categoria.cor_hex || "#1F4E79";
  const isReceita = categoria.tipo === TipoCategoria.RECEITA;

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
    <div className="flex flex-col justify-between rounded-[16px] border border-border/40 bg-card p-5 shadow-sm hover:shadow-md transition-shadow space-y-4">
      {/* Header do Card */}
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-3">
          <div
            className="flex h-11 w-11 items-center justify-center rounded-2xl text-white shadow-sm"
            style={{ backgroundColor: corHex }}
          >
            <CategoriaIcon iconName={categoria.icone} className="h-5.5 w-5.5" />
          </div>
          <div>
            <h4 className="font-semibold text-foreground text-base leading-snug">
              {categoria.nome}
            </h4>
            <div className="flex items-center gap-2 mt-1">
              <Badge
                variant="outline"
                className={
                  isReceita
                    ? "border-emerald-500/30 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 font-medium text-[11px]"
                    : "border-rose-500/30 bg-rose-500/10 text-rose-600 dark:text-rose-400 font-medium text-[11px]"
                }
              >
                {categoria.tipo_label}
              </Badge>

              {categoria.e_do_sistema ? (
                <Badge
                  variant="secondary"
                  className="text-[10px] bg-accent/60 text-muted-foreground gap-1"
                >
                  <Lock className="h-3 w-3" /> Sistema
                </Badge>
              ) : (
                <Badge
                  variant="outline"
                  className="text-[10px] border-border/60 text-muted-foreground"
                >
                  Personalizada
                </Badge>
              )}
            </div>
          </div>
        </div>

        {/* Menu de Ações (Apenas se não for do sistema) */}
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

      {/* Seção de Subcategorias */}
      <div className="space-y-2 pt-2 border-t border-border/30">
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            Subcategorias ({categoria.subcategorias?.length || 0})
          </span>

          {!mostrarAddSubcategoria && (
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => setMostrarAddSubcategoria(true)}
              className="h-7 px-2 text-xs font-medium text-[#1F4E79] hover:text-[#1F4E79] hover:bg-[#1F4E79]/10 gap-1 rounded-lg"
            >
              <Plus className="h-3.5 w-3.5" /> Subcategoria
            </Button>
          )}
        </div>

        {/* Form inline para adicionar subcategoria */}
        {mostrarAddSubcategoria && (
          <form
            onSubmit={handleAddSubcategoria}
            className="flex items-center gap-2 pt-1"
          >
            <Input
              autoFocus
              value={novaSubcategoriaNome}
              onChange={(e) => setNovaSubcategoriaNome(e.target.value)}
              placeholder="Nome da subcategoria..."
              className="h-8 text-xs rounded-lg"
            />
            <Button
              type="submit"
              size="sm"
              disabled={
                isSubmittingSub || isCriandoSubcategoria || !novaSubcategoriaNome.trim()
              }
              className="h-8 px-3 text-xs bg-[#1F4E79] hover:bg-[#1F4E79]/90 text-white rounded-lg"
            >
              Add
            </Button>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => {
                setMostrarAddSubcategoria(false);
                setNovaSubcategoriaNome("");
              }}
              className="h-8 px-2 text-xs text-muted-foreground rounded-lg"
            >
              Cancelar
            </Button>
          </form>
        )}

        {/* Lista de Subcategorias */}
        {categoria.subcategorias && categoria.subcategorias.length > 0 ? (
          <div className="flex flex-wrap gap-1.5 pt-1">
            {categoria.subcategorias.map((sub) => (
              <div
                key={sub.id}
                className="group flex items-center gap-1.5 rounded-lg bg-accent/40 px-2.5 py-1 text-xs text-foreground transition-colors hover:bg-accent"
              >
                <span>{sub.nome}</span>
                <button
                  type="button"
                  onClick={() => onDeletarSubcategoria(sub)}
                  className="opacity-0 group-hover:opacity-100 transition-opacity text-muted-foreground hover:text-red-500"
                  title="Excluir subcategoria"
                >
                  <Trash2 className="h-3 w-3" />
                </button>
              </div>
            ))}
          </div>
        ) : (
          !mostrarAddSubcategoria && (
            <p className="text-xs text-muted-foreground italic py-1">
              Nenhuma subcategoria cadastrada.
            </p>
          )
        )}
      </div>
    </div>
  );
}
