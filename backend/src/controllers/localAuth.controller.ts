import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { prisma } from '../lib/prisma';

const JWT_SECRET = process.env.JWT_SECRET || 'super-secret-key-123';

export const localAuthController = {
  async register(req: Request, res: Response): Promise<void> {
    try {
      const { email, password, name, cpf, phone } = req.body;

      if (!email || !password || !cpf || !name) {
        res.status(400).json({ error: 'Campos obrigatórios: email, password, cpf, name' });
        return;
      }

      const existingUser = await prisma.user.findFirst({
        where: { OR: [{ email }, { cpf }] }
      });

      if (existingUser) {
        res.status(400).json({ error: 'Usuário já cadastrado com este e-mail ou CPF' });
        return;
      }

      const hashedPassword = await bcrypt.hash(password, 10);

      const user = await prisma.user.create({
        data: {
          email,
          password: hashedPassword,
          name,
          cpf,
          phone,
          role: 'PARTICIPANT'
        }
      });

      const { password: _, ...userWithoutPassword } = user;
      res.status(201).json(userWithoutPassword);
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'Erro ao registrar usuário' });
    }
  },

  async login(req: Request, res: Response): Promise<void> {
    try {
      const { email, password } = req.body;

      if (!email || !password) {
        res.status(400).json({ error: 'E-mail e senha são obrigatórios' });
        return;
      }

      const user = await prisma.user.findUnique({
        where: { email }
      });

      if (!user || !user.password) {
        res.status(401).json({ error: 'Credenciais inválidas' });
        return;
      }

      const isPasswordValid = await bcrypt.compare(password, user.password);

      if (!isPasswordValid) {
        res.status(401).json({ error: 'Credenciais inválidas' });
        return;
      }

      const token = jwt.sign(
        { 
          id: user.id, 
          email: user.email, 
          cpf: user.cpf, 
          name: user.name, 
          internalRole: user.role 
        },
        JWT_SECRET,
        { expiresIn: '24h' }
      );

      const { password: _, ...userWithoutPassword } = user;
      res.status(200).json({ token, user: userWithoutPassword });
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'Erro ao realizar login' });
    }
  },

  async me(req: Request, res: Response): Promise<void> {
    try {
      const userId = req.user.id;
      const user = await prisma.user.findUnique({
        where: { id: userId }
      });

      if (!user) {
        res.status(404).json({ error: 'Usuário não encontrado' });
        return;
      }

      const { password: _, ...userWithoutPassword } = user;
      res.status(200).json({ ...userWithoutPassword, internalRole: user.role });
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'Erro ao buscar perfil' });
    }
  }
};
