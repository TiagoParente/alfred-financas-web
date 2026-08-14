"use client";

import { useState, useMemo } from "react";
import { useFamilias } from "@/features/familias/hooks/useFamilias";
import { useContasBancarias } from "@/features/contas_bancarias/hooks/useContasBancarias";
import { useMovimentacoes } from "@/features/movimentacoes/hooks/useMovimentacoes";
import { ContaBancaria, TipoContaBancaria } from "@/types/contas";
import { ResumoSaldosCards } from "@/features/contas_bancarias/components/ResumoSaldosCards";
import { ContaBancariaCard } from "@/features/contas_bancarias/components/ContaBancariaCard";
import { ContasBancariasListView } from "@/features/contas_bancarias/components/ContasBancariasListView";
import { ContaBancariaModal } from "@/features/contas_bancarias/components/ContaBancariaModal";
import { DeletarContaModal } from "@/features/contas_bancarias/components/DeletarContaModal";
import { PainelContaModal } from "@/features/contas_bancarias/components/PainelContaModal";
import { MovimentacaoModal } from "@/features/movimentacoes/components/MovimentacaoModal";
import { ContasBancariasSkeleton } from "@/features/contas_bancarias/components/ContasBancariasSkeleton";
import { ContasBancariasEmptyState } from "@/features/contas_bancarias/components/ContasBancariasEmptyState";
import {
  Plus,
  PlusCircle,
  RefreshCw,
  AlertCircle,
  Search,
  LayoutList,
  LayoutGrid,
  Landmark,
  X,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

type TabTipoConta = "todas" | TipoContaBancaria;
type ModoExibicao = "lista" | "grid";

export default function ContasBancariasPage() {
  const { familiaAtivaId } = useFamilias();
  const {
    contas,
    resumo,
    isLoading,
    isError,
    refetch,
    criarConta,
    isCriando,
    atualizarConta,
    isAtualizando,
    deletarConta,
    isDeletando,
  } = useContasBancarias(familiaAtivaId);

  const { criarMovimentacao } = useMovimentacoes(familiaAtivaId);

  const [tabAtiva, setTabAtiva] = useState<TabTipoConta>("todas");
  const [modoExibicao, setModoExibicao] = useState<ModoExibicao>("lista");
  const [searchTerm, setSearchTerm] = useState("");

  const [modalFormAberta, setModalFormAberta] = useState(false);
  const [contaEmEdicao, setContaEmEdicao] = useState<ContaBancaria | null>(null);

  const [modalDeletarAberta, setModalDeletarAberta] = useState(false);
  const [contaParaDeletar, setContaParaDeletar] = useState<ContaBancaria | null>(null);

  // Modal de Painel da Conta Bancária
  const [modalPainelAberta, setModalPainelAberta] = useState(false);
  const [contaParaPainel, setContaParaPainel] = useState<ContaBancaria | null>(null);

  // Modal de Movimentação
  const [modalMovimentacaoAberta, setModalMovimentacaoAberta] = useState(false);
  const [contaParaMovimentacao, setContaParaMovimentacao] = useState<ContaBancaria | null>(null);

  // Filtragem por tipo e por busca de texto
  const contasFiltradas = useMemo(() => {
    let result = contas;

    // Filtro por tipo de conta
    if (tabAtiva !== "todas") {
      result = result.filter((c) => c.tipo_conta === tabAtiva);
    }

    // Filtro por termo de busca
    if (searchTerm.trim()) {
      const term = searchTerm.toLowerCase().trim();
      result = result.filter(
        (c) =>
          c.nome.toLowerCase().includes(term) ||
          c.instituicao_financeira?.toLowerCase().includes(term) ||
          c.banco?.nome.toLowerCase().includes(term) ||
          c.tipo_conta_descricao.toLowerCase().includes(term)
      );
    }

    return result;
  }, [contas, tabAtiva, searchTerm]);

  // Contadores por tipo de conta para as abas
  const contadores = useMemo(() => {
    return {
      todas: contas.length,
      corrente: contas.filter((c) => c.tipo_conta === TipoContaBancaria.CORRENTE).length,
      poupanca: contas.filter((c) => c.tipo_conta === TipoContaBancaria.POUPANCA).length,
      investimento: contas.filter((c) => c.tipo_conta === TipoContaBancaria.INVESTIMENTO).length,
      outros: contas.filter((c) => c.tipo_conta === TipoContaBancaria.OUTROS).length,
    };
  }, [contas]);

  const handleNovaConta = () => {
    setContaEmEdicao(null);
    setModalFormAberta(true);
  };

  const handleVerPainel = (conta: ContaBancaria) => {
    setContaParaPainel(conta);
    setModalPainelAberta(true);
  };

  const handleEditar = (conta: ContaBancaria) => {
    setContaEmEdicao(conta);
    setModalFormAberta(true);
  };

  const handleDeletar = (conta: ContaBancaria) => {
    setContaParaDeletar(conta);
    setModalDeletarAberta(true);
  };

  const handleLancarMovimentacao = (conta?: ContaBancaria) => {
    setContaParaMovimentacao(conta ?? null);
    setModalMovimentacaoAberta(true);
  };

  // Submit de lançamento de movimentação
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const handleSalvarMovimentacao = async (payload: any) => {
    await criarMovimentacao(payload);
    setContaParaMovimentacao(null);
  };

  // Submit do formulário de criação/edição
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

  const handleConfirmarDeletar = async () => {
    if (contaParaDeletar) {
      await deletarConta(contaParaDeletar.id);
      setContaParaDeletar(null);
    }
  };

  if (isLoading) {
    return <ContasBancariasSkeleton />;
  }

  if (isError) {
    return (
      <div className="flex flex-col items-center justify-center rounded-[20px] border border-red-200 bg-red-50/50 p-8 text-center dark:border-red-950 dark:bg-red-950/20">
        <AlertCircle className="h-10 w-10 text-red-500 mb-3" />
        <h3 className="text-base font-bold text-foreground">
          Não foi possível carregar as contas bancárias
        </h3>
        <p className="mt-1 text-xs text-muted-foreground">
          Ocorreu uma falha de conexão com a API.
        </p>
        <Button
          onClick={() => refetch()}
          variant="outline"
          className="mt-4 gap-2 rounded-[10px] cursor-pointer"
        >
          <RefreshCw className="h-4 w-4" />
          <span>Tentar Novamente</span>
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header da Página */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground tracking-tight flex items-center gap-2">
            <Landmark className="h-6 w-6 text-[#1F4E79]" />
            Contas Bancárias
          </h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            Gerencie as contas correntes, poupanças e reservas da sua família.
          </p>
        </div>

        {contas.length > 0 && (
          <div className="flex items-center gap-2.5 flex-wrap">
            <Button
              onClick={() => handleLancarMovimentacao()}
              variant="outline"
              className="rounded-[10px] border-[#1F4E79]/30 text-[#1F4E79] hover:bg-[#1F4E79]/10 font-medium gap-2 shadow-2xs cursor-pointer whitespace-nowrap"
            >
              <PlusCircle className="h-4 w-4 text-[#1F4E79]" />
              <span>Nova Movimentação</span>
            </Button>
            <Button
              onClick={handleNovaConta}
              className="rounded-[10px] bg-[#1F4E79] hover:bg-[#1F4E79]/90 text-white font-medium gap-2 shadow-2xs cursor-pointer whitespace-nowrap"
            >
              <Plus className="h-4 w-4" />
              <span>Nova Conta</span>
            </Button>
          </div>
        )}
      </div>

      {/* Cards de Resumo */}
      <ResumoSaldosCards resumo={resumo} />

      {/* Conteúdo Principal */}
      {contas.length === 0 ? (
        <ContasBancariasEmptyState onNovaConta={handleNovaConta} />
      ) : (
        <div className="space-y-5">
          {/* Barra de Filtros por Tipo, Busca e Alternador de Modo de Exibição */}
          <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between border-b border-border/40 pb-3.5">
            {/* Abas por Tipo de Conta */}
            <div className="flex items-center gap-1.5 overflow-x-auto pb-1 md:pb-0">
              <button
                type="button"
                onClick={() => setTabAtiva("todas")}
                className={cn(
                  "px-3.5 py-1.5 text-xs font-semibold rounded-lg transition-colors shrink-0 cursor-pointer",
                  tabAtiva === "todas"
                    ? "bg-[#1F4E79] text-white shadow-2xs"
                    : "text-muted-foreground hover:bg-accent hover:text-foreground"
                )}
              >
                Todas ({contadores.todas})
              </button>
              <button
                type="button"
                onClick={() => setTabAtiva(TipoContaBancaria.CORRENTE)}
                className={cn(
                  "px-3.5 py-1.5 text-xs font-semibold rounded-lg transition-colors shrink-0 cursor-pointer",
                  tabAtiva === TipoContaBancaria.CORRENTE
                    ? "bg-[#1F4E79] text-white shadow-2xs"
                    : "text-muted-foreground hover:bg-accent hover:text-foreground"
                )}
              >
                Corrente ({contadores.corrente})
              </button>
              <button
                type="button"
                onClick={() => setTabAtiva(TipoContaBancaria.POUPANCA)}
                className={cn(
                  "px-3.5 py-1.5 text-xs font-semibold rounded-lg transition-colors shrink-0 cursor-pointer",
                  tabAtiva === TipoContaBancaria.POUPANCA
                    ? "bg-[#1F4E79] text-white shadow-2xs"
                    : "text-muted-foreground hover:bg-accent hover:text-foreground"
                )}
              >
                Poupança ({contadores.poupanca})
              </button>
              <button
                type="button"
                onClick={() => setTabAtiva(TipoContaBancaria.INVESTIMENTO)}
                className={cn(
                  "px-3.5 py-1.5 text-xs font-semibold rounded-lg transition-colors shrink-0 cursor-pointer",
                  tabAtiva === TipoContaBancaria.INVESTIMENTO
                    ? "bg-[#1F4E79] text-white shadow-2xs"
                    : "text-muted-foreground hover:bg-accent hover:text-foreground"
                )}
              >
                Investimento ({contadores.investimento})
              </button>
              {contadores.outros > 0 && (
                <button
                  type="button"
                  onClick={() => setTabAtiva(TipoContaBancaria.OUTROS)}
                  className={cn(
                    "px-3.5 py-1.5 text-xs font-semibold rounded-lg transition-colors shrink-0 cursor-pointer",
                    tabAtiva === TipoContaBancaria.OUTROS
                      ? "bg-[#1F4E79] text-white shadow-2xs"
                      : "text-muted-foreground hover:bg-accent hover:text-foreground"
                  )}
                >
                  Outros ({contadores.outros})
                </button>
              )}
            </div>

            {/* Busca em Tempo Real + Alternador de Visualização */}
            <div className="flex items-center gap-2.5">
              {/* Campo de Busca */}
              <div className="relative flex-1 md:w-64">
                <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
                <Input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Buscar conta ou banco..."
                  className="h-8 pl-8 pr-7 text-xs rounded-lg bg-card"
                />
                {searchTerm && (
                  <button
                    type="button"
                    onClick={() => setSearchTerm("")}
                    className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground cursor-pointer"
                  >
                    <X className="h-3 w-3" />
                  </button>
                )}
              </div>

              {/* Botões do Alternador (Lista vs Grid) */}
              <div className="flex items-center rounded-lg border border-border/60 bg-muted/40 p-0.5 shrink-0">
                <button
                  type="button"
                  onClick={() => setModoExibicao("lista")}
                  className={cn(
                    "flex items-center gap-1 px-2.5 py-1 text-xs font-medium rounded-md transition-all cursor-pointer",
                    modoExibicao === "lista"
                      ? "bg-background text-foreground shadow-2xs font-semibold"
                      : "text-muted-foreground hover:text-foreground"
                  )}
                  title="Visão em Lista Compacta"
                >
                  <LayoutList className="h-3.5 w-3.5" />
                  <span className="hidden sm:inline">Lista</span>
                </button>
                <button
                  type="button"
                  onClick={() => setModoExibicao("grid")}
                  className={cn(
                    "flex items-center gap-1 px-2.5 py-1 text-xs font-medium rounded-md transition-all cursor-pointer",
                    modoExibicao === "grid"
                      ? "bg-background text-foreground shadow-2xs font-semibold"
                      : "text-muted-foreground hover:text-foreground"
                  )}
                  title="Visão em Cards Grid"
                >
                  <LayoutGrid className="h-3.5 w-3.5" />
                  <span className="hidden sm:inline">Cards</span>
                </button>
              </div>
            </div>
          </div>

          {/* Exibição das Contas */}
          {contasFiltradas.length === 0 ? (
            <div className="text-center py-12 rounded-2xl border border-dashed border-border/60 bg-accent/10 space-y-2">
              <p className="text-sm font-medium text-foreground">
                Nenhuma conta encontrada
              </p>
              <p className="text-xs text-muted-foreground">
                {searchTerm
                  ? `Nenhum resultado para "${searchTerm}"`
                  : "Nenhuma conta cadastrada neste filtro."}
              </p>
              {searchTerm && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setSearchTerm("")}
                  className="mt-2 text-xs rounded-lg cursor-pointer"
                >
                  Limpar busca
                </Button>
              )}
            </div>
          ) : modoExibicao === "lista" ? (
            <ContasBancariasListView
              contas={contasFiltradas}
              onVerPainel={handleVerPainel}
              onLancarMovimentacao={handleLancarMovimentacao}
              onEditar={handleEditar}
              onDeletar={handleDeletar}
            />
          ) : (
            <div className="grid grid-cols-1 gap-3.5 md:grid-cols-2 lg:grid-cols-3">
              {contasFiltradas.map((conta) => (
                <ContaBancariaCard
                  key={conta.id}
                  conta={conta}
                  onVerPainel={handleVerPainel}
                  onLancarMovimentacao={handleLancarMovimentacao}
                  onEditar={handleEditar}
                  onDeletar={handleDeletar}
                />
              ))}
            </div>
          )}
        </div>
      )}

      {/* Modais */}
      <PainelContaModal
        open={modalPainelAberta}
        onOpenChange={setModalPainelAberta}
        conta={contaParaPainel}
        familiaId={familiaAtivaId}
        onLancarMovimentacao={handleLancarMovimentacao}
      />

      <ContaBancariaModal
        open={modalFormAberta}
        onOpenChange={setModalFormAberta}
        contaEmEdicao={contaEmEdicao}
        onSubmit={handleSubmitForm}
        isSubmitting={isCriando || isAtualizando}
      />

      <DeletarContaModal
        open={modalDeletarAberta}
        onOpenChange={setModalDeletarAberta}
        conta={contaParaDeletar}
        onConfirm={handleConfirmarDeletar}
        isDeleting={isDeletando}
      />

      <MovimentacaoModal
        open={modalMovimentacaoAberta}
        onOpenChange={setModalMovimentacaoAberta}
        contaBancariaIdPadrao={contaParaMovimentacao?.id}
        onSalvar={handleSalvarMovimentacao}
        familiaId={familiaAtivaId}
      />
    </div>
  );
}
