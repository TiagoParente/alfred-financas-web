"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { AnimatePresence } from "framer-motion";
import { EnviarCodigoForm } from "@/features/auth/components/EnviarCodigoForm";
import { VerificarCodigoForm } from "@/features/auth/components/VerificarCodigoForm";

type Passo = "email" | "otp";

export default function EntrarPage() {
  const router = useRouter();
  const [passo, setPasso] = useState<Passo>("email");
  const [email, setEmail] = useState("");

  useEffect(() => {
    if (typeof window !== "undefined") {
      const token = localStorage.getItem("alfred_token");
      if (token) {
        router.replace("/dashboard");
      }
    }
  }, [router]);

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
