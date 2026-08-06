"use client";

import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import {
  CartaoCredito,
  BandeiraCartao,
  BandeiraCartaoDescricao,
  CriarCartaoCreditoPayload,
  AtualizarCartaoCreditoPayload,
} from "@/types/cartoes";
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

const cartaoCreditoSchema = z.object({
  nome: z.string().min(2, "O nome deve ter pelo menos 2 caracteres"),
  banco_id: z.string().optional(),
  bandeira: z.nativeEnum(BandeiraCartao).optional(),
  limite: z.coerce.number().min(0, "O limite deve ser maior ou igual a zero"),
  dia_fechamento: z.coerce
    .number()
    .min(1, "Dia inválido")
    .max(31, "Dia inválido"),
  dia_vencimento: z.coerce
    .number()
    .min(1, "Dia inválido")
    .max(31, "Dia inválido"),
  cor_hex: z.string().optional(),
});

export type CartaoCreditoFormData = z.infer<typeof cartaoCreditoSchema>;

interface CartaoCreditoModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  cartaoEmEdicao?: CartaoCredito | null;
  onSubmit: (
    payload: CriarCartaoCreditoPayload | AtualizarCartaoCreditoPayload
  ) => Promise<void>;
  isSubmitting: boolean;
}

const coresPredefinidas = [
  "#1F4E79", // Azul Petróleo (Default)
  "#8B5CF6", // Roxo / Nubank
  "#EF4444", // Vermelho / Santander
  "#F97316", // Laranja / Inter
  "#EAB308", // Amarelo / Banco do Brasil
  "#22C55E", // Verde / C6
  "#06B6D4", // Ciano
  "#18181B", // Preto / Black
];

