"use client";

import { AlfredChat } from "@/features/alfred_ia/components/AlfredChat";

export default function AlfredIaPage() {
  return (
    <div className="space-y-4 p-6 max-w-7xl mx-auto">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-foreground">
          Alfred IA - Assessor Financeiro
        </h1>
        <p className="text-sm text-muted-foreground">
          Tire dúvidas sobre seu orçamento, analise despesas e obtenha orientações práticas de finanças pessoais.
        </p>
      </div>

      <AlfredChat />
    </div>
  );
}
