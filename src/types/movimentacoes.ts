import { Categoria, Subcategoria } from "./categorias";
import { ContaBancaria } from "./contas";
import { CartaoCredito } from "./cartoes";

export enum TipoMovimentacao {
  RECEITA = "receita",
  DESPESA = "despesa",
  TRANSFERENCIA = "transferencia",
}

export const TipoMovimentacaoDescricao: Record<TipoMovimentacao, string> = {
  [TipoMovimentacao.RECEITA]: "Receita",
  [TipoMovimentacao.DESPESA]: "Despesa",
  [TipoMovimentacao.TRANSFERENCIA]: "Transferência",
};

export enum StatusMovimentacao {
  PAGO = "pago",
  PENDENTE = "pendente",
}

export const StatusMovimentacaoDescricao: Record<StatusMovimentacao, string> = {
  [StatusMovimentacao.PAGO]: "Pago / Recebido",
  [StatusMovimentacao.PENDENTE]: "Pendente",
};

export interface ResumoPeriodo {
  total_receitas: number;
  total_despesas: number;
  saldo_periodo: number;
  total_pendente: number;
}

export interface Movimentacao {
  id: number;
  familia_id: number;
  usuario_id: number;
  usuario_nome: string | null;
  conta_bancaria_id?: number | null;
  conta_bancaria?: ContaBancaria | null;
  conta_bancaria_destino_id?: number | null;
  conta_bancaria_destino?: ContaBancaria | null;
  cartao_credito_id?: number | null;
  cartao_credito?: CartaoCredito | null;
  categoria_id?: number | null;
  categoria?: Categoria | null;
  subcategoria_id?: number | null;
  subcategoria?: Subcategoria | null;
  descricao: string;
  valor: number;
  tipo: TipoMovimentacao;
  tipo_descricao?: string;
  status: StatusMovimentacao;
  status_descricao?: string;
  data_movimentacao: string;
  data_vencimento?: string | null;
  data_pagamento?: string | null;
  observacao?: string | null;
  anexo_url?: string | null;
  created_at?: string;
  updated_at?: string;
}

export interface FiltroMovimentacaoParams {
  data_inicio?: string;
  data_fim?: string;
  tipo?: TipoMovimentacao;
  status?: StatusMovimentacao;
  categoria_id?: number;
  conta_bancaria_id?: number;
  cartao_credito_id?: number;
  busca?: string;
  per_page?: number;
  page?: number;
}

export interface CriarMovimentacaoPayload {
  conta_bancaria_id?: number | null;
  conta_bancaria_destino_id?: number | null;
  cartao_credito_id?: number | null;
  categoria_id?: number | null;
  subcategoria_id?: number | null;
  descricao: string;
  valor: number;
  tipo: TipoMovimentacao;
  status: StatusMovimentacao;
  data_movimentacao: string;
  data_vencimento?: string | null;
  data_pagamento?: string | null;
  observacao?: string | null;
  anexo_url?: string | null;
}

export interface AtualizarMovimentacaoPayload {
  conta_bancaria_id?: number | null;
  conta_bancaria_destino_id?: number | null;
  cartao_credito_id?: number | null;
  categoria_id?: number | null;
  subcategoria_id?: number | null;
  descricao?: string;
  valor?: number;
  tipo?: TipoMovimentacao;
  status?: StatusMovimentacao;
  data_movimentacao?: string;
  data_vencimento?: string | null;
  data_pagamento?: string | null;
  observacao?: string | null;
  anexo_url?: string | null;
}

export interface MovimentacoesPaginadasResponse {
  data: Movimentacao[];
  meta: {
    current_page: number;
    last_page: number;
    per_page: number;
    total: number;
  };
  resumo: ResumoPeriodo;
}
