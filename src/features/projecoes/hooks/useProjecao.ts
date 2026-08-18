"use client";

import { useState, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { projecoesService } from "@/services/projecoes";
import {
  ProjecaoData,
  ProjecaoMesItem,
  ProjecaoResumo,
  SimuladorAjuste,
} from "@/types/projecoes";

export function useProjecao(
  familiaId?: number | null,
  meses: number = 6,
  mes?: number,
  ano?: number,
  regime: "caixa" | "competencia" = "caixa"
) {
  const queryKey = ["projecoes", familiaId, meses, mes, ano, regime];

  const { data, isLoading, isError, error, refetch } = useQuery<ProjecaoData>({
    queryKey,
    queryFn: () =>
      projecoesService.obter(
        meses,
        mes,
        ano,
        regime,
        familiaId ?? undefined
      ),
    enabled: true,
  });

  // Estado local para simulações de cenários ("What-if")
  const [simulacoes, setSimulacoes] = useState<SimuladorAjuste[]>([]);

  const adicionarSimulacao = (simulacao: Omit<SimuladorAjuste, "id" | "ativo">) => {
    const nova: SimuladorAjuste = {
      ...simulacao,
      id: crypto.randomUUID ? crypto.randomUUID() : Math.random().toString(36).substring(2, 9),
      ativo: true,
    };
    setSimulacoes((prev) => [...prev, nova]);
  };

  const removerSimulacao = (id: string) => {
    setSimulacoes((prev) => prev.filter((s) => s.id !== id));
  };

  const alternarSimulacao = (id: string) => {
    setSimulacoes((prev) =>
      prev.map((s) => (s.id === id ? { ...s, ativo: !s.ativo } : s))
    );
  };

  const limparSimulacoes = () => {
    setSimulacoes([]);
  };

  // Cálculo da série temporal considerando as simulações ativas
  const { mesesSimulados, resumoSimulado } = useMemo(() => {
    if (!data || !data.meses || data.meses.length === 0) {
      return {
        mesesSimulados: [] as ProjecaoMesItem[],
        resumoSimulado: null as ProjecaoResumo | null,
      };
    }

    const simulacoesAtivas = simulacoes.filter((s) => s.ativo);

    if (simulacoesAtivas.length === 0) {
      return {
        mesesSimulados: data.meses,
        resumoSimulado: data.resumo,
      };
    }

    let saldoAcumulado = data.resumo.saldo_atual_disponivel;
    let menorSaldo = saldoAcumulado;
    let pontoCritico = data.resumo.ponto_critico;
    let somaReceitas = 0;
    let somaDespesas = 0;
    let somaComprometido = 0;

    const listaMeses: ProjecaoMesItem[] = data.meses.map((m, idx) => {
      let deltaReceitas = 0;
      let deltaDespesas = 0;

      for (const sim of simulacoesAtivas) {
        let aplicaNesteMes = false;
        if (sim.frequencia === "mensal") {
          aplicaNesteMes = m.mes_ano >= sim.mes_inicio;
        } else {
          aplicaNesteMes = m.mes_ano === sim.mes_inicio;
        }

        if (aplicaNesteMes) {
          if (sim.tipo === "receita") {
            deltaReceitas += sim.valor;
          } else {
            deltaDespesas += sim.valor;
          }
        }
      }

      const totalReceitas = m.total_receitas + deltaReceitas;
      const totalDespesas = m.total_despesas + deltaDespesas;
      const balanco = totalReceitas - totalDespesas;
      saldoAcumulado += balanco;

      if (idx === 0 || saldoAcumulado < menorSaldo) {
        menorSaldo = saldoAcumulado;
        pontoCritico = {
          mes: m.mes,
          ano: m.ano,
          mes_ano: m.mes_ano,
          nome_mes: m.nome_mes,
          nome_mes_completo: m.nome_mes_completo,
          saldo_acumulado: saldoAcumulado,
        };
      }

      somaReceitas += totalReceitas;
      somaDespesas += totalDespesas;
      somaComprometido += (m.detalhes?.despesas_contas_fixas ?? 0) + (m.detalhes?.faturas_cartao ?? 0) + deltaDespesas;

      return {
        ...m,
        total_receitas: totalReceitas,
        total_despesas: totalDespesas,
        balanco_mensal: balanco,
        saldo_acumulado: saldoAcumulado,
      };
    });

    const totalMesesCount = listaMeses.length || 1;
    const mediaReceitas = somaReceitas / totalMesesCount;
    const mediaDespesas = somaDespesas / totalMesesCount;
    const mediaSobra = mediaReceitas - mediaDespesas;
    const taxaComprometimento = somaReceitas > 0 ? Math.min(100, Math.round((somaComprometido / somaReceitas) * 1000) / 10) : 0;

    const resumo: ProjecaoResumo = {
      saldo_atual_disponivel: data.resumo.saldo_atual_disponivel,
      saldo_final_projetado: saldoAcumulado,
      variacao_saldo: saldoAcumulado - data.resumo.saldo_atual_disponivel,
      media_receitas_mensal: mediaReceitas,
      media_despesas_mensal: mediaDespesas,
      media_sobra_mensal: mediaSobra,
      taxa_comprometimento_renda: taxaComprometimento,
      ponto_critico: pontoCritico,
    };

    return {
      mesesSimulados: listaMeses,
      resumoSimulado: resumo,
    };
  }, [data, simulacoes]);

  return {
    dados: data,
    resumo: resumoSimulado ?? data?.resumo,
    meses: mesesSimulados.length > 0 ? mesesSimulados : (data?.meses ?? []),
    categorias: data?.categorias ?? [],
    alfredInsights: data?.alfred_insights,
    simulacoes,
    temSimulacaoAtiva: simulacoes.some((s) => s.ativo),
    adicionarSimulacao,
    removerSimulacao,
    alternarSimulacao,
    limparSimulacoes,
    isLoading,
    isError,
    error,
    refetch,
  };
}
