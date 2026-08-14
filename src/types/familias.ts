export enum PapelFamilia {
  PROPRIETARIO = "proprietario",
  MEMBRO = "membro",
}

export interface Familia {
  id: number;
  nome: string;
  configurada?: boolean;
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

export interface MembroFamilia {
  id: number;
  name: string;
  email: string;
  papel: PapelFamilia | string;
  ativo: boolean;
  created_at?: string;
}

export interface ConvidarMembroPayload {
  email: string;
  papel?: string;
}

export enum StatusConvite {
  PENDENTE = "pendente",
  ACEITO = "aceito",
  RECUSADO = "recusado",
}

export interface ConviteFamilia {
  id: number;
  familia_id: number;
  familia_nome?: string;
  convidado_por?: {
    id: number;
    name: string;
    email: string;
  };
  email: string;
  papel: string;
  status: StatusConvite | string;
  created_at?: string;
  updated_at?: string;
}


