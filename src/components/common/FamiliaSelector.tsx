"use client";

import { useFamilias } from "@/features/familias/hooks/useFamilias";
import { Users, Plus, Check } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export function FamiliaSelector() {
  const {
    familias,
    familiaAtiva,
    familiaAtivaId,
    setFamiliaAtivaId,
    criarFamilia,
    isCriandoFamilia,
  } = useFamilias();

  const [modalAberta, setModalAberta] = useState(false);
  const [nomeNovaFamilia, setNomeNovaFamilia] = useState("");

  const handleCriarFamilia = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!nomeNovaFamilia.trim()) return;

    try {
      await criarFamilia({ nome: nomeNovaFamilia.trim() });
      setNomeNovaFamilia("");
      setModalAberta(false);
    } catch {
      // Tratar erro se necessário
    }
  };

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger className="inline-flex items-center justify-center gap-2 rounded-md border border-border/60 bg-background/50 px-3 py-2 text-sm font-medium text-foreground hover:bg-accent/50 focus:outline-none transition-colors">
          <Users className="h-4 w-4 text-[#1F4E79]" />
          <span className="max-w-[140px] truncate font-medium">
            {familiaAtiva ? familiaAtiva.nome : "Carregando..."}
          </span>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-56">
          <DropdownMenuLabel className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
            Família Ativa
          </DropdownMenuLabel>
          <DropdownMenuSeparator />
          {familias.map((fam) => (
            <DropdownMenuItem
              key={fam.id}
              onClick={() => setFamiliaAtivaId(fam.id)}
              className="flex items-center justify-between cursor-pointer"
            >
              <span className="truncate">{fam.nome}</span>
              {fam.id === familiaAtivaId && (
                <Check className="h-4 w-4 text-[#22C55E]" />
              )}
            </DropdownMenuItem>
          ))}
          <DropdownMenuSeparator />
          <DropdownMenuItem
            onClick={() => setModalAberta(true)}
            className="flex items-center gap-2 text-[#1F4E79] font-medium cursor-pointer"
          >
            <Plus className="h-4 w-4" />
            <span>Nova Família</span>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <Dialog open={modalAberta} onOpenChange={setModalAberta}>
        <DialogContent className="sm:max-w-[425px] rounded-[20px]">
          <DialogHeader>
            <DialogTitle>Criar Nova Família</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleCriarFamilia} className="space-y-4 py-2">
            <div className="space-y-2">
              <Label htmlFor="nome-familia">Nome da Família</Label>
              <Input
                id="nome-familia"
                placeholder="Ex: Família Silva"
                value={nomeNovaFamilia}
                onChange={(e) => setNomeNovaFamilia(e.target.value)}
                className="rounded-[10px]"
                required
              />
            </div>
            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => setModalAberta(false)}
                className="rounded-[10px]"
              >
                Cancelar
              </Button>
              <Button
                type="submit"
                disabled={isCriandoFamilia || !nomeNovaFamilia.trim()}
                className="rounded-[10px] bg-[#1F4E79] hover:bg-[#1F4E79]/90 text-white"
              >
                {isCriandoFamilia ? "Criando..." : "Criar Família"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </>
  );
}
