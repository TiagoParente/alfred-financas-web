import { useQuery } from "@tanstack/react-query";
import { bancoService } from "@/services/bancos";

export function useBancos() {
  return useQuery({
    queryKey: ["bancos"],
    queryFn: () => bancoService.listar(),
    staleTime: 1000 * 60 * 60, // Cache de 1 hora
  });
}
