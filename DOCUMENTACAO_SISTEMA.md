# NextClin — Documentação Completa do Sistema

> **ERP para Clínicas de Vacinação** | Multi-tenant SaaS
> Versão: 1.0 | Última atualização: Fevereiro 2026

---

## 1. Arquitetura Geral

| Camada | Tecnologia | Porta |
|--------|-----------|-------|
| **Frontend** | Next.js 15 (App Router) + React 19 + TypeScript | 3000 |
| **Backend** | NestJS + TypeORM + MySQL | 3001 |
| **Banco de Dados** | MySQL 8 | 3306 |
| **Autenticação** | JWT (Passport.js) | — |

### Multi-tenancy
O sistema opera em modelo **multi-tenant por coluna** (`tenantId`). Cada entidade possui um `tenant_id` que isola os dados entre clínicas. O JWT transporta o `tenantIds[]` do usuário.

---

## 2. Módulos do Sistema

### 2.1 Autenticação e Usuários

**Entidades:** `User`, `Tenant`

| Endpoint | Método | Descrição |
|----------|--------|-----------|
| `POST /auth/login` | Público | Login com e-mail/senha, retorna JWT |
| `POST /auth/register` | Público | Cadastro de novo usuário + tenant |
| `GET /forgot-password` | Página | Tela de recuperação de senha |

**Campos do Usuário:** `id`, `email`, `password` (hash bcrypt), `name`, `role`, `tenantIds[]`, `active`, `createdAt`

**Campos do Tenant:** `id`, `name`, `cnpj`, `slug`, `settings` (JSON), `active`, `createdAt`

---

### 2.2 Pacientes

**Entidade:** `Patient`

| Endpoint | Método | Descrição |
|----------|--------|-----------|
| `POST /patients` | POST | Cadastrar paciente |
| `GET /patients` | GET | Listar (busca por nome, CPF ou prontuário) |
| `GET /patients/:id` | GET | Detalhe com atendimentos, aplicações e agendamentos |
| `PUT /patients/:id` | PUT | Atualizar dados |
| `DELETE /patients/:id` | DELETE | Soft-delete |

**Campos:** `id`, `tenantId`, `prontuario` (código único), `name`, `cpf` (único por tenant), `birthDate`, `gender`, `phone`, `email`, `address`, `city`, `state`, `zipCode`, `guardianName`, `guardianCpf`, `guardianPhone`, `notes`, `active`

**Relações:**
- `1:N` → Attendances (atendimentos)
- `1:N` → Appointments (agendamentos)

**Telas Frontend:**
- **Listagem** (`/dashboard/patients`) — tabela com busca, cadastro inline, ações (Ver Prontuário, Editar, Excluir)
- **Prontuário** (`/dashboard/patients/[id]`) — 4 abas: Visão Geral, Atendimentos, Agendamentos, Vacinas Aplicadas

---

### 2.3 Agendamentos (Appointments)

**Entidade:** `Appointment`

| Endpoint | Método | Descrição |
|----------|--------|-----------|
| `POST /appointments` | POST | Criar agendamento |
| `GET /appointments` | GET | Listar (filtros: date, professionalId, status) |
| `GET /appointments/upcoming` | GET | Próximos 7 dias |
| `GET /appointments/:id` | GET | Detalhe do agendamento |
| `PATCH /appointments/:id/status` | PATCH | Alterar status |
| `DELETE /appointments/:id` | DELETE | Cancelar |

**Campos:** `id`, `tenantId`, `patientId`, `professionalId`, `unitId`, `vaccineId`, `type` (CLINIC/HOME), `status` (REQUESTED/CONFIRMED/IN_PROGRESS/COMPLETED/CANCELLED/NO_SHOW), `startTime`, `endTime`, `homeAddress`, `displacementFee`, `homeVisitChecklist` (JSON), `notes`

**Enums de Status:**
- `REQUESTED` → Solicitado
- `CONFIRMED` → Confirmado
- `IN_PROGRESS` → Em Andamento
- `COMPLETED` → Concluído
- `CANCELLED` → Cancelado
- `NO_SHOW` → Não Compareceu

**Enums de Tipo:**
- `CLINIC` → Atendimento na clínica
- `HOME` → Visita domiciliar

**Entidades Auxiliares:**
- `ScheduleBlock` — bloqueios de agenda (profissional/unidade)
- `HomeVisitChecklist` — itens de checklist para visitas domiciliares

