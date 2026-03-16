"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const prisma_1 = require("../lib/prisma");
const auth_middleware_1 = require("../middlewares/auth.middleware");
const router = (0, express_1.Router)();
// Participante avallia e marca presença
router.post('/', auth_middleware_1.authenticateToken, async (req, res) => {
    try {
        const { eventId, rating, feedback } = req.body;
        // Pega o ID/CPF do usuário logado via req.user (injetado pelo middleware)
        const userId = req.user?.sub || req.user?.preferred_username;
        if (!eventId || !rating || !userId) {
            res.status(400).json({ error: 'Campos obrigatórios faltando.' });
            return;
        }
        // Busca usuário no banco (se não existir, no mundo real deveria criar via Webhook do Keycloak, mas aqui vamos tentar garantir)
        let dbUser = await prisma_1.prisma.user.findUnique({ where: { cpf: userId } });
        if (!dbUser) {
            dbUser = await prisma_1.prisma.user.create({
                data: {
                    cpf: userId,
                    name: req.user?.name || 'Participante',
                    email: req.user?.email || `${userId}@gov.pi`
                }
            });
        }
        // Cria Avaliação (Que conta como presença na data atual)
        const evaluation = await prisma_1.prisma.dailyEvaluation.create({
            data: {
                eventId,
                userId: dbUser.id,
                rating: Number(rating),
                feedback,
                date: new Date()
            }
        });
        res.status(201).json(evaluation);
    }
    catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Erro ao enviar avaliação. Você já pode ter preenchido hoje.' });
    }
});
exports.default = router;
