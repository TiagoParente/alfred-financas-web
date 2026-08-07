import { Categoria, Subcategoria } from "./categorias";
import { ContaBancaria } from "./contas";
import { CartaoCredito } from "./cartoes";
import { Movimentacao, TipoMovimentacao } from "./movimentacoes";

export enum FrequenciaContaFixa {
  MENSAL = "mensal",
  SEMANAL = "semanal",
  QUINZENAL = "quinzenal",
  ANUAL = "anual",
}

export const FrequenciaContaFixaDescricao: Record<FrequenciaContaFixa, string> = {
  [FrequenciaContaFixa.MENSAL]: "Mensal",
  [FrequenciaContaFixa.SEMANAL]: "Semanal",
  [FrequenciaContaFixa.QUINZENAL]: "Quinzenal",
  [FrequenciaContaFixa.ANUAL]: "Anual",
};

export enum FormaPagamentoContaFixa {
  CONTA_BANCARIA = "conta_bancaria",
  CARTAO_CREDITO = "cartao_credito",
}

export const FormaPagamentoContaFixaDescricao: Record<FormaPagamentoContaFixa, string> = {
  [FormaPagamentoContaFixa.CONTA_BANCARIA]: "Conta Bancária",
  [FormaPagamentoContaFixa.CARTAO_CREDITO]: "Cartão de Crédito",
};

export interface ContaFixa {
  id: number;
  familia_id: number;
  usuario_id: number;
  descricao: string;
  valor: number;
  tipo: TipoMovimentacao;
  tipo_descricao?: string;
  forma_pagamento: FormaPagamentoContaFixa;
  forma_pagamento_descricao?: string;
  frequencia: FrequenciaContaFixa;
  frequencia_descricao?: string;
  dia_vencimento: number;
  ativa: boolean;
  ultima_geracao_em?: string | null;
  observacao?: string | null;
  categoria_id?: number | null;
  categoria?: Categoria | null;
  subcategoria_id?: number | null;
  subcategoria?: Subcategoria | null;
  conta_bancaria_id?: number | null;
  conta_bancaria?: ContaBancaria | null;
  cartao_credito_id?: number | null;
  cartao_credito?: CartaoCredito | null;
  created_at?: string;
  updated_at?: string;
}

export interface CriarContaFixaPayload {
  descricao: string;
  valor: number;
  tipo: TipoMovimentacao;
  forma_pagamento: FormaPagamentoContaFixa;
  frequencia: FrequenciaContaFixa;
  dia_vencimento: number;
  categoria_id?: number | null;
  subcategoria_id?: number | null;
  conta_bancaria_id?: number | null;
  cartao_credito_id?: number | null;
  ativa?: boolean;
  observacao?: string | null;
}

export interface AtualizarContaFixaPayload {
  descricao?: string;
  valor?: number;
  tipo?: TipoMovimentacao;
  forma_pagamento?: FormaPagamentoContaFixa;
  frequencia?: FrequenciaContaFixa;
  dia_vencimento?: number;
  categoria_id?: number | null;
  subcategoria_id?: number | null;
  conta_bancaria_id?: number | null;
  cartao_credito_id?: number | null;
  ativa?: boolean;
  observacao?: string | null;
}

export interface ResultadoGerarLancamentos {
  total_gerados: number;
  lancamentos: Movimentacao[];
}
