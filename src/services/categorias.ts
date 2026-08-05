import { api } from "@/lib/api";
import {
  AtualizarCategoriaPayload,
  Categoria,
  CriarCategoriaPayload,
  CriarSubcategoriaPayload,
  Subcategoria,
  TipoCategoria,
} from "@/types/categorias";

export interface ListarCategoriasParams {
  incluirSistema?: boolean;
  tipo?: TipoCategoria;
}

export const categoriaService = {
  /**
   * Lista as categorias disponíveis para a família ativa.
   * GET /v1/categorias
   */
  async listar(
    familiaId?: number,
    params?: ListarCategoriasParams
  ): Promise<Categoria[]> {
    const headers: Record<string, string> = {};
    if (familiaId) {
      headers["X-Familia-Id"] = familiaId.toString();
    }

    const queryParams: Record<string, string | boolean> = {};
    if (params?.incluirSistema !== undefined) {
      queryParams.incluir_sistema = params.incluirSistema;
    }
    if (params?.tipo) {
      queryParams.tipo = params.tipo;
    }

    const { data } = await api.get<{ data: Categoria[] }>("/v1/categorias", {
      headers,
      params: queryParams,
    });

    return data.data;
  },

  /**
   * Importa o catálogo de categorias e subcategorias padrão do sistema.
   * POST /v1/categorias/importar-padroes
   */
  async importarPadroes(
    familiaId?: number
  ): Promise<{ quantidade: number; message: string }> {
    const headers: Record<string, string> = {};
    if (familiaId) {
      headers["X-Familia-Id"] = familiaId.toString();
    }

    const { data } = await api.post<{
      data: { quantidade: number };
      message: string;
    }>("/v1/categorias/importar-padroes", {}, { headers });

    return {
      quantidade: data.data.quantidade,
      message: data.message,
    };
  },

  /**
   * Cria uma nova categoria personalizada para a família.
   * POST /v1/categorias
   */
  async criar(
    payload: CriarCategoriaPayload,
    familiaId?: number
  ): Promise<Categoria> {
    const headers: Record<string, string> = {};
    if (familiaId) {
      headers["X-Familia-Id"] = familiaId.toString();
    }

    const { data } = await api.post<{ data: Categoria }>(
      "/v1/categorias",
      payload,
      { headers }
    );

    return data.data;
  },

  /**
   * Obtém os detalhes de uma categoria específica.
   * GET /v1/categorias/{id}
   */
  async obter(id: number): Promise<Categoria> {
    const { data } = await api.get<{ data: Categoria }>(`/v1/categorias/${id}`);
    return data.data;
  },

  /**
   * Atualiza dados de uma categoria.
   * PUT /v1/categorias/{id}
   */
  async atualizar(
    id: number,
    payload: AtualizarCategoriaPayload
  ): Promise<Categoria> {
    const { data } = await api.put<{ data: Categoria }>(
      `/v1/categorias/${id}`,
      payload
    );
    return data.data;
  },

  /**
   * Remove (soft delete) uma categoria.
   * DELETE /v1/categorias/{id}
   */
  async deletar(id: number): Promise<void> {
    await api.delete(`/v1/categorias/${id}`);
  },

  /**
   * Cria uma subcategoria associada a uma categoria.
   * POST /v1/categorias/{categoriaId}/subcategorias
   */
  async criarSubcategoria(
    categoriaId: number,
    payload: CriarSubcategoriaPayload
  ): Promise<Subcategoria> {
    const { data } = await api.post<{ data: Subcategoria }>(
      `/v1/categorias/${categoriaId}/subcategorias`,
      payload
    );
    return data.data;
  },

  /**
   * Remove uma subcategoria.
   * DELETE /v1/subcategorias/{subcategoriaId}
   */
  async deletarSubcategoria(subcategoriaId: number): Promise<void> {
    await api.delete(`/v1/subcategorias/${subcategoriaId}`);
  },
};
