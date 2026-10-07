import { Request, Response } from 'express';
import { prisma } from '../lib/prisma';
import PDFDocument from 'pdfkit';

export const certificateController = {
  async generate(req: Request, res: Response): Promise<void> {
    try {
      const { eventId } = req.params;
      const userCpf = req.user?.sub || req.user?.preferred_username;
      const userEmail = req.user?.email;

      if (!eventId) {
        res.status(400).json({ error: 'ID do evento é obrigatório.' });
        return;
      }

      await generatePdf(res, eventId, { cpf: userCpf, email: userEmail });
    } catch (error: any) {
      console.error(error);
      res.status(500).json({ error: error.message || 'Erro interno ao gerar certificado.' });
    }
  },

  async generateAdmin(req: Request, res: Response): Promise<void> {
    try {
      const { eventId, identifier } = req.params;
      const isAdmin = req.user?.internalRole === 'ADMIN';

      if (!isAdmin) {
        res.status(403).json({ error: 'Acesso negado. Apenas administradores podem emitir certificados de terceiros.' });
        return;
      }

      if (!eventId || !identifier) {
        res.status(400).json({ error: 'Parâmetros inválidos.' });
        return;
      }

      // identifier pode ser CPF ou E-mail
      const isEmail = identifier.includes('@');
      await generatePdf(res, eventId as string, isEmail ? { email: identifier as string } : { cpf: identifier as string });
    } catch (error: any) {
      console.error(error);
      res.status(500).json({ error: error.message || 'Erro ao gerar certificado administrativo.' });
    }
  }
};

async function generatePdf(res: Response, eventId: string, participant: { cpf?: string, email?: string }) {
  // Busca o Evento
  const event = await prisma.event.findUnique({ where: { id: eventId } });
  if (!event) throw new Error('Evento não encontrado.');

  // Busca o Usuário ou Participante
  let participantName = 'Participante';
  let participantEmail = participant.email;
  let wherePresenca: any = { eventId };

  if (participant.cpf) {
    const user = await prisma.user.findUnique({ where: { cpf: participant.cpf } });
    if (!user) throw new Error('Usuário não encontrado.');
    participantName = user.name;
    participantEmail = user.email;
    wherePresenca.userId = user.id;
  } else if (participant.email) {
    // Se for e-mail, pode ser um Participant anônimo ou um User logado pelo e-mail
    const user = await prisma.user.findUnique({ where: { email: participant.email } });
    if (user) {
      participantName = user.name;
      wherePresenca.userId = user.id;
    } else {
      // Busca pelo registro anônimo na DailyEvaluation
      const anonymousEval = await prisma.dailyEvaluation.findFirst({
        where: { eventId, participantEmail: participant.email }
      });
      if (anonymousEval) {
        participantName = anonymousEval.participantName || 'Participante';
        wherePresenca.participantEmail = participant.email;
      } else {
        throw new Error('Participante não localizado nas avaliações deste evento.');
      }
    }
  }

  // Regra de Negócio de Presença
  const evaluationCount = await prisma.dailyEvaluation.count({ where: wherePresenca });

  if (evaluationCount === 0) {
    throw new Error('Participante não possui assiduidade mínima para emitir certificado.');
  }

  // -- GERAR PDF --
  const doc = new PDFDocument({ layout: 'landscape', size: 'A4' });

  res.setHeader('Content-Type', 'application/pdf');
  res.setHeader('Content-Disposition', `attachment; filename=Certificado-${participantName.replace(/\s/g, '_')}.pdf`);

  doc.pipe(res);

  doc.rect(0, 0, doc.page.width, doc.page.height).fill('#f9fafb');
  doc.rect(20, 20, doc.page.width - 40, doc.page.height - 40).stroke('#2563eb');
  
  doc.fillColor('#1e3a8a').fontSize(40).text('CERTIFICADO DE PRESENÇA', { align: 'center' });
  doc.moveDown(2);
  doc.fillColor('#374151').fontSize(20).text('Certificamos que', { align: 'center' });
  doc.moveDown(1);
  doc.fillColor('#1f2937').fontSize(30).text(participantName.toUpperCase(), { align: 'center' });
  doc.moveDown(1);
  doc.fillColor('#374151').fontSize(16).text(`Participou ativamente do curso/evento "${event.title}", `, { align: 'center' });
  
  const startDateStr = new Date(event.startDate).toLocaleDateString('pt-BR');
  const endDateStr = new Date(event.endDate).toLocaleDateString('pt-BR');

  doc.moveDown(1);
  doc.text(`Realizado entre ${startDateStr} e ${endDateStr}, validando um total de ${evaluationCount} unidades de presença diárias.`, { align: 'center' });
  doc.moveDown(4);
  doc.fontSize(12).text('Plataforma Assiduidade Digital', { align: 'center' });
  doc.end();
}
