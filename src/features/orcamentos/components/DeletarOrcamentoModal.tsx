"use client";

import { useState } from "react";
import { orcamentosService } from "@/services/orcamentos";
import { Orcamento } from "@/types/orcamento";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { toast } from "@/components/ui/toast";
import { AlertTriangle, Loader2 } from "lucide-react";

interface DeletarOrcamentoModalProps {
  orcamento: Orcamento | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSucesso: () => void;
}

export function DeletarOrcamentoModal({
  orcamento,
  open,
  onOpenChange,
  onSucesso,
}: DeletarOrcamentoModalProps) {
  const [excluindo, setExcluindo] = useState<boolean>(false);

  const handleDeletar = async () => {
    if (!orcamento) return;

    try {
      setExcluindo(true);
      await orcamentosService.deletar(orcamento.id);
      toast.add({
        title: "Orçamento excluído",
        description: "Orçamento removido com sucesso.",
        type: "success",
      });
      onSucesso();
      onOpenChange(false);
    } catch {
      toast.add({
        title: "Erro",
        description: "Erro ao excluir orçamento.",
        type: "error",
      });
    } finally {
      setExcluindo(false);
    }
  };

  if (!orcamento) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[420px] rounded-[20px]">
        <DialogHeader>
          <div className="flex items-center gap-3 mb-1">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-red-500/10 text-red-500">
              <AlertTriangle className="h-5 w-5" />
            </div>
            <div>
              <DialogTitle className="text-lg font-bold">Excluir Orçamento</DialogTitle>
              <DialogDescription className="text-xs text-muted-foreground">
                Tem certeza que deseja excluir este orçamento?
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <div className="py-2 text-sm text-foreground space-y-1">
          <p>
            Categoria: <strong className="font-semibold">{orcamento.categoria?.nome ?? "Categoria"}</strong>
          </p>
          <p className="text-xs text-muted-foreground">
            O orçamento do mês {orcamento.mes}/{orcamento.ano} será excluído. As movimentações da categoria permanecerão salvas.
          </p>
        </div>

        <DialogFooter className="pt-2">
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
            onClick={handleDeletar}
            disabled={excluindo}
            className="rounded-[10px] bg-red-600 hover:bg-red-700 text-white font-semibold"
          >
            {excluindo ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Excluindo...
              </>
            ) : (
              "Excluir Orçamento"
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
