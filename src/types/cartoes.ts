import { Banco } from "./bancos";
import { Movimentacao } from "./movimentacoes";

export enum BandeiraCartao {
  VISA = "visa",
  MASTERCARD = "mastercard",
  ELO = "elo",
  AMEX = "amex",
  HIPERCARD = "hipercard",
  OUTROS = "outros",
}

export const BandeiraCartaoDescricao: Record<BandeiraCartao, string> = {
  [BandeiraCartao.VISA]: "Visa",
  [BandeiraCartao.MASTERCARD]: "Mastercard",
  [BandeiraCartao.ELO]: "Elo",
  [BandeiraCartao.AMEX]: "American Express",
  [BandeiraCartao.HIPERCARD]: "Hipercard",
  [BandeiraCartao.OUTROS]: "Outros",
};

export enum StatusFatura {
  ABERTA = "aberta",
  FECHADA = "fechada",
  PAGA = "paga",
}

export const StatusFaturaDescricao: Record<StatusFatura, string> = {
  [StatusFatura.ABERTA]: "Aberta",
  [StatusFatura.FECHADA]: "Fechada",
  [StatusFatura.PAGA]: "Paga",
};

export interface CartaoCredito {
  id: number;
  familia_id: number;
  banco_id: number | null;
  banco?: Banco | null;
  nome: string;
  bandeira: BandeiraCartao | null;
  bandeira_descricao?: string | null;
  limite: number;
  limite_usado: number;
  limite_disponivel: number;
  fatura_atual: number;
  dia_fechamento: number;
  dia_vencimento: number;
  cor_hex: string | null;
  ativo: boolean;
  created_at?: string;
  updated_at?: string;
}

export interface ResumoCartoes {
  limite_total: number;
  limite_usado_total: number;
  limite_disponivel_total: number;
  fatura_atual_total: number;
  total_cartoes: number;
}

export interface ListarCartoesCreditoResponse {
  cartoes: CartaoCredito[];
  resumo: ResumoCartoes;
}

export interface ParcelaFatura {
  id: number;
  familia_id: number;
  movimentacao_id: number;
  cartao_credito_id: number;
  numero_parcela: number;
  total_parcelas: number;
  valor: number;
  data_vencimento: string;
  mes_fatura: string;
  status: string;
  status_descricao?: string;
  movimentacao?: Movimentacao;
}

export interface DetalhesFaturaResponse {
  cartao_id: number;
  mes_ano_referencia: string;
  status: StatusFatura;
  status_descricao: string;
  data_inicio_ciclo: string;
  data_fechamento_ciclo: string;
  data_fim_compras?: string;
  data_vencimento_ciclo: string;
  valor_total: number;
  total_itens: number;
  itens: Movimentacao[];
  parcelas?: ParcelaFatura[];
}

export interface CriarCartaoCreditoPayload {
  banco_id?: number | null;
  nome: string;
  bandeira?: BandeiraCartao | string | null;
  limite: number;
  dia_fechamento: number;
  dia_vencimento: number;
  cor_hex?: string | null;
}

export interface AtualizarCartaoCreditoPayload {
  banco_id?: number | null;
  nome?: string;
  bandeira?: BandeiraCartao | string | null;
  limite?: number;
  dia_fechamento?: number;
  dia_vencimento?: number;
  cor_hex?: string | null;
  ativo?: boolean;
}

export interface PagarFaturaPayload {
  conta_bancaria_id: number;
  mes_ano?: string;
  data_pagamento?: string;
  observacao?: string;
}

export interface PagarFaturaResponse {
  fatura: DetalhesFaturaResponse;
  cartao: CartaoCredito;
  valor_pago: number;
  conta_bancaria: {
    id: number;
    nome: string;
    saldo_atual: number;
  };
}
