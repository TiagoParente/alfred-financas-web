import type { Metadata } from "next";
import { Logo } from "@/components/common/Logo";
import { ShieldCheck, Sparkles, TrendingUp, Lock } from "lucide-react";

export const metadata: Metadata = {
  title: "Entrar | Alfred Finanças",
  description:
    "Acesse sua conta no Alfred Finanças para gerenciar suas finanças pessoais e familiares com clareza e segurança.",
};

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen w-full bg-white flex flex-col lg:grid lg:grid-cols-12 overflow-x-hidden transition-colors duration-200">
      {/* Painel Institucional à Esquerda (Fundo Off-White Suave) */}
      <div className="hidden lg:flex lg:col-span-6 xl:col-span-7 relative flex-col justify-between p-12 lg:p-16 bg-[#F4F6F9] border-r border-slate-200/80 select-none">
        {/* Topo: Logo & Selo de Segurança */}
        <div className="relative z-10 flex items-center justify-between">
          <Logo variant="full" />
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white border border-slate-200/80 shadow-xs text-xs font-medium text-slate-700">
            <Lock className="w-3.5 h-3.5 text-[#1F4E79]" />
            <span>Conexão Segura SSL</span>
          </div>
        </div>

        {/* Centro: Hero Branding & Feature Highlights */}
        <div className="relative z-10 my-auto max-w-xl space-y-8 py-8">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#1F4E79]/10 border border-[#1F4E79]/20 text-[#1F4E79] text-xs font-semibold tracking-wide uppercase">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Seu Assessor Financeiro Pessoal</span>
          </div>

          <h2 className="text-3xl sm:text-4xl font-bold tracking-tight text-slate-900 leading-tight">
            Controle total das suas finanças com clareza e previsibilidade.
          </h2>

          <p className="text-base text-slate-600 leading-relaxed font-normal">
            Organize contas bancárias, cartões de crédito e despesas familiares em uma única plataforma intuitiva orientada por IA.
          </p>

          {/* Destaques de Recursos em Cards Brancos Flutuantes */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
            <div className="p-4 rounded-2xl bg-white border border-slate-200/80 shadow-[0_2px_12px_rgba(0,0,0,0.03)] space-y-2">
              <div className="p-2 rounded-lg bg-[#1F4E79]/10 w-fit">
                <TrendingUp className="w-5 h-5 text-[#1F4E79]" />
              </div>
              <h3 className="text-sm font-semibold text-slate-900">Projeções Reais</h3>
              <p className="text-xs text-slate-500">Acompanhe seu fluxo futuro sem surpresas.</p>
            </div>

            <div className="p-4 rounded-2xl bg-white border border-slate-200/80 shadow-[0_2px_12px_rgba(0,0,0,0.03)] space-y-2">
              <div className="p-2 rounded-lg bg-amber-500/10 w-fit">
                <Sparkles className="w-5 h-5 text-amber-600" />
              </div>
              <h3 className="text-sm font-semibold text-slate-900">Insights Alfred</h3>
              <p className="text-xs text-slate-500">Dicas personalizadas para economizar mais.</p>
            </div>

            <div className="p-4 rounded-2xl bg-white border border-slate-200/80 shadow-[0_2px_12px_rgba(0,0,0,0.03)] space-y-2">
              <div className="p-2 rounded-lg bg-sky-500/10 w-fit">
                <ShieldCheck className="w-5 h-5 text-[#1F4E79]" />
              </div>
              <h3 className="text-sm font-semibold text-slate-900">Privacidade</h3>
              <p className="text-xs text-slate-500">Seus dados protegidos e 100% confidenciais.</p>
            </div>
          </div>
        </div>

        {/* Rodapé do Painel */}
        <div className="relative z-10 flex items-center justify-between text-xs text-slate-500 border-t border-slate-200/80 pt-6">
          <span>&copy; {new Date().getFullYear()} Alfred Finanças</span>
          <span className="text-[#1F4E79] font-semibold tracking-wide">
            Clareza hoje. Segurança amanhã.
          </span>
        </div>
      </div>

      {/* Painel do Formulário de Autenticação (Fundo 100% PRETO / ESCURO) */}
      <div className="dark flex-1 flex flex-col justify-center items-center px-4 py-10 lg:col-span-6 xl:col-span-5 lg:px-12 bg-[#09090B] text-slate-100">
        <div className="w-full max-w-md space-y-6">
          {/* Logo exibido apenas no Mobile/Tablet (< lg) */}
          <div className="lg:hidden flex flex-col items-center justify-center pb-2">
            <Logo variant="full" />
          </div>

          {/* Card de autenticação principal (Escuro #18181B) */}
          <div className="rounded-[20px] bg-[#18181B] border border-zinc-800 px-6 py-8 sm:px-8 sm:py-10 shadow-2xl shadow-black/50 transition-all">
            {children}
          </div>

          {/* Rodapé informativo */}
          <p className="text-center text-xs text-zinc-400 flex items-center justify-center gap-1.5">
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            <span>Acesso seguro sem senhas via código OTP.</span>
          </p>
        </div>
      </div>
    </div>
  );
}





