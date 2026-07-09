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

**Execução combinada com o candidato**: seções 1 a 10 já implementadas e verificadas — o escopo
obrigatório do perfil Front-end está com todas as telas funcionando ponta a ponta (cadastros, gestão
de OVs, monitoramento, central de agendamento, auditoria). As três sagas do projeto (status/optimistic
na seção 7, debounce de filtro na seção 8, composição de sagas na seção 9) cobrem três padrões de
orquestração genuinamente distintos. Vários bugs reais pegos e corrigidos ao longo do caminho via
verificação em navegador real (não só testes unitários/curl) — incluindo um bug de fuso horário em
`shared/lib/date.ts` e um bug de precisão no histórico de auditoria (seção 10). A seção 11 (Testes em
Vitest) também está concluída — 21 testes cobrindo domain, use-case, integração dos route handlers e
componente RTL, todos passando, junto com lint/tsc/build limpos. Restam as seções 12 (README) e 13
(diferenciais opcionais). Cópia deste plano também salva em `ovgs-frontend/docs/plano-implementacao.md`
para referência futura.

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

### 6. Cadastros — Itens  ✅ **concluído**
- [x] Hooks React Query: `use-itens`, `use-create-item` (`item-keys.ts`) — sem `use-item`/`use-update-item`
      porque o desafio só pede "Criar; Consultar" para Itens (sem editar, diferente de Clientes/Tipos
      de Transporte que têm "Editar" explícito)
- [x] `ItemFormDialog` (create-only, sem modo edição): sku, nome, unidade — todos Input simples
- [x] SKU duplicado: em vez de toast genérico, capturo `HttpError` com `status === 422` e uso
      `form.setError("sku", ...)` pra mostrar o erro embaixo do campo certo (mais preciso que um toast
      solto) — dialog permanece aberto preservando os outros campos já preenchidos
- [x] `ItensPage`: tabela SKU (fonte monoespaçada)/Nome/Unidade, sem coluna de ações (não há o que
      editar), loading/erro/vazio
- [x] Nav atualizado com o link "Itens"
- [x] Verificado com Playwright: validação de campos vazios, criação válida, e o caso principal —
      tentar criar item com SKU já existente mostra o erro certo no campo certo sem fechar o dialog

### 7. Gestão de Ordens de Venda  ✅ **concluído**
- [x] **Primeira slice Redux Toolkit + Saga real do projeto**: `order-status-slice.ts` (estado
      `pendingByOrderId` só para overlay otimista) + `order-status-saga.ts` (`takeEvery` → seta
      status otimista → chama a API → invalida React Query [detail/list/auditoria] ou reverte via
      `finally` limpando o override, sem nunca tocar direto no cache do React Query em caso de erro)
      registrados em `shared/store/root-reducer.ts`/`root-saga.ts` (que saem do estado placeholder da
      seção 1). `use-change-order-status.ts` expõe `changeStatus`/`pendingStatus`/`isPending`.
- [x] Refinamento de arquitetura: HTTP repository do sales-order não implementa literalmente a mesma
      interface síncrona do repositório server-side (mesma decisão já tomada na seção 4 pro cliente)
- [x] `OrdensDeVendaPage`: tabela com nomes de cliente/transporte via join client-side, `Badge` por
      status, paginação client-side simples com `Pagination`/`PaginationPrevious`/`PaginationNext`
      (shadcn), `Button render={<Link .../>}` pro padrão de link-como-botão do base-ui
- [x] `SalesOrderForm` (`/ordens-de-venda/nova`): Select de cliente → Select de tipo de transporte
      filtrado pelos autorizados do cliente (reseta se ficar inválido ao trocar cliente) → itens via
      `useFieldArray` (Select de item + quantidade + remover, mínimo 1 linha) → submit → redireciona
      pro detalhe
- [x] `SalesOrderDetail`: Cards (Cliente/Transporte, Status, Itens, Auditoria), próxima transição via
      `nextValidStatuses` (só mostra o botão de avanço válido), `EditTransportDialog` gated por status
      (CRIADA/PLANEJADA), `AuditTimeline` (pulled forward da seção 10, reaproveitável)
