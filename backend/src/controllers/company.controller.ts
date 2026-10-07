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
    } catch (error: any) {
      console.error(error);
      if (error.code === 'P2002') {
        res.status(400).json({ error: 'CNPJ já cadastrado.' });
        return;
      }
      res.status(500).json({ error: 'Erro interno ao criar empresa.' });
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
  },

  // Obter uma empresa específica
  async getById(req: Request, res: Response): Promise<void> {
    try {
      const id = req.params.id as string;
      const company = await prisma.company.findUnique({
        where: { id },
        include: {
          eventCompanies: {
            include: { event: true }
          }
        }
      });

      if (!company) {
        res.status(404).json({ error: 'Empresa não encontrada.' });
        return;
      }

      res.json(company);
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'Erro ao buscar empresa.' });
    }
  },

  // Atualizar empresa
  async update(req: Request, res: Response): Promise<void> {
    try {
      const id = req.params.id as string;
      const { name, cnpj, type } = req.body;

      const company = await prisma.company.update({
        where: { id },
        data: { name, cnpj, type }
      });

      res.json(company);
    } catch (error: any) {
      console.error(error);
      if (error.code === 'P2002') {
        res.status(400).json({ error: 'CNPJ já cadastrado em outra empresa.' });
        return;
      }
      res.status(500).json({ error: 'Erro ao atualizar empresa.' });
    }
  },

  // Excluir empresa
  async delete(req: Request, res: Response): Promise<void> {
    try {
      const id = req.params.id as string;

      // Verifica se há vínculos antes de excluir (integridade)
      const hasEvents = await prisma.eventCompany.findFirst({
        where: { companyId: id }
      });

      if (hasEvents) {
        res.status(400).json({ error: 'Não é possível excluir uma empresa vinculada a eventos.' });
        return;
      }

      await prisma.company.delete({
        where: { id }
      });

      res.status(204).send();
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'Erro ao excluir empresa.' });
    }
  }
};
