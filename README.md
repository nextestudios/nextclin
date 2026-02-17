# Vacinação SaaS

Sistema de gestão para clínicas de vacinação multi-tenant.

## Estrutura
- `backend`: NestJS (API)
- `frontend`: Next.js (Web App)
- `docker-compose.yml`: Banco de dados MySQL

## Pré-requisitos
- Node.js (v18+)
- Docker e Docker Compose (para o banco de dados)

## Como rodar

### 1. Banco de Dados
```bash
docker-compose up -d
```
Isso iniciará o MySQL na porta 3306 e o Adminer na porta 8080.

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
