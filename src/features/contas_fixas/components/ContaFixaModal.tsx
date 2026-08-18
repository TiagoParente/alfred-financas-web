"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import {
  ContaFixa,
  FormaPagamentoContaFixa,
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
import { CategoriaModal, CategoriaFormData } from "@/features/categorias/components/CategoriaModal";
import { NovaSubcategoriaModal } from "@/features/categorias/components/NovaSubcategoriaModal";
import { ComboboxCategoria } from "@/features/movimentacoes/components/ComboboxCategoria";
import { ContaCartaoContextoInfo } from "@/features/movimentacoes/components/ContaCartaoContextoInfo";
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
import {
  ArrowUpCircle,
  ArrowDownCircle,
  Landmark,
  CreditCard as CreditCardIcon,
  AlertCircle,
  Calendar,
  Layers,
} from "lucide-react";
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

const contaFixaSchema = z
  .object({
    descricao: z.string().min(1, "Informe a descrição da conta fixa"),
    valor: z
      .union([z.string(), z.number()])
      .refine((val) => !isNaN(Number(val)) && Number(val) > 0, "O valor deve ser maior que zero"),
    tipo: z.nativeEnum(TipoMovimentacao),
    forma_pagamento: z.nativeEnum(FormaPagamentoContaFixa),
    frequencia: z.nativeEnum(FrequenciaContaFixa),
    dia_vencimento: z
      .union([z.string(), z.number()])
      .refine((val) => {
        const num = Number(val);
        return !isNaN(num) && num >= 1 && num <= 31;
      }, "O dia deve estar entre 1 e 31"),
    categoria_id: z.union([z.string(), z.number()]).nullable().optional(),
    subcategoria_id: z.union([z.string(), z.number()]).nullable().optional(),
    conta_bancaria_id: z.union([z.string(), z.number()]).nullable().optional(),
    cartao_credito_id: z.union([z.string(), z.number()]).nullable().optional(),
    ativa: z.boolean(),
    observacao: z.string().nullable().optional(),
  })
  .refine(
    (data) => {
      if (data.forma_pagamento === FormaPagamentoContaFixa.CARTAO_CREDITO) {
        return Boolean(data.cartao_credito_id && String(data.cartao_credito_id).trim() !== "");
      }
      return true;
    },
    {
      message: "Selecione o cartão de crédito",
      path: ["cartao_credito_id"],
    }
  )
  .refine(
    (data) => {
      if (data.forma_pagamento === FormaPagamentoContaFixa.CONTA_BANCARIA) {
        return Boolean(data.conta_bancaria_id && String(data.conta_bancaria_id).trim() !== "");
      }
      return true;
    },
    {
      message: "Selecione a conta bancária",
      path: ["conta_bancaria_id"],
    }
  );

export type ContaFixaFormData = z.infer<typeof contaFixaSchema>;

interface ContaFixaModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  contaFixaEmEdicao?: ContaFixa | null;
  onSubmit: (data: CriarContaFixaPayload) => Promise<void>;
  isSubmitting?: boolean;
  familiaId?: number | null;
}

