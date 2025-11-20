import { connect, Connection, Channel } from 'amqplib-as-promised';
import { logError, logInfo } from '../utils/logger';

class RabbitMQService {
    private connection: Connection | null = null;
    private channel: Channel | null = null;
    // Nome da fila principal onde as mensagens de logs de equipamentos serão enviadas e consumidas.
    private readonly queueName = 'equipamento_logs';

    // Nome da exchange RabbitMQ para rotear mensagens entre as filas (principal, retry e dead-letter).
    private readonly exchangeName = 'equipamento_logs_exchange';

    // Nome da fila de retry, para onde vão mensagens que falharam temporariamente (serão reprocessadas após um tempo).
    private readonly retryQueueName = 'equipamento_logs_retry';

    // Nome da fila dead letter (DLQ). Mensagens que não puderam ser processadas/reprocessadas vão para cá para análise posterior.
    private readonly deadLetterQueueName = 'equipamento_logs_dlq';

    async connect(): Promise<void> {
        try {
            const rabbitmqUrl = process.env.RABBITMQ_URL || 'amqp://admin:admin123@localhost:5672';
            this.connection = await connect(rabbitmqUrl);
            if (!this.connection) {
                throw new Error('Failed to connect to RabbitMQ');
            }
            logInfo('RabbitMQ connection established');
            this.channel = await this.connection.createChannel();
            // Criar exchange
            await this.channel.assertExchange(this.exchangeName, 'direct', {
                durable: true
            });
            // Criar fila principal com dead letter queue
            await this.channel.assertQueue(this.queueName, {
                durable: true,
                arguments: {
                    'x-dead-letter-exchange': this.exchangeName,
                    'x-dead-letter-routing-key': this.deadLetterQueueName,
                    'x-message-ttl': 300000 // 5 minutos
                }
            });
            // Criar fila de retry
            await this.channel.assertQueue(this.retryQueueName, {
                durable: true,
                arguments: {
                    'x-dead-letter-exchange': this.exchangeName,
                    'x-dead-letter-routing-key': this.queueName,
                    'x-message-ttl': 60000 // 1 minuto
                }
            });
            // Criar dead letter queue
            await this.channel.assertQueue(this.deadLetterQueueName, {
                durable: true
            });
            await this.channel.bindQueue(this.queueName, this.exchangeName, this.queueName); // liga a fila principal à exchange para logs normais
            await this.channel.bindQueue(this.retryQueueName, this.exchangeName, this.retryQueueName); // liga a fila de retry para reprocessamento
            await this.channel.bindQueue(this.deadLetterQueueName, this.exchangeName, this.deadLetterQueueName); // liga a DLQ para mensagens mortas/falhas definitivas
            logInfo('RabbitMQ queues and exchanges created');
        } catch (error) {
            logError('Failed to connect to RabbitMQ', error);
            throw error;
        }
    }

    async publishLogs(data: any): Promise<boolean> {
        if (!this.channel) {
            throw new Error('RabbitMQ channel not initialized');
        }

        try {
            const message = Buffer.from(JSON.stringify(data));
            const published = this.channel.publish(
                this.exchangeName,
                this.queueName,
                message,
                {
                    persistent: true,
                    timestamp: Date.now()
                }
            );
            return published !== null && published !== undefined ? true : false;
        } catch (error) {
            logError('Failed to publish logs to RabbitMQ', error);
            throw error;
        }
    }

    async consumeLogs(operation: (data: any) => Promise<void>): Promise<void> {
        if (!this.channel) {
            throw new Error('RabbitMQ channel not initialized');
        }
''
        await this.channel.prefetch(10); // Processar até 10 mensagens por vez

        await this.channel.consume(this.queueName, async (message) => {
            if (!message) return;

            try {
                const data = JSON.parse(message.content.toString());
                await operation(data);
                // Acknowledge após processamento bem-sucedido
                this.channel?.ack(message);
                logInfo('Logs processed successfully from queue');
            } catch (error) {
                logError('Failed to process logs from queue', error);
                // Verificar número de tentativas
                const retryCount = message.properties.headers?.['x-retry-count'] || 0;
                if (retryCount < 5) {
                    // Reenviar para fila de retry
                    if (this.channel) {
                        this.channel.publish(
                            this.exchangeName,
                            this.retryQueueName,
                            message.content,
                            {
                                persistent: true,
                                headers: {
                                    'x-retry-count': retryCount + 1
                                }
                            }
                        );
                    }
                    this.channel?.ack(message);
                } else {
                    // Mover para dead letter queue após 3 tentativas
                    logError('Message moved to DLQ after max retries', { retryCount });
                    this.channel?.nack(message, false, false);
                }
            }
        }, {
            noAck: false
        });

        logInfo('Started consuming logs from RabbitMQ queue');
    }

    async close(): Promise<void> {
        try {
            if (this.channel) {
                await this.channel.close();
            }
            if (this.connection) {
                await this.connection.close();
            }
            logInfo('RabbitMQ connection closed');
        } catch (error) {
            logError('Error closing RabbitMQ connection', error);
        }
    }

    isConnected(): boolean {
        return this.connection !== null && this.channel !== null;
    }
}

export const rabbitMQService = new RabbitMQService();