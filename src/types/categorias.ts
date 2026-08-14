export enum TipoCategoria {
  RECEITA = "receita",
  DESPESA = "despesa",
}

export const TipoCategoriaDescricao: Record<TipoCategoria, string> = {
  [TipoCategoria.RECEITA]: "Receita",
  [TipoCategoria.DESPESA]: "Despesa",
};

export interface Subcategoria {
  id: number;
  categoria_id: number;
  nome: string;
  ativo: boolean;
  created_at?: string;
  updated_at?: string;
}

export interface Categoria {
  id: number;
  familia_id: number;
  e_do_sistema?: boolean;
  nome: string;
  tipo: TipoCategoria;
  tipo_label: string;
  icone: string | null;
  cor_hex: string | null;
  ativo: boolean;
  subcategorias?: Subcategoria[];
  created_at?: string;
  updated_at?: string;
}

export interface CriarCategoriaPayload {
  nome: string;
  tipo: TipoCategoria;
  icone?: string | null;
  cor_hex?: string | null;
}

export interface AtualizarCategoriaPayload {
  nome?: string;
  tipo?: TipoCategoria;
  icone?: string | null;
  cor_hex?: string | null;
  ativo?: boolean;
}

export interface CriarSubcategoriaPayload {
  nome: string;
}

export interface AtualizarSubcategoriaPayload {
  nome?: string;
  categoria_id?: number;
  ativo?: boolean;
}