---

### 2.4 Atendimentos (Attendances)

**Entidade:** `Attendance`

| Endpoint | Método | Descrição |
|----------|--------|-----------|
| `POST /attendances` | POST | Inserir na fila |
| `GET /attendances/queue` | GET | Fila de espera (filtro por unit) |
| `GET /attendances/stats/today` | GET | Estatísticas do dia |
| `GET /attendances/:id` | GET | Detalhe |
| `PATCH /attendances/:id/status` | PATCH | Alterar status (WAITING → IN_PROGRESS → COMPLETED) |
| `POST /attendances/:id/apply` | POST | Aplicar vacina no atendimento |

**Campos:** `id`, `tenantId`, `code` (gerado automático), `patientId`, `professionalId`, `unitId`, `status` (WAITING/IN_PROGRESS/COMPLETED/CANCELLED), `priority` (HIGH/MEDIUM/LOW/ELECTIVE), `notes`

**Entidade Filha — Application (Aplicação de Vacina):**
- `id`, `attendanceId`, `batchId`, `vaccineId`, `doseNumber`, `applicationDate`, `nextDoseDate`, `notes`, `appliedBy`

**Tela Frontend:**
- **Fila de Atendimento** (`/dashboard/attendance`) — cards com posição, prioridade visual (cores), botões Iniciar/Finalizar/Cancelar

---

### 2.5 Vacinas e Lotes

**Entidades:** `Vaccine`, `Batch`

| Endpoint | Método | Descrição |
|----------|--------|-----------|
| `POST /vaccines` | POST | Cadastrar vacina |
| `GET /vaccines` | GET | Listar vacinas ativas com lotes |
| `PUT /vaccines/:id` | PUT | Atualizar vacina |
| `DELETE /vaccines/:id` | DELETE | Soft-delete (marca como inativa) |
| `POST /vaccines/batches` | POST | Cadastrar lote |
| `GET /vaccines/:vaccineId/batches` | GET | Lotes de uma vacina |
| `GET /vaccines/alerts/low-stock` | GET | Vacinas abaixo do estoque mínimo |
| `GET /vaccines/batches/expiring` | GET | Lotes vencendo (filtro por dias) |

**Campos da Vacina:** `id`, `tenantId`, `name`, `manufacturer`, `doseIntervalDays`, `totalDoses`, `costPrice`, `salePrice`, `minimumStock` (padrão: 10), `active`

**Campos do Lote:** `id`, `tenantId`, `vaccineId`, `lotNumber`, `expiryDate`, `quantityReceived`, `quantityAvailable`, `supplier`, `receivedAt`

**Tela Frontend:**
- **Catálogo** (`/dashboard/vaccines`) — cards com preço, lotes ativos, esquema, botão excluir

---

### 2.6 Gestão de Estoque

**Entidade:** `StockMovement`

| Endpoint | Método | Descrição |
|----------|--------|-----------|
| `POST /stock/entry` | POST | Registrar entrada |
| `POST /stock/exit` | POST | Registrar saída |
| `GET /stock/movements` | GET | Histórico (filtro por batchId) |

**Campos:** `id`, `tenantId`, `batchId`, `type` (ENTRY/EXIT), `quantity`, `reason` (PURCHASE/APPLICATION/LOSS/ADJUSTMENT/TRANSFER/EXPIRY), `userId`, `notes`

**Tela Frontend:**
- **Controle de Estoque** (`/dashboard/stock`) — tabela de movimentações com lotes, quantidades e razões

---

### 2.7 Financeiro

**Entidades:** `AccountReceivable`, `AccountPayable`

| Endpoint | Método | Descrição |
|----------|--------|-----------|
| `POST /financial/receivables` | POST | Criar conta a receber |
| `GET /financial/receivables` | GET | Listar (filtro por status) |
| `PUT /financial/receivables/:id/pay` | PUT | Marcar como pago |
| `GET /financial/receivables/overdue` | GET | Em atraso |
| `POST /financial/payables` | POST | Criar conta a pagar |
| `GET /financial/payables` | GET | Listar (filtro por status) |
| `PUT /financial/payables/:id/pay` | PUT | Marcar como pago |
| `GET /financial/dashboard` | GET | Estatísticas financeiras |

