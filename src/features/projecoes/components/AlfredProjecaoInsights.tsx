"use client";

import { ProjecaoAlfredInsights } from "@/types/projecoes";
import { AlertTriangle, AlertCircle, CheckCircle2, Sparkles } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import Image from "next/image";

interface AlfredProjecaoInsightsProps {
  insights?: ProjecaoAlfredInsights;
}

export function AlfredProjecaoInsights({
  insights,
}: AlfredProjecaoInsightsProps) {
  if (!insights || !insights.mensagens || insights.mensagens.length === 0) {
    return null;
  }

  const badgeConfig = {
    normal: {
      label: "Fluxo Estável",
      variant: "outline" as const,
      icon: CheckCircle2,
      color: "text-emerald-600 border-emerald-500/30 bg-emerald-500/10",
    },
    atencao: {
      label: "Alerta de Comprometimento",
      variant: "outline" as const,
      icon: AlertCircle,
      color: "text-amber-600 border-amber-500/30 bg-amber-500/10",
    },
    critico: {
      label: "Risco de Déficit Projetado",
      variant: "outline" as const,
      icon: AlertTriangle,
      color: "text-rose-600 border-rose-500/30 bg-rose-500/10",
    },
  }[insights.nivel_alerta || "normal"];

  const BadgeIcon = badgeConfig.icon;

  return (
    <div className="rounded-2xl border border-[#1F4E79]/20 bg-gradient-to-br from-[#1F4E79]/5 via-card to-background p-6 shadow-xs space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="relative flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-white p-0.5 shadow-md border border-[#1F4E79]/20 overflow-hidden">
            <Image
              src="/images/brand/alfred.png"
              alt="Alfred - Assessor de Projeção"
              width={192}
              height={192}
              quality={95}
              className="h-full w-full object-cover rounded-xl"
            />
          </div>
          <div>
            <h2 className="text-base font-bold text-foreground tracking-tight flex items-center gap-1.5">
              <span>{insights.titulo || "Diagnóstico Preditivo do Alfred"}</span>
              <Sparkles className="h-3.5 w-3.5 text-amber-500" />
            </h2>
            <p className="text-xs text-muted-foreground">
              Análise inteligente de compromissos futuros e sugestões de equilíbrio
            </p>
          </div>
        </div>

        <Badge
          variant={badgeConfig.variant}
          className={`flex items-center gap-1 text-xs font-semibold px-2.5 py-1 ${badgeConfig.color}`}
        >
          <BadgeIcon className="h-3.5 w-3.5" />
          {badgeConfig.label}
        </Badge>
      </div>

      <div className="space-y-2 pt-1 border-t border-border/40">
        {insights.mensagens.map((msg, index) => {
          const formattedMsg = msg.replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>");
          return (
            <div
              key={index}
              className="flex items-start gap-2 text-xs text-muted-foreground leading-relaxed"
            >
              <span className="text-[#1F4E79] dark:text-sky-400 font-bold select-none mt-0.5">
                •
              </span>
              <span
                dangerouslySetInnerHTML={{ __html: formattedMsg }}
                className="[&>strong]:text-foreground [&>strong]:font-semibold"
              />
            </div>
          );
        })}
      </div>
    </div>
  );
}