- [x] **2 bugs reais pegos e corrigidos durante a verificação em navegador** (não em curl/unit test):
  1. Base UI acusava "Select mudando de uncontrolled pra controlled" — `value={x || undefined}`
     nos 3 Selects do form de criação começava `undefined` e virava string definida após seleção.
     Corrigido removendo o fallback `|| undefined` (valor sempre string, controlado desde o 1º render).
  2. Timeline de auditoria não atualizava sozinha após mudar status/transporte — a saga e o
     `useChangeOrderTransport` só invalidavam `salesOrderKeys`, nunca `auditKeys`, então o evento mais
     recente ficava faltando até o cache expirar (staleTime 60s). Corrigido invalidando `auditKeys.all`
     em ambos.
- [x] **Achado de tooling (não é bug de código)**: rotas dinâmicas aninhadas em 3 níveis
      (`[id]/status/route.ts`, `[id]/transporte/route.ts`) sumiram do dev server do Turbopack logo
      após o boot (404 em GET/OPTIONS/PATCH simultaneamente, mesmo depois de um `rm -rf .next`
      completo) — um `touch` no arquivo forçou o Turbopack a re-escanear e reconhecer a rota (200 daí
      em diante). O build de produção sempre listou as rotas corretamente, confirmando que é um
      soluço de cold-start do dev server, não um problema real de roteamento.
- [x] Verificado com Playwright: edge case de cliente sem transporte autorizado (mensagem correta),
      filtro de tipos de transporte no form, criação com 2 itens, timeline completa com os 6 eventos
      (criação + 4 mudanças de status + 1 troca de transporte), gating do botão "Editar" (visível em
      CRIADA/PLANEJADA, some em EM_TRANSPORTE/ENTREGUE), estado terminal em ENTREGUE

### 8. Monitoramento Operacional  ✅ **concluído**
- [x] Reuso real: extraí `SalesOrderTable` (tabela + paginação client-side) de `ordens-de-venda-page.tsx`
      pra um componente compartilhado, usado tanto pela listagem simples quanto pelo Monitoramento —
      literalmente "reaproveitando os componentes de listagem de OV" como o checklist pedia
- [x] **Segunda slice Redux Toolkit + Saga** (a primeira foi a de status na seção 7, com propósito
      bem diferente — mostra dois usos genuínos, não repetitivos, do padrão): `monitoramento-slice.ts`
      guarda `draft` (reflete a UI na hora) e `aplicado` (só depois do debounce); `monitoramento-saga.ts`
      usa `takeLatest` + `delay(300)` — `takeLatest` cancela automaticamente o delay anterior se outro
      filtro chegar antes, que é o próprio mecanismo de debounce, sem precisar de estado extra
- [x] `use-monitoramento-filtros.ts`: hidrata o filtro da querystring uma única vez no mount (ação
      separada `filtrosHidratados`, sem passar pelo debounce — senão um link com filtro mostraria dado
      não filtrado por 300ms a cada reload) e sincroniza a URL via `router.replace` sempre que o
      filtro `aplicado` (debounced) mudar
- [x] `MonitoramentoPage`: KPIs por status (`Card` pequeno por status, contagem sobre o resultado já
      filtrado), filtros via `Select` (status/cliente/tipo, com valor-sentinela `"todos"` já que
      `SelectItem value=""` não é permitido) + `Input type="date"`, botão "Limpar filtros"
- [x] **Bug real pego e corrigido durante a verificação em navegador**: os `Select` mostravam o ID
      cru (`cli-1`) em vez do nome (`Distribuidora Aurora Ltda`) sempre que o valor vinha de fora
      (querystring/prop) em vez de uma seleção interativa do usuário — `SelectValue` do base-ui só
      resolve o rótulo a partir dos `SelectItem` filhos depois que o dropdown foi aberto ao menos uma
      vez. Corrigido passando a prop documentada `items={Record<value,label>}` pro `Select.Root` em
      todo lugar onde o valor pode vir pré-preenchido de dados (Monitoramento e `EditTransportDialog`,
      que tinha o mesmo problema — não afeta os Selects do form de criação de OV, que sempre começam
      vazios e só recebem valor via clique do usuário).
