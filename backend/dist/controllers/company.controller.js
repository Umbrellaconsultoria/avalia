"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.companyController = void 0;
const prisma_1 = require("../lib/prisma");
exports.companyController = {
    // Criar uma nova empresa
    async create(req, res) {
        try {
            const { name, cnpj, type } = req.body;
            if (!name || !cnpj || !type) {
                res.status(400).json({ error: 'Campos obrigatórios faltando.' });
                return;
            }
            const company = await prisma_1.prisma.company.create({
                data: {
                    name,
                    cnpj,
                    type // MINISTRANTE ou SUPORTE
                }
            });
            res.status(201).json(company);
        }
        catch (error) {
            console.error(error);
            res.status(500).json({ error: 'Erro ao criar empresa.' });
        }
    },
    // Listar todas as empresas
    async list(req, res) {
        try {
            const companies = await prisma_1.prisma.company.findMany({
                orderBy: { name: 'asc' }
            });
            res.json(companies);
        }
        catch (error) {
            console.error(error);
            res.status(500).json({ error: 'Erro ao listar empresas.' });
        }
    }
};
