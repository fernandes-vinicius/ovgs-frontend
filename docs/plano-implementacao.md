# Plano — OVGS Frontend (Desafio Técnico Thera Consulting)

## Contexto

Candidatura para **Desenvolvedor(a) Frontend Sênior** na Thera Consulting. O desafio recebido
(`Desafio Técnico Sistema de Gestão de Ordens de Venda.pdf`) é escrito majoritariamente do ponto de
vista do **perfil Back-end** (exige NestJS, Prisma/TypeORM, Docker Compose), mas define explicitamente
um **perfil Front-end** separado, que é o que se aplica aqui:

> "Desenvolvedor Front-end: Implementar a interface da solução contemplando Gestão de OVs,
> Monitoramento operacional, Central de Agendamento, Cadastros básicos, Integração com APIs,
> Tratamento de estados, Validações de entrada. **A utilização de APIs simuladas (mockadas) é
> permitida.**"

Decisão confirmada com o candidato: **atacar somente o perfil Front-end** — sem NestJS/Prisma/Docker
Compose (isso é escopo do perfil Back-end). O projeto (`ovgs-frontend`, já criado via
`create-next-app` com Next 16.2.10 / React 19 / TS / Tailwind v4 / ESLint) será a base.

Prazo: entrega até sexta-feira. Prioridade: **cobertura completa e sólida do escopo obrigatório do
perfil Front-end**, com Clean Code e arquitetura sênior. Diferenciais só entram se sobrar tempo
(seção final do checklist).

**Execução combinada com o candidato**: seções "1. Setup & Tooling", "2. Domain & Shared Kernel", "3.
Mock API (BFF)", "4. Cadastros — Clientes" e "5. Cadastros — Tipos de Transporte" já implementadas e
verificadas — seções 4 e 5 inclusive com teste de navegador real via Playwright (não só curl). Próxima
seção a implementar: "6. Cadastros — Itens" — as demais seções ficam para iterações subsequentes.
Cópia deste plano também salva em `ovgs-frontend/docs/plano-implementacao.md` para referência futura.

**Diretriz de UI (combinada com o candidato)**: usar os componentes shadcn/ui sempre no estilo padrão
gerado pela CLI — nunca customizar radius, border ou shadow. A qualidade visual "premium" vem da
organização em tela (hierarquia, spacing, layout) e da escolha certa de componente pra cada situação,
não de re-estilizar os primitivos. Ver [[feedback-shadcn-pure-style]] (salvo em memória).

Stack obrigatória da vaga a ser demonstrada: **React, Next.js (App Router), TypeScript, React Query,
Redux Toolkit + Redux Saga, Tailwind CSS, React Hook Form**, consumo de API REST. Trocas combinadas
com o candidato:
- **Vitest** no lugar de Jest para testes (mantendo React Testing Library) — o desafio não exige Jest
  especificamente, só "testes automatizados".
- **shadcn/ui** para a camada de componentes de UI — o desafio não especifica biblioteca de UI, então
  fica a critério do candidato; shadcn/ui é um diferencial natural (componentes acessíveis via Radix,
  Tailwind-first, código copiado para o repo em vez de dependência de pacote fechado).
- **Biome** no lugar de ESLint/Prettier para lint/format — consistente com os projetos irmãos
  (`finia`, `seumiguel-frontend`) já usados pelo candidato.
- **Bun** como runtime/gerenciador de pacotes para o dia a dia (`bun install`, `bun dev`) — Next.js
  roda nativamente sob Bun; scripts do `package.json` continuam compatíveis com `npm run` também.

## Estratégia de "API mockada" — Route Handlers como BFF

