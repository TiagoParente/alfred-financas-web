"use client";

import { ResumoSaldos } from "@/types/contas";
import { formatarMoeda } from "@/utils/formatters";
import { Wallet, ShieldCheck, PiggyBank } from "lucide-react";
import { motion } from "framer-motion";

interface ResumoSaldosCardsProps {
  resumo: ResumoSaldos;
}

export function ResumoSaldosCards({ resumo }: ResumoSaldosCardsProps) {
  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
      {/* Saldo Disponível */}
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.2 }}
        className="rounded-[16px] border border-[#1F4E79]/20 bg-[#1F4E79]/5 p-5 shadow-sm"
      >
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold uppercase tracking-wider text-[#1F4E79]">
            Saldo Disponível
          </span>
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#1F4E79] text-white">
            <Wallet className="h-5 w-5" />
          </div>
        </div>
        <div className="mt-4">
          <span className="text-2xl font-bold text-foreground">
            {formatarMoeda(resumo.saldo_disponivel)}
          </span>
          <p className="mt-1 text-xs text-muted-foreground">
            Contas vinculadas ao saldo geral
          </p>
        </div>
      </motion.div>

      {/* Reservas & Investimentos */}
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.2, delay: 0.05 }}
        className="rounded-[16px] border border-[#22C55E]/20 bg-[#22C55E]/5 p-5 shadow-sm"
      >
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold uppercase tracking-wider text-[#22C55E]">
            Reservas & Investimentos
          </span>
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#22C55E] text-white">
            <PiggyBank className="h-5 w-5" />
          </div>
        </div>
        <div className="mt-4">
          <span className="text-2xl font-bold text-foreground">
            {formatarMoeda(resumo.saldo_reservas)}
          </span>
          <p className="mt-1 text-xs text-muted-foreground">
            Valores guardados e isolados
          </p>
        </div>
      </motion.div>

      {/* Saldo Total */}
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.2, delay: 0.1 }}
        className="rounded-[16px] border border-border/50 bg-card p-5 shadow-sm"
      >
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            Patrimônio Total
          </span>
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-accent text-foreground">
            <ShieldCheck className="h-5 w-5" />
          </div>
        </div>
        <div className="mt-4">
          <span className="text-2xl font-bold text-foreground">
            {formatarMoeda(resumo.saldo_total)}
          </span>
          <p className="mt-1 text-xs text-muted-foreground">
            Soma de {resumo.total_contas} {resumo.total_contas === 1 ? "conta ativa" : "contas ativas"}
          </p>
        </div>
      </motion.div>
    </div>
  );
}
