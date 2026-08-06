/**
 * Utilitários centralizados de formatação e internacionalização pt-BR.
 * Conforme regras do AGENTS.md, todas as exibições de moeda, datas e valores
 * devem utilizar estas funções padronizadas.
 */

export const formatarMoeda = (valor: number | string | null | undefined): string => {
  if (valor === null || valor === undefined) return "R$ 0,00";
  const numero = typeof valor === "string" ? parseFloat(valor) : valor;
  if (isNaN(numero)) return "R$ 0,00";

  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  }).format(numero);
};

export const formatarData = (
  data: string | Date | null | undefined,
  opcoes: Intl.DateTimeFormatOptions = { day: "2-digit", month: "2-digit", year: "numeric" }
): string => {
  if (!data) return "-";
  const dataObj = typeof data === "string" ? new Date(data) : data;
  if (isNaN(dataObj.getTime())) return "-";

  return new Intl.DateTimeFormat("pt-BR", opcoes).format(dataObj);
};

export const formatarPorcentagem = (valor: number | null | undefined): string => {
  if (valor === null || valor === undefined || isNaN(valor)) return "0%";

  return new Intl.NumberFormat("pt-BR", {
    style: "percent",
    minimumFractionDigits: 1,
    maximumFractionDigits: 2,
  }).format(valor / 100);
};

export const formatarCodigoCompe = (codigo: string | null | undefined): string => {
  if (!codigo) return "";
  return codigo.padStart(3, "0");
};

/**
 * Retorna a primeira data (data_inicio) e a última data (data_fim) no formato YYYY-MM-DD para um dado mês/ano.
 */
export const obterIntervaloMes = (data: Date = new Date()): { data_inicio: string; data_fim: string } => {
  const ano = data.getFullYear();
  const mes = data.getMonth();

  const primeiroDia = new Date(ano, mes, 1);
  const ultimoDia = new Date(ano, mes + 1, 0);

  const formatarIsoDate = (d: Date) => {
    const yyyy = d.getFullYear();
    const mm = String(d.getMonth() + 1).padStart(2, "0");
    const dd = String(d.getDate()).padStart(2, "0");
    return `${yyyy}-${mm}-${dd}`;
  };

  return {
    data_inicio: formatarIsoDate(primeiroDia),
    data_fim: formatarIsoDate(ultimoDia),
  };
};

/**
 * Formata um objeto Date em "Mês de Ano" (ex: "Agosto de 2026").
 */
export const formatarMesAno = (data: Date): string => {
  const str = new Intl.DateTimeFormat("pt-BR", { month: "long", year: "numeric" }).format(data);
  return str.charAt(0).toUpperCase() + str.slice(1);
};

/**
 * Verifica se a data fornecida está no mesmo mês e ano atual.
 */
export const isMesAtual = (data: Date): boolean => {
  const agora = new Date();
  return (
    data.getMonth() === agora.getMonth() && data.getFullYear() === agora.getFullYear()
  );
};

