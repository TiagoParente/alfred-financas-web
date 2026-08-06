import { ArrowLeftRight, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";

interface MovimentacoesEmptyStateProps {
  onNovaMovimentacao: () => void;
  hasFiltros?: boolean;
  onLimparFiltros?: () => void;
}

export function MovimentacoesEmptyState({
  onNovaMovimentacao,
  hasFiltros,
  onLimparFiltros,
}: MovimentacoesEmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center p-12 text-center rounded-3xl border border-dashed border-border/60 bg-card/20 backdrop-blur-xs space-y-5 my-4">
      <div className="h-16 w-16 rounded-3xl bg-[#1F4E79]/10 text-[#1F4E79] flex items-center justify-center shadow-inner">
        <ArrowLeftRight className="h-8 w-8 stroke-[1.75]" />
      </div>

      <div className="max-w-md space-y-1.5">
        <h3 className="text-lg font-semibold text-foreground">
          {hasFiltros ? "Nenhuma movimentação encontrada" : "Nenhuma movimentação registrada"}
        </h3>
        <p className="text-sm text-muted-foreground leading-relaxed">
          {hasFiltros
            ? "Tente ajustar os filtros selecionados para encontrar o que procura ou limpe o formulário de busca."
            : "Comece a registrar suas receitas, despesas e transferências para acompanhar a saúde financeira da sua família."}
        </p>
      </div>

      <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
        {hasFiltros && onLimparFiltros ? (
          <Button
            variant="outline"
            onClick={onLimparFiltros}
            className="rounded-xl border-border/60 font-medium"
          >
            Limpar Filtros
          </Button>
        ) : null}
        <Button
          onClick={onNovaMovimentacao}
          className="bg-[#1F4E79] hover:bg-[#153654] text-white rounded-xl shadow-md hover:shadow-lg transition-all gap-2"
        >
          <Plus className="h-4 w-4" />
          <span>Nova Movimentação</span>
        </Button>
      </div>
    </div>
  );
}
