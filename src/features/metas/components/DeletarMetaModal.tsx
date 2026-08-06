"use client";

import { Meta } from "@/types/metas";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { AlertTriangle } from "lucide-react";
import { formatarMoeda } from "@/utils/formatters";

interface DeletarMetaModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  meta: Meta | null;
  onConfirmar: (meta: Meta) => Promise<void>;
  isDeletando?: boolean;
}

export function DeletarMetaModal({
  open,
  onOpenChange,
  meta,
  onConfirmar,
  isDeletando = false,
}: DeletarMetaModalProps) {
  if (!meta) return null;

  const handleConfirmar = async () => {
    await onConfirmar(meta);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[420px] rounded-[20px] p-6">
        <DialogHeader className="space-y-2">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-red-500/10 text-red-500 mx-auto">
            <AlertTriangle className="h-6 w-6" />
          </div>
          <DialogTitle className="text-lg font-bold text-center text-foreground">
            Excluir Meta Financeira?
          </DialogTitle>
          <DialogDescription className="text-xs text-center text-muted-foreground leading-relaxed">
            Você tem certeza que deseja remover a meta{" "}
            <strong className="text-foreground">"{meta.nome}"</strong> com saldo acumulado de{" "}
            <strong className="text-foreground">{formatarMoeda(meta.valor_atual)}</strong>?
            Esta ação não afetará os saldos das suas contas bancárias.
          </DialogDescription>
        </DialogHeader>

        <div className="flex items-center justify-end gap-3 pt-4 border-t border-border/40">
          <Button
            type="button"
            variant="outline"
            onClick={() => onOpenChange(false)}
            className="rounded-[10px] text-xs flex-1"
          >
            Cancelar
          </Button>
          <Button
            type="button"
            onClick={handleConfirmar}
            disabled={isDeletando}
            className="rounded-[10px] bg-red-600 hover:bg-red-700 text-white font-medium text-xs flex-1 shadow-sm"
          >
            {isDeletando ? "Excluindo..." : "Sim, Excluir Meta"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
