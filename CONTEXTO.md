# Contexto do Projeto - GLPI Interactive Dashboard

## O que e este projeto

Dashboard interativo para visualizacao de dados do GLPI (helpdesk/ITSM) da **FADEX** (Fundacao de Apoio ao Desenvolvimento da UFPI). Roda em uma TV interna exibindo chamados e projetos em tempo real com atualizacao automatica via polling.

---

## Stack

- **Next.js 14** (App Router)
- **TypeScript**
- **Tailwind CSS**
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
| Versao GLPI | Versao recente - **nao aceita parametro `sort`** na API de listagem |
| Tokens | Configurados em `.env.local` (nao versionado) |
| App Token | `GLPI_APP_TOKEN` em `.env.local` |
| User Token | `GLPI_USER_TOKEN` em `.env.local` |
| Polling | `NEXT_PUBLIC_POLLING_INTERVAL=30000` (30s) |

---

## Paleta de cores

Baseada na identidade visual da FADEX (https://www.fadex.org.br/):

| Cor | Hex | Uso |
|---|---|---|
| Verde primario | `#AEC43B` | Marca, botoes, destaques, barras de graficos |
| Verde escuro | `#8C9E33` | Hover states |
| Verde claro | `#C4D65A` | Variante light |
| Texto | `#4D5B63` | Corpo de texto |
| Fundo | `#F5F5F5` | Background geral |
| Escuro | `#181A1D` | Header e sidebar |
| Borda | `#E0E0E0` | Bordas de cards |

Logo da FADEX salvo em `public/logo-fadex.png`.

---

## Estrutura de arquivos

```
app/
  page.tsx                         # Redirect -> /dashboard
  layout.tsx                       # Root layout (QueryProvider + Toaster)
  globals.css                      # Tailwind + animacoes customizadas
  dashboard/
    layout.tsx                     # Layout TV (hamburger menu, header compacto, h-screen)
    page.tsx                       # Overview (KPIs chamados+projetos, graficos, lista recentes)
    tickets/page.tsx               # Dashboard completo de chamados (6 graficos + lista)
    projects/page.tsx              # Dashboard completo de projetos (4 graficos + tabela)
  api/glpi/
    session/route.ts               # Teste de sessao
    tickets/route.ts               # Proxy chamados (busca Users em paralelo p/ nome real)
    projects/route.ts              # Proxy projetos

components/
  layout/
    Header.tsx                     # Header escuro com logo FADEX, hamburger, botao atualizar
    Sidebar.tsx                    # Drawer lateral (overlay, fecha ao clicar fora)
  dashboard/
    KPICard.tsx                    # Card de metrica compacto
    TicketsByStatus.tsx            # Donut chart - status dos chamados
    TicketsByPriority.tsx          # Bar chart horizontal - prioridade
    TicketsTrend.tsx               # Line chart - volume 7/30/90 dias
    TicketsByTechnician.tsx        # Bar chart horizontal - ranking tecnicos
    TicketsByCategory.tsx          # Bar chart horizontal - top 10 categorias
    SLAIndicator.tsx               # Donut chart - incidentes vs requisicoes
    RecentTicketsList.tsx          # Lista lateral de chamados recentes (tipo, usuario, setor)
    ProjectsByStatus.tsx           # Donut chart - status projetos
    ProjectProgress.tsx            # Bar chart horizontal - % progresso
    ProjectTasksSummary.tsx        # Stacked bar - tarefas abertas x concluidas
    ProjectTimeline.tsx            # Gantt simplificado
  ui/                              # Componentes shadcn/ui (card, badge, table, tabs, select, toast, skeleton)

hooks/
  useTickets.ts                    # React Query hooks para chamados
  useProjects.ts                   # React Query hooks para projetos
  useTicketAnnouncer.ts            # TTS - anuncia novos chamados por voz
  use-toast.ts                     # Sistema de toast notifications

lib/
  glpi-client.ts                   # Cliente HTTP com sessao automatica e renovacao em 401
  utils.ts                         # cn(), formatDate(), POLLING_INTERVAL

types/
  glpi.ts                          # Enums, interfaces, labels e cores dos status/prioridades

providers/
  query-provider.tsx               # QueryClientProvider
```

---

## Decisoes tecnicas importantes

1. **Sem `/glpi` na URL base** - O GLPI esta instalado na raiz do servidor (`http://192.168.3.15`), nao em `/glpi`.

2. **Sem parametro `sort`** - Esta versao do GLPI rejeita `sort` na API de listagem. Ordenacao e feita no server-side (API routes).

3. **Mapeamento de usernames para nomes reais** - `expand_dropdowns=true` retorna o `name` (username) dos usuarios, nao o nome real. A API route busca `/User?range=0-500` em paralelo e monta um mapa `username -> "Firstname Realname"` para exibir em:
   - Ranking por tecnico
   - Chamados recentes (solicitante)
   - Narrador TTS

4. **Layout TV** - Projetado para tela 1366px+ sem scroll. Sidebar e hamburger drawer, header com 40px, padding reduzido (p-3), graficos compactos (200px altura).

5. **TTS (Text-to-Speech)** - Usa `SpeechSynthesis` nativo. Na primeira carga registra IDs existentes sem anunciar. Novos chamados sao lidos em voz: "Novo chamado cadastrado. Tipo: X. Titulo: Y. Usuario: Z. Setor: W."

6. **Componentes shadcn/ui criados manualmente** - Nao foi usado o CLI do shadcn pois Node.js nao estava disponivel no momento da criacao. Os componentes seguem o padrao shadcn/ui mas foram escritos a mao.

---

## Proximos passos possiveis

- [ ] Adicionar filtros por periodo/status nos dashboards
- [ ] Implementar busca avancada usando `/apirest.php/search/Ticket`
- [ ] Adicionar dashboard de SLA detalhado
- [ ] Rotacao automatica entre paginas (modo slideshow para TV)
- [ ] Adicionar sons/alertas visuais para chamados de prioridade alta
- [ ] Cache server-side para reduzir chamadas ao GLPI
- [ ] Autenticacao basica se necessario expor fora da rede interna
