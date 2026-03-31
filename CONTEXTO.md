# Contexto do Projeto - GLPI Interactive Dashboard

## O que e este projeto

Dashboard interativo para visualizacao de dados do GLPI (helpdesk/ITSM) da **FADEX** (Fundacao de Apoio ao Desenvolvimento da UFPI). Roda em uma TV interna (16:9, 1920x1080) exibindo chamados e projetos em tempo real com atualizacao automatica via polling.

---

## Stack

- **Next.js 14** (App Router)
- **TypeScript**
- **Tailwind CSS** (com CSS variables para temas)
- **shadcn/ui** (componentes UI manuais, sem CLI)
- **Recharts** (graficos)
- **TanStack Query** (React Query) com polling automatico
- **SpeechSynthesis API** (TTS nativo do browser para anunciar chamados novos)

---

## Infraestrutura

| Item | Detalhe |
|---|---|
| GLPI | `http://192.168.3.15` (sem `/glpi` no path) |
| API REST | `http://192.168.3.15/apirest.php/...` |
| Versao GLPI | 10.x — **nao aceita parametro `sort`** na API de listagem |
| Tokens | Configurados em `.env.local` (nao versionado) |
| App Token | `GLPI_APP_TOKEN` em `.env.local` |
| User Token | `GLPI_USER_TOKEN` em `.env.local` |
| Perfil API | **Observer** com entidade Fadex recursiva (`is_recursive: 1`) |
| Polling | `NEXT_PUBLIC_POLLING_INTERVAL=30000` (30s) |

---

## Sistema de temas (Dark / Light)

Implementado com CSS variables + Tailwind `darkMode: ["class"]`.

- **ThemeProvider** (`providers/theme-provider.tsx`) com persistencia em `localStorage`
- **CSS variables** definidas em `globals.css` para `:root` (light) e `.dark` (dark)
- **Tailwind config** mapeia cores semanticas para as CSS variables
- **Script inline** no `<head>` previne flash de tema errado
- **Toggle** no Header (icone Sun/Moon)

### Tema dark (padrao)
Tons azulados escuros inspirados no Netbox, puxando mais para o preto:
- Background: `#0d1017` | Cards: `#151922` | Header: `#0a0d13` | Bordas: `#1e2433`

### Tema light
Cores originais da identidade visual FADEX:
- Background: `#F5F5F5` | Cards: `#FFFFFF` | Texto: `#4D5B63`

### Logos
- `public/logo-branca.webp` — usada **sempre** no Header (fundo escuro em ambos os temas)
- `public/logo-preta.webp` — usada na Sidebar quando tema light
- Sidebar: `theme === "dark" ? logo-branca : logo-preta`
- Header: sempre `logo-branca`

### Paleta FADEX

| Cor | Hex | Uso |
|---|---|---|
| Verde primario | `#AEC43B` | Marca, botoes, destaques, barras de graficos |
| Verde escuro | `#8C9E33` | Hover states |
| Verde claro | `#C4D65A` | Variante light |

---

## Sistema de filtros por periodo

Implementado com contexto React global, persiste entre navegacao de paginas.

- **FilterProvider** (`providers/filter-provider.tsx`) — estado global com presets + datas custom
- **useFilter hook** (`hooks/useFilter.ts`) — acessa filtro ativo e params
- **Botao "Filtro"** no Header com dropdown:
  - Presets: Hoje, Esta semana (dom-sab), Este mes, Este ano
  - Intervalo personalizado com campos De/Ate
  - Badge verde no header mostrando filtro ativo + botao X para limpar
- **Hooks** (`useTickets.ts`, `useProjects.ts`) incluem `filterParams` na query key e nos params da API
- **API routes** filtram por `dateFrom`/`dateTo` comparando `date_creation` (string YYYY-MM-DD)
- **Sem filtro** = retorna todos os dados, sem restricao de periodo
- **Semana** comeca no **domingo** e termina no sabado
- Datas calculadas com `toLocalDateStr()` para evitar problemas de timezone com UTC

---

## Estrutura de arquivos

