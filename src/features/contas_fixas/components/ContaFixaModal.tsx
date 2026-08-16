"use client";

import { useCallback, useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import {
  ContaFixa,
  FormaPagamentoContaFixa,
  FormaPagamentoContaFixaDescricao,
  FrequenciaContaFixa,
  FrequenciaContaFixaDescricao,
  CriarContaFixaPayload,
} from "@/types/contasFixas";
import { TipoMovimentacao } from "@/types/movimentacoes";
import { TipoCategoria } from "@/types/categorias";
import { ContaBancaria } from "@/types/contas";
import { CartaoCredito } from "@/types/cartoes";
import { useContasBancarias } from "@/features/contas_bancarias/hooks/useContasBancarias";
import { useCartoes } from "@/features/cartoes/hooks/useCartoes";
import { useCategorias } from "@/features/categorias/hooks/useCategorias";
import { ComboboxCategoria } from "@/features/movimentacoes/components/ComboboxCategoria";
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
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ArrowUpCircle, ArrowDownCircle, Landmark, CreditCard as CreditCardIcon } from "lucide-react";
import { cn } from "@/lib/utils";

// ─── Helpers de formatação de moeda BRL ───────────────────────────────────────

/** Converte string formatada ("R$ 1.234,56") → número (1234.56) */
function parseMoeda(valorFormatado: string): number {
  const apenasDigitos = valorFormatado.replace(/\D/g, "");
  return parseFloat((parseInt(apenasDigitos, 10) / 100).toFixed(2)) || 0;
}

/** Formata número (1234.56) → string BRL ("R$ 1.234,56") */
function formatarMoedaMascara(valor: number): string {
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
    minimumFractionDigits: 2,
  }).format(valor);
}

/** Máscara de entrada: transforma o que o usuário digita em "R$ X.XXX,XX" */
function aplicarMascaraMoeda(inputValue: string): string {
  const apenasDigitos = inputValue.replace(/\D/g, "");
  if (!apenasDigitos || apenasDigitos === "0") return "";
  const numero = parseInt(apenasDigitos, 10) / 100;
  return formatarMoedaMascara(numero);
}

// ─── Schema Zod ───────────────────────────────────────────────────────────────

const contaFixaSchema = z.object({
  descricao: z.string().min(1, "Informe a descrição"),
  valor: z
    .string()
    .min(1, "Informe o valor")
    .refine((val) => !isNaN(Number(val)) && Number(val) > 0, "O valor deve ser maior que zero"),
  tipo: z.nativeEnum(TipoMovimentacao),
  forma_pagamento: z.nativeEnum(FormaPagamentoContaFixa),
  frequencia: z.nativeEnum(FrequenciaContaFixa),
  dia_vencimento: z
    .string()
    .min(1, "Informe o dia do vencimento")
    .refine((val) => {
      const num = Number(val);
      return !isNaN(num) && num >= 1 && num <= 31;
    }, "O dia deve estar entre 1 e 31"),
  categoria_id: z.string().optional(),
  subcategoria_id: z.string().optional(),
  conta_bancaria_id: z.string().optional(),
  cartao_credito_id: z.string().optional(),
  ativa: z.boolean(),
  observacao: z.string().optional(),
});

export type ContaFixaFormData = z.infer<typeof contaFixaSchema>;

interface ContaFixaModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  contaFixaEmEdicao?: ContaFixa | null;
  onSubmit: (data: CriarContaFixaPayload) => Promise<void>;
  isSubmitting?: boolean;
}

