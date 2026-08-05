export interface Banco {
  id: number;
  codigo_compe: string | null;
  nome: string;
  nome_curto: string;
  logo_path: string | null;
  logo_url: string | null;
  cor_hex: string | null;
}
