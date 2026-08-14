"use client";

import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Meta, TipoMovimentacaoInvestimento } from "@/types/metas";
import { ContaBancaria } from "@/types/contas";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
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
import { ArrowUpRight, ArrowDownLeft } from "lucide-react";
import { cn } from "@/lib/utils";
import { formatarMoeda } from "@/utils/formatters";

const aporteResgateSchema = z.object({
  tipo: z.nativeEnum(TipoMovimentacaoInvestimento),
  conta_bancaria_id: z
    .string()
    .min(1, "Selecione uma conta bancária"),
  meta_id: z
    .string()
    .min(1, "Selecione a meta financeira vinculada"),
  valor: z
    .string()
    .min(1, "Informe o valor")
    .refine((val) => !isNaN(Number(val)) && Number(val) > 0, "O valor deve ser maior que zero"),
  data_movimentacao: z.string().min(1, "Informe a data"),
  motivo: z.string().min(3, "O motivo deve ter pelo menos 3 caracteres"),
  observacao: z.string().optional(),
});

type AporteResgateFormData = z.infer<typeof aporteResgateSchema>;

interface AporteResgateModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  metaPreSelecionada?: Meta | null;
  metas: Meta[];
  contas: ContaBancaria[];
  onSubmit: (data: AporteResgateFormData) => Promise<void>;
  isSubmitting?: boolean;
}

