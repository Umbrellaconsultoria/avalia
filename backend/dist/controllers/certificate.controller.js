"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.certificateController = void 0;
const prisma_1 = require("../lib/prisma");
const pdfkit_1 = __importDefault(require("pdfkit"));
exports.certificateController = {
    async generate(req, res) {
        try {
            const { eventId } = req.params;
            const userId = req.user?.sub || req.user?.preferred_username;
            if (!eventId || !userId) {
                res.status(400).json({ error: 'Parâmetros inválidos.' });
                return;
            }
            // Busca o Evento para pegar as datas
            const eventIdStr = req.params.eventId;
            const event = await prisma_1.prisma.event.findUnique({ where: { id: eventIdStr } });
            if (!event) {
                res.status(404).json({ error: 'Evento não encontrado.' });
                return;
            }
            // Busca o Usuário
            const user = await prisma_1.prisma.user.findUnique({ where: { cpf: userId } });
            if (!user) {
                res.status(404).json({ error: 'Usuário não cadastrado neste sistema.' });
                return;
            }
            // Regra de Negócio de Presença: Contar as DailyEvaluations do usuário no Evento
            const evaluationCount = await prisma_1.prisma.dailyEvaluation.count({
                where: { eventId: eventIdStr, userId: user.id }
            });
            // Lógica de cálculo (Simples: 1 Avaliação = 1 dia de presença). 
            // Se não tem presença nenhuma, bloqueia:
            if (evaluationCount === 0) {
                res.status(403).json({ error: 'Participante não possui assiduidade mínima para emitir certificado.' });
                return;
            }
            // -- GERAR PDF --
            const doc = new pdfkit_1.default({
                layout: 'landscape',
                size: 'A4',
            });
            // Configura Response Header para download
            res.setHeader('Content-Type', 'application/pdf');
            res.setHeader('Content-Disposition', `attachment; filename=Certificado-${user.name.replace(/\s/g, '_')}.pdf`);
            doc.pipe(res);
            // Design básico do Certificado
            doc.rect(0, 0, doc.page.width, doc.page.height).fill('#f9fafb');
            doc.rect(20, 20, doc.page.width - 40, doc.page.height - 40).stroke('#2563eb');
            doc.fillColor('#1e3a8a').fontSize(40).text('CERTIFICADO DE PRESENÇA', { align: 'center' });
            doc.moveDown(2);
            doc.fillColor('#374151').fontSize(20).text('Certificamos que', { align: 'center' });
            doc.moveDown(1);
            doc.fillColor('#1f2937').fontSize(30).text(user.name.toUpperCase(), { align: 'center' });
            doc.moveDown(1);
            doc.fillColor('#374151').fontSize(16).text(`Participou ativamente do curso/evento "${event.title}", `, { align: 'center' });
            const startDateStr = new Date(event.startDate).toLocaleDateString('pt-BR');
            const endDateStr = new Date(event.endDate).toLocaleDateString('pt-BR');
            doc.moveDown(1);
            doc.text(`Realizado entre ${startDateStr} e ${endDateStr}, validando um total de ${evaluationCount} unidades de presença diárias.`, { align: 'center' });
            doc.moveDown(4);
            doc.fontSize(12).text('PI Login - Governo do Estado do Piauí', { align: 'center' });
            doc.text(`Emitido autenticamente e eletronicamente em ${new Date().toLocaleDateString('pt-BR')}`, { align: 'center' });
            doc.end();
        }
        catch (error) {
            console.error(error);
            res.status(500).json({ error: 'Erro interno ao gerar certificado.' });
        }
    }
};