Confirmado com o candidato: em vez de MSW, usar **Next.js Route Handlers** (`app/api/**/route.ts`)
como um backend simulado (BFF), respaldados por um repositório **in-memory** com dados seed. Isso é o
padrão recomendado pela skill oficial do Next.js para "external API access / REST API pública" — e é
mais forte como demonstração de "Integração com APIs" do que um mock puramente client-side, porque o
front-end de fato faz `fetch` HTTP real contra `/api/...`, exatamente como faria contra o backend
NestJS real do perfil Back-end. Trade-off aceito e documentado no README: o estado reseta a cada
restart do servidor Next (comportamento in-memory), o que é adequado para um desafio técnico.

A troca futura por um backend real é só troca da implementação de `infrastructure/repositories/*` —
o resto das camadas (domain/application/presentation) não muda.

## Arquitetura — Feature-based inspirada em Clean Architecture

Reaproveitando o padrão já validado no projeto irmão `finia` (`src/features/<nome>/domain|application|
infrastructure|presentation`), kebab-case em 100% dos arquivos, e `shared/components/icons.tsx` como
único ponto de import de ícones (lucide-react nunca importado direto em componentes).

```
ovgs-frontend/
├── src/
│   ├── app/
│   │   ├── (dashboard)/
│   │   │   ├── ordens-de-venda/page.tsx          # Gestão de OVs: criar/listar/detalhe/status
│   │   │   ├── ordens-de-venda/nova/page.tsx
│   │   │   ├── ordens-de-venda/[id]/page.tsx     # detalhe + timeline de auditoria
│   │   │   ├── monitoramento/page.tsx            # filtros: status/cliente/transporte/data
│   │   │   ├── agendamentos/page.tsx             # Central de Agendamento
│   │   │   ├── clientes/page.tsx
│   │   │   ├── tipos-transporte/page.tsx
│   │   │   └── itens/page.tsx
│   │   ├── api/
│   │   │   ├── clientes/route.ts (+ [id]/route.ts)
│   │   │   ├── tipos-transporte/route.ts (+ [id]/route.ts)
│   │   │   ├── itens/route.ts
│   │   │   ├── ordens-de-venda/route.ts (+ [id]/route.ts, [id]/status/route.ts, [id]/transporte/route.ts)
│   │   │   ├── agendamentos/[ordemId]/route.ts
│   │   │   └── auditoria/route.ts                # ?entidadeTipo=&entidadeId=
│   │   └── layout.tsx
│   ├── features/
│   │   ├── clientes/            {domain, application, infrastructure, presentation}
│   │   ├── tipos-transporte/    {domain, application, infrastructure, presentation}
│   │   ├── itens/               {domain, application, infrastructure, presentation}
│   │   ├── ordens-de-venda/     {domain, application, infrastructure, presentation}
│   │   ├── agendamento/         {domain, application, infrastructure, presentation}
│   │   └── auditoria/           {domain, infrastructure, presentation}
│   ├── shared/
│   │   ├── components/icons.tsx, ui/ (gerados via shadcn CLI: button, input, select, dialog, table, badge, toast/sonner, form)
│   │   ├── lib/ (http-client.ts, query-client.ts, date.ts)
│   │   ├── store/ (redux store + saga middleware, root-reducer.ts, root-saga.ts)
│   │   └── types/ (result.ts — Result<T, E> pattern para use-cases)
│   └── mocks/seed-data.ts + in-memory-db.ts  # dados iniciais + store singleton usado pelos route handlers
└── tests/
    ├── unit/features/...       # mirror de src/features, Vitest
    └── integration/            # chama os route handlers diretamente (sem subir servidor)
```

Cada `features/<nome>/domain/` é puro (zero import de Next/React/fetch) — mesma regra do finia.
`application/use-cases/` orquestra regras de negócio chamando a interface de repositório do domain.
`infrastructure/repositories/` tem duas implementações: uma "server-side" (usada pelos route
handlers, acessa `mocks/in-memory-db.ts` direto) e uma "http" (usada pelos hooks do client, faz fetch
em `/api/...`) — assim o mesmo contrato de repositório serve os dois lados do BFF.

## Modelo de domínio e regras de negócio

