"use client";

import { useState } from "react";
import { ChevronLeft, ChevronRight, CalendarDays } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { isMesAtual, formatarMesAno } from "@/utils/formatters";

interface SeletorMesProps {
  dataAtual: Date;
  onDataChange: (novaData: Date) => void;
  className?: string;
}

const MESES_ABREVIADOS = [
  "Jan", "Fev", "Mar", "Abr", "Mai", "Jun",
  "Jul", "Ago", "Set", "Out", "Nov", "Dez",
];

const MESES = [
  "Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho",
  "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro",
];

export function SeletorMes({ dataAtual, onDataChange, className = "" }: SeletorMesProps) {
  const anoAtual = new Date().getFullYear();
  const selectedAno = dataAtual.getFullYear();
  const selectedMes = dataAtual.getMonth();

  const [slideDir, setSlideDir] = useState<"left" | "right" | null>(null);
  const [animKey, setAnimKey] = useState(0);

  const anosDisponiveis = Array.from({ length: 8 }, (_, i) => anoAtual - 5 + i);
  if (!anosDisponiveis.includes(selectedAno)) {
    anosDisponiveis.push(selectedAno);
    anosDisponiveis.sort((a, b) => a - b);
  }

  const triggerAnim = (dir: "left" | "right", novaData: Date) => {
    setSlideDir(dir);
    setAnimKey((k) => k + 1);
    onDataChange(novaData);
    // Limpa a direção após a animação
    setTimeout(() => setSlideDir(null), 250);
  };

  const handleMesAnterior = () => {
    triggerAnim("left", new Date(selectedAno, selectedMes - 1, 1));
  };

  const handleProximoMes = () => {
    triggerAnim("right", new Date(selectedAno, selectedMes + 1, 1));
  };

  const handleMudarMes = (val: string | null) => {
    if (val === null) return;
    const mesIndex = parseInt(val, 10);
    const dir = mesIndex < selectedMes ? "left" : "right";
    triggerAnim(dir, new Date(selectedAno, mesIndex, 1));
  };

  const handleMudarAno = (val: string | null) => {
    if (val === null) return;
    const anoNum = parseInt(val, 10);
    const dir = anoNum < selectedAno ? "left" : "right";
    triggerAnim(dir, new Date(anoNum, selectedMes, 1));
  };

  const handleIrParaMesAtual = () => {
    const agora = new Date();
    const dir = agora < dataAtual ? "left" : "right";
    triggerAnim(dir, agora);
  };

  const mesAtualAtivo = isMesAtual(dataAtual);
  const labelCompleto = formatarMesAno(dataAtual);

  return (
    <>
      {/* Estilos de animação inline para slide do mês */}
      <style>{`
        @keyframes slide-in-left {
          from { opacity: 0; transform: translateX(-12px); }
          to   { opacity: 1; transform: translateX(0); }
        }
        @keyframes slide-in-right {
          from { opacity: 0; transform: translateX(12px); }
          to   { opacity: 1; transform: translateX(0); }
        }
        .animate-slide-left  { animation: slide-in-left  220ms cubic-bezier(0.16,1,0.3,1) both; }
        .animate-slide-right { animation: slide-in-right 220ms cubic-bezier(0.16,1,0.3,1) both; }
      `}</style>

      <div
        className={`flex flex-col sm:flex-row sm:items-center gap-2 ${className}`}
        aria-label="Seletor de período mensal"
      >
        {/* ── Controle Principal ── */}
        <div
          className="
            flex items-center gap-0
            bg-background/70 dark:bg-card/60
            border border-border/50
            shadow-sm
            rounded-lg
            overflow-hidden
            backdrop-blur-md
            transition-shadow duration-200
            hover:shadow-md
          "
        >
          {/* Botão Mês Anterior */}
          <button
            onClick={handleMesAnterior}
            aria-label="Mês anterior"
            className="
              flex items-center justify-center
              h-10 w-10 shrink-0
              text-muted-foreground
              hover:text-foreground hover:bg-accent/60
              transition-colors duration-150
              focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring
              cursor-pointer
            "
          >
            <ChevronLeft className="h-4 w-4" />
          </button>

          {/* Separador vertical */}
          <span className="w-px h-5 bg-border/60 shrink-0" aria-hidden="true" />

          {/* Centro: ícone + label animado + selects */}
          <div className="flex items-center gap-2 px-3 py-2 min-w-[180px] sm:min-w-[220px]">
            <CalendarDays className="h-4 w-4 text-[#1F4E79] dark:text-blue-400 shrink-0" aria-hidden="true" />

            {/* Label animado (oculto em mobile, substituído pelos selects) */}
            <div className="hidden sm:flex items-center gap-1 overflow-hidden">
              {/* Mês select */}
              <Select value={String(selectedMes)} onValueChange={handleMudarMes}>
                <SelectTrigger
                  className="
                    h-auto px-1.5 py-0.5 rounded-md border-none bg-transparent shadow-none
                    text-sm font-semibold text-foreground
                    focus:ring-0 focus-visible:ring-0
                    hover:text-[#1F4E79] dark:hover:text-blue-400 hover:bg-accent/40
                    transition-colors duration-150
                    cursor-pointer
                    [&>svg]:ml-1 [&>svg]:h-3.5 [&>svg]:w-3.5 [&>svg]:text-muted-foreground
                  "
                  aria-label="Selecionar mês"
                >
                  <SelectValue>
                    <span
                      key={animKey}
                      className={
                        slideDir === "left"
                          ? "animate-slide-left inline-block"
                          : slideDir === "right"
                          ? "animate-slide-right inline-block"
                          : "inline-block"
                      }
                    >
                      {MESES[selectedMes]}
                    </span>
                  </SelectValue>
                </SelectTrigger>
                <SelectContent className="rounded-md min-w-[130px]">
                  {MESES.map((nomeMes, index) => (
                    <SelectItem
                      key={index}
                      value={String(index)}
                      label={nomeMes}
                      className={index === selectedMes ? "font-semibold text-[#1F4E79] dark:text-blue-400" : ""}
                    >
                      {nomeMes}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <span className="text-muted-foreground text-xs select-none">de</span>

              {/* Ano select */}
              <Select value={String(selectedAno)} onValueChange={handleMudarAno}>
                <SelectTrigger
                  className="
                    h-auto px-1.5 py-0.5 rounded-md border-none bg-transparent shadow-none
                    text-sm font-semibold text-foreground
                    focus:ring-0 focus-visible:ring-0
                    hover:text-[#1F4E79] dark:hover:text-blue-400 hover:bg-accent/40
                    transition-colors duration-150
                    cursor-pointer
                    [&>svg]:ml-1 [&>svg]:h-3.5 [&>svg]:w-3.5 [&>svg]:text-muted-foreground
                  "
                  aria-label="Selecionar ano"
                >
                  <SelectValue>
                    <span
                      key={`ano-${animKey}`}
                      className={
                        slideDir === "left"
                          ? "animate-slide-left inline-block"
                          : slideDir === "right"
                          ? "animate-slide-right inline-block"
                          : "inline-block"
                      }
                    >
                      {selectedAno}
                    </span>
                  </SelectValue>
                </SelectTrigger>
                <SelectContent className="rounded-md min-w-[90px]">
                  {anosDisponiveis.map((ano) => (
                    <SelectItem
                      key={ano}
                      value={String(ano)}
                      label={String(ano)}
                      className={ano === selectedAno ? "font-semibold text-[#1F4E79] dark:text-blue-400" : ""}
                    >
                      {ano}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Mobile: label compacto em abreviado + selects compactos */}
            <div className="flex sm:hidden items-center gap-1">
              <Select value={String(selectedMes)} onValueChange={handleMudarMes}>
                <SelectTrigger
                  className="
                    h-auto p-0 border-none bg-transparent shadow-none
                    text-sm font-semibold text-foreground
                    focus:ring-0 focus-visible:ring-0 cursor-pointer
                    [&>svg]:ml-0.5 [&>svg]:h-3 [&>svg]:w-3 [&>svg]:text-muted-foreground
                  "
                  aria-label="Selecionar mês"
                >
                  <SelectValue>
                    <span
                      key={`mob-${animKey}`}
                      className={
                        slideDir === "left"
                          ? "animate-slide-left inline-block"
                          : slideDir === "right"
                          ? "animate-slide-right inline-block"
                          : "inline-block"
                      }
                    >
                      {MESES_ABREVIADOS[selectedMes]}
                    </span>
                  </SelectValue>
                </SelectTrigger>
                <SelectContent className="rounded-md">
                  {MESES.map((nomeMes, index) => (
                    <SelectItem key={index} value={String(index)} label={nomeMes}>
                      {nomeMes}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <span className="text-muted-foreground text-xs">/</span>

              <Select value={String(selectedAno)} onValueChange={handleMudarAno}>
                <SelectTrigger
                  className="
                    h-auto p-0 border-none bg-transparent shadow-none
                    text-sm font-semibold text-foreground
                    focus:ring-0 focus-visible:ring-0 cursor-pointer
                    [&>svg]:ml-0.5 [&>svg]:h-3 [&>svg]:w-3 [&>svg]:text-muted-foreground
                  "
                  aria-label="Selecionar ano"
                >
                  <SelectValue>{selectedAno}</SelectValue>
                </SelectTrigger>
                <SelectContent className="rounded-md">
                  {anosDisponiveis.map((ano) => (
                    <SelectItem key={ano} value={String(ano)} label={String(ano)}>
                      {ano}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Separador vertical */}
          <span className="w-px h-5 bg-border/60 shrink-0" aria-hidden="true" />

          {/* Botão Próximo Mês */}
          <button
            onClick={handleProximoMes}
            aria-label="Próximo mês"
            className="
              flex items-center justify-center
              h-10 w-10 shrink-0
              text-muted-foreground
              hover:text-foreground hover:bg-accent/60
              transition-colors duration-150
              focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring
              cursor-pointer
            "
          >
            <ChevronRight className="h-4 w-4" />
          </button>
        </div>

        {/* ── Badge "Mês Atual" ── */}
        {!mesAtualAtivo && (
          <button
            onClick={handleIrParaMesAtual}
            title={`Ir para ${labelCompleto} (mês atual)`}
            aria-label="Voltar ao mês atual"
            className="
              flex items-center gap-1.5
              h-10 px-3.5
              rounded-lg
              text-xs font-semibold
              bg-[#1F4E79]/10 dark:bg-blue-500/10
              text-[#1F4E79] dark:text-blue-400
              border border-[#1F4E79]/20 dark:border-blue-500/20
              hover:bg-[#1F4E79]/20 dark:hover:bg-blue-500/20
              hover:border-[#1F4E79]/40 dark:hover:border-blue-500/40
              transition-all duration-200
              cursor-pointer
              focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1F4E79]
              whitespace-nowrap
            "
          >
            {/* Pulsing dot */}
            <span className="relative flex h-2 w-2 shrink-0" aria-hidden="true">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#1F4E79] dark:bg-blue-400 opacity-60" />
              <span className="relative inline-flex rounded-full h-2 w-2 bg-[#1F4E79] dark:bg-blue-400" />
            </span>
            Hoje
          </button>
        )}
      </div>
    </>
  );
}
