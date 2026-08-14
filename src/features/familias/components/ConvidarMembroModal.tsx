"use client";

import { useState } from "react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { familiaService } from "@/services/familias";
import { extrairMensagemErro } from "@/hooks/useAuth";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
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
import { UserPlus, Mail, Shield, Loader2, AlertCircle } from "lucide-react";

const conviteSchema = z.object({
  email: z
    .string()
    .min(1, "O e-mail é obrigatório.")
    .email("Informe um endereço de e-mail válido."),
  papel: z.enum(["proprietario", "membro"], {
    required_error: "Selecione o papel do membro.",
  }),
});

type ConviteFormValues = z.infer<typeof conviteSchema>;

interface ConvidarMembroModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  familiaId: number;
  onSucesso: () => void;
}

export function ConvidarMembroModal({
  open,
  onOpenChange,
  familiaId,
  onSucesso,
}: ConvidarMembroModalProps) {
  const [mensagemErro, setMensagemErro] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    control,
    reset,
    setError,
    formState: { errors },
  } = useForm<ConviteFormValues>({
    resolver: zodResolver(conviteSchema),
    defaultValues: {
      email: "",
      papel: "membro",
    },
  });

  const handleClose = () => {
    reset();
    setMensagemErro(null);
    onOpenChange(false);
  };

  const onSubmit = async (values: ConviteFormValues) => {
    setIsSubmitting(true);
    setMensagemErro(null);

    try {
      await familiaService.convidarMembro(familiaId, {
        email: values.email,
        papel: values.papel,
      });

      handleClose();
      onSucesso();
    } catch (err: any) {
      if (err?.response?.data?.errors?.email) {
        setError("email", {
          type: "manual",
          message: err.response.data.errors.email[0],
        });
      } else {
        setMensagemErro(extrairMensagemErro(err));
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md rounded-2xl p-6 bg-card border border-border/40 shadow-xl">
        <DialogHeader className="space-y-2">
          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#1F4E79]/10 text-[#1F4E79]">
            <UserPlus className="h-5 w-5" />
          </div>
          <DialogTitle className="text-xl font-bold text-foreground">
            Convidar Membro para a Família
          </DialogTitle>
          <DialogDescription className="text-xs text-muted-foreground">
            Insira o e-mail da pessoa que você deseja convidar. Se ela já tiver conta, o acesso será concedido instantaneamente; caso contrário, poderá se cadastrar com este e-mail.
          </DialogDescription>
        </DialogHeader>

        {mensagemErro && (
          <div className="flex items-center gap-2.5 rounded-xl border border-red-500/30 bg-red-500/10 p-3 text-xs text-red-600 dark:text-red-400">
            <AlertCircle className="h-4 w-4 shrink-0" />
            <span>{mensagemErro}</span>
          </div>
        )}

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 pt-2">
          {/* E-mail */}
          <div className="space-y-1.5">
            <Label htmlFor="email" className="text-xs font-semibold text-foreground">
              E-mail do Membro
            </Label>
            <div className="relative">
              <Mail className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                id="email"
                type="email"
                placeholder="exemplo@email.com"
                className="pl-9 rounded-xl border-border/60 focus:border-[#1F4E79] focus:ring-[#1F4E79]/20"
                {...register("email")}
              />
            </div>
            {errors.email && (
              <p className="text-xs font-medium text-red-500">
                {errors.email.message}
              </p>
            )}
          </div>

          {/* Papel */}
          <div className="space-y-1.5">
            <Label htmlFor="papel" className="text-xs font-semibold text-foreground">
              Papel na Família
            </Label>
            <Controller
              name="papel"
              control={control}
              render={({ field }) => (
                <Select value={field.value} onValueChange={field.onChange}>
                  <SelectTrigger id="papel" className="rounded-xl border-border/60">
                    <SelectValue placeholder="Selecione o papel" />
                  </SelectTrigger>
                  <SelectContent className="rounded-xl">
                    <SelectItem value="membro">
                      <div className="flex items-center gap-2">
                        <UserPlus className="h-4 w-4 text-muted-foreground" />
                        <div>
                          <p className="font-medium text-xs">Membro</p>
                          <p className="text-[10px] text-muted-foreground">
                            Acesso completo de visualização e lançamentos
                          </p>
                        </div>
                      </div>
                    </SelectItem>
                    <SelectItem value="proprietario">
                      <div className="flex items-center gap-2">
                        <Shield className="h-4 w-4 text-[#1F4E79]" />
                        <div>
                          <p className="font-medium text-xs">Proprietário</p>
                          <p className="text-[10px] text-muted-foreground">
                            Pode gerenciar dados e membros da família
                          </p>
                        </div>
                      </div>
                    </SelectItem>
                  </SelectContent>
                </Select>
              )}
            />
            {errors.papel && (
              <p className="text-xs font-medium text-red-500">
                {errors.papel.message}
              </p>
            )}
          </div>

          <DialogFooter className="pt-4 gap-2 border-t border-border/40 sm:justify-end">
            <Button
              type="button"
              variant="outline"
              onClick={handleClose}
              className="rounded-xl"
              disabled={isSubmitting}
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              disabled={isSubmitting}
              className="bg-[#1F4E79] hover:bg-[#1F4E79]/90 text-white rounded-xl px-5 font-medium shadow-sm"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Enviando...
                </>
              ) : (
                <>
                  <UserPlus className="mr-2 h-4 w-4" />
                  Convidar Membro
                </>
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
