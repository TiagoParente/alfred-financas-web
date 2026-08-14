"use client";

import { useLogout } from "@/hooks/useAuth";
import { usePerfil } from "@/features/perfil/hooks/usePerfil";
import { FamiliaSelector } from "./FamiliaSelector";
import { Logo } from "./Logo";
import { LogOut, Settings } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import Link from "next/link";

export function Header() {
  const logout = useLogout();
  const { usuario } = usePerfil();

  const iniciais = usuario?.nome
    ? usuario.nome
      .split(" ")
      .map((n) => n[0])
      .slice(0, 2)
      .join("")
      .toUpperCase()
    : "A";

  return (
    <header className="sticky top-0 z-30 flex h-16 w-full items-center justify-between border-b border-border/40 bg-background/80 px-4 md:px-6 backdrop-blur-md">
      <div className="flex items-center gap-3">
        <Logo variant="header" showLink href="/dashboard" />
      </div>

      <div className="flex items-center gap-3">
        <FamiliaSelector />

        <DropdownMenu>
          <DropdownMenuTrigger className="flex items-center gap-2 rounded-full p-1 hover:ring-2 hover:ring-[#1F4E79]/20 focus:outline-none transition-all">
            <Avatar className="h-9 w-9 bg-[#1F4E79]/10 border border-[#1F4E79]/20">
              <AvatarFallback className="font-semibold text-[#1F4E79]">
                {iniciais}
              </AvatarFallback>
            </Avatar>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56 rounded-xl">
            <DropdownMenuLabel className="font-normal">
              <div className="flex flex-col space-y-1">
                <p className="text-sm font-medium leading-none text-foreground">
                  {usuario?.nome || "Usuário Alfred"}
                </p>
                <p className="text-xs leading-none text-muted-foreground truncate">
                  {usuario?.email || ""}
                </p>
              </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem className="cursor-pointer p-0">
              <Link href="/configuracoes" className="flex w-full items-center gap-2 px-1.5 py-1">
                <Settings className="h-4 w-4" />
                <span>Configurações</span>
              </Link>
            </DropdownMenuItem>

            <DropdownMenuSeparator />
            <DropdownMenuItem
              onClick={() => logout()}
              className="flex items-center gap-2 text-red-500 focus:text-red-500 cursor-pointer"
            >
              <LogOut className="h-4 w-4" />
              <span>Sair da Conta</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}

