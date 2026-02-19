# Vacinação SaaS

Sistema de gestão para clínicas de vacinação **multi-tenant**, pensado para pequenas e médias clínicas.

O objetivo do projeto é centralizar:
- **Agenda e atendimentos** de pacientes
- **Controle de estoque** e lotes de vacinas
- **Financeiro básico** (contas a receber/pagar)
- **Faturamento/NFS-e**
- **Auditoria** de operações por usuário/tenant

## Arquitetura do Projeto
- `backend` (NestJS):
  - API REST
  - TypeORM + MySQL
  - Autenticação com JWT
  - Multi-tenancy por clínica (tenant)
- `frontend` (Next.js App Router):
  - Dashboard web para recepção e gestão
  - Contexto de autenticação e consumo da API
  - Tailwind CSS 4 (preview) para o design
- `docker-compose.yml`:
  - Banco de dados MySQL
  - Adminer para acesso visual ao banco

## Pré-requisitos
- Node.js (v18+)
- Docker e Docker Compose (para o banco de dados)

## Como rodar

### 1. Banco de Dados
```bash
docker-compose up -d
```
Isso iniciará:
- **MySQL** na porta `3306`
- **Adminer** na porta `8081` (http://localhost:8081)

### 2. Backend
```bash
cd backend
npm install
npm run start:dev
```
A API rodará em `http://localhost:3000`.

### 3. Frontend
```bash
cd frontend
npm install
npm run dev
```
O app rodará em `http://localhost:3001` (ou 3000 se o backend não estiver ocupando).

## Ambiente de Produção (VPS)

O projeto está preparado para deploy automático via **GitHub Actions + Docker + GHCR**.

### Como funciona o deploy (visão geral)

Quando você faz push na branch `main`, o workflow:

- **Builda** a imagem Docker usando o `Dockerfile` do repositório
- **Publica** a imagem no GitHub Container Registry (GHCR) como:
  - `ghcr.io/nextestudios/nextclinic:latest`
  - `ghcr.io/nextestudios/nextclinic:<sha_do_commit>`
- **Conecta na VPS via SSH** e executa:
  - `docker compose pull` (puxa a nova imagem)
  - `docker compose up -d` (aplica a atualização)
  - `docker image prune -f` (limpa imagens antigas)

Workflow: `.github/workflows/deploy.yml`

### Secrets necessários (GitHub Actions)

Configure em **Settings → Secrets and variables → Actions**:

- `VPS_HOST`: IP/Domínio da VPS (ex.: `62.171.139.44`)
- `VPS_USER`: usuário SSH (ex.: `root`)
- `VPS_SSH_KEY`: chave privada SSH (incluindo as linhas `BEGIN` e `END`)

### Endereços na VPS

- **Aplicação (NextClinic)**:  
  `http://SEU_IP_OU_DOMINIO:3000`  
  (no setup atual: `http://62.171.139.44:3000`)

- **Adminer (interface do banco)**:  
  `http://SEU_IP_OU_DOMINIO:8081`  
  (no setup atual: `http://62.171.139.44:8081`)

### Acesso ao banco via Adminer (produção)

Com o `docker-compose` atual, o serviço do MySQL é:

```yaml
services:
  mysql:
    image: mysql:8.0
    container_name: vacinacao_mysql
    environment:
      MYSQL_ROOT_PASSWORD: root
      MYSQL_DATABASE: vacinacao_db
      MYSQL_USER: user
      MYSQL_PASSWORD: user123
```

No Adminer, use:

- **Sistema**: `MySQL / MariaDB`
- **Servidor**: `mysql`

Usuário de aplicação:
- **Usuário**: `user`
- **Senha**: `user123`
- **Base de dados**: deixe em branco ao logar, depois selecione `vacinacao_db`

Usuário administrador:
- **Usuário**: `root`
- **Senha**: `root`
- **Base de dados**: também pode deixar em branco e escolher depois

> Em produção real, troque essas credenciais por senhas fortes e atualize o `docker-compose.yml` e variáveis de ambiente do backend.

## Funcionalidades Implementadas (MVP Fase 1)
- [x] Estrutura do Projeto (NestJS + Next.js)
- [x] Configuração de Banco de Dados (TypeORM + MySQL)
- [x] Autenticação (JWT, Login, Hash de Senha)
- [x] Multi-tenancy (Estrutura de dados)
- [x] Frontend Login e Dashboard básico

## Próximos Passos
- Implementar CRUD de Pacientes e Vacinas.
- Implementar Agenda.
- Testar fluxo de autenticação com banco real.
