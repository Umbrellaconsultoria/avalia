# 🧠 Memória do Projeto e Hand-off (Para Agentes de IA e Desenvolvedores)

O projeto contém uma pasta oculta `.agent/` onde reside o arquivo `memory.md`. O `memory.md` é o **cérebro do projeto** utilizado para registrar as principais decisões arquiteturais, desafios técnicos superados e o estado das últimas tarefas complexas da engenharia de dados (como as correções do Prisma 7 no Windows e a mudança de autenticação).

## Como proceder com o `memory.md`:

- **Para IAs Assistentes:** Se você for continuar o desenvolvimento com a ajuda de um agente assistente de código (como Antigravity, GitHub Copilot, Cursor ou ChatGPT), comece a interação pedindo para que ele leia o documento `.agent/memory.md`. Isso carregará todo o contexto e evitará que a IA "comece do zero" ou cometa erros passados.
- **Para Desenvolvedores:** A atualização contínua do projeto é **100% automatizada**. Você não precisa editar o arquivo manualmente. O repositório conta com um **Git Hook** configurado. Toda vez que você executar um `git commit -m "sua mensagem"`, o Git interceptará esse texto e o salvará como um novo log histórico no final do arquivo `memory.md`, incluindo a data e a hora. Por esse motivo, crie o hábito de sempre escrever mensagens descritivas sobre os bugs resolvidos ou a arquitetura que alterou ("feat:", "fix:"). O próprio fluxo da equipe alimentará a inteligência do projeto com o tempo.

## 📂 Estrutura
- `/frontend`: Aplicação Next.js 15+
- `/backend`: API Node.js/Express com Prisma 7 e SQLite
- `/frontend`: Aplicação Next.js 15+
- `/backend`: API Node.js/Express com Prisma 7 e SQLite

## 🚀 Como Iniciar
1. **Backend**: 
   ```bash
   cd backend
   npm install
   npm run dev
   ```
2. **Frontend**:
   ```bash
   cd frontend
   npm install
   npm run dev
   ```

## 🔐 Credenciais de Desenvolvimento
- **Admin**: `gestor76693481353@pi.gov.br`
- **Senha**: `123456`

---
*Mantido por Antigravity*
