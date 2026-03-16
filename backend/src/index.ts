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

const app = express();
const port = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

// Main Routes
app.use('/api/auth/gov', authRoutes);
app.use('/api/auth/local', localAuthRoutes);
app.use('/api/events', eventRoutes);
app.use('/api/companies', companyRoutes);
app.use('/api/evaluations', evaluationRoutes);
app.use('/api/certificates', certificateRoutes);

app.get('/health', (req, res) => {
  res.json({ status: 'ok', message: 'Backend is running' });
});

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
