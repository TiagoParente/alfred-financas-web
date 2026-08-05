"use client";

import { useFamilias } from "@/features/familias/hooks/useFamilias";
import { useContasBancarias } from "@/features/contas_bancarias/hooks/useContasBancarias";
import { ResumoSaldosCards } from "@/features/contas_bancarias/components/ResumoSaldosCards";
import { ContaBancariaCard } from "@/features/contas_bancarias/components/ContaBancariaCard";
import { formatarMoeda } from "@/utils/formatters";
import {
  Sparkles,
  TrendingUp,
  TrendingDown,
  Landmark,
  Plus,
  ArrowRight,
  ShieldCheck,
  CheckCircle2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { useState } from "react";
import { ContaBancariaModal } from "@/features/contas_bancarias/components/ContaBancariaModal";
import { ContaBancaria } from "@/types/contas";

export default function DashboardPage() {
  const { familiaAtiva } = useFamilias();
  const {
    contas,
    resumo,
    isLoading,
    criarConta,
    isCriando,
    atualizarConta,
    isAtualizando,
  } = useContasBancarias(familiaAtiva?.id);

  const [modalFormAberta, setModalFormAberta] = useState(false);
  const [contaEmEdicao, setContaEmEdicao] = useState<ContaBancaria | null>(null);

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const handleSubmitForm = async (formData: any) => {
    if (contaEmEdicao) {
      await atualizarConta({
        id: contaEmEdicao.id,
        payload: {
          nome: formData.nome,
          banco_id: formData.banco_id ? Number(formData.banco_id) : null,
          instituicao_financeira: formData.instituicao_financeira || null,
          tipo_conta: formData.tipo_conta,
          incluir_no_saldo_geral: formData.incluir_no_saldo_geral,
          incluir_nas_reservas: formData.incluir_nas_reservas,
          cor_hex: formData.cor_hex || null,
        },
      });
    } else {
      await criarConta({
        nome: formData.nome,
        banco_id: formData.banco_id ? Number(formData.banco_id) : null,
        instituicao_financeira: formData.instituicao_financeira || null,
        tipo_conta: formData.tipo_conta,
        saldo_inicial: Number(formData.saldo_inicial) || 0,
        incluir_no_saldo_geral: formData.incluir_no_saldo_geral,
        incluir_nas_reservas: formData.incluir_nas_reservas,
        cor_hex: formData.cor_hex || null,
      });
    }
  };

  return (
    <div className="space-y-8">
      {/* Header com Boas-Vindas */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground tracking-tight">
            Painel Financeiro
          </h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            Visão consolidada da{" "}
            <strong className="text-[#1F4E79]">{familiaAtiva?.nome || "sua família"}</strong>
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Button
            onClick={() => {
              setContaEmEdicao(null);
              setModalFormAberta(true);
            }}
            className="rounded-[10px] bg-[#1F4E79] hover:bg-[#1F4E79]/90 text-white font-medium gap-2 shadow-sm"
          >
            <Plus className="h-4 w-4" />
            <span>Adicionar Conta</span>
          </Button>
        </div>
      </div>

      {/* 1. Saldo Consolidado e Métrica das Contas */}
      {!isLoading && <ResumoSaldosCards resumo={resumo} />}

      {/* 2. Grid de Receitas, Despesas & Investimentos */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="rounded-[16px] border border-border/50 bg-card p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase text-muted-foreground">
              Receitas do Mês
            </span>
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#22C55E]/10 text-[#22C55E]">
              <TrendingUp className="h-4 w-4" />
            </div>
          </div>
          <div className="mt-3">
            <span className="text-xl font-bold text-foreground">
              {formatarMoeda(0)}
            </span>
            <p className="text-xs text-muted-foreground mt-1">
              Módulo de movimentações em breve (v1)
            </p>
          </div>
        </div>

        <div className="rounded-[16px] border border-border/50 bg-card p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase text-muted-foreground">
              Despesas do Mês
            </span>
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-red-500/10 text-red-500">
              <TrendingDown className="h-4 w-4" />
            </div>
          </div>
          <div className="mt-3">
            <span className="text-xl font-bold text-foreground">
              {formatarMoeda(0)}
            </span>
            <p className="text-xs text-muted-foreground mt-1">
              Módulo de movimentações em breve (v1)
            </p>
          </div>
        </div>

        <div className="rounded-[16px] border border-border/50 bg-card p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase text-muted-foreground">
              Reservas Acumuladas
            </span>
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#1F4E79]/10 text-[#1F4E79]">
              <ShieldCheck className="h-4 w-4" />
            </div>
          </div>
          <div className="mt-3">
            <span className="text-xl font-bold text-[#1F4E79]">
              {formatarMoeda(resumo.saldo_reservas)}
            </span>
            <p className="text-xs text-muted-foreground mt-1">
              Contas de investimento e reserva
            </p>
          </div>
        </div>
      </div>

      {/* 3. Card do Alfred AI Assistant */}
      <div className="rounded-[20px] border border-[#1F4E79]/20 bg-gradient-to-br from-[#1F4E79]/5 via-card to-background p-6 shadow-sm">
        <div className="flex items-start gap-4">
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-[#1F4E79] text-white shadow-md">
            <Sparkles className="h-6 w-6" />
          </div>
          <div className="space-y-2 flex-1">
            <div className="flex items-center justify-between">
              <h2 className="text-base font-bold text-foreground">
                Insights do Alfred
              </h2>
              <span className="text-xs font-medium text-[#1F4E79] bg-[#1F4E79]/10 px-2.5 py-0.5 rounded-full">
                Assistente Pessoal
              </span>
            </div>
            <p className="text-sm text-foreground/90 leading-relaxed">
              Olá! Eu sou o <strong>Alfred</strong>. Sua estrutura de contas bancárias da{" "}
              <strong>{familiaAtiva?.nome || "sua família"}</strong> está configurada.
            </p>
            {contas.length === 0 ? (
              <p className="text-xs text-muted-foreground">
                Recomendo cadastrar sua primeira conta bancária para ativarmos o monitoramento do seu saldo disponível e das suas reservas.
              </p>
            ) : (
              <p className="text-xs text-muted-foreground">
                Seu patrimônio total de <strong>{formatarMoeda(resumo.saldo_total)}</strong> está distribuído em {resumo.total_contas} contas bancárias ativas.
              </p>
            )}
          </div>
        </div>
      </div>

      {/* 4. Minhas Contas Bancárias (Visão Rápida) */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-base font-bold text-foreground">
            Contas Bancárias Ativas
          </h2>
          <Link
            href="/contas-bancarias"
            className="flex items-center gap-1.5 text-xs font-semibold text-[#1F4E79] hover:underline"
          >
            <span>Gerenciar todas ({contas.length})</span>
            <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </div>

        {contas.length === 0 ? (
          <div className="flex flex-col items-center justify-center rounded-[16px] border border-dashed border-border/70 p-8 text-center bg-accent/10">
            <Landmark className="h-8 w-8 text-[#1F4E79] mb-2" />
            <p className="text-sm font-medium text-foreground">Nenhuma conta cadastrada</p>
            <Button
              onClick={() => {
                setContaEmEdicao(null);
                setModalFormAberta(true);
              }}
              variant="outline"
              className="mt-3 text-xs rounded-[10px]"
            >
              Cadastrar Conta Agora
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
            {contas.slice(0, 3).map((conta) => (
              <ContaBancariaCard
                key={conta.id}
                conta={conta}
                onEditar={(c) => {
                  setContaEmEdicao(c);
                  setModalFormAberta(true);
                }}
                onDeletar={() => {}}
              />
            ))}
          </div>
        )}
      </div>

      {/* 5. Checklist Financeiro */}
      <div className="rounded-[16px] border border-border/50 bg-card p-5 shadow-sm space-y-3">
        <h3 className="text-sm font-bold text-foreground">
          Checklist de Configuração Inicial
        </h3>
        <div className="space-y-2">
          <div className="flex items-center gap-2.5 text-xs text-foreground">
            <CheckCircle2 className="h-4 w-4 text-[#22C55E]" />
            <span>Criar conta de usuário e validar e-mail via OTP</span>
          </div>
          <div className="flex items-center gap-2.5 text-xs text-foreground">
            <CheckCircle2 className="h-4 w-4 text-[#22C55E]" />
            <span>Configurar grupo familiar ativo</span>
          </div>
          <div className="flex items-center gap-2.5 text-xs text-foreground">
            {contas.length > 0 ? (
              <CheckCircle2 className="h-4 w-4 text-[#22C55E]" />
            ) : (
              <div className="h-4 w-4 rounded-full border border-muted-foreground/40" />
            )}
            <span className={contas.length > 0 ? "line-through text-muted-foreground" : ""}>
              Cadastrar primeira conta bancária da família
            </span>
          </div>
        </div>
      </div>

      {/* Modal de Criação/Edição */}
      <ContaBancariaModal
        open={modalFormAberta}
        onOpenChange={setModalFormAberta}
        contaEmEdicao={contaEmEdicao}
        onSubmit={handleSubmitForm}
        isSubmitting={isCriando || isAtualizando}
      />
    </div>
  );
}