export function CartaoCreditoModal({
  open,
  onOpenChange,
  cartaoEmEdicao,
  onSubmit,
  isSubmitting,
}: CartaoCreditoModalProps) {
  const { data: bancos = [] } = useBancos();

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    reset,
    setError,
    formState: { errors },
  } = useForm<CartaoCreditoFormData>({
    resolver: zodResolver(cartaoCreditoSchema),
    defaultValues: {
      nome: "",
      banco_id: "",
      bandeira: BandeiraCartao.VISA,
      limite: 1000,
      dia_fechamento: 1,
      dia_vencimento: 10,
      cor_hex: "#1F4E79",
    },
  });

  const corHexAtual = watch("cor_hex");
  const bancoIdAtual = watch("banco_id");
  const bandeiraAtual = watch("bandeira");

  // Preenche dados ao editar ou redefinir ao fechar/abrir
  useEffect(() => {
    if (cartaoEmEdicao) {
      reset({
        nome: cartaoEmEdicao.nome,
        banco_id: cartaoEmEdicao.banco_id ? String(cartaoEmEdicao.banco_id) : "",
        bandeira: cartaoEmEdicao.bandeira || BandeiraCartao.VISA,
        limite: cartaoEmEdicao.limite,
        dia_fechamento: cartaoEmEdicao.dia_fechamento,
        dia_vencimento: cartaoEmEdicao.dia_vencimento,
        cor_hex: cartaoEmEdicao.cor_hex || "#1F4E79",
      });
    } else {
      reset({
        nome: "",
        banco_id: "",
        bandeira: BandeiraCartao.VISA,
        limite: 1000,
        dia_fechamento: 1,
        dia_vencimento: 10,
        cor_hex: "#1F4E79",
      });
    }
  }, [cartaoEmEdicao, open, reset]);

  const handleFormSubmit = async (data: CartaoCreditoFormData) => {
    try {
      const payload: CriarCartaoCreditoPayload = {
        nome: data.nome,
        banco_id: data.banco_id ? Number(data.banco_id) : null,
        bandeira: data.bandeira || null,
        limite: data.limite,
        dia_fechamento: data.dia_fechamento,
        dia_vencimento: data.dia_vencimento,
        cor_hex: data.cor_hex || null,
      };

      await onSubmit(payload);
      onOpenChange(false);
    } catch (err: unknown) {
      if (axios.isAxiosError(err) && err.response?.status === 422) {
        const apiErrors = err.response.data?.errors;
        if (apiErrors) {
          Object.keys(apiErrors).forEach((key) => {
            setError(key as keyof CartaoCreditoFormData, {
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
            {cartaoEmEdicao ? "Editar Cartão de Crédito" : "Novo Cartão de Crédito"}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-4 py-2">
          {errors.root && (
            <div className="p-3 text-xs font-medium text-red-500 bg-red-50 dark:bg-red-950/30 rounded-lg">
              {errors.root.message}
            </div>
          )}

          {/* Nome do Cartão */}
          <div className="space-y-1.5">
            <Label htmlFor="nome">Nome do Cartão *</Label>
            <Input
              id="nome"
              placeholder="Ex: Nubank Black, Cartão Itaú Personalité"
              {...register("nome")}
              className="rounded-[10px]"
            />
            {errors.nome && (
              <p className="text-xs text-red-500">{errors.nome.message}</p>
            )}
          </div>

          {/* Banco Emissor e Bandeira */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label>Banco Emissor</Label>
              <Select
                value={bancoIdAtual || "custom"}
                onValueChange={(val) => {
                  if (!val || val === "custom") {
                    setValue("banco_id", "");
                  } else {
                    setValue("banco_id", val);
                    const b = bancos.find((item) => String(item.id) === val);
                    if (b?.cor_hex) {
                      setValue("cor_hex", b.cor_hex);
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
                      : "Outro / Manual"}
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
              <Label>Bandeira do Cartão</Label>
              <Select
                value={bandeiraAtual || BandeiraCartao.VISA}
                onValueChange={(val) => setValue("bandeira", val as BandeiraCartao)}
              >
                <SelectTrigger className="rounded-[10px]">
                  <SelectValue placeholder="Selecione a bandeira">
                    {bandeiraAtual
                      ? BandeiraCartaoDescricao[bandeiraAtual]
                      : "Visa"}
                  </SelectValue>
                </SelectTrigger>
                <SelectContent className="rounded-xl">
                  {Object.entries(BandeiraCartaoDescricao).map(([b, desc]) => (
                    <SelectItem key={b} value={b}>
                      {desc}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Limite de Crédito */}
          <div className="space-y-1.5">
            <Label htmlFor="limite">Limite Total (R$) *</Label>
            <Input
              id="limite"
              type="number"
              step="0.01"
              placeholder="5000,00"
              {...register("limite")}
              className="rounded-[10px]"
            />
            {errors.limite && (
              <p className="text-xs text-red-500">{errors.limite.message}</p>
            )}
          </div>

          {/* Datas de Ciclo: Fechamento e Vencimento */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label htmlFor="dia_fechamento">Dia do Fechamento (1 a 31) *</Label>
              <Input
                id="dia_fechamento"
                type="number"
                min={1}
                max={31}
                placeholder="Ex: 1"
                {...register("dia_fechamento")}
                className="rounded-[10px]"
              />
              {errors.dia_fechamento && (
                <p className="text-xs text-red-500">
                  {errors.dia_fechamento.message}
                </p>
              )}
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="dia_vencimento">Dia do Vencimento (1 a 31) *</Label>
              <Input
                id="dia_vencimento"
                type="number"
                min={1}
                max={31}
                placeholder="Ex: 10"
                {...register("dia_vencimento")}
                className="rounded-[10px]"
              />
              {errors.dia_vencimento && (
                <p className="text-xs text-red-500">
                  {errors.dia_vencimento.message}
                </p>
              )}
            </div>
          </div>

          {/* Seletor de Cor */}
          <div className="space-y-1.5">
            <Label>Cor de Exibição do Cartão</Label>
            <div className="flex items-center gap-2 pt-1 flex-wrap">
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

          <DialogFooter className="pt-4">
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
              {isSubmitting
                ? "Salvando..."
                : cartaoEmEdicao
                ? "Atualizar Cartão"
                : "Criar Cartão"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
