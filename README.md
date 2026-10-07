# Avalia - Sistema de Gestão de Eventos, Avaliações e Certificados

O **Avalia** é uma plataforma web desenvolvida para simplificar a gestão de eventos e cursos de capacitação, permitindo coletar avaliações de satisfação e desempenho dos participantes em tempo real e automatizar a emissão e validação de certificados digitais.

---

## 🎯 O que o sistema faz na prática?

1. **Gestão de Eventos e Cursos**: Cadastro de eventos, cronogramas diários, descrição e vinculação de empresas parceiras.
2. **Avaliações Diárias via Link / QR Code**: Participantes respondem avaliações diárias de forma simples e rápida através de links públicos dedicados, sem necessidade de login.
3. **Painel de Resultados e Feedbacks**: Gestores acompanham notas médias, gráficos e comentários deixados pelos participantes em cada dia de evento.
4. **Emissão e Validação de Certificados**: Emissão de certificados para participantes concluintes com hash verificador único para consulta pública de autenticidade.
5. **Gestão de Empresas e Usuários**: Cadastro de parceiros institucionais, relatórios periódicos de atividades e controle de permissões de acesso (Administrador, Organizador e Participante).

---

## 🛠️ Tecnologias

- **Frontend**: Next.js 15+ (App Router), React 19, TypeScript, Tailwind CSS.
- **Backend**: Node.js, Express, TypeScript, Prisma ORM 7.x.
- **Banco de Dados**: SQLite integrado via `@prisma/adapter-better-sqlite3`.
- **Autenticação**: Autenticação local com JWT (`jsonwebtoken`) e criptografia com `bcryptjs`.

---

## 📂 Estrutura do Repositório

```
avalia/
├── backend/       # API RESTful em Express e TypeScript com Prisma
├── frontend/      # Aplicação Web em Next.js 15 com Tailwind CSS
├── integracao/    # Documentação e referências técnicas de integrações
└── .agent/        # Base de conhecimento e histórico de decisões arquiteturais
```

---

## 🚀 Como Executar

### 1. Pré-requisitos
- Node.js 18+ instalado
- npm ou yarn

### 2. Backend (API)
```bash
cd backend
npm install
npm run dev
```
> A API estará disponível em: `http://localhost:3001`

### 3. Frontend (Web)
```bash
cd frontend
npm install
npm run dev
```
> A aplicação estará disponível em: `http://localhost:3000`

---

## 🔐 Credenciais de Acesso (Ambiente de Desenvolvimento)

- **Usuário Administrador**: `gestor76693481353@pi.gov.br`
- **Senha**: `123456`

---

## 🧠 Memória do Projeto e Hand-off

O repositório conta com o arquivo `.agent/memory.md` para registrar o histórico de decisões arquiteturais e desafios técnicos superados.
- **Desenvolvedores**: As mensagens de commit (`git commit -m "..."`) são registradas automaticamente no histórico via Git Hook configurado.
