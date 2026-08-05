import { Banco } from "./bancos";

export enum TipoContaBancaria {
  CORRENTE = "corrente",
  POUPANCA = "poupanca",
  INVESTIMENTO = "investimento",
  OUTROS = "outros",
}

export const TipoContaBancariaDescricao: Record<TipoContaBancaria, string> = {
  [TipoContaBancaria.CORRENTE]: "Conta Corrente",
  [TipoContaBancaria.POUPANCA]: "Poupança",
  [TipoContaBancaria.INVESTIMENTO]: "Reserva / Investimento",
  [TipoContaBancaria.OUTROS]: "Outros",
};

export interface ContaBancaria {
  id: number;
  familia_id: number;
  banco_id: number | null;
  banco: Banco | null;
  nome: string;
  instituicao_financeira: string | null;
  tipo_conta: TipoContaBancaria;
  tipo_conta_descricao: string;
  saldo_inicial: number;
  saldo_atual: number;
  incluir_no_saldo_geral: boolean;
  cor_hex: string | null;
  ativo: boolean;
  created_at?: string;
  updated_at?: string;
}

export interface ResumoSaldos {
  saldo_disponivel: number;
  saldo_reservas: number;
  saldo_total: number;
  total_contas: number;
}

export interface ListarContasBancariasResponse {
  contas: ContaBancaria[];
  resumo: ResumoSaldos;
}

export interface CriarContaBancariaPayload {
  banco_id?: number | null;
  nome: string;
  instituicao_financeira?: string | null;
  tipo_conta: TipoContaBancaria;
  saldo_inicial: number;
  incluir_no_saldo_geral?: boolean;
  cor_hex?: string | null;
}

export interface AtualizarContaBancariaPayload {
  banco_id?: number | null;
  nome?: string;
  instituicao_financeira?: string | null;
  tipo_conta?: TipoContaBancaria;
  incluir_no_saldo_geral?: boolean;
  cor_hex?: string | null;
  ativo?: boolean;
}
