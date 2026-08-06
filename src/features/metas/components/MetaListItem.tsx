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
  Edit2,
  Trash2,
  ListOrdered,
  Calendar,
  MoreVertical,
  CheckCircle2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";

interface MetaListItemProps {
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

export function MetaListItem({
  meta,
  onAporteResgate,
  onEditar,
  onDeletar,
  onVerDetalhes,
}: MetaListItemProps) {
  const IconeComponent = meta.icone && iconeMap[meta.icone] ? iconeMap[meta.icone] : Target;
  const corHex = meta.cor_hex || "#1F4E79";
  const isConcluida = meta.status === StatusMeta.CONCLUIDA;
  const isCancelada = meta.status === StatusMeta.CANCELADA;

  return (
    <div
      className={cn(
        "group rounded-xl border border-border/50 bg-card p-3 sm:px-4 sm:py-3 transition-all duration-200 hover:border-border/80 hover:shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-3",
        isConcluida && "border-green-500/30 bg-green-500/5",
        isCancelada && "opacity-60"
      )}
    >
      {/* Esquerda: Ícone + Nome + Badges */}
      <div className="flex items-center gap-3 min-w-0 flex-1">
        <div
          className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl text-white font-bold shadow-2xs transition-transform duration-200 group-hover:scale-105"
          style={{ backgroundColor: corHex }}
        >
          <IconeComponent className="h-5 w-5" />
        </div>

        <div className="min-w-0 flex-1 space-y-0.5">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="font-semibold text-foreground text-sm truncate">
              {meta.nome}
            </span>

            <Badge
              variant="outline"
              className={cn(
                "text-[10px] px-2 py-0 h-4 font-semibold border-0 rounded-full",
                meta.status === StatusMeta.EM_ANDAMENTO && "bg-amber-500/10 text-amber-600 dark:text-amber-400",
                meta.status === StatusMeta.CONCLUIDA && "bg-green-500/10 text-green-600 dark:text-green-400",
                meta.status === StatusMeta.CANCELADA && "bg-muted text-muted-foreground"
              )}
            >
              {meta.status === StatusMeta.CONCLUIDA && <CheckCircle2 className="h-2.5 w-2.5 mr-0.5 inline" />}
              {meta.status_label}
            </Badge>

            {meta.data_limite && (
              <span className="text-[11px] text-muted-foreground hidden md:flex items-center gap-1">
                <Calendar className="h-3 w-3" />
                Prazo: {formatarData(meta.data_limite)}
              </span>
            )}
          </div>

          {meta.descricao && (
            <p className="text-xs text-muted-foreground truncate">
              {meta.descricao}
            </p>
          )}
        </div>
      </div>

      {/* Centro: Progresso e Valores */}
      <div className="flex items-center gap-4 sm:w-64 shrink-0">
        <div className="flex-1 space-y-1">
          <div className="flex items-center justify-between text-xs">
            <span className="font-bold text-foreground">
              {formatarMoeda(meta.valor_atual)}
            </span>
            <span className="text-muted-foreground text-[11px]">
              / {formatarMoeda(meta.valor_alvo)}
            </span>
          </div>

          <div className="h-2 w-full rounded-full bg-accent overflow-hidden">
            <div
              className="h-full rounded-full transition-all duration-500"
              style={{
                width: `${Math.min(100, Math.max(0, meta.percentual_atingido))}%`,
                backgroundColor: isConcluida ? "#22C55E" : corHex,
              }}
            />
          </div>
        </div>

        <span
          className="text-xs font-bold shrink-0 min-w-[42px] text-right"
          style={{ color: isConcluida ? "#22C55E" : corHex }}
        >
          {meta.percentual_atingido.toFixed(0)}%
        </span>
      </div>

      {/* Direita: Botões de Ação */}
      <div className="flex items-center gap-2 shrink-0 justify-end pt-2 sm:pt-0 border-t sm:border-t-0 border-border/40">
        <Button
          onClick={() => onAporteResgate(meta)}
          disabled={isCancelada}
          size="sm"
          className="rounded-[10px] bg-[#1F4E79] hover:bg-[#1F4E79]/90 text-white font-medium text-xs gap-1 shadow-2xs h-8 px-3"
        >
          <Plus className="h-3.5 w-3.5" />
          <span className="hidden sm:inline">Aporte</span>
        </Button>

        <DropdownMenu>
          <DropdownMenuTrigger className="h-8 w-8 rounded-lg text-muted-foreground hover:text-foreground flex items-center justify-center hover:bg-accent cursor-pointer transition-colors">
            <MoreVertical className="h-4 w-4" />
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-40 rounded-xl">
            <DropdownMenuItem
              onClick={() => onVerDetalhes(meta)}
              className="flex items-center gap-2 cursor-pointer"
            >
              <ListOrdered className="h-3.5 w-3.5 text-muted-foreground" />
              <span>Ver Extrato</span>
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={() => onEditar(meta)}
              className="flex items-center gap-2 cursor-pointer"
            >
              <Edit2 className="h-3.5 w-3.5 text-muted-foreground" />
              <span>Editar Meta</span>
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={() => onDeletar(meta)}
              className="flex items-center gap-2 text-red-500 focus:text-red-500 cursor-pointer"
            >
              <Trash2 className="h-3.5 w-3.5" />
              <span>Excluir</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  );
}
