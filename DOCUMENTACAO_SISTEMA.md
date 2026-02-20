# NextClin — Documentação Completa do Sistema

> **ERP para Clínicas de Vacinação** | Multi-tenant SaaS
> Versão: 2.0 | Última atualização: Fevereiro 2026

---

## 1. Arquitetura Geral

| Camada | Tecnologia | Porta |
|--------|-----------|-------|
| **Frontend** | Next.js 15 (App Router) + React 19 + TypeScript | 3000 |
| **Backend** | NestJS + TypeORM + MySQL | 3001 |
| **Banco de Dados** | MySQL 8 | 3306 |
| **Autenticação** | JWT (Passport.js) + MFA (TOTP) | — |
| **API Docs** | Swagger (OpenAPI 3.0) no `/api/docs` | — |

### Multi-tenancy & Isolação
O sistema opera em modelo **multi-tenant por coluna** (`tenantId`). Cada entidade relevante possui um `tenantId` que isola os dados entre clínicas. O JWT transporta os `tenantIds[]` do usuário após a autenticação (MFA quando ativado).

---

## 2. Módulos do Sistema (SaaS Completo)

### 2.1 Autenticação, Usuários e Segurança
**Entidades:** `User`, `Tenant`, `UserMfa`

| Endpoint | Método | Descrição |
|----------|--------|-----------|
| `POST /auth/login` | Público | Login com e-mail/senha. Retorna JWT ou pede código MFA |
| `POST /auth/register` | Público | Cadastro de novo usuário + criação de tenant inicial |
| `POST /mfa/setup` | Auth | Gera chave secreta e QR Code (URI) para Autenticador |
| `POST /mfa/verify` | Auth | Valida primeiro código e ativa o MFA permanentemente |
| `POST /mfa/validate` | Auth | Valida código TOTP ou código de recuperação no Login |
| `POST /mfa/disable` | Auth | Desativa MFA temporariamente |

**Segurança:**
- Senhas hasheadas via `bcrypt`.
- JWT configurável via `.env`.
- Decorators `@Public()` e `@Roles(Role.ADMIN)` para RBAC nativo.
- TOTP gerado via Node.js nativo `crypto`.

---

### 2.2 Pacientes e LGPD
**Entidades:** `Patient`, `PatientConsent`

| Endpoint | Método | Descrição |
|----------|--------|-----------|
| `GET /patients` | Auth | Listagem inteligente com busca por nome/CPF/prontuário |
| `GET /patients/:id` | Auth | Prontuário detalhado com abas (Overview, Vacinas, Agendamentos) |
| `POST /patient-consents` | Auth | Armazena termos de LGPD aceitos (Rastreia IP e timestamp) |
| `GET /patient-consents/export/:patientId` | Auth | Exportabilidade de dados (LGPD) |

---

### 2.3 Portal do Paciente (Self-Service)
**Endpoint Público (`/portal`)**

Permite que pacientes da clínica interajam com o sistema nativamente sem senhas, usando OTP (via WhatsApp/SMS).

| Endpoint | Método | Descrição |
|----------|--------|-----------|
| `POST /portal/auth/request-otp` | Público | Envia código 6-dígitos para telefone do paciente (CPF) |
| `POST /portal/auth/verify-otp` | Público | Retorna token de sessão temporária de paciente |
| `GET /portal/patients/:cpf/vaccines` | Público | Visualizar a Carteira de Vacinação Digital |
| `POST /portal/appointments/request` | Público | Solicitar novo agendamento a ser confirmado pela clínica |

---

### 2.4 Agendamentos (Appointments) & Rotas Domiciliares
**Entidades:** `Appointment`, `ScheduleBlock`, `HomeVisitChecklist`

| Endpoint | Método | Descrição |
|----------|--------|-----------|
| `POST /appointments` | Auth | Cria agendamento presencial ou domiciliar |
| `GET /appointments/routes` | Auth | **Rotas Otimizadas:** Agrupa visitas domiciliares por prefixo do CEP |
| `GET /appointments/routes/calculate-fee` | Auth | Calcula taxa de deslocamento pela distância do CEP |
| `GET /appointments/calendar/auth` | Auth | **Integração Google Calendar:** Inicia OAuth2 |
| `GET /appointments/calendar/callback` | Público | Recebe código do Google para token |

**Funcionalidades Especiais:**
- Integração `GoogleCalendarService` cria automaticamente os eventos na agenda da clínica.
- Geração de lista de suprimentos para viagens via `HomeVisitChecklist`.

---

### 2.5 Atendimentos (Attendances)
A fila do dia-a-dia da clínica. Controla entrada, preparo e aplicação de vacinas.

| Endpoint | Método | Descrição |
|----------|--------|-----------|
| `GET /attendances/queue` | Auth | Fila de espera separada por unidade |
| `POST /attendances` | Auth | Inserir paciente na fila |
| `POST /attendances/:id/apply` | Auth | Aplica vacina (gera lote consumido, remove do estoque, notifica) |

---

### 2.6 Vacinas e Gestão de Estoque
**Entidades:** `Vaccine`, `Batch`, `StockMovement`

- **Vacinas:** Cadastro de imunizantes com esquema de doses, estoque mínimo.
- **Lotes:** O número do lote atado a data de validade.
- **Movimentações (`StockMovement`):** Registra Entradas (compra), Saídas (perda/transferência) e Aplicações.
- **Alertas de Risco:** Rotas para listar lotes vencendo nos próximos X dias e vacinas em baixa automática.

