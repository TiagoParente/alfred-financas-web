"use client";

import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { perfilUsuarioSchema, PerfilUsuarioFormValues } from "@/types/perfil";
import { usePerfil } from "../hooks/usePerfil";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import { User, Mail, Lock, CheckCircle2, Loader2, Save, AlertCircle } from "lucide-react";

export function PerfilUsuarioForm() {
  const { usuario, isLoading, atualizarNome } = usePerfil();
  const [mensagemSucesso, setMensagemSucesso] = useState<string | null>(null);
  const [mensagemErro, setMensagemErro] = useState<string | null>(null);
  const [isSalvando, setIsSalvando] = useState(false);

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors, isDirty },
  } = useForm<PerfilUsuarioFormValues>({
    resolver: zodResolver(perfilUsuarioSchema),
    defaultValues: {
      nome: "",
      email: "",
    },
  });

  useEffect(() => {
    if (usuario) {
      setValue("nome", usuario.nome);
      setValue("email", usuario.email);
    }
  }, [usuario, setValue]);

  const onSubmit = async (values: PerfilUsuarioFormValues) => {
    setMensagemSucesso(null);
    setMensagemErro(null);
    setIsSalvando(true);

    try {
      await atualizarNome(values.nome);
      setMensagemSucesso("Dados da conta atualizados com sucesso!");
      setTimeout(() => setMensagemSucesso(null), 4000);
    } catch (err: unknown) {
      const errorMsg = err instanceof Error ? err.message : "Erro ao atualizar dados da conta.";
      setMensagemErro(errorMsg);
    } finally {
      setIsSalvando(false);
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
          <Skeleton className="h-10 w-32 rounded-xl" />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="rounded-2xl border border-border/40 bg-card shadow-sm transition-all">
      <CardHeader className="border-b border-border/40 pb-4">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#1F4E79]/10 text-[#1F4E79]">
            <User className="h-5 w-5" />
          </div>
          <div>
            <CardTitle className="text-lg font-bold text-foreground">
              Dados da Minha Conta
            </CardTitle>
            <CardDescription className="text-xs text-muted-foreground">
              Atualize as informações pessoais do seu perfil de usuário.
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

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
          <div className="space-y-2">
            <Label htmlFor="nome" className="text-xs font-semibold text-foreground">
              Nome Completo
            </Label>
            <div className="relative">
              <User className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                id="nome"
                placeholder="Seu nome completo"
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

          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label htmlFor="email" className="text-xs font-semibold text-foreground">
                E-mail de Acesso
              </Label>
              <span className="inline-flex items-center gap-1 rounded-md bg-muted px-2 py-0.5 text-[10px] font-medium text-muted-foreground">
                <Lock className="h-3 w-3" /> Leitura apenas
              </span>
            </div>
            <div className="relative">
              <Mail className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground/60" />
              <Input
                id="email"
                disabled
                readOnly
                className="pl-9 bg-accent/40 cursor-not-allowed opacity-75 rounded-xl border-border/40 font-medium text-muted-foreground"
                {...register("email")}
              />
            </div>
            <p className="text-[11px] text-muted-foreground leading-relaxed">
              O e-mail é utilizado para envio de código OTP de login e não pode ser alterado por aqui.
            </p>
          </div>

          <div className="pt-2 flex justify-end">
            <Button
              type="submit"
              disabled={isSalvando || !isDirty}
              className="bg-[#1F4E79] hover:bg-[#1F4E79]/90 text-white font-medium rounded-xl px-5 transition-all shadow-sm disabled:opacity-50"
            >
              {isSalvando ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Salvando...
                </>
              ) : (
                <>
                  <Save className="mr-2 h-4 w-4" />
                  Salvar Alterações
                </>
              )}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
