"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Landmark,
  Tag,
  ArrowLeftRight,
  CreditCard,
  Target,
  CalendarSync,
  PieChart,
  Settings,
  Sparkles,
  TrendingUp,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";

interface NavItem {
  titulo: string;
  href: string;
  icone: React.ElementType;
  ativo?: boolean;
  emBreve?: boolean;
}

const navItems: NavItem[] = [
  {
    titulo: "Dashboard",
    href: "/dashboard",
    icone: LayoutDashboard,
    ativo: true,
  },
  {
    titulo: "Projeções",
    href: "/projecoes",
    icone: TrendingUp,
    ativo: true,
  },
  {
    titulo: "Contas Bancárias",
    href: "/contas-bancarias",
    icone: Landmark,
    ativo: true,
  },
  {
    titulo: "Categorias",
    href: "/categorias",
    icone: Tag,
    ativo: true,
  },
  {
    titulo: "Movimentações",
    href: "/movimentacoes",
    icone: ArrowLeftRight,
    ativo: true,
  },
  {
    titulo: "Contas Fixas",
    href: "/contas-fixas",
    icone: CalendarSync,
    ativo: true,
  },
  {
    titulo: "Cartões",
    href: "/cartoes",
    icone: CreditCard,
    ativo: true,
  },
  /*{
    titulo: "Metas & Reservas",
    href: "/metas",
    icone: Target,
    ativo: false,
  },*/
  {
    titulo: "Orçamentos",
    href: "/orcamentos",
    icone: PieChart,
    ativo: true,
  },
  {
    titulo: "Alfred IA",
    href: "/alfred-ia",
    icone: Sparkles,
    ativo: true,
  },
  {
    titulo: "Configurações",
    href: "/configuracoes",
    icone: Settings,
    ativo: true,
  },
];


export function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="hidden md:flex flex-col w-64 border-r border-border/40 bg-background/50 p-4 space-y-6">
      <div className="space-y-1">
        <p className="px-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
          Menu Principal
        </p>
        <nav className="mt-2 space-y-1">
          {navItems.map((item) => {
            const Icone = item.icone;
            const isSelected = item.ativo && pathname.startsWith(item.href);

            if (!item.ativo) {
              return (
                <div
                  key={item.titulo}
                  className="flex items-center justify-between px-3 py-2.5 rounded-xl text-sm font-medium text-muted-foreground/50 cursor-not-allowed"
                >
                  <div className="flex items-center gap-3">
                    <Icone className="h-4 w-4" />
                    <span>{item.titulo}</span>
                  </div>
                  {item.emBreve && (
                    <Badge variant="outline" className="text-[10px] py-0 px-1.5 border-border/40">
                      v2
                    </Badge>
                  )}
                </div>
              );
            }

            return (
              <Link
                key={item.titulo}
                href={item.href}
                className={cn(
                  "flex items-center justify-between px-3 py-2.5 rounded-xl text-sm font-medium transition-colors",
                  isSelected
                    ? "bg-[#1F4E79] text-white shadow-sm"
                    : "text-muted-foreground hover:bg-accent hover:text-foreground"
                )}
              >
                <div className="flex items-center gap-3">
                  <Icone className="h-4 w-4" />
                  <span>{item.titulo}</span>
                </div>
              </Link>
            );
          })}
        </nav>
      </div>

      <Link
        href="/alfred-ia"
        className="mt-auto block p-3.5 rounded-2xl bg-gradient-to-br from-[#1F4E79]/10 to-accent/30 border border-[#1F4E79]/20 hover:border-[#1F4E79]/40 space-y-2.5 transition-all group"
      >
        <div className="flex items-center gap-3">
          <div className="relative h-10 w-10 shrink-0 rounded-full border border-[#1F4E79]/30 overflow-hidden shadow-sm bg-white">
            <Image
              src="/images/brand/alfred.png"
              alt="Alfred IA"
              width={160}
              height={160}
              quality={95}
              className="h-full w-full object-cover"
            />
          </div>
          <div>
            <div className="flex items-center gap-1 text-[#1F4E79] font-bold text-xs">
              <Sparkles className="h-3.5 w-3.5" />
              <span>Alfred IA</span>
            </div>
            <p className="text-[11px] text-muted-foreground font-medium">
              Assessor Financeiro
            </p>
          </div>
        </div>
        <p className="text-xs text-muted-foreground leading-relaxed group-hover:text-foreground transition-colors">
          Converse com o Alfred e receba análises inteligentes sobre sua família.
        </p>
      </Link>
    </aside>
  );
}
