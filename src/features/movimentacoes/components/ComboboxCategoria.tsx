"use client";

import { useState, useMemo } from "react";
import { Combobox } from "@base-ui/react/combobox";
import { Search, ChevronDown, X, Check } from "lucide-react";
import { Categoria } from "@/types/categorias";
import { cn } from "@/lib/utils";

// ─── Tipos ────────────────────────────────────────────────────────────────────

/** Item normalizado para renderização no combobox */
interface ItemCategoria {
  /** "cat:ID" ou "sub:ID" */
  valor: string;
  /** Texto exibido na lista */
  nome: string;
  /** Texto completo para pesquisa (incluindo nome da categoria pai) */
  textoCompleto: string;
  /** true = item de subcategoria (indentado) */
  isSubcategoria: boolean;
  /** Nome da categoria pai */
  nomeCategoriaPai?: string;
}

// ─── Props ────────────────────────────────────────────────────────────────────

interface ComboboxCategoriaProps {
  categorias: Categoria[];
  valorSelecionado?: string; // "cat:ID" | "sub:ID" | undefined
  onChange: (valor: string | null) => void;
  placeholder?: string;
  hasError?: boolean;
  disabled?: boolean;
  className?: string;
}

// ─── Componente ───────────────────────────────────────────────────────────────