export function ContaFixaModal({
  open,
  onOpenChange,
  contaFixaEmEdicao,
  onSubmit,
  isSubmitting = false,
  familiaId,
}: ContaFixaModalProps) {
  const isEditing = Boolean(contaFixaEmEdicao);

  const { contas } = useContasBancarias(familiaId);
  const { cartoes } = useCartoes(familiaId);
  const [valorDisplay, setValorDisplay] = useState("");

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    reset,
    setError,
    clearErrors,
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
  const contaBancariaIdSelecionada = watch("conta_bancaria_id");
  const cartaoCreditoIdSelecionado = watch("cartao_credito_id");
  const categoriaIdSelecionada = watch("categoria_id");
  const subcategoriaIdSelecionada = watch("subcategoria_id");

  const {
    categorias,
    criarCategoria,
    isCriandoCategoria,
    criarSubcategoria,
    isCriandoSubcategoria,
  } = useCategorias(familiaId, {
    tipo: tipoSelecionado === TipoMovimentacao.RECEITA ? TipoCategoria.RECEITA : TipoCategoria.DESPESA,
  });

  const [modalNovaCategoriaAberta, setModalNovaCategoriaAberta] = useState(false);
  const [modalNovaSubcategoriaAberta, setModalNovaSubcategoriaAberta] = useState(false);

  /** Valor codificado para a ComboboxCategoria ("cat:ID" ou "sub:ID") */
  const valorCategoriaSelecionada = useMemo(() => {
    if (subcategoriaIdSelecionada) return `sub:${subcategoriaIdSelecionada}`;
    if (categoriaIdSelecionada) return `cat:${categoriaIdSelecionada}`;
    return undefined;
  }, [categoriaIdSelecionada, subcategoriaIdSelecionada]);

  /** Trata alteração da categoria/subcategoria na Combobox */
  const handleCategoriaChange = useCallback(
    (valor: string | null) => {
      if (!valor) {
        setValue("categoria_id", "", { shouldValidate: true });
        setValue("subcategoria_id", "", { shouldValidate: true });
        return;
      }
      if (valor.startsWith("cat:")) {
        const catId = valor.slice(4);
        setValue("categoria_id", catId, { shouldValidate: true });
        setValue("subcategoria_id", "", { shouldValidate: true });
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
        setValue("subcategoria_id", subId, { shouldValidate: true });
        setValue("categoria_id", parentCatId, { shouldValidate: true });
      }
    },
    [categorias, setValue]
  );

  const handleCriarNovaCategoria = async (formData: CategoriaFormData) => {
    const novaCat = await criarCategoria({
      nome: formData.nome,
      tipo: formData.tipo,
      icone: formData.icone || null,
      cor_hex: formData.cor_hex || null,
    });
    if (novaCat?.id) {
      handleCategoriaChange(`cat:${novaCat.id}`);
    }
  };

  const handleCriarNovaSubcategoria = async (categoriaId: number, nome: string) => {
    const novaSub = await criarSubcategoria({
      categoriaId,
      payload: { nome },
    });
    if (novaSub?.id) {
      setValue("subcategoria_id", novaSub.id.toString(), { shouldValidate: true });
      setValue("categoria_id", categoriaId.toString(), { shouldValidate: true });
    }
    return novaSub;
  };

  // ── Renderização com logotipo / cor da conta bancária ou cartão ─────────────

  const renderContaOption = useCallback((conta: ContaBancaria) => {
    const corBg = conta.cor_hex || "#1F4E79";
    return (
      <div className="flex items-center gap-2 min-w-0 max-w-full">
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
        <span className="font-medium text-xs truncate min-w-0">{conta.nome}</span>
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
      <div className="flex items-center gap-2 min-w-0 max-w-full">
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
        <span className="font-medium text-xs truncate min-w-0">{cartao.nome}</span>
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

  // Objetos selecionados para preview
  const contaSelecionada = useMemo(() => {
    if (!contaBancariaIdSelecionada) return null;
    return contas.find((c) => c.id.toString() === contaBancariaIdSelecionada) || null;
  }, [contas, contaBancariaIdSelecionada]);

  const cartaoSelecionado = useMemo(() => {
    if (!cartaoCreditoIdSelecionado) return null;
    return cartoes.find((c) => c.id.toString() === cartaoCreditoIdSelecionado) || null;
  }, [cartoes, cartaoCreditoIdSelecionado]);

  // ── Sincronização ao abrir / reset do modal ─────────────────────────────────

  useEffect(() => {
    if (open) {
      if (contaFixaEmEdicao) {
        const defaultContaId =
          contaFixaEmEdicao.conta_bancaria_id?.toString() ||
          (contas.length > 0 ? contas[0].id.toString() : "");
        const defaultCartaoId =
          contaFixaEmEdicao.cartao_credito_id?.toString() ||
          (cartoes.length > 0 ? cartoes[0].id.toString() : "");

        reset({
          descricao: contaFixaEmEdicao.descricao,
          valor: contaFixaEmEdicao.valor.toString(),
          tipo: contaFixaEmEdicao.tipo,
          forma_pagamento: contaFixaEmEdicao.forma_pagamento,
          frequencia: contaFixaEmEdicao.frequencia,
          dia_vencimento: contaFixaEmEdicao.dia_vencimento.toString(),
          categoria_id: contaFixaEmEdicao.categoria_id?.toString() || "",
          subcategoria_id: contaFixaEmEdicao.subcategoria_id?.toString() || "",
          conta_bancaria_id: defaultContaId,
          cartao_credito_id: defaultCartaoId,
          ativa: Boolean(contaFixaEmEdicao.ativa),
          observacao: contaFixaEmEdicao.observacao || "",
        });
        setValorDisplay(
          contaFixaEmEdicao.valor > 0
            ? formatarMoedaMascara(Number(contaFixaEmEdicao.valor))
            : ""
        );
      } else {
        const defaultContaId = contas.length > 0 ? contas[0].id.toString() : "";
        const defaultCartaoId = cartoes.length > 0 ? cartoes[0].id.toString() : "";

        reset({
          descricao: "",
          valor: "",
          tipo: TipoMovimentacao.DESPESA,
          forma_pagamento: FormaPagamentoContaFixa.CONTA_BANCARIA,
          frequencia: FrequenciaContaFixa.MENSAL,
          dia_vencimento: "",
          categoria_id: "",
          subcategoria_id: "",
          conta_bancaria_id: defaultContaId,
          cartao_credito_id: defaultCartaoId,
          ativa: true,
          observacao: "",
        });
        setValorDisplay("");
      }
    }
  }, [open, contaFixaEmEdicao, reset, contas, cartoes]);

  // Se a lista de contas ou cartões carregar depois do modal abrir no modo criação e ainda não tiver id preenchido
  useEffect(() => {
    if (open && !isEditing) {
      if (!watch("conta_bancaria_id") && contas.length > 0) {
        setValue("conta_bancaria_id", contas[0].id.toString());
      }
      if (!watch("cartao_credito_id") && cartoes.length > 0) {
        setValue("cartao_credito_id", cartoes[0].id.toString());
      }
    }
  }, [open, isEditing, contas, cartoes, setValue, watch]);

  const handleAlternarFormaPagamento = (forma: FormaPagamentoContaFixa) => {
    setValue("forma_pagamento", forma);
    clearErrors(["conta_bancaria_id", "cartao_credito_id"]);

    if (forma === FormaPagamentoContaFixa.CARTAO_CREDITO) {
      if (!watch("cartao_credito_id") && cartoes.length > 0) {
        setValue("cartao_credito_id", cartoes[0].id.toString());
      }
    } else {
      if (!watch("conta_bancaria_id") && contas.length > 0) {
        setValue("conta_bancaria_id", contas[0].id.toString());
      }
    }
  };

  const handleFormSubmit = async (data: ContaFixaFormData) => {
    try {
      const payload: CriarContaFixaPayload = {
        descricao: String(data.descricao).trim(),
        valor: Number(data.valor),
        tipo: data.tipo,
        forma_pagamento: data.forma_pagamento,
        frequencia: data.frequencia,
        dia_vencimento: Number(data.dia_vencimento),
        categoria_id:
          data.categoria_id && String(data.categoria_id).trim() !== ""
            ? Number(data.categoria_id)
            : null,
        subcategoria_id:
          data.subcategoria_id && String(data.subcategoria_id).trim() !== ""
            ? Number(data.subcategoria_id)
            : null,
        conta_bancaria_id:
          data.forma_pagamento === FormaPagamentoContaFixa.CONTA_BANCARIA &&
          data.conta_bancaria_id &&
          String(data.conta_bancaria_id).trim() !== ""
            ? Number(data.conta_bancaria_id)
            : null,
        cartao_credito_id:
          data.forma_pagamento === FormaPagamentoContaFixa.CARTAO_CREDITO &&
          data.cartao_credito_id &&
          String(data.cartao_credito_id).trim() !== ""
            ? Number(data.cartao_credito_id)
            : null,
        ativa: Boolean(data.ativa),
        observacao: data.observacao && String(data.observacao).trim() !== "" ? String(data.observacao).trim() : null,
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
      <DialogContent className="sm:max-w-[580px] w-full rounded-[20px] p-5 sm:p-6 max-h-[90vh] overflow-y-auto overflow-x-hidden">
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

        <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-3.5 mt-2 min-w-0">
          {/* Selector Tipo: Receita / Despesa */}
          <div className="grid grid-cols-2 gap-2.5 min-w-0">
            <button
              type="button"
              onClick={() => {
                setValue("tipo", TipoMovimentacao.DESPESA);
                setValue("categoria_id", "");
                setValue("subcategoria_id", "");
              }}
              className={cn(
                "flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl border border-border/60 text-xs font-semibold transition-all cursor-pointer min-w-0",
                tipoSelecionado === TipoMovimentacao.DESPESA
                  ? "bg-rose-500/10 text-rose-600 border-rose-500/30 ring-2 ring-rose-500/20 font-bold"
                  : "bg-card text-muted-foreground hover:bg-accent"
              )}
            >
              <ArrowDownCircle className="h-4 w-4 text-rose-500 shrink-0" />
              <span className="truncate">Despesa Fixa</span>
            </button>

            <button
              type="button"
              onClick={() => {
                setValue("tipo", TipoMovimentacao.RECEITA);
                setValue("forma_pagamento", FormaPagamentoContaFixa.CONTA_BANCARIA);
                setValue("cartao_credito_id", "");
                setValue("categoria_id", "");
                setValue("subcategoria_id", "");
              }}
              className={cn(
                "flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl border border-border/60 text-xs font-semibold transition-all cursor-pointer min-w-0",
                tipoSelecionado === TipoMovimentacao.RECEITA
                  ? "bg-emerald-500/10 text-emerald-600 border-emerald-500/30 ring-2 ring-emerald-500/20 font-bold"
                  : "bg-card text-muted-foreground hover:bg-accent"
              )}
            >
              <ArrowUpCircle className="h-4 w-4 text-emerald-500 shrink-0" />
              <span className="truncate">Receita Fixa</span>
            </button>
          </div>

          {/* Origem / Forma de Lançamento (Conta Bancária vs Cartão de Crédito) */}
          {tipoSelecionado === TipoMovimentacao.DESPESA && (
            <div className="space-y-1.5 min-w-0">
              <Label className="text-xs font-semibold text-foreground">
                Forma de Pagamento / Vínculo *
              </Label>
              <div className="grid grid-cols-2 gap-2 p-1 rounded-xl bg-muted/40 border border-border/50 min-w-0">
                <button
                  type="button"
                  onClick={() => handleAlternarFormaPagamento(FormaPagamentoContaFixa.CONTA_BANCARIA)}
                  className={cn(
                    "flex items-center justify-center gap-2 py-2 px-2.5 rounded-lg text-xs font-medium transition-all cursor-pointer min-w-0",
                    formaPagamentoSelecionada === FormaPagamentoContaFixa.CONTA_BANCARIA
                      ? "bg-background text-foreground shadow-2xs font-semibold"
                      : "text-muted-foreground hover:text-foreground"
                  )}
                >
                  <Landmark className="h-3.5 w-3.5 text-[#1F4E79] dark:text-sky-400 shrink-0" />
                  <span className="truncate">Conta Bancária (Débito)</span>
                </button>

                <button
                  type="button"
                  onClick={() => handleAlternarFormaPagamento(FormaPagamentoContaFixa.CARTAO_CREDITO)}
                  className={cn(
                    "flex items-center justify-center gap-2 py-2 px-2.5 rounded-lg text-xs font-medium transition-all cursor-pointer min-w-0",
                    formaPagamentoSelecionada === FormaPagamentoContaFixa.CARTAO_CREDITO
                      ? "bg-background text-foreground shadow-2xs font-semibold"
                      : "text-muted-foreground hover:text-foreground"
                  )}
                >
                  <CreditCardIcon className="h-3.5 w-3.5 text-amber-500 shrink-0" />
                  <span className="truncate">Cartão de Crédito (Fatura)</span>
                </button>
              </div>
            </div>
          )}

          {/* Descrição */}
          <div className="space-y-1.5 min-w-0">
            <Label htmlFor="descricao" className="text-xs font-semibold text-foreground">
              Descrição / Nome da Conta *
            </Label>
            <Input
              id="descricao"
              placeholder="Ex: Aluguel, Assinatura Netflix, Salário"
              {...register("descricao")}
              className="rounded-xl text-sm h-10 w-full bg-background/60 border-border/60"
            />
            {errors.descricao && (
              <p className="text-xs text-rose-500 font-medium">{errors.descricao.message}</p>
            )}
          </div>

          {/* Valor (com Máscara BRL), Frequência e Dia de Vencimento */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 min-w-0">
            <div className="space-y-1.5 min-w-0">
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
                  setValue("valor", mascarado ? String(parseMoeda(mascarado)) : "", {
                    shouldValidate: true,
                  });
                }}
                className={cn(
                  "rounded-xl text-sm font-semibold h-10 w-full bg-background/60 border-border/60",
                  tipoSelecionado === TipoMovimentacao.RECEITA && valorDisplay && "text-emerald-600 dark:text-emerald-400",
                  tipoSelecionado === TipoMovimentacao.DESPESA && valorDisplay && "text-rose-600 dark:text-rose-400"
                )}
              />
              {errors.valor && (
                <p className="text-xs text-rose-500 font-medium">{errors.valor.message}</p>
              )}
            </div>

            <div className="space-y-1.5 min-w-0">
              <Label className="text-xs font-semibold text-foreground">Frequência *</Label>
              <Select
                value={watch("frequencia")}
                onValueChange={(val) => setValue("frequencia", val as FrequenciaContaFixa)}
              >
                <SelectTrigger className="h-10 data-[size=default]:h-10 rounded-xl text-sm w-full min-w-0 overflow-hidden bg-background/60 border-border/60">
                  <SelectValue placeholder="Selecione a frequência">
                    {(val: unknown) =>
                      val ? FrequenciaContaFixaDescricao[val as FrequenciaContaFixa] : null
                    }
                  </SelectValue>
                </SelectTrigger>
                <SelectContent className="rounded-xl">
                  {Object.values(FrequenciaContaFixa).map((freq) => (
                    <SelectItem key={freq} value={freq}>
                      {FrequenciaContaFixaDescricao[freq]}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-1.5 min-w-0">
              <Label htmlFor="dia_vencimento" className="text-xs font-semibold text-foreground">
                Dia Vencimento *
              </Label>
              <div className="relative">
                <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
                <Input
                  id="dia_vencimento"
                  type="number"
                  min="1"
                  max="31"
                  placeholder="Ex: 10"
                  {...register("dia_vencimento")}
                  className="rounded-xl text-sm h-10 pl-9 w-full bg-background/60 border-border/60"
                />
              </div>
              {errors.dia_vencimento && (
                <p className="text-xs text-rose-500 font-medium">
                  {errors.dia_vencimento.message}
                </p>
              )}
            </div>
          </div>

          {/* Conta Bancária/Cartão e Categoria em 2 colunas */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 min-w-0">
            {/* Conta Bancária ou Cartão de Crédito dependendo da Forma de Pagamento */}
            {formaPagamentoSelecionada === FormaPagamentoContaFixa.CONTA_BANCARIA ? (
              <div className="space-y-1.5 min-w-0">
                <Label className="text-xs font-semibold text-foreground">
                  Conta Bancária *
                </Label>
                {contas.length === 0 ? (
                  <div className="p-2.5 rounded-xl bg-amber-500/10 border border-amber-500/20 text-xs text-amber-600 dark:text-amber-400 flex items-center gap-2">
                    <AlertCircle className="h-4 w-4 shrink-0" />
                    <span className="truncate">Nenhuma conta cadastrada</span>
                  </div>
                ) : (
                  <Select
                    value={watch("conta_bancaria_id") ? String(watch("conta_bancaria_id")) : undefined}
                    onValueChange={(val) => {
                      setValue("conta_bancaria_id", val || "", { shouldValidate: true });
                    }}
                  >
                    <SelectTrigger className="h-10 data-[size=default]:h-10 rounded-xl text-sm w-full min-w-0 overflow-hidden bg-background/60 border-border/60">
                      <SelectValue placeholder="Selecione a conta bancária">
                        {(value: unknown) =>
                          labelConta(value) ?? (
                            <span className="text-muted-foreground">
                              Selecione a conta
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
                )}
                {errors.conta_bancaria_id && (
                  <p className="text-xs text-rose-500 font-medium">
                    {errors.conta_bancaria_id.message}
                  </p>
                )}
              </div>
            ) : (
              <div className="space-y-1.5 min-w-0">
                <Label className="text-xs font-semibold text-foreground">
                  Cartão de Crédito *
                </Label>
                {cartoes.length === 0 ? (
                  <div className="p-2.5 rounded-xl bg-amber-500/10 border border-amber-500/20 text-xs text-amber-600 dark:text-amber-400 flex items-center gap-2">
                    <AlertCircle className="h-4 w-4 shrink-0" />
                    <span className="truncate">Nenhum cartão cadastrado</span>
                  </div>
                ) : (
                  <Select
                    value={watch("cartao_credito_id") ? String(watch("cartao_credito_id")) : undefined}
                    onValueChange={(val) => {
                      setValue("cartao_credito_id", val || "", { shouldValidate: true });
                    }}
                  >
                    <SelectTrigger className="h-10 data-[size=default]:h-10 rounded-xl text-sm w-full min-w-0 overflow-hidden bg-background/60 border-border/60">
                      <SelectValue placeholder="Selecione o cartão de crédito">
                        {(value: unknown) =>
                          labelCartao(value) ?? (
                            <span className="text-muted-foreground">
                              Selecione o cartão
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
                )}
                {errors.cartao_credito_id && (
                  <p className="text-xs text-rose-500 font-medium">
                    {errors.cartao_credito_id.message}
                  </p>
                )}
              </div>
            )}

            {/* Combobox de Categoria com Filtro por Tipo e Busca */}
            <div className="space-y-1.5 min-w-0 w-full">
              <Label className="text-xs font-semibold text-foreground">Categoria</Label>
              <ComboboxCategoria
                categorias={categorias}
                valorSelecionado={valorCategoriaSelecionada}
                onChange={handleCategoriaChange}
                onNovaCategoria={() => setModalNovaCategoriaAberta(true)}
                onNovaSubcategoria={() => setModalNovaSubcategoriaAberta(true)}
                placeholder="Selecione a categoria..."
                hasError={Boolean(errors.categoria_id)}
                className="w-full rounded-xl"
              />
              {errors.categoria_id && (
                <p className="text-xs text-rose-500 font-medium">{errors.categoria_id.message}</p>
              )}
            </div>
          </div>

          {/* Contexto da conta bancária ou cartão selecionado */}
          {formaPagamentoSelecionada === FormaPagamentoContaFixa.CONTA_BANCARIA && contaSelecionada && (
            <ContaCartaoContextoInfo conta={contaSelecionada} familiaId={familiaId} />
          )}
          {formaPagamentoSelecionada === FormaPagamentoContaFixa.CARTAO_CREDITO && cartaoSelecionado && (
            <ContaCartaoContextoInfo cartao={cartaoSelecionado} familiaId={familiaId} />
          )}

          {/* Observações */}
          <div className="space-y-1.5 min-w-0">
            <Label htmlFor="observacao" className="text-xs font-semibold text-foreground">
              Observações (Opcional)
            </Label>
            <Input
              id="observacao"
              placeholder="Ex: Reajuste anual pelo IGPM em Março"
              {...register("observacao")}
              className="rounded-xl text-sm h-10 w-full bg-background/60 border-border/60"
            />
          </div>

          {/* Switch Ativa / Inativa */}
          <div className="flex items-center justify-between p-2.5 sm:p-3 rounded-xl bg-accent/40 border border-border/40 gap-3 min-w-0">
            <div className="space-y-0.5 min-w-0">
              <Label className="text-xs font-semibold text-foreground cursor-pointer block">
                Manter Conta Fixa Ativa
              </Label>
              <p className="text-[11px] text-muted-foreground truncate sm:whitespace-normal">
                Contas ativas geram lançamentos automáticos no mês corrente.
              </p>
            </div>
            <Switch
              checked={watch("ativa")}
              onCheckedChange={(checked) => setValue("ativa", checked)}
              className="shrink-0"
            />
          </div>

          {/* Botões de Ação */}
          <div className="flex items-center justify-end gap-2.5 pt-2 border-t border-border/40">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              className="rounded-[10px] text-xs h-9 px-4 cursor-pointer"
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              disabled={isSubmitting}
              className="rounded-[10px] bg-[#1F4E79] hover:bg-[#1F4E79]/90 text-white font-medium text-xs h-9 px-5 shadow-xs cursor-pointer"
            >
              {isSubmitting ? "Salvar..." : isEditing ? "Atualizar Conta Fixa" : "Criar Conta Fixa"}
            </Button>
          </div>
        </form>
      </DialogContent>

      {/* Modal de Criação Rápida de Categoria */}
      <CategoriaModal
        open={modalNovaCategoriaAberta}
        onOpenChange={setModalNovaCategoriaAberta}
        tipoPadrao={
          tipoSelecionado === TipoMovimentacao.RECEITA
            ? TipoCategoria.RECEITA
            : TipoCategoria.DESPESA
        }
        onSubmit={handleCriarNovaCategoria}
        isSubmitting={isCriandoCategoria}
      />

      {/* Modal de Criação Rápida de Subcategoria */}
      <NovaSubcategoriaModal
        open={modalNovaSubcategoriaAberta}
        onOpenChange={setModalNovaSubcategoriaAberta}
        categorias={categorias}
        categoriaIdPadrao={watch("categoria_id") ? Number(watch("categoria_id")) : undefined}
        tipoFiltro={
          tipoSelecionado === TipoMovimentacao.RECEITA
            ? TipoCategoria.RECEITA
            : TipoCategoria.DESPESA
        }
        onSubmit={handleCriarNovaSubcategoria}
        isSubmitting={isCriandoSubcategoria}
      />
    </Dialog>
  );
}