```
app/
  page.tsx                         # Redirect -> /dashboard
  layout.tsx                       # Root layout (ThemeProvider > FilterProvider > QueryProvider + Toaster)
  globals.css                      # Tailwind + CSS variables (light/dark) + animacoes
  dashboard/
    layout.tsx                     # Layout TV (h-screen, hamburger menu, header h-12, main flex-1 min-h-0)
    page.tsx                       # Overview (KPIs + graficos 2x2 + chamados recentes lateral)
    tickets/page.tsx               # Dashboard chamados (KPIs + graficos 3x2 + chamados recentes lateral)
    projects/page.tsx              # Dashboard projetos (KPIs + graficos 2x2 + tabela)
  api/glpi/
    session/route.ts               # Teste de sessao
    tickets/route.ts               # Proxy chamados (filtra por dateFrom/dateTo, busca Users em paralelo)
    projects/route.ts              # Proxy projetos (filtra por dateFrom/dateTo)

components/
  layout/
    Header.tsx                     # Header escuro h-12, logo branca, hamburger, filtro, toggle tema, atualizar
    Sidebar.tsx                    # Drawer lateral (overlay, fecha ao clicar fora, logo por tema)
  dashboard/
    KPICard.tsx                    # Card de metrica compacto (p-2, text-lg, icone h-6)
    TicketsByStatus.tsx            # Donut chart - status dos chamados (h-full, responsive)
    TicketsByPriority.tsx          # Bar chart horizontal - prioridade (h-full, responsive)
    TicketsTrend.tsx               # Line chart - volume por periodo (usa filtro global, sem seletor proprio)
    TicketsByTechnician.tsx        # Bar chart horizontal - ranking tecnicos (h-full, responsive)
    TicketsByCategory.tsx          # Bar chart horizontal - top 10 categorias (h-full, responsive)
    SLAIndicator.tsx               # Donut chart - incidentes vs requisicoes (h-full, responsive)
    RecentTicketsList.tsx          # Lista lateral de chamados recentes (tipo, usuario, setor)
    ProjectsByStatus.tsx           # Donut chart - status projetos (h-full, responsive)
    ProjectProgress.tsx            # Bar chart horizontal - % progresso (h-full, responsive)
    ProjectTasksSummary.tsx        # Donut chart - tarefas por status (Novo/Em andamento/Finalizado/Cancelado)
    ProjectTimeline.tsx            # Gantt simplificado
  ui/                              # shadcn/ui (card, badge, table, tabs, select, toast, skeleton) — todos com CSS variables

hooks/
  useTickets.ts                    # React Query hooks para chamados (inclui filterParams)
  useProjects.ts                   # React Query hooks para projetos (inclui filterParams)
  useTicketAnnouncer.ts            # TTS - anuncia novos chamados por voz
  useTheme.ts                      # Context + hook para tema (dark/light)
  useFilter.ts                     # Context + hook para filtro de periodo
  use-toast.ts                     # Sistema de toast notifications

lib/
  glpi-client.ts                   # Cliente HTTP com sessao automatica e renovacao em 401
  utils.ts                         # cn(), formatDate(), POLLING_INTERVAL

types/
  glpi.ts                          # Enums, interfaces, labels e cores dos status/prioridades

providers/
  query-provider.tsx               # QueryClientProvider
  theme-provider.tsx               # ThemeProvider (localStorage, classe .dark no html)
  filter-provider.tsx              # FilterProvider (presets + custom range, filterParams)
```

---

## Layouts das paginas (otimizado para TV 16:9)

### Overview (`/dashboard`)
```
grid-cols-4 grid-rows-[auto, 1fr, 1fr]
┌─────────────────────────────────┬──────────┐
│ 7 KPIs (cols 1-3)               │ Chamados │
├────────────────┬────────────────┤ Recentes │
│ Status         │ Status         │ (row-    │
│ Chamados       │ Projetos       │  span-3) │
├────────────────┼────────────────┤          │
│ Progresso      │ Volume por     │          │
│ Projeto        │ Periodo        │          │
└────────────────┴────────────────┴──────────┘
KPIs: Chamados abertos, Fechados no mes, Tempo medio,
      Projetos ativos, Concluidos ano, Prazo vencido, Tarefas abertas
```

### Chamados (`/dashboard/tickets`)
```
grid-cols-4 grid-rows-[auto, 1fr, 1fr]
┌─────────────────────────────────┬──────────┐
│ 4 KPIs (cols 1-3)               │ Chamados │
├──────────┬──────────┬───────────┤ Recentes │
│ Status   │Prioridade│ Incid vs  │ (row-    │
│ Chamados │          │ Requis    │  span-3) │
├──────────┼──────────┼───────────┤          │
│ Ranking  │ Top 10   │ Volume    │          │
│ Tecnico  │ Categ.   │ Periodo   │          │
└──────────┴──────────┴───────────┴──────────┘
KPIs: Chamados abertos, Fechados no mes, SLA vencido, Tempo medio
```

