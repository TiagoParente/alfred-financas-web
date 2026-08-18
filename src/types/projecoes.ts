export interface ProjecaoPontoCritico {
  mes: number;
  ano: number;
  mes_ano: string;
  nome_mes: string;
  nome_mes_completo: string;
  saldo_acumulado: number;
}

export interface ProjecaoResumo {
  saldo_atual_disponivel: number;
  saldo_final_projetado: number;
  variacao_saldo: number;
  media_receitas_mensal: number;
  media_despesas_mensal: number;
  media_sobra_mensal: number;
  taxa_comprometimento_renda: number;
  ponto_critico: ProjecaoPontoCritico | null;
}

export interface ProjecaoMesDetalhes {
  receitas_fixas?: number;
  receitas_avulsas?: number;
  despesas_contas?: number;
  despesas_contas_fixas?: number;
  despesas_contas_avulsas?: number;
  faturas_cartao?: number;
  parcelas_cartao?: number;
  contas_fixas_cartao?: number;
}

export interface ProjecaoMesItem {
  mes: number;
  ano: number;
  mes_ano: string;
  nome_mes: string;
  nome_mes_completo: string;
  total_receitas: number;
  total_despesas: number;
  balanco_mensal: number;
  saldo_acumulado: number;
  is_projecao: boolean;
  detalhes: ProjecaoMesDetalhes;
}

export interface ProjecaoCategoriaMesDetalhe {
  mes: number;
  ano: number;
  mes_ano: string;
  nome_mes: string;
  fixo: number;
  parcelas: number;
  orcamento_limite: number | null;
  total: number;
}

export interface ProjecaoCategoriaItem {
  categoria_id: number;
  nome: string;
  tipo: "receita" | "despesa";
  icone: string;
  cor_hex: string;
  total_periodo: number;
  media_mensal: number;
  meses: Record<string, ProjecaoCategoriaMesDetalhe>;
}

export interface ProjecaoAlfredInsights {
  titulo: string;
  mensagens: string[];
  nivel_alerta: "normal" | "atencao" | "critico";
}

// Projeção de Cartões de Crédito
export interface CartaoFaturaMesDetalhe {
  mes_ano: string;
  nome_mes: string;
  ano: number;
  parcelas_compras: number;
  contas_fixas: number;
  total_fatura: number;
}

export interface CartaoProjecaoItem {
  id: number;
  nome: string;
  bandeira: string;
  cor_hex: string;
  limite: number;
  dia_fechamento: number;
  dia_vencimento: number;
  total_periodo: number;
  media_mensal: number;
  meses: Record<string, CartaoFaturaMesDetalhe>;
}

export interface ProjecaoCartaoMesItem {
  mes: number;
  ano: number;
  mes_ano: string;
  nome_mes: string;
  nome_mes_completo: string;
  is_projecao: boolean;
  total_faturas: number;
  total_parcelas: number;
  total_fixas_cartao: number;
  faturas_por_cartao: Record<number, CartaoFaturaMesDetalhe>;
}

export interface ParcelamentoEncerrandoItem {
  movimentacao_id: number;
  descricao: string;
  cartao_id: number;
  cartao_nome: string;
  cor_hex: string;
  valor_parcela: number;
  total_parcelas: number;
  mes_ultima_parcela: string;
  nome_mes_ultima_parcela: string;
  alivio_a_partir_de: string;
}

export interface ProjecaoCartoesResumo {
  fatura_mes_atual: number;
  fatura_menor_mes: {
    mes_ano: string;
    nome_mes: string;
    nome_mes_completo: string;
    ano: number;
    valor: number;
  } | null;
  reducao_total_periodo: number;
  percentual_reducao: number;
  total_faturas_periodo: number;
  media_mensal: number;
}

export interface ProjecaoCartoesData {
  resumo: ProjecaoCartoesResumo;
  meses: ProjecaoCartaoMesItem[];
  cartoes: CartaoProjecaoItem[];
  parcelamentos_encerrando: ParcelamentoEncerrandoItem[];
}

export interface ProjecaoData {
  periodo_meses: number;
  regime: "caixa" | "competencia";
  resumo: ProjecaoResumo;
  meses: ProjecaoMesItem[];
  categorias: ProjecaoCategoriaItem[];
  projecao_cartoes?: ProjecaoCartoesData;
  alfred_insights: ProjecaoAlfredInsights;
}

export interface SimuladorAjuste {
  id: string;
  descricao: string;
  tipo: "receita" | "despesa";
  valor: number;
  frequencia: "mensal" | "pontual";
  mes_inicio: string; // "YYYY-MM"
  ativo: boolean;
}
