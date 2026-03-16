# integracao-pi-login

Projeto exemplo de integração com o [Pi Login](https://login.pi.gov.br) - Solução de Single Sign On da Plataforma Gov.Pi Cidadão.

A documentação completa com os passos para integração está disponível no [Documento de Integração com o Pi Login](docs/integracao-pi-login.pdf)

Este projeto foi desenvolvido utilizando o template react-ts do Vite através do comando abaixo:
`bunx create-vite integracao-pi-login --template react-ts`

Foi desenvolvido um contexto de autenticação de exemplo (AuthContext.tsx), abstraindo a comunicação com a lib keycloak-js (lib oficial do Keycloak).
Existem outras estratégias, como em projetos Next.js com a lib NextAuth usando o provider [Keycloak](https://next-auth.js.org/providers/keycloak).

As envs contendo credenciais de teste com o Pi Login de DEV estão no arquivo `.env`.

Para uso em produção solicitar as credenciais de produção - criação de client e configuração das urls de redireção e CORS.






