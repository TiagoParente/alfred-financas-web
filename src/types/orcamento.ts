import { Categoria } from "./categorias";

export enum StatusOrcamento {
  DENTRO_DO_LIMITE = "dentro_do_limite",
  ATENCAO = "atencao",
  EXCEDIDO = "excedido",
}

export interface Orcamento {
  id: number;
  familia_id: number;
  categoria_id: number;
  usuario_id?: number | null;
  mes: number;
  ano: number;
  valor_limite: number;
  valor_gasto: number;
  valor_restante: number;
  percentual_atingido: number;
  observacao?: string | null;
  status: StatusOrcamento;
  status_label: string;
  categoria?: Categoria;
  created_at?: string;
  updated_at?: string;
}

export interface ResumoOrcamentos {
  mes: number;
  ano: number;
  total_orcado: number;
  total_gasto: number;
  saldo_restante: number;
  percentual_geral: number;
  quantidade_total: number;
  quantidade_dentro_do_limite: number;
  quantidade_atencao: number;
  quantidade_excedidos: number;
}

export interface ListarOrcamentosResponse {
  orcamentos: Orcamento[];
  resumo: ResumoOrcamentos;
}

export interface CriarOrcamentoPayload {
  categoria_id: number;
  usuario_id?: number | null;
  mes: number;
  ano: number;
  valor_limite: number;
  observacao?: string | null;
}

export type AtualizarOrcamentoPayload = Partial<CriarOrcamentoPayload>;