export function AporteResgateModal({
  open,
  onOpenChange,
  metaPreSelecionada,
  metas,
  contas,
  onSubmit,
  isSubmitting = false,
}: AporteResgateModalProps) {
  const {
    register,
    handleSubmit,
    setValue,
    watch,
    reset,
    setError,
    formState: { errors },
  } = useForm<AporteResgateFormData>({
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    resolver: zodResolver(aporteResgateSchema) as any,
    defaultValues: {
      tipo: TipoMovimentacaoInvestimento.APORTE,
      conta_bancaria_id: "",
      meta_id: "",
      valor: "",
      data_movimentacao: "",
      motivo: "",
      observacao: "",
    },
  });

  const tipoAtual = watch("tipo");
  const contaIdAtual = watch("conta_bancaria_id");
  const contaSelecionada = contas.find((c) => c.id.toString() === contaIdAtual);

  useEffect(() => {
    if (open) {
      const dataHoje = new Date().toISOString().split("T")[0];
      const defaultAccount = contas.find((c) => c.incluir_nas_reservas) || contas[0];
      const defaultMeta = metaPreSelecionada || metas[0];
      reset({
        tipo: TipoMovimentacaoInvestimento.APORTE,
        conta_bancaria_id: defaultAccount ? defaultAccount.id.toString() : "",
        meta_id: defaultMeta ? defaultMeta.id.toString() : "",
        valor: "",
        data_movimentacao: dataHoje,
        motivo: defaultMeta ? `Aporte para ${defaultMeta.nome}` : "",
        observacao: "",
      });
    }
  }, [open, metaPreSelecionada, metas, contas, reset]);

  const handleFormSubmit = async (data: AporteResgateFormData) => {
    try {
      await onSubmit(data);
      onOpenChange(false);
    } catch (err: unknown) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const errorData = (err as any)?.response?.data;
      if (errorData?.errors) {
        Object.entries(errorData.errors).forEach(([field, messages]) => {
          if (Array.isArray(messages) && messages.length > 0) {
            setError(field as keyof AporteResgateFormData, {
              type: "manual",
              message: messages[0],
            });
          }
        });
      }
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px] rounded-[20px] p-6">
        <DialogHeader className="space-y-1">
          <DialogTitle className="text-xl font-bold text-foreground">
            Registrar Movimentação de Reserva
          </DialogTitle>
          <DialogDescription className="text-xs text-muted-foreground">
            Realize aportes ou resgates vinculados às suas metas e contas bancárias
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-5 mt-3">
          {/* Seletor de Tipo: APORTE vs RESGATE */}
          <div className="space-y-2">
            <div className="grid grid-cols-2 gap-2 p-1 rounded-2xl bg-accent/40 border border-border/50">
              <button
                type="button"
                onClick={() => {
                  setValue("tipo", TipoMovimentacaoInvestimento.APORTE);
                  if (metaPreSelecionada) {
                    setValue("motivo", `Aporte para ${metaPreSelecionada.nome}`);
                  }
                }}
                className={cn(
                  "flex flex-col items-center justify-center p-2.5 rounded-xl transition-all cursor-pointer",
                  tipoAtual === TipoMovimentacaoInvestimento.APORTE
                    ? "bg-[#22C55E] text-white shadow-sm font-bold"
                    : "text-muted-foreground hover:text-foreground hover:bg-accent/60"
                )}
              >
                <div className="flex items-center gap-1.5 text-xs font-bold">
                  <ArrowUpRight className="h-4 w-4" />
                  <span>Aporte (Guardar)</span>
                </div>
                <span
                  className={cn(
                    "text-[10px] mt-0.5 font-medium",
                    tipoAtual === TipoMovimentacaoInvestimento.APORTE
                      ? "text-white/90"
                      : "text-muted-foreground"
                  )}
                >
                  Sai da Conta ➔ Entra na Meta
                </span>
              </button>

              <button
                type="button"
                onClick={() => {
                  setValue("tipo", TipoMovimentacaoInvestimento.RESGATE);
                  if (metaPreSelecionada) {
                    setValue("motivo", `Resgate de ${metaPreSelecionada.nome}`);
                  }
                }}
                className={cn(
                  "flex flex-col items-center justify-center p-2.5 rounded-xl transition-all cursor-pointer",
                  tipoAtual === TipoMovimentacaoInvestimento.RESGATE
                    ? "bg-amber-600 text-white shadow-sm font-bold"
                    : "text-muted-foreground hover:text-foreground hover:bg-accent/60"
                )}
              >
                <div className="flex items-center gap-1.5 text-xs font-bold">
                  <ArrowDownLeft className="h-4 w-4" />
                  <span>Resgate (Retirar)</span>
                </div>
                <span
                  className={cn(
                    "text-[10px] mt-0.5 font-medium",
                    tipoAtual === TipoMovimentacaoInvestimento.RESGATE
                      ? "text-white/90"
                      : "text-muted-foreground"
                  )}
                >
                  Sai da Meta ➔ Volta para a Conta
                </span>
              </button>
            </div>

            {/* Box Informativo de Fluxo Financeiro */}
            <div
              className={cn(
                "p-3 rounded-xl border text-xs leading-relaxed space-y-1 transition-colors",
                tipoAtual === TipoMovimentacaoInvestimento.APORTE
                  ? "bg-[#22C55E]/10 border-[#22C55E]/30 text-emerald-800 dark:text-emerald-300"
                  : "bg-amber-500/10 border-amber-500/30 text-amber-900 dark:text-amber-300"
              )}
            >
              <div className="flex items-center gap-1.5 font-bold">
                {tipoAtual === TipoMovimentacaoInvestimento.APORTE ? (
                  <>
                    <ArrowUpRight className="h-4 w-4 shrink-0 text-[#22C55E]" />
                    <span>Aporte de Dinheiro</span>
                  </>
                ) : (
                  <>
                    <ArrowDownLeft className="h-4 w-4 shrink-0 text-amber-600" />
                    <span>Resgate de Dinheiro</span>
                  </>
                )}
              </div>
              <p className="text-[11px] opacity-90">
                {tipoAtual === TipoMovimentacaoInvestimento.APORTE
                  ? "O dinheiro será retirado da Conta Bancária selecionada e guardado na Meta/Reserva."
                  : "O dinheiro será retirado da Meta/Reserva e creditado de volta na Conta Bancária selecionada."}
              </p>
            </div>
          </div>

          {/* Conta Bancária */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <Label htmlFor="conta_bancaria_id" className="text-xs font-semibold text-foreground">
                Conta Bancária *
              </Label>
              {contaSelecionada && (
                <span className="text-[11px] text-muted-foreground">
                  Saldo: <strong className="text-foreground">{formatarMoeda(contaSelecionada.saldo_atual)}</strong>
                </span>
              )}
            </div>
            <Select
              value={watch("conta_bancaria_id")}
              onValueChange={(val) => setValue("conta_bancaria_id", val ?? "")}
            >
              <SelectTrigger className="rounded-[10px] text-sm">
                <SelectValue placeholder="Selecione a conta bancária" />
              </SelectTrigger>
              <SelectContent>
                {contas.map((conta) => (
                  <SelectItem
                    key={conta.id}
                    value={conta.id.toString()}
                    label={`${conta.nome} (${formatarMoeda(conta.saldo_atual)})`}
                  >
                    {conta.nome} ({formatarMoeda(conta.saldo_atual)})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {errors.conta_bancaria_id && (
              <p className="text-xs text-red-500 font-medium">{errors.conta_bancaria_id.message}</p>
            )}
          </div>

          {/* Meta Vinculada */}
          <div className="space-y-1.5">
            <Label htmlFor="meta_id" className="text-xs font-semibold text-foreground">
              Meta Vinculada *
            </Label>
            <Select
              value={watch("meta_id")}
              onValueChange={(val) => {
                setValue("meta_id", val ?? "");
                const metaSel = metas.find((m) => m.id.toString() === val);
                if (metaSel) {
                  setValue(
                    "motivo",
                    tipoAtual === TipoMovimentacaoInvestimento.RESGATE
                      ? `Resgate de ${metaSel.nome}`
                      : `Aporte para ${metaSel.nome}`
                  );
                }
              }}
            >
              <SelectTrigger className="rounded-[10px] text-sm">
                <SelectValue placeholder="Selecione a meta financeira" />
              </SelectTrigger>
              <SelectContent>
                {metas.map((meta) => (
                  <SelectItem
                    key={meta.id}
                    value={meta.id.toString()}
                    label={`${meta.nome} (${formatarMoeda(meta.valor_atual)} / ${formatarMoeda(meta.valor_alvo)})`}
                  >
                    {meta.nome} ({formatarMoeda(meta.valor_atual)} / {formatarMoeda(meta.valor_alvo)})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {errors.meta_id && (
              <p className="text-xs text-red-500 font-medium">{errors.meta_id.message}</p>
            )}
            {metas.length === 0 && (
              <p className="text-xs text-amber-600 font-medium">
                Você precisa cadastrar pelo menos uma meta para realizar aportes ou resgates.
              </p>
            )}
          </div>

          {/* Valor (R$) e Data */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label htmlFor="valor" className="text-xs font-semibold text-foreground">
                Valor (R$) *
              </Label>
              <Input
                id="valor"
                type="number"
                step="0.01"
                placeholder="500.00"
                {...register("valor")}
                className="rounded-[10px] text-sm font-bold text-foreground"
              />
              {errors.valor && (
                <p className="text-xs text-red-500 font-medium">{errors.valor.message}</p>
              )}
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="data_movimentacao" className="text-xs font-semibold text-foreground">
                Data *
              </Label>
              <Input
                id="data_movimentacao"
                type="date"
                {...register("data_movimentacao")}
                className="rounded-[10px] text-sm"
              />
              {errors.data_movimentacao && (
                <p className="text-xs text-red-500 font-medium">{errors.data_movimentacao.message}</p>
              )}
            </div>
          </div>

          {/* Motivo / Descrição */}
          <div className="space-y-1.5">
            <Label htmlFor="motivo" className="text-xs font-semibold text-foreground">
              Motivo / Descrição *
            </Label>
            <Input
              id="motivo"
              placeholder="Ex: Aporte mensal da sobra de salário"
              {...register("motivo")}
              className="rounded-[10px] text-sm"
            />
            {errors.motivo && (
              <p className="text-xs text-red-500 font-medium">{errors.motivo.message}</p>
            )}
          </div>

          {/* Observação */}
          <div className="space-y-1.5">
            <Label htmlFor="observacao" className="text-xs font-semibold text-foreground">
              Observação (Opcional)
            </Label>
            <Input
              id="observacao"
              placeholder="Notas adicionais sobre a transação"
              {...register("observacao")}
              className="rounded-[10px] text-sm"
            />
          </div>

          {/* Botões de Ação */}
          <div className="flex items-center justify-end gap-3 pt-3 border-t border-border/40">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              className="rounded-[10px] text-xs"
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              disabled={isSubmitting || metas.length === 0}
              className={cn(
                "rounded-[10px] font-medium text-xs px-5 shadow-sm text-white",
                tipoAtual === TipoMovimentacaoInvestimento.APORTE
                  ? "bg-[#22C55E] hover:bg-[#22C55E]/90"
                  : "bg-amber-600 hover:bg-amber-600/90"
              )}
            >
              {isSubmitting
                ? "Registrando..."
                : tipoAtual === TipoMovimentacaoInvestimento.APORTE
                ? "Confirmar Aporte"
                : "Confirmar Resgate"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
