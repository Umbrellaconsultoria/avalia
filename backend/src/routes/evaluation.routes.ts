import { Router } from 'express';
import { prisma } from '../lib/prisma';
import { authenticateToken } from '../middlewares/auth.middleware';

const router = Router();

// Participante avallia e marca presença
router.post('/', authenticateToken, async (req, res) => {
  try {
    const { eventId, rating, feedback } = req.body;
    // Pega o ID/CPF do usuário logado via req.user (injetado pelo middleware)
    const userId = req.user?.sub || req.user?.preferred_username;

    if (!eventId || !rating || !userId) {
      res.status(400).json({ error: 'Campos obrigatórios faltando.' });
      return;
    }

    // Busca usuário no banco (se não existir, no mundo real deveria criar via Webhook do Keycloak, mas aqui vamos tentar garantir)
    let dbUser = await prisma.user.findUnique({ where: { cpf: userId } });
    if (!dbUser) {
        dbUser = await prisma.user.create({
            data: {
                cpf: userId,
                name: req.user?.name || 'Participante',
                email: req.user?.email || `${userId}@gov.pi`
            }
        });
    }

    // Cria Avaliação (Que conta como presença na data atual)
    const evaluation = await prisma.dailyEvaluation.create({
      data: {
        eventId,
        userId: dbUser.id,
        rating: Number(rating),
        feedback,
        date: new Date()
      }
    });

    res.status(201).json(evaluation);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Erro ao enviar avaliação. Você já pode ter preenchido hoje.' });
  }
});

export default router;
