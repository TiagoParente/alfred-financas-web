"use client";

import { useCallback, useEffect, useMemo } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
  CheckCircle2,
  Loader2,
  Calendar,
  FileText,
  Landmark,
  AlertTriangle,
  Receipt,
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { CartaoCredito, DetalhesFaturaResponse } from "@/types/cartoes";
import { ContaBancaria } from "@/types/contas";
import { useContasBancarias } from "@/features/contas_bancarias/hooks/useContasBancarias";
import { useFaturaCartao } from "../hooks/useFaturaCartao";
import { formatarMoeda, formatarData } from "@/utils/formatters";
import { toast } from "@/components/ui/toast";
import { extrairMensagemErro } from "@/hooks/useAuth";

// ─── Schema Zod ───────────────────────────────────────────────────────────────

const pagarFaturaSchema = z.object({
  conta_bancaria_id: z.string().min(1, "Selecione a conta bancária para débito"),
  tipo_pagamento: z.enum(["total", "parcial"]),
  valor_personalizado: z.string().optional(),
  data_pagamento: z.string().min(1, "Informe a data do pagamento"),
  observacao: z.string().optional(),
});

export type PagarFaturaFormData = z.infer<typeof pagarFaturaSchema>;

// ─── Props ─────────────────────────────────────────────────────────────────────

interface PagarFaturaModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  cartao: CartaoCredito | null;
  fatura: DetalhesFaturaResponse | null;
  onSuccess?: () => void;
}

// ─── Componente ────────────────────────────────────────────────────────────────

