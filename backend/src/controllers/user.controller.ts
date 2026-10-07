import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import { prisma } from '../lib/prisma';

export const userController = {
  // Listar usuários (com filtro opcional por empresa)
  async list(req: Request, res: Response): Promise<void> {
    try {
      const companyId = req.query.companyId as string | undefined;
      const users = await prisma.user.findMany({
        where: companyId ? { companyId } : {},
        include: { company: true },
        orderBy: { name: 'asc' }
      });
      
      const safeUsers = users.map(({ password, ...u }) => u);
      res.json(safeUsers);
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'Erro ao listar usuários.' });
    }
  },

  // Obter um usuário
  async getById(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const user = await prisma.user.findUnique({
        where: { id: id as string },
        include: { company: true }
      });
      
      if (!user) {
        res.status(404).json({ error: 'Usuário não encontrado.' });
        return;
      }

      const { password, ...safeUser } = user;
      res.json(safeUser);
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'Erro ao buscar usuário.' });
    }
  },

  // Criar usuário (Apenas Admin)
  async create(req: Request, res: Response): Promise<void> {
    try {
      const { email, password, name, cpf, role, companyId, phone } = req.body;
      
      if (!email || !name || !cpf) {
        res.status(400).json({ error: 'Campos obrigatórios: email, name, cpf' });
        return;
      }

      const existing = await prisma.user.findFirst({
        where: { OR: [{ email }, { cpf }] }
      });

      if (existing) {
        res.status(400).json({ error: 'Usuário já existe com este e-mail ou CPF.' });
        return;
      }

      const hashedPassword = await bcrypt.hash(password || '123456', 10);

      const user = await prisma.user.create({
        data: {
          email: email as string,
          password: hashedPassword,
          name: name as string,
          cpf: cpf as string,
          role: (role as string) || 'PARTICIPANT',
          companyId: (companyId as string) || null,
          phone: (phone as string) || null
        }
      });

      const { password: _, ...safeUser } = user;
      res.status(201).json(safeUser);
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'Erro ao criar usuário.' });
    }
  },

  // Atualizar usuário
  async update(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const { email, name, role, companyId, phone, password } = req.body;

      const data: any = { 
        email: email as string, 
        name: name as string, 
        role: role as string, 
        companyId: (companyId as string) || null, 
        phone: (phone as string) || null 
      };
      
      if (password) {
        data.password = await bcrypt.hash(password as string, 10);
      }

      const user = await prisma.user.update({
        where: { id: id as string },
        data
      });

      const { password: _, ...safeUser } = user;
      res.json(safeUser);
    } catch (error) {
      console.error('Update User Error:', error);
      res.status(500).json({ error: 'Erro ao atualizar usuário.' });
    }
  },

  // Excluir usuário
  async delete(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      
      // Verifica se é o próprio usuário
      if (id === (req.user as any).id) {
        res.status(400).json({ error: 'Você não pode excluir a si mesmo.' });
        return;
      }

      await prisma.user.delete({ where: { id: id as string } });
      res.status(204).send();
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'Erro ao excluir usuário.' });
    }
  }
};