- **Cliente**: `id, nome, documento, tiposTransporteAutorizados: string[]`
- **TipoTransporte**: `id, nome, ativo` — novo tipo não exige alteração de regra (é só dado, não
  hardcode em `if/else`; a regra de autorização já é genérica via lista de ids)
- **Item**: `id, sku (único), nome, unidade`
- **OrdemDeVenda**: `id, clienteId, tipoTransporteId, itens: {itemId, quantidade}[], status, agendamentoId?, createdAt`
- **Status** (`src/features/ordens-de-venda/domain/order-status.ts`): `CRIADA | PLANEJADA | AGENDADA | EM_TRANSPORTE | ENTREGUE`,
  com `state-machine.ts` puro: `TRANSITIONS: Record<Status, Status[]>` e `isValidTransition(from, to)`.
  Essa função é a **fonte única da verdade**, importada tanto pelo route handler
  (`PATCH /api/ordens-de-venda/[id]/status`, rejeita transição inválida com 422) quanto pela UI
  (desabilita ações de status inválidas no detalhe da OV) — evita regra duplicada/divergente.
- **Agendamento**: `ordemId, dataEntrega, janela: {inicio, fim}, confirmado, historicoReagendamentos[]`
- **AuditEvent**: `id, entidadeTipo, entidadeId, acao, estadoAnterior?, estadoPosterior?, timestamp`

Regra de autorização cliente↔transporte: `isTransportAuthorized(cliente, tipoTransporteId)` em
`features/ordens-de-venda/application`, usada (a) na UI para filtrar/desabilitar opções de transporte
no formulário de criação de OV assim que o cliente é selecionado, e (b) no route handler de criação
da OV, que revalida e rejeita com 422 mesmo que a UI tenha deixado passar (defesa em profundidade —
ponto que o desafio explicitamente cobra em "Consistência das informações").

Regra de "alteração de transporte" auditável: o desafio lista "Alteração de transporte" como evento
mínimo de auditoria, o que implica que o tipo de transporte de uma OV pode ser editado após a
criação. Vou expor essa edição no detalhe da OV, **liberada apenas enquanto o status for `CRIADA` ou
`PLANEJADA`** (antes de entrar no fluxo logístico), reaplicando a mesma validação de autorização e
emitindo o evento de auditoria correspondente.

## Divisão de responsabilidade: React Query vs Redux Toolkit + Saga

A vaga exige as duas libs — a decisão sênior é não deixá-las sobrepostas:

- **React Query**: dono de todo o *server state* — cache de clientes, tipos de transporte, itens,
  ordens de venda (lista/detalhe) e auditoria. Cuida de loading/error/retry/invalidation via hooks
  `use-<recurso>.ts` em cada `presentation/hooks/`, com query-key factory (mesmo padrão do finia).
- **Redux Toolkit + Redux Saga**: reservado para *orquestração de fluxo* que não é cache de servidor:
  1. **Wizard da Central de Agendamento** — múltiplos passos (data → janela → confirmação →
     eventualmente disparar transição da OV para `AGENDADA`) coordenados por uma saga que encadeia as
     chamadas, faz rollback compensatório se uma etapa falhar, e dispara os toasts/erros.
  2. **Filtros do Monitoramento Operacional** (status/cliente/tipo/data) — mantidos no Redux para
     persistir entre navegações e sincronizar com a URL (`?status=&clienteId=&tipoTransporteId=&data=`);
     uma saga escuta a mudança de filtro, faz debounce e dispara o refetch via React Query
     (`queryClient.invalidateQueries`).
  3. **Transição de status da OV** — a saga aplica update otimista, chama a API, e reverte
     (compensating action) se o backend mockado rejeitar a transição.

Essa separação evita a armadilha clássica de duplicar dado de servidor dentro do Redux — e é o ponto
que o README vai justificar explicitamente como trade-off arquitetural.

## Checklist de implementação

