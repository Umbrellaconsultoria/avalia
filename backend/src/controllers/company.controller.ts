import { Request, Response } from 'express';
import { prisma } from '../lib/prisma';

export const companyController = {
  // Criar uma nova empresa
  async create(req: Request, res: Response): Promise<void> {
    try {
      const { name, cnpj, type } = req.body;

      if (!name || !cnpj || !type) {
        res.status(400).json({ error: 'Campos obrigatórios faltando.' });
        return;
      }

      const company = await prisma.company.create({
        data: {
          name,
          cnpj,
          type // MINISTRANTE ou SUPORTE
        }
      });

      res.status(201).json(company);
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'Erro ao criar empresa.' });
    }
  },

  // Listar todas as empresas
  async list(req: Request, res: Response): Promise<void> {
    try {
      const companies = await prisma.company.findMany({
        orderBy: { name: 'asc' }
      });
      res.json(companies);
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'Erro ao listar empresas.' });
    }
  }
};
