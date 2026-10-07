import { prisma } from './backend/src/lib/prisma';

async function main() {
  try {
    console.log("Tentando criar empresa de teste...");
    const company = await prisma.company.create({
      data: {
        name: "Empresa Teste " + Date.now(),
        cnpj: "11111111111111",
        type: "MINISTRANTE"
      }
    });
    console.log("Sucesso!", company);
  } catch (err) {
    console.error("ERRO NO PRISMA:", err);
  } finally {
    await prisma.$disconnect();
  }
}

main();
