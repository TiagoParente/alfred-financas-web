"use client";

import { useState } from "react";
import { AnimatePresence } from "framer-motion";
import { EnviarCodigoForm } from "@/features/auth/components/EnviarCodigoForm";
import { VerificarCodigoForm } from "@/features/auth/components/VerificarCodigoForm";

type Passo = "email" | "otp";

export default function EntrarPage() {
  const [passo, setPasso] = useState<Passo>("email");
  const [email, setEmail] = useState("");

  function handleCodigoEnviado(emailInformado: string) {
    setEmail(emailInformado);
    setPasso("otp");
  }

  function handleVoltar() {
    setPasso("email");
  }

  return (
    <AnimatePresence mode="wait">
      {passo === "email" ? (
        <EnviarCodigoForm key="email" onSucesso={handleCodigoEnviado} />
      ) : (
        <VerificarCodigoForm key="otp" email={email} onVoltar={handleVoltar} />
      )}
    </AnimatePresence>
  );
}
