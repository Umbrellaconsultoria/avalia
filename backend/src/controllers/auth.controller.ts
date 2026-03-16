import { Request, Response } from 'express';
import { prisma } from '../lib/prisma';

export const authController = {
  // Retorna os dados do usuário a partir do token Gov.br mesclado com a nossa base interna.
  async me(req: Request, res: Response): Promise<void> {
    try {
      const userPayload = (req as any).user;
      const cpf = userPayload.preferred_username || userPayload.cpf;
      
      if (!cpf) {
        res.status(400).json({ error: 'CPF não encontrado no token do Keycloak PI Login' });
        return;
      }

      // Atualiza banco com dados frescos vindos do Gov.br
      const dbUser = await prisma.user.upsert({
        where: { cpf },
        update: {
          name: userPayload.name || undefined,
          email: userPayload.email || undefined,
          phone: userPayload.phone_number || undefined
        },
        create: {
          cpf,
          name: userPayload.name || 'Participante Desconhecido',
          email: userPayload.email || `${cpf}@sememail.pi.gov.br`,
          phone: userPayload.phone_number || null,
          role: 'PARTICIPANT'
        }
      });

      res.status(200).json({ 
        ...userPayload, 
        internalRole: dbUser.role,
        name: dbUser.name,
        email: dbUser.email,
        phone: dbUser.phone
      });
    } catch (error) {
       console.error(error);
       res.status(500).json({ error: 'Erro ao validar perfil do Gov.br' });
    }
  }
};
