"use client";

import { Search, X, Filter } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  FiltroMovimentacaoParams,
  StatusMovimentacao,
  TipoMovimentacao,
} from "@/types/movimentacoes";
import { useContasBancarias } from "@/features/contas_bancarias/hooks/useContasBancarias";
import { useCategorias } from "@/features/categorias/hooks/useCategorias";
import { ComboboxCategoria } from "./ComboboxCategoria";

interface MovimentacaoFiltrosProps {
  filtros: FiltroMovimentacaoParams;
  onFiltrosChange: (novosFiltros: FiltroMovimentacaoParams) => void;
  familiaId?: number | null;
}

export function MovimentacaoFiltros({
  filtros,
  onFiltrosChange,
  familiaId,
}: MovimentacaoFiltrosProps) {
  const { contas } = useContasBancarias(familiaId);
  const { categorias } = useCategorias(familiaId);

  const hasFiltrosAtivos = Boolean(
    filtros.busca ||
      filtros.tipo ||
      filtros.status ||
      filtros.conta_bancaria_id ||
      filtros.categoria_id
  );

  const handleLimparFiltros = () => {
    onFiltrosChange({
      data_inicio: filtros.data_inicio,
      data_fim: filtros.data_fim,
      per_page: filtros.per_page ?? 15,
      page: 1,
    });
  };

  return (
    <div className="p-4 rounded-2xl border border-border/60 bg-card/40 backdrop-blur-xs space-y-4">
      <div className="flex flex-col lg:flex-row gap-3 items-stretch lg:items-center justify-between">
        {/* Campo de Busca */}
        <div className="relative flex-1 min-w-[240px]">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Buscar por descrição..."
            value={filtros.busca ?? ""}
            onChange={(e) =>
              onFiltrosChange({
                ...filtros,
                busca: e.target.value || undefined,
                page: 1,
              })
            }
            className="pl-10 h-10 rounded-xl bg-background/60 border-border/60 focus:border-[#1F4E79] text-sm"
          />
          {filtros.busca && (
            <button
              onClick={() =>
                onFiltrosChange({ ...filtros, busca: undefined, page: 1 })
              }
              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
            >
              <X className="h-4 w-4" />
            </button>
          )}
        </div>

        {/* Filtros em Linha */}
        <div className="grid grid-cols-2 sm:grid-cols-4 lg:flex gap-2">
          {/* Tipo */}
          <Select
            value={filtros.tipo ?? "todos"}
            onValueChange={(val: string | null) =>
              onFiltrosChange({
                ...filtros,
                tipo: !val || val === "todos" ? undefined : (val as TipoMovimentacao),
                page: 1,
              })
            }
          >
            <SelectTrigger className="h-10 w-full lg:w-[155px] rounded-lg bg-background/60 border-border/60 text-xs font-medium px-3.5">
              <SelectValue placeholder="Todos os Tipos">
                {(value: unknown) => {
                  if (!value || value === "todos") {
                    return <span className="text-muted-foreground">Todos os Tipos</span>;
                  }
                  const labels: Record<string, string> = {
                    receita: "Receita",
                    despesa: "Despesa",
                    transferencia: "Transferência",
                  };
                  return <span className="text-foreground font-medium">{labels[value as string] ?? String(value)}</span>;
                }}
              </SelectValue>
            </SelectTrigger>
            <SelectContent className="rounded-md">
              <SelectItem value="todos" label="Todos os Tipos">Todos os Tipos</SelectItem>
              <SelectItem value={TipoMovimentacao.RECEITA} label="Receita">Receita</SelectItem>
              <SelectItem value={TipoMovimentacao.DESPESA} label="Despesa">Despesa</SelectItem>
              <SelectItem value={TipoMovimentacao.TRANSFERENCIA} label="Transferência">Transferência</SelectItem>
            </SelectContent>
          </Select>

          {/* Status */}
          <Select
            value={filtros.status ?? "todos"}
            onValueChange={(val: string | null) =>
              onFiltrosChange({
                ...filtros,
                status: !val || val === "todos" ? undefined : (val as StatusMovimentacao),
                page: 1,
              })
            }
          >
            <SelectTrigger className="h-10 w-full lg:w-[155px] rounded-lg bg-background/60 border-border/60 text-xs font-medium px-3.5">
              <SelectValue placeholder="Todos os Status">
                {(value: unknown) => {
                  if (!value || value === "todos") {
                    return <span className="text-muted-foreground">Todos os Status</span>;
                  }
                  const labels: Record<string, string> = {
                    pago: "Pago",
                    pendente: "Pendente",
                  };
                  return <span className="text-foreground font-medium">{labels[value as string] ?? String(value)}</span>;
                }}
              </SelectValue>
            </SelectTrigger>
            <SelectContent className="rounded-md">
              <SelectItem value="todos" label="Todos os Status">Todos os Status</SelectItem>
              <SelectItem value={StatusMovimentacao.PAGO} label="Pago">Pago</SelectItem>
              <SelectItem value={StatusMovimentacao.PENDENTE} label="Pendente">Pendente</SelectItem>
            </SelectContent>
          </Select>

          {/* Conta Bancária */}
          <Select
            value={
              filtros.conta_bancaria_id
                ? filtros.conta_bancaria_id.toString()
                : "todas"
            }
            onValueChange={(val: string | null) =>
              onFiltrosChange({
                ...filtros,
                conta_bancaria_id:
                  !val || val === "todas" ? undefined : parseInt(val, 10),
                page: 1,
              })
            }
          >
            <SelectTrigger className="h-10 w-full lg:w-[170px] rounded-lg bg-background/60 border-border/60 text-xs font-medium px-3.5">
              <SelectValue placeholder="Todas as Contas">
                {(value: unknown) => {
                  if (!value || value === "todas") {
                    return <span className="text-muted-foreground">Todas as Contas</span>;
                  }
                  const found = contas.find((c) => c.id === parseInt(value as string, 10));
                  return found ? <span className="text-foreground font-medium">{found.nome}</span> : <span className="text-muted-foreground">Todas as Contas</span>;
                }}
              </SelectValue>
            </SelectTrigger>
            <SelectContent className="rounded-md">
              <SelectItem value="todas" label="Todas as Contas">Todas as Contas</SelectItem>
              {contas.map((conta) => (
                <SelectItem key={conta.id} value={conta.id.toString()} label={conta.nome}>
                  {conta.nome}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          {/* Categoria com busca integrada */}
          <ComboboxCategoria
            categorias={categorias}
            valorSelecionado={
              filtros.categoria_id ? `cat:${filtros.categoria_id}` : undefined
            }
            onChange={(val) => {
              if (!val) {
                onFiltrosChange({ ...filtros, categoria_id: undefined, page: 1 });
              } else if (val.startsWith("cat:")) {
                onFiltrosChange({
                  ...filtros,
                  categoria_id: parseInt(val.slice(4), 10),
                  page: 1,
                });
              } else if (val.startsWith("sub:")) {
                const subId = parseInt(val.slice(4), 10);
                let parentId: number | undefined = undefined;
                for (const c of categorias) {
                  const sub = c.subcategorias?.find((s) => Number(s.id) === subId);
                  if (sub) {
                    parentId = Number(sub.categoria_id || c.id);
                    break;
                  }
                }
                onFiltrosChange({
                  ...filtros,
                  categoria_id: parentId,
                  page: 1,
                });
              }
            }}
            placeholder="Todas as Categorias"
            className="w-full lg:w-[210px]"
          />
        </div>
      </div>

      {/* Datas e Limpar Filtros */}
      <div className="flex flex-wrap items-center justify-between gap-3 pt-1 border-t border-border/30">
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          <Filter className="h-3.5 w-3.5" />
          <span>Filtrar período:</span>
          <Input
            type="date"
            value={filtros.data_inicio ?? ""}
            onChange={(e) =>
              onFiltrosChange({
                ...filtros,
                data_inicio: e.target.value || undefined,
                page: 1,
              })
            }
            className="h-8 w-36 rounded-lg text-xs bg-background/60 border-border/60 px-2"
          />
          <span>até</span>
          <Input
            type="date"
            value={filtros.data_fim ?? ""}
            onChange={(e) =>
              onFiltrosChange({
                ...filtros,
                data_fim: e.target.value || undefined,
                page: 1,
              })
            }
            className="h-8 w-36 rounded-lg text-xs bg-background/60 border-border/60 px-2"
          />
        </div>

        {hasFiltrosAtivos && (
          <Button
            variant="ghost"
            size="sm"
            onClick={handleLimparFiltros}
            className="h-8 text-xs text-muted-foreground hover:text-foreground gap-1.5 rounded-lg"
          >
            <X className="h-3.5 w-3.5" />
            <span>Limpar Filtros</span>
          </Button>
        )}
      </div>
    </div>
  );
}