### 1. Setup & Tooling  ✅ **concluído**
- [x] Trocar gerenciador/runtime para **Bun** (`bun install`, `bun.lock`, `bun dev`/`bun run build` ok)
- [x] Trocar ESLint por **Biome** (`biome.json` no estilo finia/seumiguel, scripts `lint`/`lint:fix`)
- [x] Inicializar **shadcn/ui** (style `base-nova`, base-ui), aliases redirecionados para
      `@/shared/components/ui`, `@/shared/lib`, `@/shared/hooks`
- [x] Componentes shadcn adicionados: `button`, `input`, `select`, `dialog`, `table`, `badge`, `label`,
      `sonner`, `field` + `separator` (a nova família `Field*` substitui o antigo wrapper `form.tsx`
      ligado a RHF — CLI v4/base-nova não gera mais esse componente), `textarea`, `checkbox`
  - Nota: o CLI tentou trocar `cn()` por um pacote novo (`cnfast`) ao instalar esses componentes;
    revertido para `clsx` + `tailwind-merge` (padrão já usado em finia/seumiguel, mais reconhecível)
- [x] Instaladas: `@tanstack/react-query`, `@reduxjs/toolkit`, `react-redux`, `redux-saga`,
      `react-hook-form`, `zod`, `@hookform/resolvers`, `date-fns`
- [x] Instaladas deps de teste: `vitest`, `@vitejs/plugin-react`, `@testing-library/react`,
      `@testing-library/jest-dom`, `@testing-library/user-event`, `jsdom`
- [x] `vitest.config.ts` (jsdom, `tests/setup.ts`, inclui `tests/unit` e `tests/integration`) + scripts `test`/`test:watch`
- [x] `shared/store/` — `makeStore()` (configureStore + sagaMiddleware), `root-reducer.ts` (placeholder
      até a 1ª slice), `root-saga.ts`, `hooks.ts` (useAppDispatch/useAppSelector tipados),
      `app/providers.tsx` (Redux + React Query) plugado em `layout.tsx` junto com `<Toaster />`
- [x] `shared/lib/query-client.ts` — padrão oficial Next.js App Router (client singleton no browser,
      instância nova por request no server)
- [x] `shared/components/icons.tsx` — reexport curado de `lucide-react`, categorias do domínio OVGS
- [x] `mocks/types.ts` + `mocks/seed-data.ts` (3 tipos de transporte, 3 clientes, 5 itens com SKU único)
- [x] `mocks/in-memory-db.ts` — singleton via `globalThis` (sobrevive ao Fast Refresh do Next dev),
      `resetDb()` para uso futuro em testes de integração
- [x] Verificado: `bun run lint`, `bunx tsc --noEmit`, `bun run build`, `bun run dev` (boot real,
      sem warnings) e `bun run test` — todos passando

### 2. Domain & Shared Kernel  ✅ **concluído**
- [x] `features/ordens-de-venda/domain/order-status.ts` + `state-machine.ts` — 5 testes unitários
      cobrindo sequência válida, transições fora de ordem, no-op (mesmo status) e estado terminal
- [x] `features/ordens-de-venda/domain/sales-order.ts` (entidade pura: `SalesOrder`, `SalesOrderItem`)
- [x] `features/clientes/domain/cliente.ts`, `features/tipos-transporte/domain/tipo-transporte.ts`,
      `features/itens/domain/item.ts`, `features/agendamento/domain/agendamento.ts` (+ `JanelaAtendimento`,
      `ReagendamentoHistorico`), `features/auditoria/domain/audit-event.ts` (+ `AuditEntityType`/`AuditAction`)
- [x] `shared/types/result.ts` — `Result<T,E>` + helpers `ok()`/`err()`
- [x] Limpeza: `mocks/types.ts` (placeholder da seção 1) removido; `mocks/seed-data.ts` e
      `mocks/in-memory-db.ts` agora importam os tipos direto do domain de cada feature
