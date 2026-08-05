<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->

# AGENTS.md — Alfred Finanças Web (Frontend Next.js)

Este arquivo define as diretrizes obrigatórias para qualquer IA (Copilot, Claude, Gemini, ChatGPT ou outro agente) que atue neste repositório (`alfred-financas-web`).

> Documentação oficial completa do projeto: [`alfred-financas-docs`](../alfred-financas-docs/agents.md)

---

## 📚 Documentos de Referência Obrigatória

Sempre consulte estes documentos no repositório [`alfred-financas-docs`](../alfred-financas-docs/) antes de criar novos componentes, modificar telas ou alterar integrações:

| Documento | Conteúdo |
|---|---|
| [`01-product-vision.md`](../alfred-financas-docs/01-product-vision.md) | Visão do produto, problema, solução e público-alvo |
| [`02-design-system.md`](../alfred-financas-docs/02-design-system.md) | PRD completo: cores, tipografia, componentes, estados de UI, regras do Alfred |
| [`03-architecture.md`](../alfred-financas-docs/03-architecture.md) | Arquitetura técnica desacoplada (Laravel API + Next.js Web) |
| [`05-frontend.md`](../alfred-financas-docs/05-frontend.md) | Stack, organização de pastas e bibliotecas do frontend |
| [`06-business-rules.md`](../alfred-financas-docs/06-business-rules.md) | Regras de negócio essenciais da plataforma |
| [`07-roadmap.md`](../alfred-financas-docs/07-roadmap.md) | Fases do produto e funcionalidades por versão |
| [`08-coding-standards.md`](../alfred-financas-docs/08-coding-standards.md) | Padrões de commits, branches e convenções Next.js |
| [`09-api-guidelines.md`](../alfred-financas-docs/09-api-guidelines.md) | Padrão REST, respostas da API, rotas de auth Passwordless OTP |
| [`10-alfred-personality.md`](../alfred-financas-docs/10-alfred-personality.md) | Tom de voz, personalidade e comunicação do Alfred |

---

## 🏗️ Arquitetura & Stack Frontend

- **Framework**: **Next.js 15 (App Router)** com **TypeScript Strict**
- **Estilização**: **Tailwind CSS** + **shadcn/ui**
- **Gerenciamento de Estado de Servidor**: **TanStack Query (v5)** para cache, fetching e mutações
- **Formulários e Validação**: **React Hook Form** + schemas **Zod**
- **Gráficos e Análise**: **Recharts** (área, linha, barra, donut)
- **Animações e Transições**: **Framer Motion** (transições sutis de 150ms a 250ms)
- **Iconografia**: **Lucide Icons**
- **Backend Desacoplado**: Consome API REST em **Laravel 12 / PHP 8.4** (`/api/v1`) autenticado via **Laravel Sanctum** (Passwordless OTP / Bearer Token)

> ⚠️ **Regra Fundamental**: O frontend é exclusivamente a camada de apresentação e experiência do usuário. **Toda regra de negócio, cálculo de fatura, parcelamento de cartão, agregações do dashboard e projeções residem 100% no backend (Laravel).**

---

## 🗣️ Nomenclatura e Idioma no Código

Conforme definido no PRD do projeto:

- **Português** para: nomes de entidades de domínio, formulários, componentes de negócio, tipos de domínio e comentários.
  - *Exemplos*: `MovimentacaoForm`, `ResumoFinanceiroCard`, `FaturaCartaoDetails`, `useMovimentacoes()`, `StatusMovimentacao`
- **Inglês** apenas para: termos técnicos consagrados e infraestrutura de código (`id`, `status`, `token`, `slug`, `email`, `password`, hooks genéricos, wrappers de bibliotecas)
- **Convenções React/Next.js**:
  - Componentes: `PascalCase` (ex: `CardMovimentacao.tsx`)
  - Custom Hooks: `camelCase` iniciando com `use` (ex: `useContasBancarias.ts`)
  - Rotas no App Router: `kebab-case` (ex: `app/(dashboard)/contas-bancarias/page.tsx`)

---

## 📁 Estrutura de Pastas (Next.js App Router)

