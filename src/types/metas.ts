import { ContaBancaria } from "./contas";

export enum StatusMeta {
  EM_ANDAMENTO = "em_andamento",
  CONCLUIDA = "concluida",
  CANCELADA = "cancelada",
}

export enum TipoMovimentacaoInvestimento {
  APORTE = "aporte",
  RESGATE = "resgate",
}

export interface MovimentacaoInvestimento {
  id: number;
  familia_id: number;
  user_id: number;
  usuario_nome?: string | null;
  conta_bancaria_id: number;
  conta_bancaria?: ContaBancaria | null;
  meta_id?: number | null;
  meta_nome?: string | null;
  meta?: Meta | null;
  tipo: TipoMovimentacaoInvestimento;
  tipo_label: string;
  valor: number;
  data_movimentacao: string;
  motivo: string;
  observacao?: string | null;
  created_at?: string;
  updated_at?: string;
}

export interface Meta {
  id: number;
  familia_id: number;
  nome: string;
  descricao?: string | null;
  valor_alvo: number;
  valor_atual: number;
  valor_restante: number;
  percentual_atingido: number;
  data_limite?: string | null;
  cor_hex?: string | null;
  icone?: string | null;
  status: StatusMeta;
  status_label: string;
  movimentacoes?: MovimentacaoInvestimento[];
  created_at?: string;
  updated_at?: string;
}

export interface ResumoReservas {
  total_saldo_reservas: number;
  total_acumulado_metas: number;
  total_alvo_metas: number;
  percentual_geral_metas: number;
  quantidade_metas_em_andamento: number;
  quantidade_metas_concluidas: number;
}

export interface ListarMetasResponse {
  metas: Meta[];
  resumo: ResumoReservas;
}

export interface CriarMetaPayload {
  nome: string;
  valor_alvo: number;
  valor_atual?: number;
  descricao?: string | null;
  data_limite?: string | null;
  cor_hex?: string | null;
  icone?: string | null;
  status?: StatusMeta;
}

export type AtualizarMetaPayload = Partial<CriarMetaPayload>;

export interface CriarMovimentacaoInvestimentoPayload {
  conta_bancaria_id: number;
  meta_id?: number | null;
  tipo: TipoMovimentacaoInvestimento;
  valor: number;
  data_movimentacao: string;
  motivo: string;
  observacao?: string | null;
}
