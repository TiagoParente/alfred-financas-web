"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useFamilias } from "@/features/familias/hooks/useFamilias";
import { familiaService } from "@/services/familias";
import { ConvidarMembroModal } from "@/features/familias/components/ConvidarMembroModal";
import { ConviteFamilia, MembroFamilia, PapelFamilia, StatusConvite } from "@/types/familias";
import { extrairMensagemErro } from "@/hooks/useAuth";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Users,
  UserPlus,
  Trash2,
  ShieldCheck,
  User,
  CheckCircle2,
  AlertCircle,
  Loader2,
  Mail,
  Clock,
  XCircle,
  History,
} from "lucide-react";

export function GestaoMembrosFamiliaCard() {
  const queryClient = useQueryClient();
  const { familiaAtiva, familiaAtivaId } = useFamilias();

  const [modalConvidarAberto, setModalConvidarAberto] = useState(false);
  const [mensagemSucesso, setMensagemSucesso] = useState<string | null>(null);
  const [mensagemErro, setMensagemErro] = useState<string | null>(null);
  const [membroParaRemover, setMembroParaRemover] = useState<MembroFamilia | null>(null);
  const [conviteParaCancelar, setConviteParaCancelar] = useState<ConviteFamilia | null>(null);

  // Consulta de membros ativos
  const {
    data: membros = [],
    isLoading: isLoadingMembros,
    isError: isErrorMembros,
    refetch: refetchMembros,
  } = useQuery({
    queryKey: ["familias", familiaAtivaId, "membros"],
    queryFn: () => (familiaAtivaId ? familiaService.listarMembros(familiaAtivaId) : []),
    enabled: !!familiaAtivaId,
  });

  // Consulta do histórico de convites
  const {
    data: convites = [],
    isLoading: isLoadingConvites,
    refetch: refetchConvites,
  } = useQuery({
    queryKey: ["familias", familiaAtivaId, "convites"],
    queryFn: () => (familiaAtivaId ? familiaService.listarConvites(familiaAtivaId) : []),
    enabled: !!familiaAtivaId,
  });

  // Mutação para remover membro ativo
  const removerMembroMutation = useMutation({
    mutationFn: (membroId: number) =>
      familiaAtivaId ? familiaService.removerMembro(familiaAtivaId, membroId) : Promise.reject(),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["familias", familiaAtivaId, "membros"],
      });
      queryClient.invalidateQueries({ queryKey: ["familias"] });
      setMensagemSucesso("Membro removido com sucesso da família!");
      setMembroParaRemover(null);
      setTimeout(() => setMensagemSucesso(null), 4000);
    },
    onError: (err) => {
      setMensagemErro(extrairMensagemErro(err));
      setMembroParaRemover(null);
    },
  });

  // Mutação para cancelar convite
  const cancelarConviteMutation = useMutation({
    mutationFn: (conviteId: number) =>
      familiaAtivaId ? familiaService.cancelarConvite(familiaAtivaId, conviteId) : Promise.reject(),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["familias", familiaAtivaId, "convites"],
      });
      setMensagemSucesso("Convite cancelado com sucesso!");
      setConviteParaCancelar(null);
      setTimeout(() => setMensagemSucesso(null), 4000);
    },
    onError: (err) => {
      setMensagemErro(extrairMensagemErro(err));
      setConviteParaCancelar(null);
    },
  });

  const handleSucessoConvite = () => {
    queryClient.invalidateQueries({
      queryKey: ["familias", familiaAtivaId, "convites"],
    });
    setMensagemSucesso("Convite enviado com sucesso por e-mail!");
    setTimeout(() => setMensagemSucesso(null), 4000);
  };

  const getIniciais = (nome?: string) => {
    if (!nome) return "U";
    const partes = nome.trim().split(" ");
    if (partes.length === 1) return partes[0].substring(0, 2).toUpperCase();
    return (partes[0][0] + partes[partes.length - 1][0]).toUpperCase();
  };

  if (!familiaAtivaId) return null;

  return (
    <>
      <Card className="rounded-2xl border border-border/40 bg-card shadow-sm transition-all">
        <CardHeader className="border-b border-border/40 pb-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#1F4E79]/10 text-[#1F4E79]">
                <Users className="h-5 w-5" />
              </div>
              <div>
                <CardTitle className="text-lg font-bold text-foreground">
                  Membros da Família
                </CardTitle>
                <CardDescription className="text-xs text-muted-foreground">
                  Gerencie quem tem acesso aos lançamentos da {familiaAtiva?.nome || "família"}.
                </CardDescription>
              </div>
            </div>

            <Button
              onClick={() => setModalConvidarAberto(true)}
              className="bg-[#1F4E79] hover:bg-[#1F4E79]/90 text-white font-medium rounded-xl px-4 text-xs transition-all shadow-sm shrink-0"
            >
              <UserPlus className="mr-2 h-4 w-4" />
              Convidar por E-mail
            </Button>
          </div>
        </CardHeader>

        <CardContent className="pt-6 space-y-8">
          {mensagemSucesso && (
            <div className="flex items-center gap-2.5 rounded-xl border border-emerald-500/30 bg-emerald-500/10 p-3.5 text-xs text-emerald-600 dark:text-emerald-400">
              <CheckCircle2 className="h-4 w-4 shrink-0" />
              <span className="font-medium">{mensagemSucesso}</span>
            </div>
          )}

          {mensagemErro && (
            <div className="flex items-center gap-2.5 rounded-xl border border-red-500/30 bg-red-500/10 p-3.5 text-xs text-red-600 dark:text-red-400">
              <AlertCircle className="h-4 w-4 shrink-0" />
              <span className="font-medium">{mensagemErro}</span>
            </div>
          )}

          {/* Seção 1: Membros Ativos */}
          <div className="space-y-3">
            <h3 className="text-xs font-semibold text-foreground uppercase tracking-wider flex items-center gap-2">
              <User className="h-4 w-4 text-[#1F4E79]" />
              Membros Ativos ({membros.length})
            </h3>

            {isLoadingMembros ? (
              <div className="space-y-3">
                <Skeleton className="h-14 w-full rounded-xl" />
                <Skeleton className="h-14 w-full rounded-xl" />
              </div>
            ) : isErrorMembros ? (
              <div className="rounded-xl border border-border/40 bg-accent/20 p-4 text-center space-y-2">
                <p className="text-xs text-muted-foreground">
                  Não foi possível carregar a lista de membros.
                </p>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => refetchMembros()}
                  className="rounded-xl text-xs"
                >
                  Tentar novamente
                </Button>
              </div>
            ) : membros.length === 0 ? (
              <div className="rounded-xl border border-dashed border-border/60 p-6 text-center space-y-2">
                <User className="h-8 w-8 mx-auto text-muted-foreground/50" />
                <p className="text-xs text-muted-foreground">
                  Nenhum membro encontrado além de você nesta família.
                </p>
              </div>
            ) : (
              <div className="divide-y divide-border/40 rounded-xl border border-border/40 overflow-hidden">
                {membros.map((membro) => {
                  const eProprietario =
                    membro.papel === PapelFamilia.PROPRIETARIO ||
                    membro.papel === "proprietario";

                  const isDeletingThis =
                    removerMembroMutation.isPending && membroParaRemover?.id === membro.id;

                  return (
                    <div
                      key={membro.id}
                      className="flex items-center justify-between p-3.5 hover:bg-accent/30 transition-colors"
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[#1F4E79]/15 text-[#1F4E79] font-bold text-xs">
                          {getIniciais(membro.name)}
                        </div>

                        <div className="min-w-0">
                          <div className="flex items-center gap-2">
                            <p className="text-xs font-semibold text-foreground truncate">
                              {membro.name}
                            </p>
                            <Badge
                              variant="outline"
                              className={`text-[10px] py-0 px-2 rounded-md ${
                                eProprietario
                                  ? "border-[#1F4E79]/40 bg-[#1F4E79]/10 text-[#1F4E79] font-medium"
                                  : "border-border text-muted-foreground"
                              }`}
                            >
                              {eProprietario ? (
                                <span className="flex items-center gap-1">
                                  <ShieldCheck className="h-3 w-3" />
                                  Proprietário
                                </span>
                              ) : (
                                "Membro"
                              )}
                            </Badge>
                          </div>
                          <p className="text-xs text-muted-foreground truncate">
                            {membro.email}
                          </p>
                        </div>
                      </div>

                      {membros.length > 1 && (
                        <Button
                          variant="ghost"
                          size="icon"
                          disabled={isDeletingThis}
                          onClick={() => {
                            if (
                              confirm(
                                `Deseja realmente remover ${membro.name} da família?`
                              )
                            ) {
                              setMembroParaRemover(membro);
                              removerMembroMutation.mutate(membro.id);
                            }
                          }}
                          className="h-8 w-8 rounded-lg text-muted-foreground hover:text-red-600 hover:bg-red-500/10 transition-colors"
                          title="Remover da família"
                        >
                          {isDeletingThis ? (
                            <Loader2 className="h-4 w-4 animate-spin text-red-500" />
                          ) : (
                            <Trash2 className="h-4 w-4" />
                          )}
                        </Button>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Seção 2: Histórico de Convites */}
          <div className="space-y-3 pt-4 border-t border-border/40">
            <h3 className="text-xs font-semibold text-foreground uppercase tracking-wider flex items-center gap-2">
              <History className="h-4 w-4 text-[#1F4E79]" />
              Histórico de Convites ({convites.length})
            </h3>

            {isLoadingConvites ? (
              <Skeleton className="h-14 w-full rounded-xl" />
            ) : convites.length === 0 ? (
              <p className="text-xs text-muted-foreground italic bg-accent/10 p-3 rounded-xl border border-border/30">
                Nenhum convite enviado até o momento.
              </p>
            ) : (
              <div className="divide-y divide-border/40 rounded-xl border border-border/40 overflow-hidden">
                {convites.map((convite) => {
                  const isPendente = convite.status === StatusConvite.PENDENTE || convite.status === "pendente";
                  const isAceito = convite.status === StatusConvite.ACEITO || convite.status === "aceito";
                  const isRecusado = convite.status === StatusConvite.RECUSADO || convite.status === "recusado";

                  const isCancelingThis =
                    cancelarConviteMutation.isPending && conviteParaCancelar?.id === convite.id;

                  return (
                    <div
                      key={convite.id}
                      className="flex items-center justify-between p-3.5 hover:bg-accent/30 transition-colors"
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-accent text-muted-foreground">
                          <Mail className="h-4 w-4" />
                        </div>

                        <div className="min-w-0 space-y-0.5">
                          <p className="text-xs font-semibold text-foreground truncate">
                            {convite.email}
                          </p>
                          <div className="flex items-center gap-2">
                            <p className="text-[11px] text-muted-foreground">
                              Enviado por {convite.convidado_por?.name || "Membro"}
                            </p>
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-3">
                        {/* Status Badge */}
                        {isPendente && (
                          <Badge variant="outline" className="bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/30 text-[10px] gap-1 py-0.5">
                            <Clock className="h-3 w-3 animate-pulse" />
                            Pendente
                          </Badge>
                        )}
                        {isAceito && (
                          <Badge variant="outline" className="bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/30 text-[10px] gap-1 py-0.5">
                            <CheckCircle2 className="h-3 w-3" />
                            Aceito
                          </Badge>
                        )}
                        {isRecusado && (
                          <Badge variant="outline" className="bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/30 text-[10px] gap-1 py-0.5">
                            <XCircle className="h-3 w-3" />
                            Recusado
                          </Badge>
                        )}

                        {/* Botão de Cancelar (apenas se for pendente) */}
                        {isPendente && (
                          <Button
                            variant="ghost"
                            size="icon"
                            disabled={isCancelingThis}
                            onClick={() => {
                              if (confirm(`Deseja cancelar o convite enviado para ${convite.email}?`)) {
                                setConviteParaCancelar(convite);
                                cancelarConviteMutation.mutate(convite.id);
                              }
                            }}
                            className="h-7 w-7 rounded-lg text-muted-foreground hover:text-red-600 hover:bg-red-500/10 transition-colors"
                            title="Cancelar convite"
                          >
                            {isCancelingThis ? (
                              <Loader2 className="h-3.5 w-3.5 animate-spin text-red-500" />
                            ) : (
                              <Trash2 className="h-3.5 w-3.5" />
                            )}
                          </Button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Modal para convidar membro por e-mail */}
      <ConvidarMembroModal
        open={modalConvidarAberto}
        onOpenChange={setModalConvidarAberto}
        familiaId={familiaAtivaId}
        onSucesso={handleSucessoConvite}
      />
    </>
  );
}