```
src/
├── app/                        → Rotas, layouts, loading e error boundaries (App Router)
│   ├── (auth)/                 → Grupo de rotas não autenticadas (login OTP, etc.)
│   ├── (dashboard)/            → Grupo de rotas autenticadas da aplicação
│   ├── layout.tsx              → Layout raiz com Providers (TanStack Query, Theme, etc.)
│   └── page.tsx                → Landing page / Redirecionamento
├── components/                 → Componentes de UI reutilizáveis
│   ├── common/                 → Componentes globais (Header, Sidebar, Modais, Toasts, Skeletons)
│   └── ui/                     → Componentes shadcn/ui gerados via CLI (NUNCA EDITAR DIRETO)
├── features/                   → Módulos organizados por domínio de negócio
│   ├── movimentacoes/          → Componentes, hooks e serviços de movimentações
│   ├── cartoes/                → Componentes, hooks e serviços de cartões de crédito
│   ├── dashboard/              → Componentes e hooks do dashboard principal
│   └── alfred/                 → Interface e cards de insights do assistente Alfred
├── hooks/                      → Custom Hooks globais de React
├── lib/                        → Configurações de clientes HTTP (fetch/axios), Zod e envs
├── services/                   → Comunicação tipada com a API Laravel (/api/v1)
├── types/                      → Interfaces, DTOs e Enums TypeScript
└── utils/                      → Funções puras de formatação (moeda, datas pt-BR, percentuais)
```

---

## 🎨 Design System & UX Guidelines (Visual & Experiência)

### Identidade Visual & Cores
- **Cor Primária**: Azul Petróleo (`#1F4E79`) — transmite estabilidade, confiança e segurança.
- **Cor Secundária**: Verde (`#22C55E`) — **exclusiva** para saldo positivo, receitas, lucros e metas concluídas. *Nunca use verde como cor principal da UI.*
- **Cor Negativa / Perigo**: Vermelho (`#EF4444`) — despesas, erros e alertas críticos.
- **Cor de Atenção**: Âmbar (`#F59E0B`) — avisos, checklist pendente, metas próximas do limite.
- **Fundo Light**: `Background: #F8FAFC` | `Cards: #FFFFFF`
- **Fundo Dark**: `Background: #09090B` | `Cards: #18181B`

### Tipografia & Espaçamento
- Fonte oficial: **Inter** (ou **Geist**). Nunca misture mais de duas famílias tipográficas.
- Espaçamento estritamente baseado no sistema de grade de **múltiplos de 8px** (`4`, `8`, `16`, `24`, `32`, `48`, `64`, `96`).
- Raio de borda: Botões/Inputs: `10px` | Cards: `16px` | Modais: `20px`.
- Sombras: Extremamente discretas (`box-shadow: 0 4px 16px rgba(0,0,0,.06)`). Sem visual carregado.

### Hierarquia Visual do Dashboard
Ordem obrigatória de apresentação das informações no dashboard:
1. **Saldo Consolidado**
2. **Receitas**
3. **Despesas**
4. **Investimentos**
5. **Projeção Financeira**
6. **Próximos Vencimentos**
7. **Insights do Alfred**
8. **Checklist Financeiro**

---

## 🖥️ Frontend — Padrões Obrigatórios de Código

### 1. Server Components vs Client Components
- Use **Server Components por padrão** em todas as páginas e layouts do App Router.
- Adicione `"use client"` **apenas** nas folhas da árvore de componentes que exigem interatividade (eventos de clique, estado local `useState`, formulários `react-hook-form`, hooks do browser ou bibliotecas de animação/UI do cliente).

### 2. Componentes shadcn/ui
- Componentes base em `components/ui/` são gerados via CLI (`npx shadcn@latest add`).
- **NUNCA edite diretamente os arquivos em `components/ui/`**. Para customizar ou estender funcionalidade, crie um wrapper em `components/` ou em `features/<dominio>/components/`.

### 3. TypeScript Strict & Tipagem
- `any` implícito ou explícito é **estritamente proibido**.
- Defina tipos/interfaces completas para todos os payloads de entrada e respostas da API em `types/`.
- **Padronização de Status com Enums/Unions**: Nunca use strings soltas (*magic strings*) para status (ex: `'pago'`, `'pendente'`). Utilize Enums tipados (ex: `StatusMovimentacao.PAGO`) ou Union Types controlados.

### 4. Tratamento de Estados da Interface
Toda tela ou funcionalidade interativa deve implementar obrigatoriamente 4 estados:
- **Loading State**: Utilize **Skeletons** (`components/ui/skeleton`) que imitem o layout exato do conteúdo final. Evite spinners de tela cheia.
- **Empty State**: Explicação amigável sobre a ausência de dados + botão de ação direta para cadastrar/iniciar.
- **Error State**: Mensagem clara sem jargões técnicos + botão de "Tentar novamente".
- **Success State**: Confirmação visual discreta (Toast / Framer Motion).

### 5. Formulários & Validação
- Todos os formulários devem ser construídos com **React Hook Form** + schemas de validação **Zod**.
- Trate erros de validação da API (HTTP 422 `{ message, errors }`) de forma automática nos campos do formulário através de `setError` do React Hook Form.

