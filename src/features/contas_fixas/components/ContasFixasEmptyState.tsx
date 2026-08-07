import { Button } from "@/components/ui/button";
import { CalendarSync, Plus } from "lucide-react";

interface ContasFixasEmptyStateProps {
  onNovaContaFixa: () => void;
}

export function ContasFixasEmptyState({ onNovaContaFixa }: ContasFixasEmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center p-12 text-center rounded-2xl border border-dashed border-border/60 bg-card/30 space-y-4 my-6">
      <div className="h-16 w-16 rounded-2xl bg-[#1F4E79]/10 flex items-center justify-center text-[#1F4E79] dark:text-sky-400">
        <CalendarSync className="h-8 w-8" />
      </div>
      <div className="max-w-md space-y-1">
        <h3 className="text-lg font-bold text-foreground">Nenhuma Conta Fixa Cadastrada</h3>
        <p className="text-xs text-muted-foreground leading-relaxed">
          Cadastre suas receitas e despesas recorrentes (aluguel, salário, assinaturas, contas de luz) para automatizar o lançamento das suas movimentações do mês.
        </p>
      </div>
      <Button
        onClick={onNovaContaFixa}
        className="rounded-[10px] bg-[#1F4E79] hover:bg-[#1F4E79]/90 text-white text-xs font-medium px-5"
      >
        <Plus className="mr-1.5 h-4 w-4" />
        Cadastrar Primeira Conta Fixa
      </Button>
    </div>
  );
}
