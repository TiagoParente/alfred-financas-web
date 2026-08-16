"use client";

import { DashboardMensal, DashboardSaldos } from "@/types/dashboard";
import { formatarMoeda } from "@/utils/formatters";
import {
  TrendingUp,
  TrendingDown,
  Wallet,
  ShieldCheck,
  Scale,
} from "lucide-react";

interface DashboardKpiCardsProps {
  saldos: DashboardSaldos;
  mensal: DashboardMensal;
}

export function DashboardKpiCards({ saldos, mensal }: DashboardKpiCardsProps) {
  const isBalancoPositivo = mensal.balanco_mensal >= 0;

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
      {/* 1. Saldo Disponível */}
      <div className="rounded-[16px] border border-border/50 bg-card p-5 shadow-sm space-y-3 transition-all hover:border-[#1F4E79]/30">
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold uppercase text-muted-foreground tracking-wider">
            Saldo Disponível
          </span>
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#1F4E79]/10 text-[#1F4E79]">
            <Wallet className="h-4 w-4" />
          </div>
        </div>
        <div>
          <span className="text-2xl font-bold text-foreground tracking-tight">
            {formatarMoeda(saldos.saldo_disponivel)}
          </span>
          <p className="text-xs text-muted-foreground mt-1">
            {saldos.total_contas} conta(s) ativas
          </p>
        </div>
      </div>

      {/* 2. Receitas do Mês */}
      <div className="rounded-[16px] border border-border/50 bg-card p-5 shadow-sm space-y-3 transition-all hover:border-[#22C55E]/30">
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold uppercase text-muted-foreground tracking-wider">
            Receitas do Mês
          </span>
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#22C55E]/10 text-[#22C55E]">
            <TrendingUp className="h-4 w-4" />
          </div>
        </div>
        <div>
          <span className="text-2xl font-bold text-[#22C55E] tracking-tight">
            {formatarMoeda(mensal.total_receitas)}
          </span>
          <p className="text-xs text-muted-foreground mt-1">
            Entradas efetuadas
          </p>
        </div>
      </div>

      {/* 3. Despesas do Mês */}
      <div className="rounded-[16px] border border-border/50 bg-card p-5 shadow-sm space-y-3 transition-all hover:border-red-500/30">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1.5">
            <span className="text-xs font-semibold uppercase text-muted-foreground tracking-wider">
              Despesas do Mês
            </span>
            <span className="px-1.5 py-0.5 rounded text-[10px] font-semibold bg-accent text-muted-foreground">
              {mensal.regime === "competencia" ? "Competência" : "Caixa"}
            </span>
          </div>
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-red-500/10 text-red-500">
            <TrendingDown className="h-4 w-4" />
          </div>
        </div>
        <div>
          <span className="text-2xl font-bold text-red-500 tracking-tight">
            {formatarMoeda(mensal.total_despesas)}
          </span>
          <div className="text-[11px] text-muted-foreground mt-1 flex flex-col gap-0.5">
            {mensal.regime === "competencia" && mensal.competencia ? (
              <span>
                Contas: {formatarMoeda(mensal.competencia.despesas_contas)} | Compras: {formatarMoeda(mensal.competencia.compras_cartao ?? 0)}
              </span>
            ) : mensal.caixa ? (
              <span>
                Contas: {formatarMoeda(mensal.caixa.despesas_contas)} | Faturas: {formatarMoeda(mensal.caixa.faturas_cartao ?? 0)}
              </span>
            ) : (
              <span>Saídas efetuadas</span>
            )}
          </div>
        </div>
      </div>

      {/* 4. Balanço Mensal */}
      <div className="rounded-[16px] border border-border/50 bg-card p-5 shadow-sm space-y-3 transition-all hover:border-border">
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold uppercase text-muted-foreground tracking-wider">
            Balanço Mensal
          </span>
          <div
            className={`flex h-9 w-9 items-center justify-center rounded-xl ${
              isBalancoPositivo
                ? "bg-[#22C55E]/10 text-[#22C55E]"
                : "bg-red-500/10 text-red-500"
            }`}
          >
            <Scale className="h-4 w-4" />
          </div>
        </div>
        <div>
          <span
            className={`text-2xl font-bold tracking-tight ${
              isBalancoPositivo ? "text-[#22C55E]" : "text-red-500"
            }`}
          >
            {formatarMoeda(mensal.balanco_mensal)}
          </span>
          <p className="text-xs text-muted-foreground mt-1">
            {isBalancoPositivo ? "Superávit no período" : "Déficit no período"}
          </p>
        </div>
      </div>

      {/* 5. Reservas Acumuladas */}
      <div className="rounded-[16px] border border-border/50 bg-card p-5 shadow-sm space-y-3 transition-all hover:border-[#1F4E79]/30">
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold uppercase text-muted-foreground tracking-wider">
            Reservas & Metas
          </span>
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#1F4E79]/10 text-[#1F4E79]">
            <ShieldCheck className="h-4 w-4" />
          </div>
        </div>
        <div>
          <span className="text-2xl font-bold text-[#1F4E79] tracking-tight">
            {formatarMoeda(saldos.saldo_reservas)}
          </span>
          <p className="text-xs text-muted-foreground mt-1">
            Contas de investimento/reserva
          </p>
        </div>
      </div>
    </div>
  );
}
