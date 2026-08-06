"use client";

import { useState } from "react";
import { AlertTriangle, Loader2 } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Movimentacao } from "@/types/movimentacoes";
import { formatarMoeda } from "@/utils/formatters";

interface DeletarMovimentacaoModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  movimentacao?: Movimentacao | null;
  onConfirmar: (id: number) => Promise<void>;
}

export function DeletarMovimentacaoModal({
  open,
  onOpenChange,
  movimentacao,
  onConfirmar,
}: DeletarMovimentacaoModalProps) {
  const [isDeleting, setIsDeleting] = useState(false);

  if (!movimentacao) return null;

  const handleDeletar = async () => {
    try {
      setIsDeleting(true);
      await onConfirmar(movimentacao.id);
      onOpenChange(false);
    } catch {
      // Erros já tratados pelo caller/toast
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[420px] rounded-3xl p-6 border-border/60 bg-card">
        <DialogHeader className="space-y-3 flex flex-col items-center text-center">
          <div className="h-12 w-12 rounded-2xl bg-destructive/10 text-destructive flex items-center justify-center">
            <AlertTriangle className="h-6 w-6 stroke-[2]" />
          </div>
          <DialogTitle className="text-lg font-bold">
            Excluir Movimentação?
          </DialogTitle>
          <DialogDescription className="text-xs text-muted-foreground leading-relaxed">
            Tem certeza de que deseja remover a movimentação{" "}
            <span className="font-semibold text-foreground">
              &quot;{movimentacao.descricao}&quot;
            </span>{" "}
            no valor de{" "}
            <span className="font-semibold text-foreground">
              {formatarMoeda(movimentacao.valor)}
            </span>
            ? Esta ação não pode ser desfeita e atualizará o saldo das contas afetadas.
          </DialogDescription>
        </DialogHeader>

        <div className="flex items-center justify-center gap-3 pt-4 border-t border-border/40">
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            className="rounded-xl border-border/60 flex-1"
          >
            Cancelar
          </Button>
          <Button
            variant="destructive"
            onClick={handleDeletar}
            disabled={isDeleting}
            className="rounded-xl flex-1 min-w-[120px]"
          >
            {isDeleting ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
                <span>Excluindo...</span>
              </>
            ) : (
              <span>Excluir</span>
            )}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
