"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { AxiosError } from "axios";
import {
  ArrowDownLeft,
  ArrowUpRight,
  ArrowLeftRight,
  Loader2,
  Calendar,
  FileText,
  CreditCard as CreditCardIcon,
  Landmark,
  HelpCircle,
  Sparkles,
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
import { Switch } from "@/components/ui/switch";
import { ComboboxCategoria } from "./ComboboxCategoria";
import {
  CriarMovimentacaoPayload,
  Movimentacao,
  StatusMovimentacao,
  TipoMovimentacao,
} from "@/types/movimentacoes";
import { useContasBancarias } from "@/features/contas_bancarias/hooks/useContasBancarias";
import { useCartoes } from "@/features/cartoes/hooks/useCartoes";
import { useCategorias } from "@/features/categorias/hooks/useCategorias";
import { ContaBancaria } from "@/types/contas";
import { CartaoCredito } from "@/types/cartoes";
import { cn } from "@/lib/utils";

// ─── Helpers de formatação de moeda ───────────────────────────────────────────

/** Converte string formatada ("1.234,56") → número (1234.56) */
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

const movimentacaoSchema = z
  .object({
    descricao: z.string().min(2, "A descrição deve ter pelo menos 2 caracteres"),
    valor: z
      .number({ invalid_type_error: "Informe um valor válido" })
      .positive("O valor deve ser maior que zero"),
    tipo: z.nativeEnum(TipoMovimentacao),
    status: z.nativeEnum(StatusMovimentacao),
    conta_bancaria_id: z.number().nullable().optional(),
    conta_bancaria_destino_id: z.number().nullable().optional(),
    cartao_credito_id: z.number().nullable().optional(),
    categoria_id: z.number().nullable().optional(),
    subcategoria_id: z.number().nullable().optional(),
    data_movimentacao: z.string().min(1, "Informe a data da movimentação"),
    data_vencimento: z.string().nullable().optional(),
    observacao: z.string().nullable().optional(),
  })
  .refine(
    (data) => {
      if (data.tipo === TipoMovimentacao.DESPESA) {
        return Boolean(data.conta_bancaria_id || data.cartao_credito_id);
      }
      if (data.tipo === TipoMovimentacao.RECEITA) {
        return Boolean(data.conta_bancaria_id);
      }
      if (data.tipo === TipoMovimentacao.TRANSFERENCIA) {
        return Boolean(data.conta_bancaria_id && data.conta_bancaria_destino_id);
      }
      return true;
    },
    {
      message: "Selecione uma conta bancária ou cartão de crédito",
      path: ["conta_bancaria_id"],
    }
  )
  .refine(
    (data) => {
      if (
        data.tipo === TipoMovimentacao.TRANSFERENCIA &&
        data.conta_bancaria_destino_id === data.conta_bancaria_id
      ) {
        return false;
      }
      return true;
    },
    {
      message: "A conta de destino deve ser diferente da conta de origem",
      path: ["conta_bancaria_destino_id"],
    }
  )
  .refine(
    (data) => {
      if (data.tipo !== TipoMovimentacao.TRANSFERENCIA) {
        return Boolean(data.categoria_id);
      }
      return true;
    },
    {
      message: "Selecione uma categoria",
      path: ["categoria_id"],
    }
  );

type MovimentacaoFormData = z.infer<typeof movimentacaoSchema>;

// ─── Props ─────────────────────────────────────────────────────────────────────

interface MovimentacaoModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  movimentacaoParaEditar?: Movimentacao | null;
  cartaoCreditoIdPadrao?: number | null;
  contaBancariaIdPadrao?: number | null;
  onSalvar: (payload: CriarMovimentacaoPayload) => Promise<void>;
  familiaId?: number | null;
}

// ─── Componente ────────────────────────────────────────────────────────────────

