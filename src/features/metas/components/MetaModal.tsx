"use client";

import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Meta, StatusMeta } from "@/types/metas";
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
import {
  Target,
  PiggyBank,
  Home,
  Car,
  Plane,
  GraduationCap,
  Laptop,
  HeartPulse,
  Sparkles,
} from "lucide-react";
import { cn } from "@/lib/utils";

const metaSchema = z.object({
  nome: z.string().min(1, "Informe o nome da meta"),
  valor_alvo: z
    .string()
    .min(1, "Informe o valor alvo")
    .refine((val) => !isNaN(Number(val)) && Number(val) > 0, "O valor deve ser maior que zero"),
  valor_atual: z
    .string()
    .optional()
    .refine((val) => !val || (!isNaN(Number(val)) && Number(val) >= 0), "O valor deve ser maior ou igual a zero"),
  descricao: z.string().optional(),
  data_limite: z.string().optional(),
  cor_hex: z.string().optional(),
  icone: z.string().optional(),
  status: z.nativeEnum(StatusMeta).optional(),
});

type MetaFormData = z.infer<typeof metaSchema>;

interface MetaModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  metaEmEdicao?: Meta | null;
  onSubmit: (data: MetaFormData) => Promise<void>;
  isSubmitting?: boolean;
}

const coresPresets = [
  "#1F4E79", // Azul Petróleo (Default)
  "#22C55E", // Verde
  "#3B82F6", // Azul
  "#8B5CF6", // Roxo
  "#EC4899", // Rosa
  "#F59E0B", // Âmbar
  "#10B981", // Esmeralda
  "#6366F1", // Índigo
];

const iconesDisponiveis = [
  { id: "target", label: "Alvo", icon: Target },
  { id: "piggy", label: "Cofre", icon: PiggyBank },
  { id: "home", label: "Casa", icon: Home },
  { id: "car", label: "Carro", icon: Car },
  { id: "plane", label: "Viagem", icon: Plane },
  { id: "graduation", label: "Estudos", icon: GraduationCap },
  { id: "laptop", label: "Tecnologia", icon: Laptop },
  { id: "heart", label: "Saúde", icon: HeartPulse },
  { id: "sparkles", label: "Sonho", icon: Sparkles },
];