### 6. Formatação de Dados e Internacionalização
- Nunca formate valores monetários ou datas diretamente no componente.
- Utilize funções utilitárias centralizadas em `utils/formatters.ts` que utilizem as APIs nativas do JS (`Intl.NumberFormat('pt-BR', ...)` e `Intl.DateTimeFormat('pt-BR', ...)`).

---

## 🌐 Integração com a API Backend (Laravel)

- **Rotas da API**: Todas as chamadas HTTP devem utilizar o prefixo `/api/v1`.
- **Autenticação Passwordless OTP**:
  - `POST /api/v1/auth/solicitar-codigo` → envia e-mail com OTP
  - `POST /api/v1/auth/verificar-codigo` → valida OTP e retorna Bearer Token
  - `POST /api/v1/auth/logout` → revoga o token
- **Padrão de Resposta da API**:
  - Sucesso objeto: `{ "data": { ... } }`
  - Sucesso lista paginada: `{ "data": [ ... ], "meta": { "current_page": 1, "per_page": 15, "total": 42 } }`
  - Erro: `{ "message": "Descrição do erro", "errors": { "campo": ["motivo"] } }`
- **Invalidação de Cache**: Ao realizar mutações (POST, PUT, DELETE), invalide as queries correspondentes no TanStack Query para garantir que a UI reflita os dados atualizados instantaneamente.

---

## 🤖 Alfred — Assistente de IA no Frontend

Ao construir a interface de insights do Alfred ou caixas de sugestões, respeite a personalidade definida em [`10-alfred-personality.md`](../alfred-financas-docs/10-alfred-personality.md):

- **Tom de voz**: Educado, profissional, calmo, objetivo, prestativo e acolhedor.
- **Formato Visual**: Sempre conter Avatar do Alfred, Saudação contextual, Resumo objetivo, Lista de recomendações com justificativa e Botão de ação prática.
- **Proibições**: Nunca use piadas, gírias, emojis excessivos, linguagem infantilizada ou tom acusatório sobre as escolhas financeiras do usuário.

---

## 🔐 Segurança no Frontend

- Armazene o Bearer Token de forma segura.
- Redirecione para o login imediatamente em caso de resposta HTTP 401 Unauthorized da API.
- Sanitize todas as entradas e evite o uso de `dangerouslySetInnerHTML`.
- **LGPD**: Nunca registre dados financeiros sensíveis (saldos, faturas, CPFs) em logs de console (`console.log`) em produção.

---

## 📦 Git & Workflow

### Conventional Commits (Obrigatório)
```bash
feat(movimentacoes): adiciona modal de cadastro rápido de despesa
fix(cartoes): corrige exibição da data de fechamento da fatura
style(dashboard): ajusta espaçamento dos cards de resumo
refactor(services): migra chamadas de API para TanStack Query v5
docs(readme): atualiza instruções de setup do ambiente web
```

### Branches
- `main` → Produção estável (nunca commitar diretamente)
- `develop` → Integração de funcionalidades
- `feature/*` → Desenvolva novas features a partir desta branch

---

## ✅ Checklist antes de commitar código

- [ ] Consultei o PRD (`02-design-system.md`) e os documentos de referência?
- [ ] Mantive o componente como Server Component por padrão, usando `"use client"` apenas quando necessário?
- [ ] Os componentes de `components/ui/` foram mantidos intocados e extendidos via wrappers?
- [ ] O código possui TypeScript estrito sem o uso de `any`?
- [ ] Os status utilizam Enums ou Unions tipadas (sem *magic strings*)?
- [ ] Validei os formulários com React Hook Form + Zod e tratei o retorno de erro HTTP 422 da API?
- [ ] Implementei os 4 estados de UI (Loading com Skeleton, Empty, Error, Success)?
- [ ] A formatação monetária e de datas utiliza os utilitários pt-BR?
- [ ] Testei a responsividade no Desktop e Mobile?
- [ ] O commit segue o padrão Conventional Commits?

---

## 🚫 O que NÃO fazer

- ❌ Não edite arquivos em `src/components/ui/` diretamente.
- ❌ Não use `any` ou `unknown` sem tratamento/type guards no TypeScript.
- ❌ Não duplique regras de negócio, cálculo de parcelas ou de faturas no frontend (deve vir 100% da API Laravel).
- ❌ Não defina status como strings soltas (*magic strings*) no código (use Enums).
- ❌ Não instale bibliotecas de UI sem verificar se shadcn/ui ou Tailwind já resolvem o problema.
- ❌ Não crie carregamentos de página inteira quando puder usar Skeletons específicos de componente.
- ❌ Não commite código com erros de linting (`npm run lint`) ou falhas de build de TypeScript.
- ❌ Não altere a personalidade do Alfred para um tom informal, jocoso ou julgador.

---

*Última atualização: Agosto/2026 — Alfred Finanças Web*

