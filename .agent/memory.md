# 🧠 Memória do Projeto e Hand-off (Para Agentes de IA e Desenvolvedores)

Este arquivo serve como um log de decisões, problemas resolvidos e estado atual do projeto para garantir a continuidade entre diferentes sessões e desenvolvedores.

## 🚀 Visão Geral
Sistema de avaliação de eventos e cursos com geração de certificados, integrado com Next.js e Node.js.

## 🛠️ Stack Tecnológica
- **Backend**: Node.js, Express, Prisma 7.x, SQLite.
- **Frontend**: Next.js 15+, Tailwind CSS.
- **Banco de Dados**: SQLite (`backend/dev.db`).

## 🔐 Autenticação (Decisões Críticas)
- **Transição**: O sistema foi iniciado com Gov.br (Keycloak), mas por solicitação do usuário, a autenticação foi alterada para **E-mail/Senha Local**.
- **Segurança**: Uso de `bcryptjs` para hashing e `jsonwebtoken` para tokens JWT.
- **Middleware**: Implementado `localAuth.middleware.ts` no backend.
- **Frontend**: `LocalAuthProvider.tsx` gerencia a sessão via `localStorage`.

## 🐛 Problemas Resolvidos & Gotchas
### 1. Prisma 7 + SQLite no Windows
- **Erro**: `PrismaClientConstructorValidationError` e falhas na engine WASM.
- **Solução**: Uso obrigatório do adaptador `@prisma/adapter-better-sqlite3`.
- **Configuração**: Em `backend/src/lib/prisma.ts`, o `PrismaClient` deve ser inicializado passando o objeto de configuração com a URL explicitamente:
  ```typescript
  const adapter = new PrismaBetterSqlite3({ url: `file:${dbPath}` });
  const prisma = new PrismaClient({ adapter });
  ```

## 👥 Credenciais de Teste (Ambiente Dev)
- **Administrador**: `gestor76693481353@pi.gov.br`
- **Senha**: `123456`

## 📋 Estado Atual (Março 2026)
- [x] Backend estruturado e conectado ao DB.
- [x] Login local funcionando no Frontend e Backend.
- [x] Middleware de proteção de rotas ativo.
- [ ] CRUDs de eventos e certificados (Próxima Fase).

---
*Última atualização: 2026-03-16 por Antigravity*

### 📝 Commit Auto-Log (2026-03-16 15:27:37)
- docs: configura automatização de histórico de memória via git hook

### 📝 Commit Auto-Log (2026-10-07 17:24:28)
- feat: estrutura completa do sistema avalia (frontend, backend e correções)