**Campos — Conta a Receber:** `id`, `tenantId`, `patientId`, `attendanceId`, `amount`, `paymentMethod` (PIX/CREDIT_CARD/DEBIT_CARD/CASH/BANK_SLIP/INSURANCE), `status` (OPEN/PAID/OVERDUE/CANCELLED), `dueDate`, `paidAt`, `notes`

**Campos — Conta a Pagar:** `id`, `tenantId`, `description`, `amount`, `costCenter`, `status` (PENDING/PAID/OVERDUE/CANCELLED), `dueDate`, `paidAt`, `notes`

**Tela Frontend:**
- **Financeiro Corporativo** (`/dashboard/financial`) — tabs Contas a Receber / Contas a Pagar, formulários de criação, botão Liquidar, tabela com status visual

---

### 2.8 NFSe (Nota Fiscal de Serviço)

**Entidade:** `Nfse`

| Endpoint | Método | Descrição |
|----------|--------|-----------|
| `POST /nfse/:accountReceivableId/:patientId` | POST | Emitir NFSe |
| `GET /nfse` | GET | Listar todas |
| `POST /nfse/:id/retry` | POST | Retentar emissão |

**Campos:** `id`, `tenantId`, `accountReceivableId`, `patientId`, `nfseNumber`, `status` (PENDING/ISSUED/ERROR/CANCELLED), `xmlUrl`, `pdfUrl`, `issuedAt`, `errorMessage`

**Tela Frontend:**
- **Notas Fiscais** (`/dashboard/nfse`) — listagem com status, botão emitir/retentar

---

### 2.9 Profissionais

**Entidade:** `Professional`

| Endpoint | Método | Descrição |
|----------|--------|-----------|
| `POST /professionals` | POST | Cadastrar |
| `GET /professionals` | GET | Listar todos |
| `DELETE /professionals/:id` | DELETE | Desativar (soft-delete) |

**Campos:** `id`, `tenantId`, `name`, `type` (DOCTOR/NURSE/TECHNICIAN), `councilNumber` (CRM/COREN), `phone`, `email`, `active`

**Tela Frontend:**
- **Equipe Clínica** (`/dashboard/professionals`) — tabela com ícone por tipo, status, botão Revogar Acesso

---

### 2.10 Convênios / Operadoras

**Entidade:** `Insurance`

| Endpoint | Método | Descrição |
|----------|--------|-----------|
| `POST /insurances` | POST | Cadastrar |
| `GET /insurances` | GET | Listar |
| `DELETE /insurances/:id` | DELETE | Desativar |

**Campos:** `id`, `tenantId`, `name`, `ansCode`, `discountPercent`, `active`

**Tela Frontend:**
- **Operadoras** (`/dashboard/insurances`) — tabela com código ANS, percentual de desconto, botão Suspender

---

### 2.11 Unidades / Polos

**Entidade:** `Unit`

| Endpoint | Método | Descrição |
|----------|--------|-----------|
| `POST /units` | POST | Cadastrar |
| `GET /units` | GET | Listar |
| `DELETE /units/:id` | DELETE | Desativar |

**Campos:** `id`, `tenantId`, `name`, `cnpj`, `phone`, `email`, `address`, `city`, `state`, `zipCode`, `active`

**Tela Frontend:**
- **Unidades** (`/dashboard/units`) — cards com endereço, contato, botão Encerrar Atividades

---

### 2.12 Relatórios

| Endpoint | Método | Descrição |
|----------|--------|-----------|
| `GET /reports/vaccines-applied` | GET | Vacinas aplicadas por período |
| `GET /reports/overdue-receivables` | GET | Contas em atraso |
| `GET /reports/stock-summary` | GET | Resumo de estoque |
| `GET /reports/commission` | GET | Relatório de comissão por profissional |
| `GET /reports/low-stock` | GET | Alertas de estoque baixo |

---

### 2.13 Configurações

**Tela Frontend:** `/dashboard/settings`
- Dados institucionais (razão social, CNPJ, contato)
- Preferências de notificação (WhatsApp, e-mail, antecedência)
- Regras de negócio (prazo padrão de pagamento)

---

### 2.14 Auditoria e Logs

**Entidade:** `AuditLog`

| Endpoint | Método | Descrição |
|----------|--------|-----------|
| `GET /audit-logs` | GET | Listar últimos 200 registros |

