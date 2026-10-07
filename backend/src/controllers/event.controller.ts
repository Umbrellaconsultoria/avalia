import { Request, Response } from 'express';
import { prisma } from '../lib/prisma';

export const eventController = {
  // Criar um novo evento
  async create(req: Request, res: Response): Promise<void> {
    try {
      const { title, description, startDate, endDate, startTime, endTime, companyIds } = req.body;
      const userCompanyId = req.user?.companyId;

      if (!title || !startDate || !endDate || !startTime || !endTime) {
        res.status(400).json({ error: 'Campos obrigatórios faltando.' });
        return;
      }

      // Se for usuário de empresa, usa o ID dele. Se for Admin, usa o que veio no body.
      const finalCompanyIds = userCompanyId ? [userCompanyId] : (companyIds || []);

      const event = await prisma.event.create({
        data: {
          title,
          description,
          startDate: new Date(startDate),
          endDate: new Date(endDate),
          startTime,
          endTime,
          companies: finalCompanyIds.length > 0 ? {
            create: finalCompanyIds.map((companyId: string) => ({
              companyId
            }))
          } : undefined
        },
        include: {
          companies: {
            include: { company: true }
          }
        }
      });

      res.status(201).json(event);
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'Erro ao criar evento.' });
    }
  },

  // Listar todos os eventos
  async list(req: Request, res: Response): Promise<void> {
    try {
      const userCompanyId = req.user?.companyId;
      const isAdmin = req.user?.internalRole === 'ADMIN';

      const events = await prisma.event.findMany({
        where: isAdmin ? {} : {
          companies: {
            some: { companyId: userCompanyId }
          }
        },
        orderBy: { startDate: 'desc' },
        include: {
          companies: {
            include: { company: true }
          }
        }
      });
      res.json(events);
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'Erro ao listar eventos.' });
    }
  },

// Obter um evento específico
  async getById(req: Request, res: Response): Promise<void> {
    try {
      const id = req.params.id as string;
      const userCompanyId = req.user?.companyId;
      const isAdmin = req.user?.internalRole === 'ADMIN';

      const event = await prisma.event.findUnique({
        where: { id },
        include: {
          companies: {
            include: { company: true }
          }
        }
      });

      if (!event) {
        res.status(404).json({ error: 'Evento não encontrado.' });
        return;
      }

      // Validação de acesso: Se não for admin, verifica se o evento pertence à empresa do usuário
      if (!isAdmin) {
        const isLinked = event.companies.some(c => c.companyId === userCompanyId);
        if (!isLinked) {
          res.status(403).json({ error: 'Acesso negado a este evento.' });
          return;
        }
      }

      res.json(event);
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'Erro ao buscar evento.' });
    }
  },

  // Obter detalhes básicos de um evento publicamente
  async getPublicById(req: Request, res: Response): Promise<void> {
    console.log('[DEBUG] getPublicById called for ID:', req.params.id);
    try {
      const id = req.params.id as string;
      const event = await prisma.event.findUnique({
        where: { id },
        select: {
          id: true,
          title: true,
          description: true
        }
      });

      if (!event) {
        res.status(404).json({ error: 'Evento não encontrado.' });
        return;
      }

      res.json(event);
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'Erro ao buscar evento público.' });
    }
  },

  // Atualizar evento
  async update(req: Request, res: Response): Promise<void> {
    try {
      const id = req.params.id as string;
      const { title, description, startDate, endDate, startTime, endTime, companyIds } = req.body;
      const userCompanyId = req.user?.companyId;
      const isAdmin = req.user?.internalRole === 'ADMIN';

      // Validação de acesso: Se não for admin, verifica se o evento pertence à empresa do usuário
      if (!isAdmin) {
        const existingEvent = await prisma.event.findFirst({
          where: { 
            id,
            companies: { some: { companyId: userCompanyId } }
          }
        });
        if (!existingEvent) {
          res.status(403).json({ error: 'Acesso negado a este evento.' });
          return;
        }
      }

      // Sincroniza as empresas se companyIds for fornecido (Apenas Admin pode mudar empresas livremente por enquanto)
      // Usuário de empresa não muda seus próprios vínculos via esse endpoint de "update básico"
      if (isAdmin && companyIds !== undefined) {
        // Remove vínculos antigos
        await prisma.eventCompany.deleteMany({
          where: { eventId: id }
        });

        // Cria novos vínculos
        if (companyIds.length > 0) {
          await prisma.eventCompany.createMany({
            data: companyIds.map((companyId: string) => ({
              eventId: id,
              companyId
            }))
          });
        }
      }

      const event = await prisma.event.update({
        where: { id },
        data: {
          title,
          description,
          startDate: startDate ? new Date(startDate) : undefined,
          endDate: endDate ? new Date(endDate) : undefined,
          startTime,
          endTime
        },
        include: {
          companies: {
            include: { company: true }
          }
        }
      });

      res.json(event);
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'Erro ao atualizar evento.' });
    }
  },

  // Excluir evento
  async delete(req: Request, res: Response): Promise<void> {
    try {
      const id = req.params.id as string;
      const userCompanyId = req.user?.companyId;
      const isAdmin = req.user?.internalRole === 'ADMIN';

      // Validação de acesso: Se não for admin, verifica se o evento pertence à empresa do usuário
      if (!isAdmin) {
        const existingEvent = await prisma.event.findFirst({
          where: { 
            id,
            companies: { some: { companyId: userCompanyId } }
          }
        });
        if (!existingEvent) {
          res.status(403).json({ error: 'Acesso negado a este evento.' });
          return;
        }
      }

      // Exclui vínculos primeiro ou deixa o Prisma lidar via cascade se configurado
      // Como o DB é SQLite e pode não ter cascade configurado manualmente no schema sem migration:
      await prisma.eventCompany.deleteMany({ where: { eventId: id } });
      await prisma.dailyEvaluation.deleteMany({ where: { eventId: id } });
      await prisma.activityReport.deleteMany({ where: { eventId: id } });

      await prisma.event.delete({
        where: { id }
      });

      res.status(204).send();
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'Erro ao excluir evento.' });
    }
  }
};
