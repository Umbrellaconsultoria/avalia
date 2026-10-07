import dotenv from 'dotenv';
dotenv.config();

import express from 'express';
import cors from 'cors';
import eventRoutes from './routes/event.routes';
import companyRoutes from './routes/company.routes';
import evaluationRoutes from './routes/evaluation.routes';
import certificateRoutes from './routes/certificate.routes';
import authRoutes from './routes/auth.routes';
import localAuthRoutes from './routes/localAuth.routes';
import userRoutes from './routes/user.routes';

const app = express();
const port = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());

// Rota especial para avaliação pública (garantindo carregamento)
import { eventController } from './controllers/event.controller';
app.get('/api/events/p/:id', eventController.getPublicById);

// Main Routes
app.use('/api/auth/gov', authRoutes);
app.use('/api/auth/local', localAuthRoutes);
app.use('/api/events', eventRoutes);
app.use('/api/companies', companyRoutes);
app.use('/api/evaluations', evaluationRoutes);
app.use('/api/certificates', certificateRoutes);
app.use('/api/users', userRoutes);

app.get('/health', (req, res) => {
  res.json({ status: 'ok', message: 'Backend is running' });
});

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
