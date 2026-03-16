import { createClient } from '@libsql/client';
import { v4 as uuidv4 } from 'uuid';

const client = createClient({
  url: 'file:./dev.db',
});

async function run() {
  const cpf = '76693481353';
  const id = uuidv4();
  
  // Verifica se o usuário já existe
  const check = await client.execute({
    sql: 'SELECT id FROM User WHERE cpf = ?',
    args: [cpf]
  });

  if (check.rows.length > 0) {
    // Atualiza
    await client.execute({
      sql: 'UPDATE User SET role = ?, updatedAt = CURRENT_TIMESTAMP WHERE cpf = ?',
      args: ['ADMIN', cpf]
    });
    console.log('Usuário existente atualizado para ADMIN com sucesso!');
  } else {
    // Cria novo
    await client.execute({
      sql: 'INSERT INTO User (id, cpf, name, email, role, createdAt, updatedAt) VALUES (?, ?, ?, ?, ?, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)',
      args: [id, cpf, 'Gestor (Vinculado pelo CPF)', `gestor${cpf}@pi.gov.br`, 'ADMIN']
    });
    console.log('Novo usuário gestor criado com sucesso e atrelado ao CPF!');
  }
}

run()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => {
    client.close();
  });
