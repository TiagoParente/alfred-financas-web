"use client";

import { useState } from "react";
import { useFamilias } from "@/features/familias/hooks/useFamilias";
import { useProjecao } from "@/features/projecoes/hooks/useProjecao";
import { ProjecaoHeader } from "@/features/projecoes/components/ProjecaoHeader";
import { ProjecaoKpis } from "@/features/projecoes/components/ProjecaoKpis";
import { GraficoFluxoProjetado } from "@/features/projecoes/components/GraficoFluxoProjetado";
import { CardProjecaoCartoes } from "@/features/projecoes/components/CardProjecaoCartoes";
import { GraficoDistribuicaoProjecao } from "@/features/projecoes/components/GraficoDistribuicaoProjecao";
import { TabelaProjecaoCategorias } from "@/features/projecoes/components/TabelaProjecaoCategorias";
import { SimuladorCenariosCard } from "@/features/projecoes/components/SimuladorCenariosCard";
import { AlfredProjecaoInsights } from "@/features/projecoes/components/AlfredProjecaoInsights";
import { ProjecaoSkeleton } from "@/features/projecoes/components/ProjecaoSkeleton";
import { Button } from "@/components/ui/button";
import { AlertCircle, RefreshCw, TrendingUp, Sparkles } from "lucide-react";
import { motion } from "framer-motion";

export default function ProjecoesPage() {
  const { familiaAtiva } = useFamilias();

  const [periodoMeses, setPeriodoMeses] = useState<number>(6);
  const [regime, setRegime] = useState<"caixa" | "competencia">("caixa");
  const [modalSimuladorOpen, setModalSimuladorOpen] = useState<boolean>(false);

  const {
    dados,
    resumo,
    meses,
    categorias,
    alfredInsights,
    simulacoes,
    temSimulacaoAtiva,
    adicionarSimulacao,
    removerSimulacao,
    alternarSimulacao,
    limparSimulacoes,
    isLoading,
    isError,
    refetch,
  } = useProjecao(familiaAtiva?.id, periodoMeses, undefined, undefined, regime);

  // 1. Estado de Loading
  if (isLoading) {
    return <ProjecaoSkeleton />;
  }

  // 2. Estado de Erro
  if (isError || !dados) {
    return (
      <div className="flex flex-col items-center justify-center p-12 text-center rounded-2xl border border-border bg-card space-y-4 max-w-md mx-auto my-12">
        <div className="p-3 rounded-full bg-rose-500/10 text-rose-600 dark:text-rose-400">
          <AlertCircle className="h-8 w-8" />
        </div>
        <div>
          <h2 className="text-lg font-bold text-foreground">
            Não foi possível carregar a projeção
          </h2>
          <p className="text-xs text-muted-foreground mt-1">
            Houve uma falha ao conectar com o serviço de projeções financeiras.
          </p>
        </div>
        <Button
          onClick={() => refetch()}
          className="bg-[#1F4E79] hover:bg-[#183e60] text-white text-xs flex items-center gap-2"
        >
          <RefreshCw className="h-3.5 w-3.5" />
          <span>Tentar novamente</span>
        </Button>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25 }}
      className="space-y-6 pb-12"
    >
      {/* 1. Header com Controles e Filtros */}
      <ProjecaoHeader
        meses={periodoMeses}
        onSelectMeses={setPeriodoMeses}
        regime={regime}
        onSelectRegime={setRegime}
        temSimulacaoAtiva={temSimulacaoAtiva}
        simulacoesCount={simulacoes.filter((s) => s.ativo).length}
        onAbrirSimulador={() => setModalSimuladorOpen(true)}
        onAtualizar={() => refetch()}
        isAtualizando={isLoading}
      />

      {/* 2. KPIs de Projeção */}
      <ProjecaoKpis resumo={resumo} periodoMeses={periodoMeses} />

      {/* 3. Diagnóstico Preditivo do Alfred */}
      <AlfredProjecaoInsights insights={alfredInsights} />

      {/* 4. Gráfico Principal de Fluxo Projetado */}
      <GraficoFluxoProjetado
        meses={meses}
        saldoInicialDisponivel={resumo?.saldo_atual_disponivel ?? 0}
      />

      {/* 5. Evolução e Alívio de Faturas de Cartão de Crédito */}
      <CardProjecaoCartoes
        projecaoCartoes={dados?.projecao_cartoes}
        periodoMeses={periodoMeses}
      />

      {/* 6. Maiores Categorias Projetadas */}
      <GraficoDistribuicaoProjecao
        categorias={categorias}
        periodoMeses={periodoMeses}
      />

      {/* 7. Projeção Detalhada por Categoria (Linha Exclusiva Full-Width) */}
      <TabelaProjecaoCategorias
        categorias={categorias}
        meses={meses}
      />

      {/* Modal / Dialog do Simulador de Cenários "E se?" */}
      <SimuladorCenariosCard
        isOpen={modalSimuladorOpen}
        onClose={() => setModalSimuladorOpen(false)}
        meses={meses}
        simulacoes={simulacoes}
        onAdicionarSimulacao={adicionarSimulacao}
        onRemoverSimulacao={removerSimulacao}
        onAlternarSimulacao={alternarSimulacao}
        onLimparSimulacoes={limparSimulacoes}
      />
    </motion.div>
  );
}
