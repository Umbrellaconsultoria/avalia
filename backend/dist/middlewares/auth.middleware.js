"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.authenticateToken = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const jwks_rsa_1 = __importDefault(require("jwks-rsa"));
const SSO_SERVER_URL = process.env.SSO_SERVER_URL || 'https://dev.login.pi.gov.br/auth';
const SSO_REALM = process.env.SSO_REALM || 'pi';
const ISSUER_URI = `${SSO_SERVER_URL}/realms/${SSO_REALM}`;
const JWKS_URI = `${SSO_SERVER_URL}/realms/${SSO_REALM}/protocol/openid-connect/certs`;
const client = (0, jwks_rsa_1.default)({
    jwksUri: JWKS_URI,
    cache: true,
    rateLimit: true,
    jwksRequestsPerMinute: 10
});
function getKey(header, callback) {
    if (!header.kid) {
        return callback(new Error('No KID found in token header'));
    }
    client.getSigningKey(header.kid, (err, key) => {
        if (err)
            return callback(err);
        const signingKey = key?.getPublicKey();
        callback(null, signingKey);
    });
}
const authenticateToken = (req, res, next) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];
    if (!token) {
        res.status(401).json({ error: 'Nenhum token fornecido.' });
        return;
    }
    // Verifica o ambiente (opcional): No documento diz que se for local/dev, pode validar sem expiration, 
    // mas faremos a validação completa pra garantir segurança.
    jsonwebtoken_1.default.verify(token, getKey, { issuer: ISSUER_URI, algorithms: ['RS256'] }, (err, decoded) => {
        if (err) {
            console.error('JWT Error:', err);
            res.status(403).json({ error: 'Token inválido ou expirado.' });
            return;
        }
        req.user = decoded; // Contains CPF in preferred_username, resource_access roles, etc.
        next();
    });
};
exports.authenticateToken = authenticateToken;