### Projetos (`/dashboard/projects`)
```
grid-rows-[auto, 1fr, 1fr, auto]
┌───────────┬───────────┬───────────┬───────────┐
│ Projetos  │ Concluidos│ Prazo     │ Tarefas   │
│ ativos    │ no ano    │ vencido   │ abertas   │
├───────────┴───────────┼───────────┴───────────┤
│ Status Projetos       │ Progresso por Projeto │
├───────────────────────┼───────────────────────┤
│ Tarefas por Status    │ Timeline dos Projetos │
├───────────────────────┴───────────────────────┤
│ Tabela: Lista de Projetos (max-h-[13vh])      │
└───────────────────────────────────────────────┘
```

---

## Decisoes tecnicas importantes

1. **Sem `/glpi` na URL base** - O GLPI esta instalado na raiz do servidor (`http://192.168.3.15`), nao em `/glpi`.

2. **Sem parametro `sort`** - Esta versao do GLPI rejeita `sort` na API de listagem. Ordenacao e feita no server-side (API routes).

3. **Mapeamento de usernames para nomes reais** - `expand_dropdowns=true` retorna o `name` (username) dos usuarios, nao o nome real. A API route busca `/User?range=0-500` em paralelo e monta um mapa `username -> "Firstname Realname"`.

4. **Layout TV 16:9** - Projetado para tela 1920x1080 sem scroll. Usa `h-screen`, `flex-1 min-h-0`, `grid-rows-[auto_minmax(0,1fr)]`, `overflow-hidden` em cada nivel para garantir que tudo cabe na tela.

5. **TTS (Text-to-Speech)** - Usa `SpeechSynthesis` nativo. Na primeira carga registra IDs existentes sem anunciar. Novos chamados sao lidos em voz.

6. **Componentes shadcn/ui criados manualmente** - Nao foi usado o CLI do shadcn. Os componentes seguem o padrao shadcn/ui mas foram escritos a mao.

7. **Graficos respondem ao filtro global** - Todos os graficos (incluindo Volume por Periodo) usam o filtro de datas da barra superior. O componente TicketsTrend nao tem mais seletor proprio de periodo (7d/30d/90d). Sem filtro = ultimos 30 dias para o trend.

8. **CSS variables para temas** - Cores semanticas (`--color-bg`, `--color-card`, etc.) definidas em `:root` e `.dark`. Tailwind mapeia para classes utilitarias (`bg-card`, `text-card-foreground`, etc.). Graficos Recharts usam `var(--color-*)` diretamente em `fill`, `stroke`, `contentStyle`.

9. **Tooltips dos graficos** - Todos usam `contentStyle` com CSS variables para se adaptar ao tema.

---

## Problema pendente: ProjectTask retorna vazio na API

### Situacao
O GLPI tem tarefas de projeto cadastradas (ex: projeto ID 3 tem 31 tarefas com status Novo, Em andamento, Finalizado, Cancelado). Porem, a API REST retorna **array vazio** tanto via `/ProjectTask` quanto via `/Project/{id}/ProjectTask` e via `/search/ProjectTask`.

### Diagnostico realizado
- O perfil do usuario API e **Observer** com `projecttask: 1057` (inclui READ)
- Entidade Fadex com `is_recursive: 1` (recursivo habilitado)
- Testado via `apirest.php` e `api.php/v1` — ambos retornam 0
- Search API tambem retorna `totalcount: 0`
- Projetos carregam normalmente (14 projetos visiveis)
- O perfil so tem 1 entidade: `id: 0, name: Fadex`
- `listSearchOptions/ProjectTask` retorna 35 campos (o tipo e reconhecido)

### Hipotese
O perfil **Observer** precisa de permissoes adicionais alem de `projecttask: READ`. Possivelmente precisa de `project: READALL` ou permissoes mais amplas. A sugestao e:
- **Temporariamente** adicionar perfil **Super-Admin** ao usuario da API para confirmar que e um problema de permissao
- Depois de confirmar, ajustar apenas as permissoes necessarias no Observer
- **OU** criar um perfil customizado "API Dashboard" com todas as permissoes de leitura necessarias

### Codigo preparado
O componente `ProjectTasksSummary.tsx` e a funcao `buildTasksByStatus()` na API route ja estao implementados para exibir o donut chart com os 4 status (Novo, Em andamento, Finalizado, Cancelado) assim que a API retornar dados. Basta resolver a permissao.

### Workaround atual
Enquanto a permissao nao e resolvida, o card exibe "Nenhuma tarefa encontrada".

---

## Proximos passos possiveis

- [ ] **Resolver permissao de ProjectTask** — testar com Super-Admin, depois criar perfil customizado
- [ ] Adicionar rotacao automatica entre paginas (modo slideshow para TV)
- [ ] Adicionar sons/alertas visuais para chamados de prioridade alta
- [ ] Cache server-side para reduzir chamadas ao GLPI
- [ ] Corrigir erros de TypeScript pre-existentes nas API routes (cast `as Record<string, unknown>`)
