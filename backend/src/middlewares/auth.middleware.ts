import { Request, Response, NextFunction } from 'express';
import jwt, { JwtHeader, SigningKeyCallback } from 'jsonwebtoken';
import jwksClient from 'jwks-rsa';

// Lazy load configs para suportar ordem de importação do TS Node (Hoisting)
const getConfig = () => {
  const SSO_SERVER_URL = process.env.SSO_SERVER_URL || 'https://dev.login.pi.gov.br/auth';
  const SSO_REALM = process.env.SSO_REALM || 'pi';
  return {
    ISSUER_URI: `${SSO_SERVER_URL}/realms/${SSO_REALM}`,
    JWKS_URI: `${SSO_SERVER_URL}/realms/${SSO_REALM}/protocol/openid-connect/certs`
  };
};

let client: jwksClient.JwksClient | null = null;
const getClient = () => {
  if (!client) {
    client = jwksClient({
      jwksUri: getConfig().JWKS_URI,
      cache: true,
      rateLimit: true,
      jwksRequestsPerMinute: 10
    });
  }
  return client;
};

function getKey(header: JwtHeader, callback: SigningKeyCallback) {
  if (!header.kid) {
    return callback(new Error('No KID found in token header'));
  }
  
  getClient().getSigningKey(header.kid, (err, key) => {
    if (err) return callback(err);
    const signingKey = key?.getPublicKey();
    callback(null, signingKey);
  });
}

// Extend Request interface to include user
declare global {
  namespace Express {
    interface Request {
      user?: any;
    }
  }
}

export const authenticateToken = (req: Request, res: Response, next: NextFunction): void => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    res.status(401).json({ error: 'Nenhum token fornecido.' });
    return;
  }

  // Verifica o ambiente (opcional): No documento diz que se for local/dev, pode validar sem expiration, 
  // mas faremos a validação completa pra garantir segurança.
  jwt.verify(token, getKey, { issuer: getConfig().ISSUER_URI, algorithms: ['RS256'] }, (err, decoded) => {
    if (err) {
      console.error('JWT Error:', err);
      res.status(403).json({ error: 'Token inválido ou expirado.' });
      return;
    }
    req.user = decoded; // Contains CPF in preferred_username, resource_access roles, etc.
    next();
  });
};
