"use client";

import { Meta, MovimentacaoInvestimento, TipoMovimentacaoInvestimento } from "@/types/metas";
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
  ListOrdered,
  Calendar,
  Landmark,
  User,
} from "lucide-react";
import { useMovimentacoesInvestimento } from "../hooks/useMovimentacoesInvestimento";

interface MetaDetalhesModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  meta: Meta | null;
  familiaId?: number | null;
}

export function MetaDetalhesModal({
  open,
  onOpenChange,
  meta,
  familiaId,
}: MetaDetalhesModalProps) {
  const {
    movimentacoes,
    isLoading,
    deletarMovimentacao,
    isDeletando,
  } = useMovimentacoesInvestimento(familiaId, meta ? { meta_id: meta.id } : undefined);

  if (!meta) return null;

  const handleDeletar = async (id: number) => {
    if (confirm("Tem certeza que deseja excluir este registro de movimentação? O saldo da conta bancária e da meta serão ajustados automaticamente.")) {
      await deletarMovimentacao(id);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[640px] rounded-[20px] p-6 max-h-[85vh] flex flex-col">
        <DialogHeader className="space-y-1 border-b border-border/40 pb-4">
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <div
                className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl text-white shadow-sm font-bold"
                style={{ backgroundColor: meta.cor_hex || "#1F4E79" }}
              >
                <ListOrdered className="h-5 w-5" />
              </div>
              <div>
                <DialogTitle className="text-lg font-bold text-foreground">
                  Extrato: {meta.nome}
                </DialogTitle>
                <DialogDescription className="text-xs text-muted-foreground">
                  Histórico de aportes e resgates desta meta
                </DialogDescription>
              </div>
            </div>

            <Badge
              variant="outline"
              className="text-xs px-2.5 py-0.5 font-semibold rounded-full bg-accent/40"
            >
              {meta.status_label}
            </Badge>
          </div>

          {/* Resumo Rápido da Meta */}
          <div className="grid grid-cols-3 gap-3 pt-3">
            <div className="rounded-xl bg-accent/30 p-2.5 text-center">
              <span className="text-[11px] text-muted-foreground block">Acumulado</span>
              <span className="text-sm font-bold text-foreground">
                {formatarMoeda(meta.valor_atual)}
              </span>
            </div>

            <div className="rounded-xl bg-accent/30 p-2.5 text-center">
              <span className="text-[11px] text-muted-foreground block">Alvo Total</span>
              <span className="text-sm font-bold text-foreground">
                {formatarMoeda(meta.valor_alvo)}
              </span>
            </div>

            <div className="rounded-xl bg-accent/30 p-2.5 text-center">
              <span className="text-[11px] text-muted-foreground block">Faltam</span>
              <span className="text-sm font-bold text-[#1F4E79]">
                {formatarMoeda(meta.valor_restante)}
              </span>
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
              <p className="text-sm font-medium text-foreground">Nenhuma movimentação registrada</p>
              <p className="text-xs text-muted-foreground">
                Utilize o botão "Aporte / Resgate" no card da meta para realizar sua primeira movimentação.
              </p>
            </div>
          ) : (
            movimentacoes.map((item: MovimentacaoInvestimento) => {
              const isAporte = item.tipo === TipoMovimentacaoInvestimento.APORTE;
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
                      className="h-8 w-8 text-muted-foreground hover:text-red-500 rounded-lg"
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
            className="rounded-[10px] text-xs"
          >
            Fechar
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
