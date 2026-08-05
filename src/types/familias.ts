export enum PapelFamilia {
  PROPRIETARIO = "proprietario",
  MEMBRO = "membro",
}

export interface Familia {
  id: number;
  nome: string;
  papel?: PapelFamilia | string | null;
  created_at?: string;
  updated_at?: string;
}

export interface CriarFamiliaPayload {
  nome: string;
}

export interface AtualizarFamiliaPayload {
  nome: string;
}
