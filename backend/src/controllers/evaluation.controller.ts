import { Request, Response } from 'express';
import { prisma } from '../lib/prisma';

export const evaluationController = {
  // Criar avaliação (Apenas PARTICIPANT)
  async create(req: Request, res: Response): Promise<void> {
    try {
      const { eventId, rating, feedback, department } = req.body;
      const userId = req.user?.id;
      const role = req.user?.internalRole;

      if (role !== 'PARTICIPANT') {
        res.status(403).json({ error: 'Apenas participantes podem avaliar eventos.' });
        return;
      }

      if (!eventId || !rating || !userId || !department) {
        res.status(400).json({ error: 'Campos obrigatórios faltando.' });
        return;
      }

      const today = new Date();
      today.setUTCHours(0, 0, 0, 0);

      const evaluation = await (prisma.dailyEvaluation as any).create({
        data: {
          eventId,
          userId,
          rating: Number(rating),
          feedback,
          department,
          date: today
        }
      });

      res.status(201).json(evaluation);
    } catch (error: any) {
      console.error(error);
      if (error.code === 'P2002') {
        res.status(400).json({ error: 'Você já avaliou este evento hoje.' });
        return;
      }
      res.status(500).json({ error: 'Erro ao enviar avaliação.' });
    }
  },

  // Obter detalhes básicos de um evento publicamente
  async getPublicById(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;

      const event = await prisma.event.findUnique({
        where: { id },
        select: {
          id: true,
          title: true,
          description: true,
          startDate: true,
          endDate: true,
          location: true,
          imageUrl: true,
          companies: {
            select: {
              company: {
                select: {
                  id: true,
                  name: true,
                  logoUrl: true,
                },
              },
            },
          },
        },
      });

      if (!event) {
        res.status(404).json({ error: 'Evento não encontrado.' });
        return;
      }

      res.json(event);
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'Erro ao buscar detalhes do evento.' });
    }
  },

  // Criar avaliação pública (Sem Token)
  async createPublic(req: Request, res: Response): Promise<void> {
    try {
      const { eventId, rating, feedback, participantName, participantEmail, department } = req.body;

      if (!eventId || !rating || !participantName || !participantEmail || !department) {
        res.status(400).json({ error: 'Campos obrigatórios faltando (ID, Nota, Nome, E-mail ou Departamento).' });
        return;
      }

      // Verifica se o evento existe e está ativo (opcional, mas bom ter)
      const event = await prisma.event.findUnique({ where: { id: eventId } });
      if (!event) {
        res.status(404).json({ error: 'Evento não encontrado.' });
        return;
      }

      const today = new Date();
      today.setUTCHours(0, 0, 0, 0);

      const evaluation = await (prisma.dailyEvaluation as any).create({
        data: {
          eventId,
          rating: Number(rating),
          feedback,
          participantName,
          participantEmail,
          department,
          date: today
        }
      });

      res.status(201).json(evaluation);
    } catch (error: any) {
      console.error(error);
      if (error.code === 'P2002') {
        res.status(400).json({ error: 'Uma avaliação já foi registrada para este e-mail hoje neste evento.' });
        return;
      }
      res.status(500).json({ error: 'Erro ao enviar avaliação pública.' });
    }
  },

  // Listar avaliações (Admin vê todas, Empresa vê apenas as dela)
  async list(req: Request, res: Response): Promise<void> {
    try {
      const userCompanyId = req.user?.companyId;
      const isAdmin = req.user?.internalRole === 'ADMIN';
      const eventId = req.query.eventId as string;

      const where: any = {};
      
      if (eventId) {
        where.eventId = eventId;
      }

      // Se não for admin, filtra pelo vínculo da empresa
      if (!isAdmin) {
        if (!userCompanyId) {
          res.status(403).json({ error: 'Acesso negado. Usuário sem empresa vinculada.' });
          return;
        }
        
        // Filtra avaliações cujos eventos pertencem à empresa do usuário
        where.event = {
          companies: {
            some: {
              companyId: userCompanyId
            }
          }
        };
      }

      const evaluations = await prisma.dailyEvaluation.findMany({
        where,
        include: {
          user: { select: { name: true, email: true } },
          event: { select: { title: true } }
        },
        orderBy: { createdAt: 'desc' }
      });

      // Mapeia para garantir que o nome apareça de uma das duas fontes
      const mappedEvaluations = evaluations.map((ev: any) => ({
        ...ev,
        userName: ev.user?.name || ev.participantName,
        userEmail: ev.user?.email || ev.participantEmail
      }));

      res.json(mappedEvaluations);
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'Erro ao listar avaliações.' });
    }
  }
};
