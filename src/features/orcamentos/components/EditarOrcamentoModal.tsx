"use client";

import { useEffect, useState } from "react";
import { orcamentosService } from "@/services/orcamentos";
import { Orcamento, AtualizarOrcamentoPayload } from "@/types/orcamento";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "@/components/ui/toast";
import { Pencil, Loader2 } from "lucide-react";

interface EditarOrcamentoModalProps {
  orcamento: Orcamento | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSucesso: () => void;
}

export function EditarOrcamentoModal({
  orcamento,
  open,
  onOpenChange,
  onSucesso,
}: EditarOrcamentoModalProps) {
  const [valorLimite, setValorLimite] = useState<string>("");
  const [observacao, setObservacao] = useState<string>("");
  const [salvando, setSalvando] = useState<boolean>(false);

  useEffect(() => {
    if (orcamento && open) {
      setValorLimite(orcamento.valor_limite.toString());
      setObservacao(orcamento.observacao ?? "");
    }
  }, [orcamento, open]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!orcamento) return;

    const valor = parseFloat(valorLimite.replace(",", "."));
    if (isNaN(valor) || valor <= 0) {
      toast.add({
        title: "Valor inválido",
        description: "Informe um valor limite válido maior que zero.",
        type: "error",
      });
      return;
    }

    try {
      setSalvando(true);
      const payload: AtualizarOrcamentoPayload = {
        valor_limite: valor,
        observacao: observacao || null,
      };

      await orcamentosService.atualizar(orcamento.id, payload);
      toast.add({
        title: "Orçamento atualizado",
        description: "As alterações foram salvas com sucesso!",
        type: "success",
      });
      onSucesso();
      onOpenChange(false);
    } catch {
      toast.add({
        title: "Erro",
        description: "Erro ao atualizar orçamento.",
        type: "error",
      });
    } finally {
      setSalvando(false);
    }
  };

  if (!orcamento) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[480px] rounded-[20px]">
        <DialogHeader>
          <div className="flex items-center gap-3 mb-1">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#1F4E79]/10 text-[#1F4E79]">
              <Pencil className="h-5 w-5" />
            </div>
            <div>
              <DialogTitle className="text-lg font-bold">Editar Orçamento</DialogTitle>
              <DialogDescription className="text-xs text-muted-foreground">
                Ajuste o valor limite de {orcamento.categoria?.nome ?? "categoria"}.
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 py-2">
          {/* Categoria (Somente Leitura) */}
          <div className="space-y-1.5">
            <Label className="text-xs font-semibold">Categoria</Label>
            <Input
              value={orcamento.categoria?.nome ?? ""}
              disabled
              className="rounded-[10px] bg-muted/50"
            />
          </div>

          {/* Valor Limite */}
          <div className="space-y-1.5">
            <Label className="text-xs font-semibold">Teto de Gastos / Limite (R$)</Label>
            <Input
              type="text"
              value={valorLimite}
              onChange={(e) => setValorLimite(e.target.value)}
              className="rounded-[10px]"
            />
          </div>

          {/* Observação */}
          <div className="space-y-1.5">
            <Label className="text-xs font-semibold">Observações (opcional)</Label>
            <textarea
              value={observacao}
              onChange={(e) => setObservacao(e.target.value)}
              className="flex min-h-20 w-full rounded-[10px] border border-input bg-background px-3 py-2 text-xs shadow-2xs placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-ring/50 disabled:cursor-not-allowed disabled:opacity-50 resize-none"
            />
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
              type="submit"
              disabled={salvando}
              className="rounded-[10px] bg-[#1F4E79] hover:bg-[#1F4E79]/90 text-white font-semibold"
            >
              {salvando ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Atualizando...
                </>
              ) : (
                "Salvar Alterações"
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
