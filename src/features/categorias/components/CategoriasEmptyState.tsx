import { Tag, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";

interface CategoriasEmptyStateProps {
  onNovaCategoria: () => void;
}

export function CategoriasEmptyState({
  onNovaCategoria,
}: CategoriasEmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center rounded-[20px] border border-dashed border-border/80 bg-accent/10 p-12 text-center">
      <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-[#1F4E79]/10 text-[#1F4E79] mb-4">
        <Tag className="h-8 w-8" />
      </div>
      <h3 className="text-lg font-bold text-foreground">Nenhuma categoria cadastrada</h3>
      <p className="mt-1.5 max-w-md text-sm text-muted-foreground leading-relaxed">
        Crie suas próprias categorias personalizadas para organizar as receitas e despesas da sua família com total liberdade.
      </p>
      <div className="mt-6 flex flex-col sm:flex-row gap-3">
        <Button
          onClick={onNovaCategoria}
          className="rounded-[10px] bg-[#1F4E79] hover:bg-[#1F4E79]/90 text-white font-medium gap-2 cursor-pointer"
        >
          <Plus className="h-4 w-4" />
          <span>Criar Primeira Categoria</span>
        </Button>
      </div>
    </div>
  );
}