- [x] Verificado: `bun run lint`, `bunx tsc --noEmit`, `bun run test` (7 testes, 2 arquivos) e
      `bun run build` — todos passando

### 3. Mock API (BFF)  ✅ **concluído**
- [x] Repositórios (domain ports + infrastructure in-memory) para cliente, tipo-transporte, item,
      sales-order, agendamento e auditoria — mesmo contrato que a futura implementação HTTP client-side vai satisfazer
- [x] Schemas zod por feature (create/update), reaproveitáveis depois pelos forms RHF client-side
- [x] Use-cases: `create-sales-order` (cliente existe, transporte autorizado, itens existem — zod já
      garante ≥1 item), `change-order-status` (via `isValidTransition`), `change-order-transport`
      (gated CRIADA/PLANEJADA + reautorização), `definir/confirmar/reagendar-agendamento`
- [x] `AppError` tipado (`{ code: "NOT_FOUND" | "VALIDATION", message }`) em vez de string livre —
      evita status HTTP decidido por string-matching na mensagem de erro (bug real pego e corrigido
      durante a implementação)
- [x] `GET/POST /api/clientes`, `GET/PATCH /api/clientes/[id]`
- [x] `GET/POST /api/tipos-transporte`, `GET/PATCH /api/tipos-transporte/[id]`
- [x] `GET/POST /api/itens` (rejeita SKU duplicado com 422)
- [x] `GET/POST /api/ordens-de-venda` (POST valida cliente/transporte autorizado/itens; GET com
      filtros status/clienteId/tipoTransporteId/data — "data" compara com `createdAt`, documentado
      como premissa já que a OV em si não tem data de entrega própria, isso vive no Agendamento)
- [x] `GET /api/ordens-de-venda/[id]`
- [x] `PATCH /api/ordens-de-venda/[id]/status` (422 fora de sequência, grava audit event)
- [x] `PATCH /api/ordens-de-venda/[id]/transporte` (só CRIADA/PLANEJADA, revalida autorização, audit event)
- [x] `POST/PATCH /api/agendamentos/[ordemId]` (definir → reagendar mantém histórico → confirmar,
      cada ação grava audit event "ALTERACAO_AGENDAMENTO")
- [x] `GET /api/auditoria?entidadeTipo=&entidadeId=`
- [x] **Bug pego e corrigido em smoke test**: `inMemoryAuditRepository.record()` armazenava referência
      viva ao objeto da entidade (não uma cópia) — mutações posteriores (ex.: mudar status) retro-
      ativamente corrompiam o `estadoPosterior` já gravado no evento de criação. Corrigido com
      `structuredClone` dentro do próprio `record()`, garantindo imutabilidade do log independente
      de qualquer call site futuro esquecer de clonar.
- [x] Verificado: lint, `tsc --noEmit`, `bun run test` (10 testes), `bun run build` (12 rotas /api
      registradas) e fluxo manual completo via curl no dev server — criar cliente/tipo/item → OV com
      transporte não autorizado (422) → OV sem itens (400) → OV válida → pular etapa de status (422)
      → transição válida → agendar → reagendar (histórico preservado) → confirmar → avançar para
      AGENDADA → editar transporte pós-AGENDADA (422) → auditoria com os 4 tipos de evento, snapshot
      de criação intacto

### 4. Cadastros — Clientes  ✅ **concluído**
- [x] UI 100% shadcn/ui puro (sem customizar radius/border/shadow — ver [[feedback-shadcn-pure-style]]):
      `app/(dashboard)/layout.tsx` (header + nav) + `shared/components/nav-link.tsx` (link ativo via
      `usePathname`), `app/page.tsx` agora redireciona pra `/clientes`
