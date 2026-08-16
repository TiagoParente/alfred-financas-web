import { Orcamento, ResumoOrcamentos } from "./orcamento";
import { Meta, ResumoReservas } from "./metas";

export interface DashboardSaldos {
  saldo_disponivel: number;
  saldo_reservas: number;
  saldo_total: number;
  total_contas: number;
}

export type RegimeDashboard = "caixa" | "competencia";

export interface DetalheRegimeMensal {
  total_despesas: number;
  balanco_mensal: number;
  despesas_contas: number;
  faturas_cartao?: number;
  compras_cartao?: number;
}

export interface DashboardMensal {
  mes: number;
  ano: number;
  regime?: RegimeDashboard;
  total_receitas: number;
  total_despesas: number;
  balanco_mensal: number;
  total_investimentos: number;
  caixa?: DetalheRegimeMensal;
  competencia?: DetalheRegimeMensal;
}

export interface ProximoVencimento {
  id: number | string;
  descricao: string;
  valor: number;
  data_vencimento: string | null;
  origem: "conta" | "cartao";
  categoria_nome?: string | null;
  categoria_icone?: string | null;
  categoria_cor?: string | null;
}

export interface AlfredInsights {
  titulo: string;
  mensagens: string[];
  nivel_alerta: "normal" | "atencao" | "critico";
}

export interface ContaEvolucaoSaldo {
  id: number;
  nome: string;
  saldo: number;
  cor_hex: string | null;
}

export interface HistoricoInvestimentoItem {
  mes: number;
  ano: number;
  mes_ano: string;
  entradas: number;
  saidas: number;
  saldo_liquido: number;
  saldo_total: number;
  total: number;
  contas: ContaEvolucaoSaldo[];
}

export interface EvolucaoInvestimentosResumo {
  variacao_valor: number;
  variacao_percentual: number;
  tendencia: "subiu" | "desceu" | "estavel";
  historico: HistoricoInvestimentoItem[];
}

export interface DashboardData {
  familia_nome: string;
  saldos: DashboardSaldos;
  mensal: DashboardMensal;
  proximos_vencimentos: ProximoVencimento[];
  resumo_orcamentos: ResumoOrcamentos;
  orcamentos: Orcamento[];
  resumo_metas: ResumoReservas;
  metas: Meta[];
  evolucao_investimentos?: EvolucaoInvestimentosResumo;
  alfred_insights: AlfredInsights;
}