**Campos:** `id`, `tenantId`, `userId`, `action` (CREATE/UPDATE/DELETE/LOGIN/STATUS_CHANGE), `entityType`, `entityId`, `oldValues` (JSON), `newValues` (JSON), `ipAddress`, `createdAt`

**Tela Frontend:** `/dashboard/audit` — tabela com filtros por busca e entidade

---

## 3. Automações (Cron Jobs)

| Cron | Horário | Descrição |
|------|---------|-----------|
| `sendAppointmentReminders` | Diário 8h | Envia lembretes de agendamentos nas próximas 24h |
| `checkOverdueReceivables` | Diário 7h | Detecta contas a receber vencidas |
| `checkUpcomingPayables` | Diário 7h | Alerta contas a pagar nos próximos 5 dias |
| `checkExpiringBatches` | Segunda 6h | Lista lotes vencendo em 60 dias |
| `checkLowStock` | Diário 7h | Compara estoque total vs `minimumStock` por vacina |
| `sendNextDoseReminders` | Diário 9h | Lembretes de próximas doses (7 dias antes) |

---

## 4. Telas do Frontend

| Rota | Página | Acesso |
|------|--------|--------|
| `/` | Landing (redireciona) | Público |
| `/login` | Tela de Login | Público |
| `/forgot-password` | Recuperação de Senha | Público |
| `/dashboard` | Dashboard Principal (KPIs) | Auth |
| `/dashboard/patients` | Listagem de Pacientes | Auth |
| `/dashboard/patients/[id]` | Prontuário do Paciente | Auth |
| `/dashboard/appointments` | Agenda de Atendimentos | Auth |
| `/dashboard/attendance` | Fila de Atendimento | Auth |
| `/dashboard/vaccines` | Catálogo de Vacinas | Auth |
| `/dashboard/stock` | Controle de Estoque | Auth |
| `/dashboard/professionals` | Equipe Clínica | Auth |
| `/dashboard/insurances` | Convênios e Operadoras | Auth |
| `/dashboard/financial` | Financeiro (AR + AP) | Auth |
| `/dashboard/nfse` | Notas Fiscais Eletrônicas | Auth |
| `/dashboard/units` | Unidades e Polos | Auth |
| `/dashboard/settings` | Configurações da Clínica | Auth |
| `/dashboard/audit` | Auditoria e Logs | Auth |

---

## 5. Design System

- **Paleta principal:** Teal (700/600/100) + Slate (900/700/500/100)
- **Componentes CSS:** `saas-card`, `saas-input`, `saas-label`, `saas-button-primary`, `saas-button-secondary`
- **Tipografia:** Inter (Google Fonts)
- **Ícones:** Lucide React
- **Layout:** Sidebar fixa à esquerda + conteúdo principal com padding
- **Responsividade:** Grid adaptativo (1-4 colunas)

---

## 6. Segurança

- JWT com Passport.js (estratégias: local + jwt)
- Guard global `AuthGuard('jwt')` em todos os controllers (exceto `/auth/login` e `/auth/register`)
- Decorator `@Public()` para rotas públicas
- Isolamento de dados por `tenantId` em todas as queries
- Soft-delete em entidades críticas (pacientes, vacinas, profissionais)
- Audit log automático para operações sensíveis
- Hash de senha com bcrypt

---

## 7. Estrutura de Diretórios

```
nextclin/
├── backend/src/
│   ├── auth/           # Login, JWT, guards
│   ├── users/          # CRUD de usuários
│   ├── tenants/        # Tenants, Professionals, Insurances, Units
│   ├── patients/       # Pacientes + Prontuário
│   ├── appointments/   # Agendamentos, bloqueios, checklist domiciliar
│   ├── attendances/    # Fila de atendimento + aplicações de vacina
│   ├── vaccines/       # Catálogo de vacinas + lotes
│   ├── stock/          # Movimentações de estoque
│   ├── financial/      # Contas a receber/pagar
│   ├── nfse/           # Notas fiscais eletrônicas
│   ├── reports/        # Relatórios consolidados
│   ├── notifications/  # Cron jobs + messaging
│   └── common/         # Audit log + entidades compartilhadas
├── frontend/src/
│   ├── app/            # Pages (Next.js App Router)
│   ├── components/     # Sidebar, layout
│   ├── context/        # AuthContext
│   └── services/       # API client (axios)
└── docker-compose.yml  # MySQL + backend + frontend
```

---

*© 2026 Next Vision. Todos os direitos reservados.*
