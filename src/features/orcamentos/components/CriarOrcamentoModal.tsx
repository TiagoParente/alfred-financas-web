"use client";

import { useEffect, useState } from "react";
import { categoriaService } from "@/services/categorias";
import { orcamentosService } from "@/services/orcamentos";
import { Categoria, TipoCategoria } from "@/types/categorias";
import { CriarOrcamentoPayload } from "@/types/orcamento";
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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "@/components/ui/toast";
import { PieChart, Loader2 } from "lucide-react";

interface CriarOrcamentoModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  mesPadrao: number;
  anoPadrao: number;
  onSucesso: () => void;
}

const MESES = [
  { value: 1, label: "Janeiro" },
  { value: 2, label: "Fevereiro" },
  { value: 3, label: "Março" },
  { value: 4, label: "Abril" },
  { value: 5, label: "Maio" },
  { value: 6, label: "Junho" },
  { value: 7, label: "Julho" },
  { value: 8, label: "Agosto" },
  { value: 9, label: "Setembro" },
  { value: 10, label: "Outubro" },
  { value: 11, label: "Novembro" },
  { value: 12, label: "Dezembro" },
];

export function CriarOrcamentoModal({
  open,
  onOpenChange,
  mesPadrao,
  anoPadrao,
  onSucesso,
}: CriarOrcamentoModalProps) {
  const [categorias, setCategorias] = useState<Categoria[]>([]);
  const [categoriaId, setCategoriaId] = useState<string>("");
  const [mes, setMes] = useState<number>(mesPadrao);
  const [ano, setAno] = useState<number>(anoPadrao);
  const [valorLimite, setValorLimite] = useState<string>("");
  const [observacao, setObservacao] = useState<string>("");

  const [loadingCategorias, setLoadingCategorias] = useState<boolean>(false);
  const [salvando, setSalvando] = useState<boolean>(false);

  useEffect(() => {
    if (open) {
      setMes(mesPadrao);
      setAno(anoPadrao);
      carregarCategorias();
    }
  }, [open, mesPadrao, anoPadrao]);

  const carregarCategorias = async () => {
    try {
      setLoadingCategorias(true);
      const data = await categoriaService.listar(undefined, { tipo: TipoCategoria.DESPESA });
      setCategorias(data);
    } catch {
      toast.add({
        title: "Erro",
        description: "Erro ao carregar categorias de despesa.",
        type: "error",
      });
    } finally {
      setLoadingCategorias(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!categoriaId) {
      toast.add({
        title: "Campo obrigatório",
        description: "Selecione uma categoria.",
        type: "error",
      });
      return;
    }

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
      const payload: CriarOrcamentoPayload = {
        categoria_id: parseInt(categoriaId, 10),
        mes,
        ano,
        valor_limite: valor,
        observacao: observacao || null,
      };

      await orcamentosService.criar(payload);
      toast.add({
        title: "Orçamento criado",
        description: "Orçamento cadastrado com sucesso!",
        type: "success",
      });
      onSucesso();
      onOpenChange(false);
      resetForm();
    } catch {
      toast.add({
        title: "Erro ao salvar",
        description: "Verifique se a categoria já possui orçamento neste mês.",
        type: "error",
      });
    } finally {
      setSalvando(false);
    }
  };

  const resetForm = () => {
    setCategoriaId("");
    setValorLimite("");
    setObservacao("");
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[480px] rounded-[20px]">
        <DialogHeader>
          <div className="flex items-center gap-3 mb-1">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#1F4E79]/10 text-[#1F4E79]">
              <PieChart className="h-5 w-5" />
            </div>
            <div>
              <DialogTitle className="text-lg font-bold">Novo Orçamento por Categoria</DialogTitle>
              <DialogDescription className="text-xs text-muted-foreground">
                Defina o valor teto de gastos para a categoria no mês desejado.
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 py-2">
          {/* Categoria */}
          <div className="space-y-1.5">
            <Label className="text-xs font-semibold">Categoria de Despesa</Label>
            {loadingCategorias ? (
              <div className="flex items-center gap-2 text-xs text-muted-foreground py-2">
                <Loader2 className="h-4 w-4 animate-spin" /> Carregando categorias...
              </div>
            ) : (
              <Select value={categoriaId} onValueChange={(val) => setCategoriaId(val ?? "")}>
                <SelectTrigger className="rounded-[10px]">
                  <SelectValue placeholder="Selecione a categoria" />
                </SelectTrigger>
                <SelectContent>
                  {categorias.map((cat) => (
                    <SelectItem key={cat.id} value={cat.id.toString()}>
                      {cat.nome}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          </div>

          {/* Mês e Ano */}
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label className="text-xs font-semibold">Mês</Label>
              <Select value={mes.toString()} onValueChange={(val) => setMes(val ? parseInt(val, 10) : mesPadrao)}>
                <SelectTrigger className="rounded-[10px]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {MESES.map((m) => (
                    <SelectItem key={m.value} value={m.value.toString()}>
                      {m.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-1.5">
              <Label className="text-xs font-semibold">Ano</Label>
              <Input
                type="number"
                value={ano}
                onChange={(e) => setAno(parseInt(e.target.value, 10))}
                className="rounded-[10px]"
                min={2000}
                max={2100}
              />
            </div>
          </div>

          {/* Valor Limite */}
          <div className="space-y-1.5">
            <Label className="text-xs font-semibold">Teto de Gastos / Limite (R$)</Label>
            <Input
              type="text"
              placeholder="0,00"
              value={valorLimite}
              onChange={(e) => setValorLimite(e.target.value)}
              className="rounded-[10px]"
            />
          </div>

          {/* Observação */}
          <div className="space-y-1.5">
            <Label className="text-xs font-semibold">Observações (opcional)</Label>
            <textarea
              placeholder="Ex: meta rígida para economizar em refeições fora de casa"
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
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Salvando...
                </>
              ) : (
                "Criar Orçamento"
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
