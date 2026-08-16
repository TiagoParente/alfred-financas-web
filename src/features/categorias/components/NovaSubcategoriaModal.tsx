"use client";

import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Categoria, Subcategoria, TipoCategoria } from "@/types/categorias";
import { extrairMensagemErro } from "@/hooks/useAuth";
import axios from "axios";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
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
import { FolderTree, Plus, Loader2 } from "lucide-react";

const novaSubcategoriaSchema = z.object({
  nome: z.string().min(2, "O nome deve ter pelo menos 2 caracteres"),
  categoria_id: z.coerce.number({
    required_error: "Selecione a categoria principal",
    invalid_type_error: "Selecione a categoria principal",
  }).positive("Selecione a categoria principal"),
});

export type NovaSubcategoriaFormData = z.infer<typeof novaSubcategoriaSchema>;

interface NovaSubcategoriaModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  categorias: Categoria[];
  categoriaIdPadrao?: number | null;
  tipoFiltro?: TipoCategoria;
  onSubmit: (categoriaId: number, nome: string) => Promise<Subcategoria | void>;
  isSubmitting: boolean;
}

export function NovaSubcategoriaModal({
  open,
  onOpenChange,
  categorias,
  categoriaIdPadrao,
  tipoFiltro,
  onSubmit,
  isSubmitting,
}: NovaSubcategoriaModalProps) {
  // Filtra as categorias disponíveis se houver filtro de tipo
  const categoriasDisponiveis = tipoFiltro
    ? categorias.filter((c) => c.tipo === tipoFiltro)
    : categorias;

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    reset,
    setError,
    formState: { errors },
  } = useForm<NovaSubcategoriaFormData>({
    resolver: zodResolver(novaSubcategoriaSchema),
    defaultValues: {
      nome: "",
      categoria_id: categoriaIdPadrao || (categoriasDisponiveis[0]?.id ?? 0),
    },
  });

  const categoriaIdAtual = watch("categoria_id");

  useEffect(() => {
    if (open) {
      const idInicial =
        categoriaIdPadrao &&
        categoriasDisponiveis.some((c) => c.id === categoriaIdPadrao)
          ? categoriaIdPadrao
          : categoriasDisponiveis[0]?.id ?? 0;

      reset({
        nome: "",
        categoria_id: idInicial,
      });
    }
  }, [open, categoriaIdPadrao, categoriasDisponiveis, reset]);

  const handleFormSubmit = async (data: NovaSubcategoriaFormData) => {
    try {
      await onSubmit(Number(data.categoria_id), data.nome.trim());
      onOpenChange(false);
    } catch (err: unknown) {
      if (axios.isAxiosError(err) && err.response?.status === 422) {
        const apiErrors = err.response.data?.errors;
        if (apiErrors) {
          Object.keys(apiErrors).forEach((key) => {
            setError(key as keyof NovaSubcategoriaFormData, {
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

  const categoriaSelecionada = categoriasDisponiveis.find(
    (c) => c.id === Number(categoriaIdAtual)
  );

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[460px] rounded-[20px] p-6 border-border/60 bg-card">
        <DialogHeader className="space-y-1">
          <DialogTitle className="flex items-center gap-2 text-lg font-bold">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#1F4E79]/10 text-[#1F4E79] shrink-0">
              <FolderTree className="h-4.5 w-4.5" />
            </div>
            <span>Nova Subcategoria</span>
          </DialogTitle>
          <DialogDescription className="text-xs text-muted-foreground">
            Cadastre uma subcategoria vinculada a uma categoria existente.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-4 pt-2">
          {errors.root && (
            <div className="p-3 text-xs font-medium text-destructive bg-destructive/10 rounded-lg">
              {errors.root.message}
            </div>
          )}

          {/* Categoria Pai */}
          <div className="space-y-1.5">
            <Label className="text-xs font-semibold">Categoria Principal *</Label>
            <Select
              value={categoriaIdAtual ? String(categoriaIdAtual) : ""}
              onValueChange={(val) => setValue("categoria_id", Number(val), { shouldValidate: true })}
            >
              <SelectTrigger className="h-10 rounded-xl bg-background/60 border-border/60 text-xs">
                <SelectValue placeholder="Selecione a categoria principal">
                  {categoriaSelecionada ? (
                    <div className="flex items-center gap-2">
                      <div
                        className="h-3.5 w-3.5 rounded-full shrink-0"
                        style={{
                          backgroundColor:
                            categoriaSelecionada.cor_hex || "#1F4E79",
                        }}
                      />
                      <span className="font-medium text-xs">
                        {categoriaSelecionada.nome}
                      </span>
                      <span className="text-[10px] text-muted-foreground">
                        ({categoriaSelecionada.tipo_label})
                      </span>
                    </div>
                  ) : (
                    "Selecione uma categoria"
                  )}
                </SelectValue>
              </SelectTrigger>
              <SelectContent className="rounded-xl max-h-56">
                {categoriasDisponiveis.map((cat) => (
                  <SelectItem key={cat.id} value={String(cat.id)}>
                    <div className="flex items-center gap-2">
                      <div
                        className="h-3 w-3 rounded-full shrink-0"
                        style={{ backgroundColor: cat.cor_hex || "#1F4E79" }}
                      />
                      <span className="font-medium">{cat.nome}</span>
                      <span className="text-[10px] text-muted-foreground">
                        ({cat.tipo_label})
                      </span>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {errors.categoria_id && (
              <p className="text-[11px] text-destructive font-medium">
                {errors.categoria_id.message}
              </p>
            )}
          </div>

          {/* Nome da Subcategoria */}
          <div className="space-y-1.5">
            <Label htmlFor="nome_subcategoria" className="text-xs font-semibold">
              Nome da Subcategoria *
            </Label>
            <Input
              id="nome_subcategoria"
              placeholder="Ex: Combustível, Supermercado, Farmácia..."
              autoFocus
              {...register("nome")}
              className="h-10 rounded-xl bg-background/60 border-border/60 text-xs"
            />
            {errors.nome && (
              <p className="text-[11px] text-destructive font-medium">
                {errors.nome.message}
              </p>
            )}
          </div>

          <DialogFooter className="pt-2 gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              className="rounded-xl border-border/60 text-xs cursor-pointer"
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              disabled={isSubmitting}
              className="rounded-xl bg-[#1F4E79] hover:bg-[#1F4E79]/90 text-white text-xs font-medium cursor-pointer"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="h-3.5 w-3.5 animate-spin mr-1.5" />
                  <span>Salvando...</span>
                </>
              ) : (
                <>
                  <Plus className="h-3.5 w-3.5 mr-1" />
                  <span>Criar Subcategoria</span>
                </>
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
