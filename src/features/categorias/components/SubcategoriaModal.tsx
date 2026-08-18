"use client";

import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Categoria, Subcategoria } from "@/types/categorias";
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
import { FolderTree } from "lucide-react";

const subcategoriaSchema = z.object({
  nome: z.string().min(2, "O nome deve ter pelo menos 2 caracteres"),
  categoria_id: z.number({
    required_error: "Selecione uma categoria pai",
  }),
});

export type SubcategoriaFormData = z.infer<typeof subcategoriaSchema>;

interface SubcategoriaModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  subcategoria?: Subcategoria | null;
  categorias: Categoria[];
  onSubmit: (
    subcategoriaId: number,
    payload: { nome: string; categoria_id: number }
  ) => Promise<void>;
  isSubmitting: boolean;
}

export function SubcategoriaModal({
  open,
  onOpenChange,
  subcategoria,
  categorias,
  onSubmit,
  isSubmitting,
}: SubcategoriaModalProps) {
  const {
    register,
    handleSubmit,
    setValue,
    watch,
    reset,
    setError,
    formState: { errors },
  } = useForm<SubcategoriaFormData>({
    resolver: zodResolver(subcategoriaSchema),
    defaultValues: {
      nome: "",
      categoria_id: undefined,
    },
  });

  const categoriaIdAtual = watch("categoria_id");

  useEffect(() => {
    if (open) {
      if (subcategoria) {
        reset({
          nome: subcategoria.nome,
          categoria_id: subcategoria.categoria_id,
        });
      } else {
        reset({
          nome: "",
          categoria_id: undefined,
        });
      }
    }
  }, [subcategoria, open, reset]);

  const handleFormSubmit = async (data: SubcategoriaFormData) => {
    if (!subcategoria) return;

    try {
      await onSubmit(subcategoria.id, {
        nome: data.nome,
        categoria_id: data.categoria_id,
      });
      onOpenChange(false);
    } catch (err: unknown) {
      if (axios.isAxiosError(err) && err.response?.status === 422) {
        const apiErrors = err.response.data?.errors;
        if (apiErrors) {
          Object.keys(apiErrors).forEach((key) => {
            setError(key as keyof SubcategoriaFormData, {
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

  const categoriaSelecionada = categorias.find(
    (c) => c.id === categoriaIdAtual
  );

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[450px] rounded-[20px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <FolderTree className="h-5 w-5 text-[#1F4E79]" />
            Editar Subcategoria
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-4 py-2">
          {errors.root && (
            <div className="p-3 text-xs font-medium text-red-500 bg-red-50 dark:bg-red-950/30 rounded-lg">
              {errors.root.message}
            </div>
          )}

          {/* Nome da Subcategoria */}
          <div className="space-y-1.5">
            <Label htmlFor="sub_nome">Nome da Subcategoria *</Label>
            <Input
              id="sub_nome"
              placeholder="Ex: Supermercado, Combustível, Farmácia"
              {...register("nome")}
              className="rounded-[10px]"
            />
            {errors.nome && (
              <p className="text-xs text-red-500">{errors.nome.message}</p>
            )}
          </div>

          {/* Categoria Pai (Mover de Categoria) */}
          <div className="space-y-1.5">
            <Label>Categoria Pai *</Label>
            <Select
              value={categoriaIdAtual ? String(categoriaIdAtual) : ""}
              onValueChange={(val) => setValue("categoria_id", Number(val))}
            >
              <SelectTrigger className="rounded-[10px]">
                <SelectValue placeholder="Selecione a categoria pai">
                  {categoriaSelecionada
                    ? `${categoriaSelecionada.nome} (${categoriaSelecionada.tipo_label})`
                    : "Selecione uma categoria"}
                </SelectValue>
              </SelectTrigger>
              <SelectContent className="rounded-xl max-h-60">
                {categorias.map((cat) => (
                  <SelectItem key={cat.id} value={String(cat.id)}>
                    <span className="font-medium">{cat.nome}</span>{" "}
                    <span className="text-xs text-muted-foreground">
                      ({cat.tipo_label})
                    </span>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {errors.categoria_id && (
              <p className="text-xs text-red-500">{errors.categoria_id.message}</p>
            )}
          </div>

          <DialogFooter className="pt-3">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              className="rounded-[10px] cursor-pointer"
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              disabled={isSubmitting}
              className="rounded-[10px] bg-[#1F4E79] hover:bg-[#1F4E79]/90 text-white cursor-pointer"
            >
              {isSubmitting ? "Salvando..." : "Salvar Alterações"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
