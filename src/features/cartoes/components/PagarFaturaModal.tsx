"use client";

import { useEffect, useMemo } from "react";
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
import { useContasBancarias } from "@/features/contas_bancarias/hooks/useContasBancarias";
import { useFaturaCartao } from "../hooks/useFaturaCartao";
import { formatarMoeda, formatarData } from "@/utils/formatters";
import { toast } from "@/components/ui/toast";
import { extrairMensagemErro } from "@/hooks/useAuth";

// ─── Schema Zod ───────────────────────────────────────────────────────────────

const pagarFaturaSchema = z.object({
  conta_bancaria_id: z.string().min(1, "Selecione a conta bancária para débito"),
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
    formState: { errors },
  } = useForm<PagarFaturaFormData>({
    resolver: zodResolver(pagarFaturaSchema),
    defaultValues: {
      conta_bancaria_id: "",
      data_pagamento: "",
      observacao: "",
    },
  });

  const contaSelecionadaId = watch("conta_bancaria_id");

  useEffect(() => {
    if (open) {
      const hoje = new Date().toISOString().split("T")[0];
      const primeiraConta = contas.length > 0 ? String(contas[0].id) : "";

      reset({
        conta_bancaria_id: primeiraConta,
        data_pagamento: hoje,
        observacao: "",
      });
    }
  }, [open, contas, reset]);

  const contaSelecionada = useMemo(() => {
    return contas.find((c) => String(c.id) === contaSelecionadaId);
  }, [contas, contaSelecionadaId]);

  const valorTotal = Number(fatura?.valor_total) || 0;
  const saldoInsuficiente = contaSelecionada
    ? Number(contaSelecionada.saldo_atual) < valorTotal
    : false;

  if (!cartao || !fatura) return null;

  const onSubmit = async (data: PagarFaturaFormData) => {
    try {
      await pagarFatura({
        id: cartao.id,
        payload: {
          conta_bancaria_id: Number(data.conta_bancaria_id),
          mes_ano: fatura.mes_ano_referencia,
          data_pagamento: data.data_pagamento,
          observacao: data.observacao?.trim() || undefined,
        },
      });

      toast.add({
        title: "Fatura paga com sucesso!",
        description: `O valor de ${formatarMoeda(valorTotal)} foi liquidado da conta ${contaSelecionada?.nome ?? ""} e o limite do cartão foi liberado.`,
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
      <DialogContent className="sm:max-w-[500px] rounded-[20px] p-6 border-border/60 bg-card">
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
                Pagar Fatura Integral
              </DialogTitle>
              <DialogDescription className="text-xs text-muted-foreground">
                {cartao.nome} • Vencimento: {formatarData(fatura.data_vencimento_ciclo)}
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        {/* Card Destaque: Valor Total a Pagar */}
        <div className="rounded-2xl border border-border/50 bg-accent/30 p-4 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs text-muted-foreground uppercase font-semibold tracking-wider">
              Valor Total a Liquidar
            </span>
            <span className="text-[11px] font-medium text-muted-foreground">
              {fatura.total_itens} lançamento(s)
            </span>
          </div>
          <div className="text-2xl font-black text-foreground tracking-tight">
            {formatarMoeda(valorTotal)}
          </div>
          <p className="text-[11px] text-muted-foreground pt-1 border-t border-border/40">
            Ao confirmar, todos os lançamentos desta fatura serão marcados como pagos e o limite do cartão será restabelecido.
          </p>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 pt-1">
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
                value={contaSelecionadaId}
                onValueChange={(val) => {
                  setValue("conta_bancaria_id", val ?? "", { shouldValidate: true });
                }}
              >
                <SelectTrigger className="h-10 rounded-xl bg-background/60 border-border/60 text-xs">
                  <SelectValue placeholder="Selecione a conta de origem" />
                </SelectTrigger>
                <SelectContent className="rounded-xl">
                  {contas.map((c) => (
                    <SelectItem key={c.id} value={String(c.id)} className="text-xs py-2">
                      <div className="flex items-center justify-between w-full gap-4">
                        <span className="font-medium text-foreground">{c.nome}</span>
                        <span className="text-muted-foreground text-[11px]">
                          Saldo: {formatarMoeda(c.saldo_atual)}
                        </span>
                      </div>
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
                  O saldo atual da conta ({formatarMoeda(contaSelecionada.saldo_atual)}) é menor que o valor da fatura. A conta ficará com saldo negativo.
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
              disabled={isPagandoFatura || valorTotal <= 0 || !contaSelecionadaId}
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
                  <span>Confirmar Pagamento</span>
                </>
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