- [x] Verificado com Playwright: KPIs batendo com os dados reais, filtro por cliente reduzindo a
      tabela corretamente, reload preservando o filtro E o rótulo exibido, "Limpar filtros" voltando
      ao total, e um probe de mudanças rápidas seguidas confirmando que só a URL final é aplicada
      (debounce funcionando via cancelamento do `takeLatest`, não uma race de múltiplas requisições)

### 9. Central de Agendamento  ✅ **concluído**
- [x] Preenchi um buraco da seção 3: `app/api/agendamentos/[ordemId]/route.ts` só tinha POST/PATCH,
      sem GET — adicionei o GET (404 tipado se ainda não existe agendamento) já que a UI precisa saber
      o estado atual antes de decidir "Agendar" vs "Reagendar"
- [x] **Terceira saga do projeto, e a mais rica**: `confirmar-agendamento-saga.ts` chama a API de
      confirmar e, só se `statusAtualDaOrdem === "PLANEJADA"`, despacha a MESMA action
      `changeOrderStatusRequested` da saga de status (seção 7) pra avançar a OV pra AGENDADA —
      composição de sagas (uma saga disparando a action de outra) em vez de duplicar a lógica de
      transição. Reagendar uma OV já AGENDADA/EM_TRANSPORTE não repete essa transição.
- [x] `AgendamentoFormDialog`: form único reaproveitado pra "Agendar" (POST) e "Reagendar" (PATCH),
      usando o próprio `definirAgendamentoSchema` da seção 3 como resolver (sem duplicar schema);
      janela de atendimento como `Select` sobre uma lista simulada fixa de 3 janelas
- [x] `CentralAgendamentoPage` + `AgendamentoRow`: lista OVs a partir de PLANEJADA (CRIADA ainda não
      tem o que agendar), cada linha busca seu próprio agendamento via `useAgendamento` (um hook por
      linha, componentes de verdade, não hook-em-loop); ações "Agendar"/"Reagendar"/"Confirmar"
      escondidas quando ENTREGUE
- [x] **2 bugs reais pegos e corrigidos na verificação em navegador**:
  1. Mesma classe de bug do Select uncontrolled→controlled da seção 7, dessa vez no Select de janela
     do `AgendamentoFormDialog` (`value` começava `undefined` até a 1ª seleção). Corrigido usando
     sempre uma string definida (`""` quando vazio, não outro placeholder tipo `"-"`, pra continuar
     disparando o texto de placeholder em vez de tentar resolver um rótulo inexistente).
  2. **Bug de fuso horário real em `shared/lib/date.ts`**: digitei "01/08/2026" como data de entrega e
     a linha mostrou "31/07/2026". O construtor nativo `new Date("2026-08-01")` (string só de data,
     sem horário) é interpretado como meia-noite UTC; em fuso atrás de UTC (Brasília, -03:00) isso
     exibe o dia anterior. Corrigido trocando `new Date(iso)` por `parseISO(iso)` do date-fns, que
     trata strings de data pura como meia-noite no fuso LOCAL — strings ISO completas com timezone
     (como `createdAt`) continuam corretas nos dois casos. Esse helper é usado em toda a aplicação
     (`formatDate`/`formatDateTime`), então esse bug afetaria qualquer data-only exibida no app, não
     só agendamento.
- [x] Verificado com Playwright: OV sem agendamento → Agendar → Confirmar → saga em cadeia avança
      status automaticamente pra AGENDADA (response 200 tanto do confirmar quanto do PATCH de status
      disparado pela saga) → badges corretos; OV já AGENDADA com agendamento confirmado → Reagendar →
      status permanece AGENDADA (não tenta repetir a transição) → agendamento volta pra "Não
      confirmado" (reagendar reressata a confirmação, como já era o comportamento da API)

