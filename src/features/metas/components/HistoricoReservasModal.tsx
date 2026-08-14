"use client";

import { MovimentacaoInvestimento, TipoMovimentacaoInvestimento } from "@/types/metas";
import { formatarData, formatarMoeda } from "@/utils/formatters";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  ArrowUpRight,
  ArrowDownLeft,
  Trash2,
  History,
  Calendar,
  Landmark,
  User,
  Target,
} from "lucide-react";
import { useMovimentacoesInvestimento } from "../hooks/useMovimentacoesInvestimento";

interface HistoricoReservasModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  familiaId?: number | null;
}

export function HistoricoReservasModal({
  open,
  onOpenChange,
  familiaId,
}: HistoricoReservasModalProps) {
  const {
    movimentacoes,
    isLoading,
    deletarMovimentacao,
    isDeletando,
  } = useMovimentacoesInvestimento(familiaId);

  const handleDeletar = async (id: number) => {
    if (
      confirm(
        "Tem certeza que deseja excluir esta movimentação? Os saldos da conta bancária e da meta serão reajustados automaticamente."
      )
    ) {
      await deletarMovimentacao(id);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[680px] rounded-[20px] p-6 max-h-[85vh] flex flex-col">
        <DialogHeader className="space-y-1 border-b border-border/40 pb-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#1F4E79] text-white shadow-sm font-bold">
              <History className="h-5 w-5" />
            </div>
            <div>
              <DialogTitle className="text-lg font-bold text-foreground">
                Histórico Consolidado de Reservas
              </DialogTitle>
              <DialogDescription className="text-xs text-muted-foreground">
                Todas as movimentações de aportes e resgates realizadas pela família
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        {/* Lista de Extrato / Movimentações */}
        <div className="flex-1 overflow-y-auto py-4 space-y-3 pr-1">
          {isLoading ? (
            <div className="py-8 text-center text-xs text-muted-foreground">
              Carregando histórico de movimentações...
            </div>
          ) : movimentacoes.length === 0 ? (
            <div className="py-8 text-center space-y-1">
              <p className="text-sm font-medium text-foreground">
                Nenhuma movimentação de reserva registrada
              </p>
              <p className="text-xs text-muted-foreground">
                Utilize o botão &quot;Aporte / Resgate&quot; para registrar sua primeira movimentação.
              </p>
            </div>
          ) : (
            movimentacoes.map((item: MovimentacaoInvestimento) => {
              const isAporte = item.tipo === TipoMovimentacaoInvestimento.APORTE;
              const nomeMeta = item.meta_nome || item.meta?.nome || "Reserva Geral (Sem Meta)";

              return (
                <div
                  key={item.id}
                  className="flex items-center justify-between rounded-2xl border border-border/50 bg-card p-3.5 shadow-sm hover:border-border transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <div
                      className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-xl ${
                        isAporte
                          ? "bg-[#22C55E]/10 text-[#22C55E]"
                          : "bg-amber-500/10 text-amber-600 dark:text-amber-400"
                      }`}
                    >
                      {isAporte ? (
                        <ArrowUpRight className="h-4 w-4" />
                      ) : (
                        <ArrowDownLeft className="h-4 w-4" />
                      )}
                    </div>

                    <div className="space-y-0.5">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-sm text-foreground">
                          {item.motivo}
                        </span>
                        <Badge
                          variant="outline"
                          className={`text-[10px] py-0 px-1.5 border-0 font-semibold ${
                            isAporte
                              ? "bg-[#22C55E]/10 text-[#22C55E]"
                              : "bg-amber-500/10 text-amber-600 dark:text-amber-400"
                          }`}
                        >
                          {item.tipo_label}
                        </Badge>
                      </div>

                      <div className="flex items-center gap-3 text-xs text-muted-foreground flex-wrap">
                        <span className="flex items-center gap-1 font-medium text-foreground">
                          <Target className="h-3 w-3 text-[#1F4E79]" />
                          {nomeMeta}
                        </span>
                        <span className="flex items-center gap-1">
                          <Calendar className="h-3 w-3" />
                          {formatarData(item.data_movimentacao)}
                        </span>
                        {item.conta_bancaria && (
                          <span className="flex items-center gap-1">
                            <Landmark className="h-3 w-3" />
                            {item.conta_bancaria.nome}
                          </span>
                        )}
                        {item.usuario_nome && (
                          <span className="flex items-center gap-1">
                            <User className="h-3 w-3" />
                            {item.usuario_nome}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <span
                      className={`font-bold text-sm tracking-tight ${
                        isAporte ? "text-[#22C55E]" : "text-amber-600 dark:text-amber-400"
                      }`}
                    >
                      {isAporte ? "+" : "-"} {formatarMoeda(item.valor)}
                    </span>

                    <Button
                      onClick={() => handleDeletar(item.id)}
                      disabled={isDeletando}
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 text-muted-foreground hover:text-red-500 rounded-lg cursor-pointer"
                      title="Excluir movimentação"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Footer */}
        <div className="pt-3 border-t border-border/40 flex justify-end">
          <Button
            onClick={() => onOpenChange(false)}
            variant="outline"
            className="rounded-[10px] text-xs cursor-pointer"
          >
            Fechar
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
