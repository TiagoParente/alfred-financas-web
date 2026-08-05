"use client";

import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import {
  ContaBancaria,
  TipoContaBancaria,
  TipoContaBancariaDescricao,
} from "@/types/contas";
import { useBancos } from "@/features/bancos/hooks/useBancos";
import { extrairMensagemErro } from "@/hooks/useAuth";
import axios from "axios";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
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
import { cn } from "@/lib/utils";

const contaBancariaSchema = z.object({
  nome: z.string().min(2, "O nome deve ter pelo menos 2 caracteres"),
  banco_id: z.string().optional(),
  instituicao_financeira: z.string().optional(),
  tipo_conta: z.nativeEnum(TipoContaBancaria),
  saldo_inicial: z.coerce.number(),
  incluir_no_saldo_geral: z.boolean(),
  incluir_nas_reservas: z.boolean(),
  cor_hex: z.string().optional(),
});

type ContaBancariaFormData = z.infer<typeof contaBancariaSchema>;

interface ContaBancariaModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  contaEmEdicao?: ContaBancaria | null;
  onSubmit: (data: ContaBancariaFormData) => Promise<void>;
  isSubmitting: boolean;
}

const coresPredefinidas = [
  "#1F4E79", // Azul Petróleo (Default)
  "#22C55E", // Verde
  "#EAB308", // Amarelo/Dourado
  "#EF4444", // Vermelho
  "#8B5CF6", // Roxo
  "#EC4899", // Rosa
  "#06B6D4", // Ciano
  "#F97316", // Laranja
];

