import { rabbitMQService } from '../services/rabbitmqService';
import { EquipamentoLogService } from '../services/equipamentoLogService';
import { logError, logInfo } from '../utils/logger';
import { PrismaClient } from '@prisma/client';

const equipamentoLogService = new EquipamentoLogService();
const prisma = new PrismaClient();

async function processLogs(data: any): Promise<void> {
    try {
        logInfo('Processing logs from queue', {
            equipamentoId: data.logs?.[0]?.id_equipamento,
            logsCount: data.logs?.length || 0
        });
        await equipamentoLogService.createManyEquipamentoLogs(data);
        logInfo('Logs processed successfully', {
            equipamentoId: data.logs?.[0]?.id_equipamento
        });
    } catch (error) {
        logError('Failed to process logs from queue', error);
        throw error; // Isso fará o retry automático
    }
}

async function startWorker() {
    try {
        // Conectar ao RabbitMQ
        await rabbitMQService.connect();
        // Iniciar consumo de mensagens passando a função para processar as mensagens
        await rabbitMQService.consumeLogs(processLogs);
        logInfo('Logs worker started successfully');
    } catch (error) {
        logError('Failed to start logs worker', error);
        process.exit(1);
    }
}

// Graceful shutdown
process.on('SIGINT', async () => {
    logInfo('Shutting down logs worker...');
    await rabbitMQService.close();
    await prisma.$disconnect();
    process.exit(0);
});

process.on('SIGTERM', async () => {
    logInfo('Shutting down logs worker...');
    await rabbitMQService.close();
    await prisma.$disconnect();
    process.exit(0);
});

// Iniciar worker
startWorker();