### 10. Auditoria  ✅ **concluído**
- [x] `AuditTimeline` já existia (seção 7) e já era reaproveitado no detalhe da OV — nesta seção
      enriqueci o componente com uma função `describeChange()` que formata `estadoAnterior`→
      `estadoPosterior` de forma legível por tipo de ação (status/transporte resolvidos pra nomes
      via label maps; agendamento mostra data+janela ou "confirmado/desfeito"; criação de OV não
      mostra detalhe, já que `estadoPosterior` é a entidade inteira e o rótulo da ação já basta)
- [x] Revisão de cobertura: grep confirmou exatamente 6 pontos de gravação de auditoria no código
      (1 criação + 1 status + 1 transporte + 3 agendamento — definir/reagendar/confirmar), todos com
      `entidadeId` = id da OV independente do `entidadeTipo`, o que já fazia o filtro por
      `entidadeId` (sem filtrar por tipo) no detalhe da OV capturar corretamente eventos de
      `OrdemDeVenda` E `Agendamento` juntos
- [x] **Bug real de precisão de auditoria pego na revisão de código (não em runtime)**:
      `confirmar-agendamento.ts` gravava `estadoAnterior: { confirmado: false }` como valor fixo em
      vez de ler o estado real do agendamento antes de confirmar — inofensivo no fluxo feliz (já é
      sempre `false` ali), mas gravaria um histórico falso se alguém confirmasse um agendamento já
      confirmado. Corrigido pra ler `agendamento.confirmado` antes da mutação, igual já era feito em
      `reagendar.ts`.
- [x] Verificado com um ciclo de vida completo (criar → planejar → trocar transporte → definir
      agendamento → reagendar → confirmar → agendada → em transporte → entregue): os 9 eventos de
      auditoria gerados batem exatamente com as 9 ações realizadas, e a timeline renderiza cada um
      com o detalhe certo (ex.: "Caminhão → Carreta", "Planejada → Agendada", "12/08/2026 · 18:00–
      22:00", "Agendamento confirmado") sem erros no console

### 11. Testes (Vitest)  ✅ **concluído**
- [x] Unitário: `state-machine.test.ts` (sequência válida completa, transições fora de ordem, no-op de
      mesmo status, estado terminal `ENTREGUE`, `nextValidStatuses` por estado)
- [x] Unitário: `isTransportAuthorized.test.ts` (transporte autorizado, não autorizado, cliente sem
      nenhum transporte autorizado)
- [x] Unitário: use-case `create-sales-order.test.ts` (caminho feliz, cliente inexistente, transporte
      não autorizado, item inexistente, 0 itens)
  - [x] **Bug de defesa em profundidade pego escrevendo o teste**: o use-case `createSalesOrder`
        confiava que o zod já barrava `itens.length === 0` na borda (route handler), mas o teste
        unitário chama o use-case direto, sem passar pelo zod — array vazio não era revalidado
        dentro do próprio use-case. Corrigido adicionando a checagem explícita em
        `create-sales-order.ts`, mesmo padrão de defesa em profundidade já usado para
        cliente/transporte/itens logo acima no mesmo arquivo.
- [x] Integração: `POST /api/ordens-de-venda` chamando o route handler diretamente (`Request`
      construído na mão, sem subir servidor) — caminho feliz (201 + audit event `CRIACAO_ORDEM_VENDA`
      gravado com `entidadeTipo: "OrdemDeVenda"`) e caminho de rejeição (422 transporte não autorizado,
      confirmando que nada foi persistido em `db.ordensDeVenda`)
- [x] Integração: `PATCH /api/ordens-de-venda/[id]/status` (422 transição fora de sequência, 200
      transição válida CRIADA→PLANEJADA, 404 ordem inexistente)
- [x] Componente (RTL): `sales-order-form.test.tsx` — validação do form de criação de OV ao submeter
      vazio (cliente/transporte/item obrigatórios), com `fetch` mockado via `vi.stubGlobal` pra manter
      o teste determinístico e sem rede real
- [x] Verificado: `bun run test` (7 arquivos, 21 testes, todos passando), `bun run lint` (só 1 warning
      pré-existente e não relacionado em `sales-order-detail.tsx`, de commit anterior), `bunx tsc
      --noEmit` limpo, `bun run build` (16 páginas estáticas + 12 rotas de API, sem erros)

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
