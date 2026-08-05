import { Landmark, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";

interface ContasBancariasEmptyStateProps {
  onNovaConta: () => void;
}

export function ContasBancariasEmptyState({
  onNovaConta,
}: ContasBancariasEmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center rounded-[20px] border border-dashed border-border/80 bg-accent/10 p-12 text-center">
      <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-[#1F4E79]/10 text-[#1F4E79] mb-4">
        <Landmark className="h-8 w-8" />
      </div>
      <h3 className="text-lg font-bold text-foreground">Nenhuma conta bancária cadastrada</h3>
      <p className="mt-1.5 max-w-sm text-sm text-muted-foreground leading-relaxed">
        Cadastre suas contas correntes, poupanças ou investimentos para acompanhar o saldo consolidado da sua família em um só lugar.
      </p>
      <Button
        onClick={onNovaConta}
        className="mt-6 rounded-[10px] bg-[#1F4E79] hover:bg-[#1F4E79]/90 text-white font-medium gap-2"
      >
        <Plus className="h-4 w-4" />
        <span>Cadastrar Primeira Conta</span>
      </Button>
    </div>
  );
}
