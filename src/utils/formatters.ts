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
