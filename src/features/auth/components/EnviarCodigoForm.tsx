"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { motion } from "framer-motion";
import { Loader2, Mail } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useSolicitarCodigo, extrairMensagemErro } from "@/hooks/useAuth";

const schema = z.object({
  email: z
    .string()
    .min(1, "O e-mail é obrigatório.")
    .email("Informe um endereço de e-mail válido."),
});

type FormData = z.infer<typeof schema>;

interface EnviarCodigoFormProps {
  onSucesso: (email: string) => void;
}

export function EnviarCodigoForm({ onSucesso }: EnviarCodigoFormProps) {
  const { mutate, isPending, error } = useSolicitarCodigo();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormData>({ resolver: zodResolver(schema) });

  function onSubmit(data: FormData) {
    mutate(
      { email: data.email },
      { onSuccess: () => onSucesso(data.email) }
    );
  }

  const mensagemErroApi = error ? extrairMensagemErro(error) : null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -12 }}
      transition={{ duration: 0.2, ease: "easeOut" }}
    >
      <div className="mb-8">
        <h1 className="text-2xl font-semibold text-foreground tracking-tight">
          Bem-vindo ao Alfred
        </h1>
        <p className="mt-2 text-sm text-muted-foreground leading-relaxed">
          Informe seu e-mail e enviaremos um código de acesso.
          <br />
          Sem senhas para memorizar.
        </p>
      </div>

      <form id="form-enviar-codigo" onSubmit={handleSubmit(onSubmit)} noValidate>
        <div className="space-y-2 mb-6">
          <Label htmlFor="email" className="text-sm font-medium text-foreground/80">
            Endereço de e-mail
          </Label>
          <div className="relative">
            <Mail
              className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground"
              aria-hidden="true"
            />
            <Input
              id="email"
              type="email"
              autoComplete="email"
              autoFocus
              placeholder="seu@email.com"
              disabled={isPending}
              aria-invalid={!!errors.email}
              aria-describedby={errors.email ? "email-error" : undefined}
              {...register("email")}
              className="pl-10 h-11 rounded-[10px] transition-all duration-200 placeholder:text-muted-foreground/50"
            />
          </div>
          {errors.email && (
            <p id="email-error" role="alert" className="text-sm text-destructive mt-1">
              {errors.email.message}
            </p>
          )}
        </div>

        {mensagemErroApi && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.15, ease: "easeOut" }}
            className="mb-4 rounded-xl border border-destructive/20 bg-destructive/5 px-4 py-3"
            role="alert"
          >
            <p className="text-sm text-destructive">{mensagemErroApi}</p>
          </motion.div>
        )}

        <Button
          type="submit"
          id="btn-enviar-codigo"
          disabled={isPending}
          className="w-full h-11 rounded-[10px] font-semibold text-sm transition-all duration-200 hover:opacity-90 active:scale-[0.98]"
        >
          {isPending ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" aria-hidden="true" />
              Enviando código...
            </>
          ) : (
            "Enviar código de acesso"
          )}
        </Button>
      </form>
    </motion.div>
  );
}
