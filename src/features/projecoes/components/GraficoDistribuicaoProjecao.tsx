"use client";

import { useMemo } from "react";
import { ProjecaoCategoriaItem } from "@/types/projecoes";
import { formatarMoeda, formatarPercentual } from "@/utils/formatters";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { PieChart, ArrowDownRight, Tag } from "lucide-react";
import * as Icons from "lucide-react";

interface GraficoDistribuicaoProjecaoProps {
  categorias: ProjecaoCategoriaItem[];
  periodoMeses: number;
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

export function GraficoDistribuicaoProjecao({
  categorias,
  periodoMeses,
}: GraficoDistribuicaoProjecaoProps) {
  const { topDespesas, totalGeralDespesas } = useMemo(() => {
    const despesas = categorias.filter((c) => c.tipo === "despesa");
    const total = despesas.reduce((acc, c) => acc + c.total_periodo, 0);
    const top = despesas.slice(0, 6);
    return { topDespesas: top, totalGeralDespesas: total };
  }, [categorias]);

  if (topDespesas.length === 0) return null;

  return (
    <Card className="rounded-2xl border-border bg-card shadow-xs">
      <CardHeader className="p-5 pb-3">
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-base font-bold text-foreground flex items-center gap-2">
              <PieChart className="h-4 w-4 text-[#1F4E79] dark:text-sky-400" />
              <span>Maiores Despesas Projetadas ({periodoMeses}M)</span>
            </CardTitle>
            <p className="text-xs text-muted-foreground mt-0.5">
              Categorias com maior impacto acumulado no horizonte selecionado
            </p>
          </div>
          <span className="text-xs font-bold text-foreground">
            Total: {formatarMoeda(totalGeralDespesas)}
          </span>
        </div>
      </CardHeader>

      <CardContent className="p-5 pt-1 space-y-4">
        {topDespesas.map((cat) => {
          const percentual =
            totalGeralDespesas > 0
              ? (cat.total_periodo / totalGeralDespesas) * 100
              : 0;
          const corHex = cat.cor_hex || "#1F4E79";

          return (
            <div key={cat.categoria_id} className="space-y-1.5">
              <div className="flex items-center justify-between text-xs">
                <div className="flex items-center gap-2">
                  <div
                    className="w-5 h-5 rounded-md flex items-center justify-center shrink-0"
                    style={{ backgroundColor: `${corHex}15`, color: corHex }}
                  >
                    <CategoriaIcon
                      iconName={cat.icone}
                      className="h-3 w-3"
                    />
                  </div>
                  <span className="font-semibold text-foreground">
                    {cat.nome}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="font-bold text-foreground">
                    {formatarMoeda(cat.total_periodo)}
                  </span>
                  <span className="text-[11px] text-muted-foreground w-12 text-right">
                    {formatarPercentual(percentual)}
                  </span>
                </div>
              </div>

              {/* Barra de Progresso com Cor da Categoria */}
              <div className="w-full bg-muted/60 rounded-full h-2 overflow-hidden">
                <div
                  className="h-full rounded-full transition-all duration-500"
                  style={{
                    width: `${Math.min(100, percentual)}%`,
                    backgroundColor: corHex,
                  }}
                />
              </div>
            </div>
          );
        })}
      </CardContent>
    </Card>
  );
}