- [x] Refinamento de arquitetura: em vez de forçar a mesma interface TS síncrona do repositório
      server-side (`ClienteRepository`) no cliente, criei `shared/lib/http-client.ts` (wrapper fetch
      fino) + `http-cliente-repository.ts` com o mesmo formato de métodos (findAll/findById/create/
      update) só que assíncrono — mais honesto do que forçar união de tipos sync/async por um único
      contrato TS
- [x] Hooks React Query: `use-clientes`, `use-cliente`, `use-create-cliente`, `use-update-cliente`
      (query-key factory em `cliente-keys.ts`, invalidation on success)
- [x] Pré-requisito descoberto durante a implementação: o form de cliente precisa da lista real de
      tipos de transporte pro grupo de checkboxes — adiantei `http-tipo-transporte-repository.ts` +
      `use-tipos-transporte.ts` (só a query de listagem; CRUD completo fica pra seção 5)
- [x] `ClienteFormDialog` (RHF + zodResolver + shadcn `Dialog`/`Field*`): nome, documento, tipos de
      transporte autorizados como grupo de `Checkbox` (não combobox — mais adequado pra 3 opções)
- [x] `ClientesPage`: header + botão "Novo cliente", busca client-side (nome/documento), `Table` com
      badges de transporte autorizado, estados de loading/erro/vazio
- [x] Bug de tipagem pego e corrigido: `tiposTransporteAutorizados: z.array(z.string()).default([])`
      quebrava o `zodResolver` (input type `string[] | undefined` vs output `string[]`) — removido o
      `.default()`, já que o form sempre envia o array explicitamente
- [x] Verificado com Playwright real (não só curl): listar → buscar "Aurora" (1 resultado) → submeter
      form vazio (erros de validação exibidos) → criar cliente com um transporte marcado → editar
      (dialog pré-preenchido corretamente) → cancelar não vaza dado. Achado durante a verificação: a
      primeira gravação (PATCH) sofreu 570ms de latência de compilação on-demand do Turbopack em dev
      (`application-code: 7ms` nos logs — não é bug, é custo de dev mode, ausente em build de produção)

### 5. Cadastros — Tipos de Transporte  ✅ **concluído**
- [x] Adicionado componente shadcn `switch` (escolha certa de componente pra um boolean "ativo",
      em vez de reaproveitar Checkbox — semântica de toggle é diferente de seleção múltipla)
- [x] Mesmo bug de `.default()` no zod (visto em Clientes) já existia em `ativo: z.boolean().default(true)`
      — corrigido antes de construir o form, mesma lição aplicada
- [x] Hooks React Query: `use-tipo-transporte` (detalhe), `use-create-tipo-transporte`,
      `use-update-tipo-transporte` (reaproveitando `use-tipos-transporte` já adiantado na seção 4)
- [x] `TipoTransporteFormDialog`: nome (Input) + ativo (Switch, com `Field orientation="horizontal"`
      pro padrão label+descrição à esquerda / controle à direita)
- [x] `TiposTransportePage`: header + botão de criação, `Table` com `Badge` "Ativo"/"Inativo"
      (variant `default` vs `outline` — sem custom color), loading/erro/vazio
- [x] Nav do dashboard atualizado com o link "Tipos de Transporte"
- [x] Verificado com Playwright: navegação entre Clientes↔Tipos de Transporte, criar com validação
      vazia, toggle do switch (default ligado → desligado → ligado), criar tipo novo, editar e
      desativar — Badge mudou de "Ativo" pra "Inativo" corretamente após o PATCH

### 6. Cadastros — Itens
- [ ] Listagem + form criar (RHF + zod): sku (único, validado), nome, unidade
- [ ] Hooks React Query: `use-itens`, `use-create-item`

### 7. Gestão de Ordens de Venda
- [ ] Listagem com paginação simples
- [ ] Form de criação (RHF + zod, multi-step ou single-page): seleção de cliente → filtra tipos de
      transporte autorizados → seleção de itens (multi + quantidade, mínimo 1) → submit
