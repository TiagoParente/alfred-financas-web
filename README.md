<img width="1114" height="402" alt="Alfred Finanças Web Header" src="https://github.com/user-attachments/assets/71284e2a-d002-4d32-a97f-554ad4b92116" />

# Alfred Finanças — Web

Frontend da plataforma **Alfred Finanças**, desenvolvido em **Next.js 15 (App Router)** com **TypeScript** e **shadcn/ui**.

Interface moderna, intuitiva e de alta performance para a gestão de finanças pessoais e familiares, com suporte integrado aos insights e recomendações do assistente **Alfred**.

---

## 📖 Documentação

A documentação completa do projeto, visão de produto e diretrizes do Design System estão centralizadas no repositório [`alfred-financas-docs`](../alfred-financas-docs).

Para diretrizes de desenvolvimento para IAs e contribuidores neste repositório, consulte o [`AGENTS.md`](./AGENTS.md).

---

## 📦 Stack Tecnológica

- **Framework**: [Next.js 15](https://nextjs.org/) (App Router)
- **Linguagem**: [TypeScript](https://www.typescriptlang.org/) (Strict Mode)
- **Estilização**: [Tailwind CSS](https://tailwindcss.com/) + [shadcn/ui](https://ui.shadcn.com/) (Radix UI)
- **Gerenciamento de Estado de Servidor**: [TanStack Query v5](https://tanstack.com/query/latest) (React Query)
- **Formulários & Validação**: [React Hook Form](https://react-hook-form.com/) + [Zod](https://zod.dev/)
- **Gráficos & Análise Visual**: [Recharts](https://recharts.org/)
- **Animações & Transições**: [Framer Motion](https://www.framer.com/motion/)
- **Iconografia**: [Lucide Icons](https://lucide.dev/)
- **Comunicação com API**: API REST desacoplada em Laravel 12 (`/api/v1`) via Laravel Sanctum (Passwordless OTP / Bearer Token)

---

## 🚀 Como rodar localmente

### Pré-requisitos
- **Node.js**: `v18.18+` ou `v20+`
- **Gerenciador de pacotes**: `npm`, `pnpm` ou `yarn`
- **Backend API**: `alfred-financas-api` rodando em `http://localhost:80` (ou na porta configurada)

### 1. Clonar o repositório e instalar dependências

```bash
git clone git@github.com:TiagoParente/alfred-financas-web.git
cd alfred-financas-web

# Instalar dependências
npm install
```

---

### 2. Configurar Variáveis de Ambiente

Copie o arquivo `.env.local.example` para `.env.local`:

```bash
cp .env.local.example .env.local
```

No arquivo `.env.local`, defina a URL base da API Laravel:

```env
NEXT_PUBLIC_API_URL=http://localhost/api/v1
```

---

### 3. Iniciar o Servidor de Desenvolvimento

```bash
npm run dev
```

Abra [http://localhost:3000](http://localhost:3000) no seu navegador para acessar a aplicação web.

---

## ⚙️ Scripts Disponíveis

| Comando | Descrição |
|---|---|
| `npm run dev` | Inicia o servidor de desenvolvimento do Next.js |
| `npm run build` | Compila a aplicação para produção |
| `npm run start` | Executa o servidor de produção compilado |
| `npm run lint` | Executa a verificação estática de erros com ESLint |

---

## 📁 Estrutura do Projeto

```
src/
├── app/                        → Rotas, layouts e páginas (Next.js App Router)
│   ├── (auth)/                 → Grupo de rotas públicas / autenticação OTP
│   ├── (dashboard)/            → Grupo de rotas autenticadas da aplicação
│   ├── layout.tsx              → Layout raiz com Providers globais
│   └── page.tsx                → Página inicial / Redirecionamento
├── components/                 → Componentes React de UI reutilizáveis
│   ├── common/                 → Componentes globais (Header, Sidebar, Skeletons, Modais)
│   └── ui/                     → Componentes shadcn/ui gerados via CLI (não editar direto)
├── features/                   → Módulos organizados por domínio de negócio
│   ├── movimentacoes/          → Cadastro e listagem de receitas/despesas
│   ├── cartoes/                → Gestão de cartões e faturas
│   ├── dashboard/              → Resumos financeiros e gráficos
│   └── alfred/                 → Interface de recomendações e insights do Alfred
├── hooks/                      → Custom Hooks React da aplicação
├── lib/                        → Configurações de API client, Zod e Envs
├── services/                   → Comunicação tipada com os endpoints da API Laravel
├── types/                      → Interfaces, DTOs e Enums TypeScript
└── utils/                      → Funções puras de formatação (moeda, datas pt-BR)
```

---

## 🤖 Alfred — Assistente de Inteligência Financeira

O **Alfred** é o assistente de inteligência financeira integrado à plataforma.

Sua comunicação é caracterizada por um tom de voz **educado, profissional, calmo, objetivo e acolhedor**, apresentando orientações acionáveis com base nos dados consolidados do usuário ou do seu grupo familiar.

---

## 🌐 Repositórios do Ecossistema

| Projeto | Descrição |
|---------|-----------|
| **[`alfred-financas-api`](../alfred-financas-api)** | Backend REST desenvolvido em **Laravel 12 / PHP 8.4** |
| **[`alfred-financas-web`](./)** | Aplicação Web desenvolvida em **Next.js 15 / React / Tailwind** |
| **[`alfred-financas-docs`](../alfred-financas-docs)** | Documentação oficial e PRD do projeto |

---

## 🚦 Status do Projeto

🚧 **Em desenvolvimento ativo**