export function MovimentacaoModal({
  open,
  onOpenChange,
  movimentacaoParaEditar,
  cartaoCreditoIdPadrao,
  contaBancariaIdPadrao,
  onSalvar,
  familiaId,
}: MovimentacaoModalProps) {
  const { contas } = useContasBancarias(familiaId);
  const { cartoes } = useCartoes(familiaId);
  const { categorias } = useCategorias(familiaId);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [origemPagamento, setOrigemPagamento] = useState<"conta" | "cartao">("conta");
  const [valorDisplay, setValorDisplay] = useState("");
  const [showInfoStatus, setShowInfoStatus] = useState(false);
  const descricaoRef = useRef<HTMLInputElement>(null);

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    reset,
    setError,
    formState: { errors },
  } = useForm<MovimentacaoFormData>({
    resolver: zodResolver(movimentacaoSchema),
    defaultValues: {
      descricao: "",
      valor: undefined,
      tipo: TipoMovimentacao.DESPESA,
      status: StatusMovimentacao.PAGO,
      conta_bancaria_id: undefined,
      conta_bancaria_destino_id: null,
      cartao_credito_id: null,
      categoria_id: null,
      subcategoria_id: null,
      data_movimentacao: "",
      data_vencimento: "",
      observacao: "",
    },
  });

  const tipoSelecionado = watch("tipo");
  const statusSelecionado = watch("status");
  const contaBancariaIdSelecionada = watch("conta_bancaria_id");
  const cartaoCreditoIdSelecionado = watch("cartao_credito_id");

  // ── Categorias filtradas por tipo ────────────────────────────────────────────
  const categoriasFiltradas = categorias.filter((cat) => {
    if (tipoSelecionado === TipoMovimentacao.RECEITA) return cat.tipo === "receita";
    if (tipoSelecionado === TipoMovimentacao.DESPESA) return cat.tipo === "despesa";
    return true;
  });

  /**
   * Valor codificado do select unificado de categoria/subcategoria.
   * Formato: "cat:ID" para categorias raiz ou "sub:ID" para subcategorias.
   */
  const valorCategoriaSelecionada = (() => {
    const subId = watch("subcategoria_id");
    const catId = watch("categoria_id");
    if (subId) return `sub:${subId}`;
    if (catId) return `cat:${catId}`;
    return undefined;
  })();

  /** Decodifica a seleção e atualiza categoria_id / subcategoria_id no form. */
  const handleCategoriaChange = useCallback(
    (valor: string | null) => {
      if (!valor) {
        setValue("categoria_id", null, { shouldValidate: true });
        setValue("subcategoria_id", null, { shouldValidate: true });
        return;
      }
      if (valor.startsWith("cat:")) {
        const catId = parseInt(valor.slice(4), 10);
        setValue("categoria_id", catId, { shouldValidate: true });
        setValue("subcategoria_id", null, { shouldValidate: true });
      } else if (valor.startsWith("sub:")) {
        const subId = parseInt(valor.slice(4), 10);
        let parentCatId: number | null = null;
        for (const cat of categorias) {
          const sub = cat.subcategorias?.find((s) => Number(s.id) === subId);
          if (sub) {
            parentCatId = Number(sub.categoria_id || cat.id);
            break;
          }
        }
        setValue("subcategoria_id", subId, { shouldValidate: true });
        setValue("categoria_id", parentCatId, { shouldValidate: true });
      }
    },
    [categorias, setValue]
  );

  // ── Renderização com imagem do banco / ícone dos selects ──────────────────────
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

  // ── Labels dos selects de conta/cartão ───────────────────────────────────────
  const labelConta = useCallback(
    (value: unknown) => {
      if (!value) return null;
      const found = contas.find((c) => c.id === Number(value));
      return found ? renderContaOption(found) : null;
    },
    [contas, renderContaOption]
  );

  const labelCartao = useCallback(
    (value: unknown) => {
      if (!value) return null;
      const found = cartoes.find((c) => c.id === Number(value));
      return found ? renderCartaoOption(found) : null;
    },
    [cartoes, renderCartaoOption]
  );

  const labelContaDestino = useCallback(
    (value: unknown) => {
      if (!value) return null;
      const found = contas.find(
        (c) => c.id === Number(value) && c.id !== contaBancariaIdSelecionada
      );
      return found ? renderContaOption(found) : null;
    },
    [contas, contaBancariaIdSelecionada, renderContaOption]
  );

  // ── Foco automático na descrição quando o modal abre ─────────────────────────
  useEffect(() => {
    if (open) {
      const timer = setTimeout(() => {
        descricaoRef.current?.focus();
      }, 100);
      return () => clearTimeout(timer);
    }
  }, [open]);

  // ── Reset do formulário ao abrir ─────────────────────────────────────────────
  useEffect(() => {
    if (open) {
      const hoje = new Date().toISOString().split("T")[0];
      if (movimentacaoParaEditar) {
        const usaCartao = Boolean(movimentacaoParaEditar.cartao_credito_id);
        setOrigemPagamento(usaCartao ? "cartao" : "conta");
        reset({
          descricao: movimentacaoParaEditar.descricao,
          valor: Number(movimentacaoParaEditar.valor),
          tipo: movimentacaoParaEditar.tipo,
          status: movimentacaoParaEditar.status,
          conta_bancaria_id: movimentacaoParaEditar.conta_bancaria_id || null,
          conta_bancaria_destino_id: movimentacaoParaEditar.conta_bancaria_destino_id || null,
          cartao_credito_id: movimentacaoParaEditar.cartao_credito_id || null,
          categoria_id: movimentacaoParaEditar.categoria_id || null,
          subcategoria_id: movimentacaoParaEditar.subcategoria_id || null,
          data_movimentacao: movimentacaoParaEditar.data_movimentacao,
          data_vencimento:
            movimentacaoParaEditar.data_vencimento || movimentacaoParaEditar.data_movimentacao,
          observacao: movimentacaoParaEditar.observacao || "",
        });
        setValorDisplay(
          movimentacaoParaEditar.valor > 0
            ? formatarMoedaMascara(Number(movimentacaoParaEditar.valor))
            : ""
        );
      } else if (cartaoCreditoIdPadrao) {
        setOrigemPagamento("cartao");
        reset({
          descricao: "",
          valor: undefined,
          tipo: TipoMovimentacao.DESPESA,
          status: StatusMovimentacao.PENDENTE,
          conta_bancaria_id: null,
          conta_bancaria_destino_id: null,
          cartao_credito_id: cartaoCreditoIdPadrao,
          categoria_id: null,
          subcategoria_id: null,
          data_movimentacao: hoje,
          data_vencimento: hoje,
          observacao: "",
        });
        setValorDisplay("");
      } else if (contaBancariaIdPadrao) {
        setOrigemPagamento("conta");
        reset({
          descricao: "",
          valor: undefined,
          tipo: TipoMovimentacao.DESPESA,
          status: StatusMovimentacao.PAGO,
          conta_bancaria_id: contaBancariaIdPadrao,
          conta_bancaria_destino_id: null,
          cartao_credito_id: null,
          categoria_id: null,
          subcategoria_id: null,
          data_movimentacao: hoje,
          data_vencimento: hoje,
          observacao: "",
        });
        setValorDisplay("");
      } else {
        setOrigemPagamento("conta");
        reset({
          descricao: "",
          valor: undefined,
          tipo: TipoMovimentacao.DESPESA,
          status: StatusMovimentacao.PAGO,
          conta_bancaria_id: contas.length > 0 ? contas[0].id : null,
          conta_bancaria_destino_id: null,
          cartao_credito_id: null,
          categoria_id: null,
          subcategoria_id: null,
          data_movimentacao: hoje,
          data_vencimento: hoje,
          observacao: "",
        });
        setValorDisplay("");
      }
    }
  }, [
    open,
    movimentacaoParaEditar,
    cartaoCreditoIdPadrao,
    contaBancariaIdPadrao,
    reset,
    contas,
    cartoes,
  ]);

  // Alternar Origem de Pagamento
  const handleTrocarOrigemPagamento = (origem: "conta" | "cartao") => {
    setOrigemPagamento(origem);
    if (origem === "cartao") {
      setValue("conta_bancaria_id", null);
      if (cartoes.length > 0) {
        setValue("cartao_credito_id", cartoes[0].id);
      }
      setValue("status", StatusMovimentacao.PENDENTE);
    } else {
      setValue("cartao_credito_id", null);
      if (contas.length > 0) {
        setValue("conta_bancaria_id", contas[0].id);
      }
      setValue("status", StatusMovimentacao.PAGO);
    }
  };

  // ── Submit ────────────────────────────────────────────────────────────────────
  const onSubmit = async (data: MovimentacaoFormData) => {
    try {
      setIsSubmitting(true);
      await onSalvar(data as CriarMovimentacaoPayload);
      onOpenChange(false);
    } catch (err: unknown) {
      if (err instanceof AxiosError && err.response?.status === 422) {
        const backendErrors = err.response.data?.errors;
        if (backendErrors && typeof backendErrors === "object") {
          Object.entries(backendErrors).forEach(([field, messages]) => {
            if (Array.isArray(messages) && messages.length > 0) {
              setError(field as keyof MovimentacaoFormData, {
                type: "manual",
                message: messages[0] as string,
              });
            }
          });
        }
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  // ─── Render ──────────────────────────────────────────────────────────────────
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[580px] rounded-3xl p-6 border-border/60 bg-card max-h-[92vh] overflow-y-auto">
        <DialogHeader className="space-y-1">
          <DialogTitle className="text-xl font-bold">
            {movimentacaoParaEditar ? "Editar Movimentação" : "Nova Movimentação"}
          </DialogTitle>
          <DialogDescription className="text-sm text-muted-foreground">
            {movimentacaoParaEditar
              ? "Altere os dados da movimentação abaixo."
              : "Preencha as informações da receita, despesa ou transferência."}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-5 pt-3">
          {/* Tipo: Receita | Despesa | Transferência */}
          <div className="grid grid-cols-3 gap-2 p-1 rounded-2xl bg-muted/50 border border-border/40">
            {(
              [
                { value: TipoMovimentacao.RECEITA, label: "Receita", icon: ArrowDownLeft, cor: "bg-emerald-500" },
                { value: TipoMovimentacao.DESPESA, label: "Despesa", icon: ArrowUpRight, cor: "bg-red-500" },
                { value: TipoMovimentacao.TRANSFERENCIA, label: "Transferência", icon: ArrowLeftRight, cor: "bg-[#1F4E79]" },
              ] as const
            ).map(({ value, label, icon: Icone, cor }) => (
              <button
                key={value}
                type="button"
                onClick={() => {
                  setValue("tipo", value);
                  setValue("categoria_id", null);
                  setValue("subcategoria_id", null);
                  setValue("conta_bancaria_destino_id", null);
                  if (value !== TipoMovimentacao.DESPESA) {
                    setOrigemPagamento("conta");
                    setValue("cartao_credito_id", null);
                    if (contas.length > 0) setValue("conta_bancaria_id", contas[0].id);
                  }
                }}
                className={cn(
                  "flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl text-xs font-semibold transition-all cursor-pointer",
                  tipoSelecionado === value
                    ? `${cor} text-white shadow-sm`
                    : "text-muted-foreground hover:text-foreground"
                )}
              >
                <Icone className="h-4 w-4" />
                <span>{label}</span>
              </button>
            ))}
          </div>

          {/* Se for DESPESA: Selector da Origem do Lançamento (Conta Bancária vs Cartão de Crédito) */}
          {tipoSelecionado === TipoMovimentacao.DESPESA && cartoes.length > 0 && (
            <div className="space-y-1.5">
              <Label className="text-xs font-semibold">Forma de Lançamento / Origem</Label>
              <div className="grid grid-cols-2 gap-2 p-1 rounded-xl bg-muted/30 border border-border/40">
                <button
                  type="button"
                  onClick={() => handleTrocarOrigemPagamento("conta")}
                  className={cn(
                    "flex items-center justify-center gap-2 py-2 px-3 rounded-lg text-xs font-medium transition-all cursor-pointer",
                    origemPagamento === "conta"
                      ? "bg-background text-foreground shadow-2xs font-semibold"
                      : "text-muted-foreground hover:text-foreground"
                  )}
                >
                  <Landmark className="h-3.5 w-3.5" />
                  <span>Conta Bancária (Débito/Pix)</span>
                </button>

                <button
                  type="button"
                  onClick={() => handleTrocarOrigemPagamento("cartao")}
                  className={cn(
                    "flex items-center justify-center gap-2 py-2 px-3 rounded-lg text-xs font-medium transition-all cursor-pointer",
                    origemPagamento === "cartao"
                      ? "bg-background text-foreground shadow-2xs font-semibold"
                      : "text-muted-foreground hover:text-foreground"
                  )}
                >
                  <CreditCardIcon className="h-3.5 w-3.5 text-amber-500" />
                  <span>Cartão de Crédito (Fatura)</span>
                </button>
              </div>
            </div>
          )}

          {/* Primeira Linha: Data e Descrição */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {/* Data da Movimentação */}
            <div className="space-y-1.5 sm:col-span-1">
              <Label className="text-xs font-semibold">Data da Movimentação</Label>
              <div className="relative">
                <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
                <Input
                  type="date"
                  {...register("data_movimentacao")}
                  className="pl-9 h-10 rounded-xl bg-background/60 border-border/60 text-xs"
                />
              </div>
              {errors.data_movimentacao && (
                <p className="text-[11px] text-destructive font-medium">
                  {errors.data_movimentacao.message}
                </p>
              )}
            </div>

            {/* Descrição */}
            <div className="sm:col-span-2 space-y-1.5">
              <Label className="text-xs font-semibold">Descrição</Label>
              <div className="relative">
                <FileText className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
                <Input
                  placeholder="Ex: Supermercado, Salário, Pix..."
                  {...register("descricao")}
                  ref={(el) => {
                    register("descricao").ref(el);
                    (descricaoRef as React.MutableRefObject<HTMLInputElement | null>).current = el;
                  }}
                  className="pl-9 h-10 rounded-xl bg-background/60 border-border/60 text-xs"
                />
              </div>
              {errors.descricao && (
                <p className="text-[11px] text-destructive font-medium">{errors.descricao.message}</p>
              )}
            </div>
          </div>

          {/* Seleção de Conta ou Cartão de Crédito */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {/* Seleção se Origem for Cartão de Crédito */}
            {tipoSelecionado === TipoMovimentacao.DESPESA && origemPagamento === "cartao" ? (
              <div className="space-y-1.5">
                <Label className="text-xs font-semibold">Cartão de Crédito *</Label>
                <Select
                  value={cartaoCreditoIdSelecionado ? String(cartaoCreditoIdSelecionado) : undefined}
                  onValueChange={(val) =>
                    setValue("cartao_credito_id", val ? Number(val) : null)
                  }
                >
                  <SelectTrigger className="h-10 data-[size=default]:h-10 rounded-xl bg-background/60 border-border/60 text-xs">
                    <SelectValue placeholder="Selecione o cartão">
                      {(value: unknown) => labelCartao(value) ?? <span className="text-muted-foreground">Selecione o cartão</span>}
                    </SelectValue>
                  </SelectTrigger>
                  <SelectContent className="rounded-xl">
                    {cartoes.map((c) => (
                      <SelectItem key={c.id} value={String(c.id)} label={c.nome}>
                        {renderCartaoOption(c)}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {errors.cartao_credito_id && (
                  <p className="text-[11px] text-destructive font-medium">
                    {errors.cartao_credito_id.message}
                  </p>
                )}
              </div>
            ) : (
              /* Seleção de Conta de Origem */
              <div className="space-y-1.5">
                <Label className="text-xs font-semibold">
                  {tipoSelecionado === TipoMovimentacao.TRANSFERENCIA ? "Conta de Origem" : "Conta Bancária"}
                </Label>
                <Select
                  value={watch("conta_bancaria_id") ? String(watch("conta_bancaria_id")) : undefined}
                  onValueChange={(val) =>
                    setValue("conta_bancaria_id", val ? Number(val) : null)
                  }
                >
                  <SelectTrigger className="h-10 data-[size=default]:h-10 rounded-xl bg-background/60 border-border/60 text-xs">
                    <SelectValue placeholder="Selecione a conta">
                      {(value: unknown) => labelConta(value) ?? <span className="text-muted-foreground">Selecione a conta</span>}
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
                {errors.conta_bancaria_id && (
                  <p className="text-[11px] text-destructive font-medium">
                    {errors.conta_bancaria_id.message}
                  </p>
                )}
              </div>
            )}

            {/* Conta de Destino (Transferência) */}
            {tipoSelecionado === TipoMovimentacao.TRANSFERENCIA && (
              <div className="space-y-1.5">
                <Label className="text-xs font-semibold">Conta de Destino</Label>
                <Select
                  value={watch("conta_bancaria_destino_id") ? String(watch("conta_bancaria_destino_id")) : undefined}
                  onValueChange={(val) =>
                    setValue("conta_bancaria_destino_id", val ? Number(val) : null)
                  }
                >
                  <SelectTrigger className="h-10 data-[size=default]:h-10 rounded-xl bg-background/60 border-border/60 text-xs">
                    <SelectValue placeholder="Selecione o destino">
                      {(value: unknown) =>
                        labelContaDestino(value) ?? <span className="text-muted-foreground">Selecione o destino</span>
                      }
                    </SelectValue>
                  </SelectTrigger>
                  <SelectContent className="rounded-xl">
                    {contas
                      .filter((c) => c.id !== contaBancariaIdSelecionada)
                      .map((c) => (
                        <SelectItem key={c.id} value={String(c.id)} label={c.nome}>
                          {renderContaOption(c)}
                        </SelectItem>
                      ))}
                  </SelectContent>
                </Select>
                {errors.conta_bancaria_destino_id && (
                  <p className="text-[11px] text-destructive font-medium">
                    {errors.conta_bancaria_destino_id.message}
                  </p>
                )}
              </div>
            )}

            {/* Combobox com busca de Categoria / Subcategoria */}
            {tipoSelecionado !== TipoMovimentacao.TRANSFERENCIA && (
              <div className="space-y-1.5">
                <Label className="text-xs font-semibold">Categoria</Label>
                <ComboboxCategoria
                  categorias={categoriasFiltradas}
                  valorSelecionado={valorCategoriaSelecionada}
                  onChange={(val) => handleCategoriaChange(val)}
                  placeholder="Buscar categoria..."
                  hasError={Boolean(errors.categoria_id)}
                />
                {errors.categoria_id && (
                  <p className="text-[11px] text-destructive font-medium">
                    {errors.categoria_id.message}
                  </p>
                )}
              </div>
            )}
          </div>

          {/* Valor com Máscara BRL */}
          <div className="space-y-1.5">
            <Label className="text-xs font-semibold">Valor</Label>
            <Input
              type="text"
              inputMode="numeric"
              placeholder="R$ 0,00"
              value={valorDisplay}
              onChange={(e) => {
                const mascarado = aplicarMascaraMoeda(e.target.value);
                setValorDisplay(mascarado);
                setValue("valor", mascarado ? parseMoeda(mascarado) : 0);
              }}
              className={cn(
                "h-10 rounded-xl bg-background/60 border-border/60 font-medium text-xs",
                tipoSelecionado === TipoMovimentacao.RECEITA && valorDisplay && "text-emerald-600 font-semibold",
                tipoSelecionado === TipoMovimentacao.DESPESA && valorDisplay && "text-red-600 font-semibold"
              )}
            />
            {errors.valor && (
              <p className="text-[11px] text-destructive font-medium">{errors.valor.message}</p>
            )}
          </div>

          {/* Status da Movimentação */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <Label className="text-xs font-semibold">Status da Movimentação</Label>
              {tipoSelecionado === TipoMovimentacao.DESPESA && origemPagamento === "cartao" && (
                <button
                  type="button"
                  onClick={() => setShowInfoStatus((prev) => !prev)}
                  className="inline-flex items-center gap-1 text-[11px] text-[#1F4E79] hover:underline font-medium cursor-pointer"
                >
                  <HelpCircle className="h-3.5 w-3.5" />
                  <span>Como funciona no cartão?</span>
                </button>
              )}
            </div>

            <div className="p-2.5 rounded-xl border border-border/60 bg-muted/20 flex items-center justify-between gap-3">
              <div className="space-y-0.5 min-w-0">
                <p className="text-xs font-semibold truncate">
                  {statusSelecionado === StatusMovimentacao.PAGO
                    ? "Já foi realizada / paga"
                    : "Pendente (Na Fatura / A Vencer)"}
                </p>
                <p className="text-[10px] text-muted-foreground">
                  {tipoSelecionado === TipoMovimentacao.DESPESA && origemPagamento === "cartao"
                    ? statusSelecionado === StatusMovimentacao.PAGO
                      ? "Para lançamentos retroativos de faturas já quitadas"
                      : "Acumula na fatura em aberto (sem débito em conta agora)"
                    : statusSelecionado === StatusMovimentacao.PAGO
                    ? "Impacta o saldo da conta imediatamente"
                    : "Agendado / Entrará no relatório de pendências"}
                </p>
              </div>
              <Switch
                checked={statusSelecionado === StatusMovimentacao.PAGO}
                onCheckedChange={(checked) =>
                  setValue(
                    "status",
                    checked ? StatusMovimentacao.PAGO : StatusMovimentacao.PENDENTE
                  )
                }
              />
            </div>

            {/* Card Explicativo (Alfred Insight) */}
            {showInfoStatus && tipoSelecionado === TipoMovimentacao.DESPESA && origemPagamento === "cartao" && (
              <div className="p-3.5 rounded-2xl bg-accent/40 border border-border/60 space-y-2 text-xs text-muted-foreground animate-in fade-in duration-200">
                <div className="flex items-center gap-1.5 text-[#1F4E79] font-semibold text-xs">
                  <Sparkles className="h-4 w-4" />
                  <span>Entenda o status no Cartão de Crédito</span>
                </div>
                <div className="space-y-1.5 text-[11px] leading-relaxed">
                  <p>
                    <strong className="text-foreground font-semibold">• Pendente (Padrão):</strong> A compra é registrada na <strong>fatura aberta</strong> do cartão. Não reduz o saldo da sua conta bancária agora e entra na previsão de contas a pagar.
                  </p>
                  <p>
                    <strong className="text-foreground font-semibold">• Pago:</strong> Use apenas se estiver lançando uma compra <strong>retroativa de uma fatura que você já pagou no passado</strong>, garantindo que o histórico fique correto sem gerar pendências acumuladas.
                  </p>
                </div>
              </div>
            )}
          </div>

          {/* Observação */}
          <div className="space-y-1.5">
            <Label className="text-xs font-semibold">
              Observações{" "}
              <span className="font-normal text-muted-foreground">(Opcional)</span>
            </Label>
            <Input
              placeholder="Anotações adicionais..."
              {...register("observacao")}
              className="h-10 rounded-xl bg-background/60 border-border/60 text-xs"
            />
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
              className="bg-[#1F4E79] hover:bg-[#153654] text-white rounded-xl shadow-md min-w-[120px]"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                  <span>Salvando...</span>
                </>
              ) : (
                <span>{movimentacaoParaEditar ? "Salvar Alterações" : "Registrar"}</span>
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
