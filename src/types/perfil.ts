import { z } from "zod";

export interface PerfilUsuario {
  id?: number;
  nome: string;
  email: string;
}

export const perfilUsuarioSchema = z.object({
  nome: z
    .string()
    .min(2, "O nome deve ter pelo menos 2 caracteres.")
    .max(100, "O nome deve ter no máximo 100 caracteres."),
  email: z.string().email("Endereço de e-mail inválido."),
});

export type PerfilUsuarioFormValues = z.infer<typeof perfilUsuarioSchema>;
