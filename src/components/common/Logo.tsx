import Image from "next/image";
import Link from "next/link";
import { cn } from "@/lib/utils";

interface LogoProps {
  /**
   * Variantes de exibição:
   * - "header": Ícone compacto da marca (logomarca_small.png) + texto estilizado, ideal para o cabeçalho.
   * - "full": Logomarca completa com texto (logomarca.png) em card de destaque, ideal para tela de login/auth.
   * - "small": Apenas a logomarca pequena (logomarca_small.png).
   */
  variant?: "header" | "full" | "small";
  className?: string;
  showLink?: boolean;
  href?: string;
}

export function Logo({
  variant = "full",
  className,
  showLink = false,
  href = "/dashboard",
}: LogoProps) {
  const content = (
    <div className={cn("flex items-center gap-2.5", className)}>
      {variant === "small" ? (
        <div className="relative flex items-center justify-center rounded-xl bg-white p-1 shadow-xs border border-slate-200/80 overflow-hidden h-9 w-9 shrink-0 transition-transform hover:scale-105">
          <Image
            src="/images/brand/logomarca_small.png"
            alt="Alfred Finanças"
            width={40}
            height={40}
            className="h-full w-full object-contain"
            priority
          />
        </div>
      ) : variant === "header" ? (
        <>
          <div className="relative flex items-center justify-center rounded-xl bg-white p-1 shadow-xs border border-slate-200/80 overflow-hidden h-9 w-9 shrink-0 transition-transform hover:scale-105">
            <Image
              src="/images/brand/logomarca_small.png"
              alt="Alfred Finanças"
              width={40}
              height={40}
              className="h-full w-full object-contain"
              priority
            />
          </div>
          <div className="flex items-baseline gap-1">
            <span className="text-base font-bold text-foreground tracking-tight">
              Alfred
            </span>
            <span className="text-xs font-semibold text-[#1F4E79]">
              Finanças
            </span>
          </div>
        </>
      ) : (
        <div className="relative flex items-center justify-center">
          <Image
            src="/images/brand/logomarca.png"
            alt="Alfred Finanças - Seu Assessor Financeiro"
            width={320}
            height={100}
            className="h-auto w-52 sm:w-64 object-contain drop-shadow-xs transition-transform hover:scale-[1.02]"
            priority
          />
        </div>
      )}
    </div>
  );

  if (showLink) {
    return (
      <Link
        href={href}
        className="inline-flex items-center focus:outline-none focus-visible:ring-2 focus-visible:ring-[#1F4E79] rounded-xl transition-opacity hover:opacity-95"
      >
        {content}
      </Link>
    );
  }

  return content;
}

