"use client";

import { Subcategoria } from "@/types/categorias";
import { AlertTriangle } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

interface DeletarSubcategoriaModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  subcategoria: Subcategoria | null;
  onConfirm: () => Promise<void>;
  isDeleting: boolean;
}

export function DeletarSubcategoriaModal({
  open,
  onOpenChange,
  subcategoria,
  onConfirm,
  isDeleting,
}: DeletarSubcategoriaModalProps) {
  if (!subcategoria) return null;

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
            <DialogTitle>Excluir Subcategoria</DialogTitle>
          </div>
        </DialogHeader>

        <div className="py-2 space-y-2">
          <p className="text-sm text-foreground">
            Tem certeza que deseja excluir a subcategoria{" "}
            <strong className="font-semibold text-[#1F4E79]">{subcategoria.nome}</strong>?
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
            {isDeleting ? "Excluindo..." : "Sim, Excluir Subcategoria"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
