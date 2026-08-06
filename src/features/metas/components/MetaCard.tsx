"use client";

import { Meta, StatusMeta } from "@/types/metas";
import { formatarData, formatarMoeda } from "@/utils/formatters";
import {
  Target,
  PiggyBank,
  Home,
  Car,
  Plane,
  GraduationCap,
  Laptop,
  HeartPulse,
  Sparkles,
  Plus,
  Pencil,
  Trash2,
  ListOrdered,
  Calendar,
  CheckCircle2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

interface MetaCardProps {
  meta: Meta;
  onAporteResgate: (meta: Meta) => void;
  onEditar: (meta: Meta) => void;
  onDeletar: (meta: Meta) => void;
  onVerDetalhes: (meta: Meta) => void;
}

const iconeMap: Record<string, React.ElementType> = {
  target: Target,
  piggy: PiggyBank,
  home: Home,
  car: Car,
  plane: Plane,
  graduation: GraduationCap,
  laptop: Laptop,
  heart: HeartPulse,
  sparkles: Sparkles,
};

export function MetaCard({
  meta,
  onAporteResgate,
  onEditar,
  onDeletar,
  onVerDetalhes,
}: MetaCardProps) {
  const IconeComponent = meta.icone && iconeMap[meta.icone] ? iconeMap[meta.icone] : Target;
  const corHex = meta.cor_hex || "#1F4E79";
  const isConcluida = meta.status === StatusMeta.CONCLUIDA;
  const isCancelada = meta.status === StatusMeta.CANCELADA;

  return (
    <div
      className={cn(
        "group relative flex flex-col justify-between rounded-[20px] border border-border/60 bg-card p-6 shadow-sm transition-all duration-200 hover:shadow-md hover:border-border",
        isConcluida && "border-green-500/30 bg-green-500/5",
        isCancelada && "opacity-60"
      )}
    >
      {/* Indicador Lateral de Cor Personalizada */}
      <div
        className="absolute left-0 top-6 bottom-6 w-1.5 rounded-r-full transition-all"
        style={{ backgroundColor: corHex }}
      />

      <div className="pl-3 space-y-4">
        {/* Header do Card */}
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-3">
            <div
              className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl text-white shadow-sm"
              style={{ backgroundColor: corHex }}
            >
              <IconeComponent className="h-6 w-6" />
            </div>
            <div>
              <h3 className="font-bold text-foreground text-base tracking-tight leading-tight">
                {meta.nome}
              </h3>
              {meta.descricao && (
                <p className="text-xs text-muted-foreground line-clamp-1 mt-0.5">
                  {meta.descricao}
                </p>
              )}
            </div>
          </div>

          <Badge
            variant="outline"
            className={cn(
              "text-xs px-2.5 py-0.5 font-semibold rounded-full border-0",
              meta.status === StatusMeta.EM_ANDAMENTO && "bg-amber-500/10 text-amber-600 dark:text-amber-400",
              meta.status === StatusMeta.CONCLUIDA && "bg-green-500/10 text-green-600 dark:text-green-400",
              meta.status === StatusMeta.CANCELADA && "bg-muted text-muted-foreground"
            )}
          >
            {meta.status === StatusMeta.CONCLUIDA && <CheckCircle2 className="h-3 w-3 mr-1 inline" />}
            {meta.status_label}
          </Badge>
        </div>

        {/* Valores e Progresso */}
        <div className="space-y-2 pt-1">
          <div className="flex items-baseline justify-between">
            <span className="text-xs text-muted-foreground">Acumulado</span>
            <span className="text-xs text-muted-foreground">Alvo</span>
          </div>

          <div className="flex items-baseline justify-between">
            <span className="text-xl font-extrabold text-foreground tracking-tight">
              {formatarMoeda(meta.valor_atual)}
            </span>
            <span className="text-sm font-semibold text-muted-foreground">
              {formatarMoeda(meta.valor_alvo)}
            </span>
          </div>

          {/* Barra de Progresso Customizada */}
          <div className="space-y-1.5 pt-1">
            <div className="h-2.5 w-full rounded-full bg-accent overflow-hidden">
              <div
                className="h-full rounded-full transition-all duration-500"
                style={{
                  width: `${Math.min(100, Math.max(0, meta.percentual_atingido))}%`,
                  backgroundColor: isConcluida ? "#22C55E" : corHex,
                }}
              />
            </div>
            <div className="flex items-center justify-between text-xs">
              <span className="font-semibold" style={{ color: isConcluida ? "#22C55E" : corHex }}>
                {meta.percentual_atingido.toFixed(1)}% concluído
              </span>
              <span className="text-muted-foreground">
                Faltam {formatarMoeda(meta.valor_restante)}
              </span>
            </div>
          </div>
        </div>

        {/* Data Limite */}
        {meta.data_limite && (
          <div className="flex items-center gap-1.5 text-xs text-muted-foreground pt-1 border-t border-border/40">
            <Calendar className="h-3.5 w-3.5" />
            <span>Prazo: {formatarData(meta.data_limite)}</span>
          </div>
        )}
      </div>

      {/* Footer / Ações do Card */}
      <div className="pl-3 mt-6 flex items-center justify-between gap-2 border-t border-border/40 pt-4">
        <Button
          onClick={() => onAporteResgate(meta)}
          disabled={isCancelada}
          size="sm"
          className="rounded-[10px] bg-[#1F4E79] hover:bg-[#1F4E79]/90 text-white font-medium text-xs gap-1.5 shadow-sm"
        >
          <Plus className="h-3.5 w-3.5" />
          <span>Aporte / Resgate</span>
        </Button>

        <div className="flex items-center gap-1">
          <Button
            onClick={() => onVerDetalhes(meta)}
            variant="ghost"
            size="icon"
            className="h-8 w-8 rounded-lg text-muted-foreground hover:text-foreground"
            title="Extrato de movimentações"
          >
            <ListOrdered className="h-4 w-4" />
          </Button>

          <Button
            onClick={() => onEditar(meta)}
            variant="ghost"
            size="icon"
            className="h-8 w-8 rounded-lg text-muted-foreground hover:text-foreground"
            title="Editar Meta"
          >
            <Pencil className="h-4 w-4" />
          </Button>

          <Button
            onClick={() => onDeletar(meta)}
            variant="ghost"
            size="icon"
            className="h-8 w-8 rounded-lg text-muted-foreground hover:text-red-500"
            title="Excluir Meta"
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}
