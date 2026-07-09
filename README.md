# OVGS Frontend — Sistema de Gestão de Ordens de Venda

Desafio técnico da Thera Consulting para a vaga de **Desenvolvedor(a) Frontend Sênior**. O enunciado
original é escrito majoritariamente do ponto de vista do perfil Back-end (NestJS, Prisma/TypeORM,
Docker Compose), mas define explicitamente um perfil **Front-end** separado — implementar a interface
de Gestão de OVs, Monitoramento Operacional, Central de Agendamento, Cadastros básicos, integração com
APIs, tratamento de estados e validações de entrada, com **APIs simuladas (mockadas) permitidas**. É
esse o escopo atacado aqui: só o perfil Front-end, sem backend real, sem Docker/NestJS.

## Como rodar

Pré-requisito: [Bun](https://bun.sh) (usado como runtime/gerenciador de pacotes no dia a dia). Os
scripts também funcionam com `npm`/`pnpm`/`yarn`, já que não dependem de nenhuma feature exclusiva do
Bun.

```bash
bun install       # ou: npm install
bun dev           # ou: npm run dev   — http://localhost:3000
bun run test      # ou: npm run test  — roda a suíte Vitest uma vez
bun run test:watch
bun run lint       # Biome
bun run build      # build de produção
```

> **Atenção**: `bun test` (sem "run") aciona o test runner *nativo* do Bun, que só emula parcialmente
> a API do Vitest e não implementa `vi.stubGlobal`/`vi.unstubAllGlobals` usados nos testes de
> componente — por isso ele falha nesses testes. O comando certo é `bun run test` (executa o script
> `"test": "vitest run"` do `package.json`), que roda o Vitest de verdade configurado em
> `vitest.config.ts`.

Não há `.env` a configurar — a "API" é servida pelos próprios Route Handlers do Next.js dentro do
mesmo processo (ver seção "API mockada" abaixo).

## Stack e por que cada peça foi escolhida

A vaga exige explicitamente: React, Next.js (App Router), TypeScript, React Query, Redux Toolkit +
Redux Saga, Tailwind CSS, React Hook Form, e consumo de API REST. Todas presentes. Duas trocas
combinadas e documentadas:

| Peça | Escolha | Por quê |
|---|---|---|
| Testes | **Vitest** + React Testing Library | O desafio pede "testes automatizados", sem exigir Jest especificamente. Vitest reaproveita a config do Vite/Next, é mais rápido e tem API compatível com Jest/RTL. |
| Lint/format | **Biome** | Substitui ESLint + Prettier por uma ferramenta só, mais rápida, consistente com os outros projetos do candidato. |
| UI | **shadcn/ui** | O desafio não define biblioteca de UI. shadcn/ui gera componentes acessíveis (Radix/Base UI por baixo) copiados pro repo — sem dependência de pacote fechado, fácil de auditar e não trava numa versão de terceiro. Usado sempre no estilo padrão da CLI, sem customizar radius/border/shadow: a qualidade visual vem da organização em tela (hierarquia, spacing, escolha certa de componente pra cada situação), não de reestilizar os primitivos. |
| Runtime/pacotes | **Bun** | Next.js roda nativamente sob Bun; scripts continuam 100% compatíveis com `npm run`. |

Demais dependências relevantes: `zod` (schemas de validação reaproveitados entre RHF no client e
Route Handlers no "servidor"), `date-fns` (formatação e parsing de data sem armadilhas de fuso —
ver seção de bugs corrigidos), `@hookform/resolvers` (ponte RHF↔zod).

## API mockada — Route Handlers como BFF

Em vez de MSW (mock puramente client-side) ou de um JSON estático, a API é implementada com **Next.js
Route Handlers** (`src/app/api/**/route.ts`) atuando como um BFF, respaldados por um repositório
**in-memory** com dados seed (`src/mocks/seed-data.ts` + `src/mocks/in-memory-db.ts`, singleton via
`globalThis` para sobreviver ao Fast Refresh do dev server).

A vantagem sobre um mock client-side: o frontend faz `fetch` HTTP real contra `/api/...`, com
serialização JSON, status codes e validação de payload de verdade — exatamente como faria contra o
backend NestJS real do perfil Back-end do desafio. É uma demonstração mais forte de "Integração com
APIs" do que interceptar chamadas no cliente.

**Trade-off assumido e documentado**: o estado é in-memory e reseta a cada restart do servidor Next
(`bun dev`/`bun run build && bun start`). Aceitável para um desafio técnico; a troca por um backend
real é isolada — ver "Escalabilidade" abaixo.

## Arquitetura — feature-based inspirada em Clean Architecture

```
src/
├── app/
│   ├── (dashboard)/            # páginas: clientes, tipos-transporte, itens,
│   │                           # ordens-de-venda (+ nova, [id]), monitoramento, agendamentos
│   └── api/                    # Route Handlers (BFF) — um grupo por recurso
├── features/
│   ├── clientes/            {domain, application, infrastructure, presentation}
│   ├── tipos-transporte/    {domain, application, infrastructure, presentation}
│   ├── itens/               {domain, application, infrastructure, presentation}
│   ├── ordens-de-venda/     {domain, application, infrastructure, presentation}
│   ├── agendamento/         {domain, application, infrastructure, presentation}
│   └── auditoria/           {domain, infrastructure, presentation}
├── shared/
│   ├── components/icons.tsx    # único ponto de import de ícones (nunca lucide-react direto)
│   ├── components/ui/          # componentes shadcn/ui gerados pela CLI
│   ├── lib/                    # http-client, query-client, date, cn
│   ├── store/                  # Redux store + saga middleware, root-reducer, root-saga
│   └── types/result.ts         # Result<T, E> para use-cases
└── mocks/                       # seed-data + in-memory-db (store singleton do BFF)
```

Camadas por feature:

- **`domain/`** — entidades e regras puras (ex.: `order-status.ts` + `state-machine.ts`). Zero import
  de Next/React/fetch, testável isoladamente.
- **`application/`** — use-cases que orquestram regras de negócio chamando a interface de repositório
  do domain (ex.: `create-sales-order.ts`, `is-transport-authorized.ts`).
- **`infrastructure/repositories/`** — duas implementações do mesmo contrato: uma *server-side*
  (usada pelos Route Handlers, acessa `mocks/in-memory-db.ts` direto, síncrona) e uma *http* (usada
  pelos hooks do client, faz `fetch` em `/api/...`, assíncrona). O client não força união de tipos
  sync/async num único contrato TS — é mais honesto ter dois adaptadores explícitos do mesmo formato
  de métodos (`findAll`/`findById`/`create`/`update`).
- **`presentation/`** — páginas, componentes e hooks React Query (`use-<recurso>.ts`, com query-key
  factory por feature).

100% kebab-case nos nomes de arquivo/pasta.

## Modelagem de domínio

- **Cliente**: `id, nome, documento, tiposTransporteAutorizados: string[]`
- **TipoTransporte**: `id, nome, ativo` — cadastro genérico: um novo tipo não exige alterar código,
  já que a regra de autorização é orientada a dado (lista de ids), não a `if/else` hardcoded.
- **Item**: `id, sku (único), nome, unidade`
- **OrdemDeVenda**: `id, clienteId, tipoTransporteId, itens: {itemId, quantidade}[], status,
  agendamentoId?, createdAt`
- **Status**: `CRIADA → PLANEJADA → AGENDADA → EM_TRANSPORTE → ENTREGUE`, com uma máquina de estados
  pura (`state-machine.ts`: `TRANSITIONS` + `isValidTransition`/`nextValidStatuses`) como **fonte
  única da verdade** — importada tanto pelo Route Handler (`PATCH /api/ordens-de-venda/[id]/status`,
  rejeita transição inválida com 422) quanto pela UI (só mostra/habilita o próximo status válido).
  Evita regra de transição duplicada e potencialmente divergente entre client e "servidor".
- **Agendamento**: `ordemId, dataEntrega, janela: {inicio, fim}, confirmado,
  historicoReagendamentos[]`
- **AuditEvent**: `id, entidadeTipo, entidadeId, acao, estadoAnterior?, estadoPosterior?, timestamp`

**Regra de autorização cliente↔transporte** (`isTransportAuthorized`): validada em dois pontos —
(a) na UI, filtrando/desabilitando opções de transporte assim que o cliente é selecionado no form de
criação de OV; (b) no Route Handler de criação, que revalida e rejeita com 422 mesmo que a UI tenha
deixado passar. Defesa em profundidade, ponto que o desafio cobra explicitamente em "consistência das
informações". A mesma checagem também roda dentro do use-case `createSalesOrder`, independente do
zod da borda — um teste unitário (`create-sales-order.test.ts`) chama o use-case direto, sem passar
pelo schema HTTP, e pegou um caso real onde `itens: []` só era barrado pelo zod, não pelo use-case.

**Alteração de transporte pós-criação**: o desafio lista "Alteração de transporte" como evento mínimo
de auditoria, o que implica que o tipo de transporte de uma OV pode mudar depois de criada. Essa
edição fica liberada só enquanto o status é `CRIADA` ou `PLANEJADA` (antes de entrar no fluxo
logístico), reaplicando a mesma validação de autorização e emitindo o evento de auditoria
correspondente.

## React Query vs Redux Toolkit + Saga — divisão de responsabilidade

A vaga exige as duas libs — decisão sênior é não deixá-las sobrepostas nem duplicar *server state*
dentro do Redux:

- **React Query** — dono de todo o server state: cache de clientes, tipos de transporte, itens,
  ordens de venda (lista/detalhe) e auditoria. `staleTime` de 60s, `retry: 1`, sem refetch automático
  no foco da janela (evita chamadas redundantes num app CRUD interno).
- **Redux Toolkit + Redux Saga** — reservado a *orquestração de fluxo* que não é cache de servidor,
  em três usos genuinamente distintos:
  1. **Transição de status da OV** (`order-status-saga.ts`) — update otimista local, chama a API,
     invalida as queries afetadas em caso de sucesso ou reverte o overlay otimista em caso de erro,
     sem nunca tocar direto no cache do React Query.
  2. **Filtros do Monitoramento Operacional** (`monitoramento-saga.ts`) — `takeLatest` + `delay(300)`
     como debounce (o próprio `takeLatest` cancela o delay anterior se outro filtro chega antes, sem
     precisar de estado de "cancelamento" separado), sincronizado com a querystring da URL.
  3. **Confirmação de agendamento** (`confirmar-agendamento-saga.ts`) — composição de sagas: ao
     confirmar um agendamento cuja OV está em `PLANEJADA`, a saga despacha a *mesma* action de
     transição de status usada em (1) para avançar a OV pra `AGENDADA`, em vez de duplicar a lógica
     de transição num segundo lugar.

## Escalabilidade

Trocar o backend mockado por um backend real (o NestJS do perfil Back-end do desafio, por exemplo) é
uma troca isolada na camada `infrastructure/repositories/http-*-repository.ts` — mudando a base URL e,
se necessário, o formato de request/response. As camadas `domain/`, `application/` e `presentation/`
não mudam, porque `presentation/` já depende só da interface do repositório, nunca de
`mocks/in-memory-db.ts` diretamente (isso só é acessado pelos Route Handlers). O mesmo vale ao
contrário: adicionar um novo recurso segue o mesmo mold de 4 camadas já validado em 6 features.

## Performance

- **React Query**: `staleTime: 60_000` global evita refetch redundante entre navegações próximas;
  invalidation seletiva por query-key factory (só as chaves afetadas por uma mutação são invalidadas,
  não o cache inteiro).
- **Code-splitting por rota**: App Router do Next.js já divide cada página em chunk próprio; nenhuma
  página carrega o JS de outra.
- **Memoização em listas/tabelas**: `useMemo` para os joins client-side usados nas tabelas (ex.:
  `sales-order-table.tsx` monta `Map`s de id→nome de cliente/tipo de transporte uma vez por mudança de
  dado, em vez de fazer `.find()` por linha a cada render; `monitoramento-page.tsx` memoiza contagem
  por status e as listas de opções dos filtros).
- Paginação client-side simples nas listagens de OV (dataset de desafio técnico é pequeno; documentado
  aqui como o próximo ponto a trocar por paginação server-side caso o volume real cresça).

## Bugs reais encontrados e corrigidos durante a implementação

Registrados aqui porque revelam decisões e não são óbvios lendo só o código final:

- **Fuso horário em `shared/lib/date.ts`**: `new Date("2026-08-01")` (string só de data) é
  interpretado como meia-noite UTC; em fuso atrás de UTC isso exibe o dia anterior. Corrigido usando
  `parseISO` do `date-fns`, que trata data pura como meia-noite no fuso *local*. Afetava qualquer data
  sem horário exibida no app (agendamento, por exemplo).
- **Auditoria mutável**: `inMemoryAuditRepository.record()` guardava referência viva da entidade em
  vez de cópia — mutações posteriores corrompiam retroativamente o `estadoPosterior` já gravado.
  Corrigido com `structuredClone` dentro do próprio `record()`.
- **Precisão de auditoria em `confirmar-agendamento.ts`**: gravava `estadoAnterior: { confirmado:
  false }` fixo em vez de ler o estado real antes da mutação — inofensivo no fluxo feliz, mas gravaria
  histórico falso num reconfirm. Corrigido para ler o valor real, como já era feito em `reagendar.ts`.
- **Defesa em profundidade em `create-sales-order.ts`**: o use-case não revalidava `itens.length === 0`
  internamente, confiando que o zod barra isso na borda — pego escrevendo o teste unitário do
  use-case, que chama a função direto, sem passar pelo schema HTTP.
- **Select uncontrolled→controlled (Base UI)**: `value={x || undefined}` em Selects que começam vazios
  disparava o warning de mudança de controlado; corrigido usando sempre uma string definida (`""`).
- **Rótulo de Select vindo de fora**: `SelectValue` do Base UI só resolve o rótulo a partir dos
  `SelectItem` filhos depois do dropdown abrir ao menos uma vez — quebrava quando o valor vinha
  pré-preenchido da querystring/prop (Monitoramento, `EditTransportDialog`). Corrigido passando a prop
  `items={Record<value,label>}` documentada do `Select.Root`.

## Testes

`bun run test` roda 21 testes em 7 arquivos via Vitest:

- **Unitário** (domain/application, sem I/O): `state-machine.test.ts`, `is-transport-authorized.test.ts`,
  `create-sales-order.test.ts`.
- **Integração** (Route Handlers chamados diretamente, `Request` construído na mão, sem subir
  servidor): `ordens-de-venda-create.test.ts` (201 + audit event / 422 transporte não autorizado),
  `ordens-de-venda-status.test.ts` (422 fora de sequência / 200 válido / 404 inexistente).
- **Componente** (RTL): `sales-order-form.test.tsx` valida os campos obrigatórios do form de criação
  de OV, com `fetch` mockado via `vi.stubGlobal` para determinismo sem rede real.

## Trade-offs assumidos

- **Escopo só Front-end**: sem NestJS/Prisma/Docker Compose — isso pertence ao perfil Back-end do
  desafio, que é um perfil de candidatura separado do perfil atacado aqui.
- **Persistência in-memory**: estado reseta a cada restart do servidor Next — aceitável para avaliação
  técnica, documentado explicitamente em vez de escondido.
- **Auditoria in-memory** e não paginada: suficiente para o volume de um desafio técnico; um backend
  real precisaria de paginação/retenção.
- **Paginação client-side** nas listagens: ver "Performance" acima.