- [ ] Página de detalhe: dados da OV, seletor de próxima transição de status (só mostra transições
      válidas via `state-machine.ts`), botão de editar transporte (gated por status), timeline de auditoria
- [ ] Update de status via saga (optimistic + rollback)

### 8. Monitoramento Operacional
- [ ] Página dedicada com barra de filtros (status, cliente, tipo de transporte, data) — estado no Redux, sincronizado com querystring
- [ ] Tabela reaproveitando os componentes de listagem de OV, com contadores/KPIs simples por status

### 9. Central de Agendamento
- [ ] Tela/drawer de agendamento por OV: data de entrega, janela de atendimento (lista simulada de janelas disponíveis), confirmação
- [ ] Reagendamento (edita data/janela de um agendamento existente, mantém histórico)
- [ ] Orquestração via saga (agendar → confirmar → opcionalmente avançar status da OV para AGENDADA)

### 10. Auditoria
- [ ] Componente `AuditTimeline` (features/auditoria/presentation) reaproveitado no detalhe da OV
- [ ] Garantir que os 4 eventos mínimos (criação de OV, alteração de status, alteração de agendamento, alteração de transporte) realmente geram entradas

### 11. Testes (Vitest)
- [ ] Unitário: `state-machine.test.ts` (todas as transições válidas/inválidas)
- [ ] Unitário: `isTransportAuthorized.test.ts`
- [ ] Unitário: use-case `create-sales-order.test.ts` (rejeita 0 itens, rejeita transporte não autorizado, aceita caso válido)
- [ ] Integração: `POST /api/ordens-de-venda` chamando o route handler diretamente (Request construído na mão) — caminho feliz (201 + audit event) e caminho de rejeição (422)
- [ ] Integração: `PATCH /api/ordens-de-venda/[id]/status` (transição inválida → 422)
- [ ] Componente (RTL): validação do form de criação de OV (campo obrigatório, mínimo 1 item)

### 12. Documentação (README)
- [ ] Instruções de execução (`npm install`, `npm run dev`, `npm run test`)
- [ ] Tecnologias utilizadas + por que (mapeando 1:1 pra stack da vaga)
- [ ] Decisões arquiteturais (feature-based + clean-architecture-lite, Route Handlers como BFF)
- [ ] Estratégia de modelagem do domínio (entidades, state machine, regra de autorização)
- [ ] Estratégia de persistência (in-memory + trade-off documentado)
- [ ] Divisão React Query vs Redux Toolkit+Saga (seção acima, resumida)
- [ ] Escalabilidade (troca de repository in-memory → HTTP real sem tocar domain/application/presentation)
- [ ] Performance (staleTime do React Query, code-splitting por rota do App Router, memoização em tabelas grandes)
- [ ] Trade-offs assumidos (escopo só Front-end; sem Docker/NestJS pois é do perfil Back-end; auditoria in-memory)

### 13. Diferenciais (só se sobrar tempo)
- [ ] Cobertura de testes ampliada (mais cenários de agendamento/reagendamento)
- [ ] Acessibilidade (labels, foco, `aria-*` nos formulários e no dialog de agendamento)
- [ ] Loading/empty/error states polidos em todas as listagens
- [ ] Pipeline simples de CI (GitHub Actions: lint + test) — Azure DevOps citado na vaga, mas sem
      acesso a um projeto Azure DevOps real aqui; GitHub Actions demonstra a mesma competência de CI/CD
- [ ] `docker-compose.yml` simples só para rodar a app (não é exigido no perfil Front-end, é nice-to-have de execução)

## Verificação

- `npm run lint` e `npm run build` sem erros
- `npm run test` cobrindo os itens da seção 11
- Fluxo manual no browser: criar cliente → criar tipo de transporte → criar itens → criar OV
  (validando bloqueio de transporte não autorizado) → avançar status na sequência correta → tentar
  pular etapa (deve bloquear) → agendar entrega → reagendar → conferir timeline de auditoria refletindo
  todos os eventos
