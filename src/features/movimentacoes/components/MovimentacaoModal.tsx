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
import { useCategorias } from "@/features/categorias/hooks/useCategorias";
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
    conta_bancaria_id: z.number({ required_error: "Selecione uma conta bancária" }),
    conta_bancaria_destino_id: z.number().nullable().optional(),
    categoria_id: z.number().nullable().optional(),
    subcategoria_id: z.number().nullable().optional(),
    data_movimentacao: z.string().min(1, "Informe a data da movimentação"),
    data_vencimento: z.string().nullable().optional(),
    observacao: z.string().nullable().optional(),
  })
  .refine(
    (data) => {
      if (data.tipo === TipoMovimentacao.TRANSFERENCIA) {
        return Boolean(data.conta_bancaria_destino_id);
      }
      return true;
    },
    {
      message: "Selecione a conta de destino para transferências",
      path: ["conta_bancaria_destino_id"],
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
  onSalvar: (payload: CriarMovimentacaoPayload) => Promise<void>;
  familiaId?: number | null;
}

// ─── Componente ────────────────────────────────────────────────────────────────

export function MovimentacaoModal({
  open,
  onOpenChange,
  movimentacaoParaEditar,
  onSalvar,
  familiaId,
}: MovimentacaoModalProps) {
  const { contas } = useContasBancarias(familiaId);
  const { categorias } = useCategorias(familiaId);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [valorDisplay, setValorDisplay] = useState("");
  const descricaoRef = useRef<HTMLInputElement>(null);

  const hoje = new Date().toISOString().split("T")[0];

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
      categoria_id: null,
      subcategoria_id: null,
      data_movimentacao: hoje,
      data_vencimento: hoje,
      observacao: "",
    },
  });

  const tipoSelecionado = watch("tipo");
  const statusSelecionado = watch("status");
  const contaBancariaIdSelecionada = watch("conta_bancaria_id");

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

  /** Label exibida no trigger do select unificado de categoria. */
  const labelCategoriaSelecionada = useCallback(
    (value: unknown): string | null => {
      if (!value || typeof value !== "string") return null;
      if (value.startsWith("cat:")) {
        const id = parseInt(value.slice(4), 10);
        return categorias.find((c) => Number(c.id) === id)?.nome ?? null;
      }
      if (value.startsWith("sub:")) {
        const id = parseInt(value.slice(4), 10);
        for (const cat of categorias) {
          const sub = cat.subcategorias?.find((s) => Number(s.id) === id);
          if (sub) return `${cat.nome} › ${sub.nome}`;
        }
      }
      return null;
    },
    [categorias]
  );

  // ── Labels dos selects de conta ───────────────────────────────────────────────
  const labelConta = useCallback(
    (value: unknown) => {
      if (!value) return null;
      const found = contas.find((c) => c.id === Number(value));
      return found ? found.nome : null;
    },
    [contas]
  );

  const labelContaDestino = useCallback(
    (value: unknown) => {
      if (!value) return null;
      const found = contas.find(
        (c) => c.id === Number(value) && c.id !== contaBancariaIdSelecionada
      );
      return found ? found.nome : null;
    },
    [contas, contaBancariaIdSelecionada]
  );

  // ── Foco automático na descrição quando o modal abre ─────────────────────────
  useEffect(() => {
    if (open) {
      // Delay para garantir que o modal terminou de animar
      const timer = setTimeout(() => {
        descricaoRef.current?.focus();
      }, 100);
      return () => clearTimeout(timer);
    }
  }, [open]);

  // ── Reset do formulário ao abrir ─────────────────────────────────────────────
  useEffect(() => {
    if (open) {
      if (movimentacaoParaEditar) {
        reset({
          descricao: movimentacaoParaEditar.descricao,
          valor: Number(movimentacaoParaEditar.valor),
          tipo: movimentacaoParaEditar.tipo,
          status: movimentacaoParaEditar.status,
          conta_bancaria_id: movimentacaoParaEditar.conta_bancaria_id,
          conta_bancaria_destino_id: movimentacaoParaEditar.conta_bancaria_destino_id || null,
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
      } else {
        reset({
          descricao: "",
          valor: undefined,
          tipo: TipoMovimentacao.DESPESA,
          status: StatusMovimentacao.PAGO,
          conta_bancaria_id: contas.length > 0 ? contas[0].id : undefined,
          conta_bancaria_destino_id: null,
          categoria_id: null,
          subcategoria_id: null,
          data_movimentacao: hoje,
          data_vencimento: hoje,
          observacao: "",
        });
        setValorDisplay("");
      }
    }
  }, [open, movimentacaoParaEditar, reset, contas, hoje]);

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

          {/* Descrição e Valor */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {/* Descrição */}
            <div className="sm:col-span-2 space-y-1.5">
              <Label className="text-xs font-semibold">Descrição</Label>
              <div className="relative">
                <FileText className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
                <Input
                  placeholder="Ex: Supermercado, Salário, Pix..."
                  {...register("descricao")}
                  ref={(el) => {
                    // Merge refs: react-hook-form ref + nosso ref de foco
                    register("descricao").ref(el);
                    (descricaoRef as React.MutableRefObject<HTMLInputElement | null>).current = el;
                  }}
                  className="pl-9 h-10 rounded-xl bg-background/60 border-border/60"
                />
              </div>
              {errors.descricao && (
                <p className="text-[11px] text-destructive font-medium">{errors.descricao.message}</p>
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
                  "h-10 rounded-xl bg-background/60 border-border/60 font-medium",
                  tipoSelecionado === TipoMovimentacao.RECEITA && valorDisplay && "text-emerald-600",
                  tipoSelecionado === TipoMovimentacao.DESPESA && valorDisplay && "text-red-600"
                )}
              />
              {errors.valor && (
                <p className="text-[11px] text-destructive font-medium">{errors.valor.message}</p>
              )}
            </div>
          </div>

          {/* Contas Bancárias */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {/* Conta de Origem */}
            <div className="space-y-1.5">
              <Label className="text-xs font-semibold">
                {tipoSelecionado === TipoMovimentacao.TRANSFERENCIA ? "Conta de Origem" : "Conta Bancária"}
              </Label>
              <Select
                value={watch("conta_bancaria_id") ?? undefined}
                onValueChange={(val: number | null) =>
                  val !== null && setValue("conta_bancaria_id", val)
                }
              >
                <SelectTrigger className="h-10 rounded-xl bg-background/60 border-border/60 text-xs">
                  <SelectValue placeholder="Selecione a conta">
                    {(value: unknown) => labelConta(value) ?? <span className="text-muted-foreground">Selecione a conta</span>}
                  </SelectValue>
                </SelectTrigger>
                <SelectContent className="rounded-xl">
                  {contas.map((c) => (
                    <SelectItem key={c.id} value={c.id} label={c.nome}>
                      {c.nome}
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

            {/* Conta de Destino (Transferência) */}
            {tipoSelecionado === TipoMovimentacao.TRANSFERENCIA && (
              <div className="space-y-1.5">
                <Label className="text-xs font-semibold">Conta de Destino</Label>
                <Select
                  value={watch("conta_bancaria_destino_id") ?? undefined}
                  onValueChange={(val: number | null) =>
                    setValue("conta_bancaria_destino_id", val)
                  }
                >
                  <SelectTrigger className="h-10 rounded-xl bg-background/60 border-border/60 text-xs">
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
                        <SelectItem key={c.id} value={c.id} label={c.nome}>
                          {c.nome}
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

          {/* Data e Status */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 items-end">
            <div className="space-y-1.5">
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

            {/* Toggle Pago / Pendente */}
            <div className="p-2.5 rounded-xl border border-border/60 bg-muted/20 flex items-center justify-between gap-3">
              <div className="space-y-0.5 min-w-0">
                <p className="text-xs font-semibold truncate">
                  {statusSelecionado === StatusMovimentacao.PAGO
                    ? "Já foi realizada / paga"
                    : "Pendente (A vencer)"}
                </p>
                <p className="text-[10px] text-muted-foreground">
                  {statusSelecionado === StatusMovimentacao.PAGO
                    ? "Impacta o saldo imediatamente"
                    : "Será marcada como pendente"}
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
