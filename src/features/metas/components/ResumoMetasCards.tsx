"use client";

import { ResumoReservas } from "@/types/metas";
import { formatarMoeda } from "@/utils/formatters";
import { ShieldCheck, Target, CheckCircle2, Clock } from "lucide-react";

interface ResumoMetasCardsProps {
  resumo: ResumoReservas;
}

export function ResumoMetasCards({ resumo }: ResumoMetasCardsProps) {
  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
      {/* 1. Total em Reservas */}
      <div className="rounded-[16px] border border-border/50 bg-card p-5 shadow-sm transition-all hover:shadow-md">
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            Total em Reservas
          </span>
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#1F4E79]/10 text-[#1F4E79]">
            <ShieldCheck className="h-5 w-5" />
          </div>
        </div>
        <div className="mt-3">
          <span className="text-2xl font-bold text-[#1F4E79] tracking-tight">
            {formatarMoeda(resumo.total_saldo_reservas)}
          </span>
          <p className="text-xs text-muted-foreground mt-1">
            Saldo de contas marcadas como reserva
          </p>
        </div>
      </div>

      {/* 2. Acumulado para Metas */}
      <div className="rounded-[16px] border border-border/50 bg-card p-5 shadow-sm transition-all hover:shadow-md">
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            Meta Global Acumulada
          </span>
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#22C55E]/10 text-[#22C55E]">
            <Target className="h-5 w-5" />
          </div>
        </div>
        <div className="mt-3 space-y-1.5">
          <div className="flex items-baseline justify-between">
            <span className="text-2xl font-bold text-foreground tracking-tight">
              {formatarMoeda(resumo.total_acumulado_metas)}
            </span>
            <span className="text-xs font-bold text-[#22C55E] bg-[#22C55E]/10 px-2 py-0.5 rounded-full">
              {resumo.percentual_geral_metas.toFixed(1)}%
            </span>
          </div>
          <p className="text-xs text-muted-foreground">
            Alvo total: <strong className="text-foreground">{formatarMoeda(resumo.total_alvo_metas)}</strong>
          </p>
          <div className="h-2 w-full rounded-full bg-accent overflow-hidden mt-1">
            <div
              className="h-full bg-[#22C55E] rounded-full transition-all duration-500"
              style={{ width: `${Math.min(100, Math.max(0, resumo.percentual_geral_metas))}%` }}
            />
          </div>
        </div>
      </div>

      {/* 3. Metas em Andamento */}
      <div className="rounded-[16px] border border-border/50 bg-card p-5 shadow-sm transition-all hover:shadow-md">
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            Em Andamento
          </span>
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-amber-500/10 text-amber-500">
            <Clock className="h-5 w-5" />
          </div>
        </div>
        <div className="mt-3">
          <span className="text-2xl font-bold text-foreground tracking-tight">
            {resumo.quantidade_metas_em_andamento}
          </span>
          <p className="text-xs text-muted-foreground mt-1">
            {resumo.quantidade_metas_em_andamento === 1
              ? "Objetivo ativo"
              : "Objetivos ativos em acompanhamento"}
          </p>
        </div>
      </div>

      {/* 4. Metas Concluídas */}
      <div className="rounded-[16px] border border-border/50 bg-card p-5 shadow-sm transition-all hover:shadow-md">
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            Concluídas
          </span>
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#22C55E]/10 text-[#22C55E]">
            <CheckCircle2 className="h-5 w-5" />
          </div>
        </div>
        <div className="mt-3">
          <span className="text-2xl font-bold text-[#22C55E] tracking-tight">
            {resumo.quantidade_metas_concluidas}
          </span>
          <p className="text-xs text-muted-foreground mt-1">
            {resumo.quantidade_metas_concluidas === 1
              ? "Meta alcançada com sucesso!"
              : "Metas alcançadas com sucesso!"}
          </p>
        </div>
      </div>
    </div>
  );
}
