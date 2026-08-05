"use client";

import { ContaBancaria } from "@/types/contas";
import { formatarMoeda } from "@/utils/formatters";
import { AlertTriangle } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

interface DeletarContaModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  conta: ContaBancaria | null;
  onConfirm: () => Promise<void>;
  isDeleting: boolean;
}

export function DeletarContaModal({
  open,
  onOpenChange,
  conta,
  onConfirm,
  isDeleting,
}: DeletarContaModalProps) {
  if (!conta) return null;

  const handleConfirm = async () => {
    await onConfirm();
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px] rounded-[20px]">
        <DialogHeader>
          <div className="flex items-center gap-3 text-red-500">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-red-50 dark:bg-red-950/30">
              <AlertTriangle className="h-5 w-5" />
            </div>
            <DialogTitle>Excluir Conta Bancária</DialogTitle>
          </div>
        </DialogHeader>

        <div className="py-2 space-y-2">
          <p className="text-sm text-foreground">
            Tem certeza que deseja excluir a conta{" "}
            <strong className="font-semibold text-[#1F4E79]">{conta.nome}</strong>?
          </p>
          <p className="text-xs text-muted-foreground leading-relaxed">
            Esta conta possui um saldo de{" "}
            <strong>{formatarMoeda(conta.saldo_atual)}</strong>. A remoção ocultará a conta e ajustará os saldos consolidados da família.
          </p>
        </div>

        <DialogFooter>
          <Button
            type="button"
            variant="outline"
            onClick={() => onOpenChange(false)}
            className="rounded-[10px]"
          >
            Cancelar
          </Button>
          <Button
            type="button"
            disabled={isDeleting}
            onClick={handleConfirm}
            className="rounded-[10px] bg-red-600 hover:bg-red-700 text-white"
          >
            {isDeleting ? "Excluindo..." : "Sim, Excluir Conta"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
