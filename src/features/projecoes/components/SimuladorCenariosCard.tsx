"use client";

import { useState } from "react";
import { ProjecaoMesItem, SimuladorAjuste } from "@/types/projecoes";
import { formatarMoeda } from "@/utils/formatters";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import {
  SlidersHorizontal,
  Plus,
  Trash2,
  TrendingUp,
  TrendingDown,
  Sparkles,
  Info,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface SimuladorCenariosCardProps {
  isOpen: boolean;
  onClose: () => void;
  meses: ProjecaoMesItem[];
  simulacoes: SimuladorAjuste[];
  onAdicionarSimulacao: (simulacao: Omit<SimuladorAjuste, "id" | "ativo">) => void;
  onRemoverSimulacao: (id: string) => void;
  onAlternarSimulacao: (id: string) => void;
  onLimparSimulacoes: () => void;
}

export function SimuladorCenariosCard({
  isOpen,
  onClose,
  meses,
  simulacoes,
  onAdicionarSimulacao,
  onRemoverSimulacao,
  onAlternarSimulacao,
  onLimparSimulacoes,
}: SimuladorCenariosCardProps) {
  const [descricao, setDescricao] = useState("");
  const [tipo, setTipo] = useState<"receita" | "despesa">("despesa");
  const [valor, setValor] = useState<string>("");
  const [frequencia, setFrequencia] = useState<"mensal" | "pontual">("mensal");
  const [mesInicio, setMesInicio] = useState<string>(
    meses[0]?.mes_ano || new Date().toISOString().slice(0, 7)
  );

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const valNumero = parseFloat(valor.replace(",", "."));
    if (!descricao.trim() || isNaN(valNumero) || valNumero <= 0) return;

    onAdicionarSimulacao({
      descricao: descricao.trim(),
      tipo,
      valor: valNumero,
      frequencia,
      mes_inicio: mesInicio,
    });

    setDescricao("");
    setValor("");
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-[540px] rounded-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-xl bg-amber-500/10 text-amber-600 dark:text-amber-400">
              <SlidersHorizontal className="h-5 w-5" />
            </div>
            <div>
              <DialogTitle className="text-lg font-bold text-foreground">
                Simulador de Cenários (&quot;E se?&quot;)
              </DialogTitle>
              <DialogDescription className="text-xs text-muted-foreground mt-0.5">
                Simule receitas ou despesas hipotéticas para visualizar o impacto no saldo futuro sem alterar seus dados reais.
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        {/* Formulário de Adição de Simulação */}
        <form onSubmit={handleSubmit} className="space-y-3.5 pt-2">
          <div className="p-3.5 rounded-xl bg-muted/40 border border-border/70 space-y-3">
            <span className="text-xs font-bold text-foreground uppercase tracking-wider block">
              Adicionar Nova Hipótese
            </span>

            {/* Descrição */}
            <div>
              <Input
                placeholder="Ex: Novo Trabalho Freelance, Parcela de Veículo..."
                value={descricao}
                onChange={(e) => setDescricao(e.target.value)}
                className="text-xs h-9 bg-background"
                required
              />
            </div>

            {/* Tipo e Valor */}
            <div className="grid grid-cols-2 gap-2.5">
              <div className="inline-flex rounded-lg bg-background p-0.5 border border-border">
                <button
                  type="button"
                  onClick={() => setTipo("despesa")}
                  className={cn(
                    "flex-1 py-1.5 text-xs font-semibold rounded-md transition-all flex items-center justify-center gap-1",
                    tipo === "despesa"
                      ? "bg-rose-500 text-white shadow-xs"
                      : "text-muted-foreground hover:text-foreground"
                  )}
                >
                  <TrendingDown className="h-3.5 w-3.5" />
                  <span>Despesa (-)</span>
                </button>
                <button
                  type="button"
                  onClick={() => setTipo("receita")}
                  className={cn(
                    "flex-1 py-1.5 text-xs font-semibold rounded-md transition-all flex items-center justify-center gap-1",
                    tipo === "receita"
                      ? "bg-emerald-600 text-white shadow-xs"
                      : "text-muted-foreground hover:text-foreground"
                  )}
                >
                  <TrendingUp className="h-3.5 w-3.5" />
                  <span>Receita (+)</span>
                </button>
              </div>

              <div className="relative">
                <span className="absolute left-2.5 top-2 text-xs font-semibold text-muted-foreground">
                  R$
                </span>
                <Input
                  type="number"
                  step="0.01"
                  placeholder="0,00"
                  value={valor}
                  onChange={(e) => setValor(e.target.value)}
                  className="pl-8 text-xs h-9 bg-background font-semibold"
                  required
                />
              </div>
            </div>

            {/* Frequência e Mês de Início */}
            <div className="grid grid-cols-2 gap-2.5 text-xs">
              <div>
                <label className="text-[11px] font-medium text-muted-foreground mb-1 block">
                  Frequência:
                </label>
                <select
                  value={frequencia}
                  onChange={(e) => setFrequencia(e.target.value as "mensal" | "pontual")}
                  className="w-full h-8 px-2 rounded-lg bg-background border border-border text-xs text-foreground focus:outline-hidden"
                >
                  <option value="mensal">Recorrente Mensal</option>
                  <option value="pontual">Pontual (Único mês)</option>
                </select>
              </div>

              <div>
                <label className="text-[11px] font-medium text-muted-foreground mb-1 block">
                  Mês de Início:
                </label>
                <select
                  value={mesInicio}
                  onChange={(e) => setMesInicio(e.target.value)}
                  className="w-full h-8 px-2 rounded-lg bg-background border border-border text-xs text-foreground focus:outline-hidden"
                >
                  {meses.map((m) => (
                    <option key={m.mes_ano} value={m.mes_ano}>
                      {m.nome_mes}/{m.ano}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <Button
              type="submit"
              size="sm"
              className="w-full bg-[#1F4E79] hover:bg-[#183e60] text-white text-xs h-8 flex items-center gap-1.5"
            >
              <Plus className="h-3.5 w-3.5" />
              <span>Inserir no Cenário</span>
            </Button>
          </div>
        </form>

        {/* Lista de Simulações Criadas */}
        <div className="space-y-2 pt-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-foreground">
              Ajustes do Cenário ({simulacoes.length})
            </span>
            {simulacoes.length > 0 && (
              <button
                type="button"
                onClick={onLimparSimulacoes}
                className="text-[11px] text-muted-foreground hover:text-rose-600 transition-colors"
              >
                Limpar todos
              </button>
            )}
          </div>

          {simulacoes.length === 0 ? (
            <div className="p-4 text-center text-xs text-muted-foreground border border-dashed border-border rounded-xl">
              Nenhuma hipótese adicionada. Adicione uma receita ou despesa acima para simular.
            </div>
          ) : (
            <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
              {simulacoes.map((sim) => (
                <div
                  key={sim.id}
                  className={cn(
                    "flex items-center justify-between p-2.5 rounded-xl border transition-all text-xs",
                    sim.ativo
                      ? "bg-card border-border/80 shadow-2xs"
                      : "bg-muted/30 border-border/40 opacity-60"
                  )}
                >
                  <div className="flex items-center gap-2.5">
                    <Switch
                      checked={sim.ativo}
                      onCheckedChange={() => onAlternarSimulacao(sim.id)}
                      className="scale-75 origin-left"
                    />
                    <div>
                      <div className="flex items-center gap-1.5">
                        <span className="font-semibold text-foreground">
                          {sim.descricao}
                        </span>
                        <Badge
                          variant="outline"
                          className={cn(
                            "text-[9px] px-1.5 py-0",
                            sim.tipo === "receita"
                              ? "bg-emerald-500/10 text-emerald-600 border-emerald-500/20"
                              : "bg-rose-500/10 text-rose-600 border-rose-500/20"
                          )}
                        >
                          {sim.tipo === "receita" ? "+ Receita" : "- Despesa"}
                        </Badge>
                      </div>
                      <span className="text-[10px] text-muted-foreground block">
                        {sim.frequencia === "mensal" ? "A partir de " : "Em "}
                        {sim.mes_inicio}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <span
                      className={cn(
                        "font-bold",
                        sim.tipo === "receita"
                          ? "text-emerald-600 dark:text-emerald-400"
                          : "text-rose-600 dark:text-rose-400"
                      )}
                    >
                      {formatarMoeda(sim.valor)}
                    </span>
                    <button
                      type="button"
                      onClick={() => onRemoverSimulacao(sim.id)}
                      className="text-muted-foreground hover:text-rose-600 p-1"
                      title="Excluir simulação"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
