"use client";

import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
  CheckCircle2,
  Loader2,
  Calendar,
  FileText,
  Landmark,
  Tag,
  CreditCard as CreditCardIcon,
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
import { Movimentacao } from "@/types/movimentacoes";
import { formatarMoeda } from "@/utils/formatters";
import { cn } from "@/lib/utils";

// ─── Helpers de formatação de moeda ───────────────────────────────────────────

function parseMoeda(valorFormatado: string): number {
  const apenasDigitos = valorFormatado.replace(/\D/g, "");
  return parseFloat((parseInt(apenasDigitos, 10) / 100).toFixed(2)) || 0;
}

function formatarMoedaMascara(valor: number): string {
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
    minimumFractionDigits: 2,
  }).format(valor);
}

function aplicarMascaraMoeda(inputValue: string): string {
  const apenasDigitos = inputValue.replace(/\D/g, "");
  if (!apenasDigitos || apenasDigitos === "0") return "";
  const numero = parseInt(apenasDigitos, 10) / 100;
  return formatarMoedaMascara(numero);
}

// ─── Schema Zod ───────────────────────────────────────────────────────────────

const pagarMovimentacaoSchema = z.object({
  data_pagamento: z.string().min(1, "Informe a data do pagamento"),
  valor: z
    .number({ invalid_type_error: "Informe um valor válido" })
    .positive("O valor deve ser maior que zero"),
  observacao: z.string().nullable().optional(),
});

export type PagarMovimentacaoFormData = z.infer<typeof pagarMovimentacaoSchema>;

// ─── Props ─────────────────────────────────────────────────────────────────────

interface PagarMovimentacaoModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  movimentacao?: Movimentacao | null;
  onConfirmar: (payload: {
    id: number;
    data_pagamento: string;
    valor: number;
    observacao?: string | null;
  }) => Promise<void>;
}

// ─── Componente ────────────────────────────────────────────────────────────────

