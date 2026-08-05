import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Entrar",
  description:
    "Acesse sua conta Alfred Finanças para gerenciar suas finanças pessoais e familiares.",
};

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        {/* Marca */}
        <div className="mb-8 flex flex-col items-center gap-3">
          <div
            className="flex h-10 w-10 items-center justify-center rounded-xl"
            style={{ backgroundColor: "var(--primary)" }}
            aria-hidden="true"
          >
            <span className="text-base font-bold text-white select-none">A</span>
          </div>
          <p className="text-sm font-medium text-muted-foreground tracking-wide">
            Alfred Finanças
          </p>
        </div>

        {/* Card de autenticação */}
        <div
          className="rounded-2xl bg-card border border-border px-8 py-10 alfred-shadow"
        >
          {children}
        </div>

        {/* Rodapé */}
        <p className="mt-6 text-center text-xs text-muted-foreground">
          Seus dados financeiros são privados e protegidos.
        </p>
      </div>
    </div>
  );
}
