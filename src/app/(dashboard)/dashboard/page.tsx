"use client";

import { useFamilias } from "@/features/familias/hooks/useFamilias";
import { useDashboard } from "@/features/dashboard/hooks/useDashboard";
import { useContasBancarias } from "@/features/contas_bancarias/hooks/useContasBancarias";
import { useContasFixas } from "@/features/contas_fixas/hooks/useContasFixas";
import { useCartoes } from "@/features/cartoes/hooks/useCartoes";
import { DashboardKpiCards } from "@/features/dashboard/components/DashboardKpiCards";
import { AlfredInsightsCard } from "@/features/dashboard/components/AlfredInsightsCard";
import { ProximosVencimentosCard } from "@/features/dashboard/components/ProximosVencimentosCard";
import { GraficoReceitasDespesas } from "@/features/dashboard/components/GraficoReceitasDespesas";
import { GraficoTopCategoriasDespesas } from "@/features/dashboard/components/GraficoTopCategoriasDespesas";
import { GraficoEvolucaoInvestimentos } from "@/features/dashboard/components/GraficoEvolucaoInvestimentos";
import { ContaBancariaCard } from "@/features/contas_bancarias/components/ContaBancariaCard";
import { ContaBancariaModal } from "@/features/contas_bancarias/components/ContaBancariaModal";
import { ContaBancaria } from "@/types/contas";
import { OrcamentoListItem } from "@/features/orcamentos/components/OrcamentoListItem";
import { formatarMoeda } from "@/utils/formatters";
import {
  Plus,
  ArrowRight,
  Landmark,
  Target,
  PieChart,
  Calendar,
  Sparkles,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { useState } from "react";

export default function DashboardPage() {
  const { familiaAtiva } = useFamilias();

  // Estado do Período (Mês e Ano) e Regime
  const dataAtual = new Date();
  const [mes, setMes] = useState<number>(dataAtual.getMonth() + 1);
  const [ano, setAno] = useState<number>(dataAtual.getFullYear());
  const [regime, setRegime] = useState<"caixa" | "competencia">("caixa");

  const {
    saldos,
    mensal,
    projecaoFluxo,
    proximosVencimentos,
    orcamentos,
    metas,
    evolucaoInvestimentos,
    alfredInsights,
    isLoading,
  } = useDashboard(familiaAtiva?.id, mes, ano, regime);

  const { contasFixas } = useContasFixas(familiaAtiva?.id, true);
  const { resumo: resumoCartoes } = useCartoes(familiaAtiva?.id);

  const {
    contas,
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

  const mesesOptions = [
    { valor: 1, nome: "Janeiro" },
    { valor: 2, nome: "Fevereiro" },
    { valor: 3, nome: "Março" },
    { valor: 4, nome: "Abril" },
    { valor: 5, nome: "Maio" },
    { valor: 6, nome: "Junho" },
    { valor: 7, nome: "Julho" },
    { valor: 8, nome: "Agosto" },
    { valor: 9, nome: "Setembro" },
    { valor: 10, nome: "Outubro" },
    { valor: 11, nome: "Novembro" },
    { valor: 12, nome: "Dezembro" },
  ];

  return (
    <div className="space-y-8">
      {/* Header com Boas-Vindas e Seletor de Mês/Ano */}
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

        <div className="flex items-center gap-3 flex-wrap">
          {/* Seletor de Regime (Caixa vs Competência) */}
          <div className="flex items-center p-1 bg-card border border-border/50 rounded-xl shadow-2xs">
            <button
              type="button"
              onClick={() => setRegime("caixa")}
              title="Regime de Caixa: Despesas de conta e faturas de cartão computadas no mês do vencimento/pagamento"
              className={`px-3 py-1 text-xs font-semibold rounded-lg transition-all ${
                regime === "caixa"
                  ? "bg-[#1F4E79] text-white shadow-2xs"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              Caixa (Fluxo Real)
            </button>
            <button
              type="button"
              onClick={() => setRegime("competencia")}
              title="Regime de Competência: Compras computadas no mês em que foram efetuadas"
              className={`px-3 py-1 text-xs font-semibold rounded-lg transition-all ${
                regime === "competencia"
                  ? "bg-[#1F4E79] text-white shadow-2xs"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              Competência
            </button>
          </div>

          {/* Seletor de Período */}
          <div className="flex items-center gap-2 bg-card border border-border/50 rounded-xl px-3 py-1.5 shadow-2xs">
            <Calendar className="h-4 w-4 text-[#1F4E79]" />
            <select
              value={mes}
              onChange={(e) => setMes(Number(e.target.value))}
              className="bg-transparent text-sm font-semibold text-foreground focus:outline-none cursor-pointer"
            >
              {mesesOptions.map((m) => (
                <option key={m.valor} value={m.valor} className="bg-card text-foreground">
                  {m.nome}
                </option>
              ))}
            </select>

            <select
              value={ano}
              onChange={(e) => setAno(Number(e.target.value))}
              className="bg-transparent text-sm font-semibold text-foreground focus:outline-none cursor-pointer border-l border-border/40 pl-2"
            >
              {[2025, 2026, 2027].map((a) => (
                <option key={a} value={a} className="bg-card text-foreground">
                  {a}
                </option>
              ))}
            </select>
          </div>

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

      {/* 1. KPIs Principais de Saldo e Fluxo Mensal */}
      {isLoading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="h-28 rounded-[16px] bg-accent/40 animate-pulse" />
          ))}
        </div>
      ) : (
        <DashboardKpiCards saldos={saldos} mensal={mensal} />
      )}

      {/* 2. Insights Proativos do Alfred */}
      {!isLoading && alfredInsights && (
        <AlfredInsightsCard
          insights={alfredInsights}
          familiaNome={familiaAtiva?.nome}
        />
      )}

      {/* 3. Grid de Gráficos Analíticos (Fluxo de Caixa & Reservas) */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {isLoading ? (
          <div className="h-72 rounded-[16px] bg-accent/40 animate-pulse" />
        ) : (
          <GraficoReceitasDespesas
            mensal={mensal}
            projecaoFluxo={projecaoFluxo}
            contasFixas={contasFixas}
            faturaCartoesTotal={mensal.caixa?.faturas_cartao ?? resumoCartoes.fatura_atual_total}
          />
        )}

        {isLoading ? (
          <div className="h-72 rounded-[16px] bg-accent/40 animate-pulse" />
        ) : (
          <GraficoEvolucaoInvestimentos evolucao={evolucaoInvestimentos} />
        )}
      </div>

      {/* 4. Grid de Gastos por Categoria & Próximos Vencimentos */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {isLoading ? (
          <div className="h-72 rounded-[16px] bg-accent/40 animate-pulse" />
        ) : (
          <GraficoTopCategoriasDespesas orcamentos={orcamentos} />
        )}

        {isLoading ? (
          <div className="h-72 rounded-[16px] bg-accent/40 animate-pulse" />
        ) : (
          <ProximosVencimentosCard vencimentos={proximosVencimentos} />
        )}
      </div>

      {/* 4. Orçamentos da Família (Resumo Rápido) */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <PieChart className="h-5 w-5 text-[#1F4E79]" />
            <h2 className="text-base font-bold text-foreground">
              Orçamentos por Categoria
            </h2>
          </div>
          <Link
            href="/orcamentos"
            className="flex items-center gap-1 text-xs font-semibold text-[#1F4E79] hover:underline"
          >
            <span>Gerenciar Orçamentos</span>
            <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </div>

        {orcamentos.length === 0 ? (
          <div className="flex flex-col items-center justify-center rounded-[16px] border border-dashed border-border/70 p-6 text-center bg-accent/10">
            <PieChart className="h-8 w-8 text-[#1F4E79] mb-2" />
            <p className="text-sm font-medium text-foreground">Nenhum orçamento cadastrado para este mês</p>
            <Link href="/orcamentos">
              <Button variant="outline" className="mt-3 text-xs rounded-[10px]">
                Definir Orçamentos
              </Button>
            </Link>
          </div>
        ) : (
          <div className="space-y-3">
            {orcamentos.slice(0, 4).map((orcamento) => (
              <OrcamentoListItem
                key={orcamento.id}
                orcamento={orcamento}
                onEditar={() => {}}
                onDeletar={() => {}}
              />
            ))}
          </div>
        )}
      </div>

      {/* 5. Metas & Reservas Financeiras */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Target className="h-5 w-5 text-[#1F4E79]" />
            <h2 className="text-base font-bold text-foreground">
              Metas & Reservas Financeiras
            </h2>
          </div>
          <Link
            href="/metas"
            className="flex items-center gap-1 text-xs font-semibold text-[#1F4E79] hover:underline"
          >
            <span>Ver todas as metas</span>
            <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </div>

        {metas.length === 0 ? (
          <div className="flex flex-col items-center justify-center rounded-[16px] border border-dashed border-border/70 p-6 text-center bg-accent/10">
            <Target className="h-8 w-8 text-[#1F4E79] mb-2" />
            <p className="text-sm font-medium text-foreground">Nenhuma meta cadastrada</p>
            <Link href="/metas">
              <Button variant="outline" className="mt-3 text-xs rounded-[10px]">
                Criar Nova Meta
              </Button>
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {metas.slice(0, 4).map((meta) => {
              const percentual = meta.valor_alvo > 0
                ? Math.min(100, (meta.valor_atual / meta.valor_alvo) * 100)
                : 0;

              return (
                <div
                  key={meta.id}
                  className="rounded-[16px] border border-border/50 bg-card p-4 shadow-sm space-y-3"
                >
                  <div className="flex items-center justify-between">
                    <span className="font-semibold text-sm text-foreground truncate">
                      {meta.nome}
                    </span>
                    <span className="text-xs font-bold text-[#1F4E79]">
                      {percentual.toFixed(0)}%
                    </span>
                  </div>

                  <div className="space-y-1">
                    <div className="h-2 w-full rounded-full bg-accent overflow-hidden">
                      <div
                        className="h-full rounded-full bg-[#1F4E79] transition-all duration-500"
                        style={{ width: `${percentual}%` }}
                      />
                    </div>
                    <div className="flex items-center justify-between text-xs text-muted-foreground pt-0.5">
                      <span>{formatarMoeda(meta.valor_atual)}</span>
                      <span>alvo: {formatarMoeda(meta.valor_alvo)}</span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* 6. Contas Bancárias Ativas */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Landmark className="h-5 w-5 text-[#1F4E79]" />
            <h2 className="text-base font-bold text-foreground">
              Contas Bancárias Ativas
            </h2>
          </div>
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

      {/* Modal de Criação/Edição de Conta */}
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