export function MetaModal({
  open,
  onOpenChange,
  metaEmEdicao,
  onSubmit,
  isSubmitting = false,
}: MetaModalProps) {
  const isEditing = Boolean(metaEmEdicao);

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    reset,
    setError,
    formState: { errors },
  } = useForm<MetaFormData>({
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    resolver: zodResolver(metaSchema) as any,
    defaultValues: {
      nome: "",
      valor_alvo: "",
      valor_atual: "0",
      descricao: "",
      data_limite: "",
      cor_hex: "#1F4E79",
      icone: "target",
      status: StatusMeta.EM_ANDAMENTO,
    },
  });

  const corSelecionada = watch("cor_hex") || "#1F4E79";
  const iconeSelecionado = watch("icone") || "target";

  useEffect(() => {
    if (metaEmEdicao) {
      reset({
        nome: metaEmEdicao.nome,
        valor_alvo: metaEmEdicao.valor_alvo.toString(),
        valor_atual: metaEmEdicao.valor_atual.toString(),
        descricao: metaEmEdicao.descricao || "",
        data_limite: metaEmEdicao.data_limite || "",
        cor_hex: metaEmEdicao.cor_hex || "#1F4E79",
        icone: metaEmEdicao.icone || "target",
        status: metaEmEdicao.status,
      });
    } else {
      reset({
        nome: "",
        valor_alvo: "",
        valor_atual: "0",
        descricao: "",
        data_limite: "",
        cor_hex: "#1F4E79",
        icone: "target",
        status: StatusMeta.EM_ANDAMENTO,
      });
    }
  }, [metaEmEdicao, reset, open]);

  const handleFormSubmit = async (data: MetaFormData) => {
    try {
      await onSubmit(data);
      onOpenChange(false);
    } catch (err: unknown) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const errorData = (err as any)?.response?.data;
      if (errorData?.errors) {
        Object.entries(errorData.errors).forEach(([field, messages]) => {
          if (Array.isArray(messages) && messages.length > 0) {
            setError(field as keyof MetaFormData, {
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
      <DialogContent className="sm:max-w-[540px] rounded-[20px] p-6">
        <DialogHeader className="space-y-1">
          <DialogTitle className="text-xl font-bold text-foreground">
            {isEditing ? "Editar Meta Financeira" : "Nova Meta Financeira"}
          </DialogTitle>
          <DialogDescription className="text-xs text-muted-foreground">
            {isEditing
              ? "Atualize as informações do seu objetivo financeiro"
              : "Cadastre um novo objetivo para planejar seus aportes e economias"}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-5 mt-4">
          {/* Nome da Meta */}
          <div className="space-y-1.5">
            <Label htmlFor="nome" className="text-xs font-semibold text-foreground">
              Nome da Meta *
            </Label>
            <Input
              id="nome"
              placeholder="Ex: Viagem de Férias, Reserva de Emergência"
              {...register("nome")}
              className="rounded-[10px] text-sm"
            />
            {errors.nome && (
              <p className="text-xs text-red-500 font-medium">{errors.nome.message}</p>
            )}
          </div>

          {/* Valores: Alvo e Inicial */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label htmlFor="valor_alvo" className="text-xs font-semibold text-foreground">
                Valor Alvo (R$) *
              </Label>
              <Input
                id="valor_alvo"
                type="number"
                step="0.01"
                placeholder="10000.00"
                {...register("valor_alvo")}
                className="rounded-[10px] text-sm font-semibold"
              />
              {errors.valor_alvo && (
                <p className="text-xs text-red-500 font-medium">{errors.valor_alvo.message}</p>
              )}
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="valor_atual" className="text-xs font-semibold text-foreground">
                Valor Inicial Acumulado (R$)
              </Label>
              <Input
                id="valor_atual"
                type="number"
                step="0.01"
                placeholder="0.00"
                {...register("valor_atual")}
                className="rounded-[10px] text-sm"
              />
              {errors.valor_atual && (
                <p className="text-xs text-red-500 font-medium">{errors.valor_atual.message}</p>
              )}
            </div>
          </div>

          {/* Data Limite & Status */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label htmlFor="data_limite" className="text-xs font-semibold text-foreground">
                Data Limite (Prazo Opcional)
              </Label>
              <Input
                id="data_limite"
                type="date"
                {...register("data_limite")}
                className="rounded-[10px] text-sm"
              />
            </div>

            {isEditing && (
              <div className="space-y-1.5">
                <Label htmlFor="status" className="text-xs font-semibold text-foreground">
                  Status da Meta
                </Label>
                <Select
                  value={watch("status")}
                  onValueChange={(val) => setValue("status", val as StatusMeta)}
                >
                  <SelectTrigger className="rounded-[10px] text-sm">
                    <SelectValue placeholder="Selecione o status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value={StatusMeta.EM_ANDAMENTO}>Em Andamento</SelectItem>
                    <SelectItem value={StatusMeta.CONCLUIDA}>Concluída</SelectItem>
                    <SelectItem value={StatusMeta.CANCELADA}>Cancelada</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            )}
          </div>

          {/* Escolha do Ícone */}
          <div className="space-y-1.5">
            <Label className="text-xs font-semibold text-foreground">
              Ícone Representativo
            </Label>
            <div className="flex flex-wrap gap-2 pt-1">
              {iconesDisponiveis.map((item) => {
                const IconeComp = item.icon;
                const isSelected = iconeSelecionado === item.id;
                return (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => setValue("icone", item.id)}
                    className={cn(
                      "flex h-9 w-9 items-center justify-center rounded-xl border border-border/60 transition-all hover:bg-accent",
                      isSelected && "border-[#1F4E79] bg-[#1F4E79]/10 text-[#1F4E79] ring-2 ring-[#1F4E79]/30"
                    )}
                    title={item.label}
                  >
                    <IconeComp className="h-4 w-4" />
                  </button>
                );
              })}
            </div>
          </div>

          {/* Escolha da Cor Hex */}
          <div className="space-y-1.5">
            <Label className="text-xs font-semibold text-foreground">
              Cor do Card
            </Label>
            <div className="flex flex-wrap items-center gap-2 pt-1">
              {coresPresets.map((hex) => (
                <button
                  key={hex}
                  type="button"
                  onClick={() => setValue("cor_hex", hex)}
                  className={cn(
                    "h-7 w-7 rounded-full transition-transform hover:scale-110",
                    corSelecionada === hex && "ring-2 ring-offset-2 ring-[#1F4E79] scale-110"
                  )}
                  style={{ backgroundColor: hex }}
                />
              ))}
            </div>
          </div>

          {/* Descrição / Observações */}
          <div className="space-y-1.5">
            <Label htmlFor="descricao" className="text-xs font-semibold text-foreground">
              Descrição ou Notas (Opcional)
            </Label>
            <Input
              id="descricao"
              placeholder="Ex: Meta para juntar dinheiro até a viagem de dezembro"
              {...register("descricao")}
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
              disabled={isSubmitting}
              className="rounded-[10px] bg-[#1F4E79] hover:bg-[#1F4E79]/90 text-white font-medium text-xs px-5 shadow-sm"
            >
              {isSubmitting ? "Salvar..." : isEditing ? "Atualizar Meta" : "Criar Meta"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
