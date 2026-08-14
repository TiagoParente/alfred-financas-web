import { Metadata } from "next";
import { PerfilUsuarioForm } from "@/features/perfil/components/PerfilUsuarioForm";
import { FamiliaEditForm } from "@/features/perfil/components/FamiliaEditForm";
import { GestaoMembrosFamiliaCard } from "@/features/perfil/components/GestaoMembrosFamiliaCard";
import { Settings, Shield } from "lucide-react";

export const metadata: Metadata = {
  title: "Configurações | Alfred Finanças",
  description: "Gerencie as informações da sua conta e os membros da sua família no Alfred Finanças.",
};

export default function ConfiguracoesPage() {
  return (
    <div className="space-y-8 max-w-5xl mx-auto pb-12">
      {/* Header da Página */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border/40 pb-6">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold text-[#1F4E79] uppercase tracking-wider mb-1">
            <Settings className="h-4 w-4" />
            <span>Preferências do Sistema</span>
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
            Configurações da Conta & Família
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Atualize seus dados pessoais, convide membros para sua família e gerencie as permissões.
          </p>
        </div>
      </div>

      {/* Grid de Seções de Configuração */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start">
        {/* Formulário do Perfil do Usuário */}
        <PerfilUsuarioForm />

        {/* Formulário de Edição da Família */}
        <FamiliaEditForm />
      </div>

      {/* Seção de Gestão de Membros da Família */}
      <GestaoMembrosFamiliaCard />

      {/* Nota Informativa sobre Segurança & Privacidade */}
      <div className="rounded-2xl border border-border/40 bg-accent/20 p-4 sm:p-5 flex items-start gap-4">
        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-[#1F4E79]/10 text-[#1F4E79]">
          <Shield className="h-5 w-5" />
        </div>
        <div className="space-y-1">
          <h4 className="text-xs font-semibold text-foreground uppercase tracking-wider">
            Segurança & Proteção de Dados (LGPD)
          </h4>
          <p className="text-xs text-muted-foreground leading-relaxed">
            Seus dados cadastrais e financeiros são criptografados e acessíveis exclusivamente por você e pelos membros autorizados da sua família. Para alterar seu e-mail de acesso, entre em contato com o suporte do Alfred Finanças.
          </p>
        </div>
      </div>
    </div>
  );
}
