"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.prisma = void 0;
const adapter_libsql_1 = require("@prisma/adapter-libsql");
const client_1 = require("@libsql/client");
const client_2 = require("@prisma/client");
const libsqlUrl = {
    url: 'file:./dev.db',
};
const libsql = (0, client_1.createClient)(libsqlUrl);
// @ts-ignore
const adapter = new adapter_libsql_1.PrismaLibSql(libsql);
const globalForPrisma = global;
exports.prisma = globalForPrisma.prisma ||
    new client_2.PrismaClient({
        adapter,
        log: ['query'],
    });
if (process.env.NODE_ENV !== 'production')
    globalForPrisma.prisma = exports.prisma;