export function ComboboxCategoria({
  categorias,
  valorSelecionado,
  onChange,
  placeholder = "Todas as Categorias",
  hasError = false,
  disabled = false,
  className,
}: ComboboxCategoriaProps) {
  const [inputValue, setInputValue] = useState("");

  // ── Label exibida no trigger ─────────────────────────────────────────────────
  const labelSelecionada = useMemo(() => {
    if (!valorSelecionado) return "";
    if (valorSelecionado.startsWith("cat:")) {
      const id = parseInt(valorSelecionado.slice(4), 10);
      return categorias.find((c) => Number(c.id) === id)?.nome ?? "";
    }
    if (valorSelecionado.startsWith("sub:")) {
      const id = parseInt(valorSelecionado.slice(4), 10);
      for (const cat of categorias) {
        const sub = cat.subcategorias?.find((s) => Number(s.id) === id);
        if (sub) return `${cat.nome} › ${sub.nome}`;
      }
    }
    return "";
  }, [valorSelecionado, categorias]);

  // ── Itens normalizados (flatten hierárquico) ──────────────────────────────────
  const itens = useMemo<ItemCategoria[]>(() => {
    const lista: ItemCategoria[] = [];
    for (const cat of categorias) {
      const subs = cat.subcategorias?.filter((s) => s.ativo) ?? [];
      
      // Adiciona a categoria pai como opção selecionável
      lista.push({
        valor: `cat:${cat.id}`,
        nome: cat.nome,
        textoCompleto: cat.nome,
        isSubcategoria: false,
      });

      // Se houver subcategorias ativas, adiciona cada uma como opção indentada
      if (subs.length > 0) {
        subs.forEach((sub) => {
          lista.push({
            valor: `sub:${sub.id}`,
            nome: sub.nome,
            textoCompleto: `${cat.nome} ${sub.nome}`,
            isSubcategoria: true,
            nomeCategoriaPai: cat.nome,
          });
        });
      }
    }
    return lista;
  }, [categorias]);

  // ── Filtragem por busca ───────────────────────────────────────────────────────
  const itensFiltrados = useMemo(() => {
    if (!inputValue.trim()) return itens;
    const q = inputValue.toLowerCase().trim();
    return itens.filter((item) =>
      item.textoCompleto.toLowerCase().includes(q)
    );
  }, [itens, inputValue]);

  // ─── Render ──────────────────────────────────────────────────────────────────
  return (
    <Combobox.Root
      value={valorSelecionado ?? null}
      onValueChange={(val) => {
        onChange(val);
        setInputValue("");
      }}
      onInputValueChange={setInputValue}
      disabled={disabled}
    >
      {/* Trigger estilizado idêntico ao SelectTrigger */}
      <Combobox.Trigger
        className={cn(
          "flex h-10 items-center justify-between gap-2 rounded-xl border border-border/60 bg-background/60 py-2 px-3.5 text-xs font-medium overflow-hidden transition-colors outline-none select-none dark:bg-input/30 dark:hover:bg-input/50",
          "focus-visible:border-ring focus-visible:ring-2 focus-visible:ring-ring/50",
          "disabled:cursor-not-allowed disabled:opacity-50",
          hasError && "border-destructive ring-2 ring-destructive/20",
          className ?? "w-full"
        )}
      >
        <div className="flex-1 min-w-0 overflow-hidden">
          <Combobox.Value
            placeholder={
              <span className="text-muted-foreground truncate block">{placeholder}</span>
            }
          >
            {() =>
              valorSelecionado ? (
                <span className="block truncate font-medium text-foreground">
                  {labelSelecionada}
                </span>
              ) : (
                <span className="block truncate text-muted-foreground font-medium">
                  {placeholder}
                </span>
              )
            }
          </Combobox.Value>
        </div>

        <div className="flex items-center gap-0.5 shrink-0">
          {/* Botão limpar seleção */}
          {valorSelecionado && (
            <button
              type="button"
              tabIndex={-1}
              onClick={(e) => {
                e.stopPropagation();
                onChange(null);
                setInputValue("");
              }}
              className="p-0.5 rounded hover:bg-muted transition-colors"
              aria-label="Limpar categoria"
            >
              <X className="h-3 w-3 text-muted-foreground" />
            </button>
          )}
          <ChevronDown className="h-4 w-4 text-muted-foreground pointer-events-none" />
        </div>
      </Combobox.Trigger>

      {/* Popup com busca + lista */}
      <Combobox.Portal>
        <Combobox.Positioner sideOffset={4} className="isolate z-50">
          <Combobox.Popup
            className={cn(
              "relative isolate z-50 w-(--anchor-width) min-w-48 origin-(--transform-origin)",
              "overflow-hidden rounded-xl bg-popover text-popover-foreground",
              "shadow-md ring-1 ring-foreground/10",
              "duration-100 data-open:animate-in data-open:fade-in-0 data-open:zoom-in-95",
              "data-closed:animate-out data-closed:fade-out-0 data-closed:zoom-out-95",
              "data-[side=bottom]:slide-in-from-top-2 data-[side=top]:slide-in-from-bottom-2"
            )}
          >
            {/* Campo de busca */}
            <div className="flex items-center gap-2 px-3 py-2.5 border-b border-border/50">
              <Search className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
              <Combobox.Input
                autoFocus
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                placeholder="Buscar categoria..."
                className={cn(
                  "flex-1 bg-transparent text-xs text-foreground outline-none placeholder:text-muted-foreground",
                  "caret-foreground"
                )}
              />
              {inputValue && (
                <button
                  type="button"
                  tabIndex={-1}
                  onClick={() => setInputValue("")}
                  className="p-0.5 rounded hover:bg-muted transition-colors"
                >
                  <X className="h-3 w-3 text-muted-foreground" />
                </button>
              )}
            </div>

            {/* Lista de itens */}
            <Combobox.List
              className="max-h-[260px] overflow-y-auto p-1 overscroll-contain"
            >
              {itensFiltrados.length === 0 ? (
                <Combobox.Empty className="py-6 text-center text-xs text-muted-foreground">
                  Nenhuma categoria encontrada
                </Combobox.Empty>
              ) : (
                itensFiltrados.map((item) => (
                  <Combobox.Item
                    key={item.valor}
                    value={item.valor}
                    className={cn(
                      "relative flex w-full cursor-default select-none items-center rounded-md py-1.5 text-xs outline-none transition-colors",
                      "focus:bg-accent focus:text-accent-foreground",
                      "data-highlighted:bg-accent data-highlighted:text-accent-foreground",
                      "data-selected:font-medium",
                      "data-disabled:pointer-events-none data-disabled:opacity-50",
                      item.isSubcategoria
                        ? "pl-5 pr-8 text-muted-foreground focus:text-foreground"
                        : "pl-2 pr-8 font-semibold text-foreground"
                    )}
                  >
                    {item.isSubcategoria && (
                      <span className="mr-1.5 text-muted-foreground text-[10px]">
                        ↳
                      </span>
                    )}
                    <span className="flex-1 truncate">{item.nome}</span>
                    <Combobox.ItemIndicator className="absolute right-2 flex h-4 w-4 items-center justify-center">
                      <Check className="h-3 w-3" />
                    </Combobox.ItemIndicator>
                  </Combobox.Item>
                ))
              )}
            </Combobox.List>
          </Combobox.Popup>
        </Combobox.Positioner>
      </Combobox.Portal>
    </Combobox.Root>
  );
}
