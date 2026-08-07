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
import { ContaFixa } from "@/types/contasFixas";
import { formatarMoeda } from "@/utils/formatters";

interface DeletarContaFixaModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  contaFixa?: ContaFixa | null;
  onConfirmar: (id: number) => Promise<void>;
}

export function DeletarContaFixaModal({
  open,
  onOpenChange,
  contaFixa,
  onConfirmar,
}: DeletarContaFixaModalProps) {
  const [isDeleting, setIsDeleting] = useState(false);

  if (!contaFixa) return null;

  const handleDeletar = async () => {
    try {
      setIsDeleting(true);
      await onConfirmar(contaFixa.id);
      onOpenChange(false);
    } catch {
      // Erro tratado pelo caller
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
            Excluir Conta Fixa?
          </DialogTitle>
          <DialogDescription className="text-xs text-muted-foreground leading-relaxed">
            Tem certeza de que deseja remover a conta fixa{" "}
            <span className="font-semibold text-foreground">
              &quot;{contaFixa.descricao}&quot;
            </span>{" "}
            no valor de{" "}
            <span className="font-semibold text-foreground">
              {formatarMoeda(contaFixa.valor)}
            </span>
            ? Lançamentos gerados anteriormente não serão apagados, mas novos lançamentos automáticos deixarão de ser criados.
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
