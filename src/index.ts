import express from 'express';
import { PrismaClient } from '@prisma/client';
import authRouter from './routers/authRouter';
import clienteRouter from './routers/clienteRouter';
import equipamentoLogRouter from './routers/equipamentoLogRouter';
import equipamentoMetricaRouter from './routers/equipamentoMetricaRouter';
import equipamentoRouter from './routers/equipamentoRouter';
import metricaRouter from './routers/metricaRouter';
import perfilRouter from './routers/usarioPerfilRouter';
import usuarioPerfilRouter from './routers/usarioPerfilRouter';
import usuarioRouter from './routers/usuarioRouter';
import usuarioPerfilClienteRouter from './routers/usuarioPerfilClienteRouter';
import usuarioEquipamentoDashboardRouter from './routers/usuarioEquipamentoDashboardRouter';
import chartRouter from './routers/chartRouter';
import notificacaoRouter from './routers/notificacaoRouter';
import cors from "cors";
import morgan from "morgan";
import { logger, logError, logInfo, logWarn } from './utils/logger';
import { rabbitMQService } from './services/rabbitmqService';

const app = express();

app.use(
  cors({
    origin: "*",
    methods: ["GET", "POST", "PUT", "DELETE"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);

app.use(morgan('dev'));

export const prisma = new PrismaClient();

app.use(express.json());

app.get('/', (req, res) => {
  res.send('API is running')
});

// Test database connection
prisma.$connect()
  .then(() => {
    logInfo('Database connection established');
  })
  .catch((error) => {
    logError('Database connection failed', error);
  });

// Apply routers
app.use('/api', authRouter);
app.use('/api', clienteRouter);
app.use('/api', equipamentoLogRouter);
app.use('/api', equipamentoMetricaRouter);
app.use('/api', equipamentoRouter);
app.use('/api', metricaRouter);
app.use('/api', perfilRouter);
app.use('/api', usuarioPerfilRouter);
app.use('/api', usuarioRouter);
app.use('/api', usuarioPerfilClienteRouter);
app.use('/api', usuarioEquipamentoDashboardRouter);
app.use('/api', chartRouter);
app.use('/api', notificacaoRouter);

// Start the server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  logInfo(`Server started on port ${PORT}`);
});

rabbitMQService.connect()
  .then(() => {
    logInfo('RabbitMQ connection established');
  })
  .catch((error) => {
    logWarn('RabbitMQ connection failed - will use direct processing', error);
  });