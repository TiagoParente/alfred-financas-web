"use client";

import { useState } from "react";
import { useFamilias } from "@/features/familias/hooks/useFamilias";
import { useContasBancarias } from "@/features/contas_bancarias/hooks/useContasBancarias";
import { ContaBancaria } from "@/types/contas";
import { ResumoSaldosCards } from "@/features/contas_bancarias/components/ResumoSaldosCards";
import { ContaBancariaCard } from "@/features/contas_bancarias/components/ContaBancariaCard";
import { ContaBancariaModal } from "@/features/contas_bancarias/components/ContaBancariaModal";
import { DeletarContaModal } from "@/features/contas_bancarias/components/DeletarContaModal";
import { ContasBancariasSkeleton } from "@/features/contas_bancarias/components/ContasBancariasSkeleton";
import { ContasBancariasEmptyState } from "@/features/contas_bancarias/components/ContasBancariasEmptyState";
import { Plus, RefreshCw, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";

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

  const [modalFormAberta, setModalFormAberta] = useState(false);
  const [contaEmEdicao, setContaEmEdicao] = useState<ContaBancaria | null>(null);

  const [modalDeletarAberta, setModalDeletarAberta] = useState(false);
  const [contaParaDeletar, setContaParaDeletar] = useState<ContaBancaria | null>(null);

  const handleNovaConta = () => {
    setContaEmEdicao(null);
    setModalFormAberta(true);
  };

  const handleEditar = (conta: ContaBancaria) => {
    setContaEmEdicao(conta);
    setModalFormAberta(true);
  };

  const handleDeletar = (conta: ContaBancaria) => {
    setContaParaDeletar(conta);
    setModalDeletarAberta(true);
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
          className="mt-4 gap-2 rounded-[10px]"
        >
          <RefreshCw className="h-4 w-4" />
          <span>Tentar Novamente</span>
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header da Página */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground tracking-tight">
            Contas Bancárias
          </h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            Gerencie as contas correntes, poupanças e reservas da sua família.
          </p>
        </div>

        {contas.length > 0 && (
          <Button
            onClick={handleNovaConta}
            className="rounded-[10px] bg-[#1F4E79] hover:bg-[#1F4E79]/90 text-white font-medium gap-2 shadow-sm"
          >
            <Plus className="h-4 w-4" />
            <span>Nova Conta</span>
          </Button>
        )}
      </div>

      {/* Cards de Resumo */}
      <ResumoSaldosCards resumo={resumo} />

      {/* Lista de Contas ou Empty State */}
      {contas.length === 0 ? (
        <ContasBancariasEmptyState onNovaConta={handleNovaConta} />
      ) : (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-bold text-foreground">
              Todas as Contas ({contas.length})
            </h2>
          </div>

          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
            {contas.map((conta) => (
              <ContaBancariaCard
                key={conta.id}
                conta={conta}
                onEditar={handleEditar}
                onDeletar={handleDeletar}
              />
            ))}
          </div>
        </div>
      )}

      {/* Modais */}
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
    </div>
  );
}