---

### 2.7 Financeiro Completo e Tabela de Preços
**Entidades:** `AccountReceivable`, `AccountPayable`, `PriceTable`

| Endpoint | Método | Descrição |
|----------|--------|-----------|
| `GET /price-table/best-price` | Auth | Verifica se a operadora (Convênio) cobre parcial/total |
| `GET /financial/dashboard` | Auth | KPIs de Receita, Despesa e Margem |
| `POST /financial/receivables` | Auth | Criar conta a receber ligada ao atendimento |
| `POST /payments/pix/generate` | Auth | **Asaas PIX Gateway:** Gera cobrança em tempo real c/ QR Code |
| `POST /payments/webhook` | Público | Recebe webhook de bancos/gateways para atualizar como PAGO |

---

### 2.8 Notificações SMS/E-mail (Omnichannel)
**Entidades:** `MessageLog`
**Serviços Internos:** `NotificationQueue` (BullMQ style), `MessagingService`

- Histórico absoluto de mensagens enviadas (status SENT/FAILED).
- `MessagesController` no painel permite *reenvio manual* em caso de falha de provedor.
- Integração padrão: `EvolutionAPI` (WhatsApp) e `Nodemailer` (SMTP E-mails).

---

### 2.9 SaaS Billing & Planos
**Entidade:** `Subscription`

| Endpoint | Método | Descrição |
|----------|--------|-----------|
| `GET /subscription/current` | Auth | Mostra se tenant está no Free, Pro ou Enterprise |
| `GET /subscription/plans` | Auth | Tabela e limites descritivos de features |

Isola acessos dependendo do plano associado àquele Tenant. 

---

### 2.10 Dashboard Assistencial (Analytics)
**Tela:** `/dashboard/analytics`

Dashboard gerencial focado na Saúde dos Pacientes:
- **Taxa de Cobertura Vacinal (%)**: Analisa esquema concluído.
- **Top 5 Vacinas Aplicadas**.
- **Taxa de Retenção e No-show**.
- **Média de tempo de espera**.

---

## 3. Worker Background Jobs / Filas (Cron Processes)

Implementados via `@nestjs/schedule` com envio enfileirado no `NotificationQueue` (Exponential Backoff):
| Tarefa Oculta | Horário (CRON) | Ação Executada |
|---------------|----------------|----------------|
| `sendAppointmentReminders` | 08h Diário | Envia zap de lembrete 24h antes da consulta |
| `checkOverdueReceivables` | 07h Diário | Cobra atrasados automaticamente por WhatsApp/Email |
| `checkUpcomingPayables` | 07h Diário | Avisa o RH/Gestor Financeiro de contas vencendo |
| `checkExpiringBatches` | Seg 06h | Alerta por email lotes próximos ao vencimento |
| `sendNextDoseReminders` | 09h Diário | Solicita retorno do paciente 7 dias antes da 2ª dose |

---

## 4. Telas do Frontend (Next.js)

O SaaS conta com três instâncias visuais claras:
1. **Public Landing Page (`/`)**: Totalmente em Server Components, SEO optimizado (`manifest.json` e PWA linkado). Mostra os cards de pricing e funcionalidades SaaS.
2. **Dashboard Corporativo (`/dashboard/*`)**: App rico reativo a Zustand ou AuthContext gerido pelo JWT.
3. **Portal Paciente**: Views otimizadas para Celular.

### Mapa Atual do App:
- `/` — *Landing Page Publica SaaS*
- `/login` & `/forgot-password` — *Sistema auth multifator*
- `/dashboard/analytics` — *Painel Assistencial*
- `/dashboard/billing` — *Downgrade/Upgrade de Planos e Faturas*
- `/dashboard/notifications` — *Monitoramento do Bot do WhatsApp e e-mails*
- `/dashboard/patients/[id]` — *Prontuário com Histórico*
- `/dashboard/financial` & `/dashboard/nfse` — *Faturamento e boletos*
- `/dashboard/vaccines` & `/dashboard/stock` — *Catálogo e Doses Físicas*

---

## 5. Design System Premium e Performance
- **Visual SaaS Pro**: Tons Dark/Glassmorphism (Slate 900, Gradient Teal para Cian).
- PWA Native setup ready (`manifest.json` linkado gerando mobile friendly app).
- `Lucide-React` Icons unificados em toda plataforma.

---

## 6. Ambiente de Desenvolvimento & `.env`

Para rodar todo o NextClin 2.0 (com as features Premium de PIX e Notificação):

```env
# PIX Payments (Asaas Padrão Mockado, mas aceita prod)
PAYMENT_API_URL=https://sandbox.asaas.com/api/v3
PAYMENT_API_KEY=sua-api-key

# Google Calendar (Agendamentos da Casa)
GOOGLE_CLIENT_ID=xxx.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=xxx
GOOGLE_REDIRECT_URI=http://localhost:3001/appointments/calendar/callback

# Notificações WhatsApp (Evolution) e E-mail
EVOLUTION_API_URL=http://localhost:8080
EVOLUTION_API_KEY=xxx
EVOLUTION_INSTANCE=nextclin
SMTP_HOST=smtp.mailgun.org
SMTP_USER=xxx
```

Todos os serviços integram modo mock fallback graceless (se apagar variável, roda 100% de forma estática controlada, excelente para vendas e desenvolvimento offline). 

---
*© 2026 Next Studios | Sistema Totalmente Atualizado.*
