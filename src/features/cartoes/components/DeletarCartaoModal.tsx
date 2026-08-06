"use client";

import { AlertTriangle } from "lucide-react";
import { CartaoCredito } from "@/types/cartoes";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

interface DeletarCartaoModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  cartao: CartaoCredito | null;
  onConfirm: (id: number) => Promise<void>;
  isDeleting: boolean;
}

export function DeletarCartaoModal({
  open,
  onOpenChange,
  cartao,
  onConfirm,
  isDeleting,
}: DeletarCartaoModalProps) {
  if (!cartao) return null;

  const handleConfirm = async () => {
    await onConfirm(cartao.id);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[420px] rounded-[20px]">
        <DialogHeader className="space-y-3">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-red-500/10 text-red-600 dark:text-red-400">
            <AlertTriangle className="h-6 w-6" />
          </div>
          <DialogTitle className="text-center text-lg font-bold">
            Excluir Cartão de Crédito?
          </DialogTitle>
        </DialogHeader>

        <div className="py-2 text-center space-y-2">
          <p className="text-sm text-muted-foreground leading-relaxed">
            Tem certeza de que deseja excluir o cartão{" "}
            <strong className="text-foreground font-semibold">
              "{cartao.nome}"
            </strong>
            ?
          </p>
          <p className="text-xs text-muted-foreground">
            Esta ação desativará o cartão. As movimentações já lançadas nesta fatura serão mantidas no histórico.
          </p>
        </div>

        <DialogFooter className="gap-2 sm:gap-0 pt-2">
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
            variant="destructive"
            onClick={handleConfirm}
            disabled={isDeleting}
            className="rounded-[10px]"
          >
            {isDeleting ? "Excluindo..." : "Sim, Excluir"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
