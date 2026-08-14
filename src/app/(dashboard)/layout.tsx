"use client";

import { ConvitesPendentesBanner } from "@/components/common/ConvitesPendentesBanner";
import { Header } from "@/components/common/Header";
import { Sidebar } from "@/components/common/Sidebar";
import { BoasVindasFamiliaModal } from "@/features/familias/components/BoasVindasFamiliaModal";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const [carregando, setCarregando] = useState(true);
  const [autenticado, setAutenticado] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem("alfred_token");
    if (!token) {
      router.replace("/entrar");
    } else {
      setAutenticado(true);
    }
    setCarregando(false);
  }, [router]);

  if (carregando || !autenticado) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-[#1F4E79] border-t-transparent" />
      </div>
    );
  }

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <Header />
      <div className="flex flex-1 overflow-hidden">
        <Sidebar />
        <main className="flex-1 overflow-y-auto p-4 md:p-6 lg:p-8">
          <div className="mx-auto max-w-7xl space-y-6">
            <ConvitesPendentesBanner />
            {children}
          </div>
        </main>
      </div>
      <BoasVindasFamiliaModal />
    </div>
  );
}
