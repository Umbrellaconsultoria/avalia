import { PrismaLibSql } from '@prisma/adapter-libsql';
import { createClient } from '@libsql/client';
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const libsqlUrl = {
  url: 'file:./dev.db',
};

const libsql = createClient(libsqlUrl);
const adapter = new PrismaLibSql(libsql);
const prisma = new PrismaClient({ adapter });

async function main() {
  const email = 'gestor76693481353@pi.gov.br';
  const password = '123456';
  
  try {
    const hashedPassword = await bcrypt.hash(password, 10);
    
    const user = await prisma.user.update({
      where: { email },
      data: { password: hashedPassword }
    });
    
    console.log(`Sucesso! Senha definida para o usuário: ${user.email}`);
    console.log(`Senha de teste: ${password}`);
  } catch (err) {
    console.error('Erro ao atualizar senha:', err);
  } finally {
    await prisma.$disconnect();
  }
}

main();
