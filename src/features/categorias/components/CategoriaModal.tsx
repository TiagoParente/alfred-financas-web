"use client";

import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import {
  Categoria,
  TipoCategoria,
  TipoCategoriaDescricao,
} from "@/types/categorias";
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
import {
  Tag,
  ShoppingBag,
  Utensils,
  Car,
  Home,
  HeartPulse,
  GraduationCap,
  DollarSign,
  Briefcase,
  Gift,
  Plane,
  Tv,
  Smartphone,
  Wrench,
  Shield,
  Zap,
  Coffee,
  Film,
  BookOpen,
  Smile,
} from "lucide-react";

const categoriaSchema = z.object({
  nome: z.string().min(2, "O nome deve ter pelo menos 2 caracteres"),
  tipo: z.nativeEnum(TipoCategoria),
  icone: z.string().optional(),
  cor_hex: z.string().optional(),
});

export type CategoriaFormData = z.infer<typeof categoriaSchema>;

interface CategoriaModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  categoriaEmEdicao?: Categoria | null;
  tipoPadrao?: TipoCategoria;
  onSubmit: (data: CategoriaFormData) => Promise<void>;
  isSubmitting: boolean;
}

const iconeOpcoes = [
  { name: "Tag", icon: Tag },
  { name: "ShoppingBag", icon: ShoppingBag },
  { name: "Utensils", icon: Utensils },
  { name: "Car", icon: Car },
  { name: "Home", icon: Home },
  { name: "HeartPulse", icon: HeartPulse },
  { name: "GraduationCap", icon: GraduationCap },
  { name: "DollarSign", icon: DollarSign },
  { name: "Briefcase", icon: Briefcase },
  { name: "Gift", icon: Gift },
  { name: "Plane", icon: Plane },
  { name: "Tv", icon: Tv },
  { name: "Smartphone", icon: Smartphone },
  { name: "Wrench", icon: Wrench },
  { name: "Shield", icon: Shield },
  { name: "Zap", icon: Zap },
  { name: "Coffee", icon: Coffee },
  { name: "Film", icon: Film },
  { name: "BookOpen", icon: BookOpen },
  { name: "Smile", icon: Smile },
];

const coresPredefinidas = [
  "#1F4E79", // Azul Petróleo (Default)
  "#22C55E", // Verde
  "#EF4444", // Vermelho
  "#F59E0B", // Âmbar
  "#8B5CF6", // Roxo
  "#EC4899", // Rosa
  "#06B6D4", // Ciano
  "#3B82F6", // Azul
  "#64748B", // Slate
  "#14B8A6", // Teal
];

export function CategoriaModal({
  open,
  onOpenChange,
  categoriaEmEdicao,
  tipoPadrao,
  onSubmit,
  isSubmitting,
}: CategoriaModalProps) {
  const {
    register,
    handleSubmit,
    setValue,
    watch,
    reset,
    setError,
    formState: { errors },
  } = useForm<CategoriaFormData>({
    resolver: zodResolver(categoriaSchema),
    defaultValues: {
      nome: "",
      tipo: tipoPadrao || TipoCategoria.DESPESA,
      icone: "Tag",
      cor_hex: "#1F4E79",
    },
  });

  const tipoAtual = watch("tipo");
  const iconeAtual = watch("icone") || "Tag";
  const corHexAtual = watch("cor_hex") || "#1F4E79";

  useEffect(() => {
    if (categoriaEmEdicao) {
      reset({
        nome: categoriaEmEdicao.nome,
        tipo: categoriaEmEdicao.tipo,
        icone: categoriaEmEdicao.icone || "Tag",
        cor_hex: categoriaEmEdicao.cor_hex || "#1F4E79",
      });
    } else {
      reset({
        nome: "",
        tipo: tipoPadrao || TipoCategoria.DESPESA,
        icone: "Tag",
        cor_hex: "#1F4E79",
      });
    }
  }, [categoriaEmEdicao, tipoPadrao, open, reset]);

  const handleFormSubmit = async (data: CategoriaFormData) => {
    try {
      await onSubmit(data);
      onOpenChange(false);
    } catch (err: unknown) {
      if (axios.isAxiosError(err) && err.response?.status === 422) {
        const apiErrors = err.response.data?.errors;
        if (apiErrors) {
          Object.keys(apiErrors).forEach((key) => {
            setError(key as keyof CategoriaFormData, {
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
            {categoriaEmEdicao ? "Editar Categoria" : "Nova Categoria"}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-4 py-2">
          {errors.root && (
            <div className="p-3 text-xs font-medium text-red-500 bg-red-50 dark:bg-red-950/30 rounded-lg">
              {errors.root.message}
            </div>
          )}

          {/* Nome da Categoria */}
          <div className="space-y-1.5">
            <Label htmlFor="nome">Nome da Categoria *</Label>
            <Input
              id="nome"
              placeholder="Ex: Alimentação, Moradia, Salário"
              {...register("nome")}
              className="rounded-[10px]"
            />
            {errors.nome && (
              <p className="text-xs text-red-500">{errors.nome.message}</p>
            )}
          </div>

          {/* Tipo (Receita / Despesa) */}
          <div className="space-y-1.5">
            <Label>Tipo de Categoria *</Label>
            <Select
              value={tipoAtual}
              onValueChange={(val) => setValue("tipo", val as TipoCategoria)}
              disabled={Boolean(categoriaEmEdicao)}
            >
              <SelectTrigger className="rounded-[10px]">
                <SelectValue placeholder="Selecione o tipo">
                  {TipoCategoriaDescricao[tipoAtual]}
                </SelectValue>
              </SelectTrigger>
              <SelectContent className="rounded-xl">
                {Object.entries(TipoCategoriaDescricao).map(([tipo, desc]) => (
                  <SelectItem key={tipo} value={tipo}>
                    {desc}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Seletor de Ícone */}
          <div className="space-y-1.5">
            <Label>Ícone</Label>
            <div className="grid grid-cols-5 sm:grid-cols-10 gap-2 pt-1 max-h-36 overflow-y-auto p-1 border border-border/40 rounded-xl bg-accent/10">
              {iconeOpcoes.map(({ name, icon: IconComponent }) => {
                const isSelected = iconeAtual === name;
                return (
                  <button
                    key={name}
                    type="button"
                    onClick={() => setValue("icone", name)}
                    className={`flex items-center justify-center p-2 rounded-lg transition-all ${
                      isSelected
                        ? "bg-[#1F4E79] text-white shadow-sm scale-105"
                        : "hover:bg-accent text-muted-foreground hover:text-foreground"
                    }`}
                  >
                    <IconComponent className="h-4 w-4" />
                  </button>
                );
              })}
            </div>
          </div>

          {/* Seletor de Cor */}
          <div className="space-y-1.5">
            <Label>Cor da Categoria</Label>
            <div className="flex flex-wrap items-center gap-2 pt-1">
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
              {isSubmitting
                ? "Salvando..."
                : categoriaEmEdicao
                ? "Atualizar Categoria"
                : "Criar Categoria"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
