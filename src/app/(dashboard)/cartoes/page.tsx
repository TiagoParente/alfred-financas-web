"use client";

import { useState, useMemo } from "react";
import { useFamilias } from "@/features/familias/hooks/useFamilias";
import { useCartoes } from "@/features/cartoes/hooks/useCartoes";
import { useMovimentacoes } from "@/features/movimentacoes/hooks/useMovimentacoes";
import { CartaoCredito } from "@/types/cartoes";
import { ResumoCartoesCards } from "@/features/cartoes/components/ResumoCartoesCards";
import { CartaoCreditoCard } from "@/features/cartoes/components/CartaoCreditoCard";
import { CartoesListView } from "@/features/cartoes/components/CartoesListView";
import { CartaoCreditoModal } from "@/features/cartoes/components/CartaoCreditoModal";
import { FaturaModal } from "@/features/cartoes/components/FaturaModal";
import { DeletarCartaoModal } from "@/features/cartoes/components/DeletarCartaoModal";
import { MovimentacaoModal } from "@/features/movimentacoes/components/MovimentacaoModal";
import { CartoesSkeleton } from "@/features/cartoes/components/CartoesSkeleton";
import { CartoesEmptyState } from "@/features/cartoes/components/CartoesEmptyState";
import {
  CreditCard,
  Plus,
  RefreshCw,
  AlertCircle,
  Search,
  LayoutList,
  LayoutGrid,
  X,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

type ModoExibicao = "lista" | "grid";

export default function CartoesPage() {
  const { familiaAtivaId } = useFamilias();
  const {
    cartoes,
    resumo,
    isLoading,
    isError,
    refetch,
    criarCartao,
    isCriando,
    atualizarCartao,
    isAtualizando,
    deletarCartao,
    isDeletando,
  } = useCartoes(familiaAtivaId);

  const { criarMovimentacao } = useMovimentacoes(familiaAtivaId);

  const [modoExibicao, setModoExibicao] = useState<ModoExibicao>("lista");
  const [searchTerm, setSearchTerm] = useState("");

  // Modais de Cartão
  const [modalFormAberta, setModalFormAberta] = useState(false);
  const [cartaoEmEdicao, setCartaoEmEdicao] = useState<CartaoCredito | null>(null);

  const [modalDeletarAberta, setModalDeletarAberta] = useState(false);
  const [cartaoParaDeletar, setCartaoParaDeletar] = useState<CartaoCredito | null>(null);

  const [modalFaturaAberta, setModalFaturaAberta] = useState(false);
  const [cartaoParaFatura, setCartaoParaFatura] = useState<CartaoCredito | null>(null);

  // Modal de Lançamento de Despesa na Fatura
  const [modalDespesaAberta, setModalDespesaAberta] = useState(false);
  const [cartaoParaDespesa, setCartaoParaDespesa] = useState<CartaoCredito | null>(null);

  // Filtragem por busca
  const cartoesFiltrados = useMemo(() => {
    if (!searchTerm.trim()) return cartoes;

    const term = searchTerm.toLowerCase().trim();
    return cartoes.filter(
      (c) =>
        c.nome.toLowerCase().includes(term) ||
        c.banco?.nome.toLowerCase().includes(term) ||
        c.bandeira_descricao?.toLowerCase().includes(term)
    );
  }, [cartoes, searchTerm]);

  const handleNovoCartao = () => {
    setCartaoEmEdicao(null);
    setModalFormAberta(true);
  };

  const handleEditar = (cartao: CartaoCredito) => {
    setCartaoEmEdicao(cartao);
    setModalFormAberta(true);
  };

  const handleDeletar = (cartao: CartaoCredito) => {
    setCartaoParaDeletar(cartao);
    setModalDeletarAberta(true);
  };

  const handleVisualizarFatura = (cartao: CartaoCredito) => {
    setCartaoParaFatura(cartao);
    setModalFaturaAberta(true);
  };

  const handleLancarDespesa = (cartao: CartaoCredito) => {
    setCartaoParaDespesa(cartao);
    setModalDespesaAberta(true);
  };

  // Submit do formulário de criação/edição de Cartão
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const handleSubmitForm = async (formData: any) => {
    if (cartaoEmEdicao) {
      await atualizarCartao({
        id: cartaoEmEdicao.id,
        payload: formData,
      });
    } else {
      await criarCartao(formData);
    }
  };

  const handleConfirmarDeletar = async (id: number) => {
    await deletarCartao(id);
    setCartaoParaDeletar(null);
  };

  // Submit do lançamento de despesa na fatura
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const handleSalvarDespesa = async (payload: any) => {
    await criarMovimentacao(payload);
    setCartaoParaDespesa(null);
  };

  if (isLoading) {
    return <CartoesSkeleton />;
  }

  if (isError) {
    return (
      <div className="flex flex-col items-center justify-center rounded-[20px] border border-red-200 bg-red-50/50 p-8 text-center dark:border-red-950 dark:bg-red-950/20">
        <AlertCircle className="h-10 w-10 text-red-500 mb-3" />
        <h3 className="text-base font-bold text-foreground">
          Não foi possível carregar os cartões de crédito
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
            <CreditCard className="h-6 w-6 text-[#1F4E79]" />
            Cartões de Crédito
          </h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            Acompanhe limites, datas de fechamento/vencimento e faturas dos seus cartões.
          </p>
        </div>

        {cartoes.length > 0 && (
          <Button
            onClick={handleNovoCartao}
            className="rounded-[10px] bg-[#1F4E79] hover:bg-[#1F4E79]/90 text-white font-medium gap-2 shadow-sm cursor-pointer"
          >
            <Plus className="h-4 w-4" />
            <span>Novo Cartão</span>
          </Button>
        )}
      </div>

      {/* Resumo de Limites e Faturas */}
      <ResumoCartoesCards resumo={resumo} />

      {/* Lista / Grid de Cartões */}
      {cartoes.length === 0 ? (
        <CartoesEmptyState onNovoCartao={handleNovoCartao} />
      ) : (
        <div className="space-y-5">
          {/* Barra de Busca + Alternador de Visualização (Lista / Grid) */}
          <div className="flex items-center justify-between border-b border-border/40 pb-3.5 gap-3">
            <div className="relative w-full max-w-xs">
              <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
              <Input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Buscar por nome, banco ou bandeira..."
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

            <div className="flex items-center gap-3 shrink-0">
              <span className="text-xs text-muted-foreground hidden sm:inline">
                {cartoesFiltrados.length}{" "}
                {cartoesFiltrados.length === 1
                  ? "cartão exibido"
                  : "cartões exibidos"}
              </span>

              {/* Botões Alternadores Lista / Grid */}
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

          {cartoesFiltrados.length === 0 ? (
            <div className="text-center py-12 rounded-2xl border border-dashed border-border/60 bg-accent/10 space-y-2">
              <p className="text-sm font-medium text-foreground">
                Nenhum cartão encontrado
              </p>
              <p className="text-xs text-muted-foreground">
                Nenhum resultado corresponde à busca &quot;{searchTerm}&quot;.
              </p>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setSearchTerm("")}
                className="mt-2 text-xs rounded-lg cursor-pointer"
              >
                Limpar busca
              </Button>
            </div>
          ) : modoExibicao === "lista" ? (
            <CartoesListView
              cartoes={cartoesFiltrados}
              onVisualizarFatura={handleVisualizarFatura}
              onLancarDespesa={handleLancarDespesa}
              onEditar={handleEditar}
              onDeletar={handleDeletar}
            />
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {cartoesFiltrados.map((cartao) => (
                <CartaoCreditoCard
                  key={cartao.id}
                  cartao={cartao}
                  onVisualizarFatura={handleVisualizarFatura}
                  onLancarDespesa={handleLancarDespesa}
                  onEditar={handleEditar}
                  onDeletar={handleDeletar}
                />
              ))}
            </div>
          )}
        </div>
      )}

      {/* Modais */}
      <CartaoCreditoModal
        open={modalFormAberta}
        onOpenChange={setModalFormAberta}
        cartaoEmEdicao={cartaoEmEdicao}
        onSubmit={handleSubmitForm}
        isSubmitting={isCriando || isAtualizando}
      />

      <FaturaModal
        open={modalFaturaAberta}
        onOpenChange={setModalFaturaAberta}
        cartao={cartaoParaFatura}
        onLancarDespesa={handleLancarDespesa}
      />

      <DeletarCartaoModal
        open={modalDeletarAberta}
        onOpenChange={setModalDeletarAberta}
        cartao={cartaoParaDeletar}
        onConfirm={handleConfirmarDeletar}
        isDeleting={isDeletando}
      />

      {/* Modal para Lançar Despesa na Fatura */}
      <MovimentacaoModal
        open={modalDespesaAberta}
        onOpenChange={setModalDespesaAberta}
        cartaoCreditoIdPadrao={cartaoParaDespesa?.id}
        onSalvar={handleSalvarDespesa}
        familiaId={familiaAtivaId}
      />
    </div>
  );
}