export function PagarMovimentacaoModal({
  open,
  onOpenChange,
  movimentacao,
  onConfirmar,
}: PagarMovimentacaoModalProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [valorDisplay, setValorDisplay] = useState("");

  const {
    register,
    handleSubmit,
    setValue,
    reset,
    formState: { errors },
  } = useForm<PagarMovimentacaoFormData>({
    resolver: zodResolver(pagarMovimentacaoSchema),
    defaultValues: {
      data_pagamento: "",
      valor: 0,
      observacao: "",
    },
  });

  const [prevMovId, setPrevMovId] = useState<number | null>(null);

  if (open && movimentacao && movimentacao.id !== prevMovId) {
    setPrevMovId(movimentacao.id);
    const valorNum = Number(movimentacao.valor) || 0;
    setValorDisplay(valorNum > 0 ? formatarMoedaMascara(valorNum) : "");
  }

  useEffect(() => {
    if (open && movimentacao) {
      const hoje = new Date().toISOString().split("T")[0];
      const valorNum = Number(movimentacao.valor) || 0;
      const dataInicial = movimentacao.data_pagamento || hoje;
      const obsInicial = movimentacao.observacao || "";

      reset({
        data_pagamento: dataInicial,
        valor: valorNum,
        observacao: obsInicial,
      });
    }
  }, [open, movimentacao, reset]);

  if (!movimentacao) return null;

  const onSubmit = async (data: PagarMovimentacaoFormData) => {
    try {
      setIsSubmitting(true);
      await onConfirmar({
        id: movimentacao.id,
        data_pagamento: data.data_pagamento,
        valor: data.valor,
        observacao: data.observacao || null,
      });
      onOpenChange(false);
    } catch {
      // Erros de submissão são tratados via toast pelo componente pai
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[480px] rounded-3xl p-6 border-border/60 bg-card">
        <DialogHeader className="space-y-2">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-2xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0">
              <CheckCircle2 className="h-5 w-5 stroke-[2.25]" />
            </div>
            <div>
              <DialogTitle className="text-lg font-bold">
                Confirmar Pagamento
              </DialogTitle>
              <DialogDescription className="text-xs text-muted-foreground">
                Confira os dados do pagamento antes de marcar como pago.
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        {/* Card Resumo do Lançamento */}
        <div className="rounded-2xl border border-border/40 bg-muted/30 p-3.5 space-y-2">
          <div className="flex items-center justify-between gap-2">
            <h4 className="font-semibold text-sm text-foreground truncate">
              {movimentacao.descricao}
            </h4>
            <span className="text-xs font-bold text-muted-foreground shrink-0">
              Original: {formatarMoeda(movimentacao.valor)}
            </span>
          </div>

          <div className="flex items-center gap-3 text-xs text-muted-foreground flex-wrap">
            {/* Categoria */}
            {movimentacao.categoria && (
              <div className="flex items-center gap-1">
                <Tag className="h-3 w-3" />
                <span>{movimentacao.categoria.nome}</span>
              </div>
            )}

            {/* Conta Bancária / Cartão */}
            <div className="flex items-center gap-1">
              {movimentacao.cartao_credito ? (
                <>
                  <CreditCardIcon className="h-3 w-3 text-amber-500" />
                  <span>{movimentacao.cartao_credito.nome}</span>
                </>
              ) : movimentacao.conta_bancaria ? (
                <>
                  <Landmark className="h-3 w-3" />
                  <span>{movimentacao.conta_bancaria.nome}</span>
                </>
              ) : null}
            </div>
          </div>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 pt-2">
          {/* Data do Pagamento e Valor */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {/* Data do Pagamento */}
            <div className="space-y-1.5">
              <Label className="text-xs font-semibold">Data do Pagamento</Label>
              <div className="relative">
                <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
                <Input
                  type="date"
                  {...register("data_pagamento")}
                  className="pl-9 h-10 rounded-xl bg-background/60 border-border/60 text-xs"
                />
              </div>
              {errors.data_pagamento && (
                <p className="text-[11px] text-destructive font-medium">
                  {errors.data_pagamento.message}
                </p>
              )}
            </div>

            {/* Valor Pago com Máscara BRL */}
            <div className="space-y-1.5">
              <Label className="text-xs font-semibold">Valor Pago</Label>
              <Input
                type="text"
                inputMode="numeric"
                placeholder="R$ 0,00"
                value={valorDisplay}
                onChange={(e) => {
                  const mascarado = aplicarMascaraMoeda(e.target.value);
                  setValorDisplay(mascarado);
                  setValue("valor", mascarado ? parseMoeda(mascarado) : 0, {
                    shouldValidate: true,
                  });
                }}
                className={cn(
                  "h-10 rounded-xl bg-background/60 border-border/60 font-semibold text-emerald-600 dark:text-emerald-400"
                )}
              />
              {errors.valor && (
                <p className="text-[11px] text-destructive font-medium">
                  {errors.valor.message}
                </p>
              )}
            </div>
          </div>

          {/* Observações */}
          <div className="space-y-1.5">
            <Label className="text-xs font-semibold">
              Observações{" "}
              <span className="font-normal text-muted-foreground">(Opcional)</span>
            </Label>
            <div className="relative">
              <FileText className="absolute left-3 top-3 h-4 w-4 text-muted-foreground pointer-events-none" />
              <Input
                placeholder="Adicione observações ou recibo do pagamento..."
                {...register("observacao")}
                className="pl-9 h-10 rounded-xl bg-background/60 border-border/60 text-xs"
              />
            </div>
          </div>

          {/* Ações */}
          <div className="flex items-center justify-end gap-3 pt-3 border-t border-border/40">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              className="rounded-xl border-border/60"
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              disabled={isSubmitting}
              className="bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl shadow-md min-w-[150px] font-semibold gap-2"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  <span>Confirmando...</span>
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