export function ContaFixaModal({
  open,
  onOpenChange,
  contaFixaEmEdicao,
  onSubmit,
  isSubmitting = false,
}: ContaFixaModalProps) {
  const isEditing = Boolean(contaFixaEmEdicao);

  const { contas } = useContasBancarias();
  const { cartoes } = useCartoes();
  const [valorDisplay, setValorDisplay] = useState("");

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    reset,
    setError,
    formState: { errors },
  } = useForm<ContaFixaFormData>({
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    resolver: zodResolver(contaFixaSchema) as any,
    defaultValues: {
      descricao: "",
      valor: "",
      tipo: TipoMovimentacao.DESPESA,
      forma_pagamento: FormaPagamentoContaFixa.CONTA_BANCARIA,
      frequencia: FrequenciaContaFixa.MENSAL,
      dia_vencimento: "",
      categoria_id: "",
      subcategoria_id: "",
      conta_bancaria_id: "",
      cartao_credito_id: "",
      ativa: true,
      observacao: "",
    },
  });

  const tipoSelecionado = watch("tipo");
  const formaPagamentoSelecionada = watch("forma_pagamento");

  const { categorias } = useCategorias(undefined, {
    tipo: tipoSelecionado === TipoMovimentacao.RECEITA ? TipoCategoria.RECEITA : TipoCategoria.DESPESA,
  });

  /** Valor codificado para a ComboboxCategoria ("cat:ID" ou "sub:ID") */
  const valorCategoriaSelecionada = (() => {
    const subId = watch("subcategoria_id");
    const catId = watch("categoria_id");
    if (subId) return `sub:${subId}`;
    if (catId) return `cat:${catId}`;
    return undefined;
  })();

  /** Trata alteração da categoria/subcategoria na Combobox */
  const handleCategoriaChange = useCallback(
    (valor: string | null) => {
      if (!valor) {
        setValue("categoria_id", "");
        setValue("subcategoria_id", "");
        return;
      }
      if (valor.startsWith("cat:")) {
        const catId = valor.slice(4);
        setValue("categoria_id", catId);
        setValue("subcategoria_id", "");
      } else if (valor.startsWith("sub:")) {
        const subId = valor.slice(4);
        let parentCatId = "";
        for (const cat of categorias) {
          const sub = cat.subcategorias?.find((s) => s.id.toString() === subId);
          if (sub) {
            parentCatId = (sub.categoria_id || cat.id).toString();
            break;
          }
        }
        setValue("subcategoria_id", subId);
        setValue("categoria_id", parentCatId);
      }
    },
    [categorias, setValue]
  );

  // ── Renderização com logotipo / cor da conta bancária ou cartão ─────────────

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

  const renderCartaoOption = useCallback((cartao: CartaoCredito) => {
    const corBg = cartao.cor_hex || "#1F4E79";
    return (
      <div className="flex items-center gap-2 min-w-0">
        <div
          className="flex h-5 w-5 shrink-0 items-center justify-center rounded-md text-white font-bold text-[10px] shadow-2xs overflow-hidden"
          style={{ backgroundColor: corBg }}
        >
          {cartao.banco?.logo_url ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={cartao.banco.logo_url}
              alt={cartao.banco.nome}
              className="h-3.5 w-3.5 object-contain"
            />
          ) : (
            <CreditCardIcon className="h-3 w-3 text-white" />
          )}
        </div>
        <span className="font-medium text-xs truncate">{cartao.nome}</span>
        {cartao.banco?.nome ? (
          <span className="text-[10px] text-muted-foreground truncate hidden sm:inline">
            • {cartao.banco.nome}
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

  const labelCartao = useCallback(
    (value: unknown) => {
      if (!value) return null;
      const found = cartoes.find((c) => c.id.toString() === String(value));
      return found ? renderCartaoOption(found) : null;
    },
    [cartoes, renderCartaoOption]
  );

  // ── Sincronização ao abrir / reset do modal ─────────────────────────────────

  useEffect(() => {
    if (open) {
      if (contaFixaEmEdicao) {
        reset({
          descricao: contaFixaEmEdicao.descricao,
          valor: contaFixaEmEdicao.valor.toString(),
          tipo: contaFixaEmEdicao.tipo,
          forma_pagamento: contaFixaEmEdicao.forma_pagamento,
          frequencia: contaFixaEmEdicao.frequencia,
          dia_vencimento: contaFixaEmEdicao.dia_vencimento.toString(),
          categoria_id: contaFixaEmEdicao.categoria_id?.toString() || "",
          subcategoria_id: contaFixaEmEdicao.subcategoria_id?.toString() || "",
          conta_bancaria_id: contaFixaEmEdicao.conta_bancaria_id?.toString() || "",
          cartao_credito_id: contaFixaEmEdicao.cartao_credito_id?.toString() || "",
          ativa: contaFixaEmEdicao.ativa,
          observacao: contaFixaEmEdicao.observacao || "",
        });
        setValorDisplay(
          contaFixaEmEdicao.valor > 0
            ? formatarMoedaMascara(Number(contaFixaEmEdicao.valor))
            : ""
        );
      } else {
        reset({
          descricao: "",
          valor: "",
          tipo: TipoMovimentacao.DESPESA,
          forma_pagamento: FormaPagamentoContaFixa.CONTA_BANCARIA,
          frequencia: FrequenciaContaFixa.MENSAL,
          dia_vencimento: "",
          categoria_id: "",
          subcategoria_id: "",
          conta_bancaria_id: contas.length > 0 ? contas[0].id.toString() : "",
          cartao_credito_id: cartoes.length > 0 ? cartoes[0].id.toString() : "",
          ativa: true,
          observacao: "",
        });
        setValorDisplay("");
      }
    }
  }, [contaFixaEmEdicao, reset, open, contas, cartoes]);

  const handleFormSubmit = async (data: ContaFixaFormData) => {
    try {
      const payload: CriarContaFixaPayload = {
        descricao: data.descricao,
        valor: Number(data.valor),
        tipo: data.tipo,
        forma_pagamento: data.forma_pagamento,
        frequencia: data.frequencia,
        dia_vencimento: Number(data.dia_vencimento),
        categoria_id: data.categoria_id ? Number(data.categoria_id) : null,
        subcategoria_id: data.subcategoria_id ? Number(data.subcategoria_id) : null,
        conta_bancaria_id:
          data.forma_pagamento === FormaPagamentoContaFixa.CONTA_BANCARIA &&
          data.conta_bancaria_id
            ? Number(data.conta_bancaria_id)
            : null,
        cartao_credito_id:
          data.forma_pagamento === FormaPagamentoContaFixa.CARTAO_CREDITO &&
          data.cartao_credito_id
            ? Number(data.cartao_credito_id)
            : null,
        ativa: data.ativa,
        observacao: data.observacao || null,
      };

      await onSubmit(payload);
      onOpenChange(false);
    } catch (err: unknown) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const errorData = (err as any)?.response?.data;
      if (errorData?.errors) {
        Object.entries(errorData.errors).forEach(([field, messages]) => {
          if (Array.isArray(messages) && messages.length > 0) {
            setError(field as keyof ContaFixaFormData, {
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
      <DialogContent className="sm:max-w-[560px] rounded-[20px] p-6 max-h-[90vh] overflow-y-auto">
        <DialogHeader className="space-y-1">
          <DialogTitle className="text-xl font-bold text-foreground">
            {isEditing ? "Editar Conta Fixa" : "Nova Conta Fixa"}
          </DialogTitle>
          <DialogDescription className="text-xs text-muted-foreground">
            {isEditing
              ? "Atualize os parâmetros e regras do lançamento recorrente"
              : "Cadastre um lançamento fixo (receita ou despesa) que se repete periodicamente"}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-4 mt-3">
          {/* Selector Tipo: Receita / Despesa */}
          <div className="grid grid-cols-2 gap-3">
            <button
              type="button"
              onClick={() => {
                setValue("tipo", TipoMovimentacao.DESPESA);
                setValue("categoria_id", "");
                setValue("subcategoria_id", "");
              }}
              className={cn(
                "flex items-center justify-center gap-2 p-3 rounded-xl border border-border/60 text-xs font-semibold transition-all cursor-pointer",
                tipoSelecionado === TipoMovimentacao.DESPESA
                  ? "bg-rose-500/10 text-rose-600 border-rose-500/30 ring-2 ring-rose-500/20 font-bold"
                  : "bg-card text-muted-foreground hover:bg-accent"
              )}
            >
              <ArrowDownCircle className="h-4 w-4 text-rose-500" />
              Despesa Fixa
            </button>

            <button
              type="button"
              onClick={() => {
                setValue("tipo", TipoMovimentacao.RECEITA);
                setValue("categoria_id", "");
                setValue("subcategoria_id", "");
              }}
              className={cn(
                "flex items-center justify-center gap-2 p-3 rounded-xl border border-border/60 text-xs font-semibold transition-all cursor-pointer",
                tipoSelecionado === TipoMovimentacao.RECEITA
                  ? "bg-emerald-500/10 text-emerald-600 border-emerald-500/30 ring-2 ring-emerald-500/20 font-bold"
                  : "bg-card text-muted-foreground hover:bg-accent"
              )}
            >
              <ArrowUpCircle className="h-4 w-4 text-emerald-500" />
              Receita Fixa
            </button>
          </div>

          {/* Descrição */}
          <div className="space-y-1.5">
            <Label htmlFor="descricao" className="text-xs font-semibold text-foreground">
              Descrição / Nome da Conta *
            </Label>
            <Input
              id="descricao"
              placeholder="Ex: Aluguel, Assinatura Netflix, Salário"
              {...register("descricao")}
              className="rounded-[10px] text-sm"
            />
            {errors.descricao && (
              <p className="text-xs text-rose-500 font-medium">{errors.descricao.message}</p>
            )}
          </div>

          {/* Valor (com Máscara BRL) & Dia de Vencimento */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label htmlFor="valor" className="text-xs font-semibold text-foreground">
                Valor Recorrente *
              </Label>
              <Input
                id="valor"
                type="text"
                inputMode="numeric"
                placeholder="R$ 0,00"
                value={valorDisplay}
                onChange={(e) => {
                  const mascarado = aplicarMascaraMoeda(e.target.value);
                  setValorDisplay(mascarado);
                  setValue("valor", mascarado ? String(parseMoeda(mascarado)) : "");
                }}
                className={cn(
                  "rounded-[10px] text-sm font-semibold h-10",
                  tipoSelecionado === TipoMovimentacao.RECEITA && valorDisplay && "text-emerald-600 dark:text-emerald-400",
                  tipoSelecionado === TipoMovimentacao.DESPESA && valorDisplay && "text-rose-600 dark:text-rose-400"
                )}
              />
              {errors.valor && (
                <p className="text-xs text-rose-500 font-medium">{errors.valor.message}</p>
              )}
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="dia_vencimento" className="text-xs font-semibold text-foreground">
                Dia de Vencimento (1 a 31) *
              </Label>
              <Input
                id="dia_vencimento"
                type="number"
                min="1"
                max="31"
                placeholder="Ex: 10"
                {...register("dia_vencimento")}
                className="rounded-[10px] text-sm h-10"
              />
              {errors.dia_vencimento && (
                <p className="text-xs text-rose-500 font-medium">
                  {errors.dia_vencimento.message}
                </p>
              )}
            </div>
          </div>

          {/* Frequência & Forma de Pagamento */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label className="text-xs font-semibold text-foreground">Frequência *</Label>
              <Select
                value={watch("frequencia")}
                onValueChange={(val) => setValue("frequencia", val as FrequenciaContaFixa)}
              >
                <SelectTrigger className="rounded-[10px] text-sm h-10">
                  <SelectValue placeholder="Selecione a frequência">
                    {(val: unknown) =>
                      val ? FrequenciaContaFixaDescricao[val as FrequenciaContaFixa] : null
                    }
                  </SelectValue>
                </SelectTrigger>
                <SelectContent>
                  {Object.values(FrequenciaContaFixa).map((freq) => (
                    <SelectItem key={freq} value={freq}>
                      {FrequenciaContaFixaDescricao[freq]}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-1.5">
              <Label className="text-xs font-semibold text-foreground">
                Forma de Pagamento *
              </Label>
              <Select
                value={watch("forma_pagamento")}
                onValueChange={(val) =>
                  setValue("forma_pagamento", val as FormaPagamentoContaFixa)
                }
              >
                <SelectTrigger className="rounded-[10px] text-sm h-10">
                  <SelectValue placeholder="Selecione a forma">
                    {(val: unknown) =>
                      val
                        ? FormaPagamentoContaFixaDescricao[val as FormaPagamentoContaFixa]
                        : null
                    }
                  </SelectValue>
                </SelectTrigger>
                <SelectContent>
                  {Object.values(FormaPagamentoContaFixa).map((forma) => (
                    <SelectItem key={forma} value={forma}>
                      {FormaPagamentoContaFixaDescricao[forma]}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Conta Bancária ou Cartão de Crédito dependendo da Forma de Pagamento */}
          {formaPagamentoSelecionada === FormaPagamentoContaFixa.CONTA_BANCARIA ? (
            <div className="space-y-1.5">
              <Label className="text-xs font-semibold text-foreground">
                Conta Bancária de Débito / Crédito
              </Label>
              <Select
                value={watch("conta_bancaria_id") || undefined}
                onValueChange={(val) => setValue("conta_bancaria_id", val || "")}
              >
                <SelectTrigger className="rounded-[10px] text-sm h-10">
                  <SelectValue placeholder="Selecione a conta bancária">
                    {(value: unknown) =>
                      labelConta(value) ?? (
                        <span className="text-muted-foreground">
                          Selecione a conta bancária
                        </span>
                      )
                    }
                  </SelectValue>
                </SelectTrigger>
                <SelectContent className="rounded-xl">
                  {contas.map((c) => (
                    <SelectItem key={c.id} value={c.id.toString()} label={c.nome}>
                      {renderContaOption(c)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          ) : (
            <div className="space-y-1.5">
              <Label className="text-xs font-semibold text-foreground">
                Cartão de Crédito Vinculado
              </Label>
              <Select
                value={watch("cartao_credito_id") || undefined}
                onValueChange={(val) => setValue("cartao_credito_id", val || "")}
              >
                <SelectTrigger className="rounded-[10px] text-sm h-10">
                  <SelectValue placeholder="Selecione o cartão de crédito">
                    {(value: unknown) =>
                      labelCartao(value) ?? (
                        <span className="text-muted-foreground">
                          Selecione o cartão de crédito
                        </span>
                      )
                    }
                  </SelectValue>
                </SelectTrigger>
                <SelectContent className="rounded-xl">
                  {cartoes.map((card) => (
                    <SelectItem key={card.id} value={card.id.toString()} label={card.nome}>
                      {renderCartaoOption(card)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          {/* Combobox de Categoria com Filtro por Tipo e Busca */}
          <div className="space-y-1.5">
            <Label className="text-xs font-semibold text-foreground">Categoria</Label>
            <ComboboxCategoria
              categorias={categorias}
              valorSelecionado={valorCategoriaSelecionada}
              onChange={handleCategoriaChange}
              placeholder="Selecione a categoria..."
              hasError={Boolean(errors.categoria_id)}
            />
            {errors.categoria_id && (
              <p className="text-xs text-rose-500 font-medium">{errors.categoria_id.message}</p>
            )}
          </div>

          {/* Observações */}
          <div className="space-y-1.5">
            <Label htmlFor="observacao" className="text-xs font-semibold text-foreground">
              Observações (Opcional)
            </Label>
            <Input
              id="observacao"
              placeholder="Ex: Reajuste anual pelo IGPM em Março"
              {...register("observacao")}
              className="rounded-[10px] text-sm"
            />
          </div>

          {/* Switch Ativa / Inativa */}
          <div className="flex items-center justify-between p-3 rounded-xl bg-accent/40 border border-border/40">
            <div className="space-y-0.5">
              <Label className="text-xs font-semibold text-foreground cursor-pointer">
                Manter Conta Fixa Ativa
              </Label>
              <p className="text-[11px] text-muted-foreground">
                Contas ativas geram lançamentos automáticos no mês corrente.
              </p>
            </div>
            <Switch
              checked={watch("ativa")}
              onCheckedChange={(checked) => setValue("ativa", checked)}
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
              disabled={isSubmitting}
              className="rounded-[10px] bg-[#1F4E79] hover:bg-[#1F4E79]/90 text-white font-medium text-xs px-5 shadow-sm"
            >
              {isSubmitting ? "Salvar..." : isEditing ? "Atualizar Conta Fixa" : "Criar Conta Fixa"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
