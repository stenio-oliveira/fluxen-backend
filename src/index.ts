import express from 'express';
import { PrismaClient } from '@prisma/client';
import authRouter from './routers/authRouter';
import equipamentoLogRouter from './routers/equipamentoLogRouter';
import equipamentoMetricaRouter from './routers/equipamentoMetricaRouter';
import equipamentoRouter from './routers/equipamentoRouter';
import metricaRouter from './routers/metricaRouter';
import perfilRouter from './routers/perfilRouter';
import usuarioPerfilRouter from './routers/usuarioPerfilRouter';
import usuarioRouter from './routers/usuarioRouter';
import cors from "cors";
import morgan from "morgan";

const app = express();

app.use(
  cors({
    origin: "*", // Allow all origins
    methods: ["GET", "POST", "PUT", "DELETE"], // Specify allowed HTTP methods
    allowedHeaders: ["Content-Type", "Authorization"], // Specify allowed headers
  })
);

app.use(morgan('dev')); // 'dev' is a predefined format for concise colored output


export const prisma = new PrismaClient();

app.use(express.json());

// Example route
app.get('/', (req, res) => {
  res.send('API is running')
});

// Test database connection
prisma.$connect()
  .then(() => {
    console.log('Database connection successful');
  })
  .catch((error) => {
    console.error('Database connection failed:', error);
  });

// Apply routers
app.use('/api', authRouter);
app.use('/api', equipamentoLogRouter);
app.use('/api', equipamentoMetricaRouter);
app.use('/api', equipamentoRouter);
app.use('/api', metricaRouter);
app.use('/api', perfilRouter);
app.use('/api', usuarioPerfilRouter);
app.use('/api', usuarioRouter);
  

// Start the server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
