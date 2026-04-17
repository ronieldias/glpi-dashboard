# GLPI Interactive Dashboard

Dashboard interativo para visualizacao de dados do GLPI (sistema de helpdesk/ITSM). Consome a API REST do GLPI e exibe metricas de **Chamados (Tickets)** e **Projetos** com atualizacao automatica.

## Pre-requisitos

- **Node.js** 18+ e **npm** instalados
- Acesso de rede ao servidor GLPI
- API REST do GLPI habilitada
- Tokens de API gerados

## Como habilitar a API REST no GLPI

1. Acesse o GLPI como administrador
2. Va em **Configuracao > Geral > API**
3. Marque **Habilitar API Rest = Sim**
4. Marque **Habilitar login com token externo = Sim**
5. Salve as configuracoes

## Como obter os tokens

### App Token

1. Em **Configuracao > Geral > API**, clique em **Adicionar cliente API**
2. Preencha o nome (ex: "Dashboard")
3. Marque **Ativo**
4. Salve e copie o **App-Token** gerado

### User Token

1. Acesse o **perfil do usuario** que sera utilizado pela aplicacao
2. Va em **Configuracoes remotas**
3. Clique em **Regenerar** ao lado de "Token de API"
4. Copie o token gerado

> **Recomendacao:** Use um usuario dedicado com perfil de leitura para maior seguranca.

## Configuracao

1. Crie o arquivo `.env.local` na raiz do projeto
2. Preencha as variaveis:

```env
GLPI_BASE_URL=http://seu-servidor-glpi/glpi
GLPI_APP_TOKEN=seu_app_token_aqui
GLPI_USER_TOKEN=seu_user_token_aqui
NEXT_PUBLIC_POLLING_INTERVAL=30000
```

| Variavel | Descricao |
|---|---|
| `GLPI_BASE_URL` | URL base do GLPI (sem barra final) |
| `GLPI_APP_TOKEN` | Token do cliente API |
| `GLPI_USER_TOKEN` | Token do usuario |
| `NEXT_PUBLIC_POLLING_INTERVAL` | Intervalo de atualizacao em ms (padrao: 30000 = 30s) |

## Instalacao e execucao

```bash
# Instalar dependencias
npm install

# Rodar em modo desenvolvimento
npm run dev
```

A aplicacao estara disponivel em `http://localhost:3000`.

## Estrutura do projeto

```
app/
  page.tsx                    -> Redireciona para /dashboard
  dashboard/
    page.tsx                  -> Overview geral (KPIs + graficos resumidos)
    tickets/page.tsx          -> Dashboard completo de Chamados
    projects/page.tsx         -> Dashboard completo de Projetos
  api/glpi/
    session/route.ts          -> Teste de sessao
    tickets/route.ts          -> Proxy de dados de chamados
    projects/route.ts         -> Proxy de dados de projetos

components/
  layout/                     -> Sidebar e Header
  dashboard/                  -> Componentes de graficos e KPIs
  ui/                         -> Componentes base (shadcn/ui)

hooks/                        -> React Query hooks
lib/                          -> Cliente GLPI e utilitarios
types/                        -> Tipagens TypeScript
```

## Stack

- **Next.js 16** com App Router
- **React 19**
- **TypeScript**
- **Tailwind CSS**
- **shadcn/ui** (componentes UI)
- **Recharts** (graficos)
- **TanStack Query** (data fetching com polling automatico)

## Personalizacao de logos

O projeto inclui logos genericas por padrao. Para usar a logo da sua organizacao, substitua os arquivos na pasta `public/`:

| Arquivo | Uso |
|---|---|
| `public/logo-branca.png` | Exibida no **header** (fundo escuro) |
| `public/logo-preta.png` | Exibida na **sidebar** no tema claro |

Formatos aceitos: `.png`, `.webp` ou `.svg`. Se usar um formato diferente de PNG, atualize as referencias em:
- `components/layout/Header.tsx`
- `components/layout/Sidebar.tsx`

> As logos sao exibidas com altura de 20-24px. Recomenda-se imagens com proporcao aproximada de 120x28px.

## Seguranca

- Tokens de API **nunca** sao expostos ao client-side
- Toda comunicacao com o GLPI passa pelas API Routes do Next.js (server-side)
- A sessao e gerenciada automaticamente com renovacao em caso de expiracao
