"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { familiaService } from "@/services/familias";
import { Button } from "@/components/ui/button";
import { Users, CheckCircle2, XCircle, Loader2 } from "lucide-react";
import { useState } from "react";

export function ConvitesPendentesBanner() {
  const queryClient = useQueryClient();
  const [processandoId, setProcessandoId] = useState<number | null>(null);

  const { data: convitesPendentes = [] } = useQuery({
    queryKey: ["convites", "pendentes"],
    queryFn: () => familiaService.obterConvitesPendentes(),
    staleTime: 1000 * 30, // 30 segundos
  });

  const aceitarMutation = useMutation({
    mutationFn: (conviteId: number) => familiaService.aceitarConvite(conviteId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["familias"] });
      queryClient.invalidateQueries({ queryKey: ["convites", "pendentes"] });
      setProcessandoId(null);
    },
    onError: () => setProcessandoId(null),
  });

  const recusarMutation = useMutation({
    mutationFn: (conviteId: number) => familiaService.recusarConvite(conviteId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["convites", "pendentes"] });
      setProcessandoId(null);
    },
    onError: () => setProcessandoId(null),
  });

  if (convitesPendentes.length === 0) return null;

  return (
    <div className="space-y-3 mb-6">
      {convitesPendentes.map((convite) => {
        const isProcessing = processandoId === convite.id;

        return (
          <div
            key={convite.id}
            className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 rounded-2xl border border-[#1F4E79]/30 bg-[#1F4E79]/10 p-4 sm:px-5 shadow-sm transition-all"
          >
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#1F4E79] text-white">
                <Users className="h-5 w-5" />
              </div>
              <div className="space-y-0.5">
                <h4 className="text-xs font-semibold text-foreground uppercase tracking-wider">
                  Convite de Família Recebido
                </h4>
                <p className="text-xs text-muted-foreground">
                  <strong className="text-foreground">{convite.convidado_por?.name || "Um usuário"}</strong> convidou você para se juntar à família{" "}
                  <strong className="text-[#1F4E79]">{convite.familia_nome}</strong>.
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2 shrink-0">
              <Button
                variant="outline"
                size="sm"
                disabled={isProcessing}
                onClick={() => {
                  setProcessandoId(convite.id);
                  recusarMutation.mutate(convite.id);
                }}
                className="rounded-xl text-xs border-red-500/30 text-red-600 dark:text-red-400 hover:bg-red-500/10"
              >
                {isProcessing && recusarMutation.isPending ? (
                  <Loader2 className="h-3.5 w-3.5 animate-spin" />
                ) : (
                  <>
                    <XCircle className="mr-1.5 h-4 w-4" />
                    Recusar
                  </>
                )}
              </Button>

              <Button
                size="sm"
                disabled={isProcessing}
                onClick={() => {
                  setProcessandoId(convite.id);
                  aceitarMutation.mutate(convite.id);
                }}
                className="bg-[#1F4E79] hover:bg-[#1F4E79]/90 text-white rounded-xl text-xs font-medium shadow-sm"
              >
                {isProcessing && aceitarMutation.isPending ? (
                  <Loader2 className="h-3.5 w-3.5 animate-spin" />
                ) : (
                  <>
                    <CheckCircle2 className="mr-1.5 h-4 w-4" />
                    Aceitar Convite
                  </>
                )}
              </Button>
            </div>
          </div>
        );
      })}
    </div>
  );
}
