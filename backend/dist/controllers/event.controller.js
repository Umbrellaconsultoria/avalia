"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.eventController = void 0;
const prisma_1 = require("../lib/prisma");
exports.eventController = {
    // Criar um novo evento
    async create(req, res) {
        try {
            const { title, description, startDate, endDate, startTime, endTime } = req.body;
            if (!title || !startDate || !endDate || !startTime || !endTime) {
                res.status(400).json({ error: 'Campos obrigatórios faltando.' });
                return;
            }
            const event = await prisma_1.prisma.event.create({
                data: {
                    title,
                    description,
                    startDate: new Date(startDate),
                    endDate: new Date(endDate),
                    startTime,
                    endTime
                }
            });
            res.status(201).json(event);
        }
        catch (error) {
            console.error(error);
            res.status(500).json({ error: 'Erro ao criar evento.' });
        }
    },
    // Listar todos os eventos
    async list(req, res) {
        try {
            const events = await prisma_1.prisma.event.findMany({
                orderBy: { startDate: 'desc' }
            });
            res.json(events);
        }
        catch (error) {
            console.error(error);
            res.status(500).json({ error: 'Erro ao listar eventos.' });
        }
    },
    // Obter um evento específico
    async getById(req, res) {
        try {
            const id = req.params.id;
            const event = await prisma_1.prisma.event.findUnique({
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
            res.json(event);
        }
        catch (error) {
            console.error(error);
            res.status(500).json({ error: 'Erro ao buscar evento.' });
        }
    }
};