export function PagarFaturaModal({
  open,
  onOpenChange,
  cartao,
  fatura,
  onSuccess,
}: PagarFaturaModalProps) {
  const { contas = [], isLoading: isLoadingContas } = useContasBancarias();
  const { pagarFatura, isPagandoFatura } = useFaturaCartao(cartao?.id ?? null);

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    reset,
    setError,
    clearErrors,
    formState: { errors },
  } = useForm<PagarFaturaFormData>({
    resolver: zodResolver(pagarFaturaSchema),
    defaultValues: {
      conta_bancaria_id: "",
      tipo_pagamento: "total",
      valor_personalizado: "",
      data_pagamento: "",
      observacao: "",
    },
  });

  const contaSelecionadaId = watch("conta_bancaria_id");
  const tipoPagamento = watch("tipo_pagamento");
  const valorPersonalizadoStr = watch("valor_personalizado");

  const valorAPagarTotal =
    fatura?.valor_pendente !== undefined
      ? Number(fatura.valor_pendente)
      : Number(fatura?.valor_total) || 0;
  const valorJaPago = Number(fatura?.valor_pago) || 0;
  const valorTotalFatura = Number(fatura?.valor_total) || 0;

  // Valor numérico a ser liquidado conforme escolha do usuário
  const valorEfetivo = useMemo(() => {
    if (tipoPagamento === "total") {
      return valorAPagarTotal;
    }
    const limpo = (valorPersonalizadoStr || "").replace(/\./g, "").replace(",", ".");
    const num = parseFloat(limpo);
    return isNaN(num) ? 0 : num;
  }, [tipoPagamento, valorPersonalizadoStr, valorAPagarTotal]);

  useEffect(() => {
    if (open) {
      const hoje = new Date().toISOString().split("T")[0];
      const primeiraConta = contas.length > 0 ? String(contas[0].id) : "";

      reset({
        conta_bancaria_id: primeiraConta,
        tipo_pagamento: "total",
        valor_personalizado: valorAPagarTotal > 0 ? valorAPagarTotal.toFixed(2).replace(".", ",") : "",
        data_pagamento: hoje,
        observacao: "",
      });
    }
  }, [open, contas, reset, valorAPagarTotal]);

  const contaSelecionada = useMemo(() => {
    return contas.find((c) => String(c.id) === contaSelecionadaId);
  }, [contas, contaSelecionadaId]);

  // ── Renderização com logotipo / cor da conta bancária ───────────────────────
  const renderContaOption = useCallback((conta: ContaBancaria) => {
    const corBg = conta.cor_hex || "#1F4E79";
    return (
      <div className="flex items-center gap-2 min-w-0">
        <div
          className="flex h-5 w-5 shrink-0 items-center justify-center rounded-md text-white font-bold text-[10px] shadow-2xs overflow-hidden"
          style={{ backgroundColor: corBg }}
        >
          {conta.banco?.logo_url ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={conta.banco.logo_url}
              alt={conta.banco.nome}
              className="h-3.5 w-3.5 object-contain"
            />
          ) : (
            <Landmark className="h-3 w-3 text-white" />
          )}
        </div>
        <span className="font-medium text-xs truncate">{conta.nome}</span>
        {conta.instituicao_financeira || conta.banco?.nome ? (
          <span className="text-[10px] text-muted-foreground truncate hidden sm:inline">
            • {conta.instituicao_financeira || conta.banco?.nome}
          </span>
        ) : null}
      </div>
    );
  }, []);

  const labelConta = useCallback(
    (value: unknown) => {
      if (!value) return null;
      const found = contas.find((c) => c.id.toString() === String(value));
      return found ? renderContaOption(found) : null;
    },
    [contas, renderContaOption]
  );

  const saldoInsuficiente = contaSelecionada
    ? Number(contaSelecionada.saldo_atual) < valorEfetivo
    : false;

  if (!cartao || !fatura) return null;

  const aplicarPorcentagem = (fator: number) => {
    const val = Math.round(valorAPagarTotal * fator * 100) / 100;
    setValue("valor_personalizado", val.toFixed(2).replace(".", ","), { shouldValidate: true });
    clearErrors("valor_personalizado");
  };

  const onSubmit = async (data: PagarFaturaFormData) => {
    let valorFinal = valorAPagarTotal;

    if (data.tipo_pagamento === "parcial") {
      const limpo = (data.valor_personalizado || "").replace(/\./g, "").replace(",", ".");
      const parsed = parseFloat(limpo);

      if (isNaN(parsed) || parsed <= 0) {
        setError("valor_personalizado", { message: "Informe um valor válido maior que zero" });
        return;
      }

      if (parsed > valorAPagarTotal) {
        setError("valor_personalizado", {
          message: `O valor não pode ultrapassar o saldo pendente de ${formatarMoeda(valorAPagarTotal)}`,
        });
        return;
      }

      valorFinal = parsed;
    }

    try {
      await pagarFatura({
        id: cartao.id,
        payload: {
          conta_bancaria_id: Number(data.conta_bancaria_id),
          valor: valorFinal,
          mes_ano: fatura.mes_ano_referencia,
          data_pagamento: data.data_pagamento,
          observacao: data.observacao?.trim() || undefined,
        },
      });

      toast.add({
        title: "Fatura paga com sucesso!",
        description: `O valor de ${formatarMoeda(valorFinal)} foi liquidado da conta ${contaSelecionada?.nome ?? ""} e o limite do cartão foi liberado.`,
        type: "success",
      });

      onOpenChange(false);
      onSuccess?.();
    } catch (err: unknown) {
      const msg = extrairMensagemErro(err);
      toast.add({
        title: "Erro ao pagar fatura",
        description: msg,
        type: "error",
      });
      setError("root", { message: msg });
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[520px] rounded-[20px] p-6 border-border/60 bg-card">
        <DialogHeader className="space-y-2">
          <div className="flex items-center gap-3">
            <div
              className="h-10 w-10 rounded-2xl flex items-center justify-center text-white shrink-0 shadow-sm"
              style={{
                backgroundColor: cartao.cor_hex || cartao.banco?.cor_hex || "#1F4E79",
              }}
            >
              <Receipt className="h-5 w-5" />
            </div>
            <div>
              <DialogTitle className="text-lg font-bold text-foreground">
                Pagar Fatura
              </DialogTitle>
              <DialogDescription className="text-xs text-muted-foreground">
                {cartao.nome} • Vencimento: {formatarData(fatura.data_vencimento_ciclo)}
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        {/* Card Destaque: Resumo da Fatura */}
        <div className="rounded-2xl border border-border/50 bg-accent/30 p-4 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs text-muted-foreground uppercase font-semibold tracking-wider">
              {valorJaPago > 0 ? "Saldo Devedor Pendente" : "Valor Total Pendente"}
            </span>
            <span className="text-[11px] font-medium text-muted-foreground">
              {fatura.itens_pendentes_count !== undefined
                ? `${fatura.itens_pendentes_count} lançamento(s) pendente(s)`
                : `${fatura.total_itens} lançamento(s)`}
            </span>
          </div>
          <div className="text-2xl font-black text-foreground tracking-tight">
            {formatarMoeda(valorAPagarTotal)}
          </div>
          {valorJaPago > 0 && (
            <div className="flex items-center justify-between text-[11px] text-muted-foreground pt-2 border-t border-border/40">
              <span>Total acumulado: <strong className="text-foreground font-semibold">{formatarMoeda(valorTotalFatura)}</strong></span>
              <span className="text-emerald-600 dark:text-emerald-400 font-medium">Já quitado: {formatarMoeda(valorJaPago)}</span>
            </div>
          )}
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 pt-1">
          {/* Opção de Valor: Total vs Personalizado */}
          <div className="space-y-2">
            <Label className="text-xs font-semibold">Quanto deseja pagar?</Label>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => {
                  setValue("tipo_pagamento", "total");
                  clearErrors("valor_personalizado");
                }}
                className={`flex flex-col items-start p-3 rounded-xl border text-left cursor-pointer transition-all ${
                  tipoPagamento === "total"
                    ? "border-primary bg-primary/10 text-primary shadow-xs"
                    : "border-border/60 hover:bg-accent/40 text-muted-foreground"
                }`}
              >
                <span className="text-xs font-bold text-foreground">Valor Total</span>
                <span className="text-xs font-semibold text-foreground/90 mt-0.5">
                  {formatarMoeda(valorAPagarTotal)}
                </span>
                <span className="text-[10px] text-muted-foreground mt-0.5">
                  Quita todos os lançamentos
                </span>
              </button>

              <button
                type="button"
                onClick={() => {
                  setValue("tipo_pagamento", "parcial");
                }}
                className={`flex flex-col items-start p-3 rounded-xl border text-left cursor-pointer transition-all ${
                  tipoPagamento === "parcial"
                    ? "border-primary bg-primary/10 text-primary shadow-xs"
                    : "border-border/60 hover:bg-accent/40 text-muted-foreground"
                }`}
              >
                <span className="text-xs font-bold text-foreground">Outro Valor</span>
                <span className="text-xs font-semibold text-foreground/90 mt-0.5">
                  {valorEfetivo > 0 && tipoPagamento === "parcial" ? formatarMoeda(valorEfetivo) : "Personalizado"}
                </span>
                <span className="text-[10px] text-muted-foreground mt-0.5">
                  Quita compras mais antigas
                </span>
              </button>
            </div>
          </div>

          {/* Campo de Valor Personalizado (quando ativo) */}
          {tipoPagamento === "parcial" && (
            <div className="space-y-2 p-3.5 rounded-xl border border-primary/20 bg-primary/5">
              <Label className="text-xs font-semibold flex items-center justify-between">
                <span>Valor a Liquidar Agora (R$)</span>
                <span className="text-[11px] font-normal text-muted-foreground">
                  Máximo: {formatarMoeda(valorAPagarTotal)}
                </span>
              </Label>
              <Input
                type="text"
                placeholder="0,00"
                {...register("valor_personalizado")}
                className="h-10 rounded-xl bg-background border-border/60 text-sm font-semibold"
              />
              {errors.valor_personalizado && (
                <p className="text-[11px] text-destructive font-medium">
                  {errors.valor_personalizado.message}
                </p>
              )}

              {/* Botões Rápidos de Porcentagem */}
              <div className="flex items-center gap-1.5 pt-1">
                <Button
                  type="button"
                  size="sm"
                  variant="outline"
                  onClick={() => aplicarPorcentagem(0.25)}
                  className="h-7 text-[11px] rounded-lg border-border/60 flex-1 px-2"
                >
                  25%
                </Button>
                <Button
                  type="button"
                  size="sm"
                  variant="outline"
                  onClick={() => aplicarPorcentagem(0.5)}
                  className="h-7 text-[11px] rounded-lg border-border/60 flex-1 px-2"
                >
                  50%
                </Button>
                <Button
                  type="button"
                  size="sm"
                  variant="outline"
                  onClick={() => aplicarPorcentagem(0.75)}
                  className="h-7 text-[11px] rounded-lg border-border/60 flex-1 px-2"
                >
                  75%
                </Button>
                <Button
                  type="button"
                  size="sm"
                  variant="outline"
                  onClick={() => aplicarPorcentagem(1)}
                  className="h-7 text-[11px] rounded-lg border-border/60 flex-1 px-2"
                >
                  100%
                </Button>
              </div>
            </div>
          )}

          {/* Seleção da Conta Bancária */}
          <div className="space-y-1.5">
            <Label className="text-xs font-semibold flex items-center gap-1.5">
              <Landmark className="h-3.5 w-3.5 text-muted-foreground" />
              <span>Conta Bancária para Débito</span>
            </Label>

            {isLoadingContas ? (
              <div className="h-10 rounded-xl bg-accent/40 animate-pulse" />
            ) : (
              <Select
                value={contaSelecionadaId || undefined}
                onValueChange={(val) => {
                  setValue("conta_bancaria_id", val ?? "", { shouldValidate: true });
                }}
              >
                <SelectTrigger className="h-10 data-[size=default]:h-10 rounded-xl bg-background/60 border-border/60 text-xs">
                  <SelectValue placeholder="Selecione a conta de origem">
                    {(value: unknown) =>
                      labelConta(value) ?? (
                        <span className="text-muted-foreground">
                          Selecione a conta de origem
                        </span>
                      )
                    }
                  </SelectValue>
                </SelectTrigger>
                <SelectContent className="rounded-xl">
                  {contas.map((c) => (
                    <SelectItem key={c.id} value={String(c.id)} label={c.nome}>
                      {renderContaOption(c)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}

            {errors.conta_bancaria_id && (
              <p className="text-[11px] text-destructive font-medium">
                {errors.conta_bancaria_id.message}
              </p>
            )}

            {/* Alerta de saldo insuficiente */}
            {saldoInsuficiente && contaSelecionada && (
              <div className="flex items-start gap-2 p-2.5 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-600 dark:text-amber-400 text-xs mt-2">
                <AlertTriangle className="h-4 w-4 shrink-0 mt-0.5" />
                <span>
                  O saldo atual da conta ({formatarMoeda(contaSelecionada.saldo_atual)}) é menor que o valor a liquidar ({formatarMoeda(valorEfetivo)}). A conta ficará com saldo negativo.
                </span>
              </div>
            )}
          </div>

          {/* Data do Pagamento */}
          <div className="space-y-1.5">
            <Label className="text-xs font-semibold flex items-center gap-1.5">
              <Calendar className="h-3.5 w-3.5 text-muted-foreground" />
              <span>Data do Pagamento</span>
            </Label>
            <Input
              type="date"
              {...register("data_pagamento")}
              className="h-10 rounded-xl bg-background/60 border-border/60 text-xs"
            />
            {errors.data_pagamento && (
              <p className="text-[11px] text-destructive font-medium">
                {errors.data_pagamento.message}
              </p>
            )}
          </div>

          {/* Observações */}
          <div className="space-y-1.5">
            <Label className="text-xs font-semibold flex items-center gap-1.5">
              <FileText className="h-3.5 w-3.5 text-muted-foreground" />
              <span>
                Observação <span className="font-normal text-muted-foreground">(Opcional)</span>
              </span>
            </Label>
            <Input
              placeholder="Ex: Pago via Débito Automático / PIX..."
              {...register("observacao")}
              className="h-10 rounded-xl bg-background/60 border-border/60 text-xs"
            />
          </div>

          {/* Botões de Ação */}
          <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-border/40">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              className="rounded-xl border-border/60 h-9 text-xs"
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              disabled={isPagandoFatura || valorEfetivo <= 0 || !contaSelecionadaId}
              className="bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl shadow-md h-9 text-xs font-semibold gap-1.5 cursor-pointer"
            >
              {isPagandoFatura ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  <span>Liquidando fatura...</span>
                </>
              ) : (
                <>
                  <CheckCircle2 className="h-4 w-4" />
                  <span>Pagar {valorEfetivo > 0 ? formatarMoeda(valorEfetivo) : "Fatura"}</span>
                </>
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
