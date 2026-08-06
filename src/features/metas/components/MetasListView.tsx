"use client";

import { Meta } from "@/types/metas";
import { MetaListItem } from "./MetaListItem";

interface MetasListViewProps {
  metas: Meta[];
  onAporteResgate: (meta: Meta) => void;
  onEditar: (meta: Meta) => void;
  onDeletar: (meta: Meta) => void;
  onVerDetalhes: (meta: Meta) => void;
}

export function MetasListView({
  metas,
  onAporteResgate,
  onEditar,
  onDeletar,
  onVerDetalhes,
}: MetasListViewProps) {
  return (
    <div className="space-y-2.5">
      <div className="flex items-center justify-between text-xs text-muted-foreground px-1 pb-1">
        <span>Exibindo {metas.length} {metas.length === 1 ? "meta" : "metas"}</span>
      </div>

      <div className="space-y-2.5">
        {metas.map((meta) => (
          <MetaListItem
            key={meta.id}
            meta={meta}
            onAporteResgate={onAporteResgate}
            onEditar={onEditar}
            onDeletar={onDeletar}
            onVerDetalhes={onVerDetalhes}
          />
        ))}
      </div>
    </div>
  );
}
