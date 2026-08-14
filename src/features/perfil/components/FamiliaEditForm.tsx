"use client";

import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useFamilias } from "@/features/familias/hooks/useFamilias";
import { extrairMensagemErro } from "@/hooks/useAuth";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { Users, Building2, CheckCircle2, Loader2, Save, AlertCircle, ShieldCheck } from "lucide-react";

const familiaSchema = z.object({
  nome: z
    .string()
    .min(2, "O nome da família deve ter pelo menos 2 caracteres.")
    .max(100, "O nome deve ter no máximo 100 caracteres."),
});

type FamiliaFormValues = z.infer<typeof familiaSchema>;

export function FamiliaEditForm() {
  const {
    familias,
    familiaAtiva,
    familiaAtivaId,
    setFamiliaAtivaId,
    atualizarFamilia,
    isAtualizandoFamilia,
    isLoading,
  } = useFamilias();

  const [mensagemSucesso, setMensagemSucesso] = useState<string | null>(null);
  const [mensagemErro, setMensagemErro] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isDirty },
  } = useForm<FamiliaFormValues>({
    resolver: zodResolver(familiaSchema),
    defaultValues: {
      nome: "",
    },
  });

  useEffect(() => {
    if (familiaAtiva) {
      // Usa reset() para atualizar os defaultValues do RHF ao trocar de família,
      // garantindo que isDirty seja false até o usuário realmente editar o campo.
      reset({ nome: familiaAtiva.nome });
    }
  }, [familiaAtiva, reset]);

  const onSubmit = async (values: FamiliaFormValues) => {
    if (!familiaAtivaId) return;

    setMensagemSucesso(null);
    setMensagemErro(null);

    try {
      await atualizarFamilia({
        id: familiaAtivaId,
        nome: values.nome,
      });
      setMensagemSucesso("Nome da família atualizado com sucesso!");
      setTimeout(() => setMensagemSucesso(null), 4000);
    } catch (err: unknown) {
      setMensagemErro(extrairMensagemErro(err));
    }
  };

  if (isLoading) {
    return (
      <Card className="rounded-2xl border border-border/40 bg-card shadow-sm">
        <CardHeader className="space-y-2">
          <Skeleton className="h-6 w-48 rounded-md" />
          <Skeleton className="h-4 w-72 rounded-md" />
        </CardHeader>
        <CardContent className="space-y-4">
          <Skeleton className="h-10 w-full rounded-xl" />
          <Skeleton className="h-10 w-full rounded-xl" />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="rounded-2xl border border-border/40 bg-card shadow-sm transition-all">
      <CardHeader className="border-b border-border/40 pb-4">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#1F4E79]/10 text-[#1F4E79]">
            <Users className="h-5 w-5" />
          </div>
          <div>
            <CardTitle className="text-lg font-bold text-foreground">
              Gestão da Família
            </CardTitle>
            <CardDescription className="text-xs text-muted-foreground">
              Personalize o nome do grupo familiar ativo ou selecione outra família.
            </CardDescription>
          </div>
        </div>
      </CardHeader>

      <CardContent className="pt-6 space-y-6">
        {mensagemSucesso && (
          <div className="flex items-center gap-2.5 rounded-xl border border-emerald-500/30 bg-emerald-500/10 p-3.5 text-xs text-emerald-600 dark:text-emerald-400">
            <CheckCircle2 className="h-4 w-4 shrink-0" />
            <span className="font-medium">{mensagemSucesso}</span>
          </div>
        )}

        {mensagemErro && (
          <div className="flex items-center gap-2.5 rounded-xl border border-red-500/30 bg-red-500/10 p-3.5 text-xs text-red-600 dark:text-red-400">
            <AlertCircle className="h-4 w-4 shrink-0" />
            <span className="font-medium">{mensagemErro}</span>
          </div>
        )}

        {familias.length > 1 && (
          <div className="space-y-2">
            <Label className="text-xs font-semibold text-foreground">
              Família Ativa no Sistema
            </Label>
            <Select
              value={familiaAtivaId?.toString() || ""}
              onValueChange={(val) => setFamiliaAtivaId(Number(val))}
            >
              <SelectTrigger className="rounded-xl border-border/60">
                {/* Exibe explicitamente o nome da família ativa para evitar que o
                    shadcn/ui mostre o value (id) ao invés da label quando o
                    componente hidrata antes de renderizar os SelectItems. */}
                <SelectValue placeholder="Selecione uma família">
                  {familiaAtiva?.nome ?? "Selecione uma família"}
                </SelectValue>
              </SelectTrigger>
              <SelectContent className="rounded-xl">
                {familias.map((f) => (
                  <SelectItem key={f.id} value={f.id.toString()}>
                    {f.nome}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        )}

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label htmlFor="nomeFamilia" className="text-xs font-semibold text-foreground">
                Nome da Família
              </Label>
              {familiaAtiva?.papel && (
                <Badge variant="outline" className="text-[10px] gap-1 py-0.5 border-[#1F4E79]/30 text-[#1F4E79]">
                  <ShieldCheck className="h-3 w-3" />
                  {familiaAtiva.papel === "proprietario" ? "Proprietário" : "Membro"}
                </Badge>
              )}
            </div>
            <div className="relative">
              <Building2 className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                id="nomeFamilia"
                placeholder="Ex: Família Silva"
                className="pl-9 rounded-xl border-border/60 focus:border-[#1F4E79] focus:ring-[#1F4E79]/20"
                {...register("nome")}
              />
            </div>
            {errors.nome && (
              <p className="text-xs font-medium text-red-500">
                {errors.nome.message}
              </p>
            )}
          </div>

          <div className="pt-2 flex justify-end">
            <Button
              type="submit"
              disabled={isAtualizandoFamilia || !isDirty || !familiaAtivaId}
              className="bg-[#1F4E79] hover:bg-[#1F4E79]/90 text-white font-medium rounded-xl px-5 transition-all shadow-sm disabled:opacity-50"
            >
              {isAtualizandoFamilia ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Salvando...
                </>
              ) : (
                <>
                  <Save className="mr-2 h-4 w-4" />
                  Atualizar Família
                </>
              )}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
