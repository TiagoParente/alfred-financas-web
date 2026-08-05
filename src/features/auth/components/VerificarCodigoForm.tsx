"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Loader2, ArrowLeft, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { OtpInput } from "./OtpInput";
import { useVerificarCodigo, useSolicitarCodigo, extrairMensagemErro } from "@/hooks/useAuth";

interface VerificarCodigoFormProps {
  email: string;
  onVoltar: () => void;
}

export function VerificarCodigoForm({ email, onVoltar }: VerificarCodigoFormProps) {
  const [codigo, setCodigo] = useState("");

  const verificar = useVerificarCodigo();
  const reenviar = useSolicitarCodigo();

  const isCompleto = codigo.length === 6;
  const isPending = verificar.isPending;

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!isCompleto || isPending) return;
    verificar.mutate({ email, codigo });
  }

  function handleReenviar() {
    setCodigo("");
    verificar.reset();
    reenviar.mutate({ email });
  }

  const mensagemErroApi = verificar.error ? extrairMensagemErro(verificar.error) : null;

  // Dispara automaticamente quando o código fica completo
  function handleOtpChange(value: string) {
    setCodigo(value);
    if (value.length === 6 && !isPending) {
      verificar.mutate({ email, codigo: value });
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -12 }}
      transition={{ duration: 0.2, ease: "easeOut" }}
    >
      <div className="mb-8">
        <h1 className="text-2xl font-semibold text-foreground tracking-tight">
          Verifique seu e-mail
        </h1>
        <p className="mt-2 text-sm text-muted-foreground leading-relaxed">
          Enviamos um código de 6 dígitos para{" "}
          <span className="font-medium text-foreground/80">{email}</span>.
          <br />
          Digite-o abaixo para acessar sua conta.
        </p>
      </div>

      <form id="form-verificar-codigo" onSubmit={handleSubmit} noValidate>
        <div className="mb-6">
          <div className="flex justify-center">
            <OtpInput
              value={codigo}
              onChange={handleOtpChange}
              disabled={isPending}
              hasError={!!mensagemErroApi}
            />
          </div>
          <p className="mt-3 text-center text-xs text-muted-foreground">
            O código expira em alguns minutos
          </p>
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

        {reenviar.isSuccess && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.15, ease: "easeOut" }}
            className="mb-4 rounded-xl border border-positivo/20 bg-positivo/5 px-4 py-3"
            role="status"
          >
            <p className="text-sm text-positivo">
              Novo código enviado com sucesso.
            </p>
          </motion.div>
        )}

        <Button
          type="submit"
          id="btn-verificar-codigo"
          disabled={!isCompleto || isPending}
          className="w-full h-11 rounded-[10px] font-semibold text-sm transition-all duration-200 hover:opacity-90 active:scale-[0.98] disabled:opacity-50"
        >
          {isPending ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" aria-hidden="true" />
              Verificando...
            </>
          ) : (
            "Confirmar código"
          )}
        </Button>

        <div className="mt-5 flex items-center justify-between">
          <button
            type="button"
            id="btn-voltar-email"
            onClick={onVoltar}
            disabled={isPending}
            className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors duration-200 disabled:opacity-40"
          >
            <ArrowLeft className="h-3.5 w-3.5" aria-hidden="true" />
            Alterar e-mail
          </button>

          <button
            type="button"
            id="btn-reenviar-codigo"
            onClick={handleReenviar}
            disabled={isPending || reenviar.isPending}
            className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors duration-200 disabled:opacity-40"
          >
            <RefreshCw
              className={`h-3.5 w-3.5 ${reenviar.isPending ? "animate-spin" : ""}`}
              aria-hidden="true"
            />
            Reenviar código
          </button>
        </div>
      </form>
    </motion.div>
  );
}
