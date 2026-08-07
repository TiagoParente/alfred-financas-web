"use client";

import { AlfredInsights } from "@/types/dashboard";
import { Sparkles, AlertTriangle, AlertCircle, CheckCircle2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";

interface AlfredInsightsCardProps {
  insights?: AlfredInsights;
  familiaNome?: string;
}

export function AlfredInsightsCard({
  insights,
  familiaNome,
}: AlfredInsightsCardProps) {
  if (!insights || !insights.mensagens || insights.mensagens.length === 0) {
    return null;
  }

  const badgeConfig = {
    normal: {
      label: "Assessor Pessoal",
      variant: "outline" as const,
      icon: CheckCircle2,
      color: "text-[#1F4E79] border-[#1F4E79]/30 bg-[#1F4E79]/5",
    },
    atencao: {
      label: "Atenção Necessária",
      variant: "outline" as const,
      icon: AlertCircle,
      color: "text-amber-600 border-amber-500/30 bg-amber-500/10",
    },
    critico: {
      label: "Alerta de Limite",
      variant: "outline" as const,
      icon: AlertTriangle,
      color: "text-red-600 border-red-500/30 bg-red-500/10",
    },
  }[insights.nivel_alerta || "normal"];

  const BadgeIcon = badgeConfig.icon;

  return (
    <div className="rounded-[20px] border border-[#1F4E79]/20 bg-gradient-to-br from-[#1F4E79]/5 via-card to-background p-6 shadow-sm space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-[#1F4E79] text-white shadow-md">
            <Sparkles className="h-5 w-5" />
          </div>
          <div>
            <h2 className="text-base font-bold text-foreground tracking-tight">
              {insights.titulo || "Insights do Alfred"}
            </h2>
            <p className="text-xs text-muted-foreground">
              Análise proativa da saúde financeira da família{" "}
              <strong>{familiaNome || ""}</strong>
            </p>
          </div>
        </div>

        <Badge className={`text-xs font-semibold px-3 py-1 gap-1.5 rounded-full ${badgeConfig.color}`}>
          <BadgeIcon className="h-3.5 w-3.5" />
          <span>{badgeConfig.label}</span>
        </Badge>
      </div>

      <div className="space-y-2.5 pt-1">
        {insights.mensagens.map((msg, index) => (
          <div
            key={index}
            className="flex items-start gap-2.5 text-sm text-foreground/90 leading-relaxed"
          >
            <span className="text-[#1F4E79] font-bold text-base leading-none select-none">
              •
            </span>
            <span
              dangerouslySetInnerHTML={{
                __html: msg.replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>"),
              }}
            />
          </div>
        ))}
      </div>
    </div>
  );
}
