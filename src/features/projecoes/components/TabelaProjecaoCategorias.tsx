"use client";

import { useState, useMemo } from "react";
import { ProjecaoCategoriaItem, ProjecaoMesItem } from "@/types/projecoes";
import { formatarMoeda } from "@/utils/formatters";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import * as Icons from "lucide-react";
import {
  Tag,
  Search,
  Layers,
  CreditCard,
  CalendarSync,
  PieChart,
  ChevronDown,
  ChevronRight,
  TrendingDown,
  TrendingUp,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface TabelaProjecaoCategoriasProps {
  categorias: ProjecaoCategoriaItem[];
  meses: ProjecaoMesItem[];
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

export function TabelaProjecaoCategorias({
  categorias,
  meses,
}: TabelaProjecaoCategoriasProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [tipoFiltro, setTipoFiltro] = useState<"todas" | "despesa" | "receita">("despesa");
  const [categoriaExpandidaId, setCategoriaExpandidaId] = useState<number | null>(null);

  const categoriasFiltradas = useMemo(() => {
    return categorias.filter((c) => {
      if (tipoFiltro !== "todas" && c.tipo !== tipoFiltro) {
        return false;
      }
      if (searchTerm.trim()) {
        return c.nome.toLowerCase().includes(searchTerm.toLowerCase().trim());
      }
      return true;
    });
  }, [categorias, tipoFiltro, searchTerm]);

  const toggleExpand = (catId: number) => {
    setCategoriaExpandidaId((prev) => (prev === catId ? null : catId));
  };

  return (
    <Card className="rounded-2xl border-border bg-card shadow-xs w-full overflow-hidden">
      {/* Header elegante e alinhado */}
      <CardHeader className="p-5 pb-4 border-b border-border/50 bg-card">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          {/* Lado Esquerdo: Título, Subtítulo e Contador */}
          <div className="space-y-1">
            <div className="flex items-center gap-2.5">
              <div className="p-2 rounded-xl bg-[#1F4E79]/10 text-[#1F4E79] dark:bg-sky-500/10 dark:text-sky-400">
                <Layers className="h-4 w-4" />
              </div>
              <div className="flex items-center gap-2">
                <CardTitle className="text-base font-bold text-foreground tracking-tight">
                  Projeção Detalhada por Categoria
                </CardTitle>
                <Badge
                  variant="secondary"
                  className="text-[11px] px-2 py-0.5 font-medium bg-muted text-muted-foreground"
                >
                  {categoriasFiltradas.length} {categoriasFiltradas.length === 1 ? "categoria" : "categorias"}
                </Badge>
              </div>
            </div>
            <p className="text-xs text-muted-foreground pl-9">
              Desdobramento mensal de contas fixas, faturas/parcelas de cartão e orçamentos planejados
            </p>
          </div>

          {/* Lado Direito: Controles de Filtro e Busca em linha única */}
          <div className="flex items-center gap-2.5 flex-wrap sm:flex-nowrap">
            {/* Segmented Buttons de Tipo */}
            <div className="inline-flex rounded-xl bg-muted/60 p-1 border border-border/50 text-xs shrink-0">
              <button
                type="button"
                onClick={() => setTipoFiltro("despesa")}
                className={cn(
                  "px-3 py-1.5 font-semibold rounded-lg transition-all flex items-center gap-1.5",
                  tipoFiltro === "despesa"
                    ? "bg-rose-500/15 text-rose-600 dark:text-rose-400 shadow-2xs border border-rose-500/20"
                    : "text-muted-foreground hover:text-foreground"
                )}
              >
                <TrendingDown className="h-3.5 w-3.5" />
                <span>Despesas</span>
              </button>
              <button
                type="button"
                onClick={() => setTipoFiltro("receita")}
                className={cn(
                  "px-3 py-1.5 font-semibold rounded-lg transition-all flex items-center gap-1.5",
                  tipoFiltro === "receita"
                    ? "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 shadow-2xs border border-emerald-500/20"
                    : "text-muted-foreground hover:text-foreground"
                )}
              >
                <TrendingUp className="h-3.5 w-3.5" />
                <span>Receitas</span>
              </button>
              <button
                type="button"
                onClick={() => setTipoFiltro("todas")}
                className={cn(
                  "px-3 py-1.5 font-medium rounded-lg transition-all",
                  tipoFiltro === "todas"
                    ? "bg-background text-foreground font-semibold shadow-2xs border border-border/60"
                    : "text-muted-foreground hover:text-foreground"
                )}
              >
                Todas
              </button>
            </div>

            {/* Input de Busca com ícone */}
            <div className="relative w-full sm:w-60">
              <Search className="absolute left-2.5 top-2.5 h-3.5 w-3.5 text-muted-foreground" />
              <Input
                placeholder="Filtrar por nome..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-8 h-9 text-xs bg-muted/20 border-border/70 rounded-xl focus-visible:ring-1 focus-visible:ring-[#1F4E79]"
              />
            </div>
          </div>
        </div>
      </CardHeader>

      {/* Conteúdo da Tabela */}
      <CardContent className="p-0">
        {categoriasFiltradas.length === 0 ? (
          <div className="p-12 text-center text-xs text-muted-foreground space-y-2">
            <Layers className="h-8 w-8 mx-auto text-muted-foreground/40" />
            <p className="font-medium text-foreground">Nenhuma categoria encontrada</p>
            <p className="text-muted-foreground">Tente alterar os termos de busca ou o filtro de tipo.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left border-collapse">
              <thead>
                <tr className="border-b border-border/60 bg-muted/30 text-muted-foreground font-semibold uppercase tracking-wider text-[10px]">
                  <th className="py-3 px-5 min-w-[220px]">Categoria</th>
                  <th className="py-3 px-3 text-right min-w-[110px]">Total Período</th>
                  <th className="py-3 px-3 text-right min-w-[100px]">Média / Mês</th>
                  {meses.map((m) => (
                    <th
                      key={m.mes_ano}
                      className="py-3 px-4 text-right min-w-[115px]"
                    >
                      <div className="flex flex-col items-end">
                        <span className="text-foreground font-bold">{m.nome_mes}/{m.ano.toString().slice(-2)}</span>
                        <span className="text-[9px] font-normal lowercase tracking-normal">
                          {m.is_projecao ? "projeção" : "atual"}
                        </span>
                      </div>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-border/40">
                {categoriasFiltradas.map((cat) => {
                  const isExpandida = categoriaExpandidaId === cat.categoria_id;
                  const corHex = cat.cor_hex || "#1F4E79";

                  return (
                    <tr key={cat.categoria_id} className="contents">
                      <tr
                        onClick={() => toggleExpand(cat.categoria_id)}
                        className="hover:bg-muted/30 transition-colors cursor-pointer group"
                      >
                        {/* Nome da Categoria */}
                        <td className="py-3.5 px-5">
                          <div className="flex items-center gap-3">
                            <button
                              type="button"
                              className="text-muted-foreground group-hover:text-foreground transition-colors p-0.5 rounded-md hover:bg-muted"
                            >
                              {isExpandida ? (
                                <ChevronDown className="h-3.5 w-3.5" />
                              ) : (
                                <ChevronRight className="h-3.5 w-3.5" />
                              )}
                            </button>
                            <div
                              className="w-7 h-7 rounded-lg flex items-center justify-center shrink-0 shadow-2xs"
                              style={{ backgroundColor: `${corHex}15`, color: corHex }}
                            >
                              <CategoriaIcon
                                iconName={cat.icone}
                                className="h-3.5 w-3.5"
                              />
                            </div>
                            <div>
                              <span className="font-semibold text-foreground">
                                {cat.nome}
                              </span>
                              <div className="flex items-center gap-1.5 mt-0.5 text-[10px] text-muted-foreground">
                                <span
                                  className={cn(
                                    "capitalize font-medium",
                                    cat.tipo === "receita"
                                      ? "text-emerald-600 dark:text-emerald-400"
                                      : "text-rose-600 dark:text-rose-400"
                                  )}
                                >
                                  {cat.tipo}
                                </span>
                              </div>
                            </div>
                          </div>
                        </td>

                        {/* Total Período */}
                        <td className="py-3.5 px-3 text-right font-bold text-foreground">
                          {formatarMoeda(cat.total_periodo)}
                        </td>

                        {/* Média Mensal */}
                        <td className="py-3.5 px-3 text-right font-medium text-muted-foreground">
                          {formatarMoeda(cat.media_mensal)}
                        </td>

                        {/* Colunas por Mês */}
                        {meses.map((m) => {
                          const detalheMes = cat.meses[m.mes_ano];
                          const totalMes = detalheMes?.total ?? 0;

                          return (
                            <td
                              key={m.mes_ano}
                              className="py-3.5 px-4 text-right font-medium text-foreground"
                            >
                              {totalMes > 0 ? (
                                <div>
                                  <span className="font-semibold">{formatarMoeda(totalMes)}</span>
                                  {detalheMes?.parcelas > 0 && (
                                    <div className="text-[10px] text-amber-600 dark:text-amber-400 font-normal">
                                      {formatarMoeda(detalheMes.parcelas)} parc.
                                    </div>
                                  )}
                                </div>
                              ) : (
                                <span className="text-muted-foreground/40">--</span>
                              )}
                            </td>
                          );
                        })}
                      </tr>

                      {/* Linha Expandida: Detalhamento por Origem */}
                      {isExpandida && (
                        <tr className="bg-muted/15 border-b border-border/40">
                          <td colSpan={3 + meses.length} className="p-4 pl-14">
                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-[11px]">
                              <div className="flex items-center gap-2.5 p-2.5 rounded-xl bg-card border border-border/60 shadow-2xs">
                                <CalendarSync className="h-4 w-4 text-[#1F4E79] dark:text-sky-400 shrink-0" />
                                <div>
                                  <span className="text-muted-foreground block text-[10px]">
                                    Contas Fixas / Recorrentes
                                  </span>
                                  <span className="font-semibold text-foreground">
                                    {formatarMoeda(
                                      cat.meses[meses[0]?.mes_ano]?.fixo ?? 0
                                    )}
                                    /mês
                                  </span>
                                </div>
                              </div>

                              <div className="flex items-center gap-2.5 p-2.5 rounded-xl bg-card border border-border/60 shadow-2xs">
                                <CreditCard className="h-4 w-4 text-amber-500 shrink-0" />
                                <div>
                                  <span className="text-muted-foreground block text-[10px]">
                                    Parcelas de Cartão no Período
                                  </span>
                                  <span className="font-semibold text-foreground">
                                    Total de{" "}
                                    {formatarMoeda(
                                      Object.values(cat.meses).reduce(
                                        (acc, val) => acc + (val.parcelas || 0),
                                        0
                                      )
                                    )}
                                  </span>
                                </div>
                              </div>

                              <div className="flex items-center gap-2.5 p-2.5 rounded-xl bg-card border border-border/60 shadow-2xs">
                                <PieChart className="h-4 w-4 text-emerald-500 shrink-0" />
                                <div>
                                  <span className="text-muted-foreground block text-[10px]">
                                    Média Prevista por Mês
                                  </span>
                                  <span className="font-semibold text-foreground">
                                    {formatarMoeda(cat.media_mensal)} / mês
                                  </span>
                                </div>
                              </div>
                            </div>
                          </td>
                        </tr>
                      )}
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