export function ContaBancariaModal({
  open,
  onOpenChange,
  contaEmEdicao,
  onSubmit,
  isSubmitting,
}: ContaBancariaModalProps) {
  const { data: bancos = [] } = useBancos();

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    reset,
    setError,
    formState: { errors },
  } = useForm<ContaBancariaFormData>({
    resolver: zodResolver(contaBancariaSchema),
    defaultValues: {
      nome: "",
      banco_id: "",
      instituicao_financeira: "",
      tipo_conta: TipoContaBancaria.CORRENTE,
      saldo_inicial: 0,
      incluir_no_saldo_geral: true,
      incluir_nas_reservas: true,
      cor_hex: "#1F4E79",
    },
  });

  const tipoContaAtual = watch("tipo_conta");
  const corHexAtual = watch("cor_hex");
  const bancoIdAtual = watch("banco_id");
  const incluirNoSaldoGeral = watch("incluir_no_saldo_geral");
  const incluirNasReservas = watch("incluir_nas_reservas");

  const destinoAtual: "disponivel" | "reserva" | "nenhum" = incluirNoSaldoGeral
    ? "disponivel"
    : incluirNasReservas
    ? "reserva"
    : "nenhum";

  const handleDestinoChange = (destino: "disponivel" | "reserva" | "nenhum") => {
    if (destino === "disponivel") {
      setValue("incluir_no_saldo_geral", true);
      setValue("incluir_nas_reservas", false);
    } else if (destino === "reserva") {
      setValue("incluir_no_saldo_geral", false);
      setValue("incluir_nas_reservas", true);
    } else {
      setValue("incluir_no_saldo_geral", false);
      setValue("incluir_nas_reservas", false);
    }
  };

  // Preenche dados ao editar
  useEffect(() => {
    if (contaEmEdicao) {
      reset({
        nome: contaEmEdicao.nome,
        banco_id: contaEmEdicao.banco_id ? String(contaEmEdicao.banco_id) : "",
        instituicao_financeira: contaEmEdicao.instituicao_financeira || "",
        tipo_conta: contaEmEdicao.tipo_conta,
        saldo_inicial: contaEmEdicao.saldo_inicial,
        incluir_no_saldo_geral: contaEmEdicao.incluir_no_saldo_geral,
        incluir_nas_reservas: contaEmEdicao.incluir_nas_reservas ?? true,
        cor_hex: contaEmEdicao.cor_hex || "#1F4E79",
      });
    } else {
      reset({
        nome: "",
        banco_id: "",
        instituicao_financeira: "",
        tipo_conta: TipoContaBancaria.CORRENTE,
        saldo_inicial: 0,
        incluir_no_saldo_geral: true,
        incluir_nas_reservas: true,
        cor_hex: "#1F4E79",
      });
    }
  }, [contaEmEdicao, open, reset]);

  // Se o tipo for alterado para Investimento, direciona para Reserva por padrão
  const handleTipoContaChange = (val: TipoContaBancaria) => {
    setValue("tipo_conta", val);
    if (val === TipoContaBancaria.INVESTIMENTO) {
      setValue("incluir_no_saldo_geral", false);
      setValue("incluir_nas_reservas", true);
    } else if (!contaEmEdicao) {
      setValue("incluir_no_saldo_geral", true);
      setValue("incluir_nas_reservas", false);
    }
  };

  const handleFormSubmit = async (data: ContaBancariaFormData) => {
    try {
      await onSubmit(data);
      onOpenChange(false);
    } catch (err: unknown) {
      if (axios.isAxiosError(err) && err.response?.status === 422) {
        const apiErrors = err.response.data?.errors;
        if (apiErrors) {
          Object.keys(apiErrors).forEach((key) => {
            setError(key as keyof ContaBancariaFormData, {
              type: "manual",
              message: apiErrors[key][0],
            });
          });
          return;
        }
      }
      setError("root", { message: extrairMensagemErro(err) });
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px] rounded-[20px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {contaEmEdicao ? "Editar Conta Bancária" : "Nova Conta Bancária"}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-4 py-2">
          {errors.root && (
            <div className="p-3 text-xs font-medium text-red-500 bg-red-50 dark:bg-red-950/30 rounded-lg">
              {errors.root.message}
            </div>
          )}

          {/* Nome da Conta */}
          <div className="space-y-1.5">
            <Label htmlFor="nome">Nome da Conta *</Label>
            <Input
              id="nome"
              placeholder="Ex: Conta Principal Nubank, Reserva de Emergência"
              {...register("nome")}
              className="rounded-[10px]"
            />
            {errors.nome && (
              <p className="text-xs text-red-500">{errors.nome.message}</p>
            )}
          </div>

          {/* Tipo de Conta */}
          <div className="space-y-1.5">
            <Label>Tipo de Conta *</Label>
            <Select
              value={tipoContaAtual}
              onValueChange={(val) => handleTipoContaChange(val as TipoContaBancaria)}
            >
              <SelectTrigger className="rounded-[10px]">
                <SelectValue placeholder="Selecione o tipo">
                  {TipoContaBancariaDescricao[tipoContaAtual] ?? "Selecione o tipo"}
                </SelectValue>
              </SelectTrigger>
              <SelectContent className="rounded-xl">
                {Object.entries(TipoContaBancariaDescricao).map(([tipo, desc]) => (
                  <SelectItem key={tipo} value={tipo}>
                    {desc}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Instituição Financeira / Banco Cadastrado */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label>Banco do Sistema</Label>
              <Select
                value={bancoIdAtual || "custom"}
                onValueChange={(val) => {
                  if (!val || val === "custom") {
                    setValue("banco_id", "");
                  } else {
                    setValue("banco_id", val);
                    const b = bancos.find((item) => String(item.id) === val);
                    if (b) {
                      if (b.cor_hex) setValue("cor_hex", b.cor_hex);
                      setValue("instituicao_financeira", (b.nome_curto || b.nome) ?? "");
                    }
                  }
                }}
              >
                <SelectTrigger className="rounded-[10px]">
                  <SelectValue placeholder="Selecione (opcional)">
                    {bancoIdAtual && bancoIdAtual !== "custom"
                      ? (bancos.find((b) => String(b.id) === bancoIdAtual)?.nome_curto ||
                         bancos.find((b) => String(b.id) === bancoIdAtual)?.nome ||
                         "Banco selecionado")
                      : bancoIdAtual === "custom" || !bancoIdAtual
                      ? "Outro / Manual"
                      : "Selecione (opcional)"}
                  </SelectValue>
                </SelectTrigger>
                <SelectContent className="rounded-xl max-h-48">
                  <SelectItem value="custom">Outro / Manual</SelectItem>
                  {bancos.map((b) => (
                    <SelectItem key={b.id} value={String(b.id)}>
                      {b.nome_curto || b.nome}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="instituicao_financeira">Nome da Instituição</Label>
              <Input
                id="instituicao_financeira"
                placeholder="Ex: Itaú, Bradesco, Inter"
                disabled={Boolean(bancoIdAtual && bancoIdAtual !== "custom")}
                {...register("instituicao_financeira")}
                className="rounded-[10px]"
              />
            </div>
          </div>

          {/* Saldo Inicial (Apenas na criação) */}
          {!contaEmEdicao && (
            <div className="space-y-1.5">
              <Label htmlFor="saldo_inicial">Saldo Inicial (R$)</Label>
              <Input
                id="saldo_inicial"
                type="number"
                step="0.01"
                placeholder="0,00"
                {...register("saldo_inicial")}
                className="rounded-[10px]"
              />
              {errors.saldo_inicial && (
                <p className="text-xs text-red-500">{errors.saldo_inicial.message}</p>
              )}
            </div>
          )}

          {/* Seletor de Cor */}
          <div className="space-y-1.5">
            <Label>Cor de Identificação</Label>
            <div className="flex items-center gap-2 pt-1">
              {coresPredefinidas.map((cor) => (
                <button
                  key={cor}
                  type="button"
                  onClick={() => setValue("cor_hex", cor)}
                  className={`h-7 w-7 rounded-full transition-all ${
                    corHexAtual === cor
                      ? "ring-2 ring-offset-2 ring-foreground scale-110"
                      : "hover:scale-105"
                  }`}
                  style={{ backgroundColor: cor }}
                />
              ))}
            </div>
          </div>

          {/* Seletor de Participação no Saldo */}
          <div className="space-y-2 pt-1">
            <Label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Participação no Saldo da Família *
            </Label>

            <div className="grid grid-cols-1 gap-2">
              {/* Opção 1: Saldo Disponível */}
              <div
                onClick={() => handleDestinoChange("disponivel")}
                className={cn(
                  "cursor-pointer rounded-xl border p-3 transition-all flex items-start gap-3",
                  destinoAtual === "disponivel"
                    ? "border-[#1F4E79] bg-[#1F4E79]/10 dark:bg-[#1F4E79]/20 shadow-2xs"
                    : "border-border/60 hover:bg-accent/40"
                )}
              >
                <div
                  className={cn(
                    "mt-0.5 flex h-4 w-4 shrink-0 items-center justify-center rounded-full border transition-all",
                    destinoAtual === "disponivel"
                      ? "border-[#1F4E79] bg-[#1F4E79] text-white"
                      : "border-muted-foreground/40"
                  )}
                >
                  {destinoAtual === "disponivel" && (
                    <div className="h-1.5 w-1.5 rounded-full bg-white" />
                  )}
                </div>
                <div>
                  <p className="text-xs font-bold text-foreground">
                    Saldo Disponível (Geral)
                  </p>
                  <p className="text-[11px] text-muted-foreground leading-tight mt-0.5">
                    Soma ao saldo disponível para despesas do dia a dia e no patrimônio total.
                  </p>
                </div>
              </div>

              {/* Opção 2: Reserva / Investimento */}
              <div
                onClick={() => handleDestinoChange("reserva")}
                className={cn(
                  "cursor-pointer rounded-xl border p-3 transition-all flex items-start gap-3",
                  destinoAtual === "reserva"
                    ? "border-amber-500 bg-amber-500/10 dark:bg-amber-500/20 shadow-2xs"
                    : "border-border/60 hover:bg-accent/40"
                )}
              >
                <div
                  className={cn(
                    "mt-0.5 flex h-4 w-4 shrink-0 items-center justify-center rounded-full border transition-all",
                    destinoAtual === "reserva"
                      ? "border-amber-500 bg-amber-500 text-white"
                      : "border-muted-foreground/40"
                  )}
                >
                  {destinoAtual === "reserva" && (
                    <div className="h-1.5 w-1.5 rounded-full bg-white" />
                  )}
                </div>
                <div>
                  <p className="text-xs font-bold text-foreground">
                    Reserva / Investimento
                  </p>
                  <p className="text-[11px] text-muted-foreground leading-tight mt-0.5">
                    Isolada do saldo disponível, mas soma no total de reservas e patrimônio.
                  </p>
                </div>
              </div>

              {/* Opção 3: Apenas Visualização */}
              <div
                onClick={() => handleDestinoChange("nenhum")}
                className={cn(
                  "cursor-pointer rounded-xl border p-3 transition-all flex items-start gap-3",
                  destinoAtual === "nenhum"
                    ? "border-slate-500 bg-slate-500/10 dark:bg-slate-500/20 shadow-2xs"
                    : "border-border/60 hover:bg-accent/40"
                )}
              >
                <div
                  className={cn(
                    "mt-0.5 flex h-4 w-4 shrink-0 items-center justify-center rounded-full border transition-all",
                    destinoAtual === "nenhum"
                      ? "border-slate-500 bg-slate-500 text-white"
                      : "border-muted-foreground/40"
                  )}
                >
                  {destinoAtual === "nenhum" && (
                    <div className="h-1.5 w-1.5 rounded-full bg-white" />
                  )}
                </div>
                <div>
                  <p className="text-xs font-bold text-foreground">
                    Apenas Visualização (Sem impacto nos saldos)
                  </p>
                  <p className="text-[11px] text-muted-foreground leading-tight mt-0.5">
                    Conta para acompanhamento. Não soma no saldo disponível, nem nas reservas, nem no patrimônio.
                  </p>
                </div>
              </div>
            </div>
          </div>

          <DialogFooter className="pt-3">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              className="rounded-[10px]"
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              disabled={isSubmitting}
              className="rounded-[10px] bg-[#1F4E79] hover:bg-[#1F4E79]/90 text-white"
            >
              {isSubmitting ? "Salvando..." : contaEmEdicao ? "Atualizar Conta" : "Criar Conta"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
