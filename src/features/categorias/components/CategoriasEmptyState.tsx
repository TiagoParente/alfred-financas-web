import { Tag, Plus, Download } from "lucide-react";
import { Button } from "@/components/ui/button";

interface CategoriasEmptyStateProps {
  onNovaCategoria: () => void;
  onImportarPadroes: () => void;
  isImportando?: boolean;
}

export function CategoriasEmptyState({
  onNovaCategoria,
  onImportarPadroes,
  isImportando = false,
}: CategoriasEmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center rounded-[20px] border border-dashed border-border/80 bg-accent/10 p-12 text-center">
      <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-[#1F4E79]/10 text-[#1F4E79] mb-4">
        <Tag className="h-8 w-8" />
      </div>
      <h3 className="text-lg font-bold text-foreground">Nenhuma categoria cadastrada</h3>
      <p className="mt-1.5 max-w-md text-sm text-muted-foreground leading-relaxed">
        Você pode importar o catálogo com dezenas de categorias e subcategorias padrão do sistema ou criar suas próprias categorias personalizadas.
      </p>
      <div className="mt-6 flex flex-col sm:flex-row gap-3">
        <Button
          onClick={onImportarPadroes}
          disabled={isImportando}
          variant="outline"
          className="rounded-[10px] border-border/60 hover:bg-accent text-foreground font-medium gap-2"
        >
          <Download className="h-4 w-4" />
          <span>{isImportando ? "Importando..." : "Importar Categorias Padrão"}</span>
        </Button>
        <Button
          onClick={onNovaCategoria}
          className="rounded-[10px] bg-[#1F4E79] hover:bg-[#1F4E79]/90 text-white font-medium gap-2"
        >
          <Plus className="h-4 w-4" />
          <span>Criar Categoria</span>
        </Button>
      </div>
    </div>
  );
}
